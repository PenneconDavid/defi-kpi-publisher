import {describe, it} from "node:test";
import * as assert from "node:assert/strict";
import {normalizeFromTimeSeries, type RawDefiLlamaResponse} from "../../workflows/src/clients/http.js";

function makeSeries(latestTvl: number, oneDayAgoTvl: number, sevenDaysAgoTvl: number): RawDefiLlamaResponse {
  const points = [];
  for (let i = 0; i < 10; i++) {
    points.push({date: 1000 + i, totalLiquidityUSD: sevenDaysAgoTvl});
  }
  points[points.length - 8] = {date: 1002, totalLiquidityUSD: sevenDaysAgoTvl};
  points[points.length - 2] = {date: 1008, totalLiquidityUSD: oneDayAgoTvl};
  points[points.length - 1] = {date: 1009, totalLiquidityUSD: latestTvl};
  return {tvl: points};
}

describe("normalizeFromTimeSeries", () => {
  it("computes correct TVL and change bps from time series", () => {
    const input = makeSeries(50_000_000, 49_000_000, 47_000_000);
    const result = normalizeFromTimeSeries(input);
    assert.equal(result.tvlUsd, 50_000_000);
    assert.ok(result.change1dBps > 0);
    assert.ok(result.change7dBps > 0);
  });

  it("computes negative change for declining TVL", () => {
    const input = makeSeries(40_000_000, 50_000_000, 60_000_000);
    const result = normalizeFromTimeSeries(input);
    assert.equal(result.tvlUsd, 40_000_000);
    assert.ok(result.change1dBps < 0);
    assert.ok(result.change7dBps < 0);
  });

  it("clamps negative latest TVL to zero", () => {
    const input = makeSeries(-100, 1000, 2000);
    const result = normalizeFromTimeSeries(input);
    assert.equal(result.tvlUsd, 0);
  });

  it("handles zero change correctly", () => {
    const input = makeSeries(1000, 1000, 1000);
    const result = normalizeFromTimeSeries(input);
    assert.equal(result.tvlUsd, 1000);
    assert.equal(result.change1dBps, 0);
    assert.equal(result.change7dBps, 0);
  });

  it("throws when tvl array is missing", () => {
    assert.throws(() => normalizeFromTimeSeries({} as RawDefiLlamaResponse), {
      message: /tvl array missing/
    });
  });

  it("throws when tvl array is too short", () => {
    const input: RawDefiLlamaResponse = {tvl: [{date: 1, totalLiquidityUSD: 100}]};
    assert.throws(() => normalizeFromTimeSeries(input), {
      message: /too short/
    });
  });

  it("rounds bps to nearest integer", () => {
    const input = makeSeries(1005, 1000, 1000);
    const result = normalizeFromTimeSeries(input);
    assert.equal(result.change1dBps, 50);
    assert.equal(result.change7dBps, 50);
  });
});
