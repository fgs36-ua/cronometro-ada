import { EventEmitter } from '../core/EventEmitter.js';
import { DOMHelper } from '../utils/DOMHelper.js';
import { TimeFormatter } from '../utils/TimeFormatter.js';

/**
 * Timer Display UI Component
 * Handles the visual representation of the timer and current phase
 */
export class TimerDisplay extends EventEmitter {
  constructor(containerSelector = '.timer-display') {
    super();
    this.container = DOMHelper.querySelector(containerSelector);
    this.timerElement = null;
    this.currentSpeakerElement = null;
    this.progressBarElement = null;
    this.progressFillElement = null;
    this.currentTime = 0;
    this.totalTime = 0;
    this.currentPhase = null;
    
    this.initializeElements();
    this.setupProgressBarInteraction();
  }

  /**
   * Initialize DOM elements
   * @private
   */
  initializeElements() {
    if (!this.container) {
      console.error('Timer display container not found');
      return;
    }

    this.currentSpeakerElement = DOMHelper.querySelector('.current-speaker', this.container);
    this.timerElement = DOMHelper.querySelector('.timer', this.container);
    this.progressBarElement = DOMHelper.querySelector('.progress-bar', this.container);
    this.progressFillElement = DOMHelper.querySelector('.progress-fill', this.container);

    if (!this.timerElement || !this.currentSpeakerElement || !this.progressBarElement || !this.progressFillElement) {
      console.error('Required timer display elements not found');
    }
  }

  /**
   * Update the timer display
   * @param {number} currentTime - Current time in seconds
   * @param {number} totalTime - Total time in seconds
   * @param {Object} phase - Current phase object
   */
  updateDisplay(currentTime, totalTime, phase = null) {
    this.currentTime = currentTime;
    this.totalTime = totalTime;
    this.currentPhase = phase;

    this.updateTimeDisplay();
    this.updateCurrentSpeaker();
    this.updateProgressBar();
    this.updateThemeClasses();
  }

  /**
   * Update the time display
   * @private
   */
  updateTimeDisplay() {
    if (!this.timerElement) return;
    
    const formattedTime = TimeFormatter.formatTime(this.currentTime);
    this.timerElement.textContent = formattedTime;
  }

  /**
   * Update the current speaker/phase display
   * @private
   */
  updateCurrentSpeaker() {
    if (!this.currentSpeakerElement) return;
    
    if (this.currentPhase) {
      this.currentSpeakerElement.textContent = this.currentPhase.name;
    } else {
      this.currentSpeakerElement.textContent = 'Listo para comenzar';
    }
  }

  /**
   * Update the progress bar
   * @private
   */
  updateProgressBar() {
    if (!this.progressFillElement) return;
    
    let progress = 0;
    if (this.totalTime > 0) {
      progress = Math.max(0, Math.min(1, (this.totalTime - this.currentTime) / this.totalTime));
    }
    
    this.progressFillElement.style.width = `${progress * 100}%`;
  }

  /**
   * Update theme-based CSS classes for warning/danger states
   * @private
   */
  updateThemeClasses() {
    if (!this.timerElement || !this.progressFillElement) return;

    // Remove existing state classes
    this.timerElement.classList.remove('warning', 'danger');
    this.progressFillElement.classList.remove('warning', 'danger');

    // Add appropriate state classes
    if (this.currentTime <= -11) {
      this.timerElement.classList.add('danger');
      this.progressFillElement.classList.add('danger');
    } else if (this.currentTime <= 10 && this.currentTime >= -10) {
      this.timerElement.classList.add('warning');
      this.progressFillElement.classList.add('warning');
    }
  }

  /**
   * Setup progress bar interaction for seeking
   * @private
   */
  setupProgressBarInteraction() {
    if (!this.progressBarElement) return;

    let tooltip = null;

    const createTooltip = () => {
      if (tooltip) return tooltip;
      
      tooltip = DOMHelper.createElement('div', {
        style: {
          position: 'fixed',
          background: 'var(--bg-secondary)',
          color: 'var(--text-primary)',
          padding: '4px 8px',
          borderRadius: '4px',
          fontSize: '0.8rem',
          pointerEvents: 'none',
          zIndex: '9999',
          opacity: '0',
          transition: 'opacity 0.2s ease',
          whiteSpace: 'nowrap'
        }
      });
      
      document.body.appendChild(tooltip);
      return tooltip;
    };

    const showTooltip = (event) => {
      if (!this.currentPhase) return;
      
      const rect = this.progressBarElement.getBoundingClientRect();
      const clickX = event.clientX - rect.left;
      const progressBarWidth = rect.width;
      let progressPercentage = Math.max(0, Math.min(1, clickX / progressBarWidth));

      const previewTime = Math.round(this.totalTime - progressPercentage * this.totalTime);
      const timeString = TimeFormatter.formatTooltipTime(previewTime);

      const tooltipEl = createTooltip();
      tooltipEl.textContent = timeString;
      tooltipEl.style.left = `${event.clientX}px`;
      tooltipEl.style.top = `${rect.top - 30}px`;
      tooltipEl.style.opacity = '1';
    };

    const hideTooltip = () => {
      if (tooltip) {
        tooltip.style.opacity = '0';
      }
    };

    const handleClick = (event) => {
      if (!this.currentPhase) return;
      
      const rect = this.progressBarElement.getBoundingClientRect();
      const clickX = event.clientX - rect.left;
      const progressBarWidth = rect.width;
      let progressPercentage = Math.max(0, Math.min(1, clickX / progressBarWidth));

      const newTime = this.totalTime - progressPercentage * this.totalTime;
      
      this.emit('timeSeek', {
        newTime: Math.round(newTime),
        percentage: progressPercentage
      });
    };

    // Event listeners
    DOMHelper.addEventListener(this.progressBarElement, 'mousemove', showTooltip);
    DOMHelper.addEventListener(this.progressBarElement, 'mouseleave', hideTooltip);
    DOMHelper.addEventListener(this.progressBarElement, 'click', handleClick);
  }

  /**
   * Set the size/scale of the timer display
   * @param {string} size - Size class ('small', 'medium', 'large')
   */
  setSize(size) {
    if (!this.container) return;
    
    this.container.classList.remove('timer-small', 'timer-medium', 'timer-large');
    if (size && size !== 'default') {
      this.container.classList.add(`timer-${size}`);
    }
  }

  /**
   * Show a temporary message instead of the timer
   * @param {string} message - Message to show
   * @param {number} duration - Duration in milliseconds (default: 2000)
   */
  showTemporaryMessage(message, duration = 2000) {
    if (!this.timerElement) return;

    const originalContent = this.timerElement.textContent;
    this.timerElement.textContent = message;
    this.timerElement.classList.add('temporary-message');

    setTimeout(() => {
      this.timerElement.textContent = originalContent;
      this.timerElement.classList.remove('temporary-message');
    }, duration);
  }

  /**
   * Show time adjustment feedback (+/-seconds)
   * @param {string} feedback - Feedback text (e.g., "+30s", "-10s")
   * @param {number} duration - Duration in milliseconds (default: 1500)
   */
  showFeedback(feedback, duration = 1500) {
    if (!this.timerElement) return;

    // Create a temporary feedback element
    const feedbackElement = document.createElement('div');
    feedbackElement.className = 'timer-feedback';
    feedbackElement.textContent = feedback;
    feedbackElement.style.cssText = `
      position: absolute;
      top: 50%;
      left: 50%;
      transform: translate(-50%, -50%);
      background: rgba(0, 0, 0, 0.8);
      color: white;
      padding: 8px 16px;
      border-radius: 20px;
      font-size: 1.5rem;
      font-weight: bold;
      z-index: 1000;
      pointer-events: none;
      opacity: 0;
      transition: opacity 0.3s ease;
    `;

    // Position relative to timer container
    const timerContainer = this.timerElement.closest('.timer-section') || this.timerElement.parentElement;
    if (timerContainer) {
      timerContainer.style.position = 'relative';
      timerContainer.appendChild(feedbackElement);
      
      // Fade in
      setTimeout(() => {
        feedbackElement.style.opacity = '1';
      }, 10);
      
      // Fade out and remove
      setTimeout(() => {
        feedbackElement.style.opacity = '0';
        setTimeout(() => {
          if (feedbackElement.parentElement) {
            feedbackElement.parentElement.removeChild(feedbackElement);
          }
        }, 300);
      }, duration);
    }
  }

  /**
   * Get current display state
   * @returns {Object} Current display state
   */
  getState() {
    return {
      currentTime: this.currentTime,
      totalTime: this.totalTime,
      currentPhase: this.currentPhase,
      formattedTime: TimeFormatter.formatTime(this.currentTime)
    };
  }

  /**
   * Cleanup resources
   */
  destroy() {
    const tooltip = document.querySelector('[data-tooltip="timer-progress"]');
    if (tooltip) {
      tooltip.remove();
    }
    this.events = {};
  }
}