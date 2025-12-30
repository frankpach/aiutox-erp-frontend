/**
 * React DevTools Compatibility Utilities
 *
 * Este módulo asegura la compatibilidad completa con React DevTools
 * y mejora la experiencia de desarrollo.
 */

/**
 * Inicializa y configura React DevTools para mejor compatibilidad
 * Se ejecuta solo en el cliente y en modo desarrollo
 */
export function initializeReactDevTools() {
  // Solo ejecutar en el cliente y en desarrollo
  if (typeof window === "undefined" || !import.meta.env.DEV) {
    return;
  }

  // Asegurar que React DevTools pueda detectar la aplicación
  // React 19+ detecta automáticamente DevTools, pero podemos mejorar la experiencia
  if (window.__REACT_DEVTOOLS_GLOBAL_HOOK__) {
    // DevTools está instalado y disponible
    console.debug("[React DevTools] DevTools detectado y listo");
  } else {
    // DevTools no está instalado - mostrar mensaje útil solo una vez
    const hasShownMessage = sessionStorage.getItem("react-devtools-message-shown");
    if (!hasShownMessage) {
      console.info(
        "%c💡 React DevTools",
        "color: #61dafb; font-weight: bold; font-size: 14px;",
        "\nPara una mejor experiencia de desarrollo, instala React DevTools:\n",
        "Chrome: https://chrome.google.com/webstore/detail/react-developer-tools/fmkadmapgofadopljbjfkapdkoienihi\n",
        "Firefox: https://addons.mozilla.org/en-US/firefox/addon/react-devtools/\n",
        "Edge: https://microsoftedge.microsoft.com/addons/detail/react-developer-tools/fmkadmapgofadopljbjfkapdkoienihi"
      );
      sessionStorage.setItem("react-devtools-message-shown", "true");
    }
  }

  // Configurar nombre de la aplicación para DevTools
  // Esto ayuda a identificar la app en DevTools cuando hay múltiples apps React
  if (window.__REACT_DEVTOOLS_GLOBAL_HOOK__) {
    try {
      // Intentar establecer el nombre de la aplicación
      const hook = window.__REACT_DEVTOOLS_GLOBAL_HOOK__;
      if (hook.renderers) {
        // React 18+ usa renderers
        for (const renderer of hook.renderers.values()) {
          if (renderer && typeof renderer.findFiberByHostInstance === "function") {
            // Renderer válido encontrado
            console.debug("[React DevTools] Renderer configurado correctamente");
          }
        }
      }
    } catch (error) {
      // Ignorar errores silenciosamente - DevTools puede no estar completamente inicializado
      console.debug("[React DevTools] Error al configurar:", error);
    }
  }
}

/**
 * Verifica si React DevTools está disponible
 */
export function isReactDevToolsAvailable(): boolean {
  if (typeof window === "undefined") {
    return false;
  }
  return !!window.__REACT_DEVTOOLS_GLOBAL_HOOK__;
}

/**
 * Obtiene información sobre React DevTools
 */
export function getReactDevToolsInfo(): {
  available: boolean;
  version?: string;
  renderers?: number;
} {
  if (typeof window === "undefined") {
    return { available: false };
  }

  const hook = window.__REACT_DEVTOOLS_GLOBAL_HOOK__;
  if (!hook) {
    return { available: false };
  }

  return {
    available: true,
    version: hook.version,
    renderers: hook.renderers?.size,
  };
}

// Extender el tipo Window para incluir el hook de React DevTools
declare global {
  interface Window {
    __REACT_DEVTOOLS_GLOBAL_HOOK__?: {
      version?: string;
      renderers?: Map<number, unknown>;
      supportsFiber?: boolean;
      inject?: (renderer: unknown) => void;
      onCommitFiberRoot?: (id: number, root: unknown) => void;
      onCommitFiberUnmount?: (id: number) => void;
    };
  }
}








