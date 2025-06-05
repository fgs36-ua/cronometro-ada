# Cronómetro de Debate - ADA

Cronómetro web profesional diseñado para la Asociación de Debate de Alicante (ADA) que soporta múltiples formatos de debate con configuración flexible y visualización optimizada para proyección.

## Características

### Formatos de Debate
- **Formato Académico**: Configurable con introducciones, preguntas cruzadas, refutaciones y conclusiones
- **British Parliament**: 8 discursos secuenciales con configuración de equipos por cámaras

### Funcionalidades Principales
- **Cronómetro con conteo negativo**: Continúa contando después de llegar a cero
- **Alertas visuales**: Cambios de color (amarillo a los 10s, rojo a los -11s)
- **Alerta sonora**: Notificación audible al llegar a cero
- **Diseño responsive**: Optimizado para móviles, tablets y proyección
- **Navegación por fases**: Salto directo a cualquier fase del debate
- **Configuración avanzada**: Nombres de equipos, tiempos personalizables

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

## Contribuciones

Este proyecto fue desarrollado específicamente para la Asociación de Debate de Alicante (ADA). Las mejoras y sugerencias son bienvenidas.

## Licencia

Proyecto de código abierto desarrollado para uso educativo y de debate académico.

---

**Desarrollado con 💜 para la comunidad de debate de Alicante**
