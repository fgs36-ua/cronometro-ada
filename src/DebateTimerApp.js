import { Timer } from './core/Timer.js';
import { AcademicFormat } from './formats/AcademicFormat.js';
import { BritishParliamentFormat } from './formats/BritishParliamentFormat.js';
import { ConfigurationService } from './services/ConfigurationService.js';
import { ThemeService } from './services/ThemeService.js';
import { KeyboardService } from './services/KeyboardService.js';
import { TimerDisplay } from './ui/TimerDisplay.js';
import { ControlPanel } from './ui/ControlPanel.js';
import { ConfigurationPanel } from './ui/ConfigurationPanel.js';
import { PhasesPanel } from './ui/PhasesPanel.js';
import { DOMHelper } from './utils/DOMHelper.js';

/**
 * Main Application Class - Orchestrates all components
 * Implements Dependency Inversion by coordinating through abstractions
 */
export class DebateTimerApp {
  constructor() {
    // Core services
    this.configService = new ConfigurationService();
    this.themeService = new ThemeService();
    this.keyboardService = new KeyboardService();
    
    // Timer and formats
    this.timer = new Timer();
    this.formats = new Map([
      ['academico', new AcademicFormat()],
      ['bp', new BritishParliamentFormat()]
    ]);
    
    // UI Components
    this.timerDisplay = new TimerDisplay();
    this.controlPanel = new ControlPanel();
    this.configPanel = new ConfigurationPanel();
    this.phasesPanel = new PhasesPanel();
    
    // State
    this.currentFormat = null;
    this.currentPhaseIndex = 0;
    this.phases = [];
    this.debateEnded = false;
    
    this.initializeApp();
  }

  /**
   * Initialize the application
   * @private
   */
  initializeApp() {
    this.setupEventListeners();
    this.loadInitialConfiguration();
    this.setupKeyboardControls();
    this.setupThemeToggle();
    this.updateConfiguration();
  }

  /**
   * Setup event listeners for all components
   * @private
   */
  setupEventListeners() {
    // Timer events
    this.timer.on('started', (data) => this.onTimerStarted(data));
    this.timer.on('paused', (data) => this.onTimerPaused(data));
    this.timer.on('resumed', (data) => this.onTimerResumed(data));
    this.timer.on('stopped', (data) => this.onTimerStopped(data));
    this.timer.on('reset', (data) => this.onTimerReset(data));
    this.timer.on('tick', (data) => this.onTimerTick(data));
    this.timer.on('timeUp', (data) => this.onTimeUp(data));
    this.timer.on('timeChanged', (data) => this.onTimeChanged(data));

    // Timer display events
    this.timerDisplay.on('timeSeek', (data) => this.onTimeSeek(data));

    // Control panel events
    this.controlPanel.on('startPauseClicked', () => this.toggleStartPause());
    this.controlPanel.on('resetClicked', () => this.resetPhase());
    this.controlPanel.on('resetDebateClicked', () => this.resetDebate());
    this.controlPanel.on('previousPhaseClicked', () => this.previousPhase());
    this.controlPanel.on('nextPhaseClicked', () => this.nextPhase());

    // Configuration panel events
    this.configPanel.on('formatSwitched', (data) => this.switchFormat(data.format));
    this.configPanel.on('configurationApplied', (data) => this.applyConfiguration(data.config));
    this.configPanel.on('resetToDefaults', () => this.resetToDefaults());
    this.configPanel.on('keyboardControlsToggled', (data) => this.toggleKeyboardControls(data.enabled));
    this.configPanel.on('panelShown', () => this.onConfigPanelShown());
    this.configPanel.on('panelHidden', () => this.onConfigPanelHidden());

    // Phases panel events
    this.phasesPanel.on('phaseJumped', (data) => this.jumpToPhase(data.toIndex));

    // Configuration service events
    this.configService.on('configLoaded', (config) => this.onConfigLoaded(config));
    this.configService.on('configUpdated', (data) => this.onConfigUpdated(data));

    // Theme service events
    this.themeService.on('themeChanged', (data) => this.onThemeChanged(data));

    // Keyboard service events
    this.keyboardService.on('keyboardCommand', (data) => this.handleKeyboardCommand(data));
  }

  /**
   * Load initial configuration and setup
   * @private
   */
  loadInitialConfiguration() {
    const config = this.configService.getConfiguration();
    this.configPanel.loadConfiguration(config);
    this.currentFormat = config.currentFormat || 'academico';
    this.keyboardService.enabled = config.keyboardControlsEnabled;
  }

  /**
   * Setup keyboard controls
   * @private
   */
  setupKeyboardControls() {
    if (this.configService.get('keyboardControlsEnabled', true)) {
      this.keyboardService.enable();
      this.keyboardService.createHelpIndicator();
    } else {
      this.keyboardService.disable();
    }
  }

  /**
   * Setup theme toggle button
   * @private
   */
  setupThemeToggle() {
    const themeToggle = DOMHelper.getElementById('dark-mode-toggle');
    if (themeToggle) {
      DOMHelper.addEventListener(themeToggle, 'click', () => {
        this.themeService.toggleTheme();
      });
    }
  }

  /**
   * Update configuration and setup phases
   */
  updateConfiguration() {
    const config = this.configService.getConfiguration();
    const format = this.formats.get(this.currentFormat);
    
    if (format) {
      format.setupPhases(config);
      this.phases = format.getPhases();
      this.currentPhaseIndex = 0;
      
      // Update UI components
      this.phasesPanel.updatePhases(this.phases, this.currentPhaseIndex);
      this.controlPanel.showNavigationControls(this.phases.length > 0);
      
      if (this.phases.length > 0) {
        this.loadCurrentPhase();
      }
    }
  }

  /**
   * Load current phase into timer
   * @private
   */
  loadCurrentPhase() {
    if (this.currentPhaseIndex >= 0 && this.currentPhaseIndex < this.phases.length) {
      const phase = this.phases[this.currentPhaseIndex];
      this.timer.reset(phase.duration);
      this.updateDisplay();
      this.phasesPanel.setCurrentPhase(this.currentPhaseIndex);
    }
  }

  /**
   * Update all display components
   * @private
   */
  updateDisplay() {
    const currentPhase = this.phases[this.currentPhaseIndex];
    const timerState = this.timer.getState();
    
    // Update timer display
    this.timerDisplay.updateDisplay(
      timerState.currentTime,
      timerState.totalTime,
      currentPhase
    );
    
    // Update control panel
    this.controlPanel.updateControlButtons(timerState);
    
    // Update phases panel
    if (currentPhase) {
      this.phasesPanel.updatePhaseTime(this.currentPhaseIndex, timerState.currentTime);
    }
  }

  /**
   * Switch debate format
   * @param {string} format - Format name
   */
  switchFormat(format) {
    if (!this.formats.has(format)) return;
    
    this.currentFormat = format;
    this.debateEnded = false;
    this.configService.set('currentFormat', format);
    this.updateConfiguration();
    this.resetDebate();
  }

  /**
   * Apply configuration
   * @param {Object} config - Configuration object
   */
  applyConfiguration(config) {
    this.configService.updateConfiguration(config);
    this.updateConfiguration();
  }

  /**
   * Reset to default configuration
   */
  resetToDefaults() {
    this.configService.resetToDefaults();
    const config = this.configService.getConfiguration();
    this.configPanel.loadConfiguration(config);
    this.updateConfiguration();
  }

  /**
   * Toggle keyboard controls
   * @param {boolean} enabled - Whether to enable keyboard controls
   */
  toggleKeyboardControls(enabled) {
    this.configService.set('keyboardControlsEnabled', enabled);
    if (enabled) {
      this.keyboardService.enable();
    } else {
      this.keyboardService.disable();
    }
  }

  /**
   * Start/pause/resume timer
   */
  toggleStartPause() {
    if (!this.timer.isRunning && !this.timer.isPaused) {
      this.startTimer();
    } else if (this.timer.isRunning) {
      this.timer.pause();
    } else if (this.timer.isPaused) {
      this.timer.pause(); // Resume
    }
  }

  /**
   * Start the timer
   * @private
   */
  startTimer() {
    const currentPhase = this.phases[this.currentPhaseIndex];
    if (currentPhase) {
      this.timer.start(currentPhase.currentTime);
    }
  }

  /**
   * Reset current phase
   */
  resetPhase() {
    const currentPhase = this.phases[this.currentPhaseIndex];
    if (currentPhase) {
      currentPhase.reset();
      this.timer.reset(currentPhase.duration);
      this.updateDisplay();
    }
  }

  /**
   * Reset entire debate
   */
  resetDebate() {
    this.timer.stop();
    this.currentPhaseIndex = 0;
    this.debateEnded = false;
    
    // Reset all phases
    this.phases.forEach(phase => phase.reset());
    
    // Load first phase
    this.loadCurrentPhase();
    this.phasesPanel.resetAllPhases();
  }

  /**
   * Go to previous phase
   */
  previousPhase() {
    if (this.timer.isRunning) return;
    
    if (this.currentPhaseIndex > 0) {
      this.currentPhaseIndex--;
      this.loadCurrentPhase();
    }
  }

  /**
   * Go to next phase
   */
  nextPhase() {
    if (this.timer.isRunning) return;
    
    if (this.currentPhaseIndex < this.phases.length - 1) {
      // Mark current phase as completed
      const currentPhase = this.phases[this.currentPhaseIndex];
      if (currentPhase) {
        currentPhase.complete();
      }
      
      this.currentPhaseIndex++;
      this.loadCurrentPhase();
    } else {
      // Debate ended
      this.debateEnded = true;
      this.timerDisplay.showTemporaryMessage('¡Debate finalizado!', 3000);
    }
  }

  /**
   * Jump to specific phase
   * @param {number} index - Phase index
   */
  jumpToPhase(index) {
    if (this.timer.isRunning) return;
    if (index < 0 || index >= this.phases.length) return;
    
    this.currentPhaseIndex = index;
    this.loadCurrentPhase();
  }

  /**
   * Adjust current time
   * @param {number} seconds - Seconds to adjust (can be negative)
   */
  adjustTime(seconds) {
    this.timer.adjustTime(seconds);
    this.updateDisplay();
  }

  /**
   * Handle keyboard commands
   * @param {Object} data - Command data
   * @private
   */
  handleKeyboardCommand(data) {
    const { command, args } = data;
    
    switch (command) {
      case 'toggleTimer':
        this.toggleStartPause();
        break;
      case 'resetPhase':
        this.resetPhase();
        break;
      case 'resetDebate':
        this.resetDebate();
        break;
      case 'previousPhase':
        this.previousPhase();
        break;
      case 'nextPhase':
        this.nextPhase();
        break;
      case 'adjustTime':
        this.adjustTime(args);
        break;
      case 'toggleConfig':
        this.configPanel.toggle();
        break;
      case 'togglePhases':
        this.phasesPanel.toggle();
        break;
      case 'closePanels':
        this.configPanel.hide();
        this.phasesPanel.hide();
        this.keyboardService.hideHelp();
        break;
      case 'applyConfig':
        if (this.configPanel.isVisible) {
          this.configPanel.applyConfiguration();
        }
        break;
      case 'toggleHelp':
        this.keyboardService.toggleHelp();
        break;
      case 'switchFormat':
        if (args) {
          this.switchFormat(args);
        }
        break;
    }
  }

  // Event handlers
  onTimerStarted(data) {
    this.updateDisplay();
    this.phasesPanel.setNavigationEnabled(false);
  }

  onTimerPaused(data) {
    this.updateDisplay();
  }

  onTimerResumed(data) {
    this.updateDisplay();
  }

  onTimerStopped(data) {
    this.updateDisplay();
    this.phasesPanel.setNavigationEnabled(true);
  }

  onTimerReset(data) {
    this.updateDisplay();
  }

  onTimerTick(data) {
    this.updateDisplay();
  }

  onTimeUp(data) {
    // Handle time up (could add sound notification here)
    console.log('Time up!');
  }

  onTimeChanged(data) {
    this.updateDisplay();
  }

  onTimeSeek(data) {
    this.timer.setTime(data.newTime);
    this.updateDisplay();
  }

  onConfigLoaded(config) {
    this.currentFormat = config.currentFormat || 'academico';
  }

  onConfigUpdated(data) {
    // Configuration was updated
  }

  onThemeChanged(data) {
    // Theme changed - components will automatically update via CSS
  }

  onConfigPanelShown() {
    this.phasesPanel.hide();
  }

  onConfigPanelHidden() {
    // Config panel hidden
  }

  /**
   * Cleanup application resources
   */
  destroy() {
    this.timer.destroy();
    this.timerDisplay.destroy();
    this.controlPanel.destroy();
    this.configPanel.destroy();
    this.phasesPanel.destroy();
    this.keyboardService.destroy();
    this.themeService.destroy();
  }
}