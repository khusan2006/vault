import type { NotificationDisplayConfig } from "@/types";

interface NotificationPreviewProps {
  config: NotificationDisplayConfig;
}

export function NotificationPreview({ config }: NotificationPreviewProps) {
  const { type, message, buttonText, buttonUrl, visuals } = config;

  if (type === "banner") {
    return (
      <vault-banner
        message={message}
        button-text={buttonText || ""}
        button-url={buttonUrl || ""}
        position={visuals.position || "top"}
        primary-color={visuals.primaryColor}
        text-color={visuals.textColor}
      />
    );
  }

  if (type === "modal") {
    return (
      <vault-modal
        message={message}
        button-text={buttonText || ""}
        button-url={buttonUrl || ""}
        primary-color={visuals.primaryColor}
        text-color={visuals.textColor}
      />
    );
  }

  if (type === "toast") {
    return (
      <vault-toast
        message={message}
        button-text={buttonText || ""}
        button-url={buttonUrl || ""}
        position={visuals.position || "bottom-right"}
        primary-color={visuals.primaryColor}
        text-color={visuals.textColor}
      />
    );
  }

  if (type === "badge") {
    return (
      <vault-badge
        message={message}
        button-text={buttonText || ""}
        button-url={buttonUrl || ""}
        position={visuals.position || "bottom-right"}
        primary-color={visuals.primaryColor}
        text-color={visuals.textColor}
      />
    );
  }

  return null;
}

