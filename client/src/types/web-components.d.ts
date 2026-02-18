// Type declarations for Vault Web Components in React JSX
declare namespace JSX {
  interface IntrinsicElements {
    'vault-banner': React.DetailedHTMLProps<
      React.HTMLAttributes<HTMLElement> & {
        message?: string;
        'button-text'?: string;
        'button-url'?: string;
        position?: string;
        'primary-color'?: string;
        'text-color'?: string;
      },
      HTMLElement
    >;
    'vault-modal': React.DetailedHTMLProps<
      React.HTMLAttributes<HTMLElement> & {
        message?: string;
        'button-text'?: string;
        'button-url'?: string;
        'primary-color'?: string;
        'text-color'?: string;
      },
      HTMLElement
    >;
    'vault-toast': React.DetailedHTMLProps<
      React.HTMLAttributes<HTMLElement> & {
        message?: string;
        'button-text'?: string;
        'button-url'?: string;
        position?: string;
        'primary-color'?: string;
        'text-color'?: string;
      },
      HTMLElement
    >;
    'vault-badge': React.DetailedHTMLProps<
      React.HTMLAttributes<HTMLElement> & {
        message?: string;
        'button-text'?: string;
        'button-url'?: string;
        position?: string;
        'primary-color'?: string;
        'text-color'?: string;
      },
      HTMLElement
    >;
    'vault-timer': React.DetailedHTMLProps<
      React.HTMLAttributes<HTMLElement> & {
        'end-time'?: string;
        duration?: string;
        'style-variant'?: string;
        label?: string;
        'expired-message'?: string;
      },
      HTMLElement
    >;
    'vault-product-card': React.DetailedHTMLProps<
      React.HTMLAttributes<HTMLElement> & {
        'product-data'?: string;
        layout?: string;
        'badge-text'?: string;
        'badge-color'?: string;
        'show-cart'?: string;
        'show-category'?: string;
        'show-compare-at'?: string;
        'show-ratings'?: string;
      },
      HTMLElement
    >;
  }
}
