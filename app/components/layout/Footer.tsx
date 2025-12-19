/**
 * Footer - Pie de página de la aplicación
 *
 * Muestra copyright y versión de la aplicación.
 */

export function Footer() {
  const currentYear = new Date().getFullYear();
  const version = "1.0.0"; // TODO: Leer desde package.json o variable de entorno

  return (
    <footer
      className="h-12 border-t border-gray-200 bg-gray-50 flex items-center justify-center"
      role="contentinfo"
    >
      <div className="text-sm text-gray-600">
        © {currentYear} AiutoX ERP | v{version}
      </div>
    </footer>
  );
}




