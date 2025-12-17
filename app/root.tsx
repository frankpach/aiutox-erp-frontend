import {
  isRouteErrorResponse,
  Links,
  Meta,
  Outlet,
  Scripts,
  ScrollRestoration,
} from "react-router";

import type { Route } from "./+types/root";
import "./app.css";
import { ErrorPage } from "~/components/public/ErrorPage";
import NotFoundPage from "~/routes/not-found";
import UnauthorizedPage from "~/routes/unauthorized";

export const links: Route.LinksFunction = () => [
  { rel: "preconnect", href: "https://fonts.googleapis.com" },
  {
    rel: "preconnect",
    href: "https://fonts.gstatic.com",
    crossOrigin: "anonymous",
  },
  {
    rel: "stylesheet",
    href: "https://fonts.googleapis.com/css2?family=Manrope:wght@200..800&display=swap",
  },
  { rel: "icon", href: "/favicon.ico", type: "image/x-icon" },
  { rel: "apple-touch-icon", href: "/logo.png" },
];

export function Layout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <head>
        <meta charSet="utf-8" />
        <meta name="viewport" content="width=device-width, initial-scale=1" />
        <Meta />
        <Links />
      </head>
      <body>
        {children}
        <ScrollRestoration />
        <Scripts />
      </body>
    </html>
  );
}

export default function App() {
  return <Outlet />;
}

export function ErrorBoundary({ error }: Route.ErrorBoundaryProps) {
  if (isRouteErrorResponse(error)) {
    // Handle 404 - redirect to not-found page
    if (error.status === 404) {
      return <NotFoundPage />;
    }

    // Handle 403 - redirect to unauthorized page
    if (error.status === 403) {
      return <UnauthorizedPage />;
    }

    // Other HTTP errors
    const statusText = error.statusText || "Ha ocurrido un error al cargar la página.";
    return (
      <ErrorPage
        code={error.status}
        title="Error"
        message={statusText}
        actionLabel="Recargar Página"
        actionOnClick={() => window.location.reload()}
      />
    );
  }

  // Runtime errors
  const errorMessage =
    error && error instanceof Error
      ? error.message
      : "Ha ocurrido un error inesperado.";

  // Show stack trace only in development
  const stack =
    import.meta.env.DEV && error && error instanceof Error ? error.stack : undefined;

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 px-4 py-12 sm:px-6 lg:px-8">
      <div className="w-full max-w-2xl space-y-6">
        <ErrorPage
          code={500}
          title="Error del Sistema"
          message={errorMessage}
          actionLabel="Recargar Página"
          actionOnClick={() => window.location.reload()}
        />
        {stack && (
          <details className="mt-4">
            <summary className="cursor-pointer text-sm text-[#3C3A47]">
              Detalles técnicos (solo en desarrollo)
            </summary>
            <pre className="mt-2 p-4 bg-gray-100 rounded text-xs overflow-x-auto">
              <code>{stack}</code>
            </pre>
          </details>
        )}
      </div>
    </div>
  );
}
