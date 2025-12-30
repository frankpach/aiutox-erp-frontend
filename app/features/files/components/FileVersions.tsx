/**
 * FileVersions Component
 * Displays and manages file versions
 */

import { Download, History } from "lucide-react";
import { Button } from "~/components/ui/button";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "~/components/ui/table";
import { Card, CardContent, CardHeader, CardTitle } from "~/components/ui/card";
import { useTranslation } from "~/lib/i18n/useTranslation";
import {
  useFileVersions,
  useFileVersionDownload,
} from "../hooks/useFiles";
import { formatFileSize } from "../utils/fileUtils";
import { showToast } from "~/components/common/Toast";

export interface FileVersionsProps {
  fileId: string;
}

/**
 * FileVersions component
 */
export function FileVersions({ fileId }: FileVersionsProps) {
  const { t } = useTranslation();
  const { versions, loading, error } = useFileVersions(fileId);
  const { mutate: downloadVersion, isPending: downloading } =
    useFileVersionDownload();

  const handleDownloadVersion = (versionId: string, fileName: string) => {
    downloadVersion(
      { fileId, versionId },
      {
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
      }
    );
  };

  if (loading) {
    return (
      <Card>
        <CardContent className="p-6">
          <p>{t("files.loading")}</p>
        </CardContent>
      </Card>
    );
  }

  if (error) {
    return (
      <Card>
        <CardContent className="p-6">
          <p className="text-destructive">{t("files.error")}</p>
        </CardContent>
      </Card>
    );
  }

  if (versions.length === 0) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <History className="h-5 w-5" />
            {t("files.versions")}
          </CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-muted-foreground">
            {t("files.noFiles")}
          </p>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <History className="h-5 w-5" />
          {t("files.versions")}
        </CardTitle>
      </CardHeader>
      <CardContent>
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>{t("files.versionNumber")}</TableHead>
              <TableHead>{t("files.type")}</TableHead>
              <TableHead>{t("files.size")}</TableHead>
              <TableHead>{t("files.uploadedAt")}</TableHead>
              <TableHead>{t("files.actions")}</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {versions.map((version) => (
              <TableRow key={version.id}>
                <TableCell>v{version.version_number}</TableCell>
                <TableCell>{version.mime_type}</TableCell>
                <TableCell>{formatFileSize(version.size)}</TableCell>
                <TableCell>
                  {new Date(version.created_at).toLocaleDateString()}
                </TableCell>
                <TableCell>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() =>
                      handleDownloadVersion(
                        version.id,
                        `v${version.version_number}_file`
                      )
                    }
                    disabled={downloading}
                  >
                    <Download className="h-4 w-4 mr-2" />
                    {t("files.download")}
                  </Button>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </CardContent>
    </Card>
  );
}


