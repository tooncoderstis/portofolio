import "server-only";

export class HttpError extends Error {
  readonly status: number;
  readonly url: string;

  constructor(message: string, status: number, url: string) {
    super(message);
    this.name = "HttpError";
    this.status = status;
    this.url = url;
  }
}

export const delay = (ms: number): Promise<void> =>
  new Promise((resolve) => setTimeout(resolve, ms));

export type FetchJsonOptions = {
  method?: string;
  headers?: Record<string, string>;
  body?: string;
  timeoutMs?: number;
  retries?: number;
  signal?: AbortSignal;
};

const isRetryableStatus = (status: number): boolean =>
  status === 429 || status >= 500;

export async function fetchJson<T>(
  url: string,
  options: FetchJsonOptions = {},
): Promise<T> {
  const {
    method = "GET",
    headers,
    body,
    timeoutMs = 10_000,
    retries = 2,
  } = options;

  let lastError: unknown = new Error(`Permintaan gagal: ${url}`);

  for (let attempt = 0; attempt <= retries; attempt += 1) {
    try {
      const response = await fetch(url, {
        method,
        headers,
        body,
        cache: "no-store",
        signal: options.signal ?? AbortSignal.timeout(timeoutMs),
      });

      if (!response.ok) {
        const error = new HttpError(
          `HTTP ${response.status} untuk ${url}`,
          response.status,
          url,
        );

        if (isRetryableStatus(response.status) && attempt < retries) {
          lastError = error;
          await delay(250 * 2 ** attempt);
          continue;
        }

        throw error;
      }

      return (await response.json()) as T;
    } catch (error) {
      lastError = error;

      if (error instanceof HttpError && !isRetryableStatus(error.status)) {
        throw error;
      }

      if (attempt < retries) {
        await delay(250 * 2 ** attempt);
        continue;
      }

      break;
    }
  }

  throw lastError instanceof Error
    ? lastError
    : new Error(`Permintaan gagal: ${url}`);
}
