import { useEffect } from "react";
import { useLocation } from "react-router";
import { useAuthStore } from "~/stores/authStore";
import { useModulesStore, initializeModules } from "~/stores/modulesStore";
import { NavigationTree } from "./NavigationTree";
import { cn } from "~/lib/utils";

/**
 * Sidebar - Barra lateral de navegación
 *
 * Muestra navegación jerárquica (3 niveles) con autodiscovery de módulos.
 * Filtra automáticamente por permisos del usuario.
 * Soporta estados expandido/colapsado y drawer móvil.
 */
interface SidebarProps {
  isOpen?: boolean;
  onClose?: () => void;
  isCollapsed?: boolean;
  onToggleCollapse?: () => void;
}

export function Sidebar({
  isOpen = true,
  onClose,
  isCollapsed = false,
  onToggleCollapse: _onToggleCollapse,
}: SidebarProps) {
  const isAuthenticated = useAuthStore((state) => state.isAuthenticated);
  const { isInitialized, loadModules } = useModulesStore();

  // Cargar módulos cuando el usuario esté autenticado
  useEffect(() => {
    if (isAuthenticated && !isInitialized) {
      loadModules().catch((error) => {
        console.error("Failed to load modules:", error);
      });
    }
  }, [isAuthenticated, isInitialized, loadModules]);

  // Cerrar sidebar en móvil cuando se hace clic fuera
  useEffect(() => {
    if (isOpen && window.innerWidth < 1024) {
      const handleClickOutside = (event: MouseEvent) => {
        const target = event.target as HTMLElement;
        if (!target.closest('[data-sidebar]')) {
          onClose?.();
        }
      };

      document.addEventListener("mousedown", handleClickOutside);
      return () => {
        document.removeEventListener("mousedown", handleClickOutside);
      };
    }
  }, [isOpen, onClose]);

  return (
    <>
      {/* Backdrop para móvil */}
      {isOpen && (
        <div
          className="fixed inset-0 bg-black/50 z-40 lg:hidden"
          onClick={onClose}
          aria-hidden="true"
        />
      )}

      {/* Sidebar */}
      <aside
        data-sidebar
        className={cn(
          "fixed lg:static inset-y-0 left-0 z-50",
          "w-64 bg-gray-50 border-r border-gray-200",
          "flex flex-col",
          "transition-all duration-300 ease-in-out",
          "lg:translate-x-0",
          isOpen ? "translate-x-0" : "-translate-x-full",
          isCollapsed && "lg:w-16 lg:transition-all lg:duration-300"
        )}
        role="navigation"
        aria-label="Navegación principal"
      >
        {/* Logo/Header (opcional, solo desktop) */}
        {!isCollapsed && (
          <div className="h-16 px-4 flex items-center border-b border-gray-200">
            <span className="text-lg font-bold text-[#023E87]">AiutoX</span>
          </div>
        )}

        {/* Navigation Menu - Hierarchical Navigation Tree */}
        <nav className="flex-1 overflow-y-auto py-4 px-2">
          {isAuthenticated ? (
            <NavigationTree isCollapsed={isCollapsed} />
          ) : (
            <div className="px-4 py-8 text-center text-sm text-gray-500">
              Inicia sesión para ver la navegación
            </div>
          )}
        </nav>

        {/* User Info (opcional, parte inferior) */}
        {/* Se puede agregar información del usuario aquí si se desea */}
      </aside>
    </>
  );
}




