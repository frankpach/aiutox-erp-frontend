import { reactRouter } from "@react-router/dev/vite";
import tailwindcss from "@tailwindcss/vite";
import { defineConfig } from "vite";
import tsconfigPaths from "vite-tsconfig-paths";
import { VitePWA } from "vite-plugin-pwa";

export default defineConfig({
  server: {
    host: "127.0.0.1", // Use IPv4 only to avoid ::1 issues
    port: 3000, // Changed port to avoid permission issues
    strictPort: false, // Allow fallback to next available port
  },
  plugins: [
    tailwindcss(),
    reactRouter(),
    tsconfigPaths(),
    VitePWA({
      registerType: "prompt", // Cambiado para notificar al usuario de actualizaciones
      includeAssets: ["favicon.ico", "apple-touch-icon.png", "logo.png"],

      // Usar injectManifest para combinar SW custom con Workbox
      strategies: "injectManifest",
      srcDir: "public",
      filename: "sw-custom.js",

      workbox: {
        // Incluir solo assets estáticos (NO HTML dinámico)
        globPatterns: ["**/*.{js,css,ico,png,svg,woff,woff2}"],

        // NO cachear HTML para evitar problemas con routing SPA
        globIgnores: ["**/node_modules/**", "**/index.html"],

        // CRÍTICO: Manejo de navegación para SPA
        // Todas las rutas de navegación deben servir el index.html
        navigateFallback: "/index.html",
        navigateFallbackDenylist: [
          // NO aplicar fallback a:
          /^\/api\//,           // Llamadas a API
          /^\/auth\//,          // Rutas de auth del backend
          /\.[^/]+$/,          // Archivos con extensión (assets)
        ],

        // Estrategias de runtime caching
        runtimeCaching: [
          // 1. Google Fonts - Cache First (estáticos, nunca cambian)
          {
            urlPattern: /^https:\/\/fonts\.googleapis\.com\/.*/i,
            handler: "CacheFirst",
            options: {
              cacheName: "google-fonts-cache",
              expiration: {
                maxEntries: 10,
                maxAgeSeconds: 60 * 60 * 24 * 365, // 1 año
              },
              cacheableResponse: {
                statuses: [0, 200],
              },
            },
          },
          {
            urlPattern: /^https:\/\/fonts\.gstatic\.com\/.*/i,
            handler: "CacheFirst",
            options: {
              cacheName: "gstatic-fonts-cache",
              expiration: {
                maxEntries: 10,
                maxAgeSeconds: 60 * 60 * 24 * 365,
              },
              cacheableResponse: {
                statuses: [0, 200],
              },
            },
          },

          // 2. API - Network First (siempre intentar red primero)
          // ⚠️ CRÍTICO: NO cachear endpoints de auth
          {
            urlPattern: ({ url }) => {
              // Solo cachear API, EXCEPTO rutas de auth
              const isApi = url.pathname.startsWith("/api/v1/");
              const isAuth = url.pathname.includes("/auth/");
              return isApi && !isAuth;
            },
            handler: "NetworkFirst",
            options: {
              cacheName: "api-cache",
              networkTimeoutSeconds: 10,
              expiration: {
                maxEntries: 50,
                maxAgeSeconds: 60 * 5, // Solo 5 minutos
              },
              cacheableResponse: {
                statuses: [0, 200],
              },
              // Plugin para invalidar cache si hay token expirado
              plugins: [
                {
                  cacheKeyWillBeUsed: async ({ request }) => {
                    // No cachear requests con Authorization header
                    // (cada usuario tiene su propio cache implícitamente)
                    if (request.headers.get("Authorization")) {
                      const url = new URL(request.url);
                      // Agregar un identificador único para evitar conflictos
                      url.searchParams.set("_sw_auth", "1");
                      return url.toString();
                    }
                    return request.url;
                  },
                },
              ],
            },
          },

          // 3. Auth endpoints - NUNCA cachear
          {
            urlPattern: ({ url }) => url.pathname.includes("/auth/"),
            handler: "NetworkOnly", // SIEMPRE red, nunca cache
          },

          // 4. Assets estáticos de la app - Cache First con network fallback
          {
            urlPattern: /\.(?:png|jpg|jpeg|svg|gif|webp|ico)$/i,
            handler: "CacheFirst",
            options: {
              cacheName: "images-cache",
              expiration: {
                maxEntries: 60,
                maxAgeSeconds: 60 * 60 * 24 * 30, // 30 días
              },
            },
          },
        ],

        // Limpiar caches viejos automáticamente
        cleanupOutdatedCaches: true,
      },

      manifest: {
        name: "AiutoX ERP",
        short_name: "AiutoX",
        description: "Sistema ERP modular y extensible para gestión empresarial",
        theme_color: "#3C3A47", // Color primario AiutoX
        background_color: "#ffffff",
        display: "standalone",
        orientation: "portrait",
        scope: "/",
        start_url: "/",
        icons: [
          {
            src: "icon-72x72.png",
            sizes: "72x72",
            type: "image/png",
            purpose: "maskable any",
          },
          {
            src: "icon-96x96.png",
            sizes: "96x96",
            type: "image/png",
            purpose: "maskable any",
          },
          {
            src: "icon-128x128.png",
            sizes: "128x128",
            type: "image/png",
            purpose: "maskable any",
          },
          {
            src: "icon-144x144.png",
            sizes: "144x144",
            type: "image/png",
            purpose: "maskable any",
          },
          {
            src: "icon-152x152.png",
            sizes: "152x152",
            type: "image/png",
            purpose: "maskable any",
          },
          {
            src: "icon-192x192.png",
            sizes: "192x192",
            type: "image/png",
            purpose: "maskable any",
          },
          {
            src: "icon-384x384.png",
            sizes: "384x384",
            type: "image/png",
            purpose: "maskable any",
          },
          {
            src: "icon-512x512.png",
            sizes: "512x512",
            type: "image/png",
            purpose: "maskable any",
          },
        ],
      },

      devOptions: {
        enabled: true, // Habilitar PWA en desarrollo
        type: "module",
      },
    }),
  ],
});
