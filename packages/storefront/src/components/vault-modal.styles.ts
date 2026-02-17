export default `
:host {
  display: block;
}

.v-modal {
  position: fixed;
  inset: 0;
  z-index: 10000;
  display: flex;
  align-items: center;
  justify-content: center;
  opacity: 0;
  transition: opacity 0.25s;
  pointer-events: none;
}

.v-modal--visible {
  opacity: 1;
  pointer-events: auto;
}

.v-modal--hiding {
  opacity: 0;
  pointer-events: none;
}

.v-modal__overlay {
  position: absolute;
  inset: 0;
  background: rgba(0, 0, 0, 0.45);
  backdrop-filter: blur(2px);
  -webkit-backdrop-filter: blur(2px);
}

.v-modal__box {
  position: relative;
  width: 90%;
  max-width: 420px;
  background: #fff;
  border-radius: var(--vault-notif-border-radius, 16px);
  padding: 32px;
  text-align: center;
  box-shadow: 0 20px 60px rgba(0, 0, 0, 0.15);
  transform: scale(0.95) translateY(10px);
  transition: transform 0.3s cubic-bezier(0.16, 1, 0.3, 1);
}

.v-modal--visible .v-modal__box {
  transform: scale(1) translateY(0);
}

.v-modal--hiding .v-modal__box {
  transform: scale(0.95) translateY(10px);
}

.v-modal__close {
  position: absolute;
  top: 12px;
  right: 12px;
  display: flex;
  align-items: center;
  justify-content: center;
  width: 32px;
  height: 32px;
  padding: 0;
  background: transparent;
  border: none;
  border-radius: 6px;
  color: #9ca3af;
  cursor: pointer;
  transition: color 0.15s, background 0.15s;
}

.v-modal__close:hover {
  color: #374151;
  background: #f3f4f6;
}

.v-modal__close:focus-visible {
  outline: 2px solid var(--vault-primary, #7c3aed);
  outline-offset: 2px;
}

.v-modal__icon {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  width: 56px;
  height: 56px;
  border-radius: 50%;
  background: var(--vault-primary, #7c3aed);
  color: var(--vault-text, #fff);
  margin-bottom: 16px;
}

.v-modal__title {
  font-size: 18px;
  font-weight: 700;
  color: #18181b;
  line-height: 1.4;
  margin: 0 0 20px;
}

.v-modal__btn {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  padding: 12px 28px;
  background: var(--vault-primary, #7c3aed);
  color: var(--vault-text, #fff);
  font-size: 15px;
  font-weight: 700;
  text-decoration: none;
  border-radius: var(--vault-notif-button-radius, 8px);
  transition: opacity 0.15s, transform 0.15s;
}

.v-modal__btn:hover {
  opacity: 0.9;
  transform: translateY(-1px);
}

@media (prefers-reduced-motion: reduce) {
  .v-modal,
  .v-modal__box,
  .v-modal__btn {
    transition-duration: 0.01ms !important;
  }
}
`;
