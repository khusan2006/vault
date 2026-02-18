"use client";

import { Text, BlockStack } from "@shopify/polaris";
import { NoteIcon, ChatIcon, StarIcon } from "@shopify/polaris-icons";
import { EXTERNAL_URLS } from "@/constants";
import { HelpCard } from "./HelpCard";

export function ResourcesSection() {
  return (
    <BlockStack gap="400">
      <Text variant="headingMd" as="h2">
        Resources
      </Text>
      <div
        className="grid grid-cols-1 items-stretch gap-[var(--p-space-400)] md:grid-cols-3"
      >
        <HelpCard
          icon={NoteIcon}
          title="Read our docs"
          description="Learn how to set up campaigns, conditions, and benefits."
          linkLabel="View documentation"
          linkUrl={EXTERNAL_URLS.DOCUMENTATION}
          iconColor="#ede9fe"
        />
        <HelpCard
          icon={ChatIcon}
          title="Get support"
          description="Have a question or need help? Our team is here for you."
          linkLabel="Contact us"
          linkUrl={EXTERNAL_URLS.SUPPORT_EMAIL}
          iconColor="#dbeafe"
        />
        <HelpCard
          icon={StarIcon}
          title="Rate us"
          description="Enjoying The Vault? Leave us a review on the Shopify App Store."
          linkLabel="Write a review"
          linkUrl={EXTERNAL_URLS.APP_STORE_LISTING}
          iconColor="#fef3c7"
        />
      </div>
    </BlockStack>
  );
}
