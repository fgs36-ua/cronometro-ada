import Component from './Component.js';
import configManager from '../core/ConfigManager.js';
import { ACADEMIC_DEFAULTS, BP_DEFAULTS, COMMON_DEFAULTS } from '../core/defaults.js';

/**
 * ConfigPanel — right-side drawer for configuration.
 * Handles stepper buttons, toggle open/close, apply / reset.
 */
export class ConfigPanel extends Component {
  constructor(container) {
    super(container);
    this._visible = false;
  }

  mount() {
    this.container = document.querySelector('#config-panel');
    this._configBtn = document.querySelector('#config-btn');
    this._closeBtn = document.querySelector('#config-close');
    this._backdrop = document.querySelector('#config-backdrop');
    this.bindEvents();
  }

  bindEvents() {
    // Toggle panel via toolbar button
    if (this._configBtn) {
      this._configBtn.addEventListener('click', () => this.toggle());
    }

    // Close via X button
    if (this._closeBtn) {
      this._closeBtn.addEventListener('click', () => this.hide());
    }

    // Close via backdrop click
    if (this._backdrop) {
      this._backdrop.addEventListener('click', () => this.hide());
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

    // Stepper buttons (event delegation)
    this.container.addEventListener('click', (e) => {
      const btn = e.target.closest('.stepper-btn');
      if (!btn) return;
      const targetId = btn.dataset.target;
      const step = parseInt(btn.dataset.step, 10) || 1;
      const input = this.container.querySelector(`#${targetId}`);
      if (!input) return;
      const min = parseInt(input.min, 10) || 0;
      const max = parseInt(input.max, 10) || 99999;
      let val = parseInt(input.value, 10) || 0;
      if (btn.classList.contains('stepper-plus')) {
        val = Math.min(val + step, max);
      } else {
        val = Math.max(val - step, min);
      }
      input.value = val;
    });

    // Format changes — both sections always visible, just auto-expand the active one
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
    this._syncDetailsState();
    this._visible = true;
    this.container.classList.add('open');
    if (this._backdrop) this._backdrop.classList.add('active');
    document.body.style.overflow = 'hidden';
  }

  hide() {
    this._visible = false;
    this.container.classList.remove('open');
    if (this._backdrop) this._backdrop.classList.remove('active');
    document.body.style.overflow = '';
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
      progressTrackingEnabled: q('progress-tracking-enabled').checked,
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
    btn.textContent = '✓ Guardado';
    btn.style.background = '#2ecc71';
    setTimeout(() => { btn.textContent = orig; btn.style.background = ''; }, 1500);

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
    q('progress-tracking-enabled').checked = cfg.progressTrackingEnabled ?? false;
  }

  _onFormatChange(format) {
    const acad = this.container.querySelector('#academico-config');
    const bpEl = this.container.querySelector('#bp-config');
    // Both sections always visible — just auto-expand the active format
    if (acad && format === 'academico') acad.open = true;
    if (bpEl && format === 'bp') bpEl.open = true;
  }

  /** Reset <details> open state: only the active format expanded, rest closed */
  _syncDetailsState() {
    const fmt = configManager.getCurrentFormat();
    const acad = this.container.querySelector('#academico-config');
    const bpEl = this.container.querySelector('#bp-config');
    const fasesAd = this.container.querySelector('#fases-adicionales-config');
    const controles = this.container.querySelector('#controles-config');
    if (acad) acad.open = fmt === 'academico';
    if (bpEl) bpEl.open = fmt === 'bp';
    if (fasesAd) fasesAd.open = false;
    if (controles) controles.open = false;
  }
}


