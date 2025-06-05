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
- **Fases adicionales**: Deliberación de jueces y Feedback configurables
- **Sincronización en la nube**: Comparte configuraciones entre dispositivos con códigos únicos

### Controles Específicos
- **Iniciar/Pausar/Reanudar**: Control total del cronómetro
- **Resetear Fase**: Reinicia solo la fase actual
- **Resetear Debate**: Reinicia todo el debate desde el inicio
- **Navegación**: Botones anterior/siguiente (deshabilitados durante reproducción)

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
5. **Deliberación** (opcional, por defecto: 1200s)
6. **Feedback** (opcional, por defecto: 900s)

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
- **Fases adicionales**: Deliberación y Feedback se agregan automáticamente al final

## Fases Adicionales

Ambos formatos incluyen fases opcionales al final:

### Deliberación
- **Propósito**: Tiempo para que los jueces deliberen sobre el resultado
- **Duración por defecto**: 1200 segundos (20 minutos)
- **Descripción configurable**: Personalizable para diferentes tipos de deliberación

### Feedback
- **Propósito**: Tiempo para proporcionar retroalimentación a los debatientes
- **Duración por defecto**: 900 segundos (15 minutos)
- **Descripción configurable**: Adaptable según el contexto del debate

## Gestión de Configuraciones

### Sincronización en la Nube ☁️
- **Códigos únicos**: Genera códigos de 8 caracteres para compartir configuraciones
- **Acceso multiplataforma**: Usa la misma configuración en cualquier dispositivo
- **Compartir configuraciones**: Comparte tu configuración con otros organizadores
- **Carga instantánea**: Introduce un código para cargar configuraciones guardadas

#### Cómo usar la sincronización:
1. **Configurar**: Ajusta todos los parámetros del debate según tus necesidades
2. **Generar código**: Haz clic en "🎲 Generar Código" para crear un código único
3. **Guardar**: Haz clic en "☁️ Guardar en la Nube" para almacenar la configuración
4. **Compartir**: Comparte el código con otros usuarios o úsalo en otros dispositivos
5. **Cargar**: En cualquier dispositivo, introduce el código y haz clic en "📥 Cargar de la Nube"

### Guardado Local
- Las configuraciones también se guardan automáticamente en el navegador local
- Persisten entre sesiones del navegador en el mismo dispositivo
- Se mantienen disponibles incluso sin conexión a internet

### Opciones de Configuración
- **Guardar y Aplicar**: Guarda la configuración localmente y la aplica al cronómetro
- **Restaurar Valores por Defecto**: Restablece todos los valores a la configuración inicial de ADA
- **☁️ Guardar en la Nube**: Almacena la configuración en Firebase con un código único
- **📥 Cargar de la Nube**: Recupera una configuración usando su código
- **🎲 Generar Código**: Crea un nuevo código único para la configuración actual

## Contribuciones

Este proyecto fue desarrollado específicamente para la Asociación de Debate de Alicante (ADA). Las mejoras y sugerencias son bienvenidas.

## Licencia

Proyecto de código abierto desarrollado para uso educativo y de debate académico.

---

**Desarrollado con 💜 para la Asociación de Debate de Alicante**
