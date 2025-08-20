import { DebatePhase } from '../core/DebatePhase.js';

/**
 * Abstract base class for debate formats
 * Implements Strategy pattern for different debate types
 */
export class DebateFormat {
  constructor(name) {
    this.name = name;
    this.phases = [];
  }

  /**
   * Setup phases for this debate format
   * Must be implemented by subclasses
   * @param {Object} config - Configuration object
   */
  setupPhases(config) {
    throw new Error('setupPhases must be implemented by subclasses');
  }

  /**
   * Get all phases for this format
   * @returns {DebatePhase[]}
   */
  getPhases() {
    return this.phases;
  }

  /**
   * Get phase by index
   * @param {number} index - Phase index
   * @returns {DebatePhase|null}
   */
  getPhase(index) {
    return this.phases[index] || null;
  }

  /**
   * Get total number of phases
   * @returns {number}
   */
  getPhaseCount() {
    return this.phases.length;
  }

  /**
   * Reset all phases
   */
  resetAllPhases() {
    this.phases.forEach(phase => phase.reset());
  }

  /**
   * Create a phase helper method
   * @param {string} name - Phase name
   * @param {number} duration - Duration in seconds
   * @param {string} team - Team name (optional)
   * @returns {DebatePhase}
   */
  createPhase(name, duration, team = null) {
    return new DebatePhase(name, duration, team);
  }

  /**
   * Validate configuration object
   * @param {Object} config - Configuration to validate
   * @returns {boolean}
   */
  validateConfig(config) {
    return true; // Base implementation - override in subclasses
  }
}