"use client";

import { useCallback } from "react";
import {
  BlockStack,
  InlineStack,
  Button,
  Select,
  TextField,
  Text,
  Box,
  Divider,
  InlineGrid,
} from "@shopify/polaris";
import { PlusIcon, DeleteIcon } from "@shopify/polaris-icons";
import type { Condition, ConditionGroup, ConditionType, ComparisonOperator } from "@/types";

interface SimpleConditionBuilderProps {
  value: ConditionGroup;
  onChange: (value: ConditionGroup) => void;
  onSwitchToAdvanced: () => void;
}

interface ConditionTemplate {
  type: ConditionType;
  label: string;
  description: string;
  defaultOperator: ComparisonOperator;
  defaultValue: string | number;
  valueType: "text" | "number";
  valuePlaceholder: string;
  valueSuffix?: string;
}

const CONDITION_TEMPLATES: ConditionTemplate[] = [
  {
    type: "customer_tag",
    label: "Customers with a specific tag",
    description: "Target customers who have a particular tag on their profile",
    defaultOperator: "equals",
    defaultValue: "",
    valueType: "text",
    valuePlaceholder: "e.g., VIP",
  },
  {
    type: "total_spent",
    label: "Customers who spent over a certain amount",
    description: "Target customers based on their total spending",
    defaultOperator: "greater_than",
    defaultValue: 100,
    valueType: "number",
    valuePlaceholder: "100",
    valueSuffix: "$",
  },
  {
    type: "order_count",
    label: "Customers with a certain number of orders",
    description: "Target customers based on how many orders they've placed",
    defaultOperator: "greater_than_or_equal",
    defaultValue: 5,
    valueType: "number",
    valuePlaceholder: "5",
  },
  {
    type: "account_age_days",
    label: "Customers with accounts older than a certain age",
    description: "Target customers based on when they created their account",
    defaultOperator: "greater_than",
    defaultValue: 30,
    valueType: "number",
    valuePlaceholder: "30",
    valueSuffix: "days",
  },
];

function getOperatorsForType(type: ConditionType): { label: string; value: ComparisonOperator }[] {
  if (type === "customer_tag") {
    return [
      { label: "is equal to", value: "equals" },
      { label: "is not equal to", value: "not_equals" },
      { label: "contains", value: "contains" },
      { label: "does not contain", value: "not_contains" },
    ];
  }
  return [
    { label: "is greater than", value: "greater_than" },
    { label: "is less than", value: "less_than" },
    { label: "is equal to", value: "equals" },
    { label: "is at least", value: "greater_than_or_equal" },
    { label: "is at most", value: "less_than_or_equal" },
  ];
}

function getTemplateForType(type: ConditionType): ConditionTemplate {
  return CONDITION_TEMPLATES.find((t) => t.type === type) ?? CONDITION_TEMPLATES[0];
}

interface SimpleConditionRowProps {
  condition: Condition;
  onChange: (condition: Condition) => void;
  onRemove: () => void;
  canRemove: boolean;
}

function SimpleConditionRow({ condition, onChange, onRemove, canRemove }: SimpleConditionRowProps) {
  const template = getTemplateForType(condition.type);
  const operators = getOperatorsForType(condition.type);

  return (
    <Box padding="300" background="bg-surface-secondary" borderRadius="200">
      <BlockStack gap="300">
        <InlineStack align="space-between" blockAlign="center">
          <Text as="p" variant="bodySm" fontWeight="semibold">
            {template.label}
          </Text>
          {canRemove && (
            <Button
              icon={DeleteIcon}
              variant="plain"
              tone="critical"
              onClick={onRemove}
              accessibilityLabel="Remove condition"
            />
          )}
        </InlineStack>

        <InlineGrid columns={{ xs: 1, md: "1fr 1fr" }} gap="300">
          <Select
            label="Operator"
            labelHidden
            options={operators}
            value={condition.operator}
            onChange={(value) =>
              onChange({ ...condition, operator: value as ComparisonOperator })
            }
          />
          <TextField
            label="Value"
            labelHidden
            value={String(condition.value)}
            onChange={(value) =>
              onChange({
                ...condition,
                value: template.valueType === "number" ? (value === "" ? 0 : Number(value)) : value,
              })
            }
            type={template.valueType}
            autoComplete="off"
            placeholder={template.valuePlaceholder}
            suffix={template.valueSuffix}
          />
        </InlineGrid>
      </BlockStack>
    </Box>
  );
}

export function SimpleConditionBuilder({
  value,
  onChange,
  onSwitchToAdvanced,
}: SimpleConditionBuilderProps) {
  // Extract only simple conditions (not nested groups) for the simple view
  const simpleConditions = value.conditions.filter(
    (item): item is Condition => "type" in item && !("conditions" in item),
  );

  const handleAddCondition = useCallback(
    (type: ConditionType) => {
      const template = getTemplateForType(type);
      const newCondition: Condition = {
        type: template.type,
        operator: template.defaultOperator,
        value: template.defaultValue,
      };
      onChange({
        ...value,
        conditions: [...value.conditions, newCondition],
      });
    },
    [value, onChange],
  );

  const handleConditionChange = useCallback(
    (index: number, condition: Condition) => {
      const newConditions = [...value.conditions];
      // Find the actual index in the full conditions array
      let simpleIndex = 0;
      for (let i = 0; i < newConditions.length; i++) {
        if ("type" in newConditions[i] && !("conditions" in newConditions[i])) {
          if (simpleIndex === index) {
            newConditions[i] = condition;
            break;
          }
          simpleIndex++;
        }
      }
      onChange({ ...value, conditions: newConditions });
    },
    [value, onChange],
  );

  const handleRemoveCondition = useCallback(
    (index: number) => {
      let simpleIndex = 0;
      const newConditions = value.conditions.filter((item) => {
        if ("type" in item && !("conditions" in item)) {
          if (simpleIndex === index) {
            simpleIndex++;
            return false;
          }
          simpleIndex++;
        }
        return true;
      });
      onChange({
        ...value,
        conditions: newConditions.length > 0
          ? newConditions
          : [{ type: "customer_tag" as ConditionType, operator: "equals" as ComparisonOperator, value: "" }],
      });
    },
    [value, onChange],
  );

  // Determine which template types are not yet added
  const usedTypes = new Set(simpleConditions.map((c) => c.type));
  const availableTemplates = CONDITION_TEMPLATES.filter((t) => !usedTypes.has(t.type));

  return (
    <BlockStack gap="400">
      <Text as="p" tone="subdued">
        Define who qualifies for this campaign.
      </Text>

      {simpleConditions.length > 0 && (
        <BlockStack gap="300">
          {simpleConditions.map((condition, index) => (
            <div key={`${condition.type}-${index}`}>
              {index > 0 && (
                <Box paddingBlockEnd="300">
                  <Text as="p" variant="bodySm" tone="subdued" alignment="center">
                    {value.operator}
                  </Text>
                </Box>
              )}
              <SimpleConditionRow
                condition={condition}
                onChange={(c) => handleConditionChange(index, c)}
                onRemove={() => handleRemoveCondition(index)}
                canRemove={simpleConditions.length > 1}
              />
            </div>
          ))}
        </BlockStack>
      )}

      {/* Add condition buttons */}
      {availableTemplates.length > 0 && (
        <>
          <Divider />
          <BlockStack gap="200">
            <Text as="p" variant="bodySm" fontWeight="semibold">
              Add a condition
            </Text>
            <BlockStack gap="100">
              {availableTemplates.map((template) => (
                <Button
                  key={template.type}
                  variant="plain"
                  textAlign="left"
                  icon={PlusIcon}
                  onClick={() => handleAddCondition(template.type)}
                >
                  {template.label}
                </Button>
              ))}
            </BlockStack>
          </BlockStack>
        </>
      )}

      <Divider />
      <Button variant="plain" onClick={onSwitchToAdvanced}>
        Need complex rules? Switch to advanced mode
      </Button>
    </BlockStack>
  );
}
