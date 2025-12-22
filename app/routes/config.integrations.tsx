import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Button } from "~/components/ui/button";
import { Input } from "~/components/ui/input";
import { Label } from "~/components/ui/label";
import { Badge } from "~/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "~/components/ui/tabs";
import {
  listIntegrations,
  activateIntegration,
  deactivateIntegration,
  deleteIntegration,
  testIntegration,
  type Integration,
  type IntegrationActivateRequest,
} from "~/lib/api/integrations.api";

// Available integration types
const AVAILABLE_INTEGRATIONS = [
  {
    type: "stripe",
    name: "Stripe",
    description: "Procesamiento de pagos con Stripe",
    icon: "💳",
  },
  {
    type: "twilio",
    name: "Twilio",
    description: "Envío de SMS y notificaciones",
    icon: "📱",
  },
  {
    type: "google_calendar",
    name: "Google Calendar",
    description: "Sincronización con Google Calendar",
    icon: "📅",
  },
  {
    type: "slack",
    name: "Slack",
    description: "Notificaciones a canales de Slack",
    icon: "💬",
  },
  {
    type: "zapier",
    name: "Zapier",
    description: "Automatización con Zapier",
    icon: "⚡",
  },
  {
    type: "webhook",
    name: "Webhook Personalizado",
    description: "Webhook personalizado para eventos",
    icon: "🔗",
  },
];

export default function IntegrationsConfigPage() {
  const queryClient = useQueryClient();
  const [selectedIntegration, setSelectedIntegration] = useState<Integration | null>(null);
  const [showActivateForm, setShowActivateForm] = useState(false);
  const [configData, setConfigData] = useState<Record<string, string>>({});

  // Fetch integrations
  const { data, isLoading, error } = useQuery({
    queryKey: ["integrations"],
    queryFn: async () => {
      const response = await listIntegrations();
      return response.data;
    },
  });

  // Mutations
  const activateMutation = useMutation({
    mutationFn: async ({ id, config }: { id: string; config: Record<string, unknown> }) => {
      return await activateIntegration(id, { config });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["integrations"] });
      setShowActivateForm(false);
      setSelectedIntegration(null);
      setConfigData({});
    },
  });

  const deactivateMutation = useMutation({
    mutationFn: async (id: string) => {
      return await deactivateIntegration(id);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["integrations"] });
    },
  });

  const deleteMutation = useMutation({
    mutationFn: async (id: string) => {
      return await deleteIntegration(id);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["integrations"] });
    },
  });

  const testMutation = useMutation({
    mutationFn: async (id: string) => {
      return await testIntegration(id);
    },
  });

  const handleActivate = (integrationType: string) => {
    const integration = data?.find((i) => i.type === integrationType);
    if (integration) {
      setSelectedIntegration(integration);
      setShowActivateForm(true);
    } else {
      // Create new integration
      setSelectedIntegration({
        id: "",
        tenant_id: "",
        name: AVAILABLE_INTEGRATIONS.find((a) => a.type === integrationType)?.name || integrationType,
        type: integrationType,
        status: "inactive",
        config: {},
        last_sync_at: null,
        error_message: null,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      });
      setShowActivateForm(true);
    }
  };

  const handleSubmitActivate = () => {
    if (!selectedIntegration) return;
    activateMutation.mutate({
      id: selectedIntegration.id,
      config: configData as Record<string, unknown>,
    });
  };

  const getStatusBadge = (status: string) => {
    const statusColors: Record<string, string> = {
      active: "bg-green-100 text-green-800 border-green-200",
      inactive: "bg-gray-100 text-gray-800 border-gray-200",
      error: "bg-red-100 text-red-800 border-red-200",
      pending: "bg-yellow-100 text-yellow-800 border-yellow-200",
    };
    return (
      <Badge variant="outline" className={statusColors[status] || statusColors.inactive}>
        {status === "active" ? "Activa" : status === "error" ? "Error" : status === "pending" ? "Pendiente" : "Inactiva"}
      </Badge>
    );
  };

  const getConfigFields = (type: string): Array<{ key: string; label: string; type: string; placeholder?: string }> => {
    const fields: Record<string, Array<{ key: string; label: string; type: string; placeholder?: string }>> = {
      stripe: [
        { key: "api_key", label: "API Key", type: "password", placeholder: "sk_live_..." },
        { key: "webhook_secret", label: "Webhook Secret", type: "password", placeholder: "whsec_..." },
      ],
      twilio: [
        { key: "account_sid", label: "Account SID", type: "text", placeholder: "AC..." },
        { key: "auth_token", label: "Auth Token", type: "password", placeholder: "..." },
        { key: "from_number", label: "From Number", type: "text", placeholder: "+1234567890" },
      ],
      google_calendar: [
        { key: "client_id", label: "Client ID", type: "text", placeholder: "..." },
        { key: "client_secret", label: "Client Secret", type: "password", placeholder: "..." },
      ],
      slack: [
        { key: "webhook_url", label: "Webhook URL", type: "url", placeholder: "https://hooks.slack.com/..." },
      ],
      zapier: [
        { key: "api_key", label: "API Key", type: "password", placeholder: "..." },
      ],
      webhook: [
        { key: "url", label: "Webhook URL", type: "url", placeholder: "https://api.example.com/webhook" },
        { key: "secret", label: "Secret (Opcional)", type: "password", placeholder: "..." },
      ],
    };
    return fields[type] || [];
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-96">
        <p>Cargando integraciones...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-red-50 border border-red-200 rounded-md p-4">
        <p className="text-red-800">
          Error al cargar integraciones: {error instanceof Error ? error.message : "Error desconocido"}
        </p>
      </div>
    );
  }

  const configuredIntegrations = data || [];
  const availableTypes = AVAILABLE_INTEGRATIONS.map((a) => a.type);
  const configuredTypes = configuredIntegrations.map((i) => i.type);

  return (
    <div className="container mx-auto py-6 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Integraciones</h1>
          <p className="text-muted-foreground mt-1">
            Conecta AiutoX con servicios externos
          </p>
        </div>
      </div>

      {showActivateForm && selectedIntegration && (
        <div className="bg-white border border-gray-200 rounded-lg p-6 space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-xl font-semibold">
              Configurar {selectedIntegration.name || AVAILABLE_INTEGRATIONS.find((a) => a.type === selectedIntegration.type)?.name}
            </h2>
            <Button variant="outline" onClick={() => {
              setShowActivateForm(false);
              setSelectedIntegration(null);
              setConfigData({});
            }}>
              Cancelar
            </Button>
          </div>
          <div className="space-y-4">
            {getConfigFields(selectedIntegration.type).map((field) => (
              <div key={field.key} className="space-y-2">
                <Label htmlFor={field.key}>{field.label}</Label>
                <Input
                  id={field.key}
                  type={field.type}
                  placeholder={field.placeholder}
                  value={configData[field.key] || ""}
                  onChange={(e) =>
                    setConfigData({ ...configData, [field.key]: e.target.value })
                  }
                />
              </div>
            ))}
            <div className="flex gap-2">
              <Button
                onClick={handleSubmitActivate}
                disabled={activateMutation.isPending}
              >
                {activateMutation.isPending ? "Activando..." : "Activar Integración"}
              </Button>
            </div>
            {activateMutation.isError && (
              <div className="bg-red-50 border border-red-200 rounded p-3">
                <p className="text-sm text-red-800">
                  Error: {activateMutation.error instanceof Error ? activateMutation.error.message : "Error desconocido"}
                </p>
              </div>
            )}
            {activateMutation.isSuccess && (
              <div className="bg-green-50 border border-green-200 rounded p-3">
                <p className="text-sm text-green-800">✅ Integración activada exitosamente</p>
              </div>
            )}
          </div>
        </div>
      )}

      <Tabs defaultValue="configured" className="w-full">
        <TabsList>
          <TabsTrigger value="configured">Configuradas ({configuredIntegrations.length})</TabsTrigger>
          <TabsTrigger value="available">Disponibles</TabsTrigger>
        </TabsList>

        <TabsContent value="configured" className="space-y-4">
          {configuredIntegrations.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {configuredIntegrations.map((integration) => {
                const integrationInfo = AVAILABLE_INTEGRATIONS.find((a) => a.type === integration.type);
                return (
                  <div
                    key={integration.id}
                    className="bg-white border border-gray-200 rounded-lg p-6 hover:shadow-md transition-shadow"
                  >
                    <div className="flex items-start justify-between mb-3">
                      <div>
                        <h3 className="text-lg font-semibold">
                          {integrationInfo?.icon} {integration.name}
                        </h3>
                        <div className="mt-2">{getStatusBadge(integration.status)}</div>
                      </div>
                      <Badge variant="outline">{integration.type}</Badge>
                    </div>
                    <p className="text-sm text-gray-600 mb-4">
                      {integrationInfo?.description || integration.type}
                    </p>
                    {integration.error_message && (
                      <div className="bg-red-50 border border-red-200 rounded p-2 mb-4">
                        <p className="text-xs text-red-800">{integration.error_message}</p>
                      </div>
                    )}
                    {integration.last_sync_at && (
                      <p className="text-xs text-gray-500 mb-4">
                        Última sincronización: {new Date(integration.last_sync_at).toLocaleString()}
                      </p>
                    )}
                    <div className="flex gap-2">
                      {integration.status === "active" ? (
                        <>
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => {
                              setSelectedIntegration(integration);
                              setShowActivateForm(true);
                              setConfigData(integration.config as Record<string, string>);
                            }}
                          >
                            Configurar
                          </Button>
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => testMutation.mutate(integration.id)}
                            disabled={testMutation.isPending}
                          >
                            {testMutation.isPending ? "Probando..." : "Probar"}
                          </Button>
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => deactivateMutation.mutate(integration.id)}
                            disabled={deactivateMutation.isPending}
                          >
                            Desactivar
                          </Button>
                        </>
                      ) : (
                        <Button
                          size="sm"
                          onClick={() => handleActivate(integration.type)}
                          className="w-full"
                        >
                          Activar
                        </Button>
                      )}
                      <Button
                        variant="outline"
                        size="sm"
                        className="text-red-600"
                        onClick={() => {
                          if (confirm("¿Estás seguro de eliminar esta integración?")) {
                            deleteMutation.mutate(integration.id);
                          }
                        }}
                        disabled={deleteMutation.isPending}
                      >
                        Eliminar
                      </Button>
                    </div>
                    {testMutation.isSuccess && testMutation.data?.data && (
                      <div className="mt-2 bg-green-50 border border-green-200 rounded p-2">
                        <p className="text-xs text-green-800">
                          ✅ {testMutation.data.data.message}
                        </p>
                      </div>
                    )}
                    {testMutation.isError && (
                      <div className="mt-2 bg-red-50 border border-red-200 rounded p-2">
                        <p className="text-xs text-red-800">
                          Error: {testMutation.error instanceof Error ? testMutation.error.message : "Error desconocido"}
                        </p>
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          ) : (
            <div className="bg-white border border-gray-200 rounded-lg p-6 text-center">
              <p className="text-gray-500">No hay integraciones configuradas</p>
            </div>
          )}
        </TabsContent>

        <TabsContent value="available" className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {AVAILABLE_INTEGRATIONS.map((integration) => {
              const isConfigured = configuredTypes.includes(integration.type);
              const configuredIntegration = configuredIntegrations.find((i) => i.type === integration.type);
              return (
                <div
                  key={integration.type}
                  className="bg-white border border-gray-200 rounded-lg p-6 hover:shadow-md transition-shadow"
                >
                  <div className="flex items-start justify-between mb-3">
                    <div>
                      <h3 className="text-lg font-semibold">
                        {integration.icon} {integration.name}
                      </h3>
                      {isConfigured && configuredIntegration && (
                        <div className="mt-2">{getStatusBadge(configuredIntegration.status)}</div>
                      )}
                    </div>
                    <Badge variant="outline">{integration.type}</Badge>
                  </div>
                  <p className="text-sm text-gray-600 mb-4">{integration.description}</p>
                  <Button
                    variant={isConfigured ? "outline" : "default"}
                    className="w-full"
                    onClick={() => {
                      if (isConfigured && configuredIntegration) {
                        setSelectedIntegration(configuredIntegration);
                        setShowActivateForm(true);
                        setConfigData(configuredIntegration.config as Record<string, string>);
                      } else {
                        handleActivate(integration.type);
                      }
                    }}
                  >
                    {isConfigured ? "Configurar" : "Activar"}
                  </Button>
                </div>
              );
            })}
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
}
