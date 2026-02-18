"use client";

import { useCallback, useMemo, useState } from "react";
import { useIdTokenNavigation } from "@/hooks/useIdTokenNavigation";
import {
  Page,
  Layout,
  Card,
  BlockStack,
  InlineStack,
  Button,
  TextField,
  Text,
  Box,
  Banner,
  Divider,
  Badge,
  Select,
  Icon,
} from "@shopify/polaris";
import {
  ViewIcon,
  DiscountIcon,
  GiftCardIcon,
  CheckCircleIcon,
  AlertCircleIcon,
} from "@shopify/polaris-icons";
import type {
  ConditionGroup,
  Benefit,
  BenefitType,
  DiscountType,
  Condition,
  ConditionType,
  ComparisonOperator,
} from "@/types";
import { CAMPAIGN_DEFAULTS, STORAGE_KEYS } from "@/constants";
import { createEmptyBenefit } from "@/utils";
import { campaignsApi } from "@/lib/api";
import { useResourcePicker } from "@/hooks/useResourcePicker";
import { WizardStepIndicator } from "./WizardStepIndicator";
import { SimpleConditionBuilder } from "./SimpleConditionBuilder";
import { ConditionBuilder } from "./ConditionBuilder";

// =============================================================================
// Constants
// =============================================================================

const WIZARD_STEPS = [
  {
    label: "Details",
    description: "Name your campaign and add an internal description.",
  },
  {
    label: "Audience",
    description: "Define which customers qualify for this campaign.",
  },
  {
    label: "Benefits",
    description: "Choose what qualifying customers receive.",
  },
];

const DEFAULT_CONDITIONS: ConditionGroup = {
  operator: "AND",
  conditions: [
    {
      type: "customer_tag" as ConditionType,
      operator: "equals" as ComparisonOperator,
      value: "",
    },
  ],
};

// =============================================================================
// Sub-components
// =============================================================================

interface BenefitTypeCardProps {
  title: string;
  description: string;
  icon: typeof ViewIcon;
  isSelected: boolean;
  onToggle: () => void;
}

function BenefitTypeCard({
  title,
  description,
  icon,
  isSelected,
  onToggle,
}: BenefitTypeCardProps) {
  return (
    <div
      onClick={onToggle}
      onKeyDown={(e) => {
        if (e.key === "Enter" || e.key === " ") {
          e.preventDefault();
          onToggle();
        }
      }}
      role="checkbox"
      aria-checked={isSelected}
      tabIndex={0}
      className="cursor-pointer"
    >
      <Box
        padding="400"
        borderRadius="200"
        borderWidth="025"
        borderColor={isSelected ? "border-brand" : "border"}
        background={isSelected ? "bg-surface-selected" : "bg-surface"}
      >
        <InlineStack gap="300" blockAlign="start" wrap={false}>
          <Box>
            <Icon source={icon} tone={isSelected ? "info" : "subdued"} />
          </Box>
          <BlockStack gap="100">
            <InlineStack gap="200" blockAlign="center">
              <Text as="p" variant="bodyMd" fontWeight="semibold">
                {title}
              </Text>
              {isSelected && <Badge tone="info">Selected</Badge>}
            </InlineStack>
            <Text as="p" variant="bodySm" tone="subdued">
              {description}
            </Text>
          </BlockStack>
        </InlineStack>
      </Box>
    </div>
  );
}

interface BenefitConfigProps {
  benefit: Benefit;
  onChange: (benefit: Benefit) => void;
  onSelectProducts: () => void;
  onSelectCollections: () => void;
}

function BenefitConfig({
  benefit,
  onChange,
  onSelectProducts,
  onSelectCollections,
}: BenefitConfigProps) {
  const productCount = benefit.productIds?.length ?? 0;
  const collectionCount = benefit.collectionIds?.length ?? 0;

  return (
    <Box padding="400" background="bg-surface-secondary" borderRadius="200">
      <BlockStack gap="300">
        {benefit.type === "discount" && (
          <InlineStack gap="300">
            <div className="flex-1">
              <Select
                label="Discount type"
                options={[
                  { label: "Percentage off", value: "percentage" },
                  { label: "Fixed amount off", value: "fixed_amount" },
                ]}
                value={benefit.discount.type}
                onChange={(value) =>
                  onChange({
                    ...benefit,
                    discount: {
                      ...benefit.discount,
                      type: value as DiscountType,
                    },
                  })
                }
              />
            </div>
            <div className="flex-1">
              <TextField
                label={
                  benefit.discount.type === "percentage"
                    ? "Percentage"
                    : "Amount"
                }
                type="number"
                value={String(benefit.discount.value)}
                onChange={(value) =>
                  onChange({
                    ...benefit,
                    discount: {
                      ...benefit.discount,
                      value: Number(value) || 0,
                    },
                  })
                }
                suffix={
                  benefit.discount.type === "percentage" ? "%" : undefined
                }
                prefix={
                  benefit.discount.type === "fixed_amount" ? "$" : undefined
                }
                autoComplete="off"
              />
            </div>
          </InlineStack>
        )}

        {benefit.type === "free_product" && (
          <TextField
            label="Max claims per customer"
            type="number"
            value={String(benefit.maxClaimsPerCustomer)}
            onChange={(value) =>
              onChange({
                ...benefit,
                maxClaimsPerCustomer: Number(value) || 1,
              })
            }
            helpText="How many times can each customer claim this free product?"
            autoComplete="off"
          />
        )}

        <BlockStack gap="200">
          <Text as="p" variant="bodySm" fontWeight="semibold">
            Apply to products
          </Text>
          <InlineStack gap="300">
            <Button onClick={onSelectProducts} size="slim">
              {productCount > 0
                ? `${productCount} product${productCount > 1 ? "s" : ""} selected`
                : "Select products"}
            </Button>
            <Button
              onClick={onSelectCollections}
              size="slim"
              variant="plain"
            >
              {collectionCount > 0
                ? `${collectionCount} collection${collectionCount > 1 ? "s" : ""} selected`
                : "Select collections"}
            </Button>
          </InlineStack>
          {productCount === 0 && collectionCount === 0 && (
            <Text as="p" tone="subdued" variant="bodySm">
              No products selected yet.
            </Text>
          )}
        </BlockStack>
      </BlockStack>
    </Box>
  );
}

// =============================================================================
// Helpers
// =============================================================================

function getBenefitLabel(type: BenefitType): string {
  switch (type) {
    case "visibility":
      return "Exclusive access";
    case "discount":
      return "Automatic discount";
    case "free_product":
      return "Free product";
  }
}

function formatConditionPreview(condition: Condition): string {
  const op = condition.operator.replace(/_/g, " ");
  switch (condition.type) {
    case "customer_tag":
      return `Tag ${op} "${condition.value || "..."}"`;
    case "total_spent":
      return `Spent ${op} $${condition.value}`;
    case "order_count":
      return `Orders ${op} ${condition.value}`;
    case "account_age_days":
      return `Account age ${op} ${condition.value} days`;
  }
}

function formatBenefitPreview(benefit: Benefit): string {
  const itemCount =
    (benefit.productIds?.length ?? 0) + (benefit.collectionIds?.length ?? 0);
  const itemLabel = itemCount > 0 ? `${itemCount} item(s)` : "no items yet";

  switch (benefit.type) {
    case "visibility":
      return itemLabel;
    case "discount":
      return benefit.discount.type === "percentage"
        ? `${benefit.discount.value}% off · ${itemLabel}`
        : `$${benefit.discount.value} off · ${itemLabel}`;
    case "free_product":
      return `max ${benefit.maxClaimsPerCustomer}/customer · ${itemLabel}`;
  }
}

// =============================================================================
// Live Preview Sidebar
// =============================================================================

interface LivePreviewProps {
  name: string;
  description: string;
  conditions: ConditionGroup;
  benefits: Benefit[];
  currentStep: number;
}

function LivePreview({
  name,
  description,
  conditions,
  benefits,
  currentStep,
}: LivePreviewProps) {
  const conditionCount = conditions.conditions.length;
  const hasConditions =
    conditionCount > 0 &&
    !(
      conditionCount === 1 &&
      "type" in conditions.conditions[0] &&
      (conditions.conditions[0] as Condition).value === ""
    );

  const hasBenefits = benefits.length > 0;

  return (
    <Card>
      <BlockStack gap="400">
        <Text variant="headingMd" as="h2">
          Campaign summary
        </Text>

        {/* Details */}
        <BlockStack gap="200">
          <InlineStack gap="200" blockAlign="center">
            <Icon
              source={name.trim() ? CheckCircleIcon : AlertCircleIcon}
              tone={name.trim() ? "success" : "subdued"}
            />
            <Text as="p" variant="bodySm" fontWeight="semibold">
              Details
            </Text>
          </InlineStack>
          <Box paddingInlineStart="600">
            {name.trim() ? (
              <BlockStack gap="100">
                <Text as="p" variant="bodyMd" fontWeight="semibold">
                  {name}
                </Text>
                {description && (
                  <Text as="p" variant="bodySm" tone="subdued">
                    {description.length > 60
                      ? `${description.slice(0, 60)}...`
                      : description}
                  </Text>
                )}
              </BlockStack>
            ) : (
              <Text as="p" variant="bodySm" tone="subdued">
                Not yet configured
              </Text>
            )}
          </Box>
        </BlockStack>

        <Divider />

        {/* Audience */}
        <BlockStack gap="200">
          <InlineStack gap="200" blockAlign="center">
            <Icon
              source={currentStep > 1 && hasConditions ? CheckCircleIcon : AlertCircleIcon}
              tone={currentStep > 1 && hasConditions ? "success" : "subdued"}
            />
            <Text as="p" variant="bodySm" fontWeight="semibold">
              Audience
            </Text>
          </InlineStack>
          <Box paddingInlineStart="600">
            {hasConditions ? (
              <BlockStack gap="100">
                {conditions.conditions
                  .filter(
                    (item): item is Condition =>
                      "type" in item && !("conditions" in item),
                  )
                  .slice(0, 3)
                  .map((condition, i) => (
                    <Text key={i} as="p" variant="bodySm" tone="subdued">
                      {formatConditionPreview(condition)}
                    </Text>
                  ))}
                {conditionCount > 3 && (
                  <Text as="p" variant="bodySm" tone="subdued">
                    +{conditionCount - 3} more
                  </Text>
                )}
              </BlockStack>
            ) : (
              <Text as="p" variant="bodySm" tone="subdued">
                {currentStep > 1
                  ? "All customers qualify"
                  : "Not yet configured"}
              </Text>
            )}
          </Box>
        </BlockStack>

        <Divider />

        {/* Benefits */}
        <BlockStack gap="200">
          <InlineStack gap="200" blockAlign="center">
            <Icon
              source={hasBenefits ? CheckCircleIcon : AlertCircleIcon}
              tone={hasBenefits ? "success" : "subdued"}
            />
            <Text as="p" variant="bodySm" fontWeight="semibold">
              Benefits
            </Text>
          </InlineStack>
          <Box paddingInlineStart="600">
            {hasBenefits ? (
              <BlockStack gap="100">
                {benefits.map((b, i) => (
                  <InlineStack key={i} gap="200" blockAlign="center">
                    <Badge
                      tone={
                        b.type === "visibility"
                          ? "info"
                          : b.type === "discount"
                            ? "success"
                            : "attention"
                      }
                      size="small"
                    >
                      {getBenefitLabel(b.type)}
                    </Badge>
                    <Text as="span" variant="bodySm" tone="subdued">
                      {formatBenefitPreview(b)}
                    </Text>
                  </InlineStack>
                ))}
              </BlockStack>
            ) : (
              <Text as="p" variant="bodySm" tone="subdued">
                Not yet configured
              </Text>
            )}
          </Box>
        </BlockStack>

        <Divider />

        <InlineStack gap="200" blockAlign="center">
          <Text as="p" variant="bodySm" tone="subdued">
            Status:
          </Text>
          <Badge>Draft</Badge>
        </InlineStack>
      </BlockStack>
    </Card>
  );
}

// =============================================================================
// Main wizard
// =============================================================================

export function CampaignWizard() {
  const { push } = useIdTokenNavigation();
  const { selectProducts, selectCollections } = useResourcePicker();

  const [currentStep, setCurrentStep] = useState(0);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [useAdvancedConditions, setUseAdvancedConditions] = useState(false);

  // Form state
  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [conditions, setConditions] =
    useState<ConditionGroup>(DEFAULT_CONDITIONS);
  const [benefits, setBenefits] = useState<Benefit[]>([]);

  // Track which benefit types are selected
  const selectedBenefitTypes = useMemo(
    () => new Set(benefits.map((b) => b.type)),
    [benefits],
  );

  const handleToggleBenefitType = useCallback((type: BenefitType) => {
    setBenefits((prev) => {
      if (prev.some((b) => b.type === type)) {
        return prev.filter((b) => b.type !== type);
      }
      return [...prev, createEmptyBenefit(type)];
    });
  }, []);

  const handleBenefitChange = useCallback(
    (index: number, benefit: Benefit) => {
      const newBenefits = [...benefits];
      newBenefits[index] = benefit;
      setBenefits(newBenefits);
    },
    [benefits],
  );

  const handleSelectProducts = useCallback(
    async (benefitIndex: number) => {
      const benefit = benefits[benefitIndex];
      const selectedIds = await selectProducts(benefit.productIds);
      const newBenefits = [...benefits];
      newBenefits[benefitIndex] = { ...benefit, productIds: selectedIds };
      setBenefits(newBenefits);
    },
    [benefits, selectProducts],
  );

  const handleSelectCollections = useCallback(
    async (benefitIndex: number) => {
      const benefit = benefits[benefitIndex];
      const selectedIds = await selectCollections(benefit.collectionIds);
      const newBenefits = [...benefits];
      newBenefits[benefitIndex] = { ...benefit, collectionIds: selectedIds };
      setBenefits(newBenefits);
    },
    [benefits, selectCollections],
  );

  // --- Validation ---

  const validateStep = useCallback(
    (step: number): string | null => {
      if (step === 0 && !name.trim()) {
        return "Campaign name is required";
      }
      return null;
    },
    [name],
  );

  const handleNext = useCallback(() => {
    const validationError = validateStep(currentStep);
    if (validationError) {
      setError(validationError);
      return;
    }
    setError(null);
    setCurrentStep((prev) => Math.min(prev + 1, WIZARD_STEPS.length));
  }, [currentStep, validateStep]);

  const handleBack = useCallback(() => {
    setError(null);
    setCurrentStep((prev) => Math.max(prev - 1, 0));
  }, []);

  const handleStepClick = useCallback(
    (step: number) => {
      if (step < currentStep) {
        setError(null);
        setCurrentStep(step);
      }
    },
    [currentStep],
  );

  const handleCreate = useCallback(async () => {
    try {
      setSaving(true);
      setError(null);

      await campaignsApi.create({
        name: name.trim(),
        description: description.trim() || undefined,
        status: CAMPAIGN_DEFAULTS.STATUS,
        conditions,
        benefits,
      });

      push("/campaigns");

      try {
        window.shopify?.toast?.show("Campaign created");
      } catch {
        // Fallback: toast won't show but navigation still works
      }
    } catch (err) {
      setError(
        err instanceof Error ? err.message : "Failed to create campaign",
      );
    } finally {
      setSaving(false);
    }
  }, [name, description, conditions, benefits, push]);

  const isReviewStep = currentStep === WIZARD_STEPS.length;

  // --- Step renderers ---

  const renderStepContent = () => {
    const stepInfo = WIZARD_STEPS[currentStep];

    switch (currentStep) {
      case 0:
        return (
          <Card>
            <BlockStack gap="400">
              <BlockStack gap="100">
                <Text variant="headingMd" as="h2">
                  Campaign details
                </Text>
                <Text as="p" variant="bodySm" tone="subdued">
                  {stepInfo.description}
                </Text>
              </BlockStack>
              <Divider />
              <TextField
                label="Campaign name"
                value={name}
                onChange={(value) => {
                  setName(value);
                  if (
                    error === "Campaign name is required" &&
                    value.trim()
                  ) {
                    setError(null);
                  }
                }}
                autoComplete="off"
                placeholder="e.g., VIP Holiday Rewards"
                error={
                  error === "Campaign name is required" ? error : undefined
                }
                helpText="This name is only visible to you and your team."
              />
              <TextField
                label="Description"
                value={description}
                onChange={setDescription}
                autoComplete="off"
                multiline={3}
                placeholder="Internal note — customers won't see this"
                helpText="Optional. Help your team understand this campaign's purpose."
              />
            </BlockStack>
          </Card>
        );

      case 1:
        if (useAdvancedConditions) {
          return (
            <BlockStack gap="300">
              <ConditionBuilder value={conditions} onChange={setConditions} />
              <Button
                variant="plain"
                onClick={() => setUseAdvancedConditions(false)}
              >
                Switch to simple mode
              </Button>
            </BlockStack>
          );
        }
        return (
          <Card>
            <BlockStack gap="400">
              <BlockStack gap="100">
                <Text variant="headingMd" as="h2">
                  Who should qualify?
                </Text>
                <Text as="p" variant="bodySm" tone="subdued">
                  {stepInfo.description}
                </Text>
              </BlockStack>
              <Divider />
              <SimpleConditionBuilder
                value={conditions}
                onChange={setConditions}
                onSwitchToAdvanced={() => setUseAdvancedConditions(true)}
              />
            </BlockStack>
          </Card>
        );

      case 2:
        return (
          <Card>
            <BlockStack gap="400">
              <BlockStack gap="100">
                <Text variant="headingMd" as="h2">
                  What do qualifying customers receive?
                </Text>
                <Text as="p" variant="bodySm" tone="subdued">
                  {stepInfo.description} You can select multiple.
                </Text>
              </BlockStack>
              <Divider />

              <BlockStack gap="300">
                <BenefitTypeCard
                  title="Exclusive access"
                  description="Make specific products visible only to this audience"
                  icon={ViewIcon}
                  isSelected={selectedBenefitTypes.has("visibility")}
                  onToggle={() => handleToggleBenefitType("visibility")}
                />
                <BenefitTypeCard
                  title="Automatic discount"
                  description="Apply a percentage or fixed discount at checkout"
                  icon={DiscountIcon}
                  isSelected={selectedBenefitTypes.has("discount")}
                  onToggle={() => handleToggleBenefitType("discount")}
                />
                <BenefitTypeCard
                  title="Free product"
                  description="Let customers claim a product for free"
                  icon={GiftCardIcon}
                  isSelected={selectedBenefitTypes.has("free_product")}
                  onToggle={() => handleToggleBenefitType("free_product")}
                />
              </BlockStack>

              {benefits.length > 0 && (
                <>
                  <Divider />
                  <BlockStack gap="100">
                    <Text variant="headingMd" as="h3">
                      Configure benefits
                    </Text>
                    <Text as="p" variant="bodySm" tone="subdued">
                      Set the details for each benefit you selected above.
                    </Text>
                  </BlockStack>
                  <BlockStack gap="300">
                    {benefits.map((benefit, index) => (
                      <div key={benefit.type}>
                        <BlockStack gap="200">
                          <Text as="p" variant="bodySm" fontWeight="semibold">
                            {getBenefitLabel(benefit.type)}
                          </Text>
                          <BenefitConfig
                            benefit={benefit}
                            onChange={(b) => handleBenefitChange(index, b)}
                            onSelectProducts={() =>
                              handleSelectProducts(index)
                            }
                            onSelectCollections={() =>
                              handleSelectCollections(index)
                            }
                          />
                        </BlockStack>
                      </div>
                    ))}
                  </BlockStack>
                </>
              )}
            </BlockStack>
          </Card>
        );

      default:
        return null;
    }
  };

  const renderReview = () => {
    const conditionCount = conditions.conditions.length;
    const hasConditions =
      conditionCount > 0 &&
      !(
        conditionCount === 1 &&
        "type" in conditions.conditions[0] &&
        (conditions.conditions[0] as Condition).value === ""
      );

    return (
      <Card>
        <BlockStack gap="400">
          <BlockStack gap="100">
            <Text variant="headingMd" as="h2">
              Review your campaign
            </Text>
            <Text as="p" variant="bodySm" tone="subdued">
              Check the details below before creating. Click Edit to make
              changes.
            </Text>
          </BlockStack>

          <Divider />

          {/* Details */}
          <Box
            padding="300"
            background="bg-surface-secondary"
            borderRadius="200"
          >
            <BlockStack gap="200">
              <InlineStack align="space-between" blockAlign="center">
                <Text as="p" variant="bodySm" fontWeight="semibold">
                  Details
                </Text>
                <Button
                  variant="plain"
                  size="micro"
                  onClick={() => setCurrentStep(0)}
                >
                  Edit
                </Button>
              </InlineStack>
              <Text as="p" variant="bodyMd" fontWeight="semibold">
                {name}
              </Text>
              {description && (
                <Text as="p" variant="bodySm" tone="subdued">
                  {description}
                </Text>
              )}
              <InlineStack gap="200">
                <Badge>Draft</Badge>
              </InlineStack>
            </BlockStack>
          </Box>

          {/* Audience */}
          <Box
            padding="300"
            background="bg-surface-secondary"
            borderRadius="200"
          >
            <BlockStack gap="200">
              <InlineStack align="space-between" blockAlign="center">
                <Text as="p" variant="bodySm" fontWeight="semibold">
                  Audience
                </Text>
                <Button
                  variant="plain"
                  size="micro"
                  onClick={() => setCurrentStep(1)}
                >
                  Edit
                </Button>
              </InlineStack>
              {hasConditions ? (
                <Text as="p" variant="bodySm">
                  {conditionCount} condition
                  {conditionCount > 1 ? "s" : ""} ({conditions.operator})
                </Text>
              ) : (
                <Text as="p" variant="bodySm" tone="subdued">
                  No conditions set — all customers qualify
                </Text>
              )}
            </BlockStack>
          </Box>

          {/* Benefits */}
          <Box
            padding="300"
            background="bg-surface-secondary"
            borderRadius="200"
          >
            <BlockStack gap="200">
              <InlineStack align="space-between" blockAlign="center">
                <Text as="p" variant="bodySm" fontWeight="semibold">
                  Benefits
                </Text>
                <Button
                  variant="plain"
                  size="micro"
                  onClick={() => setCurrentStep(2)}
                >
                  Edit
                </Button>
              </InlineStack>
              {benefits.length > 0 ? (
                <BlockStack gap="100">
                  {benefits.map((b) => (
                    <Text key={b.type} as="p" variant="bodySm">
                      {b.type === "visibility"
                        ? `Exclusive access to ${(b.productIds?.length ?? 0) + (b.collectionIds?.length ?? 0)} item(s)`
                        : b.type === "discount"
                          ? `${b.discount.type === "percentage" ? `${b.discount.value}%` : `$${b.discount.value}`} discount`
                          : `Free product (max ${b.maxClaimsPerCustomer} per customer)`}
                    </Text>
                  ))}
                </BlockStack>
              ) : (
                <Banner tone="warning">
                  <Text as="p" variant="bodySm">
                    No benefits configured. Customers won&apos;t receive
                    anything from this campaign.
                  </Text>
                </Banner>
              )}
            </BlockStack>
          </Box>
        </BlockStack>
      </Card>
    );
  };

  const pageTitle = isReviewStep ? "Review campaign" : "Create campaign";

  return (
    <Page
      title={pageTitle}
      backAction={{
        content: currentStep === 0 ? "Campaigns" : "Back",
        onAction:
          currentStep === 0
            ? () => push("/campaigns")
            : handleBack,
      }}
    >
      <Layout>
        <Layout.Section>
          <BlockStack gap="400">
            <WizardStepIndicator
              steps={WIZARD_STEPS}
              currentStep={
                isReviewStep ? WIZARD_STEPS.length : currentStep
              }
              onStepClick={handleStepClick}
            />

            {error && error !== "Campaign name is required" && (
              <Banner tone="critical" onDismiss={() => setError(null)}>
                {error}
              </Banner>
            )}

            {isReviewStep ? renderReview() : renderStepContent()}

            {/* Navigation buttons */}
            <InlineStack align="end" gap="300">
              {currentStep > 0 && !isReviewStep && (
                <Button onClick={handleBack}>Back</Button>
              )}
              {!isReviewStep && (
                <Button variant="primary" onClick={handleNext}>
                  {currentStep === WIZARD_STEPS.length - 1
                    ? "Review campaign"
                    : "Next"}
                </Button>
              )}
              {isReviewStep && (
                <>
                  <Button onClick={handleBack}>Back</Button>
                  <Button
                    variant="primary"
                    onClick={handleCreate}
                    loading={saving}
                  >
                    Create campaign
                  </Button>
                </>
              )}
            </InlineStack>

            {/* Full form escape hatch */}
            {!isReviewStep && (
              <Box paddingBlockStart="200">
                <InlineStack align="center">
                  <Button
                    variant="plain"
                    onClick={() => {
                      try {
                        localStorage.setItem(
                          STORAGE_KEYS.PREFER_FULL_FORM,
                          "true",
                        );
                      } catch {
                        // localStorage may not be available
                      }
                      push("/campaigns/new?mode=full");
                    }}
                  >
                    Switch to full form
                  </Button>
                </InlineStack>
              </Box>
            )}
          </BlockStack>
        </Layout.Section>

        {/* Live preview sidebar */}
        <Layout.Section variant="oneThird">
          <LivePreview
            name={name}
            description={description}
            conditions={conditions}
            benefits={benefits}
            currentStep={currentStep}
          />
        </Layout.Section>
      </Layout>
    </Page>
  );
}
