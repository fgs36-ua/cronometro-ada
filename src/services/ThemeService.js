import eventBus from '../core/EventBus.js';
import storageService from './StorageService.js';
import { STORAGE_KEYS } from '../core/defaults.js';

/**
 * ThemeService — manages dark/light theme toggling and persistence.
 */
export class ThemeService {
  constructor() {
    this._theme = 'light';
  }

  /**
   * Initialise theme from stored preference or system setting.
   */
  init() {
    const saved = storageService.get(STORAGE_KEYS.theme);
    // storageService returns parsed JSON; the legacy code stores a plain string
    // via localStorage.setItem, so we also handle raw strings.
    const raw = saved ?? localStorage.getItem(STORAGE_KEYS.theme);
    const systemDark = window.matchMedia('(prefers-color-scheme: dark)').matches;

    if (raw) {
      this.setTheme(raw);
    } else if (systemDark) {
      this.setTheme('dark');
    } else {
      this.setTheme('light');
    }

    // React to OS-level changes when the user hasn't explicitly chosen.
    window.matchMedia('(prefers-color-scheme: dark)').addEventListener('change', (e) => {
      if (!localStorage.getItem(STORAGE_KEYS.theme)) {
        this.setTheme(e.matches ? 'dark' : 'light');
      }
    });
  }

  get current() {
    return this._theme;
  }

  toggle() {
    const next = this._theme === 'dark' ? 'light' : 'dark';
    this.setTheme(next);
    localStorage.setItem(STORAGE_KEYS.theme, next);
  }

  setTheme(theme) {
    this._theme = theme;
    document.documentElement.setAttribute('data-theme', theme);
    eventBus.emit('theme:changed', { theme });
  }
}

const themeService = new ThemeService();
export default themeService;
