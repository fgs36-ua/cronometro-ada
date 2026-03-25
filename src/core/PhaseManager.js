import eventBus from './EventBus.js';
import timer from './Timer.js';
import configManager from './ConfigManager.js';

/**
 * PhaseManager — manages the ordered list of debate phases,
 * the current index, and coordinates with Timer for durations.
 */
export class PhaseManager {
  constructor() {
    /** @type {Array<{name: string, duration: number}>} */
    this._phases = [];
    this._currentIndex = 0;
    this._debateEnded = false;
    /**
     * Saved remaining times per phase index (progress tracking).
     * @type {Map<number, number>}
     */
    this._savedTimes = new Map();
  }

  /* ── getters ──────────────────────────────────────────── */

  get phases() {
    return this._phases;
  }

  get currentIndex() {
    return this._currentIndex;
  }

  get currentPhase() {
    return this._phases[this._currentIndex] ?? null;
  }

  get total() {
    return this._phases.length;
  }

  get debateEnded() {
    return this._debateEnded;
  }

  /* ── public API ───────────────────────────────────────── */

  /**
   * Replace the entire phase list (after format change / config apply).
   * Resets to first phase.
   */
  setPhases(phases) {
    this._phases = phases;
    this._currentIndex = 0;
    this._debateEnded = false;
    this._savedTimes.clear();
    this._loadCurrent();
    eventBus.emit('phase:changed', this._phaseData());
  }

  nextPhase() {
    if (timer.isRunning) return;

    if (this._currentIndex < this._phases.length - 1) {
      this._saveCurrentTime();
      this._currentIndex++;
      this._debateEnded = false;
      this._loadCurrent();
      eventBus.emit('phase:changed', this._phaseData());
    }
    // Last phase — do nothing; debate ends only via timer completion
  }

  previousPhase() {
    if (timer.isRunning) return;

    if (this._debateEnded) {
      this._debateEnded = false;
      this._currentIndex = this._phases.length - 1;
      this._loadCurrent();
      eventBus.emit('phase:changed', this._phaseData());
      return;
    }

    if (this._currentIndex > 0) {
      this._saveCurrentTime();
      this._currentIndex--;
      this._loadCurrent();
      eventBus.emit('phase:changed', this._phaseData());
    }
  }

  jumpToPhase(index) {
    if (timer.isRunning) return;
    if (index < 0 || index >= this._phases.length) return;

    this._saveCurrentTime();
    this._currentIndex = index;
    this._debateEnded = false;
    this._loadCurrent();
    eventBus.emit('phase:changed', this._phaseData());
  }

  resetDebate() {
    timer.reset();
    this._currentIndex = 0;
    this._debateEnded = false;
    this._savedTimes.clear();

    if (this._phases.length > 0) {
      timer.load(this._phases[0].duration);
    }
    eventBus.emit('debate:reset', {});
    eventBus.emit('phase:changed', this._phaseData());
  }

  /**
   * Reset only the current phase: clear its saved time and reload full duration.
   */
  resetCurrentPhase() {
    this._savedTimes.delete(this._currentIndex);
    if (this._phases.length > 0) {
      const phase = this._phases[this._currentIndex];
      timer.load(phase.duration);
    }
  }

  /**
   * Get the saved remaining time for a specific phase, or null if not saved.
   */
  getSavedTime(index) {
    return this._savedTimes.has(index) ? this._savedTimes.get(index) : null;
  }

  /* ── private helpers ──────────────────────────────────── */

  /**
   * Save the current timer's remaining time for the current phase index
   * (only when progress tracking is enabled).
   */
  _saveCurrentTime() {
    if (!configManager.isProgressTrackingEnabled()) return;
    this._savedTimes.set(this._currentIndex, timer.currentTime);
  }

  _loadCurrent() {
    if (this._phases.length === 0) return;
    const phase = this._phases[this._currentIndex];

    // If progress tracking is on and we have a saved time, restore it
    if (configManager.isProgressTrackingEnabled() && this._savedTimes.has(this._currentIndex)) {
      const saved = this._savedTimes.get(this._currentIndex);
      timer.load(phase.duration);
      timer.seekTo(saved);
    } else {
      timer.load(phase.duration);
    }
  }

  _phaseData() {
    return {
      index: this._currentIndex,
      phase: this.currentPhase,
      total: this._phases.length,
      debateEnded: this._debateEnded,
    };
  }
}

const phaseManager = new PhaseManager();
export default phaseManager;
