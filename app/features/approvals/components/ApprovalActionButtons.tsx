/**
 * Approval Action Buttons Component
 * Action buttons for approval requests
 */

import { Button } from "~/components/ui/button";
import { Badge } from "~/components/ui/badge";
import { 
  PlugIcon,
  UploadIcon,
  ArrowLeftIcon,
  DownloadIcon,
} from "@hugeicons/core-free-icons";
import { HugeiconsIcon } from "@hugeicons/react";
import type { ApprovalRequest, ApprovalStatus } from "~/features/approvals/types/approval.types";

interface ApprovalActionButtonsProps {
  request: ApprovalRequest;
  onAction?: (requestId: string, action: string, decision?: string) => void;
  size?: "sm" | "md";
  variant?: "default" | "outline" | "destructive";
  showActions?: boolean;
}

export function ApprovalActionButtons({ 
  request, 
  onAction, 
  size = "sm", 
  variant = "default", 
  showActions = true 
}: ApprovalActionButtonsProps) {
  const isPending = request.status === "pending";
  const isApproved = request.status === "approved";
  const isRejected = request.status === "rejected";

  const handleApprove = () => {
    if (onAction) {
      onAction(request.id, "approve", { decision: "approve" });
    }
  };

  const handleReject = () => {
    if (onAction) {
      onAction(request.id, "reject", { decision: "reject" });
    }
  };

  const handleView = () => {
    if (onAction) {
      onAction(request.id, "view");
    }
  };

  const handleDelegate = () => {
    if (onAction) {
      onAction(request.id, "delegate", { decision: "delegate" });
    }
  };

  if (!showActions) {
    return null;
    }

  return (
    <div className="flex gap-2">
      {/* View Details */}
      <Button
        size={size}
        variant={variant}
        onClick={handleView}
        className="text-blue-600 hover:text-blue-700"
      >
        <HugeiconsIcon icon={DownloadIcon} size={16} className="mr-2" />
        View Details
      </Button>

      {/* Approve Button */}
      {isPending && (
        <Button
          size={size}
          variant={variant}
          onClick={handleApprove}
          className="text-green-600 hover:text-green-700"
        >
          <HugeiconsIcon icon={PlugIcon} size={16} className="mr-2" />
          Approve
        </Button>
      )}

      {/* Reject Button */}
      {isPending && (
        <Button
          size={size}
          variant={variant}
          onClick={handleReject}
          className="text-red-600 hover:text-red-700"
        >
          <HugeiconsIcon icon={UploadIcon} size={16} className="mr-2" />
          Reject
        </Button>
      )}

      {/* Delegate Button */}
      {isPending && (
        <Button
          size={size}
          variant={variant}
          onClick={handleDelegate}
          className="text-blue-600 hover:text-blue-700"
        >
          <HugeiconsIcon icon={ArrowLeftIcon} size={16} className="mr-2" />
          Delegate
        </Button>
      )}

      {/* Status Badge */}
      <Badge className={getStatusBadge(request.status)}>
        {request.status}
      </Badge>
    </div>
  );
}
