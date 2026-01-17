import { useEffect, memo, type ReactNode } from "react";
import { MainContent } from "./MainContent";
import { Footer } from "./Footer";
import { Header } from "./Header";
import { Sidebar } from "./Sidebar";
import { Dialog, DialogContent } from "~/components/ui/dialog";
import { TaskCalendar } from "~/features/tasks/components/TaskCalendar";
import { initializeModules } from "~/stores/modulesStore";
import { useSidebarStore } from "~/stores/sidebarStore";
import { useCalendarModalStore } from "~/stores/calendarModalStore";

/**
 * AppShell - Componente principal del layout
 *
 * Layout tipo AppShell con Header, Sidebar, MainContent y Footer.
 * Maneja el estado del sidebar (abierto/cerrado) y proporciona
 * la estructura base para todas las páginas de la aplicación.
 *
 * Responsive:
 * - Desktop (lg+): Sidebar siempre visible, puede colapsarse
 * - Tablet (md-lg): Sidebar colapsado por defecto
 * - Móvil (< md): Sidebar como drawer (overlay)
 */
interface AppShellProps {
  children: ReactNode;
}

function AppShellComponent({ children }: AppShellProps) {
  const {
    isSidebarOpen,
    isSidebarCollapsed,
    setIsSidebarOpen,
    setIsSidebarCollapsed,
    toggleSidebar,
    toggleCollapse,
  } = useSidebarStore();
  const calendarModal = useCalendarModalStore((state) => state);

  // Initialize modules and encryption secret on mount
  useEffect(() => {
    // Fetch encryption secret first (required for module cache)
    import("~/stores/encryptionStore")
      .then(({ useEncryptionStore }) => {
        useEncryptionStore
          .getState()
          .fetchSecret()
          .catch((error) => {
            console.warn("Failed to fetch encryption secret:", error);
          });
      })
      .catch(() => {
        // Ignore if store not available
      });

    // Then initialize modules
    initializeModules().catch((error) => {
      console.error("Failed to initialize modules:", error);
    });
  }, []);

  // Manejar responsive: sidebar colapsado por defecto en tablet
  useEffect(() => {
    const handleResize = () => {
      if (window.innerWidth >= 1024) {
        // Desktop: sidebar expandido por defecto
        setIsSidebarCollapsed(false);
        setIsSidebarOpen(true);
      } else if (window.innerWidth >= 768) {
        // Tablet: sidebar colapsado
        setIsSidebarCollapsed(true);
        setIsSidebarOpen(true);
      } else {
        // Móvil: sidebar cerrado por defecto
        setIsSidebarOpen(false);
      }
    };

    handleResize(); // Ejecutar al montar
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, [setIsSidebarOpen, setIsSidebarCollapsed]);

  const handleSidebarClose = () => {
    setIsSidebarOpen(false);
  };

  useEffect(() => {
    const handlePopState = () => {
      const state = window.history.state as { calendarModal?: boolean } | null;
      if (!state?.calendarModal && calendarModal.isOpen) {
        calendarModal.close({ updateHistory: false });
      }
    };

    window.addEventListener("popstate", handlePopState);
    return () => window.removeEventListener("popstate", handlePopState);
  }, [calendarModal]);

  return (
    <div className="flex h-screen overflow-hidden">
      <Sidebar
        isOpen={isSidebarOpen}
        onClose={handleSidebarClose}
        isCollapsed={isSidebarCollapsed}
        onToggleCollapse={toggleCollapse}
      />
      <div className="flex flex-col flex-1 overflow-hidden min-h-0">
        <Header
          onSidebarToggle={toggleSidebar}
          isSidebarOpen={isSidebarOpen}
          isSidebarCollapsed={isSidebarCollapsed}
        />
        <MainContent>{children}</MainContent>
        <Footer />
      </div>
      <Dialog
        open={calendarModal.isOpen}
        onOpenChange={(open) => {
          if (!open) {
            calendarModal.close();
          }
        }}
      >
        <DialogContent className="max-w-6xl w-[95vw] h-[90vh] overflow-y-auto">
          <TaskCalendar />
        </DialogContent>
      </Dialog>
    </div>
  );
}

export const AppShell = memo(AppShellComponent);
