/**
 * Footer - Pie de página de la aplicación
 *
 * Muestra copyright y versión de la aplicación.
 */

export function Footer() {
  const currentYear = new Date().getFullYear();
  const version = "0.0.126";

  return (
    <footer
      className="h-12 bg-gray-50 flex items-center justify-center shadow-[0_-2px_8px_rgba(0,0,0,0.05)]"
      role="contentinfo"
    >
      <div className="text-sm text-gray-600">
        © {currentYear} AiutoX ERP | v{version}
      </div>
    </footer>
  );
}











