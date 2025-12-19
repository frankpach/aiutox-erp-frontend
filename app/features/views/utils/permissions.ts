/**
 * Permission utilities for SavedFilters.
 * Checks if user can edit/delete filters based on ownership and roles.
 */

import type { SavedFilter } from "../types/savedFilter.types";

// Import User type from authStore to ensure consistency
// Note: We need to extract the User type from the store
// For now, using a compatible interface
interface User {
  id: string;
  email: string;
  roles?: string[];
  permissions?: string[];
}

/**
 * Check if user can edit a filter
 * Only the creator can edit their own filters
 */
export function canEditFilter(filter: SavedFilter, currentUser: User | null): boolean {
  if (!currentUser) return false;
  if (!filter.created_by) return false;
  return filter.created_by === currentUser.id;
}

/**
 * Check if user can delete a filter
 * Can delete if:
 * - User is the creator, OR
 * - User is admin of the module, OR
 * - User is admin of the organization, OR
 * - User is super user (owner role)
 */
export function canDeleteFilter(
  filter: SavedFilter,
  currentUser: User | null,
  module: string
): boolean {
  if (!currentUser) return false;

  // Creator can always delete
  if (filter.created_by === currentUser.id) {
    return true;
  }

  // Check for admin roles
  const roles = currentUser.roles || [];
  const permissions = currentUser.permissions || [];

  // Super user / Owner
  if (roles.includes("owner") || roles.includes("super_user")) {
    return true;
  }

  // Admin of organization
  if (roles.includes("admin")) {
    return true;
  }

  // Admin of module (would need module-specific role check)
  // For now, checking for module admin permission pattern
  // This would need to be enhanced based on actual RBAC implementation
  if (permissions.includes(`${module}.manage`) || permissions.includes(`${module}.admin`)) {
    return true;
  }

  return false;
}

/**
 * Check if user can share a filter
 * Only the creator can share/unshare
 */
export function canShareFilter(filter: SavedFilter, currentUser: User | null): boolean {
  return canEditFilter(filter, currentUser);
}

/**
 * Check if user has permission to view filters
 */
export function canViewFilters(currentUser: User | null): boolean {
  if (!currentUser) return false;
  const permissions = currentUser.permissions || [];
  return permissions.includes("views.view");
}

/**
 * Check if user has permission to manage (create/edit) filters
 */
export function canManageFilters(currentUser: User | null): boolean {
  if (!currentUser) return false;
  const permissions = currentUser.permissions || [];
  return permissions.includes("views.manage");
}

/**
 * Check if user has permission to share filters
 */
export function canShareFilters(currentUser: User | null): boolean {
  if (!currentUser) return false;
  const permissions = currentUser.permissions || [];
  return permissions.includes("views.share");
}


