/**
 * Represents a single phase in a debate
 * Encapsulates phase-specific data and behavior
 */
export class DebatePhase {
  /**
   * @param {string} name - Phase name/description
   * @param {number} duration - Duration in seconds
   * @param {string} team - Team name (optional)
   */
  constructor(name, duration, team = null) {
    this.name = name;
    this.duration = duration;
    this.team = team;
    this.completed = false;
    this.currentTime = duration;
  }

  /**
   * Reset phase to initial state
   */
  reset() {
    this.completed = false;
    this.currentTime = this.duration;
  }

  /**
   * Mark phase as completed
   */
  complete() {
    this.completed = true;
  }

  /**
   * Get remaining time in phase
   * @returns {number} Remaining time in seconds
   */
  getRemainingTime() {
    return this.currentTime;
  }

  /**
   * Set current time for this phase
   * @param {number} time - Time in seconds
   */
  setCurrentTime(time) {
    this.currentTime = Math.max(-300, Math.min(this.duration, time));
  }

  /**
   * Get phase progress as percentage (0-1)
   * @returns {number} Progress percentage
   */
  getProgress() {
    if (this.duration === 0) return 1;
    return Math.max(0, Math.min(1, (this.duration - this.currentTime) / this.duration));
  }

  /**
   * Check if phase is in warning state (last 10 seconds)
   * @returns {boolean}
   */
  isWarning() {
    return this.currentTime <= 10 && this.currentTime >= -10;
  }

  /**
   * Check if phase is in danger state (overtime > 10 seconds)
   * @returns {boolean}
   */
  isDanger() {
    return this.currentTime <= -11;
  }

  /**
   * Create a copy of this phase
   * @returns {DebatePhase}
   */
  clone() {
    const cloned = new DebatePhase(this.name, this.duration, this.team);
    cloned.completed = this.completed;
    cloned.currentTime = this.currentTime;
    return cloned;
  }

  /**
   * Get phase status for UI display
   * @returns {string} Status emoji
   */
  getStatusEmoji() {
    if (this.completed) return '✅';
    if (this.currentTime !== this.duration) return '🔄';
    return '⚪';
  }
}