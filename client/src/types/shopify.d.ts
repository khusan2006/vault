interface ShopifyGlobal {
  idToken(): Promise<string>;
}

declare global {
  interface Window {
    shopify?: ShopifyGlobal;
  }
}

export {};
