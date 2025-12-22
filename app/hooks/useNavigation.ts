/**
 * Navigation hooks
 *
 * Provides hooks for hierarchical navigation with permission-based filtering.
 * Supports 3-level navigation: Category → Module → Items
 */

import { useMemo } from "react";
import { useLocation } from "react-router";
import { useModulesStore } from "../stores/modulesStore";
import { usePermissions } from "./usePermissions";
import type {
  NavigationTree,
  NavigationItem,
  CategoryNode,
  ModuleNode,
} from "../lib/modules/types";

/**
 * Hook to get complete navigation tree
 *
 * Returns the full navigation tree with all categories, modules, and items.
 * Items are filtered by user permissions.
 */
export function useNavigation(): NavigationTree | null {
  const { navigationTree } = useModulesStore();
  const { hasPermission, hasAnyPermission, permissions } = usePermissions();

  return useMemo(() => {
    if (!navigationTree) {
      return null;
    }

    // #region agent log
    fetch('http://127.0.0.1:7242/ingest/bd91a56b-aa7d-44fb-ac11-0977789d60c5',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({location:'useNavigation.ts:30',message:'useNavigation: starting filter',data:{categoriesCount:navigationTree.categories.size,userPermissions:permissions},timestamp:Date.now(),sessionId:'debug-session',runId:'run1',hypothesisId:'C'})}).catch(()=>{});
    // #endregion

    // Filter navigation tree by permissions
    const filteredCategories = new Map<string, CategoryNode>();

    for (const [categoryName, categoryNode] of navigationTree.categories) {
      // #region agent log
      fetch('http://127.0.0.1:7242/ingest/bd91a56b-aa7d-44fb-ac11-0977789d60c5',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({location:'useNavigation.ts:38',message:'useNavigation: processing category',data:{categoryName,modulesCount:categoryNode.modules.size},timestamp:Date.now(),sessionId:'debug-session',runId:'run1',hypothesisId:'C'})}).catch(()=>{});
      // #endregion

      // Check if category has requiresAnyPermission
      const requiresAnyPerm = (categoryNode as any).requiresAnyPermission;
      if (requiresAnyPerm && requiresAnyPerm.length > 0) {
        // Check if user has at least one of the required permissions
        const hasAny = hasAnyPermission(requiresAnyPerm);
        // #region agent log
        fetch('http://127.0.0.1:7242/ingest/bd91a56b-aa7d-44fb-ac11-0977789d60c5',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({location:'useNavigation.ts:45',message:'useNavigation: checking requiresAnyPermission',data:{categoryName,requiresAnyPerm,hasAny},timestamp:Date.now(),sessionId:'debug-session',runId:'run1',hypothesisId:'C'})}).catch(()=>{});
        // #endregion
        if (!hasAny) {
          continue; // Skip this category
        }
      }

      const filteredModules = new Map<string, ModuleNode>();

      for (const [moduleId, moduleNode] of categoryNode.modules) {
        // Check module-level permission
        if (moduleNode.permission && !hasPermission(moduleNode.permission)) {
          continue;
        }

        // Filter items by permissions
        const filteredItems = moduleNode.items.filter((item) => {
          if (!item.permission) {
            return true; // No permission required
          }
          const hasItemPerm = hasPermission(item.permission);
          // #region agent log
          fetch('http://127.0.0.1:7242/ingest/bd91a56b-aa7d-44fb-ac11-0977789d60c5',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({location:'useNavigation.ts:60',message:'useNavigation: filtering item',data:{itemId:item.id,itemLabel:item.label,itemPermission:item.permission,hasItemPerm},timestamp:Date.now(),sessionId:'debug-session',runId:'run1',hypothesisId:'C'})}).catch(()=>{});
          // #endregion
          return hasItemPerm;
        });

        // Only include module if it has visible items
        if (filteredItems.length > 0) {
          filteredModules.set(moduleId, {
            ...moduleNode,
            items: filteredItems,
          });
        }
      }

      // Only include category if it has visible modules
      if (filteredModules.size > 0) {
        filteredCategories.set(categoryName, {
          ...categoryNode,
          modules: filteredModules,
        });
      }
    }

    // Build filtered allItems list
    const allItems: NavigationItem[] = [];
    for (const categoryNode of filteredCategories.values()) {
      for (const moduleNode of categoryNode.modules.values()) {
        allItems.push(...moduleNode.items);
      }
    }

    // #region agent log
    fetch('http://127.0.0.1:7242/ingest/bd91a56b-aa7d-44fb-ac11-0977789d60c5',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({location:'useNavigation.ts:88',message:'useNavigation: filter complete',data:{filteredCategoriesCount:filteredCategories.size,allItemsCount:allItems.length,allItemLabels:allItems.map(i=>i.label)},timestamp:Date.now(),sessionId:'debug-session',runId:'run1',hypothesisId:'C'})}).catch(()=>{});
    // #endregion

    return {
      categories: filteredCategories,
      allItems,
    };
  }, [navigationTree, hasPermission, hasAnyPermission, permissions]);
}

/**
 * Hook to get navigation grouped by category
 *
 * Returns navigation items organized by category for easier rendering.
 */
export function useNavigationByCategory(): Map<string, CategoryNode> | null {
  const navigationTree = useNavigation();

  return useMemo(() => {
    if (!navigationTree) {
      return null;
    }

    return navigationTree.categories;
  }, [navigationTree]);
}

/**
 * Hook to get flat list of navigation items
 *
 * Returns a flat list of all navigation items (filtered by permissions).
 * Useful for simple navigation lists.
 */
export function useNavigationItems(): NavigationItem[] {
  const navigationTree = useNavigation();

  return useMemo(() => {
    if (!navigationTree) {
      return [];
    }

    return navigationTree.allItems;
  }, [navigationTree]);
}

/**
 * Hook to get active navigation item
 *
 * Determines which navigation item is currently active based on the current route.
 */
export function useActiveNavigationItem(): NavigationItem | null {
  const location = useLocation();
  const navigationItems = useNavigationItems();

  return useMemo(() => {
    // Find exact match first
    const exactMatch = navigationItems.find((item) => item.to === location.pathname);
    if (exactMatch) {
      return exactMatch;
    }

    // Find prefix match (for nested routes)
    const prefixMatch = navigationItems.find((item) => {
      if (item.to === "/") {
        return false; // Don't match root for nested routes
      }
      return location.pathname.startsWith(item.to);
    });

    return prefixMatch || null;
  }, [location.pathname, navigationItems]);
}

/**
 * Hook to check if a navigation item is active
 *
 * @param item - Navigation item to check
 */
export function useIsNavigationItemActive(item: NavigationItem): boolean {
  const location = useLocation();

  return useMemo(() => {
    if (location.pathname === item.to) {
      return true;
    }

    // Check if current path starts with item path (for nested routes)
    if (item.to !== "/" && location.pathname.startsWith(item.to)) {
      return true;
    }

    return false;
  }, [location.pathname, item.to]);
}

/**
 * Hook to get navigation items for a specific module
 *
 * @param moduleId - Module identifier
 */
export function useModuleNavigationItems(
  moduleId: string
): NavigationItem[] {
  const navigationTree = useNavigation();

  return useMemo(() => {
    if (!navigationTree) {
      return [];
    }

    // Find module in navigation tree
    for (const categoryNode of navigationTree.categories.values()) {
      const moduleNode = categoryNode.modules.get(moduleId);
      if (moduleNode) {
        return moduleNode.items;
      }
    }

    return [];
  }, [navigationTree, moduleId]);
}

/**
 * Hook to get navigation items for a specific category
 *
 * @param categoryName - Category name
 */
export function useCategoryNavigationItems(
  categoryName: string
): ModuleNode[] {
  const navigationTree = useNavigation();

  return useMemo(() => {
    if (!navigationTree) {
      return [];
    }

    const categoryNode = navigationTree.categories.get(categoryName);
    if (!categoryNode) {
      return [];
    }

    return Array.from(categoryNode.modules.values());
  }, [navigationTree, categoryName]);
}







