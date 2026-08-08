// Shared canvas helpers. Inter only — JetBrains Mono dropped with the
// rejected variants (spec §5), so canvas type uses tabular figures instead.

export const cl = (v) => Math.max(0, Math.min(1, v));
export const ease = (t) => (t < .5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2);
export const commas = (n) => Math.round(n).toLocaleString('en-US');

// A short event id, stable per n — used by the stream and table beats for the
// evt_* labels that stand in for real telemetry rows.
export const hex = (n) => (((n * 2654435761) >>> 0).toString(16) + '00000000').slice(0, 8);

// decimal kB, the way build tools report it — 0.390 MB reads as 390 kB, not 400
export const size = (mb) => (mb >= 1 ? mb.toFixed(2) + ' MB' : Math.round(mb * 1000) + ' kB');

export const face = (px, wt) => `${wt || 300} ${px}px Inter, system-ui, sans-serif`;

export const accent = (el) =>
  getComputedStyle(el).getPropertyValue('--accent').trim() || '28,105,212';

export const fit = (c) => {
  const d = Math.min(devicePixelRatio || 1, 2);
  const w = c.clientWidth, h = c.clientHeight;
  if (c._w !== w || c._h !== h) {
    c.width = Math.max(1, w * d);
    c.height = Math.max(1, h * d);
    c._w = w; c._h = h;
    c.getContext('2d').setTransform(d, 0, 0, d, 0, 0);
  }
  const x = c.getContext('2d');
  x.clearRect(0, 0, w, h);
  x.textAlign = 'left';
  x.textBaseline = 'alphabetic';
  x.fontVariantNumeric = 'tabular-nums';
  return { x, w, h };
};

export const trim = (x, txt, max) => {
  if (max <= 4) return '';
  if (x.measureText(txt).width <= max) return txt;
  let t = txt;
  while (t.length > 1 && x.measureText(t + '…').width > max) t = t.slice(0, -1);
  return t + '…';
};

// A window chrome for the beats that depict a real interface.
export const chrome = (x, px, py, pw, ph, tabs, active, A) => {
  x.fillStyle = '#000';
  x.fillRect(px, py, pw, ph);
  x.strokeStyle = 'rgba(255,255,255,.15)';
  x.lineWidth = 1;
  x.strokeRect(px + .5, py + .5, pw - 1, ph - 1);

  const bar = 22;
  x.fillStyle = 'rgba(255,255,255,.05)';
  x.fillRect(px + 1, py + 1, pw - 2, bar);
  x.fillStyle = 'rgba(255,255,255,.15)';
  x.fillRect(px + 1, py + bar, pw - 2, 1);

  let tx = px + 11;
  x.font = face(9.5, 700);
  tabs.forEach((t, i) => {
    const on = i === active;
    x.fillStyle = on ? '#fff' : 'rgba(255,255,255,.35)';
    x.fillText(t, tx, py + 15);
    const tw = x.measureText(t).width;
    if (on) { x.fillStyle = `rgb(${A})`; x.fillRect(tx, py + bar - 2, tw, 2); }
    tx += tw + 16;
  });

  return { bx: px + 1, by: py + bar + 1, bw: pw - 2, bh: ph - bar - 2 };
};
