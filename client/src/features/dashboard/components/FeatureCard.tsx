import { Text, Button } from "@shopify/polaris";
import { PlusIcon } from "@shopify/polaris-icons";
import type { ReactNode } from "react";

interface FeatureCardProps {
  title: string;
  description: string;
  illustration: ReactNode;
  gradientClassName: string;
  onClick: () => void;
}

export function FeatureCard({
  title,
  description,
  illustration,
  gradientClassName,
  onClick,
}: FeatureCardProps) {
  return (
    <div
      onClick={onClick}
      onKeyDown={(e) => {
        if (e.key === "Enter" || e.key === " ") onClick();
      }}
      role="button"
      tabIndex={0}
      className="flex cursor-pointer flex-col overflow-hidden rounded-[var(--p-border-radius-300)] bg-[var(--p-color-bg-surface)] shadow-[var(--p-shadow-100)] transition-[box-shadow,transform] duration-150 ease-out hover:-translate-y-[2px] hover:shadow-[var(--p-shadow-300)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--p-color-border-brand)]"
    >
      {/* Illustration area */}
      <div
        className={`flex h-[140px] items-center justify-center px-5 py-3 ${gradientClassName}`}
      >
        {illustration}
      </div>

      {/* Content area */}
      <div
        className="flex flex-1 flex-col gap-[var(--p-space-200)] p-[var(--p-space-400)]"
      >
        <Text variant="headingMd" as="h3">
          {title}
        </Text>
        <Text as="p" variant="bodySm" tone="subdued">
          {description}
        </Text>
        <div className="mt-auto pt-[var(--p-space-200)]">
          <Button icon={PlusIcon} variant="primary" onClick={onClick}>
            Create campaign
          </Button>
        </div>
      </div>
    </div>
  );
}
