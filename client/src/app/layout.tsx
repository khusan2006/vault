import type { Metadata } from "next";
import { Suspense } from "react";
import { Providers } from "./providers";
import "./globals.css";

export const metadata: Metadata = {
  title: "The Vault",
  description: "Shopify App",
};

interface RootLayoutProps {
  children: React.ReactNode;
}

export default function RootLayout({ children }: RootLayoutProps) {
  const apiKey = process.env.NEXT_PUBLIC_SHOPIFY_API_KEY || "";

  return (
    <html lang="en">
      <head>
        <meta name="shopify-api-key" content={apiKey} />
        <script src="https://cdn.shopify.com/shopifycloud/app-bridge.js" />
      </head>
      <body>
        <Suspense fallback={null}>
          <Providers>{children}</Providers>
        </Suspense>
      </body>
    </html>
  );
}
