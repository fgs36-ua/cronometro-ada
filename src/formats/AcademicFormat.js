import { DebateFormat } from './DebateFormat.js';

/**
 * Academic debate format implementation
 * Implements specific phase structure for academic debates
 */
export class AcademicFormat extends DebateFormat {
  constructor() {
    super('academico');
  }

  /**
   * Setup phases for academic debate format
   * @param {Object} config - Configuration object
   */
  setupPhases(config) {
    this.phases = [];
    
    const {
      equipo1Name = 'Equipo A',
      equipo2Name = 'Equipo B',
      introTime = 240,
      preguntasTime = 120,
      refutacionTime = 300,
      conclusionTime = 180,
      numRefutaciones = 2,
      ultimaRefutacionDiferente = false,
      ultimaRefutacionTime = 90,
      deliberacionTime = 1200,
      deliberacionDesc = 'Deliberación de jueces',
      feedbackTime = 900,
      feedbackDesc = 'Feedback'
    } = config;

    // Introduction phases
    this.phases.push(
      this.createPhase(`Introducción ${equipo1Name} (a favor)`, introTime, equipo1Name),
      this.createPhase(`Preguntas cruzadas a ${equipo1Name}`, preguntasTime),
      this.createPhase(`Introducción ${equipo2Name} (en contra)`, introTime, equipo2Name),
      this.createPhase(`Preguntas cruzadas a ${equipo2Name}`, preguntasTime)
    );

    // Refutation phases
    for (let i = 1; i <= numRefutaciones; i++) {
      const isLastRefutation = i === numRefutaciones;
      const refTime = (ultimaRefutacionDiferente && isLastRefutation) 
        ? ultimaRefutacionTime 
        : refutacionTime;

      this.phases.push(
        this.createPhase(`Refutación ${i} - ${equipo1Name} (a favor)`, refTime, equipo1Name),
        this.createPhase(`Refutación ${i} - ${equipo2Name} (en contra)`, refTime, equipo2Name)
      );
    }

    // Conclusion phases (reverse order)
    this.phases.push(
      this.createPhase(`Conclusión ${equipo2Name} (en contra)`, conclusionTime, equipo2Name),
      this.createPhase(`Conclusión ${equipo1Name} (a favor)`, conclusionTime, equipo1Name)
    );

    // Additional phases
    this.phases.push(
      this.createPhase(deliberacionDesc, deliberacionTime),
      this.createPhase(feedbackDesc, feedbackTime)
    );
  }

  /**
   * Validate academic format configuration
   * @param {Object} config - Configuration to validate
   * @returns {boolean}
   */
  validateConfig(config) {
    const requiredNumbers = ['introTime', 'preguntasTime', 'refutacionTime', 'conclusionTime', 'numRefutaciones'];
    
    for (let field of requiredNumbers) {
      if (config[field] !== undefined && (isNaN(config[field]) || config[field] < 0)) {
        return false;
      }
    }

    if (config.numRefutaciones !== undefined && config.numRefutaciones < 1) {
      return false;
    }

    return true;
  }

  /**
   * Get default configuration for academic format
   * @returns {Object}
   */
  getDefaultConfig() {
    return {
      equipo1Name: 'Equipo A',
      equipo2Name: 'Equipo B',
      introTime: 240,
      preguntasTime: 120,
      refutacionTime: 300,
      conclusionTime: 180,
      numRefutaciones: 2,
      ultimaRefutacionDiferente: false,
      ultimaRefutacionTime: 90,
      deliberacionTime: 1200,
      deliberacionDesc: 'Deliberación de jueces',
      feedbackTime: 900,
      feedbackDesc: 'Feedback'
    };
  }
}