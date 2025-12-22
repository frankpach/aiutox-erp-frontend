/**
 * Unit tests for authStore PWA integration
 * Tests that auth clearing also clears Service Worker cache
 */
import { describe, it, expect, beforeEach, vi } from 'vitest';
import { useAuthStore } from '../authStore';

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
    useAuthStore.getState().setAuth(
      { id: '1', email: 'test@example.com', full_name: 'Test', is_active: true },
      'token',
      'refresh'
    );

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
    const originalSW = (navigator as any).serviceWorker;
    delete (navigator as any).serviceWorker;

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
    delete (navigator as any).serviceWorker;
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

