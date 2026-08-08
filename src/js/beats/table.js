import { fit, face, trim, chrome, hex, cl, ease } from './shared.js';

// Beat 3 — the table, and the control the analyst is using.
// Six stages, each showing one named feature. No figure: the claim is
// qualitative and the asymmetry against beats 1 and 2 is accepted.

const HOSTS = ['wk-4192', 'wk-0871', 'srv-back02', 'wk-3310', 'lap-1128', 'wk-7745'];
const USERS = ['a.mehta', 'j.chen', 'r.okafor', 's.novak', 'd.silva', 'k.tanaka'];
const rowFor = (i) => ({
  id: 'evt_' + hex(i),
  host: HOSTS[i % HOSTS.length] + '.corp.local',
  user: USERS[(i * 7) % USERS.length],
  score: 12 + ((i * 37) % 88),
});
const clock = (i) => {
  const t = 41000 + i * 3;
  return String(((t / 3600) | 0) % 24).padStart(2, '0') + ':' +
         String(((t / 60) | 0) % 60).padStart(2, '0') + ':' +
         String(t % 60).padStart(2, '0');
};

const COLS = [
  { t: 'ALERT', w: .30, f: (r) => r.id,            role: 'pin'   },
  { t: 'HOST',  w: .36, f: (r) => r.host,          role: 'swapB' },
  { t: 'USER',  w: .20, f: (r) => r.user,          role: 'hide'  },
  { t: 'SCORE', w: .14, f: (r) => String(r.score), role: 'swapA' },
];

const stagesOf = (p) => ({
  S1: ease(cl(p / .18)),          // widths settle to content
  S2: ease(cl((p - .18) / .14)),  // a column hides
  S3: ease(cl((p - .32) / .15)),  // two columns swap
  S4: ease(cl((p - .47) / .15)),  // the first column pins
  S5: ease(cl((p - .62) / .15)),  // a row expands
  S6: cl((p - .80) / .2),         // saved as a view
});

const cap = (s) =>
  s.S6 > .35 ? 'SAVED AS A VIEW · LOADS NEXT VISIT'
  : s.S5 > .3 ? 'EXPAND A ROW FOR DETAIL'
  : s.S4 > .3 ? 'PIN A COLUMN · IT STAYS IN VIEW'
  : s.S3 > .3 ? 'REORDER COLUMNS'
  : s.S2 > .3 ? 'SHOW OR HIDE COLUMNS'
  : 'WIDTH FROM CONTENT — NO GUESSING';

const drawTable = (x, s, L, T, W, H, fs, rowH, A) => {
  const n = COLS.length;
  const gut = Math.max(8, fs * 1.1);
  const iA = COLS.findIndex((c) => c.role === 'swapA');
  const iB = COLS.findIndex((c) => c.role === 'swapB');
  const iH = COLS.findIndex((c) => c.role === 'hide');

  const even = W / n;
  const widths = COLS.map((c, i) => {
    let cw = even + (W * c.w - even) * s.S1;
    if (i === iH) cw *= 1 - s.S2;
    return cw;
  });
  const xs = [];
  let run = L;
  for (let i = 0; i < n; i++) { xs.push(run); run += widths[i]; }
  const posOf = (i) =>
    i === iA ? xs[i] - widths[iB] * s.S3
    : i === iB ? xs[i] + widths[iA] * s.S3
    : xs[i];

  const expandH = rowH * 2.1 * s.S5;
  const headH = rowH * 1.15;
  const rows = Math.max(3, Math.min(5, Math.floor((H - headH - rowH * 2.1) / rowH)));
  const yRow = (k) => T + headH + rowH * (k + .75) + (k > 0 ? expandH : 0);
  const bottom = yRow(rows - 1) + rowH * .4;

  x.fillStyle = 'rgba(255,255,255,.15)';
  x.fillRect(L, T + headH - 4, W, 1);

  for (let i = 0; i < n; i++) {
    const cw = widths[i] - gut;
    if (cw < 6) continue;
    const cx = posOf(i), pinned = i === 0;
    if (pinned && s.S4 > .02) {
      x.fillStyle = `rgba(${A},${.06 * s.S4})`;
      x.fillRect(L - gut * .4, T - 2, widths[0], bottom - T + 2);
    }
    const fade = i === iH ? 1 - s.S2 : 1;
    x.font = face(fs, 700);
    x.fillStyle = pinned ? `rgba(${A},${.5 + s.S4 * .45})` : `rgba(255,255,255,${.36 * fade})`;
    x.fillText(trim(x, COLS[i].t, cw), cx, T + fs);

    for (let k = 0; k < rows; k++) {
      const r = rowFor(9100 + k * 7);
      x.font = face(fs, i === 0 ? 700 : 300);
      x.fillStyle = i === 0 ? `rgba(${A},${.85 * fade})` : `rgba(255,255,255,${.5 * fade})`;
      x.fillText(trim(x, COLS[i].f(r), cw), cx, yRow(k));
    }

    if (s.S5 > .01) {           // detail, in the gap the first row opened
      const ey = yRow(0) + rowH * .45;
      x.fillStyle = `rgba(${A},${.05 * s.S5})`;
      x.fillRect(cx - gut * .4, ey, widths[i], expandH);
      if (s.S5 > .25 && i < 3) {
        const KV = [['first seen', clock(9100)], ['rule', 'T1003.001'], ['status', 'triaging']][i];
        x.font = face(fs - .7, 300);
        x.fillStyle = `rgba(255,255,255,${.3 * s.S5})`;
        x.fillText(trim(x, KV[0], cw), cx, ey + rowH * .85);
        x.fillStyle = `rgba(255,255,255,${.6 * s.S5})`;
        x.fillText(trim(x, KV[1], cw), cx, ey + rowH * 1.7);
      }
    }
    if (pinned && s.S4 > .05) {
      x.fillStyle = `rgba(${A},${.5 * s.S4})`;
      x.fillRect(L + widths[0] - gut * .4, T - 2, 1, bottom - T + 2);
    }
  }
};

export default function table(c, p, ts, A) {
  const { x, w, h } = fit(c);
  const s = stagesOf(p);
  const pn = chrome(x, 0, 0, w, h, ['Alerts', 'Hosts', 'Investigations'], 0, A);
  const fs = Math.max(7.8, Math.min(9.8, w * .0125));
  const footH = fs * 3.4;

  // Below 560px the column menu rotates into a horizontal control bar under the
  // table. Stacked, the row height pays for both: .9 lead + 6.4 table + .5 gap
  // + 2.53 bar + slack.
  const narrow = w < 560;
  const rowH = Math.max(11, Math.min(21,
    narrow ? (pn.bh - footH) / 10.6 : (pn.bh - footH) * .14));
  const mrow = rowH * 1.15;
  const menuW = narrow ? pn.bw - 24 : Math.max(130, Math.min(190, pn.bw * .28));
  const mh = narrow ? mrow * 2.2 : mrow * (COLS.length + 1.6);
  const L = pn.bx + (narrow ? 12 : 16);
  const W = narrow ? pn.bw - 24 : pn.bw - 32 - menuW - 20;

  drawTable(x, s, L, pn.by + rowH * .9, W,
    pn.bh - footH - rowH - (narrow ? mh + rowH * .5 : 0), fs, rowH, A);

  // The columns control, open and visibly being operated.
  const mx = narrow ? pn.bx + 12 : pn.bx + pn.bw - 16 - menuW;
  const my = narrow ? pn.by + pn.bh - footH - mh - rowH * .4 : pn.by + rowH * .35;
  x.fillStyle = 'rgba(255,255,255,.04)';
  x.fillRect(mx, my, menuW, mh);
  x.strokeStyle = 'rgba(255,255,255,.15)';
  x.lineWidth = 1;
  x.strokeRect(mx + .5, my + .5, menuW - 1, mh - 1);
  x.font = face(fs, 700);
  x.fillStyle = 'rgba(255,255,255,.34)';
  x.fillText('COLUMNS', mx + (narrow ? 10 : 12), my + mrow * .72);
  if (!narrow) {
    x.fillStyle = 'rgba(255,255,255,.15)';
    x.fillRect(mx + 1, my + mrow, menuW - 2, 1);
  }

  const iA = COLS.findIndex((c2) => c2.role === 'swapA');
  const iB = COLS.findIndex((c2) => c2.role === 'swapB');
  const iH = COLS.findIndex((c2) => c2.role === 'hide');
  const order = COLS.map((_, i) => i);
  if (s.S3 > .5) { const tmp = order[iA]; order[iA] = order[iB]; order[iB] = tmp; }

  const chipW = (menuW - 12) / COLS.length;
  order.forEach((ci, slot) => {
    const iy = narrow ? my + mrow * 1.72 : my + mrow * (1.55 + slot);
    const ix = narrow ? mx + 6 + chipW * slot : mx;
    const cellW = narrow ? chipW : menuW;
    const on = ci === iH ? 1 - s.S2 : 1;
    const hot = (ci === iH && s.S2 > .04 && s.S2 < .96) ||
                ((ci === iA || ci === iB) && s.S3 > .04 && s.S3 < .96);
    if (hot) {
      x.fillStyle = 'rgba(255,255,255,.06)';
      x.fillRect(ix + 1, iy - mrow * .68, cellW - 2, mrow);
    }
    let tx = ix + (narrow ? 4 : 12);
    if (!narrow) {                       // drag handle — no room for it in the bar
      x.fillStyle = `rgba(255,255,255,${hot ? .5 : .2})`;
      for (let d = 0; d < 3; d++) x.fillRect(tx, iy - fs * .75 + d * 3, 6, 1);
      tx += 14;
    }
    const by = iy - fs * .82;
    x.strokeStyle = on > .5 ? `rgba(${A},.9)` : 'rgba(255,255,255,.28)';
    x.strokeRect(tx + .5, by + .5, 8, 8);
    if (on > .5) { x.fillStyle = `rgba(${A},${on})`; x.fillRect(tx + 2, by + 2, 5, 5); }
    x.font = face(fs, 300);
    x.fillStyle = `rgba(255,255,255,${.28 + on * .4})`;
    x.fillText(trim(x, COLS[ci].t, cellW - (tx - ix) - 22), tx + 14, iy);
    if (ci === 0 && s.S4 > .05) {
      x.fillStyle = `rgba(${A},${.9 * s.S4})`;
      x.fillRect(ix + cellW - (narrow ? 8 : 18), iy - fs * .72, 5, 5);
    }
  });

  const fy = pn.by + pn.bh;
  x.fillStyle = 'rgba(255,255,255,.15)';
  x.fillRect(pn.bx, fy - footH, pn.bw, 1);
  x.font = face(fs, 700);
  x.fillStyle = `rgba(${A},${.55 + s.S6 * .4})`;
  x.fillText(
    trim(x, cap(s), pn.bw - 32 - (s.S6 > .3 ? x.measureText('★ CREDENTIAL SWEEP').width + 14 : 0)),
    pn.bx + 16, fy - footH * .38
  );
  if (s.S6 > .3) {
    x.save();
    x.globalAlpha = cl((s.S6 - .3) * 3);
    x.textAlign = 'right';
    x.fillStyle = '#fff';
    x.fillText('★ CREDENTIAL SWEEP', pn.bx + pn.bw - 16, fy - footH * .38);
    x.restore();
    x.textAlign = 'left';
  }
}
