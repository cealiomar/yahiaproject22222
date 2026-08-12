/* ══════════════════════════════════════════════════════════════
   QR — a real, scannable encoder (byte mode, ECC level L, v1–v9).
   Small on purpose: enough for a verification URL, no dependency.
   QR.svg(text, opts) → SVG markup string.
   ══════════════════════════════════════════════════════════════ */

window.QR = (function () {

/* ── GF(256) ── */
const EXP = new Uint8Array(512), LOG = new Uint8Array(256);
(function () {
  let x = 1;
  for (let i = 0; i < 255; i++) { EXP[i] = x; LOG[x] = i; x <<= 1; if (x & 0x100) x ^= 0x11D; }
  for (let i = 255; i < 512; i++) EXP[i] = EXP[i - 255];
})();
const mul = (a, b) => (a && b) ? EXP[LOG[a] + LOG[b]] : 0;

function genPoly(n) {
  let g = [1];
  for (let i = 0; i < n; i++) {
    const ng = new Array(g.length + 1).fill(0);
    for (let j = 0; j < g.length; j++) { ng[j] ^= g[j]; ng[j + 1] ^= mul(g[j], EXP[i]); }
    g = ng;
  }
  return g;
}
function rsEncode(data, nec) {
  const g = genPoly(nec), res = new Array(nec).fill(0);
  for (const d of data) {
    const f = d ^ res[0];
    res.shift(); res.push(0);
    if (f) for (let i = 0; i < nec; i++) res[i] ^= mul(g[i + 1], f);
  }
  return res;
}

/* ── version tables, ECC level L, versions 1–9 (all blocks equal length) ── */
const DATA_CW = [0, 19, 34, 55, 80, 108, 136, 156, 194, 232];
const EC_CW   = [0,  7, 10, 15, 20,  26,  18,  20,  24,  30];
const BLOCKS  = [0,  1,  1,  1,  1,   1,   2,   2,   2,   2];
const ALIGN   = [[], [], [6,18], [6,22], [6,26], [6,30], [6,34],
                 [6,22,38], [6,24,42], [6,26,46]];

const MASKS = [
  (r, c) => ((r + c) % 2) === 0,
  (r, c) => (r % 2) === 0,
  (r, c) => (c % 3) === 0,
  (r, c) => ((r + c) % 3) === 0,
  (r, c) => (((r / 2 | 0) + (c / 3 | 0)) % 2) === 0,
  (r, c) => (((r * c) % 2) + ((r * c) % 3)) === 0,
  (r, c) => ((((r * c) % 2) + ((r * c) % 3)) % 2) === 0,
  (r, c) => ((((r + c) % 2) + ((r * c) % 3)) % 2) === 0
];

function fmtBits(ec, mask) {
  const data = (ec << 3) | mask;
  let rem = data << 10;
  for (let i = 14; i >= 10; i--) if ((rem >>> i) & 1) rem ^= 0b10100110111 << (i - 10);
  return ((data << 10) | rem) ^ 0b101010000010010;
}
function verBits(v) {
  /* G(x) = x^12+x^11+x^10+x^9+x^8+x^5+x^2+1 */
  let rem = v << 12;
  for (let i = 17; i >= 12; i--) if ((rem >>> i) & 1) rem ^= 0b1111100100101 << (i - 12);
  return (v << 12) | rem;
}

function utf8(s) {
  if (typeof TextEncoder !== 'undefined') return Array.from(new TextEncoder().encode(s));
  return Array.from(unescape(encodeURIComponent(s))).map(c => c.charCodeAt(0));
}

/* ── build the module matrix ── */
function matrix(text) {
  const bytes = utf8(text);
  let v = 1;
  while (v <= 9 && DATA_CW[v] - 2 < bytes.length) v++;
  if (v > 9) throw new Error('QR: payload too long');

  /* bitstream */
  const bits = [];
  const push = (val, len) => { for (let i = len - 1; i >= 0; i--) bits.push((val >> i) & 1); };
  push(4, 4); push(bytes.length, 8);
  for (const b of bytes) push(b, 8);
  const capBits = DATA_CW[v] * 8;
  for (let i = 0; i < 4 && bits.length < capBits; i++) bits.push(0);
  while (bits.length % 8) bits.push(0);

  const dcw = [];
  for (let i = 0; i < bits.length; i += 8) {
    let b = 0; for (let j = 0; j < 8; j++) b = (b << 1) | bits[i + j];
    dcw.push(b);
  }
  const PAD = [0xEC, 0x11];
  let pi = 0;
  while (dcw.length < DATA_CW[v]) dcw.push(PAD[pi++ % 2]);

  /* blocks → interleave */
  const nb = BLOCKS[v], per = DATA_CW[v] / nb, nec = EC_CW[v];
  const dB = [], eB = [];
  for (let i = 0; i < nb; i++) {
    const blk = dcw.slice(i * per, (i + 1) * per);
    dB.push(blk); eB.push(rsEncode(blk, nec));
  }
  const cw = [];
  for (let i = 0; i < per; i++) for (const b of dB) cw.push(b[i]);
  for (let i = 0; i < nec; i++) for (const b of eB) cw.push(b[i]);

  /* matrix skeleton */
  const n = 17 + 4 * v;
  const m  = Array.from({ length: n }, () => new Int8Array(n).fill(-1));
  const fn = Array.from({ length: n }, () => new Uint8Array(n));
  const set = (r, c, val) => {
    if (r < 0 || r >= n || c < 0 || c >= n) return;
    m[r][c] = val; fn[r][c] = 1;
  };

  const finder = (r0, c0) => {
    for (let r = -1; r <= 7; r++) for (let c = -1; c <= 7; c++) {
      const inner = r >= 0 && r <= 6 && c >= 0 && c <= 6;
      let val = 0;
      if (inner) {
        const edge = r === 0 || r === 6 || c === 0 || c === 6;
        const core = r >= 2 && r <= 4 && c >= 2 && c <= 4;
        val = (edge || core) ? 1 : 0;
      }
      set(r0 + r, c0 + c, val);
    }
  };
  finder(0, 0); finder(0, n - 7); finder(n - 7, 0);

  for (let i = 8; i < n - 8; i++) {
    const b = (i % 2 === 0) ? 1 : 0;
    set(6, i, b); set(i, 6, b);
  }

  for (const r of ALIGN[v]) for (const c of ALIGN[v]) {
    if (fn[r][c]) continue;
    for (let dr = -2; dr <= 2; dr++) for (let dc = -2; dc <= 2; dc++)
      set(r + dr, c + dc, Math.max(Math.abs(dr), Math.abs(dc)) !== 1 ? 1 : 0);
  }

  set(n - 8, 8, 1);                                  // dark module

  for (let i = 0; i < 9; i++) {                      // reserve format areas
    if (!fn[8][i]) set(8, i, 0);
    if (!fn[i][8]) set(i, 8, 0);
  }
  for (let i = 0; i < 8; i++) {
    if (!fn[8][n - 1 - i]) set(8, n - 1 - i, 0);
    if (!fn[n - 1 - i][8]) set(n - 1 - i, 8, 0);
  }

  if (v >= 7) {                                      // version info
    const vb = verBits(v);
    for (let i = 0; i < 18; i++) {
      const b = (vb >> i) & 1, r = (i / 3) | 0, c = i % 3;
      set(r, n - 11 + c, b); set(n - 11 + c, r, b);
    }
  }

  /* data, zig-zag from bottom-right */
  let bi = 0, up = true;
  const total = cw.length * 8;
  for (let col = n - 1; col > 0; col -= 2) {
    if (col === 6) col--;
    for (let i = 0; i < n; i++) {
      const row = up ? n - 1 - i : i;
      for (let k = 0; k < 2; k++) {
        const c = col - k;
        if (fn[row][c]) continue;
        let bit = 0;
        if (bi < total) { bit = (cw[bi >> 3] >> (7 - (bi & 7))) & 1; bi++; }
        m[row][c] = bit;
      }
    }
    up = !up;
  }

  /* pick the mask with the lowest penalty */
  let best = null, bestScore = Infinity;
  for (let mask = 0; mask < 8; mask++) {
    const t = m.map(r => Int8Array.from(r));
    for (let r = 0; r < n; r++) for (let c = 0; c < n; c++)
      if (!fn[r][c] && MASKS[mask](r, c)) t[r][c] ^= 1;

    const f = fmtBits(1, mask);
    for (let i = 0; i < 15; i++) {
      const b = (f >> i) & 1;
      if (i < 6) t[i][8] = b;
      else if (i < 8) t[i + 1][8] = b;
      else t[n - 15 + i][8] = b;
    }
    for (let i = 0; i < 15; i++) {
      const b = (f >> i) & 1;
      if (i < 8) t[8][n - 1 - i] = b;
      else if (i < 9) t[8][7] = b;
      else t[8][15 - i - 1] = b;
    }
    t[n - 8][8] = 1;

    const s = penalty(t, n);
    if (s < bestScore) { bestScore = s; best = t; }
  }
  return { m: best, n };
}

function penalty(t, n) {
  let p = 0, dark = 0;

  const run = get => {
    for (let a = 0; a < n; a++) {
      let last = -1, len = 0;
      for (let b = 0; b < n; b++) {
        const val = get(a, b);
        if (val === last) { len++; }
        else { if (len >= 5) p += 3 + (len - 5); last = val; len = 1; }
      }
      if (len >= 5) p += 3 + (len - 5);
    }
  };
  run((a, b) => t[a][b]);
  run((a, b) => t[b][a]);

  for (let r = 0; r < n - 1; r++) for (let c = 0; c < n - 1; c++) {
    const v = t[r][c];
    if (v === t[r][c + 1] && v === t[r + 1][c] && v === t[r + 1][c + 1]) p += 3;
  }

  const P1 = [1,0,1,1,1,0,1,0,0,0,0], P2 = [0,0,0,0,1,0,1,1,1,0,1];
  const findPat = get => {
    for (let a = 0; a < n; a++) for (let b = 0; b <= n - 11; b++) {
      let m1 = true, m2 = true;
      for (let k = 0; k < 11; k++) {
        const v = get(a, b + k);
        if (v !== P1[k]) m1 = false;
        if (v !== P2[k]) m2 = false;
        if (!m1 && !m2) break;
      }
      if (m1) p += 40;
      if (m2) p += 40;
    }
  };
  findPat((a, b) => t[a][b]);
  findPat((a, b) => t[b][a]);

  for (let r = 0; r < n; r++) for (let c = 0; c < n; c++) dark += t[r][c];
  p += Math.floor(Math.abs(dark * 100 / (n * n) - 50) / 5) * 10;
  return p;
}

/* ── SVG output ── */
function svg(text, opts) {
  opts = opts || {};
  const quiet = opts.quiet == null ? 2 : opts.quiet;
  const dark  = opts.dark  || '#0A0A0B';
  const light = opts.light || '#FFFFFF';

  let g;
  try { g = matrix(text); }
  catch (e) { console.warn(e); return ''; }

  const { m, n } = g, size = n + quiet * 2;
  let d = '';
  for (let r = 0; r < n; r++) {
    let c = 0;
    while (c < n) {
      if (m[r][c] !== 1) { c++; continue; }
      let w = 1;
      while (c + w < n && m[r][c + w] === 1) w++;
      d += `M${c + quiet} ${r + quiet}h${w}v1h-${w}z`;
      c += w;
    }
  }
  return `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ${size} ${size}" `
       + `shape-rendering="crispEdges" role="img" aria-label="QR">`
       + `<rect width="${size}" height="${size}" fill="${light}"/>`
       + `<path d="${d}" fill="${dark}"/></svg>`;
}

return { svg, matrix };
})();
