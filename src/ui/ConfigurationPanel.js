import { EventEmitter } from '../core/EventEmitter.js';
import { DOMHelper } from '../utils/DOMHelper.js';

/**
 * Configuration Panel UI Component
 * Handles the configuration panel display and interactions
 */
export class ConfigurationPanel extends EventEmitter {
  constructor() {
    super();
    this.panel = null;
    this.configButton = null;
    this.applyButton = null;
    this.resetDefaultsButton = null;
    this.formatButtons = [];
    this.isVisible = false;
    this.currentFormat = 'academico';
    
    this.initializeElements();
    this.bindEvents();
  }

  /**
   * Initialize DOM elements
   * @private
   */
  initializeElements() {
    this.panel = DOMHelper.getElementById('config-panel');
    this.configButton = DOMHelper.getElementById('config-btn');
    this.applyButton = DOMHelper.getElementById('apply-config-btn');
    this.resetDefaultsButton = DOMHelper.getElementById('reset-defaults-btn');
    this.formatButtons = Array.from(DOMHelper.querySelectorAll('.format-btn'));

    if (!this.panel || !this.configButton) {
      console.error('Required configuration panel elements not found');
    }
  }

  /**
   * Bind event listeners
   * @private
   */
  bindEvents() {
    if (this.configButton) {
      DOMHelper.addEventListener(this.configButton, 'click', () => {
        this.toggle();
      });
    }

    if (this.applyButton) {
      DOMHelper.addEventListener(this.applyButton, 'click', () => {
        this.applyConfiguration();
      });
    }

    if (this.resetDefaultsButton) {
      DOMHelper.addEventListener(this.resetDefaultsButton, 'click', () => {
        this.resetToDefaults();
      });
    }

    // Format button listeners
    this.formatButtons.forEach(button => {
      DOMHelper.addEventListener(button, 'click', (e) => {
        const format = e.target.dataset.format;
        if (format) {
          this.switchFormat(format);
        }
      });
    });

    // Checkbox for "última refutación diferente"
    const ultimaRefutacionCheckbox = DOMHelper.getElementById('ultima-refutacion-diferente');
    if (ultimaRefutacionCheckbox) {
      DOMHelper.addEventListener(ultimaRefutacionCheckbox, 'change', () => {
        this.toggleUltimaRefutacionConfig();
      });
    }

    // Keyboard controls checkbox
    const keyboardControlsCheckbox = DOMHelper.getElementById('keyboard-controls-enabled');
    if (keyboardControlsCheckbox) {
      DOMHelper.addEventListener(keyboardControlsCheckbox, 'change', () => {
        this.emit('keyboardControlsToggled', {
          enabled: keyboardControlsCheckbox.checked
        });
      });
    }
  }

  /**
   * Show the configuration panel
   */
  show() {
    if (!this.panel) return;
    
    this.isVisible = true;
    DOMHelper.toggleClass(this.panel, 'hidden', false);
    DOMHelper.toggleClass(this.panel, 'show', true);
    
    // Update button text
    if (this.configButton) {
      this.configButton.textContent = 'Cerrar Configuración';
    }
    
    this.emit('panelShown');
  }

  /**
   * Hide the configuration panel
   */
  hide() {
    if (!this.panel) return;
    
    this.isVisible = false;
    DOMHelper.toggleClass(this.panel, 'show', false);
    DOMHelper.toggleClass(this.panel, 'hidden', true);
    
    // Update button text
    if (this.configButton) {
      this.configButton.textContent = 'Configuración';
    }
    
    this.emit('panelHidden');
  }

  /**
   * Toggle panel visibility
   */
  toggle() {
    if (this.isVisible) {
      this.hide();
    } else {
      this.show();
    }
  }

  /**
   * Switch debate format
   * @param {string} format - Format name ('academico' or 'bp')
   */
  switchFormat(format) {
    if (!['academico', 'bp'].includes(format)) return;
    
    this.currentFormat = format;
    
    // Update format button states
    this.formatButtons.forEach(button => {
      const isActive = button.dataset.format === format;
      DOMHelper.toggleClass(button, 'active', isActive);
    });

    // Show/hide appropriate config sections
    const academicoConfig = DOMHelper.getElementById('academico-config');
    const bpConfig = DOMHelper.getElementById('bp-config');
    
    if (academicoConfig) {
      DOMHelper.toggleClass(academicoConfig, 'hidden', format !== 'academico');
    }
    if (bpConfig) {
      DOMHelper.toggleClass(bpConfig, 'hidden', format !== 'bp');
    }

    this.emit('formatSwitched', { format });
  }

  /**
   * Apply current configuration
   */
  applyConfiguration() {
    const config = this.gatherConfiguration();
    this.emit('configurationApplied', { config });
    this.showSaveNotification();
  }

  /**
   * Reset to default configuration
   */
  resetToDefaults() {
    this.emit('resetToDefaults');
  }

  /**
   * Gather configuration from form inputs
   * @returns {Object} Configuration object
   */
  gatherConfiguration() {
    const config = {
      currentFormat: this.currentFormat
    };

    // Academic format configuration
    const academicoInputs = {
      equipo1Name: 'equipo1-name',
      equipo2Name: 'equipo2-name',
      introTime: 'intro-time',
      preguntasTime: 'preguntas-time',
      refutacionTime: 'refutacion-time',
      conclusionTime: 'conclusion-time',
      numRefutaciones: 'num-refutaciones',
      ultimaRefutacionTime: 'ultima-refutacion-time'
    };

    Object.entries(academicoInputs).forEach(([key, id]) => {
      const element = DOMHelper.getElementById(id);
      if (element) {
        config[key] = element.type === 'number' ? parseInt(element.value) : element.value;
      }
    });

    // Checkbox for última refutación diferente
    const ultimaRefutacionCheckbox = DOMHelper.getElementById('ultima-refutacion-diferente');
    if (ultimaRefutacionCheckbox) {
      config.ultimaRefutacionDiferente = ultimaRefutacionCheckbox.checked;
    }

    // BP format configuration
    const bpInputs = {
      bpSpeechTime: 'bp-speech-time',
      equipoCamaraAltaFavor: 'equipo-camara-alta-favor',
      equipoCamaraAltaContra: 'equipo-camara-alta-contra',
      equipoCamaraBajaFavor: 'equipo-camara-baja-favor',
      equipoCamaraBajaContra: 'equipo-camara-baja-contra'
    };

    Object.entries(bpInputs).forEach(([key, id]) => {
      const element = DOMHelper.getElementById(id);
      if (element) {
        config[key] = element.type === 'number' ? parseInt(element.value) : element.value;
      }
    });

    // Additional phases configuration
    const additionalInputs = {
      deliberacionTime: 'deliberacion-time',
      deliberacionDesc: 'deliberacion-desc',
      feedbackTime: 'feedback-time',
      feedbackDesc: 'feedback-desc'
    };

    Object.entries(additionalInputs).forEach(([key, id]) => {
      const element = DOMHelper.getElementById(id);
      if (element) {
        config[key] = element.type === 'number' ? parseInt(element.value) : element.value;
      }
    });

    // Keyboard controls
    const keyboardControlsCheckbox = DOMHelper.getElementById('keyboard-controls-enabled');
    if (keyboardControlsCheckbox) {
      config.keyboardControlsEnabled = keyboardControlsCheckbox.checked;
    }

    return config;
  }

  /**
   * Load configuration into form inputs
   * @param {Object} config - Configuration object
   */
  loadConfiguration(config) {
    if (!config) return;

    // Set current format
    if (config.currentFormat) {
      this.switchFormat(config.currentFormat);
    }

    // Load values into inputs
    Object.entries(config).forEach(([key, value]) => {
      // Convert camelCase to kebab-case for element IDs
      const elementId = key.replace(/([A-Z])/g, '-$1').toLowerCase();
      const element = DOMHelper.getElementById(elementId);
      
      if (element) {
        if (element.type === 'checkbox') {
          element.checked = value;
        } else {
          element.value = value;
        }
      }
    });

    // Update última refutación config visibility
    this.toggleUltimaRefutacionConfig();
  }

  /**
   * Toggle última refutación configuration visibility
   * @private
   */
  toggleUltimaRefutacionConfig() {
    const checkbox = DOMHelper.getElementById('ultima-refutacion-diferente');
    const config = DOMHelper.getElementById('ultima-refutacion-config');
    
    if (checkbox && config) {
      DOMHelper.setVisible(config, checkbox.checked);
    }
  }

  /**
   * Show save notification
   * @private
   */
  showSaveNotification() {
    // Create temporary notification
    const notification = DOMHelper.createElement('div', {
      className: 'save-notification',
      style: {
        position: 'fixed',
        top: '20px',
        right: '20px',
        background: 'var(--bg-success, #27ae60)',
        color: 'white',
        padding: '12px 20px',
        borderRadius: '6px',
        zIndex: '10000',
        fontSize: '0.9rem',
        boxShadow: '0 4px 12px rgba(0,0,0,0.3)',
        transform: 'translateY(-100%)',
        transition: 'transform 0.3s ease'
      }
    }, 'Configuración guardada');

    document.body.appendChild(notification);

    // Animate in
    setTimeout(() => {
      notification.style.transform = 'translateY(0)';
    }, 50);

    // Remove after delay
    setTimeout(() => {
      notification.style.transform = 'translateY(-100%)';
      setTimeout(() => {
        notification.remove();
      }, 300);
    }, 2000);
  }

  /**
   * Set panel busy state (for loading/saving)
   * @param {boolean} busy - Whether panel is busy
   */
  setBusy(busy) {
    if (this.applyButton) {
      this.applyButton.disabled = busy;
      this.applyButton.textContent = busy ? 'Guardando...' : 'Guardar y Aplicar';
    }
    
    if (this.resetDefaultsButton) {
      this.resetDefaultsButton.disabled = busy;
    }
  }

  /**
   * Get current panel state
   * @returns {Object} Current state
   */
  getState() {
    return {
      isVisible: this.isVisible,
      currentFormat: this.currentFormat,
      configuration: this.gatherConfiguration()
    };
  }

  /**
   * Cleanup resources
   */
  destroy() {
    this.events = {};
  }
}