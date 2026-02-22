import Component from './Component.js';
import timer from '../core/Timer.js';
import phaseManager from '../core/PhaseManager.js';

/**
 * PhaseList — right-side panel showing all phases with SVG status icons,
 * click-to-jump, and header with current phase counter.
 */

const SVG_ICONS = {
  completed: `<svg width="20" height="20" viewBox="0 0 20 20" fill="none" xmlns="http://www.w3.org/2000/svg">
    <rect width="20" height="20" rx="4" fill="currentColor" fill-opacity="0.15"/>
    <path d="M6 10.5L9 13.5L14.5 7" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
  </svg>`,
  current: `<svg width="20" height="20" viewBox="0 0 20 20" fill="none" xmlns="http://www.w3.org/2000/svg">
    <path d="M10 3V6L13 4.5" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"/>
    <path d="M16.3 6.7A7 7 0 1 1 6.7 3.7" stroke="currentColor" stroke-width="1.8" stroke-linecap="round"/>
  </svg>`,
  pending: `<svg width="20" height="20" viewBox="0 0 20 20" fill="none" xmlns="http://www.w3.org/2000/svg">
    <circle cx="10" cy="10" r="7" stroke="currentColor" stroke-width="1.5" stroke-opacity="0.5"/>
    <circle cx="10" cy="10" r="2.5" fill="currentColor" fill-opacity="0.2"/>
  </svg>`,
};
export class PhaseList extends Component {
  constructor(container) {
    super(container);
  }

  mount() {
    this._listEl = document.querySelector('#phases-list');
    this._phaseDisplay = document.querySelector('#current-phase-display');
    this._counterDisplay = document.querySelector('#phase-counter-display');
    this._phasesBtn = document.querySelector('#phases-btn');
    this._phasesPanel = document.querySelector('#phases-panel');
    this.bindEvents();
  }

  bindEvents() {
    this.listen('phase:changed', () => this._rebuild());
    this.listen('timer:start', () => this._rebuild());
    this.listen('timer:pause', () => this._rebuild());
    this.listen('timer:reset', () => this._rebuild());
    this.listen('debate:reset', () => this._rebuild());
    this.listen('debate:ended', () => this._rebuild());
    this.listen('timer:tick', () => this._updateHeader());

    // Toggle phases panel
    if (this._phasesBtn) {
      this._phasesBtn.addEventListener('click', () => this._togglePanel());
    }

    this.listen('keyboard:action', ({ action }) => {
      if (action === 'togglePhases') this._togglePanel();
      if (action === 'closePanels') this._hidePanel();
    });
  }

  _togglePanel() {
    if (!this._phasesPanel) return;
    this._phasesPanel.classList.toggle('show');
    this._phasesPanel.classList.toggle('hidden');
  }

  _hidePanel() {
    if (!this._phasesPanel) return;
    this._phasesPanel.classList.remove('show');
    this._phasesPanel.classList.add('hidden');
  }

  /* ── private ──────────────────────────────────────────── */

  _rebuild() {
    this._updateHeader();
    if (!this._listEl) return;

    this._listEl.innerHTML = '';
    const phases = phaseManager.phases;
    const idx = phaseManager.currentIndex;

    phases.forEach((phase, i) => {
      const item = document.createElement('div');
      item.className = 'phase-item';

      let icon;
      if (i < idx) {
        item.classList.add('completed');
        icon = SVG_ICONS.completed;
      } else if (i === idx) {
        item.classList.add('current');
        icon = SVG_ICONS.current;
      } else {
        item.classList.add('pending');
        icon = SVG_ICONS.pending;
      }

      if (!timer.isRunning) {
        item.classList.add('clickable');
        item.addEventListener('click', () => phaseManager.jumpToPhase(i));
      }

      item.innerHTML = `
        <span class="phase-name">${phase.name}</span>
        <span class="phase-status">${icon}</span>
      `;
      this._listEl.appendChild(item);
    });
  }

  _updateHeader() {
    if (!this._phaseDisplay || !this._counterDisplay) return;
    const phases = phaseManager.phases;
    if (phases.length === 0) {
      this._phaseDisplay.textContent = 'Configura el formato de debate';
      this._counterDisplay.textContent = '0 / 0';
    } else {
      const cur = phaseManager.currentPhase;
      this._phaseDisplay.textContent = cur ? cur.name : 'Listo para comenzar';
      this._counterDisplay.textContent = `${phaseManager.currentIndex + 1} / ${phases.length}`;
    }
  }
}


