import { escapeHtml } from '@vault/shared/utils/escape';
import { iconStar, iconClose } from '@vault/shared/constants/svg-icons';
import { afterPaint, ANIM_MS } from './base';
import styles from './vault-toast.styles';

export class VaultToast extends HTMLElement {
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
    const position = this.getAttribute('position') || 'bottom-right';
    const primaryColor = this.getAttribute('primary-color') || '#7c3aed';
    const textColor = this.getAttribute('text-color') || '#ffffff';

    let posCls = 'v-toast--right';
    if (position === 'bottom-left') posCls = 'v-toast--left';
    if (position === 'bottom') posCls = 'v-toast--bottom';
    if (position === 'top') posCls = 'v-toast--top';

    if (!this.shadowRoot) {
      this.attachShadow({ mode: 'open' });
    }

    const btnHtml = buttonText
      ? `<a href="${escapeHtml(buttonUrl)}" class="v-toast__btn">${escapeHtml(buttonText)}</a>`
      : '';

    this.shadowRoot!.innerHTML = `
      <style>${styles}</style>
      <div class="v-toast ${posCls}" role="status" aria-live="polite"
           style="--vault-primary:${escapeHtml(primaryColor)};--vault-text:${escapeHtml(textColor)}">
        <button type="button" class="v-toast__close" data-dismiss aria-label="Dismiss">
          ${iconClose(14, 14)}
        </button>
        <div class="v-toast__icon">${iconStar(20, 20)}</div>
        <p class="v-toast__msg">${escapeHtml(message)}</p>
        ${btnHtml}
      </div>
    `;

    const toast = this.shadowRoot!.querySelector('.v-toast') as HTMLElement;
    afterPaint(() => toast.classList.add('v-toast--visible'));

    const closeBtn = this.shadowRoot!.querySelector('[data-dismiss]')!;
    closeBtn.addEventListener('click', () => {
      toast.classList.remove('v-toast--visible');
      toast.classList.add('v-toast--hiding');
      this._dismissCallback?.();
      setTimeout(() => this.remove(), ANIM_MS);
    });
  }
}

customElements.define('vault-toast', VaultToast);
