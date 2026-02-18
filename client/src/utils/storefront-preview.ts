import type { DiscountConfig } from "@/types";
import type { PreviewProduct } from "../types/storefront-preview.types";

let webComponentsRegistered = false;

/**
 * Lazily registers storefront web components on the client.
 * Safe to call multiple times; registration happens only once.
 */
export function ensureWebComponents() {
  if (webComponentsRegistered || typeof window === "undefined") return;
  webComponentsRegistered = true;

  // Dynamic imports keep these out of the server bundle.
  import("@vault/storefront/components/vault-banner");
  import("@vault/storefront/components/vault-modal");
  import("@vault/storefront/components/vault-toast");
  import("@vault/storefront/components/vault-badge");
  import("@vault/storefront/components/vault-timer");
  import("@vault/storefront/components/vault-product-card");
}

export function formatPrice(value: number): string {
  return `$${value.toFixed(2)}`;
}

export function getDiscountedPrice(
  base: number,
  discount?: DiscountConfig,
): number {
  if (!discount || discount.value <= 0) return base;

  if (discount.type === "percentage") {
    return Math.max(0, base * (1 - discount.value / 100));
  }

  return Math.max(0, base - discount.value);
}

/**
 * Creates a minimal product payload in the shape expected by
 * the `<vault-product-card>` storefront web component.
 */
export function toProductData(product: PreviewProduct): string {
  const price = product.price?.replace(/[^0-9.]/g, "") || "0";
  const compareAt = product.compareAt?.replace(/[^0-9.]/g, "") || undefined;

  return JSON.stringify({
    title: product.title,
    handle: product.id,
    product_type: product.category,
    featured_image: product.imageUrl,
    variants: [
      {
        price,
        compare_at_price: compareAt ?? null,
      },
    ],
  });
}

