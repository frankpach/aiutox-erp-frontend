import { Link } from "react-router";
import { HugeiconsIcon } from "@hugeicons/react";
import { SearchIcon, NotificationIcon } from "@hugeicons/core-free-icons";
import { UserMenu } from "./UserMenu";
import { SidebarToggle } from "./SidebarToggle";

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
}

export function Header({ onSidebarToggle, isSidebarOpen }: HeaderProps) {
  return (
    <header
      className="h-16 border-b border-gray-200 bg-white px-6 flex items-center justify-between shadow-sm"
      role="banner"
    >
      {/* Sección izquierda: Logo y SidebarToggle (móvil) */}
      <div className="flex items-center gap-4">
        <SidebarToggle
          onClick={onSidebarToggle}
          isOpen={isSidebarOpen}
          className="lg:hidden"
        />
        <Link
          to="/"
          className="flex items-center gap-2 focus:outline-none focus:ring-2 focus:ring-[#023E87] focus:ring-offset-2 rounded"
          aria-label="Ir al inicio"
        >
          <span className="text-xl font-bold text-[#023E87]">AiutoX ERP</span>
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
            className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-[#023E87] focus:border-transparent"
            disabled
            aria-label="Buscar"
          />
        </div>
      </div>

      {/* Sección derecha: Notifications y UserMenu */}
      <div className="flex items-center gap-4">
        {/* Notifications placeholder */}
        <button
          className="hidden md:flex relative p-2 rounded-md hover:bg-gray-100 focus:outline-none focus:ring-2 focus:ring-[#023E87] focus:ring-offset-2 transition-colors"
          aria-label="Notificaciones"
          disabled
        >
          <HugeiconsIcon
            icon={NotificationIcon}
            size={20}
            color="#121212"
            strokeWidth={1.5}
          />
          {/* Badge placeholder - se implementará cuando haya notificaciones */}
          {/* <Badge className="absolute -top-1 -right-1 h-5 w-5 p-0 flex items-center justify-center text-xs">
            3
          </Badge> */}
        </button>

        <UserMenu />
      </div>
    </header>
  );
}




