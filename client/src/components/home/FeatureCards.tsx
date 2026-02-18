"use client";

import { Text, BlockStack } from "@shopify/polaris";
import { useIdTokenNavigation } from "@/hooks/useIdTokenNavigation";
import { FeatureCard } from "./FeatureCard";
import {
  EarlyAccessIllustration,
  DiscountIllustration,
  TimerSaleIllustration,
} from "./illustrations";

export function FeatureCards() {
  const { push } = useIdTokenNavigation();

  return (
    <BlockStack gap="400">
      <Text variant="headingMd" as="h2">
        What would you like to do?
      </Text>
      <div
        className="grid grid-cols-1 items-stretch gap-[var(--p-space-400)] md:grid-cols-3"
      >
        <FeatureCard
          title="Early Access"
          description="Control which customers can see specific products. Hide products from non-qualifying customers."
          illustration={<EarlyAccessIllustration />}
          gradientClassName="bg-gradient-to-br from-[#ede9fe] to-[#c4b5fd]"
          onClick={() => push("/campaigns/new/early-access")}
        />
        <FeatureCard
          title="Discounted Product"
          description="Show special pricing to qualifying customers with strikethrough pricing."
          illustration={<DiscountIllustration />}
          gradientClassName="bg-gradient-to-br from-[#dcfce7] to-[#86efac]"
          onClick={() => push("/campaigns/new/discounted-product")}
        />
        <FeatureCard
          title="Timer Sale"
          description="Run countdown sales for all or specific customers with configurable discounts."
          illustration={<TimerSaleIllustration />}
          gradientClassName="bg-gradient-to-br from-[#fef3c7] to-[#fbbf24]"
          onClick={() => push("/campaigns/new/timer-sale")}
        />
      </div>
    </BlockStack>
  );
}
