"use client";

import { useState } from "react";
import {
  Card,
  Text,
  BlockStack,
  InlineStack,
  Button,
  Box,
  ProgressBar,
  Collapsible,
  Popover,
  ActionList,
} from "@shopify/polaris";
import {
  ChevronUpIcon,
  ChevronDownIcon,
  MenuHorizontalIcon,
} from "@shopify/polaris-icons";
import type { SetupTask } from "@/types";
import { StepCircle } from "./StepCircle";

interface SetupGuideProps {
  tasks: SetupTask[];
  onNavigate: (url: string, external?: boolean) => void;
  onDismiss: () => void;
}


export function SetupGuide({ tasks, onNavigate, onDismiss }: SetupGuideProps) {
  const completedCount = tasks.filter((t) => t.completed).length;
  const totalCount = tasks.length;
  const progress = totalCount > 0 ? (completedCount / totalCount) * 100 : 0;

  const firstIncompleteIndex = tasks.findIndex((t) => !t.completed);
  const [expandedTask, setExpandedTask] = useState<string | null>(
    firstIncompleteIndex >= 0 ? tasks[firstIncompleteIndex].id : null,
  );
  const [collapsed, setCollapsed] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);

  return (
    <Card>
      <BlockStack gap="400">
        {/* Header */}
        <InlineStack align="space-between" blockAlign="start" wrap={false}>
          <BlockStack gap="100">
            <Text variant="headingMd" as="h2">
              Quick guide
            </Text>
            <Text as="p" variant="bodySm" tone="subdued">
              Use this guide to quickly set up your campaigns
            </Text>
          </BlockStack>
          <InlineStack gap="100" blockAlign="center">
            <Popover
              active={menuOpen}
              activator={
                <Button
                  icon={MenuHorizontalIcon}
                  variant="tertiary"
                  onClick={() => setMenuOpen((v) => !v)}
                  accessibilityLabel="Guide options"
                />
              }
              onClose={() => setMenuOpen(false)}
              preferredAlignment="right"
            >
              <ActionList
                items={[
                  {
                    content: "Dismiss guide",
                    onAction: () => {
                      setMenuOpen(false);
                      onDismiss();
                    },
                  },
                ]}
              />
            </Popover>
            <Button
              icon={collapsed ? ChevronDownIcon : ChevronUpIcon}
              variant="tertiary"
              onClick={() => setCollapsed((v) => !v)}
              accessibilityLabel={
                collapsed ? "Expand guide" : "Collapse guide"
              }
            />
          </InlineStack>
        </InlineStack>

        {/* Progress */}
        <BlockStack gap="200">
          <Text as="p" variant="bodySm" tone="subdued">
            {completedCount} of {totalCount} tasks completed
          </Text>
          <ProgressBar progress={progress} tone="primary" size="small" />
        </BlockStack>

        {/* Tasks (collapsible) */}
        <Collapsible open={!collapsed} id="setup-guide-tasks">
          <BlockStack gap="0">
            {tasks.map((task) => {
              const isExpanded = expandedTask === task.id;
              const isIncomplete = !task.completed;

              return (
                <div key={task.id}>
                  <div
                    onClick={() =>
                      setExpandedTask(isExpanded ? null : task.id)
                    }
                    onKeyDown={(e) => {
                      if (e.key === "Enter" || e.key === " ") {
                        e.preventDefault();
                        setExpandedTask(isExpanded ? null : task.id);
                      }
                    }}
                    role="button"
                    tabIndex={0}
                    className={`cursor-pointer rounded-[var(--p-border-radius-200)] px-2 py-3 transition-colors duration-150 ease-out ${
                      isExpanded && isIncomplete
                        ? "bg-[var(--p-color-bg-surface-secondary)]"
                        : "bg-transparent"
                    }`}
                  >
                    <InlineStack gap="300" blockAlign="start" wrap={false}>
                      <StepCircle completed={task.completed} />
                      <BlockStack gap="0">
                        <Text
                          as="p"
                          variant="bodyMd"
                          fontWeight={
                            isExpanded && isIncomplete ? "semibold" : "medium"
                          }
                        >
                          {task.title}
                        </Text>

                        <Collapsible
                          open={isExpanded}
                          id={`setup-task-${task.id}`}
                        >
                          <Box paddingBlockStart="200">
                            <BlockStack gap="300">
                              <Text as="p" variant="bodySm" tone="subdued">
                                {task.description}
                              </Text>
                              {isIncomplete && task.action && (
                                <div
                                  onClick={(e) => e.stopPropagation()}
                                  onKeyDown={(e) => e.stopPropagation()}
                                  role="presentation"
                                >
                                  <InlineStack gap="300" blockAlign="center">
                                    <Button
                                      size="slim"
                                      variant="primary"
                                      onClick={() =>
                                        onNavigate(
                                          task.action!.url,
                                          task.action!.external,
                                        )
                                      }
                                    >
                                      {task.action.label}
                                    </Button>
                                    {task.secondaryAction && (
                                      <Button
                                        size="slim"
                                        variant="plain"
                                        onClick={task.secondaryAction.onAction}
                                      >
                                        {task.secondaryAction.label}
                                      </Button>
                                    )}
                                  </InlineStack>
                                </div>
                              )}
                            </BlockStack>
                          </Box>
                        </Collapsible>
                      </BlockStack>
                    </InlineStack>
                  </div>
                </div>
              );
            })}
          </BlockStack>
        </Collapsible>
      </BlockStack>
    </Card>
  );
}
