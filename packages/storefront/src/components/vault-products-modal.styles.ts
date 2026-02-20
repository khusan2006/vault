export default `
:host {
  display: block;
}

.v-pm {
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

.v-pm--visible {
  opacity: 1;
  pointer-events: auto;
}

.v-pm--hiding {
  opacity: 0;
  pointer-events: none;
}

.v-pm__overlay {
  position: absolute;
  inset: 0;
  background: rgba(0, 0, 0, 0.45);
  backdrop-filter: blur(2px);
  -webkit-backdrop-filter: blur(2px);
}

.v-pm__box {
  position: relative;
  width: 92%;
  max-width: 800px;
  max-height: 85vh;
  background: #fff;
  border-radius: var(--vault-notif-border-radius, 16px);
  display: flex;
  flex-direction: column;
  overflow: hidden;
  box-shadow: 0 20px 60px rgba(0, 0, 0, 0.18);
  transform: scale(0.95) translateY(10px);
  transition: transform 0.3s cubic-bezier(0.16, 1, 0.3, 1);
}

.v-pm--visible .v-pm__box {
  transform: scale(1) translateY(0);
}

.v-pm--hiding .v-pm__box {
  transform: scale(0.95) translateY(10px);
}

.v-pm__header {
  display: flex;
  align-items: flex-start;
  justify-content: space-between;
  padding: 24px 24px 0;
  gap: 16px;
}

.v-pm__title {
  font-size: 20px;
  font-weight: var(--vault-title-weight, 600);
  color: #18181b;
  line-height: 1.3;
  margin: 0;
}

.v-pm__subtitle {
  font-size: 14px;
  color: #6b7280;
  font-weight: var(--vault-subtitle-weight, 400);
  line-height: 1.4;
  margin: 4px 0 0;
}

.v-pm__close {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 32px;
  height: 32px;
  min-width: 32px;
  padding: 0;
  background: transparent;
  border: none;
  border-radius: 6px;
  color: #9ca3af;
  cursor: pointer;
  transition: color 0.15s, background 0.15s;
}

.v-pm__close:hover {
  color: #374151;
  background: #f3f4f6;
}

.v-pm__close:focus-visible {
  outline: 2px solid var(--vault-primary, #7c3aed);
  outline-offset: 2px;
}

.v-pm__body {
  flex: 1;
  overflow-y: auto;
  padding: 20px 24px 24px;
  -webkit-overflow-scrolling: touch;
}

.v-pm__grid {
  display: grid;
  grid-template-columns: repeat(var(--vault-cols, 2), 1fr);
  gap: var(--vault-grid-gap, 20px);
}

.v-pm__empty {
  text-align: center;
  color: #94a3b8;
  padding: 40px 0;
  font-size: 15px;
}

.v-pm__loading {
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 60px 0;
}

.v-pm__spinner {
  width: 32px;
  height: 32px;
  border: 3px solid #e2e8f0;
  border-top-color: var(--vault-primary, #7c3aed);
  border-radius: 50%;
  animation: v-pm-spin 0.7s linear infinite;
}

@keyframes v-pm-spin {
  to { transform: rotate(360deg); }
}

@media (max-width: 640px) {
  .v-pm__box {
    width: 96%;
    max-height: 90vh;
    border-radius: 12px;
  }

  .v-pm__header {
    padding: 16px 16px 0;
  }

  .v-pm__body {
    padding: 16px;
  }

  .v-pm__grid {
    grid-template-columns: 1fr;
    gap: 12px;
  }

  .v-pm__title {
    font-size: 18px;
  }
}

@media (prefers-reduced-motion: reduce) {
  .v-pm,
  .v-pm__box,
  .v-pm__spinner {
    transition-duration: 0.01ms !important;
    animation-duration: 0.01ms !important;
  }
}
`;
