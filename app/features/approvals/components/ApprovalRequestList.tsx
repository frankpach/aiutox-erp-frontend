/**
 * ApprovalRequestList component
 * Displays a list of approval requests with filters and actions
 */

import { useState } from "react";
import { format } from "date-fns";
import { es, enUS } from "date-fns/locale";
import { useTranslation } from "~/lib/i18n/useTranslation";
import { Button } from "~/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "~/components/ui/card";
import { Badge } from "~/components/ui/badge";
import { DataTable } from "~/components/common/DataTable";
import { SearchBar } from "~/components/common/SearchBar";
import { ApprovalRequest, ApprovalStatus, StepStatus } from "~/features/approvals/types/approval.types";

interface ApprovalRequestListProps {
  requests: ApprovalRequest[];
  loading?: boolean;
  onRefresh?: () => void;
  onRequestSelect?: (request: ApprovalRequest) => void;
  onRequestApprove?: (request: ApprovalRequest) => void;
  onRequestReject?: (request: ApprovalRequest) => void;
  onRequestDelegate?: (request: ApprovalRequest) => void;
  onRequestCreate?: () => void;
}

const statusColors: Record<ApprovalStatus, string> = {
  pending: "bg-yellow-100 text-yellow-800 border-yellow-200",
  in_progress: "bg-blue-100 text-blue-800 border-blue-200",
  approved: "bg-green-100 text-green-800 border-green-200",
  rejected: "bg-red-100 text-red-800 border-red-200",
  cancelled: "bg-gray-100 text-gray-800 border-gray-200",
  expired: "bg-orange-100 text-orange-800 border-orange-200",
};

const stepStatusColors: Record<StepStatus, string> = {
  pending: "bg-gray-100 text-gray-800 border-gray-200",
  approved: "bg-green-100 text-green-800 border-green-200",
  rejected: "bg-red-100 text-red-800 border-red-200",
  skipped: "bg-blue-100 text-blue-800 border-blue-200",
  delegated: "bg-orange-100 text-orange-800 border-orange-200",
};

export function ApprovalRequestList({ 
  requests, 
  loading, 
  onRefresh, 
  onRequestSelect, 
  onRequestApprove, 
  onRequestReject, 
  onRequestDelegate, 
  onRequestCreate 
}: ApprovalRequestListProps) {
  const { t } = useTranslation();
  const dateLocale = t("common.locale") === "es" ? es : en;

  const formatDate = (dateString: string) => {
    return format(new Date(dateString), "PPP", { locale: dateLocale });
  };

  const getStatusBadge = (status: ApprovalStatus) => {
    return (
      <Badge 
        variant="outline" 
        className={statusColors[status]}
      >
        {t(`approvals.status.${status}`)}
      </Badge>
    );
  };

  const getStepStatusBadge = (status: StepStatus) => {
    return (
      <Badge 
        variant="outline" 
        className={stepStatusColors[status]}
      >
        {t(`approvals.stepStatus.${status}`)}
      </Badge>
    );
  };

  const getCurrentStepInfo = (request: ApprovalRequest) => {
    const currentStep = request.steps.find(step => step.step_number === request.current_step);
    return currentStep || request.steps[0];
  };

  const columns = [
    {
      key: "title",
      header: t("approvals.title"),
      cell: (request) => (
        <div className="font-medium">{request.title}</div>
      ),
    },
    {
      key: "entity",
      header: t("approvals.entity"),
      cell: (request) => (
        <span className="text-sm">
          {request.entity_type}:{request.entity_id}
        </span>
      ),
    },
    {
      key: "status",
      header: t("approvals.status.title"),
      cell: (request) => getStatusBadge(request.status),
    },
    {
      key: "requested_by",
      header: t("approvals.requestedBy"),
      cell: (request) => (
        <span className="text-sm">{request.requested_by}</span>
      ),
    },
    {
      key: "current_step",
      header: t("approvals.currentStep"),
      cell: (request) => {
        const stepInfo = getCurrentStepInfo(request);
        return stepInfo ? (
          <div className="space-y-2">
            <div className="text-sm font-medium">{stepInfo.approver_name}</div>
            <div>{getStepStatusBadge(stepInfo.status)}</div>
          </div>
        ) : (
          <span className="text-sm text-muted-foreground">-</span>
        );
      },
    },
    {
      key: "created_at",
      header: t("approvals.createdAt"),
      cell: (request) => (
        <span className="text-sm">
          {formatDate(request.created_at)}
        </span>
      ),
    },
    {
      key: "actions",
      header: t("common.actions"),
      cell: (request) => {
        const stepInfo = getCurrentStepInfo(request);
        const canApprove = request.status === "in_progress" && stepInfo?.status === "pending";
        
        return (
          <div className="flex space-x-2">
            <Button
              variant="outline"
              size="sm"
              onClick={() => onRequestSelect?.(request)}
            >
              {t("common.view")}
            </Button>
            {canApprove && (
              <>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => onRequestApprove?.(request)}
                  className="text-green-600 hover:text-green-700"
                >
                  {t("approvals.approve")}
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => onRequestReject?.(request)}
                  className="text-red-600 hover:text-red-700"
                >
                  {t("approvals.reject")}
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => onRequestDelegate?.(request)}
                  className="text-orange-600 hover:text-orange-700"
                >
                  {t("approvals.delegate")}
                </Button>
              </>
            )}
          </div>
        );
      },
    },
  ];

  if (loading) {
    return (
      <Card>
        <CardContent className="p-8">
          <div className="flex items-center space-x-2">
            <div className="animate-spin rounded-full h-4 w-4 border-2 border-primary" />
            <span>{t("approvals.loading")}</span>
          </div>
        </CardContent>
      </Card>
    );
  }

  if (!requests.length) {
    return (
      <Card>
        <CardContent className="p-8 text-center">
          <div className="text-muted-foreground">
            {t("approvals.noRequests")}
          </div>
          <Button onClick={onRequestCreate}>
            {t("approvals.createRequest")}
          </Button>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header with actions */}
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-bold">
          {t("approvals.title")}
        </h2>
        <div className="flex space-x-2">
          <Button onClick={onRefresh} disabled={loading}>
            {t("common.refresh")}
          </Button>
          <Button onClick={onRequestCreate}>
            {t("approvals.createRequest")}
          </Button>
        </div>
      </div>

      {/* Search bar */}
      <SearchBar
        placeholder={t("approvals.search.placeholder")}
        onChange={(value) => {
          // Handle search
        }}
      />

      {/* Requests table */}
      <DataTable
        columns={columns}
        data={requests}
        pagination={{
          page: 1,
          pageSize: 20,
          total: requests.length,
          onPageChange: () => {
            // Handle pagination
          },
        }}
      />
    </div>
  );
}
