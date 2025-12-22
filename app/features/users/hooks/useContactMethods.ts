/**
 * React hooks for contact methods management
 *
 * Provides CRUD operations for contact methods (polymorphic)
 */

import { useCallback, useState, useEffect } from "react";
import {
  getContactMethods,
  getContactMethod,
  createContactMethod,
  updateContactMethod,
  deleteContactMethod,
} from "../api/contactMethods.api";
import type {
  ContactMethod,
  ContactMethodCreate,
  ContactMethodUpdate,
  EntityType,
} from "../types/user.types";

/**
 * Hook to get contact methods for an entity
 */
export function useContactMethods(
  entityType: EntityType | null,
  entityId: string | null
) {
  const [contactMethods, setContactMethods] = useState<ContactMethod[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<Error | null>(null);

  const fetchContactMethods = useCallback(async () => {
    if (!entityType || !entityId) {
      setContactMethods([]);
      return;
    }

    setLoading(true);
    setError(null);

    try {
      const response = await getContactMethods(entityType, entityId);
      setContactMethods(response.data);
    } catch (err) {
      setError(
        err instanceof Error
          ? err
          : new Error("Failed to load contact methods")
      );
    } finally {
      setLoading(false);
    }
  }, [entityType, entityId]);

  useEffect(() => {
    fetchContactMethods();
  }, [fetchContactMethods]);

  return {
    contactMethods,
    loading,
    error,
    refresh: fetchContactMethods,
  };
}

/**
 * Hook to get a single contact method by ID
 */
export function useContactMethod(contactMethodId: string | null) {
  const [contactMethod, setContactMethod] = useState<ContactMethod | null>(
    null
  );
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<Error | null>(null);

  const fetchContactMethod = useCallback(async () => {
    if (!contactMethodId) {
      setContactMethod(null);
      return;
    }

    setLoading(true);
    setError(null);

    try {
      const response = await getContactMethod(contactMethodId);
      setContactMethod(response.data);
    } catch (err) {
      setError(
        err instanceof Error
          ? err
          : new Error("Failed to load contact method")
      );
    } finally {
      setLoading(false);
    }
  }, [contactMethodId]);

  useEffect(() => {
    fetchContactMethod();
  }, [fetchContactMethod]);

  return {
    contactMethod,
    loading,
    error,
    refresh: fetchContactMethod,
  };
}

/**
 * Hook to create a contact method
 */
export function useCreateContactMethod() {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<Error | null>(null);

  const create = useCallback(
    async (data: ContactMethodCreate): Promise<ContactMethod | null> => {
      setLoading(true);
      setError(null);

      try {
        const response = await createContactMethod(data);
        return response.data;
      } catch (err) {
        setError(
          err instanceof Error
            ? err
            : new Error("Failed to create contact method")
        );
        return null;
      } finally {
        setLoading(false);
      }
    },
    []
  );

  return {
    create,
    loading,
    error,
  };
}

/**
 * Hook to update a contact method
 */
export function useUpdateContactMethod() {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<Error | null>(null);

  const update = useCallback(
    async (
      contactMethodId: string,
      data: ContactMethodUpdate
    ): Promise<ContactMethod | null> => {
      setLoading(true);
      setError(null);

      try {
        const response = await updateContactMethod(contactMethodId, data);
        return response.data;
      } catch (err) {
        setError(
          err instanceof Error
            ? err
            : new Error("Failed to update contact method")
        );
        return null;
      } finally {
        setLoading(false);
      }
    },
    []
  );

  return {
    update,
    loading,
    error,
  };
}

/**
 * Hook to delete a contact method
 */
export function useDeleteContactMethod() {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<Error | null>(null);

  const remove = useCallback(
    async (contactMethodId: string): Promise<boolean> => {
      setLoading(true);
      setError(null);

      try {
        await deleteContactMethod(contactMethodId);
        return true;
      } catch (err) {
        setError(
          err instanceof Error
            ? err
            : new Error("Failed to delete contact method")
        );
        return false;
      } finally {
        setLoading(false);
      }
    },
    []
  );

  return {
    remove,
    loading,
    error,
  };
}







