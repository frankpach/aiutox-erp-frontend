/**
 * Automation page
 * Main page for automation rules management
 */

import { useState } from "react";
import { useTranslation } from "~/lib/i18n/useTranslation";
import { PageLayout } from "~/components/layout/PageLayout";
import { Button } from "~/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "~/components/ui/dialog";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "~/components/ui/tabs";
import { AutomationRuleList } from "~/features/automation/components/AutomationRuleList";
import { AutomationRuleForm } from "~/features/automation/components/AutomationRuleForm";
import { AutomationExecutionList } from "~/features/automation/components/AutomationExecutionList";
import { 
  useAutomationRule,
  useCreateAutomationRule,
  useUpdateAutomationRule
} from "~/features/automation/hooks/useAutomation";
import type { AutomationRule } from "~/features/automation/types/automation.types";

export default function AutomationPage() {
  const { t } = useTranslation();
  const [currentTab, setCurrentTab] = useState("rules");
  const [showCreateDialog, setShowCreateDialog] = useState(false);
  const [showEditDialog, setShowEditDialog] = useState(false);
  const [selectedRule, setSelectedRule] = useState<AutomationRule | null>(null);
  const [executionsRuleId, setExecutionsRuleId] = useState<string | null>(null);

  // Queries
  const createRuleMutation = useCreateAutomationRule();
  const updateRuleMutation = useUpdateAutomationRule();

  const handleCreateRule = () => {
    setSelectedRule(null);
    setShowCreateDialog(true);
  };

  const handleEditRule = (rule: AutomationRule) => {
    setSelectedRule(rule);
    setShowEditDialog(true);
  };

  const handleViewRule = (rule: AutomationRule) => {
    setSelectedRule(rule);
    // Could open a detail view in the future
  };

  const handleExecutions = (rule: AutomationRule) => {
    setExecutionsRuleId(rule.id);
    setCurrentTab("executions");
  };

  const handleRuleSubmit = (rule: AutomationRule) => {
    if (showCreateDialog) {
      setShowCreateDialog(false);
    } else if (showEditDialog) {
      setShowEditDialog(false);
      setSelectedRule(null);
    }
    setCurrentTab("rules");
  };

  const handleRuleCancel = () => {
    setShowCreateDialog(false);
    setShowEditDialog(false);
    setSelectedRule(null);
  };

  const handleBackToRules = () => {
    setCurrentTab("rules");
    setExecutionsRuleId(null);
  };

  const renderCurrentTab = () => {
    switch (currentTab) {
      case "rules":
        return (
          <AutomationRuleList
            onCreate={handleCreateRule}
            onEdit={handleEditRule}
            onView={handleViewRule}
            onExecutions={handleExecutions}
          />
        );

      case "executions":
        return (
          executionsRuleId ? (
            <AutomationExecutionList
              ruleId={executionsRuleId}
              onBack={handleBackToRules}
            />
          ) : null
        );

      default:
        return null;
    }
  };

  return (
    <PageLayout
      title={t("automation.title")}
      description={t("automation.description")}
    >
      <div className="space-y-6">
        {/* Main Tabs */}
        <Tabs value={currentTab} onValueChange={setCurrentTab}>
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="rules">{t("automation.tabs.rules")}</TabsTrigger>
            <TabsTrigger value="executions">{t("automation.tabs.executions")}</TabsTrigger>
          </TabsList>

          <TabsContent value="rules" className="space-y-6">
            <AutomationRuleList
              onCreate={handleCreateRule}
              onEdit={handleEditRule}
              onView={handleViewRule}
              onExecutions={handleExecutions}
            />
          </TabsContent>

          <TabsContent value="executions" className="space-y-6">
            {renderCurrentTab()}
          </TabsContent>
        </Tabs>

        {/* Create Rule Dialog */}
        <Dialog open={showCreateDialog} onOpenChange={setShowCreateDialog}>
          <DialogContent className="max-w-6xl max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle>{t("automation.rules.create")}</DialogTitle>
            </DialogHeader>
            <AutomationRuleForm
              onSubmit={handleRuleSubmit}
              onCancel={handleRuleCancel}
              loading={createRuleMutation.isPending}
            />
          </DialogContent>
        </Dialog>

        {/* Edit Rule Dialog */}
        <Dialog open={showEditDialog} onOpenChange={setShowEditDialog}>
          <DialogContent className="max-w-6xl max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle>{t("automation.rules.edit")}</DialogTitle>
            </DialogHeader>
            <AutomationRuleForm
              rule={selectedRule || undefined}
              onSubmit={handleRuleSubmit}
              onCancel={handleRuleCancel}
              loading={updateRuleMutation.isPending}
            />
          </DialogContent>
        </Dialog>
      </div>
    </PageLayout>
  );
}
