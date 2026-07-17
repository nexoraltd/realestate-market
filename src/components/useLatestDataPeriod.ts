"use client";

import { useEffect, useState } from "react";
import {
  getPreviousCompletedPeriod,
  getRecentPeriods,
  type DataPeriod,
} from "@/lib/dataPeriod";

export function useLatestDataPeriod(): DataPeriod {
  const [period, setPeriod] = useState<DataPeriod>(() =>
    getRecentPeriods(getPreviousCompletedPeriod(), 3)[2]
  );

  useEffect(() => {
    let active = true;
    fetch("/api/latest-period")
      .then((response) => {
        if (!response.ok) throw new Error("Latest period request failed");
        return response.json() as Promise<DataPeriod>;
      })
      .then((latest) => {
        if (active && latest.year && latest.quarter) setPeriod(latest);
      })
      .catch(() => undefined);

    return () => {
      active = false;
    };
  }, []);

  return period;
}
