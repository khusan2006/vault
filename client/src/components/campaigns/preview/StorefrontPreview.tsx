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

export function StorefrontPreview({
  config,
  device,
  products,
  view = "landing",
  discount,
  forceSampleProducts = true,
  highlightZone,
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

  const zoneClass = (zone: string) =>
    highlightZone === zone
      ? "ring-2 ring-[var(--p-color-border-interactive)] ring-offset-2 rounded-lg transition-shadow duration-200"
      : "transition-shadow duration-200";

  return (
    <div
      className="flex h-full flex-1 justify-center overflow-hidden bg-[radial-gradient(circle_at_top,_#f8fafc_0%,_#eef2ff_40%,_#f1f5f9_100%)] p-8"
    >
      <div
        className={`relative flex h-full flex-col overflow-hidden bg-white shadow-[0_0_0_1px_rgba(0,0,0,0.05),_0_20px_25px_-5px_rgba(0,0,0,0.1)] transition-[width] duration-300 ease-out ${
          isMobile ? "w-[375px] rounded-[24px]" : "w-full rounded-[8px]"
        }`}
      >
        {bannerAtTop && (
          <div className={zoneClass('notifications')}>
            <NotificationPreview config={notification} />
          </div>
        )}
        <MockStorefrontHeader mobile={isMobile} />
        <div
          className="relative flex-1 overflow-y-auto"
          style={{ paddingBottom: bottomPadding }}
        >
          {notification.type !== "banner" && (
            <div className={zoneClass('notifications')}>
              <NotificationPreview config={notification} />
            </div>
          )}
          <div
            className={`mx-auto max-w-[1200px] ${
              isMobile ? "px-4 py-6" : "px-8 py-12"
            } ${zoneClass('layout')}`}
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
                highlightZone={highlightZone}
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
          <div className={zoneClass('notifications')}>
            <NotificationPreview config={notification} />
          </div>
        )}
      </div>
    </div>
  );
}
