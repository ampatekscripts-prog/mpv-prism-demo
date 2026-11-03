// @ts-check
/**
 * Published screen and safe-area values used to check the source behind
 * decision 10 (docs/decisions.md). Use Your Loaf publishes these for each new
 * iPhone; the pages do not say how they were measured, so the device check
 * compares them with a real phone before the island models' values are used.
 *
 * Portrait values only: landscape insets changed between iOS releases, so the
 * page records landscape without comparing it.
 */

/**
 * @typedef {{ top: number, bottom: number, left: number, right: number }} Insets
 * @typedef {{ id: string, label: string, width: number, height: number, scale: number, statusBar: number, portrait: Insets, source: string }} Reference
 */

/** @type {readonly Reference[]} */
export const REFERENCES = [
  {
    id: '390x844',
    label: '390 × 844 pt (iPhone 13, 13 Pro)',
    width: 390,
    height: 844,
    scale: 3,
    statusBar: 47,
    portrait: { top: 47, bottom: 34, left: 0, right: 0 },
    source: 'https://useyourloaf.com/blog/iphone-13-screen-sizes/',
  },
  {
    id: '393x852',
    label: '393 × 852 pt (iPhone 15, 16)',
    width: 393,
    height: 852,
    scale: 3,
    statusBar: 54,
    portrait: { top: 59, bottom: 34, left: 0, right: 0 },
    source: 'https://useyourloaf.com/blog/iphone-16-screen-sizes/',
  },
  {
    id: '402x874',
    label: '402 × 874 pt (iPhone 17, 17 Pro)',
    width: 402,
    height: 874,
    scale: 3,
    statusBar: 54,
    portrait: { top: 62, bottom: 34, left: 0, right: 0 },
    source: 'https://useyourloaf.com/blog/iphone-17-screen-sizes/',
  },
];

/**
 * The reference for a screen, whichever way the phone is held.
 * @param {number} width
 * @param {number} height
 * @param {number} scale
 * @returns {Reference | null}
 */
export function referenceFor(width, height, scale) {
  const short = Math.min(width, height);
  const long = Math.max(width, height);
  return REFERENCES.find((r) => r.width === short && r.height === long && Math.abs(r.scale - scale) < 0.01) ?? null;
}

/** @type {readonly (keyof Insets)[]} */
export const SIDES = ['top', 'bottom', 'left', 'right'];

/**
 * Side-by-side comparison; values within half a point count as equal.
 * @param {Insets} measured
 * @param {Insets} expected
 */
export function compareInsets(measured, expected) {
  return SIDES.map((side) => ({ side, measured: measured[side], expected: expected[side], match: Math.abs(measured[side] - expected[side]) < 0.5 }));
}
