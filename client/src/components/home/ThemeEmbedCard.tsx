"use client";

import { Card, Text, InlineStack, Button, Badge, Icon } from "@shopify/polaris";
import { ExternalIcon, ThemeIcon } from "@shopify/polaris-icons";
import { EXTERNAL_URLS } from "@/constants";

interface ThemeEmbedCardProps {
  isEnabled: boolean;
}

/**
 * Displays the current theme app embed activation status
 * with a link to the Shopify theme editor.
 */
export function ThemeEmbedCard({ isEnabled }: ThemeEmbedCardProps) {
  return (
    <Card>
      <InlineStack
        align="space-between"
        blockAlign="center"
        wrap={false}
      >
        <InlineStack gap="300" blockAlign="center" wrap={false}>
          <Icon source={ThemeIcon} tone="base" />
          <Text variant="bodyMd" fontWeight="semibold" as="p">
            Theme store app embed
          </Text>
          <Badge tone={isEnabled ? "success" : "new"}>
            {isEnabled ? "On" : "Off"}
          </Badge>
        </InlineStack>
        <Button
          icon={ExternalIcon}
          onClick={() => window.open(EXTERNAL_URLS.THEME_EDITOR, "_blank")}
        >
          App embed settings
        </Button>
      </InlineStack>
    </Card>
  );
}
