"use client";

import { useCallback, useState } from "react";
import {
  BlockStack,
  InlineStack,
  InlineGrid,
  Button,
  Select,
  TextField,
  Text,
  Box,
  Modal,
  Divider,
} from "@shopify/polaris";
import { PlusIcon, DeleteIcon } from "@shopify/polaris-icons";
import type {
  Condition,
  ConditionGroup,
  ConditionType,
  ConditionOperator,
  ComparisonOperator,
} from "@/types";

// =============================================================================
// Constants
// =============================================================================

/** Maximum nesting depth for rule groups (0 = root, 1 = one level deep) */
const MAX_NESTING_DEPTH = 1;

// =============================================================================
// Rule templates
// =============================================================================

interface RuleTemplate {
  type: ConditionType;
  label: string;
  description: string;
  icon: string;
  defaultOperator: ComparisonOperator;
  defaultValue: string | number;
  valueType: "text" | "number";
  valuePlaceholder: string;
  valueSuffix?: string;
}

const RULE_TEMPLATES: RuleTemplate[] = [
  {
    type: "customer_tag",
    label: "Customer tag",
    description:
      "Target customers who have a specific tag on their profile, e.g. VIP, wholesale, or loyalty.",
    icon: "🏷️",
    defaultOperator: "equals",
    defaultValue: "",
    valueType: "text",
    valuePlaceholder: "e.g., VIP",
  },
  {
    type: "total_spent",
    label: "Total amount spent",
    description:
      "Target customers based on how much they've spent at your store over their lifetime.",
    icon: "💰",
    defaultOperator: "greater_than",
    defaultValue: 100,
    valueType: "number",
    valuePlaceholder: "100",
    valueSuffix: "$",
  },
  {
    type: "order_count",
    label: "Number of orders",
    description:
      "Target customers based on how many orders they've placed. Great for rewarding repeat buyers.",
    icon: "📦",
    defaultOperator: "greater_than_or_equal",
    defaultValue: 5,
    valueType: "number",
    valuePlaceholder: "5",
  },
  {
    type: "account_age_days",
    label: "Account age",
    description:
      "Target customers based on how long they've had an account. Reward long-time customers.",
    icon: "📅",
    defaultOperator: "greater_than",
    defaultValue: 30,
    valueType: "number",
    valuePlaceholder: "30",
    valueSuffix: "days",
  },
];

function getTemplateForType(type: ConditionType): RuleTemplate {
  return RULE_TEMPLATES.find((t) => t.type === type) ?? RULE_TEMPLATES[0];
}

function getOperatorsForType(
  type: ConditionType,
): { label: string; value: ComparisonOperator }[] {
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

// =============================================================================
// Type guards
// =============================================================================

function isConditionGroup(
  item: Condition | ConditionGroup,
): item is ConditionGroup {
  return "conditions" in item && Array.isArray((item as ConditionGroup).conditions);
}

// =============================================================================
// Types
// =============================================================================

interface RuleBuilderProps {
  value: ConditionGroup;
  onChange: (value: ConditionGroup) => void;
}

// =============================================================================
// Rule row component
// =============================================================================

function RuleRow({
  condition,
  onChange,
  onRemove,
}: {
  condition: Condition;
  onChange: (condition: Condition) => void;
  onRemove: () => void;
}) {
  const template = getTemplateForType(condition.type);
  const operators = getOperatorsForType(condition.type);

  return (
    <Box
      padding="400"
      background="bg-surface-secondary"
      borderRadius="300"
    >
      <BlockStack gap="300">
        <InlineStack align="space-between" blockAlign="center">
          <InlineStack gap="200" blockAlign="center">
            <Text as="span" variant="bodyMd">
              {template.icon}
            </Text>
            <Text as="p" variant="bodyMd" fontWeight="semibold">
              {template.label}
            </Text>
          </InlineStack>
          <Button
            icon={DeleteIcon}
            variant="plain"
            tone="critical"
            onClick={onRemove}
            accessibilityLabel={`Remove ${template.label} rule`}
          />
        </InlineStack>

        <InlineGrid columns={{ xs: 1, md: "1fr 1fr" }} gap="300">
          <Select
            label="Operator"
            labelHidden
            options={operators}
            value={condition.operator}
            onChange={(val) =>
              onChange({
                ...condition,
                operator: val as ComparisonOperator,
              })
            }
          />
          <TextField
            label="Value"
            labelHidden
            value={String(condition.value)}
            onChange={(val) =>
              onChange({
                ...condition,
                value:
                  template.valueType === "number"
                    ? val === ""
                      ? 0
                      : Number(val)
                    : val,
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

// =============================================================================
// AND/OR toggle
// =============================================================================

function LogicToggle({
  value,
  onChange,
}: {
  value: ConditionOperator;
  onChange: (value: ConditionOperator) => void;
}) {
  return (
    <InlineStack align="center" blockAlign="center">
      <div
        className="inline-flex overflow-hidden rounded-[var(--p-border-radius-200)] border border-[var(--p-color-border)]"
      >
        <button
          type="button"
          onClick={() => onChange("AND")}
          className={`cursor-pointer border-none px-4 py-1 text-[13px] font-semibold transition-all duration-150 ease-out ${
            value === "AND"
              ? "bg-[var(--p-color-bg-fill-brand)] text-[var(--p-color-text-inverse)]"
              : "bg-[var(--p-color-bg-surface)] text-[var(--p-color-text-subdued)]"
          }`}
        >
          AND
        </button>
        <button
          type="button"
          onClick={() => onChange("OR")}
          className={`cursor-pointer border-none border-l border-l-[var(--p-color-border)] px-4 py-1 text-[13px] font-semibold transition-all duration-150 ease-out ${
            value === "OR"
              ? "bg-[var(--p-color-bg-fill-brand)] text-[var(--p-color-text-inverse)]"
              : "bg-[var(--p-color-bg-surface)] text-[var(--p-color-text-subdued)]"
          }`}
        >
          OR
        </button>
      </div>
    </InlineStack>
  );
}

// =============================================================================
// Rule picker modal item
// =============================================================================

function RulePickerItem({
  template,
  onSelect,
}: {
  template: RuleTemplate;
  onSelect: () => void;
}) {
  return (
    <div
      onClick={onSelect}
      onKeyDown={(e) => {
        if (e.key === "Enter" || e.key === " ") {
          e.preventDefault();
          onSelect();
        }
      }}
      role="button"
      tabIndex={0}
      className="flex cursor-pointer items-center gap-[var(--p-space-300)] rounded-[var(--p-border-radius-200)] bg-transparent px-[var(--p-space-400)] py-[var(--p-space-300)] transition-colors duration-150 ease-out hover:bg-[var(--p-color-bg-surface-hover)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--p-color-border-brand)]"
    >
      <div
        className="flex h-10 w-10 shrink-0 items-center justify-center rounded-[var(--p-border-radius-200)] bg-[var(--p-color-bg-surface-secondary)] text-xl"
      >
        {template.icon}
      </div>
      <BlockStack gap="050">
        <Text as="span" variant="bodyMd" fontWeight="semibold">
          {template.label}
        </Text>
        <Text as="p" variant="bodySm" tone="subdued">
          {template.description}
        </Text>
      </BlockStack>
    </div>
  );
}

// =============================================================================
// Rule group component (recursive)
// =============================================================================

function RuleGroup({
  group,
  onChange,
  onRemove,
  depth,
  onOpenModal,
}: {
  group: ConditionGroup;
  onChange: (group: ConditionGroup) => void;
  onRemove?: () => void;
  depth: number;
  onOpenModal: (onAdd: (type: ConditionType) => void) => void;
}) {
  const isNested = depth > 0;
  const canNest = depth < MAX_NESTING_DEPTH;

  // ---------------------------------------------------------------------------
  // Handlers
  // ---------------------------------------------------------------------------

  const handleOperatorChange = useCallback(
    (operator: ConditionOperator) => {
      onChange({ ...group, operator });
    },
    [group, onChange],
  );

  const handleItemChange = useCallback(
    (index: number, item: Condition | ConditionGroup) => {
      const newConditions = [...group.conditions];
      newConditions[index] = item;
      onChange({ ...group, conditions: newConditions });
    },
    [group, onChange],
  );

  const handleItemRemove = useCallback(
    (index: number) => {
      const newConditions = group.conditions.filter((_, i) => i !== index);
      onChange({ ...group, conditions: newConditions });
    },
    [group, onChange],
  );

  const handleAddRule = useCallback(
    (type: ConditionType) => {
      const template = getTemplateForType(type);
      const newCondition: Condition = {
        type: template.type,
        operator: template.defaultOperator,
        value: template.defaultValue,
      };
      onChange({
        ...group,
        conditions: [...group.conditions, newCondition],
      });
    },
    [group, onChange],
  );

  const handleAddGroup = useCallback(() => {
    const newGroup: ConditionGroup = {
      operator: group.operator === "AND" ? "OR" : "AND",
      conditions: [],
    };
    onChange({
      ...group,
      conditions: [...group.conditions, newGroup],
    });
  }, [group, onChange]);

  // ---------------------------------------------------------------------------
  // Render
  // ---------------------------------------------------------------------------

  const hasItems = group.conditions.length > 0;

  const content = (
    <BlockStack gap="300">
      {/* Items list */}
      {hasItems ? (
        <BlockStack gap="200">
          {group.conditions.map((item, index) => (
            <div key={index}>
              {/* AND/OR connector between items */}
              {index > 0 && (
                <Box paddingBlockEnd="200" paddingBlockStart="100">
                  <LogicToggle
                    value={group.operator}
                    onChange={handleOperatorChange}
                  />
                </Box>
              )}

              {isConditionGroup(item) ? (
                <RuleGroup
                  group={item}
                  onChange={(g) => handleItemChange(index, g)}
                  onRemove={() => handleItemRemove(index)}
                  depth={depth + 1}
                  onOpenModal={onOpenModal}
                />
              ) : (
                <RuleRow
                  condition={item}
                  onChange={(c) => handleItemChange(index, c)}
                  onRemove={() => handleItemRemove(index)}
                />
              )}
            </div>
          ))}
        </BlockStack>
      ) : (
        <Box paddingBlock="400">
          <BlockStack gap="200" inlineAlign="center">
            <Text as="p" variant="bodyMd" tone="subdued" alignment="center">
              {isNested
                ? "Empty group. Add rules to this group."
                : "No rules added yet. Add a rule to control who gets early access."}
            </Text>
          </BlockStack>
        </Box>
      )}

      {/* Action buttons */}
      <Box paddingBlockStart="100">
        <InlineStack gap="200">
          <Button
            icon={PlusIcon}
            onClick={() => onOpenModal(handleAddRule)}
          >
            Add rule
          </Button>
          {canNest && (
            <Button onClick={handleAddGroup}>
              + Add group
            </Button>
          )}
        </InlineStack>
      </Box>
    </BlockStack>
  );

  // Nested groups get a visual container
  if (isNested) {
    return (
      <div
        className="relative rounded-[var(--p-border-radius-300)] border-l-[3px] border-l-[var(--p-color-border-brand)] bg-[var(--p-color-bg-surface)] p-[var(--p-space-400)]"
      >
        <BlockStack gap="300">
          {/* Group header */}
          <InlineStack align="space-between" blockAlign="center">
            <InlineStack gap="200" blockAlign="center">
              <Text as="span" variant="bodySm" fontWeight="semibold">
                Rule group
              </Text>
              <Text as="span" variant="bodySm" tone="subdued">
                — match {group.operator === "AND" ? "all" : "any"} of below
              </Text>
            </InlineStack>
            {onRemove && (
              <Button
                icon={DeleteIcon}
                variant="plain"
                tone="critical"
                onClick={onRemove}
                accessibilityLabel="Remove rule group"
              />
            )}
          </InlineStack>

          <Divider />

          {content}
        </BlockStack>
      </div>
    );
  }

  return content;
}

// =============================================================================
// Main component
// =============================================================================

export function RuleBuilder({ value, onChange }: RuleBuilderProps) {
  const [modalOpen, setModalOpen] = useState(false);
  const [pendingAddCallback, setPendingAddCallback] = useState<
    ((type: ConditionType) => void) | null
  >(null);

  // ---------------------------------------------------------------------------
  // Modal handling
  // ---------------------------------------------------------------------------

  const handleOpenModal = useCallback(
    (onAdd: (type: ConditionType) => void) => {
      setPendingAddCallback(() => onAdd);
      setModalOpen(true);
    },
    [],
  );

  const handleSelectRuleType = useCallback(
    (type: ConditionType) => {
      if (pendingAddCallback) {
        pendingAddCallback(type);
      }
      setModalOpen(false);
      setPendingAddCallback(null);
    },
    [pendingAddCallback],
  );

  const handleCloseModal = useCallback(() => {
    setModalOpen(false);
    setPendingAddCallback(null);
  }, []);

  // ---------------------------------------------------------------------------
  // Render
  // ---------------------------------------------------------------------------

  return (
    <>
      <RuleGroup
        group={value}
        onChange={onChange}
        depth={0}
        onOpenModal={handleOpenModal}
      />

      {/* Rule picker modal */}
      <Modal
        open={modalOpen}
        onClose={handleCloseModal}
        title="Add a customer rule"
      >
        <Modal.Section>
          <BlockStack gap="100">
            <Text as="p" variant="bodySm" tone="subdued">
              Choose which type of rule to add. You can add the same rule
              type multiple times with different values.
            </Text>

            <Box paddingBlockStart="200">
              <BlockStack gap="100">
                {RULE_TEMPLATES.map((template) => (
                  <RulePickerItem
                    key={template.type}
                    template={template}
                    onSelect={() => handleSelectRuleType(template.type)}
                  />
                ))}
              </BlockStack>
            </Box>
          </BlockStack>
        </Modal.Section>
      </Modal>
    </>
  );
}
