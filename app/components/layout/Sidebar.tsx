import { useEffect } from "react";
import { useAuthStore } from "~/stores/authStore";
import { useModulesStore } from "~/stores/modulesStore";
import { NavigationTree } from "./NavigationTree";
import { TenantSwitcher } from "./TenantSwitcher";
import { cn } from "~/lib/utils";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { Button } from "~/components/ui/button";

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
  onToggleCollapse,
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
    return undefined;
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
          "transition-[width,transform] duration-200 ease-[cubic-bezier(0.4,0,0.2,1)]",
          "lg:translate-x-0",
          isOpen ? "translate-x-0" : "-translate-x-full",
          isCollapsed && "lg:w-20"
        )}
        role="navigation"
        aria-label="Navegación principal"
      >
        {/* Logo/Header */}
        <div className="h-16 px-4 flex items-center justify-center border-b border-gray-200 bg-white overflow-hidden">
          <div className="flex items-center gap-3 w-full min-w-0">
            <img
              src="/logo-icon.png"
              alt="AiutoX Logo"
              className="h-10 w-10 object-contain flex-shrink-0 transition-all duration-200"
            />
            <img
              src="/logo-name.png"
              alt="AiutoX"
              className={cn(
                "h-6 object-contain transition-all duration-200",
                isCollapsed
                  ? "opacity-0 w-0 invisible"
                  : "opacity-100 w-auto visible"
              )}
            />
          </div>
        </div>

        {/* Tenant Switcher */}
        {isAuthenticated && (
          <div className="px-2 py-3 border-b border-gray-200 bg-white">
            <TenantSwitcher isCollapsed={isCollapsed} />
          </div>
        )}

        {/* Navigation Menu - Hierarchical Navigation Tree */}
        <nav className="flex-1 overflow-y-auto py-4 px-2">
          {isAuthenticated ? (
            <NavigationTree isCollapsed={isCollapsed} />
          ) : (
            <div className={cn(
              "px-4 py-8 text-center text-sm text-gray-500",
              isCollapsed && "px-2"
            )}>
              {isCollapsed ? "🔒" : "Inicia sesión para ver la navegación"}
            </div>
          )}
        </nav>

        {/* Botón de colapsar/expandir (solo desktop) */}
        <div className="hidden lg:flex items-center justify-center py-3 border-t border-gray-200 bg-white">
          <Button
            variant="ghost"
            size="icon"
            onClick={onToggleCollapse}
            className="h-8 w-8"
            aria-label={isCollapsed ? "Expandir menú" : "Colapsar menú"}
            title={isCollapsed ? "Expandir menú" : "Colapsar menú"}
          >
            {isCollapsed ? (
              <ChevronRight className="h-5 w-5 text-[#023E87]" />
            ) : (
              <ChevronLeft className="h-5 w-5 text-[#023E87]" />
            )}
          </Button>
        </div>
      </aside>
    </>
  );
}










