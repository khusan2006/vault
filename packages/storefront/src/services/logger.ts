const DEBUG = true;
const PREFIX = '[Vault]';

export function log(...args: unknown[]): void {
  if (!DEBUG) return;
  console.log(PREFIX, ...args);
}

export function logErr(...args: unknown[]): void {
  console.error(PREFIX, ...args);
}
