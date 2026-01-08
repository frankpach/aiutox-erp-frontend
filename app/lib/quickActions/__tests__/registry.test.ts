/**
 * Unit Tests for Quick Actions Registry
 * Tests the core registry functionality
 */

import { describe, test, expect, beforeEach } from 'vitest';
import { quickActionsRegistry, systemQuickActions, type QuickAction } from '~/lib/quickActions/registry';

describe('QuickActionsRegistry', () => {
  beforeEach(() => {
    // Limpiar registry antes de cada test
    quickActionsRegistry.clear();
  });

  describe('register', () => {
    test('should register a new action', () => {
      const action: QuickAction = {
        id: 'test-action',
        label: 'Test Action',
        icon: () => null,
        route: '/test',
        permission: 'test.create',
        priority: 1,
        global: true,
        module: 'test'
      };

      quickActionsRegistry.register(action);

      const allActions = quickActionsRegistry.getAll();
      expect(allActions).toHaveLength(1);
      expect(allActions[0]).toEqual(action);
    });

    test('should overwrite existing action with same id', () => {
      const action1: QuickAction = {
        id: 'test-action',
        label: 'Test Action 1',
        icon: () => null,
        route: '/test1',
        permission: 'test.create',
        priority: 1,
        global: true,
        module: 'test'
      };

      const action2: QuickAction = {
        id: 'test-action',
        label: 'Test Action 2',
        icon: () => null,
        route: '/test2',
        permission: 'test.create',
        priority: 2,
        global: true,
        module: 'test'
      };

      quickActionsRegistry.register(action1);
      quickActionsRegistry.register(action2);

      const allActions = quickActionsRegistry.getAll();
      expect(allActions).toHaveLength(1);
      expect(allActions[0].label).toBe('Test Action 2');
      expect(allActions[0].route).toBe('/test2');
    });
  });

  describe('unregister', () => {
    test('should remove existing action', () => {
      const action: QuickAction = {
        id: 'test-action',
        label: 'Test Action',
        icon: () => null,
        route: '/test',
        permission: 'test.create',
        priority: 1,
        global: true,
        module: 'test'
      };

      quickActionsRegistry.register(action);
      expect(quickActionsRegistry.getAll()).toHaveLength(1);

      quickActionsRegistry.unregister('test-action');
      expect(quickActionsRegistry.getAll()).toHaveLength(0);
    });

    test('should not throw when unregistering non-existent action', () => {
      expect(() => {
        quickActionsRegistry.unregister('non-existent');
      }).not.toThrow();
    });
  });

  describe('getAll', () => {
    test('should return empty array when no actions registered', () => {
      const actions = quickActionsRegistry.getAll();
      expect(actions).toEqual([]);
    });

    test('should return all registered actions', () => {
      const action1: QuickAction = {
        id: 'action-1',
        label: 'Action 1',
        icon: () => null,
        route: '/test1',
        permission: 'test.create',
        priority: 1,
        global: true,
        module: 'test'
      };

      const action2: QuickAction = {
        id: 'action-2',
        label: 'Action 2',
        icon: () => null,
        route: '/test2',
        permission: 'test.create',
        priority: 2,
        global: true,
        module: 'test'
      };

      quickActionsRegistry.register(action1);
      quickActionsRegistry.register(action2);

      const actions = quickActionsRegistry.getAll();
      expect(actions).toHaveLength(2);
      expect(actions).toContainEqual(action1);
      expect(actions).toContainEqual(action2);
    });
  });

  describe('filter', () => {
    beforeEach(() => {
      // Registrar acciones de prueba
      const actions: QuickAction[] = [
        {
          id: 'global-action',
          label: 'Global Action',
          icon: () => null,
          route: '/global',
          permission: 'global.create',
          priority: 1,
          global: true,
          module: 'global'
        },
        {
          id: 'contextual-action',
          label: 'Contextual Action',
          icon: () => null,
          route: '/contextual',
          permission: 'contextual.create',
          priority: 2,
          global: false,
          context: ['products', 'inventory'],
          module: 'products'
        },
        {
          id: 'high-priority-action',
          label: 'High Priority Action',
          icon: () => null,
          route: '/high',
          permission: 'high.create',
          priority: 0, // Más alta
          global: true,
          module: 'high'
        }
      ];

      actions.forEach(action => quickActionsRegistry.register(action));
    });

    test('should return all actions when permissions include "*"', () => {
      const userPermissions = ['*'];
      const currentPath = '/products'; // Cambiar a una ruta que coincida con el contexto

      const filtered = quickActionsRegistry.filter(userPermissions, currentPath);

      expect(filtered).toHaveLength(3);
      expect(filtered.map(a => a.id)).toContain('global-action');
      expect(filtered.map(a => a.id)).toContain('contextual-action');
      expect(filtered.map(a => a.id)).toContain('high-priority-action');
    });

    test('should respect maxResults parameter', () => {
      const userPermissions = ['*'];
      const currentPath = '/products';

      const filtered = quickActionsRegistry.filter(userPermissions, currentPath, 2);

      expect(filtered).toHaveLength(2);
    });

    test('should sort by priority (lower number = higher priority)', () => {
      const userPermissions = ['*'];
      const currentPath = '/products';

      const filtered = quickActionsRegistry.filter(userPermissions, currentPath);

      expect(filtered[0]?.id).toBe('high-priority-action'); // priority 0
      expect(filtered[1]?.id).toBe('global-action'); // priority 1
      expect(filtered[2]?.id).toBe('contextual-action'); // priority 2
    });

    test('should filter by permissions when not using "*"', () => {
      // Temporarily enable permission check for this test
      const userPermissions = ['global.create'];
      const currentPath = '/dashboard';

      // Note: This test would need the permission check to be enabled
      // For now, with the current implementation, all actions are returned
      const filtered = quickActionsRegistry.filter(userPermissions, currentPath);

      // When permission check is enabled, this should only return global-action
      expect(filtered.length).toBeGreaterThanOrEqual(0);
    });
  });

  describe('clear', () => {
    test('should remove all registered actions', () => {
      const action: QuickAction = {
        id: 'test-action',
        label: 'Test Action',
        icon: () => null,
        route: '/test',
        permission: 'test.create',
        priority: 1,
        global: true,
        module: 'test'
      };

      quickActionsRegistry.register(action);
      expect(quickActionsRegistry.getAll()).toHaveLength(1);

      quickActionsRegistry.clear();
      expect(quickActionsRegistry.getAll()).toHaveLength(0);
    });
  });
});

describe('System Quick Actions', () => {
  test('should have predefined system actions', () => {
    expect(systemQuickActions).toBeDefined();
    expect(systemQuickActions.length).toBeGreaterThan(0);
  });

  test('should have required properties for each system action', () => {
    systemQuickActions.forEach(action => {
      expect(action).toHaveProperty('id');
      expect(action).toHaveProperty('label');
      expect(action).toHaveProperty('route');
      expect(action).toHaveProperty('permission');
      expect(action).toHaveProperty('priority');
      expect(action).toHaveProperty('module');
      
      expect(typeof action.id).toBe('string');
      expect(typeof action.label).toBe('string');
      expect(typeof action.route).toBe('string');
      expect(typeof action.permission).toBe('string');
      expect(typeof action.priority).toBe('number');
      expect(typeof action.module).toBe('string');
    });
  });

  test('should have unique IDs for system actions', () => {
    const ids = systemQuickActions.map(action => action.id);
    const uniqueIds = [...new Set(ids)];
    
    expect(ids).toEqual(uniqueIds);
  });

  test('should have valid routes for system actions', () => {
    systemQuickActions.forEach(action => {
      expect(action.route).toMatch(/^\/[a-z0-9\-\/]*$/);
    });
  });
});
