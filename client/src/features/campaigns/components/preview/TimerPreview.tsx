import type { TimerDisplayConfig } from "@/types";

interface TimerPreviewProps {
  config: TimerDisplayConfig;
}

export function TimerPreview({ config }: TimerPreviewProps) {
  // Use the real <vault-timer> Web Component for pixel-perfect preview.
  // We set a static duration (12 minutes 34 seconds) so the timer ticks in preview.
  const durationMs = String((12 * 60 + 34) * 1000);

  return (
    <vault-timer
      duration={durationMs}
      style-variant={config.style}
      expired-message={config.expiredMessage || "This offer has expired"}
    />
  );
}

