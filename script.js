class DebateTimer {  constructor() {
    this.currentFormat = 'academico';
    this.isRunning = false;
    this.isPaused = false;
    this.currentTime = 0;
    this.totalTime = 0;
    this.currentPhaseIndex = 0;
    this.phases = [];
    this.timer = null;
    this.debateEnded = false;
    this.keyboardControlsEnabled = true; // Añadido: controla si los controles de teclado están activos
      // Propiedades para sincronización por tiempo real
    this.startTimestamp = null;
    this.lastVisibilityChange = Date.now();
    this.initializeElements();
    this.setupEventListeners();
    this.setupVisibilityChangeDetection(); // Detectar cambios de visibilidad
    this.loadConfiguration(); // Cargar configuración guardada
    this.updateConfiguration();
  }
  initializeElements() {
    // Elementos del DOM
    this.timerDisplay = document.getElementById('timer');
    this.currentSpeakerDisplay = document.getElementById('current-speaker');
    this.progressFill = document.getElementById('progress-fill');
    this.progressBar = document.querySelector('.progress-bar');
    this.startPauseBtn = document.getElementById('start-pause-btn');
    this.resetBtn = document.getElementById('reset-btn');
    this.resetDebateBtn = document.getElementById('reset-debate-btn');
    this.prevBtn = document.getElementById('prev-btn');
    this.nextBtn = document.getElementById('next-btn');
    this.navigationControls = document.getElementById('navigation-controls');

    // Panel de fases
    this.phasesBtn = document.getElementById('phases-btn');
    this.phasesPanel = document.getElementById('phases-panel');
    this.currentPhaseDisplay = document.getElementById('current-phase-display');
    this.phaseCounterDisplay = document.getElementById('phase-counter-display');
    this.phasesList = document.getElementById('phases-list');

    // Panel de configuración
    this.configBtn = document.getElementById('config-btn');
    this.configPanel = document.getElementById('config-panel');
    this.applyConfigBtn = document.getElementById('apply-config-btn'); // Secciones de configuración
    this.academicoConfig = document.getElementById('academico-config');
    this.bpConfig = document.getElementById('bp-config');
    this.fasesAdicionalesConfig = document.getElementById(
      'fases-adicionales-config'
    ); // Inputs de configuración académico
    this.introTime = document.getElementById('intro-time');
    this.preguntasTime = document.getElementById('preguntas-time');
    this.refutacionTime = document.getElementById('refutacion-time');
    this.conclusionTime = document.getElementById('conclusion-time');
    this.numRefutaciones = document.getElementById('num-refutaciones');
    this.equipo1Name = document.getElementById('equipo1-name');
    this.equipo2Name = document.getElementById('equipo2-name');
    this.ultimaRefutacionDiferente = document.getElementById(
      'ultima-refutacion-diferente'
    );
    this.ultimaRefutacionTime = document.getElementById(
      'ultima-refutacion-time'
    );
    this.ultimaRefutacionConfig = document.getElementById(
      'ultima-refutacion-config'
    ); // Inputs de configuración BP
    this.bpSpeechTime = document.getElementById('bp-speech-time');
    this.equipoCamaraAltaFavor = document.getElementById(
      'equipo-camara-alta-favor'
    );
    this.equipoCamaraAltaContra = document.getElementById(
      'equipo-camara-alta-contra'
    );
    this.equipoCamaraBajaFavor = document.getElementById(
      'equipo-camara-baja-favor'
    );
    this.equipoCamaraBajaContra = document.getElementById(
      'equipo-camara-baja-contra'
    );    // Inputs de configuración Deliberación y Feedback
    this.deliberacionTime = document.getElementById('deliberacion-time');
    this.deliberacionDesc = document.getElementById('deliberacion-desc');
    this.feedbackTime = document.getElementById('feedback-time');
    this.feedbackDesc = document.getElementById('feedback-desc');
    
    // Input de configuración de controles de teclado
    this.keyboardControlsCheckbox = document.getElementById('keyboard-controls-enabled');
  }
  setupEventListeners() {
    // Selector de formato
    document.querySelectorAll('.format-btn').forEach((btn) => {
      btn.addEventListener('click', (e) => {
        this.switchFormat(e.target.dataset.format);
      });
    }); // Panel de configuración
    this.configBtn.addEventListener('click', () => this.toggleConfigPanel());
    this.applyConfigBtn.addEventListener('click', () =>
      this.applyConfiguration()
    );

    // Botón para resetear a valores por defecto
    this.resetDefaultsBtn = document.getElementById('reset-defaults-btn');
    this.resetDefaultsBtn.addEventListener('click', () =>
      this.resetToDefaults()
    );    // Checkbox para última refutación diferente
    this.ultimaRefutacionDiferente.addEventListener('change', () =>
      this.toggleUltimaRefutacionConfig()
    );
    
    // Checkbox para controles de teclado
    this.keyboardControlsCheckbox.addEventListener('change', () =>
      this.toggleKeyboardControls()
    );

    // Panel de fases
    this.phasesBtn.addEventListener('click', () => this.togglePhasesPanel());    // Controles del cronómetro
    this.startPauseBtn.addEventListener('click', () => this.toggleStartPause());
    this.resetBtn.addEventListener('click', () => this.reset());
    this.resetDebateBtn.addEventListener('click', () => this.resetDebate());
    this.prevBtn.addEventListener('click', () => this.previousPhase());
    this.nextBtn.addEventListener('click', () => this.nextPhase());
    // Listener para ajustar el tamaño del cronómetro en pantallas pequeñas
    window.addEventListener('resize', () => this.adjustTimerSize());    // Event listeners para la barra de progreso interactiva
    this.setupProgressBarInteraction();

    // Keyboard controls
    this.setupKeyboardControls();
  }

  setupVisibilityChangeDetection() {
    // Detectar cuando la pestaña cambia de visible/oculta
    document.addEventListener('visibilitychange', () => {
      if (this.isRunning && !this.isPaused) {
        if (document.hidden) {
          // La pestaña se oculta - guardar timestamp
          this.lastVisibilityChange = Date.now();
        } else {
          // La pestaña vuelve a ser visible - sincronizar tiempo
          this.syncTimeOnVisibilityChange();
        }
      }
    });

    // También detectar cambios de foco de la ventana
    window.addEventListener('focus', () => {
      if (this.isRunning && !this.isPaused) {
        this.syncTimeOnVisibilityChange();
      }
    });

    window.addEventListener('blur', () => {
      if (this.isRunning && !this.isPaused) {
        this.lastVisibilityChange = Date.now();
      }
    });
  }
  syncTimeOnVisibilityChange() {
    if (!this.isRunning || this.isPaused || !this.startTimestamp) return;

    // Calcular el tiempo real transcurrido
    const currentTimestamp = Date.now();
    const realTimeElapsed = Math.floor((currentTimestamp - this.startTimestamp) / 1000);
    
    // Sincronizar el tiempo actual basado en el tiempo real
    const expectedCurrentTime = this.totalTime - realTimeElapsed;
    
    // Solo actualizar si hay una diferencia significativa (más de 1 segundo)
    if (Math.abs(this.currentTime - expectedCurrentTime) > 1) {
      this.currentTime = expectedCurrentTime;
      this.updateDisplay();
    }
  }
  setupProgressBarInteraction() {
    let isDragging = false;
    let tooltip = null;

    // Create tooltip element
    const createTooltip = () => {
      if (!tooltip) {
        tooltip = document.createElement('div');
        tooltip.style.cssText = `
                    position: absolute;
                    background: rgba(44, 62, 80, 0.9);
                    color: white;
                    padding: 4px 8px;
                    border-radius: 4px;
                    font-size: 12px;
                    font-weight: 500;
                    pointer-events: none;
                    z-index: 1000;
                    opacity: 0;
                    transition: opacity 0.2s ease;
                    transform: translateX(-50%);
                `;
        document.body.appendChild(tooltip);
      }
      return tooltip;
    };

    // Show tooltip with time preview
    const showTooltip = (event) => {
      if (this.phases.length === 0) return;

      const rect = this.progressBar.getBoundingClientRect();
      const clickX = event.clientX - rect.left;
      const progressBarWidth = rect.width;
      let progressPercentage = Math.max(
        0,
        Math.min(1, clickX / progressBarWidth)
      );

      const phase = this.phases[this.currentPhaseIndex];
      const previewTime = Math.round(
        phase.duration - progressPercentage * phase.duration
      );

      const minutes = Math.floor(Math.abs(previewTime) / 60);
      const seconds = Math.abs(previewTime) % 60;
      const timeString = `${previewTime < 0 ? '-' : ''}${minutes
        .toString()
        .padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`;

      const tooltipEl = createTooltip();
      tooltipEl.textContent = timeString;
      tooltipEl.style.left = `${event.clientX}px`;
      tooltipEl.style.top = `${rect.top - 30}px`;
      tooltipEl.style.opacity = '1';
    };

    // Hide tooltip
    const hideTooltip = () => {
      if (tooltip) {
        tooltip.style.opacity = '0';
      }
    };
    // Mouse events
    this.progressBar.addEventListener('mousedown', (e) => {
      isDragging = true;
      this.handleProgressBarInteraction(e, true); // Usar versión optimizada
      showTooltip(e);
      e.preventDefault();
    });

    this.progressBar.addEventListener('mousemove', (e) => {
      if (isDragging) {
        this.handleProgressBarInteraction(e, true); // Usar versión optimizada durante arrastre
        showTooltip(e);
      } else {
        showTooltip(e);
      }
    });

    this.progressBar.addEventListener('mouseleave', () => {
      hideTooltip();
    });
    document.addEventListener('mouseup', () => {
      if (isDragging) {
        // Actualización completa solo al terminar el arrastre
        this.updateDisplay();
      }
      isDragging = false;
      hideTooltip();
    });

    // Click event (when not dragging)
    this.progressBar.addEventListener('click', (e) => {
      if (!isDragging) {
        this.handleProgressBarInteraction(e, false); // Actualización completa en click
      }
    });
    // Touch events for mobile
    this.progressBar.addEventListener('touchstart', (e) => {
      isDragging = true;
      this.handleProgressBarInteraction(e.touches[0], true); // Usar versión optimizada
      e.preventDefault();
    });

    this.progressBar.addEventListener('touchmove', (e) => {
      if (isDragging) {
        this.handleProgressBarInteraction(e.touches[0], true); // Usar versión optimizada
        e.preventDefault();
      }
    });
    document.addEventListener('touchend', () => {
      if (isDragging) {
        // Actualización completa solo al terminar el arrastre táctil
        this.updateDisplay();
      }
      isDragging = false;
    });
  }

  updateDisplayOptimized() {
    // Versión optimizada que solo actualiza elementos esenciales durante el arrastre
    if (this.phases.length === 0) return;

    // Solo actualizar el cronómetro
    const minutes = Math.floor(Math.abs(this.currentTime) / 60);
    const seconds = Math.abs(this.currentTime) % 60;
    const timeString = `${this.currentTime < 0 ? '-' : ''}${minutes
      .toString()
      .padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`;
    this.timerDisplay.textContent = timeString;

    // Solo actualizar la barra de progreso
    const progress = Math.max(
      0,
      ((this.totalTime - this.currentTime) / this.totalTime) * 100
    );
    this.progressFill.style.width = `${progress}%`;

    // Solo actualizar colores críticos (sin actualizaciones costosas del DOM)
    this.timerDisplay.className = 'timer';
    this.progressFill.className = 'progress-fill';

    if (this.currentTime <= -11) {
      this.timerDisplay.classList.add('danger');
      this.progressFill.classList.add('danger');
    } else if (this.currentTime <= 10 && this.currentTime >= -10) {
      this.timerDisplay.classList.add('warning');
      this.progressFill.classList.add('warning');
    }
  }

  setupKeyboardControls() {
    // Deshabilitar controles cuando están enfocados en un input
    let isInputFocused = false;

    // Detectar cuando el foco está en un input
    document.addEventListener('focusin', (e) => {
      if (e.target.tagName === 'INPUT' || e.target.tagName === 'TEXTAREA') {
        isInputFocused = true;
      }
    });

    document.addEventListener('focusout', (e) => {
      if (e.target.tagName === 'INPUT' || e.target.tagName === 'TEXTAREA') {
        isInputFocused = false;
      }
    });

    // Agregar indicador visual de ayuda de teclado
    this.showKeyboardHelp();    // Evento principal de teclado
    document.addEventListener('keydown', (e) => {
      // No ejecutar si los controles de teclado están deshabilitados
      if (!this.keyboardControlsEnabled) {
        return;
      }
      
      // No ejecutar si hay un input enfocado o si hay modificadores como Ctrl/Alt
      if (isInputFocused || e.ctrlKey || e.altKey || e.metaKey) {
        return;
      }

      // Prevenir comportamiento por defecto para teclas que manejamos
      const handledKeys = [' ', 'ArrowLeft', 'ArrowRight', 'r', 'R', 'd', 'D', 'c', 'C', 'f', 'F', '1', '2', 'h', 'H', 'ArrowUp', 'ArrowDown', '+', '=', '-', 'Enter', 'Escape'];
      if (handledKeys.includes(e.key)) {
        e.preventDefault();
      }

      switch (e.key) {
        // CONTROLES PRINCIPALES
        case ' ': // Espacio - Iniciar/Pausar/Reanudar
          this.toggleStartPause();
          break;

        case 'ArrowLeft': // Flecha izquierda - Fase anterior
          if (!this.isRunning) {
            this.previousPhase();
          }
          break;

        case 'ArrowRight': // Flecha derecha - Fase siguiente
          if (!this.isRunning) {
            this.nextPhase();
          }
          break;

        case 'r':
        case 'R': // R - Resetear fase actual
          if (!this.isRunning) {
            this.reset();
          }
          break;

        case 'd':
        case 'D': // D - Resetear debate completo
          if (!this.isRunning) {
            this.resetDebate();
          }
          break;

        // CONTROLES DE PANELES
        case 'c':
        case 'C': // C - Abrir/cerrar configuración
          this.toggleConfigPanel();
          break;

        case 'f':
        case 'F': // F - Abrir/cerrar panel de fases
          this.togglePhasesPanel();
          break;

        // CAMBIO DE FORMATO
        case '1': // 1 - Formato académico
          this.switchFormat('academico');
          break;

        case '2': // 2 - Formato British Parliament
          this.switchFormat('bp');
          break;

        // AYUDA
        case 'h':
        case 'H': // H - Mostrar/ocultar ayuda
          this.toggleKeyboardHelp();
          break;

        // NAVEGACIÓN EN BARRA DE PROGRESO
        case 'ArrowUp': // Flecha arriba - Adelantar 10 segundos
          this.adjustTimeKeyboard(10);
          break;

        case 'ArrowDown': // Flecha abajo - Retroceder 10 segundos
          this.adjustTimeKeyboard(-10);
          break;

        case '+':
        case '=': // Más - Adelantar 30 segundos
          this.adjustTimeKeyboard(30);
          break;

        case '-': // Menos - Retroceder 30 segundos
          this.adjustTimeKeyboard(-30);
          break;

        // APLICAR CONFIGURACIÓN
        case 'Enter': // Enter - Aplicar configuración (solo si panel está abierto)
          if (this.configPanel.classList.contains('show')) {
            this.applyConfiguration();
          }
          break;

        // CERRAR PANELES
        case 'Escape': // Escape - Cerrar paneles abiertos
          this.closePanels();
          break;
      }
    });
  }

  adjustTimeKeyboard(seconds) {
    // Solo permitir ajuste si no está corriendo y hay fases
    if (this.isRunning || this.phases.length === 0) {
      return;
    }

    // Calcular nuevo tiempo
    const newTime = this.currentTime + seconds;
    const phase = this.phases[this.currentPhaseIndex];
    
    // Permitir tiempo negativo (hasta -300 segundos) y positivo (hasta duración)
    const minTime = -300;
    const maxTime = phase.duration;
    
    this.currentTime = Math.max(minTime, Math.min(maxTime, newTime));
    
    // Si el cronómetro está pausado, recalcular timestamp
    if (this.isPaused && this.startTimestamp) {
      const timeElapsed = this.totalTime - this.currentTime;
      this.startTimestamp = Date.now() - (timeElapsed * 1000);
    }

    this.updateDisplay();
    this.showTemporaryFeedback(`${seconds > 0 ? '+' : ''}${seconds}s`);
  }

  showTemporaryFeedback(message) {
    // Crear elemento de feedback temporal
    let feedback = document.getElementById('keyboard-feedback');
    if (!feedback) {
      feedback = document.createElement('div');
      feedback.id = 'keyboard-feedback';
      feedback.style.cssText = `
        position: fixed;
        top: 50%;
        left: 50%;
        transform: translate(-50%, -50%);
        background: rgba(44, 62, 80, 0.9);
        color: white;
        padding: 10px 20px;
        border-radius: 20px;
        font-size: 1.1rem;
        font-weight: 600;
        z-index: 10000;
        opacity: 0;
        transition: opacity 0.3s ease;
        pointer-events: none;
      `;
      document.body.appendChild(feedback);
    }

    feedback.textContent = message;
    feedback.style.opacity = '1';

    setTimeout(() => {
      feedback.style.opacity = '0';
    }, 1000);
  }

  closePanels() {
    // Cerrar panel de configuración si está abierto
    if (this.configPanel.classList.contains('show')) {
      this.toggleConfigPanel();
    }

    // Cerrar panel de fases si está abierto
    if (this.phasesPanel.classList.contains('show')) {
      this.togglePhasesPanel();
    }

    // Ocultar ayuda de teclado si está visible
    this.hideKeyboardHelp();
  }
  showKeyboardHelp() {
    // No mostrar si los controles están deshabilitados
    if (!this.keyboardControlsEnabled) return;
    
    // Crear elemento de ayuda de teclado fijo
    if (document.getElementById('keyboard-help-indicator')) return;

    const helpIndicator = document.createElement('div');
    helpIndicator.id = 'keyboard-help-indicator';
    helpIndicator.innerHTML = `
      <div style="font-weight: 600; margin-bottom: 5px;">Controles:</div>
      <div style="font-size: 0.75rem; opacity: 0.8;">Presiona H para ver todos</div>
    `;
    helpIndicator.style.cssText = `
      position: fixed;
      bottom: 20px;
      left: 20px;
      background: rgba(44, 62, 80, 0.9);
      color: white;
      padding: 10px 15px;
      border-radius: 10px;
      font-size: 0.8rem;
      z-index: 1000;
      backdrop-filter: blur(10px);
      border: 1px solid rgba(255, 255, 255, 0.1);
      cursor: pointer;
      transition: all 0.3s ease;
    `;

    helpIndicator.addEventListener('click', () => this.toggleKeyboardHelp());
    helpIndicator.addEventListener('mouseenter', () => {
      helpIndicator.style.background = 'rgba(44, 62, 80, 1)';
      helpIndicator.style.transform = 'translateY(-2px)';
    });
    helpIndicator.addEventListener('mouseleave', () => {
      helpIndicator.style.background = 'rgba(44, 62, 80, 0.9)';
      helpIndicator.style.transform = 'translateY(0)';
    });

    document.body.appendChild(helpIndicator);
  }

  toggleKeyboardHelp() {
    let helpPanel = document.getElementById('keyboard-help-panel');
    
    if (!helpPanel) {
      this.createKeyboardHelpPanel();
    } else {
      helpPanel.style.display = helpPanel.style.display === 'none' ? 'block' : 'none';
    }
  }

  hideKeyboardHelp() {
    const helpPanel = document.getElementById('keyboard-help-panel');
    if (helpPanel) {
      helpPanel.style.display = 'none';
    }
  }

  createKeyboardHelpPanel() {
    const helpPanel = document.createElement('div');
    helpPanel.id = 'keyboard-help-panel';
    helpPanel.innerHTML = `
      <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 15px;">
        <h3 style="margin: 0; color: #2c3e50;">Controles de Teclado</h3>
        <button onclick="this.parentElement.parentElement.style.display='none'" 
                style="background: none; border: none; font-size: 1.5rem; cursor: pointer; color: #7f8c8d;">×</button>
      </div>
      
      <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 15px; font-size: 0.85rem;">
        <div>
          <h4 style="color: #8b5cf6; margin-bottom: 8px;">Cronómetro</h4>
          <div><strong>Espacio:</strong> Iniciar/Pausar/Reanudar</div>
          <div><strong>R:</strong> Resetear fase actual</div>
          <div><strong>D:</strong> Resetear debate completo</div>
          
          <h4 style="color: #8b5cf6; margin: 15px 0 8px 0;">Navegación</h4>
          <div><strong>← →:</strong> Cambiar fase</div>
          <div><strong>↑ ↓:</strong> Ajustar tiempo (±10s)</div>
          <div><strong>+ -:</strong> Ajustar tiempo (±30s)</div>
        </div>
        
        <div>
          <h4 style="color: #8b5cf6; margin-bottom: 8px;">Paneles</h4>
          <div><strong>C:</strong> Configuración</div>
          <div><strong>F:</strong> Panel de fases</div>
          <div><strong>Escape:</strong> Cerrar paneles</div>
          <div><strong>Enter:</strong> Aplicar configuración</div>
          
          <h4 style="color: #8b5cf6; margin: 15px 0 8px 0;">Formatos</h4>
          <div><strong>1:</strong> Formato Académico</div>
          <div><strong>2:</strong> British Parliament</div>
          <div><strong>H:</strong> Mostrar/ocultar ayuda</div>
        </div>
      </div>
      
      <div style="margin-top: 15px; padding-top: 10px; border-top: 1px solid #ecf0f1; font-size: 0.75rem; color: #7f8c8d; text-align: center;">
        Los controles de tiempo solo funcionan cuando el cronómetro está detenido o pausado
      </div>
    `;
    
    helpPanel.style.cssText = `
      position: fixed;
      top: 50%;
      left: 50%;
      transform: translate(-50%, -50%);
      width: 90%;
      max-width: 600px;
      background: rgba(255, 255, 255, 0.98);
      border-radius: 15px;
      padding: 20px;
      box-shadow: 0 20px 60px rgba(0, 0, 0, 0.3);
      backdrop-filter: blur(20px);
      z-index: 10001;
      border: 1px solid rgba(255, 255, 255, 0.2);
    `;

    document.body.appendChild(helpPanel);
  }
  handleProgressBarInteraction(event, optimized = false) {
    // Solo permitir interacción si no está corriendo o si hay un cronómetro pausado
    if (this.phases.length === 0) return;

    const rect = this.progressBar.getBoundingClientRect();
    const clickX = event.clientX - rect.left;
    const progressBarWidth = rect.width;

    // Calcular el porcentaje de progreso (0 a 1)
    let progressPercentage = Math.max(
      0,
      Math.min(1, clickX / progressBarWidth)
    );

    // Calcular el nuevo tiempo basado en el progreso
    const phase = this.phases[this.currentPhaseIndex];
    const newTime = Math.round(
      phase.duration - progressPercentage * phase.duration
    );

    // Actualizar el tiempo actual
    this.currentTime = newTime;
      // Si el cronómetro está corriendo, recalcular el timestamp de inicio
    if (this.isRunning && !this.isPaused && this.startTimestamp) {
      const timeElapsed = this.totalTime - this.currentTime;
      this.startTimestamp = Date.now() - (timeElapsed * 1000);
    }

    // Usar actualización optimizada durante el arrastre para mejor rendimiento
    if (optimized) {
      this.updateDisplayOptimized();
    } else {
      this.updateDisplay();
    }
  }
  adjustTimerSize() {
    const timerContainer = this.timerDisplay.parentElement;
    const containerWidth = timerContainer.offsetWidth - 20; // Margen de seguridad
    const text = this.timerDisplay.textContent;

    // Resetear estilos inline primero para obtener medidas naturales
    this.timerDisplay.style.fontSize = '';
    this.timerDisplay.style.whiteSpace = '';
    this.timerDisplay.style.wordBreak = '';
    this.timerDisplay.style.overflow = '';
    this.timerDisplay.style.letterSpacing = '';

    // Solo aplicar ajustes en pantallas pequeñas
    if (containerWidth < 600) {
      // Considerar texto más largo para tiempo negativo
      const hasNegativeSign = text.includes('-');
      const textLength = text.length;
      const adjustmentFactor = hasNegativeSign ? 1.8 : 2.2; // Menos espacio para negativos

      // Calcular tamaño base considerando el ancho disponible y longitud del texto
      const baseSize = Math.min(
        (containerWidth / textLength) * adjustmentFactor,
        containerWidth * 0.22
      );
      const minSize = Math.max(baseSize * 0.5, 28); // Tamaño mínimo
      const maxSize = Math.min(baseSize, hasNegativeSign ? 100 : 120); // Límite menor para negativos
      this.timerDisplay.style.fontSize = `${Math.max(
        minSize,
        Math.min(maxSize, baseSize)
      )}px`;
      this.timerDisplay.style.whiteSpace = 'normal';
      this.timerDisplay.style.wordBreak = 'break-all';
      this.timerDisplay.style.overflow = 'visible';
      this.timerDisplay.style.letterSpacing = hasNegativeSign
        ? '0.01em'
        : '0.02em';
      this.timerDisplay.style.lineHeight = '1';
      this.timerDisplay.style.textAlign = 'center';
    }
  }
  switchFormat(format) {
    // Solo cambiar si es diferente al formato actual
    if (this.currentFormat === format) return;

    this.currentFormat = format;

    // Detener cronómetro si está funcionando
    if (this.isRunning) {
      clearInterval(this.timer);
      this.isRunning = false;
      this.isPaused = false;
    }
    
    // Resetear timestamps
    this.startTimestamp = null;

    // Actualizar botones activos
    document.querySelectorAll('.format-btn').forEach((btn) => {
      btn.classList.toggle('active', btn.dataset.format === format);
    }); // Mostrar/ocultar secciones de configuración
    this.academicoConfig.classList.toggle('hidden', format !== 'academico');
    this.bpConfig.classList.toggle('hidden', format !== 'bp');
    // Las fases adicionales (Deliberación y Feedback) siempre están visibles
    this.fasesAdicionalesConfig.classList.remove('hidden'); // Reset automático al cambiar formato
    this.currentPhaseIndex = 0;
    this.debateEnded = false;
    this.updateConfiguration();
    this.resetDebate();
  }

  toggleConfigPanel() {
    this.configPanel.classList.toggle('show');
    this.configPanel.classList.toggle('hidden');

    // Cambiar texto del botón
    if (this.configPanel.classList.contains('show')) {
      this.configBtn.textContent = 'Cerrar Configuración';
    } else {
      this.configBtn.textContent = 'Configuración';
    }
  }
  togglePhasesPanel() {
    this.phasesPanel.classList.toggle('show');
    this.phasesPanel.classList.toggle('hidden');

    // Cambiar texto del botón
    if (this.phasesPanel.classList.contains('show')) {
      this.phasesBtn.textContent = 'Cerrar Fases';
    } else {
      this.phasesBtn.textContent = 'Fases';
    }

    // Actualizar la lista de fases cuando se abre
    if (this.phasesPanel.classList.contains('show')) {
      this.updatePhasesList();
    }
  }

  toggleUltimaRefutacionConfig() {
    if (this.ultimaRefutacionDiferente.checked) {
      this.ultimaRefutacionConfig.style.display = 'block';
    } else {
      this.ultimaRefutacionConfig.style.display = 'none';
    }
  }  applyConfiguration() {
    // Actualizar estado de controles de teclado
    this.keyboardControlsEnabled = this.keyboardControlsCheckbox.checked;
    this.updateKeyboardHelpVisibility();
    
    this.saveConfiguration(); // Guardar configuración automáticamente
    this.updateConfiguration();
    this.resetDebate(); // Reset completo después de aplicar configuración
    this.showSaveNotification(); // Mostrar notificación de guardado
    this.toggleConfigPanel(); // Cerrar panel
  }

  showSaveNotification() {
    // Cambiar texto del botón temporalmente para indicar que se guardó
    const originalText = this.applyConfigBtn.textContent;
    this.applyConfigBtn.textContent = 'Configuración Guardada';
    this.applyConfigBtn.style.background = '#2ecc71';

    setTimeout(() => {
      this.applyConfigBtn.textContent = originalText;
      this.applyConfigBtn.style.background = '#27ae60';
    }, 2000);
  }
  updateConfiguration() {
    if (this.currentFormat === 'academico') {
      this.setupAcademicoPhases();
    } else if (this.currentFormat === 'bp') {
      this.setupBPPhases();
    }

    // Inicializar con el tiempo de la primera fase si no hay cronómetro corriendo
    if (!this.isRunning && !this.isPaused && this.phases.length > 0) {
      this.currentTime = this.phases[this.currentPhaseIndex].duration;
      this.totalTime = this.phases[this.currentPhaseIndex].duration;
    }

    this.updateDisplay();

    // Siempre actualizar el panel de fases cuando cambia la configuración
    this.updatePhasesList();

    // Actualizar información del panel si está abierto
    this.updatePhasesHeader();
  }
  setupAcademicoPhases() {
    const intro = parseInt(this.introTime.value); // ya en segundos
    const preguntas = parseInt(this.preguntasTime.value); // ya en segundos
    const refutacion = parseInt(this.refutacionTime.value); // ya en segundos
    const conclusion = parseInt(this.conclusionTime.value); // ya en segundos
    const numRef = parseInt(this.numRefutaciones.value);
    const equipo1 = this.equipo1Name.value.trim() || 'Equipo A';
    const equipo2 = this.equipo2Name.value.trim() || 'Equipo B';
    const tieneUltimaRefDiferente = this.ultimaRefutacionDiferente.checked;
    const ultimaRefutacion = parseInt(this.ultimaRefutacionTime.value);

    this.phases = [
      // Introducciones con preguntas cruzadas
      { name: `Introducción ${equipo1} (a favor)`, duration: intro },
      { name: `Preguntas cruzadas a ${equipo1}`, duration: preguntas },
      { name: `Introducción ${equipo2} (en contra)`, duration: intro },
      { name: `Preguntas cruzadas a ${equipo2}`, duration: preguntas },
      // Refutaciones alternando equipo A y B
      ...Array(numRef)
        .fill(null)
        .flatMap((_, i) => {
          const esUltimaRonda = i === numRef - 1;
          const tiempoAUsar =
            tieneUltimaRefDiferente && esUltimaRonda
              ? ultimaRefutacion
              : refutacion;

          return [
            {
              name: `Refutación ${i + 1} - ${equipo1} (a favor)`,
              duration: tiempoAUsar,
            },
            {
              name: `Refutación ${i + 1} - ${equipo2} (en contra)`,
              duration: tiempoAUsar,
            },
          ];
        }), // Conclusiones (primero B, luego A)
      { name: `Conclusión ${equipo2} (en contra)`, duration: conclusion },
      { name: `Conclusión ${equipo1} (a favor)`, duration: conclusion },
    ];

    // Añadir fases de Deliberación y Feedback al final
    const deliberacionDuration = parseInt(this.deliberacionTime.value) || 1200;
    const deliberacionDesc =
      this.deliberacionDesc.value.trim() || 'Deliberación de jueces';
    const feedbackDuration = parseInt(this.feedbackTime.value) || 900;
    const feedbackDesc = this.feedbackDesc.value.trim() || 'Feedback';

    this.phases.push(
      { name: deliberacionDesc, duration: deliberacionDuration },
      { name: feedbackDesc, duration: feedbackDuration }
    );
  }
  setupBPPhases() {
    const speechDuration = parseInt(this.bpSpeechTime.value); // ya en segundos
    const camaraAltaFavor =
      this.equipoCamaraAltaFavor.value.trim() || 'Equipo A';
    const camaraAltaContra =
      this.equipoCamaraAltaContra.value.trim() || 'Equipo B';
    const camaraBajaFavor =
      this.equipoCamaraBajaFavor.value.trim() || 'Equipo C';
    const camaraBajaContra =
      this.equipoCamaraBajaContra.value.trim() || 'Equipo D';

    this.phases = [
      {
        name: `Primer Ministro (${camaraAltaFavor})`,
        duration: speechDuration,
      },
      {
        name: `Líder de Oposición (${camaraAltaContra})`,
        duration: speechDuration,
      },
      {
        name: `Viceprimer Ministro (${camaraAltaFavor})`,
        duration: speechDuration,
      },
      {
        name: `Vicelíder de Oposición (${camaraAltaContra})`,
        duration: speechDuration,
      },
      {
        name: `Extensión de Gobierno (${camaraBajaFavor})`,
        duration: speechDuration,
      },
      {
        name: `Extensión de la Oposición (${camaraBajaContra})`,
        duration: speechDuration,
      },
      {
        name: `Látigo de Gobierno (${camaraBajaFavor})`,
        duration: speechDuration,
      },
      {
        name: `Látigo de la Oposición (${camaraBajaContra})`,
        duration: speechDuration,
      },
    ];

    // Añadir fases de Deliberación y Feedback al final
    const deliberacionDuration = parseInt(this.deliberacionTime.value) || 1200;
    const deliberacionDesc =
      this.deliberacionDesc.value.trim() || 'Deliberación de jueces';
    const feedbackDuration = parseInt(this.feedbackTime.value) || 900;
    const feedbackDesc = this.feedbackDesc.value.trim() || 'Feedback';

    this.phases.push(
      { name: deliberacionDesc, duration: deliberacionDuration },
      { name: feedbackDesc, duration: feedbackDuration }
    );
  }
  start() {
    if (this.phases.length === 0) return;

    if (!this.isRunning) {
      this.isRunning = true;
      this.isPaused = false;

      if (this.currentTime === 0) {
        this.currentTime = this.phases[this.currentPhaseIndex].duration;
        this.totalTime = this.phases[this.currentPhaseIndex].duration;
      }      // Inicializar timestamp de inicio basado en el tiempo actual
      // Calcular cuánto tiempo ha transcurrido basado en currentTime
      const timeElapsed = this.totalTime - this.currentTime;
      this.startTimestamp = Date.now() - (timeElapsed * 1000);

      this.startTimer();
    }
    this.updateControlButtons();
    this.updatePhasesList(); // Actualizar lista cuando inicia para deshabilitar clicks
    this.showNavigationControls();
  }
  pause() {
    if (this.isRunning && !this.isPaused) {
      this.isPaused = true;
      this.isRunning = false;
      clearInterval(this.timer);
      
      // No necesitamos modificar pausedTime aquí, solo parar el timer
      // El currentTime ya está actualizado correctamente
    } else if (this.isPaused) {
      this.isPaused = false;
      this.isRunning = true;
        // Recalcular timestamp basado en el tiempo actual al reanudar
      const timeElapsed = this.totalTime - this.currentTime;
      this.startTimestamp = Date.now() - (timeElapsed * 1000);
      
      this.startTimer();
    }

    this.updateControlButtons();
    this.updatePhasesList(); // Actualizar lista de fases para hacer clickeables cuando se pausa
  }
  reset() {
    // Parar el cronómetro
    this.isRunning = false;
    this.isPaused = false;
    clearInterval(this.timer);
    
    // Resetear timestamps
    this.startTimestamp = null;    // Solo resetear la fase actual, no cambiar currentPhaseIndex
    if (this.phases.length > 0) {
      this.currentTime = this.phases[this.currentPhaseIndex].duration;
      this.totalTime = this.phases[this.currentPhaseIndex].duration;
    } else {
      this.currentTime = 0;
      this.totalTime = 0;
    }

    this.updateDisplay();
    this.updateControlButtons();
    this.updatePhasesList(); // Actualizar lista de fases al resetear
  }
  resetDebate() {
    // Resetear todo el debate desde el principio
    this.isRunning = false;
    this.isPaused = false;
    this.currentTime = 0;
    this.totalTime = 0;
    this.currentPhaseIndex = 0;
    this.debateEnded = false;
    
    // Resetear timestamps
    this.startTimestamp = null;

    clearInterval(this.timer);

    if (this.phases.length > 0) {
      this.currentTime = this.phases[0].duration;
      this.totalTime = this.phases[0].duration;
    }
    this.updateDisplay();
    this.updateControlButtons();
    this.updatePhasesList(); // Actualizar lista de fases al resetear debate
    this.hideNavigationControls();
  }
  previousPhase() {
    // No permitir cambio si el cronómetro está funcionando
    if (this.isRunning) {
      return;
    }

    // Si el debate había terminado, volver a la última fase
    if (this.debateEnded) {
      this.debateEnded = false;
      this.currentPhaseIndex = this.phases.length - 1;
      this.loadCurrentPhase();
      return;
    }

    if (this.currentPhaseIndex > 0) {
      this.currentPhaseIndex--;
      this.loadCurrentPhase();
    }
  }

  nextPhase() {
    // No permitir cambio si el cronómetro está funcionando
    if (this.isRunning) {
      return;
    }

    if (this.currentPhaseIndex < this.phases.length - 1) {
      this.currentPhaseIndex++;
      this.loadCurrentPhase();
    } else {
      // Debate terminado
      this.showDebateEnd();
    }
  }
  loadCurrentPhase() {
    if (this.phases.length === 0) return;

    const phase = this.phases[this.currentPhaseIndex];
    this.currentTime = phase.duration;
    this.totalTime = phase.duration;
    this.debateEnded = false;
    
    // Resetear estados del cronómetro al cambiar de fase
    this.isRunning = false;
    this.isPaused = false;
    this.startTimestamp = null;

    // NO iniciar automáticamente el cronómetro, solo cargar la fase
    // El usuario debe presionar "Iniciar" manualmente

    this.updateDisplay();
    this.updateControlButtons(); // Actualizar botones para mostrar "Iniciar"
    this.updatePhasesList(); // Actualizar lista al cambiar de fase
  }
  startTimer() {
    this.timer = setInterval(() => {
      // Usar sincronización por tiempo real como método principal
      if (this.startTimestamp) {
        const currentTimestamp = Date.now();
        const realTimeElapsed = Math.floor((currentTimestamp - this.startTimestamp) / 1000);
        this.currentTime = this.totalTime - realTimeElapsed;
      } else {
        // Fallback al método tradicional si no hay timestamp
        this.currentTime--;
      }

      // Continuar contando en negativo, no parar en 0
      this.updateDisplay();
    }, 1000);
  }
  handleTimeUp() {
    // Este método ya no se usa - el timer continúa en negativo
    // Sin sonido ni notificaciones
  }
  updateDisplay() {
    if (this.phases.length === 0) {
      this.currentSpeakerDisplay.textContent = 'Configura el formato de debate';
      this.timerDisplay.textContent = '00:00';
      this.progressFill.style.width = '0%';
      this.adjustTimerSize();
      return;
    }

    const phase = this.phases[this.currentPhaseIndex];
    this.currentSpeakerDisplay.textContent = phase.name; // Formatear tiempo
    const minutes = Math.floor(Math.abs(this.currentTime) / 60);
    const seconds = Math.abs(this.currentTime) % 60;
    const timeString = `${this.currentTime < 0 ? '-' : ''}${minutes
      .toString()
      .padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`;

    // Solo ajustar tamaño al inicio o cuando cambia de positivo a negativo (no en cada segundo)
    const previousTimeString =
      this.timerDisplay.getAttribute('data-prev-time') || '';
    const hasSignChange =
      previousTimeString.includes('-') !== timeString.includes('-');
    if (hasSignChange || !previousTimeString) {
      this.adjustTimerSize();
    }

    this.timerDisplay.textContent = timeString;
    this.timerDisplay.setAttribute('data-prev-time', timeString);

    // Actualizar barra de progreso
    const progress = Math.max(
      0,
      ((this.totalTime - this.currentTime) / this.totalTime) * 100
    );
    this.progressFill.style.width = `${progress}%`; // Cambiar colores según el tiempo restante
    this.timerDisplay.className = 'timer';
    this.progressFill.className = 'progress-fill';    // Amarillo: desde 10 segundos hasta -10 segundos
    // Rojo: a partir de -11 segundos
    if (this.currentTime <= -11) {
      this.timerDisplay.classList.add('danger');
      this.progressFill.classList.add('danger');
    } else if (this.currentTime <= 10 && this.currentTime >= -10) {
      this.timerDisplay.classList.add('warning');
      this.progressFill.classList.add('warning');
    }

    // Solo actualizar encabezado de fases, no la lista completa cada segundo
    this.updatePhasesHeader();
  }  updateControlButtons() {
    // Manejar el botón unificado de iniciar/pausar/reanudar
    this.startPauseBtn.disabled = false; // Siempre habilitado
    
    // Resetear clases CSS
    this.startPauseBtn.className = 'control-btn';
    
    if (!this.isRunning && !this.isPaused) {
      // Estado: Parado - Mostrar "Iniciar" con fondo azul
      this.startPauseBtn.textContent = 'Iniciar';
      this.startPauseBtn.classList.add('start');
    } else if (this.isRunning && !this.isPaused) {
      // Estado: Corriendo - Mostrar "Pausar" con fondo amarillo
      this.startPauseBtn.textContent = 'Pausar';
      this.startPauseBtn.classList.add('pause');
    } else if (this.isPaused) {
      // Estado: Pausado - Mostrar "Reanudar" con fondo amarillo
      this.startPauseBtn.textContent = 'Reanudar';
      this.startPauseBtn.classList.add('pause');
    }

    // Deshabilitar botones de navegación mientras el timer está corriendo
    this.prevBtn.disabled = this.isRunning;
    this.nextBtn.disabled = this.isRunning;

    // Deshabilitar botones de reset mientras el timer está corriendo
    this.resetBtn.disabled = this.isRunning;
    this.resetDebateBtn.disabled = this.isRunning;
  }
  showNavigationControls() {
    this.navigationControls.classList.remove('hidden');
  }

  hideNavigationControls() {
    this.navigationControls.classList.add('hidden');
  }
  showDebateEnd() {
    this.currentSpeakerDisplay.textContent = '¡Debate terminado!';
    this.timerDisplay.textContent = '00:00';
    this.progressFill.style.width = '100%';
    this.isRunning = false;
    this.isPaused = false;
    this.debateEnded = true;
    clearInterval(this.timer);
    this.updateControlButtons();
    this.updatePhasesList(); // Actualizar lista cuando termina el debate
  }
  updatePhasesList() {
    if (!this.phasesList) return;

    // Limpiar lista actual
    this.phasesList.innerHTML = '';

    // Generar items para cada fase
    this.phases.forEach((phase, index) => {
      const phaseItem = document.createElement('div');
      phaseItem.className = 'phase-item';

      // Determinar estado de la fase
      let status = '';
      let statusEmoji = '';

      if (index < this.currentPhaseIndex) {
        phaseItem.classList.add('completed');
        statusEmoji = '✅';
        status = 'completed';
      } else if (index === this.currentPhaseIndex) {
        phaseItem.classList.add('current');
        statusEmoji = '🔄';
        status = 'current';
      } else {
        phaseItem.classList.add('pending');
        statusEmoji = '⚪';
        status = 'pending';
      }

      // Hacer clickeable solo si el timer no está corriendo
      if (!this.isRunning) {
        phaseItem.classList.add('clickable');
        phaseItem.addEventListener('click', () => this.jumpToPhase(index));
      }

      phaseItem.innerHTML = `
                <span class="phase-name">${phase.name}</span>
                <span class="phase-status">${statusEmoji}</span>
            `;

      this.phasesList.appendChild(phaseItem);
    });
  }

  updatePhasesHeader() {
    if (!this.currentPhaseDisplay || !this.phaseCounterDisplay) return;

    if (this.phases.length === 0) {
      this.currentPhaseDisplay.textContent = 'Configura el formato de debate';
      this.phaseCounterDisplay.textContent = '0 / 0';
    } else {
      const currentPhase = this.phases[this.currentPhaseIndex];
      this.currentPhaseDisplay.textContent = currentPhase
        ? currentPhase.name
        : 'Listo para comenzar';
      this.phaseCounterDisplay.textContent = `${this.currentPhaseIndex + 1} / ${
        this.phases.length
      }`;
    }
  }
  jumpToPhase(phaseIndex) {
    // No permitir salto si el cronómetro está funcionando
    if (this.isRunning) {
      return;
    }

    // Validar que el índice sea válido
    if (phaseIndex < 0 || phaseIndex >= this.phases.length) {
      return;
    }

    // Cambiar a la fase seleccionada
    this.currentPhaseIndex = phaseIndex;
    this.debateEnded = false;
    this.loadCurrentPhase();

    // Actualizar visualización
    this.updateDisplay();
    this.updateControlButtons();
  }

  saveConfiguration() {
    const config = {
      currentFormat: 
      this.currentFormat,
      keyboardControlsEnabled: 
      this.keyboardControlsEnabled, // Añadido: configuración de controles de teclado
      academico: {
        introTime: this.introTime.value,
        preguntasTime: this.preguntasTime.value,
        refutacionTime: this.refutacionTime.value,
        conclusionTime: this.conclusionTime.value,
        numRefutaciones: this.numRefutaciones.value,
        equipo1Name: this.equipo1Name.value,
        equipo2Name: this.equipo2Name.value,
        ultimaRefutacionDiferente: this.ultimaRefutacionDiferente.checked,
        ultimaRefutacionTime: this.ultimaRefutacionTime.value,
      },
      bp: {
        speechTime: this.bpSpeechTime.value,
        camaraAltaFavor: this.equipoCamaraAltaFavor.value,
        camaraAltaContra: this.equipoCamaraAltaContra.value,
        camaraBajaFavor: this.equipoCamaraBajaFavor.value,
        camaraBajaContra: this.equipoCamaraBajaContra.value,
      },
      deliberacion: {
        time: this.deliberacionTime.value,
        description: this.deliberacionDesc.value,
      },
      feedback: {
        time: this.feedbackTime.value,
        description: this.feedbackDesc.value,
      },
    };

    try {
      localStorage.setItem('ada-debate-config', JSON.stringify(config));
      console.log('Configuración guardada correctamente');
    } catch (error) {
      console.error('Error al guardar configuración:', error);
    }
  }

  loadConfiguration() {
    try {
      const savedConfig = localStorage.getItem('ada-debate-config');
      if (!savedConfig) return; // No hay configuración guardada

      const config = JSON.parse(savedConfig);      // Cargar formato
      this.currentFormat = config.currentFormat || 'academico';
        // Cargar configuración de controles de teclado
      this.keyboardControlsEnabled = config.keyboardControlsEnabled !== undefined ? config.keyboardControlsEnabled : true;
      
      // Actualizar checkbox en la interfaz
      if (this.keyboardControlsCheckbox) {
        this.keyboardControlsCheckbox.checked = this.keyboardControlsEnabled;
      }
      
      // Actualizar visibilidad del indicador de ayuda
      this.updateKeyboardHelpVisibility();

      // Cargar configuración académico
      if (config.academico) {
        this.introTime.value = config.academico.introTime || 240;
        this.preguntasTime.value = config.academico.preguntasTime || 120;
        this.refutacionTime.value = config.academico.refutacionTime || 300;
        this.conclusionTime.value = config.academico.conclusionTime || 180;
        this.numRefutaciones.value = config.academico.numRefutaciones || 2;
        this.equipo1Name.value = config.academico.equipo1Name || 'Equipo A';
        this.equipo2Name.value = config.academico.equipo2Name || 'Equipo B';
        this.ultimaRefutacionDiferente.checked =
          config.academico.ultimaRefutacionDiferente || false;
        this.ultimaRefutacionTime.value =
          config.academico.ultimaRefutacionTime || 90;
      }
      // Cargar configuración BP
      if (config.bp) {
        this.bpSpeechTime.value = config.bp.speechTime || 420;
        this.equipoCamaraAltaFavor.value =
          config.bp.camaraAltaFavor || 'Equipo A';
        this.equipoCamaraAltaContra.value =
          config.bp.camaraAltaContra || 'Equipo B';
        this.equipoCamaraBajaFavor.value =
          config.bp.camaraBajaFavor || 'Equipo C';
        this.equipoCamaraBajaContra.value =
          config.bp.camaraBajaContra || 'Equipo D';
      }
      // Cargar configuración Deliberación
      if (config.deliberacion) {
        this.deliberacionTime.value = config.deliberacion.time || 1200;
        this.deliberacionDesc.value =
          config.deliberacion.description || 'Deliberación de jueces';
      }

      // Cargar configuración Feedback
      if (config.feedback) {
        this.feedbackTime.value = config.feedback.time || 900;
        this.feedbackDesc.value = config.feedback.description || 'Feedback';
      }

      // Actualizar UI de formato
      document.querySelectorAll('.format-btn').forEach((btn) => {
        btn.classList.toggle(
          'active',
          btn.dataset.format === this.currentFormat
        );
      }); // Mostrar/ocultar secciones de configuración
      this.academicoConfig.classList.toggle(
        'hidden',
        this.currentFormat !== 'academico'
      );
      this.bpConfig.classList.toggle('hidden', this.currentFormat !== 'bp');
      // Las fases adicionales siempre están visibles
      this.fasesAdicionalesConfig.classList.remove('hidden');

      // Actualizar checkbox de última refutación
      this.toggleUltimaRefutacionConfig();

      console.log('Configuración cargada correctamente');
    } catch (error) {
      console.error('Error al cargar configuración:', error);
    }
  }

  resetToDefaults() {
    // Resetear valores por defecto
    this.introTime.value = 240;
    this.preguntasTime.value = 120;
    this.refutacionTime.value = 300;
    this.conclusionTime.value = 180;
    this.numRefutaciones.value = 2;
    this.equipo1Name.value = 'Equipo A';
    this.equipo2Name.value = 'Equipo B';
    this.ultimaRefutacionDiferente.checked = false;
    this.ultimaRefutacionTime.value = 90;
    this.bpSpeechTime.value = 420;
    this.equipoCamaraAltaFavor.value = 'Equipo A';
    this.equipoCamaraAltaContra.value = 'Equipo B';
    this.equipoCamaraBajaFavor.value = 'Equipo C';
    this.equipoCamaraBajaContra.value = 'Equipo D';
    this.deliberacionTime.value = 1200;
    this.deliberacionDesc.value = 'Deliberación de jueces';    this.feedbackTime.value = 900;
    this.feedbackDesc.value = 'Feedback';

    // Resetear configuración de controles de teclado
    // En móvil (≤768px) desactivar por defecto, en desktop activar
    const isMobile = window.innerWidth <= 768;
    this.keyboardControlsEnabled = !isMobile;
    if (this.keyboardControlsCheckbox) {
      this.keyboardControlsCheckbox.checked = this.keyboardControlsEnabled;
    }
    this.updateKeyboardHelpVisibility();

    this.toggleUltimaRefutacionConfig();

    // Eliminar configuración guardada
    localStorage.removeItem('ada-debate-config');
    console.log('Configuración reseteada a valores por defecto');
  }

  toggleStartPause() {
    if (!this.isRunning && !this.isPaused) {
      this.start();
  } else if (this.isRunning) {
      this.pause();
    } else if (this.isPaused) {
      this.pause(); // Resume
    }
  }

  // Función para activar/desactivar controles de teclado
  toggleKeyboardControls() {
    this.keyboardControlsEnabled = this.keyboardControlsCheckbox.checked;
    this.updateKeyboardHelpVisibility();
    
    // Mostrar feedback al usuario
    const message = this.keyboardControlsEnabled ? 
      'Controles de teclado activados' : 
      'Controles de teclado desactivados';
    this.showTemporaryFeedback(message);
  }

  // Función para actualizar la visibilidad del indicador de ayuda
  updateKeyboardHelpVisibility() {
    const helpIndicator = document.getElementById('keyboard-help-indicator');
    if (helpIndicator) {
      helpIndicator.style.display = this.keyboardControlsEnabled ? 'block' : 'none';
    }
  }
}

// Inicializar cuando el DOM esté listo
document.addEventListener('DOMContentLoaded', () => {
  window.debateTimer = new DebateTimer();
});
