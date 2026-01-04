import { useParams } from "react-router";
import { PageLayout } from "~/components/layout/PageLayout";

export default function ProductEditRoute() {
  const { id } = useParams<{ id: string }>();

  return (
    <PageLayout
      title="Edit Product"
      breadcrumb={[
        { label: "Products", href: "/products" },
        { label: id || "" },
        { label: "Edit" },
      ]}
    >
      <div className="text-sm text-muted-foreground">{id}</div>
    </PageLayout>
  );
}
