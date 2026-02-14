/**
 * Tests for useTouchResize hook
 */

import { renderHook, act } from "@testing-library/react";
import { describe, it, expect, vi, beforeEach } from "vitest";
import { useTouchResize } from "~/features/calendar/hooks/useTouchResize";

// Mock requestAnimationFrame/cancelAnimationFrame
let rafCallback: (() => void) | null = null;
vi.stubGlobal("requestAnimationFrame", (cb: () => void) => {
  rafCallback = cb;
  return 1;
});
vi.stubGlobal("cancelAnimationFrame", vi.fn());

function createTouchEvent(clientX: number, clientY: number): React.TouchEvent {
  return {
    touches: [{ clientX, clientY }],
    preventDefault: vi.fn(),
  } as unknown as React.TouchEvent;
}

describe("useTouchResize", () => {
  const mockOnTouchStart = vi.fn();
  const mockOnTouchMove = vi.fn();
  const mockOnTouchEnd = vi.fn();

  beforeEach(() => {
    vi.clearAllMocks();
    rafCallback = null;
  });

  it("returns touch handlers", () => {
    const { result } = renderHook(() => useTouchResize());

    expect(result.current.touchHandlers).toBeDefined();
    expect(result.current.touchHandlers.onTouchStart).toBeDefined();
    expect(result.current.touchHandlers.onTouchMove).toBeDefined();
    expect(result.current.touchHandlers.onTouchEnd).toBeDefined();
    expect(result.current.touchHandlers.onTouchCancel).toBeDefined();
  });

  it("does not trigger resize for small movements", () => {
    const { result } = renderHook(() =>
      useTouchResize({
        onTouchStart: mockOnTouchStart,
        onTouchMove: mockOnTouchMove,
        minDragDistance: 10,
      })
    );

    act(() => {
      result.current.touchHandlers.onTouchStart(createTouchEvent(100, 100));
    });

    act(() => {
      result.current.touchHandlers.onTouchMove(createTouchEvent(105, 100));
    });

    expect(mockOnTouchStart).not.toHaveBeenCalled();
    expect(mockOnTouchMove).not.toHaveBeenCalled();
  });

  it("triggers resize after minimum drag distance", () => {
    const { result } = renderHook(() =>
      useTouchResize({
        onTouchStart: mockOnTouchStart,
        onTouchMove: mockOnTouchMove,
        minDragDistance: 10,
        throttleMs: 0,
      })
    );

    act(() => {
      result.current.touchHandlers.onTouchStart(createTouchEvent(100, 100));
    });

    act(() => {
      result.current.touchHandlers.onTouchMove(createTouchEvent(115, 100));
    });

    expect(mockOnTouchStart).toHaveBeenCalledTimes(1);

    // Flush rAF
    if (rafCallback) {
      act(() => {
        rafCallback!();
      });
    }

    expect(mockOnTouchMove).toHaveBeenCalledWith(15, 0);
  });

  it("calls onTouchEnd with final deltas", () => {
    const { result } = renderHook(() =>
      useTouchResize({
        onTouchStart: mockOnTouchStart,
        onTouchEnd: mockOnTouchEnd,
        minDragDistance: 5,
        throttleMs: 0,
      })
    );

    act(() => {
      result.current.touchHandlers.onTouchStart(createTouchEvent(100, 100));
    });

    act(() => {
      result.current.touchHandlers.onTouchMove(createTouchEvent(120, 110));
    });

    act(() => {
      result.current.touchHandlers.onTouchEnd();
    });

    expect(mockOnTouchEnd).toHaveBeenCalledWith(20, 10);
  });

  it("handles touchCancel same as touchEnd", () => {
    const { result } = renderHook(() =>
      useTouchResize({
        onTouchStart: mockOnTouchStart,
        onTouchEnd: mockOnTouchEnd,
        minDragDistance: 5,
        throttleMs: 0,
      })
    );

    act(() => {
      result.current.touchHandlers.onTouchStart(createTouchEvent(100, 100));
    });

    act(() => {
      result.current.touchHandlers.onTouchMove(createTouchEvent(120, 100));
    });

    act(() => {
      result.current.touchHandlers.onTouchCancel();
    });

    expect(mockOnTouchEnd).toHaveBeenCalledWith(20, 0);
  });
});
