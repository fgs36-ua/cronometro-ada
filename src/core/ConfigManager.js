import eventBus from './EventBus.js';
import storageService from '../services/StorageService.js';
import {
  ACADEMIC_DEFAULTS,
  BP_DEFAULTS,
  COMMON_DEFAULTS,
  DEFAULT_FORMAT,
  STORAGE_KEYS,
  defaultKeyboardEnabled,
} from './defaults.js';

/**
 * ConfigManager — reads / writes the debate configuration.
 *
 * The internal state mirrors the shape persisted in localStorage under the
 * key `ada-debate-config` so that configs saved by the legacy version are
 * loaded without migration.
 */
export class ConfigManager {
  constructor() {
    this._config = this._buildDefaults();
  }

  /* ── public getters ─────────────────────────────────── */

  get(key) {
    return this._config[key];
  }

  getAll() {
    return { ...this._config };
  }

  getFormatConfig(format) {
    if (format === 'academico') return { ...this._config.academico };
    if (format === 'bp') return { ...this._config.bp };
    return null;
  }

  getCommon() {
    return {
      deliberacion: { ...this._config.deliberacion },
      feedback: { ...this._config.feedback },
    };
  }

  getCurrentFormat() {
    return this._config.currentFormat;
  }

  isKeyboardEnabled() {
    return this._config.keyboardControlsEnabled;
  }

  /* ── mutation ─────────────────────────────────────────── */

  set(key, value) {
    this._config[key] = value;
  }

  /**
   * Bulk-apply a partial config object coming from the UI.
   * After calling this, `save()` and emit `config:applied`.
   */
  apply(partial) {
    this._merge(partial);
    this.save();
    eventBus.emit('config:applied', { config: this.getAll() });
  }

  /* ── persistence ──────────────────────────────────────── */

  save() {
    storageService.set(STORAGE_KEYS.config, this._config);
  }

  load() {
    const saved = storageService.get(STORAGE_KEYS.config);
    if (saved) {
      this._merge(saved);
    }
  }

  reset() {
    this._config = this._buildDefaults();
    storageService.remove(STORAGE_KEYS.config);
    eventBus.emit('config:reset', {});
  }

  /* ── private ──────────────────────────────────────────── */

  _buildDefaults() {
    return {
      currentFormat: DEFAULT_FORMAT,
      keyboardControlsEnabled: defaultKeyboardEnabled(),
      academico: { ...ACADEMIC_DEFAULTS },
      bp: { ...BP_DEFAULTS },
      deliberacion: {
        time: COMMON_DEFAULTS.deliberacionTime,
        description: COMMON_DEFAULTS.deliberacionDesc,
      },
      feedback: {
        time: COMMON_DEFAULTS.feedbackTime,
        description: COMMON_DEFAULTS.feedbackDesc,
      },
    };
  }

  _merge(source) {
    if (source.currentFormat) this._config.currentFormat = source.currentFormat;
    if (source.keyboardControlsEnabled !== undefined) {
      this._config.keyboardControlsEnabled = source.keyboardControlsEnabled;
    }
    if (source.academico) {
      Object.assign(this._config.academico, source.academico);
    }
    if (source.bp) {
      Object.assign(this._config.bp, source.bp);
    }
    if (source.deliberacion) {
      Object.assign(this._config.deliberacion, source.deliberacion);
    }
    if (source.feedback) {
      Object.assign(this._config.feedback, source.feedback);
    }
  }
}

const configManager = new ConfigManager();
export default configManager;
