import storageService from './StorageService.js';
import eventBus from '../core/EventBus.js';

const STORAGE_KEY = 'ada-custom-formats';

/**
 * CustomFormatManager — CRUD operations for user-defined debate formats.
 *
 * V2 block-based format shape:
 * {
 *   id: string,
 *   name: string,
 *   teams: string[],
 *   blocks: Array<{
 *     name: string,
 *     phases: Array<{ name: string, duration: number }>,
 *     repeat: number,
 *     perTeam: boolean,
 *     reverseTeams: boolean,
 *   }>,
 *   includeDeliberacion: boolean,
 *   includeFeedback: boolean,
 * }
 */
class CustomFormatManager {
  constructor() {
    /** @type {Map<string, object>} */
    this._formats = new Map();
  }

  /** Load saved custom formats from storage, migrating V1 flat formats. */
  load() {
    const saved = storageService.get(STORAGE_KEY);
    if (Array.isArray(saved)) {
      saved.forEach((f) => {
        this._formats.set(f.id, this._migrate(f));
      });
      // Persist migrated data back
      this._save();
    }
  }

  /** Migrate V1 flat format → V2 block format if needed. */
  _migrate(f) {
    if (Array.isArray(f.blocks)) return f; // already V2
    // V1 had flat phases[] — wrap in a single block
    return {
      id: f.id,
      name: f.name,
      teams: [],
      blocks: [{
        name: 'Bloque 1',
        phases: Array.isArray(f.phases) ? f.phases : [],
        repeat: 1,
        perTeam: false,
        reverseTeams: false,
      }],
      includeDeliberacion: f.includeDeliberacion ?? true,
      includeFeedback: f.includeFeedback ?? true,
    };
  }

  _save() {
    storageService.set(STORAGE_KEY, this.getAll());
  }

  _generateId() {
    return 'custom-' + Date.now().toString(36) + '-' + Math.random().toString(36).slice(2, 7);
  }

  /** Create a new custom format. */
  create(data) {
    const format = {
      id: this._generateId(),
      name: (data.name || 'Formato personalizado').trim(),
      teams: Array.isArray(data.teams) ? data.teams : [],
      blocks: Array.isArray(data.blocks) ? data.blocks : [],
      includeDeliberacion: data.includeDeliberacion ?? true,
      includeFeedback: data.includeFeedback ?? true,
    };
    this._formats.set(format.id, format);
    this._save();
    eventBus.emit('customFormats:changed', {});
    return format;
  }

  /** Update an existing custom format. */
  update(id, data) {
    const existing = this._formats.get(id);
    if (!existing) return null;

    if (data.name !== undefined) existing.name = data.name.trim();
    if (Array.isArray(data.teams)) existing.teams = data.teams;
    if (Array.isArray(data.blocks)) existing.blocks = data.blocks;
    if (data.includeDeliberacion !== undefined) existing.includeDeliberacion = data.includeDeliberacion;
    if (data.includeFeedback !== undefined) existing.includeFeedback = data.includeFeedback;

    this._formats.set(id, existing);
    this._save();
    eventBus.emit('customFormats:changed', {});
    return existing;
  }

  /** Delete a custom format by id. */
  delete(id) {
    const deleted = this._formats.delete(id);
    if (deleted) {
      this._save();
      eventBus.emit('customFormats:changed', {});
    }
    return deleted;
  }

  /** Get a custom format by id. */
  get(id) {
    return this._formats.get(id);
  }

  /** Get all custom formats as an array. */
  getAll() {
    return [...this._formats.values()];
  }

  /** Duplicate an existing custom format. */
  duplicate(id) {
    const original = this._formats.get(id);
    if (!original) return null;
    return this.create({
      name: original.name + ' (copia)',
      teams: [...original.teams],
      blocks: original.blocks.map((b) => ({
        ...b,
        phases: b.phases.map((p) => ({ ...p })),
      })),
      includeDeliberacion: original.includeDeliberacion,
      includeFeedback: original.includeFeedback,
    });
  }
}

const customFormatManager = new CustomFormatManager();
export default customFormatManager;
