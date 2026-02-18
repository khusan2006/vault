"use client";

import { AppProvider } from "@shopify/polaris";
import { NavMenu } from "@shopify/app-bridge-react";
import { useSearchParams } from "next/navigation";
import "@shopify/polaris/build/esm/styles.css";
import enTranslations from "@shopify/polaris/locales/en.json";
import { appendIdToken } from "@/utils";

interface ProvidersProps {
  children: React.ReactNode;
}

export function Providers({ children }: ProvidersProps) {
  const searchParams = useSearchParams();
  const idToken = searchParams.get("id_token");
  const withIdToken = (href: string) => appendIdToken(href, idToken);

  return (
    <AppProvider i18n={enTranslations}>
      <NavMenu>
        <a href={withIdToken("/")} rel="home">Home</a>
        <a href={withIdToken("/campaigns")}>Campaigns</a>
        <a href={withIdToken("/settings")}>Settings</a>
        <a href={withIdToken("/pricing")}>Pricing</a>
      </NavMenu>
      {children}
    </AppProvider>
  );
}
