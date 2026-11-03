// @ts-check
import { compareInsets, referenceFor, SIDES } from './reference.js';

/**
 * Reads this phone's screen size and safe-area insets. The insets come from
 * CSS env() on a hidden probe element, so they are the values iOS gives web
 * content. Opened from the Home Screen with the translucent status bar, the
 * top inset is the full status bar area. Runs again only when the phone
 * rotates or the window changes size.
 */

/** @param {string} id */
function byId(id) {
  const el = document.getElementById(id);
  if (!el) throw new Error(`The page is missing #${id}.`);
  return el;
}

/** @param {string} value */
const points = (value) => Math.round(Number.parseFloat(value) * 100) / 100;

/** @param {number} n */
const fmt = (n) => (Number.isInteger(n) ? String(n) : n.toFixed(2));

function measure() {
  const probe = getComputedStyle(byId('probe'));
  const nav = /** @type {Navigator & { standalone?: boolean }} */ (navigator);
  return {
    screenWidth: screen.width,
    screenHeight: screen.height,
    scale: window.devicePixelRatio,
    viewportWidth: window.innerWidth,
    viewportHeight: window.innerHeight,
    portrait: window.matchMedia('(orientation: portrait)').matches,
    homeScreen: window.matchMedia('(display-mode: standalone)').matches || nav.standalone === true,
    insets: {
      top: points(probe.paddingTop),
      bottom: points(probe.paddingBottom),
      left: points(probe.paddingLeft),
      right: points(probe.paddingRight),
    },
  };
}

/**
 * @param {HTMLElement} list
 * @param {readonly (readonly [string, string])[]} rows
 */
function fillList(list, rows) {
  list.replaceChildren(
    ...rows.map(([term, value]) => {
      const row = document.createElement('div');
      const dt = document.createElement('dt');
      const dd = document.createElement('dd');
      dt.textContent = term;
      dd.textContent = value;
      row.append(dt, dd);
      return row;
    }),
  );
}

const SIDE_LABELS = { top: 'Top', bottom: 'Bottom', left: 'Left', right: 'Right' };

function render() {
  const m = measure();
  byId('mode').dataset.ok = String(m.homeScreen);
  byId('mode-text').textContent = m.homeScreen
    ? 'Opened from the Home Screen. The values below are the real ones.'
    : 'Opened in the browser, so the top value is not the real one. Add this page to your Home Screen (Share, Add to Home Screen) and open it from the new icon.';

  fillList(byId('values'), [
    ['Screen', `${fmt(m.screenWidth)} × ${fmt(m.screenHeight)} pt`],
    ['Scale', `${fmt(m.scale)}×`],
    ['Window', `${fmt(m.viewportWidth)} × ${fmt(m.viewportHeight)} pt`],
    ['Held', m.portrait ? 'Upright (portrait)' : 'Sideways (landscape)'],
    ...SIDES.map((side) => /** @type {const} */ ([`Safe area ${SIDE_LABELS[side].toLowerCase()}`, `${fmt(m.insets[side])} pt`])),
  ]);

  const ref = referenceFor(m.screenWidth, m.screenHeight, m.scale);
  const result = byId('result');
  const compare = byId('compare');
  byId('reference-label').textContent = ref ? `Published values for ${ref.label}` : 'Published values';
  const source = /** @type {HTMLAnchorElement} */ (byId('reference-source'));
  if (ref) {
    source.href = ref.source;
    source.textContent = ref.source.replace('https://', '');
  } else {
    source.removeAttribute('href');
    source.textContent = 'No published values for this screen size.';
  }

  if (!ref) {
    compare.replaceChildren();
    result.dataset.state = 'none';
    result.textContent = 'This screen size has no published reference to compare with.';
    return;
  }
  if (!m.portrait) {
    compare.replaceChildren();
    result.dataset.state = 'none';
    result.textContent = 'Landscape values are recorded above. Turn the phone upright to compare.';
    return;
  }
  const rows = compareInsets(m.insets, ref.portrait);
  compare.replaceChildren(
    ...rows.map((r) => {
      const row = document.createElement('tr');
      const cells = [SIDE_LABELS[r.side], `${fmt(r.measured)} pt`, `${fmt(r.expected)} pt`, r.match ? 'Same' : 'Different'];
      for (const text of cells) {
        const td = document.createElement('td');
        td.textContent = text;
        row.append(td);
      }
      row.dataset.match = String(r.match);
      return row;
    }),
  );
  const differ = rows.filter((r) => !r.match).length;
  result.dataset.state = differ === 0 && m.homeScreen ? 'match' : 'differ';
  result.textContent = !m.homeScreen
    ? 'Open the page from the Home Screen icon before comparing.'
    : differ === 0
      ? 'All four values match the published ones.'
      : `${String(differ)} of 4 values differ from the published ones.`;
}

let pending = 0;
const schedule = () => {
  cancelAnimationFrame(pending);
  pending = requestAnimationFrame(render);
};

window.addEventListener('resize', schedule);
window.addEventListener('orientationchange', schedule);
render();
