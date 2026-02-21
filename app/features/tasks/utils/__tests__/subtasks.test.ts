/**
 * Tests para utilidades de subtareas
 */

import { describe, it, expect } from "vitest";
import {
  calculateSubtaskProgress,
  getTaskDepth,
  wouldCreateCycle,
  buildTaskTree,
  MAX_SUBTASK_DEPTH,
} from "../subtasks";
import type { Task } from "~/features/tasks/types/task.types";

const makeTask = (overrides: Partial<Task> = {}): Task => ({
  id: "task-1",
  tenant_id: "tenant-1",
  title: "Test Task",
  description: "",
  assigned_to_id: null,
  created_by_id: null,
  status: "todo",
  priority: "medium",
  checklist: [],
  created_at: "2026-01-01T00:00:00Z",
  updated_at: "2026-01-01T00:00:00Z",
  ...overrides,
});

describe("calculateSubtaskProgress", () => {
  it("devuelve 0 si no hay subtareas", () => {
    const task = makeTask({ subtasks: [] });
    const result = calculateSubtaskProgress(task);
    expect(result).toEqual({ total: 0, completed: 0, percentage: 0 });
  });

  it("calcula progreso con subtareas completadas", () => {
    const task = makeTask({
      subtasks: [
        makeTask({ id: "s1", status: "done" }),
        makeTask({ id: "s2", status: "todo" }),
        makeTask({ id: "s3", status: "done" }),
      ],
    });
    const result = calculateSubtaskProgress(task);
    expect(result).toEqual({ total: 3, completed: 2, percentage: 67 });
  });

  it("calcula progreso recursivo con subtareas anidadas", () => {
    const task = makeTask({
      subtasks: [
        makeTask({
          id: "s1",
          status: "done",
          subtasks: [
            makeTask({ id: "s1-1", status: "done" }),
            makeTask({ id: "s1-2", status: "todo" }),
          ],
        }),
        makeTask({ id: "s2", status: "todo" }),
      ],
    });
    const result = calculateSubtaskProgress(task);
    // s1 (done) + s1-1 (done) + s1-2 (todo) + s2 (todo) = 4 total, 2 completed
    expect(result).toEqual({ total: 4, completed: 2, percentage: 50 });
  });

  it("devuelve 100% cuando todas están completadas", () => {
    const task = makeTask({
      subtasks: [
        makeTask({ id: "s1", status: "done" }),
        makeTask({ id: "s2", status: "done" }),
      ],
    });
    const result = calculateSubtaskProgress(task);
    expect(result).toEqual({ total: 2, completed: 2, percentage: 100 });
  });
});

describe("getTaskDepth", () => {
  it("devuelve 0 para tareas raíz", () => {
    const task = makeTask({ parent_task_id: null });
    expect(getTaskDepth(task, [task])).toBe(0);
  });

  it("devuelve 1 para subtarea de primer nivel", () => {
    const parent = makeTask({ id: "p1" });
    const child = makeTask({ id: "c1", parent_task_id: "p1" });
    expect(getTaskDepth(child, [parent, child])).toBe(1);
  });

  it("devuelve 2 para subtarea de segundo nivel", () => {
    const root = makeTask({ id: "r1" });
    const mid = makeTask({ id: "m1", parent_task_id: "r1" });
    const leaf = makeTask({ id: "l1", parent_task_id: "m1" });
    expect(getTaskDepth(leaf, [root, mid, leaf])).toBe(2);
  });
});

describe("wouldCreateCycle", () => {
  it("detecta auto-referencia", () => {
    expect(wouldCreateCycle("t1", "t1", [])).toBe(true);
  });

  it("detecta ciclo directo", () => {
    const tasks = [
      makeTask({ id: "a", parent_task_id: "b" }),
      makeTask({ id: "b" }),
    ];
    // Mover b bajo a crearía ciclo: a->b->a
    expect(wouldCreateCycle("b", "a", tasks)).toBe(true);
  });

  it("permite movimiento válido", () => {
    const tasks = [
      makeTask({ id: "a" }),
      makeTask({ id: "b" }),
      makeTask({ id: "c", parent_task_id: "a" }),
    ];
    // Mover b bajo a es válido
    expect(wouldCreateCycle("b", "a", tasks)).toBe(false);
  });
});

describe("buildTaskTree", () => {
  it("construye árbol desde lista plana", () => {
    const tasks = [
      makeTask({ id: "r1" }),
      makeTask({ id: "c1", parent_task_id: "r1" }),
      makeTask({ id: "c2", parent_task_id: "r1" }),
      makeTask({ id: "gc1", parent_task_id: "c1" }),
    ];
    const tree = buildTaskTree(tasks);
    expect(tree).toHaveLength(1);
    expect(tree[0]?.id).toBe("r1");
    expect(tree[0]?.subtasks).toHaveLength(2);
    expect(tree[0]?.subtasks?.[0]?.subtasks).toHaveLength(1);
  });

  it("maneja tareas sin padre como raíces", () => {
    const tasks = [
      makeTask({ id: "a" }),
      makeTask({ id: "b" }),
    ];
    const tree = buildTaskTree(tasks);
    expect(tree).toHaveLength(2);
  });
});

describe("MAX_SUBTASK_DEPTH", () => {
  it("es 3", () => {
    expect(MAX_SUBTASK_DEPTH).toBe(3);
  });
});
