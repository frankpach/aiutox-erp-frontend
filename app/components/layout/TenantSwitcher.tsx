import { useAuthStore } from "~/stores/authStore";
import { Building2, ChevronsUpDown } from "lucide-react";

/**
 * TenantSwitcher - Componente para mostrar y cambiar entre tenants
 *
 * Actualmente muestra el tenant actual del usuario.
 * En el futuro, permitirá cambiar entre múltiples tenants si el usuario
 * tiene acceso a más de uno.
 */
interface TenantSwitcherProps {
  isCollapsed?: boolean;
}

export function TenantSwitcher({ isCollapsed = false }: TenantSwitcherProps) {
  const user = useAuthStore((state) => state.user);

  if (!user) return null;

  // TODO: En el futuro, obtener la lista de tenants del usuario desde el backend
  // const { tenants, loading } = useUserTenants();

  // Por ahora, solo mostramos el tenant actual
  const currentTenant = {
    id: user.tenant_id,
    name: "Mi Organización", // TODO: Obtener nombre real del tenant desde el backend
  };

  if (isCollapsed) {
    return (
      <div
        className="flex items-center justify-center p-2"
        title={currentTenant.name}
      >
        <Building2 className="h-5 w-5 text-[#023E87]" />
      </div>
    );
  }

  return (
    <button
      className="flex items-center gap-2 w-full px-3 py-2 rounded-md transition-all duration-150 ease-[cubic-bezier(0.4,0,0.2,1)] hover:bg-gray-100 focus:outline-none focus:ring-2 focus:ring-[#023E87] focus:ring-offset-2 text-sm"
      aria-label="Cambiar organización"
      title="Cambiar organización"
      // TODO: Implementar funcionalidad de cambio de tenant cuando haya múltiples
      disabled
    >
      <div className="flex items-center justify-center h-8 w-8 rounded-md bg-[#023E87]/10 flex-shrink-0">
        <Building2 className="h-4 w-4 text-[#023E87]" />
      </div>
      <div className="flex flex-col items-start flex-1 min-w-0">
        <span className="text-xs font-semibold text-[#121212] truncate w-full">
          {currentTenant.name}
        </span>
        <span className="text-xs text-gray-500 truncate w-full">
          Tenant actual
        </span>
      </div>
      <ChevronsUpDown className="h-4 w-4 text-gray-400 flex-shrink-0" />
    </button>
  );
}

