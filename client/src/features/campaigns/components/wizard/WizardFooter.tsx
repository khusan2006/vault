"use client";

import { Box, InlineStack, Button } from "@shopify/polaris";
import { ArrowLeftIcon, ArrowRightIcon } from "@shopify/polaris-icons";

interface WizardFooterProps {
  showBack: boolean;
  onBack: () => void;
  showNext: boolean;
  onNext: () => void;
  nextDisabled?: boolean;
  nextLabel?: string;
  backLabel?: string;
}

export function WizardFooter({
  showBack,
  onBack,
  showNext,
  onNext,
  nextDisabled = false,
  nextLabel = "Continue",
  backLabel = "Back",
}: WizardFooterProps) {
  return (
    <Box
      paddingBlockStart="200"
      paddingBlockEnd="800"
      borderBlockStartWidth="025"
      borderColor="border"
    >
      <Box paddingBlockStart="400">
        <InlineStack align="space-between">
          <div>
            {showBack && (
              <Button icon={ArrowLeftIcon} onClick={onBack}>
                {backLabel}
              </Button>
            )}
          </div>
          {showNext && (
            <Button
              variant="primary"
              icon={ArrowRightIcon}
              onClick={onNext}
              disabled={nextDisabled}
            >
              {nextLabel}
            </Button>
          )}
        </InlineStack>
      </Box>
    </Box>
  );
}
