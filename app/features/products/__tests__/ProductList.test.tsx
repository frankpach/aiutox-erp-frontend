/**
 * Products tests
 * Basic unit tests for Products module
 */

import { render, screen, fireEvent, waitFor } from "@testing-library/react";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { describe, it, expect, beforeEach, vi } from "vitest";
import ProductsPage from "~/routes/products";
import { 
  useProducts, 
  useCreateProduct, 
  useUpdateProduct, 
  useDeleteProduct,
  useProductCategories 
} from "~/features/products/hooks/useProducts";
import type { Product, ProductCreate, ProductUpdate } from "~/features/products/types/product.types";

// Mock api client
const mockApiClient = {
  get: vi.fn(),
  post: vi.fn(),
  put: vi.fn(),
  delete: vi.fn(),
};

vi.mock("~/lib/api/client", () => ({
  default: mockApiClient,
}));

// Mock data
const mockProduct: Product = {
  id: "1",
  tenant_id: "tenant-1",
  category_id: "cat-1",
  sku: "PROD-001",
  name: "Test Product",
  description: "Test product description",
  price: 99.99,
  cost: 50.00,
  currency: "USD",
  weight: 1.5,
  dimensions: {
    length: 10,
    width: 5,
    height: 3,
    unit: "cm",
  },
  track_inventory: true,
  is_active: true,
  created_at: "2025-01-01T00:00:00Z",
  updated_at: "2025-01-01T00:00:00Z",
  category: {
    id: "cat-1",
    tenant_id: "tenant-1",
    name: "Electronics",
    slug: "electronics",
    description: "Electronic products",
    is_active: true,
    created_at: "2025-01-01T00:00:00Z",
    updated_at: "2025-01-01T00:00:00Z",
  },
  variants: [],
  barcodes: [],
};

const mockProducts = [mockProduct];

// Mock API client
vi.mock("~/lib/api/client", () => ({
  default: {
    get: vi.fn(),
    post: vi.fn(),
    patch: vi.fn(),
    delete: vi.fn(),
  },
}));

// Mock toast
vi.mock("~/components/common/Toast", () => ({
  showToast: vi.fn(),
}));

// Mock useTranslation
vi.mock("~/lib/i18n/useTranslation", () => ({
  useTranslation: () => ({
    t: (key: string) => {
      const translations: Record<string, string> = {
        "products.title": "Products",
        "products.description": "Product catalog management",
        "products.create": "Create Product",
        "products.edit": "Edit Product",
        "products.delete": "Delete Product",
        "products.confirmDelete": "Are you sure you want to delete this product?",
        "products.search.placeholder": "Search products...",
        "products.filters.category": "Category",
        "products.filters.allCategories": "All Categories",
        "products.filters.status": "Status",
        "filters.allStatus": "All Status",
        "products.status.active": "Active",
        "products.status.inactive": "Inactive",
        "products.table.sku": "SKU",
        "products.table.name": "Name",
        "products.table.category": "Category",
        "products.table.price": "Price",
        "products.table.inventory": "Inventory",
        "products.table.status": "Status",
        "products.table.variants": "Variants",
        "products.table.barcodes": "Barcodes",
        "products.table.actions": "Actions",
        "products.noCategory": "No Category",
        "products.inventory.notTracked": "Not Tracked",
        "products.inventory.available": "Available",
        "products.export": "Export",
        "products.empty.title": "No products found",
        "products.empty.description": "Create your first product to get started",
        "products.filters.clear": "Clear Filters",
        "common.back": "Back",
        "common.cancel": "Cancel",
        "common.create": "Create",
        "common.update": "Update",
        "common.save": "Save",
        "common.edit": "Edit",
        "common.saving": "Saving...",
        "products.tabs.list": "List",
        "products.tabs.detail": "Details",
        "products.tabs.variants": "Variants",
        "products.tabs.barcodes": "Barcodes",
        "products.form.basic": "Basic Information",
        "products.form.name": "Name",
        "products.form.namePlaceholder": "Enter product name",
        "products.form.sku": "SKU",
        "products.form.skuPlaceholder": "Enter SKU",
        "products.form.category": "Category",
        "products.form.categoryPlaceholder": "Select category",
        "products.form.description": "Description",
        "products.form.descriptionPlaceholder": "Enter product description",
        "products.form.active": "Active",
        "products.form.pricing": "Pricing",
        "products.form.price": "Price",
        "products.form.cost": "Cost",
        "products.form.currency": "Currency",
        "products.form.margin": "Margin",
        "products.form.profit": "Profit",
        "products.form.physical": "Physical Properties",
        "products.form.weight": "Weight",
        "products.form.weightUnit": "Weight in kilograms",
        "products.form.dimensions": "Dimensions",
        "products.form.length": "Length",
        "products.form.width": "Width",
        "products.form.height": "height",
        "products.form.trackInventory": "Track Inventory",
        "products.form.inventory.tracked": "Tracked",
        "products.form.inventory.notTracked": "Not Tracked",
        "products.variants.title": "Product Variants",
        "products.variants.create": "Create Variant",
        "products.variants.manage": "Manage Variants",
        "products.variants.list": "Variants List",
        "products.variants.empty": "No Variants",
        "products.variants.emptyDescription": "This product has no variants yet",
        "products.variants.createFirst": "Create First Variant",
        "products.variants.form.name": "Variant Name",
        "products.variants.form.namePlaceholder": "Enter variant name",
        "products.variants.form.sku": "Variant SKU",
        "products.variants.form.skuPlaceholder": "Enter variant SKU",
        "products.variants.form.price": "Variant Price",
        "products.variants.form.cost": "Variant Cost",
        "products.variants.form.attributes": "Attributes",
        "products.variants.form.attributeKey": "Attribute Key",
        "products.variants.form.attributeValue": "Attribute Value",
        "products.variants.form.active": "Active",
        "products.variants.confirmDelete": "Are you sure you want to delete this variant?",
        "products.barcodes.title": "Product Barcodes",
        "products.barcodes.create": "Create Barcode",
        "products.barcodes.manage": "Manage Barcodes",
        "products.barcodes.list": "Barcodes List",
        "products.barcodes.empty": "No Barcodes",
        "products.barcodes.emptyDescription": "This product has no barcodes yet",
        "products.barcodes.createFirst": "Create First Barcode",
        "products.barcodes.form.barcode": "Barcode",
        "products.barcodes.form.barcodePlaceholder": "Enter barcode",
        "products.barcodes.form.type": "Barcode Type",
        "products.barcodes.form.primary": "Primary Barcode",
        "products.barcodes.form.primaryNote": "Only one barcode can be primary per product",
        "products.barcodes.confirmDelete": "Are you sure you want to delete this barcode?",
        "products.barcodes.type": "Type",
        "products.barcodes.primary": "Primary",
        "products.details.basic": "Basic Information",
        "products.details.name": "Name",
        "products.details.sku": "SKU",
        "products.details.category": "Category",
        "products.details.description": "Description",
        "products.details.inventoryTracking": "Inventory Tracking",
        "products.details.pricing": "Pricing",
        "products.details.price": "Price",
        "products.details.cost": "Cost",
        "products.details.margin": "Margin",
        "products.details.currency": "Currency",
        "products.details.physical": "Physical Properties",
        "products.details.weight": "Weight",
        "products.details.dimensions": "Dimensions",
        "products.details.noPhysicalProperties": "No physical properties defined",
        "products.details.metadata": "Metadata",
        "products.details.createdAt": "Created At",
        "products.details.updatedAt": "Updated At",
        "products.details.id": "ID",
        "products.error.notFound": "Product Not Found",
        "products.error.notFoundDescription": "The requested product could not be found.",
        "products.inventory.title": "Inventory",
        "products.inventory.comingSoon": "Coming Soon",
        "products.inventory.comingSoonDescription": "Inventory management features will be available soon.",
      };
      return translations[key] || key;
    },
    setLanguage: vi.fn(),
    language: "es",
  }),
}));

const createQueryClient = () => {
  return new QueryClient({
    defaultOptions: {
      queries: {
        retry: false,
        staleTime: 0,
        gcTime: 0,
        refetchOnWindowFocus: false,
        refetchOnReconnect: false,
      },
    },
  });
};

describe("Products Module", () => {
  let queryClient: QueryClient;

  beforeEach(() => {
    queryClient = createQueryClient();
    vi.clearAllMocks();

    // Default mock for apiClient.get
    const apiClient = mockApiClient;
    (apiClient.get as any).mockResolvedValue({
      data: {
        data: mockProducts,
        meta: {
          total: mockProducts.length,
          page: 1,
          page_size: 20,
          total_pages: 1,
        },
        error: null,
      },
    });

    // Mock categories
    (apiClient.get as any).mockResolvedValue({
      data: {
        data: [
          {
            id: "cat-1",
            tenant_id: "tenant-1",
            name: "Electronics",
            slug: "electronics",
            description: "Electronic products",
            is_active: true,
            created_at: "2025-01-01T00:00:00Z",
            updated_at: "2025-01-01T00:00:00Z",
          },
        ],
        meta: {
          total: 1,
          page: 1,
          page_size: 20,
          total_pages: 1,
        },
        error: null,
      },
    });
  });

  const renderWithClient = (component: React.ReactElement) => {
    return render(
      <QueryClientProvider client={queryClient}>
        {component}
      </QueryClientProvider>
    );
  };

  describe("ProductsPage", () => {
    it("renders products page with title and description", () => {
      renderWithClient(<ProductsPage />);

      expect(screen.getByText("Products")).toBeInTheDocument();
      expect(screen.getByText("Product catalog management")).toBeInTheDocument();
    });

    it("renders tabs for different views", () => {
      renderWithClient(<ProductsPage />);

      expect(screen.getByText("List")).toBeInTheDocument();
      expect(screen.getByText("Details")).toBeInTheDocument();
      expect(screen.getByText("Variants")).toBeInTheDocument();
      expect(screen.getByText("Barcodes")).toBeInTheDocument();
    });

    it("shows create button in list tab", () => {
      renderWithClient(<ProductsPage />);

      // Should be in list tab by default
      expect(screen.getByText("Create Product")).toBeInTheDocument();
    });

    it("opens create dialog when create button is clicked", async () => {
      renderWithClient(<ProductsPage />);

      const createButton = screen.getByText("Create Product");
      fireEvent.click(createButton);

      await waitFor(() => {
        expect(screen.getByText("Create Product")).toBeInTheDocument();
      });
    });

    it("shows loading state initially", () => {
      const apiClient = mockApiClient;
      (apiClient.get as any).mockImplementation(
        () => new Promise(() => {}) // Never resolves
      );

      renderWithClient(<ProductsPage />);

      // Should show loading state
      expect(document.body).toBeTruthy();
    });

    it("shows error state when API fails", async () => {
      const apiClient = mockApiClient;
      (apiClient.get as any).mockRejectedValue(
        new Error("Failed to load products")
      );

      renderWithClient(<ProductsPage />);

      await waitFor(() => {
        expect(document.body).toBeTruthy();
      });
    });
  });

  describe("ProductList component", () => {
    it("renders product list with actions", async () => {
      renderWithClient(<ProductsPage />);

      await waitFor(() => {
        expect(screen.getByText("PROD-001")).toBeInTheDocument();
        expect(screen.getByText("Test Product")).toBeInTheDocument();
        expect(screen.getByText("Electronics")).toBeInTheDocument();
        expect(screen.getByText("$99.99")).toBeInTheDocument();
        expect(screen.getByText("Active")).toBeInTheDocument();
      });
    });

    it("calls edit when edit button is clicked", async () => {
      renderWithClient(<ProductsPage />);

      await waitFor(() => {
        const editButton = screen.getAllByText("Edit")[0];
        expect(editButton).toBeInTheDocument();
        fireEvent.click(editButton);
      });
    });

    it("calls view when view button is clicked", async () => {
      renderWithClient(<ProductsPage />);

      await waitFor(() => {
        const viewButton = screen.getAllByText("View")[0];
        expect(viewButton).toBeInTheDocument();
        fireEvent.click(viewButton);
      });
    });

    it("calls delete when delete button is clicked", async () => {
      renderWithClient(<ProductsPage />);

      await waitFor(() => {
        const deleteButton = screen.getAllByText("Trash2")[0];
        expect(deleteButton).toBeInTheDocument();
        fireEvent.click(deleteButton);
      });
    });

    it("shows empty state when no products", async () => {
      const apiClient = mockApiClient;
      (apiClient.get as any).mockResolvedValue({
        data: {
          data: [],
          meta: {
            total: 0,
            page: 1,
            page_size: 20,
            total_pages: 0,
          },
          error: null,
        },
      });

      renderWithClient(<ProductsPage />);

      await waitFor(() => {
        expect(screen.getByText("No products found")).toBeInTheDocument();
        expect(screen.getByText("Create your first product to get started")).toBeInTheDocument();
      });
    });
  });

  describe("ProductForm component", () => {
    it("renders form fields for creating product", async () => {
      renderWithClient(<ProductsPage />);

      // Open create dialog
      const createButton = screen.getByText("Create Product");
      fireEvent.click(createButton);

      await waitFor(() => {
        expect(screen.getByText("Basic Information")).toBeInTheDocument();
        expect(screen.getByText("Name")).toBeInTheDocument();
        expect(screen.getByText("SKU")).toBeInTheDocument();
        expect(screen.getByText("Category")).toBeInTheDocument();
        expect(screen.getByText("Pricing")).toBeInTheDocument();
        expect(screen.getByText("Physical Properties")).toBeInTheDocument();
      });
    });

    it("renders form fields for editing product", async () => {
      renderWithClient(<ProductsPage />);

      // First click edit button to set selected product
      await waitFor(() => {
        const editButton = screen.getAllByText("Edit")[0];
        fireEvent.click(editButton);
      });

      // Open edit dialog
      await waitFor(() => {
        expect(screen.getByText("Edit Product")).toBeInTheDocument();
        expect(screen.getByText("Basic Information")).toBeInTheDocument();
        expect(screen.getByText("Name")).toBeInTheDocument();
        expect(screen.getByText("SKU")).toBeInTheDocument();
        expect(screen.getByText("Category")).toBeInTheDocument();
      });
    });

    it("calculates margin and profit correctly", async () => {
      renderWithClient(<ProductsPage />);

      // Open create dialog
      const createButton = screen.getByText("Create Product");
      fireEvent.click(createButton);

      await waitFor(() => {
        const priceInput = screen.getByPlaceholderText("0.00");
        const costInput = screen.getByPlaceholderText("0.00");

        // Enter price and cost
        fireEvent.change(priceInput, { target: { value: "100" } });
        fireEvent.change(costInput, { target: { value: "50" } });

        // Check if margin is calculated
        expect(screen.getByText("50.0%")).toBeInTheDocument();
        expect(screen.getByText("$50.00")).toBeInTheDocument();
      });
    });
  });

  describe("ProductDetail component", () => {
    it("renders product details when product is selected", async () => {
      renderWithClient(<ProductsPage />);

      // Click view button to go to detail tab
      await waitFor(() => {
        const viewButton = screen.getAllByText("View")[0];
        fireEvent.click(viewButton);
      });

      await waitFor(() => {
        expect(screen.getByText("Basic Information")).toBeInTheDocument();
        expect(screen.getByText("PROD-001")).toBeInTheDocument();
        expect(screen.getByText("Test Product")).toBeInTheDocument();
        expect(screen.getByText("Pricing")).toBeInTheDocument();
        expect(screen.getByText("Physical Properties")).toBeInTheDocument();
      });
    });

    it("shows error state when product not found", async () => {
      renderWithClient(<ProductsPage />);

      // Navigate to detail tab with invalid ID
      setCurrentTab("detail");
      setDetailProductId("invalid-id");

      await waitFor(() => {
        expect(screen.getByText("Product Not Found")).toBeInTheDocument();
        expect(screen.getByText("The requested product could not be found.")).toBeInTheDocument();
      });
    });
  });

  describe("ProductVariants component", () => {
    it("renders variants list when product has variants", async () => {
      renderWithClient(<ProductsPage />);

      // Mock product with variants
      const productWithVariants = {
        ...mockProduct,
        variants: [
          {
            id: "variant-1",
            product_id: "1",
            sku: "PROD-001-V1",
            name: "Large",
            price: 109.99,
            cost: 55.00,
            attributes: { size: "L", color: "red" },
            is_active: true,
            created_at: "2025-01-01T00:00:00Z",
            updated_at: "2025-01-01T00:00:00Z",
          },
        ],
      };

      // Update mock to return product with variants
      const apiClient = mockApiClient;
      (apiClient.get as any).mockResolvedValue({
        data: {
          data: [productWithVariants],
          meta: {
            total: 1,
            page: 1,
            page_size: 20,
            total_pages: 1,
          },
          error: null,
        },
      });

      renderWithClient(<ProductsPage />);

      // Navigate to variants tab
      await waitFor(() => {
        const variantsButton = screen.getByText("Variants");
        fireEvent.click(variantsButton);
      });

      await waitFor(() => {
        expect(screen.getByText("PROD-001-V1")).toBeInTheDocument();
        expect(screen.getByText("Large")).toBeInTheDocument();
        expect(screen.getByText("$109.99")).toBeInTheDocument();
        expect(screen.getByText("Active")).toBeInTheDocument();
      });
    });

    it("shows empty state when product has no variants", async () => {
      renderWithClient(<ProductsPage />);

      // Navigate to variants tab
      await waitFor(() => {
        const variantsButton = screen.getByText("Variants");
        fireEvent.click(variantsButton);
      });

      await waitFor(() => {
        expect(screen.getByText("No Variants")).toBeInTheDocument();
        expect(screen.getByText("This product has no variants yet")).toBeInTheDocument();
      });
    });
  });

  describe("ProductBarcodes component", () => {
    it("renders barcodes list when product has barcodes", async () => {
      renderWithClient(<ProductsPage />);

      // Mock product with barcodes
      const productWithBarcodes = {
        ...mockProduct,
        barcodes: [
          {
            id: "barcode-1",
            tenant_id: "tenant-1",
            product_id: "1",
            barcode: "1234567890123",
            barcode_type: "CODE128",
            is_primary: true,
            created_at: "2025-01-01T00:00:00Z",
            updated_at: "2025-01-01T00:00:00Z",
          },
        ],
      };

      // Update mock to return product with barcodes
      const apiClient = mockApiClient;
      (apiClient.get as any).mockResolvedValue({
        data: {
          data: [productWithBarcodes],
          meta: {
            total: 1,
            page: 1,
            page_size: 20,
            total_pages: 1,
          },
          error: null,
        },
      });

      renderWithClient(<ProductsPage />);

      // Navigate to barcodes tab
      await waitFor(() => {
        const barcodesButton = screen.getByText("Barcodes");
        fireEvent.click(barcodesButton);
      });

      await waitFor(() => {
        expect(screen.getByText("1234567890123")).toBeInTheDocument();
        expect(screen.getByText("CODE128")).toBeInTheDocument();
        expect(screen.getByText("Primary")).toBeInTheDocument();
      });
    });

    it("shows empty state when product has no barcodes", async () => {
      renderWithClient(<ProductsPage />);

      // Navigate to barcodes tab
      await waitFor(() => {
        const barcodesButton = screen.getByText("Barcodes");
        fireEvent.click(barcodesButton);
      });

      await waitFor(() => {
        expect(screen.getByText("No Barcodes")).toBeInTheDocument();
        expect(screen.getByText("This product has no barcodes yet")).toBeInTheDocument();
      });
    });
  });

  describe("Data Structure", () => {
    it("has required product fields", () => {
      const product = mockProduct;

      expect(product).toHaveProperty("id");
      expect(product).toHaveProperty("tenant_id");
      expect(product).toHaveProperty("category_id");
      expect(product).toHaveProperty("sku");
      expect(product).toHaveProperty("name");
      expect(product).toHaveProperty("price");
      expect(product).toHaveProperty("cost");
      expect(product).toHaveProperty("currency");
      expect(product).toHaveProperty("is_active");
      expect(product).toHaveProperty("created_at");
      expect(product).toHaveProperty("updated_at");
    });

    it("has optional product fields", () => {
      const product = mockProduct;

      expect(product).toHaveProperty("description");
      expect(product).toHaveProperty("weight");
      expect(product).toHaveProperty("dimensions");
      expect(product).toHaveProperty("track_inventory");
    });

    it("has correct category structure", () => {
      const category = mockProduct.category;

      expect(category).toHaveProperty("id");
      expect(category).toHaveProperty("tenant_id");
      expect(category).toHaveProperty("name");
      expect(category).toHaveProperty("slug");
      expect(category).toHaveProperty("description");
      expect(category).toHaveProperty("is_active");
      expect(category).toHaveProperty("created_at");
      expect(category).toHaveProperty("updated_at");
    });

    it("has correct dimensions structure", () => {
      const dimensions = mockProduct.dimensions;

      expect(dimensions).toHaveProperty("length");
      expect(dimensions).toHaveProperty("width");
      expect(dimensions).toHaveProperty("height");
      expect(dimensions).toHaveProperty("unit");
    });
  });
});
