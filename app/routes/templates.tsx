/**
 * Templates page
 * Main page for templates management
 */

import { useState } from "react";
import { useTranslation } from "~/lib/i18n/useTranslation";
import { PageLayout } from "~/components/layout/PageLayout";
import { Button } from "~/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "~/components/ui/tabs";
import { TemplateList } from "~/features/templates/components/TemplateList";
import { TemplateForm } from "~/features/templates/components/TemplateForm";
import { TemplatePreview } from "~/features/templates/components/TemplatePreview";
import { TemplateVersionHistory } from "~/features/templates/components/TemplateVersionHistory";
import { 
  useTemplates, 
  useTemplateCategories, 
  useCreateTemplate, 
  useUpdateTemplate, 
  useDeleteTemplate,
  useRenderTemplate,
  useTemplateVersions,
} from "~/features/templates/hooks/useTemplates";
import { Template, TemplateRenderContext, RenderFormat } from "~/features/templates/types/template.types";

export default function TemplatesPage() {
  const { t } = useTranslation();
  const [activeTab, setActiveTab] = useState("list");
  const [showCreateForm, setShowCreateForm] = useState(false);
  const [editingTemplate, setEditingTemplate] = useState<Template | null>(null);
  const [previewTemplate, setPreviewTemplate] = useState<Template | null>(null);
  const [selectedTemplate, setSelectedTemplate] = useState<Template | null>(null);

  // Query hooks
  const { data: templatesData, isLoading, error, refetch } = useTemplates({
    page: 1,
    page_size: 20,
  });

  const { data: categoriesData } = useTemplateCategories();
  const { data: versionsData } = useTemplateVersions(
    selectedTemplate?.id || ""
  );

  const createTemplateMutation = useCreateTemplate();
  const updateTemplateMutation = useUpdateTemplate();
  const deleteTemplateMutation = useDeleteTemplate();
  const renderMutation = useRenderTemplate();

  const templates = templatesData?.data || [];
  const categories = categoriesData?.data || [];
  const versions = versionsData?.data || [];

  const handleCreate = (data: any) => {
    createTemplateMutation.mutate(data, {
      onSuccess: () => {
        setShowCreateForm(false);
        refetch();
      },
    });
  };

  const handleEdit = (template: Template) => {
    setEditingTemplate(template);
  };

  const handleUpdate = (data: any) => {
    if (editingTemplate) {
      updateTemplateMutation.mutate(
        { id: editingTemplate.id, payload: data },
        {
          onSuccess: () => {
            setEditingTemplate(null);
            refetch();
          },
        }
      );
    }
  };

  const handleDelete = (template: Template) => {
    if (confirm(t("templates.confirmDelete"))) {
      deleteTemplateMutation.mutate(template.id, {
        onSuccess: () => {
          refetch();
        },
      });
    }
  };

  const handlePreview = (template: Template) => {
    setPreviewTemplate(template);
  };

  const handleRender = (context: TemplateRenderContext, format: RenderFormat) => {
    if (previewTemplate) {
      renderMutation.mutate(
        { id: previewTemplate.id, payload: { context, format } },
        {
          onSuccess: (response) => {
            console.log("Template rendered:", response.data);
          },
        }
      );
    }
  };

  const handleViewVersions = (template: Template) => {
    setSelectedTemplate(template);
    setActiveTab("versions");
  };

  return (
    <PageLayout
      title={t("templates.title")}
      description={t("templates.description")}
      loading={isLoading}
      error={error}
    >
      <div className="space-y-6">
        {/* Header with actions */}
        <div className="flex justify-between items-center">
          <h2 className="text-2xl font-bold">
            {t("templates.title")}
          </h2>
          <div className="flex space-x-2">
            <Button onClick={refetch}>
              {t("common.refresh")}
            </Button>
            <Button onClick={() => setShowCreateForm(true)}>
              {t("templates.create")}
            </Button>
          </div>
        </div>

        {/* Tabs */}
        <Tabs value={activeTab} onValueChange={setActiveTab}>
          <TabsList className="grid w-full grid-cols-4">
            <TabsTrigger value="list">
              {t("templates.tabs.list")}
            </TabsTrigger>
            <TabsTrigger value="form">
              {t("templates.tabs.form")}
            </TabsTrigger>
            <TabsTrigger value="preview">
              {t("templates.tabs.preview")}
            </TabsTrigger>
            <TabsTrigger value="versions">
              {t("templates.tabs.versions")}
            </TabsTrigger>
          </TabsList>

          <TabsContent value="list" className="mt-6">
            <TemplateList
              templates={templates}
              loading={isLoading}
              onRefresh={refetch}
              onEdit={handleEdit}
              onDelete={handleDelete}
              onPreview={handlePreview}
              onRender={handleRender}
              onViewVersions={handleViewVersions}
              onCreate={() => setShowCreateForm(true)}
            />
          </TabsContent>

          <TabsContent value="form" className="mt-6">
            <div className="max-w-2xl mx-auto">
              <TemplateForm
                template={editingTemplate}
                categories={categories}
                onSubmit={editingTemplate ? handleUpdate : handleCreate}
                onCancel={() => {
                  setShowCreateForm(false);
                  setEditingTemplate(null);
                }}
                loading={createTemplateMutation.isPending || updateTemplateMutation.isPending}
              />
            </div>
          </TabsContent>

          <TabsContent value="preview" className="mt-6">
            {previewTemplate && (
              <TemplatePreview
                template={previewTemplate}
                onRender={handleRender}
                loading={renderMutation.isPending}
              />
            )}
          </TabsContent>

          <TabsContent value="versions" className="mt-6">
            {selectedTemplate && (
              <TemplateVersionHistory
                versions={versions}
                loading={isLoading}
                onRestore={(version) => {
                  // Handle version restore
                  console.log("Restore version:", version);
                }}
                onCompare={(v1, v2) => {
                  // Handle version comparison
                  console.log("Compare versions:", v1, v2);
                }}
              />
            )}
          </TabsContent>
        </Tabs>
      </div>
    </PageLayout>
  );
}
