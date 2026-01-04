/**
 * Approval Request Card Component
 * Displays a single approval request
 */

import { useState } from "react";
import { useTranslation } from "~/lib/i18n/useTranslation";
import { Card, CardContent, CardHeader, CardTitle } from "~/components/ui/card";
import { Button } from "~/components/ui/button";
import { Badge } from "~/components/ui/badge";
import { Separator } from "~/components/ui/separator";
import { 
  UploadIcon,
  DownloadIcon,
  PlugIcon,
  ArrowLeftIcon,
} from "@hugeicons/core-free-icons";
import { HugeiconsIcon } from "@hugeicons/react";
import type { ApprovalRequest, ApprovalStatus, ApprovalDecision } from "~/features/approvals/types/approval.types";

interface ApprovalRequestCardProps {
  request: ApprovalRequest;
  onAction?: (requestId: string, action: string, decision?: ApprovalDecision) => void;
  showActions?: boolean;
}

export function ApprovalRequestCard({ request, onAction, showActions = true }: ApprovalRequestCardProps) {
  const { t } = useTranslation();
  const [showDetails, setShowDetails] = useState(false);

  const getStatusColor = (status: ApprovalStatus): string => {
    switch (status) {
      case "pending":
        return "bg-yellow-100 text-yellow-800";
      case "in_progress":
        return "bg-blue-100 text-blue-800";
      case "approved":
        return "bg-green-100 text-green-800";
      case "rejected":
        return "bg-red-100 text-red-800";
      case "cancelled":
        return "bg-gray-100 text-gray-800";
      case "expired":
        return "bg-gray-100 text-gray-800";
      default:
        return "bg-gray-100 text-gray-800";
    }
  };

  const getStatusBadge = (status: ApprovalStatus): string => {
    switch (status) {
      case "pending":
        return "bg-yellow-500 text-white";
      case "in_progress":
        return "bg-blue-500 text-white";
      case "approved":
        return "bg-green-500 text-white";
      case "rejected":
        return "bg-red-500 text-white";
      case "cancelled":
        return "bg-gray-500 text-white";
      case "expired":
        return "bg-gray-500 text-white";
      default:
        return "bg-gray-500 text-white";
    }
  };

  const getDecisionColor = (decision: ApprovalDecision): string => {
    switch (decision) {
      case "approve":
        return "text-green-600";
      case "reject":
        return "text-red-600";
      case "delegate":
        return "text-blue-600";
      default:
        return "text-gray-600";
    }
  };

  const handleAction = (action: string, decision?: ApprovalDecision) => {
    if (onAction) {
      onAction(request.id, action, decision);
    }
  };

  return (
    <Card className="hover:shadow-md transition-shadow">
      <CardHeader>
        <div className="flex justify-between items-start">
          <div className="flex-1">
            <CardTitle className="text-lg">{request.title}</CardTitle>
            <p className="text-sm text-gray-600 mt-1">{request.description}</p>
            
            <div className="flex items-center gap-4 mt-2">
              <Badge className={getStatusBadge(request.status)}>
                {request.status}
              </Badge>
              <span className="text-sm text-gray-500">
                • {request.entity_type} • {request.current_step}/{request.steps?.length || 0}
              </span>
            </div>
          </div>
          
          <div className="flex items-center gap-2">
            <span className="text-sm text-gray-500">
              Requested by: {request.requested_by}
            </span>
            <span className="text-sm text-gray-500">
              Created: {new Date(request.created_at).toLocaleDateString()}
            </span>
          </div>
        </div>
      </CardHeader>
      
      <CardContent>
        <div className="space-y-4">
          {/* Current Step */}
          <div className="border-l-4 border-blue-200 bg-blue-50 p-4 rounded-lg">
            <div className="flex items-center justify-between">
              <div>
                <h4 className="font-medium text-blue-900">Current Step</h4>
                <p className="text-sm text-blue-700 mt-1">
                  Step {request.current_step} of {request.steps?.length || 0}
                </p>
              </div>
              <div className="text-right">
                <span className="text-sm text-blue-600">
                  {request.current_step}/{request.steps?.length || 0}
                </span>
              </div>
            </div>
          </div>

          {/* Request Details */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="text-sm font-medium text-gray-700">Entity Type</label>
              <div className="text-sm text-gray-900">{request.entity_type}</div>
            </div>
            <div>
              <label className="text-sm font-medium text-gray-700">Entity ID</label>
              <div className="text-sm text-gray-900">{request.entity_id}</div>
            </div>
          </div>

          {/* Metadata */}
          {request.metadata && Object.keys(request.metadata).length > 0 && (
            <div>
              <label className="text-sm font-medium text-gray-700 mb-2">Metadata</label>
              <div className="bg-gray-50 p-3 rounded-lg">
                {Object.entries(request.metadata).map(([key, value]) => (
                  <div key={key} className="flex justify-between py-2 border-b border-gray-200">
                    <span className="font-medium text-gray-700">{key}:</span>
                    <span className="text-gray-600">
                      {typeof value === 'object' ? JSON.stringify(value, null, 2) : String(value)}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Actions */}
          {showActions && (
            <>
              <Separator />
              <div className="flex justify-between items-center">
                <div>
                  <h4 className="font-medium text-gray-900">Actions</h4>
                </div>
                
                <div className="flex gap-2">
                  {request.status === "pending" && (
                    <Button
                      size="sm"
                      onClick={() => handleAction("approve")}
                      className="text-green-600 hover:text-green-700"
                    >
                      <HugeiconsIcon icon={PlugIcon} size={16} className="mr-2" />
                      Approve
                    </Button>
                  )}
                  
                  {request.status === "pending" && (
                    <Button
                      size="sm"
                      onClick={() => handleAction("reject")}
                      className="text-red-600 hover:text-red-700"
                    >
                      <HugeiconsIcon icon={UploadIcon} size={16} className="mr-2" />
                      Reject
                    </Button>
                  )}
                  
                  {request.status === "pending" && (
                    <Button
                      size="sm"
                      onClick={() => handleAction("delegate")}
                      className="text-blue-600 hover:text-blue-700"
                    >
                      <HugeiconsIcon icon={ArrowLeftIcon} size={16} className="mr-2" />
                      Delegate
                    </Button>
                  )}
                </div>
              </div>
            </>
          )}

          {/* Decision */}
          {(request.status === "approved" || request.status === "rejected") && (
            <>
              <Separator />
              <div className="border-l-4 border-gray-200 bg-gray-50 p-4 rounded-lg">
                <div className="flex items-center justify-between">
                  <div>
                    <h4 className="font-medium text-gray-900">Decision</h4>
                  </div>
                  <div className="text-right">
                    <span className={`text-sm font-medium ${getDecisionColor(request.decision)}`}>
                      {request.decision?.toUpperCase()}
                    </span>
                  </div>
                </div>
                
                {request.decision && (
                  <div className="mt-2 text-sm text-gray-600">
                    {request.decision === "approve" && (
                      <span className="flex items-center gap-2">
                        <HugeiconsIcon icon={PlugIcon} size={16} className="text-green-500" />
                        Approved by {request.steps?.[request.steps.length - 1]?.approver_name || "Unknown"}
                      </span>
                    )}
                    {request.decision === "reject" && (
                      <span className="flex items-center gap-2">
                        <HugeiconsIcon icon={UploadIcon} size={16} className="text-red-500" />
                        Rejected by {request.steps?.[request.steps.length - 1]?.approver_name || "Unknown"}
                      </span>
                    )}
                    {request.decision === "delegate" && (
                      <span className="flex items-center gap-2">
                        <HugeiconsIcon icon={ArrowLeftIcon} size={16} className="text-blue-500" />
                        Delegated to {request.decision?.delegated_to || "Unknown"}
                      </span>
                    )}
                  </div>
                  {request.decision?.comments && (
                    <p className="mt-2 text-sm text-gray-600 italic">
                      "{request.decision.comments}"
                    </p>
                  )}
                </div>
              </div>
            </>
          )}

          {/* Timestamps */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm text-gray-600">
            <div>
              <label className="font-medium text-gray-700">Created</label>
              <div className="flex items-center gap-2">
                <HugeiconsIcon icon={DownloadIcon} size={16} className="text-gray-400" />
                <span>{new Date(request.created_at).toLocaleString()}</span>
              </div>
            </div>
            <div>
              <label className="font-medium text-gray-700">Updated</label>
              <div className="flex items-center gap-2">
                <HugeiconsIcon icon={DownloadIcon} size={16} className="text-gray-400" />
                <span>{new Date(request.updated_at).toLocaleString()}</span>
              </div>
            </div>
            {request.decided_at && (
              <div>
                <label className="font-medium text-gray-700">Decided</label>
                <div className="flex items-center gap-2">
                  <HugeiconsIcon icon={PlugIcon} size={16} className="text-green-500" />
                  <span>{new Date(request.decided_at).toLocaleString()}</span>
                </div>
              </div>
            )}
          </div>

          {/* Expand Details Toggle */}
          <div className="mt-4">
            <Button
              variant="outline"
              size="sm"
              onClick={() => setShowDetails(!showDetails)}
              className="w-full"
            >
              {showDetails ? "Hide Details" : "Show Details"}
            </Button>
          </div>

          {/* Expanded Details */}
          {showDetails && (
            <div className="mt-4 border-t pt-4">
              <h4 className="font-medium text-gray-900 mb-4">Approval Steps</h4>
              <div className="space-y-3">
                {request.steps?.map((step, index) => (
                  <div key={step.id || index} className="border-l-4 border-gray-200 p-4 rounded-lg">
                    <div className="flex justify-between items-center mb-2">
                      <div>
                        <span className="font-medium text-gray-900">Step {step.step_number}</span>
                        <span className={`text-sm ${getStatusBadge(step.status)}`}>
                          {step.status}
                        </span>
                      </div>
                      <div className="text-sm text-gray-500">
                        {step.approver_type} • {step.approver_name || "Unknown"}
                      </div>
                    </div>
                    
                    <div className="text-sm text-gray-700 mt-2">
                      {step.name}
                    </div>
                    
                    {step.conditions && Object.keys(step.conditions).length > 0 && (
                      <div className="mt-2">
                        <span className="font-medium text-gray-700">Conditions:</span>
                        <ul className="text-sm text-gray-600 list-disc list-inside">
                          {Object.entries(step.conditions).map(([key, value]) => (
                            <li key={key}>
                              <strong>{key}:</strong> {String(value)}
                            </li>
                          ))}
                        </ul>
                      </div>
                    )}
                  </div>
                    
                    {step.decision && (
                      <div className="mt-2">
                        <span className="font-medium text-gray-700">Decision:</span>
                        <div className={`text-sm ${getDecisionColor(step.decision)}`}>
                          {step.decision?.toUpperCase()}
                        </div>
                        {step.decision?.comments && (
                          <p className="mt-1 text-sm text-gray-600 italic">
                            "{step.decision.comments}"
                          </p>
                        )}
                      </div>
                    )}
                    
                    <div className="flex items-center gap-2 mt-2">
                      <span className="text-sm text-gray-500">
                        Decided: {step.decided_at ? new Date(step.decided_at).toLocaleString() : "Not decided"}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
