import { useEffect, useMemo, useState } from "react";

import { Dashboard } from "superset-dashboard-sdk/build/DataProvider.types";
import { Dashboard as EmbeddedDashboard } from "superset-dashboard-sdk";
import { Layout } from "components";
import { SUPERSET_DOMAIN } from "config";
import Spinner from "components/Spinner";
import { serverSideTranslations } from "next-i18next/serverSideTranslations";
import { useDashboard } from "components/Superset";
import { useRouter } from "next/router";
import { useSupersetContext } from "components/Superset/SupersetContext";

export default () => {
  const router = useRouter();
  const { slug } = router.query;
  const id = (slug as string) || null;
  const { config, dashboard, guestToken } = useDashboard({ id });
  const nativeFilters = useMemo(() => {
    const jsonMetadata = dashboard?.getJsonMetadata();
    if (jsonMetadata === null) {
      return [];
    }
    const nativeFilters = jsonMetadata?.native_filter_configuration;
    const filters = nativeFilters?.map((filter) => ({
      id: filter.id,
      column: filter?.targets?.[0]?.column?.name,
      operator: "IN",
      value: router?.query[filter.id] as string,
    }));
    return filters;
  }, [router.query, dashboard]);
  return (
    <Layout fullwidth>
      {dashboard === null && <Spinner />}
      {dashboard !== null && (
        <EmbeddedDashboard
          uuid={config.uuid}
          domain={SUPERSET_DOMAIN}
          guestToken={guestToken}
          nativeFilters={nativeFilters}
          fullheight
          uiConfig={{
            hideTitle: true,
          }}
        />
      )}
    </Layout>
  );
};
export const getServerSideProps = async ({ locale }) => {
  return {
    props: {
      ...(await serverSideTranslations(locale)),
    },
  };
};
