import type { NotificationDisplayConfig } from "@/types";

interface NotificationPreviewProps {
  config: NotificationDisplayConfig;
}

// =============================================================================
// SVG icons (inline to avoid importing storefront shared package in client)
// =============================================================================

const StarIcon = () => (
  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2" />
  </svg>
);

const CloseIcon = ({ size = 14 }: { size?: number }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
    <line x1="18" y1="6" x2="6" y2="18" />
    <line x1="6" y1="6" x2="18" y2="18" />
  </svg>
);

// =============================================================================
// Banner Preview — inline colored bar
// =============================================================================

function BannerPreview({ config }: NotificationPreviewProps) {
  const { message, buttonText, visuals } = config;
  return (
    <div
      style={{ background: visuals.primaryColor, color: visuals.textColor }}
      className="w-full"
    >
      <div className="mx-auto flex max-w-[1200px] items-center justify-between gap-3 px-4 py-2.5">
        <div className="flex min-w-0 flex-1 items-center gap-2">
          <span className="text-[13px] font-semibold leading-snug">{message}</span>
        </div>
        <div className="flex shrink-0 items-center gap-2">
          {buttonText && (
            <span
              className="inline-flex items-center rounded-md px-3 py-1.5 text-[12px] font-bold whitespace-nowrap"
              style={{ background: "#fff", color: visuals.primaryColor }}
            >
              {buttonText}
            </span>
          )}
          <span
            className="flex h-6 w-6 items-center justify-center rounded opacity-60"
            style={{ background: "rgba(255,255,255,0.15)" }}
          >
            <CloseIcon size={12} />
          </span>
        </div>
      </div>
    </div>
  );
}

// =============================================================================
// Modal Notification Preview — centered overlay card
// =============================================================================

function ModalNotificationPreview({ config }: NotificationPreviewProps) {
  const { message, buttonText, visuals } = config;
  return (
    <div className="absolute inset-0 z-10 flex items-center justify-center">
      {/* Backdrop */}
      <div className="absolute inset-0 bg-black/40 backdrop-blur-[1px]" />
      {/* Card */}
      <div className="relative mx-4 w-full max-w-[320px] rounded-2xl bg-white p-6 text-center shadow-[0_20px_60px_rgba(0,0,0,0.15)]">
        {/* Close */}
        <button
          className="absolute right-3 top-3 flex h-7 w-7 items-center justify-center rounded-md border-0 bg-transparent text-gray-400 cursor-default"
          tabIndex={-1}
        >
          <CloseIcon size={14} />
        </button>
        {/* Icon */}
        <div
          className="mx-auto mb-3 flex h-12 w-12 items-center justify-center rounded-full"
          style={{ background: visuals.primaryColor, color: visuals.textColor }}
        >
          <StarIcon />
        </div>
        {/* Message */}
        <p className="m-0 mb-4 text-[15px] font-bold leading-snug text-zinc-900">
          {message}
        </p>
        {/* CTA */}
        {buttonText && (
          <span
            className="inline-flex items-center justify-center rounded-lg px-5 py-2.5 text-[14px] font-bold"
            style={{ background: visuals.primaryColor, color: visuals.textColor }}
          >
            {buttonText}
          </span>
        )}
      </div>
    </div>
  );
}

// =============================================================================
// Toast Preview — floating card with accent border
// =============================================================================

function ToastPreview({ config }: NotificationPreviewProps) {
  const { message, buttonText, visuals } = config;
  const pos = visuals.position || "bottom-right";
  const isLeft = pos === "bottom-left";
  const isCenter = pos === "bottom";
  const isTop = pos === "top";

  const positionClasses = isTop
    ? "top-4 left-1/2 -translate-x-1/2"
    : isCenter
      ? "bottom-4 left-1/2 -translate-x-1/2"
      : isLeft
        ? "bottom-4 left-4"
        : "bottom-4 right-4";

  return (
    <div className={`absolute z-10 w-[260px] max-w-[calc(100%-32px)] ${positionClasses}`}>
      <div
        className="rounded-xl bg-white p-3.5 shadow-[0_8px_30px_rgba(0,0,0,0.12)]"
        style={{ borderLeft: `3px solid ${visuals.primaryColor}` }}
      >
        {/* Close */}
        <button
          className="absolute right-2 top-2 flex h-5 w-5 items-center justify-center rounded border-0 bg-transparent text-gray-400 cursor-default"
          tabIndex={-1}
        >
          <CloseIcon size={10} />
        </button>
        {/* Icon */}
        <div
          className="mb-2 flex h-7 w-7 items-center justify-center rounded-full"
          style={{ background: visuals.primaryColor, color: visuals.textColor }}
        >
          <StarIcon />
        </div>
        {/* Message */}
        <p className="m-0 mb-2.5 pr-4 text-[12px] font-semibold leading-snug text-zinc-900">
          {message}
        </p>
        {/* CTA */}
        {buttonText && (
          <span
            className="inline-flex items-center rounded-md px-3 py-1 text-[11px] font-bold"
            style={{ background: visuals.primaryColor, color: visuals.textColor }}
          >
            {buttonText}
          </span>
        )}
      </div>
    </div>
  );
}

// =============================================================================
// Badge Preview — FAB + expanded panel
// =============================================================================

function BadgePreview({ config }: NotificationPreviewProps) {
  const { message, buttonText, visuals } = config;
  const isLeft = visuals.position === "bottom-left";

  return (
    <div className={`absolute z-10 bottom-4 ${isLeft ? "left-4" : "right-4"}`}>
      {/* Expanded panel */}
      <div
        className={`mb-2 w-[220px] rounded-xl border border-gray-200 bg-white p-3.5 shadow-[0_8px_30px_rgba(0,0,0,0.12)] ${isLeft ? "" : "ml-auto"}`}
      >
        <p className="m-0 mb-2.5 text-[12px] font-semibold leading-snug text-zinc-900">
          {message}
        </p>
        {buttonText && (
          <span
            className="inline-flex items-center rounded-md px-3 py-1.5 text-[11px] font-bold"
            style={{ background: visuals.primaryColor, color: visuals.textColor }}
          >
            {buttonText}
          </span>
        )}
      </div>
      {/* FAB */}
      <div
        className={`flex h-10 w-10 items-center justify-center rounded-full shadow-[0_4px_20px_rgba(0,0,0,0.15)] ${isLeft ? "" : "ml-auto"}`}
        style={{ background: visuals.primaryColor, color: visuals.textColor }}
      >
        <StarIcon />
      </div>
    </div>
  );
}

// =============================================================================
// Export — used by StorefrontPreview to render per display type
// =============================================================================

/**
 * Returns true if this notification type should be rendered as an overlay
 * (positioned absolute within the preview frame), false if inline.
 */
export function isOverlayNotification(type: string): boolean {
  return type === "modal" || type === "toast" || type === "badge";
}

export function NotificationPreview({ config }: NotificationPreviewProps) {
  switch (config.type) {
    case "banner":
      return <BannerPreview config={config} />;
    case "modal":
      return <ModalNotificationPreview config={config} />;
    case "toast":
      return <ToastPreview config={config} />;
    case "badge":
      return <BadgePreview config={config} />;
    default:
      return null;
  }
}
