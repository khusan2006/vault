"use client";

interface StepCircleProps {
  completed: boolean;
}

/**
 * A circular indicator for setup guide steps.
 * Shows a green checkmark when completed, or a dashed circle when pending.
 */
export function StepCircle({ completed }: StepCircleProps) {
  if (completed) {
    return (
      <div className="h-7 w-7 shrink-0">
        <svg
          width="28"
          height="28"
          viewBox="0 0 28 28"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
        >
          <circle
            cx="14"
            cy="14"
            r="14"
            fill="var(--p-color-bg-fill-success)"
          />
          <path
            d="M9 14.5L12.5 18L19 11"
            stroke="white"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
        </svg>
      </div>
    );
  }

  return (
    <svg
      width="28"
      height="28"
      viewBox="0 0 28 28"
      fill="none"
      className="shrink-0"
    >
      <circle
        cx="14"
        cy="14"
        r="12"
        stroke="var(--p-color-border)"
        strokeWidth="2.5"
        strokeDasharray="4 4"
        fill="none"
      />
    </svg>
  );
}
