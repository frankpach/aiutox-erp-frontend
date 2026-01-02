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
    // But ensure it's a proper path segment (not just a prefix match)
    // e.g., "/files" should match "/files/123" but NOT "/config/files"
    if (item.to !== "/" && location.pathname.startsWith(item.to)) {
      // Ensure it's a proper path segment by checking the next character
      const nextChar = location.pathname[item.to.length];
      return nextChar === undefined || nextChar === "/" || nextChar === "?";
    }
    return false;
  }, [location.pathname, item.to]);

  const paddingLeft = level * 16; // 16px por nivel

  // Ensure item.to is a valid string
  if (!item.to || typeof item.to !== "string") {
    console.error("[NavigationTree] Invalid item.to:", item);
    return null;
  }

  // Debug: Log files item to verify it's correct
  if (item.id === "files") {
    console.log("[NavigationTree] Files item:", { id: item.id, to: item.to, label: item.label });
  }

  return (
    <Link
      to={item.to}
      className={cn(
        "flex items-center gap-2 px-4 py-2 text-sm font-medium rounded-md mx-2",
        "transition-all duration-150 ease-[cubic-bezier(0.4,0,0.2,1)]",
        "hover:bg-accent focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2",
        isActive
          ? "bg-primary/10 text-primary"
          : "text-foreground hover:text-primary",
        isCollapsed && "justify-center px-2"
      )}
      style={{ paddingLeft: isCollapsed ? undefined : `${paddingLeft}px` }}
      aria-current={isActive ? "page" : undefined}
      aria-label={isCollapsed ? item.label : undefined}
      title={isCollapsed ? item.label : undefined}
      onClick={(e) => {
        // Debug: Log click event for files item
        if (item.id === "files") {
          console.log("[NavigationTree] Files link clicked:", {
            to: item.to,
            currentPath: location.pathname,
            target: e.currentTarget.href,
            preventDefault: e.defaultPrevented
          });
          // Ensure navigation happens
          if (item.to && item.to !== location.pathname) {
            console.log("[NavigationTree] Navigating to:", item.to);
          }
        }
      }}
    >
      {item.icon && (
        <HugeiconsIcon
          icon={item.icon}
          size={18}
          color={isActive ? "hsl(var(--primary))" : "hsl(var(--foreground))"}
          strokeWidth={1.5}
          className="transition-colors duration-150"
        />
      )}
      <span
        className={cn(
          "flex-1 truncate transition-all duration-150",
          isCollapsed && "opacity-0 w-0 invisible"
        )}
      >
        {item.label}
      </span>
      {item.badge !== undefined && item.badge > 0 && !isCollapsed && (
        <span className="flex items-center justify-center min-w-[20px] h-5 px-1.5 text-xs font-semibold text-primary-foreground bg-primary rounded-full transition-all duration-150">
          {item.badge > 99 ? "99+" : item.badge}
        </span>
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

  // ✅ SIMPLIFIED: If module has only 1 item, render it as a direct link (no expandable button)
  if (module.items.length === 1) {
    return (
      <NavigationItemComponent
        item={module.items[0]}
        isCollapsed={isCollapsed}
        level={0} // Direct item, no nesting
      />
    );
  }

  if (isCollapsed) {
    // In collapsed mode, show all items with icons only
    return (
      <div className="space-y-1 m-1">
        {module.items.map((item) => (
          <NavigationItemComponent
            key={item.id}
            item={item}
            isCollapsed={true}
            level={0}
          />
        ))}
      </div>
    );
  }

  return (
    <div className="space-y-1 m-1">
      {/* Module header (clickable to expand/collapse) - only if multiple items */}
      <button
        onClick={() => setIsExpanded(!isExpanded)}
        className={cn(
          "w-full flex items-center gap-2 px-4 py-2 text-sm font-semibold rounded-md mx-2",
          "transition-all duration-150 ease-[cubic-bezier(0.4,0,0.2,1)]",
          "hover:bg-accent focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2",
          hasActiveItem
            ? "bg-primary/5 text-primary"
            : "text-foreground hover:text-primary"
        )}
        aria-expanded={isExpanded}
        aria-label={`${module.name} module`}
      >
        {isExpanded ? (
          <ChevronDown className="h-4 w-4 transition-transform duration-150" />
        ) : (
          <ChevronRight className="h-4 w-4 transition-transform duration-150" />
        )}
        <HugeiconsIcon
          icon={FolderIcon}
          size={18}
          color={hasActiveItem ? "hsl(var(--primary))" : "hsl(var(--foreground))"}
          strokeWidth={1.5}
          className="transition-colors duration-150"
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
  useEffect(() => {
    if (hasActiveItem && !isExpanded) {
      setIsExpanded(true);
    }
  }, [hasActiveItem, isExpanded]);

  if (isCollapsed) {
    // In collapsed mode, show modules without category headers
    return (
      <div className="space-y-1 m-1">
        {Array.from(modules.values()).map((module) => (
          <ModuleNodeComponent
            key={module.id}
            module={module}
            isCollapsed={isCollapsed}
            categoryName={categoryName}
          />
        ))}
      </div>
    );
  }

  // ✅ SIMPLIFIED: Hide category header for "_root" category (top-level items like Dashboard)
  if (categoryName === "_root") {
    return (
      <div className="space-y-1 m-1">
        {Array.from(modules.values()).map((module) => (
          <ModuleNodeComponent
            key={module.id}
            module={module}
            isCollapsed={isCollapsed}
            categoryName={categoryName}
          />
        ))}
      </div>
    );
  }

  return (
    <div className="space-y-1 m-1">
      {/* Category header */}
      <button
        onClick={() => setIsExpanded(!isExpanded)}
        className={cn(
          "w-full flex items-center gap-2 px-4 py-2 text-xs font-bold uppercase tracking-wider rounded-md mx-2",
          "transition-all duration-150 ease-[cubic-bezier(0.4,0,0.2,1)]",
          "hover:bg-accent focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2",
          hasActiveItem
            ? "bg-primary/5 text-primary"
            : "text-muted-foreground hover:text-primary"
        )}
        aria-expanded={isExpanded}
        aria-label={`${categoryName} category`}
      >
        {isExpanded ? (
          <ChevronDown className="h-3.5 w-3.5 transition-transform duration-150" />
        ) : (
          <ChevronRight className="h-3.5 w-3.5 transition-transform duration-150" />
        )}
        <span className="flex-1 text-left truncate">{categoryName}</span>
      </button>

      {/* Category modules (Nivel 2) - Simplified: direct items or expandable modules */}
      {isExpanded && (
        <div className="ml-2 space-y-1">
          {Array.from(modules.values()).map((module) => {
            // ✅ FIXED: If module id ends with "-direct", render items directly (no module header)
            if (module.id.endsWith("-direct")) {
              return (
                <div key={module.id} className="space-y-0.5 m-1">
                  {module.items.map((item) => (
                    <NavigationItemComponent
                      key={item.id}
                      item={item}
                      isCollapsed={isCollapsed}
                      level={0} // Direct items, no nesting
                    />
                  ))}
                </div>
              );
            }

            // ✅ If module has 1 item, render as direct link
            // ✅ If module has multiple items, render as expandable module
            return (
              <ModuleNodeComponent
                key={module.id}
                module={module}
                isCollapsed={isCollapsed}
                categoryName={categoryName}
              />
            );
          })}
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
      <div className={cn(
        "py-8 text-center text-sm text-muted-foreground",
        isCollapsed ? "px-2" : "px-4"
      )}>
        {isCollapsed ? (
          <div className="flex justify-center" title="No hay módulos disponibles">
            <HugeiconsIcon
              icon={FolderIcon}
              size={24}
              color="hsl(var(--muted-foreground))"
              strokeWidth={1.5}
            />
          </div>
        ) : (
          "No hay módulos disponibles"
        )}
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







