# Sistema de Gestión de Usuarios

## Descripción General

Sistema completo de gestión de usuarios con soporte para:
- CRUD completo de usuarios
- Gestión de organizaciones y contactos
- Métodos de contacto polimórficos
- Roles personalizados con permisos granulares
- Delegación temporal de permisos
- Filtrado multi-tenant

## Estructura de Archivos

```
features/users/
├── api/
│   ├── users.api.ts
│   ├── organizations.api.ts
│   ├── contacts.api.ts
│   ├── contactMethods.api.ts
│   ├── roles.api.ts
│   └── permissions.api.ts
├── components/
│   ├── UsersList.tsx
│   ├── UserForm.tsx
│   ├── UserFormModal.tsx
│   ├── UserDetail.tsx
│   ├── UserOrganizations.tsx
│   ├── UserContactMethods.tsx
│   ├── ContactMethodForm.tsx
│   ├── UserRolesManager.tsx
│   ├── CustomRolesManager.tsx
│   ├── RoleForm.tsx
│   ├── UserPermissionsManager.tsx
│   ├── ModulePermissionsView.tsx
│   └── PermissionDelegationModal.tsx
├── hooks/
│   ├── useUsers.ts
│   ├── useOrganizations.ts
│   ├── useContacts.ts
│   ├── useContactMethods.ts
│   ├── useCustomRoles.ts
│   ├── useUserRoles.ts
│   └── useUserPermissions.ts
├── types/
│   └── user.types.ts
└── validations/
    └── user.schema.ts
```

## Uso

### Listar Usuarios

```typescript
import { useUsers } from "~/features/users/hooks/useUsers";

function UsersPage() {
  const { users, loading, error, pagination, refresh } = useUsers({
    page: 1,
    page_size: 20,
    search: "john",
    is_active: true
  });

  // ...
}
```

### Crear Usuario

```typescript
import { useCreateUser } from "~/features/users/hooks/useUsers";

function CreateUser() {
  const { create, loading, error } = useCreateUser();

  const handleSubmit = async (data: UserCreate) => {
    const user = await create(data);
    if (user) {
      // Usuario creado exitosamente
    }
  };
}
```

### Gestionar Roles

```typescript
import { useUserRoles, useAssignRole } from "~/features/users/hooks/useUserRoles";

function UserRoles({ userId }: { userId: string }) {
  const { roles, refresh } = useUserRoles(userId);
  const { assign } = useAssignRole();

  const handleAssign = async (role: GlobalRole) => {
    await assign(userId, role);
    refresh();
  };
}
```

### Delegar Permisos

```typescript
import { useDelegatePermission } from "~/features/users/hooks/useUserPermissions";

function DelegatePermission() {
  const { delegate, loading } = useDelegatePermission();

  const handleDelegate = async () => {
    await delegate("inventory", {
      target_user_id: "user-id",
      permission: "inventory.edit",
      expires_at: "2024-12-31T23:59:59Z"
    });
  };
}
```

## Permisos Requeridos

- `auth.manage_users` - Gestionar usuarios
- `auth.manage_roles` - Gestionar roles
- `{module}.manage_users` - Delegar permisos de un módulo específico

## Cache Cifrado

Los datos de usuarios se cachean localmente con cifrado:
- TTL: 30 días
- Cifrado por usuario (cada usuario tiene su propia clave)
- Limpieza automática de datos expirados

