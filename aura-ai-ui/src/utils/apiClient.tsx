/**
 * Robust API client for AURA AI backend with:
 * - Automatic retry with exponential backoff
 * - Configurable timeout (long for image generation)
 * - Better error messages
 * - Base64 image validation
 * - Backend health check
 */

const API_URL = "https://auraai-backend-6a8n.onrender.com";

export { API_URL };

/** Maximum number of retry attempts for failed API calls */
const MAX_RETRIES = 3;

/** Base delay in ms for exponential backoff (first retry = 2s, second = 4s, third = 8s) */
const BASE_DELAY_MS = 2000;

/** Timeout for regular API calls (30 seconds) */
const REGULAR_TIMEOUT_MS = 30000;

/** Timeout for image generation API calls (120 seconds - these are slow) */
const GENERATION_TIMEOUT_MS = 120000;

/**
 * Sleep for a given number of milliseconds.
 */
function sleep(ms: number): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

/**
 * Validate that base64 image data from the API is valid.
 * Returns the validated data URL string, or throws an error.
 */
export function validateAndBuildImageUrl(
  data: Record<string, unknown>,
  viewLabel?: string
): string {
  const label = viewLabel ? ` for ${viewLabel}` : "";

  // Check if imageBase64 exists
  if (!data.imageBase64) {
    throw new Error(`No image data received from server${label}. The AI may still be warming up — please try again.`);
  }

  // Check type
  if (typeof data.imageBase64 !== "string") {
    throw new Error(`Invalid image data type received from server${label}. Expected string, got ${typeof data.imageBase64}.`);
  }

  // Check minimum length (a valid image should have at least 100 chars of base64)
  if (data.imageBase64.length < 100) {
    throw new Error(
      `Image data from server is too short${label} (${data.imageBase64.length} chars). ` +
      `The generation may have failed — please try again.`
    );
  }

  // Basic base64 format check
  const base64Regex = /^[A-Za-z0-9+/=]+$/;
  // Allow for potential whitespace or newlines in the base64 data
  const cleanedBase64 = data.imageBase64.replace(/\s/g, "");
  if (!base64Regex.test(cleanedBase64)) {
    // Don't throw immediately — some APIs include headers/padding that aren't pure base64
    // But warn if it's clearly not base64 at all
    if (cleanedBase64.length < 50 || /^[<{]/.test(cleanedBase64)) {
      throw new Error(
        `Image data from server appears to be corrupted or in wrong format${label}. ` +
        `Please try again.`
      );
    }
  }

  const mimeType = (data.mimeType as string) || "image/png";
  return `data:${mimeType};base64,${data.imageBase64}`;
}

/**
 * Make a fetch request with timeout and retry logic.
 *
 * @param url - Full URL to fetch
 * @param options - Fetch options
 * @param timeoutMs - Request timeout in milliseconds
 * @param retries - Number of retry attempts
 * @returns Parsed JSON response
 */
export async function fetchWithRetry(
  url: string,
  options: RequestInit,
  timeoutMs: number = REGULAR_TIMEOUT_MS,
  retries: number = MAX_RETRIES
): Promise<Record<string, unknown>> {
  let lastError: Error | null = null;

  for (let attempt = 1; attempt <= retries; attempt++) {
    // Create an AbortController for timeout
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), timeoutMs);

    try {
      const response = await fetch(url, {
        ...options,
        signal: controller.signal,
      });

      clearTimeout(timeoutId);

      // Try to parse JSON
      let data: Record<string, unknown>;
      try {
        data = await response.json();
      } catch (parseError) {
        throw new Error(
          `Server returned invalid response (not JSON). ` +
          `The backend may be waking up — please try again in a moment.`
        );
      }

      // Check for HTTP errors
      if (!response.ok) {
        const message =
          (data.message as string) ||
          (data.error as string) ||
          `Server error (${response.status})`;

        // Don't retry auth errors or client errors (4xx) except 429 (rate limit)
        if (response.status >= 400 && response.status < 500 && response.status !== 429) {
          throw new Error(message);
        }

        // Server error or rate limit — retry
        throw new Error(message);
      }

      return data;
    } catch (err) {
      clearTimeout(timeoutId);

      if (err instanceof Error) {
        // Don't retry auth errors
        if (err.message.includes("Please login")) {
          throw err;
        }

        lastError = err;

        // If this was an abort (timeout), provide a clearer message
        if (err.name === "AbortError") {
          lastError = new Error(
            `Request timed out after ${Math.round(timeoutMs / 1000)}s. ` +
            `The AI is taking too long to respond — please try again.`
          );
        }

        // If this was a network error (Failed to fetch)
        if (err.message === "Failed to fetch" || err.message.includes("NetworkError") || err.message.includes("fetch")) {
          lastError = new Error(
            `Cannot connect to AURA AI server. ` +
            `The backend may be waking up from sleep (this takes ~30s on first request). ` +
            `Retrying automatically... (Attempt ${attempt}/${retries})`
          );
        }
      } else {
        lastError = new Error("Unknown error occurred");
      }

      // If we have more retries, wait and try again
      if (attempt < retries) {
        const delayMs = BASE_DELAY_MS * Math.pow(2, attempt - 1);
        console.warn(
          `[AURA API] Attempt ${attempt}/${retries} failed: ${lastError.message}. ` +
          `Retrying in ${delayMs / 1000}s...`
        );
        await sleep(delayMs);
      }
    }
  }

  // All retries exhausted
  throw new Error(
    lastError?.message ||
    `Failed after ${retries} attempts. Please check your internet connection and try again.`
  );
}

/**
 * Make a generation API call with extended timeout and retry logic.
 * Uses 120s timeout for image generation endpoints.
 */
export async function fetchGeneration(
  endpoint: string,
  options: RequestInit,
  retries: number = MAX_RETRIES
): Promise<Record<string, unknown>> {
  const url = endpoint.startsWith("http") ? endpoint : `${API_URL}${endpoint}`;
  return fetchWithRetry(url, options, GENERATION_TIMEOUT_MS, retries);
}

/**
 * Check if the AURA AI backend is reachable.
 * Returns true if the backend responds, false otherwise.
 */
export async function checkBackendHealth(): Promise<boolean> {
  try {
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 10000);
    const response = await fetch(`${API_URL}/api/health`, {
      method: "GET",
      signal: controller.signal,
    });
    clearTimeout(timeoutId);
    return response.ok;
  } catch {
    return false;
  }
}
