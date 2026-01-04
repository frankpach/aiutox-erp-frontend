import { useParams } from "react-router";
import { PageLayout } from "~/components/layout/PageLayout";

export default function AutomationDetailRoute() {
  const { id } = useParams<{ id: string }>();

  return (
    <PageLayout
      title="Automation"
      breadcrumb={[
        { label: "Automation", href: "/automation" },
        { label: id || "" },
      ]}
    >
      <div className="text-sm text-muted-foreground">{id}</div>
    </PageLayout>
  );
}
