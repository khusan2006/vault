"use client";

import { useCallback, useMemo, useState, useEffect, useRef } from "react";
import { useIdTokenNavigation } from "@/hooks/useIdTokenNavigation";
import {
  Page,
  Layout,
  Banner,
  Text,
  Modal,
  SkeletonPage,
  SkeletonBodyText,
  SkeletonDisplayText,
  Card,
  Box,
  BlockStack,
  Tabs,
} from "@shopify/polaris";
import { SaveBar } from "@shopify/app-bridge-react";
import { campaignsApi } from "@/lib/api";
import { useToast } from "@/hooks/useToast";
import { campaignToFormState, useCampaignForm } from "@/hooks/useCampaignForm";
import { CAMPAIGN_TYPE_LABELS, seedSelectedResourcesFromCampaign } from "@/utils";
import { CampaignForm } from "@/components/campaigns";
import type {
  Campaign,
  CampaignType,
  EarlyAccessConfig,
  DiscountedProductConfig,
  TimerSaleConfig,
  Condition,
  ConditionGroup,
} from "@/types";
import type { SelectedResource } from "@/hooks/useResourcePicker";
import { ProductsStep } from "@/components/campaigns/early-access-wizard/ProductsStep";
import { AudienceStep } from "@/components/campaigns/early-access-wizard/AudienceStep";
import { StorefrontStep } from "@/components/campaigns/early-access-wizard/StorefrontStep";
import { StepDiscountConfig } from "@/components/campaigns/wizard/StepDiscountConfig";
import { StepTimerSaleConfig } from "@/components/campaigns/wizard/StepTimerSaleConfig";
import { DiscountedProductDisplayStep } from "@/components/campaigns/discounted-product-wizard/DiscountedProductDisplayStep";
import { TimerSaleDisplayStep } from "@/components/campaigns/timer-sale-wizard/TimerSaleDisplayStep";
import { CampaignDetailsSidebar } from "@/components/campaigns/shared/CampaignDetailsSidebar";

function countFilledRules(group: ConditionGroup): number {
  return group.conditions.filter(
    (item): item is Condition =>
      "type" in item &&
      !("conditions" in item) &&
      String(item.value).trim() !== "",
  ).length;
}


function EarlyAccessEditFlow({
  formState,
  onFieldChange,
  nameError,
  selectedProducts,
  selectedCollections,
  onProductsChange,
  onCollectionsChange,
}: {
  formState: ReturnType<typeof useCampaignForm>["formState"];
  onFieldChange: <K extends keyof typeof formState>(
    field: K,
    value: (typeof formState)[K],
  ) => void;
  nameError?: string;
  selectedProducts: SelectedResource[];
  selectedCollections: SelectedResource[];
  onProductsChange: (products: SelectedResource[]) => void;
  onCollectionsChange: (collections: SelectedResource[]) => void;
}) {
  const config = formState.config as EarlyAccessConfig;
  const [selectedTab, setSelectedTab] = useState(0);

  const productCount = config.productIds.length;
  const collectionCount = config.collectionIds.length;
  const hasProducts = productCount > 0 || collectionCount > 0;
  const ruleCount = countFilledRules(formState.conditions);
  const previewBadge = config.storefrontApproach ? "Set" : "Not set";

  const tabs = [
    {
      id: "products",
      content: "Products",
      badge: hasProducts
        ? String(productCount + collectionCount)
        : "All",
    },
    {
      id: "audience",
      content: "Audience",
      badge: ruleCount ? String(ruleCount) : "All",
    },
    {
      id: "preview",
      content: "Preview",
      badge: previewBadge,
    },
  ];

  return (
    <>
      <Layout.Section>
        <Card padding="0">
          <Box
            padding="300"
            background="bg-surface-secondary"
            borderBlockEndWidth="025"
            borderColor="border"
          >
            <BlockStack gap="100">
              <Text variant="headingMd" as="h2">
                Edit sections
              </Text>
              <Text as="p" tone="subdued">
                Switch between products, audience rules, and display settings.
              </Text>
            </BlockStack>
            <Box paddingBlockStart="200">
              <Tabs
                tabs={tabs}
                selected={selectedTab}
                onSelect={setSelectedTab}
                fitted
              />
            </Box>
          </Box>
          <Box padding="400">
            {selectedTab === 0 && (
              <ProductsStep
                formState={formState}
                onFieldChange={onFieldChange}
                selectedProducts={selectedProducts}
                selectedCollections={selectedCollections}
                onProductsChange={onProductsChange}
                onCollectionsChange={onCollectionsChange}
              />
            )}

            {selectedTab === 1 && (
              <AudienceStep
                formState={formState}
                onFieldChange={onFieldChange}
              />
            )}

            {selectedTab === 2 && (
              <StorefrontStep
                formState={formState}
                onFieldChange={onFieldChange}
                selectedProducts={selectedProducts}
                approachColumns={2}
                showInlinePreview={false}
              />
            )}
          </Box>
        </Card>
      </Layout.Section>

      <Layout.Section variant="oneThird">
        <CampaignDetailsSidebar
          formState={formState}
          onFieldChange={onFieldChange}
          nameError={nameError}
        />
      </Layout.Section>
    </>
  );
}

function DiscountedProductEditFlow({
  formState,
  onFieldChange,
  nameError,
  selectedProducts,
  selectedCollections,
  onProductsChange,
  onCollectionsChange,
}: {
  formState: ReturnType<typeof useCampaignForm>["formState"];
  onFieldChange: <K extends keyof typeof formState>(
    field: K,
    value: (typeof formState)[K],
  ) => void;
  nameError?: string;
  selectedProducts: SelectedResource[];
  selectedCollections: SelectedResource[];
  onProductsChange: (products: SelectedResource[]) => void;
  onCollectionsChange: (collections: SelectedResource[]) => void;
}) {
  const config = formState.config as DiscountedProductConfig;
  const [selectedTab, setSelectedTab] = useState(0);

  const productCount = config.productIds.length;
  const collectionCount = config.collectionIds.length;
  const hasProducts = productCount > 0 || collectionCount > 0;
  const ruleCount = countFilledRules(formState.conditions);
  const discountBadge = config.discount?.value ? "Set" : "Not set";
  const displayBadge = config.displayConfig ? "Set" : "Default";

  const tabs = [
    {
      id: "products",
      content: "Products",
      badge: hasProducts
        ? String(productCount + collectionCount)
        : "All",
    },
    {
      id: "audience",
      content: "Audience",
      badge: ruleCount ? String(ruleCount) : "All",
    },
    {
      id: "discount",
      content: "Discount",
      badge: discountBadge,
    },
    {
      id: "display",
      content: "Display",
      badge: displayBadge,
    },
  ];

  return (
    <>
      <Layout.Section>
        <Card padding="0">
          <Box
            padding="300"
            background="bg-surface-secondary"
            borderBlockEndWidth="025"
            borderColor="border"
          >
            <BlockStack gap="100">
              <Text variant="headingMd" as="h2">
                Edit sections
              </Text>
              <Text as="p" tone="subdued">
                Switch between products, audience rules, discount settings, and
                storefront display.
              </Text>
            </BlockStack>
            <Box paddingBlockStart="200">
              <Tabs
                tabs={tabs}
                selected={selectedTab}
                onSelect={setSelectedTab}
                fitted
              />
            </Box>
          </Box>
          <Box padding="400">
            {selectedTab === 0 && (
              <ProductsStep
                formState={formState}
                onFieldChange={onFieldChange}
                selectedProducts={selectedProducts}
                selectedCollections={selectedCollections}
                onProductsChange={onProductsChange}
                onCollectionsChange={onCollectionsChange}
                title="Choose products for discounted pricing"
                description="Select the products or collections that should show discounted pricing to qualifying customers."
                productsDescription="Select individual products to discount"
                collectionsDescription="Select collections to discount"
              />
            )}

            {selectedTab === 1 && (
              <AudienceStep
                formState={formState}
                onFieldChange={onFieldChange}
                title="Who should see discounted pricing?"
                description="Define which customers are eligible for this discount."
                tipText="If you don't add any rules, all logged-in customers will qualify."
              />
            )}

            {selectedTab === 2 && (
              <BlockStack gap="400">
                <StepDiscountConfig
                  formState={formState}
                  onFieldChange={onFieldChange}
                />
              </BlockStack>
            )}

            {selectedTab === 3 && (
              <DiscountedProductDisplayStep
                formState={formState}
                onFieldChange={onFieldChange}
                selectedProducts={selectedProducts}
              />
            )}
          </Box>
        </Card>
      </Layout.Section>

      <Layout.Section variant="oneThird">
        <CampaignDetailsSidebar
          formState={formState}
          onFieldChange={onFieldChange}
          nameError={nameError}
        />
      </Layout.Section>
    </>
  );
}

function TimerSaleEditFlow({
  formState,
  onFieldChange,
  nameError,
  selectedProducts,
  selectedCollections,
  onProductsChange,
  onCollectionsChange,
}: {
  formState: ReturnType<typeof useCampaignForm>["formState"];
  onFieldChange: <K extends keyof typeof formState>(
    field: K,
    value: (typeof formState)[K],
  ) => void;
  nameError?: string;
  selectedProducts: SelectedResource[];
  selectedCollections: SelectedResource[];
  onProductsChange: (products: SelectedResource[]) => void;
  onCollectionsChange: (collections: SelectedResource[]) => void;
}) {
  const config = formState.config as TimerSaleConfig;
  const [selectedTab, setSelectedTab] = useState(0);

  const productCount = config.productIds.length;
  const collectionCount = config.collectionIds.length;
  const hasProducts = productCount > 0 || collectionCount > 0;
  const ruleCount = countFilledRules(formState.conditions);
  const timerBadge = config.timerDurationMinutes ? "Set" : "Not set";
  const displayBadge = config.displayConfig ? "Set" : "Default";

  const tabs = [
    {
      id: "products",
      content: "Products",
      badge: hasProducts
        ? String(productCount + collectionCount)
        : "All",
    },
    {
      id: "audience",
      content: "Audience",
      badge: ruleCount ? String(ruleCount) : "All",
    },
    {
      id: "timer",
      content: "Timer & discount",
      badge: timerBadge,
    },
    {
      id: "display",
      content: "Display",
      badge: displayBadge,
    },
  ];

  return (
    <>
      <Layout.Section>
        <Card padding="0">
          <Box
            padding="300"
            background="bg-surface-secondary"
            borderBlockEndWidth="025"
            borderColor="border"
          >
            <BlockStack gap="100">
              <Text variant="headingMd" as="h2">
                Edit sections
              </Text>
              <Text as="p" tone="subdued">
                Switch between products, audience rules, timer settings, and
                storefront display.
              </Text>
            </BlockStack>
            <Box paddingBlockStart="200">
              <Tabs
                tabs={tabs}
                selected={selectedTab}
                onSelect={setSelectedTab}
                fitted
              />
            </Box>
          </Box>
          <Box padding="400">
            {selectedTab === 0 && (
              <ProductsStep
                formState={formState}
                onFieldChange={onFieldChange}
                selectedProducts={selectedProducts}
                selectedCollections={selectedCollections}
                onProductsChange={onProductsChange}
                onCollectionsChange={onCollectionsChange}
                title="Choose products for this timer sale"
                description="Select the products or collections included in this timed offer."
                productsDescription="Select individual products to include"
                collectionsDescription="Select collections to include"
              />
            )}

            {selectedTab === 1 && (
              <AudienceStep
                formState={formState}
                onFieldChange={onFieldChange}
                title="Who should see this timer sale?"
                description="Define which customers are eligible for this timed offer."
                tipText="If you don't add any rules, all logged-in customers will qualify."
              />
            )}

            {selectedTab === 2 && (
              <BlockStack gap="400">
                <StepTimerSaleConfig
                  formState={formState}
                  onFieldChange={onFieldChange}
                />
              </BlockStack>
            )}

            {selectedTab === 3 && (
              <TimerSaleDisplayStep
                formState={formState}
                onFieldChange={onFieldChange}
                selectedProducts={selectedProducts}
              />
            )}
          </Box>
        </Card>
      </Layout.Section>

      <Layout.Section variant="oneThird">
        <CampaignDetailsSidebar
          formState={formState}
          onFieldChange={onFieldChange}
          nameError={nameError}
        />
      </Layout.Section>
    </>
  );
}

function renderFormByType(
  type: CampaignType | undefined,
  formState: ReturnType<typeof useCampaignForm>["formState"],
  onFieldChange: <K extends keyof typeof formState>(
    field: K,
    value: (typeof formState)[K],
  ) => void,
  nameError?: string,
  selectionProps?: {
    selectedProducts: SelectedResource[];
    selectedCollections: SelectedResource[];
    onProductsChange: (products: SelectedResource[]) => void;
    onCollectionsChange: (collections: SelectedResource[]) => void;
  },
) {
  const props = { formState, onFieldChange, nameError, showArchived: true };

  switch (type) {
    case "discounted_product":
      if (!selectionProps) return null;
      return (
        <DiscountedProductEditFlow
          formState={formState}
          onFieldChange={onFieldChange}
          nameError={nameError}
          selectedProducts={selectionProps.selectedProducts}
          selectedCollections={selectionProps.selectedCollections}
          onProductsChange={selectionProps.onProductsChange}
          onCollectionsChange={selectionProps.onCollectionsChange}
        />
      );
    case "timer_sale":
      if (!selectionProps) return null;
      return (
        <TimerSaleEditFlow
          formState={formState}
          onFieldChange={onFieldChange}
          nameError={nameError}
          selectedProducts={selectionProps.selectedProducts}
          selectedCollections={selectionProps.selectedCollections}
          onProductsChange={selectionProps.onProductsChange}
          onCollectionsChange={selectionProps.onCollectionsChange}
        />
      );
    case "early_access":
      if (!selectionProps) return null;
      return (
        <EarlyAccessEditFlow
          formState={formState}
          onFieldChange={onFieldChange}
          nameError={nameError}
          selectedProducts={selectionProps.selectedProducts}
          selectedCollections={selectionProps.selectedCollections}
          onProductsChange={selectionProps.onProductsChange}
          onCollectionsChange={selectionProps.onCollectionsChange}
        />
      );
    default:
      // Legacy campaigns without a type — fall back to the generic form
      return <CampaignForm {...props} />;
  }
}

interface EditCampaignClientProps {
  campaignId: string;
  initialCampaign: Campaign | null;
}

export default function EditCampaignClient({
  campaignId,
  initialCampaign,
}: EditCampaignClientProps) {
  const { push } = useIdTokenNavigation();

  const initialFormState = useMemo(
    () => (initialCampaign ? campaignToFormState(initialCampaign) : undefined),
    [initialCampaign],
  );
  const initialSelections = useMemo(() => {
    if (!initialCampaign) {
      return { products: [], collections: [] };
    }

    return seedSelectedResourcesFromCampaign(initialCampaign, {
      products: [],
      collections: [],
    });
  }, [initialCampaign]);

  const [loading, setLoading] = useState(initialCampaign === null);
  const [saving, setSaving] = useState(false);
  const [duplicating, setDuplicating] = useState(false);
  const [deleting, setDeleting] = useState(false);
  const [deleteModalOpen, setDeleteModalOpen] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [selectedProducts, setSelectedProducts] = useState<SelectedResource[]>(
    initialSelections.products,
  );
  const [selectedCollections, setSelectedCollections] = useState<
    SelectedResource[]
  >(initialSelections.collections);
  const selectedProductsRef = useRef<SelectedResource[]>([]);
  const selectedCollectionsRef = useRef<SelectedResource[]>([]);
  const hasInitialized = useRef(false);

  const { show: showToast } = useToast();
  const {
    formState,
    updateField,
    hydrateFromCampaign,
    buildPayload,
    isDirty,
    checkDirty,
    markClean,
  } = useCampaignForm(initialFormState);

  // Track dirty state on every form change
  useEffect(() => {
    if (!hasInitialized.current) return;
    checkDirty(formState);
  }, [formState, checkDirty]);

  useEffect(() => {
    selectedProductsRef.current = selectedProducts;
  }, [selectedProducts]);

  useEffect(() => {
    selectedCollectionsRef.current = selectedCollections;
  }, [selectedCollections]);

  useEffect(() => {
    if (!initialCampaign || hasInitialized.current) return;
    markClean();
    hasInitialized.current = true;
  }, [initialCampaign, markClean]);

  // Load campaign data
  const hydrateCampaign = useCallback(
    (campaign: Campaign) => {
      hydrateFromCampaign(campaign);
      const seeded = seedSelectedResourcesFromCampaign(campaign, {
        products: selectedProductsRef.current,
        collections: selectedCollectionsRef.current,
      });
      setSelectedProducts(seeded.products);
      setSelectedCollections(seeded.collections);
      hasInitialized.current = true;
    },
    [hydrateFromCampaign],
  );

  const loadCampaign = useCallback(async () => {
    try {
      setLoading(true);
      const campaign = await campaignsApi.get(campaignId);
      hydrateCampaign(campaign);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to load campaign");
    } finally {
      setLoading(false);
    }
  }, [campaignId, hydrateCampaign]);

  useEffect(() => {
    if (initialCampaign) return;
    loadCampaign();
  }, [initialCampaign, loadCampaign]);

  const handleSave = useCallback(async () => {
    if (!formState.name.trim()) {
      setError("Campaign name is required");
      return;
    }

    try {
      setSaving(true);
      setError(null);
      await campaignsApi.update(campaignId, buildPayload());
      markClean();
      showToast("Campaign saved");
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to save campaign");
    } finally {
      setSaving(false);
    }
  }, [campaignId, formState.name, buildPayload, markClean, showToast]);

  const handleDiscard = useCallback(() => {
    loadCampaign();
  }, [loadCampaign]);

  const handleDelete = useCallback(async () => {
    try {
      setDeleting(true);
      await campaignsApi.delete(campaignId);
      showToast("Campaign deleted");
      push("/campaigns");
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to delete campaign");
      setDeleteModalOpen(false);
    } finally {
      setDeleting(false);
    }
  }, [campaignId, push, showToast]);

  const handleDuplicate = useCallback(async () => {
    try {
      setDuplicating(true);
      const duplicated = await campaignsApi.duplicate(campaignId);
      showToast("Campaign duplicated");
      push(`/campaigns/${duplicated.id}`);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to duplicate campaign");
    } finally {
      setDuplicating(false);
    }
  }, [campaignId, push, showToast]);

  const handleFieldChange = useCallback(
    <K extends keyof typeof formState>(field: K, value: (typeof formState)[K]) => {
      updateField(field, value);
      if (error === "Campaign name is required" && field === "name" && String(value).trim()) {
        setError(null);
      }
    },
    [updateField, error],
  );

  const isActive = formState.status === "active";
  const isBusy = saving || duplicating;
  const selectionProps = useMemo(
    () => ({
      selectedProducts,
      selectedCollections,
      onProductsChange: setSelectedProducts,
      onCollectionsChange: setSelectedCollections,
    }),
    [selectedProducts, selectedCollections],
  );

  if (loading) {
    return (
      <SkeletonPage title="Campaign" backAction primaryAction>
        <Layout>
          <Layout.Section>
            <Card>
              <BlockStack gap="200">
                <SkeletonDisplayText size="small" />
                <SkeletonBodyText lines={2} />
              </BlockStack>
            </Card>
            <Box paddingBlockStart="400">
              <Card>
                <BlockStack gap="200">
                  <SkeletonBodyText lines={1} />
                  <SkeletonBodyText lines={4} />
                </BlockStack>
              </Card>
            </Box>
          </Layout.Section>
          <Layout.Section variant="oneThird">
            <Card>
              <BlockStack gap="200">
                <SkeletonDisplayText size="small" />
                <SkeletonBodyText lines={2} />
              </BlockStack>
            </Card>
            <Box paddingBlockStart="400">
              <Card>
                <SkeletonBodyText lines={3} />
              </Card>
            </Box>
          </Layout.Section>
        </Layout>
      </SkeletonPage>
    );
  }

  return (
    <>
      <SaveBar id="campaign-save-bar" open={isDirty}>
        <button
          variant="primary"
          onClick={handleSave}
          {...(saving ? { loading: "" } : {})}
        />
        <button onClick={handleDiscard} />
      </SaveBar>

      <Page
        title={formState.name || "Edit campaign"}
        subtitle={formState.type ? CAMPAIGN_TYPE_LABELS[formState.type] : undefined}
        backAction={{
          content: "Campaigns",
          onAction: () => push("/campaigns"),
        }}
 
        secondaryActions={[
          {
            content: "Duplicate",
            onAction: handleDuplicate,
            loading: duplicating,
            disabled: isBusy,
          },
          {
            content: "Delete",
            onAction: () => setDeleteModalOpen(true),
            destructive: true,
            disabled: isBusy,
          },
        ]}
      >
        <Layout>
          {error && (
            <Layout.Section>
              <Banner tone="critical" onDismiss={() => setError(null)}>
                {error}
              </Banner>
            </Layout.Section>
          )}

          {renderFormByType(
            formState.type,
            formState,
            handleFieldChange,
            error === "Campaign name is required" ? error : undefined,
            selectionProps,
          )}
        </Layout>
      </Page>

      <Modal
        open={deleteModalOpen}
        onClose={() => setDeleteModalOpen(false)}
        title="Delete campaign?"
        primaryAction={{
          content: "Delete",
          destructive: true,
          onAction: handleDelete,
          loading: deleting,
        }}
        secondaryActions={[
          {
            content: "Cancel",
            onAction: () => setDeleteModalOpen(false),
          },
        ]}
      >
        <Modal.Section>
          <BlockStack gap="300">
            {isActive && (
              <Banner tone="warning">
                This campaign is currently active. Deleting it will immediately
                stop all benefits for qualifying customers.
              </Banner>
            )}
            <Text as="p">
              Are you sure you want to delete &quot;{formState.name}&quot;? This
              action cannot be undone.
            </Text>
          </BlockStack>
        </Modal.Section>
      </Modal>
    </>
  );
}
