/**
 * Helper to check if frontend and backend servers are running
 */

import type { Page } from "@playwright/test";

export async function checkFrontendServer(page: Page, baseURL: string): Promise<boolean> {
  try {
    const response = await page.request.get(baseURL, { timeout: 5000 });
    return response.ok();
  } catch {
    return false;
  }
}

export async function checkBackendServer(page: Page, apiURL: string = "http://localhost:8000"): Promise<boolean> {
  try {
    const response = await page.request.get(`${apiURL}/api/v1/health`, { timeout: 5000 });
    return response.ok();
  } catch {
    // Try /docs as fallback
    try {
      const response = await page.request.get(`${apiURL}/docs`, { timeout: 5000 });
      return response.ok();
    } catch {
      return false;
    }
  }
}




