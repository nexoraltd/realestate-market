import { unstable_cache } from "next/cache";
import { getTransactions } from "@/lib/api";
import {
  getPreviousCompletedPeriod,
  getRecentPeriods,
  type DataPeriod,
} from "@/lib/dataPeriod";

async function detectLatestAvailablePeriod(): Promise<DataPeriod> {
  const candidates = getRecentPeriods(getPreviousCompletedPeriod(), 8);

  for (const period of candidates) {
    try {
      const rows = await getTransactions({
        ...period,
        area: "13",
      });
      if (rows.length > 0) return period;
    } catch {
      // The API returns 404 for quarters that have not been published yet.
    }
  }

  throw new Error("No published Reinfolib transaction period was found");
}

const getCachedLatestAvailablePeriod = unstable_cache(
  detectLatestAvailablePeriod,
  ["reinfolib-latest-available-period"],
  { revalidate: 21600 }
);

export function getLatestAvailablePeriod(): Promise<DataPeriod> {
  return getCachedLatestAvailablePeriod();
}
