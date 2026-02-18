"use client";

import { useCallback } from "react";
import {
  Card,
  BlockStack,
  InlineStack,
  Button,
  Select,
  TextField,
  Text,
  Box,
  InlineGrid,
  Divider,
} from "@shopify/polaris";
import { PlusIcon, DeleteIcon } from "@shopify/polaris-icons";
import type {
  ConditionGroup,
  Condition,
  ConditionOperator,
  ConditionType,
  ComparisonOperator,
} from "@/types";

interface ConditionBuilderProps {
  value: ConditionGroup;
  onChange: (value: ConditionGroup) => void;
}

const conditionTypeOptions = [
  { label: "Customer tag", value: "customer_tag" },
  { label: "Account age (days)", value: "account_age_days" },
  { label: "Total spent", value: "total_spent" },
  { label: "Order count", value: "order_count" },
];

const comparisonOperatorOptions: Record<ConditionType, { label: string; value: ComparisonOperator }[]> = {
  customer_tag: [
    { label: "equals", value: "equals" },
    { label: "not equals", value: "not_equals" },
    { label: "contains", value: "contains" },
    { label: "not contains", value: "not_contains" },
  ],
  account_age_days: [
    { label: "greater than", value: "greater_than" },
    { label: "less than", value: "less_than" },
    { label: "equals", value: "equals" },
    { label: "greater than or equal", value: "greater_than_or_equal" },
    { label: "less than or equal", value: "less_than_or_equal" },
  ],
  total_spent: [
    { label: "greater than", value: "greater_than" },
    { label: "less than", value: "less_than" },
    { label: "equals", value: "equals" },
    { label: "greater than or equal", value: "greater_than_or_equal" },
    { label: "less than or equal", value: "less_than_or_equal" },
  ],
  order_count: [
    { label: "greater than", value: "greater_than" },
    { label: "less than", value: "less_than" },
    { label: "equals", value: "equals" },
    { label: "greater than or equal", value: "greater_than_or_equal" },
    { label: "less than or equal", value: "less_than_or_equal" },
  ],
};

function isConditionGroup(item: Condition | ConditionGroup): item is ConditionGroup {
  return "conditions" in item && "operator" in item && Array.isArray((item as ConditionGroup).conditions);
}

function createEmptyCondition(): Condition {
  return {
    type: "customer_tag",
    operator: "equals",
    value: "",
  };
}

function createEmptyGroup(): ConditionGroup {
  return {
    operator: "AND",
    conditions: [createEmptyCondition()],
  };
}

interface ConditionRowProps {
  condition: Condition;
  onChange: (condition: Condition) => void;
  onRemove: () => void;
  canRemove: boolean;
}

function ConditionRow({ condition, onChange, onRemove, canRemove }: ConditionRowProps) {
  const handleTypeChange = useCallback(
    (value: string) => {
      const newType = value as ConditionType;
      const operators = comparisonOperatorOptions[newType];
      onChange({
        ...condition,
        type: newType,
        operator: operators[0].value,
        value: newType === "customer_tag" ? "" : 0,
      });
    },
    [condition, onChange]
  );

  const handleOperatorChange = useCallback(
    (value: string) => {
      onChange({
        ...condition,
        operator: value as ComparisonOperator,
      });
    },
    [condition, onChange]
  );

  const handleValueChange = useCallback(
    (value: string) => {
      const isNumeric = condition.type !== "customer_tag";
      onChange({
        ...condition,
        value: isNumeric ? (value === "" ? 0 : Number(value)) : value,
      });
    },
    [condition, onChange]
  );

  const operators = comparisonOperatorOptions[condition.type];
  const isNumeric = condition.type !== "customer_tag";

  return (
    <InlineGrid columns={{ xs: 1, md: "1fr 1fr 1fr auto" }} gap="300" alignItems="end">
      <Select
        label="Attribute"
        labelHidden
        options={conditionTypeOptions}
        value={condition.type}
        onChange={handleTypeChange}
      />
      <Select
        label="Operator"
        labelHidden
        options={operators}
        value={condition.operator}
        onChange={handleOperatorChange}
      />
      <TextField
        label="Value"
        labelHidden
        value={String(condition.value)}
        onChange={handleValueChange}
        type={isNumeric ? "number" : "text"}
        autoComplete="off"
        placeholder={isNumeric ? "0" : "Enter value..."}
      />
      <Button
        icon={DeleteIcon}
        variant="plain"
        tone="critical"
        onClick={onRemove}
        disabled={!canRemove}
        accessibilityLabel="Remove condition"
      />
    </InlineGrid>
  );
}

interface ConditionGroupEditorProps {
  group: ConditionGroup;
  onChange: (group: ConditionGroup) => void;
  onRemove?: () => void;
  depth?: number;
}

function ConditionGroupEditor({ group, onChange, onRemove, depth = 0 }: ConditionGroupEditorProps) {
  const handleOperatorChange = useCallback(
    (value: string) => {
      onChange({
        ...group,
        operator: value as ConditionOperator,
      });
    },
    [group, onChange]
  );

  const handleConditionChange = useCallback(
    (index: number, item: Condition | ConditionGroup) => {
      const newConditions = [...group.conditions];
      newConditions[index] = item;
      onChange({
        ...group,
        conditions: newConditions,
      });
    },
    [group, onChange]
  );

  const handleRemoveCondition = useCallback(
    (index: number) => {
      const newConditions = group.conditions.filter((_, i) => i !== index);
      onChange({
        ...group,
        conditions: newConditions.length > 0 ? newConditions : [createEmptyCondition()],
      });
    },
    [group, onChange]
  );

  const handleAddCondition = useCallback(() => {
    onChange({
      ...group,
      conditions: [...group.conditions, createEmptyCondition()],
    });
  }, [group, onChange]);

  const handleAddGroup = useCallback(() => {
    onChange({
      ...group,
      conditions: [...group.conditions, createEmptyGroup()],
    });
  }, [group, onChange]);

  const canRemoveItem = group.conditions.length > 1;

  return (
    <Box
      padding="400"
      background={depth > 0 ? "bg-surface-secondary" : undefined}
      borderRadius="200"
      borderWidth={depth > 0 ? "025" : undefined}
      borderColor="border"
    >
      <BlockStack gap="400">
        <InlineStack align="space-between" blockAlign="center">
          <InlineStack gap="200" blockAlign="center">
            <Text as="span" variant="bodyMd" fontWeight="semibold">
              Match
            </Text>
            <div className="w-[100px]">
              <Select
                label="Operator"
                labelHidden
                options={[
                  { label: "ALL", value: "AND" },
                  { label: "ANY", value: "OR" },
                ]}
                value={group.operator}
                onChange={handleOperatorChange}
              />
            </div>
            <Text as="span" variant="bodyMd" fontWeight="semibold">
              of the following conditions
            </Text>
          </InlineStack>
          {onRemove && (
            <Button
              icon={DeleteIcon}
              variant="plain"
              tone="critical"
              onClick={onRemove}
              accessibilityLabel="Remove group"
            />
          )}
        </InlineStack>

        <BlockStack gap="300">
          {group.conditions.map((item, index) => (
            <div key={index}>
              {isConditionGroup(item) ? (
                <ConditionGroupEditor
                  group={item}
                  onChange={(newGroup) => handleConditionChange(index, newGroup)}
                  onRemove={() => handleRemoveCondition(index)}
                  depth={depth + 1}
                />
              ) : (
                <ConditionRow
                  condition={item}
                  onChange={(newCondition) => handleConditionChange(index, newCondition)}
                  onRemove={() => handleRemoveCondition(index)}
                  canRemove={canRemoveItem}
                />
              )}
              {index < group.conditions.length - 1 && (
                <Box paddingBlock="200">
                  <Text as="span" variant="bodySm" tone="subdued">
                    {group.operator}
                  </Text>
                </Box>
              )}
            </div>
          ))}
        </BlockStack>

        <InlineStack gap="200">
          <Button size="slim" icon={PlusIcon} onClick={handleAddCondition}>
            Add condition
          </Button>
          {depth < 2 && (
            <Button size="slim" variant="plain" onClick={handleAddGroup}>
              Add group
            </Button>
          )}
        </InlineStack>
      </BlockStack>
    </Box>
  );
}

export function ConditionBuilder({ value, onChange }: ConditionBuilderProps) {
  return (
    <Card>
      <BlockStack gap="400">
        <Text variant="headingMd" as="h2">
          Conditions
        </Text>
        <Text as="p" tone="subdued">
          Define who qualifies for this campaign. Customers must meet these conditions to receive benefits.
        </Text>
        <Divider />
        <ConditionGroupEditor group={value} onChange={onChange} />
      </BlockStack>
    </Card>
  );
}
