import { ACADEMIC_DEFAULTS, COMMON_DEFAULTS } from '../core/defaults.js';

/**
 * AcademicFormat — pure function that generates phases for the Academic
 * debate format.
 *
 * @param {object} [cfg] - merged academic + common config
 * @returns {Array<{name: string, duration: number}>}
 */
export function generatePhases(cfg = {}) {
  const intro = parseInt(cfg.introTime ?? ACADEMIC_DEFAULTS.introTime, 10);
  const preguntas = parseInt(cfg.preguntasTime ?? ACADEMIC_DEFAULTS.preguntasTime, 10);
  const refutacion = parseInt(cfg.refutacionTime ?? ACADEMIC_DEFAULTS.refutacionTime, 10);
  const conclusion = parseInt(cfg.conclusionTime ?? ACADEMIC_DEFAULTS.conclusionTime, 10);
  const numRef = parseInt(cfg.numRefutaciones ?? ACADEMIC_DEFAULTS.numRefutaciones, 10);
  const equipo1 = (cfg.equipo1Name || ACADEMIC_DEFAULTS.equipo1Name).trim();
  const equipo2 = (cfg.equipo2Name || ACADEMIC_DEFAULTS.equipo2Name).trim();
  const tieneUltimaRefDiferente = cfg.ultimaRefutacionDiferente ?? ACADEMIC_DEFAULTS.ultimaRefutacionDiferente;
  const ultimaRefutacion = parseInt(cfg.ultimaRefutacionTime ?? ACADEMIC_DEFAULTS.ultimaRefutacionTime, 10);

  const phases = [
    // Introducciones con preguntas cruzadas
    { name: `Introducción ${equipo1} (a favor)`, duration: intro },
    { name: `Preguntas cruzadas a ${equipo1}`, duration: preguntas },
    { name: `Introducción ${equipo2} (en contra)`, duration: intro },
    { name: `Preguntas cruzadas a ${equipo2}`, duration: preguntas },

    // Refutaciones alternando equipo A y B
    ...Array(numRef)
      .fill(null)
      .flatMap((_, i) => {
        const esUltimaRonda = i === numRef - 1;
        const tiempoAUsar =
          tieneUltimaRefDiferente && esUltimaRonda
            ? ultimaRefutacion
            : refutacion;

        return [
          { name: `Refutación ${i + 1} - ${equipo1} (a favor)`, duration: tiempoAUsar },
          { name: `Refutación ${i + 1} - ${equipo2} (en contra)`, duration: tiempoAUsar },
        ];
      }),

    // Conclusiones (primero B, luego A)
    { name: `Conclusión ${equipo2} (en contra)`, duration: conclusion },
    { name: `Conclusión ${equipo1} (a favor)`, duration: conclusion },
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

export default { name: 'academico', generatePhases };
