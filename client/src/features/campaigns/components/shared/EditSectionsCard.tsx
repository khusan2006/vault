"use client";

import { Card, Box, BlockStack, Text, Tabs } from "@shopify/polaris";

export interface EditSectionsTab {
  id: string;
  content: string;
  badge?: string;
}

interface EditSectionsCardProps {
  title: string;
  description: string;
  tabs: EditSectionsTab[];
  selectedTab: number;
  onSelectTab: (tabIndex: number) => void;
  children: React.ReactNode;
}

export function EditSectionsCard({
  title,
  description,
  tabs,
  selectedTab,
  onSelectTab,
  children,
}: EditSectionsCardProps) {
  return (
    <Card padding="0">
      <Box
        padding="300"
        background="bg-surface-secondary"
        borderBlockEndWidth="025"
        borderColor="border"
      >
        <BlockStack gap="100">
          <Text variant="headingMd" as="h2">
            {title}
          </Text>
          <Text as="p" tone="subdued">
            {description}
          </Text>
        </BlockStack>
        <Box paddingBlockStart="200">
          <Tabs
            tabs={tabs}
            selected={selectedTab}
            onSelect={onSelectTab}
            fitted
          />
        </Box>
      </Box>
      <Box padding="400">{children}</Box>
    </Card>
  );
}
