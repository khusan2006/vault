interface ShopifyNavigation {
  history?: {
    replace(path: string): void;
    subscribe(callback: (path: string) => void): () => void;
  };
}

interface ResourcePickerOptions {
  type: "product" | "collection" | "variant";
  multiple?: boolean;
  selectionIds?: { id: string }[];
}

interface ResourcePickerSelection {
  id: string;
  title?: string;
  handle?: string;
  images?: { originalSrc: string }[];
  image?: { originalSrc: string } | null;
}

interface ShopifyToast {
  show(message: string, options?: { duration?: number; isError?: boolean }): void;
}

interface ShopifySaveBar {
  show(id: string): void;
  hide(id: string): void;
  leaveConfirmation?(
    id: string,
    handlers: { save: () => void | Promise<void>; discard: () => void },
  ): void;
}

interface ShopifyGlobal {
  idToken(): Promise<string>;
  navigation?: ShopifyNavigation;
  toast?: ShopifyToast;
  saveBar?: ShopifySaveBar;
  resourcePicker(options: ResourcePickerOptions): Promise<ResourcePickerSelection[]>;
}

declare global {
  interface Window {
    shopify?: ShopifyGlobal;
  }

  namespace JSX {
    interface IntrinsicElements {
      "ui-modal": React.DetailedHTMLProps<
        React.HTMLAttributes<HTMLElement> & {
          id?: string;
          variant?: "max" | "base" | "large" | "small";
          src?: string;
        },
        HTMLElement
      >;
      "ui-title-bar": React.DetailedHTMLProps<
        React.HTMLAttributes<HTMLElement> & {
          title?: string;
        },
        HTMLElement
      >;
      "ui-save-bar": React.DetailedHTMLProps<
        React.HTMLAttributes<HTMLElement> & {
          id?: string;
        },
        HTMLElement
      >;
    }
  }
}

export {};
