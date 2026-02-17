export default `
.v-card {
  border-radius: var(--vault-card-border-radius, 16px);
  overflow: hidden;
  background: var(--vault-card-background, #fff);
  border: 1px solid var(--vault-card-border-color, #e2e8f0);
  transition: box-shadow 0.2s, transform 0.2s;
  position: relative;
  box-shadow: var(--vault-card-shadow, 0 10px 20px -16px rgba(15, 23, 42, 0.4));
}

.v-card:hover {
  box-shadow: var(--vault-card-hover-shadow, 0 8px 24px rgba(0, 0, 0, 0.08));
  transform: translateY(var(--vault-card-hover-lift, -2px));
}

.v-card__link {
  text-decoration: none;
  color: inherit;
  display: block;
}

.v-card__badge {
  position: absolute;
  top: 10px;
  left: 10px;
  z-index: 2;
  display: inline-flex;
  align-items: center;
  gap: 4px;
  padding: 4px 10px;
  background: var(--vault-badge-color, #7c3aed);
  color: #fff;
  font-size: 10px;
  font-weight: 600;
  text-transform: uppercase;
  letter-spacing: 0.06em;
  border-radius: 999px;
}

.v-card__imgwrap {
  aspect-ratio: var(--vault-card-image-aspect-ratio, 3/4);
  overflow: hidden;
  background: #f9fafb;
  position: relative;
}

.v-card__img {
  width: 100%;
  height: 100%;
  object-fit: cover;
  transition: transform 0.3s;
}

.v-card:hover .v-card__img {
  transform: scale(1.03);
}

.v-card__placeholder {
  width: 100%;
  height: 100%;
  background: #f3f4f6;
}

.v-card__info {
  padding: var(--vault-card-info-padding, 12px 16px);
  display: flex;
  flex-direction: column;
  gap: 6px;
}

.v-card__cat {
  font-size: 10px;
  letter-spacing: 0.12em;
  text-transform: uppercase;
  color: #94a3b8;
  font-weight: 600;
}

.v-card__title {
  font-size: var(--vault-card-title-size, 14px);
  font-weight: 600;
  color: var(--vault-card-title-color, #0f172a);
  margin: 0;
  line-height: 1.3;
}

.v-card__rating {
  font-size: 12px;
  color: #64748b;
}

.v-card__price {
  font-size: var(--vault-card-price-size, 14px);
  color: var(--vault-card-price-color, #0f172a);
  font-weight: 600;
  margin: 0;
}

.v-card__prices {
  display: flex;
  align-items: baseline;
  gap: 8px;
}

.v-card__price-old {
  font-size: 12px;
  color: #94a3b8;
  text-decoration: line-through;
}

.v-card__cart {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  background: var(--vault-card-button-bg, #0f172a);
  color: var(--vault-card-button-color, #fff);
  border: none;
  padding: 8px 14px;
  border-radius: var(--vault-card-button-radius, 8px);
  font-size: 12px;
  font-weight: 600;
  cursor: pointer;
  transition: background 0.15s;
  margin-top: 4px;
}

.v-card__cart:hover {
  background: #1e293b;
}

.v-card__cart-link {
  font-size: 12px;
  font-weight: 600;
  text-transform: uppercase;
  letter-spacing: 0.08em;
  color: #0f172a;
  margin-top: 4px;
  cursor: pointer;
}

.v-card--row {
  border-radius: var(--vault-card-border-radius, 18px);
  padding: 14px;
}

.v-card--row .v-card__link--row {
  display: grid;
  grid-template-columns: 120px 1fr;
  gap: 16px;
  align-items: center;
}

.v-card--row .v-card__imgwrap--row {
  width: 100%;
  aspect-ratio: var(--vault-card-image-aspect-ratio, 3/4);
  border-radius: var(--vault-card-border-radius, 14px);
  overflow: hidden;
  position: relative;
}

.v-card--row .v-card__info {
  padding: 0;
}

.v-card--minimal {
  border-radius: var(--vault-card-border-radius, 14px);
  border: 1px solid var(--vault-card-border-color, #e2e8f0);
  box-shadow: var(--vault-card-shadow, none);
  background: transparent;
  overflow: visible;
}

.v-card--minimal .v-card__imgwrap {
  border-radius: var(--vault-card-border-radius, 14px);
  border: 1px solid var(--vault-card-border-color, #e2e8f0);
}

.v-card--minimal .v-card__info--minimal {
  padding: 10px 0 0;
}

@media (max-width: 640px) {
  .v-card__info {
    padding: 10px;
  }

  .v-card--row .v-card__link--row {
    grid-template-columns: 90px 1fr;
    gap: 12px;
  }
}

@media (prefers-reduced-motion: reduce) {
  .v-card,
  .v-card__img {
    transition-duration: 0.01ms !important;
  }
}
`;
