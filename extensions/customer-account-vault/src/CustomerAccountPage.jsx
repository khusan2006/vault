/** @jsxRuntime classic */
/** @jsx h */
import '@shopify/ui-extensions/preact';
import { h, render } from 'preact';
import { useEffect, useState, useCallback, useRef, useMemo } from 'preact/hooks';
import { pad } from '@vault/shared/utils/time';
import { DEFAULT_LANDING } from '@vault/shared/constants/defaults';

// =============================================================================
// GraphQL Queries
// =============================================================================

const METAFIELD_QUERY = `query CustomerBenefits {
  customer {
    metafield(namespace: "vault", key: "eligible_benefits") {
      value
    }
  }
}`;

const STOREFRONT_NODES_QUERY = `query ProductsAndCollections($ids: [ID!]!) {
  nodes(ids: $ids) {
    __typename
    ... on Product {
      id
      title
      handle
      onlineStoreUrl
      description
      productType
      featuredImage {
        url
        altText
      }
      priceRange {
        minVariantPrice {
          amount
          currencyCode
        }
      }
      compareAtPriceRange {
        minVariantPrice {
          amount
          currencyCode
        }
      }
      variants(first: 1) {
        nodes {
          id
        }
      }
    }
    ... on Collection {
      id
      title
      products(first: 50) {
        nodes {
          id
          title
          handle
          onlineStoreUrl
          description
          productType
          featuredImage {
            url
            altText
          }
          priceRange {
            minVariantPrice {
              amount
              currencyCode
            }
          }
          compareAtPriceRange {
            minVariantPrice {
              amount
              currencyCode
            }
          }
          variants(first: 1) {
            nodes {
              id
            }
          }
        }
      }
    }
  }
}`;

const STOREFRONT_HANDLES_QUERY = `query ProductsByHandle($query: String!) {
  products(first: 50, query: $query) {
    nodes {
      id
      title
      handle
      onlineStoreUrl
      description
      productType
      featuredImage {
        url
        altText
      }
      priceRange {
        minVariantPrice {
          amount
          currencyCode
        }
      }
      compareAtPriceRange {
        minVariantPrice {
          amount
          currencyCode
        }
      }
      variants(first: 1) {
        nodes {
          id
        }
      }
    }
  }
}`;

const CART_CREATE_MUTATION = `mutation CartCreate($lines: [CartLineInput!]!) {
  cartCreate(input: { lines: $lines }) {
    cart {
      id
      checkoutUrl
    }
    userErrors {
      field
      message
    }
  }
}`;

const CART_LINES_ADD_MUTATION = `mutation CartLinesAdd($cartId: ID!, $lines: [CartLineInput!]!) {
  cartLinesAdd(cartId: $cartId, lines: $lines) {
    cart {
      id
      checkoutUrl
    }
    userErrors {
      field
      message
    }
  }
}`;

// =============================================================================
// Constants
// =============================================================================

const CAMPAIGN_TYPE_LABELS = {
  early_access: 'Early Access',
  discounted_product: 'Member Discounts',
  timer_sale: 'Limited Time Offers',
};

const CAMPAIGN_TYPE_ORDER = ['timer_sale', 'discounted_product', 'early_access'];

// Customer-account-specific overrides on top of shared defaults
const CUSTOMER_LANDING = {
  ...DEFAULT_LANDING,
  heading: 'Your Exclusive Products',
  subheading: 'Products and offers unlocked for you based on your membership.',
  gridColumns: 2,
};

// =============================================================================
// Entry point
// =============================================================================

export default async function renderExtension() {
  render(<Extension />, document.body);
}

// =============================================================================
// Display config helpers
// =============================================================================

/**
 * Extracts the landingPage display config from the first eligible benefit
 * so the customer page heading, subheading, badge, and grid match the
 * merchant's admin customizer settings exactly.
 */
function extractPageConfig(groups) {
  for (const group of groups) {
    const dc = group.campaignConfig?.displayConfig;
    if (dc?.landingPage) return { ...CUSTOMER_LANDING, ...dc.landingPage };
  }
  return CUSTOMER_LANDING;
}

/**
 * Build the CSS grid-template-columns string from the configured column count.
 * Falls back to 2 columns.
 */
function gridCols(n) {
  const count = n || 2;
  return Array(count).fill('1fr').join(' ');
}

// =============================================================================
// Main Extension Component
// =============================================================================

function Extension() {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [campaignGroups, setCampaignGroups] = useState([]);
  const [cartId, setCartId] = useState('');
  const [addingId, setAddingId] = useState('');
  const [cartMessage, setCartMessage] = useState(null);

  // Auto-clear cart messages after 5 seconds
  useEffect(() => {
    if (!cartMessage) return;
    const timer = setTimeout(() => setCartMessage(null), 5000);
    return () => clearTimeout(timer);
  }, [cartMessage]);

  useEffect(() => {
    let mounted = true;

    async function load() {
      setLoading(true);
      setError('');

      try {
        const benefits = await fetchCustomerBenefits();
        const groups = groupBenefitsByCampaign(benefits);
        const enrichedGroups = await enrichGroupsWithProducts(groups);

        if (mounted) {
          setCampaignGroups(enrichedGroups);
        }
      } catch (err) {
        if (mounted) {
          setError(
            err instanceof Error ? err.message : 'Failed to load your benefits.',
          );
        }
      } finally {
        if (mounted) {
          setLoading(false);
        }
      }
    }

    load();
    return () => {
      mounted = false;
    };
  }, []);

  const handleAddToCart = useCallback(
    async (product) => {
      if (!product?.variantId) {
        setCartMessage({
          type: 'error',
          text: 'This product is unavailable to add right now.',
        });
        return;
      }

      setAddingId(product.id);
      setCartMessage(null);

      try {
        let cart = null;

        if (cartId) {
          const payload = await storefrontRequest({
            query: CART_LINES_ADD_MUTATION,
            variables: {
              cartId,
              lines: [{ quantity: 1, merchandiseId: product.variantId }],
            },
          });
          const errors = payload?.data?.cartLinesAdd?.userErrors || [];
          if (errors.length > 0) {
            throw new Error(errors.map((e) => e.message).join(', '));
          }
          cart = payload?.data?.cartLinesAdd?.cart;
        } else {
          const payload = await storefrontRequest({
            query: CART_CREATE_MUTATION,
            variables: {
              lines: [{ quantity: 1, merchandiseId: product.variantId }],
            },
          });
          const errors = payload?.data?.cartCreate?.userErrors || [];
          if (errors.length > 0) {
            throw new Error(errors.map((e) => e.message).join(', '));
          }
          cart = payload?.data?.cartCreate?.cart;
        }

        if (cart?.id) {
          setCartId(cart.id);
        }

        setCartMessage({
          type: 'success',
          text: `${product.title} added to cart!`,
        });

        if (cart?.checkoutUrl) {
          setTimeout(() => navigateTo(cart.checkoutUrl), 800);
        }
      } catch (err) {
        setCartMessage({
          type: 'error',
          text: err instanceof Error ? err.message : 'Unable to add to cart.',
        });
        if (cartId) {
          setCartId('');
        }
      } finally {
        setAddingId('');
      }
    },
    [cartId],
  );

  // Extract display config from campaigns to match the admin customizer
  const pageConfig = useMemo(
    () => extractPageConfig(campaignGroups),
    [campaignGroups],
  );

  const isEmpty = !loading && !error && campaignGroups.length === 0;

  return (
    <s-page>
      {/* Header — uses the merchant's configured heading & subheading */}
      <s-section>
        <s-stack spacing="base">
          <s-text emphasis="bold" size="headingLarge">
            {pageConfig.heading}
          </s-text>
          <s-text size="body" appearance="subdued">
            {pageConfig.subheading}
          </s-text>
        </s-stack>
      </s-section>

      {/* Cart feedback */}
      {cartMessage && (
        <s-section>
          <s-card>
            <s-stack spacing="tight">
              <s-text
                emphasis="bold"
                appearance={cartMessage.type === 'error' ? 'critical' : 'success'}
              >
                {cartMessage.type === 'error' ? 'Error' : 'Success'}
              </s-text>
              <s-text>{cartMessage.text}</s-text>
            </s-stack>
          </s-card>
        </s-section>
      )}

      {/* Loading */}
      {loading && (
        <s-section>
          <s-stack spacing="base" alignment="center">
            <s-spinner size="large" />
            <s-text size="body" appearance="subdued">
              Loading your products...
            </s-text>
          </s-stack>
        </s-section>
      )}

      {/* Error */}
      {error && (
        <s-section>
          <s-card>
            <s-stack spacing="tight">
              <s-text emphasis="bold" appearance="critical">
                Unable to load products
              </s-text>
              <s-text>{error}</s-text>
            </s-stack>
          </s-card>
        </s-section>
      )}

      {/* Empty state */}
      {isEmpty && (
        <s-section>
          <s-card>
            <s-stack spacing="base" alignment="center">
              <s-text emphasis="bold" size="headingSmall">
                No products available yet
              </s-text>
              <s-text size="body" appearance="subdued">
                You don't have any active offers or exclusive products right now.
                Keep shopping and check back later!
              </s-text>
            </s-stack>
          </s-card>
        </s-section>
      )}

      {/* Campaign groups */}
      {!loading &&
        !error &&
        campaignGroups.map((group) => (
          <CampaignSection
            key={group.campaignId}
            group={group}
            pageConfig={pageConfig}
            addingId={addingId}
            onAddToCart={handleAddToCart}
          />
        ))}
    </s-page>
  );
}

// =============================================================================
// Campaign Section
// =============================================================================

function CampaignSection({ group, pageConfig, addingId, onAddToCart }) {
  const { campaignType, campaignName, campaignEndsAt, discount, products } =
    group;

  if (!products || products.length === 0) return null;

  // Per-campaign display config takes priority, then falls back to page config
  const dc = group.campaignConfig?.displayConfig;
  const lp = dc?.landingPage ? { ...CUSTOMER_LANDING, ...dc.landingPage } : pageConfig;

  const typeLabel = CAMPAIGN_TYPE_LABELS[campaignType] || 'Offers';
  const badgeLabel = getBadgeText(campaignType, discount);
  const showTimer = campaignType === 'timer_sale' && campaignEndsAt;

  // Build grid template based on configured columns
  const templateCols = gridCols(lp.gridColumns);

  return (
    <s-section>
      <s-stack spacing="base">
        {/* Section header */}
        <s-stack spacing="tight">
          <s-stack spacing="extraTight" direction="inline" alignment="center">
            <s-badge tone={getBadgeTone(campaignType)}>{typeLabel}</s-badge>
            {badgeLabel && (
              <s-badge tone="success">{badgeLabel}</s-badge>
            )}
          </s-stack>

          <s-text emphasis="bold" size="headingSmall">
            {campaignName}
          </s-text>
        </s-stack>

        {/* Timer countdown for timer_sale */}
        {showTimer && <CountdownTimer endsAt={campaignEndsAt} />}

        {/* Discount info */}
        {discount && (
          <DiscountInfo discount={discount} campaignType={campaignType} />
        )}

        {/* Product grid — columns from the admin display config */}
        <s-grid
          gridTemplateColumns={templateCols}
          gap="base"
        >
          {products.map((product) => (
            <ProductCard
              key={product.id}
              product={product}
              campaignType={campaignType}
              discount={discount}
              landingConfig={lp}
              adding={addingId === product.id}
              onAddToCart={onAddToCart}
            />
          ))}
        </s-grid>
      </s-stack>
    </s-section>
  );
}

// =============================================================================
// Product Card — respects all landingPage display config flags
// =============================================================================

function ProductCard({ product, campaignType, discount, landingConfig, adding, onAddToCart }) {
  const lp = landingConfig || CUSTOMER_LANDING;

  const originalPrice = formatMoney(product.price);
  const hasDiscount =
    discount &&
    (campaignType === 'discounted_product' || campaignType === 'timer_sale');
  const discountedPrice = hasDiscount
    ? calculateDiscountedPrice(product.price, discount)
    : null;
  const savingsLabel = hasDiscount
    ? getSavingsLabel(product.price, discount)
    : '';

  // Compare-at price for non-discount campaigns (e.g. early_access with compare-at data)
  const showCompareAt = lp.showCompareAt && !hasDiscount && product.compareAt;
  const compareAtAmount = showCompareAt
    ? Number(product.compareAt?.amount || 0)
    : 0;
  const priceAmount = Number(product.price?.amount || 0);
  const hasCompareAt = showCompareAt && compareAtAmount > priceAmount;

  return (
    <s-card>
      <s-stack spacing="base">
        {/* Product image */}
        {product.imageUrl && (
          <s-image
            src={product.imageUrl}
            alt={product.imageAlt || product.title}
            aspect-ratio="3/4"
          />
        )}

        {/* Product details */}
        <s-stack spacing="tight">
          {/* Category — only if configured */}
          {lp.showCategory && product.productType && (
            <s-text size="caption" appearance="subdued">
              {product.productType}
            </s-text>
          )}

          <s-text emphasis="bold">{product.title}</s-text>

          {/* Ratings — only if configured */}
          {lp.showRatings && (
            <s-text size="caption" appearance="subdued">
              Rated 4.8 by members
            </s-text>
          )}

          {/* Pricing: discounted campaigns show strikethrough */}
          {hasDiscount && discountedPrice ? (
            <s-stack spacing="extraTight">
              <s-stack spacing="extraTight" direction="inline" alignment="center">
                <s-text size="body" emphasis="bold">
                  {discountedPrice}
                </s-text>
                <s-text size="caption" appearance="subdued">
                  <s-text
                    size="caption"
                    appearance="subdued"
                  >
                    {originalPrice}
                  </s-text>
                </s-text>
              </s-stack>
              {savingsLabel && (
                <s-badge tone="success">{savingsLabel}</s-badge>
              )}
            </s-stack>
          ) : hasCompareAt ? (
            /* Non-discount campaign but has compare-at price and showCompareAt enabled */
            <s-stack spacing="extraTight" direction="inline" alignment="center">
              <s-text size="body" emphasis="bold">
                {originalPrice}
              </s-text>
              <s-text size="caption" appearance="subdued">
                {formatMoney(product.compareAt)}
              </s-text>
            </s-stack>
          ) : (
            originalPrice && (
              <s-text size="body" appearance="subdued">
                {originalPrice}
              </s-text>
            )
          )}

          {/* Campaign badge — uses configured badge text */}
          <CampaignBadge campaignType={campaignType} badgeText={lp.badgeText} />
        </s-stack>

        {/* Actions */}
        <s-stack spacing="tight">
          {product.url && (
            <s-button href={product.url} variant="primary">
              View product
            </s-button>
          )}
          {lp.showAddToCart && (
            product.variantId ? (
              <s-button
                variant="secondary"
                disabled={adding}
                onClick={() => onAddToCart(product)}
              >
                {adding ? 'Adding...' : 'Add to cart'}
              </s-button>
            ) : (
              <s-button variant="secondary" disabled>
                Unavailable
              </s-button>
            )
          )}
        </s-stack>
      </s-stack>
    </s-card>
  );
}

// =============================================================================
// Campaign Badge — uses the configured badge text from landingPage config
// =============================================================================

function CampaignBadge({ campaignType, badgeText }) {
  const tone = getBadgeTone(campaignType);

  // Use per-campaign-type fallback labels only if no custom badgeText
  const defaultText = {
    early_access: 'Exclusive Access',
    discounted_product: 'Member Price',
    timer_sale: 'Limited Time',
  };

  const text = badgeText || defaultText[campaignType] || 'Exclusive';

  return <s-badge tone={tone}>{text}</s-badge>;
}

// =============================================================================
// Discount Info Banner
// =============================================================================

function DiscountInfo({ discount, campaignType }) {
  if (!discount || !discount.value) return null;

  const label =
    discount.type === 'percentage'
      ? `${discount.value}% off`
      : `${formatCurrency(discount.value)} off`;

  const message =
    campaignType === 'timer_sale'
      ? `Hurry! Get ${label} on these products before time runs out.`
      : `You're getting ${label} on these products as a valued member.`;

  return (
    <s-card>
      <s-stack spacing="tight" direction="inline" alignment="center">
        <s-badge tone="success">{label}</s-badge>
        <s-text emphasis="bold">{message}</s-text>
      </s-stack>
    </s-card>
  );
}

// =============================================================================
// Countdown Timer
// =============================================================================

function CountdownTimer({ endsAt }) {
  const [timeLeft, setTimeLeft] = useState(null);
  const intervalRef = useRef(null);

  useEffect(() => {
    function update() {
      const end = new Date(endsAt).getTime();
      const now = Date.now();
      const remaining = end - now;

      if (remaining <= 0) {
        setTimeLeft({ expired: true });
        if (intervalRef.current) {
          clearInterval(intervalRef.current);
        }
        return;
      }

      const days = Math.floor(remaining / 86400000);
      const hours = Math.floor((remaining % 86400000) / 3600000);
      const minutes = Math.floor((remaining % 3600000) / 60000);
      const seconds = Math.floor((remaining % 60000) / 1000);

      setTimeLeft({ days, hours, minutes, seconds, expired: false });
    }

    update();
    intervalRef.current = setInterval(update, 1000);

    return () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
      }
    };
  }, [endsAt]);

  if (!timeLeft) return null;

  if (timeLeft.expired) {
    return (
      <s-card>
        <s-text emphasis="bold" appearance="critical">
          This offer has expired.
        </s-text>
      </s-card>
    );
  }

  const parts = [];
  if (timeLeft.days > 0) parts.push(`${timeLeft.days}d`);
  parts.push(`${pad(timeLeft.hours)}h`);
  parts.push(`${pad(timeLeft.minutes)}m`);
  parts.push(`${pad(timeLeft.seconds)}s`);

  return (
    <s-card>
      <s-stack spacing="tight" direction="inline" alignment="center">
        <s-badge tone="warning">Ends soon</s-badge>
        <s-text emphasis="bold">
          {parts.join(' ')} remaining
        </s-text>
      </s-stack>
    </s-card>
  );
}

// =============================================================================
// Data fetching
// =============================================================================

async function fetchCustomerBenefits() {
  const response = await fetch(
    'shopify://customer-account/api/unstable/graphql.json',
    {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ query: METAFIELD_QUERY }),
    },
  );

  if (!response.ok) {
    throw new Error('Customer benefits request failed.');
  }

  const payload = await response.json();
  const rawValue = payload?.data?.customer?.metafield?.value;
  if (!rawValue) return [];

  try {
    return JSON.parse(rawValue);
  } catch {
    return [];
  }
}

async function storefrontRequest({ query, variables }) {
  const response = await fetch(
    'shopify://storefront/api/unstable/graphql.json',
    {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ query, variables }),
    },
  );

  if (!response.ok) {
    throw new Error('Storefront product request failed.');
  }

  return response.json();
}

// =============================================================================
// Benefit grouping
// =============================================================================

/**
 * Groups raw benefits by campaignId and preserves campaign metadata.
 * Each group includes: campaignId, campaignType, campaignName, campaignConfig,
 * products, discount, etc.
 */
function groupBenefitsByCampaign(benefits) {
  if (!benefits || benefits.length === 0) return [];

  const groupMap = new Map();

  for (const benefit of benefits) {
    const campaignId = benefit.campaignId || benefit.type;
    const campaignType = benefit.campaignType || inferCampaignType(benefit);

    if (!groupMap.has(campaignId)) {
      groupMap.set(campaignId, {
        campaignId,
        campaignType,
        campaignName:
          benefit.campaignName ||
          CAMPAIGN_TYPE_LABELS[campaignType] ||
          'Offer',
        campaignEndsAt: benefit.campaignEndsAt || null,
        campaignConfig: benefit.campaignConfig || null,
        discount: extractDiscount(benefit),
        productIds: new Set(),
        collectionIds: new Set(),
        handles: new Set(),
      });
    }

    const group = groupMap.get(campaignId);

    // Collect product IDs
    for (const id of benefit.productIds || []) {
      if (id) group.productIds.add(String(id));
    }

    // Collect collection IDs
    for (const id of benefit.collectionIds || []) {
      if (id) group.collectionIds.add(String(id));
    }

    // Collect handles
    for (const handle of benefit.productHandles || []) {
      if (handle) group.handles.add(String(handle));
    }
  }

  // Sort by campaign type priority (timer_sale first, then discounts, then early access)
  return [...groupMap.values()]
    .map((group) => ({
      ...group,
      productIds: [...group.productIds],
      collectionIds: [...group.collectionIds],
      handles: [...group.handles],
    }))
    .sort((a, b) => {
      const aIdx = CAMPAIGN_TYPE_ORDER.indexOf(a.campaignType);
      const bIdx = CAMPAIGN_TYPE_ORDER.indexOf(b.campaignType);
      return (aIdx === -1 ? 99 : aIdx) - (bIdx === -1 ? 99 : bIdx);
    });
}

/**
 * Infer campaign type from legacy benefit type for backward compatibility.
 */
function inferCampaignType(benefit) {
  if (benefit.type === 'visibility') return 'early_access';
  if (benefit.type === 'discount') return 'discounted_product';
  if (benefit.type === 'free_product') return 'early_access';
  return 'early_access';
}

/**
 * Extract discount config from benefit or its campaign config.
 */
function extractDiscount(benefit) {
  if (benefit.discount) return benefit.discount;
  if (benefit.campaignConfig?.discount) return benefit.campaignConfig.discount;
  return null;
}

// =============================================================================
// Product enrichment
// =============================================================================

/**
 * Fetches actual product data for each campaign group using Storefront API.
 */
async function enrichGroupsWithProducts(groups) {
  const enriched = [];

  for (const group of groups) {
    const products = await fetchProductsForGroup(group);
    if (products.length > 0) {
      enriched.push({ ...group, products });
    }
  }

  return enriched;
}

async function fetchProductsForGroup({ productIds, collectionIds, handles }) {
  // Try IDs first
  const ids = [
    ...productIds.map((id) => toGid('Product', id)),
    ...collectionIds.map((id) => toGid('Collection', id)),
  ].filter(Boolean);

  if (ids.length > 0) {
    try {
      const payload = await storefrontRequest({
        query: STOREFRONT_NODES_QUERY,
        variables: { ids },
      });
      const products = dedupeProducts(
        extractProducts(payload?.data?.nodes || []),
      );
      if (products.length > 0) return products;
    } catch {
      // Fall through to handles
    }
  }

  // Fallback to handles
  if (handles.length > 0) {
    try {
      const queryString = handles
        .map((handle) => `handle:${handle}`)
        .join(' OR ');
      const payload = await storefrontRequest({
        query: STOREFRONT_HANDLES_QUERY,
        variables: { query: queryString },
      });
      return dedupeProducts(
        (payload?.data?.products?.nodes || []).map(mapProduct),
      );
    } catch {
      return [];
    }
  }

  return [];
}

// =============================================================================
// Product mapping helpers
// =============================================================================

function extractProducts(nodes) {
  const items = [];
  for (const node of nodes) {
    if (!node) continue;
    if (node.__typename === 'Product') {
      items.push(mapProduct(node));
    } else if (node.__typename === 'Collection') {
      for (const product of node?.products?.nodes || []) {
        items.push(mapProduct(product));
      }
    }
  }
  return items;
}

function mapProduct(product) {
  return {
    id: product?.id,
    title: product?.title,
    handle: product?.handle,
    url: product?.onlineStoreUrl,
    description: product?.description || '',
    productType: product?.productType || '',
    imageUrl: product?.featuredImage?.url,
    imageAlt: product?.featuredImage?.altText,
    price: product?.priceRange?.minVariantPrice,
    compareAt: product?.compareAtPriceRange?.minVariantPrice,
    variantId: product?.variants?.nodes?.[0]?.id || '',
  };
}

function dedupeProducts(products) {
  const seen = new Set();
  return products.filter((product) => {
    if (!product?.id || seen.has(product.id)) return false;
    seen.add(product.id);
    return true;
  });
}

// =============================================================================
// Formatting helpers
// =============================================================================

function toGid(type, id) {
  if (!id) return null;
  if (String(id).startsWith('gid://')) return String(id);
  return `gid://shopify/${type}/${id}`;
}

// pad() imported from @vault/shared/utils/time

function formatMoney(price) {
  if (!price || !price.amount) return '';
  const amount = Number(price.amount);
  if (Number.isNaN(amount)) return '';

  if (typeof shopify !== 'undefined' && shopify?.i18n?.formatCurrency) {
    return shopify.i18n.formatCurrency(amount, {
      currency: price.currencyCode,
    });
  }

  return `${price.currencyCode} ${amount.toFixed(2)}`;
}

function formatCurrency(value) {
  if (typeof shopify !== 'undefined' && shopify?.i18n?.formatCurrency) {
    return shopify.i18n.formatCurrency(value);
  }
  return `$${Number(value).toFixed(2)}`;
}

function calculateDiscountedPrice(price, discount) {
  if (!price || !price.amount || !discount || !discount.value) return null;

  const amount = Number(price.amount);
  if (Number.isNaN(amount) || amount <= 0) return null;

  let discounted;
  if (discount.type === 'percentage') {
    discounted = amount * (1 - discount.value / 100);
  } else {
    discounted = amount - discount.value;
  }
  if (discounted < 0) discounted = 0;

  if (typeof shopify !== 'undefined' && shopify?.i18n?.formatCurrency) {
    return shopify.i18n.formatCurrency(discounted, {
      currency: price.currencyCode,
    });
  }

  return `${price.currencyCode} ${discounted.toFixed(2)}`;
}

function getSavingsLabel(price, discount) {
  if (!discount || !discount.value) return '';

  if (discount.type === 'percentage') {
    return `Save ${discount.value}%`;
  }

  if (price && price.amount) {
    const original = Number(price.amount);
    const saving = Math.min(discount.value, original);
    return `Save ${formatCurrency(saving)}`;
  }

  return `Save ${formatCurrency(discount.value)}`;
}

function getBadgeText(campaignType, discount) {
  if (!discount || !discount.value) return '';

  if (discount.type === 'percentage') {
    return `${discount.value}% OFF`;
  }

  return `${formatCurrency(discount.value)} OFF`;
}

function getBadgeTone(campaignType) {
  switch (campaignType) {
    case 'early_access':
      return 'info';
    case 'discounted_product':
      return 'success';
    case 'timer_sale':
      return 'warning';
    default:
      return 'default';
  }
}

function navigateTo(url) {
  if (!url) return;

  if (typeof navigation !== 'undefined' && navigation?.navigate) {
    navigation.navigate(url);
    return;
  }

  if (typeof shopify !== 'undefined' && shopify?.navigation?.navigate) {
    shopify.navigation.navigate(url);
  }
}
