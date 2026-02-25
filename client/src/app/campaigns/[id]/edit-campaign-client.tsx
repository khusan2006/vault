"use client";

import { useIdTokenNavigation } from "@/shared/hooks/useIdTokenNavigation";
import {
  Page,
  Layout,
  Banner,
  Text,
  Modal,
  SkeletonPage,
  SkeletonBodyText,
  SkeletonDisplayText,
  Card,
  Box,
  BlockStack,
} from "@shopify/polaris";
import { SaveBar } from "@shopify/app-bridge-react";
import { useCampaignEditor } from "@/features/campaigns/hooks/useCampaignEditor";
import { CAMPAIGN_TYPE_LABELS } from "@/utils";
import type { Campaign } from "@/types";
import { renderEditFlowByType } from "@/features/campaigns/components/edit/EditCampaignFlows";

interface EditCampaignClientProps {
  campaignId: string;
  initialCampaign: Campaign | null;
}

function EditCampaignSkeleton() {
  return (
    <SkeletonPage title="Campaign" backAction primaryAction>
      <Layout>
        <Layout.Section>
          <Card>
            <BlockStack gap="200">
              <SkeletonDisplayText size="small" />
              <SkeletonBodyText lines={2} />
            </BlockStack>
          </Card>
          <Box paddingBlockStart="400">
            <Card>
              <BlockStack gap="200">
                <SkeletonBodyText lines={1} />
                <SkeletonBodyText lines={4} />
              </BlockStack>
            </Card>
          </Box>
        </Layout.Section>
        <Layout.Section variant="oneThird">
          <Card>
            <BlockStack gap="200">
              <SkeletonDisplayText size="small" />
              <SkeletonBodyText lines={2} />
            </BlockStack>
          </Card>
          <Box paddingBlockStart="400">
            <Card>
              <SkeletonBodyText lines={3} />
            </Card>
          </Box>
        </Layout.Section>
      </Layout>
    </SkeletonPage>
  );
}

function DeleteCampaignModal({
  open,
  deleting,
  isActive,
  name,
  onClose,
  onDelete,
}: {
  open: boolean;
  deleting: boolean;
  isActive: boolean;
  name: string;
  onClose: () => void;
  onDelete: () => void;
}) {
  return (
    <Modal
      open={open}
      onClose={onClose}
      title="Delete campaign?"
      primaryAction={{
        content: "Delete",
        destructive: true,
        onAction: onDelete,
        loading: deleting,
      }}
      secondaryActions={[
        {
          content: "Cancel",
          onAction: onClose,
        },
      ]}
    >
      <Modal.Section>
        <BlockStack gap="300">
          {isActive && (
            <Banner tone="warning">
              This campaign is currently active. Deleting it will immediately
              stop all benefits for qualifying customers.
            </Banner>
          )}
          <Text as="p">
            Are you sure you want to delete &quot;{name}&quot;? This action
            cannot be undone.
          </Text>
        </BlockStack>
      </Modal.Section>
    </Modal>
  );
}

export default function EditCampaignClient({
  campaignId,
  initialCampaign,
}: EditCampaignClientProps) {
  const { push } = useIdTokenNavigation();
  const {
    formState,
    isDirty,
    loading,
    saving,
    duplicating,
    deleting,
    deleteModalOpen,
    setDeleteModalOpen,
    error,
    setError,
    selectionProps,
    isActive,
    isBusy,
    handleSave,
    handleDiscard,
    handleDelete,
    handleDuplicate,
    handleFieldChange,
  } = useCampaignEditor({ campaignId, initialCampaign });

  if (loading) {
    return <EditCampaignSkeleton />;
  }

  return (
    <>
      <SaveBar id="campaign-save-bar" open={isDirty}>
        <button
          variant="primary"
          onClick={handleSave}
          {...(saving ? { loading: "" } : {})}
        />
        <button onClick={handleDiscard} />
      </SaveBar>

      <Page
        title={formState.name || "Edit campaign"}
        subtitle={
          formState.type ? CAMPAIGN_TYPE_LABELS[formState.type] : undefined
        }
        backAction={{
          content: "Campaigns",
          onAction: () => push("/campaigns"),
        }}
 
        secondaryActions={[
          {
            content: "Duplicate",
            onAction: handleDuplicate,
            loading: duplicating,
            disabled: isBusy,
          },
          {
            content: "Delete",
            onAction: () => setDeleteModalOpen(true),
            destructive: true,
            disabled: isBusy,
          },
        ]}
      >
        <Layout>
          {error && (
            <Layout.Section>
              <Banner tone="critical" onDismiss={() => setError(null)}>
                {error}
              </Banner>
            </Layout.Section>
          )}

          {renderEditFlowByType({
            type: formState.type,
            formState,
            onFieldChange: handleFieldChange,
            nameError: error === "Campaign name is required" ? error : undefined,
            selectionProps,
          })}
        </Layout>
      </Page>
      <DeleteCampaignModal
        open={deleteModalOpen}
        deleting={deleting}
        isActive={isActive}
        name={formState.name}
        onClose={() => setDeleteModalOpen(false)}
        onDelete={handleDelete}
      />
    </>
  );
}
