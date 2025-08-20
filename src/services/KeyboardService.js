import { EventEmitter } from '../core/EventEmitter.js';

/**
 * Keyboard Service - handles keyboard shortcuts and help system
 * Implements Single Responsibility Principle for keyboard interaction management
 */
export class KeyboardService extends EventEmitter {
  constructor() {
    super();
    this.enabled = true;
    this.helpPanelVisible = false;
    this.helpIndicatorVisible = false;
    this.keyMap = new Map();
    this.setupKeyMap();
    this.bindEvents();
  }

  /**
   * Setup keyboard command mappings
   * @private
   */
  setupKeyMap() {
    this.keyMap.set(' ', { command: 'toggleTimer', description: 'Iniciar/Pausar/Reanudar' });
    this.keyMap.set('r', { command: 'resetPhase', description: 'Resetear fase actual' });
    this.keyMap.set('d', { command: 'resetDebate', description: 'Resetear debate completo' });
    this.keyMap.set('ArrowLeft', { command: 'previousPhase', description: 'Fase anterior' });
    this.keyMap.set('ArrowRight', { command: 'nextPhase', description: 'Siguiente fase' });
    this.keyMap.set('ArrowUp', { command: 'adjustTime', description: 'Ajustar tiempo (+10s)', args: 10 });
    this.keyMap.set('ArrowDown', { command: 'adjustTime', description: 'Ajustar tiempo (-10s)', args: -10 });
    this.keyMap.set('+', { command: 'adjustTime', description: 'Ajustar tiempo (+30s)', args: 30 });
    this.keyMap.set('-', { command: 'adjustTime', description: 'Ajustar tiempo (-30s)', args: -30 });
    this.keyMap.set(',', { command: 'adjustTime', description: 'Ajustar tiempo (+1s)', args: 1 });
    this.keyMap.set('.', { command: 'adjustTime', description: 'Ajustar tiempo (-1s)', args: -1 });
    this.keyMap.set('c', { command: 'toggleConfig', description: 'Configuración' });
    this.keyMap.set('f', { command: 'togglePhases', description: 'Panel de fases' });
    this.keyMap.set('Escape', { command: 'closePanels', description: 'Cerrar paneles' });
    this.keyMap.set('Enter', { command: 'applyConfig', description: 'Aplicar configuración' });
    this.keyMap.set('h', { command: 'toggleHelp', description: 'Mostrar/ocultar ayuda' });
    this.keyMap.set('t', { command: 'toggleTheme', description: 'Alternar modo oscuro' });
    this.keyMap.set('1', { command: 'switchFormat', description: 'Formato Académico', args: 'academico' });
    this.keyMap.set('2', { command: 'switchFormat', description: 'British Parliament', args: 'bp' });
  }

  /**
   * Bind keyboard events
   * @private
   */
  bindEvents() {
    document.addEventListener('keydown', (e) => {
      this.handleKeyDown(e);
    });
  }

  /**
   * Handle keydown events
   * @param {KeyboardEvent} e - Keyboard event
   * @private
   */
  handleKeyDown(e) {
    if (!this.enabled) return;
    
    // Skip if user is typing in an input field
    if (this.isInputFocused()) return;

    let key = e.key;
    // Handle case-insensitive keys
    if (key.length === 1) {
      key = key.toLowerCase();
    }
    
    const mapping = this.keyMap.get(key);
    
    if (mapping) {
      e.preventDefault();
      this.executeCommand(mapping.command, mapping.args);
    }
  }

  /**
   * Check if an input element is focused
   * @returns {boolean}
   * @private
   */
  isInputFocused() {
    const activeElement = document.activeElement;
    if (!activeElement) return false;
    
    const inputTypes = ['input', 'textarea', 'select'];
    const tagName = activeElement.tagName.toLowerCase();
    
    return inputTypes.includes(tagName) || activeElement.contentEditable === 'true';
  }

  /**
   * Execute a keyboard command
   * @param {string} command - Command name
   * @param {any} args - Command arguments
   * @private
   */
  executeCommand(command, args) {
    this.emit('keyboardCommand', { command, args });
  }

  /**
   * Enable keyboard controls
   */
  enable() {
    this.enabled = true;
    this.updateHelpIndicatorVisibility();
    this.emit('keyboardEnabled');
  }

  /**
   * Disable keyboard controls
   */
  disable() {
    this.enabled = false;
    this.hideHelp();
    this.updateHelpIndicatorVisibility();
    this.emit('keyboardDisabled');
  }

  /**
   * Toggle keyboard controls enabled state
   */
  toggle() {
    if (this.enabled) {
      this.disable();
    } else {
      this.enable();
    }
  }

  /**
   * Check if keyboard controls are enabled
   * @returns {boolean}
   */
  isEnabled() {
    return this.enabled;
  }

  /**
   * Show keyboard help panel
   */
  showHelp() {
    if (!this.enabled) return;
    
    this.helpPanelVisible = true;
    this.createHelpPanel();
    this.emit('helpShown');
  }

  /**
   * Hide keyboard help panel
   */
  hideHelp() {
    this.helpPanelVisible = false;
    const helpPanel = document.getElementById('keyboard-help-panel');
    if (helpPanel) {
      helpPanel.style.display = 'none';
    }
    this.emit('helpHidden');
  }

  /**
   * Toggle keyboard help panel
   */
  toggleHelp() {
    if (this.helpPanelVisible) {
      this.hideHelp();
    } else {
      this.showHelp();
    }
  }

  /**
   * Create keyboard help panel
   * @private
   */
  createHelpPanel() {
    let helpPanel = document.getElementById('keyboard-help-panel');
    
    if (helpPanel) {
      helpPanel.style.display = 'block';
      return;
    }

    helpPanel = document.createElement('div');
    helpPanel.id = 'keyboard-help-panel';
    
    // Use original layout structure exactly as it was
    helpPanel.innerHTML = `
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

    document.body.appendChild(helpPanel);
  }

  /**
   * Get display name for keyboard key
   * @param {string} key - Key name
   * @returns {string} Display name
   * @private
   */
  getKeyDisplayName(key) {
    const displayNames = {
      ' ': 'Espacio',
      'ArrowLeft': '← →',
      'ArrowRight': '← →',
      'ArrowUp': '↑ ↓',
      'ArrowDown': '↑ ↓',
      ',': ', .',
      '.': ', .',
      '+': '+ -',
      '-': '+ -',
      'Escape': 'Escape',
      'Enter': 'Enter',
      'c': 'C',
      'f': 'F',
      'h': 'H',
      't': 'T',
      'r': 'R',
      'd': 'D',
      '1': '1',
      '2': '2'
    };
    
    return displayNames[key] || key.toUpperCase();
  }

  /**
   * Create keyboard help indicator
   */
  createHelpIndicator() {
    if (document.getElementById('keyboard-help-indicator')) return;

    const indicator = document.createElement('div');
    indicator.id = 'keyboard-help-indicator';

    indicator.innerHTML = `
      <div style="font-weight: 600; margin-bottom: 5px;">Controles:</div>
      <div style="font-size: 0.75rem; opacity: 0.8;">Presiona H para ver todos</div>
    `;

    indicator.addEventListener('click', () => this.toggleHelp());
    
    document.body.appendChild(indicator);
    
    this.helpIndicatorVisible = true;
  }

  /**
   * Update help indicator visibility based on keyboard controls state
   * @private
   */
  updateHelpIndicatorVisibility() {
    const indicator = document.getElementById('keyboard-help-indicator');
    
    if (this.enabled) {
      if (!indicator) {
        // Create indicator if it doesn't exist and keyboard is enabled
        this.createHelpIndicator();
      } else {
        // Show existing indicator
        indicator.style.display = 'block';
        this.helpIndicatorVisible = true;
      }
    } else {
      // Hide indicator when keyboard is disabled
      if (indicator) {
        indicator.style.display = 'none';
        this.helpIndicatorVisible = false;
      }
    }
  }

  /**
   * Get all keyboard mappings for documentation
   * @returns {Array} Array of keyboard mappings
   */
  getKeyboardMappings() {
    return Array.from(this.keyMap.entries()).map(([key, mapping]) => ({
      key,
      displayKey: this.getKeyDisplayName(key),
      command: mapping.command,
      description: mapping.description,
      args: mapping.args
    }));
  }

  /**
   * Add a keyboard shortcut
   * @param {string} key - Key to bind
   * @param {string} command - Command name
   * @param {string} description - Description for help
   * @param {any} args - Command arguments
   */
  addShortcut(key, command, description, args = undefined) {
    this.keyMap.set(key, { command, description, args });
  }

  /**
   * Remove a keyboard shortcut
   * @param {string} key - Key to unbind
   */
  removeShortcut(key) {
    this.keyMap.delete(key);
  }

  /**
   * Cleanup keyboard service
   */
  destroy() {
    this.hideHelp();
    const indicator = document.getElementById('keyboard-help-indicator');
    if (indicator) {
      indicator.remove();
    }
    const helpPanel = document.getElementById('keyboard-help-panel');
    if (helpPanel) {
      helpPanel.remove();
    }
    this.events = {};
  }
}