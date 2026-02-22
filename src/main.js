/* ===========================================
   Main Entry Point — Cronómetro de Debate ADA
   =========================================== */

// --- CSS Imports (Vite handles bundling) ---
import './styles/variables.css';
import './styles/base.css';
import './styles/layout.css';
import './styles/components/timer-display.css';
import './styles/components/progress-bar.css';
import './styles/components/controls.css';
import './styles/components/phase-list.css';
import './styles/components/config-panel.css';
import './styles/components/format-selector.css';
import './styles/components/dark-mode-toggle.css';
import './styles/components/keyboard-help.css';
import './styles/responsive.css';

// --- Core ---
import eventBus from './core/EventBus.js';
import configManager from './core/ConfigManager.js';
import timer from './core/Timer.js';
import phaseManager from './core/PhaseManager.js';

// --- Formats ---
import formatRegistry from './formats/FormatRegistry.js';

// --- Services ---
import themeService from './services/ThemeService.js';
import keyboardService from './services/KeyboardService.js';

// --- Components ---
import { TimerDisplay } from './components/TimerDisplay.js';
import { ProgressBar } from './components/ProgressBar.js';
import { Controls } from './components/Controls.js';
import { PhaseList } from './components/PhaseList.js';
import { ConfigPanel } from './components/ConfigPanel.js';
import { FormatSelector } from './components/FormatSelector.js';
import { DarkModeToggle } from './components/DarkModeToggle.js';
import { KeyboardHelp } from './components/KeyboardHelp.js';

// ---- Application Bootstrap ----

class App {
  constructor() {
    this.components = [];
  }

  init() {
    // 1. Load saved config
    configManager.load();

    // 2. Init services
    themeService.init();
    keyboardService.init();

    // 3. Mount components
    this.components = [
      new TimerDisplay(),
      new ProgressBar(),
      new Controls(),
      new PhaseList(),
      new ConfigPanel(),
      new FormatSelector(),
      new DarkModeToggle(),
      new KeyboardHelp(),
    ];

    this.components.forEach((c) => c.mount());

    // 4. Wire format changes → regenerate phases
    eventBus.on('format:changed', ({ format }) => {
      this._loadFormat(format);
    });

    eventBus.on('config:applied', () => {
      this._loadFormat(configManager.getCurrentFormat());
    });

    eventBus.on('config:reset', () => {
      this._loadFormat(configManager.getCurrentFormat());
    });

    // 5. Initial format load
    this._loadFormat(configManager.getCurrentFormat());

    console.log('[ADA] Cronómetro de Debate iniciado ✓');
  }

  _loadFormat(formatName) {
    const fmt = formatRegistry.get(formatName);
    if (!fmt) {
      console.error(`[ADA] Formato desconocido: ${formatName}`);
      return;
    }

    const config = configManager.getFormatConfig(formatName);
    const common = configManager.getCommon();
    const phases = fmt.generatePhases({ ...config, ...common });

    phaseManager.setPhases(phases);
  }

  destroy() {
    this.components.forEach((c) => c.destroy());
    keyboardService.destroy();
    eventBus.clear();
  }
}

// --- Start on DOM ready ---
const app = new App();

if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', () => app.init());
} else {
  app.init();
}

export { app };
