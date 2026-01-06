/**
 * ProductList component
 * Displays a list of products with filters, search, and actions
 */

import { useState } from "react";
import { useTranslation } from "~/lib/i18n/useTranslation";
import { DataTable, type DataTableColumn } from "~/components/common/DataTable";
import { Button } from "~/components/ui/button";
import { Badge } from "~/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "~/components/ui/card";
import { Input } from "~/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "~/components/ui/select";
import { Search, Plus, Edit, Trash2, Eye, Package, Barcode } from "lucide-react";
import { 
  useProducts, 
  useDeleteProduct, 
  useProductCategories,
  useExportProducts,
} from "~/features/products/hooks/useProducts";
import type { Product, ProductListParams } from "~/features/products/types/product.types";

interface ProductListProps {
  onEdit?: (product: Product) => void;
  onView?: (product: Product) => void;
  onManageVariants?: (product: Product) => void;
  onManageBarcodes?: (product: Product) => void;
  onCreate?: () => void;
}

export function ProductList({ 
  onEdit, 
  onView, 
  onManageVariants, 
  onManageBarcodes, 
  onCreate 
}: ProductListProps) {
  const { t } = useTranslation();
  const [filters, setFilters] = useState<ProductListParams>({});
  const [searchQuery, setSearchQuery] = useState("");

  // Queries
  const { data: productsData, isLoading, refetch } = useProducts(filters);
  const { data: categoriesData } = useProductCategories();
  const deleteProductMutation = useDeleteProduct();
  const exportProductsMutation = useExportProducts();

  const products = productsData?.data || [];
  const categories = categoriesData?.data || [];
  const total = productsData?.meta?.total || 0;

  const handleDelete = async (product: Product) => {
    if (confirm(t("products.confirmDelete"))) {
      await deleteProductMutation.mutateAsync(product.id);
      refetch();
    }
  };

  const handleExport = async () => {
    try {
      const blob = await exportProductsMutation.mutateAsync(filters);
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = `products-${new Date().toISOString().split('T')[0]}.csv`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      window.URL.revokeObjectURL(url);
    } catch (error) {
      console.error("Export failed:", error);
    }
  };

  const handleSearch = (query: string) => {
    setSearchQuery(query);
    setFilters(prev => ({
      ...prev,
      search: query || undefined,
    }));
  };

  const handleFilterChange = (key: keyof ProductListParams, value: any) => {
    setFilters(prev => ({
      ...prev,
      [key]: value || undefined,
    }));
  };

  const clearFilters = () => {
    setFilters({});
    setSearchQuery("");
  };

  const getPriceDisplay = (price: number, currency: string) => {
    return new Intl.NumberFormat('es-ES', {
      style: 'currency',
      currency: currency || 'USD',
    }).format(price);
  };

  const getStockStatus = (product: Product) => {
    if (!product.track_inventory) return { label: t("products.inventory.notTracked"), variant: "secondary" as const };
    // This would require inventory data from the API
    return { label: t("products.inventory.available"), variant: "default" as const };
  };

  const columns: DataTableColumn<Product>[] = [
    {
      key: "sku",
      header: t("products.table.sku"),
      cell: (product) => (
        <div className="font-mono text-sm">{product.sku}</div>
      ),
    },
    {
      key: "name",
      header: t("products.table.name"),
      cell: (product) => (
        <div>
          <div className="font-medium">{product.name}</div>
          {product.description && (
            <div className="text-sm text-muted-foreground truncate max-w-[200px]">
              {product.description}
            </div>
          )}
        </div>
      ),
    },
    {
      key: "category",
      header: t("products.table.category"),
      cell: (product) => (
        <Badge variant="outline">
          {product.category?.name || t("products.noCategory")}
        </Badge>
      ),
    },
    {
      key: "price",
      header: t("products.table.price"),
      cell: (product) => (
        <div className="font-medium">
          {getPriceDisplay(product.price, product.currency)}
        </div>
      ),
    },
    {
      key: "inventory",
      header: t("products.table.inventory"),
      cell: (product) => {
        const status = getStockStatus(product);
        return <Badge variant={status.variant}>{status.label}</Badge>;
      },
    },
    {
      key: "status",
      header: t("products.table.status"),
      cell: (product) => (
        <Badge variant={product.is_active ? "default" : "secondary"}>
          {product.is_active ? t("products.status.active") : t("products.status.inactive")}
        </Badge>
      ),
    },
    {
      key: "variants",
      header: t("products.table.variants"),
      cell: (product) => (
        <div className="flex items-center space-x-2">
          <span className="text-sm">{product.variants?.length || 0}</span>
          {onManageVariants && (
            <Button
              variant="ghost"
              size="sm"
              onClick={() => onManageVariants(product)}
            >
              <Package className="h-4 w-4" />
            </Button>
          )}
        </div>
      ),
    },
    {
      key: "barcodes",
      header: t("products.table.barcodes"),
      cell: (product) => (
        <div className="flex items-center space-x-2">
          <span className="text-sm">{product.barcodes?.length || 0}</span>
          {onManageBarcodes && (
            <Button
              variant="ghost"
              size="sm"
              onClick={() => onManageBarcodes(product)}
            >
              <Barcode className="h-4 w-4" />
            </Button>
          )}
        </div>
      ),
    },
    {
      key: "actions",
      header: t("products.table.actions"),
      cell: (product) => (
        <div className="flex items-center space-x-2">
          {onView && (
            <Button
              variant="ghost"
              size="sm"
              onClick={() => onView(product)}
            >
              <Eye className="h-4 w-4" />
            </Button>
          )}
          {onEdit && (
            <Button
              variant="ghost"
              size="sm"
              onClick={() => onEdit(product)}
            >
              <Edit className="h-4 w-4" />
            </Button>
          )}
          <Button
            variant="ghost"
            size="sm"
            onClick={() => handleDelete(product)}
            disabled={deleteProductMutation.isPending}
          >
            <Trash2 className="h-4 w-4" />
          </Button>
        </div>
      ),
    },
  ];

  return (
    <div className="space-y-6">
      {/* Header */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle className="flex items-center space-x-2">
              <Package className="h-5 w-5" />
              <span>{t("products.title")}</span>
            </CardTitle>
            <div className="flex items-center space-x-2">
              <Button variant="outline" onClick={handleExport} disabled={exportProductsMutation.isPending}>
                {t("products.export")}
              </Button>
              {onCreate && (
                <Button onClick={onCreate}>
                  <Plus className="h-4 w-4 mr-2" />
                  {t("products.create")}
                </Button>
              )}
            </div>
          </div>
        </CardHeader>
        <CardContent>
          {/* Search and Filters */}
          <div className="space-y-4">
            {/* Search */}
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder={t("products.search.placeholder")}
                value={searchQuery}
                onChange={(e) => handleSearch(e.target.value)}
                className="pl-10"
              />
            </div>

            {/* Filters */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
              <Select
                value={filters.category_id || ""}
                onValueChange={(value) => handleFilterChange("category_id", value)}
              >
                <SelectTrigger>
                  <SelectValue placeholder={t("products.filters.category")} />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">{t("products.filters.allCategories")}</SelectItem>
                  {categories.map((category) => (
                    <SelectItem key={category.id} value={category.id}>
                      {category.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>

              <Select
                value={filters.is_active?.toString() || ""}
                onValueChange={(value) => handleFilterChange("is_active", value === "true" ? true : value === "false" ? false : undefined)}
              >
                <SelectTrigger>
                  <SelectValue placeholder={t("products.filters.status")} />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">{t("products.filters.allStatus")}</SelectItem>
                  <SelectItem value="true">{t("products.status.active")}</SelectItem>
                  <SelectItem value="false">{t("products.status.inactive")}</SelectItem>
                </SelectContent>
              </Select>

              <Select
                value={filters.track_inventory?.toString() || ""}
                onValueChange={(value) => handleFilterChange("track_inventory", value === "true" ? true : value === "false" ? false : undefined)}
              >
                <SelectTrigger>
                  <SelectValue placeholder={t("products.filters.inventory")} />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">{t("products.filters.allInventory")}</SelectItem>
                  <SelectItem value="true">{t("products.inventory.tracked")}</SelectItem>
                  <SelectItem value="false">{t("products.inventory.notTracked")}</SelectItem>
                </SelectContent>
              </Select>

              <Button variant="outline" onClick={clearFilters}>
                {t("products.filters.clear")}
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Products Table */}
      <Card>
        <CardContent className="p-0">
          <DataTable
            columns={columns}
            data={products}
            loading={isLoading}
            pagination={{
              page: filters.page || 1,
              pageSize: filters.page_size || 20,
              total,
              onPageChange: (page) => handleFilterChange("page", page),
              onPageSizeChange: (pageSize) => handleFilterChange("page_size", pageSize),
            }}
            emptyState={
              <div className="text-center py-8">
                <h3 className="text-lg font-medium">{t("products.empty.title")}</h3>
                <p className="text-muted-foreground mt-2">{t("products.empty.description")}</p>
                {onCreate && (
                  <Button onClick={onCreate} className="mt-4">
                    {t("products.create")}
                  </Button>
                )}
              </div>
            }
          />
        </CardContent>
      </Card>
    </div>
  );
}
