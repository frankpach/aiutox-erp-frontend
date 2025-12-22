import type { ReactNode } from "react";

/**
 * MainContent - Contenedor principal del contenido de la aplicación
 *
 * Proporciona un contenedor scrollable con padding y márgenes apropiados
 * para el contenido principal de cada página.
 */
interface MainContentProps {
  children: ReactNode;
}

export function MainContent({ children }: MainContentProps) {
  return (
    <main className="flex-1 overflow-y-auto bg-white" role="main">
      <div className="container mx-auto px-6 py-6">
        {children}
      </div>
    </main>
  );
}










