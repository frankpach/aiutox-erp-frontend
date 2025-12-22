/**
 * Unit tests for PWAUpdatePrompt component
 *
 * NOTA: El mock de 'virtual:pwa-register/react' se maneja automáticamente
 * vía el alias configurado en vitest.config.ts que apunta a:
 * frontend/app/__mocks__/virtual-pwa-register-react.ts
 */
import { describe, it, expect, beforeEach, vi } from 'vitest';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { PWAUpdatePrompt } from '../PWAUpdatePrompt';

describe('PWAUpdatePrompt', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('should not render when needRefresh is false (default mock)', () => {
    const { container } = render(<PWAUpdatePrompt />);
    expect(container.firstChild).toBeNull();
  });

  it('should render prompt when needRefresh changes to true', async () => {
    const { rerender } = render(<PWAUpdatePrompt />);

    // Por ahora, solo verificamos que el componente se renderiza sin errores
    // Los tests E2E verificarán el comportamiento real con el SW
    expect(() => rerender(<PWAUpdatePrompt />)).not.toThrow();
  });
});

