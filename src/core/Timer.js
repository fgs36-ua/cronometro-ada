import { EventEmitter } from './EventEmitter.js';

/**
 * Core Timer class - handles timing logic and state management
 * Follows Single Responsibility Principle
 */
export class Timer extends EventEmitter {
  constructor() {
    super();
    this.isRunning = false;
    this.isPaused = false;
    this.currentTime = 0;
    this.totalTime = 0;
    this.intervalId = null;
    
    // For accurate timing when tab becomes inactive
    this.startTimestamp = null;
    this.lastVisibilityChange = Date.now();
    
    this.setupVisibilityChangeDetection();
  }

  /**
   * Start the timer
   * @param {number} duration - Duration in seconds
   */
  start(duration) {
    if (this.isRunning) return;

    if (!this.isPaused) {
      this.currentTime = duration || this.currentTime;
      // Keep totalTime as the original phase duration, not current time
      if (duration) {
        this.totalTime = duration;
      }
    }

    this.isRunning = true;
    this.isPaused = false;
    this.startTimestamp = Date.now() - (this.totalTime - this.currentTime) * 1000;
    
    this.intervalId = setInterval(() => {
      this.tick();
    }, 100);

    this.emit('started', { currentTime: this.currentTime });
  }

  /**
   * Pause/Resume the timer
   */
  pause() {
    if (!this.isRunning && !this.isPaused) return;

    if (this.isRunning) {
      // Pausing
      this.isRunning = false;
      this.isPaused = true;
      this.clearInterval();
      this.emit('paused', { currentTime: this.currentTime });
    } else if (this.isPaused) {
      // Resuming
      this.isRunning = true;
      this.isPaused = false;
      this.startTimestamp = Date.now() - (this.totalTime - this.currentTime) * 1000;
      
      this.intervalId = setInterval(() => {
        this.tick();
      }, 100);
      
      this.emit('resumed', { currentTime: this.currentTime });
    }
  }

  /**
   * Reset the timer
   * @param {number} duration - New duration (optional)
   */
  reset(duration) {
    this.stop();
    this.currentTime = duration || this.totalTime;
    this.totalTime = this.currentTime;
    this.emit('reset', { currentTime: this.currentTime });
  }

  /**
   * Stop the timer completely
   */
  stop() {
    this.isRunning = false;
    this.isPaused = false;
    this.clearInterval();
    this.emit('stopped', { currentTime: this.currentTime });
  }

  /**
   * Adjust current time by specified seconds
   * @param {number} seconds - Seconds to add (can be negative)
   */
  adjustTime(seconds) {
    const newTime = this.currentTime + seconds;
    this.setTime(newTime);
  }

  /**
   * Set current time to specific value
   * @param {number} time - Time in seconds
   */
  setTime(time) {
    const oldTime = this.currentTime;
    this.currentTime = Math.max(-300, Math.min(this.totalTime, time));
    
    // Update start timestamp for accurate timing
    if (this.isRunning) {
      this.startTimestamp = Date.now() - (this.totalTime - this.currentTime) * 1000;
    }
    
    this.emit('timeChanged', { 
      currentTime: this.currentTime, 
      oldTime: oldTime 
    });
  }

  /**
   * Get current timer state
   * @returns {Object} Timer state
   */
  getState() {
    return {
      isRunning: this.isRunning,
      isPaused: this.isPaused,
      currentTime: this.currentTime,
      totalTime: this.totalTime,
      progress: this.getProgress()
    };
  }

  /**
   * Get progress as percentage (0-1)
   * @returns {number}
   */
  getProgress() {
    if (this.totalTime === 0) return 1;
    return Math.max(0, Math.min(1, (this.totalTime - this.currentTime) / this.totalTime));
  }

  /**
   * Internal tick method for timer updates
   * @private
   */
  tick() {
    if (!this.isRunning) return;

    const now = Date.now();
    const elapsed = (now - this.startTimestamp) / 1000;
    const newTime = this.totalTime - elapsed;
    
    const oldTime = this.currentTime;
    this.currentTime = newTime;

    this.emit('tick', { 
      currentTime: this.currentTime, 
      oldTime: oldTime 
    });

    // Check if time is up (allowing negative time for overtime)
    if (oldTime > 0 && this.currentTime <= 0) {
      this.emit('timeUp', { currentTime: this.currentTime });
    }
  }

  /**
   * Clear the timer interval
   * @private
   */
  clearInterval() {
    if (this.intervalId) {
      clearInterval(this.intervalId);
      this.intervalId = null;
    }
  }

  /**
   * Setup visibility change detection for accurate timing
   * @private
   */
  setupVisibilityChangeDetection() {
    document.addEventListener('visibilitychange', () => {
      if (document.hidden) {
        this.lastVisibilityChange = Date.now();
      } else {
        this.syncTimeOnVisibilityChange();
      }
    });
  }

  /**
   * Sync time when tab becomes visible again
   * @private
   */
  syncTimeOnVisibilityChange() {
    if (!this.isRunning || !this.startTimestamp) return;

    const now = Date.now();
    const elapsed = (now - this.startTimestamp) / 1000;
    const newTime = this.totalTime - elapsed;
    
    if (Math.abs(newTime - this.currentTime) > 1) {
      const oldTime = this.currentTime;
      this.currentTime = newTime;
      this.emit('timeChanged', { 
        currentTime: this.currentTime, 
        oldTime: oldTime 
      });
    }
  }

  /**
   * Cleanup timer resources
   */
  destroy() {
    this.stop();
    this.events = {};
  }
}