const API_BASE = "https://www.reinfolib.mlit.go.jp/ex-api/external";
const API_KEY = process.env.REINFOLIB_API_KEY || "";

async function fetchAPI<T>(endpoint: string, params: Record<string, string>): Promise<T> {
  const url = new URL(`${API_BASE}/${endpoint}`);
  Object.entries(params).forEach(([k, v]) => {
    if (v) url.searchParams.set(k, v);
  });

  const res = await fetch(url.toString(), {
    headers: {
      "Ocp-Apim-Subscription-Key": API_KEY,
    },
    next: { revalidate: 86400 },
  });

  if (!res.ok) {
    throw new Error(`API error: ${res.status}`);
  }

  return res.json();
}

export interface City {
  id: string;
  name: string;
}

export interface Transaction {
  Type: string;
  Region: string;
  MunicipalityCode: string;
  Prefecture: string;
  Municipality: string;
  DistrictName: string;
  TradePrice: string;
  PricePerUnit: string;
  FloorPlan: string;
  Area: string;
  UnitPrice: string;
  LandShape: string;
  Frontage: string;
  TotalFloorArea: string;
  BuildingYear: string;
  Structure: string;
  Use: string;
  Purpose: string;
  Direction: string;
  Classification: string;
  Breadth: string;
  CityPlanning: string;
  CoverageRatio: string;
  FloorAreaRatio: string;
  Period: string;
  Renovation: string;
  Remarks: string;
  PriceCategory: string;
  DistrictCode: string;
  // Station data
  NearestStation: string;
  TimeToNearestStation: string;
}

export async function getCities(prefCode: string): Promise<City[]> {
  const data = await fetchAPI<{ data: City[] }>("XIT002", { area: prefCode });
  return data.data || [];
}

export async function getTransactions(params: {
  year: string;
  quarter: string;
  area?: string;
  city?: string;
}): Promise<Transaction[]> {
  const data = await fetchAPI<{ data: Transaction[] }>("XIT001", {
    year: params.year,
    quarter: params.quarter,
    ...(params.city ? { city: params.city } : { area: params.area || "" }),
  });
  return data.data || [];
}
