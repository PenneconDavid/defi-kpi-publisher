export type RawDefiLlamaResponse = {
  tvl?: number;
  change_1d?: number;
  change_7d?: number;
};

export type NormalizedKpi = {
  tvlUsd: number;
  change1dBps: number;
  change7dBps: number;
};

export async function fetchProtocolKpi(protocolSlug: string): Promise<RawDefiLlamaResponse> {
  const endpoint = `https://api.llama.fi/protocol/${protocolSlug}`;
  const response = await fetch(endpoint);
  if (!response.ok) {
    throw new Error(`DefiLlama request failed: ${response.status}`);
  }
  return (await response.json()) as RawDefiLlamaResponse;
}

export function normalizeKpi(input: RawDefiLlamaResponse): NormalizedKpi {
  if (
    typeof input.tvl !== "number" ||
    typeof input.change_1d !== "number" ||
    typeof input.change_7d !== "number"
  ) {
    throw new Error("Invalid KPI payload");
  }

  return {
    tvlUsd: Math.max(0, Math.round(input.tvl)),
    change1dBps: Math.round(input.change_1d * 100),
    change7dBps: Math.round(input.change_7d * 100)
  };
}
