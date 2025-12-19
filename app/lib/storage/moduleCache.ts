/**
 * Module cache with encryption and TTL
 *
 * Provides caching for module metadata with:
 * - Encryption using encryptedStorage
 * - TTL of 30 days per user
 * - Automatic cleanup of expired data
 */

import type { FrontendModule, ModuleListItem } from "../modules/types";
import {
  getEncrypted,
  setEncrypted,
  removeEncrypted,
  clearExpiredEncrypted,
} from "./encryptedStorage";

/**
 * Cache key prefix for module data
 */
const MODULE_CACHE_PREFIX = "modules";

/**
 * Cache key prefix for module list
 */
const MODULE_LIST_CACHE_PREFIX = "module_list";

/**
 * Get encryption secret from environment or use default
 *
 * In production, this should come from a secure source
 */
function getSecret(): string {
  // In a real app, this should be stored securely (e.g., from backend on login)
  // For now, we'll use a combination of user agent and a constant
  // This is not ideal but works for development
  return import.meta.env.VITE_ENCRYPTION_SECRET || "default-secret-change-in-production";
}

/**
 * Get tenant ID from auth store or current user
 */
function getTenantId(): string {
  // This should get the tenant ID from the auth store
  // For now, we'll use a placeholder - this will be updated when we integrate with auth
  const authData = localStorage.getItem("auth-storage");
  if (authData) {
    try {
      const parsed = JSON.parse(authData);
      return parsed.state?.user?.tenant_id || "default-tenant";
    } catch {
      return "default-tenant";
    }
  }
  return "default-tenant";
}

/**
 * Cache module data with encryption
 *
 * @param userId - User ID (for user-specific cache)
 * @param modules - Module data to cache
 */
export async function cacheModuleData(
  userId: string,
  modules: FrontendModule[]
): Promise<void> {
  const tenantId = getTenantId();
  const secret = getSecret();
  const key = `${MODULE_CACHE_PREFIX}:${userId}`;

  await setEncrypted(key, modules, tenantId, secret);
}

/**
 * Get cached module data
 *
 * @param userId - User ID
 * @returns Cached modules or null if not found/expired
 */
export async function getCachedModuleData(
  userId: string
): Promise<FrontendModule[] | null> {
  const tenantId = getTenantId();
  const secret = getSecret();
  const key = `${MODULE_CACHE_PREFIX}:${userId}`;

  return getEncrypted<FrontendModule[]>(key, tenantId, secret);
}

/**
 * Cache module list (from backend)
 *
 * @param userId - User ID
 * @param moduleList - Module list from backend
 */
export async function cacheModuleList(
  userId: string,
  moduleList: ModuleListItem[]
): Promise<void> {
  const tenantId = getTenantId();
  const secret = getSecret();
  const key = `${MODULE_LIST_CACHE_PREFIX}:${userId}`;

  await setEncrypted(key, moduleList, tenantId, secret);
}

/**
 * Get cached module list
 *
 * @param userId - User ID
 * @returns Cached module list or null if not found/expired
 */
export async function getCachedModuleList(
  userId: string
): Promise<ModuleListItem[] | null> {
  const tenantId = getTenantId();
  const secret = getSecret();
  const key = `${MODULE_LIST_CACHE_PREFIX}:${userId}`;

  return getEncrypted<ModuleListItem[]>(key, tenantId, secret);
}

/**
 * Clear cached module data for a user
 *
 * @param userId - User ID
 */
export function clearModuleCache(userId: string): void {
  const moduleKey = `${MODULE_CACHE_PREFIX}:${userId}`;
  const listKey = `${MODULE_LIST_CACHE_PREFIX}:${userId}`;

  removeEncrypted(moduleKey);
  removeEncrypted(listKey);
}

/**
 * Clear all expired cache entries
 *
 * This should be called periodically (e.g., on app startup)
 *
 * @returns Number of entries cleared
 */
export async function clearExpiredCache(): Promise<number> {
  const tenantId = getTenantId();
  const secret = getSecret();

  return clearExpiredEncrypted(tenantId, secret);
}

