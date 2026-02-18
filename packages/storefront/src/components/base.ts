export function afterPaint(fn: () => void): void {
  requestAnimationFrame(() => requestAnimationFrame(fn));
}

export const ANIM_MS = 350;
