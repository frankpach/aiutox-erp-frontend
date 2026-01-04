/**
 * Approval Flow Form Component
 * Form for creating and editing approval flows
 */

import { useState, useEffect } from "react";
import { useNavigate, Link } from "react-router-dom";
import { useTranslation } from "~/lib/i18n/useTranslation";
import { PageLayout } from "~/components/layout/PageLayout";
import { Button } from "~/components/ui/button";
import { Input } from "~/components/ui/input";
import { Textarea } from "~/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "~/components/ui/select";
import { Card, CardContent, CardHeader, CardTitle } from "~/components/ui/card";
import { Separator } from "~/components/ui/separator";
import { 
  ArrowLeftIcon,
  DownloadIcon,
  PlugIcon,
  UploadIcon,
} from "@hugeicons/core-free-icons";
import { HugeiconsIcon } from "@hugeicons/react";
import { useApprovalFlow, useCreateApprovalFlow, useUpdateApprovalFlow } from "~/features/approvals/hooks/useApprovals";
import type { ApprovalFlow, ApprovalFlowCreate, ApproverType } from "~/features/approvals/types/approval.types";

interface ApprovalFlowFormProps {
  flowId?: string;
}

export function ApprovalFlowForm({ flowId }: ApprovalFlowFormProps) {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const { data: flowResponse, isLoading, error } = useApprovalFlow(flowId);
  const createFlow = useCreateApprovalFlow();
  const updateFlow = useUpdateApprovalFlow();

  const flow = flowResponse?.data;

  const [formData, setFormData] = useState<ApprovalFlowCreate>({
    name: "",
    description: "",
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
  });

  const [newStepName, setNewStepName] = useState("");
  const [newStepApproverType, setNewStepApproverType] = useState<ApproverType>("user");

  useEffect(() => {
    if (flow && flowId) {
      setFormData({
        name: flow.name,
        description: flow.description,
        entity_type: flow.entity_type,
        steps: flow.steps,
        is_active: flow.is_active,
      });
    }
  }, [flow, flowId]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    try {
      const submitData = {
        ...formData,
        steps: formData.steps.map((step, index) => ({
          ...step,
          id: step.id || `step-${index}`,
        })),
      };

      if (flowId) {
        await updateFlow.mutateAsync({ flowId, data: submitData });
      } else {
        await createFlow.mutateAsync(submitData);
      }
      
      navigate("/approvals");
    } catch (error) {
      console.error("Error saving approval flow:", error);
    }
  };

  const addStep = () => {
    if (!newStepName.trim()) return;
    
    const newStep = {
      step_number: formData.steps.length + 1,
      name: newStepName.trim(),
      approver_type: newStepApproverType,
      approver_config: newStepApproverType === "user" ? {
        user_id: "current_user",
      } : newStepApproverType === "role" ? {
        role_id: "current_role",
      } : {},
      conditions: {},
    };
    
    setFormData({
      ...formData,
      steps: [...formData.steps, newStep],
    });
    setNewStepName("");
    setNewStepApproverType("user");
  };

  const removeStep = (index: number) => {
    const newSteps = formData.steps.filter((_, i) => i !== index);
    setFormData({
      ...formData,
      steps: newSteps,
    });
  };

  const moveStep = (index: number, direction: "up" | "down") => {
    const newSteps = [...formData.steps];
    const step = newSteps[index];
    
    if (direction === "up" && index > 0) {
      newSteps[index] = { ...step, step_number: step.step_number - 1 };
      newSteps[index - 1] = { ...newSteps[index - 1], step_number: step.step_number };
    } else if (direction === "down" && index < newSteps.length - 1) {
      newSteps[index] = { ...step, step_number: step.step_number + 1 };
      newSteps[index + 1] = { ...newSteps[index + 1], step_number: step.step_number - 1 };
    }
    
    setFormData({
      ...formData,
      steps: newSteps,
    });
  };

  const isLoadingData = isLoading || createFlow.isPending || updateFlow.isPending;

  if (isLoadingData) {
    return (
      <PageLayout title={flowId ? "Edit Approval Flow" : "Create Approval Flow"} loading>
        <div className="animate-pulse">
          <div className="h-8 bg-gray-200 rounded w-1/4 mb-4"></div>
          <div className="h-4 bg-gray-200 rounded w-1/2 mb-2"></div>
          <div className="h-20 bg-gray-200 rounded mb-4"></div>
        </div>
      </PageLayout>
    );
  }

  if (error || !flow) {
    return (
      <PageLayout title="Approval Flow" error={error || "Flow not found"}>
        <div className="text-center py-12">
          <p className="text-gray-500 mb-4">Flow not found</p>
          <Button onClick={() => navigate("/approvals")}>
            Back
          </Button>
        </div>
      </PageLayout>
    );
  }

  return (
    <PageLayout 
      title={flowId ? "Edit Approval Flow" : "Create Approval Flow"}
      breadcrumbs={[
        { label: "Approvals", href: "/approvals" },
        { label: flowId ? "Edit Flow" : "Create Flow" }
      ]}
    >
      <div className="max-w-4xl mx-auto">
        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Basic Information */}
          <Card>
            <CardHeader>
              <CardTitle>Basic Information</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label htmlFor="name" className="block text-sm font-medium text-gray-700 mb-2">
                    Flow Name *
                  </label>
                  <Input
                    id="name"
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    placeholder="Enter flow name"
                    required
                  />
                </div>
                <div>
                  <label htmlFor="entity_type" className="block text-sm font-medium text-gray-700 mb-2">
                    Entity Type *
                  </label>
                  <Select value={formData.entity_type} onValueChange={(value) => setFormData({ ...formData, entity_type: value })}>
                    <SelectTrigger>
                      <SelectValue placeholder="Select entity type" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="general">General</SelectItem>
                      <SelectItem value="user">User</SelectItem>
                      <SelectItem value="role">Role</SelectItem>
                      <SelectItem value="department">Department</SelectItem>
                      <SelectItem value="custom">Custom</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
            </div>
            
            <div>
              <label htmlFor="description" className="block text-sm font-medium text-gray-700 mb-2">
                Description *
              </label>
              <Textarea
                id="description"
                value={formData.description}
                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                placeholder="Enter flow description"
                rows={4}
                required
              />
            </div>

            <div className="flex items-center gap-2">
              <label className="flex items-center gap-2">
                <input
                  type="checkbox"
                  checked={formData.is_active}
                  onChange={(e) => setFormData({ ...formData, is_active: e.target.checked })}
                  className="rounded border-gray-300"
                />
                <span className="text-sm font-medium text-gray-700">Active</span>
              </label>
            </div>
          </CardContent>
        </Card>

          {/* Steps Configuration */}
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle>Approval Steps</CardTitle>
                <Button type="button" variant="outline" onClick={addStep}>
                  <HugeiconsIcon icon={PlugIcon} size={16} className="mr-2" />
                  Add Step
                </Button>
              </div>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {formData.steps.map((step, index) => (
                  <div key={step.id || index} className="border rounded-lg p-4 space-y-3">
                    <div className="flex justify-between items-start mb-2">
                      <div className="flex items-center gap-2">
                        <span className="font-medium text-gray-700">Step {step.step_number}</span>
                        <div className="flex gap-2">
                          <Button
                            type="button"
                            variant="outline"
                            size="sm"
                            onClick={() => moveStep(index, "up")}
                            disabled={index === 0}
                          >
                            <HugeiconsIcon icon={ArrowLeftIcon} size={12} />
                          </Button>
                          <Button
                            type="button"
                            variant="outline"
                            size="sm"
                            onClick={() => moveStep(index, "down")}
                            disabled={index === formData.steps.length - 1}
                          >
                            <HugeiconsIcon icon={ArrowLeftIcon} size={12} className="rotate-180" />
                          </Button>
                        </div>
                      </div>
                      
                      <Button
                        type="button"
                        variant="outline"
                        size="sm"
                        onClick={() => removeStep(index)}
                        className="text-red-600 hover:text-red-700"
                      >
                        <HugeiconsIcon icon={UploadIcon} size={16} className="mr-2" />
                        Remove
                      </Button>
                    </div>
                    
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          Step Name *
                        </label>
                        <Input
                          value={step.name}
                          onChange={(e) => {
                            const newSteps = [...formData.steps];
                            newSteps[index] = { ...newSteps[index], name: e.target.value };
                            setFormData({ ...formData, steps: newSteps });
                          }}
                          placeholder="Enter step name"
                          required
                        />
                      </div>
                      
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          Approver Type *
                        </label>
                        <Select value={step.approver_type} onValueChange={(value) => {
                          const newSteps = [...formData.steps];
                          newSteps[index] = { ...newSteps[index], approver_type: value as ApproverType };
                          setFormData({ ...formData, steps: newSteps });
                        }}>
                          <SelectTrigger>
                            <SelectValue placeholder="Select approver type" />
                          </SelectTrigger>
                          <SelectContent>
                              <SelectItem value="user">User</SelectItem>
                              <SelectItem value="role">Role</SelectItem>
                              <SelectItem value="department">Department</SelectItem>
                              <SelectItem value="custom">Custom</SelectItem>
                            </SelectContent>
                        </Select>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          {/* Actions */}
          <div className="flex gap-4 pt-6">
            <Button type="button" variant="outline" onClick={() => navigate("/approvals")}>
              <HugeiconsIcon icon={ArrowLeftIcon} size={16} className="mr-2" />
              Cancel
            </Button>
            <Button type="submit" disabled={isLoadingData}>
              <HugeiconsIcon icon={DownloadIcon} size={16} className="mr-2" />
              {isLoadingData ? "Saving..." : (flowId ? "Update Flow" : "Create Flow")}
            </Button>
          </div>
        </form>
      </div>
    </PageLayout>
  );
}
