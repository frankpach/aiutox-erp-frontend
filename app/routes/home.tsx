import type { Route } from "./+types/home";
import { Navigate } from "react-router";

export function meta(_args: Route.MetaArgs) {
  return [
    { title: "AiutoX ERP" },
    { name: "description", content: "Sistema ERP AiutoX" },
  ];
}

/**
 * Root route redirects to /login
 * This is a temporary redirect until we implement the main dashboard
 */
export default function Home() {
  return <Navigate to="/login" replace />;
}
