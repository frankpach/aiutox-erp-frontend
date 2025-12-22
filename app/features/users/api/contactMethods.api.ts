/**
 * API services for contact methods (polymorphic)
 *
 * Handles CRUD operations for contact methods (email, phone, address, etc.)
 * Can be associated with User, Contact, Organization, Employee, or Tenant
 */

import apiClient from "~/lib/api/client";
import type {
  StandardResponse,
  StandardListResponse,
} from "~/lib/api/types/common.types";
import type {
  ContactMethod,
  ContactMethodCreate,
  ContactMethodUpdate,
  EntityType,
} from "../types/user.types";

/**
 * Get contact methods for an entity
 * GET /api/v1/contact-methods?entity_type={type}&entity_id={id}
 */
export async function getContactMethods(
  entityType: EntityType,
  entityId: string
): Promise<StandardListResponse<ContactMethod>> {
  const response = await apiClient.get<StandardListResponse<ContactMethod>>(
    "/contact-methods",
    {
      params: {
        entity_type: entityType,
        entity_id: entityId,
      },
    }
  );
  return response.data;
}

/**
 * Get contact method by ID
 * GET /api/v1/contact-methods/{contact_method_id}
 */
export async function getContactMethod(
  contactMethodId: string
): Promise<StandardResponse<ContactMethod>> {
  const response = await apiClient.get<StandardResponse<ContactMethod>>(
    `/contact-methods/${contactMethodId}`
  );
  return response.data;
}

/**
 * Create contact method
 * POST /api/v1/contact-methods
 */
export async function createContactMethod(
  data: ContactMethodCreate
): Promise<StandardResponse<ContactMethod>> {
  const response = await apiClient.post<StandardResponse<ContactMethod>>(
    "/contact-methods",
    data
  );
  return response.data;
}

/**
 * Update contact method
 * PATCH /api/v1/contact-methods/{contact_method_id}
 */
export async function updateContactMethod(
  contactMethodId: string,
  data: ContactMethodUpdate
): Promise<StandardResponse<ContactMethod>> {
  const response = await apiClient.patch<StandardResponse<ContactMethod>>(
    `/contact-methods/${contactMethodId}`,
    data
  );
  return response.data;
}

/**
 * Delete contact method
 * DELETE /api/v1/contact-methods/{contact_method_id}
 */
export async function deleteContactMethod(
  contactMethodId: string
): Promise<StandardResponse<{ message: string }>> {
  const response = await apiClient.delete<StandardResponse<{ message: string }>>(
    `/contact-methods/${contactMethodId}`
  );
  return response.data;
}







