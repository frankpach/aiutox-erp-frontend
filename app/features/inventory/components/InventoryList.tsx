import { useTranslation } from "~/lib/i18n/useTranslation";

import { useWarehouses } from "../hooks/useInventory";

export function InventoryList() {
  const { t } = useTranslation();
  const { data, isLoading, isError } = useWarehouses({ page: 1, page_size: 20 });

  if (isLoading) {
    return <section>{t("inventory.loading")}</section>;
  }

  if (isError) {
    return <section>{t("inventory.error")}</section>;
  }

  return (
    <section>
      <h2>{t("inventory.title")}</h2>
      <p>{t("inventory.description")}</p>
      <p>{t("inventory.totalWarehouses")}: {data?.meta.total ?? 0}</p>
    </section>
  );
}
