import { escapeHtml } from '@vault/shared/utils/escape';
import { iconClose } from '@vault/shared/constants/svg-icons';
import { afterPaint, ANIM_MS } from './base';
import styles from './vault-banner.styles';

export class VaultBanner extends HTMLElement {
  static observedAttributes = [
    'message', 'button-text', 'button-url',
    'position', 'primary-color', 'text-color',
  ];

  private _dismissCallback: (() => void) | null = null;

  connectedCallback() {
    this.render();
  }

  attributeChangedCallback() {
    if (this.isConnected) this.render();
  }

  set onDismiss(fn: (() => void) | null) {
    this._dismissCallback = fn;
  }

  private render() {
    const message = this.getAttribute('message') || '';
    const buttonText = this.getAttribute('button-text') || '';
    const buttonUrl = this.getAttribute('button-url') || '';
    const position = this.getAttribute('position') || 'top';
    const primaryColor = this.getAttribute('primary-color') || '#7c3aed';
    const textColor = this.getAttribute('text-color') || '#ffffff';

    if (!this.shadowRoot) {
      this.attachShadow({ mode: 'open' });
    }

    const btnHtml = buttonText
      ? `<a href="${escapeHtml(buttonUrl)}" class="v-banner__btn">${escapeHtml(buttonText)}</a>`
      : '';

    this.shadowRoot!.innerHTML = `
      <style>${styles}</style>
      <div class="v-banner v-banner--${position}" role="region" aria-label="Notification"
           style="--vault-primary:${escapeHtml(primaryColor)};--vault-text:${escapeHtml(textColor)}">
        <div class="v-banner__inner">
          <div class="v-banner__body">
            <span class="v-banner__msg">${escapeHtml(message)}</span>
          </div>
          <div class="v-banner__actions">
            ${btnHtml}
            <button type="button" class="v-banner__close" data-dismiss aria-label="Dismiss">
              ${iconClose(16, 16)}
            </button>
          </div>
        </div>
      </div>
    `;

    const banner = this.shadowRoot!.querySelector('.v-banner') as HTMLElement;
    afterPaint(() => banner.classList.add('v-banner--visible'));

    const closeBtn = this.shadowRoot!.querySelector('[data-dismiss]')!;
    closeBtn.addEventListener('click', () => {
      banner.classList.remove('v-banner--visible');
      banner.classList.add('v-banner--hiding');
      this._dismissCallback?.();
      setTimeout(() => this.remove(), ANIM_MS);
    });
  }
}

customElements.define('vault-banner', VaultBanner);
