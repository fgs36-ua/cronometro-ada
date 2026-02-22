import { BP_DEFAULTS, COMMON_DEFAULTS } from '../core/defaults.js';

/**
 * BPFormat — pure function that generates phases for the British Parliament
 * debate format.
 *
 * @param {object} [cfg] - merged BP + common config
 * @returns {Array<{name: string, duration: number}>}
 */
function generatePhases(cfg = {}) {
  const speechDuration = parseInt(cfg.speechTime ?? BP_DEFAULTS.speechTime, 10);
  const camaraAltaFavor = (cfg.camaraAltaFavor || BP_DEFAULTS.camaraAltaFavor).trim();
  const camaraAltaContra = (cfg.camaraAltaContra || BP_DEFAULTS.camaraAltaContra).trim();
  const camaraBajaFavor = (cfg.camaraBajaFavor || BP_DEFAULTS.camaraBajaFavor).trim();
  const camaraBajaContra = (cfg.camaraBajaContra || BP_DEFAULTS.camaraBajaContra).trim();

  const phases = [
    { name: `Primer Ministro (${camaraAltaFavor})`, duration: speechDuration },
    { name: `Líder de Oposición (${camaraAltaContra})`, duration: speechDuration },
    { name: `Viceprimer Ministro (${camaraAltaFavor})`, duration: speechDuration },
    { name: `Vicelíder de Oposición (${camaraAltaContra})`, duration: speechDuration },
    { name: `Extensión de Gobierno (${camaraBajaFavor})`, duration: speechDuration },
    { name: `Extensión de la Oposición (${camaraBajaContra})`, duration: speechDuration },
    { name: `Látigo de Gobierno (${camaraBajaFavor})`, duration: speechDuration },
    { name: `Látigo de la Oposición (${camaraBajaContra})`, duration: speechDuration },
  ];

  // Deliberación & Feedback
  const deliberacionDuration = parseInt(cfg.deliberacionTime ?? cfg.deliberacion?.time ?? COMMON_DEFAULTS.deliberacionTime, 10);
  const deliberacionDesc = (cfg.deliberacionDesc ?? cfg.deliberacion?.description ?? COMMON_DEFAULTS.deliberacionDesc).trim();
  const feedbackDuration = parseInt(cfg.feedbackTime ?? cfg.feedback?.time ?? COMMON_DEFAULTS.feedbackTime, 10);
  const feedbackDesc = (cfg.feedbackDesc ?? cfg.feedback?.description ?? COMMON_DEFAULTS.feedbackDesc).trim();

  phases.push(
    { name: deliberacionDesc, duration: deliberacionDuration },
    { name: feedbackDesc, duration: feedbackDuration },
  );

  return phases;
}

export default { name: 'bp', generatePhases };
