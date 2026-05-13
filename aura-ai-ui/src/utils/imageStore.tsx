/**
 * In-memory image store for passing generated images between pages.
 *
 * Problem: React Router's `nav('/path', { state: { image: base64 } })` passes
 * data through the browser History API, which has a size limit (~2-16 MB
 * depending on browser). A single 4K base64-encoded image is ~2-5 MB, and
 * passing two of them (front + right views) easily exceeds this limit, causing
 * truncation and corrupted images on the result page.
 *
 * Solution: Store the actual base64 data in this in-memory Map and pass only
 * lightweight keys (strings) through router state. Result pages retrieve the
 * full images from this store using the keys.
 *
 * The store is global (module-level) so it persists across navigation within
 * the same session/tab. It is automatically cleared on page refresh, which
 * is the expected behaviour — generated images are ephemeral.
 */

const store = new Map<string, string>();

let idCounter = 0;

/**
 * Store an image (base64 data URL or any string) and return a unique key.
 */
export function storeImage(imageData: string): string {
  const key = `img_${Date.now()}_${++idCounter}`;
  store.set(key, imageData);
  return key;
}

/**
 * Retrieve a stored image by key. Returns null if not found.
 */
export function getImage(key: string | null | undefined): string | null {
  if (!key) return null;
  const data = store.get(key);
  return data ?? null;
}

/**
 * Remove a stored image to free memory.
 */
export function removeImage(key: string): void {
  store.delete(key);
}

/**
 * Clear all stored images.
 */
export function clearAllImages(): void {
  store.clear();
}

/**
 * Helper: store multiple images at once and return their keys.
 * Useful for storing front + right view images together.
 */
export function storeImages(images: Record<string, string | null | undefined>): Record<string, string | null> {
  const keys: Record<string, string | null> = {};
  for (const [name, data] of Object.entries(images)) {
    keys[name] = data ? storeImage(data) : null;
  }
  return keys;
}

/**
 * Helper: retrieve multiple images by their keys.
 */
export function getImages(keys: Record<string, string | null | undefined>): Record<string, string | null> {
  const result: Record<string, string | null> = {};
  for (const [name, key] of Object.entries(keys)) {
    result[name] = getImage(key);
  }
  return result;
}
