import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Button } from "~/components/ui/button";
import { Badge } from "~/components/ui/badge";
import { Switch } from "~/components/ui/switch";
import { getModules, enableModule, disableModule } from "~/lib/api/modules.api";
import type { ModuleListItem } from "~/lib/modules/types";

export default function ModulesConfigPage() {
  const queryClient = useQueryClient();
  const [filter, setFilter] = useState<"all" | "core" | "business">("all");

  // Fetch modules
  const { data, isLoading, error } = useQuery({
    queryKey: ["config", "modules"],
    queryFn: async () => {
      const response = await getModules();
      return response.data;
    },
  });

  // Enable module mutation
  const enableMutation = useMutation({
    mutationFn: async (moduleId: string) => {
      await enableModule(moduleId);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["config", "modules"] });
    },
  });

  // Disable module mutation
  const disableMutation = useMutation({
    mutationFn: async (moduleId: string) => {
      await disableModule(moduleId);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["config", "modules"] });
    },
  });

  const handleToggleModule = (module: ModuleListItem) => {
    if (module.enabled) {
      disableMutation.mutate(module.id);
    } else {
      enableMutation.mutate(module.id);
    }
  };

  const filteredModules = data?.filter((module: ModuleListItem) => {
    if (filter === "all") return true;
    return module.type === filter;
  });

  const coreModules = filteredModules?.filter((m: ModuleListItem) => m.type === "core") || [];
  const businessModules = filteredModules?.filter((m: ModuleListItem) => m.type === "business") || [];

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-96">
        <p>Cargando módulos...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-red-50 border border-red-200 rounded-md p-4">
        <p className="text-red-800">Error al cargar módulos: {error.toString()}</p>
      </div>
    );
  }

  return (
    <div className="container mx-auto py-6 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Módulos del Sistema</h1>
          <p className="text-muted-foreground mt-1">
            Gestiona los módulos habilitados en tu sistema
          </p>
        </div>
      </div>

      {/* Filter tabs */}
      <div className="flex gap-2">
        <Button
          variant={filter === "all" ? "default" : "outline"}
          onClick={() => setFilter("all")}
        >
          Todos ({data?.length || 0})
        </Button>
        <Button
          variant={filter === "core" ? "default" : "outline"}
          onClick={() => setFilter("core")}
        >
          Core ({coreModules.length})
        </Button>
        <Button
          variant={filter === "business" ? "default" : "outline"}
          onClick={() => setFilter("business")}
        >
          Empresariales ({businessModules.length})
        </Button>
      </div>

      {/* Core Modules */}
      {(filter === "all" || filter === "core") && coreModules.length > 0 && (
        <div className="space-y-4">
          <h2 className="text-xl font-semibold">Módulos Core</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {coreModules.map((module: ModuleListItem) => (
              <ModuleCard
                key={module.id}
                module={module}
                onToggle={handleToggleModule}
                isToggling={
                  enableMutation.isPending || disableMutation.isPending
                }
              />
            ))}
          </div>
        </div>
      )}

      {/* Business Modules */}
      {(filter === "all" || filter === "business") && businessModules.length > 0 && (
        <div className="space-y-4">
          <h2 className="text-xl font-semibold">Módulos Empresariales</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {businessModules.map((module: ModuleListItem) => (
              <ModuleCard
                key={module.id}
                module={module}
                onToggle={handleToggleModule}
                isToggling={
                  enableMutation.isPending || disableMutation.isPending
                }
              />
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

function ModuleCard({
  module,
  onToggle,
  isToggling,
}: {
  module: ModuleListItem;
  onToggle: (module: ModuleListItem) => void;
  isToggling: boolean;
}) {
  const isCritical = ["auth", "users"].includes(module.id);

  return (
    <div className="bg-white border border-gray-200 rounded-lg p-6 shadow-sm hover:shadow-md transition-shadow">
      <div className="flex items-start justify-between">
        <div className="flex-1">
          <div className="flex items-center gap-2 mb-2">
            <h3 className="text-lg font-semibold">{module.name}</h3>
            <Badge variant={module.type === "core" ? "default" : "secondary"}>
              {module.type === "core" ? "Core" : "Empresarial"}
            </Badge>
            {module.enabled && (
              <Badge variant="outline" className="bg-green-50 text-green-700 border-green-200">
                Activo
              </Badge>
            )}
            {isCritical && (
              <Badge variant="outline" className="bg-yellow-50 text-yellow-700 border-yellow-200">
                Crítico
              </Badge>
            )}
          </div>
          <p className="text-sm text-gray-600 mb-3">{module.description}</p>
          {module.dependencies && module.dependencies.length > 0 && (
            <div className="text-xs text-gray-500">
              <span className="font-medium">Dependencias:</span>{" "}
              {module.dependencies.join(", ")}
            </div>
          )}
        </div>
        <div className="ml-4">
          <Switch
            checked={module.enabled}
            onCheckedChange={() => onToggle(module)}
            disabled={isToggling || isCritical}
            title={
              isCritical
                ? "Los módulos críticos no pueden ser deshabilitados"
                : module.enabled
                ? "Deshabilitar módulo"
                : "Habilitar módulo"
            }
          />
        </div>
      </div>
    </div>
  );
}

