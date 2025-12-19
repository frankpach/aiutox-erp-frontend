/**
 * Tests for encrypted storage utilities
 */

import { describe, it, expect, beforeEach, vi } from "vitest";
import {
  encrypt,
  decrypt,
  setEncrypted,
  getEncrypted,
  removeEncrypted,
  clearExpiredEncrypted,
} from "../encryptedStorage";

describe("encryptedStorage", () => {
  const tenantId = "test-tenant";
  const secret = "test-secret";
  const testData = { name: "Test User", id: "123" };

  beforeEach(() => {
    // Clear localStorage before each test
    localStorage.clear();
  });

  describe("encrypt/decrypt", () => {
    it("should encrypt and decrypt data correctly", async () => {
      const encrypted = await encrypt(
        JSON.stringify(testData),
        tenantId,
        secret
      );

      expect(encrypted).toHaveProperty("data");
      expect(encrypted).toHaveProperty("iv");
      expect(encrypted).toHaveProperty("timestamp");
      expect(encrypted.data).toBeTruthy();
      expect(encrypted.iv).toBeTruthy();

      const decrypted = await decrypt(
        encrypted.data,
        encrypted.iv,
        tenantId,
        secret
      );

      expect(decrypted).toBe(JSON.stringify(testData));
    });

    it("should fail to decrypt with wrong secret", async () => {
      const encrypted = await encrypt(
        JSON.stringify(testData),
        tenantId,
        secret
      );

      await expect(
        decrypt(encrypted.data, encrypted.iv, tenantId, "wrong-secret")
      ).rejects.toThrow();
    });

    it("should fail to decrypt with wrong tenant", async () => {
      const encrypted = await encrypt(
        JSON.stringify(testData),
        tenantId,
        secret
      );

      await expect(
        decrypt(encrypted.data, encrypted.iv, "wrong-tenant", secret)
      ).rejects.toThrow();
    });
  });

  describe("setEncrypted/getEncrypted", () => {
    it("should store and retrieve encrypted data", async () => {
      await setEncrypted("test-key", testData, tenantId, secret);

      const retrieved = await getEncrypted<typeof testData>(
        "test-key",
        tenantId,
        secret
      );

      expect(retrieved).toEqual(testData);
    });

    it("should return null for non-existent key", async () => {
      const retrieved = await getEncrypted("non-existent", tenantId, secret);
      expect(retrieved).toBeNull();
    });

    it("should return null for expired data", async () => {
      // Set data with very short TTL
      await setEncrypted("expired-key", testData, tenantId, secret, 1); // 1ms TTL

      // Wait for expiration
      await new Promise((resolve) => setTimeout(resolve, 10));

      const retrieved = await getEncrypted("expired-key", tenantId, secret);
      expect(retrieved).toBeNull();
    });
  });

  describe("removeEncrypted", () => {
    it("should remove encrypted data", async () => {
      await setEncrypted("test-key", testData, tenantId, secret);
      removeEncrypted("test-key");

      const retrieved = await getEncrypted("test-key", tenantId, secret);
      expect(retrieved).toBeNull();
    });
  });

  describe("clearExpiredEncrypted", () => {
    it("should clear expired entries", async () => {
      // Set some data with short TTL
      await setEncrypted("expired-1", testData, tenantId, secret, 1);
      await setEncrypted("expired-2", testData, tenantId, secret, 1);
      await setEncrypted("valid", testData, tenantId, secret, 3600000); // 1 hour

      // Wait for expiration
      await new Promise((resolve) => setTimeout(resolve, 10));

      const cleared = await clearExpiredEncrypted(tenantId, secret);
      expect(cleared).toBeGreaterThanOrEqual(2);

      // Valid data should still exist
      const valid = await getEncrypted("valid", tenantId, secret);
      expect(valid).toEqual(testData);
    });
  });
});

