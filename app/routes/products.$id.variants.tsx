import { useParams } from "react-router";
import { PageLayout } from "~/components/layout/PageLayout";

export default function ProductVariantsRoute() {
  const { id } = useParams<{ id: string }>();

  return (
    <PageLayout
      title="Product Variants"
      breadcrumb={[
        { label: "Products", href: "/products" },
        { label: id || "" },
        { label: "Variants" },
      ]}
    >
      <div className="text-sm text-muted-foreground">{id}</div>
    </PageLayout>
  );
}
