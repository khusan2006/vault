import type {
  DiscountConfig,
  ProductPageDisplayConfig,
  TimerDisplayConfig,
} from "@/types";
import type { PreviewProduct } from "@/types/storefront-preview.types";
import { formatPrice, getDiscountedPrice } from "@/utils/storefront-preview";
import { TimerPreview } from "./TimerPreview";

interface ProductPagePreviewProps {
  product: PreviewProduct;
  productPage?: ProductPageDisplayConfig;
  timer?: TimerDisplayConfig;
  discount?: DiscountConfig;
  mobile: boolean;
}

export function ProductPagePreview({
  product,
  productPage,
  timer,
  discount,
  mobile,
}: ProductPagePreviewProps) {
  const basePrice = 129;
  const discounted = getDiscountedPrice(basePrice, discount);
  const showStrikethrough = productPage?.showStrikethroughPricing ?? false;
  const showBadge = productPage?.discountBadge.enabled ?? false;
  const badgeText = productPage?.discountBadge.text ?? "Member price";
  const badgeColor = productPage?.discountBadge.color ?? "#7c3aed";
  const banner = productPage?.banner ?? null;
  const productBackgroundImage = product.imageUrl
    ? `url(${product.imageUrl})`
    : product.imageGradient;

  const priceNode =
    showStrikethrough && discounted < basePrice ? (
      <div className="flex items-center gap-[10px]">
        <span className="text-sm text-slate-400 line-through">
          {formatPrice(basePrice)}
        </span>
        <span className="text-[18px] font-bold text-slate-900">
          {formatPrice(discounted)}
        </span>
      </div>
    ) : (
      <span className="text-[18px] font-bold text-slate-900">
        {formatPrice(discounted)}
      </span>
    );

  const timerNode = timer ? <TimerPreview config={timer} /> : null;

  return (
    <div className="overflow-hidden rounded-[16px] border border-slate-200 bg-white shadow-[0_4px_10px_-4px_rgba(15,23,42,0.15)]">
      {banner && (
        <div
          className="px-4 py-2.5 text-center text-xs font-semibold"
          style={{ backgroundColor: banner.bgColor, color: banner.textColor }}
        >
          {banner.message}
        </div>
      )}

      <div
        className={`grid items-center gap-4 p-5 ${
          mobile ? "grid-cols-1" : "grid-cols-[160px_1fr]"
        }`}
      >
        <div
          className="relative w-full rounded-xl bg-cover bg-center [aspect-ratio:1/1]"
          style={{
            backgroundColor: product.imageColor ?? "#e2e8f0",
            backgroundImage: productBackgroundImage,
          }}
        >
          {showBadge && (
            <div
              className="absolute left-[10px] top-[10px] rounded-md px-2 py-1 text-[10px] font-bold uppercase text-white"
              style={{ backgroundColor: badgeColor }}
            >
              {badgeText}
            </div>
          )}
        </div>

        <div className="flex flex-col gap-3">
          <div className="text-[10px] font-semibold uppercase tracking-[0.12em] text-slate-400">
            {product.category ?? "Exclusive"}
          </div>
          {timer && timer.position === "above_title" && timerNode}

          <div className="text-[18px] font-bold text-slate-900">
            {product.title}
          </div>
          <div className="text-xs text-slate-500">Rated 4.8 by members</div>

          {timer && timer.position === "below_price" && (
            <div className="flex flex-col gap-2">
              {priceNode}
              {timerNode}
            </div>
          )}

          {timer && timer.position !== "below_price" && priceNode}

          <div className="flex items-center gap-3">
            <button className="cursor-pointer rounded-lg border-0 bg-slate-900 px-[18px] py-[10px] text-[13px] font-semibold text-white">
              Add to cart
            </button>
            <span className="text-xs text-slate-500">Free returns</span>
          </div>

          {timer && timer.position === "above_add_to_cart" && timerNode}
        </div>
      </div>
    </div>
  );
}

