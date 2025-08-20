import { DebateFormat } from './DebateFormat.js';

/**
 * British Parliament debate format implementation
 * Implements specific phase structure for BP debates
 */
export class BritishParliamentFormat extends DebateFormat {
  constructor() {
    super('bp');
  }

  /**
   * Setup phases for British Parliament debate format
   * @param {Object} config - Configuration object
   */
  setupPhases(config) {
    this.phases = [];
    
    const {
      bpSpeechTime = 420,
      equipoCamaraAltaFavor = 'Equipo A',
      equipoCamaraAltaContra = 'Equipo B',
      equipoCamaraBajaFavor = 'Equipo C',
      equipoCamaraBajaContra = 'Equipo D',
      deliberacionTime = 1200,
      deliberacionDesc = 'Deliberación de jueces',
      feedbackTime = 900,
      feedbackDesc = 'Feedback'
    } = config;

    // Opening speeches
    this.phases.push(
      this.createPhase(`Opening Government - ${equipoCamaraAltaFavor}`, bpSpeechTime, equipoCamaraAltaFavor),
      this.createPhase(`Opening Opposition - ${equipoCamaraAltaContra}`, bpSpeechTime, equipoCamaraAltaContra),
      this.createPhase(`Deputy Prime Minister - ${equipoCamaraAltaFavor}`, bpSpeechTime, equipoCamaraAltaFavor),
      this.createPhase(`Deputy Leader Opposition - ${equipoCamaraAltaContra}`, bpSpeechTime, equipoCamaraAltaContra),
      
      // Closing speeches
      this.createPhase(`Member Government - ${equipoCamaraBajaFavor}`, bpSpeechTime, equipoCamaraBajaFavor),
      this.createPhase(`Member Opposition - ${equipoCamaraBajaContra}`, bpSpeechTime, equipoCamaraBajaContra),
      this.createPhase(`Government Whip - ${equipoCamaraBajaFavor}`, bpSpeechTime, equipoCamaraBajaFavor),
      this.createPhase(`Opposition Whip - ${equipoCamaraBajaContra}`, bpSpeechTime, equipoCamaraBajaContra)
    );

    // Additional phases
    this.phases.push(
      this.createPhase(deliberacionDesc, deliberacionTime),
      this.createPhase(feedbackDesc, feedbackTime)
    );
  }

  /**
   * Validate British Parliament format configuration
   * @param {Object} config - Configuration to validate
   * @returns {boolean}
   */
  validateConfig(config) {
    if (config.bpSpeechTime !== undefined && (isNaN(config.bpSpeechTime) || config.bpSpeechTime < 0)) {
      return false;
    }

    return true;
  }

  /**
   * Get default configuration for British Parliament format
   * @returns {Object}
   */
  getDefaultConfig() {
    return {
      bpSpeechTime: 420,
      equipoCamaraAltaFavor: 'Equipo A',
      equipoCamaraAltaContra: 'Equipo B',
      equipoCamaraBajaFavor: 'Equipo C',
      equipoCamaraBajaContra: 'Equipo D',
      deliberacionTime: 1200,
      deliberacionDesc: 'Deliberación de jueces',
      feedbackTime: 900,
      feedbackDesc: 'Feedback'
    };
  }
}