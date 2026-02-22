import Component from './Component.js';
import configManager from '../core/ConfigManager.js';
import { ACADEMIC_DEFAULTS, BP_DEFAULTS, COMMON_DEFAULTS } from '../core/defaults.js';

/**
 * ConfigPanel — the left-sidebar configuration panel.
 * Renders all config fields and handles apply / reset.
 */
export class ConfigPanel extends Component {
  constructor(container) {
    super(container);
    this._visible = false;
  }

  mount() {
    this.container = document.querySelector('#config-panel');
    this._configBtn = document.querySelector('#config-btn');
    this.bindEvents();
  }

  bindEvents() {
    // Toggle panel via button
    if (this._configBtn) {
      this._configBtn.addEventListener('click', () => this.toggle());
    }

    // Apply
    this.container.querySelector('#apply-config-btn')
      .addEventListener('click', () => this._apply());

    // Reset defaults
    this.container.querySelector('#reset-defaults-btn')
      .addEventListener('click', () => this._resetDefaults());

    // Ultima refutacion toggle
    this.container.querySelector('#ultima-refutacion-diferente')
      .addEventListener('change', (e) => {
        const el = this.container.querySelector('#ultima-refutacion-config');
        el.style.display = e.target.checked ? 'block' : 'none';
      });

    // Listen to format changes to show/hide sections
    this.listen('format:changed', ({ format }) => this._onFormatChange(format));

    // Listen to keyboard actions
    this.listen('keyboard:action', ({ action }) => {
      if (action === 'toggleConfig') this.toggle();
      if (action === 'applyConfig' && this._visible) this._apply();
      if (action === 'closePanels') this.hide();
    });
  }

  /* ── public toggle ─────────────────────────────────────── */

  toggle() {
    if (this._visible) this.hide(); else this.show();
  }

  show() {
    this._visible = true;
    this.container.classList.add('show');
    this.container.classList.remove('hidden');
  }

  hide() {
    this._visible = false;
    this.container.classList.remove('show');
    this.container.classList.add('hidden');
  }

  get isVisible() {
    return this._visible;
  }

  /* ── private ──────────────────────────────────────────── */

  _readFields() {
    const q = (id) => this.container.querySelector(`#${id}`);
    return {
      currentFormat: configManager.getCurrentFormat(),
      keyboardControlsEnabled: q('keyboard-controls-enabled').checked,
      academico: {
        introTime: q('intro-time').value,
        preguntasTime: q('preguntas-time').value,
        refutacionTime: q('refutacion-time').value,
        conclusionTime: q('conclusion-time').value,
        numRefutaciones: q('num-refutaciones').value,
        equipo1Name: q('equipo1-name').value,
        equipo2Name: q('equipo2-name').value,
        ultimaRefutacionDiferente: q('ultima-refutacion-diferente').checked,
        ultimaRefutacionTime: q('ultima-refutacion-time').value,
      },
      bp: {
        speechTime: q('bp-speech-time').value,
        camaraAltaFavor: q('equipo-camara-alta-favor').value,
        camaraAltaContra: q('equipo-camara-alta-contra').value,
        camaraBajaFavor: q('equipo-camara-baja-favor').value,
        camaraBajaContra: q('equipo-camara-baja-contra').value,
      },
      deliberacion: {
        time: q('deliberacion-time').value,
        description: q('deliberacion-desc').value,
      },
      feedback: {
        time: q('feedback-time').value,
        description: q('feedback-desc').value,
      },
    };
  }

  _apply() {
    const data = this._readFields();
    configManager.apply(data);

    // Flash button
    const btn = this.container.querySelector('#apply-config-btn');
    const orig = btn.textContent;
    btn.textContent = 'Configuración Guardada';
    btn.style.background = '#2ecc71';
    setTimeout(() => { btn.textContent = orig; btn.style.background = ''; }, 2000);

    this.hide();
  }

  _resetDefaults() {
    configManager.reset();
    // Update form fields with default values
    this._populateFields();
  }

  _populateFields() {
    const cfg = configManager.getAll();
    const ac = cfg.academico || {};
    const bp = cfg.bp || {};
    const dl = cfg.deliberacion || {};
    const fb = cfg.feedback || {};
    const q = (id) => this.container.querySelector(`#${id}`);

    q('equipo1-name').value = ac.equipo1Name ?? ACADEMIC_DEFAULTS.equipo1Name;
    q('equipo2-name').value = ac.equipo2Name ?? ACADEMIC_DEFAULTS.equipo2Name;
    q('intro-time').value = ac.introTime ?? ACADEMIC_DEFAULTS.introTime;
    q('preguntas-time').value = ac.preguntasTime ?? ACADEMIC_DEFAULTS.preguntasTime;
    q('refutacion-time').value = ac.refutacionTime ?? ACADEMIC_DEFAULTS.refutacionTime;
    q('conclusion-time').value = ac.conclusionTime ?? ACADEMIC_DEFAULTS.conclusionTime;
    q('num-refutaciones').value = ac.numRefutaciones ?? ACADEMIC_DEFAULTS.numRefutaciones;
    q('ultima-refutacion-diferente').checked = ac.ultimaRefutacionDiferente ?? false;
    q('ultima-refutacion-time').value = ac.ultimaRefutacionTime ?? ACADEMIC_DEFAULTS.ultimaRefutacionTime;
    q('ultima-refutacion-config').style.display = ac.ultimaRefutacionDiferente ? 'block' : 'none';
    q('bp-speech-time').value = bp.speechTime ?? BP_DEFAULTS.speechTime;
    q('equipo-camara-alta-favor').value = bp.camaraAltaFavor ?? BP_DEFAULTS.camaraAltaFavor;
    q('equipo-camara-alta-contra').value = bp.camaraAltaContra ?? BP_DEFAULTS.camaraAltaContra;
    q('equipo-camara-baja-favor').value = bp.camaraBajaFavor ?? BP_DEFAULTS.camaraBajaFavor;
    q('equipo-camara-baja-contra').value = bp.camaraBajaContra ?? BP_DEFAULTS.camaraBajaContra;
    q('deliberacion-time').value = dl.time ?? COMMON_DEFAULTS.deliberacionTime;
    q('deliberacion-desc').value = dl.description ?? COMMON_DEFAULTS.deliberacionDesc;
    q('feedback-time').value = fb.time ?? COMMON_DEFAULTS.feedbackTime;
    q('feedback-desc').value = fb.description ?? COMMON_DEFAULTS.feedbackDesc;
    q('keyboard-controls-enabled').checked = cfg.keyboardControlsEnabled ?? true;
  }

  _onFormatChange(format) {
    const acad = this.container.querySelector('#academico-config');
    const bpEl = this.container.querySelector('#bp-config');
    if (acad) acad.classList.toggle('hidden', format !== 'academico');
    if (bpEl) bpEl.classList.toggle('hidden', format !== 'bp');
  }
}


