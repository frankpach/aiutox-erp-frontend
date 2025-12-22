import { useState, useEffect } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import apiClient from "~/lib/api/client";
import { Button } from "~/components/ui/button";
import { Label } from "~/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "~/components/ui/select";
import type { StandardResponse } from "~/lib/api/types/common.types";

interface GeneralSettings {
  timezone: string;
  date_format: string;
  time_format: "12h" | "24h";
  currency: string;
  language: string;
}

// Common timezones
const TIMEZONES = [
  "America/Mexico_City",
  "America/New_York",
  "America/Chicago",
  "America/Denver",
  "America/Los_Angeles",
  "America/Toronto",
  "America/Bogota",
  "America/Buenos_Aires",
  "America/Sao_Paulo",
  "Europe/London",
  "Europe/Paris",
  "Europe/Madrid",
  "Europe/Berlin",
  "Asia/Tokyo",
  "Asia/Shanghai",
  "Asia/Dubai",
  "Australia/Sydney",
  "UTC",
];

// Common currencies (ISO 4217)
const CURRENCIES = [
  { code: "MXN", name: "Peso Mexicano" },
  { code: "USD", name: "US Dollar" },
  { code: "EUR", name: "Euro" },
  { code: "GBP", name: "British Pound" },
  { code: "CAD", name: "Canadian Dollar" },
  { code: "ARS", name: "Argentine Peso" },
  { code: "BRL", name: "Brazilian Real" },
  { code: "CLP", name: "Chilean Peso" },
  { code: "COP", name: "Colombian Peso" },
  { code: "JPY", name: "Japanese Yen" },
  { code: "CNY", name: "Chinese Yuan" },
];

// Common languages (ISO 639-1)
const LANGUAGES = [
  { code: "es", name: "Español" },
  { code: "en", name: "English" },
  { code: "fr", name: "Français" },
  { code: "de", name: "Deutsch" },
  { code: "it", name: "Italiano" },
  { code: "pt", name: "Português" },
  { code: "ja", name: "日本語" },
  { code: "zh", name: "中文" },
];

// Common date formats
const DATE_FORMATS = [
  { value: "DD/MM/YYYY", label: "DD/MM/YYYY (31/12/2025)" },
  { value: "MM/DD/YYYY", label: "MM/DD/YYYY (12/31/2025)" },
  { value: "YYYY-MM-DD", label: "YYYY-MM-DD (2025-12-31)" },
  { value: "DD-MM-YYYY", label: "DD-MM-YYYY (31-12-2025)" },
];

export default function GeneralConfigPage() {
  const queryClient = useQueryClient();
  const [settings, setSettings] = useState<GeneralSettings>({
    timezone: "America/Mexico_City",
    date_format: "DD/MM/YYYY",
    time_format: "24h",
    currency: "MXN",
    language: "es",
  });

  // Fetch current settings
  const { data, isLoading, error } = useQuery({
    queryKey: ["config", "general"],
    queryFn: async () => {
      const response = await apiClient.get<StandardResponse<GeneralSettings>>(
        "/config/general"
      );
      return response.data.data;
    },
  });

  // Update settings when data loads
  useEffect(() => {
    if (data) {
      setSettings(data);
    }
  }, [data]);

  // Update settings mutation
  const updateMutation = useMutation({
    mutationFn: async (newSettings: GeneralSettings) => {
      const response = await apiClient.put<StandardResponse<GeneralSettings>>(
        "/config/general",
        newSettings
      );
      return response.data.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["config", "general"] });
    },
  });

  const handleSave = () => {
    updateMutation.mutate(settings);
  };

  const handleReset = () => {
    if (data) {
      setSettings(data);
    }
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

  const hasChanges = data && JSON.stringify(settings) !== JSON.stringify(data);

  return (
    <div className="container mx-auto py-6 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Preferencias Generales</h1>
          <p className="text-muted-foreground mt-1">
            Configura las preferencias generales del sistema
          </p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" onClick={handleReset} disabled={!hasChanges || updateMutation.isPending}>
            Restablecer
          </Button>
          <Button onClick={handleSave} disabled={!hasChanges || updateMutation.isPending}>
            {updateMutation.isPending ? "Guardando..." : "Guardar Cambios"}
          </Button>
        </div>
      </div>

      {updateMutation.isError && (
        <div className="bg-red-50 border border-red-200 rounded-md p-4">
          <p className="text-red-800">
            Error al guardar: {updateMutation.error instanceof Error ? updateMutation.error.message : "Error desconocido"}
          </p>
        </div>
      )}

      {updateMutation.isSuccess && (
        <div className="bg-green-50 border border-green-200 rounded-md p-4">
          <p className="text-green-800">✅ Configuración guardada exitosamente</p>
        </div>
      )}

      <div className="bg-white border border-gray-200 rounded-lg p-6 shadow-sm space-y-6">
        <div className="space-y-2">
          <Label htmlFor="timezone">Zona Horaria</Label>
          <Select value={settings.timezone} onValueChange={(value) => setSettings({ ...settings, timezone: value })}>
            <SelectTrigger id="timezone">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {TIMEZONES.map((tz) => (
                <SelectItem key={tz} value={tz}>
                  {tz}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        <div className="space-y-2">
          <Label htmlFor="dateFormat">Formato de Fecha</Label>
          <Select
            value={settings.date_format}
            onValueChange={(value) => setSettings({ ...settings, date_format: value })}
          >
            <SelectTrigger id="dateFormat">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {DATE_FORMATS.map((format) => (
                <SelectItem key={format.value} value={format.value}>
                  {format.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        <div className="space-y-2">
          <Label htmlFor="timeFormat">Formato de Hora</Label>
          <Select
            value={settings.time_format}
            onValueChange={(value: "12h" | "24h") => setSettings({ ...settings, time_format: value })}
          >
            <SelectTrigger id="timeFormat">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="12h">12 horas (AM/PM)</SelectItem>
              <SelectItem value="24h">24 horas</SelectItem>
            </SelectContent>
          </Select>
        </div>

        <div className="space-y-2">
          <Label htmlFor="currency">Moneda</Label>
          <Select
            value={settings.currency}
            onValueChange={(value) => setSettings({ ...settings, currency: value })}
          >
            <SelectTrigger id="currency">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {CURRENCIES.map((curr) => (
                <SelectItem key={curr.code} value={curr.code}>
                  {curr.code} - {curr.name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        <div className="space-y-2">
          <Label htmlFor="language">Idioma</Label>
          <Select
            value={settings.language}
            onValueChange={(value) => setSettings({ ...settings, language: value })}
          >
            <SelectTrigger id="language">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {LANGUAGES.map((lang) => (
                <SelectItem key={lang.code} value={lang.code}>
                  {lang.name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      </div>
    </div>
  );
}
