import eventBus from './EventBus.js';
import timer from './Timer.js';

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
    this._loadCurrent();
    eventBus.emit('phase:changed', this._phaseData());
  }

  nextPhase() {
    if (timer.isRunning) return;

    if (this._currentIndex < this._phases.length - 1) {
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
      this._currentIndex--;
      this._loadCurrent();
      eventBus.emit('phase:changed', this._phaseData());
    }
  }

  jumpToPhase(index) {
    if (timer.isRunning) return;
    if (index < 0 || index >= this._phases.length) return;

    this._currentIndex = index;
    this._debateEnded = false;
    this._loadCurrent();
    eventBus.emit('phase:changed', this._phaseData());
  }

  resetDebate() {
    timer.reset();
    this._currentIndex = 0;
    this._debateEnded = false;

    if (this._phases.length > 0) {
      timer.load(this._phases[0].duration);
    }
    eventBus.emit('debate:reset', {});
    eventBus.emit('phase:changed', this._phaseData());
  }

  /* ── private helpers ──────────────────────────────────── */

  _loadCurrent() {
    if (this._phases.length === 0) return;
    const phase = this._phases[this._currentIndex];
    timer.load(phase.duration);
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
