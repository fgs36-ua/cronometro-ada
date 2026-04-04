import { COMMON_DEFAULTS } from '../core/defaults.js';

/**
 * CustomFormat — generates phases from a block-based user-defined format.
 *
 * Blocks are expanded in order. Each block supports:
 * - repeat: run the block N times
 * - perTeam: generate phases for each team
 * - interleave: when perTeam, interleave phase-by-phase instead of team-by-team
 * - invertTeams: permanently reverse team order for this block
 * - reverseTeams: alternate team order on even repetitions
 *
 * Template variables in phase names:
 *   {equipo} → team name
 *   {n}      → 1-based repetition index
 *
 * @param {object} formatDef - the custom format definition from CustomFormatManager
 * @returns {{ name: string, generatePhases: Function }}
 */
export function createCustomFormatModule(formatDef) {
  return {
    name: formatDef.id,
    generatePhases(cfg = {}) {
      const phases = [];
      const globalTeams = formatDef.teams || [];

      for (const block of formatDef.blocks) {
        const excluded = new Set(block.excludedTeams || []);
        const teams = globalTeams.filter((_, i) => !excluded.has(i));
        const repeat = Math.max(1, block.repeat || 1);

        for (let r = 0; r < repeat; r++) {
          if (block.perTeam && teams.length > 0) {
            let ordered = block.invertTeams ? [...teams].reverse() : [...teams];
            if (block.reverseTeams && r % 2 === 1) ordered = [...ordered].reverse();
            const outer = block.interleave ? block.phases : ordered;
            const inner = block.interleave ? ordered : block.phases;
            for (const a of outer) {
              for (const b of inner) {
                const p = block.interleave ? a : b;
                const team = block.interleave ? b : a;
                phases.push({
                  name: p.name
                    .replace(/\{equipo\}/gi, team)
                    .replace(/\{n\}/g, String(r + 1)),
                  duration: p.duration,
                });
              }
            }
          } else {
            for (const p of block.phases) {
              phases.push({
                name: p.name.replace(/\{n\}/g, String(r + 1)),
                duration: p.duration,
              });
            }
          }
        }
      }

      if (formatDef.includeDeliberacion) {
        const deliberacionDuration = parseInt(
          cfg.deliberacionTime ?? cfg.deliberacion?.time ?? COMMON_DEFAULTS.deliberacionTime,
          10,
        );
        const deliberacionDesc = (
          cfg.deliberacionDesc ?? cfg.deliberacion?.description ?? COMMON_DEFAULTS.deliberacionDesc
        ).trim();
        phases.push({ name: deliberacionDesc, duration: deliberacionDuration });
      }

      if (formatDef.includeFeedback) {
        const feedbackDuration = parseInt(
          cfg.feedbackTime ?? cfg.feedback?.time ?? COMMON_DEFAULTS.feedbackTime,
          10,
        );
        const feedbackDesc = (
          cfg.feedbackDesc ?? cfg.feedback?.description ?? COMMON_DEFAULTS.feedbackDesc
        ).trim();
        phases.push({ name: feedbackDesc, duration: feedbackDuration });
      }

      return phases;
    },
  };
}
