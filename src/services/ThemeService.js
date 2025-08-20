import { EventEmitter } from '../core/EventEmitter.js';

/**
 * Theme Service - handles theme management and persistence
 * Implements Single Responsibility Principle for theme management
 */
export class ThemeService extends EventEmitter {
  constructor() {
    super();
    this.storageKey = 'debate-timer-theme';
    this.currentTheme = 'light';
    this.mediaQuery = window.matchMedia('(prefers-color-scheme: dark)');
    
    this.initializeTheme();
    this.setupSystemThemeListener();
  }

  /**
   * Initialize theme based on saved preference or system preference
   */
  initializeTheme() {
    const savedTheme = localStorage.getItem(this.storageKey);
    
    if (savedTheme) {
      this.setTheme(savedTheme, false); // Don't save again
    } else if (this.mediaQuery.matches) {
      this.setTheme('dark', false);
    } else {
      this.setTheme('light', false);
    }
  }

  /**
   * Set the current theme
   * @param {string} theme - Theme name ('light' or 'dark')
   * @param {boolean} save - Whether to save to localStorage (default: true)
   */
  setTheme(theme, save = true) {
    if (!['light', 'dark'].includes(theme)) {
      console.warn(`Invalid theme: ${theme}. Using 'light' as fallback.`);
      theme = 'light';
    }

    const oldTheme = this.currentTheme;
    this.currentTheme = theme;
    
    // Apply theme to document
    document.documentElement.setAttribute('data-theme', theme);
    
    if (save) {
      localStorage.setItem(this.storageKey, theme);
    }
    
    this.emit('themeChanged', {
      theme: this.currentTheme,
      oldTheme
    });
  }

  /**
   * Toggle between light and dark themes
   */
  toggleTheme() {
    const newTheme = this.currentTheme === 'dark' ? 'light' : 'dark';
    this.setTheme(newTheme);
  }

  /**
   * Get current theme
   * @returns {string} Current theme name
   */
  getCurrentTheme() {
    return this.currentTheme;
  }

  /**
   * Check if current theme is dark
   * @returns {boolean}
   */
  isDark() {
    return this.currentTheme === 'dark';
  }

  /**
   * Check if current theme is light
   * @returns {boolean}
   */
  isLight() {
    return this.currentTheme === 'light';
  }

  /**
   * Reset theme preference (use system preference)
   */
  resetTheme() {
    localStorage.removeItem(this.storageKey);
    const systemTheme = this.mediaQuery.matches ? 'dark' : 'light';
    this.setTheme(systemTheme, false);
    
    this.emit('themeReset', {
      theme: this.currentTheme,
      systemPreference: systemTheme
    });
  }

  /**
   * Setup listener for system theme changes
   * @private
   */
  setupSystemThemeListener() {
    this.mediaQuery.addEventListener('change', (e) => {
      // Only apply system theme if user hasn't set a preference
      if (!localStorage.getItem(this.storageKey)) {
        const systemTheme = e.matches ? 'dark' : 'light';
        this.setTheme(systemTheme, false);
        
        this.emit('systemThemeChanged', {
          theme: systemTheme,
          matches: e.matches
        });
      }
    });
  }

  /**
   * Get theme CSS custom properties
   * @param {string} theme - Theme name (optional, uses current theme)
   * @returns {Object} CSS custom properties for the theme
   */
  getThemeProperties(theme = this.currentTheme) {
    // This could be expanded to programmatically define theme properties
    // For now, we rely on CSS custom properties defined in styles.css
    return {
      theme,
      isDark: theme === 'dark',
      isLight: theme === 'light'
    };
  }

  /**
   * Apply theme to a specific element
   * @param {HTMLElement} element - Element to apply theme to
   * @param {string} theme - Theme to apply (optional, uses current theme)
   */
  applyThemeToElement(element, theme = this.currentTheme) {
    if (!element) return;
    
    element.setAttribute('data-theme', theme);
  }

  /**
   * Remove theme from element (revert to document theme)
   * @param {HTMLElement} element - Element to remove theme from
   */
  removeThemeFromElement(element) {
    if (!element) return;
    
    element.removeAttribute('data-theme');
  }

  /**
   * Get available themes
   * @returns {string[]} Array of available theme names
   */
  getAvailableThemes() {
    return ['light', 'dark'];
  }

  /**
   * Cleanup theme service
   */
  destroy() {
    this.mediaQuery.removeEventListener('change', this.systemThemeListener);
    this.events = {};
  }
}