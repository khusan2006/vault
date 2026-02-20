import type { LandingPageDisplayConfig } from "@/types";
import type { PreviewProduct } from "@/types/storefront-preview.types";

interface ProductsModalPreviewProps {
  config: LandingPageDisplayConfig;
  products: PreviewProduct[];
  isMobile: boolean;
}

// =============================================================================
// Compact product card — inline React version for the modal context
// =============================================================================

function CompactProductCard({
  product,
  badgeText,
  badgeColor,
  showCompareAt,
}: {
  product: PreviewProduct;
  badgeText: string;
  badgeColor: string;
  showCompareAt: boolean;
}) {
  const hasImage = Boolean(product.imageUrl);
  const hasPrices = Boolean(product.price);

  return (
    <div className="group relative flex flex-col overflow-hidden rounded-lg border border-gray-100 bg-white transition-shadow hover:shadow-md">
      {/* Image area */}
      <div className="relative aspect-square w-full overflow-hidden bg-gray-50">
        {hasImage ? (
          <img
            src={product.imageUrl}
            alt={product.title}
            className="h-full w-full object-cover"
          />
        ) : (
          <div
            className="flex h-full w-full items-center justify-center text-[20px] font-bold text-white"
            style={{
              background:
                product.imageGradient ||
                `linear-gradient(135deg, ${product.imageColor || "#8b5cf6"}, ${product.imageColor || "#6d28d9"})`,
            }}
          >
            {product.title.charAt(0)}
          </div>
        )}
        {/* Badge */}
        <span
          className="absolute left-1.5 top-1.5 rounded px-1.5 py-0.5 text-[9px] font-bold leading-none text-white"
          style={{ background: badgeColor }}
        >
          {badgeText}
        </span>
      </div>
      {/* Info */}
      <div className="flex flex-1 flex-col p-2">
        {product.category && (
          <span className="mb-0.5 text-[9px] font-medium uppercase tracking-wide text-gray-400">
            {product.category}
          </span>
        )}
        <span
          className="text-[11px] leading-tight text-zinc-900 line-clamp-1"
          style={{ fontWeight: "var(--vault-card-title-weight, 600)" }}
        >
          {product.title}
        </span>
        {hasPrices && (
          <div className="mt-auto flex items-baseline gap-1 pt-1">
            <span
              className="text-[11px] text-zinc-900"
              style={{ fontWeight: "var(--vault-card-price-weight, 600)" }}
            >
              {product.price}
            </span>
            {showCompareAt && product.compareAt && (
              <span className="text-[9px] text-gray-400 line-through">
                {product.compareAt}
              </span>
            )}
          </div>
        )}
      </div>
    </div>
  );
}

// =============================================================================
// Star icon for the header
// =============================================================================

const ShoppingBagIcon = () => (
  <svg
    width="16"
    height="16"
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2"
    strokeLinecap="round"
    strokeLinejoin="round"
  >
    <path d="M6 2L3 6v14a2 2 0 002 2h14a2 2 0 002-2V6l-3-4z" />
    <line x1="3" y1="6" x2="21" y2="6" />
    <path d="M16 10a4 4 0 01-8 0" />
  </svg>
);

// =============================================================================
// Products Modal Preview
// =============================================================================

/**
 * Preview of the products modal popup.
 * Renders a polished, compact inline representation of the vault-products-modal
 * overlay so merchants can see what the popup looks like in the customizer.
 */
export function ProductsModalPreview({
  config,
  products,
  isMobile,
}: ProductsModalPreviewProps) {
  const badgeText = config.badgeText || "Exclusive";
  const badgeColor = config.badgeColor || "#7c3aed";
  const columns = isMobile ? 2 : Math.min(config.gridColumns, 3);
  const showCompareAt = config.showCompareAt ?? true;

  return (
    <div className="relative" style={{ minHeight: isMobile ? 320 : 380 }}>
      {/* Overlay backdrop — fills the parent layout zone */}
      <div className="absolute inset-0 rounded-xl bg-black/25 backdrop-blur-[2px]" />

      {/* Modal box */}
      <div
        className={`relative mx-auto flex flex-col overflow-hidden rounded-2xl border border-gray-200/60 bg-white shadow-[0_25px_60px_rgba(0,0,0,0.2),_0_0_0_1px_rgba(0,0,0,0.03)] ${
          isMobile
            ? "mx-3 mt-4 max-h-[300px]"
            : "mx-6 mt-6 max-h-[360px]"
        }`}
      >
        {/* Header */}
        <div
          className={`flex shrink-0 items-start gap-3 border-b border-gray-100 ${
            isMobile ? "px-3.5 py-3" : "px-5 py-4"
          }`}
        >
          {/* Icon circle */}
          <div
            className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full"
            style={{ background: badgeColor, color: "#fff" }}
          >
            <ShoppingBagIcon />
          </div>

          {/* Title + subtitle */}
          <div className="min-w-0 flex-1">
            <h3
              className="m-0 text-[14px] leading-tight text-zinc-900"
              style={{ fontWeight: "var(--vault-title-weight, 600)" }}
            >
              {config.heading || "Exclusive Products"}
            </h3>
            <p
              className="m-0 mt-0.5 text-[11px] leading-snug text-gray-400"
              style={{ fontWeight: "var(--vault-subtitle-weight, 400)" }}
            >
              {config.subheading || `${products.length} product${products.length !== 1 ? "s" : ""} available`}
            </p>
          </div>

          {/* Close button */}
          <button
            className="flex h-7 w-7 shrink-0 items-center justify-center rounded-md border-0 bg-transparent text-gray-400 cursor-default"
            aria-hidden="true"
            tabIndex={-1}
          >
            <svg
              width="14"
              height="14"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2.5"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <line x1="18" y1="6" x2="6" y2="18" />
              <line x1="6" y1="6" x2="18" y2="18" />
            </svg>
          </button>
        </div>

        {/* Scrollable product grid */}
        <div className="relative flex-1 overflow-y-auto">
          <div
            className={isMobile ? "px-3.5 py-3" : "px-5 py-4"}
          >
            <div
              data-zone="cards"
              style={{
                display: "grid",
                gridTemplateColumns: `repeat(${columns}, 1fr)`,
                gap: isMobile ? "8px" : "10px",
              }}
            >
              {products.map((product) => (
                <CompactProductCard
                  key={product.id}
                  product={product}
                  badgeText={badgeText}
                  badgeColor={badgeColor}
                  showCompareAt={showCompareAt}
                />
              ))}
            </div>
          </div>

          {/* Fade gradient at bottom to indicate scrollability */}
          <div className="pointer-events-none sticky bottom-0 left-0 right-0 h-8 bg-gradient-to-t from-white to-transparent" />
        </div>
      </div>
    </div>
  );
}
