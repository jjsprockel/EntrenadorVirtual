# EntrenadorVirtual

Aplicación web progresiva (PWA) para el seguimiento y planificación de entrenamientos de musculación. Diseñada con enfoque **mobile-first**, permite gestionar rutinas, registrar sesiones en tiempo real con lógica de sobrecarga progresiva y acceder a una base de conocimiento de ejercicios con técnica detallada.

---

## Objetivos del proyecto

### Objetivo principal
Construir una herramienta de entrenamiento personal que funcione completamente offline, persista los datos del usuario en el dispositivo sin depender de un servidor externo, y aplique principios de periodización y sobrecarga progresiva de forma automática.

### Objetivos específicos
- Centralizar en un solo lugar la **biblioteca de ejercicios** con instrucciones técnicas, músculos trabajados y variantes
- Permitir crear **rutinas estructuradas** (Fullbody, Torso/Pierna, PPL, Weider, personalizada) con configuración por día y tipo de periodización
- Ofrecer una **pantalla de sesión activa** que guíe el entrenamiento en tiempo real: orden de ejercicios, registro de series/reps/RIR, temporizador de descanso y sugerencia de carga basada en la sesión anterior
- Sentar las bases para integrar un **coach de IA** (Google Gemini) que analice historial y ofrezca recomendaciones personalizadas

---

## Metodología de desarrollo

El proyecto se planificó en **8 fases incrementales**, cada una entregando valor funcional antes de avanzar a la siguiente:

| Fase | Nombre | Estado |
|------|--------|--------|
| 1 | Fundamentos — router, design system, tipos, stores | ✅ Completa |
| 2 | Base de conocimiento — parser de markdown, biblioteca de ejercicios | ✅ Completa |
| 3 | Persistencia — IndexedDB, perfil de usuario, 1RM | ✅ Completa |
| 4 | Constructor de rutinas — wizard de 5 pasos, periodización | ✅ Completa |
| 5 | Sesión activa — SetLogger, RestTimer, sobrecarga progresiva | ✅ Completa |
| 6 | Dashboard de progreso — gráficos de volumen y rendimiento | 🔜 Próxima |
| 7 | Coach IA — integración con Gemini API, chat contextual | 🔜 Próxima |
| 8 | PWA — service worker, instalación offline, auditoría Lighthouse | 🔜 Próxima |

### Principios de diseño aplicados
- **Mobile-first**: ancho mínimo de referencia 375px; BottomNav en móvil, Sidebar en desktop
- **Offline-first**: todo el estado se persiste en IndexedDB mediante Zustand + idb
- **Sin backend propio**: los datos viven en el dispositivo del usuario; la única red necesaria es la API de IA (opcional)
- **Conocimiento como contenido**: los ejercicios y guías de periodización se almacenan en archivos `.md` que se parsean en tiempo de ejecución, facilitando la actualización sin recompilar

---

## Funcionalidades actuales (Fases 1–5)

### Biblioteca de ejercicios
- 59 ejercicios organizados por grupo muscular (Pecho, Hombro, Espalda, Bíceps, Tríceps, Piernas, Core, Glúteos)
- Ficha completa por ejercicio: imagen, nombre ES/EN, músculos primarios y secundarios, patrón de movimiento, equipo requerido, nivel, pasos de ejecución numerados, consejos de técnica, errores comunes y alternativas
- Búsqueda por nombre/código, filtro por grupo muscular y nivel

### Constructor de rutinas (wizard 5 pasos)
1. **Configuración general**: nombre, objetivo (hipertrofia/fuerza/mixto/resistencia), nivel, días/semana, duración
2. **Estructura**: selección de plantilla (Fullbody, Torso/Pierna, PPL, Weider, personalizada)
3. **Días**: editor por día con ExercisePicker, series/reps/RIR/descanso configurables por ejercicio
4. **Periodización**: ninguna, lineal, ondulante o por bloques (con configuración específica para cada tipo)
5. **Revisión**: resumen completo y opción de activar la rutina

### Sesión activa
- Selección del día a entrenar con sugerencia automática (siguiente día no entrenado recientemente)
- Registro libre (se puede saltar al ejercicio que se quiera sin seguir el orden)
- **Sobrecarga progresiva automática**: si en la sesión anterior se alcanzó el tope de repeticiones con el RIR objetivo, se sugiere +2,5 kg
- Temporizador de descanso configurable con barra de progreso
- Ajuste de series en tiempo real (+/−) sin salir de la pantalla
- Agregar o quitar ejercicios durante la sesión en curso
- Link directo a la ficha técnica del ejercicio (abre en pestaña nueva)
- Pantalla de finalización con volumen total y duración

### Gestión del perfil
- Datos personales, nivel, objetivo, unidades (kg/lb), incremento mínimo de carga
- Estimaciones de 1RM por ejercicio (para futuras sugerencias de % de carga)
- Exportar/importar datos (JSON) y reset completo

---

## Stack técnico

| Capa | Tecnología | Justificación |
|------|-----------|---------------|
| UI Framework | React 18 + TypeScript | Ecosistema maduro, tipado estricto |
| Build tool | Vite 8 + Rolldown | HMR ultrarrápido, bundles optimizados |
| Estilos | TailwindCSS v4 (CSS-based config) | Utilitario, sin archivo de config JS |
| Componentes | shadcn/ui (base-nova / @base-ui/react) | Accesibles, sin dependencia de Radix |
| Estado global | Zustand + `persist` middleware | Mínimo boilerplate, selector granular |
| Persistencia | IndexedDB vía `idb` v8 | Sin límite de localStorage, async |
| Routing | React Router v6 | Standard de la industria |
| Formularios | react-hook-form + zod | Validación typesafe, mínimo re-render |
| Iconos | lucide-react | Consistentes, tree-shakeable |
| Tipografía | Geist Variable + JetBrains Mono | Legibilidad y datos numéricos claros |
| IA (próximo) | Google Gemini API (`@google/generative-ai`) | Integración con 3 documentos de contexto |
| Gráficos (próximo) | Recharts | Composable, compatible con React |

### Paleta de colores
Sistema oklch con tema oscuro por defecto:
- **Primary** (naranja): `oklch(0.66 0.21 35)` — acción y progreso
- **Background**: `oklch(0.08 0 0)` — fondo profundo
- **Success** (verde): `oklch(0.7 0.17 160)` — completado
- **Secondary** (azul): `oklch(0.6 0.2 265)` — información

---

## Estructura del proyecto

```
EntrenadorVirtual/
├── app/                          # Aplicación React
│   ├── docs/                     # Documentos markdown (base de conocimiento)
│   │   ├── 01_ejercicios_por_grupo_muscular.md
│   │   ├── 02_rutinas_entrenamiento.md
│   │   └── 03_periodizacion.md
│   ├── public/
│   │   └── images/ejercicios/    # Imágenes por código (P-01.png, etc.)
│   └── src/
│       ├── components/
│       │   ├── exercise/         # ExerciseCard, ExerciseThumb, MuscleGroupBadge
│       │   ├── layout/           # AppShell, BottomNav, Sidebar
│       │   ├── routine/          # RoutineBuilder, DayEditor, ExercisePicker, DayEditModal
│       │   ├── session/          # ActiveSession, SetLogger, RestTimer
│       │   └── ui/               # shadcn/ui primitivos
│       ├── data/
│       │   └── knowledgeBase.ts  # Singleton que parsea el markdown en runtime
│       ├── lib/
│       │   ├── db.ts             # Adapter IndexedDB para Zustand persist
│       │   ├── markdownParser.ts # Parser de ejercicios desde .md
│       │   ├── overloadEngine.ts # Lógica de sobrecarga progresiva
│       │   └── routineTemplates.ts # Plantillas predefinidas de rutinas
│       ├── pages/                # TodayPage, RoutinesPage, ExercisesPage, etc.
│       ├── stores/               # Zustand: exerciseStore, routineStore, sessionStore, userStore
│       └── types/                # exercise.ts, routine.ts, session.ts, user.ts
├── images/                       # Fuentes originales de imágenes
└── 01_ejercicios_por_grupo_muscular.md  # Documentación base
```

---

## Instalación y uso local

### Requisitos
- Node.js 20+
- npm 10+

### Pasos

```bash
# 1. Clonar el repositorio
git clone https://github.com/jjsprockel/EntrenadorVirtual.git
cd EntrenadorVirtual/app

# 2. Instalar dependencias
npm install

# 3. Configurar variables de entorno
cp .env.example .env.local
# Editar .env.local y agregar tu clave de Gemini:
# VITE_GEMINI_API_KEY=tu_clave_aqui

# 4. Iniciar en desarrollo
npm run dev

# 5. Build de producción
npm run build
```

> **Nota**: La app funciona completamente sin la clave de Gemini. El coach de IA (Fase 7) es la única funcionalidad que la requiere.

---

## Base de conocimiento de ejercicios

Los ejercicios se definen en `docs/01_ejercicios_por_grupo_muscular.md` siguiendo una estructura de markdown que el parser convierte a objetos TypeScript en runtime:

```markdown
# PECHO

### P-01 · Press de Banca con Barra
**Patrón**: empuje_horizontal | **Equipo**: barra | **Nivel**: principiante

**Músculos principales**: pectoral_mayor
**Músculos secundarios**: deltoides_anterior, triceps

#### Ejecución
1. Tumbado en banco plano...
```

Esto permite agregar o modificar ejercicios editando únicamente el archivo `.md`, sin tocar código.

---

## Motor de sobrecarga progresiva

`lib/overloadEngine.ts` implementa la lógica de progresión:

1. Busca en el historial de sesiones la última vez que se realizó ese ejercicio
2. Si en la última serie se alcanzó el **máximo de repeticiones del rango objetivo** Y el **RIR real fue ≤ al RIR objetivo**, sugiere +2,5 kg
3. En caso contrario, repite el mismo peso
4. Si no hay historial, no sugiere carga (el usuario parte desde 0)

Este modelo implementa la **sobrecarga progresiva doble** (doble progresión): primero se aumentan las repeticiones dentro del rango, luego se sube el peso.

---

## Roadmap

### Fase 6 — Dashboard de progreso
- Gráficos de volumen total por sesión (Recharts)
- Evolución de carga por ejercicio
- Récords personales (PRs) automáticos
- Comparativa semana a semana

### Fase 7 — Coach IA
- Cliente Gemini con sistema prompt que incluye los 3 documentos de conocimiento
- Chat contextual con historial de sesiones y perfil del usuario
- Sugerencias de ajuste de rutina basadas en progresión

### Fase 8 — PWA
- Service worker con Workbox (vite-plugin-pwa)
- Instalación en pantalla de inicio (iOS/Android)
- Funcionamiento 100% offline
- Auditoría Lighthouse ≥ 90 en todas las categorías

---

## Licencia

MIT
