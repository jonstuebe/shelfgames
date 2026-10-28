import { describe, expect, it } from "vitest";
import { HEIGHT, LAYERS, TILE, buildSea, crestPath, waveY } from "./sea.js";

describe("sea layers", () => {
  it.each(LAYERS.map(l => [l.name, l]))("%s wave loops without a seam", (_, layer) => {
    for (const x of [0, 137, 600, 1111]) expect(waveY(x + TILE, layer)).toBeCloseTo(waveY(x, layer), 6);
  });

  it.each(LAYERS.map(l => [l.name, l]))("%s wave stays inside the box, even at full storm swell", (_, layer) => {
    for (let x = 0; x <= TILE; x += 5) {
      const y = waveY(x, layer);
      // The rain-time swell scales each layer up by 1.18 from the bottom edge.
      expect(HEIGHT - (HEIGHT - y) * 1.18).toBeGreaterThan(0);
      expect(y).toBeLessThan(HEIGHT);
    }
  });

  it("stacks layers back to front, from the horizon down", () => {
    const baselines = LAYERS.map(l => l.baseline);
    expect(baselines).toEqual([...baselines].sort((a, b) => a - b));
  });

  it("draws the crest across both tiles", () => {
    const d = crestPath(LAYERS[0]);
    expect(d.startsWith("M0 ")).toBe(true);
    expect(d).toContain(`L${2 * TILE} `);
  });
});

describe("buildSea", () => {
  it("renders every layer", () => {
    const container = { innerHTML: "" };
    buildSea(container, () => 0.5);
    expect(container.innerHTML.match(/class="wave-layer /g)).toHaveLength(LAYERS.length);
  });
});
