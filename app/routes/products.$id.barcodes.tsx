import { useParams } from "react-router";
import { PageLayout } from "~/components/layout/PageLayout";

export default function ProductBarcodesRoute() {
  const { id } = useParams<{ id: string }>();

  return (
    <PageLayout
      title="Product Barcodes"
      breadcrumb={[
        { label: "Products", href: "/products" },
        { label: id || "" },
        { label: "Barcodes" },
      ]}
    >
      <div className="text-sm text-muted-foreground">{id}</div>
    </PageLayout>
  );
}
