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
    this.keyMap.set('d', { command: 'resetDebate', description: 'Resetear todo el debate' });
    this.keyMap.set('ArrowLeft', { command: 'previousPhase', description: 'Fase anterior' });
    this.keyMap.set('ArrowRight', { command: 'nextPhase', description: 'Siguiente fase' });
    this.keyMap.set('ArrowUp', { command: 'adjustTime', description: 'Aumentar tiempo (+10s)', args: 10 });
    this.keyMap.set('ArrowDown', { command: 'adjustTime', description: 'Reducir tiempo (-10s)', args: -10 });
    this.keyMap.set('+', { command: 'adjustTime', description: 'Aumentar tiempo (+30s)', args: 30 });
    this.keyMap.set('-', { command: 'adjustTime', description: 'Reducir tiempo (-30s)', args: -30 });
    this.keyMap.set('c', { command: 'toggleConfig', description: 'Abrir configuración' });
    this.keyMap.set('f', { command: 'togglePhases', description: 'Abrir panel de fases' });
    this.keyMap.set('Escape', { command: 'closePanels', description: 'Cerrar paneles' });
    this.keyMap.set('Enter', { command: 'applyConfig', description: 'Aplicar configuración' });
    this.keyMap.set('h', { command: 'toggleHelp', description: 'Mostrar/ocultar ayuda' });
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

    const key = e.key;
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
    helpPanel.style.cssText = `
      position: fixed;
      top: 50%;
      left: 50%;
      transform: translate(-50%, -50%);
      background: var(--bg-secondary, #2c3e50);
      color: var(--text-primary, #ecf0f1);
      padding: 20px;
      border-radius: 15px;
      box-shadow: 0 8px 32px rgba(0, 0, 0, 0.3);
      backdrop-filter: blur(10px);
      z-index: 9999;
      max-width: 600px;
      max-height: 80vh;
      overflow-y: auto;
      font-family: 'Roboto', sans-serif;
    `;

    const title = document.createElement('h3');
    title.textContent = 'Controles de Teclado';
    title.style.cssText = `
      margin: 0 0 20px 0;
      text-align: center;
      color: var(--text-accent, #3498db);
    `;

    const grid = document.createElement('div');
    grid.style.cssText = `
      display: grid;
      grid-template-columns: auto 1fr;
      gap: 10px 20px;
      align-items: center;
    `;

    // Add keyboard shortcuts to grid
    this.keyMap.forEach((mapping, key) => {
      const keyElement = document.createElement('kbd');
      keyElement.textContent = this.getKeyDisplayName(key);
      keyElement.style.cssText = `
        background: var(--bg-tertiary, #34495e);
        border: 1px solid var(--border-light, #4a5568);
        border-radius: 4px;
        padding: 4px 8px;
        font-family: monospace;
        font-size: 0.9rem;
        white-space: nowrap;
      `;

      const descElement = document.createElement('span');
      descElement.textContent = mapping.description;
      descElement.style.fontSize = '0.9rem';

      grid.appendChild(keyElement);
      grid.appendChild(descElement);
    });

    const closeButton = document.createElement('button');
    closeButton.textContent = 'Cerrar (Esc)';
    closeButton.style.cssText = `
      margin-top: 20px;
      padding: 8px 16px;
      background: var(--bg-tertiary, #34495e);
      color: var(--text-primary, #ecf0f1);
      border: 1px solid var(--border-light, #4a5568);
      border-radius: 6px;
      cursor: pointer;
      width: 100%;
    `;
    closeButton.addEventListener('click', () => this.hideHelp());

    helpPanel.appendChild(title);
    helpPanel.appendChild(grid);
    helpPanel.appendChild(closeButton);
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
      'ArrowLeft': '←',
      'ArrowRight': '→',
      'ArrowUp': '↑',
      'ArrowDown': '↓',
      'Escape': 'Esc',
      'Enter': 'Enter'
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
    indicator.style.cssText = `
      position: fixed;
      bottom: 20px;
      right: 80px;
      background: var(--bg-tertiary, rgba(52, 73, 94, 0.9));
      color: var(--text-primary, #ecf0f1);
      padding: 8px 12px;
      border-radius: 20px;
      font-size: 0.8rem;
      cursor: pointer;
      z-index: 1000;
      backdrop-filter: blur(10px);
      border: 1px solid var(--border-light, rgba(255, 255, 255, 0.1));
      transition: all 0.3s ease;
      user-select: none;
    `;

    indicator.innerHTML = `
      <div style="display: flex; align-items: center; gap: 6px;">
        <span>Controles:</span>
        <span style="font-weight: 500;">Presiona H para ver todos</span>
      </div>
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
    
    if (this.enabled && !this.helpIndicatorVisible) {
      this.createHelpIndicator();
    } else if (!this.enabled && indicator) {
      indicator.style.display = 'none';
      this.helpIndicatorVisible = false;
    } else if (this.enabled && indicator) {
      indicator.style.display = 'block';
      this.helpIndicatorVisible = true;
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