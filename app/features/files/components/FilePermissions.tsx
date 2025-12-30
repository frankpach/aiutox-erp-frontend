/**
 * FilePermissions Component
 * Manages file permissions
 */

import { useState } from "react";
import { Save, User, Shield, Building2 } from "lucide-react";
import { Button } from "~/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "~/components/ui/card";
import { Checkbox } from "~/components/ui/checkbox";
import { Label } from "~/components/ui/label";
import { Input } from "~/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "~/components/ui/select";
import { useTranslation } from "~/lib/i18n/useTranslation";
import { useFilePermissionsUpdate } from "../hooks/useFiles";
import { showToast } from "~/components/common/Toast";
import type { FilePermissionRequest } from "../types/file.types";

export interface FilePermissionsProps {
  fileId: string;
  initialPermissions?: FilePermissionRequest[];
}

/**
 * FilePermissions component
 */
export function FilePermissions({
  fileId,
  initialPermissions = [],
}: FilePermissionsProps) {
  const { t } = useTranslation();
  const [permissions, setPermissions] = useState<FilePermissionRequest[]>(
    initialPermissions
  );
  const [newPermission, setNewPermission] = useState<FilePermissionRequest>({
    target_type: "user",
    target_id: "",
    can_view: true,
    can_download: true,
    can_edit: false,
    can_delete: false,
  });

  const { mutate: updatePermissions, isPending: updating } =
    useFilePermissionsUpdate();

  const handleAddPermission = () => {
    if (!newPermission.target_id) {
      showToast("ID de objetivo requerido", "error");
      return;
    }

    setPermissions([...permissions, { ...newPermission }]);
    setNewPermission({
      target_type: "user",
      target_id: "",
      can_view: true,
      can_download: true,
      can_edit: false,
      can_delete: false,
    });
  };

  const handleRemovePermission = (index: number) => {
    setPermissions(permissions.filter((_, i) => i !== index));
  };

  const handleUpdatePermission = (
    index: number,
    field: keyof FilePermissionRequest,
    value: boolean | string
  ) => {
    const updated = [...permissions];
    updated[index] = { ...updated[index], [field]: value };
    setPermissions(updated);
  };

  const handleSave = () => {
    updatePermissions(
      { fileId, permissions },
      {
        onSuccess: () => {
          showToast(t("files.permissionsSuccess"), "success");
        },
        onError: () => {
          showToast(t("files.permissionsError"), "error");
        },
      }
    );
  };

  const getTargetTypeIcon = (type: string) => {
    switch (type) {
      case "user":
        return <User className="h-4 w-4" />;
      case "role":
        return <Shield className="h-4 w-4" />;
      case "organization":
        return <Building2 className="h-4 w-4" />;
      default:
        return null;
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>{t("files.permissions")}</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Add new permission */}
        <div className="flex gap-2 items-end">
          <div className="flex-1">
            <Label>{t("files.targetType")}</Label>
            <Select
              value={newPermission.target_type}
              onValueChange={(value: "user" | "role" | "organization") =>
                setNewPermission({ ...newPermission, target_type: value })
              }
            >
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="user">Usuario</SelectItem>
                <SelectItem value="role">Rol</SelectItem>
                <SelectItem value="organization">Organización</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <div className="flex-1">
            <Label>{t("files.targetId")}</Label>
            <Input
              value={newPermission.target_id}
              onChange={(e) =>
                setNewPermission({ ...newPermission, target_id: e.target.value })
              }
              placeholder="UUID"
            />
          </div>
          <Button onClick={handleAddPermission} variant="outline">
            Agregar
          </Button>
        </div>

        {/* Permissions list */}
        {permissions.length > 0 && (
          <div className="space-y-2">
            {permissions.map((perm, index) => (
              <div
                key={index}
                className="flex items-center gap-4 p-3 border rounded-md"
              >
                <div className="flex items-center gap-2 flex-1">
                  {getTargetTypeIcon(perm.target_type)}
                  <span className="font-medium">
                    {perm.target_type}: {perm.target_id}
                  </span>
                </div>
                <div className="flex items-center gap-4">
                  <div className="flex items-center gap-2">
                    <Checkbox
                      checked={perm.can_view}
                      onCheckedChange={(checked) =>
                        handleUpdatePermission(
                          index,
                          "can_view",
                          checked === true
                        )
                      }
                    />
                    <Label className="text-sm">{t("files.canView")}</Label>
                  </div>
                  <div className="flex items-center gap-2">
                    <Checkbox
                      checked={perm.can_download}
                      onCheckedChange={(checked) =>
                        handleUpdatePermission(
                          index,
                          "can_download",
                          checked === true
                        )
                      }
                    />
                    <Label className="text-sm">{t("files.canDownload")}</Label>
                  </div>
                  <div className="flex items-center gap-2">
                    <Checkbox
                      checked={perm.can_edit}
                      onCheckedChange={(checked) =>
                        handleUpdatePermission(
                          index,
                          "can_edit",
                          checked === true
                        )
                      }
                    />
                    <Label className="text-sm">{t("files.canEdit")}</Label>
                  </div>
                  <div className="flex items-center gap-2">
                    <Checkbox
                      checked={perm.can_delete}
                      onCheckedChange={(checked) =>
                        handleUpdatePermission(
                          index,
                          "can_delete",
                          checked === true
                        )
                      }
                    />
                    <Label className="text-sm">{t("files.canDelete")}</Label>
                  </div>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => handleRemovePermission(index)}
                  >
                    Eliminar
                  </Button>
                </div>
              </div>
            ))}
          </div>
        )}

        <Button
          onClick={handleSave}
          disabled={updating || permissions.length === 0}
          className="w-full"
        >
          <Save className="h-4 w-4 mr-2" />
          {t("files.updatePermissions")}
        </Button>
      </CardContent>
    </Card>
  );
}


