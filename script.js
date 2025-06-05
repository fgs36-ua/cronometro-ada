class DebateTimer {
    constructor() {
        this.currentFormat = 'academico';
        this.isRunning = false;
        this.isPaused = false;
        this.currentTime = 0;
        this.totalTime = 0;
        this.currentPhaseIndex = 0;
        this.phases = [];
        this.timer = null;        this.initializeElements();
        this.setupEventListeners();
        this.updateConfiguration();
    }    initializeElements() {
        // Elementos del DOM
        this.timerDisplay = document.getElementById('timer');
        this.currentSpeakerDisplay = document.getElementById('current-speaker');
        this.progressFill = document.getElementById('progress-fill');        this.startBtn = document.getElementById('start-btn');
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
        this.applyConfigBtn = document.getElementById('apply-config-btn');
        
        // Secciones de configuración
        this.academicoConfig = document.getElementById('academico-config');
        this.bpConfig = document.getElementById('bp-config');          // Inputs de configuración académico
        this.introTime = document.getElementById('intro-time');
        this.preguntasTime = document.getElementById('preguntas-time');
        this.refutacionTime = document.getElementById('refutacion-time');
        this.conclusionTime = document.getElementById('conclusion-time');
        this.numRefutaciones = document.getElementById('num-refutaciones');
        this.equipo1Name = document.getElementById('equipo1-name');
        this.equipo2Name = document.getElementById('equipo2-name');
        this.ultimaRefutacionDiferente = document.getElementById('ultima-refutacion-diferente');
        this.ultimaRefutacionTime = document.getElementById('ultima-refutacion-time');
        this.ultimaRefutacionConfig = document.getElementById('ultima-refutacion-config');
          // Inputs de configuración BP
        this.bpSpeechTime = document.getElementById('bp-speech-time');
        this.equipoCamaraAltaFavor = document.getElementById('equipo-camara-alta-favor');
        this.equipoCamaraAltaContra = document.getElementById('equipo-camara-alta-contra');
        this.equipoCamaraBajaFavor = document.getElementById('equipo-camara-baja-favor');
        this.equipoCamaraBajaContra = document.getElementById('equipo-camara-baja-contra');
    }    setupEventListeners() {
        // Selector de formato
        document.querySelectorAll('.format-btn').forEach(btn => {
            btn.addEventListener('click', (e) => {
                this.switchFormat(e.target.dataset.format);
            });
        });        // Panel de configuración
        this.configBtn.addEventListener('click', () => this.toggleConfigPanel());
        this.applyConfigBtn.addEventListener('click', () => this.applyConfiguration());

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
    }

    adjustTimerSize() {
        const timerContainer = this.timerDisplay.parentElement;
        const containerWidth = timerContainer.offsetWidth;
        
        // Solo ajustar en pantallas muy pequeñas
        if (containerWidth < 400) {
            const text = this.timerDisplay.textContent;
            const maxWidth = containerWidth - 40; // Margen de seguridad
            
            // Calcular un tamaño de fuente proporcional
            let fontSize = Math.min(containerWidth / text.length * 1.5, 80);
            fontSize = Math.max(fontSize, 30); // Tamaño mínimo
            
            this.timerDisplay.style.fontSize = fontSize + 'px';
        } else {
            // Resetear al tamaño CSS por defecto en pantallas más grandes
            this.timerDisplay.style.fontSize = '';
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
        });

        // Mostrar/ocultar secciones de configuración
        this.academicoConfig.classList.toggle('hidden', format !== 'academico');
        this.bpConfig.classList.toggle('hidden', format !== 'bp');        // Reset automático al cambiar formato
        this.currentPhaseIndex = 0;
        this.updateConfiguration();
        this.resetDebate();
    }

    toggleConfigPanel() {
        this.configPanel.classList.toggle('show');
        this.configPanel.classList.toggle('hidden');
        
        // Cambiar texto del botón
        if (this.configPanel.classList.contains('show')) {
            this.configBtn.textContent = '⚙️ Cerrar Configuración';
        } else {
            this.configBtn.textContent = '⚙️ Configuración';
        }
    }    togglePhasesPanel() {
        this.phasesPanel.classList.toggle('show');
        this.phasesPanel.classList.toggle('hidden');
        
        // Cambiar texto del botón
        if (this.phasesPanel.classList.contains('show')) {
            this.phasesBtn.textContent = '📋 Cerrar Fases';
        } else {
            this.phasesBtn.textContent = '📋 Fases';
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
    }

    applyConfiguration() {
        this.updateConfiguration();
        this.resetDebate(); // Reset completo después de aplicar configuración
        this.toggleConfigPanel(); // Cerrar panel
    }    updateConfiguration() {
        if (this.currentFormat === 'academico') {
            this.setupAcademicoPhases();
        } else {
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
            }),
            
            // Conclusiones (primero B, luego A)
            { name: `Conclusión ${equipo2} (en contra)`, duration: conclusion },
            { name: `Conclusión ${equipo1} (a favor)`, duration: conclusion }
        ];
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
            { name: `Extensión de la Oposición (${camaraBajaContra})`, duration: speechDuration },
            { name: `Látigo de Gobierno (${camaraBajaFavor})`, duration: speechDuration },
            { name: `Látigo de la Oposición (${camaraBajaContra})`, duration: speechDuration }
        ];
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
    }

    resetDebate() {
        // Resetear todo el debate desde el principio
        this.isRunning = false;
        this.isPaused = false;
        this.currentTime = 0;
        this.totalTime = 0;
        this.currentPhaseIndex = 0;
        
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
        
        // NO iniciar automáticamente el cronómetro, solo cargar la fase
        // El usuario debe presionar "Iniciar" manualmente
        
        this.updateDisplay();
    }    startTimer() {
        this.timer = setInterval(() => {
            this.currentTime--;
            
            // Continuar contando en negativo, no parar en 0
            this.updateDisplay();
            
            // Solo reproducir sonido cuando llega a 0, pero continuar contando
            if (this.currentTime === 0) {
                this.playTimeUpSound();
            }
        }, 1000);
    }    handleTimeUp() {
        // Este método ya no se usa - el timer continúa en negativo
        // Solo reproducimos el sonido en el método startTimer cuando currentTime === 0
    }

    playTimeUpSound() {
        // Crear un sonido simple usando Web Audio API
        const audioContext = new (window.AudioContext || window.webkitAudioContext)();
        const oscillator = audioContext.createOscillator();
        const gainNode = audioContext.createGain();
        
        oscillator.connect(gainNode);
        gainNode.connect(audioContext.destination);
        
        oscillator.frequency.setValueAtTime(800, audioContext.currentTime);
        oscillator.frequency.setValueAtTime(400, audioContext.currentTime + 0.5);
        
        gainNode.gain.setValueAtTime(0.3, audioContext.currentTime);
        gainNode.gain.exponentialRampToValueAtTime(0.01, audioContext.currentTime + 1);
        
        oscillator.start(audioContext.currentTime);
        oscillator.stop(audioContext.currentTime + 1);
    }    updateDisplay() {
        if (this.phases.length === 0) {
            this.currentSpeakerDisplay.textContent = 'Configura el formato de debate';
            this.timerDisplay.textContent = '00:00';
            this.progressFill.style.width = '0%';
            this.adjustTimerSize();
            return;
        }

        const phase = this.phases[this.currentPhaseIndex];
        this.currentSpeakerDisplay.textContent = phase.name;
        
        // Formatear tiempo
        const minutes = Math.floor(Math.abs(this.currentTime) / 60);
        const seconds = Math.abs(this.currentTime) % 60;
        const timeString = `${this.currentTime < 0 ? '-' : ''}${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`;
        this.timerDisplay.textContent = timeString;

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

        // Ajustar tamaño del cronómetro para dispositivos móviles
        this.adjustTimerSize();

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
    }

    showDebateEnd() {
        this.currentSpeakerDisplay.textContent = '¡Debate terminado!';
        this.timerDisplay.textContent = '00:00';
        this.progressFill.style.width = '100%';
        this.isRunning = false;
        this.isPaused = false;
        clearInterval(this.timer);
        this.updateControlButtons();
    }    updatePhasesList() {
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
        this.loadCurrentPhase();
        
        // Actualizar visualización
        this.updateDisplay();
        this.updateControlButtons();
    }
}

// Inicializar la aplicación cuando el DOM esté cargado
document.addEventListener('DOMContentLoaded', () => {
    new DebateTimer();
});
