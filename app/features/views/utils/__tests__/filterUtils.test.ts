/**
 * Tests for filterUtils functions
 */

import { describe, it, expect } from "vitest";
import {
  validateFilterCondition,
  buildFilterDescription,
  getOperatorLabel,
} from "../filterUtils";
import type { FieldConfig, FilterOperator } from "../../types/savedFilter.types";

describe("filterUtils", () => {
  describe("validateFilterCondition", () => {
    const emailField: FieldConfig = {
      name: "email",
      label: "Email",
      type: "email",
      operators: ["eq", "ne", "contains", "is_null", "is_not_null"],
    };

    it("should validate a valid condition", () => {
      const result = validateFilterCondition(
        { operator: "contains", value: "test" },
        emailField
      );

      expect(result.valid).toBe(true);
      expect(result.error).toBeUndefined();
    });

    it("should reject invalid operator", () => {
      const result = validateFilterCondition(
        { operator: "gt", value: 10 },
        emailField
      );

      expect(result.valid).toBe(false);
      expect(result.error).toContain("no permitido");
    });

    it("should validate is_null operator without value", () => {
      const result = validateFilterCondition(
        { operator: "is_null", value: null },
        emailField
      );

      expect(result.valid).toBe(true);
    });

    it("should validate is_not_null operator without value", () => {
      const result = validateFilterCondition(
        { operator: "is_not_null", value: null },
        emailField
      );

      expect(result.valid).toBe(true);
    });
  });

  describe("buildFilterDescription", () => {
    const fields: FieldConfig[] = [
      {
        name: "email",
        label: "Email",
        type: "email",
        operators: ["eq", "contains"],
      },
      {
        name: "is_active",
        label: "Estado",
        type: "boolean",
        operators: ["eq"],
      },
    ];

    it("should build description for single condition", () => {
      const filterConfig = {
        email: { operator: "contains" as FilterOperator, value: "test" },
      };

      const description = buildFilterDescription(filterConfig, fields);

      expect(description).toContain("Email");
      expect(description).toContain("contiene");
      expect(description).toContain("test");
    });

    it("should build description for multiple conditions", () => {
      const filterConfig = {
        email: { operator: "contains" as FilterOperator, value: "test" },
        is_active: { operator: "eq" as FilterOperator, value: true },
      };

      const description = buildFilterDescription(filterConfig, fields);

      expect(description).toContain("Email");
      expect(description).toContain("Estado");
      expect(description).toContain("Y");
    });

    it("should return 'Sin condiciones' for empty config", () => {
      const description = buildFilterDescription({}, fields);

      expect(description).toBe("Sin condiciones");
    });
  });

  describe("getOperatorLabel", () => {
    it("should return Spanish label for operator", () => {
      expect(getOperatorLabel("eq")).toBe("es igual a");
      expect(getOperatorLabel("contains")).toBe("contiene");
      expect(getOperatorLabel("is_null")).toBe("es nulo");
    });

    it("should return operator name for unknown operator", () => {
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      expect(getOperatorLabel("unknown" as any)).toBe("unknown");
    });
  });
});


