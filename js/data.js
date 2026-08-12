/* ══════════════════════════════════════════════════════════════
   DEMO REGISTRY + API SEAM
   ──────────────────────────────────────────────────────────────
   Everything below is fake. When you have a real backend, keep the
   PSApi signatures identical and swap the two bodies for fetch():

     lookup(n)         →  GET  /api/warranty/:n
     activate(n, body) →  POST /api/warranty/:n/activate

   Nothing else in the app touches the data layer.
   ══════════════════════════════════════════════════════════════ */

/* ── product family ── */
window.PRODUCTS = {
  crystal : { code:'PS CRYSTAL',  finish:'gloss', years:10, sku:'PS-CRY-152-15' },
  titanium: { code:'PS TITANIUM', finish:'gloss', years:12, sku:'PS-TIT-152-30' },
  satin   : { code:'PS SATIN',    finish:'satin', years:10, sku:'PS-SAT-152-15' },
  stealth : { code:'PS STEALTH',  finish:'matte', years:10, sku:'PS-STL-152-15' }
};

/* ── the demo registry ── */
const REGISTRY = {
  '131489352682': { line:'titanium' },

  'PS-2026-000123': { line:'crystal', act:{
    date:'2026-03-14', center:'مركز الصقر للعناية بالسيارات', centerEn:'Falcon Auto Care',
    city:'الرياض', cityEn:'Riyadh', vehicle:'Toyota Land Cruiser 2024',
    plate:'ر ط ح 4821', vin:'JTMHV05J004128877', phone:'+966 50 123 4567' }},

  'PS-2026-000777': { line:'stealth' },
  'PS-2026-000456': { line:'crystal' },

  'PS-2026-000999': { line:'satin', act:{
    date:'2026-06-02', center:'مركز النخبة', centerEn:'Elite Detailing',
    city:'جدة', cityEn:'Jeddah', vehicle:'BMW X5 2025',
    plate:'ب ن م 1190', vin:'WBAKV6C55BC998210', phone:'+966 55 908 7712' }},

  'PS-2025-004512': { line:'titanium', act:{
    date:'2025-11-20', center:'Elite Detailing — Dubai', centerEn:'Elite Detailing — Dubai',
    city:'دبي', cityEn:'Dubai', vehicle:'Porsche Cayenne 2025',
    plate:'D 55219', vin:'WP1AA2A57MLB12093', phone:'+971 50 447 2210' }},

  'PS-2014-008801': { line:'crystal', act:{
    date:'2014-08-01', center:'مركز الأمانة', centerEn:'Amana Centre',
    city:'القاهرة', cityEn:'Cairo', vehicle:'Mercedes-Benz C200 2014',
    plate:'س ي د 3307', vin:'WDDGF4HB0EA912774', phone:'+20 100 552 8814' }}
};

const LS_KEY = 'ps.activations.v1';

/* ── helpers ── */
const localActs = () => { try { return JSON.parse(localStorage.getItem(LS_KEY)) || {}; }
                          catch { return {}; } };
const saveAct = (n, a) => {
  const all = localActs(); all[n] = a;
  try { localStorage.setItem(LS_KEY, JSON.stringify(all)); } catch {}
};

const addYears = (iso, y) => {
  const d = new Date(iso + 'T00:00:00');
  d.setFullYear(d.getFullYear() + y);
  return d.toISOString().slice(0, 10);
};
const dayDiff = (a, b) =>
  Math.round((new Date(b + 'T00:00:00') - new Date(a + 'T00:00:00')) / 864e5);
const today = () => new Date().toISOString().slice(0, 10);

/* Accepts a bare number, a spaced number, or a whole URL from a QR code. */
window.normalizeNumber = raw => {
  let s = String(raw || '').trim();
  if (/^https?:\/\//i.test(s)) {
    try {
      const u = new URL(s);
      s = u.searchParams.get('w') || u.searchParams.get('warranty')
          || u.pathname.split('/').filter(Boolean).pop() || '';
    } catch {}
  }
  return s.replace(/\s+/g, '').toUpperCase();
};

/* ── the API ── */
window.PSApi = {

  /** GET /api/warranty/:n */
  lookup(number) {
    return new Promise(resolve => {
      const n = window.normalizeNumber(number);
      setTimeout(() => {
        const rec = REGISTRY[n];
        if (!rec) return resolve({ found:false, number:n, status:'notfound' });

        const product = { ...window.PRODUCTS[rec.line], line:rec.line };
        const act = localActs()[n] || rec.act || null;

        if (!act) return resolve({
          found:true, number:n, product, status:'pending',
          activation:null, expiresAt:null, daysLeft:null, totalDays:null
        });

        const expiresAt = addYears(act.date, product.years);
        const daysLeft  = dayDiff(today(), expiresAt);
        const totalDays = dayDiff(act.date, expiresAt);

        resolve({
          found:true, number:n, product,
          status: daysLeft > 0 ? 'active' : 'expired',
          activation:act, expiresAt, daysLeft, totalDays
        });
      /* held deliberately long: the search animation is part of the
         experience, and a real registry round-trip is not instant either */
      }, 2600 + Math.random() * 500);
    });
  },

  /** POST /api/warranty/:n/activate */
  activate(number, body) {
    return new Promise((resolve, reject) => {
      const n = window.normalizeNumber(number);
      setTimeout(() => {
        const rec = REGISTRY[n];
        if (!rec) return reject(new Error('not-found'));
        if (localActs()[n] || rec.act) return reject(new Error('already-active'));

        const act = { ...body, issuedAt:today() };
        saveAct(n, act);

        const product   = { ...window.PRODUCTS[rec.line], line:rec.line };
        const expiresAt = addYears(act.date, product.years);
        resolve({
          found:true, number:n, product, status:'active', activation:act, expiresAt,
          daysLeft: dayDiff(today(), expiresAt),
          totalDays: dayDiff(act.date, expiresAt)
        });
      }, 900 + Math.random() * 500);
    });
  },

  /** demo-only: wipe locally stored activations */
  reset() { try { localStorage.removeItem(LS_KEY); } catch {} }
};

window.fmtDate = (iso, lang) => {
  if (!iso) return '—';
  try {
    return new Date(iso + 'T00:00:00').toLocaleDateString(
      lang === 'ar' ? 'ar-EG-u-nu-latn' : 'en-GB',
      { year:'numeric', month:'short', day:'numeric' }
    );
  } catch { return iso; }
};
