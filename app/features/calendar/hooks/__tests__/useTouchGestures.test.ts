/**
 * Tests for useTouchGestures hook
 */

import { renderHook, act } from "@testing-library/react";
import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import { useTouchGestures } from "~/features/calendar/hooks/useTouchGestures";

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

describe("useTouchGestures", () => {
  const onTap = vi.fn();
  const onLongPress = vi.fn();
  const onDragStart = vi.fn();
  const onDragMove = vi.fn();
  const onDragEnd = vi.fn();

  beforeEach(() => {
    vi.clearAllMocks();
    vi.useFakeTimers();
    rafCallback = null;
    // Re-stub RAF after useFakeTimers() since fake timers override the global stub
    vi.stubGlobal("requestAnimationFrame", (cb: () => void) => {
      rafCallback = cb;
      return 1;
    });
    vi.stubGlobal("cancelAnimationFrame", vi.fn());
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  it("retorna touchHandlers con los 4 eventos", () => {
    const { result } = renderHook(() => useTouchGestures());
    const h = result.current.touchHandlers;
    expect(h.onTouchStart).toBeDefined();
    expect(h.onTouchMove).toBeDefined();
    expect(h.onTouchEnd).toBeDefined();
    expect(h.onTouchCancel).toBeDefined();
  });

  it("detecta tap (toque corto sin movimiento)", () => {
    const { result } = renderHook(() =>
      useTouchGestures({ onTap, longPressDuration: 500 }),
    );

    act(() => {
      result.current.touchHandlers.onTouchStart(createTouchEvent(100, 100));
    });

    // Avanzar menos de longPressDuration
    act(() => {
      vi.advanceTimersByTime(100);
    });

    act(() => {
      result.current.touchHandlers.onTouchEnd();
    });

    expect(onTap).toHaveBeenCalledWith(100, 100);
    expect(onLongPress).not.toHaveBeenCalled();
  });

  it("detecta long press (toque largo sin movimiento)", () => {
    const { result } = renderHook(() =>
      useTouchGestures({ onLongPress, longPressDuration: 500 }),
    );

    act(() => {
      result.current.touchHandlers.onTouchStart(createTouchEvent(200, 200));
    });

    act(() => {
      vi.advanceTimersByTime(600);
    });

    expect(onLongPress).toHaveBeenCalledWith(200, 200);
  });

  it("detecta drag cuando movimiento supera threshold", () => {
    const { result } = renderHook(() =>
      useTouchGestures({
        onDragStart,
        onDragMove,
        dragThreshold: 10,
        throttleMs: 0,
      }),
    );

    act(() => {
      result.current.touchHandlers.onTouchStart(createTouchEvent(100, 100));
    });

    act(() => {
      result.current.touchHandlers.onTouchMove(createTouchEvent(120, 100));
      // Execute the RAF callback synchronously within the same act
      if (rafCallback) {
        rafCallback();
        rafCallback = null;
      }
    });

    expect(onDragStart).toHaveBeenCalledWith(100, 100);
    expect(onDragMove).toHaveBeenCalledWith(20, 0);
  });

  it("llama onDragEnd con deltas finales", () => {
    const { result } = renderHook(() =>
      useTouchGestures({
        onDragStart,
        onDragEnd,
        dragThreshold: 5,
        throttleMs: 0,
      }),
    );

    act(() => {
      result.current.touchHandlers.onTouchStart(createTouchEvent(100, 100));
    });

    act(() => {
      result.current.touchHandlers.onTouchMove(createTouchEvent(130, 110));
    });

    act(() => {
      result.current.touchHandlers.onTouchEnd();
    });

    expect(onDragEnd).toHaveBeenCalledWith(30, 10);
  });

  it("cancela long press si se inicia drag", () => {
    const { result } = renderHook(() =>
      useTouchGestures({
        onLongPress,
        onDragStart,
        dragThreshold: 10,
        longPressDuration: 500,
      }),
    );

    act(() => {
      result.current.touchHandlers.onTouchStart(createTouchEvent(100, 100));
    });

    // Mover antes de que expire el timer
    act(() => {
      vi.advanceTimersByTime(200);
      result.current.touchHandlers.onTouchMove(createTouchEvent(120, 100));
    });

    // Avanzar el resto del timer — ya no debería disparar longpress
    act(() => {
      vi.advanceTimersByTime(400);
    });

    expect(onDragStart).toHaveBeenCalled();
    expect(onLongPress).not.toHaveBeenCalled();
  });

  it("touchCancel se comporta igual que touchEnd", () => {
    const { result } = renderHook(() =>
      useTouchGestures({ onDragEnd, dragThreshold: 5, throttleMs: 0 }),
    );

    act(() => {
      result.current.touchHandlers.onTouchStart(createTouchEvent(100, 100));
    });
    act(() => {
      result.current.touchHandlers.onTouchMove(createTouchEvent(115, 100));
    });
    act(() => {
      result.current.touchHandlers.onTouchCancel();
    });

    expect(onDragEnd).toHaveBeenCalledWith(15, 0);
  });
});
