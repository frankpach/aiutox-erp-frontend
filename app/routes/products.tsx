/**
 * Products page
 * Main page for products management
 */

import { useState } from "react";
import { useTranslation } from "~/lib/i18n/useTranslation";
import { PageLayout } from "~/components/layout/PageLayout";
// import { Button } from "~/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "~/components/ui/dialog";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "~/components/ui/tabs";
import { ProductList } from "~/features/products/components/ProductList";
import { ProductDetail } from "~/features/products/components/ProductDetail";
import { ProductForm } from "~/features/products/components/ProductForm";
import { ProductVariants } from "~/features/products/components/ProductVariants";
import { ProductBarcodes } from "~/features/products/components/ProductBarcodes";
import { 
//  useProduct, 
  useCreateProduct, 
  useUpdateProduct
} from "~/features/products/hooks/useProducts";
import type { Product } from "~/features/products/types/product.types";

export default function ProductsPage() {
  const { t } = useTranslation();
  const [currentTab, setCurrentTab] = useState("list");
  const [showCreateDialog, setShowCreateDialog] = useState(false);
  const [showEditDialog, setShowEditDialog] = useState(false);
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);
  const [detailProductId, setDetailProductId] = useState<string | null>(null);
  const [variantsProductId, setVariantsProductId] = useState<string | null>(null);
  const [barcodesProductId, setBarcodesProductId] = useState<string | null>(null);

  // Queries
  const createProductMutation = useCreateProduct();
  const updateProductMutation = useUpdateProduct();

  const handleCreateProduct = () => {
    setSelectedProduct(null);
    setShowCreateDialog(true);
  };

  const handleEditProduct = (product: Product) => {
    setSelectedProduct(product);
    setShowEditDialog(true);
  };

  const handleViewProduct = (product: Product) => {
    setDetailProductId(product.id);
    setCurrentTab("detail");
  };

  const handleManageVariants = (product: Product) => {
    setVariantsProductId(product.id);
    setCurrentTab("variants");
  };

  const handleManageBarcodes = (_product: Product) => {
    setBarcodesProductId(_product.id);
    setCurrentTab("barcodes");
  };

  const handleProductSubmit = (_product: Product) => {
    if (showCreateDialog) {
      setShowCreateDialog(false);
    } else if (showEditDialog) {
      setShowEditDialog(false);
      setSelectedProduct(null);
    }
    setCurrentTab("list");
  };

  const handleProductCancel = () => {
    setShowCreateDialog(false);
    setShowEditDialog(false);
    setSelectedProduct(null);
  };

  const handleBackToList = () => {
    setCurrentTab("list");
    setDetailProductId(null);
    setVariantsProductId(null);
    setBarcodesProductId(null);
  };

  const renderCurrentTab = () => {
    switch (currentTab) {
      case "list":
        return (
          <ProductList
            onEdit={handleEditProduct}
            onView={handleViewProduct}
            onManageVariants={handleManageVariants}
            onManageBarcodes={handleManageBarcodes}
            onCreate={handleCreateProduct}
          />
        );

      case "detail":
        return (
          detailProductId ? (
            <ProductDetail
              productId={detailProductId}
              onEdit={handleEditProduct}
              onBack={handleBackToList}
              onManageVariants={handleManageVariants}
              onManageBarcodes={handleManageBarcodes}
            />
          ) : null
        );

      case "variants":
        return (
          variantsProductId ? (
            <ProductVariants
              product={selectedProduct || ({} as Product)}
              onBack={handleBackToList}
            />
          ) : null
        );

      case "barcodes":
        return (
          barcodesProductId ? (
            <ProductBarcodes
              product={selectedProduct || ({} as Product)}
              onBack={handleBackToList}
            />
          ) : null
        );

      default:
        return null;
    }
  };

  return (
    <PageLayout
      title={t("products.title")}
      description={t("products.description")}
    >
      <div className="space-y-6">
        {/* Main Tabs */}
        <Tabs value={currentTab} onValueChange={setCurrentTab}>
          <TabsList className="grid w-full grid-cols-4">
            <TabsTrigger value="list">{t("products.tabs.list")}</TabsTrigger>
            <TabsTrigger value="detail">{t("products.tabs.detail")}</TabsTrigger>
            <TabsTrigger value="variants">{t("products.tabs.variants")}</TabsTrigger>
            <TabsTrigger value="barcodes">{t("products.tabs.barcodes")}</TabsTrigger>
          </TabsList>

          <TabsContent value="list" className="space-y-6">
            <ProductList
              onEdit={handleEditProduct}
              onView={handleViewProduct}
              onManageVariants={handleManageVariants}
              onManageBarcodes={handleManageBarcodes}
              onCreate={handleCreateProduct}
            />
          </TabsContent>

          <TabsContent value="detail" className="space-y-6">
            {renderCurrentTab()}
          </TabsContent>

          <TabsContent value="variants" className="space-y-6">
            {renderCurrentTab()}
          </TabsContent>

          <TabsContent value="barcodes" className="space-y-6">
            {renderCurrentTab()}
          </TabsContent>
        </Tabs>

        {/* Create Product Dialog */}
        <Dialog open={showCreateDialog} onOpenChange={setShowCreateDialog}>
          <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle>{t("products.create")}</DialogTitle>
            </DialogHeader>
            <ProductForm
              onSubmit={handleProductSubmit}
              onCancel={handleProductCancel}
              loading={createProductMutation.isPending}
            />
          </DialogContent>
        </Dialog>

        {/* Edit Product Dialog */}
        <Dialog open={showEditDialog} onOpenChange={setShowEditDialog}>
          <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle>{t("products.edit")}</DialogTitle>
            </DialogHeader>
            <ProductForm
              product={selectedProduct || undefined}
              onSubmit={handleProductSubmit}
              onCancel={handleProductCancel}
              loading={updateProductMutation.isPending}
            />
          </DialogContent>
        </Dialog>
      </div>
    </PageLayout>
  );
}
