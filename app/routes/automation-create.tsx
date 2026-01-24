/**
 * Create Automation Page
 * Página para crear una nueva regla de automatización
 */

import { useNavigate } from "react-router";
import { PageLayout } from "~/components/layout/PageLayout";
import { Button } from "~/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "~/components/ui/card";

export default function CreateAutomationPage() {
  const navigate = useNavigate();

  const handleSubmit = () => {
    // TODO: Implementar creación de automatización
    void navigate("/automation");
  };

  return (
    <PageLayout title="Nueva Automatización">
      <div className="max-w-2xl mx-auto">
        <Card>
          <CardHeader>
            <CardTitle>Crear Nueva Regla de Automatización</CardTitle>
            <CardDescription>
              Configura una nueva regla para automatizar procesos del sistema
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="text-center py-8">
              <p className="text-muted-foreground">
                Formulario de creación de automatización en desarrollo...
              </p>
              <div className="flex gap-4 justify-center mt-6">
                <Button onClick={() => void handleSubmit()}>
                  Crear Regla
                </Button>
                <Button variant="outline" onClick={() => void navigate("/automation")}>
                  Cancelar
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </PageLayout>
  );
}
