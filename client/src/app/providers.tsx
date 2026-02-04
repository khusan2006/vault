"use client";

import { AppProvider } from "@shopify/polaris";
import "@shopify/polaris/build/esm/styles.css";
import enTranslations from "@shopify/polaris/locales/en.json";
import { AppFrame } from "@/components/shared";

interface ProvidersProps {
  children: React.ReactNode;
}

export function Providers({ children }: ProvidersProps) {
  return (
    <AppProvider i18n={enTranslations}>
      <AppFrame>{children}</AppFrame>
    </AppProvider>
  );
}
