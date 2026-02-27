import {describe, it} from "node:test";
import * as assert from "node:assert/strict";
import {normalizeKpi, type RawDefiLlamaResponse} from "../../workflows/src/clients/http.js";

describe("normalizeKpi", () => {
  it("converts percentage changes to basis points", () => {
    const input: RawDefiLlamaResponse = {tvl: 50_000_000.5, change_1d: 1.23, change_7d: -4.56};
    const result = normalizeKpi(input);
    assert.equal(result.tvlUsd, 50_000_001);
    assert.equal(result.change1dBps, 123);
    assert.equal(result.change7dBps, -456);
  });

  it("rounds TVL to nearest integer", () => {
    const input: RawDefiLlamaResponse = {tvl: 999.4, change_1d: 0, change_7d: 0};
    const result = normalizeKpi(input);
    assert.equal(result.tvlUsd, 999);
  });

  it("clamps negative TVL to zero", () => {
    const input: RawDefiLlamaResponse = {tvl: -100, change_1d: 0, change_7d: 0};
    const result = normalizeKpi(input);
    assert.equal(result.tvlUsd, 0);
  });

  it("handles zero values correctly", () => {
    const input: RawDefiLlamaResponse = {tvl: 0, change_1d: 0, change_7d: 0};
    const result = normalizeKpi(input);
    assert.equal(result.tvlUsd, 0);
    assert.equal(result.change1dBps, 0);
    assert.equal(result.change7dBps, 0);
  });

  it("throws when tvl is missing", () => {
    const input: RawDefiLlamaResponse = {change_1d: 1, change_7d: 2};
    assert.throws(() => normalizeKpi(input), {message: "Invalid KPI payload"});
  });

  it("throws when change_1d is missing", () => {
    const input: RawDefiLlamaResponse = {tvl: 100, change_7d: 2};
    assert.throws(() => normalizeKpi(input), {message: "Invalid KPI payload"});
  });

  it("throws when change_7d is missing", () => {
    const input: RawDefiLlamaResponse = {tvl: 100, change_1d: 1};
    assert.throws(() => normalizeKpi(input), {message: "Invalid KPI payload"});
  });

  it("rounds fractional bps to nearest integer", () => {
    const input: RawDefiLlamaResponse = {tvl: 1000, change_1d: 0.005, change_7d: -0.015};
    const result = normalizeKpi(input);
    assert.equal(result.change1dBps, 1);
    assert.equal(result.change7dBps, -1);
  });
});
