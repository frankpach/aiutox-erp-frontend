/**
 * FileUpload Component
 * Handles file upload with drag & drop support and permissions
 */

import { useCallback, useState, useRef } from "react";
import { Upload, CheckCircle } from "lucide-react";
import { Button } from "~/components/ui/button";
import { Card, CardContent } from "~/components/ui/card";
import { Progress } from "~/components/ui/progress";
import { Badge } from "~/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "~/components/ui/tabs";
import { showToast } from "~/components/common/Toast";
import { useTranslation } from "~/lib/i18n/useTranslation";
import { useFileUpload } from "../hooks/useFiles";
import { FilePermissionsSelector } from "./FilePermissionsSelector";
import { useUsers } from "~/features/users/hooks/useUsers";
import { useOrganizations } from "~/features/users/hooks/useOrganizations";
import { listRoles } from "~/features/users/api/roles.api";
import { useQuery } from "@tanstack/react-query";
import { cn } from "~/lib/utils";
import type { FileUploadParams, FilePermissionRequest } from "../types/file.types";

export interface FileUploadProps {
  entityType?: string | null;
  entityId?: string | null;
  folderId?: string | null;
  description?: string | null;
  onUploadSuccess?: () => void;
  multiple?: boolean;
  accept?: string;
  maxSize?: number; // in bytes
  showPermissions?: boolean;
}

/**
 * FileUpload component with drag & drop
 */
export function FileUpload({
  entityType,
  entityId,
  folderId,
  description,
  onUploadSuccess,
  multiple = false,
  accept,
  maxSize,
  showPermissions = true,
}: FileUploadProps) {
  const [isDragging, setIsDragging] = useState(false);
  const [uploadProgress, setUploadProgress] = useState<Record<string, number>>({});
  const [permissions, setPermissions] = useState<FilePermissionRequest[]>([]);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const { t } = useTranslation();
  const { mutate: uploadFile, isPending: uploading } = useFileUpload();

  // Load users, roles, and organizations for permissions selector
  const { users } = useUsers({ page_size: 100 });
  // useOrganizations now handles 404 gracefully, so we don't need to check error
  const { organizations } = useOrganizations({ page_size: 100 });
  const { data: rolesData } = useQuery({
    queryKey: ["roles"],
    queryFn: async () => {
      const response = await listRoles();
      return response.data || [];
    },
  });

  // Transform data for permissions selector
  const availableUsers = (users || []).map((u) => ({
    id: u.id,
    name: u.full_name || `${u.first_name || ""} ${u.last_name || ""}`.trim() || u.email,
    email: u.email,
  }));

  const availableRoles = (rolesData || []).map((r) => ({
    id: r.role,
    name: r.role,
  }));

  // Only use organizations if the endpoint is available (handle 404 gracefully)
  // The hook now handles 404 silently, so we just check if organizations exist
  const availableOrganizations = organizations
    ? organizations.map((o) => ({
        id: o.id,
        name: o.name,
      }))
    : [];

  const handleDragEnter = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(true);
  }, []);

  const handleDragLeave = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(false);
  }, []);

  const handleDragOver = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
  }, []);

  const handleDrop = useCallback(
    (e: React.DragEvent) => {
      e.preventDefault();
      e.stopPropagation();
      setIsDragging(false);

      const files = Array.from(e.dataTransfer.files);
      if (files.length === 0) return;

      if (!multiple && files.length > 1) {
        showToast(t("files.uploadError"), "error");
        return;
      }

      handleFiles(files);
    },
    [multiple, t]
  );

  const handleFileSelect = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      const files = Array.from(e.target.files || []);
      if (files.length === 0) return;

      if (!multiple && files.length > 1) {
        showToast(t("files.uploadError"), "error");
        return;
      }

      handleFiles(files);
    },
    [multiple, t]
  );

  const handleFiles = useCallback(
    (files: File[]) => {
      files.forEach((file) => {
        // Validate file size
        if (maxSize && file.size > maxSize) {
          showToast(t("files.fileTooLarge"), "error");
          return;
        }

        // Validate file type
        if (accept) {
          const acceptedTypes = accept.split(",").map((t) => t.trim());
          const fileType = file.type || "";
          const fileExtension = `.${file.name.split(".").pop()?.toLowerCase()}`;

          const isAccepted =
            acceptedTypes.some(
              (type) =>
                fileType === type ||
                (type.startsWith(".") && fileExtension === type) ||
                (type.endsWith("/*") &&
                  fileType.startsWith(type.slice(0, -2)))
            );

          if (!isAccepted) {
            showToast(t("files.invalidFileType"), "error");
            return;
          }
        }

        // Upload file
        const uploadParams: FileUploadParams = {
          file,
          entity_type: entityType || undefined,
          entity_id: entityId || undefined,
          folder_id: folderId || undefined,
          description: description || undefined,
          permissions: permissions.length > 0 ? permissions : undefined,
          onProgress: (progress) => {
            setUploadProgress((prev) => ({
              ...prev,
              [file.name]: progress,
            }));
          },
        };

        uploadFile(uploadParams, {
          onSuccess: () => {
            showToast(t("files.uploadSuccess"), "success");
            setUploadProgress((prev) => {
              const newProgress = { ...prev };
              delete newProgress[file.name];
              return newProgress;
            });
            // Clear permissions after successful upload
            setPermissions([]);
            onUploadSuccess?.();
          },
          onError: () => {
            showToast(t("files.uploadError"), "error");
            setUploadProgress((prev) => {
              const newProgress = { ...prev };
              delete newProgress[file.name];
              return newProgress;
            });
          },
        });
      });
    },
    [entityType, entityId, folderId, description, permissions, maxSize, accept, uploadFile, onUploadSuccess, t]
  );

  const handleClick = useCallback(() => {
    fileInputRef.current?.click();
  }, []);

  return (
    <div className="space-y-4">
      <Card
        className={cn(
          "border-2 border-dashed transition-colors",
          isDragging
            ? "border-primary bg-primary/5"
            : "border-muted-foreground/25 hover:border-primary/50"
        )}
        onDragEnter={handleDragEnter}
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        onDrop={handleDrop}
      >
        <CardContent className="flex flex-col items-center justify-center p-8">
          <Upload className="h-12 w-12 text-muted-foreground mb-4" />
          <p className="text-sm text-muted-foreground mb-2">
            {isDragging
              ? t("files.dragDropActive")
              : t("files.dragDrop")}
          </p>
          <Button
            type="button"
            variant="outline"
            onClick={handleClick}
            disabled={uploading}
          >
            {t("files.selectFiles")}
          </Button>
          <input
            ref={fileInputRef}
            type="file"
            className="hidden"
            multiple={multiple}
            accept={accept}
            onChange={handleFileSelect}
          />
          {permissions.length > 0 && (
            <div className="mt-4 flex items-center gap-2 text-sm text-muted-foreground">
              <CheckCircle className="h-4 w-4 text-green-500" />
              <span>
                {permissions.length} {t("files.permissionsConfigured")}
              </span>
            </div>
          )}
        </CardContent>
      </Card>

      {Object.keys(uploadProgress).length > 0 && (
        <div className="space-y-2">
          {Object.entries(uploadProgress).map(([fileName, progress]) => (
            <div key={fileName} className="space-y-1">
              <div className="flex items-center justify-between text-sm">
                <span className="truncate">{fileName}</span>
                <span className="text-muted-foreground">{progress}%</span>
              </div>
              <Progress value={progress} />
            </div>
          ))}
        </div>
      )}

      {showPermissions && (
        <div className="mt-4">
          <div className="flex items-center justify-between mb-3">
            <h3 className="text-sm font-medium">
              {t("files.permissions") || "Permisos"} ({t("files.optional") || "Opcional"})
            </h3>
            {permissions.length > 0 && (
              <Badge variant="secondary">{permissions.length}</Badge>
            )}
          </div>
          <FilePermissionsSelector
            permissions={permissions}
            onChange={setPermissions}
            availableUsers={availableUsers}
            availableRoles={availableRoles}
            availableOrganizations={availableOrganizations}
          />
        </div>
      )}
    </div>
  );
}
