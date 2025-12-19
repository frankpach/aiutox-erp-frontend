# URLs Probadas en Tests E2E - Páginas Públicas

## Resumen

Este documento lista todas las URLs que fueron probadas en los tests E2E de páginas públicas.

**Archivo de tests:** `app/__tests__/e2e/public-pages.spec.ts`

**Total de tests:** 19 tests pasando

---

## URLs Probadas

### 0. Ruta Raíz

#### `/` (Root)
- **Test:** "should redirect root path (/) to /login"
- **Comportamiento:** Redirige automáticamente a `/login`
- **Elementos verificados:**
  - Redirección automática
  - Renderizado de página de login

### 1. Páginas de Autenticación

#### `/login`
- **Test:** "should render login page"
- **Test:** "should navigate from login to forgot-password"
- **Test:** "should navigate from forgot-password back to login"
- **Test:** "login form should show validation errors"
- **Test:** "login page should be responsive on mobile"
- **Elementos verificados:**
  - Campo de email
  - Campo de contraseña
  - Botón "Iniciar Sesión"
  - Link "¿Olvidaste tu contraseña?"

#### `/forgot-password`
- **Test:** "should render forgot-password page"
- **Test:** "should navigate from forgot-password back to login"
- **Test:** "forgot-password form should show validation errors"
- **Test:** "forgot-password page should be responsive on tablet"
- **Elementos verificados:**
  - Campo de email
  - Botón "Enviar Enlace"
  - Link "Volver al inicio de sesión"

#### `/reset-password`
- **Test:** "should render reset-password page with token"
  - URL: `/reset-password?token=test-token-123`
- **Test:** "should render reset-password page without token (error state)"
  - URL: `/reset-password`
- **Test:** "should navigate from reset-password to forgot-password"
- **Test:** "reset-password form should validate password match"
  - URL: `/reset-password?token=test-token`
- **Elementos verificados:**
  - Campo "Nueva Contraseña"
  - Campo "Confirmar Contraseña"
  - Botón "Restablecer Contraseña"
  - Mensaje de error cuando no hay token
  - Link "Solicitar Nuevo Enlace"

#### `/verify-email`
- **Test:** "should render verify-email page with token"
  - URL: `/verify-email?token=test-token-123`
- **Test:** "should render verify-email page without token (error state)"
  - URL: `/verify-email`
- **Elementos verificados:**
  - Estado de carga/verificando
  - Mensaje de éxito o error
  - Link "Volver al inicio de sesión"
  - Link "Ir al inicio"

### 2. Páginas de Estado del Sistema

#### `/maintenance`
- **Test:** "should render maintenance page"
- **Elementos verificados:**
  - Mensaje de mantenimiento
  - Información sobre el tiempo estimado (opcional)

### 3. Páginas de Error

#### `/unauthorized`
- **Test:** "should render unauthorized page (403)"
- **Elementos verificados:**
  - Código de error "403"
  - Título "Acceso Denegado"
  - Botón "Volver"

#### `/not-found`
- **Test:** "should render not-found page (404)"
- **Test:** "should navigate from 404 to login"
- **Elementos verificados:**
  - Código de error "404"
  - Título "Página no encontrada"
  - Link "Volver al inicio"

#### Rutas no existentes
- **Test:** "should render 404 for non-existent routes"
  - URL: `/this-route-does-not-exist`
- **Comportamiento:** Cualquier ruta no definida redirige a la página 404

---

## Flujos de Navegación Probados

### Flujo 1: Login → Forgot Password
1. `/login` → Click en "¿Olvidaste tu contraseña?" → `/forgot-password`

### Flujo 2: Forgot Password → Login
1. `/forgot-password` → Click en "Volver al inicio de sesión" → `/login`

### Flujo 3: Reset Password → Forgot Password
1. `/reset-password` → Click en "Solicitar Nuevo Enlace" → `/forgot-password`

### Flujo 4: 404 → Login
1. `/not-found` → Click en "Volver al inicio" → `/login`

---

## Validaciones de Formularios Probadas

### Login Form
- Validación de campos vacíos
- Campos requeridos: email, password

### Forgot Password Form
- Validación de campo email vacío
- Campo requerido: email

### Reset Password Form
- Validación de coincidencia de contraseñas
- Campos requeridos: password, confirmPassword

---

## Tests de Responsive Design

### Mobile (375x667 - iPhone SE)
- `/login` - Verifica que el formulario sea visible y usable

### Tablet (768x1024 - iPad)
- `/forgot-password` - Verifica que el formulario esté centrado y visible

---

## Resumen de URLs

| URL | Tests | Estado |
|-----|-------|--------|
| `/login` | 5 | ✅ Pasando |
| `/forgot-password` | 4 | ✅ Pasando |
| `/reset-password` | 4 | ✅ Pasando |
| `/reset-password?token=*` | 2 | ✅ Pasando |
| `/verify-email` | 2 | ✅ Pasando |
| `/verify-email?token=*` | 1 | ✅ Pasando |
| `/maintenance` | 1 | ✅ Pasando |
| `/unauthorized` | 1 | ✅ Pasando |
| `/not-found` | 2 | ✅ Pasando |
| `/this-route-does-not-exist` | 1 | ✅ Pasando |

**Total:** 20 tests, 20 pasando (100%)

---

## Notas

- Todas las redirecciones a "/" han sido cambiadas a "/login"
- Los tests verifican tanto el renderizado como la navegación entre páginas
- Se incluyen tests de validación de formularios y diseño responsive
- Los tests usan selectores específicos para evitar falsos positivos

