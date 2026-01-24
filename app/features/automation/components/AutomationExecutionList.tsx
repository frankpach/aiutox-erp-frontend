/**
 * Automation Execution List component
 * Displays execution history for automation rules
 */

import { useState } from "react";
import { useTranslation } from "~/lib/i18n/useTranslation";
import { DataTable } from "~/components/common/DataTable";
import { Button } from "~/components/ui/button";
import { Badge } from "~/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "~/components/ui/card";
import { EmptyState } from "~/components/common/EmptyState";
import { LoadingState } from "~/components/common/LoadingState";
import { ErrorState } from "~/components/common/ErrorState";
import { 
  useAutomationExecutions, 
  useAutomationExecution 
} from "../hooks/useAutomation";
import type { AutomationExecution } from "../types/automation.types";

interface AutomationExecutionListProps {
  ruleId: string;
  onBack?: () => void;
}

export function AutomationExecutionList({ ruleId, onBack }: AutomationExecutionListProps) {
  const { t } = useTranslation();
  const [selectedExecution, setSelectedExecution] = useState<AutomationExecution | null>(null);

  // Queries
  const { data: executionsData, isLoading, error, refetch } = useAutomationExecutions(ruleId);
  const { data: executionDetail, isLoading: detailLoading } = useAutomationExecution(selectedExecution?.id || "");

  const executions = executionsData?.data || [];
  const meta = executionsData?.meta;

  const handleViewExecution = (execution: AutomationExecution) => {
    setSelectedExecution(execution);
  };

  // Table columns
  const columns = [
    {
      key: "id",
      title: t("automation.executions.table.id"),
      render: (execution: AutomationExecution) => (
        <div className="font-mono text-sm">{execution.id.substring(0, 8)}...</div>
      ),
    },
    {
      key: "status",
      title: t("automation.executions.table.status"),
      render: (execution: AutomationExecution) => {
        const statusColors = {
          pending: "secondary",
          running: "default",
          completed: "default",
          failed: "destructive",
        } as const;
        
        return (
          <Badge variant={statusColors[execution.status]}>
            {t(`automation.executions.status.${execution.status}`)}
          </Badge>
        );
      },
    },
    {
      key: "started_at",
      title: t("automation.executions.table.startedAt"),
      render: (execution: AutomationExecution) => (
        <div className="text-sm">
          {new Date(execution.started_at).toLocaleString()}
        </div>
      ),
    },
    {
      key: "completed_at",
      title: t("automation.executions.table.completedAt"),
      render: (execution: AutomationExecution) => (
        <div className="text-sm">
          {execution.completed_at 
            ? new Date(execution.completed_at).toLocaleString()
            : "-"
          }
        </div>
      ),
    },
    {
      key: "duration",
      title: t("automation.executions.table.duration"),
      render: (execution: AutomationExecution) => {
        if (!execution.completed_at) return "-";
        
        const duration = new Date(execution.completed_at).getTime() - new Date(execution.started_at).getTime();
        const seconds = Math.floor(duration / 1000);
        const minutes = Math.floor(seconds / 60);
        
        if (minutes > 0) {
          return `${minutes}m ${seconds % 60}s`;
        }
        return `${seconds}s`;
      },
    },
    {
      key: "actions",
      title: t("automation.executions.table.actions"),
      render: (execution: AutomationExecution) => (
        <Button
          variant="ghost"
          size="sm"
          onClick={() => handleViewExecution(execution)}
        >
          {t("common.view")}
        </Button>
      ),
    },
  ];

  if (isLoading) {
    return <LoadingState />;
  }

  if (error) {
    return <ErrorState message={error instanceof Error ? error.message : t("automation.error.loading")} />;
  }

  if (executions.length === 0) {
    return (
      <EmptyState
        title={t("automation.executions.empty.title")}
        description={t("automation.executions.empty.description")}
      />
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-bold">{t("automation.executions.title")}</h2>
        {onBack && (
          <Button variant="outline" onClick={onBack}>
            {t("common.back")}
          </Button>
        )}
      </div>

      <Card>
        <CardHeader>
          <CardTitle>{t("automation.executions.history")}</CardTitle>
        </CardHeader>
        <CardContent>
          <DataTable
            data={executions}
            columns={columns}
            pagination={{
              currentPage: meta?.page || 1,
              totalPages: meta?.total_pages || 1,
              onPageChange: (page) => {
                // Handle page change
                refetch();
              },
            }}
          />
        </CardContent>
      </Card>

      {/* Execution Detail */}
      {selectedExecution && (
        <Card>
          <CardHeader>
            <CardTitle>{t("automation.executions.detail")}</CardTitle>
          </CardHeader>
          <CardContent>
            {detailLoading ? (
              <LoadingState />
            ) : executionDetail ? (
              <div className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <h4 className="font-medium">{t("automation.executions.executionId")}</h4>
                    <p className="font-mono text-sm">{executionDetail.id}</p>
                  </div>
                  <div>
                    <h4 className="font-medium">{t("automation.executions.status")}</h4>
                    <Badge variant={executionDetail.status === "completed" ? "default" : executionDetail.status === "failed" ? "destructive" : "secondary"}>
                      {t(`automation.executions.status.${executionDetail.status}`)}
                    </Badge>
                  </div>
                  <div>
                    <h4 className="font-medium">{t("automation.executions.startedAt")}</h4>
                    <p>{new Date(executionDetail.started_at).toLocaleString()}</p>
                  </div>
                  <div>
                    <h4 className="font-medium">{t("automation.executions.completedAt")}</h4>
                    <p>
                      {executionDetail.completed_at 
                        ? new Date(executionDetail.completed_at).toLocaleString()
                        : "-"
                      }
                    </p>
                  </div>
                </div>

                {executionDetail.trigger_data && (
                  <div>
                    <h4 className="font-medium mb-2">{t("automation.executions.triggerData")}</h4>
                    <pre className="bg-gray-100 p-4 rounded-md text-sm overflow-auto">
                      {JSON.stringify(executionDetail.trigger_data, null, 2)}
                    </pre>
                  </div>
                )}

                {executionDetail.result && (
                  <div>
                    <h4 className="font-medium mb-2">{t("automation.executions.result")}</h4>
                    <pre className="bg-gray-100 p-4 rounded-md text-sm overflow-auto">
                      {JSON.stringify(executionDetail.result, null, 2)}
                    </pre>
                  </div>
                )}

                {executionDetail.error_message && (
                  <div>
                    <h4 className="font-medium mb-2 text-red-600">{t("automation.executions.error")}</h4>
                    <div className="bg-red-50 border border-red-200 p-4 rounded-md">
                      <p className="text-red-800">{executionDetail.error_message}</p>
                    </div>
                  </div>
                )}
              </div>
            ) : null}
          </CardContent>
        </Card>
      )}
    </div>
  );
}
