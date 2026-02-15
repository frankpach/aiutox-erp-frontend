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
import { GridIcon } from "@hugeicons/core-free-icons";
import { ChevronDown, ChevronRight } from "lucide-react";
import { useNavigation } from "~/hooks/useNavigation";
import { useCategoryCollapse } from "~/hooks/useCategoryCollapse";
import {
  Collapsible,
  CollapsibleTrigger,
  CollapsibleContent,
} from "~/components/ui/collapsible";
import type { NavigationItem, ModuleNode } from "~/lib/modules/types";
import { cn } from "~/lib/utils";
import { useCalendarModalStore } from "~/stores/calendarModalStore";
import { useTranslation } from "~/lib/i18n/useTranslation";

const LONG_LABEL_TOOLTIP_THRESHOLD = 18;

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
  const calendarModal = useCalendarModalStore();

  // Check if item is active
  const isActive = useMemo(() => {
    if (item.to === "/calendar" && calendarModal.isOpen) {
      return true;
    }
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
  }, [calendarModal.isOpen, location.pathname, item.to]);

  const paddingLeft = level * 16; // 16px por nivel

  // Ensure item.to is a valid string
  if (!item.to || typeof item.to !== "string") {
    console.error("[NavigationTree] Invalid item.to:", item);
    return null;
  }

  // Debug: Log files item to verify it's correct
  if (item.id === "files") {
    console.warn("[NavigationTree] Files item:", {
      id: item.id,
      to: item.to,
      label: item.label,
    });
  }

  return (
    <Link
      to={item.to}
      onClick={(e) => {
        // Handle calendar modal
        if (item.to === "/calendar") {
          e.preventDefault();
          e.stopPropagation();
          calendarModal.open(location.pathname);
        }

        // Debug: Log click event for files item
        if (item.id === "files") {
          console.warn("[NavigationTree] Files link clicked:", {
            to: item.to,
            currentPath: location.pathname,
            target: e.currentTarget.href,
            preventDefault: e.defaultPrevented,
          });
          // Ensure navigation happens
          if (item.to && item.to !== location.pathname) {
            console.warn("[NavigationTree] Navigating to:", item.to);
          }
        }
      }}
      className={cn(
        "flex items-center gap-2 px-5 py-2 text-sm font-medium rounded-md mx-2 border-l-2 border-t border-r border-b",
        "transition-all duration-150 ease-in-out",
        "hover:bg-[hsl(var(--accent))] hover:text-[hsl(var(--accent-foreground))] focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2",
        isActive
          ? "bg-primary/10 text-primary border-l-primary border-t-primary/50 border-r-primary/50 border-b-primary/50"
          : "text-foreground hover:text-primary border-transparent",
        isCollapsed && "justify-center px-2 py-2.5"
      )}
      style={{ paddingLeft: isCollapsed ? undefined : `${paddingLeft}px` }}
      aria-current={isActive ? "page" : undefined}
      aria-label={isCollapsed ? item.label : undefined}
      title={
        isCollapsed || item.label.length > LONG_LABEL_TOOLTIP_THRESHOLD
          ? item.label
          : undefined
      }
    >
      <HugeiconsIcon
        icon={item.icon ?? GridIcon}
        size={isCollapsed ? 22 : 18}
        color={isActive ? "hsl(var(--primary))" : "hsl(var(--foreground))"}
        strokeWidth={1.5}
        className="transition-colors duration-150"
      />
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
    const firstItem = module.items[0];
    if (!firstItem) return null;

    return (
      <NavigationItemComponent
        item={firstItem}
        isCollapsed={isCollapsed}
        level={0} // Direct item, no nesting
      />
    );
  }

  if (isCollapsed) {
    // In collapsed mode, show one representative icon-only entry per module
    const firstItem = module.items[0];
    if (!firstItem) {
      return null;
    }

    return (
      <NavigationItemComponent
        item={firstItem}
        isCollapsed
        level={0}
      />
    );
  }

  return (
    <div className="space-y-1 m-1">
      {/* Module header (clickable to expand/collapse) - only if multiple items */}
      <button
        onClick={() => setIsExpanded(!isExpanded)}
        className={cn(
          "w-full flex items-center gap-2 px-4 py-2 text-sm font-semibold rounded-md mx-2",
          "transition-all duration-150 ease-in-out",
          "hover:bg-accent focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2",
          hasActiveItem
            ? "bg-primary/5 text-primary"
            : "text-foreground hover:text-primary"
        )}
        aria-expanded={isExpanded}
        aria-label={`${module.name} module`}
        title={
          module.name.length > LONG_LABEL_TOOLTIP_THRESHOLD
            ? module.name
            : undefined
        }
      >
        {isExpanded ? (
          <ChevronDown className="h-4 w-4 transition-transform duration-150" />
        ) : (
          <ChevronRight className="h-4 w-4 transition-transform duration-150" />
        )}
        <HugeiconsIcon
          icon={GridIcon}
          size={18}
          color={
            hasActiveItem ? "hsl(var(--primary))" : "hsl(var(--foreground))"
          }
          strokeWidth={1.5}
          className="transition-colors duration-150"
        />
        <span
          className="flex-1 text-left truncate"
          title={
            module.name.length > LONG_LABEL_TOOLTIP_THRESHOLD
              ? module.name
              : undefined
          }
        >
          {module.name}
        </span>
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
  isExpanded: boolean;
  onToggle: (categoryName: string) => void;
}

function CategoryNodeComponent({
  categoryName,
  modules,
  isCollapsed,
  isExpanded,
  onToggle,
}: CategoryNodeComponentProps) {
  const { language } = useTranslation();
  const location = useLocation();

  const isConfigurationCategory = useMemo(() => {
    const normalizedCategoryName = categoryName.toLowerCase();
    return (
      normalizedCategoryName.includes("config") ||
      normalizedCategoryName.includes("setting")
    );
  }, [categoryName]);

  const labelCollator = useMemo(
    () =>
      new Intl.Collator(language || "es", {
        sensitivity: "base",
        numeric: true,
      }),
    [language]
  );

  const categoryModules = useMemo(() => {
    const moduleList = Array.from(modules.values());
    if (!isConfigurationCategory) {
      return moduleList;
    }

    return [...moduleList].sort((a, b) => {
      const labelA = a.id.endsWith("-direct")
        ? (a.items[0]?.label ?? a.name)
        : (a.name || a.items[0]?.label || "");
      const labelB = b.id.endsWith("-direct")
        ? (b.items[0]?.label ?? b.name)
        : (b.name || b.items[0]?.label || "");

      return labelCollator.compare(labelA, labelB);
    });
  }, [modules, isConfigurationCategory, labelCollator]);

  const collapsedPrimaryModules = useMemo(
    () => categoryModules.filter((module) => !module.id.endsWith("-direct")),
    [categoryModules]
  );

  // Check if any module in this category has active items
  const hasActiveItem = Array.from(modules.values()).some((module) =>
    module.items.some((item) => {
      if (location.pathname === item.to) return true;
      if (item.to !== "/" && location.pathname.startsWith(item.to)) return true;
      return false;
    })
  );

  if (isCollapsed) {
    // In collapsed mode, show modules without category headers
    if (collapsedPrimaryModules.length === 0) {
      return null;
    }

    return (
      <div className="space-y-1 m-1">
        {collapsedPrimaryModules.map((module) => (
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
    <Collapsible open={isExpanded} onOpenChange={() => onToggle(categoryName)}>
      <div className="space-y-1 m-1">
        {/* Category header */}
        <CollapsibleTrigger asChild>
          <button
            className={cn(
              "w-full flex items-center gap-2 px-4 py-2 text-xs font-bold uppercase tracking-wider rounded-md mx-2",
              "transition-all duration-150 ease-in-out",
              "hover:bg-accent focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2",
              "data-[state=open]:bg-primary/5 data-[state=open]:text-primary",
              hasActiveItem
                ? "bg-primary/5 text-primary"
                : "text-muted-foreground hover:text-primary"
            )}
            aria-expanded={isExpanded}
            aria-label={`${categoryName} category`}
            title={
              categoryName.length > LONG_LABEL_TOOLTIP_THRESHOLD
                ? categoryName
                : undefined
            }
          >
            {isExpanded ? (
              <ChevronDown className="h-3.5 w-3.5 transition-transform duration-150" />
            ) : (
              <ChevronRight className="h-3.5 w-3.5 transition-transform duration-150" />
            )}
            <span
              className="flex-1 text-left truncate"
              title={
                categoryName.length > LONG_LABEL_TOOLTIP_THRESHOLD
                  ? categoryName
                  : undefined
              }
            >
              {categoryName}
            </span>
          </button>
        </CollapsibleTrigger>

        {/* Category modules (Nivel 2) - Simplified: direct items or expandable modules */}
        <CollapsibleContent className="ml-2 space-y-1">
          {categoryModules.map((module) => {
            // ✅ FIXED: If module id ends with "-direct", render items directly (no module header)
            if (module.id.endsWith("-direct")) {
              const directItems = isConfigurationCategory
                ? [...module.items].sort((a, b) =>
                    labelCollator.compare(a.label, b.label)
                  )
                : module.items;

              return (
                <div key={module.id} className="space-y-0.5 m-1">
                  {directItems.map((item) => (
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
        </CollapsibleContent>
      </div>
    </Collapsible>
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
  const { toggleCategory, isExpanded, collapseAll } = useCategoryCollapse({
    maxExpanded: 2,
  });

  useEffect(() => {
    if (isCollapsed) {
      collapseAll();
    }
  }, [isCollapsed, collapseAll]);

  if (!navigationTree || navigationTree.categories.size === 0) {
    return (
      <div
        className={cn(
          "py-8 text-center text-sm text-muted-foreground",
          isCollapsed ? "px-2" : "px-4"
        )}
      >
        {isCollapsed ? (
          <div
            className="flex justify-center"
            title="No hay módulos disponibles"
          >
            <HugeiconsIcon
              icon={GridIcon}
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
            isExpanded={isExpanded(categoryName)}
            onToggle={toggleCategory}
          />
        )
      )}
    </nav>
  );
}
