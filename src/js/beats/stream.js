import { fit, face, trim, commas, hex, cl, ease } from './shared.js';

// Beat 2 — stream, store, viewport, in one frame.
// The skeleton is the honest part: what this depicts is the UI paging small
// slices out of IndexedDB, not rendering millions of rows. Do not let the
// viewport panel grow into a table of millions — that is the killed claim.

const TARGET = 2481309;

export default function stream(c, p, ts, A) {
  const { x, w, h } = fit(c);
  const t = (ts || 0) / 1000;
  const fill = ease(cl(p / .5));        // the store fills
  const paging = cl((p - .38) / .34);   // slices page out to the view
  const resolve = cl((p - .66) / .3);   // skeleton rows resolve
  const count = Math.floor(TARGET * ease(cl(p / .9)));

  const pad = Math.max(10, w * .026), gap = Math.max(10, w * .022);
  const fs = Math.max(7.5, Math.min(9.5, w * .0125));
  const top = Math.max(24, h * .11), bot = Math.max(22, h * .1);
  const colW = (w - pad * 2 - gap * 2) / 3;
  const py = top, ph = h - top - bot;
  const x1 = pad, x2 = pad + colW + gap, x3 = pad + (colW + gap) * 2;

  const cap = (tx, tw, label, sub) => {
    x.font = face(fs, 700);
    x.fillStyle = 'rgba(255,255,255,.34)';
    x.fillText(label, tx, top - 9);
    if (sub) {
      x.textAlign = 'right';
      x.fillStyle = `rgba(${A},.85)`;
      x.fillText(sub, tx + tw, top - 9);
      x.textAlign = 'left';
    }
  };
  const box = (bx, bw) => {
    x.fillStyle = '#000';
    x.fillRect(bx, py, bw, ph);
    x.strokeStyle = 'rgba(255,255,255,.15)';
    x.lineWidth = 1;
    x.strokeRect(bx + .5, py + .5, bw - 1, ph - 1);
  };

  // 3 — the stream, on its own clock
  box(x3, colW);
  cap(x3, colW, 'SSE', 'open');
  const slh = Math.max(10, Math.min(15, ph * .078));
  const jit = p > .02 && p < .98 ? Math.floor(t * 26) : 0;
  for (let i = 0, sy = py + slh; sy < py + ph - 6; i++, sy += slh) {
    const k = Math.max(1, count - 14 + i + jit);
    const fresh = cl(i / 12);
    x.font = face(fs, 300);
    x.fillStyle = `rgba(${A},${.3 + fresh * .55})`;
    x.fillRect(x3 + 7, sy - fs * .7, Math.max(3, colW * .06), 2);
    x.fillStyle = `rgba(255,255,255,${.26 + fresh * .34})`;
    x.fillText(trim(x, 'evt_' + hex(k), colW - 22), x3 + 7 + Math.max(3, colW * .06) + 6, sy);
  }

  // 2 — the store
  box(x2, colW);
  cap(x2, colW, 'INDEXEDDB', 'events');
  const fillH = (ph - 30) * fill;
  x.fillStyle = `rgba(${A},.14)`;
  x.fillRect(x2 + 1, py + ph - 1 - fillH, colW - 2, fillH);
  x.strokeStyle = `rgba(${A},.5)`;
  x.lineWidth = 1;
  if (fillH > 2) x.strokeRect(x2 + 1.5, py + ph - 1.5 - fillH, colW - 3, fillH - 1);
  for (let i = 0; i < 9; i++) {
    const ly = py + ph - 6 - (fillH - 8) * (i / 9);
    if (ly < py + ph - fillH + 2) break;
    x.fillStyle = `rgba(${A},.26)`;
    x.fillRect(x2 + 6, ly, colW - 12, 1.5);
  }
  x.font = face(Math.max(10, fs * 1.35), 700);
  x.fillStyle = '#fff';
  x.textAlign = 'center';
  x.fillText(commas(count), x2 + colW / 2, py + 22);
  x.font = face(fs, 300);
  x.fillStyle = 'rgba(255,255,255,.34)';
  x.fillText('RECORDS', x2 + colW / 2, py + 22 + fs + 5);
  x.textAlign = 'left';

  // 1 — the viewport. A fixed handful of rows, never a proportion of the store.
  box(x1, colW);
  cap(x1, colW, 'IN VIEW', resolve > .5 ? '50 rows' : '');
  const rows = Math.max(4, Math.floor((ph - 24) / Math.max(10, ph * .082)));
  const rlh = (ph - 24) / rows;
  for (let i = 0; i < rows; i++) {
    const ry = py + 12 + i * rlh;
    const on = cl(paging * (rows + 1) - i);
    if (on <= 0) continue;
    const done = cl(resolve * (rows + .8) - i);
    if (done < 1) {
      x.fillStyle = `rgba(255,255,255,${.08 * on})`;
      x.fillRect(x1 + 7, ry, colW - 14, 3.5);
      const head = ((t * .6 + i * .16) % 1.4) * (colW + 70) - 35;
      const g = x.createLinearGradient(x1 + head - 35, 0, x1 + head + 35, 0);
      g.addColorStop(0, 'rgba(255,255,255,0)');
      g.addColorStop(.5, `rgba(255,255,255,${.26 * on * (1 - done)})`);
      g.addColorStop(1, 'rgba(255,255,255,0)');
      x.save();
      x.beginPath();
      x.rect(x1 + 7, ry, colW - 14, 3.5);
      x.clip();
      x.fillStyle = g;
      x.fillRect(x1 + 7, ry, colW - 14, 3.5);
      x.restore();
    }
    if (done > 0) {
      let cx = x1 + 7;
      [.28, .18, .3, .12].forEach((sg, si) => {
        const sw = (colW - 14) * sg;
        x.fillStyle = si === 0 ? `rgba(${A},${.85 * done})` : `rgba(255,255,255,${.4 * done})`;
        x.fillRect(cx, ry, sw, 3.5);
        cx += sw + (colW - 14) * .05;
      });
    }
  }

  const arrow = (fromX, toX, label) => {
    const ay = py + ph / 2;
    x.font = face(fs - .5, 700);
    x.strokeStyle = 'rgba(255,255,255,.16)';
    x.lineWidth = 1;
    x.beginPath();
    x.moveTo(fromX, ay);
    x.lineTo(toX, ay);
    x.stroke();
    x.beginPath();
    x.moveTo(toX, ay);
    x.lineTo(toX + 4, ay - 3);
    x.lineTo(toX + 4, ay + 3);
    x.closePath();
    x.fillStyle = 'rgba(255,255,255,.3)';
    x.fill();
    // Panel content is inset 7px, so a label may overhang the gap by that much
    // and still touch nothing; past it the arrow stands alone.
    if (x.measureText(label).width < gap + 12) {
      x.fillStyle = 'rgba(255,255,255,.3)';
      x.textAlign = 'center';
      x.fillText(label, (fromX + toX) / 2, ay - 7);
      x.textAlign = 'left';
    }
  };
  arrow(x3, x2 + colW + 4, 'write');
  arrow(x2, x1 + colW + 4, 'page');

  x.font = face(fs, 700);
  x.fillStyle = 'rgba(255,255,255,.32)';
  x.fillText(
    trim(x, 'THE BROWSER HOLDS THE DATASET · THE INTERFACE RENDERS WHAT FITS', w - pad * 2),
    pad, h - bot * .3
  );
}
