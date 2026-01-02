/**
 * Module Registry
 *
 * Handles automatic discovery of modules from backend,
 * local registration, and building hierarchical navigation tree.
 *
 * Features:
 * - Automatic discovery from backend API
 * - Encrypted local cache with TTL
 * - Hierarchical navigation tree (3 levels)
 * - Permission-based filtering
 * - Tenant-based filtering
 */

import type {
  FrontendModule,
  NavigationTree,
  NavigationHierarchy,
  NavigationItem,
  CategoryNode,
  ModuleNode,
  ModuleListItem,
  ModuleInfoResponse,
} from "./types";
import { getModules, getModuleMetadata } from "../api/modules.api";
import {
  cacheModuleData,
  getCachedModuleData,
  cacheModuleList,
  getCachedModuleList,
  clearModuleCache,
} from "../storage/moduleCache";
import { useAuthStore } from "../../stores/authStore";
import { navigationItems } from "../../config/navigation";

/**
 * Module Registry class
 *
 * Singleton pattern for managing modules
 */
class ModuleRegistry {
  private modules: Map<string, FrontendModule> = new Map();
  private navigationTree: NavigationTree | null = null;
  private isInitialized = false;

  /**
   * Get current user ID from auth store
   */
  private getUserId(): string {
    const user = useAuthStore.getState().user;
    return user?.id || "anonymous";
  }

  /**
   * Discover modules from backend and cache locally
   *
   * This method:
   * 1. Checks local cache first
   * 2. Fetches from backend if cache is missing/expired
   * 3. Caches the result with encryption
   * 4. Registers modules locally
   */
  async discoverModules(): Promise<FrontendModule[]> {
    const userId = this.getUserId();

    // Try to get from cache first
    const cachedModules = await getCachedModuleData(userId);
    if (cachedModules && cachedModules.length > 0) {
      // Register cached modules
      for (const module of cachedModules) {
        this.modules.set(module.id, module);
      }
      this.isInitialized = true;
      return cachedModules;
    }

    // Fetch from backend
    try {
      const response = await getModules();
      const moduleList = response.data;

      // Fetch detailed metadata for each module
      const modules: FrontendModule[] = [];

      for (const moduleItem of moduleList) {
        try {
          // Use moduleItem directly (it has all needed info)
          // Optionally fetch detailed metadata if needed
          let moduleInfo = moduleItem;
          try {
            const moduleInfoResponse = await getModuleMetadata(moduleItem.id);
            moduleInfo = {
              ...moduleItem,
              ...moduleInfoResponse.data,
            };
          } catch {
            // If detailed fetch fails, use basic info from list
            moduleInfo = moduleItem;
          }

          // Convert backend module info to FrontendModule
          const frontendModule: FrontendModule = {
            id: moduleInfo.id,
            name: moduleInfo.name,
            type: moduleInfo.type as "core" | "business",
            enabled: moduleInfo.enabled,
            description: moduleInfo.description,
            dependsOn: moduleInfo.dependencies,
            routes: this.extractRoutesFromModule(moduleInfo),
            permissions: [], // Will be populated from backend permissions endpoint
            navigation: this.buildNavigationHierarchy(moduleInfo),
            order: this.getDefaultOrder(moduleInfo.type as "core" | "business"),
          };

          modules.push(frontendModule);
          this.modules.set(frontendModule.id, frontendModule);
        } catch (error) {
          console.warn(`Failed to fetch metadata for module ${moduleItem.id}:`, error);
        }
      }

      // Cache the modules
      await cacheModuleData(userId, modules);
      await cacheModuleList(userId, moduleList);

      this.isInitialized = true;
      return modules;
    } catch (error) {
      console.error("Failed to discover modules:", error);
      throw error;
    }
  }

  /**
   * Extract routes from module metadata
   */
  private extractRoutesFromModule(
    moduleInfo: ModuleListItem | ModuleInfoResponse
  ): FrontendModule["routes"] {
    // Default routes based on module ID
    const routes: FrontendModule["routes"] = [
      {
        path: `/${moduleInfo.id}`,
        permission: `${moduleInfo.id}.view`,
      },
    ];

    // Add more routes based on module type
    if (moduleInfo.type === "business") {
      routes.push(
        {
          path: `/${moduleInfo.id}/create`,
          permission: `${moduleInfo.id}.create`,
        },
        {
          path: `/${moduleInfo.id}/:id`,
          permission: `${moduleInfo.id}.view`,
        },
        {
          path: `/${moduleInfo.id}/:id/edit`,
          permission: `${moduleInfo.id}.edit`,
        }
      );
    }

    return routes;
  }

  /**
   * Build navigation hierarchy from module metadata
   */
  private buildNavigationHierarchy(
    moduleInfo: ModuleListItem | ModuleInfoResponse
  ): NavigationHierarchy | undefined {
    // Determine category based on module type
    const category = this.getCategoryForModule(moduleInfo);

    // Build navigation items from routes
    const items: NavigationItem[] = [
      {
        id: `${moduleInfo.id}-list`,
        label: this.getModuleLabel(moduleInfo.name),
        to: `/${moduleInfo.id}`,
        permission: `${moduleInfo.id}.view`,
        order: 1,
      },
    ];

    // Add create item for business modules
    if (moduleInfo.type === "business") {
      items.push({
        id: `${moduleInfo.id}-create`,
        label: `Crear ${this.getModuleLabel(moduleInfo.name)}`,
        to: `/${moduleInfo.id}/create`,
        permission: `${moduleInfo.id}.create`,
        order: 2,
      });
    }

    return {
      category,
      module: moduleInfo.id,
      items,
      categoryOrder: this.getCategoryOrder(category),
      moduleOrder: this.getDefaultOrder(moduleInfo.type),
    };
  }

  /**
   * Get category for module based on type and ID
   */
  private getCategoryForModule(
    moduleInfo: ModuleListItem | ModuleInfoResponse
  ): string {
    // Core modules go to "Administración"
    if (moduleInfo.type === "core") {
      if (["auth", "users"].includes(moduleInfo.id)) {
        return "Administración";
      }
      return "Infraestructura";
    }

    // Business modules categorized by domain
    const categoryMap: Record<string, string> = {
      products: "Catálogo",
      inventory: "Operaciones",
      customers: "Ventas",
      sales: "Ventas",
      purchases: "Compras",
    };

    return categoryMap[moduleInfo.id] || "Negocio";
  }

  /**
   * Get category order for sorting
   */
  private getCategoryOrder(category: string): number {
    const orderMap: Record<string, number> = {
      Administración: 1,
      Infraestructura: 2,
      Catálogo: 3,
      Operaciones: 4,
      Ventas: 5,
      Compras: 6,
      Negocio: 99,
    };

    return orderMap[category] || 99;
  }

  /**
   * Get default order for module
   */
  private getDefaultOrder(type: "core" | "business"): number {
    return type === "core" ? 1 : 10;
  }

  /**
   * Get module label (singular form for display)
   */
  private getModuleLabel(name: string): string {
    // Simple plural to singular conversion
    if (name.endsWith("s")) {
      return name.slice(0, -1);
    }
    return name;
  }

  /**
   * Register a module locally
   *
   * This allows modules to register themselves programmatically
   * without requiring backend discovery
   */
  registerModule(module: FrontendModule): void {
    this.modules.set(module.id, module);
    // Invalidate navigation tree to force rebuild
    this.navigationTree = null;
  }

  /**
   * Get a registered module by ID
   */
  getModule(moduleId: string): FrontendModule | undefined {
    return this.modules.get(moduleId);
  }

  /**
   * Get all registered modules
   */
  getAllModules(): FrontendModule[] {
    return Array.from(this.modules.values());
  }

  /**
   * Build hierarchical navigation tree
   *
   * Organizes modules into 3-level hierarchy:
   * Category → Module → Items
   * Also integrates static navigation items from navigation.ts
   */
  getNavigationTree(): NavigationTree {
    // Return cached tree if available
    if (this.navigationTree) {
      return this.navigationTree;
    }

    const categories = new Map<string, CategoryNode>();
    const allItems: NavigationItem[] = [];

    // 1. Add static navigation items from navigation.ts
    for (const navItem of navigationItems) {
      // Handle top-level items without children (e.g., "Dashboard")
      if (!navItem.children || navItem.children.length === 0) {
        // Skip creating category for standalone items - they'll be added directly to a "Root" category
        // For now, we'll add them to a special category that renders as direct links
        const categoryName = "_root"; // Special category for top-level items
        let categoryNode = categories.get(categoryName);
        if (!categoryNode) {
          categoryNode = {
            name: categoryName,
            order: -1, // Before all other categories
            modules: new Map(),
          };
          categories.set(categoryName, categoryNode);
        }

        // Create a module node for this item (but it will render as a direct link, not expandable)
        // Debug: Log files item to verify it's correct
        if (navItem.id === "files") {
          console.log("[ModuleRegistry] Processing files navItem:", { id: navItem.id, to: navItem.to, label: navItem.label });
        }

        const moduleNode: ModuleNode = {
          id: navItem.id,
          name: navItem.label,
          order: 0,
          items: [
            {
              id: navItem.id,
              label: navItem.label,
              to: navItem.to || "#", // Fallback to "#" if to is undefined
              icon: navItem.icon,
              permission: navItem.permission,
              order: 0,
            },
          ],
          mainRoute: navItem.to,
          permission: navItem.permission,
        };

        categoryNode.modules.set(navItem.id, moduleNode);
        allItems.push(...moduleNode.items);
      } else {
        // Handle items with children (e.g., "Configuración")
        // ✅ FIXED: Children are direct items in the category, NO intermediate module
        const categoryName = navItem.label;
        let categoryNode = categories.get(categoryName);
        if (!categoryNode) {
          categoryNode = {
            name: categoryName,
            order: 1000, // Last category
            modules: new Map(),
          };
          categories.set(categoryName, categoryNode);
        }

        // ✅ Create a special "direct" module that will be rendered as direct items
        // The id ending in "-direct" signals NavigationTree to render items directly
        const directModuleId = `${categoryName.toLowerCase()}-direct`;
        const directModule: ModuleNode = {
          id: directModuleId,
          name: "", // ✅ Empty name - won't be displayed
          order: 0,
          items: navItem.children.map((child) => ({
            id: child.id,
            label: child.label,
            to: child.to!,
            icon: child.icon,
            permission: child.permission,
            order: 0,
          })),
          mainRoute: navItem.children[0]?.to,
          permission: undefined, // Category-level permission check
        };

        categoryNode.modules.set(directModuleId, directModule);
        allItems.push(...directModule.items);

        // Store requiresAnyPermission for the category if present
        if (navItem.requiresAnyPermission) {
          (categoryNode as any).requiresAnyPermission = navItem.requiresAnyPermission;
        }
      }
    }

    // 2. Group modules from backend by category
    for (const module of this.modules.values()) {
      if (!module.enabled || !module.navigation) {
        continue;
      }

      const { category, module: moduleId, items, categoryOrder, moduleOrder } =
        module.navigation;

      // Get or create category node
      let categoryNode = categories.get(category);
      if (!categoryNode) {
        categoryNode = {
          name: category,
          order: categoryOrder || 99,
          modules: new Map(),
        };
        categories.set(category, categoryNode);
      }

      // Create module node
      const moduleNode: ModuleNode = {
        id: moduleId,
        name: module.name,
        order: moduleOrder || module.order || 99,
        items: items,
        mainRoute: module.routes[0]?.path,
        permission: module.routes[0]?.permission,
      };

      categoryNode.modules.set(moduleId, moduleNode);

      // Add items to flat list
      allItems.push(...items);
    }

    // Sort categories
    const sortedCategories = new Map(
      Array.from(categories.entries()).sort(
        (a, b) => a[1].order - b[1].order
      )
    );

    // Sort modules within each category
    for (const categoryNode of sortedCategories.values()) {
      const sortedModules = new Map(
        Array.from(categoryNode.modules.entries()).sort(
          (a, b) => a[1].order - b[1].order
        )
      );
      categoryNode.modules = sortedModules;
    }

    this.navigationTree = {
      categories: sortedCategories,
      allItems,
    };

    return this.navigationTree;
  }

  /**
   * Get navigation items filtered by permissions
   *
   * @param hasPermission - Function to check if user has permission
   * @param tenantId - Optional tenant ID for filtering
   */
  getNavigationItems(
    hasPermission: (permission: string) => boolean,
    tenantId?: string
  ): NavigationItem[] {
    const tree = this.getNavigationTree();
    const filteredItems: NavigationItem[] = [];

    for (const categoryNode of tree.categories.values()) {
      for (const moduleNode of categoryNode.modules.values()) {
        // Check module-level permission
        if (moduleNode.permission && !hasPermission(moduleNode.permission)) {
          continue;
        }

        // Filter items by permissions
        for (const item of moduleNode.items) {
          if (!item.permission || hasPermission(item.permission)) {
            filteredItems.push(item);
          }
        }
      }
    }

    return filteredItems;
  }

  /**
   * Clear all registered modules and cache
   */
  async clear(): Promise<void> {
    const userId = this.getUserId();
    this.modules.clear();
    this.navigationTree = null;
    this.isInitialized = false;
    // clearModuleCache is synchronous, no await needed
    clearModuleCache(userId);
  }

  /**
   * Check if registry is initialized
   */
  isReady(): boolean {
    return this.isInitialized;
  }
}

// Export singleton instance
export const moduleRegistry = new ModuleRegistry();







