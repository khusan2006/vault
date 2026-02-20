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
import {
  NotificationPreview,
  isOverlayNotification,
} from "./NotificationPreview";
import { ProductPagePreview } from "./ProductPagePreview";
import { LandingPagePreview } from "./LandingPagePreview";
import { ProductsModalPreview } from "./ProductsModalPreview";

/**
 * Highlight zone styles applied via CSS data attribute on the preview container.
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
  approach,
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

  const isBanner = notification.type === "banner";
  const bannerAtTop = isBanner && notification.visuals.position === "top";
  const bannerAtBottom = isBanner && notification.visuals.position !== "top";
  const isOverlay = isOverlayNotification(notification.type);
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

  const isModalApproach = approach === "modal";
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
        {/* Top banner */}
        {bannerAtTop && (
          <div data-zone="notifications">
            <NotificationPreview config={notification} />
          </div>
        )}

        <MockStorefrontHeader mobile={isMobile} />

        {/* Scrollable content area — relative for overlay notifications */}
        <div
          className="relative flex-1 overflow-y-auto"
          style={{ paddingBottom: bottomPadding }}
        >
          {/* Main page content */}
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
            {isModalApproach && resolvedLanding ? (
              <ProductsModalPreview
                config={resolvedLanding}
                products={previewProducts}
                isMobile={isMobile}
              />
            ) : resolvedView === "landing" && resolvedLanding ? (
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

          {/* Overlay notifications (modal, toast, badge) — positioned within scroll area */}
          {isOverlay && (
            <div data-zone="notifications">
              <NotificationPreview config={notification} />
            </div>
          )}
        </div>

        {/* Bottom banner */}
        {bannerAtBottom && (
          <div data-zone="notifications">
            <NotificationPreview config={notification} />
          </div>
        )}
      </div>
    </div>
  );
}
