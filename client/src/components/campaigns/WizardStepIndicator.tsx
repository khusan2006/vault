"use client";

import { InlineStack, Text, Box, Icon } from "@shopify/polaris";
import { CheckIcon } from "@shopify/polaris-icons";

interface Step {
  label: string;
}

interface WizardStepIndicatorProps {
  steps: Step[];
  currentStep: number;
  onStepClick?: (step: number) => void;
}

export function WizardStepIndicator({
  steps,
  currentStep,
  onStepClick,
}: WizardStepIndicatorProps) {
  return (
    <Box paddingBlockEnd="400">
      <InlineStack gap="200" align="center" blockAlign="center">
        {steps.map((step, index) => {
          const isCompleted = index < currentStep;
          const isCurrent = index === currentStep;
          const isClickable = isCompleted && onStepClick;

          return (
            <InlineStack key={step.label} gap="200" blockAlign="center">
              {index > 0 && (
                <Box minWidth="40px">
                  <div
                    className={`h-px w-full ${
                      isCompleted
                        ? "bg-[var(--p-color-border-success)]"
                        : "bg-[var(--p-color-border)]"
                    }`}
                  />
                </Box>
              )}

              <div
                onClick={isClickable ? () => onStepClick(index) : undefined}
                onKeyDown={
                  isClickable
                    ? (e) => {
                        if (e.key === "Enter" || e.key === " ") onStepClick!(index);
                      }
                    : undefined
                }
                role={isClickable ? "button" : undefined}
                tabIndex={isClickable ? 0 : undefined}
                className={isClickable ? "cursor-pointer" : "cursor-default"}
              >
                <InlineStack gap="200" blockAlign="center">
                  <div
                    className={`flex h-7 w-7 items-center justify-center rounded-full text-xs font-semibold transition-all duration-200 ease-out ${
                      isCompleted
                        ? "bg-[var(--p-color-bg-fill-success)] text-[var(--p-color-text-inverse)]"
                        : isCurrent
                          ? "bg-[var(--p-color-bg-fill-brand)] text-[var(--p-color-text-inverse)]"
                          : "bg-[var(--p-color-bg-surface-secondary)] text-[var(--p-color-text-subdued)]"
                    }`}
                  >
                    {isCompleted ? (
                      <Icon source={CheckIcon} />
                    ) : (
                      index + 1
                    )}
                  </div>
                  <Text
                    as="span"
                    variant="bodySm"
                    fontWeight={isCurrent ? "semibold" : "regular"}
                    tone={!isCurrent && !isCompleted ? "subdued" : undefined}
                  >
                    {step.label}
                  </Text>
                </InlineStack>
              </div>
            </InlineStack>
          );
        })}
      </InlineStack>
    </Box>
  );
}
