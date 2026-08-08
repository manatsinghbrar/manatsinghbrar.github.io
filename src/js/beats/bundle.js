import { fit, face, trim, size, cl, ease } from './shared.js';

// Beat 1 — the bundle analyser, collapsing to scale.
// A squarified treemap drawn inside a dashed ghost of the original 10.4 MB.
// Showing the tool the work was done in, not a metaphor for shrinking.

const MODS = [
  { n: 'lodash',    a: 2.60, b: 0.02 },
  { n: '@icons/*',  a: 1.90, b: 0.03 },
  { n: 'moment',    a: 1.70, b: 0.00 },
  { n: 'charts',    a: 1.40, b: 0.01 },
  { n: 'react-dom', a: 1.30, b: 0.13 },
  { n: 'app/',      a: 0.90, b: 0.15 },
  { n: 'react',     a: 0.30, b: 0.04 },
  { n: 'css',       a: 0.30, b: 0.01 },
];   // survivors total .39 MB — the real 390 KB figure the fold claims

const stagesOf = (p) => ({
  S1: ease(cl(p / .28)),
  S2: ease(cl((p - .28) / .26)),
  S3: ease(cl((p - .54) / .32)),
});

const stageCap = (s) =>
  s.S3 > .25 ? 'TREE-SHAKE · CODE-SPLIT · DROP POLYFILLS'
  : s.S2 > .25 ? 'BROTLI COMPRESSION'
  : s.S1 > .25 ? 'MINIFY · MANGLE · STRIP'
  : 'AS SHIPPED — NOTHING STRIPPED';

const slice = (items, x0, y0, x1, y1, horiz) => {
  if (!items.length) return;
  if (items.length === 1) { items[0].r = [x0, y0, x1, y1]; return; }
  const total = items.reduce((s, m) => s + m.w, 0);
  if (total <= 0) return;
  let acc = 0, i = 0;
  for (; i < items.length - 1; i++) { if (acc + items[i].w > total / 2) break; acc += items[i].w; }
  i = Math.min(i, items.length - 2);
  const A = items.slice(0, i + 1), B = items.slice(i + 1);
  const frac = A.reduce((s, m) => s + m.w, 0) / total;
  if (horiz) {
    const xm = x0 + (x1 - x0) * frac;
    slice(A, x0, y0, xm, y1, false);
    slice(B, xm, y0, x1, y1, false);
  } else {
    const ym = y0 + (y1 - y0) * frac;
    slice(A, x0, y0, x1, ym, true);
    slice(B, x0, ym, x1, y1, true);
  }
};

export default function bundle(c, p, ts, A) {
  const { x, w, h } = fit(c);
  const s = stagesOf(p), e = ease(cl(p));
  const pad = Math.max(14, w * .04);
  const topH = Math.max(26, h * .13);
  const gx = pad, gy = pad + topH, gw = w - pad * 2, gh = h - gy - pad * 1.9;

  const live = MODS.map((m) => ({ n: m.n, b: m.b, w: m.a + (m.b - m.a) * e }))
                   .filter((m) => m.w > .0015);
  const total = live.reduce((acc, m) => acc + m.w, 0);

  // Area-true: the treemap's AREA carries the ratio, so the linear scale is the
  // square root. Scaling by edge length understates 390 KB against 10.4 MB by a
  // factor of five, and a reader who checks will catch it.
  // Below 430px the tiles become unreadable specks, so the ghost box goes and
  // the ratio moves to text — a branch of the design, not a fallback.
  const narrow = w < 430;
  const k = narrow ? 1 : Math.sqrt(Math.max(total / 10.4, .0001));

  x.font = face(Math.max(9, w * .0135), 700);
  x.fillStyle = 'rgba(255,255,255,.34)';
  x.fillText('BUNDLE COMPOSITION', pad, pad + 11);
  x.textAlign = 'right';
  x.font = face(Math.max(15, Math.min(26, w * .036)), 700);
  x.fillStyle = '#fff';
  x.fillText(size(total), w - pad, pad + 18);
  x.textAlign = 'left';

  if (!narrow) {
    x.save();
    x.setLineDash([4, 4]);
    x.strokeStyle = 'rgba(255,255,255,.18)';
    x.lineWidth = 1;
    x.strokeRect(gx + .5, gy + .5, gw - 1, gh - 1);
    x.restore();
    x.font = face(9.5, 300);
    x.fillStyle = 'rgba(255,255,255,.26)';
    x.textAlign = 'right';
    x.fillText('10.40 MB  AS SHIPPED', gx + gw - 7, gy + gh - 8);
    x.textAlign = 'left';
  }

  slice(live, gx, gy, gx + gw * k, gy + gh * k, true);
  live.forEach((m) => {
    if (!m.r) return;
    const [a0, b0, a1, b1] = m.r;
    const tw = a1 - a0, th = b1 - b0;
    if (tw < 1 || th < 1) return;
    const survives = m.b > .02;
    x.fillStyle = survives ? `rgba(${A},${.2 + e * .35})` : `rgba(255,255,255,${.07 + (1 - e) * .05})`;
    x.fillRect(a0, b0, tw - 1, th - 1);
    x.strokeStyle = survives ? `rgba(${A},.7)` : 'rgba(255,255,255,.16)';
    x.lineWidth = 1;
    x.strokeRect(a0 + .5, b0 + .5, tw - 2, th - 2);
    if (tw > 52 && th > 20) {
      x.font = face(Math.min(10.5, tw * .16), 700);
      x.fillStyle = survives ? '#fff' : 'rgba(255,255,255,.5)';
      x.fillText(trim(x, m.n, tw - 12), a0 + 6, b0 + 14);
      if (th > 34) {
        x.font = face(9, 300);
        x.fillStyle = 'rgba(255,255,255,.42)';
        x.fillText(size(m.w), a0 + 6, b0 + 27);
      }
    }
  });

  x.font = face(Math.max(9, w * .0135), 700);
  x.fillStyle = `rgba(${A},${.5 + s.S3 * .45})`;
  x.fillText(trim(x, stageCap(s), gw * (e > .85 ? .62 : 1)), pad, h - pad * .5);
  if (e > .85) {
    x.textAlign = 'right';
    x.fillStyle = 'rgba(255,255,255,.3)';
    x.fillText(narrow ? '3.7% OF 10.40 MB' : '3.7% OF ORIGINAL', w - pad, h - pad * .5);
    x.textAlign = 'left';
  }
}
