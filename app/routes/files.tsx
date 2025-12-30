import { useState } from "react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "~/components/ui/tabs";
import { FileUpload } from "~/components/files/FileUpload";
import { FileManager } from "~/components/files/FileManager";
import { useTranslation } from "~/lib/i18n/useTranslation";
import { RequirePermission } from "~/components/auth/RequirePermission";
import { PageLayout } from "~/components/layout/PageLayout";

export default function FilesPage() {
  const { t } = useTranslation();
  const [showUpload, setShowUpload] = useState(false);

  return (
    <RequirePermission permission="files.view">
      <PageLayout
        title={t("config.files.title") || "Archivos"}
        description={t("config.files.description") || "Gestiona los archivos del sistema"}
      >
        <Tabs defaultValue="files" className="space-y-4">
          <TabsList>
            <TabsTrigger value="files">{t("config.files.tabFiles") || "Archivos"}</TabsTrigger>
            <TabsTrigger value="upload">{t("config.files.tabUpload") || "Subir"}</TabsTrigger>
          </TabsList>

          <TabsContent value="files" className="space-y-4">
            <FileManager />
          </TabsContent>

          <TabsContent value="upload" className="space-y-4">
            <RequirePermission permission="files.manage">
              <FileUpload
                onUploadSuccess={() => {
                  setShowUpload(false);
                }}
                onCancel={() => setShowUpload(false)}
              />
            </RequirePermission>
          </TabsContent>
        </Tabs>
      </PageLayout>
    </RequirePermission>
  );
}



