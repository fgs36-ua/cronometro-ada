import Component from './Component.js';
import eventBus from '../core/EventBus.js';
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

  render() {
    const cfg = configManager.getAll();
    const ac = cfg.academico || {};
    const bp = cfg.bp || {};
    const dl = cfg.deliberacion || {};
    const fb = cfg.feedback || {};

    const acadHidden = cfg.currentFormat !== 'academico' ? 'hidden' : '';
    const bpHidden = cfg.currentFormat !== 'bp' ? 'hidden' : '';
    const ulRefDisplay = ac.ultimaRefutacionDiferente ? 'block' : 'none';

    return `
      <!-- Configuración Académico -->
      <div id="academico-config" class="config-section ${acadHidden}">
        <h2>Configuración Formato Académico</h2>
        <div class="config-grid">
          <div class="config-item">
            <label for="equipo1-name">Nombre Equipo 1:</label>
            <input type="text" id="equipo1-name" value="${ac.equipo1Name ?? ACADEMIC_DEFAULTS.equipo1Name}" />
          </div>
          <div class="config-item">
            <label for="equipo2-name">Nombre Equipo 2:</label>
            <input type="text" id="equipo2-name" value="${ac.equipo2Name ?? ACADEMIC_DEFAULTS.equipo2Name}" />
          </div>
          <div class="config-item">
            <label for="intro-time">Introducción (segundos):</label>
            <input type="number" id="intro-time" value="${ac.introTime ?? ACADEMIC_DEFAULTS.introTime}" />
          </div>
          <div class="config-item">
            <label for="preguntas-time">Preguntas cruzadas (segundos):</label>
            <input type="number" id="preguntas-time" value="${ac.preguntasTime ?? ACADEMIC_DEFAULTS.preguntasTime}" />
          </div>
          <div class="config-item">
            <label for="refutacion-time">Refutación (segundos):</label>
            <input type="number" id="refutacion-time" value="${ac.refutacionTime ?? ACADEMIC_DEFAULTS.refutacionTime}" />
          </div>
          <div class="config-item">
            <label for="conclusion-time">Conclusión (segundos):</label>
            <input type="number" id="conclusion-time" value="${ac.conclusionTime ?? ACADEMIC_DEFAULTS.conclusionTime}" />
          </div>
          <div class="config-item">
            <label for="num-refutaciones">Número de refutaciones:</label>
            <input type="number" id="num-refutaciones" value="${ac.numRefutaciones ?? ACADEMIC_DEFAULTS.numRefutaciones}" />
          </div>
          <div class="config-item">
            <label for="ultima-refutacion-diferente">
              <input type="checkbox" id="ultima-refutacion-diferente" ${ac.ultimaRefutacionDiferente ? 'checked' : ''} style="margin-right: 8px" />
              Tiempo diferente para última refutación
            </label>
          </div>
          <div class="config-item" id="ultima-refutacion-config" style="display: ${ulRefDisplay}">
            <label for="ultima-refutacion-time">Última refutación (segundos):</label>
            <input type="number" id="ultima-refutacion-time" value="${ac.ultimaRefutacionTime ?? ACADEMIC_DEFAULTS.ultimaRefutacionTime}" />
          </div>
        </div>
      </div>

      <!-- Configuración BP -->
      <div id="bp-config" class="config-section ${bpHidden}">
        <h2>Configuración British Parliament</h2>
        <div class="config-grid">
          <div class="config-item">
            <label for="bp-speech-time">Duración de discursos (segundos):</label>
            <input type="number" id="bp-speech-time" value="${bp.speechTime ?? BP_DEFAULTS.speechTime}" />
          </div>
          <div class="config-item">
            <label for="equipo-camara-alta-favor">Cámara Alta (a favor):</label>
            <input type="text" id="equipo-camara-alta-favor" value="${bp.camaraAltaFavor ?? BP_DEFAULTS.camaraAltaFavor}" />
          </div>
          <div class="config-item">
            <label for="equipo-camara-alta-contra">Cámara Alta (en contra):</label>
            <input type="text" id="equipo-camara-alta-contra" value="${bp.camaraAltaContra ?? BP_DEFAULTS.camaraAltaContra}" />
          </div>
          <div class="config-item">
            <label for="equipo-camara-baja-favor">Cámara Baja (a favor):</label>
            <input type="text" id="equipo-camara-baja-favor" value="${bp.camaraBajaFavor ?? BP_DEFAULTS.camaraBajaFavor}" />
          </div>
          <div class="config-item">
            <label for="equipo-camara-baja-contra">Cámara Baja (en contra):</label>
            <input type="text" id="equipo-camara-baja-contra" value="${bp.camaraBajaContra ?? BP_DEFAULTS.camaraBajaContra}" />
          </div>
        </div>
      </div>

      <!-- Fases Adicionales -->
      <div id="fases-adicionales-config" class="config-section">
        <h2>Fases Adicionales</h2>
        <div class="config-grid">
          <div class="config-item">
            <label for="deliberacion-time">Deliberación (segundos):</label>
            <input type="number" id="deliberacion-time" value="${dl.time ?? COMMON_DEFAULTS.deliberacionTime}" />
          </div>
          <div class="config-item">
            <label for="deliberacion-desc">Descripción Deliberación:</label>
            <input type="text" id="deliberacion-desc" value="${dl.description ?? COMMON_DEFAULTS.deliberacionDesc}" />
          </div>
          <div class="config-item">
            <label for="feedback-time">Feedback (segundos):</label>
            <input type="number" id="feedback-time" value="${fb.time ?? COMMON_DEFAULTS.feedbackTime}" />
          </div>
          <div class="config-item">
            <label for="feedback-desc">Descripción Feedback:</label>
            <input type="text" id="feedback-desc" value="${fb.description ?? COMMON_DEFAULTS.feedbackDesc}" />
          </div>
        </div>
      </div>

      <!-- Configuración Controles -->
      <div id="controles-config" class="config-section">
        <h2>Configuración de Controles</h2>
        <div class="config-grid">
          <div class="config-item">
            <label for="keyboard-controls-enabled">
              <input type="checkbox" id="keyboard-controls-enabled" ${cfg.keyboardControlsEnabled ? 'checked' : ''} style="margin-right: 8px" />
              Activar controles de teclado
            </label>
            <small style="display: block; margin-top: 4px; color: #7f8c8d; font-size: 0.85rem;">
              Permite usar atajos de teclado para controlar el cronómetro (Espacio, flechas, etc.)
            </small>
          </div>
        </div>
      </div>

      <!-- Botones -->
      <div class="config-actions">
        <button class="apply-config-btn" id="apply-config-btn">Guardar y Aplicar</button>
        <button class="reset-defaults-btn" id="reset-defaults-btn">Restaurar Valores por Defecto</button>
      </div>
    `;
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

export default ConfigPanel;
