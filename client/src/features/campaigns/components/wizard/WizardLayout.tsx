"use client";

import { Page, BlockStack, Banner } from "@shopify/polaris";
import { WizardStepProgress } from "./WizardStepProgress";
import type { WizardStepDefinition } from "./WizardStepProgress";
import { WizardFooter } from "./WizardFooter";

interface WizardLayoutProps {
  title: string;
  steps: WizardStepDefinition[];
  currentStep: number;
  error?: string | null;
  onClearError: () => void;
  onStepClick: (index: number) => void;
  backAction: {
    label: string;
    onAction: () => void;
  };
  footer: {
    showBack: boolean;
    onBack: () => void;
    showNext: boolean;
    onNext: () => void;
    nextDisabled?: boolean;
  };
  children: React.ReactNode;
}

export function WizardLayout({
  title,
  steps,
  currentStep,
  error,
  onClearError,
  onStepClick,
  backAction,
  footer,
  children,
}: WizardLayoutProps) {
  return (
    <Page
      title={title}
      backAction={{
        content: backAction.label,
        onAction: backAction.onAction,
      }}
    >
      <BlockStack gap="600">
        <WizardStepProgress
          steps={steps}
          currentStep={currentStep}
          onStepClick={onStepClick}
        />

        {error && (
          <Banner tone="critical" onDismiss={onClearError}>
            {error}
          </Banner>
        )}

        {children}

        <WizardFooter
          showBack={footer.showBack}
          onBack={footer.onBack}
          showNext={footer.showNext}
          onNext={footer.onNext}
          nextDisabled={footer.nextDisabled}
        />
      </BlockStack>
    </Page>
  );
}
