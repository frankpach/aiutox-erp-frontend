/**
 * Tests for Module Registry
 */

import { describe, it, expect, beforeEach, vi } from "vitest";
import { moduleRegistry } from "../registry";
import type { FrontendModule } from "../types";

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
  beforeEach(() => {
    // Clear registry before each test
    moduleRegistry.clear();
  });

  describe("discoverModules", () => {
    it("should discover modules from backend", async () => {
      const modules = await moduleRegistry.discoverModules();

      expect(modules).toHaveLength(2);
      expect(modules[0].id).toBe("users");
      expect(modules[1].id).toBe("products");
    });

    it("should build navigation hierarchy", async () => {
      await moduleRegistry.discoverModules();
      const tree = moduleRegistry.getNavigationTree();

      expect(tree).toBeDefined();
      expect(tree.categories.size).toBeGreaterThan(0);
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

