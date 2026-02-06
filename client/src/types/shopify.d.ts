interface ShopifyNavigation {
  history?: {
    replace(path: string): void;
    subscribe(callback: (path: string) => void): () => void;
  };
}

interface ShopifyGlobal {
  idToken(): Promise<string>;
  navigation?: ShopifyNavigation;
}

declare global {
  interface Window {
    shopify?: ShopifyGlobal;
  }
}

export {};
