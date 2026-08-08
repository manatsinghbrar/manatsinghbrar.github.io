import bundle from './beats/bundle.js';
import stream from './beats/stream.js';
import table from './beats/table.js';
import { accent } from './beats/shared.js';

// The scroll driver. Scroll position drives the frame; scrolling up rewinds.
// Nothing here is the only source of any text — every beat's copy is DOM, so
// with JS off the section loses decoration and nothing else.

const MOTIONS = { bundle, stream, table };
const reduce = matchMedia('(prefers-reduced-motion: reduce)');

// Each beat gets its own scroll stage so the animation plays while the beat is
// held, rather than as it passes.
for (const beat of document.querySelectorAll('.beat')) {
  const stage = document.createElement('div');
  stage.className = 'pinstage';
  stage.dataset.beat = beat.dataset.beat;
  const stick = document.createElement('div');
  stick.className = 'pinstick';
  const rail = document.createElement('i');
  rail.className = 'pinrail';
  beat.replaceWith(stage);
  stick.append(beat, rail);
  stage.append(stick);
}

const A = accent(document.documentElement);
const canvases = [...document.querySelectorAll('canvas[data-canvas]')];
const visible = new Set();
let raf = null;
let slowFrames = 0;
let unhooked = false;
let last = 0;

const paint = (c, ts) => {
  const stick = c.closest('.pinstick');
  const stage = stick && stick.parentElement;
  // A pinned beat is held still while the page scrolls past it, so progress
  // comes from how far its stage has travelled, not from the canvas crossing
  // the viewport — which no longer moves. The media queries that release the
  // pin collapse the stage onto the beat, so the slack itself is the test.
  const slack = stage ? stage.offsetHeight - stick.offsetHeight : 0;
  let p;
  if (slack > 40) {
    p = Math.max(0, Math.min(1, -stage.getBoundingClientRect().top / slack));
    const rail = stick.querySelector('.pinrail');
    if (rail) rail.style.width = (p * 100).toFixed(2) + '%';
  } else {
    const rect = c.getBoundingClientRect();
    p = Math.max(0, Math.min(1, (innerHeight * .82 - rect.top) / (innerHeight * .55)));
  }
  MOTIONS[c.dataset.canvas](c, reduce.matches ? 1 : p, ts, A);
};

const frame = (ts) => {
  raf = null;
  for (const c of visible) paint(c, ts);

  // Two slow frames unhook the driver and leave the last frame painted. A
  // portfolio that stutters is worse than one that holds still.
  if (last) {
    if (ts - last > 34) { if (++slowFrames >= 2) { unhooked = true; return; } }
    else slowFrames = 0;
  }
  last = ts;

  if (visible.size && !reduce.matches) raf = requestAnimationFrame(frame);
};

const kick = () => {
  if (unhooked || raf !== null || !visible.size) return;
  last = 0;
  raf = requestAnimationFrame(frame);
};

// Nothing runs before content paint — canvases mount on intersection.
const io = new IntersectionObserver((entries) => {
  for (const e of entries) {
    if (e.isIntersecting) visible.add(e.target);
    else visible.delete(e.target);
  }
  if (reduce.matches) { for (const c of visible) paint(c, 0); return; }
  kick();
}, { rootMargin: '150px 0px' });

for (const c of canvases) io.observe(c);

addEventListener('scroll', kick, { passive: true });
addEventListener('resize', () => {
  for (const c of canvases) c._w = null;
  if (reduce.matches) { for (const c of visible) paint(c, 0); return; }
  kick();
});
reduce.addEventListener('change', () => {
  for (const c of canvases) c._w = null;
  for (const c of visible) paint(c, 0);
  kick();
});
