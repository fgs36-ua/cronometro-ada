import Component from './Component.js';
import timer from '../core/Timer.js';
import phaseManager from '../core/PhaseManager.js';
import { TIMER_THRESHOLDS } from '../core/defaults.js';

/**
 * TimerDisplay — shows the countdown MM:SS, speaker name, and
 * applies warning / danger colours.
 */
export class TimerDisplay extends Component {
  constructor(container) {
    super(container);
    this._timerEl = null;
    this._speakerEl = null;
    this._lastCssClass = '';
    this._lastTitle = '';
  }

  mount() {
    this._timerEl = document.querySelector('#timer');
    this._speakerEl = document.querySelector('#current-speaker');
    this.bindEvents();
  }

  bindEvents() {
    this.listen('timer:tick', (d) => this._onTick(d));
    this.listen('timer:reset', () => { document.title = 'Cronómetro de Debate'; });
    this.listen('phase:changed', () => this._updateSpeaker());
    this.listen('debate:ended', () => this._onDebateEnd());
    this.listen('debate:reset', () => this._updateSpeaker());

    // Resize
    this._resizeHandler = () => this._adjustSize();
    window.addEventListener('resize', this._resizeHandler);
  }

  destroy() {
    super.destroy();
    window.removeEventListener('resize', this._resizeHandler);
  }

  /* ── private ──────────────────────────────────────────── */

  _onTick({ currentTime, totalTime }) {
    if (!this._timerEl) return;

    const minutes = Math.floor(Math.abs(currentTime) / 60);
    const seconds = Math.abs(currentTime) % 60;
    const str = `${currentTime < 0 ? '-' : ''}${String(minutes).padStart(2, '0')}:${String(seconds).padStart(2, '0')}`;

    // Only adjust size when sign changes
    const prev = this._timerEl.getAttribute('data-prev-time') || '';
    if (prev.includes('-') !== str.includes('-') || !prev) {
      this._adjustSize();
    }

    this._timerEl.textContent = str;
    this._timerEl.setAttribute('data-prev-time', str);

    // Colour classes
    let cssClass = 'timer';
    if (currentTime <= TIMER_THRESHOLDS.dangerStart) {
      cssClass = 'timer danger';
    } else if (currentTime <= TIMER_THRESHOLDS.warningStart && currentTime >= TIMER_THRESHOLDS.warningEnd) {
      cssClass = 'timer warning';
    }
    if (cssClass !== this._lastCssClass) {
      this._lastCssClass = cssClass;
      this._timerEl.className = cssClass;
    }

    // Page title — update when running, paused, or after a seek (currentTime !== totalTime)
    if (totalTime > 0 && (timer.isRunning || timer.isPaused || currentTime !== totalTime)) {
      const title = `${str} - Cronómetro de Debate`;
      if (title !== this._lastTitle) {
        this._lastTitle = title;
        document.title = title;
      }
    }
  }

  _updateSpeaker() {
    if (!this._speakerEl) return;
    const phase = phaseManager.currentPhase;
    this._speakerEl.textContent = phase ? phase.name : 'Listo para comenzar';

    // Reset page title
    if (!timer.isRunning) {
      document.title = 'Cronómetro de Debate';
    }
  }

  _onDebateEnd() {
    if (this._speakerEl) this._speakerEl.textContent = '¡Debate terminado!';
    if (this._timerEl) this._timerEl.textContent = '00:00';
    document.title = 'Cronómetro de Debate';
  }

  /** Port of adjustTimerSize() */
  _adjustSize() {
    if (!this._timerEl) return;
    const parentEl = this._timerEl.parentElement;
    if (!parentEl) return;
    const containerWidth = parentEl.offsetWidth - 20;
    const text = this._timerEl.textContent;

    // Reset inline styles
    this._timerEl.style.fontSize = '';
    this._timerEl.style.whiteSpace = '';
    this._timerEl.style.wordBreak = '';
    this._timerEl.style.overflow = '';
    this._timerEl.style.letterSpacing = '';

    if (containerWidth < 600) {
      const hasNeg = text.includes('-');
      const len = text.length;
      const factor = hasNeg ? 1.8 : 2.2;
      const base = Math.min((containerWidth / len) * factor, containerWidth * 0.22);
      const min = Math.max(base * 0.5, 28);
      const max = Math.min(base, hasNeg ? 100 : 120);

      this._timerEl.style.fontSize = `${Math.max(min, Math.min(max, base))}px`;
      this._timerEl.style.whiteSpace = 'normal';
      this._timerEl.style.wordBreak = 'break-all';
      this._timerEl.style.overflow = 'visible';
      this._timerEl.style.letterSpacing = hasNeg ? '0.01em' : '0.02em';
      this._timerEl.style.lineHeight = '1';
      this._timerEl.style.textAlign = 'center';
    }
  }
}


