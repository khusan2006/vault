import { Icon } from "@shopify/polaris";
import {
  CartIcon,
  MenuIcon,
  PersonIcon,
  SearchIcon,
} from "@shopify/polaris-icons";

interface MockStorefrontHeaderProps {
  mobile?: boolean;
}

export function MockStorefrontHeader({ mobile }: MockStorefrontHeaderProps) {
  return (
    <div
      className={`flex items-center justify-between border-b border-slate-200 bg-white ${
        mobile ? "px-4 py-3" : "px-8 py-4"
      }`}
    >
      <div className="flex items-center gap-4">
        {mobile && <Icon source={MenuIcon} tone="subdued" />}
        {!mobile && (
          <div className="flex items-center gap-5">
            <div className="text-lg font-extrabold tracking-[-0.6px] text-slate-900">
              THE VAULT
            </div>
            <div className="flex items-center gap-4 text-xs font-semibold uppercase tracking-[0.08em] text-slate-400">
              <span>New</span>
              <span>Collections</span>
              <span>Members</span>
            </div>
          </div>
        )}
      </div>

      {mobile && (
        <div className="text-base font-bold tracking-[-0.5px] text-slate-900">
          THE VAULT
        </div>
      )}

      <div className="flex items-center gap-4">
        <Icon source={SearchIcon} tone="subdued" />
        {!mobile && <Icon source={PersonIcon} tone="subdued" />}
        <Icon source={CartIcon} tone="subdued" />
      </div>
    </div>
  );
}

