import {
  HomeIcon,
  UserIcon,
  Settings02Icon,
  PaintBoardIcon,
  SecurityIcon, // Reemplaza ShieldKeyholeLockIcon
  GridIcon,
  NotificationIcon, // Reemplaza BellIcon
  LinkSquare02Icon,
  Download01Icon, // Reemplaza FileDownloadIcon
  Upload01Icon, // Reemplaza FileUploadIcon
  FileViewIcon, // Reemplaza AuditIcon
  GlobeIcon,
  FolderIcon, // Para el módulo Files
} from "@hugeicons/core-free-icons";

/**
 * Configuración de items de navegación del sidebar
 */

export interface NavItem {
  id: string;
  label: string;
  icon: typeof HomeIcon; // Tipo del icono de Hugeicons
  to?: string; // Opcional si tiene children
  permission?: string; // Permiso requerido para mostrar el item
  badge?: number; // Contador opcional (ej: notificaciones)
  children?: NavItem[]; // Sub-items
  requiresAnyPermission?: string[]; // Mostrar si tiene al menos uno de estos permisos
}

/**
 * Items de navegación principales
 *
 * Los items se filtran por permisos antes de mostrarse en el sidebar.
 * Si un item no tiene `permission`, se muestra siempre para usuarios autenticados.
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
    id: "files",
    label: "Archivos",
    icon: FolderIcon,
    to: "/files",
    permission: "files.view",
  },

  // Sección de Configuración (items directos, sin módulos intermedios)
  {
    id: "configuration",
    label: "Configuración",
    icon: Settings02Icon,
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
        id: "config-theme",
        label: "Tema y Apariencia",
        icon: PaintBoardIcon,
        to: "/config/theme",
        permission: "config.view_theme",
      },
      {
        id: "config-general",
        label: "Preferencias Generales",
        icon: GlobeIcon,
        to: "/config/general",
        permission: "config.view",
      },
      {
        id: "config-modules",
        label: "Módulos del Sistema",
        icon: GridIcon,
        to: "/config/modules",
        permission: "config.view",
      },
      {
        id: "config-roles",
        label: "Roles y Permisos",
        icon: SecurityIcon,
        to: "/config/roles",
        permission: "auth.manage_roles",
      },
      {
        id: "config-notifications",
        label: "Notificaciones",
        icon: NotificationIcon,
        to: "/config/notifications",
        permission: "notifications.manage",
      },
      {
        id: "config-integrations",
        label: "Integraciones",
        icon: LinkSquare02Icon,
        to: "/config/integrations",
        permission: "integrations.view",
      },
      {
        id: "config-import-export",
        label: "Importar / Exportar",
        icon: Upload01Icon,
        to: "/config/import-export",
        permission: "import_export.view",
      },
      {
        id: "config-audit",
        label: "Auditoría",
        icon: FileViewIcon,
        to: "/config/audit",
        permission: "auth.view_audit",
      },
    ],
  },
];










