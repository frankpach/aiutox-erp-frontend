/**
 * ProductFilters component
 * Advanced filtering for products
 */

import { useState } from "react";
import { useTranslation } from "~/lib/i18n/useTranslation";
import { Button } from "~/components/ui/button";
import { Input } from "~/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "~/components/ui/select";
import { Card, CardContent, CardHeader, CardTitle } from "~/components/ui/card";
import { Label } from "~/components/ui/label";
import { Badge } from "~/components/ui/badge";
import { Filter, X, Search } from "lucide-react";
import { useProductCategories } from "~/features/products/hooks/useProducts";
import type { ProductListParams } from "~/features/products/types/product.types";

interface ProductFiltersProps {
  filters: ProductListParams;
  onFiltersChange: (filters: ProductListParams) => void;
  onReset: () => void;
}

export function ProductFilters({ filters, onFiltersChange, onReset }: ProductFiltersProps) {
  const { t } = useTranslation();
  const { data: categoriesData } = useProductCategories();

  const categories = categoriesData?.data || [];

  const handleFilterChange = (key: keyof ProductListParams, value: string | number | boolean | undefined) => {
    onFiltersChange({
      ...filters,
      [key]: value || undefined,
    });
  };

  const removeFilter = (key: keyof ProductListParams) => {
    const newFilters = { ...filters };
    delete newFilters[key];
    onFiltersChange(newFilters);
  };

  const getActiveFiltersCount = () => {
    return Object.keys(filters).filter(key => 
      filters[key as keyof ProductListParams] !== undefined
    ).length;
  };

  const hasActiveFilters = getActiveFiltersCount() > 0;

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle className="flex items-center space-x-2">
            <Filter className="h-5 w-5" />
            <span>{t("products.filters.title")}</span>
            {hasActiveFilters && (
              <Badge variant="secondary">
                {getActiveFiltersCount()} {t("products.filters.active")}
              </Badge>
            )}
          </CardTitle>
          {hasActiveFilters && (
            <Button variant="outline" size="sm" onClick={onReset}>
              <X className="h-4 w-4 mr-2" />
              {t("products.filters.reset")}
            </Button>
          )}
        </div>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          {/* Search */}
          <div className="space-y-2">
            <Label htmlFor="search">{t("products.filters.search")}</Label>
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                id="search"
                placeholder={t("products.filters.search.placeholder")}
                value={filters.search || ""}
                onChange={(e) => handleFilterChange("search", e.target.value)}
                className="pl-10"
              />
            </div>
          </div>

          {/* Category */}
          <div className="space-y-2">
            <Label>{t("products.filters.category")}</Label>
            <Select
              value={filters.category_id || ""}
              onValueChange={(value) => handleFilterChange("category_id", value)}
            >
              <SelectTrigger>
                <SelectValue placeholder={t("products.filters.category.placeholder")} />
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
          </div>

          {/* Status */}
          <div className="space-y-2">
            <Label>{t("products.filters.status")}</Label>
            <Select
              value={
                filters.is_active === true ? "active" : 
                filters.is_active === false ? "inactive" : 
                ""
              }
              onValueChange={(value) => {
                if (value === "active") handleFilterChange("is_active", true);
                else if (value === "inactive") handleFilterChange("is_active", false);
                else handleFilterChange("is_active", undefined);
              }}
            >
              <SelectTrigger>
                <SelectValue placeholder={t("products.filters.status.placeholder")} />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">{t("products.filters.allStatus")}</SelectItem>
                <SelectItem value="active">{t("products.status.active")}</SelectItem>
                <SelectItem value="inactive">{t("products.status.inactive")}</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {/* Inventory Tracking */}
          <div className="space-y-2">
            <Label>{t("products.filters.inventory")}</Label>
            <Select
              value={
                filters.track_inventory === true ? "tracked" : 
                filters.track_inventory === false ? "not_tracked" : 
                ""
              }
              onValueChange={(value) => {
                if (value === "tracked") handleFilterChange("track_inventory", true);
                else if (value === "not_tracked") handleFilterChange("track_inventory", false);
                else handleFilterChange("track_inventory", undefined);
              }}
            >
              <SelectTrigger>
                <SelectValue placeholder={t("products.filters.inventory.placeholder")} />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">{t("products.filters.allInventory")}</SelectItem>
                <SelectItem value="tracked">{t("products.inventory.tracked")}</SelectItem>
                <SelectItem value="not_tracked">{t("products.inventory.notTracked")}</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>

        {/* Active Filters Display */}
        {hasActiveFilters && (
          <div className="mt-4 pt-4 border-t">
            <div className="flex items-center space-x-2 mb-2">
              <Label className="text-sm font-medium">
                {t("products.filters.activeFilters")}
              </Label>
            </div>
            <div className="flex flex-wrap gap-2">
              {filters.search && (
                <Badge variant="outline" className="flex items-center space-x-1">
                  <span>{t("products.filters.search")}: {filters.search}</span>
                  <X 
                    className="h-3 w-3 cursor-pointer" 
                    onClick={() => removeFilter("search")}
                  />
                </Badge>
              )}
              {filters.category_id && (
                <Badge variant="outline" className="flex items-center space-x-1">
                  <span>
                    {t("products.filters.category")}: {categories.find(c => c.id === filters.category_id)?.name || filters.category_id}
                  </span>
                  <X 
                    className="h-3 w-3 cursor-pointer" 
                    onClick={() => removeFilter("category_id")}
                  />
                </Badge>
              )}
              {filters.is_active !== undefined && (
                <Badge variant="outline" className="flex items-center space-x-1">
                  <span>
                    {t("products.filters.status")}: {
                      filters.is_active ? t("products.status.active") : t("products.status.inactive")
                    }
                  </span>
                  <X 
                    className="h-3 w-3 cursor-pointer" 
                    onClick={() => removeFilter("is_active")}
                  />
                </Badge>
              )}
              {filters.track_inventory !== undefined && (
                <Badge variant="outline" className="flex items-center space-x-1">
                  <span>
                    {t("products.filters.inventory")}: {
                      filters.track_inventory ? t("products.inventory.tracked") : t("products.inventory.notTracked")
                    }
                  </span>
                  <X 
                    className="h-3 w-3 cursor-pointer" 
                    onClick={() => removeFilter("track_inventory")}
                  />
                </Badge>
              )}
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
