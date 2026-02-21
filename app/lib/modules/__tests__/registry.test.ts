/**
 * Tests for Module Registry
 */

import { describe, it, expect, beforeEach, vi } from "vitest";
import { moduleRegistry } from "../registry";
import type { FrontendModule } from "../types";
import { getModules, getModuleMetadata } from "../../api/modules.api";
import { getCachedModuleData } from "../../storage/moduleCache";

// Mock the API functions
vi.mock("../../api/modules.api", () => ({
  getModules: vi.fn(() =>
    Promise.resolve({
      data: [
        {
          id: "users",
          name: "Users",
          type: "core",
          enabled: true,
          dependencies: [],
        },
        {
          id: "products",
          name: "Products",
          type: "business",
          enabled: true,
          dependencies: [],
        },
      ],
    })
  ),
  getModuleMetadata: vi.fn((moduleId: string) =>
    Promise.resolve({
      data: {
        id: moduleId,
        name: moduleId.charAt(0).toUpperCase() + moduleId.slice(1),
        type: moduleId === "users" ? "core" : "business",
        enabled: true,
        dependencies: [],
      },
    })
  ),
}));

// Mock cache functions
vi.mock("../../storage/moduleCache", () => ({
  getCachedModuleData: vi.fn(() => Promise.resolve(null)),
  cacheModuleData: vi.fn(() => Promise.resolve()),
  cacheModuleList: vi.fn(() => Promise.resolve()),
  clearModuleCache: vi.fn(),
}));

describe("ModuleRegistry", () => {
  beforeEach(async () => {
    // Clear registry before each test
    await moduleRegistry.clear();
    vi.clearAllMocks();
  });

  describe("discoverModules", () => {
    it("should discover modules from backend", async () => {
      const modules = await moduleRegistry.discoverModules();

      expect(modules).toHaveLength(2);
      expect(modules.map((module) => module.id)).toEqual(["users", "products"]);
    });

    it("should build navigation hierarchy", async () => {
      await moduleRegistry.discoverModules();
      const tree = moduleRegistry.getNavigationTree();

      expect(tree).toBeDefined();
      expect(tree.categories.size).toBeGreaterThan(0);
    });

    it("should include dynamic module navigation and settings links", async () => {
      vi.mocked(getModules).mockResolvedValue({
        data: [
          {
            id: "products",
            name: "Products",
            type: "business",
            enabled: true,
            dependencies: [],
            navigation_items: [
              {
                id: "products.main",
                label: "Productos",
                path: "/products",
                permission: "products.view",
                icon: "grid",
                order: 0,
              },
            ],
            settings_links: [
              {
                id: "products.config",
                label: "Configuración de catálogo",
                path: "/config/modules?module=products",
                permission: "products.manage",
                icon: "unknown-token",
                category: "Configuración",
                order: 0,
              },
            ],
          },
        ],
        meta: {
          total: 1,
          page: 1,
          page_size: 1,
          total_pages: 1,
        },
        error: null,
      });

      vi.mocked(getModuleMetadata).mockResolvedValue({
        data: {
          id: "products",
          name: "Products",
          type: "business",
          enabled: true,
          dependencies: [],
          navigation_items: [
            {
              id: "products.main",
              label: "Productos",
              path: "/products",
              permission: "products.view",
              icon: "grid",
              order: 0,
            },
          ],
          settings_links: [
            {
              id: "products.config",
              label: "Configuración de catálogo",
              path: "/config/modules?module=products",
              permission: "products.manage",
              icon: "unknown-token",
              category: "Configuración",
              order: 0,
            },
          ],
        },
        error: null,
      });

      await moduleRegistry.discoverModules();
      const tree = moduleRegistry.getNavigationTree();

      const gestionCategory = tree.categories.get("Gestión");
      const configCategory = tree.categories.get("Configuración");

      const productsMain = gestionCategory?.modules.get("products")?.items[0];
      // settings_links are added with directItems=true, so module key is 'products-direct'
      const productsConfigModule = configCategory?.modules.get("products-direct");
      const productsConfig = productsConfigModule?.items.find((item) => item.id === "products.config");

      expect(productsMain?.id).toBe("products.main");
      expect(productsConfig?.id).toBe("products.config");
      expect(productsConfig?.iconToken).toBe("unknown-token");
      // 'unknown-token' is not in ICON_TOKEN_MAP so inferContextualIcon is used
      // 'configuración de catálogo' doesn't match any semantic → falls back to MODULE_ICON_MAP[products] = UploadIcon
      expect(productsConfig?.icon).toBeDefined();
    });

    it("should replace in-memory modules when cached payload changes", async () => {
      const alphaModule: FrontendModule = {
        id: "alpha",
        name: "Alpha",
        type: "business",
        enabled: true,
        routes: [{ path: "/alpha", permission: "alpha.view" }],
        permissions: [],
      };

      const betaModule: FrontendModule = {
        id: "beta",
        name: "Beta",
        type: "business",
        enabled: true,
        routes: [{ path: "/beta", permission: "beta.view" }],
        permissions: [],
      };

      vi.mocked(getCachedModuleData)
        .mockResolvedValueOnce([alphaModule])
        .mockResolvedValueOnce([betaModule]);

      // First discover: backend fails (getModules throws), falls back to cache with alpha
      vi.mocked(getModules).mockRejectedValueOnce(new Error("network error"));
      await moduleRegistry.discoverModules();
      expect(moduleRegistry.getModule("alpha")?.id).toBe("alpha");

      // Second discover: backend fails again, falls back to cache with beta
      vi.mocked(getModules).mockRejectedValueOnce(new Error("network error"));
      await moduleRegistry.discoverModules();
      expect(moduleRegistry.getModule("alpha")).toBeUndefined();
      expect(moduleRegistry.getModule("beta")?.id).toBe("beta");
    });
  });

  describe("registerModule", () => {
    it("should register a module locally", () => {
      const module: FrontendModule = {
        id: "test-module",
        name: "Test Module",
        type: "business",
        enabled: true,
        routes: [{ path: "/test", permission: "test.view" }],
        permissions: [],
        navigation: {
          category: "Test",
          module: "test-module",
          items: [
            {
              id: "test-item",
              label: "Test Item",
              to: "/test",
              permission: "test.view",
            },
          ],
        },
      };

      moduleRegistry.registerModule(module);
      const retrieved = moduleRegistry.getModule("test-module");

      expect(retrieved).toEqual(module);
    });
  });

  describe("getNavigationTree", () => {
    it("should build hierarchical navigation tree", async () => {
      await moduleRegistry.discoverModules();
      const tree = moduleRegistry.getNavigationTree();

      expect(tree.categories).toBeInstanceOf(Map);
      expect(tree.allItems.length).toBeGreaterThan(0);
    });

    it("should filter items by permissions", async () => {
      await moduleRegistry.discoverModules();

      const hasPermission = (permission: string) => {
        return permission === "users.view";
      };

      const items = moduleRegistry.getNavigationItems(hasPermission);

      expect(items.length).toBeGreaterThan(0);
      // All items should have users.view permission or no permission
      items.forEach((item) => {
        if (item.permission) {
          expect(item.permission).toBe("users.view");
        }
      });
    });
  });
});

