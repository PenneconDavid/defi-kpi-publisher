type TvlDataPoint = {
  date: number;
  totalLiquidityUSD: number;
};

export type RawDefiLlamaResponse = {
  tvl?: TvlDataPoint[];
};

export type NormalizedKpi = {
  tvlUsd: number;
  change1dBps: number;
  change7dBps: number;
};

export async function fetchProtocolKpi(protocolSlug: string): Promise<NormalizedKpi> {
  const endpoint = `https://api.llama.fi/protocol/${protocolSlug}`;
  const response = await fetch(endpoint);
  if (!response.ok) {
    throw new Error(`DefiLlama request failed: ${response.status}`);
  }
  const data = (await response.json()) as RawDefiLlamaResponse;
  return normalizeFromTimeSeries(data);
}

export function normalizeFromTimeSeries(data: RawDefiLlamaResponse): NormalizedKpi {
  if (!Array.isArray(data.tvl) || data.tvl.length < 8) {
    throw new Error("Invalid KPI payload: tvl array missing or too short");
  }

  const series = data.tvl;
  const latest = series[series.length - 1];
  const oneDayAgo = series[series.length - 2];
  const sevenDaysAgo = series[series.length - 8];

  if (!latest || !oneDayAgo || !sevenDaysAgo) {
    throw new Error("Invalid KPI payload: insufficient data points");
  }

  const tvlUsd = Math.max(0, Math.round(latest.totalLiquidityUSD));
  const change1dPct = ((latest.totalLiquidityUSD - oneDayAgo.totalLiquidityUSD) / oneDayAgo.totalLiquidityUSD) * 100;
  const change7dPct = ((latest.totalLiquidityUSD - sevenDaysAgo.totalLiquidityUSD) / sevenDaysAgo.totalLiquidityUSD) * 100;

  return {
    tvlUsd,
    change1dBps: Math.round(change1dPct * 100),
    change7dBps: Math.round(change7dPct * 100)
  };
}
