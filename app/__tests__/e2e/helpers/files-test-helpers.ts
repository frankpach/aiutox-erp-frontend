/**
 * Test Helpers for Files E2E Tests
 * Provides hybrid strategy: API for setup (fast), UI for testing (complete)
 */

import type { Page } from "@playwright/test";
import { FilesPage } from "./page-objects/FilesPage";
import { createTestFile, deleteTestFile } from "./api-helpers-files";
import { logStep } from "./test-utils";

/**
 * Setup helper: Crea archivo de prueba vía API (rápido y confiable)
 * Usar para setup inicial de tests que necesitan archivos existentes
 *
 * @param page - Playwright page instance
 * @param fileName - Nombre del archivo
 * @param fileContent - Contenido del archivo
 * @returns Objeto con fileId y fileName
 */
export async function setupTestFile(
  page: Page,
  fileName: string,
  fileContent: string
): Promise<{ fileId: string; fileName: string }> {
  logStep("Setting up test file via API", { fileName });

  try {
    // Usar API para crear archivo rápidamente (usando contexto de página para cookies)
    const result = await createTestFile(page, fileContent, fileName);

    // Verificar que la respuesta es válida
    if (!result || !result.data || !result.data.id) {
      throw new Error(`Invalid API response: ${JSON.stringify(result)}`);
    }

    logStep("Test file created via API", {
      fileName: result.data.name,
      fileId: result.data.id,
      response: result
    });

    return {
      fileId: result.data.id,
      fileName: result.data.name,
    };
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : String(error);
    logStep("Failed to create test file via API", {
      fileName,
      error: errorMessage
    });
    throw new Error(`Failed to create test file '${fileName}': ${errorMessage}`);
  }
}

/**
 * Test helper: Prueba subida por UI (completo pero más lento)
 * Usar solo cuando se necesita probar específicamente la funcionalidad de subida
 *
 * @param filesPage - FilesPage instance
 * @param fileName - Nombre del archivo
 * @param fileContent - Contenido del archivo
 * @returns true si la subida fue exitosa
 */
export async function testFileUploadViaUI(
  filesPage: FilesPage,
  fileName: string,
  fileContent: string
): Promise<boolean> {
  logStep("Testing file upload via UI", { fileName });

  const result = await filesPage.uploadFileViaUI(fileName, fileContent);

  if (result.success) {
    logStep("File upload via UI successful", { fileName });
  } else {
    logStep("File upload via UI failed", { fileName });
  }

  return result.success;
}

/**
 * Cleanup helper: Elimina archivos de prueba vía API
 *
 * @param fileIds - Array de IDs de archivos a eliminar
 */
export async function cleanupTestFiles(page: Page, fileIds: string[]): Promise<void> {
  if (fileIds.length === 0) {
    return;
  }

  logStep("Cleaning up test files", { count: fileIds.length });

  await Promise.allSettled(
    fileIds.map(async (id) => {
      try {
        await deleteTestFile(page, id);
      } catch (error) {
        logStep("Failed to delete test file", {
          fileId: id,
          error: error instanceof Error ? error.message : String(error)
        });
      }
    })
  );

  logStep("Test files cleanup completed", { count: fileIds.length });
}

/**
 * Helper para obtener información de archivo desde la lista
 *
 * @param filesPage - FilesPage instance
 * @param fileName - Nombre del archivo a buscar
 * @returns Información del archivo o null si no se encuentra
 */
export async function getFileInfoFromList(
  filesPage: FilesPage,
  fileName: string
): Promise<{ fileName: string; rowIndex: number } | null> {
  await filesPage.clickListTab();
  await filesPage.page.waitForTimeout(1000);

  const fileNames = await filesPage.getFileNames();
  const index = fileNames.findIndex((name) => name.includes(fileName));

  if (index >= 0) {
    return {
      fileName: fileNames[index],
      rowIndex: index,
    };
  }

  return null;
}

