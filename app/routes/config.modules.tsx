/**
 * Modules Configuration Page
 *
 * Manage enabled/disabled modules in the system
 * Uses ConfigPageLayout and shared components for visual consistency
 */

import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useTranslation } from "~/lib/i18n/useTranslation";
import { showToast } from "~/components/common/Toast";
import { getModules, enableModule, disableModule } from "~/lib/api/modules.api";
import type { ModuleListItem } from "~/lib/modules/types";
import { ConfigPageLayout } from "~/components/config/ConfigPageLayout";
import { ConfigLoadingState } from "~/components/config/ConfigLoadingState";
import { ConfigErrorState } from "~/components/config/ConfigErrorState";
import { ConfigEmptyState } from "~/components/config/ConfigEmptyState";
import { Card, CardContent } from "~/components/ui/card";
import { Badge } from "~/components/ui/badge";
import { Switch } from "~/components/ui/switch";
import { Label } from "~/components/ui/label";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "~/components/ui/tabs";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "~/components/ui/tooltip";
import { AlertTriangle } from "lucide-react";

type FilterType = "all" | "core" | "business";

export function meta() {
  // Note: meta() runs at build time, so we can't use useTranslation() here
  // These are SEO meta tags and will be overridden by the page title/description
  return [
    { title: "Módulos del Sistema - AiutoX ERP" },
    { name: "description", content: "Gestiona los módulos habilitados en tu sistema" },
  ];
}

export default function ModulesConfigPage() {
  const { t } = useTranslation();
  const queryClient = useQueryClient();
  const [filter, setFilter] = useState<FilterType>("all");

  const { data, isLoading, error } = useQuery({
    queryKey: ["modules"],
    queryFn: getModules,
  });

  const enableMutation = useMutation({
    mutationFn: enableModule,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["modules"] });
      showToast(t("config.modules.enableSuccess"), "success");
    },
    onError: (err) => {
      showToast(
        err instanceof Error ? err.message : t("config.modules.errorEnabling"),
        "error"
      );
    },
  });

  const disableMutation = useMutation({
    mutationFn: disableModule,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["modules"] });
      showToast(t("config.modules.disableSuccess"), "success");
    },
    onError: (err) => {
      showToast(
        err instanceof Error ? err.message : t("config.modules.errorDisabling"),
        "error"
      );
    },
  });

  const handleToggle = (module: ModuleListItem) => {
    const isCritical = module.id === "auth" || module.id === "users";

    if (isCritical && module.enabled) {
      showToast(t("config.modules.tooltipCritical"), "error");
      return;
    }

    if (module.enabled) {
      disableMutation.mutate(module.id);
    } else {
      enableMutation.mutate(module.id);
    }
  };

  if (isLoading) {
    return (
      <ConfigPageLayout
        title={t("config.modules.title")}
        description={t("config.modules.description")}
        loading={true}
      >
        <ConfigLoadingState lines={6} />
      </ConfigPageLayout>
    );
  }

  if (error) {
    return (
      <ConfigPageLayout
        title={t("config.modules.title")}
        description={t("config.modules.description")}
        error={error instanceof Error ? error : String(error)}
      >
        <ConfigErrorState
          message={t("config.modules.errorLoading")}
        />
      </ConfigPageLayout>
    );
  }

  const modules = data?.data || [];
  const coreModules = modules.filter((m) => m.type === "core");
  const businessModules = modules.filter((m) => m.type === "business");

  const filteredModules =
    filter === "all"
      ? modules
      : filter === "core"
      ? coreModules
      : businessModules;

  const renderModuleCard = (module: ModuleListItem) => {
    const isCritical = module.id === "auth" || module.id === "users";
    const isPending = enableMutation.isPending || disableMutation.isPending;

    return (
      <Card key={module.id} className="hover:shadow-md transition-shadow">
        <CardContent className="p-4">
          <div className="flex items-start justify-between gap-4">
            <div className="flex-1 space-y-2">
              <div className="flex items-center gap-2 flex-wrap">
                <h4 className="font-semibold text-base">{module.name}</h4>
                <Badge variant={module.type === "core" ? "default" : "secondary"}>
                  {module.type === "core" ? t("config.modules.badgeCore") : t("config.modules.badgeBusiness")}
                </Badge>
                {module.enabled && (
                  <Badge variant="outline" className="bg-green-50 text-green-700 border-green-200">
                    {t("config.modules.badgeActive")}
                  </Badge>
                )}
                {isCritical && (
                  <TooltipProvider>
                    <Tooltip>
                      <TooltipTrigger asChild>
                        <Badge variant="destructive" className="cursor-help">
                          <AlertTriangle size={14} className="mr-1" />
                          {t("config.modules.badgeCritical")}
                        </Badge>
                      </TooltipTrigger>
                      <TooltipContent>
                        <p>{t("config.modules.tooltipCritical")}</p>
                      </TooltipContent>
                    </Tooltip>
                  </TooltipProvider>
                )}
              </div>
              {module.description && (
                <p className="text-sm text-muted-foreground">{module.description}</p>
              )}
              {module.dependencies && module.dependencies.length > 0 && (
                <div className="text-xs text-muted-foreground">
                  <span className="font-medium">{t("config.modules.dependencies")}:</span>{" "}
                  {module.dependencies.join(", ")}
                </div>
              )}
            </div>
            <div className="flex items-center gap-2">
              <Switch
                checked={module.enabled}
                onCheckedChange={() => handleToggle(module)}
                disabled={isCritical || isPending}
                aria-label={`${module.enabled ? t("config.modules.tooltipDisable") : t("config.modules.tooltipEnable")} ${module.name}`}
              />
            </div>
          </div>
        </CardContent>
      </Card>
    );
  };

  return (
    <ConfigPageLayout
      title={t("config.modules.title")}
      description={t("config.modules.description")}
    >
      <div className="space-y-6">
        {/* Filtros con Tabs */}
        <Tabs value={filter} onValueChange={(value) => setFilter(value as FilterType)}>
          <TabsList>
            <TabsTrigger value="all">{t("config.modules.filterAll")} ({modules.length})</TabsTrigger>
            <TabsTrigger value="core">{t("config.modules.filterCore")} ({coreModules.length})</TabsTrigger>
            <TabsTrigger value="business">{t("config.modules.filterBusiness")} ({businessModules.length})</TabsTrigger>
          </TabsList>
        </Tabs>

        {/* Lista de módulos Core */}
        {(filter === "all" || filter === "core") && coreModules.length > 0 && (
          <div className="space-y-4">
            <div className="flex items-center gap-2">
              <h3 className="text-xl font-semibold">{t("config.modules.sectionCore")}</h3>
              <Badge variant="default">{coreModules.length}</Badge>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {coreModules.map(renderModuleCard)}
            </div>
          </div>
        )}

        {/* Lista de módulos Empresariales */}
        {(filter === "all" || filter === "business") && businessModules.length > 0 && (
          <div className="space-y-4">
            <div className="flex items-center gap-2">
              <h3 className="text-xl font-semibold">{t("config.modules.sectionBusiness")}</h3>
              <Badge variant="secondary">{businessModules.length}</Badge>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {businessModules.map(renderModuleCard)}
            </div>
          </div>
        )}

        {/* Estado vacío */}
        {filteredModules.length === 0 && (
          <ConfigEmptyState
            title={t("config.common.noData")}
            description={t("config.common.noData")}
          />
        )}
      </div>
    </ConfigPageLayout>
  );
}
