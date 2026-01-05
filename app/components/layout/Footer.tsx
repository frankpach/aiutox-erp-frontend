import { memo } from "react";
import { useTranslation } from "~/lib/i18n/useTranslation";

/**
 * Footer - Pie de página de la aplicación
 *
 * Muestra copyright y versión de la aplicación.
 */

export const Footer = memo(function Footer() {
  const currentYear = new Date().getFullYear();
  const version = "0.0.126";
  const { t } = useTranslation();

  const footerText = t("layout.footer.text")
    .replace("{year}", String(currentYear))
    .replace("{version}", version);

  return (
    <footer
      className="h-12 flex-shrink-0 bg-muted/30 flex items-center justify-center shadow-[0_-2px_8px_rgba(0,0,0,0.03)]"
      role="contentinfo"
    >
      <div className="text-sm text-muted-foreground">
        {footerText}
      </div>
    </footer>
  );
});














