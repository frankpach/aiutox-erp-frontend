/**
 * Token cache for E2E tests
 * Reuses tokens to avoid rate limiting and improve test performance
 */

let cachedAdminToken: string | null = null;
let cachedAdminTokenExpiry: number = 0;
const TOKEN_CACHE_DURATION = 30 * 60 * 1000; // 30 minutes

/**
 * Get admin token, reusing cached token if available and valid
 */
export async function getCachedAdminToken(): Promise<string> {
  const now = Date.now();

  // Return cached token if still valid
  if (cachedAdminToken && now < cachedAdminTokenExpiry) {
    return cachedAdminToken;
  }

  // Fetch new token
  const API_BASE_URL = process.env.VITE_API_BASE_URL || "http://localhost:8000";
  const response = await fetch(`${API_BASE_URL}/api/v1/auth/login`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      email: "admin@aiutox.com",
      password: "password",
    }),
  });

  if (!response.ok) {
    throw new Error(`Failed to get admin token: ${response.statusText}`);
  }

  const data = await response.json();
  cachedAdminToken = data.data.access_token;
  cachedAdminTokenExpiry = now + TOKEN_CACHE_DURATION;

  return cachedAdminToken!; // Non-null assertion since we just assigned it
}

/**
 * Clear cached token (useful for testing logout scenarios)
 */
export function clearCachedToken(): void {
  cachedAdminToken = null;
  cachedAdminTokenExpiry = 0;
}

/**
 * Set token in localStorage for a Playwright page
 */
export async function setTokenInPage(page: any, token: string): Promise<void> {
  await page.evaluate((t: string) => {
    localStorage.setItem("auth_token", t);
  }, token);
}

/**
 * Login using cached token (faster than full login flow)
 * This function properly authenticates by calling /auth/me and updating the store
 */
export async function loginWithCachedToken(page: any): Promise<void> {
  const token = await getCachedAdminToken();

  // Establecer token en localStorage primero
  await setTokenInPage(page, token);

  // Llamar a /auth/me para obtener datos del usuario
  const API_BASE_URL = process.env.VITE_API_BASE_URL || "http://localhost:8000";
  const meResponse = await fetch(`${API_BASE_URL}/api/v1/auth/me`, {
    headers: { Authorization: `Bearer ${token}` }
  });

  if (!meResponse.ok) {
    throw new Error(`Failed to get user data: ${meResponse.statusText}`);
  }

  const meData = await meResponse.json();
  const userData = meData.data;

  // Actualizar store en el contexto de la página con datos reales
  await page.evaluate(({ token, userData }: { token: string; userData: any }) => {
    // Actualizar localStorage con datos completos del usuario
    localStorage.setItem("auth_token", token);

    // Actualizar el store persistido de Zustand
    const authStorage = {
      state: {
        user: {
          id: userData.id,
          email: userData.email,
          full_name: userData.full_name,
          is_active: true,
          tenant_id: userData.tenant_id,
          roles: userData.roles || [],
          permissions: userData.permissions || [],
        },
        token: token,
        refreshToken: null, // No se guarda refresh token en localStorage
        isAuthenticated: true,
      },
      version: 0,
    };

    localStorage.setItem("auth-storage", JSON.stringify(authStorage));

    // Disparar evento de storage para que Zustand se actualice
    // Nota: storage event solo se dispara en otras pestañas, así que forzamos la actualización
    window.dispatchEvent(new StorageEvent("storage", {
      key: "auth-storage",
      newValue: JSON.stringify(authStorage),
      storageArea: localStorage,
    }));
  }, { token, userData });

  // Forzar sincronización del store después de establecer el token
  await page.evaluate(() => {
    // Llamar al método de sincronización del store
    const authStore = (window as any).__AUTH_STORE__;
    if (authStore && authStore._syncFromLocalStorage) {
      authStore._syncFromLocalStorage();
    }
  }).catch(() => {
    // Ignore if store not available
  });

  // Navegar y esperar a que el estado se sincronice
  await page.goto("/dashboard", { waitUntil: "domcontentloaded" });

  // Esperar a que el store se sincronice verificando isAuthenticated
  await page.waitForFunction(() => {
    const authStorage = localStorage.getItem("auth-storage");
    if (!authStorage) return false;
    try {
      const parsed = JSON.parse(authStorage);
      return parsed.state?.isAuthenticated === true;
    } catch {
      return false;
    }
  }, { timeout: 5000 }).catch(() => {
    // If check fails, wait a bit more
  });

  // Dar tiempo adicional para que la UI se actualice
  await page.waitForTimeout(500);

  // Verificar que estamos autenticados esperando elementos de la UI autenticada
  await page.waitForSelector('aside[role="navigation"], header[role="banner"]', { timeout: 5000 });

  // Verificar que la URL sea correcta (no redirigió a /login)
  const currentUrl = page.url();
  if (currentUrl.includes("/login")) {
    throw new Error("Failed to authenticate: redirected to /login");
  }
}
