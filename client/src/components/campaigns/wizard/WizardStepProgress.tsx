"use client";

import { Box, Text } from "@shopify/polaris";

export interface WizardStepDefinition {
  id: string;
  label: string;
  shortLabel: string;
}

interface WizardStepProgressProps {
  steps: WizardStepDefinition[];
  currentStep: number;
  onStepClick: (index: number) => void;
}

export function WizardStepProgress({
  steps,
  currentStep,
  onStepClick,
}: WizardStepProgressProps) {
  return (
    <Box paddingBlockEnd="200">
      <div className="flex w-full items-center gap-0">
        {steps.map((step, index) => {
          const isCompleted = index < currentStep;
          const isCurrent = index === currentStep;
          const isClickable = index < currentStep;

          return (
            <div
              key={step.id}
              className={`flex items-center ${index < steps.length - 1 ? "flex-1" : "flex-none"}`}
            >
              {/* Step circle + label */}
              <div
                onClick={isClickable ? () => onStepClick(index) : undefined}
                onKeyDown={
                  isClickable
                    ? (e) => {
                        if (e.key === "Enter" || e.key === " ")
                          onStepClick(index);
                      }
                    : undefined
                }
                role={isClickable ? "button" : undefined}
                tabIndex={isClickable ? 0 : undefined}
                className={`flex min-w-[72px] flex-col items-center gap-[6px] ${isClickable ? "cursor-pointer" : "cursor-default"}`}
              >
                <div
                  className={`flex h-8 w-8 items-center justify-center rounded-full text-[13px] font-semibold transition-all duration-200 ease-out ${
                    isCompleted
                      ? "bg-[var(--p-color-bg-fill-success)] text-[var(--p-color-text-inverse)]"
                      : isCurrent
                        ? "bg-[var(--p-color-bg-fill-brand)] text-[var(--p-color-text-inverse)]"
                        : "bg-[var(--p-color-bg-surface-secondary)] text-[var(--p-color-text-subdued)]"
                  } ${
                    isCurrent
                      ? "border-2 border-[var(--p-color-border-brand)]"
                      : "border-2 border-transparent"
                  }`}
                >
                  {isCompleted ? (
                    <svg
                      width="14"
                      height="14"
                      viewBox="0 0 14 14"
                      fill="none"
                    >
                      <path
                        d="M11.5 3.5L5.5 10.5L2.5 7.5"
                        stroke="currentColor"
                        strokeWidth="2"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                      />
                    </svg>
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
                  {step.shortLabel}
                </Text>
              </div>

              {/* Connector line */}
              {index < steps.length - 1 && (
                <div
                  className={`mb-[22px] mx-2 h-[2px] flex-1 rounded-[1px] transition-colors duration-200 ease-out ${
                    isCompleted
                      ? "bg-[var(--p-color-border-success)]"
                      : "bg-[var(--p-color-border)]"
                  }`}
                />
              )}
            </div>
          );
        })}
      </div>
    </Box>
  );
}
