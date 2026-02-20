import { escapeHtml } from '@vault/shared/utils/escape';
import { iconClose } from '@vault/shared/constants/svg-icons';
import { afterPaint, ANIM_MS } from './base';
import styles from './vault-products-modal.styles';

/**
 * Full-screen product gallery modal.
 * Used when storefrontApproach === 'modal' — the notification CTA opens this
 * overlay which displays exclusive products in a scrollable grid.
 */
export class VaultProductsModal extends HTMLElement {
  static observedAttributes = ['heading', 'subheading', 'primary-color'];

  private _keyHandler: ((e: KeyboardEvent) => void) | null = null;

  connectedCallback() {
    this.render();
  }

  disconnectedCallback() {
    if (this._keyHandler) {
      document.removeEventListener('keydown', this._keyHandler);
    }
  }

  attributeChangedCallback() {
    if (this.isConnected) this.render();
  }

  /** Call after creating the element to populate product cards into the grid. */
  setProducts(cardElements: HTMLElement[]): void {
    const grid = this.shadowRoot?.querySelector('.v-pm__grid');
    const loading = this.shadowRoot?.querySelector('.v-pm__loading');
    if (!grid) return;

    if (loading) loading.remove();
    grid.innerHTML = '';

    if (!cardElements.length) {
      grid.innerHTML = '<p class="v-pm__empty">No exclusive products available right now.</p>';
      return;
    }

    for (const card of cardElements) {
      const slot = document.createElement('div');
      slot.appendChild(card);
      grid.appendChild(slot);
    }
  }

  private render() {
    const heading = this.getAttribute('heading') || 'Exclusive Products';
    const subheading = this.getAttribute('subheading') || '';
    const primaryColor = this.getAttribute('primary-color') || '#7c3aed';

    if (!this.shadowRoot) {
      this.attachShadow({ mode: 'open' });
    }

    const subHtml = subheading
      ? `<p class="v-pm__subtitle">${escapeHtml(subheading)}</p>`
      : '';

    this.shadowRoot!.innerHTML = `
      <style>${styles}</style>
      <div class="v-pm" role="dialog" aria-modal="true" aria-label="${escapeHtml(heading)}"
           style="--vault-primary:${escapeHtml(primaryColor)}">
        <div class="v-pm__overlay" data-dismiss></div>
        <div class="v-pm__box">
          <div class="v-pm__header">
            <div>
              <h2 class="v-pm__title">${escapeHtml(heading)}</h2>
              ${subHtml}
            </div>
            <button type="button" class="v-pm__close" data-dismiss aria-label="Close">
              ${iconClose(20, 20)}
            </button>
          </div>
          <div class="v-pm__body">
            <div class="v-pm__grid">
              <div class="v-pm__loading"><div class="v-pm__spinner"></div></div>
            </div>
          </div>
        </div>
      </div>
    `;

    const modal = this.shadowRoot!.querySelector('.v-pm') as HTMLElement;
    const closeBtn = this.shadowRoot!.querySelector('.v-pm__close') as HTMLElement;

    afterPaint(() => {
      modal.classList.add('v-pm--visible');
      closeBtn.focus();
    });

    const dismiss = () => {
      modal.classList.remove('v-pm--visible');
      modal.classList.add('v-pm--hiding');
      if (this._keyHandler) document.removeEventListener('keydown', this._keyHandler);
      setTimeout(() => this.remove(), ANIM_MS);
    };

    this.shadowRoot!.querySelectorAll('[data-dismiss]').forEach((el) => {
      el.addEventListener('click', dismiss);
    });

    this._keyHandler = (e: KeyboardEvent) => {
      if (e.key === 'Escape') dismiss();
    };
    document.addEventListener('keydown', this._keyHandler);
  }
}

customElements.define('vault-products-modal', VaultProductsModal);
