import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import apiClient from "~/lib/api/client";
import { Badge } from "~/components/ui/badge";
import { Button } from "~/components/ui/button";
import { Input } from "~/components/ui/input";
import { Label } from "~/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "~/components/ui/select";
import type { StandardListResponse } from "~/lib/api/types/common.types";

interface AuditLog {
  id: string;
  action: string;
  resource_type: string;
  resource_id: string | null;
  details: Record<string, unknown>;
  created_at: string;
  user: {
    full_name: string;
    email: string;
  } | null;
  ip_address: string | null;
  user_agent: string | null;
}

interface AuditLogListResponse extends StandardListResponse<AuditLog> {
  meta: {
    total: number;
    page: number;
    page_size: number;
    total_pages: number;
  };
}

// Export functions
const exportToCSV = (logs: AuditLog[]) => {
  const headers = ["Fecha", "Usuario", "Email", "Acción", "Tipo de Recurso", "ID de Recurso", "IP", "Detalles"];
  const rows = logs.map((log) => [
    new Date(log.created_at).toLocaleString("es-ES"),
    log.user?.full_name || "Sistema",
    log.user?.email || "",
    log.action,
    log.resource_type,
    log.resource_id || "",
    log.ip_address || "",
    JSON.stringify(log.details),
  ]);

  const csvContent = [
    headers.join(","),
    ...rows.map((row) => row.map((cell) => `"${String(cell).replace(/"/g, '""')}"`).join(",")),
  ].join("\n");

  const blob = new Blob(["\uFEFF" + csvContent], { type: "text/csv;charset=utf-8;" });
  const url = URL.createObjectURL(blob);
  const link = document.createElement("a");
  link.href = url;
  link.download = `audit-logs-${new Date().toISOString().split("T")[0]}.csv`;
  link.click();
  URL.revokeObjectURL(url);
};

const exportToJSON = (logs: AuditLog[]) => {
  const jsonContent = JSON.stringify(logs, null, 2);
  const blob = new Blob([jsonContent], { type: "application/json" });
  const url = URL.createObjectURL(blob);
  const link = document.createElement("a");
  link.href = url;
  link.download = `audit-logs-${new Date().toISOString().split("T")[0]}.json`;
  link.click();
  URL.revokeObjectURL(url);
};

const exportToExcel = async (logs: AuditLog[]) => {
  // For Excel, we'll use CSV format (which Excel can open)
  // In a production environment, you might want to use a library like xlsx
  exportToCSV(logs);
};

// Fetch all logs for export (with current filters)
const fetchAllLogsForExport = async (filters: {
  action: string;
  resource_type: string;
  date_from: string;
  date_to: string;
}): Promise<AuditLog[]> => {
  const allLogs: AuditLog[] = [];
  let page = 1;
  const pageSize = 100;
  let hasMore = true;

  while (hasMore) {
    const params = new URLSearchParams();
    if (filters.action) params.append("action", filters.action);
    if (filters.resource_type) params.append("resource_type", filters.resource_type);
    if (filters.date_from) params.append("date_from", filters.date_from);
    if (filters.date_to) params.append("date_to", filters.date_to);
    params.append("page", page.toString());
    params.append("page_size", pageSize.toString());

    const response = await apiClient.get<AuditLogListResponse>(
      `/auth/audit-logs?${params.toString()}`
    );

    const pageData = response.data.data || [];
    allLogs.push(...pageData);

    const totalPages = response.data.meta?.total_pages || 1;
    hasMore = page < totalPages;
    page++;
  }

  return allLogs;
};

export default function AuditConfigPage() {
  const [filters, setFilters] = useState({
    action: "",
    resource_type: "",
    date_from: "",
    date_to: "",
    page: 1,
    page_size: 20,
  });
  const [exportFormat, setExportFormat] = useState<"csv" | "excel" | "json">("csv");
  const [isExporting, setIsExporting] = useState(false);

  const { data, isLoading, error } = useQuery({
    queryKey: ["audit", "logs", filters],
    queryFn: async () => {
      const params = new URLSearchParams();
      if (filters.action) params.append("action", filters.action);
      if (filters.resource_type) params.append("resource_type", filters.resource_type);
      if (filters.date_from) params.append("date_from", filters.date_from);
      if (filters.date_to) params.append("date_to", filters.date_to);
      params.append("page", filters.page.toString());
      params.append("page_size", filters.page_size.toString());

      const response = await apiClient.get<AuditLogListResponse>(
        `/auth/audit-logs?${params.toString()}`
      );
      return response.data;
    },
  });

  const handleFilterChange = (key: string, value: string | number) => {
    setFilters((prev) => ({ ...prev, [key]: value, page: 1 }));
  };

  const handlePageChange = (newPage: number) => {
    setFilters((prev) => ({ ...prev, page: newPage }));
  };

  const handleExport = async () => {
    setIsExporting(true);
    try {
      // Fetch all logs with current filters
      const allLogs = await fetchAllLogsForExport({
        action: filters.action,
        resource_type: filters.resource_type,
        date_from: filters.date_from,
        date_to: filters.date_to,
      });

      if (allLogs.length === 0) {
        alert("No hay registros para exportar con los filtros actuales");
        setIsExporting(false);
        return;
      }

      // Export based on format
      switch (exportFormat) {
        case "csv":
          exportToCSV(allLogs);
          break;
        case "excel":
          await exportToExcel(allLogs);
          break;
        case "json":
          exportToJSON(allLogs);
          break;
      }
    } catch (error) {
      console.error("Error exporting audit logs:", error);
      alert("Error al exportar logs de auditoría. Por favor, intenta de nuevo.");
    } finally {
      setIsExporting(false);
    }
  };

  const getActionBadgeVariant = (action: string) => {
    if (action.includes("create") || action.includes("add")) {
      return "default";
    }
    if (action.includes("update") || action.includes("edit")) {
      return "secondary";
    }
    if (action.includes("delete") || action.includes("remove")) {
      return "destructive";
    }
    return "outline";
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-96">
        <p>Cargando logs de auditoría...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-red-50 border border-red-200 rounded-md p-4">
        <p className="text-red-800">Error al cargar logs: {error instanceof Error ? error.message : "Error desconocido"}</p>
      </div>
    );
  }

  const totalPages = data?.meta?.total_pages || 1;
  const currentPage = filters.page;

  return (
    <div className="container mx-auto py-6 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Auditoría</h1>
          <p className="text-muted-foreground mt-1">
            Historial de cambios y acciones en el sistema
          </p>
        </div>
        <div className="flex gap-2">
          <Select value={exportFormat} onValueChange={(value: "csv" | "excel" | "json") => setExportFormat(value)}>
            <SelectTrigger className="w-32">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="csv">CSV</SelectItem>
              <SelectItem value="excel">Excel</SelectItem>
              <SelectItem value="json">JSON</SelectItem>
            </SelectContent>
          </Select>
          <Button variant="outline" onClick={handleExport} disabled={isExporting}>
            {isExporting ? "Exportando..." : "Exportar Logs"}
          </Button>
        </div>
      </div>

      {/* Filters */}
      <div className="bg-white border border-gray-200 rounded-lg p-4 space-y-4">
        <h3 className="font-semibold">Filtros</h3>
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <div className="space-y-2">
            <Label htmlFor="filter-action">Acción</Label>
            <Input
              id="filter-action"
              placeholder="Ej: create, update, delete"
              value={filters.action}
              onChange={(e) => handleFilterChange("action", e.target.value)}
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="filter-resource">Tipo de Recurso</Label>
            <Input
              id="filter-resource"
              placeholder="Ej: user, product, order"
              value={filters.resource_type}
              onChange={(e) => handleFilterChange("resource_type", e.target.value)}
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="filter-date-from">Fecha Desde</Label>
            <Input
              id="filter-date-from"
              type="date"
              value={filters.date_from}
              onChange={(e) => handleFilterChange("date_from", e.target.value)}
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="filter-date-to">Fecha Hasta</Label>
            <Input
              id="filter-date-to"
              type="date"
              value={filters.date_to}
              onChange={(e) => handleFilterChange("date_to", e.target.value)}
            />
          </div>
        </div>
        <div className="flex gap-2">
          <Button
            variant="outline"
            onClick={() =>
              setFilters({
                action: "",
                resource_type: "",
                date_from: "",
                date_to: "",
                page: 1,
                page_size: 20,
              })
            }
          >
            Limpiar Filtros
          </Button>
          <div className="flex items-center gap-2">
            <Label htmlFor="page-size">Registros por página:</Label>
            <Select
              value={filters.page_size.toString()}
              onValueChange={(value) => handleFilterChange("page_size", parseInt(value))}
            >
              <SelectTrigger id="page-size" className="w-24">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="10">10</SelectItem>
                <SelectItem value="20">20</SelectItem>
                <SelectItem value="50">50</SelectItem>
                <SelectItem value="100">100</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>
      </div>

      {/* Results count */}
      {data?.meta && (
        <div className="text-sm text-gray-600">
          Mostrando {((currentPage - 1) * filters.page_size) + 1} -{" "}
          {Math.min(currentPage * filters.page_size, data.meta.total)} de {data.meta.total} registros
        </div>
      )}

      {/* Table */}
      <div className="bg-white border border-gray-200 rounded-lg shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Fecha
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Usuario
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Acción
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Recurso
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Detalles
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {data?.data && data.data.length > 0 ? (
                data.data.map((log: AuditLog) => (
                  <tr key={log.id} className="hover:bg-gray-50">
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      {new Date(log.created_at).toLocaleString("es-ES", {
                        year: "numeric",
                        month: "2-digit",
                        day: "2-digit",
                        hour: "2-digit",
                        minute: "2-digit",
                      })}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      <div>
                        <div className="font-medium">
                          {log.user?.full_name || "Sistema"}
                        </div>
                        {log.user?.email && (
                          <div className="text-xs text-gray-500">{log.user.email}</div>
                        )}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <Badge variant={getActionBadgeVariant(log.action)}>
                        {log.action}
                      </Badge>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      <div>
                        <div className="font-medium">{log.resource_type}</div>
                        {log.resource_id && (
                          <div className="text-xs text-gray-400">{log.resource_id}</div>
                        )}
                      </div>
                    </td>
                    <td className="px-6 py-4 text-sm text-gray-500">
                      {log.details && Object.keys(log.details).length > 0 ? (
                        <details className="cursor-pointer">
                          <summary className="text-blue-600 hover:text-blue-800">
                            Ver detalles
                          </summary>
                          <pre className="mt-2 text-xs bg-gray-50 p-2 rounded overflow-auto max-w-md">
                            {JSON.stringify(log.details, null, 2)}
                          </pre>
                        </details>
                      ) : (
                        <span className="text-gray-400">-</span>
                      )}
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan={5} className="px-6 py-8 text-center text-gray-500">
                    No se encontraron logs de auditoría
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Pagination */}
      {totalPages > 1 && (
        <div className="flex items-center justify-between">
          <div className="flex gap-2">
            <Button
              variant="outline"
              onClick={() => handlePageChange(currentPage - 1)}
              disabled={currentPage === 1}
            >
              Anterior
            </Button>
            <div className="flex items-center gap-2">
              <span className="text-sm text-gray-600">
                Página {currentPage} de {totalPages}
              </span>
            </div>
            <Button
              variant="outline"
              onClick={() => handlePageChange(currentPage + 1)}
              disabled={currentPage >= totalPages}
            >
              Siguiente
            </Button>
          </div>
        </div>
      )}
    </div>
  );
}
