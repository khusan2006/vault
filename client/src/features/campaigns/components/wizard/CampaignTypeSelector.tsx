"use client";

import type { ReactNode } from "react";
import { Layout, BlockStack, Text, Button } from "@shopify/polaris";
import { PlusIcon } from "@shopify/polaris-icons";
import {
  EarlyAccessIllustration,
  DiscountIllustration,
  TimerSaleIllustration,
} from "@/features/dashboard/components/illustrations";
import { CAMPAIGN_TYPE_LABELS, CAMPAIGN_TYPE_DESCRIPTIONS } from "@/utils";
import type { CampaignType } from "@/types";

const TYPE_CARDS: {
  type: CampaignType;
  illustration: ReactNode;
  gradientClassName: string;
}[] = [
  {
    type: "early_access",
    illustration: <EarlyAccessIllustration />,
    gradientClassName: "bg-gradient-to-br from-[#ede9fe] to-[#c4b5fd]",
  },
  {
    type: "discounted_product",
    illustration: <DiscountIllustration />,
    gradientClassName: "bg-gradient-to-br from-[#dcfce7] to-[#86efac]",
  },
  {
    type: "timer_sale",
    illustration: <TimerSaleIllustration />,
    gradientClassName: "bg-gradient-to-br from-[#fef3c7] to-[#fbbf24]",
  },
];

interface TypeSelectorCardProps {
  type: CampaignType;
  illustration: ReactNode;
  gradientClassName: string;
  onClick: () => void;
}

function TypeSelectorCard({
  type,
  illustration,
  gradientClassName,
  onClick,
}: TypeSelectorCardProps) {
  return (
    <div
      onClick={onClick}
      onKeyDown={(e) => {
        if (e.key === "Enter" || e.key === " ") onClick();
      }}
      role="button"
      tabIndex={0}
      className="flex cursor-pointer flex-col overflow-hidden rounded-[var(--p-border-radius-300)] bg-[var(--p-color-bg-surface)] shadow-[var(--p-shadow-100)] transition-[box-shadow,transform] duration-150 ease-out hover:-translate-y-[2px] hover:shadow-[var(--p-shadow-300)]"
    >
      <div
        className={`flex h-[140px] items-center justify-center px-5 py-3 ${gradientClassName}`}
      >
        {illustration}
      </div>

      <div className="flex flex-1 flex-col gap-[var(--p-space-200)] p-[var(--p-space-400)]">
        <Text variant="headingMd" as="h3">
          {CAMPAIGN_TYPE_LABELS[type]}
        </Text>
        <Text as="p" variant="bodySm" tone="subdued">
          {CAMPAIGN_TYPE_DESCRIPTIONS[type]}
        </Text>
        <div className="mt-auto pt-[var(--p-space-200)]">
          <Button
            icon={PlusIcon}
            variant="primary"
            onClick={(event) => {
              event.stopPropagation();
              onClick();
            }}
          >
            Create campaign
          </Button>
        </div>
      </div>
    </div>
  );
}

interface CampaignTypeSelectorProps {
  onSelect: (type: CampaignType) => void;
}

export function CampaignTypeSelector({ onSelect }: CampaignTypeSelectorProps) {
  return (
    <Layout.Section>
      <BlockStack gap="400">
        <Text variant="headingMd" as="h2">
          Choose campaign type
        </Text>
        <Text as="p" tone="subdued">
          Select the type of campaign you want to create. This determines how
          products are displayed to qualifying customers.
        </Text>
        <div className="grid grid-cols-1 items-stretch gap-[var(--p-space-400)] md:grid-cols-3">
          {TYPE_CARDS.map(({ type, illustration, gradientClassName }) => (
            <TypeSelectorCard
              key={type}
              type={type}
              illustration={illustration}
              gradientClassName={gradientClassName}
              onClick={() => onSelect(type)}
            />
          ))}
        </div>
      </BlockStack>
    </Layout.Section>
  );
}
