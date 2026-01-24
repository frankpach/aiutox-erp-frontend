/**
 * Unit tests for authStore PWA integration
 * Tests that auth clearing also clears Service Worker cache
 */
import { describe, it, expect, beforeEach, vi } from 'vitest';
import { useAuthStore } from '../authStore';
import type { User } from '../../features/users/types/user.types';

// Mock Service Worker API
const mockPostMessage = vi.fn();
const mockController = {
  postMessage: mockPostMessage,
};

describe('authStore - PWA Integration', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    useAuthStore.getState().clearAuth();

    // Mock navigator.serviceWorker
    Object.defineProperty(navigator, 'serviceWorker', {
      writable: true,
      configurable: true,
      value: {
        controller: mockController,
      },
    });
  });

  it('should send message to Service Worker on clearAuth', () => {
    // Setup auth first
    const testUser: User = {
      id: '1',
      email: 'test@example.com',
      tenant_id: 'tenant-1',
      full_name: 'Test User',
      first_name: 'Test',
      last_name: 'User',
      middle_name: null,
      date_of_birth: null,
      gender: null,
      nationality: null,
      marital_status: null,
      job_title: null,
      department: null,
      employee_id: null,
      preferred_language: 'es',
      timezone: null,
      avatar_url: null,
      bio: null,
      notes: null,
      last_login_at: null,
      email_verified_at: null,
      phone_verified_at: null,
      two_factor_enabled: false,
      is_active: true,
      created_at: '2024-01-01T00:00:00Z',
      updated_at: '2024-01-01T00:00:00Z',
    };
    
    useAuthStore.getState().setAuth(testUser, 'token', 'refresh');

    // Clear auth
    useAuthStore.getState().clearAuth();

    // Should have posted message to SW
    expect(mockPostMessage).toHaveBeenCalledWith(
      { type: 'CLEAR_AUTH_CACHE' },
      expect.any(Array) // MessageChannel port
    );
  });

  it('should handle missing Service Worker gracefully', () => {
    // Simulate serviceWorker being null/undefined
    const originalSW = (navigator as { serviceWorker?: ServiceWorkerContainer }).serviceWorker;
    delete (navigator as { serviceWorker?: ServiceWorkerContainer }).serviceWorker;

    // Redefine as undefined
    Object.defineProperty(navigator, 'serviceWorker', {
      value: undefined,
      writable: true,
      configurable: true,
      enumerable: false,
    });

    // Should not throw
    expect(() => {
      useAuthStore.getState().clearAuth();
    }).not.toThrow();

    // Restore for other tests
    delete (navigator as { serviceWorker?: ServiceWorkerContainer }).serviceWorker;
    Object.defineProperty(navigator, 'serviceWorker', {
      writable: true,
      configurable: true,
      enumerable: false,
      value: originalSW || {
        controller: mockController,
      },
    });
  });

  it('should handle missing controller gracefully', () => {
    Object.defineProperty(navigator, 'serviceWorker', {
      value: { controller: null },
    });

    // Should not throw
    expect(() => {
      useAuthStore.getState().clearAuth();
    }).not.toThrow();
  });
});

