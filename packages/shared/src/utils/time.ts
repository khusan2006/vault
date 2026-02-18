/** Zero-pad a number to at least 2 digits. */
export function pad(n: number): string {
  return n < 10 ? '0' + n : String(n);
}

export interface TimeRemaining {
  days: number;
  hours: number;
  minutes: number;
  seconds: number;
  totalMs: number;
  expired: boolean;
}

/** Compute time remaining from now until `endMs` (epoch milliseconds). */
export function computeTimeRemaining(endMs: number): TimeRemaining {
  const totalMs = endMs - Date.now();
  if (totalMs <= 0) {
    return { days: 0, hours: 0, minutes: 0, seconds: 0, totalMs: 0, expired: true };
  }
  return {
    days: Math.floor(totalMs / 86400000),
    hours: Math.floor((totalMs % 86400000) / 3600000),
    minutes: Math.floor((totalMs % 3600000) / 60000),
    seconds: Math.floor((totalMs % 60000) / 1000),
    totalMs,
    expired: false,
  };
}
