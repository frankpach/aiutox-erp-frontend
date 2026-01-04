/**
 * ProductVariants component
 * Manages product variants
 */

import { useState } from "react";
import { useTranslation } from "~/lib/i18n/useTranslation";
import { Button } from "~/components/ui/button";
import { Badge } from "~/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "~/components/ui/card";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "~/components/ui/dialog";
import { Input } from "~/components/ui/input";
import { Label } from "~/components/ui/label";
import { Switch } from "~/components/ui/switch";
import { Plus, Edit, Trash2, Package } from "lucide-react";
import { 
  useProductVariants, 
  useCreateVariant, 
  useUpdateVariant, 
  useDeleteVariant 
} from "~/features/products/hooks/useProducts";
import type { 
  Product, 
  ProductVariant, 
  ProductVariantCreate, 
  ProductVariantUpdate 
} from "~/features/products/types/product.types";

interface ProductVariantsProps {
  product: Product;
  onBack?: () => void;
}

export function ProductVariants({ product, onBack }: ProductVariantsProps) {
  const { t } = useTranslation();
  const [showCreateDialog, setShowCreateDialog] = useState(false);
  const [editingVariant, setEditingVariant] = useState<ProductVariant | null>(null);

  // Queries
  const { data: variantsData, isLoading, refetch } = useProductVariants(product.id);
  const createVariantMutation = useCreateVariant(product.id);
  const updateVariantMutation = useUpdateVariant(product.id);
  const deleteVariantMutation = useDeleteVariant(product.id);

  const variants = variantsData?.data || [];

  const handleCreateVariant = async (data: ProductVariantCreate) => {
    try {
      await createVariantMutation.mutateAsync(data);
      setShowCreateDialog(false);
      refetch();
    } catch (error) {
      console.error("Failed to create variant:", error);
    }
  };

  const handleUpdateVariant = async (variantId: string, data: ProductVariantUpdate) => {
    try {
      await updateVariantMutation.mutateAsync({ variantId, payload: data });
      setEditingVariant(null);
      refetch();
    } catch (error) {
      console.error("Failed to update variant:", error);
    }
  };

  const handleDeleteVariant = async (variantId: string) => {
    if (confirm(t("products.variants.confirmDelete"))) {
      try {
        await deleteVariantMutation.mutateAsync(variantId);
        refetch();
      } catch (error) {
        console.error("Failed to delete variant:", error);
      }
    }
  };

  const getPriceDisplay = (price: number) => {
    return new Intl.NumberFormat('es-ES', {
      style: 'currency',
      currency: product.currency || 'USD',
    }).format(price);
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-4">
          <Button variant="ghost" size="sm" onClick={onBack}>
            ← {t("common.back")}
          </Button>
          <div>
            <h1 className="text-2xl font-bold">{t("products.variants.title")}</h1>
            <p className="text-muted-foreground">{product.name}</p>
          </div>
        </div>
        <Dialog open={showCreateDialog} onOpenChange={setShowCreateDialog}>
          <DialogTrigger asChild>
            <Button>
              <Plus className="h-4 w-4 mr-2" />
              {t("products.variants.create")}
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-md">
            <DialogHeader>
              <DialogTitle>{t("products.variants.create")}</DialogTitle>
            </DialogHeader>
            <VariantForm
              onSubmit={handleCreateVariant}
              onCancel={() => setShowCreateDialog(false)}
            />
          </DialogContent>
        </Dialog>
      </div>

      {/* Variants List */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <Package className="h-5 w-5" />
            <span>{t("products.variants.list")}</span>
            <Badge variant="secondary">{variants.length}</Badge>
          </CardTitle>
        </CardHeader>
        <CardContent>
          {variants.length > 0 ? (
            <div className="space-y-4">
              {variants.map((variant) => (
                <div key={variant.id} className="flex items-center justify-between p-4 border rounded-lg">
                  <div className="flex-1">
                    <div className="flex items-center space-x-4">
                      <div>
                        <h4 className="font-medium">{variant.name}</h4>
                        <p className="text-sm text-muted-foreground font-mono">{variant.sku}</p>
                      </div>
                      <div className="flex items-center space-x-4">
                        <div>
                          <span className="text-sm text-muted-foreground">{t("products.details.price")}</span>
                          <p className="font-medium">{getPriceDisplay(variant.price)}</p>
                        </div>
                        <div>
                          <span className="text-sm text-muted-foreground">{t("products.details.cost")}</span>
                          <p className="font-medium">{getPriceDisplay(variant.cost)}</p>
                        </div>
                        <Badge variant={variant.is_active ? "default" : "secondary"}>
                          {variant.is_active ? t("products.status.active") : t("products.status.inactive")}
                        </Badge>
                      </div>
                    </div>
                    {Object.keys(variant.attributes).length > 0 && (
                      <div className="mt-2">
                        <p className="text-sm text-muted-foreground">{t("products.variants.attributes")}:</p>
                        <div className="flex flex-wrap gap-2 mt-1">
                          {Object.entries(variant.attributes).map(([key, value]) => (
                            <Badge key={key} variant="outline" className="text-xs">
                              {key}: {value}
                            </Badge>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>
                  <div className="flex items-center space-x-2">
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => setEditingVariant(variant)}
                    >
                      <Edit className="h-4 w-4" />
                    </Button>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => handleDeleteVariant(variant.id)}
                      disabled={deleteVariantMutation.isPending}
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
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
              <Button className="mt-4" onClick={() => setShowCreateDialog(true)}>
                <Plus className="h-4 w-4 mr-2" />
                {t("products.variants.createFirst")}
              </Button>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Edit Variant Dialog */}
      <Dialog open={!!editingVariant} onOpenChange={(open) => !open && setEditingVariant(null)}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>{t("products.variants.edit")}</DialogTitle>
          </DialogHeader>
          {editingVariant && (
            <VariantForm
              variant={editingVariant}
              onSubmit={(data) => handleUpdateVariant(editingVariant.id, data)}
              onCancel={() => setEditingVariant(null)}
            />
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}

interface VariantFormProps {
  variant?: ProductVariant;
  onSubmit: (data: ProductVariantCreate | ProductVariantUpdate) => void;
  onCancel: () => void;
}

function VariantForm({ variant, onSubmit, onCancel }: VariantFormProps) {
  const { t } = useTranslation();
  const [formData, setFormData] = useState({
    sku: variant?.sku || "",
    name: variant?.name || "",
    price: variant?.price || 0,
    cost: variant?.cost || 0,
    attributes: variant?.attributes || {},
    is_active: variant?.is_active ?? true,
  });

  const [newAttributeKey, setNewAttributeKey] = useState("");
  const [newAttributeValue, setNewAttributeValue] = useState("");

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSubmit(formData);
  };

  const handleAttributeAdd = () => {
    if (newAttributeKey && newAttributeValue) {
      setFormData(prev => ({
        ...prev,
        attributes: {
          ...prev.attributes,
          [newAttributeKey]: newAttributeValue,
        },
      }));
      setNewAttributeKey("");
      setNewAttributeValue("");
    }
  };

  const handleAttributeRemove = (key: string) => {
    setFormData(prev => {
      const newAttributes = { ...prev.attributes };
      delete newAttributes[key];
      return {
        ...prev,
        attributes: newAttributes,
      };
    });
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div>
        <Label htmlFor="name">{t("products.variants.form.name")} *</Label>
        <Input
          id="name"
          value={formData.name}
          onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
          placeholder={t("products.variants.form.namePlaceholder")}
          required
        />
      </div>

      <div>
        <Label htmlFor="sku">{t("products.variants.form.sku")} *</Label>
        <Input
          id="sku"
          value={formData.sku}
          onChange={(e) => setFormData(prev => ({ ...prev, sku: e.target.value }))}
          placeholder={t("products.variants.form.skuPlaceholder")}
          required
        />
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div>
          <Label htmlFor="price">{t("products.variants.form.price")} *</Label>
          <Input
            id="price"
            type="number"
            step="0.01"
            min="0"
            value={formData.price}
            onChange={(e) => setFormData(prev => ({ ...prev, price: parseFloat(e.target.value) || 0 }))}
            placeholder="0.00"
            required
          />
        </div>
        <div>
          <Label htmlFor="cost">{t("products.variants.form.cost")} *</Label>
          <Input
            id="cost"
            type="number"
            step="0.01"
            min="0"
            value={formData.cost}
            onChange={(e) => setFormData(prev => ({ ...prev, cost: parseFloat(e.target.value) || 0 }))}
            placeholder="0.00"
            required
          />
        </div>
      </div>

      <div>
        <Label>{t("products.variants.form.attributes")}</Label>
        <div className="space-y-2">
          {/* Existing attributes */}
          {Object.entries(formData.attributes).map(([key, value]) => (
            <div key={key} className="flex items-center justify-between p-2 border rounded">
              <span className="text-sm">
                <strong>{key}:</strong> {value}
              </span>
              <Button
                type="button"
                variant="ghost"
                size="sm"
                onClick={() => handleAttributeRemove(key)}
              >
                <Trash2 className="h-3 w-3" />
              </Button>
            </div>
          ))}
          
          {/* Add new attribute */}
          <div className="flex items-center space-x-2">
            <Input
              placeholder={t("products.variants.form.attributeKey")}
              value={newAttributeKey}
              onChange={(e) => setNewAttributeKey(e.target.value)}
              className="flex-1"
            />
            <Input
              placeholder={t("products.variants.form.attributeValue")}
              value={newAttributeValue}
              onChange={(e) => setNewAttributeValue(e.target.value)}
              className="flex-1"
            />
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={handleAttributeAdd}
              disabled={!newAttributeKey || !newAttributeValue}
            >
              <Plus className="h-4 w-4" />
            </Button>
          </div>
        </div>
      </div>

      <div className="flex items-center space-x-2">
        <Switch
          id="is_active"
          checked={formData.is_active}
          onCheckedChange={(checked) => setFormData(prev => ({ ...prev, is_active: checked }))}
        />
        <Label htmlFor="is_active">{t("products.variants.form.active")}</Label>
      </div>

      <div className="flex items-center justify-end space-x-4">
        <Button type="button" variant="outline" onClick={onCancel}>
          {t("common.cancel")}
        </Button>
        <Button type="submit">
          {variant ? t("common.update") : t("common.create")}
        </Button>
      </div>
    </form>
  );
}
