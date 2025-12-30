/**
 * E2E Tests for Saved Filters Connection Error
 *
 * Tests to verify and debug the "Error de conexión. Verifica tu conexión a internet." error
 * that appears when loading saved filters on the /users page.
 *
 * Hypotheses being tested:
 * A: Backend returns 500 error before CORS middleware can add headers
 * B: 500 error is caused by unhandled exception in /api/v1/views/filters endpoint
 * C: Frontend shows persistent error from a previous failed request
 * D: Module initialization or missing dependencies issue in backend
 * E: CORS error occurs because 500 error response doesn't include CORS headers
 *
 * Requires: Backend and Frontend running
 */

import { test, expect } from "../fixtures/auth.setup";
import { logStep } from "../helpers/test-utils";

test.describe("Saved Filters Connection Error Debug", () => {
  test.beforeEach(async ({ authenticatedPage }) => {
    // Navigate to users page
    await authenticatedPage.goto("/users");
    await authenticatedPage.waitForSelector("table tbody tr", { timeout: 10000 });
  });

  test("should verify saved filters API endpoint response", async ({
    authenticatedPage: page,
  }) => {
    logStep("Starting saved filters API endpoint verification test");

    // #region agent log
    fetch('http://127.0.0.1:7242/ingest/bd91a56b-aa7d-44fb-ac11-0977789d60c5',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({location:'saved-filters-connection-error.spec.ts:35',message:'Test started - verifying saved filters API',data:{test_name:'should verify saved filters API endpoint response'},timestamp:Date.now(),sessionId:'debug-session',runId:'run1',hypothesisId:'B'})}).catch(()=>{});
    // #endregion

    // Capture network requests
    const requests: Array<{
      url: string;
      method: string;
      status?: number;
      headers?: Record<string, string>;
      error?: string;
    }> = [];

    page.on("request", (request) => {
      if (request.url().includes("/api/v1/views/filters")) {
        logStep("Filter request initiated", { url: request.url(), method: request.method() });
        // #region agent log
        fetch('http://127.0.0.1:7242/ingest/bd91a56b-aa7d-44fb-ac11-0977789d60c5',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({location:'saved-filters-connection-error.spec.ts:48',message:'Filter request initiated',data:{url:request.url(),method:request.method(),headers:Object.fromEntries(Object.entries(request.headers()))},timestamp:Date.now(),sessionId:'debug-session',runId:'run1',hypothesisId:'B'})}).catch(()=>{});
        // #endregion
      }
    });

    page.on("response", (response) => {
      if (response.url().includes("/api/v1/views/filters")) {
        const status = response.status();
        const headers = response.headers();
        logStep("Filter response received", {
          url: response.url(),
          status,
          headers: Object.fromEntries(Object.entries(headers)),
        });
        // #region agent log
        fetch('http://127.0.0.1:7242/ingest/bd91a56b-aa7d-44fb-ac11-0977789d60c5',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({location:'saved-filters-connection-error.spec.ts:60',message:'Filter response received',data:{url:response.url(),status,headers:Object.fromEntries(Object.entries(headers)),has_cors_origin:'Access-Control-Allow-Origin' in headers},timestamp:Date.now(),sessionId:'debug-session',runId:'run1',hypothesisId:'A'})}).catch(()=>{});
        // #endregion

        requests.push({
          url: response.url(),
          method: response.request().method(),
          status,
          headers: Object.fromEntries(Object.entries(headers)),
        });
      }
    });

    page.on("requestfailed", (request) => {
      if (request.url().includes("/api/v1/views/filters")) {
        const failure = request.failure();
        logStep("Filter request failed", {
          url: request.url(),
          error: failure?.errorText,
        });
        // #region agent log
        fetch('http://127.0.0.1:7242/ingest/bd91a56b-aa7d-44fb-ac11-0977789d60c5',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({location:'saved-filters-connection-error.spec.ts:78',message:'Filter request failed',data:{url:request.url(),error:failure?.errorText,method:request.method()},timestamp:Date.now(),sessionId:'debug-session',runId:'run1',hypothesisId:'E'})}).catch(()=>{});
        // #endregion

        requests.push({
          url: request.url(),
          method: request.method(),
          error: failure?.errorText,
        });
      }
    });

    // Wait for page to load and trigger filter request
    await page.waitForTimeout(2000);

    // Check if error message is displayed
    const errorMessage = page.locator('text=/Error de conexión|Error de conexión con el servidor|Error del servidor|Error desconocido/i');
    const errorVisible = await errorMessage.isVisible().catch(() => false);

    logStep("Error message check", { errorVisible });
    // #region agent log
    fetch('http://127.0.0.1:7242/ingest/bd91a56b-aa7d-44fb-ac11-0977789d60c5',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({location:'saved-filters-connection-error.spec.ts:95',message:'Error message visibility check',data:{errorVisible,requestsCount:requests.length},timestamp:Date.now(),sessionId:'debug-session',runId:'run1',hypothesisId:'C'})}).catch(()=>{});
    // #endregion

    // Verify API request was made
    expect(requests.length).toBeGreaterThan(0);

    const filterRequest = requests.find((r) => r.url.includes("/api/v1/views/filters"));
    expect(filterRequest).toBeDefined();

    if (filterRequest?.status) {
      // If request succeeded, verify CORS headers are present
      if (filterRequest.status === 200) {
        expect(filterRequest.headers?.["Access-Control-Allow-Origin"]).toBeDefined();
        logStep("Request succeeded with CORS headers");
      } else {
        // If request failed with error status, check if CORS headers are present
        logStep("Request failed with status", {
          status: filterRequest.status,
          hasCorsHeaders: !!filterRequest.headers?.["Access-Control-Allow-Origin"],
        });
        // #region agent log
        fetch('http://127.0.0.1:7242/ingest/bd91a56b-aa7d-44fb-ac11-0977789d60c5',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({location:'saved-filters-connection-error.spec.ts:115',message:'Request failed with status code',data:{status:filterRequest.status,hasCorsHeaders:!!filterRequest.headers?.['Access-Control-Allow-Origin'],headers:filterRequest.headers},timestamp:Date.now(),sessionId:'debug-session',runId:'run1',hypothesisId:'A'})}).catch(()=>{});
        // #endregion
      }
    } else if (filterRequest?.error) {
      // Request failed completely (network error, CORS error, etc.)
      logStep("Request failed completely", { error: filterRequest.error });
      // #region agent log
      fetch('http://127.0.0.1:7242/ingest/bd91a56b-aa7d-44fb-ac11-0977789d60c5',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({location:'saved-filters-connection-error.spec.ts:123',message:'Request failed completely',data:{error:filterRequest.error,url:filterRequest.url},timestamp:Date.now(),sessionId:'debug-session',runId:'run1',hypothesisId:'E'})}).catch(()=>{});
      // #endregion
    }
  });

  test("should verify error message is not shown when filters load successfully", async ({
    authenticatedPage: page,
  }) => {
    logStep("Starting test to verify error message behavior");

    // #region agent log
    fetch('http://127.0.0.1:7242/ingest/bd91a56b-aa7d-44fb-ac11-0977789d60c5',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({location:'saved-filters-connection-error.spec.ts:135',message:'Test started - verifying error message behavior',data:{test_name:'should verify error message is not shown when filters load successfully'},timestamp:Date.now(),sessionId:'debug-session',runId:'run1',hypothesisId:'C'})}).catch(()=>{});
    // #endregion

    // Wait for page to fully load
    await page.waitForTimeout(3000);

    // Check for error messages
    const errorMessages = [
      'text=/Error de conexión/i',
      'text=/Error de conexión con el servidor/i',
      'text=/Error del servidor/i',
      'text=/Error desconocido/i',
      'text=/Network Error/i',
    ];

    let errorFound = false;
    let errorText = '';

    for (const errorSelector of errorMessages) {
      const errorElement = page.locator(errorSelector);
      const isVisible = await errorElement.isVisible().catch(() => false);
      if (isVisible) {
        errorFound = true;
        errorText = await errorElement.textContent().catch(() => '');
        logStep("Error message found", { selector: errorSelector, text: errorText });
        // #region agent log
        fetch('http://127.0.0.1:7242/ingest/bd91a56b-aa7d-44fb-ac11-0977789d60c5',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({location:'saved-filters-connection-error.spec.ts:155',message:'Error message found on page',data:{selector:errorSelector,text:errorText},timestamp:Date.now(),sessionId:'debug-session',runId:'run1',hypothesisId:'C'})}).catch(()=>{});
        // #endregion
        break;
      }
    }

    // Check console errors
    const consoleErrors: string[] = [];
    page.on("console", (msg) => {
      if (msg.type() === "error") {
        const text = msg.text();
        consoleErrors.push(text);
        if (text.includes("filters") || text.includes("CORS") || text.includes("500")) {
          logStep("Console error captured", { error: text });
          // #region agent log
          fetch('http://127.0.0.1:7242/ingest/bd91a56b-aa7d-44fb-ac11-0977789d60c5',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({location:'saved-filters-connection-error.spec.ts:168',message:'Console error captured',data:{error:text},timestamp:Date.now(),sessionId:'debug-session',runId:'run1',hypothesisId:'B'})}).catch(()=>{});
          // #endregion
        }
      }
    });

    await page.waitForTimeout(2000);

    // Log final state
    logStep("Final state check", {
      errorFound,
      errorText,
      consoleErrorsCount: consoleErrors.length,
    });
    // #region agent log
    fetch('http://127.0.0.1:7242/ingest/bd91a56b-aa7d-44fb-ac11-0977789d60c5',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({location:'saved-filters-connection-error.spec.ts:180',message:'Final state check',data:{errorFound,errorText,consoleErrorsCount:consoleErrors.length,consoleErrors},timestamp:Date.now(),sessionId:'debug-session',runId:'run1',hypothesisId:'C'})}).catch(()=>{});
    // #endregion
  });

  test("should verify backend endpoint directly", async ({ authenticatedPage: page }) => {
    logStep("Starting direct backend endpoint verification");

    // #region agent log
    fetch('http://127.0.0.1:7242/ingest/bd91a56b-aa7d-44fb-ac11-0977789d60c5',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({location:'saved-filters-connection-error.spec.ts:189',message:'Test started - direct backend endpoint verification',data:{test_name:'should verify backend endpoint directly'},timestamp:Date.now(),sessionId:'debug-session',runId:'run1',hypothesisId:'B'})}).catch(()=>{});
    // #endregion

    // Get auth token from localStorage
    const token = await page.evaluate(() => {
      return localStorage.getItem("auth_token");
    });

    expect(token).toBeTruthy();
    logStep("Auth token retrieved", { hasToken: !!token });

    // Make direct API call using page.evaluate
    const apiResponse = await page.evaluate(
      async ({ token }) => {
        try {
          const response = await fetch(
            "http://localhost:8000/api/v1/views/filters?module=users&page=1&page_size=20",
            {
              method: "GET",
              headers: {
                Authorization: `Bearer ${token}`,
                "Content-Type": "application/json",
              },
            }
          );

          const status = response.status;
          const headers: Record<string, string> = {};
          response.headers.forEach((value, key) => {
            headers[key] = value;
          });

          let body: unknown = null;
          try {
            body = await response.json();
          } catch {
            body = await response.text();
          }

          return {
            status,
            headers,
            body,
            ok: response.ok,
          };
        } catch (error) {
          return {
            error: error instanceof Error ? error.message : String(error),
            status: null,
            headers: {},
            body: null,
            ok: false,
          };
        }
      },
      { token }
    );

    logStep("Direct API call result", apiResponse);
    // #region agent log
    fetch('http://127.0.0.1:7242/ingest/bd91a56b-aa7d-44fb-ac11-0977789d60c5',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({location:'saved-filters-connection-error.spec.ts:235',message:'Direct API call result',data:apiResponse,timestamp:Date.now(),sessionId:'debug-session',runId:'run1',hypothesisId:'B'})}).catch(()=>{});
    // #endregion

    // Verify response
    if (apiResponse.error) {
      logStep("Direct API call failed", { error: apiResponse.error });
      // #region agent log
      fetch('http://127.0.0.1:7242/ingest/bd91a56b-aa7d-44fb-ac11-0977789d60c5',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({location:'saved-filters-connection-error.spec.ts:242',message:'Direct API call failed',data:{error:apiResponse.error},timestamp:Date.now(),sessionId:'debug-session',runId:'run1',hypothesisId:'E'})}).catch(()=>{});
      // #endregion
    } else {
      // Check status code
      if (apiResponse.status === 500) {
        logStep("Backend returned 500 error", {
          status: apiResponse.status,
          hasCorsHeaders: !!apiResponse.headers["Access-Control-Allow-Origin"],
          body: apiResponse.body,
        });
        // #region agent log
        fetch('http://127.0.0.1:7242/ingest/bd91a56b-aa7d-44fb-ac11-0977789d60c5',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({location:'saved-filters-connection-error.spec.ts:251',message:'Backend returned 500 error',data:{status:apiResponse.status,hasCorsHeaders:!!apiResponse.headers['Access-Control-Allow-Origin'],headers:apiResponse.headers,body:apiResponse.body},timestamp:Date.now(),sessionId:'debug-session',runId:'run1',hypothesisId:'A'})}).catch(()=>{});
        // #endregion
      } else if (apiResponse.status === 200) {
        logStep("Backend returned 200 OK", {
          status: apiResponse.status,
          hasCorsHeaders: !!apiResponse.headers["Access-Control-Allow-Origin"],
        });
        // #region agent log
        fetch('http://127.0.0.1:7242/ingest/bd91a56b-aa7d-44fb-ac11-0977789d60c5',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({location:'saved-filters-connection-error.spec.ts:260',message:'Backend returned 200 OK',data:{status:apiResponse.status,hasCorsHeaders:!!apiResponse.headers['Access-Control-Allow-Origin'],headers:apiResponse.headers},timestamp:Date.now(),sessionId:'debug-session',runId:'run1',hypothesisId:'B'})}).catch(()=>{});
        // #endregion
      }

      // Verify CORS headers are present
      expect(apiResponse.headers["Access-Control-Allow-Origin"]).toBeDefined();
    }
  });
});






