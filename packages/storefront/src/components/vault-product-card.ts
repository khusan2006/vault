import { escapeHtml } from '@vault/shared/utils/escape';
import { formatMoney } from '@vault/shared/utils/money';
import cardStyles from './vault-product-card.styles';

let stylesInjected = false;

function injectStyles() {
  if (stylesInjected) return;
  const style = document.createElement('style');
  style.textContent = cardStyles;
  document.head.appendChild(style);
  stylesInjected = true;
}

interface ProductData {
  title: string;
  handle: string;
  product_type?: string;
  featured_image?: string;
  image?: { src: string };
  images?: Array<string | { src: string }>;
  variants?: Array<{
    price: string;
    compare_at_price?: string | null;
  }>;
}

export class VaultProductCard extends HTMLElement {
  static observedAttributes = [
    'product-data', 'layout', 'badge-text', 'badge-color',
    'show-cart', 'show-category', 'show-compare-at', 'show-ratings',
  ];

  connectedCallback() {
    injectStyles();
    this.render();
  }

  attributeChangedCallback() {
    if (this.isConnected) this.render();
  }

  private render() {
    const rawData = this.getAttribute('product-data');
    if (!rawData) return;

    let product: ProductData;
    try {
      product = JSON.parse(rawData);
    } catch {
      return;
    }

    const layout = this.getAttribute('layout') || 'card';
    const badge = this.getAttribute('badge-text') || 'Exclusive';
    const bColor = this.getAttribute('badge-color') || '#7c3aed';
    const showCart = this.getAttribute('show-cart') !== 'false';
    const showCat = this.getAttribute('show-category') === 'true';
    const showComp = this.getAttribute('show-compare-at') === 'true';
    const showRate = this.getAttribute('show-ratings') === 'true';

    const t = escapeHtml(product.title);
    const v = product.variants?.[0] ?? null;
    const priceCents = v?.price ? Math.round(parseFloat(v.price) * 100) : null;
    const compareCents = v?.compare_at_price ? Math.round(parseFloat(v.compare_at_price) * 100) : null;

    const imgSrc =
      product.featured_image ||
      product.image?.src ||
      (product.images?.length
        ? typeof product.images[0] === 'string'
          ? product.images[0]
          : (product.images[0] as { src: string }).src
        : null);

    const img = imgSrc
      ? `<img src="${escapeHtml(imgSrc)}" alt="${t}" class="v-card__img" loading="lazy" width="400" height="400">`
      : '<div class="v-card__placeholder"></div>';

    const badgeHtml = `<div class="v-card__badge" style="background:${escapeHtml(bColor)}">${escapeHtml(badge)}</div>`;
    const catHtml = showCat && product.product_type ? `<div class="v-card__cat">${escapeHtml(product.product_type)}</div>` : '';
    const rateHtml = showRate ? '<div class="v-card__rating">&#9733; 4.8 &middot; 214 reviews</div>' : '';

    let priceHtml: string;
    if (showComp && compareCents && priceCents && compareCents > priceCents) {
      priceHtml =
        `<div class="v-card__prices">` +
        `<span class="v-card__price-old">${formatMoney(compareCents)}</span>` +
        `<span class="v-card__price">${formatMoney(priceCents)}</span></div>`;
    } else {
      priceHtml = `<p class="v-card__price">${priceCents != null ? formatMoney(priceCents) : 'Exclusive'}</p>`;
    }

    const productUrl = `/products/${encodeURIComponent(product.handle)}`;

    if (layout === 'row') {
      const cartHtml = showCart
        ? '<button class="v-card__cart" onclick="event.preventDefault();event.stopPropagation();">Add to cart</button>'
        : '';
      this.innerHTML =
        `<div class="v-card v-card--row">` +
        `<a href="${productUrl}" class="v-card__link v-card__link--row">` +
        `<div class="v-card__imgwrap v-card__imgwrap--row">${badgeHtml}${img}</div>` +
        `<div class="v-card__info">${catHtml}<h3 class="v-card__title">${t}</h3>${rateHtml}${priceHtml}${cartHtml}</div>` +
        `</a></div>`;
      return;
    }

    if (layout === 'minimal') {
      const cartLink = showCart ? '<span class="v-card__cart-link">Add to cart</span>' : '';
      this.innerHTML =
        `<div class="v-card v-card--minimal">` +
        `<a href="${productUrl}" class="v-card__link">` +
        `<div class="v-card__imgwrap">${badgeHtml}${img}</div>` +
        `<div class="v-card__info v-card__info--minimal">${catHtml}<h3 class="v-card__title">${t}</h3>${rateHtml}${priceHtml}${cartLink}</div>` +
        `</a></div>`;
      return;
    }

    const cartHtml = showCart
      ? '<button class="v-card__cart" onclick="event.preventDefault();event.stopPropagation();">Add to cart</button>'
      : '';
    this.innerHTML =
      `<div class="v-card">` +
      `<a href="${productUrl}" class="v-card__link">` +
      `${badgeHtml}<div class="v-card__imgwrap">${img}</div>` +
      `<div class="v-card__info">${catHtml}<h3 class="v-card__title">${t}</h3>${rateHtml}${priceHtml}${cartHtml}</div>` +
      `</a></div>`;
  }
}

customElements.define('vault-product-card', VaultProductCard);
