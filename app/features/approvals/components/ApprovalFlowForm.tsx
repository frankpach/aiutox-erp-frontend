/**
 * Approval Flow Form Component
 * Form for creating and editing approval flows
 */

import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { PageLayout } from "~/components/layout/PageLayout";
import { Button } from "~/components/ui/button";
import { Input } from "~/components/ui/input";
import { Textarea } from "~/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "~/components/ui/select";
import { Card, CardContent, CardHeader, CardTitle } from "~/components/ui/card";
import { 
  ArrowLeftIcon,
  DownloadIcon,
} from "@hugeicons/core-free-icons";
import { HugeiconsIcon } from "@hugeicons/react";
import { useCreateApprovalFlow } from "~/features/approvals/hooks/useApprovals";

interface ApprovalFlowFormProps {
  flowId?: string;
}

export function ApprovalFlowForm({ flowId }: ApprovalFlowFormProps) {
  const navigate = useNavigate();
  const createFlow = useCreateApprovalFlow();

  const [formData, setFormData] = useState({
    name: "",
    description: "",
    entity_type: "general",
    is_active: true,
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await createFlow.mutateAsync(formData as any);
      navigate("/approvals");
    } catch (error) {
      console.error("Error saving flow:", error);
    }
  };

  return (
    <PageLayout title={flowId ? "Edit Approval Flow" : "Create Approval Flow"}>
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

          {/* Actions */}
          <div className="flex gap-4 pt-6">
            <Button type="button" variant="outline" onClick={() => navigate("/approvals")}>
              <HugeiconsIcon icon={ArrowLeftIcon} size={16} className="mr-2" />
              Cancel
            </Button>
            <Button type="submit" disabled={createFlow.isPending}>
              <HugeiconsIcon icon={DownloadIcon} size={16} className="mr-2" />
              {createFlow.isPending ? "Saving..." : "Create Flow"}
            </Button>
          </div>
        </form>
      </div>
    </PageLayout>
  );
}
