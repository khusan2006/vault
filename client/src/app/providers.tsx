"use client";

import { useEffect } from "react";
import { usePathname, useRouter } from "next/navigation";
import { AppProvider } from "@shopify/polaris";
import "@shopify/polaris/build/esm/styles.css";
import enTranslations from "@shopify/polaris/locales/en.json";

interface ProvidersProps {
  children: React.ReactNode;
}

export function Providers({ children }: ProvidersProps) {
  const pathname = usePathname();
  const router = useRouter();

  useEffect(() => {
    // Set up App Bridge navigation
    if (typeof window !== "undefined" && window.shopify) {
      window.shopify.navigation?.history?.replace(pathname);
    }
  }, [pathname]);

  useEffect(() => {
    // Listen for navigation events from App Bridge
    if (typeof window !== "undefined" && window.shopify) {
      const unsubscribe = window.shopify.navigation?.history?.subscribe(
        (newPath: string) => {
          if (newPath !== pathname) {
            router.push(newPath);
          }
        }
      );

      return () => {
        unsubscribe?.();
      };
    }
  }, [pathname, router]);

  return (
    <AppProvider i18n={enTranslations}>
      {children}
    </AppProvider>
  );
}
