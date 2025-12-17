/**
 * Users Route
 * Main page for user management with SavedFilters integration.
 */

import type { Route } from "./+types/users";
import { UsersList } from "../features/users/components/UsersList";

export function meta(_args: Route.MetaArgs) {
  return [
    { title: "Usuarios - AiutoX ERP" },
    { name: "description", content: "Gestión de usuarios del sistema" },
  ];
}

export default function UsersPage() {
  const handleManageFiltersClick = () => {
    // This will open the FilterManagementModal in Phase 4
    // For now, just a placeholder
    console.log("Open filter management");
  };

  return (
    <div className="container mx-auto py-6">
      <div className="mb-6">
        <h1 className="text-3xl font-bold">Usuarios</h1>
        <p className="text-muted-foreground">
          Gestiona los usuarios del sistema y aplica filtros personalizados
        </p>
      </div>

      <UsersList onManageFiltersClick={handleManageFiltersClick} />
    </div>
  );
}



