import { useState, useEffect } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Button } from "~/components/ui/button";
import { Switch } from "~/components/ui/switch";
import { Label } from "~/components/ui/label";
import { Input } from "~/components/ui/input";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "~/components/ui/tabs";
import {
  getNotificationChannels,
  updateSMTPConfig,
  updateSMSConfig,
  updateWebhookConfig,
  testSMTPConnection,
  testWebhookConnection,
  type SMTPConfigRequest,
  type SMSConfigRequest,
  type WebhookConfigRequest,
} from "~/lib/api/notifications.api";

export default function NotificationsConfigPage() {
  const queryClient = useQueryClient();
  const [smtpConfig, setSmtpConfig] = useState<SMTPConfigRequest>({
    enabled: false,
    host: "smtp.gmail.com",
    port: 587,
    user: "",
    password: "",
    use_tls: true,
    from_email: "",
    from_name: "",
  });

  const [smsConfig, setSmsConfig] = useState<SMSConfigRequest>({
    enabled: false,
    provider: "twilio",
    account_sid: "",
    auth_token: "",
    from_number: "",
  });

  const [webhookConfig, setWebhookConfig] = useState<WebhookConfigRequest>({
    enabled: false,
    url: "",
    secret: "",
    timeout: 30,
  });

  // Fetch current configuration
  const { data, isLoading, error } = useQuery({
    queryKey: ["notifications", "channels"],
    queryFn: async () => {
      const response = await getNotificationChannels();
      return response.data;
    },
  });

  // Update configs when data loads
  useEffect(() => {
    if (data) {
      setSmtpConfig({
        enabled: data.smtp.enabled,
        host: data.smtp.host,
        port: data.smtp.port,
        user: data.smtp.user,
        password: "", // Never show password
        use_tls: data.smtp.use_tls,
        from_email: data.smtp.from_email,
        from_name: data.smtp.from_name || "",
      });
      setSmsConfig({
        enabled: data.sms.enabled,
        provider: data.sms.provider,
        account_sid: data.sms.account_sid || "",
        auth_token: "", // Never show token
        from_number: data.sms.from_number || "",
      });
      setWebhookConfig({
        enabled: data.webhook.enabled,
        url: data.webhook.url,
        secret: "", // Never show secret
        timeout: data.webhook.timeout,
      });
    }
  }, [data]);

  // Mutations
  const smtpMutation = useMutation({
    mutationFn: updateSMTPConfig,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["notifications", "channels"] });
    },
  });

  const smsMutation = useMutation({
    mutationFn: updateSMSConfig,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["notifications", "channels"] });
    },
  });

  const webhookMutation = useMutation({
    mutationFn: updateWebhookConfig,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["notifications", "channels"] });
    },
  });

  const smtpTestMutation = useMutation({
    mutationFn: testSMTPConnection,
  });

  const webhookTestMutation = useMutation({
    mutationFn: testWebhookConnection,
  });

  const handleSaveSMTP = () => {
    smtpMutation.mutate(smtpConfig);
  };

  const handleSaveSMS = () => {
    smsMutation.mutate(smsConfig);
  };

  const handleSaveWebhook = () => {
    webhookMutation.mutate(webhookConfig);
  };

  const handleTestSMTP = () => {
    smtpTestMutation.mutate();
  };

  const handleTestWebhook = () => {
    webhookTestMutation.mutate();
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-96">
        <p>Cargando configuración...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-red-50 border border-red-200 rounded-md p-4">
        <p className="text-red-800">
          Error al cargar configuración: {error instanceof Error ? error.message : "Error desconocido"}
        </p>
      </div>
    );
  }

  return (
    <div className="container mx-auto py-6 space-y-6">
      <div>
        <h1 className="text-3xl font-bold">Configuración de Notificaciones</h1>
        <p className="text-muted-foreground mt-1">
          Configura los canales y preferencias de notificaciones
        </p>
      </div>

      <Tabs defaultValue="channels" className="w-full">
        <TabsList>
          <TabsTrigger value="channels">Canales</TabsTrigger>
          <TabsTrigger value="templates">Plantillas</TabsTrigger>
          <TabsTrigger value="preferences">Preferencias</TabsTrigger>
        </TabsList>

        <TabsContent value="channels" className="space-y-6">
          {/* Email SMTP */}
          <div className="bg-white border border-gray-200 rounded-lg p-6">
            <div className="flex items-center justify-between mb-4">
              <div>
                <h3 className="text-lg font-semibold">Email (SMTP)</h3>
                <p className="text-sm text-gray-600">
                  Configuración del servidor SMTP para envío de correos
                </p>
              </div>
              <Switch
                checked={smtpConfig.enabled}
                onCheckedChange={(checked) =>
                  setSmtpConfig({ ...smtpConfig, enabled: checked })
                }
              />
            </div>

            {smtpConfig.enabled && (
              <div className="space-y-4 mt-4 pt-4 border-t">
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="smtpHost">Servidor SMTP</Label>
                    <Input
                      id="smtpHost"
                      value={smtpConfig.host}
                      onChange={(e) =>
                        setSmtpConfig({ ...smtpConfig, host: e.target.value })
                      }
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="smtpPort">Puerto</Label>
                    <Input
                      id="smtpPort"
                      type="number"
                      value={smtpConfig.port}
                      onChange={(e) =>
                        setSmtpConfig({ ...smtpConfig, port: parseInt(e.target.value) || 587 })
                      }
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="smtpUser">Usuario</Label>
                    <Input
                      id="smtpUser"
                      value={smtpConfig.user}
                      onChange={(e) =>
                        setSmtpConfig({ ...smtpConfig, user: e.target.value })
                      }
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="smtpPassword">Contraseña</Label>
                    <Input
                      id="smtpPassword"
                      type="password"
                      value={smtpConfig.password}
                      onChange={(e) =>
                        setSmtpConfig({ ...smtpConfig, password: e.target.value })
                      }
                      placeholder="Dejar vacío para no cambiar"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="fromEmail">Email Remitente</Label>
                    <Input
                      id="fromEmail"
                      type="email"
                      value={smtpConfig.from_email}
                      onChange={(e) =>
                        setSmtpConfig({ ...smtpConfig, from_email: e.target.value })
                      }
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="fromName">Nombre Remitente</Label>
                    <Input
                      id="fromName"
                      value={smtpConfig.from_name || ""}
                      onChange={(e) =>
                        setSmtpConfig({ ...smtpConfig, from_name: e.target.value })
                      }
                    />
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <Label htmlFor="useTLS" className="flex items-center gap-2 cursor-pointer">
                    <Switch
                      id="useTLS"
                      checked={smtpConfig.use_tls}
                      onCheckedChange={(checked) =>
                        setSmtpConfig({ ...smtpConfig, use_tls: checked })
                      }
                    />
                    Usar TLS
                  </Label>
                </div>
                <div className="flex gap-2">
                  <Button variant="outline" onClick={handleTestSMTP} disabled={smtpTestMutation.isPending}>
                    {smtpTestMutation.isPending ? "Probando..." : "Probar Conexión"}
                  </Button>
                  <Button onClick={handleSaveSMTP} disabled={smtpMutation.isPending}>
                    {smtpMutation.isPending ? "Guardando..." : "Guardar Configuración"}
                  </Button>
                </div>
                {smtpTestMutation.isSuccess && (
                  <div className="bg-green-50 border border-green-200 rounded p-3">
                    <p className="text-sm text-green-800">✅ {smtpTestMutation.data.data.message}</p>
                  </div>
                )}
                {smtpTestMutation.isError && (
                  <div className="bg-red-50 border border-red-200 rounded p-3">
                    <p className="text-sm text-red-800">
                      Error: {smtpTestMutation.error instanceof Error ? smtpTestMutation.error.message : "Error desconocido"}
                    </p>
                  </div>
                )}
                {smtpMutation.isSuccess && (
                  <div className="bg-green-50 border border-green-200 rounded p-3">
                    <p className="text-sm text-green-800">✅ Configuración SMTP guardada exitosamente</p>
                  </div>
                )}
                {smtpMutation.isError && (
                  <div className="bg-red-50 border border-red-200 rounded p-3">
                    <p className="text-sm text-red-800">
                      Error: {smtpMutation.error instanceof Error ? smtpMutation.error.message : "Error desconocido"}
                    </p>
                  </div>
                )}
              </div>
            )}
          </div>

          {/* SMS */}
          <div className="bg-white border border-gray-200 rounded-lg p-6">
            <div className="flex items-center justify-between mb-4">
              <div>
                <h3 className="text-lg font-semibold">SMS</h3>
                <p className="text-sm text-gray-600">
                  Notificaciones por mensaje de texto (Twilio, etc.)
                </p>
              </div>
              <Switch
                checked={smsConfig.enabled}
                onCheckedChange={(checked) =>
                  setSmsConfig({ ...smsConfig, enabled: checked })
                }
              />
            </div>
            {smsConfig.enabled && (
              <div className="space-y-4 mt-4 pt-4 border-t">
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="smsProvider">Proveedor</Label>
                    <Input
                      id="smsProvider"
                      value={smsConfig.provider}
                      onChange={(e) =>
                        setSmsConfig({ ...smsConfig, provider: e.target.value })
                      }
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="smsAccountSid">Account SID</Label>
                    <Input
                      id="smsAccountSid"
                      value={smsConfig.account_sid || ""}
                      onChange={(e) =>
                        setSmsConfig({ ...smsConfig, account_sid: e.target.value })
                      }
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="smsAuthToken">Auth Token</Label>
                    <Input
                      id="smsAuthToken"
                      type="password"
                      value={smsConfig.auth_token || ""}
                      onChange={(e) =>
                        setSmsConfig({ ...smsConfig, auth_token: e.target.value })
                      }
                      placeholder="Dejar vacío para no cambiar"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="smsFromNumber">Número Remitente</Label>
                    <Input
                      id="smsFromNumber"
                      value={smsConfig.from_number || ""}
                      onChange={(e) =>
                        setSmsConfig({ ...smsConfig, from_number: e.target.value })
                      }
                    />
                  </div>
                </div>
                <Button onClick={handleSaveSMS} disabled={smsMutation.isPending}>
                  {smsMutation.isPending ? "Guardando..." : "Guardar Configuración"}
                </Button>
                {smsMutation.isSuccess && (
                  <div className="bg-green-50 border border-green-200 rounded p-3">
                    <p className="text-sm text-green-800">✅ Configuración SMS guardada exitosamente</p>
                  </div>
                )}
                {smsMutation.isError && (
                  <div className="bg-red-50 border border-red-200 rounded p-3">
                    <p className="text-sm text-red-800">
                      Error: {smsMutation.error instanceof Error ? smsMutation.error.message : "Error desconocido"}
                    </p>
                  </div>
                )}
              </div>
            )}
          </div>

          {/* Webhooks */}
          <div className="bg-white border border-gray-200 rounded-lg p-6">
            <div className="flex items-center justify-between mb-4">
              <div>
                <h3 className="text-lg font-semibold">Webhooks</h3>
                <p className="text-sm text-gray-600">
                  Enviar notificaciones a URLs externas
                </p>
              </div>
              <Switch
                checked={webhookConfig.enabled}
                onCheckedChange={(checked) =>
                  setWebhookConfig({ ...webhookConfig, enabled: checked })
                }
              />
            </div>
            {webhookConfig.enabled && (
              <div className="space-y-4 mt-4 pt-4 border-t">
                <div className="space-y-2">
                  <Label htmlFor="webhookUrl">URL del Webhook</Label>
                  <Input
                    id="webhookUrl"
                    type="url"
                    placeholder="https://api.example.com/webhook"
                    value={webhookConfig.url}
                    onChange={(e) =>
                      setWebhookConfig({ ...webhookConfig, url: e.target.value })
                    }
                  />
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="webhookSecret">Secret (Opcional)</Label>
                    <Input
                      id="webhookSecret"
                      type="password"
                      value={webhookConfig.secret || ""}
                      onChange={(e) =>
                        setWebhookConfig({ ...webhookConfig, secret: e.target.value })
                      }
                      placeholder="Dejar vacío para no cambiar"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="webhookTimeout">Timeout (segundos)</Label>
                    <Input
                      id="webhookTimeout"
                      type="number"
                      value={webhookConfig.timeout}
                      onChange={(e) =>
                        setWebhookConfig({
                          ...webhookConfig,
                          timeout: parseInt(e.target.value) || 30,
                        })
                      }
                    />
                  </div>
                </div>
                <div className="flex gap-2">
                  <Button variant="outline" onClick={handleTestWebhook} disabled={webhookTestMutation.isPending}>
                    {webhookTestMutation.isPending ? "Probando..." : "Probar Webhook"}
                  </Button>
                  <Button onClick={handleSaveWebhook} disabled={webhookMutation.isPending}>
                    {webhookMutation.isPending ? "Guardando..." : "Guardar Configuración"}
                  </Button>
                </div>
                {webhookTestMutation.isSuccess && (
                  <div className="bg-green-50 border border-green-200 rounded p-3">
                    <p className="text-sm text-green-800">✅ {webhookTestMutation.data.data.message}</p>
                  </div>
                )}
                {webhookTestMutation.isError && (
                  <div className="bg-red-50 border border-red-200 rounded p-3">
                    <p className="text-sm text-red-800">
                      Error: {webhookTestMutation.error instanceof Error ? webhookTestMutation.error.message : "Error desconocido"}
                    </p>
                  </div>
                )}
                {webhookMutation.isSuccess && (
                  <div className="bg-green-50 border border-green-200 rounded p-3">
                    <p className="text-sm text-green-800">✅ Configuración Webhook guardada exitosamente</p>
                  </div>
                )}
                {webhookMutation.isError && (
                  <div className="bg-red-50 border border-red-200 rounded p-3">
                    <p className="text-sm text-red-800">
                      Error: {webhookMutation.error instanceof Error ? webhookMutation.error.message : "Error desconocido"}
                    </p>
                  </div>
                )}
              </div>
            )}
          </div>
        </TabsContent>

        <TabsContent value="templates" className="space-y-4">
          <div className="bg-white border border-gray-200 rounded-lg p-6">
            <h3 className="text-lg font-semibold mb-4">Plantillas de Notificaciones</h3>
            <p className="text-gray-600">
              Gestiona las plantillas de correos y mensajes del sistema
            </p>
            <div className="mt-4">
              <Button variant="outline" disabled>
                Ver Plantillas (Próximamente)
              </Button>
            </div>
          </div>
        </TabsContent>

        <TabsContent value="preferences" className="space-y-4">
          <div className="bg-white border border-gray-200 rounded-lg p-6">
            <h3 className="text-lg font-semibold mb-4">Preferencias de Usuario</h3>
            <p className="text-gray-600">
              Los usuarios pueden configurar sus preferencias individuales de notificaciones
            </p>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
}
