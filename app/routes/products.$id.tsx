import { useParams } from "react-router";
import { PageLayout } from "~/components/layout/PageLayout";

export default function ProductDetailRoute() {
  const { id } = useParams<{ id: string }>();

  return (
    <PageLayout
      title="Product"
      breadcrumb={[
        { label: "Products", href: "/products" },
        { label: id || "" },
      ]}
    >
      <div className="text-sm text-muted-foreground">{id}</div>
    </PageLayout>
  );
}
