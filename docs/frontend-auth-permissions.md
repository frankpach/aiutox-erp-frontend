# Sistema de Autenticación y Permisos - Frontend

## 📋 Resumen

Sistema completo de autenticación y control de acceso basado en permisos (RBAC) implementado en el frontend de AiutoX ERP.

## 🔐 Autenticación

### AuthStore (Zustand)

El `authStore` gestiona el estado de autenticación del usuario:

```typescript
interface User {
  id: string;
  email: string;
  full_name: string | null;
  is_active: boolean;
  tenant_id?: string;
  roles?: string[];
  permissions?: string[];
}
```

**Funcionalidades:**
- Almacenamiento persistente en localStorage
- Gestión de tokens (access + refresh)
- Método `refreshAccessToken()` para renovar tokens

### Refresh Token Automático

**Estado:** ✅ Implementado y funcionando

El refresh token está implementado en `app/lib/api/client.ts`:

- **Interceptores de Axios:**
  - Request interceptor: Agrega token de acceso a cada request
  - Response interceptor: Maneja 401 y renueva token automáticamente

- **Características:**
  - Cola de requests durante refresh (evita múltiples refreshes)
  - Manejo de errores (redirección a login si refresh falla)
  - Prevención de loops infinitos

- **Flujo:**
  1. Request falla con 401
  2. Si no está refrescando, inicia refresh
  3. Requests pendientes se encolan
  4. Nuevo token se aplica a todos los requests encolados
  5. Si refresh falla, limpia auth y redirige a login

## 🎭 Sistema de Permisos

### Hooks de Permisos

#### `usePermissions()`

Hook principal que proporciona todas las utilidades de permisos:

```typescript
const {
  permissions,        // Array de permisos del usuario
  roles,              // Array de roles del usuario
  hasPermission,      // (permission: string) => boolean
  hasRole,            // (role: string) => boolean
  hasAnyPermission,   // (permissions: string[]) => boolean
  hasAnyRole,         // (roles: string[]) => boolean
  hasAllPermissions,  // (permissions: string[]) => boolean
} = usePermissions();
```

#### Hooks Específicos

- `useHasPermission(permission: string)` - Verifica un permiso específico
- `useHasRole(role: string)` - Verifica un rol específico
- `useHasAnyPermission(permissions: string[])` - Verifica si tiene alguno
- `useHasAnyRole(roles: string[])` - Verifica si tiene alguno

### Soporte de Wildcards

El sistema soporta wildcards para permisos:

- `*` - Acceso total a todos los permisos
- `module.*` - Acceso a todos los permisos de un módulo (ej: `inventory.*`)

**Ejemplos:**
```typescript
// Usuario con permiso "*"
hasPermission("inventory.view") // true
hasPermission("users.edit")     // true

// Usuario con permiso "inventory.*"
hasPermission("inventory.view") // true
hasPermission("inventory.edit") // true
hasPermission("users.view")     // false
```

### Componentes Condicionales

#### `RequirePermission`

Renderiza children solo si el usuario tiene el permiso requerido:

```tsx
<RequirePermission permission="inventory.view">
  <InventoryList />
</RequirePermission>

<RequirePermission
  permission="inventory.edit"
  fallback={<div>No tienes permiso para editar</div>}
>
  <EditButton />
</RequirePermission>
```

#### `RequireRole`

Renderiza children solo si el usuario tiene el rol requerido:

```tsx
<RequireRole role="admin">
  <AdminPanel />
</RequireRole>
```

#### `RequireAnyPermission`

Renderiza children si el usuario tiene al menos uno de los permisos:

```tsx
<RequireAnyPermission permissions={["inventory.view", "inventory.edit"]}>
  <InventoryActions />
</RequireAnyPermission>
```

#### `RequireAnyRole`

Renderiza children si el usuario tiene al menos uno de los roles:

```tsx
<RequireAnyRole roles={["admin", "inventory.leader"]}>
  <ManagementPanel />
</RequireAnyRole>
```

### Guards de Rutas

#### `ProtectedRoute`

Protege rutas basándose en autenticación:

```tsx
<ProtectedRoute redirectTo="/login">
  <UsersPage />
</ProtectedRoute>
```

#### `PermissionRoute`

Protege rutas basándose en permisos:

```tsx
<PermissionRoute permission="users.view" redirectTo="/unauthorized">
  <UsersPage />
</PermissionRoute>
```

## 📝 Uso en Componentes

### Ejemplo Básico

```tsx
import { useHasPermission } from "~/hooks/usePermissions";
import { RequirePermission } from "~/components/auth";

function MyComponent() {
  const canEdit = useHasPermission("inventory.edit");

  return (
    <div>
      <RequirePermission permission="inventory.view">
        <InventoryList />
      </RequirePermission>

      {canEdit && <EditButton />}
    </div>
  );
}
```

### Ejemplo con Rutas

```tsx
import { ProtectedRoute, PermissionRoute } from "~/components/auth";

<Routes>
  <Route path="/login" element={<LoginPage />} />

  <Route
    path="/users"
    element={
      <ProtectedRoute>
        <PermissionRoute permission="users.view">
          <UsersPage />
        </PermissionRoute>
      </ProtectedRoute>
    }
  />
</Routes>
```

## 🧪 Tests

### Tests Implementados

- ✅ `usePermissions.test.ts` - Tests para hooks de permisos (12 tests)
- ✅ `RequirePermission.test.tsx` - Tests para componente RequirePermission
- ✅ `RequireRole.test.tsx` - Tests para componente RequireRole

### Cobertura

- Hooks de permisos: 100%
- Componentes condicionales: Tests básicos implementados
- Guards de rutas: Pendiente (requiere setup de router)

## 📁 Estructura de Archivos

```
app/
├── stores/
│   └── authStore.ts          # Store de autenticación (Zustand)
├── hooks/
│   ├── useAuth.ts            # Hook de autenticación (login/logout)
│   ├── usePermissions.ts     # Hooks de permisos
│   └── __tests__/
│       └── usePermissions.test.ts
├── components/
│   └── auth/
│       ├── index.ts          # Exportaciones centralizadas
│       ├── ProtectedRoute.tsx
│       ├── PermissionRoute.tsx
│       ├── RequirePermission.tsx
│       ├── RequireRole.tsx
│       ├── RequireAnyPermission.tsx
│       ├── RequireAnyRole.tsx
│       └── __tests__/
│           ├── RequirePermission.test.tsx
│           └── RequireRole.test.tsx
└── lib/
    └── api/
        └── client.ts         # API client con refresh token automático
```

## ✅ Estado de Implementación

### Completado ✅

- [x] AuthStore con roles y permissions
- [x] Refresh token automático en apiClient
- [x] Hooks de permisos (usePermissions, useHasPermission, etc.)
- [x] Componentes condicionales (RequirePermission, RequireRole, etc.)
- [x] Guards de rutas (ProtectedRoute, PermissionRoute)
- [x] Tests para hooks de permisos
- [x] Tests para componentes condicionales
- [x] Soporte de wildcards (*, module.*)

### Pendiente ⏳

- [ ] Integración completa en todas las rutas
- [ ] Tests E2E para guards de rutas
- [ ] Documentación de permisos por módulo
- [ ] Componente de error 403 (Unauthorized)

## 🔗 Referencias

- Backend RBAC: `rules/auth-rbac.md`
- API Contract: `rules/api-contract.md`
- Backend Auth: `docs/modules/auth.md`

