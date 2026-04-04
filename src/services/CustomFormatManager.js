import storageService from './StorageService.js';
import eventBus from '../core/EventBus.js';

const STORAGE_KEY = 'ada-custom-formats';

/**
 * CustomFormatManager — CRUD operations for user-defined debate formats.
 *
 * V4 format shape (global teams + per-block exclusion):
 * {
 *   id: string,
 *   name: string,
 *   teams: string[],
 *   blocks: Array<{
 *     name: string,
 *     excludedTeams: number[],
 *     phases: Array<{ name: string, duration: number }>,
 *     repeat: number,
 *     perTeam: boolean,
 *     interleave: boolean,
 *     reverseTeams: boolean,
 *     invertTeams: boolean,
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

  /** Migrate V1/V2/V3 formats → V4 (global teams + per-block exclusion). */
  _migrate(f) {
    // V1: had flat phases[] — wrap in a single block
    if (!Array.isArray(f.blocks)) {
      return {
        id: f.id,
        name: f.name,
        teams: [],
        blocks: [{
          name: 'Bloque 1',
          excludedTeams: [],
          phases: Array.isArray(f.phases) ? f.phases : [],
          repeat: 1,
          perTeam: false,
          interleave: false,
          reverseTeams: false,
          invertTeams: false,
        }],
        includeDeliberacion: f.includeDeliberacion ?? true,
        includeFeedback: f.includeFeedback ?? true,
      };
    }
    // V3: per-block teams[] → collect unique teams globally, compute exclusions
    if (!Array.isArray(f.teams)) {
      const allTeams = [];
      const seen = new Set();
      for (const block of f.blocks) {
        for (const t of (block.teams || [])) {
          if (!seen.has(t)) { allTeams.push(t); seen.add(t); }
        }
      }
      f.teams = allTeams;
      for (const block of f.blocks) {
        const blockTeamSet = new Set(block.teams || []);
        block.excludedTeams = allTeams
          .map((t, i) => blockTeamSet.has(t) ? -1 : i)
          .filter((i) => i >= 0);
        delete block.teams;
      }
    }
    // V2: had global teams[] but blocks may still have old teams[]
    for (const block of f.blocks) {
      if (Array.isArray(block.teams)) delete block.teams;
      if (!Array.isArray(block.excludedTeams)) block.excludedTeams = [];
    }
    return f;
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
