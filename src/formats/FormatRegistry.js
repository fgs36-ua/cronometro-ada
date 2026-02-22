import AcademicFormat from './AcademicFormat.js';
import BPFormat from './BPFormat.js';

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
   * Get a format module by name.
   * @param {string} name
   * @returns {{name: string, generatePhases: Function}|undefined}
   */
  get(name) {
    return this._formats.get(name);
  }

  /**
   * List all registered format names.
   * @returns {string[]}
   */
  list() {
    return [...this._formats.keys()];
  }
}

const formatRegistry = new FormatRegistry();

// Pre-register built-in formats
formatRegistry.register('academico', AcademicFormat);
formatRegistry.register('bp', BPFormat);

export default formatRegistry;
