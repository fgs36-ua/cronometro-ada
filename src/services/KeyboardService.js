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
    helpPanel.style.cssText = `
      position: fixed;
      top: 50%;
      left: 50%;
      transform: translate(-50%, -50%);
      width: 90%;
      max-width: 600px;
      background: var(--bg-secondary, #2c3e50);
      border-radius: 15px;
      padding: 20px;
      box-shadow: 0 20px 60px rgba(0, 0, 0, 0.3);
      backdrop-filter: blur(20px);
      z-index: 10001;
      border: 1px solid var(--border-light, rgba(255, 255, 255, 0.1));
      font-family: 'Roboto', sans-serif;
      color: var(--text-primary, #ecf0f1);
    `;

    // Create header
    const header = document.createElement('div');
    header.className = 'keyboard-help-header';
    header.style.cssText = `
      display: flex;
      justify-content: space-between;
      align-items: center;
      margin-bottom: 15px;
    `;

    const title = document.createElement('h3');
    title.className = 'keyboard-help-title';
    title.textContent = 'Controles de Teclado';
    title.style.cssText = `
      margin: 0;
      color: var(--text-accent, #3498db);
    `;

    const closeButton = document.createElement('button');
    closeButton.className = 'keyboard-help-close';
    closeButton.innerHTML = '×';
    closeButton.style.cssText = `
      background: none;
      border: none;
      font-size: 1.5rem;
      cursor: pointer;
      color: var(--text-secondary, #bdc3c7);
    `;
    closeButton.addEventListener('click', () => this.hideHelp());

    header.appendChild(title);
    header.appendChild(closeButton);

    // Create content grid
    const content = document.createElement('div');
    content.className = 'keyboard-help-content';
    content.style.cssText = `
      display: grid;
      grid-template-columns: 1fr 1fr;
      gap: 15px;
      font-size: 0.85rem;
      color: var(--text-primary, #ecf0f1);
    `;

    // Group shortcuts by category (using original layout)
    const shortcuts = {
      'Cronómetro': [
        { key: ' ', desc: 'Iniciar/Pausar/Reanudar' },
        { key: 'r', desc: 'Resetear fase actual' },
        { key: 'd', desc: 'Resetear debate completo' }
      ],
      'Navegación': [
        { key: 'ArrowLeft', desc: 'Cambiar fase' },
        { key: ',', desc: 'Ajustar tiempo (±1s)' },
        { key: 'ArrowUp', desc: 'Ajustar tiempo (±10s)' },
        { key: '+', desc: 'Ajustar tiempo (±30s)' }
      ],
      'Paneles': [
        { key: 'c', desc: 'Configuración' },
        { key: 'f', desc: 'Panel de fases' },
        { key: 'Escape', desc: 'Cerrar paneles' },
        { key: 'Enter', desc: 'Aplicar configuración' }
      ],
      'Formatos': [
        { key: '1', desc: 'Formato Académico' },
        { key: '2', desc: 'British Parliament' }
      ],
      'Otros': [
        { key: 'h', desc: 'Mostrar/ocultar ayuda' },
        { key: 't', desc: 'Alternar modo oscuro' }
      ]
    };

    // Create sections
    Object.entries(shortcuts).forEach(([category, items]) => {
      const section = document.createElement('div');
      section.className = 'keyboard-help-section';
      
      const categoryTitle = document.createElement('h4');
      categoryTitle.textContent = category;
      categoryTitle.style.cssText = `
        color: var(--text-accent, #3498db);
        margin-bottom: 8px;
        margin-top: ${category !== 'Cronómetro' ? '15px' : '0'};
      `;
      section.appendChild(categoryTitle);

      items.forEach(item => {
        const itemDiv = document.createElement('div');
        itemDiv.className = 'keyboard-help-item';
        itemDiv.style.marginBottom = '4px';
        
        const keySpan = document.createElement('span');
        keySpan.className = 'keyboard-help-key';
        keySpan.textContent = this.getKeyDisplayName(item.key) + ': ';
        keySpan.style.fontWeight = 'bold';
        
        const descSpan = document.createElement('span');
        descSpan.textContent = item.desc;
        
        itemDiv.appendChild(keySpan);
        itemDiv.appendChild(descSpan);
        section.appendChild(itemDiv);
      });

      content.appendChild(section);
    });

    // Create footer
    const footer = document.createElement('div');
    footer.className = 'keyboard-help-footer';
    footer.style.cssText = `
      margin-top: 15px;
      padding-top: 10px;
      border-top: 1px solid var(--border-light, rgba(255, 255, 255, 0.1));
      font-size: 0.75rem;
      color: var(--text-secondary, #bdc3c7);
      text-align: center;
    `;
    footer.textContent = 'Los controles de tiempo solo funcionan cuando el cronómetro está detenido o pausado';

    helpPanel.appendChild(header);
    helpPanel.appendChild(content);
    helpPanel.appendChild(footer);
    document.body.appendChild(helpPanel);

    // Handle responsive design
    const mediaQuery = window.matchMedia('(max-width: 768px)');
    const handleResize = () => {
      if (mediaQuery.matches) {
        content.style.gridTemplateColumns = '1fr';
        content.style.gap = '10px';
        helpPanel.style.width = '95%';
        helpPanel.style.maxWidth = 'none';
        helpPanel.style.padding = '15px';
        helpPanel.style.borderRadius = '10px';
      } else {
        content.style.gridTemplateColumns = '1fr 1fr';
        content.style.gap = '15px';
        helpPanel.style.width = '90%';
        helpPanel.style.maxWidth = '600px';
        helpPanel.style.padding = '20px';
        helpPanel.style.borderRadius = '15px';
      }
    };
    
    handleResize();
    mediaQuery.addListener(handleResize);
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
    indicator.style.cssText = `
      position: fixed;
      bottom: 20px;
      left: 20px;
      background: var(--bg-tertiary, rgba(52, 73, 94, 0.9));
      color: var(--text-primary, #ecf0f1);
      padding: 10px 16px;
      border-radius: 20px;
      font-size: 0.85rem;
      font-weight: 500;
      cursor: pointer;
      z-index: 1000;
      backdrop-filter: blur(10px);
      border: 2px solid var(--border-light, rgba(255, 255, 255, 0.1));
      transition: all 0.3s ease;
      user-select: none;
      text-shadow: 0 0 4px rgba(0, 0, 0, 0.5);
    `;

    indicator.innerHTML = `
      <div style="font-weight: 600; margin-bottom: 5px;">Controles:</div>
      <div style="font-size: 0.75rem; opacity: 0.8;">Presiona H para ver todos</div>
    `;

    indicator.addEventListener('click', () => this.toggleHelp());
    indicator.addEventListener('mouseenter', () => {
      indicator.style.transform = 'translateY(-2px)';
      indicator.style.borderColor = 'rgba(255, 255, 255, 0.5)';
    });
    indicator.addEventListener('mouseleave', () => {
      indicator.style.transform = 'translateY(0px)';
      indicator.style.borderColor = 'rgba(255, 255, 255, 0.1)';
    });
    
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