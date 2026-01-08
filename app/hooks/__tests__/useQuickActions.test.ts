/**
 * Unit Tests for useQuickActions Hook
 * Tests the React hook functionality
 */

import { describe, test, expect, vi, beforeEach } from 'vitest';
import { renderHook } from '@testing-library/react';
import { useQuickActions, useQuickActionAvailability } from '~/hooks/useQuickActions';
import { quickActionsRegistry } from '~/lib/quickActions/registry';
import { useQuickActionsStore } from '~/stores/quickActionsStore';
import { useAuthStore } from '~/stores/authStore';
import { useLocation } from 'react-router';

// Mock de dependencias
vi.mock('~/stores/authStore');
vi.mock('~/lib/quickActions/registry');
vi.mock('~/stores/quickActionsStore');
vi.mock('react-router');

// Mock implementations
const mockUseAuthStore = vi.mocked(useAuthStore);
const mockQuickActionsRegistry = vi.mocked(quickActionsRegistry);
const mockUseQuickActionsStore = vi.mocked(useQuickActionsStore);
const mockUseLocation = vi.mocked(useLocation);

describe('useQuickActions', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    
    // Mock default implementations
    mockUseQuickActionsStore.mockReturnValue({
      lastUpdate: Date.now(),
      getAllActions: vi.fn().mockReturnValue([]),
      getActionsCount: vi.fn().mockReturnValue(0),
      getAction: vi.fn().mockReturnValue(undefined),
      registerAction: vi.fn(),
      unregisterAction: vi.fn(),
      clearActions: vi.fn(),
      initializeActions: vi.fn(),
      incrementVersion: vi.fn(),
      isInitialized: false
    } as any);

    mockUseLocation.mockReturnValue({
      pathname: '/dashboard'
    } as any);

    // Mock registry methods
    mockQuickActionsRegistry.getAll = vi.fn();
    mockQuickActionsRegistry.filter = vi.fn();
  });

  describe('basic functionality', () => {
    test('should return empty array when no actions available', () => {
      const mockUser = {
        id: 'user-1',
        email: 'test@example.com',
        full_name: 'Test User',
        is_active: true,
        permissions: ['*'],
        roles: ['admin']
      };

      // Mock the selector function to return the mock user
      mockUseAuthStore.mockImplementation((selector) => {
        return selector({ user: mockUser } as any);
      });

      mockQuickActionsRegistry.getAll.mockReturnValue([]);
      mockQuickActionsRegistry.filter.mockReturnValue([]);

      const { result } = renderHook(() => useQuickActions());

      expect(result.current).toEqual([]);
    });

    test('should call registry filter with correct parameters', () => {
      const mockUser = {
        id: 'user-1',
        email: 'test@example.com',
        full_name: 'Test User',
        is_active: true,
        permissions: ['tasks.create', 'products.create'],
        roles: ['user']
      };

      // Mock the selector function
      mockUseAuthStore.mockImplementation((selector) => {
        return selector({ user: mockUser } as any);
      });

      mockUseLocation.mockReturnValue({
        pathname: '/products'
      } as any);

      const mockFilteredActions = [
        {
          id: 'new-product',
          label: 'New Product',
          icon: null,
          route: '/products-create',
          permission: 'products.create',
          priority: 1,
          global: true,
          module: 'products'
        }
      ];

      mockQuickActionsRegistry.filter.mockReturnValue(mockFilteredActions);

      const { result } = renderHook(() => useQuickActions(5));

      expect(mockQuickActionsRegistry.filter).toHaveBeenCalledWith(
        ['tasks.create', 'products.create'],
        '/products',
        5
      );

      expect(result.current).toEqual(mockFilteredActions);
    });

    test('should use default maxResults when not specified', () => {
      const mockUser = {
        id: 'user-1',
        email: 'test@example.com',
        full_name: 'Test User',
        is_active: true,
        permissions: ['*'],
        roles: ['admin']
      };

      // Mock the selector function
      mockUseAuthStore.mockImplementation((selector) => {
        return selector({ user: mockUser } as any);
      });

      mockUseLocation.mockReturnValue({
        pathname: '/dashboard'
      } as any);

      mockQuickActionsRegistry.filter.mockReturnValue([]);

      renderHook(() => useQuickActions());

      expect(mockQuickActionsRegistry.filter).toHaveBeenCalledWith(
        ['*'],
        '/dashboard',
        5 // Default value
      );
    });
  });

  describe('user permissions', () => {
    test('should handle user with no permissions', () => {
      const mockUser = {
        id: 'user-1',
        email: 'test@example.com',
        full_name: 'Test User',
        is_active: true,
        permissions: [],
        roles: ['user']
      };

      // Mock the selector function
      mockUseAuthStore.mockImplementation((selector) => {
        return selector({ user: mockUser } as any);
      });

      mockUseLocation.mockReturnValue({
        pathname: '/dashboard'
      } as any);

      mockQuickActionsRegistry.filter.mockReturnValue([]);

      const { result } = renderHook(() => useQuickActions());

      expect(mockQuickActionsRegistry.filter).toHaveBeenCalledWith(
        [],
        '/dashboard',
        5
      );

      expect(result.current).toEqual([]);
    });

    test('should handle user with wildcard permission', () => {
      const mockUser = {
        id: 'user-1',
        email: 'owner@example.com',
        full_name: 'Owner User',
        is_active: true,
        permissions: ['*'],
        roles: ['owner']
      };

      // Mock the selector function
      mockUseAuthStore.mockImplementation((selector) => {
        return selector({ user: mockUser } as any);
      });

      mockUseLocation.mockReturnValue({
        pathname: '/dashboard'
      } as any);

      const mockFilteredActions = [
        { id: 'action-1', label: 'Action 1', route: '/action-1', permission: 'any', priority: 1, global: true, module: 'test', icon: null },
        { id: 'action-2', label: 'Action 2', route: '/action-2', permission: 'any', priority: 2, global: true, module: 'test', icon: null }
      ];

      mockQuickActionsRegistry.filter.mockReturnValue(mockFilteredActions);

      const { result } = renderHook(() => useQuickActions());

      expect(mockQuickActionsRegistry.filter).toHaveBeenCalledWith(
        ['*'],
        '/dashboard',
        5
      );

      expect(result.current).toHaveLength(2);
    });
  });

  describe('reactivity', () => {
    test('should update when store version changes', () => {
      const mockUser = {
        id: 'user-1',
        email: 'test@example.com',
        full_name: 'Test User',
        is_active: true,
        permissions: ['*'],
        roles: ['admin']
      };

      // Mock the selector function
      mockUseAuthStore.mockImplementation((selector) => {
        return selector({ user: mockUser } as any);
      });

      mockUseLocation.mockReturnValue({
        pathname: '/dashboard'
      } as any);

      let mockStoreVersion = 1;
      
      mockUseQuickActionsStore.mockReturnValue({
        lastUpdate: mockStoreVersion,
        getAllActions: vi.fn().mockReturnValue([]),
        getActionsCount: vi.fn().mockReturnValue(0),
        getAction: vi.fn().mockReturnValue(undefined),
        registerAction: vi.fn(),
        unregisterAction: vi.fn(),
        clearActions: vi.fn(),
        initializeActions: vi.fn(),
        incrementVersion: vi.fn(),
        isInitialized: false
      } as any);

      mockQuickActionsRegistry.filter.mockReturnValue([]);

      const { rerender } = renderHook(() => useQuickActions());

      expect(mockQuickActionsRegistry.filter).toHaveBeenCalledTimes(1);

      // Simular cambio en el store
      mockStoreVersion = 2;
      mockUseQuickActionsStore.mockReturnValue({
        lastUpdate: mockStoreVersion,
        getAllActions: vi.fn().mockReturnValue([]),
        getActionsCount: vi.fn().mockReturnValue(0),
        getAction: vi.fn().mockReturnValue(undefined),
        registerAction: vi.fn(),
        unregisterAction: vi.fn(),
        clearActions: vi.fn(),
        initializeActions: vi.fn(),
        incrementVersion: vi.fn(),
        isInitialized: false
      } as any);

      rerender();

      expect(mockQuickActionsRegistry.filter).toHaveBeenCalledTimes(2);
    });
  });
});

describe('useQuickActionAvailability', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    
    // Mock default implementations for availability tests
    mockUseAuthStore.mockImplementation((selector) => {
      return selector({ 
        user: {
          id: 'user-1',
          email: 'test@example.com',
          full_name: 'Test User',
          is_active: true,
          permissions: ['*'],
          roles: ['admin']
        }
      } as any);
    });

    mockUseLocation.mockReturnValue({
      pathname: '/dashboard'
    } as any);

    mockUseQuickActionsStore.mockReturnValue({
      lastUpdate: Date.now(),
      getAllActions: vi.fn().mockReturnValue([]),
      getActionsCount: vi.fn().mockReturnValue(0),
      getAction: vi.fn().mockReturnValue(undefined),
      registerAction: vi.fn(),
      unregisterAction: vi.fn(),
      clearActions: vi.fn(),
      initializeActions: vi.fn(),
      incrementVersion: vi.fn(),
      isInitialized: false
    } as any);

    mockQuickActionsRegistry.getAll = vi.fn();
    mockQuickActionsRegistry.filter = vi.fn();
  });

  test('should return false when action is not available', () => {
    // Mock empty actions
    mockQuickActionsRegistry.filter.mockReturnValue([]);

    const { result } = renderHook(() => useQuickActionAvailability('non-existent-action'));

    expect(result.current).toBe(false);
  });

  test('should return true when action is available', () => {
    // Mock actions with the target action
    const mockActions = [
      { id: 'test-action', label: 'Test', route: '/test', permission: 'test', priority: 1, global: true, module: 'test', icon: null }
    ];

    mockQuickActionsRegistry.filter.mockReturnValue(mockActions);

    const { result } = renderHook(() => useQuickActionAvailability('test-action'));

    expect(result.current).toBe(true);
  });

  test('should return false when action list is empty', () => {
    // Mock empty actions
    mockQuickActionsRegistry.filter.mockReturnValue([]);

    const { result } = renderHook(() => useQuickActionAvailability('any-action'));

    expect(result.current).toBe(false);
  });
});
