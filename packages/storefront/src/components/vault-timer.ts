import { escapeHtml } from '@vault/shared/utils/escape';
import { pad } from '@vault/shared/utils/time';
import { iconClock } from '@vault/shared/constants/svg-icons';
import styles from './vault-timer.styles';

export class VaultTimer extends HTMLElement {
  static observedAttributes = [
    'end-time', 'duration', 'style-variant', 'label', 'expired-message',
  ];

  private _interval: ReturnType<typeof setInterval> | null = null;

  connectedCallback() {
    this.render();
  }

  disconnectedCallback() {
    if (this._interval) clearInterval(this._interval);
  }

  attributeChangedCallback() {
    if (this.isConnected) this.render();
  }

  private getRemaining(): number {
    const endTime = this.getAttribute('end-time');
    const duration = this.getAttribute('duration');

    if (endTime) {
      return new Date(endTime).getTime() - Date.now();
    }
    if (duration) {
      return parseInt(duration, 10);
    }
    return 0;
  }

  private render() {
    const styleVariant = this.getAttribute('style-variant') || 'urgent';
    const label = this.getAttribute('label') || 'Special offer — Hurry!';
    const expiredMessage = this.getAttribute('expired-message') || 'This offer has expired';

    if (!this.shadowRoot) {
      this.attachShadow({ mode: 'open' });
    }

    if (this._interval) {
      clearInterval(this._interval);
      this._interval = null;
    }

    const container = document.createElement('div');
    container.className = `v-timer v-timer--${escapeHtml(styleVariant)}`;
    container.setAttribute('role', 'timer');
    container.setAttribute('aria-live', 'polite');

    const startTime = Date.now();
    const initialRemaining = this.getRemaining();

    const tick = () => {
      const elapsed = Date.now() - startTime;
      const r = initialRemaining - elapsed;

      if (r <= 0) {
        container.innerHTML = `<div class="v-timer__expired"><span class="v-timer__label">${escapeHtml(expiredMessage)}</span></div>`;
        if (this._interval) clearInterval(this._interval);
        return;
      }

      const d = Math.floor(r / 86400000);
      const h = Math.floor((r % 86400000) / 3600000);
      const m = Math.floor((r % 3600000) / 60000);
      const s = Math.floor((r % 60000) / 1000);

      let digits = '';
      if (d > 0) {
        digits += `<span class="v-timer__unit"><span class="v-timer__num">${d}</span><span class="v-timer__sep">d</span></span>`;
      }
      digits +=
        `<span class="v-timer__unit"><span class="v-timer__num">${pad(h)}</span><span class="v-timer__sep">h</span></span>` +
        `<span class="v-timer__unit"><span class="v-timer__num">${pad(m)}</span><span class="v-timer__sep">m</span></span>` +
        `<span class="v-timer__unit"><span class="v-timer__num">${pad(s)}</span><span class="v-timer__sep">s</span></span>`;

      container.innerHTML = `
        <div class="v-timer__inner">
          <div class="v-timer__header">${iconClock(16, 16)}<span class="v-timer__label">${escapeHtml(label)}</span></div>
          <div class="v-timer__digits">${digits}</div>
        </div>
      `;
    };

    tick();
    this._interval = setInterval(tick, 1000);

    this.shadowRoot!.innerHTML = `<style>${styles}</style>`;
    this.shadowRoot!.appendChild(container);
  }
}

customElements.define('vault-timer', VaultTimer);
