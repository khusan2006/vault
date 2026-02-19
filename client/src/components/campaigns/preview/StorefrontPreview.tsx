"use client";

import { useEffect } from "react";
import type {
  PreviewProduct,
  StorefrontPreviewProps,
} from "@/types/storefront-preview.types";
import { MOCK_PRODUCTS } from "@/constants/storefront-preview";
import { ensureWebComponents } from "@/utils/storefront-preview";
import { resolveTokens, tokensToCSS } from "@vault/shared/theme/tokens";
import { MockStorefrontHeader } from "./MockStorefrontHeader";
import { NotificationPreview } from "./NotificationPreview";
import { ProductPagePreview } from "./ProductPagePreview";
import { LandingPagePreview } from "./LandingPagePreview";

/**
 * Highlight zone styles applied via CSS data attribute on the preview container.
 * Using `[data-highlight-zone]` selectors avoids React state re-renders that
 * trigger Polaris Popover portal access in cross-origin iframe contexts.
 */
const HIGHLIGHT_ZONE_STYLES = `
  [data-highlight-zone] [data-zone] {
    transition: box-shadow 200ms ease, border-radius 200ms ease;
  }
  [data-highlight-zone="cards"] [data-zone="cards"],
  [data-highlight-zone="layout"] [data-zone="layout"],
  [data-highlight-zone="typography"] [data-zone="typography"],
  [data-highlight-zone="notifications"] [data-zone="notifications"] {
    box-shadow: 0 0 0 2px var(--p-color-border-interactive, #2c6ecb);
    border-radius: 8px;
  }
`;

export function StorefrontPreview({
  config,
  device,
  products,
  view = "landing",
  discount,
  forceSampleProducts = true,
  previewRef,
}: StorefrontPreviewProps) {
  useEffect(() => {
    ensureWebComponents();
  }, []);

  const isMobile = device === "mobile";
  const { notification, landingPage, productPage, timer } = config;
  const resolvedLanding = landingPage
    ? {
        ...landingPage,
        itemLayout: landingPage.itemLayout ?? "card",
        showAddToCart: landingPage.showAddToCart ?? true,
        showCategory: landingPage.showCategory ?? true,
        showCompareAt: landingPage.showCompareAt ?? true,
        showRatings: landingPage.showRatings ?? true,
      }
    : null;
  const bannerAtTop =
    notification.type === "banner" && notification.visuals.position === "top";
  const bannerAtBottom =
    notification.type === "banner" && notification.visuals.position !== "top";
  const bottomPadding = bannerAtBottom ? (isMobile ? 80 : 64) : 0;

  const theme = config.theme;
  const themeVars = tokensToCSS(resolveTokens(theme));

  const hasSelectedProducts =
    !forceSampleProducts && Boolean(products && products.length > 0);
  const previewProducts: PreviewProduct[] = hasSelectedProducts
    ? products!.map((product) => ({
        id: product.id,
        title: product.title,
        imageUrl: product.imageUrl,
      }))
    : MOCK_PRODUCTS;

  const primaryProduct = previewProducts[0] ?? MOCK_PRODUCTS[0];
  const resolvedView =
    view === "landing" && resolvedLanding ? "landing" : "product";

  return (
    <div
      ref={previewRef as React.RefObject<HTMLDivElement>}
      className="flex h-full flex-1 justify-center overflow-hidden bg-[radial-gradient(circle_at_top,_#f8fafc_0%,_#eef2ff_40%,_#f1f5f9_100%)] p-8"
    >
      <style dangerouslySetInnerHTML={{ __html: HIGHLIGHT_ZONE_STYLES }} />
      <div
        className={`relative flex h-full flex-col overflow-hidden bg-white shadow-[0_0_0_1px_rgba(0,0,0,0.05),_0_20px_25px_-5px_rgba(0,0,0,0.1)] transition-[width] duration-300 ease-out ${
          isMobile ? "w-[375px] rounded-[24px]" : "w-full rounded-[8px]"
        }`}
      >
        {bannerAtTop && (
          <div data-zone="notifications">
            <NotificationPreview config={notification} />
          </div>
        )}
        <MockStorefrontHeader mobile={isMobile} />
        <div
          className="relative flex-1 overflow-y-auto"
          style={{ paddingBottom: bottomPadding }}
        >
          {notification.type !== "banner" && (
            <div data-zone="notifications">
              <NotificationPreview config={notification} />
            </div>
          )}
          <div
            data-zone="layout"
            className={`mx-auto max-w-[1200px] ${
              isMobile ? "px-4 py-6" : "px-8 py-12"
            }`}
            style={{
              ...themeVars,
              maxWidth: 'var(--vault-page-max-width, 1200px)',
            }}
          >
            {resolvedView === "landing" && resolvedLanding ? (
              <LandingPagePreview
                config={resolvedLanding}
                products={previewProducts}
                isMobile={isMobile}
              />
            ) : (
              <ProductPagePreview
                product={primaryProduct}
                productPage={productPage}
                timer={timer}
                discount={discount}
                mobile={isMobile}
              />
            )}
          </div>
        </div>

        {bannerAtBottom && (
          <div data-zone="notifications">
            <NotificationPreview config={notification} />
          </div>
        )}
      </div>
    </div>
  );
}
