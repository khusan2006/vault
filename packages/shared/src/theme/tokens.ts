import type { ThemeConfig, StyleTokens } from '../types/display-config.types';
import { PRESETS } from './presets';

/**
 * Resolves a ThemeConfig into a complete StyleTokens object
 * by merging the preset base with any overrides.
 */
export function resolveTokens(theme?: ThemeConfig): StyleTokens {
  const base = PRESETS[theme?.preset ?? 'rounded'];
  if (!theme?.overrides) return base;
  return { ...base, ...theme.overrides };
}

/**
 * Converts camelCase token key to kebab-case CSS var name.
 * e.g. "cardBorderRadius" -> "--vault-card-border-radius"
 */
function toVarName(key: string): string {
  const kebab = key.replace(/[A-Z]/g, (m) => `-${m.toLowerCase()}`);
  return `--vault-${kebab}`;
}

export const SHADOW_PRESETS: Record<string, string> = {
  none: 'none',
  subtle: '0 1px 3px rgba(0, 0, 0, 0.08)',
  medium: '0 4px 12px rgba(0, 0, 0, 0.1)',
  strong: '0 10px 20px -16px rgba(15, 23, 42, 0.4)',
};

/**
 * Converts a StyleTokens object into CSS custom property key-value pairs.
 * e.g. { cardBorderRadius: '16px' } -> { '--vault-card-border-radius': '16px' }
 */
export function tokensToCSS(tokens: StyleTokens): Record<string, string> {
  const vars: Record<string, string> = {};
  for (const [key, value] of Object.entries(tokens)) {
    vars[toVarName(key)] = value;
  }
  return vars;
}

/**
 * Returns the default (rounded) preset tokens.
 */
export function defaultTokens(): StyleTokens {
  return { ...PRESETS.rounded };
}
