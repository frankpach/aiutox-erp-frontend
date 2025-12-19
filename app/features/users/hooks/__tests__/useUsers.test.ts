/**
 * Tests for useUsers hook
 */

import { describe, it, expect, beforeEach, vi } from "vitest";
import { renderHook, waitFor } from "@testing-library/react";
import { useUsers, useUser } from "../useUsers";
import * as usersApi from "../../api/users.api";

// Mock the API
vi.mock("../../api/users.api");

describe("useUsers", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe("useUsers", () => {
    it("should fetch users list", async () => {
      const mockUsers = [
        {
          id: "1",
          email: "test@example.com",
          first_name: "Test",
          last_name: "User",
          is_active: true,
        },
      ];

      vi.mocked(usersApi.listUsers).mockResolvedValue({
        data: mockUsers,
        meta: {
          total: 1,
          page: 1,
          page_size: 20,
          total_pages: 1,
        },
      });

      const { result } = renderHook(() =>
        useUsers({ page: 1, page_size: 20 })
      );

      await waitFor(() => {
        expect(result.current.loading).toBe(false);
      });

      expect(result.current.users).toEqual(mockUsers);
      expect(result.current.pagination?.total).toBe(1);
    });

    it("should handle errors", async () => {
      vi.mocked(usersApi.listUsers).mockRejectedValue(
        new Error("API Error")
      );

      const { result } = renderHook(() =>
        useUsers({ page: 1, page_size: 20 })
      );

      await waitFor(() => {
        expect(result.current.error).toBeTruthy();
      });

      expect(result.current.error?.message).toBe("API Error");
    });
  });

  describe("useUser", () => {
    it("should fetch single user", async () => {
      const mockUser = {
        id: "1",
        email: "test@example.com",
        first_name: "Test",
        last_name: "User",
        is_active: true,
      };

      vi.mocked(usersApi.getUser).mockResolvedValue({
        data: mockUser,
      });

      const { result } = renderHook(() => useUser("1"));

      await waitFor(() => {
        expect(result.current.loading).toBe(false);
      });

      expect(result.current.user).toEqual(mockUser);
    });

    it("should return null for non-existent user", async () => {
      vi.mocked(usersApi.getUser).mockRejectedValue(
        new Error("User not found")
      );

      const { result } = renderHook(() => useUser("999"));

      await waitFor(() => {
        expect(result.current.loading).toBe(false);
      });

      expect(result.current.user).toBeNull();
      expect(result.current.error).toBeTruthy();
    });
  });
});

