import eventBus from './EventBus.js';
import { TIMER_THRESHOLDS, MIN_NEGATIVE_TIME } from './defaults.js';

/**
 * Timer — core countdown engine with wall-clock sync.
 * Does NOT touch the DOM; communicates exclusively via EventBus.
 */
export class Timer {
  constructor() {
    this._currentTime = 0;
    this._totalTime = 0;
    this._isRunning = false;
    this._isPaused = false;
    this._interval = null;
    this._startTimestamp = null;
  }

  /* ── getters ──────────────────────────────────────────── */

  get currentTime() {
    return this._currentTime;
  }

  get totalTime() {
    return this._totalTime;
  }

  get isRunning() {
    return this._isRunning;
  }

  get isPaused() {
    return this._isPaused;
  }

  /* ── public API ───────────────────────────────────────── */

  /**
   * Load a new duration (when switching phases).
   * Resets all timer state.
   */
  load(duration) {
    this._stop();
    this._currentTime = duration;
    this._totalTime = duration;
    this._isRunning = false;
    this._isPaused = false;
    this._startTimestamp = null;
    eventBus.emit('timer:tick', this._tickData());
  }

  start() {
    if (this._isRunning) return;

    this._isRunning = true;
    this._isPaused = false;

    if (this._currentTime === 0 && this._totalTime > 0) {
      this._currentTime = this._totalTime;
    }

    // Compute the wall-clock origin
    const elapsed = this._totalTime - this._currentTime;
    this._startTimestamp = Date.now() - elapsed * 1000;

    this._startInterval();
    eventBus.emit('timer:start', {});
  }

  pause() {
    if (this._isRunning && !this._isPaused) {
      // Running → Paused
      this._isPaused = true;
      this._isRunning = false;
      this._clearInterval();
      eventBus.emit('timer:pause', {});
    } else if (this._isPaused) {
      // Paused → Resume
      this._isPaused = false;
      this._isRunning = true;

      const elapsed = this._totalTime - this._currentTime;
      this._startTimestamp = Date.now() - elapsed * 1000;

      this._startInterval();
      eventBus.emit('timer:resume', {});
    }
  }

  reset() {
    this._stop();
    this._currentTime = this._totalTime;
    this._isRunning = false;
    this._isPaused = false;
    this._startTimestamp = null;
    eventBus.emit('timer:reset', {});
    eventBus.emit('timer:tick', this._tickData());
  }

  /**
   * Seek to an absolute time (progress-bar click / drag).
   */
  seekTo(time) {
    this._currentTime = time;

    if (this._isRunning && !this._isPaused && this._startTimestamp) {
      const elapsed = this._totalTime - this._currentTime;
      this._startTimestamp = Date.now() - elapsed * 1000;
    }

    this._emitWarningLevel();
    eventBus.emit('timer:tick', this._tickData());
  }

  /**
   * Adjust by ±N seconds (keyboard shortcut).
   * Only allowed when NOT running.
   */
  adjustTime(delta) {
    if (this._isRunning) return;

    const newTime = this._currentTime + delta;
    this._currentTime = Math.max(
      MIN_NEGATIVE_TIME,
      Math.min(this._totalTime, newTime),
    );

    if (this._isPaused && this._startTimestamp) {
      const elapsed = this._totalTime - this._currentTime;
      this._startTimestamp = Date.now() - elapsed * 1000;
    }

    eventBus.emit('timer:tick', this._tickData());
  }

  /* ── private helpers ──────────────────────────────────── */

  _startInterval() {
    this._clearInterval();
    this._interval = setInterval(() => {
      if (this._startTimestamp) {
        const realElapsed = Math.floor(
          (Date.now() - this._startTimestamp) / 1000,
        );
        this._currentTime = this._totalTime - realElapsed;
      } else {
        this._currentTime--;
      }
      this._emitWarningLevel();
      eventBus.emit('timer:tick', this._tickData());
    }, 1000);
  }

  _clearInterval() {
    if (this._interval) {
      clearInterval(this._interval);
      this._interval = null;
    }
  }

  _stop() {
    this._clearInterval();
    this._isRunning = false;
    this._isPaused = false;
  }

  _tickData() {
    return {
      currentTime: this._currentTime,
      totalTime: this._totalTime,
      isRunning: this._isRunning,
      isPaused: this._isPaused,
    };
  }

  _emitWarningLevel() {
    const t = this._currentTime;
    if (t <= TIMER_THRESHOLDS.dangerStart) {
      eventBus.emit('timer:warning', { level: 'danger' });
    } else if (
      t <= TIMER_THRESHOLDS.warningStart &&
      t >= TIMER_THRESHOLDS.warningEnd
    ) {
      eventBus.emit('timer:warning', { level: 'warning' });
    }
  }
}

const timer = new Timer();
export default timer;
