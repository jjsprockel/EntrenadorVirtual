# PERIODIZACIÓN DEL ENTRENAMIENTO
## Esquemas, modelos y recomendaciones para planificación a largo plazo

> **Uso para el LLM:** Este documento contiene la lógica completa de periodización. El modelo debe usarlo para: explicar qué es la periodización, recomendar el modelo adecuado según el nivel del usuario, construir bloques de entrenamiento, calcular progresiones de peso e intensidad, y diseñar mesociclos completos con deloads. También sirve para explicar la diferencia entre entrenar para hipertrofia vs. para fuerza máxima.

---

## ÍNDICE

1. [¿Qué es la periodización y por qué importa?](#1-qué-es-la-periodización)
2. [Terminología: Microciclo, Mesociclo, Macrociclo](#2-terminología)
3. [Hipertrofia vs Fuerza: diferencias fundamentales](#3-hipertrofia-vs-fuerza)
4. [Modelo 1: Periodización Lineal](#4-periodización-lineal)
5. [Modelo 2: Periodización Ondulante](#5-periodización-ondulante)
6. [Modelo 3: Periodización por Bloques](#6-periodización-por-bloques)
7. [Modelo 4: Periodización Conjugada](#7-periodización-conjugada)
8. [Cómo elegir el modelo adecuado](#8-cómo-elegir-el-modelo)
9. [Cálculo de cargas e intensidades](#9-cálculo-de-cargas)
10. [Deload: teoría y protocolos](#10-deload)
11. [Ejemplos de macrociclos completos](#11-ejemplos-de-macrociclos)
12. [Señales de progreso y estancamiento](#12-señales-de-progreso)

---

---

## 1. QUÉ ES LA PERIODIZACIÓN

La **periodización** es la organización sistemática y planificada del entrenamiento a lo largo del tiempo, manipulando variables como el volumen, la intensidad y la selección de ejercicios, para maximizar las adaptaciones y prevenir el estancamiento y el sobreentrenamiento.

### Por qué el cuerpo necesita periodización

El cuerpo humano se adapta al estrés (principio de supercompensación de Selye). Cuando se aplica un estímulo de entrenamiento:

1. **Fatiga inmediata:** El rendimiento cae temporalmente.
2. **Recuperación:** El cuerpo repara las estructuras dañadas.
3. **Supercompensación:** El cuerpo se reconstruye a un nivel superior al inicial (para responder mejor al mismo estímulo en el futuro).
4. **Desentrenamiento:** Si no se aplica un nuevo estímulo, el nivel regresa al inicial.

La periodización aprovecha esta curva: aplicar el siguiente estímulo en el momento óptimo de la supercompensación, antes de que el nivel regrese al basal.

### Qué pasa sin periodización

Si el estímulo es siempre igual (mismo peso, mismas reps, misma rutina), el cuerpo se adapta completamente y deja de responder. Esto se llama **stagnation** o **meseta**. Para romperla, el estímulo debe cambiar: más peso, más volumen, o un tipo diferente de estrés.

### Qué NO es periodización

- Cambiar ejercicios cada semana sin lógica (eso es variedad sin progresión).
- Hacer siempre lo mismo esperando resultados diferentes.
- Descansar más de lo necesario por miedo al sobreentrenamiento.

---

## 2. TERMINOLOGÍA

### Microciclo
La unidad mínima de planificación. Normalmente equivale a **1 semana**.

Contiene: los entrenamientos de la semana, el volumen e intensidad de cada sesión, y los días de descanso.

### Mesociclo
Agrupación de microciclos con un objetivo específico. Normalmente **4–6 semanas** (aunque puede llegar a 8 semanas para avanzados).

**Tipos de mesociclo:**
- **Mesociclo de acumulación:** alto volumen, intensidad moderada. Objetivo: aumentar la capacidad de trabajo.
- **Mesociclo de intensificación:** bajo volumen, alta intensidad. Objetivo: expresar la fuerza ganada.
- **Mesociclo de peaking:** mínimo volumen, máxima intensidad. Objetivo: pico de rendimiento.
- **Mesociclo de deload/transición:** volumen e intensidad reducidos. Objetivo: recuperación.

### Macrociclo
El plan de entrenamiento completo. Normalmente **12–24 semanas** (3–6 meses) o incluso un año completo para atletas.

Contiene: varios mesociclos ordenados lógicamente, cada uno preparando al siguiente.

### Estructura típica de un macrociclo para hipertrofia:

```
Semanas 1–4:   Mesociclo de Acumulación (volumen alto, 8–15 reps)
Semanas 5–8:   Mesociclo de Intensificación (volumen medio, 5–8 reps)
Semanas 9–12:  Mesociclo de Fuerza (volumen bajo, 3–5 reps)
Semana 13:     Deload
Semana 14:     Inicio del nuevo macrociclo (volumen algo mayor)
```

---

## 3. HIPERTROFIA VS FUERZA: DIFERENCIAS FUNDAMENTALES

### ¿Qué produce hipertrofia muscular?

La hipertrofia (aumento del tamaño del músculo) se produce por tres mecanismos:

1. **Tensión mecánica:** El músculo bajo carga genera tensión mecánica que estimula la síntesis de proteínas. Es el driver más importante. Se maximiza con pesos moderados-altos y rango de movimiento completo.

2. **Daño muscular:** El estiramiento bajo carga (fase excéntrica lenta) produce microdesgarros que desencadenan respuesta de reparación y crecimiento. No es indispensable pero contribuye, especialmente con ejercicios nuevos.

3. **Estrés metabólico:** La acumulación de metabolitos (lactato, iones de hidrógeno) durante series de muchas repeticiones con poco descanso produce "pump" y señalización anabólica. Es un driver secundario.

**Parámetros óptimos para hipertrofia:**
- Intensidad: 60–80% 1RM (rango de 8–15 repeticiones)
- Volumen: 10–25 series efectivas por músculo/semana
- Frecuencia: 2x/semana por músculo (mínimo)
- Descanso: 60–120 segundos entre series
- RIR: 1–3 (cerca del fallo pero sin llegar)
- Énfasis: rango de movimiento completo, excéntrico controlado

### ¿Qué produce fuerza máxima?

La fuerza máxima se produce principalmente por **adaptaciones neurológicas:**

1. **Reclutamiento de unidades motoras:** Entrenamiento pesado enseña al SNC a activar más fibras simultáneamente.
2. **Sincronización:** Las fibras aprenden a contraerse al mismo tiempo (mayor fuerza pico).
3. **Coordinación intermuscular:** Los músculos antagonistas aprenden a relajarse para permitir mayor fuerza.
4. **Hipertrofia de fibras de tipo II:** Las fibras de contracción rápida (más fuertes) crecen con estímulos de alta intensidad.

**Parámetros óptimos para fuerza máxima:**
- Intensidad: 80–100% 1RM (rango de 1–6 repeticiones)
- Volumen: moderado-bajo (series de calidad sobre cantidad)
- Frecuencia: 2–4x/semana para los levantamientos principales
- Descanso: 3–5 minutos entre series (recuperación del SNC)
- RIR: 0–2 en series de trabajo (más cerca del máximo)
- Énfasis: especificidad (entrenar el levantamiento exacto que se quiere mejorar)

### Diferencias clave en la práctica

| Variable | Hipertrofia | Fuerza |
|---|---|---|
| Rango de reps | 8–15 (también efectivo 5–30) | 1–6 |
| Intensidad (% 1RM) | 60–80% | 80–100% |
| Series/ejercicio | 3–4 | 4–6 |
| Descanso | 60–120 seg | 3–5 min |
| Velocidad concéntrica | Controlada (1–2 seg) | Explosiva |
| Velocidad excéntrica | Lenta (2–4 seg) | Controlada |
| Selección ejercicios | Variedad de ejercicios y ángulos | Especificidad (pocos ejercicios, bien dominados) |
| Número de ejercicios | Mayor variedad | Menor variedad |
| Foco en la sensación | Conexión mente-músculo | Mover el peso |
| Importancia técnica | Alta (ROM completo) | Máxima (eficiencia mecánica) |

### ¿Son compatibles hipertrofia y fuerza?

Sí, son complementarias. La hipertrofia proporciona el "potencial" (músculo más grande = más fibras disponibles). La fuerza desarrolla la capacidad de expresar ese potencial (eficiencia neural para activar esas fibras).

La mayoría de los atletas naturales se beneficia de **bloques alternados:** periodos de hipertrofia → periodos de fuerza → hipertrofia, en ciclos.

---

## 4. PERIODIZACIÓN LINEAL

### Concepto

El modelo más clásico y sencillo. La **intensidad aumenta progresivamente** (semana a semana o bloque a bloque) mientras el **volumen disminuye** en la misma proporción.

Se llama "lineal" porque la progresión de una variable sigue una curva aproximadamente lineal a lo largo del tiempo.

### Progresión lineal simple (para principiantes)

La forma más básica: añadir peso o repeticiones en cada sesión.

**Ejemplo para Sentadilla (principiante):**
```
Sesión 1: 3×5 @ 40kg
Sesión 2: 3×5 @ 42.5kg
Sesión 3: 3×5 @ 45kg
Sesión 4: 3×5 @ 47.5kg
...
```

Cuando no se puede completar el objetivo, se repite el mismo peso en la siguiente sesión. Si se falla 3 veces seguidas con el mismo peso: es señal de que se necesita un deload o una periodización más sofisticada.

**¿Cuánto subir por sesión?**
- Sentadilla, Peso muerto, Prensa: +2.5 kg/sesión
- Press banca, Press militar: +1.25 kg/sesión (o cada 2 sesiones)
- Ejercicios de aislamiento: +0.5–1.25 kg/sesión
- Regla: si no hay micro-placas disponibles, subir cada 2 sesiones exitosas.

### Periodización lineal por mesociclos (para intermedios)

Cada mesociclo de 4 semanas tiene un rep range diferente, con intensidad creciente:

```
Mesociclo 1 (4 semanas): 4×12 @ 65% 1RM — Hipertrofia + adaptación
Mesociclo 2 (4 semanas): 4×8  @ 75% 1RM — Hipertrofia-Fuerza
Mesociclo 3 (4 semanas): 4×5  @ 85% 1RM — Fuerza
Mesociclo 4 (4 semanas): 4×3  @ 90% 1RM — Fuerza máxima
Semana 17:               Deload / Test de 1RM
```

Dentro de cada mesociclo, el peso sube semana a semana:
```
Mes 3 (4×5): Semana 1: 80%, Semana 2: 82%, Semana 3: 85%, Semana 4: 87%
```

### Ventajas de la periodización lineal
- Simple de entender y ejecutar.
- Efectiva para principiantes e intermedios.
- Progresión predecible y motivante.

### Limitaciones
- A largo plazo (6–12 meses), la intensidad no puede seguir subiendo indefinidamente.
- Solo se puede optimizar una cualidad a la vez.
- Puede volverse monótona.
- Los intermedios y avanzados se estancan más rápido con este modelo.

---

## 5. PERIODIZACIÓN ONDULANTE

### Concepto

En lugar de progresar linealmente, el volumen y la intensidad **varían (ondean) dentro de la misma semana o mes**. Esto permite trabajar múltiples cualidades (fuerza, hipertrofia) simultáneamente y previene la adaptación completa.

**Tipos:**
- **Ondulante Diaria (DUP - Daily Undulating Periodization):** el rep range cambia cada sesión del mismo músculo.
- **Ondulante Semanal:** el rep range cambia cada semana.

### DUP — Periodización Ondulante Diaria

Cada sesión tiene un estímulo diferente:

**Ejemplo PPL con DUP:**
```
Lunes (Push A)   → Énfasis Fuerza: 4×4–6 @ 85% 1RM
Jueves (Push B)  → Énfasis Hipertrofia: 4×10–12 @ 70% 1RM

Martes (Pull A)  → Énfasis Fuerza: 4×4–6 @ 85% 1RM
Viernes (Pull B) → Énfasis Hipertrofia: 4×10–12 @ 70% 1RM

Miércoles (Legs A) → Énfasis Fuerza: 4×4–6 @ 85% 1RM
Sábado (Legs B)    → Énfasis Hipertrofia: 4×10–12 @ 70% 1RM
```

**Progresión dentro del DUP:**
El peso en cada "tipo" de sesión sube semana a semana:
```
Semana 1: Fuerza @ 82.5% | Hipertrofia @ 67.5%
Semana 2: Fuerza @ 85%   | Hipertrofia @ 70%
Semana 3: Fuerza @ 87.5% | Hipertrofia @ 72.5%
Semana 4: Deload
```

### DUP con 3 estímulos

Para 3 sesiones por músculo/semana:
```
Sesión 1: Fuerza    → 4×4–6 @ 85–90% 1RM
Sesión 2: Hipertrofia → 4×8–12 @ 70–75% 1RM
Sesión 3: Acumulación → 3×15–20 @ 55–65% 1RM
```

### Ondulante Semanal

Cada semana entera tiene un objetivo diferente, rotando entre bloques de hipertrofia, fuerza y potencia/resistencia:

```
Semana 1: Acumulación   — 4×15 @ 60%
Semana 2: Hipertrofia   — 4×10 @ 70%
Semana 3: Fuerza        — 4×6  @ 80%
Semana 4: Deload        — 3×8  @ 55%
(Repetir el ciclo con cargas ligeramente mayores)
```

### Ventajas de la periodización ondulante
- Desarrolla varias cualidades simultáneamente.
- Mayor variedad de estímulos: menos adaptación, menos monotonía.
- Evidencia científica sugiere resultados ligeramente superiores en intermedios y avanzados vs. lineal.
- Más sostenible a largo plazo.

### Limitaciones
- Más compleja de planificar y ejecutar.
- Puede ser confusa para principiantes.
- Requiere mayor conciencia del nivel de fatiga acumulada.

---

## 6. PERIODIZACIÓN POR BLOQUES

### Concepto

Desarrollado por Verkhoshansky y popularizado por Bondarchuk. El entrenamiento se divide en **bloques secuenciales**, cada uno con un objetivo único y específico. Cada bloque prepara las condiciones para el siguiente.

**Principio clave:** La concentración de un único estímulo por bloque produce adaptaciones más profundas que el estímulo mixto.

### Los tres bloques básicos

#### Bloque de Acumulación (4–6 semanas)
**Objetivo:** Aumentar el volumen de trabajo total. Construir la "base".

Características:
- Volumen: alto (20–25 series/músculo/semana)
- Intensidad: moderada (60–75% 1RM)
- Rep range: 10–15
- Selección: amplia variedad de ejercicios, múltiples ángulos
- Descanso: 60–90 seg (alta densidad de entrenamiento)
- Sensación esperada: DOMS frecuente, fatiga acumulada al final del bloque

#### Bloque de Intensificación (3–4 semanas)
**Objetivo:** Convertir el volumen acumulado en fuerza y calidad muscular.

Características:
- Volumen: medio (15–18 series/músculo/semana)
- Intensidad: alta (75–87% 1RM)
- Rep range: 6–10
- Selección: menos ejercicios, más enfocados en los compuestos principales
- Descanso: 90 seg – 3 min
- Sensación esperada: mejora notable en el rendimiento, menos fatiga que acumulación

#### Bloque de Realización / Peaking (2–3 semanas)
**Objetivo:** Expresar al máximo la fuerza ganada. Pico de rendimiento.

Características:
- Volumen: bajo (10–12 series/músculo/semana)
- Intensidad: muy alta (87–100% 1RM)
- Rep range: 1–5
- Selección: solo los ejercicios principales (sentadilla, press, peso muerto)
- Descanso: 3–5 min
- Sensación esperada: máxima energía y rendimiento

#### Deload / Transición (1 semana)
Entre bloques, semana de descanso activo o transición.

### Ejemplo de macrociclo por bloques (16 semanas para Sentadilla):

```
BLOQUE 1 — Acumulación (Semanas 1–5)
  Sem 1: Sentadilla 5×12 @ 65%
  Sem 2: Sentadilla 5×12 @ 67.5%
  Sem 3: Sentadilla 5×12 @ 70%
  Sem 4: Sentadilla 6×12 @ 70%
  Sem 5: Sentadilla 6×12 @ 72.5%

DELOAD (Semana 6)
  Sentadilla 3×8 @ 55%

BLOQUE 2 — Intensificación (Semanas 7–10)
  Sem 7: Sentadilla 5×8 @ 75%
  Sem 8: Sentadilla 5×8 @ 77.5%
  Sem 9: Sentadilla 4×6 @ 82%
  Sem 10: Sentadilla 4×6 @ 85%

DELOAD (Semana 11)
  Sentadilla 3×5 @ 65%

BLOQUE 3 — Peaking (Semanas 12–15)
  Sem 12: Sentadilla 4×4 @ 87.5%
  Sem 13: Sentadilla 4×3 @ 90%
  Sem 14: Sentadilla 3×2 @ 92.5%
  Sem 15: Sentadilla 3×1 @ 95%+

TEST DE 1RM (Semana 16)
```

### Ventajas de la periodización por bloques
- Adaptaciones más profundas por la concentración del estímulo.
- Muy efectiva para atletas que necesitan un pico de rendimiento en una fecha específica.
- Estructura clara que facilita la planificación a largo plazo.

### Limitaciones
- Requiere mayor planificación anticipada.
- Durante el bloque de fuerza, la hipertrofia es secundaria (y viceversa).
- No es óptima para quien no puede tolerar el alto volumen del bloque de acumulación.

---

## 7. PERIODIZACIÓN CONJUGADA

### Concepto

Desarrollado por Louie Simmons (Westside Barbell) basado en el método soviético. Entrena **todas las cualidades simultáneamente**, asignando días diferentes a intensidades diferentes dentro de la misma semana.

**Modelo clásico (Westside para powerlifting):**
```
Lunes:   Método de Esfuerzo Máximo (ME) — Tren superior
         Trabajo al máximo en un levantamiento variante
Miércoles: Método de Esfuerzo Dinámico (DE) — Tren inferior
         Trabajo explosivo al 50–60% con velocidad máxima
Viernes: Método de Esfuerzo Máximo (ME) — Tren inferior
Domingo: Método de Esfuerzo Dinámico (DE) — Tren superior
```

### Aplicación para el usuario de gimnasio general

El modelo conjugado puro es complejo y específico para powerlifters. Para el gimnasio general, se puede adaptar como un "mini-conjugado":

```
Sesión pesada (ME): 4×3–5 @ 85–90% en el compuesto principal
Sesión ligera/explosiva (SE): 5×5 @ 50–60% con velocidad máxima + volumen accesorios
Sesión moderada (RE): 4×8–10 @ 70–75% + alto volumen accesorios
```

### Ventajas
- Nunca se pierde ninguna cualidad (siempre se trabajan fuerza, potencia e hipertrofia).
- Alta variedad de estímulos.

### Limitaciones
- Muy complejo para principiantes.
- La aplicación original (Westside) es específica para powerlifting competitivo.
- Difícil de sistematizar para el usuario general sin guía experta.

---

## 8. CÓMO ELEGIR EL MODELO ADECUADO

### Por nivel de entrenamiento

| Nivel | Experiencia | Modelo recomendado | Notas |
|---|---|---|---|
| Principiante | 0–12 meses | Progresión lineal simple | Puede progresar en cada sesión |
| Principiante-Intermedio | 12–24 meses | Lineal por mesociclos | Progresar semanalmente |
| Intermedio | 2–3 años | Ondulante (DUP) o Bloques | Requiere más variabilidad |
| Avanzado | 3+ años | Bloques o Conjugado | Ciclos largos de 16–24 semanas |

### Por objetivo

**Solo hipertrofia:**
- Prioritar ondulante semanal o lineal por bloques (acumulación → intensificación).
- Rep ranges de 6–20 reps, mayor énfasis en 8–15.
- Volumen alto como driver principal.

**Solo fuerza máxima:**
- Progresión lineal o bloques con peaking.
- Rep ranges de 1–6, intensidades > 80% 1RM.
- Intensidad como driver principal.

**Fuerza + Hipertrofia (mixto):**
- DUP o bloques alternados (hipertrofia → fuerza → hipertrofia).
- La combinación es la más usada por el gimnasio general.

**Competición o fecha objetivo:**
- Periodización por bloques con peaking planificado.
- Trabajar hacia atrás desde la fecha objetivo para definir los bloques.

### Por disponibilidad de tiempo

| Días/semana | Mejor modelo | Justificación |
|---|---|---|
| 2–3 días | Fullbody + progresión lineal | Frecuencia alta por músculo compensa el volumen bajo |
| 4 días | Ondulante semanal con Upper/Lower | Equilibrio entre variedad y recuperación |
| 5–6 días | DUP o Bloques | Mayor volumen permite periodización más sofisticada |

---

## 9. CÁLCULO DE CARGAS E INTENSIDADES

### Estimar el 1RM

Si no se tiene el 1RM medido, se puede estimar a partir del rendimiento habitual:

**Fórmula de Epley (la más usada):**
```
1RM estimado = Peso × (1 + Reps/30)
```

Ejemplos:
- 80 kg × 10 reps → 1RM ≈ 80 × (1 + 10/30) = 80 × 1.333 = 106.7 kg
- 100 kg × 5 reps → 1RM ≈ 100 × (1 + 5/30) = 100 × 1.167 = 116.7 kg
- 60 kg × 15 reps → 1RM ≈ 60 × (1 + 15/30) = 60 × 1.5 = 90 kg

*Nota: La fórmula de Epley es menos precisa para reps bajas (1–3) y muy alta (>20). Es más confiable en el rango de 5–12 reps.*

**Fórmula de Brzycki (alternativa):**
```
1RM = Peso / (1.0278 – 0.0278 × Reps)
```

**Tabla de porcentajes de 1RM y repeticiones correspondientes:**

| % 1RM | Reps máximas aproximadas |
|---|---|
| 100% | 1 |
| 97% | 2 |
| 94% | 3 |
| 91% | 4 |
| 87% | 5 |
| 85% | 6 |
| 82% | 7 |
| 79% | 8 |
| 76% | 9 |
| 74% | 10 |
| 70% | 12 |
| 65% | 15 |
| 60% | 20 |

*Nota: Estos valores varían por persona, ejercicio y nivel de fatiga.*

### Calcular el peso de trabajo a partir del % objetivo

```
Peso de trabajo = 1RM estimado × % objetivo
```

Ejemplo: 1RM estimado de sentadilla = 100 kg
- Sesión de hipertrofia al 70%: 100 × 0.70 = **70 kg**
- Sesión de fuerza al 85%: 100 × 0.85 = **85 kg**
- Sesión de peaking al 92%: 100 × 0.92 = **92 kg**

### Sugeridor de incremento de peso (lógica para el app)

El sistema debe sugerir incremento cuando:
1. El usuario completó **todos los sets en el rango objetivo** durante las **últimas 2 sesiones consecutivas**.
2. El RIR percibido fue ≥ 2 (quedaban reps en el tanque).

**Incremento sugerido según el ejercicio:**

| Tipo de ejercicio | Incremento sugerido |
|---|---|
| Grandes compuestos (sentadilla, peso muerto, barra) | +2.5 kg |
| Compuestos medianos (press banca, press hombros, remos) | +1.25–2.5 kg |
| Ejercicios de aislamiento (curl, extensión, elevaciones) | +0.5–1.25 kg |
| Ejercicios de máquina | +2.5–5 kg (según el equipo) |

**El sistema NO debe sugerir incremento cuando:**
- El usuario falló algún set en la última sesión.
- El usuario completó los sets pero indicó RIR 0 (fallo muscular).
- El usuario no ha entrenado ese ejercicio en más de 2 semanas.

**El sistema debe sugerir reducción cuando:**
- El usuario falló los mismos sets en 2 sesiones consecutivas.
- Reducción: 5–10% del peso actual.

---

## 10. DELOAD: TEORÍA Y PROTOCOLOS

### ¿Qué es un deload?

Un **deload** es una semana (o período corto) de entrenamiento con volumen o intensidad reducidos, diseñado para permitir la recuperación completa del sistema nervioso, las articulaciones, los tendones y el músculo.

No es una semana "perdida": es parte del ciclo de supercompensación.

### Cuándo hacer deload

**Programado (mejor opción):** Cada 4–8 semanas, independientemente de cómo se sienta.
- Principiantes: cada 6–8 semanas.
- Intermedios: cada 4–6 semanas.
- Avanzados: cada 4 semanas.

**Por señales de fatiga:**
- Rendimiento que cae 2–3 sesiones consecutivas sin causa obvia.
- Articulaciones que duelen persistentemente.
- Motivación muy baja para entrenar.
- Sueño perturbado, irritabilidad.
- Sensación de fuerza/rendimiento que "se va para atrás".

### Tipos de deload

#### Deload de Volumen (más recomendado)
- Mantener el **mismo peso** (misma intensidad).
- Reducir las **series a la mitad** (o 40%).
- Ejemplo: 4×10 normal → 2×10 en deload.
- Ventaja: se mantiene el peso para no perder la adaptación neuromuscular.

#### Deload de Intensidad
- Mantener el **mismo número de series**.
- Reducir el **peso al 50–60%** del habitual.
- Ejemplo: 4×8 @ 80kg normal → 4×8 @ 45kg en deload.

#### Deload Activo
- Reducir tanto el volumen como la intensidad.
- Solo ejercicios de movilidad, cardio suave, yoga.
- Para fatiga muy acumulada o señales de sobreentrenamiento real.

#### Descanso Completo
- 1 semana sin entrenar.
- Solo cuando hay lesión activa, enfermedad, o sobreentrenamiento severo.
- Las ganancias no se pierden en 1 semana; el glucógeno muscular tarda 2–3 semanas en agotarse, y la atrofia muscular significativa solo ocurre después de 2–4 semanas de inactividad.

### Qué hacer durante el deload
- Mantener la frecuencia de entrenamiento (ir al gym igual).
- Reducir la carga según el protocolo elegido.
- Puede ser buen momento para trabajo de movilidad, técnica con pesos ligeros, y actividades de recuperación activa.
- No aprovechar el deload para "compensar" con más cardio intenso: eso anula el propósito.

---

## 11. EJEMPLOS DE MACROCICLOS COMPLETOS

### Macrociclo A: 12 semanas para principiante (Hipertrofia general)

**Objetivo:** Primer programa estructurado. Énfasis en aprender técnica y generar adaptación muscular inicial.
**Estructura:** Fullbody 3x/semana
**Periodización:** Lineal simple

```
BLOQUE 1 (Semanas 1–4): Adaptación
  Series × Reps: 3×12 en todos los compuestos
  % 1RM: 60–65%
  Progresión: +2.5 kg en compuestos grandes si se completan todos los sets

BLOQUE 2 (Semanas 5–8): Desarrollo
  Series × Reps: 3–4×10 en compuestos
  % 1RM: 65–72%
  Progresión: +2.5 kg en compuestos grandes / +1.25 en pequeños

BLOQUE 3 (Semanas 9–12): Intensificación
  Series × Reps: 4×8 en compuestos
  % 1RM: 72–80%
  Progresión: +2.5 kg cuando se completan todos los sets

SEMANA DE DELOAD (post-bloque 3):
  Series: la mitad de lo habitual
  % 1RM: 55–60%
```

---

### Macrociclo B: 16 semanas para intermedio (Fuerza + Hipertrofia)

**Objetivo:** Mejorar fuerza máxima en los levantamientos principales mientras se mantiene el desarrollo muscular.
**Estructura:** Torso/Pierna 4x/semana o PPL 6x/semana
**Periodización:** Lineal por mesociclos con deloads

```
MESOCICLO 1 (Semanas 1–4): Hipertrofia base
  Compuestos principales: 4×10 @ 67–72%
  Accesorios: 3×12–15
  Deload: Semana 4

MESOCICLO 2 (Semanas 5–8): Hipertrofia-Fuerza
  Compuestos principales: 4×8 @ 72–78%
  Accesorios: 3×10–12
  Deload: Semana 8

MESOCICLO 3 (Semanas 9–12): Fuerza
  Compuestos principales: 5×5 @ 78–85%
  Accesorios: 3×8–10
  Deload: Semana 12

MESOCICLO 4 (Semanas 13–16): Peaking
  Compuestos principales: 4–5×3 @ 85–92%
  Accesorios: 2×8 (mantenimiento)
  Semana 16: Test de 1RM + Deload
```

---

### Macrociclo C: 12 semanas para intermedio (DUP — Ondulante diaria)

**Objetivo:** Desarrollo simultáneo de hipertrofia y fuerza con máxima variedad de estímulos.
**Estructura:** PPL 6 días (A y B de cada sesión)
**Periodización:** DUP — cada semana sube la carga en cada tipo de sesión

```
CONFIGURACIÓN SEMANAL:
  Lunes (Push A)    → Fuerza: 4×5 @ semana 1: 80%, sem 2: 82%, etc.
  Jueves (Push B)   → Hipertrofia: 4×10 @ semana 1: 68%, sem 2: 70%, etc.

  Martes (Pull A)   → Fuerza: 4×5 @ progresión igual
  Viernes (Pull B)  → Hipertrofia: 4×10 @ progresión igual

  Miércoles (Legs A) → Fuerza: 4×5 @ progresión igual
  Sábado (Legs B)    → Hipertrofia: 4×10 @ progresión igual

PROGRESIÓN (por tipo de sesión):
  Fuerza: +2.5% 1RM / semana en los compuestos principales
  Hipertrofia: +2.5% 1RM / semana + intentar 1 rep más cuando el % se vuelve "fácil"

DELOADS: Semana 4 y Semana 8
  Reducir volumen al 50% / Mantener el mismo % de trabajo

SEMANA 12: Semana de test / evaluación de 1RM
```

---

### Macrociclo D: 20 semanas para avanzado (Bloques completos)

**Objetivo:** Máxima fuerza en sentadilla, press banca y peso muerto. Hipertrofia secundaria.
**Estructura:** PPL especializado
**Periodización:** Bloques (Acumulación → Intensificación → Peaking)

```
BLOQUE 1: ACUMULACIÓN (Semanas 1–6)
  Sentadilla: 6×10 @ 65–72%, subiendo 2.5% cada semana
  Press banca: 6×10 @ 65–72%
  Peso muerto: 5×8 @ 65–72%
  Accesorios: alto volumen (15–20 series/músculo/semana)
  Deload: Semana 6

BLOQUE 2: INTENSIFICACIÓN (Semanas 7–12)
  Sentadilla: 5×6 @ 77–85%, subiendo 2.5% cada semana
  Press banca: 5×6 @ 77–85%
  Peso muerto: 4×5 @ 77–85%
  Accesorios: volumen medio (12–15 series/músculo/semana)
  Deload: Semana 12

BLOQUE 3: PEAKING (Semanas 13–18)
  Sentadilla: 5×3 @ 87–93%, subiendo semanalmente
  Press banca: 5×3 @ 87–93%
  Peso muerto: 3×2 @ 87–93%
  Accesorios: volumen bajo (8–10 series/músculo/semana, solo mantenimiento)
  Deload: Semana 18

SEMANAS 19–20: Test de 1RM y descanso
```

---

## 12. SEÑALES DE PROGRESO Y ESTANCAMIENTO

### Señales de progreso real
- Los pesos usados aumentan gradualmente en los ejercicios principales.
- Se logran más repeticiones con el mismo peso.
- El volumen total semanal (series × reps × kg) aumenta.
- La recuperación entre series se acelera (se necesita menos tiempo de descanso para el mismo rendimiento).
- La ejecución técnica mejora (más control, mejor ROM).
- El cuerpo visualmente cambia (más músculo visible, mejor definición).

### Señales de estancamiento
- El peso en los ejercicios principales no ha subido en 3–4 semanas seguidas.
- El rendimiento baja de sesión en sesión (no sube).
- La fatiga muscular dura más de 72 horas después de cada sesión.
- Articulaciones que duelen de forma persistente.

### Causas frecuentes de estancamiento y soluciones

| Causa | Señal | Solución |
|---|---|---|
| Falta de progresión en el peso | Mismo peso por semanas | Cambiar a periodización más estructurada |
| Volumen insuficiente | Sin DOMS, sin "sensación" de trabajo | Añadir 2–3 series por músculo/semana |
| Volumen excesivo | Fatiga acumulada, rendimiento cae | Hacer deload, reducir volumen |
| Nutrición insuficiente | Sin energía, recuperación lenta | Revisar ingesta calórica y proteica |
| Sueño insuficiente | Cansancio constante | Priorizar 7–9 horas de sueño |
| Misma rutina por demasiado tiempo | Sin novedad, sin adaptación | Cambiar al siguiente mesociclo o variar ejercicios |
| Técnica deficiente | Limitación de carga por técnica | Volver a pesos más ligeros y corregir el patrón |

### Protocolo de evaluación de progreso (sugerido para el app)

Cada 4–6 semanas (al final de cada mesociclo):
1. Registrar el peso máximo usado × reps en los ejercicios principales.
2. Comparar con el inicio del mesociclo.
3. Calcular el volumen total (series × reps × kg por sesión) y comparar.
4. Revisar el 1RM estimado (fórmula de Epley) y comparar.
5. Si el 1RM estimado subió ≥5%: el mesociclo fue exitoso.
6. Si el 1RM estimado no subió: evaluar causas y ajustar el siguiente mesociclo.

---

## APÉNDICE: REFERENCIA RÁPIDA DE PARÁMETROS

### Por objetivo principal

| Objetivo | % 1RM | Reps/serie | Series/ejercicio | Descanso | Frecuencia/músculo |
|---|---|---|---|---|---|
| Fuerza máxima | 85–100% | 1–5 | 4–6 | 3–5 min | 2–4x |
| Fuerza-Hipertrofia | 75–85% | 5–8 | 4–5 | 2–3 min | 2–3x |
| Hipertrofia | 65–75% | 8–12 | 3–4 | 90–120 seg | 2x |
| Hipertrofia volumen | 55–65% | 12–20 | 3–4 | 60–90 seg | 2x |
| Resistencia muscular | 40–60% | 20–30+ | 2–3 | 30–60 seg | 2–3x |

### Reglas de oro de la periodización

1. **Siempre hay un objetivo por bloque.** No intentar ser el más fuerte Y el más grande al mismo tiempo en el mismo bloque.
2. **El volumen precede a la intensidad.** Construir la base antes de añadir intensidad.
3. **La especificidad gana.** Cerca de un objetivo de fuerza, entrenar con los mismos movimientos y rangos del objetivo.
4. **La fatiga enmascara el rendimiento.** Un atleta fatigado parece más débil de lo que es: el deload revela el progreso real.
5. **La progresión debe ser mensurable.** Si no se puede medir, no se puede gestionar.
6. **El peor programa ejecutado con consistencia supera al mejor programa ejecutado de forma intermitente.**

---

*Documento generado para uso como base de conocimiento del asistente de entrenamiento.*
*Versión 1.0 — Mayo 2026*
