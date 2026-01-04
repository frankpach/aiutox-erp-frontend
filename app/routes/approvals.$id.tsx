import { useParams } from "react-router";
import { PageLayout } from "~/components/layout/PageLayout";

export default function ApprovalDetailRoute() {
  const { id } = useParams<{ id: string }>();

  return (
    <PageLayout
      title="Approval"
      breadcrumb={[
        { label: "Approvals", href: "/approvals" },
        { label: id || "" },
      ]}
    >
      <div className="text-sm text-muted-foreground">{id}</div>
    </PageLayout>
  );
}
