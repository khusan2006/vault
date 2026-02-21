import { createDefaultDisplayConfig } from './defaults.js';
function mergeNotification(base, override) {
    if (!override)
        return base;
    return {
        ...base,
        ...override,
        visuals: {
            ...base.visuals,
            ...(override.visuals ?? {}),
        },
        behavior: {
            ...base.behavior,
            ...(override.behavior ?? {}),
        },
    };
}
function mergeLandingPage(base, override) {
    return { ...base, ...(override ?? {}) };
}
function mergeProductPage(base, override) {
    if (!override)
        return base;
    return {
        ...base,
        ...override,
        discountBadge: {
            ...base.discountBadge,
            ...(override.discountBadge ?? {}),
        },
        banner: override.banner ?? base.banner,
    };
}
function mergeTimer(base, override) {
    return { ...base, ...(override ?? {}) };
}
export function normalizeDisplayConfig(type, displayConfig, defaultsOverride) {
    switch (type) {
        case 'early_access': {
            const defaults = defaultsOverride ?? createDefaultDisplayConfig('early_access');
            if (!displayConfig)
                return defaults;
            const provided = displayConfig;
            return {
                notification: mergeNotification(defaults.notification, provided.notification),
                landingPage: mergeLandingPage(defaults.landingPage, provided.landingPage),
                theme: provided.theme,
            };
        }
        case 'discounted_product': {
            const defaults = defaultsOverride ?? createDefaultDisplayConfig('discounted_product');
            if (!displayConfig)
                return defaults;
            const provided = displayConfig;
            return {
                notification: mergeNotification(defaults.notification, provided.notification),
                landingPage: mergeLandingPage(defaults.landingPage, provided.landingPage),
                productPage: mergeProductPage(defaults.productPage, provided.productPage),
                theme: provided.theme,
            };
        }
        case 'timer_sale': {
            const defaults = defaultsOverride ?? createDefaultDisplayConfig('timer_sale');
            if (!displayConfig)
                return defaults;
            const provided = displayConfig;
            return {
                notification: mergeNotification(defaults.notification, provided.notification),
                productPage: mergeProductPage(defaults.productPage, provided.productPage),
                timer: mergeTimer(defaults.timer, provided.timer),
                theme: provided.theme,
            };
        }
    }
}
//# sourceMappingURL=normalize.js.map
