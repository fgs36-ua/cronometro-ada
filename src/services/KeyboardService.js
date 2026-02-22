import eventBus from '../core/EventBus.js';
import configManager from '../core/ConfigManager.js';

/**
 * KeyboardService — centralised keyboard shortcut handler.
 *
 * Emits `keyboard:action` for each recognised shortcut.
 * Guards: input focus, modifier keys, global enable flag from ConfigManager.
 */
export class KeyboardService {
  constructor() {
    this._isInputFocused = false;
    this._boundKeydown = this._onKeydown.bind(this);
    this._boundFocusIn = this._onFocusIn.bind(this);
    this._boundFocusOut = this._onFocusOut.bind(this);
  }

  init() {
    document.addEventListener('focusin', this._boundFocusIn);
    document.addEventListener('focusout', this._boundFocusOut);
    document.addEventListener('keydown', this._boundKeydown);
  }

  destroy() {
    document.removeEventListener('focusin', this._boundFocusIn);
    document.removeEventListener('focusout', this._boundFocusOut);
    document.removeEventListener('keydown', this._boundKeydown);
  }

  /* ── private ──────────────────────────────────────────── */

  _onFocusIn(e) {
    if (e.target.tagName === 'INPUT' || e.target.tagName === 'TEXTAREA') {
      this._isInputFocused = true;
    }
  }

  _onFocusOut(e) {
    if (e.target.tagName === 'INPUT' || e.target.tagName === 'TEXTAREA') {
      this._isInputFocused = false;
    }
  }

  _onKeydown(e) {
    if (!configManager.isKeyboardEnabled()) return;
    if (this._isInputFocused || e.ctrlKey || e.altKey || e.metaKey) return;

    const HANDLED = [
      ' ', 'ArrowLeft', 'ArrowRight', 'r', 'R', 'd', 'D',
      'c', 'C', 'f', 'F', '1', '2', 'h', 'H', 't', 'T',
      'ArrowUp', 'ArrowDown', '+', '=', '-', ',', '.', 'Enter', 'Escape',
    ];

    if (HANDLED.includes(e.key)) e.preventDefault();

    const action = this._mapKey(e.key);
    if (action) {
      eventBus.emit('keyboard:action', { action, key: e.key });
    }
  }

  /**
   * Map a key to an action string.
   * @returns {string|null}
   */
  _mapKey(key) {
    switch (key) {
      case ' ': return 'toggleStartPause';
      case 'ArrowLeft': return 'previousPhase';
      case 'ArrowRight': return 'nextPhase';
      case 'r': case 'R': return 'resetPhase';
      case 'd': case 'D': return 'resetDebate';
      case 'c': case 'C': return 'toggleConfig';
      case 'f': case 'F': return 'togglePhases';
      case '1': return 'formatAcademico';
      case '2': return 'formatBP';
      case 'h': case 'H': return 'toggleHelp';
      case 't': case 'T': return 'toggleDarkMode';
      case 'ArrowUp': return 'adjustTime+10';
      case 'ArrowDown': return 'adjustTime-10';
      case '+': case '=': return 'adjustTime+30';
      case '-': return 'adjustTime-30';
      case ',': return 'adjustTime+1';
      case '.': return 'adjustTime-1';
      case 'Enter': return 'applyConfig';
      case 'Escape': return 'closePanels';
      default: return null;
    }
  }
}

const keyboardService = new KeyboardService();
export default keyboardService;
