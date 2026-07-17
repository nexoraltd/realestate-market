export interface DataPeriod {
  year: string;
  quarter: string;
}

export function previousPeriod(period: DataPeriod): DataPeriod {
  let year = Number(period.year);
  let quarter = Number(period.quarter) - 1;
  if (quarter < 1) {
    quarter = 4;
    year -= 1;
  }
  return { year: String(year), quarter: String(quarter) };
}

export function getPreviousCompletedPeriod(now = new Date()): DataPeriod {
  const currentQuarter = Math.floor(now.getMonth() / 3) + 1;
  return previousPeriod({ year: String(now.getFullYear()), quarter: String(currentQuarter) });
}

export function getRecentPeriods(start: DataPeriod, count: number): DataPeriod[] {
  const periods: DataPeriod[] = [];
  let period = start;
  for (let i = 0; i < count; i += 1) {
    periods.push(period);
    period = previousPeriod(period);
  }
  return periods;
}
