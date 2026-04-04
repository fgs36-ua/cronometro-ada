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
import './styles/components/drawer.css';
import './styles/components/format-selector.css';
import './styles/components/dark-mode-toggle.css';
import './styles/components/keyboard-help.css';
import './styles/components/custom-format-editor.css';
import './styles/responsive.css';

// --- Core ---
import eventBus from './core/EventBus.js';
import configManager from './core/ConfigManager.js';
import phaseManager from './core/PhaseManager.js';

// --- Formats ---
import formatRegistry from './formats/FormatRegistry.js';
import { createCustomFormatModule } from './formats/CustomFormat.js';

// --- Services ---
import themeService from './services/ThemeService.js';
import keyboardService from './services/KeyboardService.js';
import customFormatManager from './services/CustomFormatManager.js';

// --- Components ---
import { TimerDisplay } from './components/TimerDisplay.js';
import { ProgressBar } from './components/ProgressBar.js';
import { Controls } from './components/Controls.js';
import { PhaseList } from './components/PhaseList.js';
import { ConfigPanel } from './components/ConfigPanel.js';
import { FormatSelector } from './components/FormatSelector.js';
import { DarkModeToggle } from './components/DarkModeToggle.js';
import { KeyboardHelp } from './components/KeyboardHelp.js';
import { CustomFormatEditor } from './components/CustomFormatEditor.js';

// ---- Application Bootstrap ----

class App {
  constructor() {
    this.components = [];
  }

  init() {
    // 1. Load saved config
    configManager.load();

    // 2. Load custom formats and register them
    customFormatManager.load();
    this._registerCustomFormats();

    // 3. Init services
    themeService.init();
    keyboardService.init();

    // 4. Mount components
    const formatSelector = new FormatSelector();
    const customEditor = new CustomFormatEditor();

    this.components = [
      new TimerDisplay(),
      new ProgressBar(),
      new Controls(),
      new PhaseList(),
      new ConfigPanel(),
      formatSelector,
      new DarkModeToggle(),
      new KeyboardHelp(),
      customEditor,
    ];

    this.components.forEach((c) => c.mount());

    // Link editor to selector so selector can open it
    formatSelector.editor = customEditor;

    // 5. Wire format changes → regenerate phases
    eventBus.on('format:changed', ({ format }) => {
      this._loadFormat(format);
    });

    eventBus.on('config:applied', () => {
      this._loadFormat(configManager.getCurrentFormat());
    });

    eventBus.on('config:reset', () => {
      this._loadFormat(configManager.getCurrentFormat());
    });

    // 6. When custom formats change, re-register and reload if active
    eventBus.on('customFormats:changed', () => {
      this._syncCustomFormats();
    });

    eventBus.on('customFormat:saved', ({ format }) => {
      this._syncCustomFormats();
      // Auto-select the saved format
      configManager.set('currentFormat', format.id);
      eventBus.emit('format:changed', { format: format.id });
    });

    // 7. Validate that saved format still exists, fallback to default
    const current = configManager.getCurrentFormat();
    if (!formatRegistry.has(current)) {
      configManager.set('currentFormat', 'academico');
    }

    // 8. Initial format load
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

  /** Register all custom formats from CustomFormatManager into the FormatRegistry. */
  _registerCustomFormats() {
    customFormatManager.getAll().forEach((f) => {
      formatRegistry.register(f.id, createCustomFormatModule(f));
    });
  }

  /** Re-sync custom formats: unregister stale ones, register new/updated ones. */
  _syncCustomFormats() {
    // Remove all custom registrations
    formatRegistry.listCustom().forEach((name) => formatRegistry.unregister(name));
    // Re-register all current custom formats
    this._registerCustomFormats();
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
