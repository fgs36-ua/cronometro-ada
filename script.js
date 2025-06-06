class DebateTimer {
    constructor() {
        this.currentFormat = 'academico';
        this.isRunning = false;
        this.isPaused = false;
        this.currentTime = 0;
        this.totalTime = 0;
        this.currentPhaseIndex = 0;
        this.phases = [];
        this.timer = null;
        this.debateEnded = false;

        this.initializeElements();
        this.setupEventListeners();
        this.loadConfiguration(); // Cargar configuración guardada
        this.updateConfiguration();
    }    initializeElements() {
        // Elementos del DOM
        this.timerDisplay = document.getElementById('timer');
        this.currentSpeakerDisplay = document.getElementById('current-speaker');
        this.progressFill = document.getElementById('progress-fill');
        this.progressBar = document.querySelector('.progress-bar');        this.startBtn = document.getElementById('start-btn');
        this.pauseBtn = document.getElementById('pause-btn');
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
        this.applyConfigBtn = document.getElementById('apply-config-btn');        // Secciones de configuración
        this.academicoConfig = document.getElementById('academico-config');
        this.bpConfig = document.getElementById('bp-config');
        this.fasesAdicionalesConfig = document.getElementById('fases-adicionales-config');// Inputs de configuración académico
        this.introTime = document.getElementById('intro-time');
        this.preguntasTime = document.getElementById('preguntas-time');
        this.refutacionTime = document.getElementById('refutacion-time');
        this.conclusionTime = document.getElementById('conclusion-time');
        this.numRefutaciones = document.getElementById('num-refutaciones');
        this.equipo1Name = document.getElementById('equipo1-name');
        this.equipo2Name = document.getElementById('equipo2-name');
        this.ultimaRefutacionDiferente = document.getElementById('ultima-refutacion-diferente');
        this.ultimaRefutacionTime = document.getElementById('ultima-refutacion-time');
        this.ultimaRefutacionConfig = document.getElementById('ultima-refutacion-config');        // Inputs de configuración BP
        this.bpSpeechTime = document.getElementById('bp-speech-time');
        this.equipoCamaraAltaFavor = document.getElementById('equipo-camara-alta-favor');
        this.equipoCamaraAltaContra = document.getElementById('equipo-camara-alta-contra');
        this.equipoCamaraBajaFavor = document.getElementById('equipo-camara-baja-favor');
        this.equipoCamaraBajaContra = document.getElementById('equipo-camara-baja-contra');        // Inputs de configuración Deliberación y Feedback
        this.deliberacionTime = document.getElementById('deliberacion-time');
        this.deliberacionDesc = document.getElementById('deliberacion-desc');
        this.feedbackTime = document.getElementById('feedback-time');
        this.feedbackDesc = document.getElementById('feedback-desc');
    }    setupEventListeners() {
        // Selector de formato
        document.querySelectorAll('.format-btn').forEach(btn => {
            btn.addEventListener('click', (e) => {
                this.switchFormat(e.target.dataset.format);
            });
        });        // Panel de configuración
        this.configBtn.addEventListener('click', () => this.toggleConfigPanel());
        this.applyConfigBtn.addEventListener('click', () => this.applyConfiguration());
        
        // Botón para resetear a valores por defecto
        this.resetDefaultsBtn = document.getElementById('reset-defaults-btn');
        this.resetDefaultsBtn.addEventListener('click', () => this.resetToDefaults());

        // Checkbox para última refutación diferente
        this.ultimaRefutacionDiferente.addEventListener('change', () => this.toggleUltimaRefutacionConfig());

        // Panel de fases
        this.phasesBtn.addEventListener('click', () => this.togglePhasesPanel());

        // Controles del cronómetro
        this.startBtn.addEventListener('click', () => this.start());
        this.pauseBtn.addEventListener('click', () => this.pause());
        this.resetBtn.addEventListener('click', () => this.reset());
        this.resetDebateBtn.addEventListener('click', () => this.resetDebate());
        this.prevBtn.addEventListener('click', () => this.previousPhase());
        this.nextBtn.addEventListener('click', () => this.nextPhase());
          // Listener para ajustar el tamaño del cronómetro en pantallas pequeñas
        window.addEventListener('resize', () => this.adjustTimerSize());
        
        // Event listeners para la barra de progreso interactiva
        this.setupProgressBarInteraction();
    }    setupProgressBarInteraction() {
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
            let progressPercentage = Math.max(0, Math.min(1, clickX / progressBarWidth));
            
            const phase = this.phases[this.currentPhaseIndex];
            const previewTime = Math.round(phase.duration - (progressPercentage * phase.duration));
            
            const minutes = Math.floor(Math.abs(previewTime) / 60);
            const seconds = Math.abs(previewTime) % 60;
            const timeString = `${previewTime < 0 ? '-' : ''}${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`;
            
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
    }    handleProgressBarInteraction(event, optimized = false) {
        // Solo permitir interacción si no está corriendo o si hay un cronómetro pausado
        if (this.phases.length === 0) return;
        
        const rect = this.progressBar.getBoundingClientRect();
        const clickX = event.clientX - rect.left;
        const progressBarWidth = rect.width;
        
        // Calcular el porcentaje de progreso (0 a 1)
        let progressPercentage = Math.max(0, Math.min(1, clickX / progressBarWidth));
        
        // Calcular el nuevo tiempo basado en el progreso
        const phase = this.phases[this.currentPhaseIndex];
        const newTime = Math.round(phase.duration - (progressPercentage * phase.duration));
        
        // Actualizar el tiempo actual
        this.currentTime = newTime;
        
        // Usar actualización optimizada durante el arrastre para mejor rendimiento
        if (optimized) {
            this.updateDisplayOptimized();
        } else {
            this.updateDisplay();
        }
    }    adjustTimerSize() {
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
            const baseSize = Math.min(containerWidth / textLength * adjustmentFactor, containerWidth * 0.22);
            const minSize = Math.max(baseSize * 0.5, 28); // Tamaño mínimo
            const maxSize = Math.min(baseSize, hasNegativeSign ? 100 : 120); // Límite menor para negativos
              this.timerDisplay.style.fontSize = `${Math.max(minSize, Math.min(maxSize, baseSize))}px`;
            this.timerDisplay.style.whiteSpace = 'normal';
            this.timerDisplay.style.wordBreak = 'break-all';
            this.timerDisplay.style.overflow = 'visible';
            this.timerDisplay.style.letterSpacing = hasNegativeSign ? '0.01em' : '0.02em';
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
        
        // Actualizar botones activos
        document.querySelectorAll('.format-btn').forEach(btn => {
            btn.classList.toggle('active', btn.dataset.format === format);
        });        // Mostrar/ocultar secciones de configuración
        this.academicoConfig.classList.toggle('hidden', format !== 'academico');
        this.bpConfig.classList.toggle('hidden', format !== 'bp');
        // Las fases adicionales (Deliberación y Feedback) siempre están visibles
        this.fasesAdicionalesConfig.classList.remove('hidden');// Reset automático al cambiar formato
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
    }    togglePhasesPanel() {
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
    }    applyConfiguration() {
        this.saveConfiguration(); // Guardar configuración automáticamente
        this.updateConfiguration();
        this.resetDebate(); // Reset completo después de aplicar configuración
        this.showSaveNotification(); // Mostrar notificación de guardado
        this.toggleConfigPanel(); // Cerrar panel
    }

    showSaveNotification() {
        // Cambiar texto del botón temporalmente para indicar que se guardó
        const originalText = this.applyConfigBtn.textContent;
        this.applyConfigBtn.textContent = '✅ Configuración Guardada';
        this.applyConfigBtn.style.background = '#2ecc71';
        
        setTimeout(() => {
            this.applyConfigBtn.textContent = originalText;
            this.applyConfigBtn.style.background = '#27ae60';
        }, 2000);
    }    updateConfiguration() {
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
    }setupAcademicoPhases() {
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
            ...Array(numRef).fill(null).flatMap((_, i) => {
                const esUltimaRonda = (i === numRef - 1);
                const tiempoAUsar = (tieneUltimaRefDiferente && esUltimaRonda) ? ultimaRefutacion : refutacion;
                
                return [
                    { name: `Refutación ${i + 1} - ${equipo1} (a favor)`, duration: tiempoAUsar },
                    { name: `Refutación ${i + 1} - ${equipo2} (en contra)`, duration: tiempoAUsar }
                ];
            }),        // Conclusiones (primero B, luego A)
            { name: `Conclusión ${equipo2} (en contra)`, duration: conclusion },
            { name: `Conclusión ${equipo1} (a favor)`, duration: conclusion }
        ];

        // Añadir fases de Deliberación y Feedback al final
        const deliberacionDuration = parseInt(this.deliberacionTime.value) || 1200;
        const deliberacionDesc = this.deliberacionDesc.value.trim() || 'Deliberación de jueces';
        const feedbackDuration = parseInt(this.feedbackTime.value) || 900;
        const feedbackDesc = this.feedbackDesc.value.trim() || 'Feedback';

        this.phases.push(
            { name: deliberacionDesc, duration: deliberacionDuration },
            { name: feedbackDesc, duration: feedbackDuration }
        );
    }setupBPPhases() {
        const speechDuration = parseInt(this.bpSpeechTime.value); // ya en segundos
        const camaraAltaFavor = this.equipoCamaraAltaFavor.value.trim() || 'Equipo A';
        const camaraAltaContra = this.equipoCamaraAltaContra.value.trim() || 'Equipo B';
        const camaraBajaFavor = this.equipoCamaraBajaFavor.value.trim() || 'Equipo C';
        const camaraBajaContra = this.equipoCamaraBajaContra.value.trim() || 'Equipo D';
        
        this.phases = [
            { name: `Primer Ministro (${camaraAltaFavor})`, duration: speechDuration },
            { name: `Líder de Oposición (${camaraAltaContra})`, duration: speechDuration },
            { name: `Viceprimer Ministro (${camaraAltaFavor})`, duration: speechDuration },
            { name: `Vicelíder de Oposición (${camaraAltaContra})`, duration: speechDuration },
            { name: `Extensión de Gobierno (${camaraBajaFavor})`, duration: speechDuration },
            { name: `Extensión de la Oposición (${camaraBajaContra})`, duration: speechDuration },            { name: `Látigo de Gobierno (${camaraBajaFavor})`, duration: speechDuration },
            { name: `Látigo de la Oposición (${camaraBajaContra})`, duration: speechDuration }
        ];

        // Añadir fases de Deliberación y Feedback al final
        const deliberacionDuration = parseInt(this.deliberacionTime.value) || 1200;
        const deliberacionDesc = this.deliberacionDesc.value.trim() || 'Deliberación de jueces';
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
            }
            
            this.startTimer();
        }

        this.updateControlButtons();
        this.showNavigationControls();
    }

    pause() {
        if (this.isRunning && !this.isPaused) {
            this.isPaused = true;
            this.isRunning = false;
            clearInterval(this.timer);
        } else if (this.isPaused) {
            this.isPaused = false;
            this.isRunning = true;
            this.startTimer();
        }

        this.updateControlButtons();
    }    reset() {
        // Parar el cronómetro
        this.isRunning = false;
        this.isPaused = false;
        clearInterval(this.timer);
        
        // Solo resetear la fase actual, no cambiar currentPhaseIndex
        if (this.phases.length > 0) {
            this.currentTime = this.phases[this.currentPhaseIndex].duration;
            this.totalTime = this.phases[this.currentPhaseIndex].duration;
        } else {
            this.currentTime = 0;
            this.totalTime = 0;
        }

        this.updateDisplay();
        this.updateControlButtons();
    }    resetDebate() {
        // Resetear todo el debate desde el principio
        this.isRunning = false;
        this.isPaused = false;
        this.currentTime = 0;
        this.totalTime = 0;
        this.currentPhaseIndex = 0;
        this.debateEnded = false;
        
        clearInterval(this.timer);
        
        if (this.phases.length > 0) {
            this.currentTime = this.phases[0].duration;
            this.totalTime = this.phases[0].duration;
        }

        this.updateDisplay();
        this.updateControlButtons();
        this.hideNavigationControls();
    }previousPhase() {
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
    }    loadCurrentPhase() {
        if (this.phases.length === 0) return;

        const phase = this.phases[this.currentPhaseIndex];
        this.currentTime = phase.duration;
        this.totalTime = phase.duration;
        this.debateEnded = false;
        
        // NO iniciar automáticamente el cronómetro, solo cargar la fase
        // El usuario debe presionar "Iniciar" manualmente
        
        this.updateDisplay();
    }startTimer() {
        this.timer = setInterval(() => {
            this.currentTime--;
            
            // Continuar contando en negativo, no parar en 0
            this.updateDisplay();
        }, 1000);
    }    handleTimeUp() {
        // Este método ya no se usa - el timer continúa en negativo
        // Sin sonido ni notificaciones
    }updateDisplay() {
        if (this.phases.length === 0) {
            this.currentSpeakerDisplay.textContent = 'Configura el formato de debate';
            this.timerDisplay.textContent = '00:00';
            this.progressFill.style.width = '0%';
            this.adjustTimerSize();
            return;
        }

        const phase = this.phases[this.currentPhaseIndex];
        this.currentSpeakerDisplay.textContent = phase.name;        // Formatear tiempo
        const minutes = Math.floor(Math.abs(this.currentTime) / 60);
        const seconds = Math.abs(this.currentTime) % 60;
        const timeString = `${this.currentTime < 0 ? '-' : ''}${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`;
        
        // Solo ajustar tamaño al inicio o cuando cambia de positivo a negativo (no en cada segundo)
        const previousTimeString = this.timerDisplay.getAttribute('data-prev-time') || '';
        const hasSignChange = (previousTimeString.includes('-')) !== (timeString.includes('-'));
        if (hasSignChange || !previousTimeString) {
            this.adjustTimerSize();
        }
        
        this.timerDisplay.textContent = timeString;
        this.timerDisplay.setAttribute('data-prev-time', timeString);

        // Actualizar barra de progreso
        const progress = Math.max(0, (this.totalTime - this.currentTime) / this.totalTime * 100);
        this.progressFill.style.width = `${progress}%`;        // Cambiar colores según el tiempo restante
        this.timerDisplay.className = 'timer';
        this.progressFill.className = 'progress-fill';

        // Amarillo: desde 10 segundos hasta -10 segundos
        // Rojo: a partir de -11 segundos
        if (this.currentTime <= -11) {
            this.timerDisplay.classList.add('danger');
            this.progressFill.classList.add('danger');
        } else if (this.currentTime <= 10 && this.currentTime >= -10) {
            this.timerDisplay.classList.add('warning');
            this.progressFill.classList.add('warning');
        }

        // Actualizar panel de fases siempre
        this.updatePhasesList();
        this.updatePhasesHeader();
    }updateControlButtons() {
        // Deshabilitar botones de inicio y pausa según el estado
        this.startBtn.disabled = this.isRunning && !this.isPaused;
        this.pauseBtn.disabled = !this.isRunning && !this.isPaused;
        
        // Deshabilitar botones de navegación mientras el timer está corriendo
        this.prevBtn.disabled = this.isRunning;
        this.nextBtn.disabled = this.isRunning;
        
        if (this.isPaused) {
            this.pauseBtn.textContent = 'Reanudar';
        } else {
            this.pauseBtn.textContent = 'Pausar';
        }
    }    showNavigationControls() {
        this.navigationControls.classList.remove('hidden');
    }

    hideNavigationControls() {
        this.navigationControls.classList.add('hidden');
    }    showDebateEnd() {
        this.currentSpeakerDisplay.textContent = '¡Debate terminado!';
        this.timerDisplay.textContent = '00:00';
        this.progressFill.style.width = '100%';
        this.isRunning = false;
        this.isPaused = false;
        this.debateEnded = true;
        clearInterval(this.timer);
        this.updateControlButtons();
    }updatePhasesList() {
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
            this.currentPhaseDisplay.textContent = currentPhase ? currentPhase.name : 'Listo para comenzar';
            this.phaseCounterDisplay.textContent = `${this.currentPhaseIndex + 1} / ${this.phases.length}`;
        }
    }    jumpToPhase(phaseIndex) {
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
            currentFormat: this.currentFormat,
            academico: {
                introTime: this.introTime.value,
                preguntasTime: this.preguntasTime.value,
                refutacionTime: this.refutacionTime.value,
                conclusionTime: this.conclusionTime.value,
                numRefutaciones: this.numRefutaciones.value,
                equipo1Name: this.equipo1Name.value,
                equipo2Name: this.equipo2Name.value,
                ultimaRefutacionDiferente: this.ultimaRefutacionDiferente.checked,
                ultimaRefutacionTime: this.ultimaRefutacionTime.value
            },            bp: {
                speechTime: this.bpSpeechTime.value,
                camaraAltaFavor: this.equipoCamaraAltaFavor.value,
                camaraAltaContra: this.equipoCamaraAltaContra.value,
                camaraBajaFavor: this.equipoCamaraBajaFavor.value,
                camaraBajaContra: this.equipoCamaraBajaContra.value
            },            deliberacion: {
                time: this.deliberacionTime.value,
                description: this.deliberacionDesc.value
            },
            feedback: {
                time: this.feedbackTime.value,
                description: this.feedbackDesc.value
            }
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

            const config = JSON.parse(savedConfig);
            
            // Cargar formato
            this.currentFormat = config.currentFormat || 'academico';
            
            // Cargar configuración académico
            if (config.academico) {
                this.introTime.value = config.academico.introTime || 240;
                this.preguntasTime.value = config.academico.preguntasTime || 120;
                this.refutacionTime.value = config.academico.refutacionTime || 300;
                this.conclusionTime.value = config.academico.conclusionTime || 180;
                this.numRefutaciones.value = config.academico.numRefutaciones || 2;
                this.equipo1Name.value = config.academico.equipo1Name || 'Equipo A';
                this.equipo2Name.value = config.academico.equipo2Name || 'Equipo B';
                this.ultimaRefutacionDiferente.checked = config.academico.ultimaRefutacionDiferente || false;
                this.ultimaRefutacionTime.value = config.academico.ultimaRefutacionTime || 90;
            }
              // Cargar configuración BP
            if (config.bp) {
                this.bpSpeechTime.value = config.bp.speechTime || 420;
                this.equipoCamaraAltaFavor.value = config.bp.camaraAltaFavor || 'Equipo A';
                this.equipoCamaraAltaContra.value = config.bp.camaraAltaContra || 'Equipo B';
                this.equipoCamaraBajaFavor.value = config.bp.camaraBajaFavor || 'Equipo C';
                this.equipoCamaraBajaContra.value = config.bp.camaraBajaContra || 'Equipo D';
            }
              // Cargar configuración Deliberación
            if (config.deliberacion) {
                this.deliberacionTime.value = config.deliberacion.time || 1200;
                this.deliberacionDesc.value = config.deliberacion.description || 'Deliberación de jueces';
            }
            
            // Cargar configuración Feedback
            if (config.feedback) {
                this.feedbackTime.value = config.feedback.time || 900;
                this.feedbackDesc.value = config.feedback.description || 'Feedback';
            }
            
            // Actualizar UI de formato
            document.querySelectorAll('.format-btn').forEach(btn => {
                btn.classList.toggle('active', btn.dataset.format === this.currentFormat);
            });              // Mostrar/ocultar secciones de configuración
            this.academicoConfig.classList.toggle('hidden', this.currentFormat !== 'academico');
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
        this.deliberacionDesc.value = 'Deliberación de jueces';
        
        this.feedbackTime.value = 900;
        this.feedbackDesc.value = 'Feedback';
        
        this.toggleUltimaRefutacionConfig();
        
        // Eliminar configuración guardada
        localStorage.removeItem('ada-debate-config');
        console.log('Configuración reseteada a valores por defecto');
    }

    updateDisplayOptimized() {
        // Versión optimizada que solo actualiza elementos esenciales durante el arrastre
        if (this.phases.length === 0) return;

        // Solo actualizar el cronómetro
        const minutes = Math.floor(Math.abs(this.currentTime) / 60);
        const seconds = Math.abs(this.currentTime) % 60;
        const timeString = `${this.currentTime < 0 ? '-' : ''}${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`;
        this.timerDisplay.textContent = timeString;

        // Solo actualizar la barra de progreso
        const progress = Math.max(0, (this.totalTime - this.currentTime) / this.totalTime * 100);
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
}

// Inicializar la aplicación cuando el DOM esté cargado
document.addEventListener('DOMContentLoaded', () => {
    new DebateTimer();
});
