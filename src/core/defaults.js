/**
 * Default configuration values — extracted from the original DebateTimer.resetToDefaults().
 * All durations are in seconds.
 */

export const ACADEMIC_DEFAULTS = {
  introTime: 240,
  preguntasTime: 120,
  refutacionTime: 300,
  conclusionTime: 180,
  numRefutaciones: 2,
  equipo1Name: 'Equipo A',
  equipo2Name: 'Equipo B',
  ultimaRefutacionDiferente: false,
  ultimaRefutacionTime: 90,
};

export const BP_DEFAULTS = {
  speechTime: 420,
  camaraAltaFavor: 'Equipo A',
  camaraAltaContra: 'Equipo B',
  camaraBajaFavor: 'Equipo C',
  camaraBajaContra: 'Equipo D',
};

export const COMMON_DEFAULTS = {
  deliberacionTime: 1200,
  deliberacionDesc: 'Deliberación de jueces',
  feedbackTime: 900,
  feedbackDesc: 'Feedback',
};

/** Default format */
export const DEFAULT_FORMAT = 'academico';

/**
 * Whether keyboard controls are enabled by default.
 * On mobile (≤768 px) they start disabled; on desktop, enabled.
 */
export function defaultKeyboardEnabled() {
  return window.innerWidth > 768;
}

/**
 * Keyboard shortcut map — key → action identifier.
 * Only used for documentation / help panel; the actual handling lives in
 * KeyboardService.
 */
export const KEYBOARD_SHORTCUTS = {
  ' ': 'toggleStartPause',
  ArrowLeft: 'previousPhase',
  ArrowRight: 'nextPhase',
  r: 'resetPhase',
  R: 'resetPhase',
  d: 'resetDebate',
  D: 'resetDebate',
  c: 'toggleConfig',
  C: 'toggleConfig',
  f: 'togglePhases',
  F: 'togglePhases',
  '1': 'formatAcademico',
  '2': 'formatBP',
  h: 'toggleHelp',
  H: 'toggleHelp',
  t: 'toggleDarkMode',
  T: 'toggleDarkMode',
  ArrowUp: 'adjustTime+10',
  ArrowDown: 'adjustTime-10',
  '+': 'adjustTime+30',
  '=': 'adjustTime+30',
  '-': 'adjustTime-30',
  ',': 'adjustTime+1',
  '.': 'adjustTime-1',
  Enter: 'applyConfig',
  Escape: 'closePanels',
};

/** Timer thresholds (seconds) for warning / danger colours. */
export const TIMER_THRESHOLDS = {
  warningStart: 10,   // ≤ 10 s → warning (yellow)
  warningEnd: -10,    // ≥ -10 s → still warning
  dangerStart: -11,   // ≤ -11 s → danger (red)
};

/** Minimum negative time allowed when adjusting via keyboard. */
export const MIN_NEGATIVE_TIME = -300;

/** localStorage keys */
export const STORAGE_KEYS = {
  config: 'ada-debate-config',
  theme: 'debate-timer-theme',
};
