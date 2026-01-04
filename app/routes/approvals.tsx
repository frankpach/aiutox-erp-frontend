/**
 * Approvals page
 * Main page for approvals management
 */

import { useState } from "react";
import { useTranslation } from "~/lib/i18n/useTranslation";
import { PageLayout } from "~/components/layout/PageLayout";
import { Button } from "~/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "~/components/ui/card";
import { Badge } from "~/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "~/components/ui/tabs";
import { ApprovalRequestList } from "~/features/approvals/components/ApprovalRequestList";
import { ApprovalRequestForm } from "~/features/approvals/components/ApprovalRequestForm";
import { ApprovalFlowList } from "~/features/approvals/components/ApprovalFlowList";
import { useApprovalRequests, useCreateApprovalRequest } from "~/features/approvals/hooks/useApprovals";
import { ApprovalRequest } from "~/features/approvals/types/approval.types";

export default function ApprovalsPage() {
  const { t } = useTranslation();
  const [activeTab, setActiveTab] = useState("requests");
  const [showCreateForm, setShowCreateForm] = useState(false);
  const [editingRequest, setEditingRequest] = useState<ApprovalRequest | null>(null);

  // Query hooks
  const { data: requestsData, loading, error, refetch } = useApprovalRequests({
    page: 1,
    page_size: 20,
  });

  const createRequestMutation = useCreateApprovalRequest();

  const handleCreateRequest = (data: any) => {
    createRequestMutation.mutate(data, {
      onSuccess: () => {
        setShowCreateForm(false);
        refetch();
      },
    });
  };

  const handleApproveRequest = (request: ApprovalRequest) => {
    // Handle approval logic
    console.log("Approve request:", request.id);
  };

  const handleRejectRequest = (request: ApprovalRequest) => {
    // Handle rejection logic
    console.log("Reject request:", request.id);
  };

  const handleDelegateRequest = (request: ApprovalRequest) => {
    // Handle delegation logic
    console.log("Delegate request:", request.id);
  };

  const handleEditRequest = (request: ApprovalRequest) => {
    setEditingRequest(request);
  };

  const requests = requestsData?.data || [];
  const total = requestsData?.total || 0;

  return (
    <PageLayout
      title={t("approvals.title")}
      description={t("approvals.description")}
      loading={loading}
      error={error}
    >
      <div className="space-y-6">
        {/* Header with actions */}
        <div className="flex justify-between items-center">
          <div className="flex items-center space-x-4">
            <Badge variant="secondary">
              {total} {t("approvals.requests")}
            </Badge>
            <Button onClick={() => setShowCreateForm(true)}>
              {t("approvals.createRequest")}
            </Button>
          </div>
        </div>

        {/* Tabs */}
        <Tabs value={activeTab} onValueChange={setActiveTab}>
          <TabsList className="grid w-full grid-cols-3">
            <TabsTrigger value="requests">
              {t("approvals.requests.title")}
            </TabsTrigger>
            <TabsTrigger value="flows">
              {t("approvals.flows.title")}
            </TabsTrigger>
            <TabsTrigger value="form">
              {t("approvals.form.title")}
            </TabsTrigger>
          </TabsList>

          <TabsContent value="requests" className="mt-6">
            <ApprovalRequestList
              requests={requests}
              loading={loading}
              onRefresh={refetch}
              onRequestSelect={handleEditRequest}
              onRequestApprove={handleApproveRequest}
              onRequestReject={handleRejectRequest}
              onRequestDelegate={handleDelegateRequest}
              onRequestCreate={() => setShowCreateForm(true)}
            />
          </TabsContent>

          <TabsContent value="flows" className="mt-6">
            <ApprovalFlowList
              onRefresh={() => {
                // Handle flows refresh
              }}
              onFlowCreate={() => {
                // Handle flow creation
              }}
            />
          </TabsContent>

          <TabsContent value="form" className="mt-6">
            <div className="max-w-2xl mx-auto">
              <ApprovalRequestForm
                request={editingRequest}
                onSubmit={handleCreateRequest}
                onCancel={() => {
                  setShowCreateForm(false);
                  setEditingRequest(null);
                }}
                loading={createRequestMutation.isPending}
              />
            </div>
          </TabsContent>
        </Tabs>
      </div>
    </PageLayout>
  );
}
