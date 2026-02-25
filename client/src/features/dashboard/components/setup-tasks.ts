import { EXTERNAL_URLS } from "@/constants";
import type { SetupStatus, SetupTask } from "@/types";

export function buildSetupTasks(
  setupStatus: SetupStatus,
  onRefreshEmbed: () => void,
): SetupTask[] {
  return [
    {
      id: "enable-embed",
      title: "Activate app",
      description: "Enable our app to see it visible on your store",
      completed: setupStatus.themeEmbedEnabled,
      action: {
        label: "Activate app",
        url: EXTERNAL_URLS.THEME_EDITOR,
        external: true,
      },
      secondaryAction: {
        label: "Refresh status",
        onAction: onRefreshEmbed,
      },
    },
    {
      id: "create-campaign",
      title: "Create your first campaign",
      description:
        "Set up a campaign to define which customers get special treatment. You'll choose conditions and benefits.",
      completed: setupStatus.hasCampaign,
      action: {
        label: "Create campaign",
        url: "/campaigns/new",
      },
    },
    {
      id: "add-benefits",
      title: "Add benefits for qualifying customers",
      description:
        "Configure exclusive product access, automatic discounts, or free product claims as rewards.",
      completed: setupStatus.hasBenefits,
      action: setupStatus.hasCampaign
        ? { label: "Edit campaign", url: "/campaigns" }
        : undefined,
    },
    {
      id: "activate-campaign",
      title: "Activate a campaign",
      description:
        "Once everything looks good, activate your campaign so qualifying customers start receiving their benefits.",
      completed: setupStatus.hasActiveCampaign,
      action:
        setupStatus.hasCampaign && !setupStatus.hasActiveCampaign
          ? { label: "View campaigns", url: "/campaigns" }
          : undefined,
    },
  ];
}
