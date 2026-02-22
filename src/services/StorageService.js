/**
 * StorageService — thin abstraction over localStorage with
 * automatic JSON serialise / deserialise.
 */
export class StorageService {
  /**
   * Read and parse a value.
   * @param {string} key
   * @returns {*} parsed value or null
   */
  get(key) {
    try {
      const raw = localStorage.getItem(key);
      if (raw === null) return null;
      return JSON.parse(raw);
    } catch {
      return null;
    }
  }

  /**
   * Serialise and write a value.
   * @param {string} key
   * @param {*} value
   */
  set(key, value) {
    try {
      localStorage.setItem(key, JSON.stringify(value));
    } catch (err) {
      console.error('[StorageService] Error writing:', err);
    }
  }

  /**
   * Remove a key.
   * @param {string} key
   */
  remove(key) {
    localStorage.removeItem(key);
  }
}

/** Singleton */
const storageService = new StorageService();
export default storageService;
