import { escapeHtml } from '@vault/shared/utils/escape';
import { iconStar } from '@vault/shared/constants/svg-icons';
import { afterPaint } from './base';
import styles from './vault-badge.styles';

export class VaultBadge extends HTMLElement {
  static observedAttributes = [
    'message', 'button-text', 'button-url',
    'position', 'primary-color', 'text-color',
  ];

  connectedCallback() {
    this.render();
  }

  attributeChangedCallback() {
    if (this.isConnected) this.render();
  }

  private render() {
    const message = this.getAttribute('message') || '';
    const buttonText = this.getAttribute('button-text') || '';
    const buttonUrl = this.getAttribute('button-url') || '';
    const position = this.getAttribute('position') || 'bottom-right';
    const primaryColor = this.getAttribute('primary-color') || '#7c3aed';
    const textColor = this.getAttribute('text-color') || '#ffffff';

    const posCls = position === 'bottom-left' ? 'v-badge--left' : 'v-badge--right';

    if (!this.shadowRoot) {
      this.attachShadow({ mode: 'open' });
    }

    const btnHtml = buttonText
      ? `<a href="${escapeHtml(buttonUrl)}" class="v-badge__btn">${escapeHtml(buttonText)}</a>`
      : '';

    this.shadowRoot!.innerHTML = `
      <style>${styles}</style>
      <div class="v-badge ${posCls}"
           style="--vault-primary:${escapeHtml(primaryColor)};--vault-text:${escapeHtml(textColor)}">
        <div class="v-badge__panel" aria-hidden="true">
          <p class="v-badge__msg">${escapeHtml(message)}</p>
          ${btnHtml}
        </div>
        <button type="button" class="v-badge__trigger" aria-label="View benefits" aria-expanded="false">
          ${iconStar(24, 24)}
        </button>
      </div>
    `;

    const badge = this.shadowRoot!.querySelector('.v-badge') as HTMLElement;
    const trigger = this.shadowRoot!.querySelector('.v-badge__trigger') as HTMLElement;
    const panel = this.shadowRoot!.querySelector('.v-badge__panel') as HTMLElement;

    afterPaint(() => badge.classList.add('v-badge--visible'));

    const toggle = (expanded: boolean) => {
      badge.classList.toggle('v-badge--expanded', expanded);
      panel.setAttribute('aria-hidden', String(!expanded));
      trigger.setAttribute('aria-expanded', String(expanded));
    };

    trigger.addEventListener('click', () => {
      toggle(trigger.getAttribute('aria-expanded') !== 'true');
    });

    document.addEventListener('click', (e) => {
      if (trigger.getAttribute('aria-expanded') === 'true' && !this.contains(e.target as Node)) {
        toggle(false);
      }
    });

    document.addEventListener('keydown', (e) => {
      if (e.key === 'Escape' && trigger.getAttribute('aria-expanded') === 'true') {
        toggle(false);
        trigger.focus();
      }
    });
  }
}

customElements.define('vault-badge', VaultBadge);
