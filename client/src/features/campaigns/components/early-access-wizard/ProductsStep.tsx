"use client";

import { useCallback } from "react";
import {
  Card,
  BlockStack,
  InlineStack,
  Text,
  Button,
  Box,
  Icon,
  Thumbnail,
  Badge,
} from "@shopify/polaris";
import {
  ProductIcon,
  CollectionIcon,
  DeleteIcon,
  ImageIcon,
} from "@shopify/polaris-icons";
import type { CampaignConfig, EarlyAccessConfig } from "@/types";
import type { CampaignFormState } from "@/features/campaigns/hooks/useCampaignForm";
import { useResourcePicker } from "@/features/campaigns/hooks/useResourcePicker";
import type { SelectedResource } from "@/features/campaigns/hooks/useResourcePicker";

// =============================================================================
// Types
// =============================================================================

interface ProductsStepProps {
  formState: CampaignFormState;
  onFieldChange: <K extends keyof CampaignFormState>(
    field: K,
    value: CampaignFormState[K],
  ) => void;
  /** Details for selected products (id, title, image) */
  selectedProducts: SelectedResource[];
  /** Details for selected collections (id, title, image) */
  selectedCollections: SelectedResource[];
  /** Callback to update the product details at the wizard level */
  onProductsChange: (products: SelectedResource[]) => void;
  /** Callback to update the collection details at the wizard level */
  onCollectionsChange: (collections: SelectedResource[]) => void;
  title?: string;
  description?: string;
  productsTitle?: string;
  productsDescription?: string;
  collectionsTitle?: string;
  collectionsDescription?: string;
  emptyProductsText?: string;
  emptyCollectionsText?: string;
}

// =============================================================================
// Resource list item
// =============================================================================

function ResourceRow({
  resource,
  onRemove,
  fallbackIcon,
}: {
  resource: SelectedResource;
  onRemove: () => void;
  fallbackIcon: typeof ProductIcon;
}) {
  return (
    <div
      className="flex items-center gap-[var(--p-space-300)] py-[var(--p-space-200)]"
    >
      {resource.imageUrl ? (
        <Thumbnail
          source={resource.imageUrl}
          alt={resource.title}
          size="small"
        />
      ) : (
        <div
          className="flex h-10 w-10 shrink-0 items-center justify-center rounded-[var(--p-border-radius-200)] bg-[var(--p-color-bg-surface-secondary)]"
        >
          <Icon source={fallbackIcon} tone="subdued" />
        </div>
      )}

      <Text as="span" variant="bodyMd" truncate>
        {resource.title}
      </Text>

      <div className="ml-auto shrink-0">
        <Button
          icon={DeleteIcon}
          variant="plain"
          tone="critical"
          onClick={onRemove}
          accessibilityLabel={`Remove ${resource.title}`}
        />
      </div>
    </div>
  );
}

// =============================================================================
// Component
// =============================================================================

export function ProductsStep({
  formState,
  onFieldChange,
  selectedProducts,
  selectedCollections,
  onProductsChange,
  onCollectionsChange,
  title = "Choose products for early access",
  description = "Select the products or collections that should only be visible to qualifying customers. Everyone else won't see them.",
  productsTitle = "Products",
  productsDescription = "Select individual products to make exclusive",
  collectionsTitle = "Collections",
  collectionsDescription = "Select entire collections to make exclusive",
  emptyProductsText = "No products selected yet",
  emptyCollectionsText = "No collections selected yet",
}: ProductsStepProps) {
  const { selectProductsDetailed, selectCollectionsDetailed } =
    useResourcePicker();
  const config = formState.config as CampaignConfig & {
    productIds: string[];
    collectionIds: string[];
  };

  const updateConfig = useCallback(
    (updates: Partial<EarlyAccessConfig>) => {
      onFieldChange("config", { ...config, ...updates } as CampaignConfig);
    },
    [config, onFieldChange],
  );

  // ---------------------------------------------------------------------------
  // Products
  // ---------------------------------------------------------------------------

  const handleSelectProducts = useCallback(async () => {
    const details = await selectProductsDetailed(
      config.productIds,
      selectedProducts,
    );
    onProductsChange(details);
    updateConfig({ productIds: details.map((d) => d.id) });
  }, [
    config.productIds,
    selectedProducts,
    selectProductsDetailed,
    onProductsChange,
    updateConfig,
  ]);

  const handleRemoveProduct = useCallback(
    (id: string) => {
      const updated = selectedProducts.filter((p) => p.id !== id);
      onProductsChange(updated);
      updateConfig({ productIds: updated.map((p) => p.id) });
    },
    [selectedProducts, onProductsChange, updateConfig],
  );

  // ---------------------------------------------------------------------------
  // Collections
  // ---------------------------------------------------------------------------

  const handleSelectCollections = useCallback(async () => {
    const details = await selectCollectionsDetailed(
      config.collectionIds,
      selectedCollections,
    );
    onCollectionsChange(details);
    updateConfig({ collectionIds: details.map((d) => d.id) });
  }, [
    config.collectionIds,
    selectedCollections,
    selectCollectionsDetailed,
    onCollectionsChange,
    updateConfig,
  ]);

  const handleRemoveCollection = useCallback(
    (id: string) => {
      const updated = selectedCollections.filter((c) => c.id !== id);
      onCollectionsChange(updated);
      updateConfig({ collectionIds: updated.map((c) => c.id) });
    },
    [selectedCollections, onCollectionsChange, updateConfig],
  );

  const productCount = selectedProducts.length;
  const collectionCount = selectedCollections.length;

  return (
    <BlockStack gap="500">
      {/* Header */}
      <BlockStack gap="200">
        <Text variant="headingLg" as="h2">
          {title}
        </Text>
        <Text as="p" tone="subdued">
          {description}
        </Text>
      </BlockStack>

      {/* Products section */}
      <Card>
        <BlockStack gap="400">
          <InlineStack align="space-between" blockAlign="center">
            <InlineStack gap="200" blockAlign="center">
              <div
                className="flex h-9 w-9 items-center justify-center rounded-[var(--p-border-radius-200)] bg-[var(--p-color-bg-fill-info)] text-[var(--p-color-text-info-on-bg-fill)]"
              >
                <Icon source={ProductIcon} />
              </div>
              <BlockStack gap="050">
                <InlineStack gap="200" blockAlign="center">
                  <Text variant="headingMd" as="h3">
                    {productsTitle}
                  </Text>
                  {productCount > 0 && (
                    <Badge tone="info">{String(productCount)}</Badge>
                  )}
                </InlineStack>
                <Text as="p" variant="bodySm" tone="subdued">
                  {productsDescription}
                </Text>
              </BlockStack>
            </InlineStack>

            <Button onClick={handleSelectProducts}>
              {productCount > 0 ? "Add or change" : "Select products"}
            </Button>
          </InlineStack>

          {/* Selected products list */}
          {productCount > 0 ? (
            <Box
              borderBlockStartWidth="025"
              borderColor="border"
              paddingBlockStart="300"
            >
              <BlockStack gap="100">
                {selectedProducts.map((product) => (
                  <ResourceRow
                    key={product.id}
                    resource={product}
                    onRemove={() => handleRemoveProduct(product.id)}
                    fallbackIcon={ImageIcon}
                  />
                ))}
              </BlockStack>
            </Box>
          ) : (
            <Box
              borderBlockStartWidth="025"
              borderColor="border"
              paddingBlockStart="400"
              paddingBlockEnd="200"
            >
              <Text as="p" variant="bodySm" tone="subdued" alignment="center">
                {emptyProductsText}
              </Text>
            </Box>
          )}
        </BlockStack>
      </Card>

      {/* Collections section */}
      <Card>
        <BlockStack gap="400">
          <InlineStack align="space-between" blockAlign="center">
            <InlineStack gap="200" blockAlign="center">
              <div
                className="flex h-9 w-9 items-center justify-center rounded-[var(--p-border-radius-200)] bg-[var(--p-color-bg-fill-success)] text-[var(--p-color-text-success-on-bg-fill)]"
              >
                <Icon source={CollectionIcon} />
              </div>
              <BlockStack gap="050">
                <InlineStack gap="200" blockAlign="center">
                  <Text variant="headingMd" as="h3">
                    {collectionsTitle}
                  </Text>
                  {collectionCount > 0 && (
                    <Badge tone="success">{String(collectionCount)}</Badge>
                  )}
                </InlineStack>
                <Text as="p" variant="bodySm" tone="subdued">
                  {collectionsDescription}
                </Text>
              </BlockStack>
            </InlineStack>

            <Button onClick={handleSelectCollections}>
              {collectionCount > 0 ? "Add or change" : "Select collections"}
            </Button>
          </InlineStack>

          {/* Selected collections list */}
          {collectionCount > 0 ? (
            <Box
              borderBlockStartWidth="025"
              borderColor="border"
              paddingBlockStart="300"
            >
              <BlockStack gap="100">
                {selectedCollections.map((collection) => (
                  <ResourceRow
                    key={collection.id}
                    resource={collection}
                    onRemove={() => handleRemoveCollection(collection.id)}
                    fallbackIcon={CollectionIcon}
                  />
                ))}
              </BlockStack>
            </Box>
          ) : (
            <Box
              borderBlockStartWidth="025"
              borderColor="border"
              paddingBlockStart="400"
              paddingBlockEnd="200"
            >
              <Text as="p" variant="bodySm" tone="subdued" alignment="center">
                {emptyCollectionsText}
              </Text>
            </Box>
          )}
        </BlockStack>
      </Card>
    </BlockStack>
  );
}
