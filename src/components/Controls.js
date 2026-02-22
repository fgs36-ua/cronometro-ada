import Component from './Component.js';
import timer from '../core/Timer.js';
import phaseManager from '../core/PhaseManager.js';

/**
 * Controls — Start/Pause, Reset Phase, Reset Debate, and navigation buttons.
 */
export class Controls extends Component {
  constructor(container) {
    super(container);
  }

  mount() {
    this._sp = document.querySelector('#start-pause-btn');
    this._reset = document.querySelector('#reset-btn');
    this._resetDebate = document.querySelector('#reset-debate-btn');
    this._prev = document.querySelector('#prev-btn');
    this._next = document.querySelector('#next-btn');
    this._nav = document.querySelector('#navigation-controls');
    this.bindEvents();
  }

  bindEvents() {
    this._sp.addEventListener('click', () => this._toggleStartPause());
    this._reset.addEventListener('click', () => this._resetPhase());
    this._resetDebate.addEventListener('click', () => phaseManager.resetDebate());
    this._prev.addEventListener('click', () => phaseManager.previousPhase());
    this._next.addEventListener('click', () => phaseManager.nextPhase());

    // Listen for state changes
    this.listen('timer:start', () => this._updateButtons());
    this.listen('timer:pause', () => this._updateButtons());
    this.listen('timer:resume', () => this._updateButtons());
    this.listen('timer:reset', () => this._updateButtons());
    this.listen('phase:changed', () => this._updateButtons());
    this.listen('debate:ended', () => this._onDebateEnd());
    this.listen('debate:reset', () => this._onDebateReset());

    // Handle keyboard actions
    this.listen('keyboard:action', ({ action }) => {
      switch (action) {
        case 'toggleStartPause': this._toggleStartPause(); break;
        case 'previousPhase': if (!timer.isRunning) phaseManager.previousPhase(); break;
        case 'nextPhase': if (!timer.isRunning) phaseManager.nextPhase(); break;
        case 'resetPhase': if (!timer.isRunning) this._resetPhase(); break;
        case 'resetDebate': if (!timer.isRunning) phaseManager.resetDebate(); break;
      }

      // Time adjustments (only when not running)
      if (action.startsWith('adjustTime') && !timer.isRunning) {
        const delta = parseInt(action.replace('adjustTime', ''), 10);
        timer.adjustTime(delta);
        this._showFeedback(`${delta > 0 ? '+' : ''}${delta}s`);
      }
    });
  }

  /* ── private ──────────────────────────────────────────── */

  _toggleStartPause() {
    if (!timer.isRunning && !timer.isPaused) {
      timer.start();
    } else {
      timer.pause();
    }
    this._updateButtons();
  }

  _resetPhase() {
    timer.reset();
    const phase = phaseManager.currentPhase;
    if (phase) timer.load(phase.duration);
    this._updateButtons();
  }

  _updateButtons() {
    // Start/Pause text & class
    this._sp.className = 'control-btn';
    if (!timer.isRunning && !timer.isPaused) {
      this._sp.textContent = 'Iniciar';
      this._sp.classList.add('start');
    } else if (timer.isRunning) {
      this._sp.textContent = 'Pausar';
      this._sp.classList.add('pause');
    } else if (timer.isPaused) {
      this._sp.textContent = 'Reanudar';
      this._sp.classList.add('pause');
    }

    // Disable nav / reset while running
    this._prev.disabled = timer.isRunning || phaseManager.currentIndex === 0;
    this._next.disabled = timer.isRunning || phaseManager.currentIndex >= phaseManager.total - 1;
    this._reset.disabled = timer.isRunning;
    this._resetDebate.disabled = timer.isRunning;
  }

  _onDebateEnd() {
    this._updateButtons();
  }

  _onDebateReset() {
    this._updateButtons();
  }

  _showFeedback(message) {
    let el = document.getElementById('keyboard-feedback');
    if (!el) {
      el = document.createElement('div');
      el.id = 'keyboard-feedback';
      el.style.cssText = `
        position: fixed; top: 50%; left: 50%;
        transform: translate(-50%, -50%);
        background: rgba(44,62,80,0.9); color: white;
        padding: 10px 20px; border-radius: 20px;
        font-size: 1.1rem; font-weight: 600; z-index: 10000;
        opacity: 0; transition: opacity 0.3s ease; pointer-events: none;
      `;
      document.body.appendChild(el);
    }
    el.textContent = message;
    el.style.opacity = '1';
    setTimeout(() => { el.style.opacity = '0'; }, 1000);
  }
}


