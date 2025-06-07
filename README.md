# Cronómetro de Debate - ADA

Cronómetro web profesional diseñado para la Asociación de Debate de Alicante (ADA) que soporta múltiples formatos de debate con configuración flexible y visualización optimizada para proyección.

## Características

### Formatos de Debate

- **Formato Académico**: Configurable con introducciones, preguntas cruzadas, refutaciones y conclusiones
- **British Parliament**: 8 discursos secuenciales con configuración de equipos por cámaras

### Funcionalidades Principales

- **Cronómetro con conteo negativo**: Continúa contando después de llegar a cero
- **Alertas visuales**: Cambios de color (amarillo a los 10s, rojo a los -11s)
- **Diseño responsive**: Optimizado para móviles, tablets y proyección
- **Navegación por fases**: Salto directo a cualquier fase del debate
- **Configuración avanzada**: Nombres de equipos, tiempos personalizables
- **Guardado automático**: Las configuraciones se guardan automáticamente en el navegador

### Controles Específicos

- **Iniciar/Pausar/Reanudar**: Control total del cronómetro
- **Resetear Fase**: Reinicia solo la fase actual
- **Resetear Debate**: Reinicia todo el debate desde el inicio
- **Navegación**: Botones anterior/siguiente (deshabilitados durante reproducción)

## Controles de Teclado

### Controles Principales del Cronómetro

- **Espacio**: Iniciar/Pausar/Reanudar el cronómetro
- **R**: Resetear la fase actual
- **D**: Resetear todo el debate

### Navegación y Ajustes de Tiempo

- **← →**: Cambiar entre fases del debate (anterior/siguiente)
- **↑ ↓**: Ajustar tiempo de la fase actual (±10 segundos)
- **+ -**: Ajustar tiempo de la fase actual (±30 segundos)

### Gestión de Paneles

- **C**: Abrir panel de configuración
- **F**: Abrir panel de fases del debate
- **ESC**: Cerrar paneles abiertos
- **Enter**: Aplicar configuración cuando hay un panel abierto

### Formatos y Ayuda

- **1**: Cambiar a formato Académico
- **2**: Cambiar a formato British Parliament
- **H**: Mostrar/ocultar ayuda de controles de teclado

### Configuración de Controles de Teclado

Los controles de teclado pueden activarse o desactivarse desde el panel de configuración:

- **Ubicación**: Panel de Configuración → Configuración de Controles
- **Estado por defecto**: Activado
- **Funcionamiento**: 
  - **Activado**: Todos los atajos de teclado funcionan y se muestra el indicador de ayuda
  - **Desactivado**: Los atajos de teclado no responden y se oculta el indicador de ayuda
- **Guardado**: La configuración se guarda automáticamente y persiste entre sesiones

### Limitaciones de los Controles de Teclado

- Los controles de teclado respetan las mismas limitaciones que los controles con ratón
- La navegación entre fases está deshabilitada mientras el cronómetro está en ejecución
- Los ajustes de tiempo están limitados al rango permitido (-300s a duración+60s)
- Los controles se desactivan cuando hay campos de texto activos para evitar conflictos

### Disponibilidad en Dispositivos

- **Escritorio/Laptop**: Todos los controles de teclado están disponibles, con indicador de ayuda visible en la esquina inferior izquierda
- **Tablet/Móvil**: Los controles de teclado están ocultos automáticamente en pantallas menores a 1024px de ancho para optimizar la experiencia táctil

## Configuración del Formato Académico

### Tiempos Configurables

- **Introducción**: (por defecto: 240s)
- **Preguntas cruzadas**: (por defecto: 120s)
- **Refutación**: (por defecto: 300s)
- **Conclusión**: (por defecto: 180s)
- **Número de refutaciones**: (por defecto: 2)

### Funcionalidad Avanzada

- **Tiempo diferente para última refutación**: Opción para configurar un tiempo específico para la ronda final de refutaciones (útil para réplicas más cortas)

### Secuencia del Debate Académico

1. Introducción Equipo A → Preguntas cruzadas a A
2. Introducción Equipo B → Preguntas cruzadas a B
3. Refutaciones alternadas (A → B → A → B...)
4. Conclusión Equipo B → Conclusión Equipo A

## Configuración British Parliament

### Estructura de 8 Discursos

1. **Primer Ministro** (Cámara Alta - A favor)
2. **Líder de Oposición** (Cámara Alta - En contra)
3. **Viceprimer Ministro** (Cámara Alta - A favor)
4. **Vicelíder de Oposición** (Cámara Alta - En contra)
5. **Extensión de Gobierno** (Cámara Baja - A favor)
6. **Extensión de la Oposición** (Cámara Baja - En contra)
7. **Látigo de Gobierno** (Cámara Baja - A favor)
8. **Látigo de la Oposición** (Cámara Baja - En contra)

### Configuración

- **Duración de discursos**: (por defecto: 420s)
- **Nombres de equipos**: Configurables para cada cámara

## Gestión de Configuraciones

### Guardado Automático

- Las configuraciones se guardan automáticamente en el navegador al hacer clic en "Guardar y Aplicar"
- No requiere login ni conexión a internet
- Las configuraciones persisten entre sesiones del navegador

### Opciones de Configuración

- **Guardar y Aplicar**: Guarda la configuración actual y la aplica al cronómetro
- **Restaurar Valores por Defecto**: Restablece todos los valores a la configuración inicial de ADA

### Limitaciones

- Las configuraciones solo se guardan en el navegador específico donde se configuraron
- Si se borra el caché del navegador, se perderán las configuraciones guardadas

## Contribuciones

Este proyecto fue desarrollado específicamente para la Asociación de Debate de Alicante (ADA). Las mejoras y sugerencias son bienvenidas.

## Licencia

Proyecto de código abierto desarrollado para uso educativo y de debate académico.

---

**Desarrollado con 💜 para la Asociación de Debate de Alicante**
