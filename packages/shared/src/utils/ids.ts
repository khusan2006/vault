/** Extract the numeric ID from a Shopify GID (e.g. "gid://shopify/Product/123" → "123"). */
export function cleanId(id: string | null | undefined): string {
  if (!id) return '';
  return String(id).split('/').pop() || '';
}

/** Strip a GID prefix from an array of IDs. */
export function normalizeIds(ids: unknown[], prefix?: string): string[] {
  if (!Array.isArray(ids)) return [];
  const out: string[] = [];
  for (const id of ids) {
    if (id == null) continue;
    let s = String(id);
    if (prefix && s.indexOf(prefix) === 0) s = s.slice(prefix.length);
    out.push(s);
  }
  return out;
}

/** Convert an array to a set-like record for fast lookup. */
export function toSet(list: string[]): Record<string, true> {
  const set: Record<string, true> = {};
  for (const item of list) set[item] = true;
  return set;
}

/** Check if two sets (as records) have identical keys. */
export function setsEqual(
  a: Record<string, true>,
  b: Record<string, true>,
): boolean {
  const aKeys = Object.keys(a);
  const bKeys = Object.keys(b);
  if (aKeys.length !== bKeys.length) return false;
  for (const key of aKeys) {
    if (!b[key]) return false;
  }
  return true;
}
