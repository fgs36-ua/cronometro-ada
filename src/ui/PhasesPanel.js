import { EventEmitter } from '../core/EventEmitter.js';
import { DOMHelper } from '../utils/DOMHelper.js';

/**
 * Phases Panel UI Component
 * Handles the phases panel display and phase navigation
 */
export class PhasesPanel extends EventEmitter {
  constructor() {
    super();
    this.panel = null;
    this.phasesButton = null;
    this.phasesList = null;
    this.currentPhaseDisplay = null;
    this.phaseCounterDisplay = null;
    this.isVisible = false;
    this.phases = [];
    this.currentPhaseIndex = 0;
    
    this.initializeElements();
    this.bindEvents();
  }

  /**
   * Initialize DOM elements
   * @private
   */
  initializeElements() {
    this.panel = DOMHelper.getElementById('phases-panel');
    this.phasesButton = DOMHelper.getElementById('phases-btn');
    this.phasesList = DOMHelper.getElementById('phases-list');
    this.currentPhaseDisplay = DOMHelper.getElementById('current-phase-display');
    this.phaseCounterDisplay = DOMHelper.getElementById('phase-counter-display');

    if (!this.panel || !this.phasesButton) {
      console.error('Required phases panel elements not found');
    }
  }

  /**
   * Bind event listeners
   * @private
   */
  bindEvents() {
    if (this.phasesButton) {
      DOMHelper.addEventListener(this.phasesButton, 'click', () => {
        this.toggle();
      });
    }
  }

  /**
   * Show the phases panel
   */
  show() {
    if (!this.panel) return;
    
    this.isVisible = true;
    DOMHelper.toggleClass(this.panel, 'hidden', false);
    DOMHelper.toggleClass(this.panel, 'show', true);
    
    this.emit('panelShown');
  }

  /**
   * Hide the phases panel
   */
  hide() {
    if (!this.panel) return;
    
    this.isVisible = false;
    DOMHelper.toggleClass(this.panel, 'show', false);
    DOMHelper.toggleClass(this.panel, 'hidden', true);
    
    this.emit('panelHidden');
  }

  /**
   * Toggle panel visibility
   */
  toggle() {
    if (this.isVisible) {
      this.hide();
    } else {
      this.show();
    }
  }

  /**
   * Update phases data
   * @param {Array} phases - Array of DebatePhase objects
   * @param {number} currentIndex - Current phase index
   */
  updatePhases(phases, currentIndex = 0) {
    this.phases = phases || [];
    this.currentPhaseIndex = currentIndex;
    
    this.updatePhasesHeader();
    this.updatePhasesList();
  }

  /**
   * Update phases header information
   * @private
   */
  updatePhasesHeader() {
    if (!this.currentPhaseDisplay || !this.phaseCounterDisplay) return;

    if (this.phases.length === 0) {
      this.currentPhaseDisplay.textContent = 'Configura el formato de debate';
      this.phaseCounterDisplay.textContent = '0 / 0';
    } else {
      const currentPhase = this.phases[this.currentPhaseIndex];
      this.currentPhaseDisplay.textContent = currentPhase 
        ? currentPhase.name 
        : 'Listo para comenzar';
      this.phaseCounterDisplay.textContent = `${this.currentPhaseIndex + 1} / ${this.phases.length}`;
    }
  }

  /**
   * Update phases list display
   * @private
   */
  updatePhasesList() {
    if (!this.phasesList) return;

    // Clear existing list
    DOMHelper.clearChildren(this.phasesList);

    this.phases.forEach((phase, index) => {
      const phaseItem = this.createPhaseItem(phase, index);
      this.phasesList.appendChild(phaseItem);
    });
  }

  /**
   * Create a phase list item
   * @param {DebatePhase} phase - Phase object
   * @param {number} index - Phase index
   * @returns {HTMLElement} Phase item element
   * @private
   */
  createPhaseItem(phase, index) {
    const phaseItem = DOMHelper.createElement('div', {
      className: 'phase-item'
    });

    // Add phase state classes
    if (index < this.currentPhaseIndex) {
      phaseItem.classList.add('completed');
    } else if (index === this.currentPhaseIndex) {
      phaseItem.classList.add('current');
    } else {
      phaseItem.classList.add('pending');
    }

    // Make clickable if not running
    phaseItem.classList.add('clickable');

    // Create phase content
    const phaseName = DOMHelper.createElement('span', {
      className: 'phase-name'
    }, phase.name);

    const phaseStatus = DOMHelper.createElement('span', {
      className: 'phase-status'
    }, phase.getStatusEmoji());

    phaseItem.appendChild(phaseName);
    phaseItem.appendChild(phaseStatus);

    // Add click handler for phase navigation
    DOMHelper.addEventListener(phaseItem, 'click', () => {
      this.jumpToPhase(index);
    });

    return phaseItem;
  }

  /**
   * Jump to specific phase
   * @param {number} index - Phase index
   * @private
   */
  jumpToPhase(index) {
    if (index >= 0 && index < this.phases.length) {
      this.emit('phaseJumped', { 
        fromIndex: this.currentPhaseIndex, 
        toIndex: index 
      });
    }
  }

  /**
   * Set current phase index
   * @param {number} index - New current phase index
   */
  setCurrentPhase(index) {
    this.currentPhaseIndex = index;
    this.updatePhasesHeader();
    this.updatePhasesList();
  }

  /**
   * Update phase completion status
   * @param {number} index - Phase index
   * @param {boolean} completed - Whether phase is completed
   */
  setPhaseCompleted(index, completed) {
    if (index >= 0 && index < this.phases.length) {
      this.phases[index].completed = completed;
      this.updatePhasesList();
    }
  }

  /**
   * Mark phase as current/active
   * @param {number} index - Phase index
   */
  setPhaseActive(index) {
    if (index >= 0 && index < this.phases.length) {
      // Reset all phases' current time except the active one
      this.phases.forEach((phase, i) => {
        if (i !== index && phase.currentTime !== phase.duration) {
          phase.currentTime = phase.duration;
        }
      });
      
      this.setCurrentPhase(index);
    }
  }

  /**
   * Update phase time remaining
   * @param {number} index - Phase index  
   * @param {number} currentTime - Current time in seconds
   */
  updatePhaseTime(index, currentTime) {
    if (index >= 0 && index < this.phases.length) {
      this.phases[index].setCurrentTime(currentTime);
      this.updatePhasesList();
    }
  }

  /**
   * Set phases panel navigation enabled/disabled
   * @param {boolean} enabled - Whether navigation is enabled
   */
  setNavigationEnabled(enabled) {
    if (!this.phasesList) return;

    const phaseItems = this.phasesList.querySelectorAll('.phase-item');
    phaseItems.forEach(item => {
      if (enabled) {
        item.classList.add('clickable');
        item.style.pointerEvents = '';
      } else {
        item.classList.remove('clickable');
        item.style.pointerEvents = 'none';
      }
    });
  }

  /**
   * Show phases panel with specific content
   * @param {Array} phases - Phases to display
   * @param {number} currentIndex - Current phase index
   */
  showWithPhases(phases, currentIndex = 0) {
    this.updatePhases(phases, currentIndex);
    this.show();
  }

  /**
   * Get phase by index
   * @param {number} index - Phase index
   * @returns {DebatePhase|null} Phase object or null
   */
  getPhase(index) {
    return this.phases[index] || null;
  }

  /**
   * Get current phase
   * @returns {DebatePhase|null} Current phase object or null
   */
  getCurrentPhase() {
    return this.getPhase(this.currentPhaseIndex);
  }

  /**
   * Get total phases count
   * @returns {number} Total number of phases
   */
  getPhasesCount() {
    return this.phases.length;
  }

  /**
   * Check if panel has phases
   * @returns {boolean} Whether panel has phases
   */
  hasPhases() {
    return this.phases.length > 0;
  }

  /**
   * Get progress summary
   * @returns {Object} Progress summary
   */
  getProgressSummary() {
    const completed = this.phases.filter(phase => phase.completed).length;
    const total = this.phases.length;
    const current = this.currentPhaseIndex + 1;
    
    return {
      completed,
      total,
      current,
      progress: total > 0 ? completed / total : 0
    };
  }

  /**
   * Reset all phases
   */
  resetAllPhases() {
    this.phases.forEach(phase => phase.reset());
    this.setCurrentPhase(0);
  }

  /**
   * Get current panel state
   * @returns {Object} Current state
   */
  getState() {
    return {
      isVisible: this.isVisible,
      phasesCount: this.phases.length,
      currentPhaseIndex: this.currentPhaseIndex,
      progress: this.getProgressSummary()
    };
  }

  /**
   * Cleanup resources
   */
  destroy() {
    this.events = {};
  }
}