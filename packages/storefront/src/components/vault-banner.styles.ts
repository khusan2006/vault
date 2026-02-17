export default `
:host {
  display: block;
}

.v-banner {
  width: 100%;
  background: var(--vault-primary, #7c3aed);
  color: var(--vault-text, #fff);
  overflow: hidden;
  max-height: 0;
  transition: max-height 0.35s cubic-bezier(0.16, 1, 0.3, 1);
}

.v-banner--bottom {
  position: fixed;
  bottom: 0;
  left: 0;
  right: 0;
  z-index: 9999;
  max-height: none;
  transform: translateY(100%);
  transition: transform 0.35s cubic-bezier(0.16, 1, 0.3, 1);
}

.v-banner--visible:not(.v-banner--bottom) {
  max-height: 120px;
}

.v-banner--bottom.v-banner--visible {
  transform: translateY(0);
}

.v-banner--hiding:not(.v-banner--bottom) {
  max-height: 0;
}

.v-banner--bottom.v-banner--hiding {
  transform: translateY(100%);
}

.v-banner__inner {
  max-width: 1200px;
  margin: 0 auto;
  padding: 12px 20px;
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 16px;
}

.v-banner__body {
  display: flex;
  align-items: center;
  gap: 10px;
  flex: 1;
  min-width: 0;
}

.v-banner__msg {
  font-size: var(--vault-notif-font-size, 14px);
  font-weight: 600;
  line-height: 1.4;
}

.v-banner__actions {
  display: flex;
  align-items: center;
  gap: 12px;
  flex-shrink: 0;
}

.v-banner__btn {
  display: inline-flex;
  align-items: center;
  padding: 8px 20px;
  background: #fff;
  color: var(--vault-primary, #7c3aed);
  font-size: 13px;
  font-weight: 700;
  text-decoration: none;
  border-radius: var(--vault-notif-button-radius, 6px);
  transition: background 0.15s, transform 0.15s;
  white-space: nowrap;
}

.v-banner__btn:hover {
  background: #f5f3ff;
  transform: translateY(-1px);
}

.v-banner__close {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 28px;
  height: 28px;
  padding: 0;
  background: rgba(255, 255, 255, 0.15);
  border: none;
  border-radius: 4px;
  color: var(--vault-text, #fff);
  cursor: pointer;
  transition: background 0.15s;
}

.v-banner__close:hover {
  background: rgba(255, 255, 255, 0.25);
}

.v-banner__close:focus-visible {
  outline: 2px solid #fff;
  outline-offset: 2px;
}

@media (max-width: 640px) {
  .v-banner__inner {
    flex-wrap: wrap;
    padding: 10px 16px;
    gap: 10px;
  }

  .v-banner__body {
    width: 100%;
  }

  .v-banner__actions {
    width: 100%;
    justify-content: space-between;
  }

  .v-banner__btn {
    flex: 1;
    justify-content: center;
  }
}

@media (prefers-reduced-motion: reduce) {
  .v-banner,
  .v-banner--bottom,
  .v-banner__btn {
    transition-duration: 0.01ms !important;
  }
}
`;
