import type { LandingPageDisplayConfig } from "@/types";
import type { HighlightZone, PreviewProduct } from "@/types/storefront-preview.types";
import { toProductData } from "@/utils/storefront-preview";

interface LandingPagePreviewProps {
  config: LandingPageDisplayConfig;
  products: PreviewProduct[];
  isMobile: boolean;
  highlightZone?: HighlightZone;
}

export function LandingPagePreview({
  config,
  products,
  isMobile,
  highlightZone,
}: LandingPagePreviewProps) {
  const zoneClass = (zone: string) =>
    highlightZone === zone
      ? "ring-2 ring-[var(--p-color-border-interactive)] ring-offset-2 rounded-lg transition-shadow duration-200"
      : "transition-shadow duration-200";
  if (!config.enabled) {
    return (
      <div className="flex h-[300px] flex-col items-center justify-center gap-4 text-slate-400">
        <div className="text-5xl">🛒</div>
        <p>Landing page is disabled.</p>
      </div>
    );
  }

  return (
    <div>
      <div className={zoneClass('typography')} style={{ textAlign: "center", marginBottom: 40 }}>
        <h2
          style={{
            fontSize: 'var(--vault-title-size, 28px)',
            fontWeight: 700,
            color: 'var(--vault-title-color, #18181b)',
            margin: "0 0 8px",
            lineHeight: 1.3,
          }}
        >
          {config.heading || "Exclusive Products"}
        </h2>
        <p
          style={{
            fontSize: 'var(--vault-subtitle-size, 16px)',
            color: 'var(--vault-subtitle-color, #6b7280)',
            margin: 0,
          }}
        >
          {config.subheading || "Products available just for you"}
        </p>
      </div>
      <div
        className={zoneClass('cards')}
        style={{
          display: "grid",
          gridTemplateColumns: `repeat(${isMobile ? 2 : config.gridColumns}, 1fr)`,
          gap: isMobile
            ? 'var(--vault-grid-mobile-gap, 12px)'
            : 'var(--vault-grid-gap, 24px)',
        }}
      >
        {products.map((product) => (
          <vault-product-card
            key={product.id}
            product-data={toProductData(product)}
            layout={config.itemLayout}
            badge-text={config.badgeText || "Exclusive"}
            badge-color={config.badgeColor || "#7c3aed"}
            show-cart={String(config.showAddToCart)}
            show-category={String(config.showCategory)}
            show-compare-at={String(config.showCompareAt)}
            show-ratings={String(config.showRatings)}
          />
        ))}
      </div>
    </div>
  );
}

