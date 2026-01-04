/**
 * ProductForm component
 * Form for creating and editing products
 */

import { useState, useEffect } from "react";
import { useTranslation } from "~/lib/i18n/useTranslation";
import { Button } from "~/components/ui/button";
import { Input } from "~/components/ui/input";
import { Label } from "~/components/ui/label";
import { Textarea } from "~/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "~/components/ui/select";
import { Card, CardContent, CardHeader, CardTitle } from "~/components/ui/card";
import { Switch } from "~/components/ui/switch";
import { Badge } from "~/components/ui/badge";
import { Package, Save, X, Plus, Trash2 } from "lucide-react";
import { 
  useCreateProduct, 
  useUpdateProduct, 
  useProductCategories 
} from "~/features/products/hooks/useProducts";
import type { 
  Product, 
  ProductCreate, 
  ProductUpdate, 
  ProductDimensions 
} from "~/features/products/types/product.types";

interface ProductFormProps {
  product?: Product;
  onSubmit?: (product: Product) => void;
  onCancel?: () => void;
  loading?: boolean;
}

export function ProductForm({ 
  product, 
  onSubmit, 
  onCancel, 
  loading: externalLoading 
}: ProductFormProps) {
  const { t } = useTranslation();
  const [formData, setFormData] = useState<ProductCreate>({
    category_id: "",
    sku: "",
    name: "",
    description: "",
    price: 0,
    cost: 0,
    currency: "USD",
    weight: undefined,
    dimensions: undefined,
    track_inventory: false,
    is_active: true,
  });

  const [dimensions, setDimensions] = useState<ProductDimensions>({
    length: 0,
    width: 0,
    height: 0,
    unit: "cm",
  });

  const createMutation = useCreateProduct();
  const updateMutation = useUpdateProduct();
  const { data: categories } = useProductCategories();

  const isEditing = !!product;
  const isLoading = externalLoading || createMutation.isPending || updateMutation.isPending;

  useEffect(() => {
    if (product) {
      setFormData({
        category_id: product.category_id,
        sku: product.sku,
        name: product.name,
        description: product.description || "",
        price: product.price,
        cost: product.cost,
        currency: product.currency,
        weight: product.weight,
        dimensions: product.dimensions,
        track_inventory: product.track_inventory,
        is_active: product.is_active,
      });
      if (product.dimensions) {
        setDimensions(product.dimensions);
      }
    }
  }, [product]);

  const handleInputChange = (field: keyof ProductCreate, value: any) => {
    setFormData(prev => ({
      ...prev,
      [field]: value,
    }));
  };

  const handleDimensionChange = (field: keyof ProductDimensions, value: number) => {
    const newDimensions = { ...dimensions, [field]: value };
    setDimensions(newDimensions);
    setFormData(prev => ({
      ...prev,
      dimensions: newDimensions,
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    try {
      let result;
      if (isEditing && product) {
        result = await updateMutation.mutateAsync({
          id: product.id,
          payload: formData,
        });
      } else {
        result = await createMutation.mutateAsync(formData);
      }

      if (result.data && onSubmit) {
        onSubmit(result.data);
      }
    } catch (error) {
      console.error("Form submission failed:", error);
    }
  };

  const handleCancel = () => {
    if (onCancel) {
      onCancel();
    }
  };

  const currencies = [
    { value: "USD", label: "USD ($)" },
    { value: "EUR", label: "EUR (€)" },
    { value: "GBP", label: "GBP (£)" },
    { value: "JPY", label: "JPY (¥)" },
    { value: "CNY", label: "CNY (¥)" },
    { value: "MXN", label: "MXN ($)" },
  ];

  const dimensionUnits = [
    { value: "cm", label: "cm" },
    { value: "in", label: "in" },
    { value: "mm", label: "mm" },
  ];

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Basic Information */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center space-x-2">
              <Package className="h-5 w-5" />
              <span>{t("products.form.basic")}</span>
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <Label htmlFor="name">{t("products.form.name")} *</Label>
              <Input
                id="name"
                value={formData.name}
                onChange={(e) => handleInputChange("name", e.target.value)}
                placeholder={t("products.form.namePlaceholder")}
                required
              />
            </div>

            <div>
              <Label htmlFor="sku">{t("products.form.sku")} *</Label>
              <Input
                id="sku"
                value={formData.sku}
                onChange={(e) => handleInputChange("sku", e.target.value)}
                placeholder={t("products.form.skuPlaceholder")}
                required
              />
            </div>

            <div>
              <Label htmlFor="category">{t("products.form.category")} *</Label>
              <Select
                value={formData.category_id}
                onValueChange={(value) => handleInputChange("category_id", value)}
                required
              >
                <SelectTrigger>
                  <SelectValue placeholder={t("products.form.categoryPlaceholder")} />
                </SelectTrigger>
                <SelectContent>
                  {categories?.data?.map((category) => (
                    <SelectItem key={category.id} value={category.id}>
                      {category.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div>
              <Label htmlFor="description">{t("products.form.description")}</Label>
              <Textarea
                id="description"
                value={formData.description}
                onChange={(e) => handleInputChange("description", e.target.value)}
                placeholder={t("products.form.descriptionPlaceholder")}
                rows={3}
              />
            </div>

            <div className="flex items-center space-x-2">
              <Switch
                id="is_active"
                checked={formData.is_active}
                onCheckedChange={(checked) => handleInputChange("is_active", checked)}
              />
              <Label htmlFor="is_active">{t("products.form.active")}</Label>
            </div>
          </CardContent>
        </Card>

        {/* Pricing */}
        <Card>
          <CardHeader>
            <CardTitle>{t("products.form.pricing")}</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <Label htmlFor="price">{t("products.form.price")} *</Label>
              <Input
                id="price"
                type="number"
                step="0.01"
                min="0"
                value={formData.price}
                onChange={(e) => handleInputChange("price", parseFloat(e.target.value) || 0)}
                placeholder="0.00"
                required
              />
            </div>

            <div>
              <Label htmlFor="cost">{t("products.form.cost")} *</Label>
              <Input
                id="cost"
                type="number"
                step="0.01"
                min="0"
                value={formData.cost}
                onChange={(e) => handleInputChange("cost", parseFloat(e.target.value) || 0)}
                placeholder="0.00"
                required
              />
            </div>

            <div>
              <Label htmlFor="currency">{t("products.form.currency")} *</Label>
              <Select
                value={formData.currency}
                onValueChange={(value) => handleInputChange("currency", value)}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {currencies.map((currency) => (
                    <SelectItem key={currency.value} value={currency.value}>
                      {currency.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {formData.price > 0 && formData.cost > 0 && (
              <div className="p-3 bg-muted rounded-lg">
                <div className="text-sm">
                  <div className="flex justify-between">
                    <span>{t("products.form.margin")}:</span>
                    <span className="font-medium">
                      {((formData.price - formData.cost) / formData.price * 100).toFixed(1)}%
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span>{t("products.form.profit")}:</span>
                    <span className="font-medium text-green-600">
                      ${(formData.price - formData.cost).toFixed(2)}
                    </span>
                  </div>
                </div>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Physical Properties */}
        <Card>
          <CardHeader>
            <CardTitle>{t("products.form.physical")}</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <Label htmlFor="weight">{t("products.form.weight")}</Label>
              <Input
                id="weight"
                type="number"
                step="0.01"
                min="0"
                value={formData.weight || ""}
                onChange={(e) => handleInputChange("weight", e.target.value ? parseFloat(e.target.value) : undefined)}
                placeholder="0.00"
              />
              <p className="text-xs text-muted-foreground mt-1">
                {t("products.form.weightUnit")}
              </p>
            </div>

            <div>
              <Label>{t("products.form.dimensions")}</Label>
              <div className="grid grid-cols-4 gap-2 items-end">
                <div>
                  <Input
                    type="number"
                    step="0.01"
                    min="0"
                    value={dimensions.length}
                    onChange={(e) => handleDimensionChange("length", parseFloat(e.target.value) || 0)}
                    placeholder="0"
                  />
                  <p className="text-xs text-muted-foreground mt-1">{t("products.form.length")}</p>
                </div>
                <div>
                  <Input
                    type="number"
                    step="0.01"
                    min="0"
                    value={dimensions.width}
                    onChange={(e) => handleDimensionChange("width", parseFloat(e.target.value) || 0)}
                    placeholder="0"
                  />
                  <p className="text-xs text-muted-foreground mt-1">{t("products.form.width")}</p>
                </div>
                <div>
                  <Input
                    type="number"
                    step="0.01"
                    min="0"
                    value={dimensions.height}
                    onChange={(e) => handleDimensionChange("height", parseFloat(e.target.value) || 0)}
                    placeholder="0"
                  />
                  <p className="text-xs text-muted-foreground mt-1">{t("products.form.height")}</p>
                </div>
                <div>
                  <Select
                    value={dimensions.unit}
                    onValueChange={(value) => {
                      const newDimensions = { ...dimensions, unit: value };
                      setDimensions(newDimensions);
                      setFormData(prev => ({
                        ...prev,
                        dimensions: newDimensions,
                      }));
                    }}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {dimensionUnits.map((unit) => (
                        <SelectItem key={unit.value} value={unit.value}>
                          {unit.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>
            </div>

            <div className="flex items-center space-x-2">
              <Switch
                id="track_inventory"
                checked={formData.track_inventory}
                onCheckedChange={(checked) => handleInputChange("track_inventory", checked)}
              />
              <Label htmlFor="track_inventory">{t("products.form.trackInventory")}</Label>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Form Actions */}
      <div className="flex items-center justify-end space-x-4">
        <Button
          type="button"
          variant="outline"
          onClick={handleCancel}
          disabled={isLoading}
        >
          <X className="h-4 w-4 mr-2" />
          {t("common.cancel")}
        </Button>
        <Button
          type="submit"
          disabled={isLoading}
        >
          <Save className="h-4 w-4 mr-2" />
          {isLoading 
            ? t("common.saving") 
            : isEditing 
              ? t("common.update") 
              : t("common.create")
          }
        </Button>
      </div>
    </form>
  );
}
