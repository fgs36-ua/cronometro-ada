import { EventEmitter } from '../core/EventEmitter.js';

/**
 * Configuration Service - handles loading, saving, and managing configuration
 * Implements Single Responsibility Principle for configuration management
 */
export class ConfigurationService extends EventEmitter {
  constructor() {
    super();
    this.storageKey = 'ada-debate-config';
    this.currentConfig = {};
    this.defaultConfig = {
      // Academic format defaults
      equipo1Name: 'Equipo A',
      equipo2Name: 'Equipo B',
      introTime: 240,
      preguntasTime: 120,
      refutacionTime: 300,
      conclusionTime: 180,
      numRefutaciones: 2,
      ultimaRefutacionDiferente: false,
      ultimaRefutacionTime: 90,
      
      // BP format defaults
      bpSpeechTime: 420,
      equipoCamaraAltaFavor: 'Equipo A',
      equipoCamaraAltaContra: 'Equipo B',
      equipoCamaraBajaFavor: 'Equipo C',
      equipoCamaraBajaContra: 'Equipo D',
      
      // Additional phases
      deliberacionTime: 1200,
      deliberacionDesc: 'Deliberación de jueces',
      feedbackTime: 900,
      feedbackDesc: 'Feedback',
      
      // Controls
      keyboardControlsEnabled: true,
      currentFormat: 'academico'
    };
    
    this.loadConfiguration();
  }

  /**
   * Load configuration from localStorage
   * @returns {Object} Loaded configuration
   */
  loadConfiguration() {
    try {
      const stored = localStorage.getItem(this.storageKey);
      if (stored) {
        const parsed = JSON.parse(stored);
        this.currentConfig = { ...this.defaultConfig, ...parsed };
      } else {
        this.currentConfig = { ...this.defaultConfig };
      }
      
      this.emit('configLoaded', this.currentConfig);
      return this.currentConfig;
    } catch (error) {
      console.error('Error loading configuration:', error);
      this.currentConfig = { ...this.defaultConfig };
      this.emit('configError', error);
      return this.currentConfig;
    }
  }

  /**
   * Save configuration to localStorage
   * @param {Object} config - Configuration to save
   */
  saveConfiguration(config = null) {
    try {
      const configToSave = config || this.currentConfig;
      localStorage.setItem(this.storageKey, JSON.stringify(configToSave));
      this.currentConfig = { ...configToSave };
      this.emit('configSaved', this.currentConfig);
    } catch (error) {
      console.error('Error saving configuration:', error);
      this.emit('configError', error);
    }
  }

  /**
   * Update specific configuration values
   * @param {Object} updates - Configuration updates
   * @param {boolean} save - Whether to save immediately (default: true)
   */
  updateConfiguration(updates, save = true) {
    const oldConfig = { ...this.currentConfig };
    this.currentConfig = { ...this.currentConfig, ...updates };
    
    if (save) {
      this.saveConfiguration();
    }
    
    this.emit('configUpdated', {
      config: this.currentConfig,
      changes: updates,
      oldConfig
    });
  }

  /**
   * Get current configuration
   * @returns {Object} Current configuration
   */
  getConfiguration() {
    return { ...this.currentConfig };
  }

  /**
   * Get specific configuration value
   * @param {string} key - Configuration key
   * @param {any} defaultValue - Default value if key doesn't exist
   * @returns {any} Configuration value
   */
  get(key, defaultValue = undefined) {
    return this.currentConfig[key] !== undefined ? this.currentConfig[key] : defaultValue;
  }

  /**
   * Set specific configuration value
   * @param {string} key - Configuration key
   * @param {any} value - Configuration value
   * @param {boolean} save - Whether to save immediately (default: true)
   */
  set(key, value, save = true) {
    this.updateConfiguration({ [key]: value }, save);
  }

  /**
   * Reset configuration to defaults
   */
  resetToDefaults() {
    // Adjust keyboard controls based on device
    const isMobile = window.innerWidth <= 768;
    const resetConfig = {
      ...this.defaultConfig,
      keyboardControlsEnabled: !isMobile
    };
    
    this.currentConfig = { ...resetConfig };
    localStorage.removeItem(this.storageKey);
    
    this.emit('configReset', this.currentConfig);
  }

  /**
   * Validate configuration object
   * @param {Object} config - Configuration to validate
   * @returns {Object} Validation result { valid: boolean, errors: string[] }
   */
  validateConfiguration(config) {
    const errors = [];
    
    // Validate numeric fields
    const numericFields = [
      'introTime', 'preguntasTime', 'refutacionTime', 'conclusionTime',
      'ultimaRefutacionTime', 'bpSpeechTime', 'deliberacionTime', 'feedbackTime'
    ];
    
    numericFields.forEach(field => {
      if (config[field] !== undefined) {
        const value = Number(config[field]);
        if (isNaN(value) || value < 0) {
          errors.push(`${field} must be a non-negative number`);
        }
      }
    });

    // Validate numRefutaciones
    if (config.numRefutaciones !== undefined) {
      const value = Number(config.numRefutaciones);
      if (isNaN(value) || value < 1 || value > 10) {
        errors.push('numRefutaciones must be between 1 and 10');
      }
    }

    // Validate format
    if (config.currentFormat && !['academico', 'bp'].includes(config.currentFormat)) {
      errors.push('currentFormat must be "academico" or "bp"');
    }

    return {
      valid: errors.length === 0,
      errors
    };
  }

  /**
   * Get default configuration
   * @returns {Object} Default configuration
   */
  getDefaults() {
    return { ...this.defaultConfig };
  }
}