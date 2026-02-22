import Component from './Component.js';
import themeService from '../services/ThemeService.js';

/**
 * DarkModeToggle — sun/moon toggle button wired to ThemeService.
 */
export class DarkModeToggle extends Component {
  constructor(container) {
    super(container);
  }

  render() {
    return `
      <button class="toggle-btn" id="dark-mode-toggle" title="Alternar modo oscuro">
        <div class="sun-rays"></div>
        <div class="main-circle"></div>
      </button>
    `;
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

export default DarkModeToggle;
