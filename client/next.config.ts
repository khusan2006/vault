import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // Transpile storefront Web Components so they can be imported in admin preview
  transpilePackages: ["@vault/storefront", "@vault/shared"],
  // Allow Shopify to embed this app in an iframe
  async headers() {
    return [
      {
        source: "/(.*)",
        headers: [
          {
            key: "Content-Security-Policy",
            value: `frame-ancestors https://*.myshopify.com https://admin.shopify.com;`,
          },
        ],
      },
    ];
  },
};

export default nextConfig;
