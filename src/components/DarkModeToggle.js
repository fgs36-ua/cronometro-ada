import Component from './Component.js';
import themeService from '../services/ThemeService.js';

/**
 * DarkModeToggle — sun/moon toggle button wired to ThemeService.
 */
export class DarkModeToggle extends Component {
  constructor(container) {
    super(container);
  }

  mount() {
    this._btn = document.querySelector('#dark-mode-toggle');
    this.bindEvents();
  }

  bindEvents() {
    if (this._btn) this._btn.addEventListener('click', () => themeService.toggle());

    this.listen('keyboard:action', ({ action }) => {
      if (action === 'toggleDarkMode') themeService.toggle();
    });
  }
}


