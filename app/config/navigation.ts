import {
  HomeIcon,
  UserIcon,
  PlugIcon,
  GridIcon,
  ArrowLeftIcon,
  DownloadIcon,
  UploadIcon,
  SearchIcon,
  CheckmarkSquareIcon,
  ShieldIcon,
  FileEditIcon,
  ZapIcon,
  Calendar01Icon,
  Settings01Icon,
} from "@hugeicons/core-free-icons";
import type { IconSvgElement } from "@hugeicons/react";

/**
 * Configuración de items de navegación del sidebar
 */

export interface NavItem {
  id: string;
  label: string;
  icon: IconSvgElement;
  to?: string; // Opcional si tiene children
  permission?: string; // Permiso requerido para mostrar el item
  badge?: number; // Contador opcional (ej: notificaciones)
  children?: NavItem[]; // Sub-items
  requiresAnyPermission?: string[]; // Mostrar si tiene al menos uno de estos permisos
  requiresModuleSetting?: {
    module: string;
    key: string;
    value?: boolean;
  };
}

/**
 * Items de navegación principales
 *
 * Los items se filtran por permisos antes de mostrarse en el sidebar.
 * Si un item no tiene `permission`, se muestra siempre para usuarios autenticados.
 *
 * Estructura propuesta:
 * - Navbar principal (operativo): Dashboard, Operación, Gestión, Análisis, Automatización
 * - Navbar técnico/admin (oculto por rol): Sistema/Avanzado
 * - Configuración (solo admin): Items de configuración agrupados
 * - Contextual (no en navbar): Activities/Timeline, Comments, Views/Filters
 */
export const navigationItems: NavItem[] = [
  {
    id: "dashboard",
    label: "Dashboard",
    icon: HomeIcon,
    to: "/",
    // Sin permiso requerido - visible para todos los usuarios autenticados
  },
  {
    id: "calendar",
    label: "Mi calendario",
    icon: Calendar01Icon,
    to: "/calendar",
    permission: "calendar.view",
    requiresModuleSetting: {
      module: "tasks",
      key: "calendar.enabled",
      value: true,
    },
  },

  // Categoría: Operación
  {
    id: "operations",
    label: "Operación",
    icon: CheckmarkSquareIcon,
    requiresAnyPermission: [
      "files.view",
      "tasks.view",
      "approvals.view",
    ],
    children: [
      {
        id: "tasks",
        label: "Tareas",
        icon: CheckmarkSquareIcon,
        to: "/tasks",
        permission: "tasks.view",
      },
      {
        id: "approvals",
        label: "Aprobaciones",
        icon: ShieldIcon,
        to: "/approvals",
        permission: "approvals.view",
      },
      {
        id: "files",
        label: "Archivos",
        icon: FileEditIcon,
        to: "/files",
        permission: "files.view",
      },
    ],
  },

  // Categoría: Gestión
  {
    id: "management",
    label: "Gestión",
    icon: UploadIcon,
    requiresAnyPermission: [
      "products.view",
    ],
    children: [
      {
        id: "products",
        label: "Productos",
        icon: UploadIcon,
        to: "/products",
        permission: "products.view",
      },
    ],
  },

  // Categoría: Análisis
  {
    id: "analysis",
    label: "Análisis",
    icon: SearchIcon,
    requiresAnyPermission: [
      "search.view",
    ],
    children: [
      {
        id: "search",
        label: "Búsqueda Avanzada",
        icon: SearchIcon,
        to: "/search",
        permission: "search.view",
      },
    ],
  },

  // Categoría: Automatización
  {
    id: "automation",
    label: "Automatización",
    icon: ZapIcon,
    requiresAnyPermission: [
      "automation.view",
    ],
    children: [
      {
        id: "automation",
        label: "Automatización",
        icon: ZapIcon,
        to: "/automation",
        permission: "automation.view",
      },
    ],
  },

  // Categoría: Sistema/Avanzado (oculto por rol - solo admin/tecnico)
  {
    id: "system",
    label: "Sistema",
    icon: PlugIcon,
    requiresAnyPermission: [
      "pubsub.view",
      "system.configure",
    ],
    children: [
      {
        id: "pubsub",
        label: "PubSub",
        icon: PlugIcon,
        to: "/pubsub",
        permission: "pubsub.view",
      },
    ],
  },

  // Sección de Configuración (items directos, sin módulos intermedios)
  {
    id: "configuration",
    label: "Configuración",
    icon: GridIcon,
    // Mostrar si tiene al menos uno de estos permisos
    requiresAnyPermission: [
      "users.view",
      "config.view",
      "config.view_theme",
      "auth.manage_roles",
      "system.configure",
      "notifications.manage",
      "integrations.view",
      "import_export.view",
      "auth.view_audit",
    ],
    children: [
      {
        id: "config-users",
        label: "Usuarios",
        icon: UserIcon,
        to: "/users",
        permission: "users.view",
      },
      {
        id: "config-roles",
        label: "Roles y Permisos",
        icon: ShieldIcon,
        to: "/config/roles",
        permission: "auth.manage_roles",
      },
      {
        id: "config-modules",
        label: "Módulos del Sistema",
        icon: ZapIcon,
        to: "/config/modules",
        permission: "config.view",
      },
      {
        id: "config-tasks",
        label: "Configuración de tareas",
        icon: Settings01Icon,
        to: "/tasks/settings",
        permission: "tasks.manage",
      },
      {
        id: "config-integrations",
        label: "Integraciones",
        icon: PlugIcon,
        to: "/config/integrations",
        permission: "integrations.view",
      },
      {
        id: "config-quick-actions",
        label: "Acciones Rápidas",
        icon: ZapIcon,
        to: "/config/quick-actions",
        permission: "config.view",
      },
      {
        id: "config-import-export",
        label: "Importar / Exportar",
        icon: UploadIcon,
        to: "/config/import-export",
        permission: "import_export.view",
      },
      {
        id: "config-notifications",
        label: "Notificaciones",
        icon: UploadIcon,
        to: "/config/notifications",
        permission: "notifications.manage",
      },
      {
        id: "config-general",
        label: "Preferencias Generales",
        icon: CheckmarkSquareIcon,
        to: "/config/general",
        permission: "config.view",
      },
      {
        id: "config-theme",
        label: "Tema y Apariencia",
        icon: DownloadIcon,
        to: "/config/theme",
        permission: "config.view_theme",
      },
      {
        id: "config-audit",
        label: "Auditoría",
        icon: FileEditIcon,
        to: "/config/audit",
        permission: "auth.view_audit",
      },
      {
        id: "config-files",
        label: "Almacenamiento y Archivos",
        icon: ArrowLeftIcon,
        to: "/config/files",
        permission: "system.configure",
      },
    ],
  },
];






