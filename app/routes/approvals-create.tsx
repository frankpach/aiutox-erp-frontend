/**
 * Create Approval Page
 * Página para crear una nueva aprobación
 */

import { useNavigate } from "react-router";
import { useTranslation } from "~/lib/i18n/useTranslation";
import { PageLayout } from "~/components/layout/PageLayout";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "~/components/ui/card";
import { useCreateApprovalFlow } from "~/features/approvals/hooks/useApprovals";
import { ApprovalFlowForm } from "~/features/approvals/components/ApprovalFlowForm";

export default function CreateApprovalPage() {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const createApprovalFlow = useCreateApprovalFlow();

  const handleSubmit = async (data: any) => {
    try {
      await createApprovalFlow.mutateAsync(data);
      navigate("/approvals");
    } catch (error) {
      console.error("Error creating approval:", error);
    }
  };

  const handleCancel = () => {
    navigate("/approvals");
  };

  return (
    <PageLayout title="Nueva Aprobación">
      <div className="max-w-2xl mx-auto">
        <Card>
          <CardHeader>
            <CardTitle>Crear Flujo de Aprobación</CardTitle>
            <CardDescription>
              Configura un nuevo flujo de aprobación para automatizar procesos
            </CardDescription>
          </CardHeader>
          <CardContent>
            <ApprovalFlowForm
              onSubmit={handleSubmit}
              onCancel={handleCancel}
              isLoading={createApprovalFlow.isPending}
            />
          </CardContent>
        </Card>
      </div>
    </PageLayout>
  );
}
