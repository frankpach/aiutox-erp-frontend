import { HomeIcon, UserIcon } from "@hugeicons/core-free-icons";

/**
 * Configuración de items de navegación del sidebar
 */

export interface NavItem {
  id: string;
  label: string;
  icon: typeof HomeIcon; // Tipo del icono de Hugeicons
  to: string;
  permission?: string; // Permiso requerido para mostrar el item
  badge?: number; // Contador opcional (ej: notificaciones)
  children?: NavItem[]; // Sub-items (futuro)
}

/**
 * Items de navegación principales
 *
 * Los items se filtran por permisos antes de mostrarse en el sidebar.
 * Si un item no tiene `permission`, se muestra siempre para usuarios autenticados.
 */
export const navigationItems: NavItem[] = [
  {
    id: "home",
    label: "Inicio",
    icon: HomeIcon,
    to: "/",
    // Sin permiso requerido - visible para todos los usuarios autenticados
  },
  {
    id: "users",
    label: "Usuarios",
    icon: UserIcon,
    to: "/users",
    permission: "users.view", // Requiere permiso para ver usuarios
  },
  // Más items se agregarán cuando se implementen otros módulos:
  // - Products
  // - Inventory
  // - Customers
  // etc.
];




