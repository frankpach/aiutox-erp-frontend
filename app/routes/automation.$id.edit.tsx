import { useParams } from "react-router";
import { PageLayout } from "~/components/layout/PageLayout";

export default function AutomationEditRoute() {
  const { id } = useParams<{ id: string }>();

  return (
    <PageLayout
      title="Edit Automation"
      breadcrumb={[
        { label: "Automation", href: "/automation" },
        { label: id || "" },
        { label: "Edit" },
      ]}
    >
      <div className="text-sm text-muted-foreground">{id}</div>
    </PageLayout>
  );
}
