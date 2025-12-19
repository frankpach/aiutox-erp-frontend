/**
 * NavigationTree - Componente de navegación jerárquica (3 niveles)
 *
 * Renderiza la navegación en 3 niveles:
 * - Nivel 1: Categoría/Grupo (expandible)
 * - Nivel 2: Módulo (expandible)
 * - Nivel 3: Items/Páginas (enlaces)
 *
 * Filtra automáticamente por permisos del usuario.
 */

import { useState, useMemo, useEffect } from "react";
import { Link, useLocation } from "react-router";
import { HugeiconsIcon } from "@hugeicons/react";
import { FolderIcon } from "@hugeicons/core-free-icons";
import { ChevronDown, ChevronRight } from "lucide-react";
import { useNavigation } from "~/hooks/useNavigation";
import type { NavigationItem, ModuleNode } from "~/lib/modules/types";
import { cn } from "~/lib/utils";

/**
 * Componente para renderizar un item de navegación (Nivel 3)
 */
interface NavigationItemComponentProps {
  item: NavigationItem;
  isCollapsed: boolean;
  level: number; // Nivel de anidación (0 = root, 1 = category, 2 = module, 3 = item)
}

function NavigationItemComponent({
  item,
  isCollapsed,
  level,
}: NavigationItemComponentProps) {
  const location = useLocation();

  // Check if item is active
  const isActive = useMemo(() => {
    if (location.pathname === item.to) {
      return true;
    }
    // Check if current path starts with item path (for nested routes)
    if (item.to !== "/" && location.pathname.startsWith(item.to)) {
      return true;
    }
    return false;
  }, [location.pathname, item.to]);

  const paddingLeft = level * 16; // 16px por nivel

  return (
    <Link
      to={item.to}
      className={cn(
        "flex items-center gap-2 px-4 py-2 text-sm font-medium",
        "transition-all duration-200 ease-in-out",
        "hover:bg-gray-100 focus:outline-none focus:ring-2 focus:ring-[#023E87] focus:ring-offset-2",
        isActive
          ? "bg-[#023E87]/10 text-[#023E87] border-r-2 border-[#023E87]"
          : "text-[#121212] hover:text-[#023E87]",
        isCollapsed && "justify-center"
      )}
      style={{ paddingLeft: isCollapsed ? undefined : `${paddingLeft}px` }}
      aria-current={isActive ? "page" : undefined}
      aria-label={isCollapsed ? item.label : undefined}
      title={isCollapsed ? item.label : undefined}
    >
      {item.icon && (
        <HugeiconsIcon
          icon={item.icon}
          size={18}
          color={isActive ? "#023E87" : "#121212"}
          strokeWidth={1.5}
        />
      )}
      {!isCollapsed && (
        <>
          <span className="flex-1 truncate">{item.label}</span>
          {item.badge !== undefined && item.badge > 0 && (
            <span className="flex items-center justify-center min-w-[20px] h-5 px-1.5 text-xs font-semibold text-white bg-[#023E87] rounded-full">
              {item.badge > 99 ? "99+" : item.badge}
            </span>
          )}
        </>
      )}
    </Link>
  );
}

/**
 * Componente para renderizar un módulo (Nivel 2)
 */
interface ModuleNodeComponentProps {
  module: ModuleNode;
  isCollapsed: boolean;
  categoryName: string;
}

function ModuleNodeComponent({
  module,
  isCollapsed,
  categoryName: _categoryName,
}: ModuleNodeComponentProps) {
  const [isExpanded, setIsExpanded] = useState(false);
  const location = useLocation();

  // Check if any item in this module is active
  const hasActiveItem = module.items.some((item) => {
    if (location.pathname === item.to) return true;
    if (item.to !== "/" && location.pathname.startsWith(item.to)) return true;
    return false;
  });

  // Auto-expand if has active item
  if (hasActiveItem && !isExpanded) {
    setIsExpanded(true);
  }

  if (isCollapsed) {
    // In collapsed mode, show only the main route
    const mainItem = module.items[0];
    if (!mainItem) return null;

    return (
      <NavigationItemComponent
        item={mainItem}
        isCollapsed={true}
        level={0}
      />
    );
  }

  return (
    <div className="space-y-1">
      {/* Module header (clickable to expand/collapse) */}
      <button
        onClick={() => setIsExpanded(!isExpanded)}
        className={cn(
          "w-full flex items-center gap-2 px-4 py-2 text-sm font-semibold",
          "transition-all duration-200 ease-in-out",
          "hover:bg-gray-100 focus:outline-none focus:ring-2 focus:ring-[#023E87] focus:ring-offset-2",
          hasActiveItem
            ? "bg-[#023E87]/5 text-[#023E87]"
            : "text-[#333333] hover:text-[#023E87]"
        )}
        aria-expanded={isExpanded}
        aria-label={`${module.name} module`}
      >
        {isExpanded ? (
          <ChevronDown className="h-4 w-4" />
        ) : (
          <ChevronRight className="h-4 w-4" />
        )}
        <HugeiconsIcon
          icon={FolderIcon}
          size={18}
          color={hasActiveItem ? "#023E87" : "#333333"}
          strokeWidth={1.5}
        />
        <span className="flex-1 text-left truncate">{module.name}</span>
      </button>

      {/* Module items (Nivel 3) */}
      {isExpanded && (
        <div className="ml-4 space-y-0.5">
          {module.items.map((item) => (
            <NavigationItemComponent
              key={item.id}
              item={item}
              isCollapsed={false}
              level={2}
            />
          ))}
        </div>
      )}
    </div>
  );
}

/**
 * Componente para renderizar una categoría (Nivel 1)
 */
interface CategoryNodeComponentProps {
  categoryName: string;
  modules: Map<string, ModuleNode>;
  isCollapsed: boolean;
}

function CategoryNodeComponent({
  categoryName,
  modules,
  isCollapsed,
}: CategoryNodeComponentProps) {
  const [isExpanded, setIsExpanded] = useState(true); // Categories expanded by default
  const location = useLocation();

  // Check if any module in this category has active items
  const hasActiveItem = Array.from(modules.values()).some((module) =>
    module.items.some((item) => {
      if (location.pathname === item.to) return true;
      if (item.to !== "/" && location.pathname.startsWith(item.to)) return true;
      return false;
    })
  );

  // Auto-expand if has active item
  if (hasActiveItem && !isExpanded) {
    setIsExpanded(true);
  }

  if (isCollapsed) {
    // In collapsed mode, don't show categories
    return null;
  }

  return (
    <div className="space-y-1">
      {/* Category header */}
      <button
        onClick={() => setIsExpanded(!isExpanded)}
        className={cn(
          "w-full flex items-center gap-2 px-4 py-2 text-xs font-bold uppercase tracking-wider",
          "transition-all duration-200 ease-in-out",
          "hover:bg-gray-100 focus:outline-none focus:ring-2 focus:ring-[#023E87] focus:ring-offset-2",
          hasActiveItem
            ? "bg-[#023E87]/5 text-[#023E87]"
            : "text-[#666666] hover:text-[#023E87]"
        )}
        aria-expanded={isExpanded}
        aria-label={`${categoryName} category`}
      >
        {isExpanded ? (
          <ChevronDown className="h-3.5 w-3.5" />
        ) : (
          <ChevronRight className="h-3.5 w-3.5" />
        )}
        <span className="flex-1 text-left truncate">{categoryName}</span>
      </button>

      {/* Category modules (Nivel 2) */}
      {isExpanded && (
        <div className="ml-2 space-y-1">
          {Array.from(modules.values()).map((module) => (
            <ModuleNodeComponent
              key={module.id}
              module={module}
              isCollapsed={isCollapsed}
              categoryName={categoryName}
            />
          ))}
        </div>
      )}
    </div>
  );
}

/**
 * NavigationTree - Componente principal
 *
 * Renderiza el árbol completo de navegación jerárquica.
 */
interface NavigationTreeProps {
  isCollapsed?: boolean;
}

export function NavigationTree({ isCollapsed = false }: NavigationTreeProps) {
  const navigationTree = useNavigation();

  if (!navigationTree || navigationTree.categories.size === 0) {
    return (
      <div className="px-4 py-8 text-center text-sm text-gray-500">
        No hay módulos disponibles
      </div>
    );
  }

  return (
    <nav className="space-y-2" aria-label="Navegación principal">
      {Array.from(navigationTree.categories.entries()).map(
        ([categoryName, categoryNode]) => (
          <CategoryNodeComponent
            key={categoryName}
            categoryName={categoryName}
            modules={categoryNode.modules}
            isCollapsed={isCollapsed}
          />
        )
      )}
    </nav>
  );
}

