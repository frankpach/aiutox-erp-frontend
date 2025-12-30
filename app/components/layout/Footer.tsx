import { memo } from "react";

/**
 * Footer - Pie de página de la aplicación
 *
 * Muestra copyright y versión de la aplicación.
 */

export const Footer = memo(function Footer() {
  const currentYear = new Date().getFullYear();
  const version = "0.0.126";

  return (
    <footer
      className="h-12 flex-shrink-0 bg-muted/30 flex items-center justify-center shadow-[0_-2px_8px_rgba(0,0,0,0.03)]"
      role="contentinfo"
    >
      <div className="text-sm text-muted-foreground">
        © {currentYear} AiutoX ERP | v{version}
      </div>
    </footer>
  );
});















