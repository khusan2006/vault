import { Star, X, Tag, Clock, ShoppingCart } from 'lucide-static';

function resize(svg: string, w: number, h: number): string {
  return svg
    .replace(/width="\d+"/, `width="${w}"`)
    .replace(/height="\d+"/, `height="${h}"`);
}

export const iconStar = (w = 24, h = 24) => resize(Star, w, h);
export const iconClose = (w = 24, h = 24) => resize(X, w, h);
export const iconTag = (w = 24, h = 24) => resize(Tag, w, h);
export const iconClock = (w = 24, h = 24) => resize(Clock, w, h);
export const iconCart = (w = 24, h = 24) => resize(ShoppingCart, w, h);
