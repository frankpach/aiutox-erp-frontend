/**
 * Automation Rule Form component
 * Form for creating and editing automation rules
 */

import { useState } from "react";
import { useTranslation } from "~/lib/i18n/useTranslation";
import { Button } from "~/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "~/components/ui/card";
import { Input } from "~/components/ui/input";
import { Textarea } from "~/components/ui/textarea";
import { Label } from "~/components/ui/label";
import { Switch } from "~/components/ui/switch";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "~/components/ui/select";
import { 
  useCreateAutomationRule, 
  useUpdateAutomationRule,
  useTriggerTypes,
  useActionTypes,
  useConditionOperators,
  useValidateAutomationRule
} from "../hooks/useAutomation";
import type { AutomationRule, AutomationRuleCreate, AutomationRuleUpdate } from "../types/automation.types";

interface AutomationRuleFormProps {
  rule?: AutomationRule;
  onSubmit?: (rule: AutomationRule) => void;
  onCancel?: () => void;
  loading?: boolean;
}

export function AutomationRuleForm({ rule, onSubmit, onCancel, loading }: AutomationRuleFormProps) {
  const { t } = useTranslation();
  const [formData, setFormData] = useState<Partial<AutomationRuleCreate | AutomationRuleUpdate>>({
    name: rule?.name || "",
    description: rule?.description || "",
    trigger: rule?.trigger || { type: "event" },
    conditions: rule?.conditions || [],
    actions: rule?.actions || [],
    is_active: rule?.is_active ?? true,
    priority: rule?.priority || 1,
  });

  useTriggerTypes();
  useActionTypes();
  useConditionOperators();

  const createRuleMutation = useCreateAutomationRule();
  const updateRuleMutation = useUpdateAutomationRule();
  const validateRuleMutation = useValidateAutomationRule();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    try {
      // Validate rule first
      await validateRuleMutation.mutateAsync(formData as AutomationRuleCreate);
      
      let result;
      if (rule) {
        result = await updateRuleMutation.mutateAsync({
          id: rule.id,
          payload: formData as AutomationRuleUpdate
        });
      } else {
        result = await createRuleMutation.mutateAsync(formData as AutomationRuleCreate);
      }
      
      if (result?.data) {
        onSubmit?.(result.data);
      }
    } catch (error) {
      console.error("Failed to save rule:", error);
    }
  };

  const handleInputChange = (field: string, value: unknown) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const addCondition = () => {
    setFormData(prev => ({
      ...prev,
      conditions: [...(prev.conditions || []), {
        field: "",
        operator: "eq",
        value: "",
        logical_operator: "and"
      }]
    }));
  };

  const updateCondition = (index: number, field: string, value: unknown) => {
    setFormData(prev => ({
      ...prev,
      conditions: prev.conditions?.map((condition, i) => 
        i === index ? { ...condition, [field]: value } : condition
      )
    }));
  };

  const removeCondition = (index: number) => {
    setFormData(prev => ({
      ...prev,
      conditions: prev.conditions?.filter((_, i) => i !== index)
    }));
  };

  const addAction = () => {
    setFormData(prev => ({
      ...prev,
      actions: [...(prev.actions || []), {
        type: "send_notification",
        channel: "email",
        template: "",
        recipients: []
      }]
    }));
  };

  const updateAction = (index: number, field: string, value: unknown) => {
    setFormData(prev => ({
      ...prev,
      actions: prev.actions?.map((action, i) => 
        i === index ? { ...action, [field]: value } : action
      )
    }));
  };

  const removeAction = (index: number) => {
    setFormData(prev => ({
      ...prev,
      actions: prev.actions?.filter((_, i) => i !== index)
    }));
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      {/* Basic Information */}
      <Card>
        <CardHeader>
          <CardTitle>{t("automation.form.basic")}</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div>
            <Label htmlFor="name">{t("automation.form.name")}</Label>
            <Input
              id="name"
              value={formData.name}
              onChange={(e) => handleInputChange("name", e.target.value)}
              placeholder={t("automation.form.namePlaceholder")}
              required
            />
          </div>
          
          <div>
            <Label htmlFor="description">{t("automation.form.description")}</Label>
            <Textarea
              id="description"
              value={formData.description}
              onChange={(e) => handleInputChange("description", e.target.value)}
              placeholder={t("automation.form.descriptionPlaceholder")}
              rows={3}
            />
          </div>

          <div className="flex items-center space-x-2">
            <Switch
              id="is_active"
              checked={formData.is_active}
              onCheckedChange={(checked) => handleInputChange("is_active", checked)}
            />
            <Label htmlFor="is_active">{t("automation.form.active")}</Label>
          </div>

          <div>
            <Label htmlFor="priority">{t("automation.form.priority")}</Label>
            <Input
              id="priority"
              type="number"
              min="1"
              max="100"
              value={formData.priority}
              onChange={(e) => handleInputChange("priority", parseInt(e.target.value))}
            />
          </div>
        </CardContent>
      </Card>

      {/* Trigger Configuration */}
      <Card>
        <CardHeader>
          <CardTitle>{t("automation.form.trigger")}</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div>
            <Label htmlFor="trigger_type">{t("automation.form.triggerType")}</Label>
            <Select
              value={formData.trigger?.type}
              onValueChange={(value) => handleInputChange("trigger", { ...formData.trigger, type: value })}
            >
              <SelectTrigger>
                <SelectValue placeholder={t("automation.form.triggerTypePlaceholder")} />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="event">{t("automation.trigger.event")}</SelectItem>
                <SelectItem value="schedule">{t("automation.trigger.schedule")}</SelectItem>
                <SelectItem value="manual">{t("automation.trigger.manual")}</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {formData.trigger?.type === "event" && (
            <>
              <div>
                <Label htmlFor="event_type">{t("automation.form.eventType")}</Label>
                <Input
                  id="event_type"
                  value={formData.trigger?.event_type || ""}
                  onChange={(e) => handleInputChange("trigger", { ...formData.trigger, event_type: e.target.value })}
                  placeholder={t("automation.form.eventTypePlaceholder")}
                />
              </div>
              
              <div>
                <Label htmlFor="entity_type">{t("automation.form.entityType")}</Label>
                <Input
                  id="entity_type"
                  value={formData.trigger?.entity_type || ""}
                  onChange={(e) => handleInputChange("trigger", { ...formData.trigger, entity_type: e.target.value })}
                  placeholder={t("automation.form.entityTypePlaceholder")}
                />
              </div>
            </>
          )}

          {formData.trigger?.type === "schedule" && (
            <>
              <div>
                <Label htmlFor="schedule_type">{t("automation.form.scheduleType")}</Label>
                <Select
                  value={formData.trigger?.schedule?.type}
                  onValueChange={(value) => handleInputChange("trigger", { 
                    ...formData.trigger, 
                    schedule: { ...formData.trigger?.schedule, type: value }
                  })}
                >
                  <SelectTrigger>
                    <SelectValue placeholder={t("automation.form.scheduleTypePlaceholder")} />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="cron">{t("automation.schedule.cron")}</SelectItem>
                    <SelectItem value="interval">{t("automation.schedule.interval")}</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              {formData.trigger?.schedule?.type === "cron" && (
                <div>
                  <Label htmlFor="cron_expression">{t("automation.form.cronExpression")}</Label>
                  <Input
                    id="cron_expression"
                    value={formData.trigger?.schedule?.expression || ""}
                    onChange={(e) => handleInputChange("trigger", { 
                      ...formData.trigger, 
                      schedule: { ...formData.trigger?.schedule, expression: e.target.value }
                    })}
                    placeholder={t("automation.form.cronExpressionPlaceholder")}
                  />
                </div>
              )}

              {formData.trigger?.schedule?.type === "interval" && (
                <div>
                  <Label htmlFor="interval_seconds">{t("automation.form.intervalSeconds")}</Label>
                  <Input
                    id="interval_seconds"
                    type="number"
                    min="60"
                    value={formData.trigger?.schedule?.interval_seconds || ""}
                    onChange={(e) => handleInputChange("trigger", { 
                      ...formData.trigger, 
                      schedule: { ...formData.trigger?.schedule, interval_seconds: parseInt(e.target.value) }
                    })}
                    placeholder={t("automation.form.intervalSecondsPlaceholder")}
                  />
                </div>
              )}
            </>
          )}
        </CardContent>
      </Card>

      {/* Conditions */}
      <Card>
        <CardHeader>
          <CardTitle>{t("automation.form.conditions")}</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          {formData.conditions?.map((condition, index) => (
            <div key={index} className="border rounded-lg p-4 space-y-4">
              <div className="flex items-center justify-between">
                <h4 className="font-medium">{t("automation.form.condition")}</h4>
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={() => removeCondition(index)}
                >
                  {t("common.remove")}
                </Button>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                <div>
                  <Label>{t("automation.form.field")}</Label>
                  <Input
                    value={condition.field}
                    onChange={(e) => updateCondition(index, "field", e.target.value)}
                    placeholder={t("automation.form.fieldPlaceholder")}
                  />
                </div>

                <div>
                  <Label>{t("automation.form.operator")}</Label>
                  <Select
                    value={condition.operator}
                    onValueChange={(value) => updateCondition(index, "operator", value)}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="eq">=</SelectItem>
                      <SelectItem value="ne">≠</SelectItem>
                      <SelectItem value="gt">&gt;</SelectItem>
                      <SelectItem value="gte">≥</SelectItem>
                      <SelectItem value="lt">&lt;</SelectItem>
                      <SelectItem value="lte">≤</SelectItem>
                      <SelectItem value="in">in</SelectItem>
                      <SelectItem value="nin">not in</SelectItem>
                      <SelectItem value="contains">contains</SelectItem>
                      <SelectItem value="not_contains">not contains</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div>
                  <Label>{t("automation.form.value")}</Label>
                  <Input
                    value={String(condition.value ?? "")}
                    onChange={(e) => updateCondition(index, "value", e.target.value)}
                    placeholder={t("automation.form.valuePlaceholder")}
                  />
                </div>

                <div>
                  <Label>{t("automation.form.logicalOperator")}</Label>
                  <Select
                    value={condition.logical_operator}
                    onValueChange={(value) => updateCondition(index, "logical_operator", value)}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="and">{t("automation.logical.and")}</SelectItem>
                      <SelectItem value="or">{t("automation.logical.or")}</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
            </div>
          ))}

          <Button
            type="button"
            variant="outline"
            onClick={addCondition}
          >
            {t("automation.form.addCondition")}
          </Button>
        </CardContent>
      </Card>

      {/* Actions */}
      <Card>
        <CardHeader>
          <CardTitle>{t("automation.form.actions")}</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          {formData.actions?.map((action, index) => (
            <div key={index} className="border rounded-lg p-4 space-y-4">
              <div className="flex items-center justify-between">
                <h4 className="font-medium">{t("automation.form.action")}</h4>
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={() => removeAction(index)}
                >
                  {t("common.remove")}
                </Button>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <Label>{t("automation.form.actionType")}</Label>
                  <Select
                    value={action.type}
                    onValueChange={(value) => updateAction(index, "type", value)}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="send_notification">{t("automation.action.sendNotification")}</SelectItem>
                      <SelectItem value="create_task">{t("automation.action.createTask")}</SelectItem>
                      <SelectItem value="update_entity">{t("automation.action.updateEntity")}</SelectItem>
                      <SelectItem value="send_webhook">{t("automation.action.sendWebhook")}</SelectItem>
                      <SelectItem value="publish_event">{t("automation.action.publishEvent")}</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                {action.type === "send_notification" && (
                  <>
                    <div>
                      <Label>{t("automation.form.channel")}</Label>
                      <Select
                        value={action.channel}
                        onValueChange={(value) => updateAction(index, "channel", value)}
                      >
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="email">{t("automation.channel.email")}</SelectItem>
                          <SelectItem value="sms">{t("automation.channel.sms")}</SelectItem>
                          <SelectItem value="webhook">{t("automation.channel.webhook")}</SelectItem>
                          <SelectItem value="in-app">{t("automation.channel.inApp")}</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>

                    <div>
                      <Label>{t("automation.form.template")}</Label>
                      <Input
                        value={action.template}
                        onChange={(e) => updateAction(index, "template", e.target.value)}
                        placeholder={t("automation.form.templatePlaceholder")}
                      />
                    </div>

                    <div>
                      <Label>{t("automation.form.recipients")}</Label>
                      <Input
                        value={action.recipients?.join(", ") || ""}
                        onChange={(e) => updateAction(index, "recipients", e.target.value.split(",").map((r: string) => r.trim()))}
                        placeholder={t("automation.form.recipientsPlaceholder")}
                      />
                    </div>
                  </>
                )}

                {action.type === "send_webhook" && (
                  <div>
                    <Label>{t("automation.form.webhookUrl")}</Label>
                    <Input
                      value={action.webhook_url}
                      onChange={(e) => updateAction(index, "webhook_url", e.target.value)}
                      placeholder={t("automation.form.webhookUrlPlaceholder")}
                    />
                  </div>
                )}

                {action.type === "publish_event" && (
                  <>
                    <div>
                      <Label>{t("automation.form.eventType")}</Label>
                      <Input
                        value={action.event_type}
                        onChange={(e) => updateAction(index, "event_type", e.target.value)}
                        placeholder={t("automation.form.eventTypePlaceholder")}
                      />
                    </div>

                    <div>
                      <Label>{t("automation.form.eventData")}</Label>
                      <Textarea
                        value={JSON.stringify(action.event_data || {}, null, 2)}
                        onChange={(e) => {
                          try {
                            const data = JSON.parse(e.target.value);
                            updateAction(index, "event_data", data);
                          } catch (error) {
                            // Invalid JSON, ignore
                          }
                        }}
                        placeholder={t("automation.form.eventDataPlaceholder")}
                        rows={3}
                      />
                    </div>
                  </>
                )}
              </div>
            </div>
          ))}

          <Button
            type="button"
            variant="outline"
            onClick={addAction}
          >
            {t("automation.form.addAction")}
          </Button>
        </CardContent>
      </Card>

      {/* Form Actions */}
      <div className="flex justify-end space-x-2">
        <Button
          type="button"
          variant="outline"
          onClick={onCancel}
          disabled={loading}
        >
          {t("common.cancel")}
        </Button>
        <Button
          type="submit"
          disabled={loading || createRuleMutation.isPending || updateRuleMutation.isPending}
        >
          {loading || createRuleMutation.isPending || updateRuleMutation.isPending 
            ? t("common.saving") 
            : (rule ? t("common.update") : t("common.create"))
          }
        </Button>
      </div>
    </form>
  );
}
