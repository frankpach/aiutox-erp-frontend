/**
 * ProductBarcodes component
 * Manages product barcodes
 */

import { useState } from "react";
import { useTranslation } from "~/lib/i18n/useTranslation";
import { Button } from "~/components/ui/button";
import { Badge } from "~/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "~/components/ui/card";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "~/components/ui/dialog";
import { Input } from "~/components/ui/input";
import { Label } from "~/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "~/components/ui/select";
import { Switch } from "~/components/ui/switch";
import { Plus, Edit, Trash2, Barcode, QrCode } from "lucide-react";
import { 
  useProductBarcodes, 
  useCreateBarcode, 
  useUpdateBarcode, 
  useDeleteBarcode 
} from "~/features/products/hooks/useProducts";
import type { 
  Product, 
  ProductBarcode, 
  ProductBarcodeCreate, 
  ProductBarcodeUpdate 
} from "~/features/products/types/product.types";

interface ProductBarcodesProps {
  product: Product;
  onBack?: () => void;
}

export function ProductBarcodes({ product, onBack }: ProductBarcodesProps) {
  const { t } = useTranslation();
  const [showCreateDialog, setShowCreateDialog] = useState(false);
  const [editingBarcode, setEditingBarcode] = useState<ProductBarcode | null>(null);

  // Queries
  const { data: barcodesData, refetch } = useProductBarcodes(product.id);
  const createBarcodeMutation = useCreateBarcode(product.id);
  const updateBarcodeMutation = useUpdateBarcode(product.id);
  const deleteBarcodeMutation = useDeleteBarcode(product.id);

  const barcodes = barcodesData?.data || [];

  const handleCreateBarcode = async (data: ProductBarcodeCreate | ProductBarcodeUpdate) => {
    try {
      await createBarcodeMutation.mutateAsync(data as ProductBarcodeCreate);
      setShowCreateDialog(false);
      refetch();
    } catch (error) {
      console.error("Failed to create barcode:", error);
    }
  };

  const handleUpdateBarcode = async (barcodeId: string, data: ProductBarcodeUpdate) => {
    try {
      await updateBarcodeMutation.mutateAsync({ barcodeId, payload: data });
      setEditingBarcode(null);
      refetch();
    } catch (error) {
      console.error("Failed to update barcode:", error);
    }
  };

  const handleDeleteBarcode = async (barcodeId: string) => {
    if (confirm(t("products.barcodes.confirmDelete"))) {
      try {
        await deleteBarcodeMutation.mutateAsync(barcodeId);
        refetch();
      } catch (error) {
        console.error("Failed to delete barcode:", error);
      }
    }
  };

  const getBarcodeIcon = (type: string) => {
    switch (type.toLowerCase()) {
      case "qr":
        return <QrCode className="h-4 w-4" />;
      case "ean13":
      case "upc":
      case "code128":
      default:
        return <Barcode className="h-4 w-4" />;
    }
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
            <h1 className="text-2xl font-bold">{t("products.barcodes.title")}</h1>
            <p className="text-muted-foreground">{product.name}</p>
          </div>
        </div>
        <Dialog open={showCreateDialog} onOpenChange={setShowCreateDialog}>
          <DialogTrigger asChild>
            <Button>
              <Plus className="h-4 w-4 mr-2" />
              {t("products.barcodes.create")}
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-md">
            <DialogHeader>
              <DialogTitle>{t("products.barcodes.create")}</DialogTitle>
            </DialogHeader>
            <BarcodeForm
              onSubmit={handleCreateBarcode}
              onCancel={() => setShowCreateDialog(false)}
            />
          </DialogContent>
        </Dialog>
      </div>

      {/* Barcodes List */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <Barcode className="h-5 w-5" />
            <span>{t("products.barcodes.list")}</span>
            <Badge variant="secondary">{barcodes.length}</Badge>
          </CardTitle>
        </CardHeader>
        <CardContent>
          {barcodes.length > 0 ? (
            <div className="space-y-4">
              {barcodes.map((barcode) => (
                <div key={barcode.id} className="flex items-center justify-between p-4 border rounded-lg">
                  <div className="flex items-center space-x-4">
                    <div className="flex items-center space-x-2">
                      {getBarcodeIcon(barcode.barcode_type)}
                      <div>
                        <h4 className="font-medium font-mono">{barcode.barcode}</h4>
                        <div className="flex items-center space-x-2 mt-1">
                          <Badge variant="outline">{barcode.barcode_type}</Badge>
                          {barcode.is_primary && (
                            <Badge variant="default">{t("products.barcodes.primary")}</Badge>
                          )}
                        </div>
                      </div>
                    </div>
                  </div>
                  <div className="flex items-center space-x-2">
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => setEditingBarcode(barcode)}
                    >
                      <Edit className="h-4 w-4" />
                    </Button>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => handleDeleteBarcode(barcode.id)}
                      disabled={deleteBarcodeMutation.isPending}
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
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
              <Button className="mt-4" onClick={() => setShowCreateDialog(true)}>
                <Plus className="h-4 w-4 mr-2" />
                {t("products.barcodes.createFirst")}
              </Button>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Edit Barcode Dialog */}
      <Dialog open={!!editingBarcode} onOpenChange={(open) => !open && setEditingBarcode(null)}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>{t("products.barcodes.edit")}</DialogTitle>
          </DialogHeader>
          {editingBarcode && (
            <BarcodeForm
              barcode={editingBarcode}
              onSubmit={(data) => handleUpdateBarcode(editingBarcode.id, data)}
              onCancel={() => setEditingBarcode(null)}
            />
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}

interface BarcodeFormProps {
  barcode?: ProductBarcode;
  onSubmit: (data: ProductBarcodeCreate | ProductBarcodeUpdate) => void;
  onCancel: () => void;
}

function BarcodeForm({ barcode, onSubmit, onCancel }: BarcodeFormProps) {
  const { t } = useTranslation();
  const [formData, setFormData] = useState({
    barcode: barcode?.barcode || "",
    barcode_type: barcode?.barcode_type || "CODE128",
    is_primary: barcode?.is_primary ?? false,
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSubmit(formData);
  };

  
  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div>
        <Label htmlFor="barcode">{t("products.barcodes.form.barcode")} *</Label>
        <Input
          id="barcode"
          value={formData.barcode}
          onChange={(e) => setFormData(prev => ({ ...prev, barcode: e.target.value }))}
          placeholder={t("products.barcodes.form.barcodePlaceholder")}
          required
        />
      </div>

      <div>
        <Label htmlFor="barcode_type">{t("products.barcodes.form.type")} *</Label>
        <Select
          value={formData.barcode_type}
          onValueChange={(value) => setFormData(prev => ({ ...prev, barcode_type: value }))}
        >
          <SelectTrigger>
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            {[
              { value: "CODE128", label: "Code 128" },
              { value: "EAN13", label: "EAN-13" },
              { value: "UPC", label: "UPC" },
              { value: "QR", label: "QR Code" },
              { value: "CODE39", label: "Code 39" },
              { value: "ITF14", label: "ITF-14" },
            ].map((type: { value: string; label: string }) => (
              <SelectItem key={type.value} value={type.value}>
                {type.label}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      <div className="flex items-center space-x-2">
        <Switch
          id="is_primary"
          checked={formData.is_primary}
          onCheckedChange={(checked) => setFormData(prev => ({ ...prev, is_primary: checked }))}
        />
        <Label htmlFor="is_primary">{t("products.barcodes.form.primary")}</Label>
      </div>

      <div className="text-xs text-muted-foreground">
        <p>{t("products.barcodes.form.primaryNote")}</p>
      </div>

      <div className="flex items-center justify-end space-x-4">
        <Button type="button" variant="outline" onClick={onCancel}>
          {t("common.cancel")}
        </Button>
        <Button type="submit">
          {barcode ? t("common.update") : t("common.create")}
        </Button>
      </div>
    </form>
  );
}
