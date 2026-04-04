import Component from './Component.js';
import eventBus from '../core/EventBus.js';
import configManager from '../core/ConfigManager.js';
import customFormatManager from '../services/CustomFormatManager.js';
import formatRegistry from '../formats/FormatRegistry.js';

/**
 * FormatSelector — selector for all formats (built-in + custom).
 * Renders inside the config-toggle area.
 */
export class FormatSelector extends Component {
  constructor(container) {
    super(container);
    /** @type {CustomFormatEditor|null} set from main.js */
    this.editor = null;
  }

  mount() {
    this.container = document.querySelector('.format-selector-panel');
    this.bindEvents();
    this._renderAll();
  }

  bindEvents() {
    // Delegated click on format buttons
    this.container.addEventListener('click', (e) => {
      const formatBtn = e.target.closest('.format-btn');
      if (formatBtn) {
        this._select(formatBtn.dataset.format);
        return;
      }
      const newBtn = e.target.closest('.format-btn-new');
      if (newBtn && this.editor) {
        this.editor.openNew();
        return;
      }
      const editBtn = e.target.closest('.format-btn-edit');
      if (editBtn && this.editor) {
        this.editor.openEdit(editBtn.dataset.format);
        return;
      }
    });

    this.listen('keyboard:action', ({ action }) => {
      if (action === 'formatAcademico') this._select('academico');
      if (action === 'formatBP') this._select('bp');
    });

    this.listen('format:changed', () => this._updateActive());
    this.listen('config:reset', () => this._renderAll());
    this.listen('config:applied', () => this._updateActive());
    this.listen('customFormats:changed', () => this._renderAll());
    this.listen('customFormat:saved', () => this._renderAll());
  }

  _select(format) {
    if (format === configManager.getCurrentFormat()) return;
    configManager.set('currentFormat', format);
    eventBus.emit('format:changed', { format });
    this._updateActive();
  }

  _renderAll() {
    const currentFmt = configManager.getCurrentFormat();
    let html = '';

    // Built-in formats
    html += `<button class="format-btn ${currentFmt === 'academico' ? 'active' : ''}" data-format="academico">Formato Académico</button>`;
    html += `<button class="format-btn ${currentFmt === 'bp' ? 'active' : ''}" data-format="bp">British Parliament</button>`;

    // Custom formats
    customFormatManager.getAll().forEach((f) => {
      html += `
        <div class="format-btn-wrapper">
          <button class="format-btn ${currentFmt === f.id ? 'active' : ''}" data-format="${f.id}">
            ${this._escapeHtml(f.name)}
          </button>
          <button class="format-btn-edit" data-format="${f.id}" title="Editar formato">✎</button>
        </div>`;
    });

    // New format button
    html += `<button class="format-btn-new">+ Nuevo formato</button>`;

    this.container.innerHTML = html;
  }

  _updateActive() {
    const fmt = configManager.getCurrentFormat();
    this.container.querySelectorAll('.format-btn').forEach((btn) => {
      btn.classList.toggle('active', btn.dataset.format === fmt);
    });
  }

  _escapeHtml(str) {
    const div = document.createElement('div');
    div.textContent = str;
    return div.innerHTML;
  }
}


