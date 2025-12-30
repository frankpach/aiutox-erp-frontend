/**
 * Dashboard Page
 * Main dashboard page - accessible to all authenticated users
 * Uses PageLayout for consistent visual structure
 */

import { ProtectedRoute } from "~/components/auth/ProtectedRoute";
import { PageLayout } from "~/components/layout/PageLayout";
import { useTranslation } from "~/lib/i18n/useTranslation";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "~/components/ui/card";

export function meta() {
  return [
    { title: "Dashboard - AiutoX ERP" },
    { name: "description", content: "Panel principal de AiutoX ERP" },
  ];
}

export default function DashboardPage() {
  const { t } = useTranslation();

  return (
    <ProtectedRoute>
      <PageLayout
        title={t("dashboard.title") || "Dashboard"}
        description={t("dashboard.description") || "Panel principal de AiutoX ERP"}
      >
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          <Card>
            <CardHeader>
              <CardTitle>{t("dashboard.welcome") || "Bienvenido"}</CardTitle>
              <CardDescription>
                {t("dashboard.welcomeDescription") || "Panel principal del sistema"}
              </CardDescription>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-muted-foreground">
                {t("dashboard.comingSoon") || "El contenido del dashboard se implementará próximamente"}
              </p>
            </CardContent>
          </Card>
        </div>
      </PageLayout>
    </ProtectedRoute>
  );
}
