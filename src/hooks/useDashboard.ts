/**
 * useDashboard.ts
 * ───────────────
 * Hook que busca dados do dashboard no backend (quando disponível)
 * ou usa dados do localStorage como fallback.
 */

import { useEffect, useState } from "react";
import { dashboard as dashboardApi, appliances as appliancesApi, hasBackend, type DashboardResponse, type ApplianceResponse } from "@/api";

export interface DashboardData {
  loading: boolean;
  error: string | null;
  dashboard: DashboardResponse | null;
  appliances: ApplianceResponse[];
  refetch: () => void;
}

export function useDashboard(): DashboardData {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [dashboardData, setDashboardData] = useState<DashboardResponse | null>(null);
  const [appliancesData, setAppliancesData] = useState<ApplianceResponse[]>([]);
  const [tick, setTick] = useState(0);

  useEffect(() => {
    if (!hasBackend()) {
      setLoading(false);
      return;
    }

    setLoading(true);
    setError(null);

    Promise.all([
      dashboardApi.get(),
      appliancesApi.list(),
    ])
      .then(([dash, apps]) => {
        setDashboardData(dash);
        setAppliancesData(apps);
      })
      .catch((err: unknown) => {
        setError(err instanceof Error ? err.message : "Erro ao carregar dados.");
      })
      .finally(() => setLoading(false));
  }, [tick]);

  return {
    loading,
    error,
    dashboard: dashboardData,
    appliances: appliancesData,
    refetch: () => setTick((t) => t + 1),
  };
}
