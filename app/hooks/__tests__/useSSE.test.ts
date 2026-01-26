import { act, renderHook, waitFor } from "@testing-library/react";
import { describe, it, expect, beforeEach, vi } from "vitest";

import { useSSE } from "~/hooks/useSSE";

const toastMock = {
  success: vi.fn(),
  info: vi.fn(),
  warning: vi.fn(),
  error: vi.fn(),
};

vi.mock("~/hooks/useToast", () => ({
  useToast: () => toastMock,
}));

vi.mock("~/lib/i18n/useTranslation", () => ({
  useTranslation: () => ({
    t: (key: string) => key,
  }),
}));

let latestEventSource: MockEventSource | null = null;

class MockEventSource {
  url: string;
  options?: EventSourceInit;
  onopen: (() => void) | null = null;
  onerror: ((event: Event) => void) | null = null;
  onmessage: ((event: MessageEvent) => void) | null = null;
  close = vi.fn();

  constructor(url: string, options?: EventSourceInit) {
    this.url = url;
    this.options = options;
    latestEventSource = this;
  }
}

describe("useSSE hook", () => {
  beforeEach(() => {
    latestEventSource = null;
    toastMock.success.mockReset();
    toastMock.info.mockReset();
    toastMock.warning.mockReset();
    toastMock.error.mockReset();
    vi.stubGlobal("EventSource", MockEventSource as unknown as typeof EventSource);
  });

  it("creates EventSource when enabled and sets isConnected on open", async () => {
    const { result } = renderHook(() =>
      useSSE({ url: "/api/v1/sse/notifications", enabled: true })
    );

    expect(latestEventSource).not.toBeNull();

    act(() => {
      latestEventSource?.onopen?.();
    });

    await waitFor(() => {
      expect(result.current.isConnected).toBe(true);
    });
  });

  it("does not create EventSource when disabled", () => {
    renderHook(() => useSSE({ url: "/api/v1/sse/notifications", enabled: false }));
    expect(latestEventSource).toBeNull();
  });

  it("calls onEvent and toast handlers for task events", async () => {
    const onEvent = vi.fn();

    renderHook(() =>
      useSSE({ url: "/api/v1/sse/notifications", enabled: true, onEvent })
    );

    const payload = {
      type: "task.assigned",
      task_title: "Task A",
    };

    act(() => {
      latestEventSource?.onmessage?.(
        new MessageEvent("message", { data: JSON.stringify(payload) })
      );
    });

    await waitFor(() => {
      expect(onEvent).toHaveBeenCalled();
      expect(toastMock.success).toHaveBeenCalled();
    });
  });

  it("closes EventSource on cleanup", () => {
    const { unmount } = renderHook(() =>
      useSSE({ url: "/api/v1/sse/notifications", enabled: true })
    );

    const instance = latestEventSource;
    unmount();

    expect(instance?.close).toHaveBeenCalled();
  });
});
