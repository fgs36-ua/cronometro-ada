import { EventEmitter } from '../core/EventEmitter.js';
import { DOMHelper } from '../utils/DOMHelper.js';

/**
 * Control Panel UI Component
 * Handles timer control buttons (start, pause, reset, etc.)
 */
export class ControlPanel extends EventEmitter {
  constructor(containerSelector = '.controls') {
    super();
    this.container = DOMHelper.querySelector(containerSelector);
    this.startPauseButton = null;
    this.resetButton = null;
    this.resetDebateButton = null;
    this.navigationControls = null;
    this.prevButton = null;
    this.nextButton = null;
    
    this.isRunning = false;
    this.isPaused = false;
    this.canNavigate = true;
    
    this.initializeElements();
    this.bindEvents();
  }

  /**
   * Initialize DOM elements
   * @private
   */
  initializeElements() {
    if (!this.container) {
      console.error('Control panel container not found');
      return;
    }

    this.startPauseButton = DOMHelper.getElementById('start-pause-btn');
    this.resetButton = DOMHelper.getElementById('reset-btn');
    this.resetDebateButton = DOMHelper.getElementById('reset-debate-btn');
    this.navigationControls = DOMHelper.getElementById('navigation-controls');
    this.prevButton = DOMHelper.getElementById('prev-btn');
    this.nextButton = DOMHelper.getElementById('next-btn');

    if (!this.startPauseButton || !this.resetButton || !this.resetDebateButton) {
      console.error('Required control panel elements not found');
    }
  }

  /**
   * Bind event listeners
   * @private
   */
  bindEvents() {
    if (this.startPauseButton) {
      DOMHelper.addEventListener(this.startPauseButton, 'click', () => {
        this.emit('startPauseClicked');
      });
    }

    if (this.resetButton) {
      DOMHelper.addEventListener(this.resetButton, 'click', () => {
        this.emit('resetClicked');
      });
    }

    if (this.resetDebateButton) {
      DOMHelper.addEventListener(this.resetDebateButton, 'click', () => {
        this.emit('resetDebateClicked');
      });
    }

    if (this.prevButton) {
      DOMHelper.addEventListener(this.prevButton, 'click', () => {
        this.emit('previousPhaseClicked');
      });
    }

    if (this.nextButton) {
      DOMHelper.addEventListener(this.nextButton, 'click', () => {
        this.emit('nextPhaseClicked');
      });
    }
  }

  /**
   * Update control button states
   * @param {Object} state - Timer state
   */
  updateControlButtons(state) {
    this.isRunning = state.isRunning;
    this.isPaused = state.isPaused;
    
    this.updateStartPauseButton();
    this.updateResetButtons();
    this.updateNavigationButtons();
  }

  /**
   * Update start/pause button state
   * @private
   */
  updateStartPauseButton() {
    if (!this.startPauseButton) return;

    // Reset CSS classes
    this.startPauseButton.className = 'control-btn';
    this.startPauseButton.disabled = false;

    if (!this.isRunning && !this.isPaused) {
      // State: Stopped - Show "Iniciar" with blue background
      this.startPauseButton.textContent = 'Iniciar';
      this.startPauseButton.classList.add('start');
    } else if (this.isRunning && !this.isPaused) {
      // State: Running - Show "Pausar" with yellow background
      this.startPauseButton.textContent = 'Pausar';
      this.startPauseButton.classList.add('pause');
    } else if (this.isPaused) {
      // State: Paused - Show "Reanudar" with yellow background
      this.startPauseButton.textContent = 'Reanudar';
      this.startPauseButton.classList.add('pause');
    }
  }

  /**
   * Update reset button states
   * @private
   */
  updateResetButtons() {
    if (this.resetButton) {
      this.resetButton.disabled = this.isRunning;
    }
    if (this.resetDebateButton) {
      this.resetDebateButton.disabled = this.isRunning;
    }
  }

  /**
   * Update navigation button states
   * @private
   */
  updateNavigationButtons() {
    const navigationDisabled = this.isRunning || !this.canNavigate;
    
    if (this.prevButton) {
      this.prevButton.disabled = navigationDisabled;
    }
    if (this.nextButton) {
      this.nextButton.disabled = navigationDisabled;
    }
  }

  /**
   * Set navigation availability
   * @param {boolean} canNavigate - Whether navigation is available
   */
  setNavigationEnabled(canNavigate) {
    this.canNavigate = canNavigate;
    this.updateNavigationButtons();
  }

  /**
   * Show/hide navigation controls
   * @param {boolean} show - Whether to show navigation controls
   */
  showNavigationControls(show) {
    if (!this.navigationControls) return;
    
    DOMHelper.toggleClass(this.navigationControls, 'hidden', !show);
  }

  /**
   * Set specific button enabled/disabled state
   * @param {string} buttonName - Button name ('start', 'reset', 'resetDebate', 'prev', 'next')
   * @param {boolean} enabled - Whether button should be enabled
   */
  setButtonEnabled(buttonName, enabled) {
    const buttons = {
      start: this.startPauseButton,
      reset: this.resetButton,
      resetDebate: this.resetDebateButton,
      prev: this.prevButton,
      next: this.nextButton
    };

    const button = buttons[buttonName];
    if (button) {
      button.disabled = !enabled;
    }
  }

  /**
   * Update button text
   * @param {string} buttonName - Button name
   * @param {string} text - New button text
   */
  setButtonText(buttonName, text) {
    const buttons = {
      start: this.startPauseButton,
      reset: this.resetButton,
      resetDebate: this.resetDebateButton,
      prev: this.prevButton,
      next: this.nextButton
    };

    const button = buttons[buttonName];
    if (button) {
      button.textContent = text;
    }
  }

  /**
   * Add CSS class to button
   * @param {string} buttonName - Button name
   * @param {string} className - CSS class to add
   */
  addButtonClass(buttonName, className) {
    const buttons = {
      start: this.startPauseButton,
      reset: this.resetButton,
      resetDebate: this.resetDebateButton,
      prev: this.prevButton,
      next: this.nextButton
    };

    const button = buttons[buttonName];
    if (button) {
      button.classList.add(className);
    }
  }

  /**
   * Remove CSS class from button
   * @param {string} buttonName - Button name
   * @param {string} className - CSS class to remove
   */
  removeButtonClass(buttonName, className) {
    const buttons = {
      start: this.startPauseButton,
      reset: this.resetButton,
      resetDebate: this.resetDebateButton,
      prev: this.prevButton,
      next: this.nextButton
    };

    const button = buttons[buttonName];
    if (button) {
      button.classList.remove(className);
    }
  }

  /**
   * Show temporary feedback on a button
   * @param {string} buttonName - Button name
   * @param {string} message - Feedback message
   * @param {number} duration - Duration in milliseconds
   */
  showButtonFeedback(buttonName, message, duration = 1500) {
    const buttons = {
      start: this.startPauseButton,
      reset: this.resetButton,
      resetDebate: this.resetDebateButton,
      prev: this.prevButton,
      next: this.nextButton
    };

    const button = buttons[buttonName];
    if (!button) return;

    const originalText = button.textContent;
    button.textContent = message;
    button.classList.add('feedback');

    setTimeout(() => {
      button.textContent = originalText;
      button.classList.remove('feedback');
    }, duration);
  }

  /**
   * Get current control panel state
   * @returns {Object} Current state
   */
  getState() {
    return {
      isRunning: this.isRunning,
      isPaused: this.isPaused,
      canNavigate: this.canNavigate,
      buttons: {
        startPause: {
          text: this.startPauseButton?.textContent,
          disabled: this.startPauseButton?.disabled
        },
        reset: {
          disabled: this.resetButton?.disabled
        },
        resetDebate: {
          disabled: this.resetDebateButton?.disabled
        },
        prev: {
          disabled: this.prevButton?.disabled
        },
        next: {
          disabled: this.nextButton?.disabled
        }
      }
    };
  }

  /**
   * Cleanup resources
   */
  destroy() {
    this.events = {};
  }
}