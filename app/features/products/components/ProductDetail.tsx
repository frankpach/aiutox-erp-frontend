/**
 * ProductDetail component
 * Displays detailed information about a single product
 */

import { useState } from "react";
import { useTranslation } from "~/lib/i18n/useTranslation";
import { Button } from "~/components/ui/button";
import { Badge } from "~/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "~/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "~/components/ui/tabs";
import { 
  Edit, 
  Package, 
  Barcode, 
  DollarSign, 
  Weight, 
  Box,
  Eye,
  ArrowLeft
} from "lucide-react";
import { 
  useProduct, 
  useProductVariants, 
  useProductBarcodes,
} from "~/features/products/hooks/useProducts";
import type { Product } from "~/features/products/types/product.types";

interface ProductDetailProps {
  productId: string;
  onEdit?: (product: Product) => void;
  onBack?: () => void;
  onManageVariants?: (product: Product) => void;
  onManageBarcodes?: (product: Product) => void;
}

export function ProductDetail({ 
  productId, 
  onEdit, 
  onBack, 
  onManageVariants, 
  onManageBarcodes 
}: ProductDetailProps) {
  const { t } = useTranslation();
  const [activeTab, setActiveTab] = useState("details");

  // Queries
  const { data: product, isLoading, error } = useProduct(productId);
  const { data: variants } = useProductVariants(productId);
  const { data: barcodes } = useProductBarcodes(productId);

  if (isLoading) {
    return (
      <div className="space-y-6">
        <div className="flex items-center space-x-4">
          <Button variant="ghost" size="sm" onClick={onBack}>
            <ArrowLeft className="h-4 w-4 mr-2" />
            {t("common.back")}
          </Button>
        </div>
        <Card>
          <CardContent className="p-6">
            <div className="animate-pulse space-y-4">
              <div className="h-8 bg-muted rounded w-1/3"></div>
              <div className="h-4 bg-muted rounded w-1/2"></div>
              <div className="h-4 bg-muted rounded w-3/4"></div>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  if (error || !product) {
    return (
      <div className="space-y-6">
        <div className="flex items-center space-x-4">
          <Button variant="ghost" size="sm" onClick={onBack}>
            <ArrowLeft className="h-4 w-4 mr-2" />
            {t("common.back")}
          </Button>
        </div>
        <Card>
          <CardContent className="p-6">
            <div className="text-center">
              <h3 className="text-lg font-medium text-destructive">
                {t("products.error.notFound")}
              </h3>
              <p className="text-muted-foreground mt-2">
                {t("products.error.notFoundDescription")}
              </p>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  const getPriceDisplay = (price: number, currency: string) => {
    return new Intl.NumberFormat('es-ES', {
      style: 'currency',
      currency: currency || 'USD',
    }).format(price);
  };

  const getWeightDisplay = (weight?: number) => {
    if (!weight) return null;
    return `${weight} kg`;
  };

  const getDimensionsDisplay = (dimensions?: any) => {
    if (!dimensions) return null;
    return `${dimensions.length} × ${dimensions.width} × ${dimensions.height} ${dimensions.unit || 'cm'}`;
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-4">
          <Button variant="ghost" size="sm" onClick={onBack}>
            <ArrowLeft className="h-4 w-4 mr-2" />
            {t("common.back")}
          </Button>
          <div>
            <h1 className="text-2xl font-bold">{product.name}</h1>
            <p className="text-muted-foreground">{product.sku}</p>
          </div>
        </div>
        <div className="flex items-center space-x-2">
          <Badge variant={product.is_active ? "default" : "secondary"}>
            {product.is_active ? t("products.status.active") : t("products.status.inactive")}
          </Badge>
          {onEdit && (
            <Button onClick={() => onEdit(product)}>
              <Edit className="h-4 w-4 mr-2" />
              {t("common.edit")}
            </Button>
          )}
        </div>
      </div>

      {/* Main Content */}
      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="details">{t("products.tabs.details")}</TabsTrigger>
          <TabsTrigger value="variants">
            {t("products.tabs.variants")} ({variants?.data?.length || 0})
          </TabsTrigger>
          <TabsTrigger value="barcodes">
            {t("products.tabs.barcodes")} ({barcodes?.data?.length || 0})
          </TabsTrigger>
          <TabsTrigger value="inventory">{t("products.tabs.inventory")}</TabsTrigger>
        </TabsList>

        {/* Details Tab */}
        <TabsContent value="details" className="space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Basic Information */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center space-x-2">
                  <Package className="h-5 w-5" />
                  <span>{t("products.details.basic")}</span>
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <label className="text-sm font-medium text-muted-foreground">
                    {t("products.details.name")}
                  </label>
                  <p className="font-medium">{product.name}</p>
                </div>
                <div>
                  <label className="text-sm font-medium text-muted-foreground">
                    {t("products.details.sku")}
                  </label>
                  <p className="font-mono">{product.sku}</p>
                </div>
                <div>
                  <label className="text-sm font-medium text-muted-foreground">
                    {t("products.details.category")}
                  </label>
                  <p>{product.category?.name || t("products.noCategory")}</p>
                </div>
                {product.description && (
                  <div>
                    <label className="text-sm font-medium text-muted-foreground">
                      {t("products.details.description")}
                    </label>
                    <p className="text-sm">{product.description}</p>
                  </div>
                )}
                <div>
                  <label className="text-sm font-medium text-muted-foreground">
                    {t("products.details.inventoryTracking")}
                  </label>
                  <Badge variant={product.track_inventory ? "default" : "secondary"}>
                    {product.track_inventory 
                      ? t("products.inventory.tracked") 
                      : t("products.inventory.notTracked")
                    }
                  </Badge>
                </div>
              </CardContent>
            </Card>

            {/* Pricing Information */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center space-x-2">
                  <DollarSign className="h-5 w-5" />
                  <span>{t("products.details.pricing")}</span>
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <label className="text-sm font-medium text-muted-foreground">
                    {t("products.details.price")}
                  </label>
                  <p className="text-2xl font-bold text-green-600">
                    {getPriceDisplay(product.price, product.currency)}
                  </p>
                </div>
                <div>
                  <label className="text-sm font-medium text-muted-foreground">
                    {t("products.details.cost")}
                  </label>
                  <p className="text-lg font-medium">
                    {getPriceDisplay(product.cost, product.currency)}
                  </p>
                </div>
                <div>
                  <label className="text-sm font-medium text-muted-foreground">
                    {t("products.details.margin")}
                  </label>
                  <p className="font-medium">
                    {product.price > 0 
                      ? `${((product.price - product.cost) / product.price * 100).toFixed(1)}%`
                      : "0%"
                    }
                  </p>
                </div>
                <div>
                  <label className="text-sm font-medium text-muted-foreground">
                    {t("products.details.currency")}
                  </label>
                  <p>{product.currency}</p>
                </div>
              </CardContent>
            </Card>

            {/* Physical Properties */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center space-x-2">
                  <Box className="h-5 w-5" />
                  <span>{t("products.details.physical")}</span>
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                {product.weight && (
                  <div>
                    <label className="text-sm font-medium text-muted-foreground">
                      {t("products.details.weight")}
                    </label>
                    <p className="flex items-center space-x-2">
                      <Weight className="h-4 w-4" />
                      <span>{getWeightDisplay(product.weight)}</span>
                    </p>
                  </div>
                )}
                {product.dimensions && (
                  <div>
                    <label className="text-sm font-medium text-muted-foreground">
                      {t("products.details.dimensions")}
                    </label>
                    <p className="flex items-center space-x-2">
                      <Box className="h-4 w-4" />
                      <span>{getDimensionsDisplay(product.dimensions)}</span>
                    </p>
                  </div>
                )}
                {!product.weight && !product.dimensions && (
                  <p className="text-muted-foreground text-sm">
                    {t("products.details.noPhysicalProperties")}
                  </p>
                )}
              </CardContent>
            </Card>

            {/* Metadata */}
            <Card>
              <CardHeader>
                <CardTitle>{t("products.details.metadata")}</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <label className="text-sm font-medium text-muted-foreground">
                    {t("products.details.createdAt")}
                  </label>
                  <p className="text-sm">
                    {new Date(product.created_at).toLocaleString()}
                  </p>
                </div>
                <div>
                  <label className="text-sm font-medium text-muted-foreground">
                    {t("products.details.updatedAt")}
                  </label>
                  <p className="text-sm">
                    {new Date(product.updated_at).toLocaleString()}
                  </p>
                </div>
                <div>
                  <label className="text-sm font-medium text-muted-foreground">
                    {t("products.details.id")}
                  </label>
                  <p className="font-mono text-xs">{product.id}</p>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        {/* Variants Tab */}
        <TabsContent value="variants" className="space-y-6">
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle className="flex items-center space-x-2">
                  <Package className="h-5 w-5" />
                  <span>{t("products.variants.title")}</span>
                </CardTitle>
                {onManageVariants && (
                  <Button onClick={() => onManageVariants(product)}>
                    <Package className="h-4 w-4 mr-2" />
                    {t("products.variants.manage")}
                  </Button>
                )}
              </div>
            </CardHeader>
            <CardContent>
              {variants?.data && variants.data.length > 0 ? (
                <div className="space-y-4">
                  {variants.data.map((variant) => (
                    <div key={variant.id} className="flex items-center justify-between p-4 border rounded-lg">
                      <div>
                        <h4 className="font-medium">{variant.name}</h4>
                        <p className="text-sm text-muted-foreground font-mono">{variant.sku}</p>
                        <div className="flex items-center space-x-4 mt-2">
                          <span className="text-sm">
                            {t("products.details.price")}: {getPriceDisplay(variant.price, product.currency)}
                          </span>
                          <Badge variant={variant.is_active ? "default" : "secondary"}>
                            {variant.is_active ? t("products.status.active") : t("products.status.inactive")}
                          </Badge>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-8">
                  <Package className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
                  <h3 className="text-lg font-medium">{t("products.variants.empty")}</h3>
                  <p className="text-muted-foreground mt-2">
                    {t("products.variants.emptyDescription")}
                  </p>
                  {onManageVariants && (
                    <Button className="mt-4" onClick={() => onManageVariants(product)}>
                      <Package className="h-4 w-4 mr-2" />
                      {t("products.variants.createFirst")}
                    </Button>
                  )}
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        {/* Barcodes Tab */}
        <TabsContent value="barcodes" className="space-y-6">
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle className="flex items-center space-x-2">
                  <Barcode className="h-5 w-5" />
                  <span>{t("products.barcodes.title")}</span>
                </CardTitle>
                {onManageBarcodes && (
                  <Button onClick={() => onManageBarcodes(product)}>
                    <Barcode className="h-4 w-4 mr-2" />
                    {t("products.barcodes.manage")}
                  </Button>
                )}
              </div>
            </CardHeader>
            <CardContent>
              {barcodes?.data && barcodes.data.length > 0 ? (
                <div className="space-y-4">
                  {barcodes.data.map((barcode) => (
                    <div key={barcode.id} className="flex items-center justify-between p-4 border rounded-lg">
                      <div>
                        <h4 className="font-medium font-mono">{barcode.barcode}</h4>
                        <div className="flex items-center space-x-4 mt-2">
                          <span className="text-sm">{t("products.barcodes.type")}: {barcode.barcode_type}</span>
                          {barcode.is_primary && (
                            <Badge variant="default">{t("products.barcodes.primary")}</Badge>
                          )}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-8">
                  <Barcode className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
                  <h3 className="text-lg font-medium">{t("products.barcodes.empty")}</h3>
                  <p className="text-muted-foreground mt-2">
                    {t("products.barcodes.emptyDescription")}
                  </p>
                  {onManageBarcodes && (
                    <Button className="mt-4" onClick={() => onManageBarcodes(product)}>
                      <Barcode className="h-4 w-4 mr-2" />
                      {t("products.barcodes.createFirst")}
                    </Button>
                  )}
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        {/* Inventory Tab */}
        <TabsContent value="inventory" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <Eye className="h-5 w-5" />
                <span>{t("products.inventory.title")}</span>
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-center py-8">
                <Eye className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
                <h3 className="text-lg font-medium">{t("products.inventory.comingSoon")}</h3>
                <p className="text-muted-foreground mt-2">
                  {t("products.inventory.comingSoonDescription")}
                </p>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
