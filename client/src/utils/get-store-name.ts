/**
 * Extracts and formats the store name from the Shopify App Bridge global config.
 * Returns an empty string if unavailable.
 */
export function getStoreName(): string {
  try {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const config = (window.shopify as any)?.config as
      | Record<string, unknown>
      | undefined;

    const shop =
      (config?.shop as string | undefined) ??
      (config?.myshopifyDomain as string | undefined);

    if (shop) {
      return shop
        .replace(".myshopify.com", "")
        .split("-")
        .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
        .join(" ");
    }
  } catch {
    console.error("Error getting store name");
  }

  return "";
}
