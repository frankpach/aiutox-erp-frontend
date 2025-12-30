/**
 * API Helpers for Files E2E Tests
 * Provides helper functions to interact with Files API for test setup/teardown
 */

import type { Page } from "@playwright/test";
import type { StandardResponse, StandardListResponse } from "~/lib/api/types/common.types";
import type { File } from "~/features/files/types/file.types";

const API_BASE_URL = process.env.VITE_API_BASE_URL || "http://localhost:8000";

/**
 * Create a test file via API using Playwright's page context
 * Uses page.evaluate to make the request from browser context where token is available in localStorage
 */
export async function createTestFile(
  page: Page,
  fileContent: string,
  filename: string = "test-file.txt",
  entityType?: string,
  entityId?: string
): Promise<StandardResponse<File>> {
  // Esperar un poco para asegurar que el token está almacenado después del login
  await page.waitForTimeout(1000);

  // Usar page.evaluate para hacer la petición desde el contexto del navegador
  // donde el token JWT está disponible en localStorage
  const result = await page.evaluate(async ({ apiBaseUrl, fileContent, filename, entityType, entityId }) => {
    // Obtener el token JWT desde localStorage
    const token = localStorage.getItem("auth_token");
    if (!token) {
      throw new Error("No authentication token found in localStorage. Make sure you are logged in.");
    }

    const formData = new FormData();
    const blob = new Blob([fileContent], { type: "text/plain" });
    formData.append("file", blob, filename);

    if (entityType) {
      formData.append("entity_type", entityType);
    }
    if (entityId) {
      formData.append("entity_id", entityId);
    }

    const response = await fetch(`${apiBaseUrl}/api/v1/files/upload`, {
      method: "POST",
      body: formData,
      headers: {
        Authorization: `Bearer ${token}`, // Incluir token JWT en header Authorization
      },
    });

    if (!response.ok) {
      const errorText = await response.text().catch(() => response.statusText);
      throw new Error(`Failed to create test file: ${response.status} ${response.statusText} - ${errorText}`);
    }

    const result = await response.json();

    // Verificar que la respuesta tiene la estructura esperada
    if (!result.data || !result.data.id) {
      throw new Error(`Invalid response from upload API: ${JSON.stringify(result)}`);
    }

    return result;
  }, {
    apiBaseUrl: API_BASE_URL,
    fileContent,
    filename,
    entityType,
    entityId,
  });

  return result;
}

/**
 * Delete a test file via API using Playwright's page context
 */
export async function deleteTestFile(page: Page, fileId: string): Promise<void> {
  // Obtener token desde localStorage en el contexto del navegador
  const token = await page.evaluate(() => localStorage.getItem("auth_token"));
  if (!token) {
    throw new Error("No authentication token found in localStorage. Make sure you are logged in.");
  }

  const response = await page.request.delete(`${API_BASE_URL}/api/v1/files/${fileId}`, {
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });

  if (!response.ok() && response.status() !== 404) {
    throw new Error(`Failed to delete test file: ${response.statusText()}`);
  }
}

/**
 * List files via API using Playwright's page context
 */
export async function listTestFiles(
  page: Page,
  entityType?: string,
  entityId?: string
): Promise<StandardListResponse<File>> {
  // Obtener token desde localStorage en el contexto del navegador
  const token = await page.evaluate(() => localStorage.getItem("auth_token"));
  if (!token) {
    throw new Error("No authentication token found in localStorage. Make sure you are logged in.");
  }

  const params = new URLSearchParams();
  if (entityType) {
    params.append("entity_type", entityType);
  }
  if (entityId) {
    params.append("entity_id", entityId);
  }

  const url = `${API_BASE_URL}/api/v1/files${params.toString() ? `?${params.toString()}` : ""}`;
  const response = await page.request.get(url, {
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });

  if (!response.ok()) {
    throw new Error(`Failed to list files: ${response.statusText()}`);
  }

  return response.json();
}

/**
 * Cleanup test files
 */
export async function cleanupTestFiles(page: Page, fileIds: string[]): Promise<void> {
  await Promise.allSettled(
    fileIds.map((id) => deleteTestFile(page, id))
  );
}


