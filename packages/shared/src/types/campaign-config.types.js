export function isEarlyAccessConfig(type, _config) {
    return type === 'early_access';
}
export function isDiscountedProductConfig(type, _config) {
    return type === 'discounted_product';
}
export function isTimerSaleConfig(type, _config) {
    return type === 'timer_sale';
}
export const DEFAULT_CONFIGS = {
    early_access: {
        productIds: [],
        collectionIds: [],
    },
    discounted_product: {
        productIds: [],
        collectionIds: [],
        discount: { type: 'percentage', value: 0 },
    },
    timer_sale: {
        productIds: [],
        collectionIds: [],
        discount: { type: 'percentage', value: 0 },
        discountMethod: 'price_change',
        timerDurationMinutes: 60,
        showCountdown: true,
        timerType: 'per_customer',
    },
};
//# sourceMappingURL=campaign-config.types.js.map