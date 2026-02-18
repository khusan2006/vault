import { escapeHtml } from '@vault/shared/utils/escape';
import { iconStar, iconClose } from '@vault/shared/constants/svg-icons';
import { afterPaint, ANIM_MS } from './base';
import styles from './vault-modal.styles';

export class VaultModal extends HTMLElement {
  static observedAttributes = [
    'message', 'button-text', 'button-url',
    'primary-color', 'text-color',
  ];

  private _dismissCallback: (() => void) | null = null;
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

  set onDismiss(fn: (() => void) | null) {
    this._dismissCallback = fn;
  }

  private render() {
    const message = this.getAttribute('message') || '';
    const buttonText = this.getAttribute('button-text') || '';
    const buttonUrl = this.getAttribute('button-url') || '';
    const primaryColor = this.getAttribute('primary-color') || '#7c3aed';
    const textColor = this.getAttribute('text-color') || '#ffffff';

    if (!this.shadowRoot) {
      this.attachShadow({ mode: 'open' });
    }

    const btnHtml = buttonText
      ? `<a href="${escapeHtml(buttonUrl)}" class="v-modal__btn">${escapeHtml(buttonText)}</a>`
      : '';

    this.shadowRoot!.innerHTML = `
      <style>${styles}</style>
      <div class="v-modal" role="dialog" aria-modal="true"
           style="--vault-primary:${escapeHtml(primaryColor)};--vault-text:${escapeHtml(textColor)}">
        <div class="v-modal__overlay" data-dismiss></div>
        <div class="v-modal__box">
          <button type="button" class="v-modal__close" data-dismiss aria-label="Close">
            ${iconClose(20, 20)}
          </button>
          <div class="v-modal__icon">${iconStar(32, 32)}</div>
          <h2 class="v-modal__title">${escapeHtml(message)}</h2>
          ${btnHtml}
        </div>
      </div>
    `;

    const modal = this.shadowRoot!.querySelector('.v-modal') as HTMLElement;
    const closeBtn = this.shadowRoot!.querySelector('.v-modal__close') as HTMLElement;

    afterPaint(() => {
      modal.classList.add('v-modal--visible');
      closeBtn.focus();
    });

    const dismiss = () => {
      modal.classList.remove('v-modal--visible');
      modal.classList.add('v-modal--hiding');
      this._dismissCallback?.();
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

customElements.define('vault-modal', VaultModal);
