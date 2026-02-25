"use client";

import { useCallback, useState } from "react";
import {
  Card,
  BlockStack,
  InlineStack,
  Button,
  Select,
  TextField,
  Text,
  Box,
  Badge,
  Divider,
  Collapsible,
} from "@shopify/polaris";
import {
  PlusIcon,
  DeleteIcon,
  ChevronDownIcon,
  ChevronUpIcon,
} from "@shopify/polaris-icons";
import type { Benefit, BenefitType, DiscountType } from "@/types";
import { createEmptyBenefit } from "@/utils";

// =============================================================================
// Constants
// =============================================================================

const BENEFIT_TYPE_OPTIONS = [
  { label: "Exclusive product access", value: "visibility" },
  { label: "Discount", value: "discount" },
  { label: "Free product", value: "free_product" },
] as const;

const DISCOUNT_TYPE_OPTIONS = [
  { label: "Percentage off", value: "percentage" },
  { label: "Fixed amount off", value: "fixed_amount" },
] as const;

const BENEFIT_LABELS: Record<BenefitType, string> = {
  visibility: "Exclusive Access",
  discount: "Discount",
  free_product: "Free Product",
};

const BENEFIT_TONES: Record<BenefitType, "success" | "info" | "attention"> = {
  visibility: "info",
  discount: "success",
  free_product: "attention",
};

// =============================================================================
// Sub-components
// =============================================================================

interface BenefitSelectorProps {
  value: Benefit[];
  onChange: (value: Benefit[]) => void;
  onSelectProducts?: (benefitIndex: number) => void;
  onSelectCollections?: (benefitIndex: number) => void;
}

interface BenefitCardProps {
  benefit: Benefit;
  index: number;
  onChange: (benefit: Benefit) => void;
  onRemove: () => void;
  onSelectProducts: () => void;
  onSelectCollections: () => void;
}

function BenefitCard({
  benefit,
  index,
  onChange,
  onRemove,
  onSelectProducts,
  onSelectCollections,
}: BenefitCardProps) {
  const [expanded, setExpanded] = useState(true);

  const handleTypeChange = useCallback(
    (value: string) => {
      onChange(createEmptyBenefit(value as BenefitType));
    },
    [onChange],
  );

  const productCount = benefit.productIds?.length ?? 0;
  const collectionCount = benefit.collectionIds?.length ?? 0;

  return (
    <Box
      padding="400"
      background="bg-surface-secondary"
      borderRadius="200"
      borderWidth="025"
      borderColor="border"
    >
      <BlockStack gap="400">
        <InlineStack align="space-between" blockAlign="center">
          <InlineStack gap="300" blockAlign="center">
            <Badge tone={BENEFIT_TONES[benefit.type]}>
              {BENEFIT_LABELS[benefit.type]}
            </Badge>
            <Text as="span" variant="bodyMd" tone="subdued">
              Benefit {index + 1}
            </Text>
          </InlineStack>
          <InlineStack gap="200">
            <Button
              icon={expanded ? ChevronUpIcon : ChevronDownIcon}
              variant="plain"
              onClick={() => setExpanded(!expanded)}
              accessibilityLabel={expanded ? "Collapse" : "Expand"}
            />
            <Button
              icon={DeleteIcon}
              variant="plain"
              tone="critical"
              onClick={onRemove}
              accessibilityLabel="Remove benefit"
            />
          </InlineStack>
        </InlineStack>

        <Collapsible open={expanded} id={`benefit-${index}`}>
          <BlockStack gap="400">
            <Select
              label="Benefit type"
              options={[...BENEFIT_TYPE_OPTIONS]}
              value={benefit.type}
              onChange={handleTypeChange}
            />

            {benefit.type === "discount" && (
              <InlineStack gap="300">
                <div className="flex-1">
                  <Select
                    label="Discount type"
                    options={[...DISCOUNT_TYPE_OPTIONS]}
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

            <Divider />

            <BlockStack gap="200">
              <Text as="p" variant="bodyMd" fontWeight="semibold">
                Apply to products
              </Text>
              <InlineStack gap="300">
                <Button onClick={onSelectProducts} size="slim">
                  {productCount > 0
                    ? `Select products (${productCount})`
                    : "Select products"}
                </Button>
                <Button
                  onClick={onSelectCollections}
                  size="slim"
                  variant="plain"
                >
                  {collectionCount > 0
                    ? `Select collections (${collectionCount})`
                    : "Select collections"}
                </Button>
              </InlineStack>
              {productCount === 0 && collectionCount === 0 && (
                <Text as="p" tone="subdued" variant="bodySm">
                  No products selected. This benefit won&apos;t apply to
                  anything.
                </Text>
              )}
            </BlockStack>
          </BlockStack>
        </Collapsible>
      </BlockStack>
    </Box>
  );
}

// =============================================================================
// Main component
// =============================================================================

export function BenefitSelector({
  value,
  onChange,
  onSelectProducts,
  onSelectCollections,
}: BenefitSelectorProps) {
  const handleAddBenefit = useCallback(() => {
    onChange([...value, createEmptyBenefit("visibility")]);
  }, [value, onChange]);

  const handleBenefitChange = useCallback(
    (index: number, benefit: Benefit) => {
      const newBenefits = [...value];
      newBenefits[index] = benefit;
      onChange(newBenefits);
    },
    [value, onChange],
  );

  const handleRemoveBenefit = useCallback(
    (index: number) => {
      onChange(value.filter((_, i) => i !== index));
    },
    [value, onChange],
  );

  return (
    <Card>
      <BlockStack gap="400">
        <Text variant="headingMd" as="h2">
          Benefits
        </Text>
        <Text as="p" tone="subdued">
          Define what qualifying customers receive. You can add multiple benefits
          to a single campaign.
        </Text>
        <Divider />

        {value.length === 0 ? (
          <Box
            padding="400"
            background="bg-surface-secondary"
            borderRadius="200"
          >
            <BlockStack gap="200" inlineAlign="center">
              <Text as="p" tone="subdued">
                No benefits added yet.
              </Text>
              <Button icon={PlusIcon} onClick={handleAddBenefit}>
                Add benefit
              </Button>
            </BlockStack>
          </Box>
        ) : (
          <BlockStack gap="300">
            {value.map((benefit, index) => (
              <BenefitCard
                key={index}
                benefit={benefit}
                index={index}
                onChange={(b) => handleBenefitChange(index, b)}
                onRemove={() => handleRemoveBenefit(index)}
                onSelectProducts={() => onSelectProducts?.(index)}
                onSelectCollections={() => onSelectCollections?.(index)}
              />
            ))}
            <Button icon={PlusIcon} onClick={handleAddBenefit}>
              Add another benefit
            </Button>
          </BlockStack>
        )}
      </BlockStack>
    </Card>
  );
}
