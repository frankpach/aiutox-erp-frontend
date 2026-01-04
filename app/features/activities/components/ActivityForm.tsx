/**
 * ActivityForm component
 * Form for creating and editing activities
 */

import { useState } from "react";
import { useTranslation } from "~/lib/i18n/useTranslation";
import { Button } from "~/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "~/components/ui/card";
import { Input } from "~/components/ui/input";
import { Textarea } from "~/components/ui/textarea";
import { Label } from "~/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "~/components/ui/select";
import { Activity, ActivityCreate, ActivityUpdate, ActivityType } from "~/features/activities/types/activity.types";

interface ActivityFormProps {
  activity?: Activity;
  onSubmit: (data: ActivityCreate | ActivityUpdate) => void;
  onCancel: () => void;
  loading?: boolean;
  entityType?: string;
  entityId?: string;
}

const activityTypes: { value: ActivityType; label: string }[] = [
  { value: "comment", label: "activities.types.comment" },
  { value: "call", label: "activities.types.call" },
  { value: "email", label: "activities.types.email" },
  { value: "meeting", label: "activities.types.meeting" },
  { value: "task", label: "activities.types.task" },
  { value: "status_change", label: "activities.types.status_change" },
  { value: "note", label: "activities.types.note" },
  { value: "file_upload", label: "activities.types.file_upload" },
  { value: "custom", label: "activities.types.custom" },
];

export function ActivityForm({ activity, onSubmit, onCancel, loading, entityType, entityId }: ActivityFormProps) {
  const { t } = useTranslation();
  const [formData, setFormData] = useState<ActivityCreate | ActivityUpdate>({
    title: activity?.title || "",
    description: activity?.description || "",
    activity_type: activity?.activity_type || "comment",
    metadata: activity?.metadata || {},
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    const submitData = {
      ...formData,
      ...(entityType && entityId && { entity_type: entityType, entity_id: entityId }),
    };
    
    onSubmit(submitData);
  };

  const handleInputChange = (field: string, value: string) => {
    setFormData(prev => ({
      ...prev,
      [field]: value,
    }));
  };

  const handleMetadataChange = (key: string, value: string) => {
    setFormData(prev => ({
      ...prev,
      metadata: {
        ...prev.metadata,
        [key]: value,
      },
    }));
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>
          {activity ? t("activities.editActivity") : t("activities.createActivity")}
        </CardTitle>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="activity_type">
                {t("activities.types.title")}
              </Label>
              <Select
                value={formData.activity_type}
                onValueChange={(value) => handleInputChange("activity_type", value)}
                disabled={!!activity}
              >
                <SelectTrigger>
                  <SelectValue placeholder={t("activities.types.select")} />
                </SelectTrigger>
                <SelectContent>
                  {activityTypes.map((type) => (
                    <SelectItem key={type.value} value={type.value}>
                      {t(type.label)}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="title">
                {t("activities.title")}
              </Label>
              <Input
                id="title"
                value={formData.title}
                onChange={(e) => handleInputChange("title", e.target.value)}
                placeholder={t("activities.title.placeholder")}
                required
              />
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="description">
              {t("activities.description")}
            </Label>
            <Textarea
              id="description"
              value={formData.description}
              onChange={(e) => handleInputChange("description", e.target.value)}
              placeholder={t("activities.description.placeholder")}
              rows={3}
            />
          </div>

          {/* Metadata fields */}
          <div className="space-y-4">
            <h4 className="text-sm font-medium">
              {t("activities.metadata")}
            </h4>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="priority">
                  {t("activities.metadata.priority")}
                </Label>
                <Select
                  value={formData.metadata?.priority || "medium"}
                  onValueChange={(value) => handleMetadataChange("priority", value)}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="low">{t("activities.priority.low")}</SelectItem>
                    <SelectItem value="medium">{t("activities.priority.medium")}</SelectItem>
                    <SelectItem value="high">{t("activities.priority.high")}</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label htmlFor="assigned_to">
                  {t("activities.metadata.assignedTo")}
                </Label>
                <Input
                  id="assigned_to"
                  value={formData.metadata?.assigned_to || ""}
                  onChange={(e) => handleMetadataChange("assigned_to", e.target.value)}
                  placeholder={t("activities.metadata.assignedTo.placeholder")}
                />
              </div>
            </div>
          </div>

          <div className="flex justify-end space-x-2 pt-4">
            <Button type="button" variant="outline" onClick={onCancel} disabled={loading}>
              {t("common.cancel")}
            </Button>
            <Button type="submit" disabled={loading}>
              {loading ? t("common.saving") : t("common.save")}
            </Button>
          </div>
        </form>
      </CardContent>
    </Card>
  );
}
