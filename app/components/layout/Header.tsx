import { memo } from "react";
import { Link } from "react-router";
import { HugeiconsIcon } from "@hugeicons/react";
import { SearchIcon } from "@hugeicons/core-free-icons";
import { MoonIcon, SunIcon } from "lucide-react";
import { UserMenu } from "./UserMenu";
import { SidebarToggle } from "./SidebarToggle";
import { NotificationBell } from "~/components/notifications/NotificationBell";
import { Button } from "~/components/ui/button";
import { useTheme } from "~/providers/ThemeProvider";
import { cn } from "~/lib/utils";

/**
 * Header - Barra superior de la aplicación
 *
 * Contiene:
 * - Logo (izquierda)
 * - Search bar placeholder (centro, opcional)
 * - Notifications placeholder (derecha, opcional)
 * - User menu (derecha)
 */
interface HeaderProps {
  onSidebarToggle?: () => void;
  isSidebarOpen?: boolean;
  isSidebarCollapsed?: boolean;
}

export const Header = memo(function Header({ onSidebarToggle, isSidebarOpen, isSidebarCollapsed }: HeaderProps) {
  const { theme, setTheme, resolvedTheme } = useTheme();

  const toggleTheme = () => {
    if (theme === "light") {
      setTheme("dark");
    } else if (theme === "dark") {
      setTheme("light");
    } else {
      // system - toggle to opposite of current resolved theme
      setTheme(resolvedTheme === "dark" ? "light" : "dark");
    }
  };

  return (
    <header
      className="h-16 flex-shrink-0 bg-background px-6 flex items-center justify-between shadow-[0_1px_3px_rgba(0,0,0,0.05)]"
      role="banner"
    >
      {/* Sección izquierda: Logo y SidebarToggle (móvil) */}
      <div className="flex items-center gap-4">
        <SidebarToggle
          onClick={onSidebarToggle}
          isOpen={isSidebarOpen}
          className="lg:hidden"
        />
        {/* Logo en Header - aparece cuando sidebar está colapsado */}
        <Link
          to="/"
          className={cn(
            "hidden lg:flex items-center gap-2 focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 rounded overflow-hidden",
            "transition-all duration-200 ease-[cubic-bezier(0.4,0,0.2,1)]",
            isSidebarCollapsed
              ? "opacity-100 max-w-[200px] visible"
              : "opacity-0 max-w-0 invisible"
          )}
          aria-label="Ir al inicio"
        >
          <img
            src="/logo-name.png"
            alt="AiutoX ERP"
            className="h-6 object-contain"
          />
        </Link>
        {/* Logo móvil */}
        <Link
          to="/"
          className="lg:hidden flex items-center gap-2 focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 rounded"
          aria-label="Ir al inicio"
        >
          <span className="text-xl font-bold text-primary">AiutoX ERP</span>
        </Link>
      </div>

      {/* Sección centro: Search bar placeholder */}
      <div className="hidden md:flex flex-1 max-w-md mx-8">
        <div className="w-full relative">
          <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
            <HugeiconsIcon
              icon={SearchIcon}
              size={20}
              color="#9CA3AF"
              strokeWidth={1.5}
            />
          </div>
          <input
            type="text"
            placeholder="Buscar..."
            className="w-full pl-10 pr-4 py-2 border border-input/50 bg-muted/30 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-ring focus:border-transparent focus:bg-background transition-colors"
            disabled
            aria-label="Buscar"
          />
        </div>
      </div>

      {/* Sección derecha: Theme Toggle, Notifications y UserMenu */}
      <div className="flex items-center gap-4">
        {/* Theme Toggle */}
        <Button
          variant="ghost"
          size="icon"
          onClick={toggleTheme}
          aria-label={resolvedTheme === "dark" ? "Cambiar a tema claro" : "Cambiar a tema oscuro"}
          className="hidden md:flex"
        >
          {resolvedTheme === "dark" ? (
            <SunIcon className="h-5 w-5" />
          ) : (
            <MoonIcon className="h-5 w-5" />
          )}
        </Button>

        {/* Notifications */}
        <div className="hidden md:block">
          <NotificationBell />
        </div>

        <UserMenu />
      </div>
    </header>
  );
});










