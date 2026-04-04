import Component from './Component.js';
import eventBus from '../core/EventBus.js';
import configManager from '../core/ConfigManager.js';
import customFormatManager from '../services/CustomFormatManager.js';
import { createCustomFormatModule } from '../formats/CustomFormat.js';

/**
 * CustomFormatEditor — Drawer for creating / editing custom debate formats.
 *
 * V4: Global teams with per-block exclusion. Define teams once at format level;
 * each block includes all teams by default and lets you uncheck specific ones.
 */
export class CustomFormatEditor extends Component {
  constructor() {
    super(null);
    this._editingId = null;
    this._teams = [];
    this._blocks = [];
    this._visible = false;
    this._dragBlockIdx = null;
    this._dragPhaseFrom = null;
  }

  mount() {
    this.container = document.querySelector('#custom-format-editor');
    this._backdrop = document.querySelector('#custom-editor-backdrop');
    this._teamsListEl = this.container.querySelector('#custom-teams-list');
    this._blocksListEl = this.container.querySelector('#custom-blocks-list');
    this.bindEvents();
  }

  bindEvents() {
    this.container.querySelector('#custom-editor-close')
      .addEventListener('click', () => this.hide());
    if (this._backdrop) {
      this._backdrop.addEventListener('click', () => this.hide());
    }

    this.container.querySelector('#custom-format-save')
      .addEventListener('click', () => this._save());
    this.container.querySelector('#custom-format-delete')
      .addEventListener('click', () => this._delete());

    // Add block
    this.container.querySelector('#custom-add-block')
      .addEventListener('click', () => this._addBlock());

    // ── Global teams ───────────────────────
    this.container.querySelector('#custom-add-team')
      .addEventListener('click', () => this._addTeam());
    this._teamsListEl.addEventListener('click', (e) => {
      const btn = e.target.closest('[data-team-action]');
      if (!btn) return;
      const ti = parseInt(btn.dataset.teamIndex, 10);
      if (btn.dataset.teamAction === 'remove') this._removeTeam(ti);
    });
    this._teamsListEl.addEventListener('input', (e) => {
      const input = e.target;
      const ti = parseInt(input.dataset.teamIndex, 10);
      if (!isNaN(ti) && input.dataset.teamField === 'name') {
        this._teams[ti] = input.value;
        // Update checkbox labels in blocks without re-rendering
        this._blocksListEl.querySelectorAll(`[data-team-label-index="${ti}"]`).forEach(
          (label) => { label.querySelector('.team-check-name').textContent = input.value || `Equipo ${ti + 1}`; }
        );
        this._renderPreview();
      }
    });

    // Block container — event delegation
    this._blocksListEl.addEventListener('click', (e) => {
      const btn = e.target.closest('[data-block-action]');
      if (!btn) return;
      const bi = parseInt(btn.dataset.blockIndex, 10);
      const pi = btn.dataset.phaseIndex !== undefined ? parseInt(btn.dataset.phaseIndex, 10) : -1;
      const action = btn.dataset.blockAction;
      switch (action) {
        case 'remove-block': this._removeBlock(bi); break;
        case 'move-block-up': this._moveBlock(bi, -1); break;
        case 'move-block-down': this._moveBlock(bi, 1); break;
        case 'add-phase': this._addPhaseToBlock(bi); break;
        case 'remove-phase': this._removePhaseFromBlock(bi, pi); break;
        case 'move-phase-up': this._movePhase(bi, pi, -1); break;
        case 'move-phase-down': this._movePhase(bi, pi, 1); break;
        case 'step-minus':
        case 'step-plus': this._stepPhaseDuration(bi, pi, action === 'step-plus' ? 30 : -30); break;
        case 'repeat-minus':
        case 'repeat-plus': this._stepRepeat(bi, action === 'repeat-plus' ? 1 : -1); break;
        case 'toggle-team': this._toggleTeamVar(bi, pi); break;
      }
    });

    this._blocksListEl.addEventListener('change', (e) => {
      const input = e.target;
      const bi = parseInt(input.dataset.blockIndex, 10);
      if (isNaN(bi)) return;
      const field = input.dataset.blockField;
      const boolFields = ['perTeam', 'reverseTeams', 'invertTeams', 'interleave'];
      if (boolFields.includes(field)) {
        this._blocks[bi][field] = input.checked;
        this._renderPreview();
        return;
      }
      // Team inclusion checkbox
      const tci = parseInt(input.dataset.teamCheckIndex, 10);
      if (!isNaN(tci)) {
        const block = this._blocks[bi];
        if (!block.excludedTeams) block.excludedTeams = [];
        if (input.checked) {
          block.excludedTeams = block.excludedTeams.filter((i) => i !== tci);
        } else {
          if (!block.excludedTeams.includes(tci)) block.excludedTeams.push(tci);
        }
        this._renderPreview();
      }
    });

    this._blocksListEl.addEventListener('input', (e) => {
      const input = e.target;
      const bi = parseInt(input.dataset.blockIndex, 10);
      if (isNaN(bi)) return;
      if (input.dataset.blockField === 'name') {
        this._blocks[bi].name = input.value;
      } else if (input.dataset.phaseField === 'name') {
        const pi = parseInt(input.dataset.phaseIndex, 10);
        this._blocks[bi].phases[pi].name = input.value;
        this._renderPreview();
      } else if (input.dataset.phaseField === 'duration') {
        const pi = parseInt(input.dataset.phaseIndex, 10);
        this._blocks[bi].phases[pi].duration = Math.max(0, parseInt(input.value, 10) || 0);
        this._renderPreview();
      }
    });

    // Drag & drop for blocks
    this._blocksListEl.addEventListener('dragstart', (e) => {
      // Phase drag
      const phaseRow = e.target.closest('.block-phase-row');
      if (phaseRow) {
        const bi = parseInt(phaseRow.querySelector('[data-block-index]').dataset.blockIndex, 10);
        const pi = parseInt(phaseRow.querySelector('[data-phase-index]').dataset.phaseIndex, 10);
        this._dragPhaseFrom = { bi, pi };
        phaseRow.classList.add('dragging');
        e.dataTransfer.effectAllowed = 'move';
        e.stopPropagation();
        return;
      }
      // Block drag
      const card = e.target.closest('.block-card');
      if (!card) return;
      this._dragBlockIdx = parseInt(card.dataset.blockIndex, 10);
      card.classList.add('dragging');
      e.dataTransfer.effectAllowed = 'move';
    });
    this._blocksListEl.addEventListener('dragend', (e) => {
      const phaseRow = e.target.closest('.block-phase-row');
      if (phaseRow) {
        phaseRow.classList.remove('dragging');
        this._dragPhaseFrom = null;
        this._blocksListEl.querySelectorAll('.block-phase-row').forEach((r) => r.classList.remove('drag-over'));
        return;
      }
      const card = e.target.closest('.block-card');
      if (card) card.classList.remove('dragging');
      this._dragBlockIdx = null;
      this._blocksListEl.querySelectorAll('.block-card').forEach((c) => c.classList.remove('drag-over'));
    });
    this._blocksListEl.addEventListener('dragover', (e) => {
      e.preventDefault();
      e.dataTransfer.dropEffect = 'move';
      // Phase drag over
      if (this._dragPhaseFrom) {
        const row = e.target.closest('.block-phase-row');
        if (row) {
          this._blocksListEl.querySelectorAll('.block-phase-row').forEach((r) => r.classList.remove('drag-over'));
          row.classList.add('drag-over');
        }
        return;
      }
      // Block drag over
      const card = e.target.closest('.block-card');
      if (card) {
        this._blocksListEl.querySelectorAll('.block-card').forEach((c) => c.classList.remove('drag-over'));
        card.classList.add('drag-over');
      }
    });
    this._blocksListEl.addEventListener('drop', (e) => {
      e.preventDefault();
      // Phase drop
      if (this._dragPhaseFrom) {
        const row = e.target.closest('.block-phase-row');
        if (!row) { this._dragPhaseFrom = null; return; }
        const targetBi = parseInt(row.querySelector('[data-block-index]').dataset.blockIndex, 10);
        const targetPi = parseInt(row.querySelector('[data-phase-index]').dataset.phaseIndex, 10);
        const { bi, pi } = this._dragPhaseFrom;
        if (bi === targetBi && pi !== targetPi) {
          const moved = this._blocks[bi].phases.splice(pi, 1)[0];
          this._blocks[bi].phases.splice(targetPi, 0, moved);
          this._renderBlocks();
          this._renderPreview();
        }
        this._dragPhaseFrom = null;
        return;
      }
      // Block drop
      const card = e.target.closest('.block-card');
      if (!card || this._dragBlockIdx === null) return;
      const targetIdx = parseInt(card.dataset.blockIndex, 10);
      if (targetIdx !== this._dragBlockIdx) {
        const moved = this._blocks.splice(this._dragBlockIdx, 1)[0];
        this._blocks.splice(targetIdx, 0, moved);
        this._renderBlocks();
        this._renderPreview();
      }
    });

    // Toggle deliberation/feedback
    this.container.querySelector('#custom-include-deliberacion')
      .addEventListener('change', () => this._renderPreview());
    this.container.querySelector('#custom-include-feedback')
      .addEventListener('change', () => this._renderPreview());

    this.listen('keyboard:action', ({ action }) => {
      if (action === 'closePanels') this.hide();
    });
  }

  /* ── Public API ───────────────────────── */

  openNew() {
    this._editingId = null;
    this._teams = ['Equipo A', 'Equipo B'];
    this._blocks = [{
      name: 'Bloque 1',
      excludedTeams: [],
      phases: [
        { name: 'Discurso {equipo}', duration: 300 },
      ],
      repeat: 1,
      perTeam: true,
      interleave: false,
      reverseTeams: false,
      invertTeams: false,
    }];
    this._populateForm({
      name: '',
      includeDeliberacion: true,
      includeFeedback: true,
    });
    this._renderTeams();
    this._renderBlocks();
    this._renderPreview();
    this.show();
  }

  openEdit(id) {
    const fmt = customFormatManager.get(id);
    if (!fmt) return;
    this._editingId = id;
    this._teams = [...(fmt.teams || [])];
    this._blocks = (fmt.blocks || []).map((b) => ({
      ...b,
      excludedTeams: [...(b.excludedTeams || [])],
      phases: b.phases.map((p) => ({ ...p })),
    }));
    this._populateForm({
      name: fmt.name,
      includeDeliberacion: fmt.includeDeliberacion,
      includeFeedback: fmt.includeFeedback,
    });
    this._renderTeams();
    this._renderBlocks();
    this._renderPreview();
    this.show();
  }

  show() {
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

  /* ── Global Teams ──────────────────────── */

  _addTeam() {
    const letter = String.fromCharCode(65 + this._teams.length);
    this._teams.push(`Equipo ${letter}`);
    this._renderTeams();
    this._renderBlocks();
    this._renderPreview();
  }

  _removeTeam(ti) {
    this._teams.splice(ti, 1);
    for (const block of this._blocks) {
      if (!block.excludedTeams) continue;
      block.excludedTeams = block.excludedTeams
        .filter((i) => i !== ti)
        .map((i) => (i > ti ? i - 1 : i));
    }
    this._renderTeams();
    this._renderBlocks();
    this._renderPreview();
  }

  _renderTeams() {
    const el = this._teamsListEl;
    if (this._teams.length === 0) {
      el.innerHTML = '<p class="teams-empty-hint">No hay equipos definidos.</p>';
      return;
    }
    el.innerHTML = this._teams.map((t, ti) => `
      <div class="team-row">
        <input type="text" class="team-name-input"
          data-team-index="${ti}" data-team-field="name"
          value="${this._esc(t)}" placeholder="Nombre equipo" />
        <button type="button" class="team-remove-btn"
          data-team-action="remove" data-team-index="${ti}"
          title="Eliminar equipo">✕</button>
      </div>
    `).join('');
  }

  /* ── Blocks ───────────────────────────── */

  _addBlock() {
    this._blocks.push({
      name: `Bloque ${this._blocks.length + 1}`,
      excludedTeams: [],
      phases: [{ name: 'Nueva fase', duration: 300 }],
      repeat: 1,
      perTeam: false,
      interleave: false,
      reverseTeams: false,
      invertTeams: false,
    });
    this._renderBlocks();
    this._renderPreview();
    this._blocksListEl.scrollTop = this._blocksListEl.scrollHeight;
  }

  _removeBlock(bi) {
    this._blocks.splice(bi, 1);
    this._renderBlocks();
    this._renderPreview();
  }

  _moveBlock(bi, dir) {
    this._moveItem(this._blocks, bi, dir);
  }

  _addPhaseToBlock(bi) {
    const block = this._blocks[bi];
    block.phases.push({ name: `Fase ${block.phases.length + 1}`, duration: 300 });
    this._renderBlocks();
    this._renderPreview();
  }

  _removePhaseFromBlock(bi, pi) {
    if (this._blocks[bi].phases.length <= 1) return;
    this._blocks[bi].phases.splice(pi, 1);
    this._renderBlocks();
    this._renderPreview();
  }

  _movePhase(bi, pi, dir) {
    this._moveItem(this._blocks[bi].phases, pi, dir);
  }

  _moveItem(arr, idx, dir) {
    const target = idx + dir;
    if (target < 0 || target >= arr.length) return;
    const moved = arr.splice(idx, 1)[0];
    arr.splice(target, 0, moved);
    this._renderBlocks();
    this._renderPreview();
  }

  _toggleTeamVar(bi, pi) {
    const phase = this._blocks[bi].phases[pi];
    const input = this._blocksListEl.querySelector(
      `input[data-block-index="${bi}"][data-phase-index="${pi}"][data-phase-field="name"]`
    );
    if (phase.name.includes('{equipo}')) {
      phase.name = phase.name.replace(/\s*\{equipo\}/gi, '').trim();
    } else {
      phase.name = (phase.name.trim() + ' {equipo}').trim();
    }
    if (input) input.value = phase.name;
    // Update toggle button state
    const btn = this._blocksListEl.querySelector(
      `[data-block-action="toggle-team"][data-block-index="${bi}"][data-phase-index="${pi}"]`
    );
    if (btn) btn.classList.toggle('active', phase.name.includes('{equipo}'));
    this._renderPreview();
  }

  _stepPhaseDuration(bi, pi, delta) {
    const phase = this._blocks[bi].phases[pi];
    phase.duration = Math.max(0, phase.duration + delta);
    const input = this._blocksListEl.querySelector(
      `input[data-block-index="${bi}"][data-phase-index="${pi}"][data-phase-field="duration"]`
    );
    if (input) input.value = phase.duration;
    this._renderPreview();
  }

  _stepRepeat(bi, delta) {
    const block = this._blocks[bi];
    block.repeat = Math.max(1, (block.repeat || 1) + delta);
    const input = this._blocksListEl.querySelector(
      `input[data-block-index="${bi}"][data-block-field="repeat"]`
    );
    if (input) input.value = block.repeat;
    this._renderPreview();
  }

  _renderBlocks() {
    const container = this._blocksListEl;
    container.innerHTML = '';

    this._blocks.forEach((block, bi) => {
      const card = document.createElement('div');
      card.className = 'block-card';
      card.draggable = true;
      card.dataset.blockIndex = bi;

      let phasesHtml = '';
      block.phases.forEach((p, pi) => {
        const hasTeamVar = p.name.includes('{equipo}');
        phasesHtml += `
          <div class="block-phase-row" draggable="true">
            <span class="phase-drag-handle" title="Arrastrar para reordenar fase">⠿</span>
            <input type="text" class="block-phase-name"
              data-block-index="${bi}" data-phase-index="${pi}" data-phase-field="name"
              value="${this._esc(p.name)}" placeholder="Nombre fase" />
            <button type="button" class="block-phase-team-toggle${hasTeamVar ? ' active' : ''}"
              data-block-action="toggle-team" data-block-index="${bi}" data-phase-index="${pi}"
              title="Activar/desactivar nombre de equipo en esta fase">👥</button>
            <div class="stepper block-phase-stepper">
              <button type="button" class="stepper-btn stepper-minus"
                data-block-action="step-minus" data-block-index="${bi}" data-phase-index="${pi}">−</button>
              <input type="number"
                data-block-index="${bi}" data-phase-index="${pi}" data-phase-field="duration"
                value="${p.duration}" min="0" step="30" />
              <button type="button" class="stepper-btn stepper-plus"
                data-block-action="step-plus" data-block-index="${bi}" data-phase-index="${pi}">+</button>
            </div>
            <div class="phase-actions">
              <button type="button" class="move-btn phase-move-btn"
                data-block-action="move-phase-up" data-block-index="${bi}" data-phase-index="${pi}"
                ${pi === 0 ? 'disabled' : ''} title="Mover arriba">▲</button>
              <button type="button" class="move-btn phase-move-btn"
                data-block-action="move-phase-down" data-block-index="${bi}" data-phase-index="${pi}"
                ${pi === block.phases.length - 1 ? 'disabled' : ''} title="Mover abajo">▼</button>
              <button type="button" class="block-phase-remove"
                data-block-action="remove-phase" data-block-index="${bi}" data-phase-index="${pi}"
                ${block.phases.length <= 1 ? 'disabled' : ''} title="Eliminar fase">✕</button>
            </div>
          </div>`;
      });

      // Team checkboxes for this block (based on global teams)
      let teamChecksHtml = '';
      if (this._teams.length > 0) {
        const excluded = block.excludedTeams || [];
        teamChecksHtml = `
          <div class="block-teams-section">
            <span class="block-teams-label">Equipos en este bloque</span>
            <div class="block-teams-checks">
              ${this._teams.map((t, ti) => `
                <label class="block-team-check" data-team-label-index="${ti}">
                  <input type="checkbox" data-block-index="${bi}" data-team-check-index="${ti}"
                    ${!excluded.includes(ti) ? 'checked' : ''} />
                  <span class="team-check-name">${this._esc(t)}</span>
                </label>
              `).join('')}
            </div>
          </div>`;
      }

      card.innerHTML = `
        <div class="block-card-header">
          <span class="block-drag-handle" title="Arrastrar para reordenar">⠿</span>
          <input type="text" class="block-name-input"
            data-block-index="${bi}" data-block-field="name"
            value="${this._esc(block.name)}" placeholder="Nombre del bloque" />
          <div class="block-header-actions">
            <button type="button" class="move-btn block-move-btn"
              data-block-action="move-block-up" data-block-index="${bi}"
              ${bi === 0 ? 'disabled' : ''} title="Mover arriba">▲</button>
            <button type="button" class="move-btn block-move-btn"
              data-block-action="move-block-down" data-block-index="${bi}"
              ${bi === this._blocks.length - 1 ? 'disabled' : ''} title="Mover abajo">▼</button>
            <button type="button" class="block-remove-btn"
              data-block-action="remove-block" data-block-index="${bi}" title="Eliminar bloque">✕</button>
          </div>
        </div>
        <div class="block-card-phases">${phasesHtml}</div>
        <button type="button" class="block-add-phase-btn"
          data-block-action="add-phase" data-block-index="${bi}">+ Fase</button>
        <div class="block-card-options">
          <div class="block-option-row">
            <label class="block-toggle" title="Genera las fases del bloque para cada equipo">
              <input type="checkbox" data-block-index="${bi}" data-block-field="perTeam"
                ${block.perTeam ? 'checked' : ''} />
              <span>Por equipo</span>
            </label>
            <label class="block-toggle" title="Intercala fase a fase (A1, B1, A2, B2…) en vez de equipo a equipo (A1, A2…, B1, B2…)">
              <input type="checkbox" data-block-index="${bi}" data-block-field="interleave"
                ${block.interleave ? 'checked' : ''} />
              <span>Intercalar</span>
            </label>
            <label class="block-toggle" title="Invierte permanentemente el orden de los equipos en este bloque">
              <input type="checkbox" data-block-index="${bi}" data-block-field="invertTeams"
                ${block.invertTeams ? 'checked' : ''} />
              <span>Invertir equipos</span>
            </label>
            <label class="block-toggle" title="En cada repetición par, alterna el orden de los equipos">
              <input type="checkbox" data-block-index="${bi}" data-block-field="reverseTeams"
                ${block.reverseTeams ? 'checked' : ''} />
              <span>Alternar orden</span>
            </label>
          </div>
          <div class="block-option-row">
            <span class="block-repeat-label">Repeticiones</span>
            <div class="stepper block-repeat-stepper">
              <button type="button" class="stepper-btn stepper-minus"
                data-block-action="repeat-minus" data-block-index="${bi}">−</button>
              <input type="number" data-block-index="${bi}" data-block-field="repeat"
                value="${block.repeat || 1}" min="1" step="1" />
              <button type="button" class="stepper-btn stepper-plus"
                data-block-action="repeat-plus" data-block-index="${bi}">+</button>
            </div>
          </div>
          ${teamChecksHtml}
        </div>
      `;
      container.appendChild(card);
    });

    if (this._blocks.length === 0) {
      container.innerHTML = '<p class="blocks-empty-hint">No hay bloques. Añade al menos uno.</p>';
    }
  }

  /* ── Preview ──────────────────────────── */

  _renderPreview() {
    const previewEl = this.container.querySelector('#custom-preview-list');
    if (!previewEl) return;

    // Build a temporary format def to generate phases
    const tempDef = {
      id: '__preview__',
      name: 'Preview',
      teams: this._teams.filter((t) => t.trim()),
      blocks: this._blocks,
      includeDeliberacion: this.container.querySelector('#custom-include-deliberacion').checked,
      includeFeedback: this.container.querySelector('#custom-include-feedback').checked,
    };

    const mod = createCustomFormatModule(tempDef);
    const phases = mod.generatePhases({});

    if (phases.length === 0) {
      previewEl.innerHTML = '<p class="preview-empty">No se generan fases con la configuración actual.</p>';
      return;
    }

    previewEl.innerHTML = phases.map((p, i) => `
      <div class="preview-phase">
        <span class="preview-phase-num">${i + 1}</span>
        <span class="preview-phase-name">${this._esc(p.name)}</span>
        <span class="preview-phase-dur">${this._fmtTime(p.duration)}</span>
      </div>
    `).join('');
  }

  _fmtTime(sec) {
    const m = Math.floor(sec / 60);
    const s = sec % 60;
    return `${m}:${String(s).padStart(2, '0')}`;
  }

  /* ── Save / Delete ────────────────────── */

  _save() {
    const name = this.container.querySelector('#custom-format-name').value.trim();
    if (!name) {
      this._flashError('Escribe un nombre para el formato');
      return;
    }
    // Ensure at least one block with at least one phase
    const hasPhases = this._blocks.some((b) => b.phases.length > 0);
    if (this._blocks.length === 0 || !hasPhases) {
      this._flashError('Añade al menos un bloque con fases');
      return;
    }

    // Read latest values from DOM
    this._syncFromDOM();

    const data = {
      name,
      teams: this._teams.filter((t) => t.trim()),
      blocks: this._blocks.map((b) => ({
        name: b.name || 'Bloque',
        excludedTeams: b.excludedTeams || [],
        phases: b.phases.map((p) => ({ name: p.name || 'Fase', duration: p.duration })),
        repeat: Math.max(1, b.repeat || 1),
        perTeam: !!b.perTeam,
        interleave: !!b.interleave,
        reverseTeams: !!b.reverseTeams,
        invertTeams: !!b.invertTeams,
      })),
      includeDeliberacion: this.container.querySelector('#custom-include-deliberacion').checked,
      includeFeedback: this.container.querySelector('#custom-include-feedback').checked,
    };

    let result;
    if (this._editingId) {
      result = customFormatManager.update(this._editingId, data);
    } else {
      result = customFormatManager.create(data);
    }

    if (result) {
      eventBus.emit('customFormat:saved', { format: result });
      this._flashSuccess();
      setTimeout(() => this.hide(), 600);
    }
  }

  _syncFromDOM() {
    // Sync global teams
    this._teamsListEl.querySelectorAll('[data-team-field="name"]').forEach((input) => {
      const ti = parseInt(input.dataset.teamIndex, 10);
      if (ti < this._teams.length) this._teams[ti] = input.value;
    });

    // Sync block data
    this._blocksListEl.querySelectorAll('.block-card').forEach((card) => {
      const bi = parseInt(card.dataset.blockIndex, 10);
      const block = this._blocks[bi];
      if (!block) return;

      const nameInput = card.querySelector(`[data-block-field="name"]`);
      if (nameInput) block.name = nameInput.value;

      // Sync block excluded teams from checkboxes
      const excluded = [];
      card.querySelectorAll('[data-team-check-index]').forEach((cb) => {
        const ti = parseInt(cb.dataset.teamCheckIndex, 10);
        if (!cb.checked) excluded.push(ti);
      });
      block.excludedTeams = excluded;

      card.querySelectorAll('.block-phase-row').forEach((row) => {
        const nameIn = row.querySelector('[data-phase-field="name"]');
        const durIn = row.querySelector('[data-phase-field="duration"]');
        if (nameIn) {
          const pi = parseInt(nameIn.dataset.phaseIndex, 10);
          block.phases[pi].name = nameIn.value.trim() || `Fase ${pi + 1}`;
        }
        if (durIn) {
          const pi = parseInt(durIn.dataset.phaseIndex, 10);
          block.phases[pi].duration = Math.max(0, parseInt(durIn.value, 10) || 0);
        }
      });
    });
  }

  _delete() {
    if (!this._editingId) return;
    const name = this.container.querySelector('#custom-format-name').value.trim() || 'este formato';
    if (!confirm(`¿Eliminar "${name}"? Esta acción no se puede deshacer.`)) return;

    const deletedId = this._editingId;
    customFormatManager.delete(deletedId);

    if (configManager.getCurrentFormat() === deletedId) {
      configManager.set('currentFormat', 'academico');
      eventBus.emit('format:changed', { format: 'academico' });
    }

    this.hide();
  }

  /* ── Helpers ──────────────────────────── */

  _populateForm({ name, includeDeliberacion, includeFeedback }) {
    const q = (id) => this.container.querySelector(`#${id}`);
    q('custom-format-name').value = name;
    q('custom-include-deliberacion').checked = includeDeliberacion;
    q('custom-include-feedback').checked = includeFeedback;

    this.container.querySelector('#custom-editor-title').textContent =
      this._editingId ? 'Editar Formato' : 'Nuevo Formato Personalizado';
    this.container.querySelector('#custom-format-delete').style.display =
      this._editingId ? '' : 'none';
  }

  _flashSuccess() {
    const btn = this.container.querySelector('#custom-format-save');
    const orig = btn.textContent;
    btn.textContent = '✓ Guardado';
    btn.style.background = '#2ecc71';
    setTimeout(() => { btn.textContent = orig; btn.style.background = ''; }, 1500);
  }

  _flashError(msg) {
    const errorEl = this.container.querySelector('#custom-editor-error');
    errorEl.textContent = msg;
    errorEl.style.display = 'block';
    setTimeout(() => { errorEl.style.display = 'none'; }, 3000);
  }

  _esc(str) {
    const div = document.createElement('div');
    div.textContent = str;
    return div.innerHTML;
  }
}
