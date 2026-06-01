# EntrenadorVirtual

Aplicación web para el seguimiento y planificación de entrenamientos de musculación. Diseñada con enfoque **mobile-first**, permite gestionar rutinas, registrar sesiones en tiempo real con sobrecarga progresiva automática, visualizar progreso multidimensional y administrar múltiples usuarios desde un panel de administración.

Desplegada en Vercel · Datos persistidos en IndexedDB (sin backend propio)

---

## Modos de autenticación

La app detecta automáticamente qué modo usar según las variables de entorno:

| Modo | Cuándo activo | Sistema |
|------|---------------|---------|
| **Local (IndexedDB)** | Sin `VITE_SUPABASE_URL` / `VITE_SUPABASE_ANON_KEY` | `usersStore.login()` — credenciales en IDB local |
| **Supabase (nube)** | Con ambas variables Supabase configuradas | `supabase.auth.signInWithPassword()` |

La pantalla de login muestra una insignia en tiempo real: **"Modo: Supabase"** o **"Modo: Local"**, para que siempre sepas contra qué sistema estás autenticando.

> **Regla de oro:** las credenciales del modo local NO sirven automáticamente en modo Supabase, ni viceversa. Son dos sistemas de auth independientes.

---

## Credenciales — Modo Local (IndexedDB)

Funcionan sin ninguna variable de entorno adicional. El admin se crea automáticamente en el primer arranque.

| Usuario | Correo | Contraseña | Rol |
|---------|--------|-----------|-----|
| Administrador | `jjsprockel@hotmail.com` | `Admin1234` | admin |
| Carlos | `carlos@demo.com` | `Entrena123` | user |
| María | `maria@demo.com` | `Entrena123` | user |
| Lucas | `lucas@demo.com` | `Entrena123` | user |
| Sofía | `sofia@demo.com` | `Entrena123` | user |

> Las cuentas Carlos, María, Lucas y Sofía solo existen después de pulsar **"Cargar datos demo"** en el Panel Admin.
> El panel "Acceso rápido — modo demo" en la pantalla de login solo está activo en modo Local.

---

## Credenciales — Modo Supabase

Las credenciales de IndexedDB **no** se sincronizan con Supabase. Al activar el modo Supabase por primera vez debes crear el usuario administrador manualmente:

1. Ve a tu proyecto en [supabase.com](https://supabase.com) → **Authentication → Users → Add user**
2. Crea el usuario con el correo y contraseña que uses como admin (por ejemplo `jjsprockel@hotmail.com` / `Admin1234`)
3. Asigna el rol `admin` ejecutando en el **SQL Editor** de Supabase:
   ```sql
   update public.users set role = 'admin'
   where email = 'jjsprockel@hotmail.com';
   ```
4. Para los usuarios demo, créalos desde el Panel Admin de la app (ya autenticado como admin).

> En modo Supabase, el panel "Acceso rápido — modo demo" queda deshabilitado. Las cuentas deben existir en Supabase Auth antes de poder usarlas.

---

## Funcionalidades principales

### Autenticación y multi-usuario
- Login con correo electrónico y contraseña (SHA-256 via Web Crypto API)
- Sesión persistida en IndexedDB — no se pierde al refrescar
- Rol `admin`: accede al Panel de Administración, ve estadísticas de todos los usuarios
- Rol `user`: accede sólo a sus propios datos (rutinas, sesiones, progreso)
- Cambio de contraseña desde el perfil; reset de contraseña por el administrador
- Envío automático de correo de bienvenida a nuevos usuarios (via EmailJS)

### Panel de Administración (`/admin`)
- Tarjetas de estadísticas globales: usuarios, sesiones totales, sesiones en los últimos 30 días
- Tabla de usuarios con credenciales visibles (contraseña inicial oculta/visible con toggle)
- Crear, editar y eliminar usuarios; resetear contraseñas
- Botón "Enviar bienvenida" por usuario → correo con credenciales y link de acceso
- Cargar 4 usuarios demo con 3–6 meses de historial de entrenamiento simulado

### Biblioteca de ejercicios
- 59 ejercicios organizados por grupo muscular
- Ficha completa: imagen, músculos, patrón de movimiento, ejecución paso a paso, errores comunes, alternativas
- Búsqueda y filtro por grupo muscular y nivel

### Constructor de rutinas (wizard 5 pasos)
- Nombre, objetivo, nivel, días/semana, duración
- Selección de plantilla: Fullbody, Torso/Pierna, PPL 6 días, PPL 3 días (Sinergista), Antagonista 3 días, personalizada
- Editor por día: ExercisePicker, series/reps/RIR/descanso por ejercicio
- Periodización: ninguna, lineal, ondulante, por bloques; badges contextuales según frecuencia de la rutina
- Sugerencia de deload adaptada: 4–6 sem (alta frecuencia) · 6–8 sem (splits de 3 días)

### Sesión activa
- Sugerencia automática del día a entrenar
- Registro libre (sin seguir orden estricto)
- **Sobrecarga progresiva doble** automática: si se alcanza el tope de reps con el RIR objetivo, sugiere +incremento mínimo
- Temporizador de descanso con barra de progreso
- Agregar/quitar ejercicios en tiempo real

### Dashboard de progreso
- **Métricas**: Volumen total, Peso máximo, Repeticiones totales
- **Rangos de tiempo**: 4 sem, 8 sem, 13 sem, 6 meses, 1 año, Todo
- **Vistas**: Resumen total, por Ejercicio específico, por Grupo muscular, Push/Pull/Piernas
- Admin puede ver progreso de cada usuario o todos combinados

---

## Stack técnico

| Capa | Tecnología |
|------|-----------|
| UI Framework | React 19 + TypeScript |
| Build | Vite 8 + Rolldown |
| Estilos | TailwindCSS v4 (CSS-based config) |
| Componentes | shadcn/ui (@base-ui/react) |
| Estado global | Zustand 5 + `persist` middleware |
| Persistencia | IndexedDB vía `idb` v8 |
| Routing | React Router v6 |
| Formularios | react-hook-form + zod |
| Gráficos | Recharts v3 |
| Email | EmailJS (@emailjs/browser) |
| Iconos | lucide-react |
| Hosting | Vercel |

---

## Instalación local

### Requisitos
- Node.js 20+
- npm 10+

```bash
# 1. Clonar
git clone https://github.com/jjsprockel/EntrenadorVirtual.git
cd EntrenadorVirtual/app

# 2. Instalar dependencias
npm install

# 3. Variables de entorno (opcional)
cp .env.local.example .env.local
# Editar .env.local con tus claves (Supabase y/o EmailJS)

# 4. Desarrollo
npm run dev

# 5. Build de producción
npm run build
```

---

## Configuración de variables de entorno

Copia `.env.local.example` a `.env.local` y completa los valores:

```env
# Supabase — activa auth en la nube + sync (opcional; sin esto la app usa IndexedDB local)
VITE_SUPABASE_URL=https://xxxxxxxxxx.supabase.co
VITE_SUPABASE_ANON_KEY=eyJhbGci...

# EmailJS — envío de correos de bienvenida (opcional)
VITE_EMAILJS_SERVICE_ID=service_xxxxxxx
VITE_EMAILJS_TEMPLATE_ID=template_xxxxxxx
VITE_EMAILJS_PUBLIC_KEY=xxxxxxxxxxxxxxx
VITE_APP_URL=https://tu-app.vercel.app
```

La app funciona completamente sin estas variables — usa autenticación local por IndexedDB y el envío de correos quedará deshabilitado.

---

## Despliegue en Vercel

### Configuración inicial del proyecto en Vercel

1. Importar el repositorio desde GitHub en [vercel.com/new](https://vercel.com/new)
2. En **"Configure Project"**:
   - **Framework Preset**: Vite
   - **Root Directory**: `app` ← **importante** (el código fuente está en el subdirectorio `app/`)
   - **Build Command**: `npm run build` (se detecta automáticamente)
   - **Output Directory**: `dist` (se detecta automáticamente)
3. Pulsar **Deploy**

### Variables de entorno en Vercel

En el dashboard del proyecto: **Settings → Environment Variables**

| Variable | Valor | Descripción |
|----------|-------|-------------|
| `VITE_SUPABASE_URL` | `https://xxx.supabase.co` | URL del proyecto Supabase (activa auth en la nube) |
| `VITE_SUPABASE_ANON_KEY` | `eyJhbGci...` | Anon key de Supabase (Settings → API) |
| `VITE_EMAILJS_SERVICE_ID` | `service_...` | ID del servicio EmailJS |
| `VITE_EMAILJS_TEMPLATE_ID` | `template_...` | ID de la plantilla de email |
| `VITE_EMAILJS_PUBLIC_KEY` | `...` | Clave pública de EmailJS |
| `VITE_APP_URL` | `https://tu-app.vercel.app` | URL de la app (incluida en el correo de bienvenida) |

Después de agregar variables de entorno, hacer **Redeploy** desde el dashboard.

### Actualizaciones

Cada `git push` a `main` dispara un redeploy automático en Vercel.

---

## Configuración de EmailJS (envío de bienvenida)

El envío de correos de bienvenida usa [EmailJS](https://www.emailjs.com) — funciona directamente desde el navegador sin backend.

### Pasos

**1. Crear cuenta en EmailJS**
- Ir a [emailjs.com](https://www.emailjs.com) → Sign Up (plan Free: 200 emails/mes)

**2. Conectar cuenta de Gmail**
- Dashboard → **Email Services** → Add New Service
- Seleccionar **Gmail** → conectar con `siembrau@gmail.com`
- Copiar el **Service ID** generado

**3. Crear la plantilla de email**
- Dashboard → **Email Templates** → Create New Template
- Configurar con estas variables:

```
Subject: Bienvenido/a a EntrenadorVirtual 🏋️

Hola {{to_name}},

El administrador ha creado tu cuenta en EntrenadorVirtual.

Tus datos de acceso:
  Correo: {{to_email}}
  Contraseña inicial: {{initial_password}}

Accede a la app aquí:
{{app_url}}

Por seguridad, cambia tu contraseña desde Perfil → Seguridad una vez que ingreses.

¡A entrenar!
{{from_name}}
```

- En **"To Email"**: `{{to_email}}`
- En **"To Name"**: `{{to_name}}`
- Copiar el **Template ID**

**4. Obtener la clave pública**
- Dashboard → **Account** → **API Keys** → copiar **Public Key**

**5. Agregar los tres valores a Vercel**
- `VITE_EMAILJS_SERVICE_ID` → el Service ID del paso 2
- `VITE_EMAILJS_TEMPLATE_ID` → el Template ID del paso 3
- `VITE_EMAILJS_PUBLIC_KEY` → la Public Key del paso 4
- Hacer Redeploy en Vercel

**Uso**: en el Panel Admin (`/admin`), cada tarjeta de usuario tiene un botón **"Bienvenida"** que envía el correo con las credenciales y el link de la app.

---

## Estructura del proyecto

```
EntrenadorVirtual/
├── app/                              # Aplicación React (root en Vercel)
│   ├── .env.example                  # Variables de entorno de referencia
│   ├── vercel.json                   # Rewrites SPA + cabeceras de caché
│   ├── vite.config.ts
│   ├── public/
│   │   └── images/ejercicios/        # Imágenes por código (P-01.png, etc.)
│   └── src/
│       ├── components/
│       │   ├── admin/                # UserAvatar, UserFormModal, UserSwitcherModal
│       │   ├── exercise/             # ExerciseCard, ExerciseThumb, MuscleGroupBadge
│       │   ├── layout/               # AppShell, BottomNav, Sidebar
│       │   ├── routine/              # RoutineBuilder, DayEditor, ExercisePicker
│       │   ├── session/              # ActiveSession, SetLogger, RestTimer
│       │   └── ui/                   # Primitivos shadcn/ui
│       ├── lib/
│       │   ├── auth.ts               # hashPassword / verifyPassword (Web Crypto)
│       │   ├── db.ts                 # Adaptador IndexedDB para Zustand
│       │   ├── emailService.ts       # Wrapper EmailJS
│       │   ├── overloadEngine.ts     # Lógica de sobrecarga progresiva
│       │   ├── seedData.ts           # Generador de datos demo (4 usuarios)
│       │   └── statsEngine.ts        # Motor de estadísticas y gráficos
│       ├── pages/
│       │   ├── AdminPage.tsx         # Panel de administración (sólo admin)
│       │   ├── LoginPage.tsx         # Pantalla de login + acceso rápido demo
│       │   ├── ProfilePage.tsx       # Perfil + seguridad + datos
│       │   ├── ProgressPage.tsx      # Dashboard de progreso
│       │   ├── TodayPage.tsx         # Sesión de hoy
│       │   └── ...
│       ├── stores/
│       │   ├── usersStore.ts         # Multi-usuario + auth (login/logout/changePassword)
│       │   ├── routineStore.ts
│       │   └── sessionStore.ts
│       └── types/
│           ├── user.ts               # AppUser con email/passwordHash/tempPassword
│           ├── routine.ts
│           └── session.ts
└── README.md
```

---

## Roadmap

| Fase | Nombre | Estado |
|------|--------|--------|
| 1 | Fundamentos — router, design system, tipos, stores | ✅ |
| 2 | Base de conocimiento — parser markdown, biblioteca ejercicios | ✅ |
| 3 | Persistencia — IndexedDB, perfil, 1RM | ✅ |
| 4 | Constructor de rutinas — wizard 5 pasos, periodización | ✅ |
| 5 | Sesión activa — SetLogger, RestTimer, sobrecarga progresiva | ✅ |
| 6 | Dashboard de progreso — gráficos volumen/peso/reps, multi-vista | ✅ |
| 6b | Multi-usuario — auth, roles, panel admin, datos demo | ✅ |
| 7 | Coach IA — Gemini API, chat contextual | 🔜 |
| 8 | PWA — service worker, offline, Lighthouse ≥ 90 | 🔜 |

---

## Licencia

MIT
