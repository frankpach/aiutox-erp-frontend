import { useTranslation } from "~/lib/i18n/useTranslation";

import { usePipelines } from "../hooks/useCrm";

export function CrmList(): JSX.Element {
  const { t } = useTranslation();
  const { data, isLoading, isError } = usePipelines({ page: 1, page_size: 20 });

  if (isLoading) {
    return <section>{t("crm.loading")}</section>;
  }

  if (isError) {
    return <section>{t("crm.error")}</section>;
  }

  return (
    <section>
      <h2>{t("crm.title")}</h2>
      <p>{t("crm.description")}</p>
      <p>{t("crm.totalPipelines")}: {data?.meta.total ?? 0}</p>
    </section>
  );
}
