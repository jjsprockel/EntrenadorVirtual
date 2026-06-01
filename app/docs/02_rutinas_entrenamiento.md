# RUTINAS DE ENTRENAMIENTO
## Guía completa de estructuras, construcción y personalización

> **Uso para el LLM:** Este documento contiene la lógica completa para recomendar, construir y ajustar rutinas de entrenamiento. El modelo debe usarlo para responder preguntas sobre estructura de rutinas, frecuencia, volumen, y para guiar al usuario en la construcción de su programa personalizado.

---

## ÍNDICE

1. [Principios fundamentales de diseño de rutinas](#1-principios-fundamentales)
2. [Variables de entrenamiento](#2-variables-de-entrenamiento)
3. [Estructuras de rutina: tipos y comparativa](#3-estructuras-de-rutina)
4. [Guía de construcción paso a paso](#4-guía-de-construcción)
5. [Plantillas de rutinas prediseñadas](#5-plantillas-prediseñadas)
6. [Ajuste según nivel y objetivo](#6-ajuste-según-nivel-y-objetivo)
7. [Gestión de la recuperación](#7-gestión-de-la-recuperación)
8. [Errores comunes en el diseño de rutinas](#8-errores-comunes)
9. [Preguntas frecuentes con respuestas técnicas](#9-preguntas-frecuentes)

---

---

## 1. PRINCIPIOS FUNDAMENTALES

### 1.1 Principio de Especificidad (SAID)
El cuerpo se adapta específicamente al estímulo aplicado. Si entrenas para hipertrofia, el cuerpo se adapta para ser más grande. Si entrenas para fuerza máxima, mejora la eficiencia neuromuscular. Implicación para el diseño: el objetivo debe estar claro antes de construir la rutina.

### 1.2 Principio de Sobrecarga Progresiva
Para que el músculo continúe adaptándose, el estímulo debe aumentar progresivamente con el tiempo. Esto se logra manipulando: peso, repeticiones, series, densidad (descanso), velocidad, frecuencia o variedad de ejercicios.

**La progresión puede ser:**
- **Lineal:** subir peso/reps cada sesión o semana. Simple y efectivo para principiantes.
- **Ondulante:** variar el estímulo entre sesiones o semanas. Más sostenible a largo plazo.
- **Por bloques:** periodos de acumulación de volumen seguidos de periodos de intensificación.

### 1.3 Principio de Variedad
El cuerpo se adapta al estímulo específico y eventualmente deja de responder si el estímulo no cambia. Cambiar ejercicios, ángulos, rep ranges, o la estructura de la rutina cada 4–8 semanas previene el estancamiento.

### 1.4 Principio de Individualización
No existe una rutina universalmente óptima. La respuesta al entrenamiento varía por: nivel de experiencia, genética, edad, historial de lesiones, disponibilidad de tiempo y equipo, y preferencias personales.

### 1.5 Principio de Reversibilidad
Las ganancias se pierden si se deja de entrenar. Los descansos estratégicos (deloads) son diferentes al abandono: un deload de 1 semana cada 4–8 semanas es positivo y previene el sobreentrenamiento.

---

## 2. VARIABLES DE ENTRENAMIENTO

### 2.1 Intensidad
Medida como porcentaje del 1RM (una repetición máxima) o como RIR (repeticiones en reserva).

| Intensidad | % 1RM | Reps posibles | Objetivo |
|---|---|---|---|
| Muy alta | 90–100% | 1–3 | Fuerza máxima, pico de fuerza |
| Alta | 80–90% | 4–6 | Fuerza, algo de hipertrofia |
| Moderada-alta | 70–80% | 7–12 | Hipertrofia + fuerza |
| Moderada | 60–70% | 12–15 | Hipertrofia, resistencia muscular |
| Baja-moderada | 50–60% | 15–20+ | Resistencia muscular, pump |

**RIR (Repeticiones en Reserva):** escala del esfuerzo percibido.
- RIR 0 = fallo muscular (no puedes hacer otra rep)
- RIR 1 = te queda 1 repetición en el tanque
- RIR 3 = te quedan 3 reps; zona recomendada para la mayoría de series de trabajo
- RIR 5+ = muy fácil, no suficiente estímulo

**Recomendación de trabajo:** La mayoría de las series deben terminarse en RIR 1–3. El fallo muscular (RIR 0) puede usarse ocasionalmente pero aumenta la fatiga y el riesgo de lesión.

### 2.2 Volumen
El volumen se mide en series efectivas por grupo muscular por semana.

**Rangos de volumen semanal recomendados por grupo muscular:**

| Grupo Muscular | Volumen Mínimo Efectivo (MEV) | Volumen de Mantenimiento (MV) | Rango Óptimo | Volumen Máximo Adaptable (MAV) |
|---|---|---|---|---|
| Pecho | 8 series/sem | 6 series/sem | 10–20 | 22 series/sem |
| Espalda | 10 series/sem | 8 series/sem | 12–22 | 25 series/sem |
| Hombros | 8 series/sem | 6 series/sem | 10–20 | 26 series/sem |
| Bíceps | 6 series/sem | 4 series/sem | 8–18 | 26 series/sem |
| Tríceps | 6 series/sem | 4 series/sem | 8–18 | 22 series/sem |
| Cuádriceps | 8 series/sem | 6 series/sem | 10–20 | 24 series/sem |
| Isquiotibiales | 6 series/sem | 4 series/sem | 10–18 | 20 series/sem |
| Glúteos | 4 series/sem | 0 series/sem | 6–16 | 20 series/sem |
| Pantorrillas | 6 series/sem | 4 series/sem | 8–16 | 20 series/sem |
| Core | 4 series/sem | 0 series/sem | 6–16 | 20 series/sem |

*Nota: Estos valores son orientativos (basados en el modelo de RP Strength / Schoenfeld). Los valores individuales varían.*

**Progresión del volumen:** Comenzar cerca del MEV y añadir 1–2 series por semana hasta llegar al rango óptimo. Al final del mesociclo, hacer una semana de deload (reducir al MV).

### 2.3 Frecuencia
Número de veces que se entrena cada grupo muscular por semana.

- **1x/semana:** Suficiente para mantener. Subóptimo para maximizar hipertrofia.
- **2x/semana:** Óptimo para la mayoría. El músculo recuperado puede re-estimularse.
- **3x/semana:** Efectivo para músculos pequeños (bíceps, tríceps) o para distribuciones avanzadas.
- **4x+/semana:** Solo para atletas avanzados con recuperación optimizada.

**La frecuencia es una herramienta para distribuir el volumen.** Si el volumen semanal es igual, 2x vs 3x por semana produce resultados similares. La ventaja de más frecuencia es que permite distribuir un mayor volumen total sin exceso de fatiga en una sola sesión.

### 2.4 Selección de ejercicios
**Regla de los compuestos primero:** Los ejercicios multiarticulares (press, sentadilla, peso muerto, dominadas) deben ir al inicio de la sesión cuando la energía y el sistema nervioso están frescos.

**Regla del aislamiento al final:** Los ejercicios de aislamiento (curl, extensión, elevaciones) van al final para terminar de fatigar el músculo ya trabajado por los compuestos.

**Variedad de ángulos:**
- Pecho: ejercicios planos + inclinados + declinados para estimular diferentes fibras.
- Espalda: tracción vertical (dominadas/jalón) + tracción horizontal (remos).
- Hombros: press + elevaciones laterales + trabajo de deltoides posterior.

### 2.5 Orden de ejercicios
1. Calentamiento general (5–10 min cardio ligero)
2. Activación específica del grupo muscular del día
3. Ejercicios compuestos pesados (1–2 ejercicios)
4. Ejercicios compuestos accesorios (1–2 ejercicios)
5. Ejercicios de aislamiento (2–3 ejercicios)
6. Core (si corresponde)

### 2.6 Descanso entre series

| Tipo de ejercicio | Objetivo hipertrofia | Objetivo fuerza |
|---|---|---|
| Compuestos pesados | 2–3 minutos | 3–5 minutos |
| Compuestos accesorios | 90 seg – 2 min | 2–3 minutos |
| Aislamiento | 60–90 segundos | 90 seg – 2 min |

*Descansos cortos (<60 seg) aumentan el estrés metabólico pero reducen la calidad de las series.*

### 2.7 Tempo (cadencia)
Notación: Excéntrico – Pausa abajo – Concéntrico – Pausa arriba
Ejemplo: 3-1-1-0 = 3 seg bajando, 1 seg abajo, 1 seg subiendo, sin pausa arriba

**Para hipertrofia:** Excéntrico lento (2–4 seg) aumenta el tiempo bajo tensión y el daño muscular (estímulo hipertrófico).
**Para fuerza:** Concéntrico explosivo; excéntrico controlado pero no extremadamente lento.

---

## 3. ESTRUCTURAS DE RUTINA

### 3.1 Fullbody (Cuerpo Completo)

**¿Qué es?** Cada sesión trabaja todos o la mayoría de los grupos musculares.

**Frecuencia semanal:** 2–3 días/semana con al menos 1 día de descanso entre sesiones.

**Frecuencia por músculo:** 2–3x/semana.

**¿Para quién?**
- Principiantes absolutos: aprendizaje motor con alta frecuencia.
- Personas con 2–3 días disponibles por semana.
- Fases de mantenimiento o reducción de volumen.
- Atletas que complementan otro deporte.

**Ventajas:**
- Alta frecuencia de estimulación muscular.
- Flexibilidad si se pierde una sesión.
- Eficiente para personas con poco tiempo.

**Desventajas:**
- Volumen limitado por sesión para cada grupo muscular.
- Sesiones más largas si se quiere trabajar todo bien.
- No permite especialización.

**Estructura típica (sesión):**
1. Ejercicio de pierna compuesto (sentadilla o prensa)
2. Empuje horizontal o vertical (press banca o militar)
3. Tracción horizontal o vertical (remo o jalón)
4. Ejercicio de bisagra (peso muerto RDL o hip thrust)
5. Accesorios (bíceps, tríceps, hombros, core): 1–2 ejercicios

**Variación A/B:** Para evitar la monotonía, alternar dos versiones de la sesión:
- Fullbody A: Sentadilla, Press banca, Remo barra, RDL
- Fullbody B: Prensa, Press inclinado, Jalón al pecho, Hip thrust

**Progresión sugerida:** Incremento lineal de peso o reps cada sesión. Principiantes pueden progresar cada entrenamiento.

---

### 3.2 Torso / Pierna (Upper / Lower)

**¿Qué es?** División en dos tipos de sesión: un día se trabaja todo el tren superior, el siguiente todo el tren inferior.

**Frecuencia semanal:** 4 días (2 torso + 2 pierna) o 3 días alternando.

**Frecuencia por músculo:** 2x/semana.

**Distribución semanal típica:**
```
Lunes:     Torso A
Martes:    Pierna A
Miércoles: Descanso
Jueves:    Torso B
Viernes:   Pierna B
Sábado:    Descanso
Domingo:   Descanso
```

**¿Para quién?**
- Nivel principiante-intermedio que puede entrenar 4 días.
- Transición desde fullbody hacia rutinas más especializadas.
- Personas que quieren equilibrio entre tren superior e inferior.

**Ventajas:**
- Mayor volumen por grupo que el fullbody.
- Frecuencia 2x/semana por músculo (óptima para hipertrofia).
- Más sencilla que PPL para organizar.

**Desventajas:**
- Cada sesión de torso puede ser larga si se incluyen muchos grupos.
- Menos especialización que PPL.

**Estructura de sesión de Torso:**
1. Compuesto de empuje horizontal (press banca)
2. Compuesto de tracción horizontal o vertical (remo o jalón)
3. Compuesto de empuje vertical (press hombros)
4. Tracción vertical o aislamiento espalda
5. Bíceps (1–2 ejercicios)
6. Tríceps (1–2 ejercicios)
7. Hombros (elevaciones laterales, posteriores)

**Estructura de sesión de Pierna:**
1. Compuesto bilateral de sentadilla (sentadilla o prensa)
2. Bisagra (RDL o peso muerto)
3. Ejercicio unilateral (búlgara o zancada)
4. Aislamiento cuádriceps (extensión)
5. Aislamiento isquiotibiales (curl femoral)
6. Glúteos (hip thrust si no está en bisagra)
7. Pantorrillas

**Variante A/B:** La sesión A puede enfocarse más en volumen (más reps), la B más en intensidad (más peso).

---

### 3.3 Push / Pull / Legs (PPL)

**¿Qué es?** División por patrón de movimiento:
- **Push (Empuje):** Pecho + Hombros + Tríceps
- **Pull (Tracción):** Espalda + Bíceps + Antebrazos
- **Legs (Piernas):** Cuádriceps + Isquiotibiales + Glúteos + Pantorrillas

**Frecuencia semanal:**
- 3 días: cada grupo muscular 1x/semana (subóptimo pero válido)
- 6 días: PPP/LLL repetido, cada músculo 2x/semana (óptimo)
- 5 días: alternando (por ejemplo, lunes Push, martes Pull, miércoles Legs, jueves Push, viernes Pull)

**Distribución 6 días:**
```
Lunes:     Push A
Martes:    Pull A
Miércoles: Legs A
Jueves:    Push B
Viernes:   Pull B
Sábado:    Legs B
Domingo:   Descanso
```

**¿Para quién?**
- Nivel intermedio-avanzado.
- Personas que pueden entrenar 5–6 días por semana.
- Quienes buscan maximizar el volumen y la frecuencia por músculo.

**Ventajas:**
- Máximo volumen posible para cada grupo muscular.
- Frecuencia 2x/semana con el ciclo de 6 días.
- Grupos musculares sinérgicos entrenados juntos (recuperación coordinada).

**Desventajas:**
- Requiere 5–6 días de entrenamiento semanal.
- Sesiones largas, especialmente Push y Pull.
- No ideal si se pierde una sesión (el ciclo se desordena).

**Estructura de Push:**
1. Press de banca con barra (compuesto principal, 4–5 series)
2. Press inclinado con mancuernas (compuesto accesorio, 3–4 series)
3. Press militar o press mancuernas (hombros, 3–4 series)
4. Elevaciones laterales (aislamiento deltoides, 3–4 series)
5. Fondos o press cerrado (tríceps compuesto, 3 series)
6. Extensión en polea o press francés (tríceps aislamiento, 3 series)
7. [Variante B: añadir pec deck, aperturas, patada de tríceps]

**Estructura de Pull:**
1. Dominadas o jalón al pecho (tracción vertical compuesto, 4–5 series)
2. Remo con barra o mancuerna (tracción horizontal compuesto, 4 series)
3. Remo en polea o máquina (accesorio espalda, 3 series)
4. Face pull o pájaros (deltoides posterior + manguito, 3 series)
5. Curl con barra o mancuernas (bíceps, 3–4 series)
6. Curl martillo o concentrado (bíceps accesorio, 2–3 series)
7. [Variante B: remo unilateral, pull-over, curl Scott]

**Estructura de Legs:**
1. Sentadilla con barra (compuesto principal, 4–5 series)
2. Prensa de pierna (compuesto accesorio, 3–4 series)
3. RDL o peso muerto rumano (bisagra, 3–4 series)
4. Sentadilla búlgara o zancada (unilateral, 3 series)
5. Extensión de cuádriceps (aislamiento, 3 series)
6. Curl femoral (aislamiento, 3 series)
7. Hip thrust (glúteos, 3 series) — puede ir antes del accesorio
8. Elevación de talones (pantorrillas, 4 series)

---

### 3.4 Weider / Por Grupo Muscular

**¿Qué es?** Cada día de la semana se dedica a un grupo muscular específico.

**Frecuencia por músculo:** 1x/semana.

**Distribución típica:**
```
Lunes:     Pecho
Martes:    Espalda
Miércoles: Hombros
Jueves:    Bíceps + Tríceps (brazos)
Viernes:   Piernas
Sábado:    Descanso
Domingo:   Descanso
```

**¿Para quién?**
- Nivel avanzado que requiere alto volumen por sesión para seguir progresando.
- Personas que entrenan 5 días/semana y buscan especialización.
- Culturistas en fases de construcción de volumen específico.

**Ventajas:**
- Altísimo volumen para cada grupo muscular en una sesión.
- Total enfoque en el músculo del día.
- Recuperación completa antes de la siguiente sesión.

**Desventajas:**
- Frecuencia baja (1x/semana): los músculos pequeños (bíceps, tríceps) pueden beneficiarse más de 2x/semana.
- Evidencia científica sugiere que 2x/semana puede ser superior para hipertrofia en la mayoría de personas.
- Muy dependiente de la asistencia: perder un día = ese músculo no se trabaja esa semana.

---

### 3.5 Splits de 3 días: PPL Sinergista y Antagonista

#### 3.5.1 PPL 3 días (Sinergista)

**¿Qué es?** La versión de 3 días del Push/Pull/Legs clásico: un día de tracción (Pull), un día de empuje (Push), un día de piernas. Cada sesión agrupa músculos sinérgicos — los que se ayudan entre sí — para maximizar el estímulo con la fatiga ya acumulada.

**Frecuencia semanal:** 3 días. **Frecuencia por músculo:** 1x/semana.

**Distribución:**
```
Día 1 — Pull:  Espalda + Bíceps
Día 2 — Push:  Pecho + Hombro + Tríceps
Día 3 — Legs:  Piernas (cuádriceps, isquiotibiales, pantorrillas)
```

**¿Para quién?**
- Principiantes e intermedios con 3 días/semana disponibles.
- Personas que quieren la opción más eficiente, simple y respaldada por la ciencia.
- Transición natural desde Fullbody antes de saltar a PPL 6 días.

**Ventajas:**
- La distribución sinérgica (bíceps fatigados ya por la tracción, tríceps por el empuje) maximiza el estímulo de los músculos de aislamiento.
- Sesiones enfocadas y eficientes: sin cambios de patrón muscular dentro de la sesión.
- Fácil de aprender y adaptar.

**Desventajas:**
- Frecuencia 1x/semana por grupo muscular: subóptima para maximizar hipertrofia comparada con 2x.
- Perder un día desordena el ciclo.

**Ajuste de periodización:** Para esta estructura, la **Periodización Lineal** y la **Ondulante Semanal** son las más adecuadas. La DUP (Ondulante Diaria) está diseñada para 2+ sesiones por grupo muscular y no encaja bien con 1x/semana. El deload puede espaciarse cada 6–8 semanas (vs 4–6 en splits de alta frecuencia) porque la fatiga semanal acumulada es menor.

---

#### 3.5.2 Antagonista 3 días

**¿Qué es?** Un split que agrupa músculos antagonistas (los que se oponen entre sí) en la misma sesión. La lógica fisiológica es que mientras un músculo trabaja, su antagonista descansa activamente, permitiendo recuperación intra-sesión y la posibilidad de usar superseries antagonistas sin pérdida de rendimiento.

**Frecuencia semanal:** 3 días. **Frecuencia por músculo:** 1x/semana.

**Distribución:**
```
Día 1:  Espalda + Tríceps      (tracción + empuje de brazo)
Día 2:  Pecho + Hombro + Bíceps (empuje + tracción de brazo)
Día 3:  Piernas
```

**Lógica antagonista:**
- **Espalda + Tríceps:** La espalda (tracción) y el tríceps (empuje) son antagonistas del codo/hombro. Mientras haces remos, el tríceps descansa; mientras haces extensiones de tríceps, la espalda descansa.
- **Pecho + Bíceps:** El pecho empuja y el bíceps tira. Bíceps + Pecho también permite que los bíceps, ya pre-fatigados por los jalones de espalda del día anterior, descansen.

**¿Para quién?**
- Intermedios y avanzados que quieren variar el estímulo del PPL clásico.
- Personas que disfrutan de superseries antagonistas (remo + press, jalón + press francés) para ganar densidad de entrenamiento.
- Quienes tienen articulaciones sensibles y prefieren no fatigar los mismos patrones de movimiento en una sesión.

**Ventajas:**
- Superseries antagonistas sin pérdida de rendimiento: ideal para acortar la duración de la sesión.
- Estímulo muscular variado que puede romper estancamientos de rutinas sinérgicas.
- La alternancia de patrones reduce la fatiga nerviosa de un patrón específico.

**Desventajas:**
- Menos intuitiva que el PPL clásico: requiere conocer los pares antagonistas.
- La sesión de Día 2 (Pecho + Hombro + Bíceps) puede ser larga si no se controla el volumen.
- Frecuencia 1x/semana por grupo, igual que el PPL de 3 días.

**Ajuste de periodización:** Igual que en PPL 3 días — Lineal y Ondulante Semanal son las opciones más adecuadas. Deload cada 6–8 semanas.

---

### 3.6 Híbridos y Personalizados

**Torso-Pierna con PPL:** Semana de 5 días. Por ejemplo:
```
Lunes:     Push
Martes:    Pull
Miércoles: Legs
Jueves:    Torso (mixto)
Viernes:   Legs (énfasis diferente)
```

**Fullbody + Especialización:** 3 días fullbody + 1–2 días de sesión enfocada en el grupo muscular a especializar.

**3 días con rotación PPL:**
```
Semana 1: Lunes Push, Miércoles Pull, Viernes Legs
Semana 2: Lunes Legs, Miércoles Push, Viernes Pull
```
(Cada músculo se trabaja aprox 1.3x/semana en promedio)

---

### TABLA COMPARATIVA DE ESTRUCTURAS

| Estructura | Días/sem | Freq/músculo | Volumen/sesión | Nivel ideal | Tiempo sesión |
|---|---|---|---|---|---|
| Fullbody | 2–3 | 2–3x | Bajo-medio | Principiante | 45–60 min |
| Torso/Pierna | 4 | 2x | Medio | Principiante-Intermedio | 60–75 min |
| PPL (3 días) | 3 | 1x | Alto | Principiante-Intermedio | 60–75 min |
| PPL (6 días) | 6 | 2x | Alto | Intermedio-Avanzado | 60–90 min |
| Weider | 5 | 1x | Muy alto | Avanzado | 60–90 min |

---

## 4. GUÍA DE CONSTRUCCIÓN PASO A PASO

### PASO 1: Definir el objetivo principal
- **Hipertrofia (ganar músculo):** Rep range 8–15, volumen alto, descansos 60–120 seg.
- **Fuerza máxima:** Rep range 1–6, intensidad alta (>80% 1RM), descansos 3–5 min.
- **Mixto (fuerza + hipertrofia):** Combinar rangos, periodización ondulante.
- **Resistencia muscular:** Rep range 15–25+, descansos cortos, volumen muy alto.

### PASO 2: Determinar la disponibilidad semanal
- 2–3 días: Fullbody
- 4 días: Torso/Pierna o PPL 3 días + 1 extra
- 5–6 días: PPL, Weider, o Torso/Pierna con extra

### PASO 3: Elegir la estructura de división
Ver Sección 3 para la comparativa. Regla general:
- Principiante: Fullbody o Torso/Pierna
- Intermedio: Torso/Pierna o PPL
- Avanzado: PPL o Weider

### PASO 4: Distribuir los grupos musculares por día
Regla de oro: No entrenar dos grupos musculares sinérgicos grandes en días consecutivos.
- ❌ Evitar: Pecho el lunes, Hombros el martes (el deltoides anterior ya está fatigado).
- ❌ Evitar: Piernas el lunes, Espalda el martes (los erectores espinales aún están fatigados).
- ✅ Correcto: Pecho el lunes, Espalda el martes, Hombros/Brazos el miércoles, Piernas el jueves.

### PASO 5: Seleccionar los ejercicios
Para cada grupo muscular, seleccionar:
- 1–2 ejercicios compuestos principales (los que permiten más carga)
- 1–2 ejercicios accesorios o variantes
- 1–2 ejercicios de aislamiento

**Criterios de selección:**
- Incluir siempre al menos un ejercicio de estiramiento activo del músculo (RDL para isquiotibiales, aperturas para pecho).
- Incluir al menos un ejercicio de contracción máxima (press para tríceps, curl para bíceps).
- Variar los ángulos: un ejercicio horizontal + uno inclinado para el pecho.
- Balancear los patrones: cada push debe tener un pull equivalente para prevenir desequilibrios posturales.

### PASO 6: Asignar sets y reps
Basarse en el objetivo y el nivel:

| Objetivo | Series por ejercicio | Repeticiones | Descanso |
|---|---|---|---|
| Fuerza | 4–6 | 1–6 | 3–5 min |
| Fuerza-Hipertrofia | 4–5 | 5–10 | 2–3 min |
| Hipertrofia | 3–4 | 8–15 | 60–120 seg |
| Resistencia muscular | 2–3 | 15–25 | 30–60 seg |

**Volumen total por sesión:** Principiante: 10–15 series totales. Intermedio: 15–20. Avanzado: 20–25.

### PASO 7: Planificar la progresión
- **Doble progresión:** Trabajar dentro de un rango (ej. 8–12 reps). Cuando se logran las 12 reps en todas las series, subir el peso al que permita 8 reps.
- **Progresión lineal simple:** Subir 2.5kg (ejercicios grandes) o 1.25kg (ejercicios pequeños) cuando se completan todos los sets del objetivo.
- **Progresión por volumen:** Añadir 1 serie extra por semana manteniendo el peso.

### PASO 8: Planificar los deloads
- Cada 4–8 semanas (según el nivel y la acumulación de fatiga).
- Deload estándar: reducir el peso al 60% del habitual, mantener los mismos ejercicios.
- Deload de volumen: mismo peso, reducir series a la mitad.
- Descanso completo: 1 semana sin entrenar (menos frecuente; para fatiga acumulada severa).

---

## 5. PLANTILLAS PREDISEÑADAS

### PLANTILLA A — Fullbody 3x/semana (Principiante, Hipertrofia)

**Sesión (repetir 3x/semana con 1 día de descanso entre sesiones):**

| Ejercicio | Series | Reps | Descanso | Progresión |
|---|---|---|---|---|
| Sentadilla con barra o Goblet Squat | 3 | 8–12 | 2 min | +2.5kg cuando se logran 12 reps en todas |
| Press de banca o Flexiones | 3 | 8–12 | 2 min | +2.5kg cuando se logran 12 reps en todas |
| Remo con barra o Mancuerna | 3 | 8–12 | 2 min | +2.5kg cuando se logran 12 reps en todas |
| Peso muerto RDL o Hip thrust | 3 | 10–12 | 2 min | +2.5kg |
| Press militar mancuernas | 2 | 10–12 | 90 seg | +1.25kg |
| Curl con barra + Extensión polea | 2+2 | 12–15 | 60 seg | +1.25kg |
| Plancha | 3 | 30–60 seg | 45 seg | +5 seg/semana |

**Duración estimada:** 55–65 minutos.

---

### PLANTILLA B — Torso/Pierna 4x/semana (Principiante-Intermedio)

**Torso A (Lunes / Jueves):**

| Ejercicio | Series | Reps | Descanso |
|---|---|---|---|
| Press de banca con barra | 4 | 6–10 | 2–3 min |
| Remo con barra | 4 | 6–10 | 2–3 min |
| Press militar con mancuernas | 3 | 8–12 | 2 min |
| Jalón al pecho o Dominadas asistidas | 3 | 8–12 | 2 min |
| Elevaciones laterales | 3 | 12–15 | 60 seg |
| Curl con barra | 3 | 10–12 | 60 seg |
| Extensión en polea | 3 | 10–12 | 60 seg |

**Pierna A (Martes / Viernes):**

| Ejercicio | Series | Reps | Descanso |
|---|---|---|---|
| Sentadilla con barra | 4 | 6–10 | 2–3 min |
| RDL con barra | 4 | 8–10 | 2–3 min |
| Prensa de pierna | 3 | 10–12 | 2 min |
| Sentadilla búlgara | 3 | 10–12 c/lado | 90 seg |
| Extensión de cuádriceps | 3 | 12–15 | 60 seg |
| Curl femoral | 3 | 12–15 | 60 seg |
| Elevación de talones de pie | 4 | 15–20 | 60 seg |

**Nota:** Torso B y Pierna B pueden variar los ejercicios secundarios (press inclinado en lugar de plano, remo en máquina en lugar de barra, etc.) para mayor variedad.

---

### PLANTILLA C — PPL 6 días/semana (Intermedio, Hipertrofia)

**PUSH A (Lunes / Jueves):**

| Ejercicio | Series | Reps | Descanso |
|---|---|---|---|
| Press de banca con barra | 4 | 6–10 | 2–3 min |
| Press inclinado con mancuernas | 3 | 10–12 | 2 min |
| Press militar con barra | 3 | 8–12 | 2 min |
| Elevaciones laterales | 4 | 12–20 | 60 seg |
| Press francés (EZ) | 3 | 10–12 | 90 seg |
| Extensión en polea (cuerda) | 3 | 12–15 | 60 seg |

**PULL A (Martes / Viernes):**

| Ejercicio | Series | Reps | Descanso |
|---|---|---|---|
| Dominadas o Jalón al pecho | 4 | 6–10 | 2–3 min |
| Remo con barra | 4 | 6–10 | 2–3 min |
| Remo en polea baja | 3 | 10–12 | 2 min |
| Face pull | 3 | 15–20 | 60 seg |
| Curl con barra EZ | 3 | 10–12 | 60 seg |
| Curl martillo | 3 | 12–15 | 60 seg |

**LEGS A (Miércoles / Sábado):**

| Ejercicio | Series | Reps | Descanso |
|---|---|---|---|
| Sentadilla con barra | 4 | 6–10 | 2–3 min |
| Prensa de pierna | 3 | 10–12 | 2 min |
| RDL con barra | 4 | 8–12 | 2 min |
| Sentadilla búlgara | 3 | 10–12 c/lado | 90 seg |
| Extensión de cuádriceps | 3 | 12–15 | 60 seg |
| Curl femoral | 3 | 12–15 | 60 seg |
| Hip Thrust | 3 | 12–15 | 90 seg |
| Elevación de talones | 4 | 15–20 | 60 seg |

**Nota:** Las sesiones B (Jueves-Viernes-Sábado) pueden variar ejercicios secundarios para mayor estímulo.

---

### PLANTILLA D — PPL 6 días/semana (Intermedio-Avanzado, Fuerza-Hipertrofia)

Similar a la Plantilla C pero con rep ranges más bajos en los compuestos:

| Sesión | Compuesto principal | Series | Reps | Intensidad |
|---|---|---|---|---|
| Push | Press banca barra | 5 | 4–6 | 82–88% 1RM |
| Pull | Peso muerto o Dominadas | 4–5 | 4–6 | 82–88% 1RM |
| Legs | Sentadilla barra | 5 | 4–6 | 82–88% 1RM |

Los ejercicios accesorios mantienen rep range 8–12.

---

## 6. AJUSTE SEGÚN NIVEL Y OBJETIVO

### Principiante (0–12 meses de entrenamiento)

**Características:** Alta respuesta a cualquier estímulo; fuerza e hipertrofia mejoran con el mismo protocolo; rápida recuperación del SNC; principal limitante es la técnica.

**Recomendaciones:**
- Fullbody 3x/semana o Torso/Pierna 4x/semana.
- Progresión lineal: subir peso cada entrenamiento es posible.
- Priorizar los movimientos fundamentales (sentadilla, press, peso muerto, remo, dominadas).
- Rep range 8–12 para la mayoría de ejercicios.
- Volumen moderado: 10–15 series totales por sesión.
- No llegar al fallo en los primeros meses: dejar siempre 2–3 reps en reserva.

**Evitar:**
- Rutinas de splits avanzados (Weider, PPL 6 días) sin base sólida.
- Exceso de variedad: dominar los ejercicios fundamentales antes de añadir variantes.
- Demasiado volumen desde el inicio.

### Intermedio (1–3 años de entrenamiento consistente)

**Características:** La progresión lineal se ralentiza; necesita periodización; mayor volumen necesario para progresar; puede manejar mayor complejidad.

**Recomendaciones:**
- Torso/Pierna 4 días o PPL 3–6 días.
- Implementar periodización ondulante o por bloques.
- Rep range variado: ciclos de fuerza (4–6 reps) + ciclos de hipertrofia (8–15 reps).
- Comenzar a trackear el volumen semanal por grupo muscular.
- Volumen: 15–20 series por sesión; 10–20 series por músculo/semana.
- Deloads estructurados cada 4–6 semanas.

### Avanzado (3+ años de entrenamiento consistente y bien programado)

**Características:** Progresión muy lenta; necesita periodización sofisticada; alta tolerancia al volumen; recuperación puede ser más lenta.

**Recomendaciones:**
- PPL 6 días o Weider con variantes.
- Periodización por bloques (acumulación → intensificación → peaking).
- Alto volumen: 20–25 series por músculo/semana en mesociclos de volumen.
- Técnicas avanzadas: rest-pause, drop sets, supersets en accesorios.
- Deloads cada 4–6 semanas con reducción de volumen e intensidad.

---

## 7. GESTIÓN DE LA RECUPERACIÓN

### 7.1 Distribución semanal y fatiga sinérgica

Los músculos sinérgicos comparten la carga. Al planificar la semana, considerar:

- **Trapecio superior y deltoides:** fatigados por cualquier press de hombros o remo.
- **Erectores espinales:** fatigados por peso muerto, remos, y sentadillas.
- **Core:** fatigado por casi todos los ejercicios compuestos.
- **Tríceps:** fatigados por cualquier ejercicio de empuje (press de pecho, hombros).
- **Bíceps:** fatigados por todos los ejercicios de tracción.

**Recomendación:** Si la sentadilla es el lunes, no hacer peso muerto el martes (erectores aún fatigados). Dejar al menos 48–72 horas entre sesiones que estresen los mismos grupos sinérgicos.

### 7.2 Indicadores de recuperación insuficiente
- Rendimiento que baja sesión tras sesión (más de 2 sesiones seguidas).
- Dolores articulares persistentes (más allá del DOMS muscular normal).
- Cansancio general y falta de motivación.
- Insomnio o sueño de mala calidad.

**Respuesta:** Reducir el volumen, insertar deload, evaluar sueño y nutrición.

### 7.3 Deload: cuándo y cómo
**Señales para deload:**
- Llevar 6–8 semanas sin deload.
- Rendimiento estancado por 2–3 sesiones consecutivas.
- Fatiga acumulada notable (cansancio, articulaciones, motivación baja).

**Tipos de deload:**
- **Deload de intensidad:** mismo volumen, 50–60% del peso habitual.
- **Deload de volumen:** mismo peso, la mitad de las series.
- **Deload activo:** solo ejercicios ligeros o cardio suave.
- **Descanso completo:** 1 semana sin entrenar (para sobreentrenamiento real).

---

## 8. ERRORES COMUNES EN EL DISEÑO DE RUTINAS

| Error | Problema | Solución |
|---|---|---|
| Demasiados ejercicios por sesión | Sesiones de 2+ horas, calidad baja en las últimas series | Limitar a 5–7 ejercicios por sesión |
| Sin progresión definida | Mesetas frecuentes, entrenamiento sin dirección | Definir progresión antes de empezar |
| Cambiar la rutina cada semana | Sin adaptación posible, no hay progresión real | Mantener la misma rutina 4–8 semanas |
| Ignorar músculos posteriores | Desequilibrios posturales, lesiones de hombro | Igual o más volumen de tracción que de empuje |
| No periodizar | Estancamiento a los 3–6 meses | Implementar mesociclos con objetivo y deloads |
| Entrenar sin descansar | Sobreentrenamiento, regresión de rendimiento | Deloads regulares, 1–2 días de descanso semanal |
| Sin ejercicios de movilidad/calentamiento | Lesiones, movimientos ineficientes | 5–10 min de activación específica antes de cada sesión |
| No registrar los pesos/reps | Sin referencia para progresar | Llevar un diario o app de entrenamiento |
| Volumen excesivo desde el inicio | Lesiones por sobruso, fatiga crónica | Comenzar con MEV y progresar gradualmente |
| Ignorar el deltoides posterior y manguito | Lesiones de hombro a mediano plazo | Incluir Face Pull y pájaros en toda rutina de empuje/jalón |

---

## 9. PREGUNTAS FRECUENTES CON RESPUESTAS TÉCNICAS

**¿Cuántos días por semana debo entrenar?**
Depende de tu disponibilidad y recuperación. 3–4 días es óptimo para la mayoría. Más días no equivale a más resultados si no hay recuperación adecuada.

**¿Es mejor entrenar al fallo muscular?**
El fallo no es necesario en todas las series. Entrenar en RIR 1–3 (dejando 1–3 reps en el tanque) en la mayoría de series produce resultados similares al fallo con menor fatiga acumulada. El fallo puede usarse estratégicamente en la última serie de cada ejercicio o en ejercicios de aislamiento.

**¿Debo cambiar mi rutina frecuentemente?**
No. La variedad por sí sola no produce progresión. Lo que produce resultados es la sobrecarga progresiva. Mantener la misma rutina 4–8 semanas y cambiar cuando el progreso se estanque.

**¿Qué hago si un equipo está ocupado en el gimnasio?**
Usar un ejercicio alternativo equivalente (mismo patrón de movimiento, mismo músculo primario). Ver tabla de alternativas en el documento de ejercicios. La sesión no debe cancelarse por no tener acceso a un equipo específico.

**¿Cuánto volumen es suficiente para ver resultados?**
Para hipertrofia visible: 10–20 series por músculo por semana, con al menos 2x de frecuencia. Comenzar en el rango bajo (10 series) y escalar gradualmente.

**¿Qué es mejor, pesos libres o máquinas?**
Ambos son efectivos. Los pesos libres desarrollan más estabilizadores y coordinación. Las máquinas son más seguras para aprender movimientos, trabajar al fallo, y corregir asimetrías. Una rutina equilibrada incluye ambos.

**¿Es necesario el cardio en una rutina de fuerza/hipertrofia?**
No es obligatorio para los objetivos de composición corporal si la dieta está controlada. Sin embargo, 2–3 sesiones de cardio de baja intensidad por semana mejoran la salud cardiovascular, la recuperación y el bienestar general sin interferir con el entrenamiento de fuerza.

**¿Qué hago si me siento muy adolorido (DOMS)?**
El DOMS (dolor muscular de aparición tardía) es normal y esperado, especialmente al iniciar o cambiar la rutina. Movimiento ligero (caminata, movilidad) acelera la recuperación. Si el dolor persiste más de 5–6 días o es muy intenso, reducir el volumen en la siguiente sesión. El DOMS no es un indicador de la calidad del entrenamiento.

---

*Documento generado para uso como base de conocimiento del asistente de entrenamiento.*
*Versión 1.0 — Mayo 2026*
