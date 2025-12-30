/**
 * Types for module system and hierarchical navigation
 *
 * These types support the autodiscovery system for modules with 3-level navigation:
 * Level 1: Category/Group
 * Level 2: Module
 * Level 3: Pages/Actions
 *
 * Aligned with backend module metadata structure in `rules/module-meta.md`
 */

/**
 * Module type: core (infrastructure) or business
 */
export type ModuleType = "core" | "business";

/**
 * Navigation item at level 3 (pages/actions)
 */
export interface NavigationItem {
  /** Unique identifier for the navigation item */
  id: string;
  /** Display label */
  label: string;
  /** Route path */
  to: string;
  /** Icon component from Hugeicons */
  icon?: unknown; // IconType from @hugeicons/core-free-icons
  /** Required permission to show this item (granular permission) */
  permission?: string;
  /** Optional badge/counter */
  badge?: number;
  /** Order within the module */
  order?: number;
  /** Whether this item is active */
  isActive?: boolean;
}

/**
 * Module route definition
 */
export interface ModuleRoute {
  /** Route path */
  path: string;
  /** Required permission to access this route */
  permission?: string;
  /** Route metadata */
  metadata?: Record<string, unknown>;
}

/**
 * Navigation hierarchy structure (3 levels)
 */
export interface NavigationHierarchy {
  /** Level 1: Category/Group name */
  category: string;
  /** Level 2: Module identifier */
  module: string;
  /** Level 3: Navigation items (pages/actions) */
  items: NavigationItem[];
  /** Order for sorting categories */
  categoryOrder?: number;
  /** Order for sorting modules within category */
  moduleOrder?: number;
}

/**
 * Frontend module metadata
 *
 * This represents a module that can be discovered and registered in the frontend.
 * It includes all information needed for navigation, permissions, and routing.
 */
export interface FrontendModule {
  /** Unique module identifier (snake_case) */
  id: string;
  /** Display name */
  name: string;
  /** Module type: core or business */
  type: ModuleType;
  /** Category for grouping in navigation */
  category?: string;
  /** Description of the module */
  description?: string;
  /** Version of the module */
  version?: string;
  /** Whether the module is enabled */
  enabled: boolean;
  /** Routes defined by this module */
  routes: ModuleRoute[];
  /** Permissions required/defined by this module */
  permissions: string[];
  /** Dependencies on other modules */
  dependsOn?: string[];
  /** Navigation hierarchy for this module */
  navigation?: NavigationHierarchy;
  /** Order for sorting modules */
  order?: number;
  /** Backend metadata */
  backend?: {
    service?: string;
    routesPrefix?: string;
  };
  /** Frontend metadata */
  frontend?: {
    featureFlags?: string[];
  };
}

/**
 * Navigation tree structure
 *
 * Organized by category → module → items
 */
export interface NavigationTree {
  /** Categories with their modules */
  categories: Map<string, CategoryNode>;
  /** Flat list of all navigation items (for quick lookup) */
  allItems: NavigationItem[];
}

/**
 * Category node in navigation tree
 */
export interface CategoryNode {
  /** Category name */
  name: string;
  /** Order for sorting */
  order: number;
  /** Modules in this category */
  modules: Map<string, ModuleNode>;
}

/**
 * Module node in navigation tree
 */
export interface ModuleNode {
  /** Module identifier */
  id: string;
  /** Module name */
  name: string;
  /** Order for sorting */
  order: number;
  /** Navigation items in this module */
  items: NavigationItem[];
  /** Main route for this module (if any) */
  mainRoute?: string;
  /** Required permission to access this module */
  permission?: string;
}

/**
 * Module permission with tenant information
 */
export interface ModulePermission {
  /** Permission string (e.g., "inventory.view") */
  permission: string;
  /** Module this permission belongs to */
  moduleId: string;
  /** Tenant ID (if tenant-specific) */
  tenantId?: string;
  /** Description of the permission */
  description?: string;
}

/**
 * Permission group organized by module
 */
export interface PermissionGroup {
  /** Module identifier */
  moduleId: string;
  /** Module name */
  moduleName: string;
  /** Permissions in this module */
  permissions: ModulePermission[];
  /** Category of the module */
  category?: string;
}

/**
 * Tenant-specific module permissions
 */
export interface TenantModulePermissions {
  /** Tenant ID */
  tenantId: string;
  /** Permissions grouped by module */
  permissionsByModule: Map<string, ModulePermission[]>;
}

/**
 * Extended module permission with tenant and module information
 */
export interface ExtendedModulePermission extends ModulePermission {
  /** Tenant ID */
  tenantId: string;
  /** Module ID */
  moduleId: string;
  /** Whether permission is from role or delegated */
  source?: "role" | "delegated";
  /** Expiration date (for delegated permissions) */
  expiresAt?: string | null;
}

/**
 * Response from backend module list endpoint
 * GET /api/v1/config/modules
 */
export interface ModuleListItem {
  id: string;
  name: string;
  type: ModuleType;
  enabled: boolean;
  dependencies?: string[];
  description?: string;
}

/**
 * Response from backend module info endpoint
 * GET /api/v1/config/modules/{module_id}
 */
export interface ModuleInfoResponse {
  id: string;
  name: string;
  type: ModuleType;
  enabled: boolean;
  dependencies?: string[];
  description?: string;
  has_router?: boolean;
  model_count?: number;
}


















