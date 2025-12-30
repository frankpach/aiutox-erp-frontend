/**
 * General Configuration Page
 *
 * Configure general system preferences: timezone, date/time format, currency, language
 * Uses ConfigPageLayout and shared components for visual consistency
 */

import { useEffect, useMemo } from "react";
import { useQuery } from "@tanstack/react-query";
import { useTranslation } from "~/lib/i18n/useTranslation";
import apiClient from "~/lib/api/client";
import type { StandardResponse } from "~/lib/api/types/common.types";
import { ConfigPageLayout } from "~/components/config/ConfigPageLayout";
import { ConfigFormField } from "~/components/config/ConfigFormField";
import { ConfigSection } from "~/components/config/ConfigSection";
import { ConfigLoadingState } from "~/components/config/ConfigLoadingState";
import { ConfigErrorState } from "~/components/config/ConfigErrorState";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "~/components/ui/select";
import { useConfigForm } from "~/hooks/useConfigForm";
import { useConfigSave } from "~/hooks/useConfigSave";
import { z } from "zod";

interface GeneralConfig {
  timezone: string;
  date_format: string;
  time_format: "12h" | "24h";
  currency: string;
  language: string;
}

const TIMEZONES = [
  "America/Mexico_City",
  "America/New_York",
  "America/Chicago",
  "America/Denver",
  "America/Los_Angeles",
  "America/Toronto",
  "America/Sao_Paulo",
  "America/Buenos_Aires",
  "America/Santiago",
  "America/Bogota",
  "Europe/London",
  "Europe/Paris",
  "Europe/Madrid",
  "Europe/Berlin",
  "Asia/Tokyo",
  "Asia/Shanghai",
  "Australia/Sydney",
  "UTC",
];

const CURRENCY_CODES = ["MXN", "USD", "EUR", "GBP", "CAD", "ARS", "BRL", "CLP", "COP", "JPY", "CNY"] as const;

const LANGUAGE_CODES = ["es", "en", "fr", "de", "it", "pt", "ja", "zh"] as const;

export function meta() {
  return [
    { title: "Configuración General - AiutoX ERP" },
    { name: "description", content: "Configura las preferencias generales del sistema" },
  ];
}

export default function GeneralConfigPage() {
  const { t } = useTranslation();

  const { data, isLoading, error } = useQuery({
    queryKey: ["config", "general"],
    queryFn: async () => {
      const response = await apiClient.get<StandardResponse<GeneralConfig>>(
        "/config/general"
      );
      return response.data.data;
    },
  });

  const defaultValues: GeneralConfig = {
    timezone: "America/Mexico_City",
    date_format: "DD/MM/YYYY",
    time_format: "24h",
    currency: "MXN",
    language: "es",
  };

  // Crear schema dinámico con traducciones
  const generalConfigSchema = useMemo(() => z.object({
    timezone: z.string().min(1, t("config.general.timezone") + " es requerido"),
    date_format: z.string().min(1, t("config.general.dateFormat") + " es requerido"),
    time_format: z.enum(["12h", "24h"]),
    currency: z.string().min(1, t("config.general.currency") + " es requerido"),
    language: z.string().min(1, t("config.general.language") + " es requerido"),
  }), [t]);

  const form = useConfigForm<GeneralConfig>({
    initialValues: data || defaultValues,
    schema: generalConfigSchema,
  });

  // Actualizar valores cuando se carga la data
  useEffect(() => {
    if (data) {
      form.updateOriginalValues(data);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [data]);

  const { save, isSaving } = useConfigSave<GeneralConfig>({
    queryKey: ["config", "general"],
    saveFn: async (values) => {
      const response = await apiClient.put<StandardResponse<GeneralConfig>>(
        "/config/general",
        values
      );
      return response.data.data;
    },
    successMessage: t("config.general.saveSuccess"),
    errorMessage: t("config.general.errorSaving"),
    onSuccess: (updatedData) => {
      form.updateOriginalValues(updatedData);
    },
  });

  const handleSave = async () => {
    if (form.validate()) {
      await save(form.values);
    }
  };

  const handleReset = () => {
    form.reset();
  };

  if (isLoading) {
    return (
      <ConfigPageLayout
        title={t("config.general.title")}
        description={t("config.general.description")}
        loading={true}
      >
        <ConfigLoadingState lines={5} />
      </ConfigPageLayout>
    );
  }

  if (error) {
    return (
      <ConfigPageLayout
        title={t("config.general.title")}
        description={t("config.general.description")}
        error={error instanceof Error ? error : String(error)}
      >
        <ConfigErrorState
          message={t("config.general.errorLoading")}
        />
      </ConfigPageLayout>
    );
  }

  return (
    <ConfigPageLayout
      title={t("config.general.title") || "Preferencias Generales"}
      description={t("config.general.description") || "Configura las preferencias generales del sistema"}
      hasChanges={form.hasChanges}
      isSaving={isSaving}
      onReset={handleReset}
      onSave={handleSave}
      saveDisabled={!form.isValid}
    >
      <ConfigSection
        title={t("config.general.localization")}
        description={t("config.general.localizationDescription")}
      >
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <ConfigFormField
            label={t("config.general.timezone")}
            id="timezone"
            value={form.values.timezone}
            onChange={(value) => form.setValue("timezone", value)}
            error={form.errors.timezone}
            required
            data-testid="timezone-select"
            input={
              <Select value={form.values.timezone} onValueChange={(value) => form.setValue("timezone", value)}>
                <SelectTrigger data-testid="timezone-select">
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
            }
          />

          <ConfigFormField
            label={t("config.general.dateFormat")}
            id="date_format"
            value={form.values.date_format}
            onChange={(value) => form.setValue("date_format", value)}
            error={form.errors.date_format}
            required
            data-testid="date-format-select"
            input={
              <Select value={form.values.date_format} onValueChange={(value) => form.setValue("date_format", value)}>
                <SelectTrigger data-testid="date-format-select">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="DD/MM/YYYY">{t("config.general.dateFormatDDMMYYYY")}</SelectItem>
                  <SelectItem value="MM/DD/YYYY">{t("config.general.dateFormatMMDDYYYY")}</SelectItem>
                  <SelectItem value="YYYY-MM-DD">{t("config.general.dateFormatYYYYMMDD")}</SelectItem>
                  <SelectItem value="DD-MM-YYYY">{t("config.general.dateFormatDDMMYYYYDash")}</SelectItem>
                </SelectContent>
              </Select>
            }
          />

          <ConfigFormField
            label={t("config.general.timeFormat")}
            id="time_format"
            value={form.values.time_format}
            onChange={(value) => form.setValue("time_format", value as "12h" | "24h")}
            error={form.errors.time_format}
            required
            data-testid="time-format-select"
            input={
              <Select value={form.values.time_format} onValueChange={(value) => form.setValue("time_format", value as "12h" | "24h")}>
                <SelectTrigger data-testid="time-format-select">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="12h">{t("config.general.timeFormat12h")}</SelectItem>
                  <SelectItem value="24h">{t("config.general.timeFormat24h")}</SelectItem>
                </SelectContent>
              </Select>
            }
          />

          <ConfigFormField
            label={t("config.general.currency")}
            id="currency"
            value={form.values.currency}
            onChange={(value) => form.setValue("currency", value)}
            error={form.errors.currency}
            required
            data-testid="currency-select"
            input={
              <Select value={form.values.currency} onValueChange={(value) => form.setValue("currency", value)}>
                <SelectTrigger data-testid="currency-select">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {CURRENCY_CODES.map((code) => {
                    const currencyKey = `config.general.currency${code}`;
                    return (
                      <SelectItem key={code} value={code}>
                        {code} - {t(currencyKey)}
                      </SelectItem>
                    );
                  })}
                </SelectContent>
              </Select>
            }
          />

          <ConfigFormField
            label={t("config.general.language")}
            id="language"
            value={form.values.language}
            onChange={(value) => form.setValue("language", value)}
            error={form.errors.language}
            required
            data-testid="language-select"
            input={
              <Select value={form.values.language} onValueChange={(value) => form.setValue("language", value)}>
                <SelectTrigger data-testid="language-select">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {LANGUAGE_CODES.map((code) => {
                    const langNames: Record<string, string> = {
                      es: "Español",
                      en: "English",
                      fr: "Français",
                      de: "Deutsch",
                      it: "Italiano",
                      pt: "Português",
                      ja: "日本語",
                      zh: "中文",
                    };
                    return (
                      <SelectItem key={code} value={code}>
                        {langNames[code] || code}
                      </SelectItem>
                    );
                  })}
                </SelectContent>
              </Select>
            }
          />
        </div>
      </ConfigSection>
    </ConfigPageLayout>
  );
}
