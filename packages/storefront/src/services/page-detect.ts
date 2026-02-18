export function productHandle(): string | null {
  const m = location.pathname.match(/\/products\/([^/?#]+)/);
  return m ? decodeURIComponent(m[1]) : null;
}

export function onProductPage(): boolean {
  return location.pathname.indexOf('/products/') !== -1;
}
