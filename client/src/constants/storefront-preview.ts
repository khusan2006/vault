import type { PreviewProduct } from "../types/storefront-preview.types";

/**
 * Static sample products used when no real products are selected.
 * Keeps the preview deterministic and visually rich.
 */
export const MOCK_PRODUCTS: PreviewProduct[] = [
  {
    id: "1",
    title: "Linen Overshirt",
    category: "Outerwear",
    price: "$128.00",
    compareAt: "$168.00",
    imageUrl: "/preview/product-01.svg",
  },
  {
    id: "2",
    title: "Studio Denim",
    category: "Denim",
    price: "$94.00",
    compareAt: "$129.00",
    imageUrl: "/preview/product-02.svg",
  },
  {
    id: "3",
    title: "Canvas Court Sneaker",
    category: "Footwear",
    price: "$78.00",
    compareAt: "$98.00",
    imageUrl: "/preview/product-03.svg",
  },
  {
    id: "4",
    title: "Ribbed Merino Crew",
    category: "Knitwear",
    price: "$142.00",
    compareAt: "$188.00",
    imageUrl: "/preview/product-04.svg",
  },
  {
    id: "5",
    title: "Heritage Belt",
    category: "Accessories",
    price: "$56.00",
    compareAt: "$72.00",
    imageUrl: "/preview/product-05.svg",
  },
  {
    id: "6",
    title: "Open Weave Hat",
    category: "Accessories",
    price: "$48.00",
    compareAt: "$64.00",
    imageUrl: "/preview/product-06.svg",
  },
];

