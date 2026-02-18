export function appendIdToken(path: string, idToken: string | null): string {
  if (!idToken) return path;

  const [base, hash] = path.split("#");
  const [pathname, query = ""] = base.split("?");
  const params = new URLSearchParams(query);

  if (params.has("id_token")) return path;

  params.set("id_token", idToken);
  const next = `${pathname}?${params.toString()}`;

  return hash ? `${next}#${hash}` : next;
}
