/**
 * Shared authenticated fetch — environment-agnostic core used by both
 * the client-side and server-side API layers.
 *
 * This module never touches `window` or server-only APIs.
 * Each caller supplies its own token, base URL, and context-specific
 * options (timeout, caching, etc.).
 */

export interface RequestOptions extends Omit<RequestInit, "signal"> {
  /** Abort the request if it exceeds this duration (ms). */
  timeout?: number;
}

export async function request<T = unknown>(
  url: string,
  token: string,
  options: RequestOptions = {},
): Promise<T> {
  const { timeout, ...init } = options;

  let controller: AbortController | undefined;
  let timeoutId: ReturnType<typeof setTimeout> | undefined;

  if (timeout) {
    controller = new AbortController();
    timeoutId = setTimeout(() => controller!.abort(), timeout);
  }

  try {
    const response = await fetch(url, {
      ...init,
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
        ...init.headers,
      },
      ...(controller ? { signal: controller.signal } : {}),
    });

    if (!response.ok) {
      const body = await response.json().catch(() => ({}));
      throw new Error(body.message || `API error: ${response.status}`);
    }

    if (response.status === 204) {
      return undefined as T;
    }

    return (await response.json()) as T;
  } catch (err) {
    if (timeout && err instanceof Error && err.name === "AbortError") {
      throw new Error(
        `Request timeout: ${url} did not respond within ${timeout}ms`,
      );
    }
    throw err;
  } finally {
    if (timeoutId) clearTimeout(timeoutId);
  }
}
