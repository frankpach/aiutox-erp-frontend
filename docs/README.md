# Frontend Documentation

## Índice

- [Sistema de Módulos Autodiscoverable](./MODULE_SYSTEM.md)
- [Gestión de Usuarios](./USER_MANAGEMENT.md)
- [Seguridad y Cifrado](./SECURITY.md)

## Estructura del Proyecto

```
frontend/app/
├── lib/
│   ├── modules/          # Sistema de módulos autodiscoverable
│   ├── storage/          # Cifrado y cache local
│   └── api/              # API services
├── stores/               # Zustand stores
├── hooks/                # React hooks
├── components/
│   ├── layout/           # Layout components (Sidebar, NavigationTree)
│   └── common/           # Componentes comunes (Toast, ConfirmDialog)
└── features/
    └── users/            # Feature: Gestión de usuarios
```

## Características Principales

### Sistema de Módulos Autodiscoverable

- Descubrimiento automático desde backend
- Navegación jerárquica de 3 niveles
- Filtrado por permisos y tenant
- Cache cifrado con TTL de 30 días

### Gestión de Usuarios

- CRUD completo de usuarios
- Gestión de organizaciones y contactos
- Métodos de contacto polimórficos
- Roles personalizados con permisos granulares
- Delegación temporal de permisos

### Seguridad

- Cifrado AES-GCM para datos locales
- TTL de 30 días para datos cacheados
- Limpieza automática de datos expirados
- Filtrado multi-tenant

## Guías de Uso

Ver documentación específica en:
- [MODULE_SYSTEM.md](./MODULE_SYSTEM.md) - Sistema de módulos
- [USER_MANAGEMENT.md](./USER_MANAGEMENT.md) - Gestión de usuarios
- [SECURITY.md](./SECURITY.md) - Seguridad y cifrado
