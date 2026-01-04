/**
 * Approval Flow List Component
 * Displays list of approval flows
 */

import { useState } from "react";
import { useTranslation } from "~/lib/i18n/useTranslation";
import { PageLayout } from "~/components/layout/PageLayout";
import { Button } from "~/components/ui/button";
import { Badge } from "~/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "~/components/ui/card";
import { 
  PlugIcon,
  DownloadIcon,
  UploadIcon,
} from "@hugeicons/core-free-icons";
import { HugeiconsIcon } from "@hugeicons/react";
import { useApprovalFlows, useCreateApprovalFlow, useUpdateApprovalFlow, useDeleteApprovalFlow } from "~/features/approvals/hooks/useApprovals";
import type { ApprovalFlow, ApprovalFlowCreate } from "~/features/approvals/types/approval.types";

export function ApprovalFlowList() {
  const { t } = useTranslation();
  const { data: flowsResponse, isLoading, error } = useApprovalFlows();
  const createFlow = useCreateApprovalFlow();
  const updateFlow = useUpdateApprovalFlow();
  const deleteFlow = useDeleteApprovalFlow();

  const flows = flowsResponse?.data || [];

  const [searchTerm, setSearchTerm] = useState("");
  const [showInactive, setShowInactive] = useState(false);

  const filteredFlows = flows.filter(flow => {
    const matchesSearch = flow.name.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = showInactive || flow.is_active;
    return matchesSearch && matchesStatus;
  });

  const handleCreateFlow = async () => {
    const newFlow: ApprovalFlowCreate = {
      name: "New Approval Flow",
      description: "Automatically created approval flow",
      entity_type: "general",
      steps: [
        {
          step_number: 1,
          name: "Initial Review",
          approver_type: "user" as const,
          approver_config: {
            user_id: "current_user",
          } as const,
          conditions: {},
        },
      ],
      is_active: true,
    };
    
    try {
      await createFlow.mutateAsync(newFlow);
    } catch (error) {
      console.error("Error creating approval flow:", error);
    }
  };

  const handleToggleActive = async (flowId: string, isActive: boolean) => {
    try {
      await updateFlow.mutateAsync({ 
        flowId, 
        data: { is_active: isActive } 
      });
    } catch (error) {
      console.error("Error updating approval flow:", error);
    }
  };

  const handleDeleteFlow = async (flowId: string) => {
    if (confirm(`Are you sure you want to delete this approval flow?`)) {
      try {
        await deleteFlow.mutateAsync(flowId);
      } catch (error) {
        console.error("Error deleting approval flow:", error);
      }
    }
  };

  const getStatusColor = (isActive: boolean): string => {
    return isActive ? "bg-green-100 text-green-800" : "bg-gray-100 text-gray-800";
  };

  const getStatusBadge = (isActive: boolean): string => {
    return isActive ? "bg-green-500 text-white" : "bg-gray-500 text-white";
  };

  if (isLoading) {
    return (
      <PageLayout title="Approval Flows" loading>
        <div className="animate-pulse">
          <div className="h-8 bg-gray-200 rounded w-1/4 mb-4"></div>
          <div className="h-4 bg-gray-200 rounded w-1/2 mb-2"></div>
          <div className="h-20 bg-gray-200 rounded mb-4"></div>
        </div>
      </PageLayout>
    );
  }

  if (error) {
    return (
      <PageLayout title="Approval Flows" error={error}>
        <div className="text-center py-12">
          <p className="text-gray-500 mb-4">Error loading approval flows</p>
          <Button onClick={() => window.location.reload()}>
            Retry
          </Button>
        </div>
      </PageLayout>
    );
  }

  return (
    <PageLayout title="Approval Flows">
      <div className="space-y-6">
        {/* Header Actions */}
        <div className="flex justify-between items-center">
          <div className="flex items-center gap-4">
            <div className="relative">
              <input
                type="text"
                placeholder="Search approval flows..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10 pr-4 border border-gray-300 rounded-lg focus:ring-2 focus:border-blue-500"
              />
            </div>
            <Button onClick={handleCreateFlow}>
              <HugeiconsIcon icon={PlugIcon} size={16} className="mr-2" />
              New Flow
            </Button>
          </div>
          
          <div className="flex items-center gap-2">
            <label className="flex items-center gap-2">
              <input
                type="checkbox"
                checked={showInactive}
                onChange={(e) => setShowInactive(e.target.checked)}
                className="rounded border-gray-300"
              />
              <span className="text-sm text-gray-700">Show inactive</span>
            </label>
          </div>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
          <Card>
            <CardHeader>
              <CardTitle>Total Flows</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold text-blue-600">{flows.length}</div>
              <p className="text-sm text-gray-600">Total approval flows</p>
            </CardContent>
          </Card>
          
          <Card>
            <CardHeader>
              <CardTitle>Active Flows</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold text-green-600">
                {flows.filter(f => f.is_active).length}
              </div>
              <p className="text-sm text-gray-600">Currently active flows</p>
            </CardContent>
          </Card>
          
          <Card>
            <CardHeader>
              <CardTitle>Inactive Flows</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold text-gray-600">
                {flows.filter(f => !f.is_active).length}
              </div>
              <p className="text-sm text-gray-600">Currently inactive flows</p>
            </CardContent>
          </Card>
        </div>

        {/* Flows List */}
        <Card>
          <CardHeader>
            <CardTitle>Approval Flows</CardTitle>
          </CardHeader>
          <CardContent>
            {filteredFlows.length === 0 ? (
              <div className="text-center py-12">
                <p className="text-gray-500 mb-4">No approval flows found</p>
                <p className="text-sm text-gray-400">
                  {showInactive ? "No inactive flows found" : "No active flows found"}
                </p>
                <Button onClick={handleCreateFlow}>
                  <HugeiconsIcon icon={PlugIcon} size={16} className="mr-2" />
                  Create First Flow
                </Button>
              </div>
            ) : (
              <div className="space-y-4">
                {filteredFlows.map((flow) => (
                  <div key={flow.id} className="border rounded-lg p-4 hover:shadow-md transition-shadow">
                    <div className="flex justify-between items-start mb-4">
                      <div className="flex-1">
                        <h3 className="text-lg font-semibold text-gray-900">{flow.name}</h3>
                        <p className="text-sm text-gray-600 mt-1">{flow.description}</p>
                        
                        <div className="flex items-center gap-4 mt-3">
                          <Badge className={getStatusBadge(flow.is_active)}>
                            {flow.is_active ? "Active" : "Inactive"}
                          </Badge>
                          <span className="text-sm text-gray-500">
                            Entity: {flow.entity_type}
                          </span>
                        </div>
                        
                        <div className="flex items-center gap-4 mt-3">
                          <span className="text-sm text-gray-500">
                            Steps: {flow.steps.length}
                          </span>
                          <span className="text-sm text-gray-500">
                            Created: {new Date(flow.created_at).toLocaleDateString()}
                          </span>
                        </div>
                      </div>
                    </div>
                    
                    <div className="flex items-center gap-2">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => window.open(`/approvals/flows/${flow.id}`, '_blank')}
                      >
                        <HugeiconsIcon icon={DownloadIcon} size={16} className="mr-2" />
                        View
                      </Button>
                      
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => window.open(`/approvals/flows/${flow.id}/edit`, '_blank')}
                      >
                        <HugeiconsIcon icon={UploadIcon} size={16} className="mr-2" />
                        Edit
                      </Button>
                      
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => handleToggleActive(flow.id, !flow.is_active)}
                        className={flow.is_active ? "text-red-600 hover:text-red-700" : "text-green-600 hover:text-green-700"}
                      >
                        {flow.is_active ? "Deactivate" : "Activate"}
                      </Button>
                      
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => handleDeleteFlow(flow.id)}
                        className="text-red-600 hover:text-red-700"
                      >
                        Delete
                      </Button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </PageLayout>
  );
}
