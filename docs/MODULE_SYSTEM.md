# Sistema de Módulos Autodiscoverable

## Descripción General

El sistema de módulos autodiscoverable permite que los módulos se registren automáticamente en el frontend, construyendo una navegación jerárquica de 3 niveles basada en los permisos del usuario y el tenant.

## Arquitectura

### Componentes Principales

1. **Module Registry** (`lib/modules/registry.ts`)
   - Descubre módulos desde el backend
   - Construye árbol de navegación jerárquico
   - Gestiona cache cifrado

2. **Modules Store** (`stores/modulesStore.ts`)
   - Estado global de módulos con Zustand
   - Persistencia cifrada
   - Limpieza automática de cache expirado

3. **Navigation Hooks** (`hooks/useNavigation.ts`)
   - `useNavigation()` - Árbol completo de navegación
   - `useNavigationByCategory()` - Navegación agrupada
   - `useNavigationItems()` - Lista plana de items

4. **NavigationTree Component** (`components/layout/NavigationTree.tsx`)
   - Renderiza navegación jerárquica (3 niveles)
   - Filtrado automático por permisos

## Estructura de Navegación

```
Categoría (Nivel 1)
  └── Módulo (Nivel 2)
      └── Items/Páginas (Nivel 3)
```

### Ejemplo:
```
Administración
  └── Usuarios
      ├── Lista de Usuarios
      └── Crear Usuario
```

## Uso

### Inicialización

Los módulos se inicializan automáticamente en `AppShell`:

```typescript
import { initializeModules } from "~/stores/modulesStore";

// En AppShell
useEffect(() => {
  initializeModules().catch(console.error);
}, []);
```

### Registrar un Módulo Manualmente

```typescript
import { useModulesStore } from "~/stores/modulesStore";
import type { FrontendModule } from "~/lib/modules/types";

const { registerModule } = useModulesStore();

const myModule: FrontendModule = {
  id: "my-module",
  name: "Mi Módulo",
  type: "business",
  category: "Operaciones",
  enabled: true,
  routes: [
    { path: "/my-module", permission: "my-module.view" }
  ],
  permissions: ["my-module.view", "my-module.create"],
  navigation: {
    category: "Operaciones",
    module: "my-module",
    items: [
      {
        id: "my-module-list",
        label: "Mi Módulo",
        to: "/my-module",
        permission: "my-module.view"
      }
    ]
  }
};

registerModule(myModule);
```

### Usar Navegación en Componentes

```typescript
import { useNavigation } from "~/hooks/useNavigation";

function MyComponent() {
  const navigationTree = useNavigation();

  // navigationTree contiene el árbol completo filtrado por permisos
}
```

## Cifrado Local

Todos los datos de módulos y usuarios se almacenan cifrados en localStorage con:

- **Algoritmo**: AES-GCM
- **TTL**: 30 días
- **Clave**: Derivada de `tenant_id + secret`

Ver `lib/storage/encryptedStorage.ts` para más detalles.

## Permisos

Los permisos se filtran automáticamente por:
- **Tenant**: Usuario solo ve módulos de su tenant
- **Permisos**: Items de navegación se muestran solo si el usuario tiene el permiso requerido

### Patrones de Permisos Soportados

- `inventory.view` - Permiso exacto
- `inventory.*` - Todos los permisos del módulo inventory
- `*` - Todos los permisos

## Backend Integration

El sistema consume los siguientes endpoints:

- `GET /api/v1/config/modules` - Lista de módulos
- `GET /api/v1/config/modules/{module_id}` - Detalles del módulo
- `GET /api/v1/auth/permissions` - Lista de permisos (opcional)

