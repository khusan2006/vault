export type DisplayType = 'banner' | 'modal' | 'toast' | 'badge';
export type DisplayPosition = 'top' | 'bottom' | 'bottom-right' | 'bottom-left';
export type ShowFrequency = 'every_visit' | 'once_per_session' | 'once_per_day' | 'once_per_week';
export interface DisplayVisuals {
    primaryColor: string;
    textColor: string;
    position: DisplayPosition;
}
export interface DisplayBehavior {
    autoDismissSeconds: number | null;
    showFrequency: ShowFrequency;
}
export interface NotificationDisplayConfig {
    type: DisplayType;
    message: string;
    buttonText: string;
    buttonUrl: string;
    visuals: {
        primaryColor: string;
        textColor: string;
        position: DisplayPosition;
    };
    behavior: {
        autoDismissSeconds: number | null;
        showFrequency: ShowFrequency;
    };
}
export type ItemLayout = 'card' | 'row' | 'minimal';
export interface LandingPageDisplayConfig {
    enabled: boolean;
    heading: string;
    subheading: string;
    gridColumns: 2 | 3 | 4;
    badgeText: string;
    badgeColor: string;
    itemLayout: ItemLayout;
    showAddToCart: boolean;
    showCategory: boolean;
    showCompareAt: boolean;
    showRatings: boolean;
}
export interface ProductPageDisplayConfig {
    showStrikethroughPricing: boolean;
    discountBadge: {
        enabled: boolean;
        text: string;
        color: string;
    };
    banner: {
        enabled: boolean;
        message: string;
        bgColor: string;
        textColor: string;
    } | null;
}
export type TimerStyle = 'default' | 'minimal' | 'urgent';
export type TimerPosition = 'above_add_to_cart' | 'below_price' | 'above_title';
export type TimerType = 'per_customer' | 'global';
export interface TimerDisplayConfig {
    timerType: TimerType;
    position: TimerPosition;
    expiredMessage: string;
    style: TimerStyle;
}
export interface EarlyAccessDisplayConfig {
    notification: NotificationDisplayConfig;
    landingPage: LandingPageDisplayConfig;
}
export interface DiscountedProductDisplayConfig {
    notification: NotificationDisplayConfig;
    landingPage: LandingPageDisplayConfig;
    productPage: ProductPageDisplayConfig;
}
export interface TimerSaleDisplayConfig {
    notification: NotificationDisplayConfig;
    productPage: ProductPageDisplayConfig;
    timer: TimerDisplayConfig;
}
export type CampaignDisplayConfig = EarlyAccessDisplayConfig | DiscountedProductDisplayConfig | TimerSaleDisplayConfig;
export type CampaignDisplayConfigByType = {
    early_access: EarlyAccessDisplayConfig;
    discounted_product: DiscountedProductDisplayConfig;
    timer_sale: TimerSaleDisplayConfig;
};
