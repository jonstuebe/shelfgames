// The animated sea at the bottom of the page. Each layer is two copies of a wave that
// repeats every TILE units, drawn side by side and scrolled by half its width, so the
// loop has no visible seam.

export const TILE = 1200;
export const HEIGHT = 300;

// Back to front. `waves` are [amplitude, cycles per tile, phase]; whole-number cycles
// keep each layer seamless.
export const LAYERS = [
  { name: "far",   baseline: 70,  waves: [[9, 2, 0.4], [4, 5, 1.1]],  seconds: 70, reverse: false, bob: 9 },
  { name: "back",  baseline: 115, waves: [[13, 3, 1.7], [5, 7, 0.2]], seconds: 48, reverse: true,  bob: 7.5 },
  { name: "mid",   baseline: 165, waves: [[15, 2, 2.9], [6, 5, 0.8]], seconds: 34, reverse: false, bob: 6 },
  { name: "front", baseline: 220, waves: [[13, 3, 0.9], [7, 8, 2.3]], seconds: 24, reverse: true,  bob: 8 },
];

export function waveY(x, { baseline, waves }) {
  return waves.reduce((y, [amp, cycles, phase]) => y + amp * Math.sin((2 * Math.PI * cycles * x) / TILE + phase), baseline);
}

// The wave's top edge across two tiles, as SVG path commands.
export function crestPath(layer, step = 6) {
  const pts = [];
  for (let x = 0; x <= 2 * TILE; x += step) pts.push(`${x} ${waveY(x, layer).toFixed(1)}`);
  return "M" + pts.join(" L");
}

export function wavePath(layer, step = 6) {
  return `${crestPath(layer, step)} L${2 * TILE} ${HEIGHT} L0 ${HEIGHT} Z`;
}

export function buildSea(container, random = Math.random) {
  const layers = LAYERS.map(layer => `
    <div class="wave-layer wave-${layer.name}">
      <div class="wave-bob" style="animation-duration:${layer.bob}s; animation-delay:${(-random() * layer.bob).toFixed(2)}s">
        <svg class="wave-roll${layer.reverse ? " reverse" : ""}" style="animation-duration:${layer.seconds}s"
             viewBox="0 0 ${2 * TILE} ${HEIGHT}" preserveAspectRatio="none">
          <path class="wave-body" d="${wavePath(layer)}"/>
          <path class="wave-crest" d="${crestPath(layer)}" vector-effect="non-scaling-stroke"/>
        </svg>
      </div>
    </div>`).join("");

  // Sun glints on the water, shown once the sky clears.
  const glints = Array.from({ length: 16 }, () => {
    const style = [
      `left:${(random() * 96 + 2).toFixed(1)}%`,
      `bottom:${(random() * 26 + 4).toFixed(1)}%`,
      `animation-duration:${(2.4 + random() * 2.4).toFixed(2)}s`,
      `animation-delay:${(-random() * 4).toFixed(2)}s`,
    ].join(";");
    return `<span class="glint" style="${style}"></span>`;
  }).join("");

  container.innerHTML = layers + `<div class="glints">${glints}</div>`;
}
