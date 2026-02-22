import Component from './Component.js';
import timer from '../core/Timer.js';
import phaseManager from '../core/PhaseManager.js';
import { TIMER_THRESHOLDS } from '../core/defaults.js';

/**
 * ProgressBar — interactive seek bar with click, drag, and touch support.
 */
export class ProgressBar extends Component {
  constructor(container) {
    super(container);
    this._barEl = null;
    this._fillEl = null;
    this._tooltip = null;
    this._isDragging = false;
  }

  render() {
    return `
      <div class="progress-bar">
        <div class="progress-fill" id="progress-fill"></div>
      </div>
    `;
  }

  mount() {
    this._barEl = document.querySelector('.progress-bar');
    this._fillEl = document.querySelector('#progress-fill');
    this.bindEvents();
  }

  bindEvents() {
    this.listen('timer:tick', (d) => this._onTick(d));

    // Mouse
    this._barEl.addEventListener('mousedown', (e) => this._onMouseDown(e));
    this._barEl.addEventListener('mousemove', (e) => this._onMouseMove(e));
    this._barEl.addEventListener('mouseleave', () => this._hideTooltip());

    this._docMouseUp = () => {
      if (this._isDragging) this._endDrag();
    };
    document.addEventListener('mouseup', this._docMouseUp);

    this._barEl.addEventListener('click', (e) => {
      if (!this._isDragging) this._handleInteraction(e, false);
    });

    // Touch
    this._barEl.addEventListener('touchstart', (e) => this._onTouchStart(e), { passive: false });
    this._barEl.addEventListener('touchmove', (e) => this._onTouchMove(e), { passive: false });
    this._docTouchEnd = () => {
      if (this._isDragging) this._endDrag();
    };
    document.addEventListener('touchend', this._docTouchEnd);
  }

  destroy() {
    super.destroy();
    document.removeEventListener('mouseup', this._docMouseUp);
    document.removeEventListener('touchend', this._docTouchEnd);
    this._hideTooltip(true);
  }

  /* ── tick → update fill ───────────────────────────────── */

  _onTick({ currentTime, totalTime }) {
    if (!this._fillEl || totalTime === 0) return;
    const pct = Math.max(0, ((totalTime - currentTime) / totalTime) * 100);
    this._fillEl.style.width = `${pct}%`;

    this._fillEl.className = 'progress-fill';
    if (currentTime <= TIMER_THRESHOLDS.dangerStart) {
      this._fillEl.classList.add('danger');
    } else if (currentTime <= TIMER_THRESHOLDS.warningStart && currentTime >= TIMER_THRESHOLDS.warningEnd) {
      this._fillEl.classList.add('warning');
    }
  }

  /* ── mouse ─────────────────────────────────────────────── */

  _onMouseDown(e) {
    this._isDragging = true;
    this._handleInteraction(e, true);
    this._showTooltip(e);
    e.preventDefault();
  }

  _onMouseMove(e) {
    if (this._isDragging) {
      this._handleInteraction(e, true);
    }
    this._showTooltip(e);
  }

  /* ── touch ─────────────────────────────────────────────── */

  _onTouchStart(e) {
    this._isDragging = true;
    this._handleInteraction(e.touches[0], true);
    e.preventDefault();
  }

  _onTouchMove(e) {
    if (this._isDragging) {
      this._handleInteraction(e.touches[0], true);
      e.preventDefault();
    }
  }

  _endDrag() {
    this._isDragging = false;
    this._hideTooltip();
    // Full update after drag
    const td = timer.currentTime;
    const tt = timer.totalTime;
    if (tt > 0) this._onTick({ currentTime: td, totalTime: tt });
  }

  /* ── seek logic ────────────────────────────────────────── */

  _handleInteraction(event, optimized) {
    if (phaseManager.total === 0) return;

    const rect = this._barEl.getBoundingClientRect();
    const x = event.clientX - rect.left;
    const pct = Math.max(0, Math.min(1, x / rect.width));

    const phase = phaseManager.currentPhase;
    const newTime = Math.round(phase.duration - pct * phase.duration);

    timer.seekTo(newTime);

    if (optimized) {
      this._updateOptimized(newTime, phase.duration);
    }
  }

  /** Lightweight DOM update during drag. */
  _updateOptimized(currentTime, totalTime) {
    if (!this._fillEl) return;
    const pct = Math.max(0, ((totalTime - currentTime) / totalTime) * 100);
    this._fillEl.style.width = `${pct}%`;

    this._fillEl.className = 'progress-fill';
    if (currentTime <= TIMER_THRESHOLDS.dangerStart) {
      this._fillEl.classList.add('danger');
    } else if (currentTime <= TIMER_THRESHOLDS.warningStart && currentTime >= TIMER_THRESHOLDS.warningEnd) {
      this._fillEl.classList.add('warning');
    }
  }

  /* ── tooltip ───────────────────────────────────────────── */

  _showTooltip(event) {
    if (phaseManager.total === 0) return;

    if (!this._tooltip) {
      this._tooltip = document.createElement('div');
      this._tooltip.style.cssText = `
        position: absolute;
        background: rgba(44,62,80,0.9);
        color: white;
        padding: 4px 8px;
        border-radius: 4px;
        font-size: 12px;
        font-weight: 500;
        pointer-events: none;
        z-index: 1000;
        opacity: 0;
        transition: opacity 0.2s ease;
        transform: translateX(-50%);
      `;
      document.body.appendChild(this._tooltip);
    }

    const rect = this._barEl.getBoundingClientRect();
    const x = event.clientX - rect.left;
    const pct = Math.max(0, Math.min(1, x / rect.width));

    const phase = phaseManager.currentPhase;
    const previewTime = Math.round(phase.duration - pct * phase.duration);
    const mins = Math.floor(Math.abs(previewTime) / 60);
    const secs = Math.abs(previewTime) % 60;
    const str = `${previewTime < 0 ? '-' : ''}${String(mins).padStart(2, '0')}:${String(secs).padStart(2, '0')}`;

    this._tooltip.textContent = str;
    this._tooltip.style.left = `${event.clientX}px`;
    this._tooltip.style.top = `${rect.top - 30}px`;
    this._tooltip.style.opacity = '1';
  }

  _hideTooltip(remove = false) {
    if (this._tooltip) {
      this._tooltip.style.opacity = '0';
      if (remove) {
        this._tooltip.remove();
        this._tooltip = null;
      }
    }
  }
}

export default ProgressBar;
