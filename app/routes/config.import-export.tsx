import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Button } from "~/components/ui/button";
import { Label } from "~/components/ui/label";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "~/components/ui/tabs";
import { Badge } from "~/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "~/components/ui/select";
import {
  createImportJob,
  createExportJob,
  listImportJobs,
  listExportJobs,
  listImportTemplates,
  type ImportJobResponse,
  type ExportJobResponse,
  type ImportTemplateResponse,
} from "~/lib/api/import-export.api";
import { getModules } from "~/lib/api/modules.api";
import type { ModuleListItem } from "~/lib/modules/types";

export default function ImportExportConfigPage() {
  const queryClient = useQueryClient();
  const [selectedModule, setSelectedModule] = useState<string>("");
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [exportFormat, setExportFormat] = useState<"csv" | "excel" | "json">("csv");

  // Fetch modules for dropdown
  const { data: modulesData } = useQuery({
    queryKey: ["modules"],
    queryFn: async () => {
      const response = await getModules();
      return response.data;
    },
  });

  // Fetch import jobs
  const { data: importJobs, isLoading: isLoadingImports } = useQuery({
    queryKey: ["import-export", "import-jobs"],
    queryFn: async () => {
      const response = await listImportJobs({ page: 1, page_size: 50 });
      return response.data;
    },
  });

  // Fetch export jobs
  const { data: exportJobs, isLoading: isLoadingExports } = useQuery({
    queryKey: ["import-export", "export-jobs"],
    queryFn: async () => {
      const response = await listExportJobs({ page: 1, page_size: 50 });
      return response.data;
    },
  });

  // Fetch templates
  const { data: templates } = useQuery({
    queryKey: ["import-export", "templates"],
    queryFn: async () => {
      const response = await listImportTemplates({ page: 1, page_size: 100 });
      return response.data;
    },
  });

  // Create import job mutation
  const importMutation = useMutation({
    mutationFn: async (data: { module: string; file_name: string }) => {
      return await createImportJob(data);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["import-export", "import-jobs"] });
      setSelectedFile(null);
      setSelectedModule("");
    },
  });

  // Create export job mutation
  const exportMutation = useMutation({
    mutationFn: async (data: { module: string; export_format: "csv" | "excel" | "json" }) => {
      return await createExportJob(data);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["import-export", "export-jobs"] });
      setSelectedModule("");
    },
  });

  const handleFileSelect = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      setSelectedFile(file);
    }
  };

  const handleImport = () => {
    if (!selectedFile || !selectedModule) return;
    importMutation.mutate({
      module: selectedModule,
      file_name: selectedFile.name,
    });
  };

  const handleExport = () => {
    if (!selectedModule) return;
    exportMutation.mutate({
      module: selectedModule,
      export_format: exportFormat,
    });
  };

  const getStatusBadge = (status: string) => {
    const statusColors: Record<string, string> = {
      pending: "bg-yellow-100 text-yellow-800 border-yellow-200",
      processing: "bg-blue-100 text-blue-800 border-blue-200",
      completed: "bg-green-100 text-green-800 border-green-200",
      failed: "bg-red-100 text-red-800 border-red-200",
    };
    return (
      <Badge
        variant="outline"
        className={statusColors[status.toLowerCase()] || "bg-gray-100 text-gray-800"}
      >
        {status}
      </Badge>
    );
  };

  const formatDate = (dateString: string | null) => {
    if (!dateString) return "N/A";
    return new Date(dateString).toLocaleString("es-ES");
  };

  return (
    <div className="container mx-auto py-6 space-y-6">
      <div>
        <h1 className="text-3xl font-bold">Importar / Exportar</h1>
        <p className="text-muted-foreground mt-1">
          Importa y exporta datos masivamente
        </p>
      </div>

      <Tabs defaultValue="import" className="w-full">
        <TabsList>
          <TabsTrigger value="import">Importar</TabsTrigger>
          <TabsTrigger value="export">Exportar</TabsTrigger>
          <TabsTrigger value="templates">Plantillas</TabsTrigger>
          <TabsTrigger value="history">Historial</TabsTrigger>
        </TabsList>

        <TabsContent value="import" className="space-y-6">
          <div className="bg-white border border-gray-200 rounded-lg p-6">
            <h3 className="text-lg font-semibold mb-4">Importar Datos</h3>

            <div className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="import-module">Módulo</Label>
                <Select value={selectedModule} onValueChange={setSelectedModule}>
                  <SelectTrigger id="import-module">
                    <SelectValue placeholder="Selecciona un módulo..." />
                  </SelectTrigger>
                  <SelectContent>
                    {modulesData?.map((module: ModuleListItem) => (
                      <SelectItem key={module.id} value={module.id}>
                        {module.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label htmlFor="file">Archivo</Label>
                <input
                  id="file"
                  type="file"
                  accept=".csv,.xlsx,.json"
                  onChange={handleFileSelect}
                  className="w-full p-2 border border-gray-300 rounded"
                />
                {selectedFile && (
                  <p className="text-sm text-gray-600">
                    Archivo seleccionado: {selectedFile.name} ({(selectedFile.size / 1024).toFixed(2)} KB)
                  </p>
                )}
              </div>

              <div className="bg-blue-50 border border-blue-200 rounded p-4">
                <h4 className="font-semibold text-blue-900 mb-2">
                  📋 Formatos Soportados
                </h4>
                <ul className="text-sm text-blue-800 space-y-1 list-disc list-inside">
                  <li>CSV (valores separados por comas)</li>
                  <li>Excel (.xlsx)</li>
                  <li>JSON (formato estructurado)</li>
                </ul>
              </div>

              {importMutation.isError && (
                <div className="bg-red-50 border border-red-200 rounded p-3">
                  <p className="text-sm text-red-800">
                    Error: {importMutation.error instanceof Error ? importMutation.error.message : "Error desconocido"}
                  </p>
                </div>
              )}

              {importMutation.isSuccess && (
                <div className="bg-green-50 border border-green-200 rounded p-3">
                  <p className="text-sm text-green-800">
                    ✅ Job de importación creado exitosamente
                  </p>
                </div>
              )}

              <Button
                onClick={handleImport}
                disabled={!selectedFile || !selectedModule || importMutation.isPending}
              >
                {importMutation.isPending ? "Creando job..." : "Iniciar Importación"}
              </Button>
            </div>
          </div>
        </TabsContent>

        <TabsContent value="export" className="space-y-6">
          <div className="bg-white border border-gray-200 rounded-lg p-6">
            <h3 className="text-lg font-semibold mb-4">Exportar Datos</h3>

            <div className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="export-module">Módulo</Label>
                <Select value={selectedModule} onValueChange={setSelectedModule}>
                  <SelectTrigger id="export-module">
                    <SelectValue placeholder="Selecciona un módulo..." />
                  </SelectTrigger>
                  <SelectContent>
                    {modulesData?.map((module: ModuleListItem) => (
                      <SelectItem key={module.id} value={module.id}>
                        {module.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label>Formato de Exportación</Label>
                <div className="grid grid-cols-3 gap-3">
                  <Button
                    variant={exportFormat === "csv" ? "default" : "outline"}
                    onClick={() => setExportFormat("csv")}
                    className="w-full"
                  >
                    CSV
                  </Button>
                  <Button
                    variant={exportFormat === "excel" ? "default" : "outline"}
                    onClick={() => setExportFormat("excel")}
                    className="w-full"
                  >
                    Excel
                  </Button>
                  <Button
                    variant={exportFormat === "json" ? "default" : "outline"}
                    onClick={() => setExportFormat("json")}
                    className="w-full"
                  >
                    JSON
                  </Button>
                </div>
              </div>

              <div className="bg-green-50 border border-green-200 rounded p-4">
                <h4 className="font-semibold text-green-900 mb-2">
                  ✓ La exportación incluirá
                </h4>
                <ul className="text-sm text-green-800 space-y-1 list-disc list-inside">
                  <li>Todos los registros del módulo seleccionado</li>
                  <li>Datos del tenant actual únicamente</li>
                  <li>Formato compatible con importación</li>
                </ul>
              </div>

              {exportMutation.isError && (
                <div className="bg-red-50 border border-red-200 rounded p-3">
                  <p className="text-sm text-red-800">
                    Error: {exportMutation.error instanceof Error ? exportMutation.error.message : "Error desconocido"}
                  </p>
                </div>
              )}

              {exportMutation.isSuccess && (
                <div className="bg-green-50 border border-green-200 rounded p-3">
                  <p className="text-sm text-green-800">
                    ✅ Job de exportación creado exitosamente
                  </p>
                </div>
              )}

              <Button
                onClick={handleExport}
                disabled={!selectedModule || exportMutation.isPending}
              >
                {exportMutation.isPending ? "Creando job..." : "Iniciar Exportación"}
              </Button>
            </div>
          </div>
        </TabsContent>

        <TabsContent value="templates" className="space-y-4">
          <div className="bg-white border border-gray-200 rounded-lg p-6">
            <h3 className="text-lg font-semibold mb-4">
              Plantillas de Importación
            </h3>
            <p className="text-gray-600 mb-4">
              Descarga plantillas pre-formateadas para facilitar la importación de datos
            </p>

            {templates && templates.length > 0 ? (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                {templates.map((template: ImportTemplateResponse) => (
                  <Button key={template.id} variant="outline" className="justify-start">
                    📄 {template.name} ({template.module})
                  </Button>
                ))}
              </div>
            ) : (
              <p className="text-gray-500 text-sm">No hay plantillas disponibles</p>
            )}
          </div>
        </TabsContent>

        <TabsContent value="history" className="space-y-4">
          <div className="bg-white border border-gray-200 rounded-lg p-6">
            <h3 className="text-lg font-semibold mb-4">Historial de Operaciones</h3>

            {isLoadingImports || isLoadingExports ? (
              <p className="text-gray-500">Cargando historial...</p>
            ) : (
              <div className="space-y-3">
                {/* Import Jobs */}
                {importJobs && importJobs.length > 0 && (
                  <>
                    <h4 className="font-medium text-gray-700 mb-2">Importaciones</h4>
                    {importJobs.map((job: ImportJobResponse) => (
                      <div key={job.id} className="border border-gray-200 rounded p-4">
                        <div className="flex items-center justify-between">
                          <div className="flex-1">
                            <p className="font-medium">
                              Importación: {job.module} - {job.file_name}
                            </p>
                            <p className="text-sm text-gray-600">
                              {job.processed_rows} de {job.total_rows || "?"} registros procesados •{" "}
                              {formatDate(job.created_at)}
                            </p>
                            {job.progress > 0 && (
                              <div className="mt-2 w-full bg-gray-200 rounded-full h-2">
                                <div
                                  className="bg-blue-600 h-2 rounded-full"
                                  style={{ width: `${job.progress}%` }}
                                />
                              </div>
                            )}
                          </div>
                          <div className="ml-4">{getStatusBadge(job.status)}</div>
                        </div>
                      </div>
                    ))}
                  </>
                )}

                {/* Export Jobs */}
                {exportJobs && exportJobs.length > 0 && (
                  <>
                    <h4 className="font-medium text-gray-700 mb-2 mt-4">Exportaciones</h4>
                    {exportJobs.map((job: ExportJobResponse) => (
                      <div key={job.id} className="border border-gray-200 rounded p-4">
                        <div className="flex items-center justify-between">
                          <div className="flex-1">
                            <p className="font-medium">
                              Exportación: {job.module} - {job.export_format.toUpperCase()}
                            </p>
                            <p className="text-sm text-gray-600">
                              {job.exported_rows} registros exportados • {formatDate(job.created_at)}
                            </p>
                          </div>
                          <div className="ml-4">{getStatusBadge(job.status)}</div>
                        </div>
                      </div>
                    ))}
                  </>
                )}

                {(!importJobs || importJobs.length === 0) &&
                  (!exportJobs || exportJobs.length === 0) && (
                    <div className="text-center text-gray-500 text-sm py-4">
                      No hay operaciones en el historial
                    </div>
                  )}
              </div>
            )}
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
}
