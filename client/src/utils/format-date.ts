/**
 * Formats an ISO date string to a human-readable format.
 * Returns an em-dash for null/undefined values.
 *
 * @example formatDate("2024-03-15T00:00:00Z") // "Mar 15, 2024"
 */
export function formatDate(dateString: string | null | undefined): string {
  if (!dateString) return "\u2014";

  return new Date(dateString).toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
  });
}

/**
 * Formats an ISO date string to a human-readable format.
 * Returns null for empty/invalid values (useful for optional ranges).
 */
export function formatOptionalDate(
  dateString: string | null | undefined,
): string | null {
  if (!dateString) return null;
  const date = new Date(dateString);
  if (Number.isNaN(date.getTime())) return null;
  return date.toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
  });
}
