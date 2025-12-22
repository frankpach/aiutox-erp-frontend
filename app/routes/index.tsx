/**
 * Dashboard Page
 * Main dashboard page - accessible to all authenticated users
 * Shows layout with menus but empty content (to be implemented)
 */

import { ProtectedRoute } from "~/components/auth/ProtectedRoute";

export function meta() {
  return [
    { title: "Dashboard - AiutoX ERP" },
    { name: "description", content: "Panel principal de AiutoX ERP" },
  ];
}

export default function DashboardPage() {
  return (
    <ProtectedRoute>
      <div className="container mx-auto py-6">
        {/* Dashboard content will be implemented here */}
        {/* For now, just empty space with layout visible */}
      </div>
    </ProtectedRoute>
  );
}





