/**
 * FilePreview Component
 * Displays file preview for images and PDFs
 */

import { useState, useEffect } from "react";
import { Eye, Download, X } from "lucide-react";
import { Button } from "~/components/ui/button";
import { Card, CardContent } from "~/components/ui/card";
import { useTranslation } from "~/lib/i18n/useTranslation";
import { useFilePreview, useFileDownload } from "../hooks/useFiles";
import { canPreviewFile, isImageFile, isPdfFile } from "../utils/fileUtils";
import { showToast } from "~/components/common/Toast";

export interface FilePreviewProps {
  fileId: string;
  mimeType: string;
  fileName: string;
  onClose?: () => void;
}

/**
 * FilePreview component
 */
export function FilePreview({
  fileId,
  mimeType,
  fileName,
  onClose,
}: FilePreviewProps) {
  const { t } = useTranslation();
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const { data: previewBlob, isLoading: loadingPreview } = useFilePreview(
    canPreviewFile(mimeType) ? fileId : null,
    { width: 800, height: 600 }
  );
  const { mutate: downloadFile, isPending: downloading } = useFileDownload();

  useEffect(() => {
    if (previewBlob) {
      const url = window.URL.createObjectURL(previewBlob);
      setPreviewUrl(url);
      return () => window.URL.revokeObjectURL(url);
    }
  }, [previewBlob]);

  const handleDownload = () => {
    downloadFile(fileId, {
      onSuccess: (blob) => {
        const url = window.URL.createObjectURL(blob);
        const a = document.createElement("a");
        a.href = url;
        a.download = fileName;
        document.body.appendChild(a);
        a.click();
        window.URL.revokeObjectURL(url);
        document.body.removeChild(a);
      },
      onError: () => {
        showToast(t("files.error"), "error");
      },
    });
  };

  if (!canPreviewFile(mimeType)) {
    return (
      <Card>
        <CardContent className="p-6 text-center">
          <p className="text-muted-foreground">
            {t("files.previewNotAvailable")}
          </p>
        </CardContent>
      </Card>
    );
  }

  if (loadingPreview) {
    return (
      <Card>
        <CardContent className="p-6 text-center">
          <p>{t("files.loading")}</p>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardContent className="p-6">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-semibold">{fileName}</h3>
          <div className="flex gap-2">
            <Button variant="outline" size="sm" onClick={handleDownload}>
              <Download className="h-4 w-4 mr-2" />
              {t("files.download")}
            </Button>
            {onClose && (
              <Button variant="ghost" size="sm" onClick={onClose}>
                <X className="h-4 w-4" />
              </Button>
            )}
          </div>
        </div>
        <div className="border rounded-md overflow-hidden">
          {isImageFile(mimeType) && previewUrl && (
            <img
              src={previewUrl}
              alt={fileName}
              className="w-full h-auto max-h-[600px] object-contain"
            />
          )}
          {isPdfFile(mimeType) && previewUrl && (
            <iframe
              src={previewUrl}
              className="w-full h-[600px]"
              title={fileName}
            />
          )}
        </div>
      </CardContent>
    </Card>
  );
}


