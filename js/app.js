/* ══════════════════════════════════════════════════════════════
   PRECIOUS SHIELD — app
   ══════════════════════════════════════════════════════════════ */
(() => {
'use strict';

const $  = (s, r = document) => r.querySelector(s);
const $$ = (s, r = document) => Array.from(r.querySelectorAll(s));
const clamp = (v, a, b) => Math.min(b, Math.max(a, v));
const REDUCE = matchMedia('(prefers-reduced-motion: reduce)').matches;

/* declared up front: applyTheme() runs before the shader is built */
let hero = null;

/* where the certificate QR points */
const VERIFY_BASE = /^https?:$/.test(location.protocol)
  ? location.origin + location.pathname
  : 'https://preciousshield.com/warranty';

/* ─────────────────── 1. language ─────────────────── */
let LANG = 'ar';
try {
  const saved = localStorage.getItem('ps.lang');
  if (saved && window.I18N[saved]) LANG = saved;
  else if ((navigator.language || '').toLowerCase().startsWith('en')) LANG = 'en';
} catch {}

const t = k => (window.I18N[LANG] && window.I18N[LANG][k]) || k;

const PLACEHOLDERS = [['#wn','ph.wn'], ['#fCar','ph.car'], ['#fPlate','ph.plate'], ['#fCenter','ph.center']];

function applyStrings() {
  document.documentElement.lang = LANG;
  document.documentElement.dir  = window.LANGS[LANG].dir;
  $$('[data-i18n]').forEach(el => {
    const v = window.I18N[LANG][el.dataset.i18n];
    if (v != null) el.innerHTML = v;
  });
  PLACEHOLDERS.forEach(([sel, key]) => { const el = $(sel); if (el) el.placeholder = t(key); });
  const lb = $('#langLabel'); if (lb) lb.textContent = window.LANGS[LANG].label;
  document.title = LANG === 'ar'
    ? 'Precious Shield — سجلّ الضمان الرقمي'
    : 'Precious Shield — Digital Warranty Registry';
}

function setLang(next, animate = true) {
  if (next === LANG) return;
  LANG = next;
  try { localStorage.setItem('ps.lang', LANG); } catch {}

  const go = () => {
    applyStrings();
    fitTitle();                       // the new string has a different width
    if (hero) hero.setDir(window.LANGS[LANG].dir);
    if (Con.last) Con.renderResult(Con.last, true);
    if (Con.cert) Con.renderCert(Con.cert);
  };

  if (!animate || REDUCE) { go(); return; }
  document.body.classList.add('i18n-out');
  setTimeout(() => { go(); document.body.classList.remove('i18n-out'); }, 280);
}

$('#langBtn')?.addEventListener('click', () => setLang(window.LANGS[LANG].next));

/* ─────────────────── 1b. theme ─────────────────── */
let THEME = 'dark';
try {
  const saved = localStorage.getItem('ps.theme');
  if (saved === 'light' || saved === 'dark') THEME = saved;
  else if (matchMedia('(prefers-color-scheme: light)').matches) THEME = 'light';
} catch {}

function applyTheme() {
  document.documentElement.dataset.theme = THEME;
  const meta = document.querySelector('meta[name="theme-color"]');
  if (meta) meta.content = THEME === 'light' ? '#F3F0EA' : '#0A0A0B';
  if (hero) hero.setTheme(THEME);
}
applyTheme();

$('#themeBtn')?.addEventListener('click', () => {
  THEME = THEME === 'dark' ? 'light' : 'dark';
  try { localStorage.setItem('ps.theme', THEME); } catch {}
  applyTheme();
});

/* ─────────────────── 1c. headline fitting ───────────────────
   "ضمانك ما يضيع" is 13 characters; "The shield that remembers" is 25.
   No single clamp() can hold both on one line at a good size, so the size is
   measured from the text's own width instead of guessed from the viewport.
   If even the minimum will not fit (long strings on a narrow phone) it lets
   the line wrap rather than clipping — wrapping is always the safer failure. */
const fitTitle = (() => {
  const el = $('.hero__title');
  if (!el) return () => {};
  const MIN = 30;               // below this it stops being a headline
  const REF = 100;              // measure at a known size, then scale

  return function fit() {
    const box = el.parentElement;
    const avail = box.clientWidth;
    if (!avail) return;

    const prev = el.style.cssText;
    el.style.whiteSpace = 'nowrap';
    el.style.width = 'max-content';
    el.style.fontSize = REF + 'px';
    const natural = el.offsetWidth;
    el.style.cssText = prev;
    if (!natural) return;

    /* 0.97 keeps a hair of breathing room off the padding edge */
    let size = REF * (avail / natural) * 0.97;
    size = Math.min(size, 132, innerWidth * 0.115, innerHeight * 0.34);

    if (size < MIN) {           // cannot fit on one line — wrap, never clip
      size = MIN;
      el.style.whiteSpace = 'normal';
    } else {
      el.style.whiteSpace = 'nowrap';
    }
    el.style.fontSize = size.toFixed(1) + 'px';
  };
})();

fitTitle();
addEventListener('resize', fitTitle, { passive: true });
/* the display face changes the metrics, so re-measure once it lands */
if (document.fonts && document.fonts.ready) document.fonts.ready.then(fitTitle);

/* ─────────────────── 2. toast ─────────────────── */
let toastT;
function toast(msg, kind = '') {
  const el = $('#toast');
  el.textContent = msg;
  el.className = 'toast on ' + kind;
  clearTimeout(toastT);
  toastT = setTimeout(() => { el.className = 'toast ' + kind; }, 3400);
}

/* ─────────────────── 3. preloader ─────────────────── */
const Loader = (() => {
  const root = $('#loader'), pct = $('#loaderPct'), bar = $('#loaderBar'),
        clip = $('#fillRect'), hint = $('#loaderHint');
  /* viewBox is "50 207 495 428" — the mark spans y 207 → 635 */
  const TOP = 207, H = 428;
  const gates = { fonts:false, logo:false, load:false, min:false };
  let shown = 0, done = false, lineI = 0;

  const target = () => {
    const keys = Object.keys(gates), hit = keys.filter(k => gates[k]).length;
    return 0.08 + 0.92 * (hit / keys.length);
  };

  const LINES = window.LOADER_LINES[LANG] || window.LOADER_LINES.ar;
  hint.textContent = LINES[0];
  const lines = setInterval(() => {
    if (done) return;
    lineI = Math.min(LINES.length - 1, lineI + 1);
    hint.textContent = LINES[lineI];
  }, 780);

  function paint() {
    const p = Math.round(shown * 100);
    pct.textContent = p;
    bar.style.width = p + '%';
    /* fill the mark from the bottom up, in SVG user units */
    const h = H * shown;
    clip.setAttribute('y', (TOP + H - h).toFixed(1));
    clip.setAttribute('height', h.toFixed(1));
  }

  (function tick() {
    if (done) return;
    const to = target();
    shown += (to - shown) * (to >= 1 ? 0.22 : 0.08);
    if (shown > 0.995 && to >= 1) shown = 1;
    paint();
    if (shown >= 1) finish();
    else requestAnimationFrame(tick);
  })();

  /* rAF is paused in background tabs, so the loader must also be able to
     complete on wall-clock time alone — otherwise it hangs there forever. */
  const failsafe = setInterval(() => {
    if (done) { clearInterval(failsafe); return; }
    if (target() >= 1) { shown = 1; paint(); finish(); }
  }, 250);
  setTimeout(() => { if (!done) { shown = 1; paint(); finish(); } }, 7000);

  function finish() {
    if (done) return;
    done = true;
    clearInterval(lines);
    clearInterval(failsafe);
    hint.textContent = LINES[LINES.length - 1];
    setTimeout(() => {
      root.classList.add('is-out');
      document.body.classList.remove('is-loading');
      document.body.classList.add('is-ready');
      $('#gl')?.classList.add('on');
      setTimeout(() => { root.classList.add('is-done'); Deep.run(); }, 520);
    }, REDUCE ? 60 : 420);
  }

  /* gates */
  const open = k => { gates[k] = true; };
  if (document.fonts && document.fonts.ready) {
    document.fonts.ready.then(() => open('fonts'));
    setTimeout(() => open('fonts'), 3500);
  } else open('fonts');

  if (document.readyState === 'complete') open('load');
  else addEventListener('load', () => open('load'));
  setTimeout(() => open('load'), 5000);

  setTimeout(() => open('min'), REDUCE ? 100 : 2800);

  return { openLogo: () => open('logo') };
})();

/* ─────────────────── 4. hero shader ─────────────────── */
try {
  hero = window.HeroGL.init($('#gl'), { onReady: () => Loader.openLogo() });
} catch (e) { console.warn(e); }
if (!hero) { $('#gl').style.display = 'none'; Loader.openLogo(); }

/* ─────────────────── 5. cursor + magnets ─────────────────── */
if (matchMedia('(hover:hover) and (pointer:fine)').matches) {
  const cur = $('#cursor');
  let x = innerWidth / 2, y = innerHeight / 2, tx = x, ty = y;
  addEventListener('pointermove', e => { tx = e.clientX; ty = e.clientY; cur.classList.add('on'); }, { passive:true });
  addEventListener('pointerdown', () => cur.classList.add('tap'));
  addEventListener('pointerup',   () => cur.classList.remove('tap'));
  addEventListener('pointerleave',() => cur.classList.remove('on'));
  (function loop() {
    x += (tx - x) * 0.2; y += (ty - y) * 0.2;
    cur.style.transform = `translate3d(${x.toFixed(1)}px,${y.toFixed(1)}px,0)`;
    requestAnimationFrame(loop);
  })();
  document.addEventListener('pointerover', e => {
    const hit = e.target.closest('[data-cursor],a,button,input,label');
    cur.classList.toggle('hot', !!hit);
  });

  $$('[data-magnet]').forEach(el => {
    const R = 70;
    const move = e => {
      const r = el.getBoundingClientRect();
      const dx = e.clientX - (r.left + r.width / 2);
      const dy = e.clientY - (r.top + r.height / 2);
      if (Math.abs(dx) > r.width / 2 + R || Math.abs(dy) > r.height / 2 + R) {
        el.style.transform = ''; return;
      }
      el.style.transform = `translate(${dx * 0.22}px, ${dy * 0.3}px)`;
    };
    addEventListener('pointermove', move, { passive:true });
    el.addEventListener('pointerleave', () => { el.style.transform = ''; });
  });
}

/* ─────────────────── 6. header + scroll ─────────────────── */
{
  const head = $('#topbar'), prog = $('#scrollProgress');
  let last = 0, ticking = false;
  const onScroll = () => {
    const y = scrollY;
    head.classList.toggle('stuck', y > 20);
    head.classList.toggle('hide', y > 320 && y > last && !document.body.classList.contains('no-scroll'));
    last = y;
    const max = document.documentElement.scrollHeight - innerHeight;
    prog.style.width = (max > 0 ? clamp(y / max, 0, 1) * 100 : 0) + '%';
    ticking = false;
  };
  addEventListener('scroll', () => {
    if (!ticking) { ticking = true; requestAnimationFrame(onScroll); }
  }, { passive:true });
  onScroll();
}

/* ─────────────────── 7. reveals + counters ─────────────────── */
{
  const io = new IntersectionObserver((es) => {
    es.forEach(e => {
      if (!e.isIntersecting) return;
      e.target.classList.add('in');
      io.unobserve(e.target);
      $$('[data-count]', e.target).forEach(count);
    });
  }, { threshold: 0.12, rootMargin: '0px 0px -8% 0px' });

  $$('[data-rv]').forEach((el, i) => {
    el.style.transitionDelay = (i % 4) * 70 + 'ms';
    io.observe(el);
  });

  /* content must never be left invisible because an observer or a paused
     transition did not complete — reveal everything above the fold anyway */
  setTimeout(() => {
    $$('[data-rv]:not(.in)').forEach(el => {
      if (el.getBoundingClientRect().top < innerHeight) el.classList.add('in');
    });
  }, 2600);

  function count(el) {
    const to = parseFloat(el.dataset.count) || 0;
    const suf = el.dataset.suffix || '';
    if (REDUCE) { el.textContent = to + suf; return; }
    const dur = 1500, t0 = performance.now();
    /* rAF stalls in background tabs — the number must still end up correct */
    const land = setTimeout(() => { el.textContent = to + suf; }, dur + 300);
    (function step(now) {
      const p = clamp((now - t0) / dur, 0, 1);
      const e = 1 - Math.pow(2, -10 * p);
      el.textContent = Math.round(to * e) + (p === 1 ? suf : '');
      if (p < 1) requestAnimationFrame(step); else clearTimeout(land);
    })(t0);
  }
}

/* ─────────────────── 8. the console ─────────────────── */
const Con = (() => {
  const sec   = $('#console');
  const form  = $('#lookupForm'), input = $('#wn'), field = input.closest('.field');
  const errEl = $('#wnErr'), checkBtn = $('#checkBtn');
  const pRes  = $('#pResult'), pAct = $('#pActivate'), pCert = $('#pCert'), pLook = $('#pLookup');
  const rail  = $$('.rail__i');

  const api = { last: null, cert: null };

  /* ── rail ── */
  function setRail(step) {
    rail.forEach(li => {
      const n = +li.dataset.step;
      li.classList.toggle('is-on',   n === step);
      li.classList.toggle('is-done', n <  step);
    });
  }

  /* ── panel helpers ── */
  function show(el) {
    el.hidden = false;
    el.classList.remove('panel--enter');
    void el.offsetWidth;
    el.classList.add('panel--enter');
  }
  const hide = el => { el.hidden = true; };

  function scrollTo(el) {
    const y = el.getBoundingClientRect().top + scrollY - 100;
    scrollTo0(y);
  }
  const scrollTo0 = y => window.scrollTo({ top:y, behavior: REDUCE ? 'auto' : 'smooth' });

  /* ── lookup ── */
  function fail(msg) {
    errEl.hidden = false;
    errEl.textContent = msg;
    field.classList.add('bad');
    setTimeout(() => field.classList.remove('bad'), 500);
  }
  const clearFail = () => { errEl.hidden = true; field.classList.remove('bad'); };

  input.addEventListener('input', clearFail);

  async function check(raw) {
    const n = window.normalizeNumber(raw != null ? raw : input.value);
    clearFail();
    if (!n)            return fail(t('err.empty'));
    if (n.length < 6)  return fail(t('err.short'));

    sec.dataset.state = 'checking';
    checkBtn.classList.add('busy');
    hide(pCert); hide(pAct);
    pLook.hidden = false;
    api.cert = null;
    const stopSteps = runScanSteps();

    const res = await window.PSApi.lookup(n);
    stopSteps();
    checkBtn.classList.remove('busy');
    sec.dataset.state = 'result';

    api.last = res;
    renderResult(res);
    show(pRes);
    setRail(1);
    if (hero) hero.ripple(0, 0, 1.2);
    if (!REDUCE) setTimeout(() => scrollTo(pRes), 120);
  }

  form.addEventListener('submit', e => { e.preventDefault(); check(); });

  /* the search reads as three real stages rather than one frozen spinner.
     a second submit must kill the first run's timers, or two sequences
     overwrite each other's text and the sequence appears to stall. */
  let stepTimers = [];
  function runScanSteps() {
    stepTimers.forEach(clearTimeout);
    stepTimers.forEach(clearInterval);
    stepTimers = [];

    const txt = $('#scanfxTxt'), sub = $('#scanfxSub');
    const steps = t('scan.steps').split('|');
    let i = 0;
    txt.textContent = steps[0];
    txt.classList.remove('swap');
    sub.textContent = t('scan.wait');

    const id = setInterval(() => {
      if (i >= steps.length - 1) return;
      i++;
      const at = i;
      txt.classList.add('swap');
      stepTimers.push(setTimeout(() => {
        txt.textContent = steps[at];
        txt.classList.remove('swap');
      }, 220));
    }, 820);
    stepTimers.push(id);

    return () => { stepTimers.forEach(clearTimeout); stepTimers.forEach(clearInterval); stepTimers = []; };
  }

  /* ── result ── */
  const TAG = { pending:'tag--warn', active:'tag--ok', expired:'tag--dead', notfound:'tag--bad' };

  function renderResult(res, quiet) {
    const tag = $('#resTag');
    tag.className = 'tag ' + (TAG[res.status] || 'tag--bad');
    $('#resTagTx').textContent = t('st.' + res.status);
    $('#resSerial').textContent = res.number;

    /* the headline answer: how long is left */
    const rem = $('#resRemain');
    if (res.status === 'active') {
      const y = Math.floor(res.daysLeft / 365);
      const m = Math.floor((res.daysLeft % 365) / 30);
      rem.hidden = false;
      rem.innerHTML =
        `<span class="remain__lb">${esc(t('remain.lb'))}</span>` +
        `<span class="remain__v">${esc(humanLeft(y, m))}</span>` +
        `<span class="remain__s">${esc(t('remain.until'))} ${esc(window.fmtDate(res.expiresAt, LANG))}</span>`;
    } else if (res.status === 'pending') {
      rem.hidden = false;
      rem.innerHTML =
        `<span class="remain__lb">${esc(t('remain.lbPending'))}</span>` +
        `<span class="remain__v">${res.product.years} ${esc(yearWord(res.product.years))}</span>` +
        `<span class="remain__s">${esc(t('remain.startsOn'))}</span>`;
    } else {
      rem.hidden = true;
    }

    const P = res.product;
    $('#resProduct').textContent = res.found ? P.code : '—';
    $('#resFinish').textContent  = res.found
      ? `${window.FINISH[LANG][P.finish]} · ${P.years} ${P.years > 10 ? t('unit.year') : t('unit.years')}`
      : '';

    /* specs */
    const rows = [];
    if (res.found) {
      rows.push(['spec.years', `${P.years} ${P.years > 10 ? t('unit.year') : t('unit.years')}`, false]);
      rows.push(['spec.batch', P.sku, true]);
      const a = res.activation;
      if (a) {
        rows.push(['spec.activated', window.fmtDate(a.date, LANG), true]);
        rows.push(['spec.expires',   window.fmtDate(res.expiresAt, LANG), true]);
        rows.push(['spec.vehicle',   a.vehicle, false]);
        rows.push(['spec.plate',     a.plate, true]);
        rows.push(['spec.center',    LANG === 'en' ? (a.centerEn || a.center) : a.center, false]);
        if (a.city) rows.push(['spec.city', LANG === 'en' ? (a.cityEn || a.city) : a.city, false]);
      } else {
        rows.push(['spec.finish', window.FINISH[LANG][P.finish], false]);
      }
    }
    $('#resSpecs').innerHTML = rows.map(([k, v, m]) =>
      `<div><dt>${t(k)}</dt><dd class="${m ? 'mono' : ''}">${esc(v)}</dd></div>`).join('');

    /* gauge */
    const g = $('#gauge'), arc = $('#gaugeArc'), num = $('#gaugeNum'), unit = $('#gaugeUnit');
    const C = 540.4;
    let pctv = 0, n = 0, u = t('g.none'), cls = 'gauge';
    if (res.status === 'pending') { pctv = 1; n = P.years; u = P.years > 10 ? t('unit.year') : t('unit.years'); cls += ' gauge--warn'; }
    else if (res.status === 'active') { pctv = clamp(res.daysLeft / res.totalDays, 0, 1); n = res.daysLeft; u = t('g.daysLeft'); cls += ' gauge--ok'; }
    else if (res.status === 'expired') { pctv = 0; n = 0; u = t('g.expired'); cls += ' gauge--dead'; }
    else { pctv = 0; n = 0; u = t('g.none'); cls += ' gauge--dead'; }
    g.className = cls;
    unit.textContent = u;
    requestAnimationFrame(() => { arc.style.strokeDashoffset = C * (1 - pctv); });
    countTo(num, n, quiet);

    /* footer */
    const foot = $('#resFoot');
    foot.innerHTML = `<p class="res__msg">${esc(t('msg.' + res.status))}</p>`;
    if (res.status === 'pending') {
      const b = mk('button', 'btn btn--solid', t('cta.activate'));
      b.dataset.cursor = 'btn';
      b.onclick = openActivate;
      foot.appendChild(b);
    } else if (res.status === 'active') {
      const b = mk('button', 'btn btn--ghost', t('cta.viewCert'));
      b.dataset.cursor = 'btn';
      b.onclick = () => { api.cert = res; renderCert(res); hide(pAct); show(pCert); setRail(3); scrollTo(pCert); };
      foot.appendChild(b);
    } else {
      const b = mk('button', 'btn btn--ghost', t('cta.retry'));
      b.dataset.cursor = 'btn';
      b.onclick = () => { input.value = ''; input.focus(); scrollTo(pLook); };
      foot.appendChild(b);
    }
  }

  function countTo(el, to, quiet) {
    clearTimeout(el._land);
    if (REDUCE || quiet) { el.textContent = to.toLocaleString('en-US'); return; }
    const dur = 1400, t0 = performance.now();
    el._land = setTimeout(() => { el.textContent = to.toLocaleString('en-US'); }, dur + 300);
    (function step(now) {
      const p = clamp((now - t0) / dur, 0, 1);
      const e = 1 - Math.pow(2, -10 * p);
      el.textContent = Math.round(to * e).toLocaleString('en-US');
      if (p < 1) requestAnimationFrame(step); else clearTimeout(el._land);
    })(t0);
  }

  /* ── activation ── */
  const actForm = $('#actForm');
  $('#fDate').value = new Date().toISOString().slice(0, 10);
  $('#fDate').max   = new Date().toISOString().slice(0, 10);

  function openActivate() {
    show(pAct);
    setRail(2);
    scrollTo(pAct);
    setTimeout(() => $('#fCar').focus({ preventScroll:true }), 700);
  }
  $('#actBack').addEventListener('click', () => { hide(pAct); setRail(1); scrollTo(pRes); });

  actForm.addEventListener('submit', async e => {
    e.preventDefault();
    if (!api.last || !api.last.found) return;

    let ok = true;
    const need = ['fCar', 'fPlate', 'fPhone', 'fCenter', 'fDate'];
    need.forEach(id => {
      const el = $('#' + id), wrap = el.closest('.ff'), msg = wrap.querySelector('.ff__e');
      let bad = !el.value.trim();
      if (!bad && id === 'fPhone' && (el.value.replace(/\D/g, '').length < 7)) bad = 'phone';
      wrap.classList.toggle('bad', !!bad);
      msg.textContent = bad === 'phone' ? t('err.phone') : t('err.req');
      if (bad) ok = false;
    });
    const agree = $('#fAgree'), aWrap = agree.closest('.check');
    aWrap.classList.toggle('bad', !agree.checked);
    if (!agree.checked) { ok = false; toast(t('err.agree'), 'err'); }
    if (!ok) return;

    const btn = $('#actBtn');
    btn.classList.add('busy');
    try {
      const res = await window.PSApi.activate(api.last.number, {
        vehicle: $('#fCar').value.trim(),
        plate:   $('#fPlate').value.trim(),
        vin:     $('#fVin').value.trim(),
        phone:   $('#fPhone').value.trim(),
        center:  $('#fCenter').value.trim(),
        date:    $('#fDate').value
      });
      api.last = res; api.cert = res;
      renderResult(res, true);
      renderCert(res);
      hide(pAct); hide(pRes); hide(pLook);
      show(pCert);
      setRail(3);
      rail.forEach(li => { if (+li.dataset.step === 3) li.classList.add('is-on'); });
      toast(t('toast.activated'), 'ok');
      if (hero) hero.ripple(0, 0, 2);
      scrollTo(pCert);
    } catch (err) {
      toast(err.message === 'already-active' ? t('msg.active') : t('msg.notfound'), 'err');
    } finally {
      btn.classList.remove('busy');
    }
  });

  /* ── certificate ── */
  function renderCert(res) {
    const P = res.product, a = res.activation || {};
    $('#certProduct').textContent = P.code;

    const rows = [
      ['spec.wn',        res.number, true],
      ['spec.years',     `${P.years} ${P.years > 10 ? t('unit.year') : t('unit.years')}`, false],
      ['spec.vehicle',   a.vehicle || '—', false],
      ['spec.plate',     a.plate   || '—', true],
      ['spec.vin',       a.vin     || '—', true],
      ['spec.center',    (LANG === 'en' ? (a.centerEn || a.center) : a.center) || '—', false],
      ['spec.activated', window.fmtDate(a.date, LANG), true],
      ['spec.expires',   window.fmtDate(res.expiresAt, LANG), true],
      ['spec.batch',     P.sku, true]
    ];
    $('#certGrid').innerHTML = rows.map(([k, v, m]) =>
      `<div><dt>${t(k)}</dt><dd class="${m ? 'mono' : ''}">${esc(v)}</dd></div>`).join('');

    const url = `${VERIFY_BASE}?w=${encodeURIComponent(res.number)}`;
    $('#certQr').innerHTML = window.QR ? window.QR.svg(url, { quiet:1 }) : '';
  }

  $('#certPrint').addEventListener('click', () => { toast(t('toast.printed')); setTimeout(() => print(), 400); });
  $('#certAgain').addEventListener('click', () => {
    hide(pCert); hide(pRes); hide(pAct);
    pLook.hidden = false;
    input.value = ''; clearFail();
    api.last = null; api.cert = null;
    setRail(1);
    sec.dataset.state = 'idle';
    actForm.reset();
    $('#fDate').value = new Date().toISOString().slice(0, 10);
    $$('.ff').forEach(f => f.classList.remove('bad'));
    scrollTo(pLook);
    setTimeout(() => input.focus({ preventScroll:true }), 600);
  });

  Object.assign(api, { check, renderResult, renderCert, fill: v => { input.value = v; }, focus: () => input.focus() });
  return api;
})();

function mk(tag, cls, text) { const e = document.createElement(tag); e.className = cls; e.textContent = text; return e; }

/* Arabic needs real dual/plural forms — "2 سنوات" is wrong, it is "سنتان". */
function yearWord(n) {
  if (LANG !== 'ar') return n === 1 ? t('unit.year') : t('unit.years');
  if (n === 1) return 'سنة';
  if (n === 2) return 'سنتان';
  if (n >= 3 && n <= 10) return 'سنوات';
  return 'سنة';
}
function monthWord(n) {
  if (LANG !== 'ar') return n === 1 ? 'month' : 'months';
  if (n === 1) return 'شهر';
  if (n === 2) return 'شهران';
  if (n >= 3 && n <= 10) return 'أشهر';
  return 'شهرًا';
}
function humanLeft(y, m) {
  const parts = [];
  if (y > 0) parts.push(LANG === 'ar' ? `${y} ${yearWord(y)}` : `${y} ${yearWord(y)}`);
  if (m > 0) parts.push(LANG === 'ar' ? `${m} ${monthWord(m)}` : `${m} ${monthWord(m)}`);
  if (!parts.length) return LANG === 'ar' ? 'أقل من شهر' : 'less than a month';
  return parts.join(LANG === 'ar' ? ' و' : ' · ');
}
function esc(s) { return String(s == null ? '—' : s)
  .replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;').replace(/"/g,'&quot;'); }

/* ─────────────────── 9. scanner ─────────────────── */
{
  const modal = $('#scanModal'), video = $('#scanVideo'), msg = $('#scanMsg');
  let stream = null, raf = 0, detector = null, open = false;

  const close = () => {
    open = false;
    modal.hidden = true;
    document.body.classList.remove('no-scroll');
    cancelAnimationFrame(raf);
    if (stream) { stream.getTracks().forEach(tr => tr.stop()); stream = null; }
    video.srcObject = null;
  };

  async function start() {
    open = true;
    modal.hidden = false;
    document.body.classList.add('no-scroll');
    msg.textContent = '';
    video.style.display = 'none';

    const Supported = 'BarcodeDetector' in window;
    if (!Supported || !navigator.mediaDevices?.getUserMedia) {
      msg.textContent = t('scan.unsupported');
      return;
    }
    try {
      const fmts = await window.BarcodeDetector.getSupportedFormats();
      if (!fmts.includes('qr_code')) { msg.textContent = t('scan.unsupported'); return; }
      detector = new window.BarcodeDetector({ formats: ['qr_code'] });

      stream = await navigator.mediaDevices.getUserMedia({
        video: { facingMode: { ideal: 'environment' }, width: { ideal: 1280 } }, audio: false
      });
      if (!open) { stream.getTracks().forEach(tr => tr.stop()); return; }
      video.srcObject = stream;
      video.style.display = 'block';
      await video.play();
      msg.textContent = '';
      loop();
    } catch (e) {
      msg.textContent = t('scan.denied');
    }
  }

  async function loop() {
    if (!open) return;
    try {
      const hits = await detector.detect(video);
      if (hits && hits.length) {
        const val = window.normalizeNumber(hits[0].rawValue);
        if (val) {
          close();
          Con.fill(val);
          toast(t('toast.scanned'), 'ok');
          Con.check(val);
          return;
        }
      }
    } catch {}
    raf = requestAnimationFrame(loop);
  }

  $('#scanBtn')?.addEventListener('click', start);
  $('#heroScan')?.addEventListener('click', () => {
    document.getElementById('console').scrollIntoView({ behavior: REDUCE ? 'auto' : 'smooth' });
    setTimeout(start, REDUCE ? 0 : 600);
  });
  $('#scanClose1')?.addEventListener('click', close);
  $('#scanClose2')?.addEventListener('click', close);
  addEventListener('keydown', e => { if (e.key === 'Escape' && open) close(); });
}

/* ─────────────────── 10. deep link ?w= ─────────────────── */
const Deep = {
  run() {
    let q = null;
    try { q = new URLSearchParams(location.search).get('w')
              || new URLSearchParams(location.search).get('warranty'); } catch {}
    if (!q) return;
    const n = window.normalizeNumber(q);
    Con.fill(n);
    setTimeout(() => {
      document.getElementById('console').scrollIntoView({ behavior: REDUCE ? 'auto' : 'smooth' });
      setTimeout(() => Con.check(n), REDUCE ? 0 : 700);
    }, 300);
  }
};

/* ─────────────────── 11. smooth in-page links ─────────────────── */
$$('a[href^="#"]').forEach(a => a.addEventListener('click', e => {
  const id = a.getAttribute('href');
  if (id.length < 2) return;
  const el = document.querySelector(id);
  if (!el) return;
  e.preventDefault();
  window.scrollTo({ top: el.getBoundingClientRect().top + scrollY - 80,
                    behavior: REDUCE ? 'auto' : 'smooth' });
}));

/* ─────────────────── boot ─────────────────── */
applyStrings();
fitTitle();   // applyStrings may have swapped in a different-length headline
})();
