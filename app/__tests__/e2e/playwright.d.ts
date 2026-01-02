/**
 * Type definitions for Playwright test fixtures
 */

import type { Page, BrowserContext } from "@playwright/test";

declare module "@playwright/test" {
  interface TestFixtures {
    authenticatedPage: Page;
  }
}

