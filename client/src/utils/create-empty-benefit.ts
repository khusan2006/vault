import type { Benefit, BenefitType } from "@/types";

/**
 * Creates a new benefit with sensible defaults for the given type.
 */
export function createEmptyBenefit(type: BenefitType): Benefit {
  switch (type) {
    case "visibility":
      return { type: "visibility", productIds: [], collectionIds: [] };
    case "discount":
      return {
        type: "discount",
        productIds: [],
        collectionIds: [],
        discount: { type: "percentage", value: 10 },
      };
    case "free_product":
      return {
        type: "free_product",
        productIds: [],
        collectionIds: [],
        maxClaimsPerCustomer: 1,
      };
  }
}
