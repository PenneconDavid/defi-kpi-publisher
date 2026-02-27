import {describe, it} from "node:test";
import * as assert from "node:assert/strict";
import {evaluatePolicy, type PolicyConfig, type PolicyInput} from "../../workflows/src/logic/evaluatePolicy.js";

const defaultConfig: PolicyConfig = {
  minTvlUsd: 1_000_000,
  minChange1dBps: -500,
  minChange7dBps: -1200
};

describe("evaluatePolicy", () => {
  it("returns no breach when all KPIs are within thresholds", () => {
    const input: PolicyInput = {tvlUsd: 50_000_000, change1dBps: 100, change7dBps: 200};
    const result = evaluatePolicy(input, defaultConfig);
    assert.equal(result.breach, false);
    assert.equal(result.nextMode, "NORMAL");
    assert.equal(result.reasonCode, "KPI_WITHIN_RANGE");
  });

  it("returns breach when TVL is below minimum", () => {
    const input: PolicyInput = {tvlUsd: 500_000, change1dBps: 100, change7dBps: 200};
    const result = evaluatePolicy(input, defaultConfig);
    assert.equal(result.breach, true);
    assert.equal(result.nextMode, "DEFENSIVE");
    assert.equal(result.reasonCode, "KPI_THRESHOLD_BREACH");
  });

  it("returns breach when change_1d is below minimum", () => {
    const input: PolicyInput = {tvlUsd: 50_000_000, change1dBps: -600, change7dBps: 200};
    const result = evaluatePolicy(input, defaultConfig);
    assert.equal(result.breach, true);
    assert.equal(result.nextMode, "DEFENSIVE");
  });

  it("returns breach when change_7d is below minimum", () => {
    const input: PolicyInput = {tvlUsd: 50_000_000, change1dBps: 100, change7dBps: -1300};
    const result = evaluatePolicy(input, defaultConfig);
    assert.equal(result.breach, true);
    assert.equal(result.nextMode, "DEFENSIVE");
  });

  it("returns breach when all KPIs are below thresholds", () => {
    const input: PolicyInput = {tvlUsd: 0, change1dBps: -9999, change7dBps: -9999};
    const result = evaluatePolicy(input, defaultConfig);
    assert.equal(result.breach, true);
    assert.equal(result.nextMode, "DEFENSIVE");
  });

  it("returns no breach at exact threshold boundary", () => {
    const input: PolicyInput = {
      tvlUsd: defaultConfig.minTvlUsd,
      change1dBps: defaultConfig.minChange1dBps,
      change7dBps: defaultConfig.minChange7dBps
    };
    const result = evaluatePolicy(input, defaultConfig);
    assert.equal(result.breach, false);
    assert.equal(result.nextMode, "NORMAL");
  });

  it("handles zero-value config as minimum floor", () => {
    const config: PolicyConfig = {minTvlUsd: 0, minChange1dBps: 0, minChange7dBps: 0};
    const input: PolicyInput = {tvlUsd: 0, change1dBps: 0, change7dBps: 0};
    const result = evaluatePolicy(input, config);
    assert.equal(result.breach, false);
  });
});
