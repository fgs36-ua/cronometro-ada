import Component from './Component.js';
import eventBus from '../core/EventBus.js';
import configManager from '../core/ConfigManager.js';

/**
 * FormatSelector — two-button selector (Académico / BP).
 * Renders inside the config-toggle area.
 */
export class FormatSelector extends Component {
  constructor(container) {
    super(container);
  }

  render() {
    const fmt = configManager.getCurrentFormat();
    return `
      <button class="format-btn ${fmt === 'academico' ? 'active' : ''}" data-format="academico">Formato Académico</button>
      <button class="format-btn ${fmt === 'bp' ? 'active' : ''}" data-format="bp">British Parliament</button>
    `;
  }

  mount() {
    this.container = document.querySelector('.format-selector-panel');
    this.bindEvents();
  }

  bindEvents() {
    this.container.querySelectorAll('.format-btn').forEach((btn) => {
      btn.addEventListener('click', () => {
        const fmt = btn.dataset.format;
        this._select(fmt);
      });
    });

    this.listen('keyboard:action', ({ action }) => {
      if (action === 'formatAcademico') this._select('academico');
      if (action === 'formatBP') this._select('bp');
    });

    this.listen('format:changed', () => this._updateActive());
  }

  _select(format) {
    if (format === configManager.getCurrentFormat()) return;
    configManager.set('currentFormat', format);
    eventBus.emit('format:changed', { format });
    this._updateActive();
  }

  _updateActive() {
    const fmt = configManager.getCurrentFormat();
    this.container.querySelectorAll('.format-btn').forEach((btn) => {
      btn.classList.toggle('active', btn.dataset.format === fmt);
    });
  }
}

export default FormatSelector;
