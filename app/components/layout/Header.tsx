import { memo, useState, useEffect } from "react";
import { Link, useNavigate } from "react-router";
import { HugeiconsIcon } from "@hugeicons/react";
import { SearchIcon, Add01Icon } from "@hugeicons/core-free-icons";
import { MoonIcon, SunIcon } from "lucide-react";
import { UserMenu } from "./UserMenu";
import { SidebarToggle } from "./SidebarToggle";
import { NotificationBell } from "~/components/notifications/NotificationBell";
import { Button } from "~/components/ui/button";
import { useTheme } from "~/providers";
import { cn } from "~/lib/utils";
import { useTranslation } from "~/lib/i18n/useTranslation";
import { useQuickActions } from "~/hooks/useQuickActions";
import {
  initializeQuickActions,
  quickActionsRegistry,
} from "~/lib/quickActions/registry";
import { useQuickActionsStore } from "~/stores/quickActionsStore";
import { TaskQuickAdd } from "~/features/tasks/components/TaskQuickAdd";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "~/components/ui/dropdown-menu";

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

export const Header = memo(function Header({
  onSidebarToggle,
  isSidebarOpen,
  isSidebarCollapsed,
}: HeaderProps) {
  const { theme, setTheme, resolvedTheme } = useTheme();
  const { t } = useTranslation();
  const navigate = useNavigate();
  const [searchQuery, setSearchQuery] = useState("");
  const quickActions = useQuickActions();
  const [isTaskQuickAddOpen, setIsTaskQuickAddOpen] = useState(false);

  // Inicializar acciones rápidas del sistema (solo una vez)
  useEffect(() => {
    initializeQuickActions();

    // También inicializar en el store de Zustand
    const { initializeActions } = useQuickActionsStore.getState();
    const allActions = quickActionsRegistry.getAll();
    if (allActions.length > 0) {
      initializeActions(allActions);
    }
  }, []);

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

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      navigate(`/search?q=${encodeURIComponent(searchQuery.trim())}`);
    }
  };

  const handleQuickActionClick = (action: any) => {
    if (action.id === "new-task") {
      setIsTaskQuickAddOpen(true);
    } else {
      navigate(action.route);
    }
  };

  return (
    <header
      style={{ ["--foreground" as any]: "var(--navbar-text)" }}
      className="h-16 flex-shrink-0 bg-[hsl(var(--navbar-bg))] text-[hsl(var(--navbar-text))] px-6 flex items-center justify-between shadow-[0_1px_3px_rgba(0,0,0,0.05)]"
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
          aria-label={t("layout.header.goHome")}
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
          aria-label={t("layout.header.goHome")}
        >
          <span className="text-xl font-bold text-primary">AiutoX ERP</span>
        </Link>
      </div>

      {/* Sección centro: Search bar activada */}
      <div className="hidden md:flex flex-1 max-w-md mx-8">
        <form onSubmit={handleSearch} className="w-full relative">
          <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
            <HugeiconsIcon
              icon={SearchIcon}
              size={20}
              color="hsl(var(--muted-foreground))"
              strokeWidth={1.5}
            />
          </div>
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder={t("layout.header.searchPlaceholder")}
            className="w-full pl-10 pr-4 py-2 border border-input/50 bg-muted/30 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-ring focus:border-transparent focus:bg-background transition-colors"
            aria-label={t("layout.header.searchAria")}
          />
        </form>
      </div>

      {/* Sección derecha: Quick Actions, Theme Toggle, Notifications y UserMenu */}
      <div className="flex items-center gap-4">
        {/* Quick Actions Button (Desktop) */}
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button
              variant="ghost"
              size="icon"
              className="hidden md:flex hover:bg-[hsl(var(--accent))] hover:text-[hsl(var(--accent-foreground))]"
              aria-label={t("layout.header.quickActions")}
            >
              <HugeiconsIcon icon={Add01Icon} size={20} />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end">
            {/* Other Quick Actions */}
            {quickActions.map((action) => (
              <DropdownMenuItem
                key={action.id}
                onClick={() => handleQuickActionClick(action)}
              >
                {action.icon &&
                typeof action.icon === "function" &&
                action.icon() !== null ? (
                  <HugeiconsIcon
                    icon={action.icon()}
                    size={16}
                    className="mr-2"
                  />
                ) : (
                  <div className="w-4 h-4 mr-2 flex items-center justify-center">
                    <div className="w-2 h-2 bg-gray-400 rounded-full" />
                  </div>
                )}
                {t(action.label as any)}
              </DropdownMenuItem>
            ))}
            {quickActions.length === 0 && (
              <div style={{ padding: "8px", fontSize: "12px", color: "#999" }}>
                No hay acciones disponibles
              </div>
            )}
          </DropdownMenuContent>
        </DropdownMenu>

        {/* TaskQuickAdd Modal (controlled) */}
        <TaskQuickAdd
          open={isTaskQuickAddOpen}
          onOpenChange={setIsTaskQuickAddOpen}
          onTaskCreated={() => setIsTaskQuickAddOpen(false)}
        />

        {/* Quick Add Task Button (Mobile - Floating) */}
        <div className="md:hidden">
          <TaskQuickAdd onTaskCreated={() => {}} />
        </div>

        {/* Theme Toggle */}
        <Button
          variant="ghost"
          size="icon"
          onClick={toggleTheme}
          aria-label={
            resolvedTheme === "dark"
              ? t("layout.header.themeToLight")
              : t("layout.header.themeToDark")
          }
          className="hidden md:flex hover:bg-[hsl(var(--accent))] hover:text-[hsl(var(--accent-foreground))]"
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
