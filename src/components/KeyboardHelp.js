import Component from './Component.js';
import configManager from '../core/ConfigManager.js';

/**
 * KeyboardHelp — small indicator + modal panel listing all shortcuts.
 */
export class KeyboardHelp extends Component {
  constructor(container) {
    super(container);
    this._panelVisible = false;
  }

  mount() {
    // Create indicator element dynamically (not in HTML)
    this._indicator = document.getElementById('keyboard-help-indicator');
    if (!this._indicator) {
      this._indicator = document.createElement('div');
      this._indicator.id = 'keyboard-help-indicator';
      const show = configManager.isKeyboardEnabled() ? 'block' : 'none';
      this._indicator.style.display = show;
      this._indicator.innerHTML = `
        <div style="font-weight:600;margin-bottom:5px;">Controles:</div>
        <div style="font-size:0.75rem;opacity:0.8;">Presiona H para ver todos</div>
      `;
      document.body.appendChild(this._indicator);
    }
    this.bindEvents();
  }

  bindEvents() {
    if (this._indicator) {
      this._indicator.addEventListener('click', () => this._togglePanel());
    }

    this.listen('keyboard:action', ({ action }) => {
      if (action === 'toggleHelp') this._togglePanel();
      if (action === 'closePanels') this._hidePanel();
    });

    this.listen('config:applied', () => this._updateVisibility());
    this.listen('config:reset', () => this._updateVisibility());
    this.listen('theme:changed', () => this._refreshPanel());
  }

  /* ── private ──────────────────────────────────────────── */

  _updateVisibility() {
    if (this._indicator) {
      this._indicator.style.display = configManager.isKeyboardEnabled() ? 'block' : 'none';
    }
  }

  _togglePanel() {
    let panel = document.getElementById('keyboard-help-panel');
    if (!panel) {
      this._createPanel();
      this._panelVisible = true;
    } else {
      this._panelVisible = panel.style.display === 'none';
      panel.style.display = this._panelVisible ? 'block' : 'none';
    }
  }

  _hidePanel() {
    const panel = document.getElementById('keyboard-help-panel');
    if (panel) {
      panel.style.display = 'none';
      this._panelVisible = false;
    }
  }

  _refreshPanel() {
    const panel = document.getElementById('keyboard-help-panel');
    if (panel) {
      const wasVisible = panel.style.display !== 'none';
      panel.remove();
      this._createPanel();
      const newPanel = document.getElementById('keyboard-help-panel');
      if (newPanel && !wasVisible) newPanel.style.display = 'none';
    }
  }

  _createPanel() {
    const panel = document.createElement('div');
    panel.id = 'keyboard-help-panel';
    panel.innerHTML = `
      <div class="keyboard-help-header">
        <h3 class="keyboard-help-title">Controles de Teclado</h3>
        <button class="keyboard-help-close" onclick="this.closest('#keyboard-help-panel').style.display='none'">×</button>
      </div>
      <div class="keyboard-help-content">
        <div class="keyboard-help-section">
          <h4>Cronómetro</h4>
          <div class="keyboard-help-item"><span class="keyboard-help-key">Espacio:</span> Iniciar/Pausar/Reanudar</div>
          <div class="keyboard-help-item"><span class="keyboard-help-key">R:</span> Resetear fase actual</div>
          <div class="keyboard-help-item"><span class="keyboard-help-key">D:</span> Resetear debate completo</div>
          <h4>Navegación</h4>
          <div class="keyboard-help-item"><span class="keyboard-help-key">← →:</span> Cambiar fase</div>
          <div class="keyboard-help-item"><span class="keyboard-help-key">, .:</span> Ajustar tiempo (±1s)</div>
          <div class="keyboard-help-item"><span class="keyboard-help-key">↑ ↓:</span> Ajustar tiempo (±10s)</div>
          <div class="keyboard-help-item"><span class="keyboard-help-key">+ -:</span> Ajustar tiempo (±30s)</div>
        </div>
        <div class="keyboard-help-section">
          <h4>Paneles</h4>
          <div class="keyboard-help-item"><span class="keyboard-help-key">C:</span> Configuración</div>
          <div class="keyboard-help-item"><span class="keyboard-help-key">F:</span> Panel de fases</div>
          <div class="keyboard-help-item"><span class="keyboard-help-key">Escape:</span> Cerrar paneles</div>
          <div class="keyboard-help-item"><span class="keyboard-help-key">Enter:</span> Aplicar configuración</div>
          <h4>Formatos</h4>
          <div class="keyboard-help-item"><span class="keyboard-help-key">1:</span> Formato Académico</div>
          <div class="keyboard-help-item"><span class="keyboard-help-key">2:</span> British Parliament</div>
          <h4>Otros</h4>
          <div class="keyboard-help-item"><span class="keyboard-help-key">H:</span> Mostrar/ocultar ayuda</div>
          <div class="keyboard-help-item"><span class="keyboard-help-key">T:</span> Alternar modo oscuro</div>
        </div>
      </div>
      <div class="keyboard-help-footer">
        Los controles de tiempo solo funcionan cuando el cronómetro está detenido o pausado
      </div>
    `;
    document.body.appendChild(panel);
  }
}


