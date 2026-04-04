import AcademicFormat from './AcademicFormat.js';
import BPFormat from './BPFormat.js';

/** Built-in format keys that cannot be deleted. */
export const BUILTIN_FORMATS = new Set(['academico', 'bp']);

/**
 * FormatRegistry — central registry for debate format modules.
 */
class FormatRegistry {
  constructor() {
    /** @type {Map<string, {name: string, generatePhases: Function}>} */
    this._formats = new Map();
  }

  /**
   * Register a format module.
   * @param {string} name
   * @param {{name: string, generatePhases: Function}} formatModule
   */
  register(name, formatModule) {
    this._formats.set(name, formatModule);
  }

  /**
   * Unregister a format module (only non-builtin).
   * @param {string} name
   * @returns {boolean}
   */
  unregister(name) {
    if (BUILTIN_FORMATS.has(name)) return false;
    return this._formats.delete(name);
  }

  /**
   * Get a format module by name.
   * @param {string} name
   * @returns {{name: string, generatePhases: Function}|undefined}
   */
  get(name) {
    return this._formats.get(name);
  }

  /**
   * Check if a format exists.
   * @param {string} name
   * @returns {boolean}
   */
  has(name) {
    return this._formats.has(name);
  }

  /**
   * Whether the format is a built-in.
   * @param {string} name
   * @returns {boolean}
   */
  isBuiltin(name) {
    return BUILTIN_FORMATS.has(name);
  }

  /**
   * List all registered format names.
   * @returns {string[]}
   */
  list() {
    return [...this._formats.keys()];
  }

  /**
   * List only custom (non-builtin) format names.
   * @returns {string[]}
   */
  listCustom() {
    return this.list().filter((n) => !BUILTIN_FORMATS.has(n));
  }
}

const formatRegistry = new FormatRegistry();

// Pre-register built-in formats
formatRegistry.register('academico', AcademicFormat);
formatRegistry.register('bp', BPFormat);

export default formatRegistry;
