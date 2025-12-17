# Guía de Diseño - Layout Principal (AppShell)

## 📋 Resumen Ejecutivo

Layout principal tipo AppShell para AiutoX ERP con Header, Sidebar, MainContent y Footer. Diseñado para desktop-first (ERP), responsive para tablets y móviles básicos.

---

## 🎨 Diseño Visual

### Estructura General

```
┌─────────────────────────────────────────────────────────┐
│                    HEADER (Fixed)                       │
│  [Logo] [Search] [Notifications] [User Menu]           │
├──────────┬──────────────────────────────────────────────┤
│          │                                              │
│ SIDEBAR  │           MAIN CONTENT                       │
│ (Fixed)  │           (Scrollable)                       │
│          │                                              │
│ • Home   │  ┌─────────────────────────────────────┐    │
│ • Users  │  │  Page Title                         │    │
│ • ...    │  │  Breadcrumbs                        │    │
│          │  ├─────────────────────────────────────┤    │
│          │  │                                     │    │
│          │  │  Page Content                       │    │
│          │  │                                     │    │
│          │  │                                     │    │
│          │  └─────────────────────────────────────┘    │
│          │                                              │
├──────────┴──────────────────────────────────────────────┤
│                    FOOTER (Fixed)                       │
│  © 2025 AiutoX ERP | Version 1.0.0                     │
└─────────────────────────────────────────────────────────┘
```

### Colores de Marca Aplicados

**Header:**
- Fondo: Blanco (`#FFFFFF`) con borde inferior sutil
- Logo: AiutoX Blue (`#023E87`)
- Texto: AiutoX Dark (`#121212`)
- Acentos: AiutoX Link Blue (`#2EA3F2`)

**Sidebar:**
- Fondo: Gris claro (`#F9FAFB` o `gray-50`)
- Borde derecho: Gris suave
- Items activos: AiutoX Blue (`#023E87`) con fondo `#023E87/10`
- Items hover: Gris medio (`gray-100`)
- Iconos: AiutoX Dark (`#121212`)

**Main Content:**
- Fondo: Blanco (`#FFFFFF`)
- Texto principal: AiutoX Dark (`#121212`)
- Texto secundario: Body Text Gray (`#3C3A47`)

**Footer:**
- Fondo: Gris muy claro (`gray-50`)
- Texto: Body Text Gray (`#3C3A47`)
- Borde superior: Gris suave

---

## 🏗️ Estructura de Componentes

### 1. AppShell (Componente Principal)

**Ubicación:** `app/components/layout/AppShell.tsx`

**Responsabilidades:**
- Contenedor principal del layout
- Maneja el estado de sidebar (abierto/cerrado)
- Integra Header, Sidebar, MainContent y Footer
- Responsive: Sidebar colapsa en móviles/tablets

**Props:**
```typescript
interface AppShellProps {
  children: ReactNode;
}
```

**Estructura:**
```tsx
<div className="flex h-screen overflow-hidden">
  <Sidebar />
  <div className="flex flex-col flex-1 overflow-hidden">
    <Header />
    <MainContent>{children}</MainContent>
    <Footer />
  </div>
</div>
```

---

### 2. Header

**Ubicación:** `app/components/layout/Header.tsx`

**Elementos:**
1. **Logo** (izquierda)
   - Logo de AiutoX
   - Texto "AiutoX ERP" (opcional)
   - Link a `/` (home)

2. **Search Bar** (centro, opcional - se implementará en Fase 1)
   - Placeholder: "Buscar..."
   - Icono de búsqueda
   - Por ahora: espacio reservado

3. **Actions** (derecha)
   - **Notifications** (badge con contador)
     - Icono de campana
     - Dropdown con lista de notificaciones
     - Se implementará en Fase 1
   - **User Menu** (dropdown)
     - Avatar/Iniciales del usuario
     - Nombre del usuario
     - Dropdown:
       - Perfil
       - Configuración
       - Separador
       - Cerrar sesión

**Diseño:**
- Altura: 64px (h-16)
- Fondo: Blanco con sombra sutil
- Borde inferior: 1px gris claro
- Padding horizontal: 1.5rem (px-6)
- Flexbox: espacio entre elementos

---

### 3. Sidebar

**Ubicación:** `app/components/layout/Sidebar.tsx`

**Elementos:**
1. **Logo/Header** (opcional, solo en desktop)
   - Logo pequeño o texto "AiutoX"
   - Se oculta en modo colapsado

2. **Navigation Menu**
   - Lista de items de navegación
   - Cada item:
     - Icono (Hugeicons)
     - Label (texto)
     - Badge (opcional, para contadores)
     - Indicador de activo

3. **User Info** (parte inferior, opcional)
   - Avatar pequeño
   - Nombre del usuario
   - Rol principal

**Items de Navegación (Inicial):**
```
• Home (/)
  - Icono: Home
  - Permiso: No requiere (público para autenticados)

• Usuarios (/users)
  - Icono: Users
  - Permiso: users.view

• (Espacios para futuros módulos)
  - Products
  - Inventory
  - Customers
  - etc.
```

**Estados:**
- **Expandido** (desktop): Muestra iconos + labels
- **Colapsado** (tablet/móvil): Solo iconos
- **Mobile**: Overlay (drawer) que se abre/cierra

**Diseño:**
- Ancho expandido: 256px (w-64)
- Ancho colapsado: 64px (w-16)
- Fondo: `gray-50`
- Items activos: Fondo `#023E87/10`, texto `#023E87`
- Items hover: Fondo `gray-100`

---

### 4. MainContent

**Ubicación:** `app/components/layout/MainContent.tsx`

**Responsabilidades:**
- Contenedor scrollable del contenido principal
- Padding interno
- Manejo de estados (loading, error, empty)

**Estructura:**
```tsx
<main className="flex-1 overflow-y-auto">
  <div className="container mx-auto px-6 py-6">
    {children}
  </div>
</main>
```

**Variantes:**
- Con breadcrumbs (opcional)
- Con título de página (opcional)
- Full-width (sin container)

---

### 5. Footer

**Ubicación:** `app/components/layout/Footer.tsx`

**Elementos:**
- Copyright: "© 2025 AiutoX ERP"
- Versión: "v1.0.0" (desde package.json)
- Links opcionales: Términos, Privacidad (futuro)

**Diseño:**
- Altura: 48px (h-12)
- Fondo: `gray-50`
- Texto: `gray-600`
- Borde superior: 1px gris claro
- Centrado

---

## 🔐 Integración con Permisos

### Sidebar Navigation

Los items del sidebar deben:
1. Verificar permisos antes de mostrar
2. Usar `RequirePermission` o `useHasPermission`
3. Ocultar items si el usuario no tiene acceso

**Ejemplo:**
```tsx
<RequirePermission permission="users.view">
  <NavItem icon={UsersIcon} label="Usuarios" to="/users" />
</RequirePermission>
```

### Header Actions

- **Notifications**: Verificar permiso `notifications.view` (Fase 1)
- **User Menu**: Siempre visible para usuarios autenticados

---

## 📱 Responsive Design

### Breakpoints (Tailwind)

- **sm**: 640px (móvil grande)
- **md**: 768px (tablet)
- **lg**: 1024px (desktop)
- **xl**: 1280px (desktop grande)

### Comportamiento

**Desktop (lg+):**
- Sidebar siempre visible (expandido)
- Header completo con todos los elementos
- Footer visible

**Tablet (md-lg):**
- Sidebar colapsado (solo iconos) o drawer
- Header completo
- Footer visible

**Móvil (< md):**
- Sidebar como drawer (overlay)
- Botón hamburguesa en header para abrir/cerrar
- Header simplificado (logo + user menu)
- Footer visible

---

## 🗂️ Estructura de Archivos

```
app/
├── components/
│   └── layout/
│       ├── AppShell.tsx              # Componente principal
│       ├── Header.tsx                 # Header con logo, search, user menu
│       ├── Sidebar.tsx                # Sidebar con navegación
│       ├── MainContent.tsx            # Contenedor del contenido
│       ├── Footer.tsx                 # Footer
│       ├── NavItem.tsx               # Item individual de navegación
│       ├── UserMenu.tsx               # Dropdown del usuario
│       ├── SidebarToggle.tsx          # Botón para toggle sidebar (móvil)
│       └── index.ts                   # Exportaciones
├── config/
│   └── navigation.ts                  # Configuración de items de navegación
└── routes/
    └── layout.tsx                     # Layout route wrapper
```

---

## 🧭 Configuración de Navegación

**Archivo:** `app/config/navigation.ts`

```typescript
export interface NavItem {
  id: string;
  label: string;
  icon: IconType; // Hugeicons icon
  to: string;
  permission?: string; // Permiso requerido
  badge?: number; // Contador opcional
  children?: NavItem[]; // Sub-items (futuro)
}

export const navigationItems: NavItem[] = [
  {
    id: "home",
    label: "Inicio",
    icon: HomeIcon,
    to: "/",
  },
  {
    id: "users",
    label: "Usuarios",
    icon: UsersIcon,
    to: "/users",
    permission: "users.view",
  },
  // ... más items
];
```

---

## 🔄 Flujo de Integración

### 1. Modificar `root.tsx`

El `App` component debe envolver rutas con `AppShell`:

```tsx
export default function App() {
  const isAuthenticated = useAuthStore((state) => state.isAuthenticated);

  return (
    <AppShell>
      <Outlet />
    </AppShell>
  );
}
```

### 2. Rutas Protegidas

Las rutas deben usar `ProtectedRoute`:

```tsx
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
```

### 3. Páginas Existentes

Las páginas existentes (`users.tsx`, etc.) se mantienen igual, pero ahora estarán dentro del `MainContent` del `AppShell`.

---

## 🎯 Estados y Comportamientos

### Sidebar Toggle

- **Estado:** `isSidebarOpen` (useState o Zustand)
- **Desktop:** Toggle entre expandido/colapsado
- **Móvil:** Toggle entre visible/oculto (drawer)

### Active Route

- El item del sidebar debe resaltarse según la ruta actual
- Usar `useLocation()` de react-router para detectar ruta activa

### User Menu

- Dropdown que se abre al hacer clic en avatar
- Opciones:
  - Ver Perfil
  - Configuración
  - Separador
  - Cerrar Sesión (llama a `useAuth().logout()`)

---

## 🧪 Testing

### Tests a Crear

1. **AppShell.test.tsx**
   - Renderiza correctamente
   - Integra todos los componentes

2. **Sidebar.test.tsx**
   - Muestra items de navegación
   - Oculta items sin permisos
   - Resalta item activo
   - Toggle funciona

3. **Header.test.tsx**
   - Muestra logo
   - Muestra user menu
   - User menu abre/cierra

4. **Navigation.test.tsx**
   - Items se filtran por permisos
   - Items activos se detectan correctamente

---

## 📐 Dimensiones y Espaciado

### Header
- Altura: 64px
- Padding horizontal: 24px (px-6)
- Gap entre elementos: 16px (gap-4)

### Sidebar
- Ancho expandido: 256px
- Ancho colapsado: 64px
- Padding vertical: 16px (py-4)
- Gap entre items: 4px (gap-1)

### MainContent
- Padding: 24px (p-6)
- Max-width: container (1280px en xl)
- Margin: auto (centrado)

### Footer
- Altura: 48px
- Padding horizontal: 24px

---

## 🎨 Componentes shadcn/ui a Usar

- `Button` - Botones del header
- `DropdownMenu` - User menu, notifications
- `Badge` - Contadores de notificaciones
- `Avatar` - Avatar del usuario
- `Separator` - Separadores en menús
- `Sheet` o `Drawer` - Sidebar móvil (si usamos shadcn drawer)

---

## 🚀 Orden de Implementación

1. **Fase 1: Estructura Base**
   - Crear `AppShell.tsx` con estructura básica
   - Crear `MainContent.tsx` simple
   - Crear `Footer.tsx` básico
   - Integrar en `root.tsx`

2. **Fase 2: Header**
   - Crear `Header.tsx` con logo y user menu
   - Implementar `UserMenu.tsx`
   - Integrar en `AppShell`

3. **Fase 3: Sidebar**
   - Crear `Sidebar.tsx` básico
   - Crear `NavItem.tsx`
   - Crear `navigation.ts` config
   - Integrar permisos en items

4. **Fase 4: Responsive**
   - Implementar toggle sidebar
   - Sidebar drawer para móvil
   - Ajustes responsive

5. **Fase 5: Refinamiento**
   - Estados activos
   - Animaciones suaves
   - Tests

---

## ✅ Checklist de Implementación

- [ ] AppShell creado y funcional
- [ ] Header con logo y user menu
- [ ] Sidebar con navegación
- [ ] MainContent con padding correcto
- [ ] Footer básico
- [ ] Integración con permisos
- [ ] Responsive (móvil, tablet, desktop)
- [ ] Sidebar toggle funcional
- [ ] Ruta activa resaltada
- [ ] User menu funcional
- [ ] Tests básicos
- [ ] Integrado en root.tsx
- [ ] Rutas protegidas funcionando

---

## 📝 Notas Importantes

1. **Desktop-First**: Diseñado principalmente para desktop, pero funcional en móvil
2. **Permisos**: Todos los items de navegación deben verificar permisos
3. **Colores**: Usar colores de marca de `docs/brand/colors.md`
4. **Iconos**: Usar Hugeicons (`@hugeicons/react`)
5. **Tipografía**: Noto Sans (ya configurada)
6. **Accesibilidad**: ARIA labels, navegación por teclado, focus visible

---

**¿Listo para implementar?** Esta guía cubre todos los aspectos del Layout Principal. ¿Quieres que proceda con la implementación o hay algo que quieras ajustar primero?
