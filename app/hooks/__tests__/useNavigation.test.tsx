import { describe, it, expect, beforeEach, vi } from "vitest";
import { renderHook } from "@testing-library/react";
import { useNavigation } from "~/hooks/useNavigation";
import { useModulesStore } from "~/stores/modulesStore";
import type { NavigationTree } from "~/lib/modules/types";

vi.mock("~/hooks/usePermissions", () => ({
  usePermissions: () => ({
    hasPermission: () => true,
    hasAnyPermission: () => true,
    permissions: ["calendar.view"],
  }),
}));

const useTaskModuleSettingsMock = vi.fn();
vi.mock("~/features/tasks/hooks/useTasks", () => ({
  useTaskModuleSettings: () => useTaskModuleSettingsMock(),
}));

const buildNavigationTree = (): NavigationTree => {
  const calendarItem = {
    id: "calendar",
    label: "Mi calendario",
    to: "/calendar",
    permission: "calendar.view",
    order: 0,
    requiresModuleSetting: {
      module: "tasks",
      key: "calendar.enabled",
      value: true,
    },
  };

  return {
    categories: new Map([
      [
        "Operación",
        {
          name: "Operación",
          order: 1,
          modules: new Map([
            [
              "ops-direct",
              {
                id: "ops-direct",
                name: "",
                order: 0,
                items: [calendarItem],
                mainRoute: "/calendar",
              },
            ],
          ]),
        },
      ],
    ]),
    allItems: [calendarItem],
  };
};

describe("useNavigation", () => {
  beforeEach(() => {
    useModulesStore.setState({
      navigationTree: buildNavigationTree(),
    });
  });

  it("filters calendar when tasks calendar setting is disabled", () => {
    useTaskModuleSettingsMock.mockReturnValue({
      data: {
        data: {
          calendar_enabled: false,
          board_enabled: true,
          inbox_enabled: true,
          list_enabled: true,
          stats_enabled: true,
        },
      },
    });

    const { result } = renderHook(() => useNavigation());
    expect(result.current?.allItems.length).toBe(0);
  });

  it("shows calendar when tasks calendar setting is enabled", () => {
    useTaskModuleSettingsMock.mockReturnValue({
      data: {
        data: {
          calendar_enabled: true,
          board_enabled: true,
          inbox_enabled: true,
          list_enabled: true,
          stats_enabled: true,
        },
      },
    });

    const { result } = renderHook(() => useNavigation());
    expect(result.current?.allItems.length).toBe(1);
    expect(result.current?.allItems[0]?.to).toBe("/calendar");
  });
});
