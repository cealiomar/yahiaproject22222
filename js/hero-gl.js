/* ══════════════════════════════════════════════════════════════
   HERO — "liquid protection film"
   A single fullscreen fragment shader. A rippling, glossy sheet
   lies over the PS mark; the sheet's surface normal refracts the
   mark underneath, so moving the pointer literally warps the logo
   through the film. Click drops a ripple.
   Falls back silently to a CSS gradient if WebGL is unavailable.
   ══════════════════════════════════════════════════════════════ */

window.HeroGL = (function () {

const VERT = `
attribute vec2 aPos;
void main(){ gl_Position = vec4(aPos, 0.0, 1.0); }`;

const FRAG = `
precision highp float;

uniform vec2      uRes;
uniform float     uTime;
uniform vec2      uPtr;
uniform float     uPtrAmp;
uniform vec4      uRip[8];
uniform sampler2D uLogo;
uniform vec4      uLogoBox;
uniform float     uIntro;
uniform float     uLight;   /* 0 = dark theme, 1 = light theme */

const vec3 INK  = vec3(0.039, 0.039, 0.043);
const vec3 INK2 = vec3(0.086, 0.086, 0.100);
const vec3 LNK  = vec3(0.953, 0.941, 0.918);
const vec3 LNK2 = vec3(0.878, 0.859, 0.824);
const vec3 RED  = vec3(0.824, 0.176, 0.153);
const vec3 REDH = vec3(1.000, 0.298, 0.243);
const vec3 REDD = vec3(0.235, 0.052, 0.045);
const vec3 REDM = vec3(0.612, 0.114, 0.094);

float hash(vec2 p){
  p = fract(p * vec2(123.34, 456.21));
  p += dot(p, p + 45.32);
  return fract(p.x * p.y);
}
float vnoise(vec2 p){
  vec2 i = floor(p), f = fract(p);
  vec2 u = f * f * (3.0 - 2.0 * f);
  float a = hash(i);
  float b = hash(i + vec2(1.0, 0.0));
  float c = hash(i + vec2(0.0, 1.0));
  float d = hash(i + vec2(1.0, 1.0));
  return mix(mix(a, b, u.x), mix(c, d, u.x), u.y);
}
float fbm(vec2 p){
  float v = 0.0, a = 0.5;
  for (int i = 0; i < 4; i++){
    v += a * vnoise(p);
    p = p * 2.03 + vec2(1.7, 9.2);
    a *= 0.5;
  }
  return v;
}

/* the film's height field. warp is sampled once per fragment and
   shared across the 3 taps — the error is far below a pixel. */
float height(vec2 p, vec2 warp){
  float t = uTime;
  float h = fbm(p * 2.1 + 1.35 * warp + vec2(t * 0.018, 0.0));

  /* a slow swell so the sheet is never fully still */
  h += 0.10 * sin(p.x * 2.6 + t * 0.28) * cos(p.y * 2.1 - t * 0.21);

  /* the pointer pushes a soft bulge into the film */
  h += 0.17 * exp(-length(p - uPtr) * 4.2) * uPtrAmp;

  /* decaying concentric ripples */
  for (int i = 0; i < 8; i++){
    if (uRip[i].w <= 0.001) continue;
    float age = t - uRip[i].z;
    if (age < 0.0 || age > 2.6) continue;
    float d = length(p - uRip[i].xy);
    float w = sin(d * 30.0 - age * 8.5) * exp(-d * 5.5) * exp(-age * 1.75);
    h += w * uRip[i].w * 0.42;
  }
  return h;
}

void main(){
  vec2  uv  = gl_FragCoord.xy / uRes;
  float asp = uRes.x / uRes.y;
  vec2  p   = (uv - 0.5) * vec2(asp, 1.0);

  vec2 warp = vec2(
    fbm(p * 1.6 + vec2(0.0, uTime * 0.045)),
    fbm(p * 1.6 + vec2(4.7, 2.1) - uTime * 0.037)
  );

  float e  = 0.0035;
  float h0 = height(p, warp);
  float hx = height(p + vec2(e, 0.0), warp);
  float hy = height(p + vec2(0.0, e), warp);
  vec3  n  = normalize(vec3((h0 - hx) * 18.0, (h0 - hy) * 18.0, 1.0));

  /* mark under the film, displaced by the surface normal.
     kept small (~2%) so the logo stays legible instead of dissolving */
  vec2  luv    = (p - uLogoBox.xy) / uLogoBox.zw * 0.5 + 0.5;
  vec2  luvR   = luv + n.xy * 0.030;
  vec2  luvG   = luv + n.xy * 0.022;
  float inside = step(0.0, luvG.x) * step(luvG.x, 1.0)
               * step(0.0, luvG.y) * step(luvG.y, 1.0);
  float mark   = texture2D(uLogo, clamp(luvG, 0.001, 0.999)).a * inside;
  float markR  = texture2D(uLogo, clamp(luvR, 0.001, 0.999)).a * inside;

  /* lighting */
  vec3  L     = normalize(vec3(cos(uTime * 0.13) * 0.55,
                               0.42 + sin(uTime * 0.10) * 0.22, 0.82));
  vec3  V     = vec3(0.0, 0.0, 1.0);
  vec3  H     = normalize(L + V);
  float ndh   = max(dot(n, H), 0.0);
  float spec  = pow(ndh, 130.0);
  float sheen = pow(ndh, 12.0);
  float fres  = pow(1.0 - max(dot(n, V), 0.0), 3.4);

  /* the sheet itself */
  float body = smoothstep(-0.25, 1.05, h0);
  vec3  col  = mix(mix(INK, INK2, body), mix(LNK, LNK2, body), uLight);
  col += mix(REDD * 0.50, vec3(-0.02, -0.05, -0.06), uLight) * body;

  /* the mark, lit through the film */
  vec3 markDark = mix(REDD, RED,  0.30 + sheen * 1.5 + fres * 0.90);
  vec3 markLite = mix(REDM, REDH, 0.34 + sheen * 1.1 + fres * 0.55);
  vec3 markCol  = mix(markDark, markLite, uLight);
  markCol = mix(markCol, REDH, spec * 0.85 * (1.0 - uLight * 0.6));
  col = mix(col, markCol, mark * 0.95);
  col += vec3(0.11, 0.0, 0.0) * max(markR - mark, 0.0) * 2.2 * (1.0 - uLight);

  /* highlights — pulled right back on light, where they would blow out */
  float glossy = mix(1.0, 0.30, uLight);
  col += spec  * vec3(1.0, 0.87, 0.82) * (0.50 + mark * 0.75) * glossy;
  col += sheen * 0.055 * vec3(1.0, 0.72, 0.66) * glossy;
  col += fres  * RED * mix(0.20, 0.07, uLight);

  /* anisotropic film banding */
  col += (sin(p.y * 30.0 + h0 * 7.0 + uTime * 0.5) * 0.5 + 0.5)
         * mix(0.014, -0.010, uLight);

  /* a slow raking light across the sheet */
  float sw = smoothstep(0.42, 0.0,
             abs(fract((p.x * 0.28 + p.y * 0.10) - uTime * 0.055) - 0.5));
  col += sw * vec3(1.0, 0.85, 0.80) * mix(0.035, 0.016, uLight);

  /* vignette — darkens edges on dark, lifts them on light */
  float vig = smoothstep(1.45, 0.30, length(p * vec2(0.80, 1.15)));
  col *= mix(0.58 + 0.42 * vig, 0.92 + 0.08 * vig, uLight);

  /* intro wipe: fade up from the page colour, not from black */
  col = mix(mix(INK, LNK, uLight), col, uIntro);

  col += (hash(gl_FragCoord.xy + fract(uTime)) - 0.5) * 0.016;

  gl_FragColor = vec4(clamp(col, 0.0, 1.0), 1.0);
}`;

/* ─────────────────────────────────────────────── */

function compile(gl, type, src){
  const s = gl.createShader(type);
  gl.shaderSource(s, src);
  gl.compileShader(s);
  if (!gl.getShaderParameter(s, gl.COMPILE_STATUS)){
    console.warn('[HeroGL]', gl.getShaderInfoLog(s));
    return null;
  }
  return s;
}

function init(canvas, opts){
  opts = opts || {};
  const reduce = matchMedia('(prefers-reduced-motion: reduce)').matches;

  let gl;
  try {
    gl = canvas.getContext('webgl', { antialias:false, alpha:false, depth:false,
                                      powerPreference:'high-performance' })
      || canvas.getContext('experimental-webgl');
  } catch { return null; }
  if (!gl) return null;

  const vs = compile(gl, gl.VERTEX_SHADER, VERT);
  const fs = compile(gl, gl.FRAGMENT_SHADER, FRAG);
  if (!vs || !fs) return null;

  const prog = gl.createProgram();
  gl.attachShader(prog, vs); gl.attachShader(prog, fs);
  gl.bindAttribLocation(prog, 0, 'aPos');
  gl.linkProgram(prog);
  if (!gl.getProgramParameter(prog, gl.LINK_STATUS)){
    console.warn('[HeroGL]', gl.getProgramInfoLog(prog));
    return null;
  }
  gl.useProgram(prog);

  /* fullscreen triangle */
  const buf = gl.createBuffer();
  gl.bindBuffer(gl.ARRAY_BUFFER, buf);
  gl.bufferData(gl.ARRAY_BUFFER, new Float32Array([-1,-1, 3,-1, -1,3]), gl.STATIC_DRAW);
  gl.enableVertexAttribArray(0);
  gl.vertexAttribPointer(0, 2, gl.FLOAT, false, 0, 0);

  const U = n => gl.getUniformLocation(prog, n);
  const uRes = U('uRes'), uTime = U('uTime'), uPtr = U('uPtr'),
        uPtrAmp = U('uPtrAmp'), uRip = U('uRip[0]'), uLogo = U('uLogo'),
        uLogoBox = U('uLogoBox'), uIntro = U('uIntro'), uLight = U('uLight');

  /* logo texture — data URI, so it never taints the context */
  const tex = gl.createTexture();
  gl.bindTexture(gl.TEXTURE_2D, tex);
  gl.pixelStorei(gl.UNPACK_FLIP_Y_WEBGL, true);
  gl.pixelStorei(gl.UNPACK_PREMULTIPLY_ALPHA_WEBGL, false);
  gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, 1, 1, 0, gl.RGBA, gl.UNSIGNED_BYTE,
                new Uint8Array([0,0,0,0]));
  gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.CLAMP_TO_EDGE);
  gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.CLAMP_TO_EDGE);
  gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.LINEAR);
  gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.LINEAR);
  gl.uniform1i(uLogo, 0);

  let ready = false;
  const img = new Image();
  img.onload = () => {
    gl.bindTexture(gl.TEXTURE_2D, tex);
    gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, gl.RGBA, gl.UNSIGNED_BYTE, img);
    ready = true;
    if (opts.onReady) opts.onReady();
  };
  img.onerror = () => { ready = true; if (opts.onReady) opts.onReady(); };
  img.src = window.PS_LOGO_SRC;

  /* ── state ── */
  const RATIO = window.PS_LOGO_RATIO || 1.152;
  const rip   = new Float32Array(32);          // 8 × vec4
  let ripI    = 0;
  let scale   = reduce ? 1 : Math.min(devicePixelRatio || 1, 1.6);
  let W = 0, H = 0, asp = 1;
  let ptr = [0, 0], ptrT = [0, 0], ptrAmp = 0, ptrAmpT = 0;
  let boxX = 0, boxXT = 0, boxY = 0.13, halfH = 0.30;
  let intro = 0;
  const light0 = document.documentElement.dataset.theme === 'light' ? 1 : 0;
  let light = light0, lightT = light0;
  let dir = document.documentElement.dir === 'rtl' ? -1 : 1;
  let t0 = performance.now();
  let raf = 0, visible = true, running = false;

  /* adaptive quality: if the first second is heavy, drop resolution once */
  let frames = 0, acc = 0, tuned = reduce;

  function layout(){
    const r = canvas.getBoundingClientRect();
    W = Math.max(1, Math.round(r.width  * scale));
    H = Math.max(1, Math.round(r.height * scale));
    canvas.width = W; canvas.height = H;
    gl.viewport(0, 0, W, H);
    asp = W / H;

    const narrow = r.width < 820;
    halfH = narrow ? 0.20 : Math.min(0.31, 0.35 * Math.min(1, r.height / 720));
    const halfW = halfH * RATIO;
    boxY  = narrow ? 0.26 : 0.15;
    /* the headline sits at the inline-start edge, so the mark takes the
       opposite side: RTL text is right → mark left, LTR text left → mark right */
    /* 0.72 keeps it clear of the edge vignette, where it would be crushed */
    boxXT = narrow ? 0 : dir * (asp * 0.5 - halfW - 0.05) * 0.72;
    if (!running) boxX = boxXT;
  }

  function setDir(d){
    dir = d === 'rtl' ? -1 : 1;
    layout();
  }

  function setTheme(mode){ lightT = mode === 'light' ? 1 : 0; }

  function ripple(x, y, strength){
    const i = (ripI++ % 8) * 4;
    rip[i]   = x;
    rip[i+1] = y;
    rip[i+2] = (performance.now() - t0) / 1000;
    rip[i+3] = strength;
  }

  function toField(cx, cy){
    const r = canvas.getBoundingClientRect();
    return [((cx - r.left) / r.width - 0.5) * asp,
            (0.5 - (cy - r.top) / r.height)];
  }

  /* ── input ── */
  let lastRip = 0;
  function onMove(e){
    const c = e.touches ? e.touches[0] : e;
    const f = toField(c.clientX, c.clientY);
    ptrT = f; ptrAmpT = 1;
    const now = performance.now();
    if (!reduce && now - lastRip > 260){ lastRip = now; ripple(f[0], f[1], 0.5); }
  }
  function onLeave(){ ptrAmpT = 0; }
  function onDown(e){
    const c = e.touches ? e.touches[0] : e;
    const f = toField(c.clientX, c.clientY);
    ptrT = f; ptrAmpT = 1;
    ripple(f[0], f[1], 1.5);
  }

  const host = canvas.parentElement || canvas;
  host.addEventListener('pointermove', onMove, { passive:true });
  host.addEventListener('pointerdown', onDown, { passive:true });
  host.addEventListener('pointerleave', onLeave, { passive:true });

  const ro = new ResizeObserver(layout);
  ro.observe(canvas);

  const io = new IntersectionObserver(es => {
    visible = es[0].isIntersecting;
    if (visible) start(); else stop();
  }, { threshold: 0 });
  io.observe(canvas);

  document.addEventListener('visibilitychange', () => {
    if (document.hidden) stop(); else if (visible) start();
  });

  /* ── loop ── */
  let prevT = 0;
  function frame(now){
    raf = requestAnimationFrame(frame);
    const t = (now - t0) / 1000;

    /* frame-rate independent easing: a 0.075 "per 60Hz frame" rate held
       constant regardless of whether we run at 30, 60 or 144fps.
       dt is clamped so a paused/backgrounded tab cannot jump the state. */
    const dt = prevT ? Math.min(0.1, t - prevT) : 1 / 60;
    prevT = t;
    const ease = k => 1 - Math.pow(1 - k, dt * 60);

    ptr[0]  += (ptrT[0] - ptr[0]) * ease(0.075);
    ptr[1]  += (ptrT[1] - ptr[1]) * ease(0.075);
    ptrAmp  += (ptrAmpT - ptrAmp) * ease(0.06);
    boxX    += (boxXT - boxX)     * ease(0.06);
    intro   += ((ready ? 1 : 0) - intro) * ease(0.05);
    light   += (lightT - light)   * ease(0.08);

    gl.uniform2f(uRes, W, H);
    gl.uniform1f(uTime, reduce ? 4.2 : t);
    gl.uniform2f(uPtr, ptr[0], ptr[1]);
    gl.uniform1f(uPtrAmp, ptrAmp);
    gl.uniform4fv(uRip, rip);
    gl.uniform4f(uLogoBox, boxX, boxY, halfH * RATIO, halfH);
    gl.uniform1f(uIntro, Math.min(1, intro * 1.06));
    gl.uniform1f(uLight, light);
    gl.drawArrays(gl.TRIANGLES, 0, 3);

    /* a theme change still needs a few frames to cross-fade */
    if (reduce && Math.abs(lightT - light) > 0.004) return;
    if (reduce){ stop(); return; }

    /* one-shot quality tune */
    if (!tuned){
      acc += now - (frame.prev || now); frame.prev = now;
      if (++frames > 70){
        tuned = true;
        if (acc / frames > 23 && scale > 0.8){ scale = Math.max(0.75, scale * 0.65); layout(); }
      }
    }
  }

  function start(){ if (!running){ running = true; frame.prev = 0; raf = requestAnimationFrame(frame); } }
  function stop(){ running = false; cancelAnimationFrame(raf); }

  layout();
  start();

  return {
    setDir,
    setTheme(mode){ setTheme(mode); start(); },
    ripple,
    destroy(){ stop(); ro.disconnect(); io.disconnect();
               host.removeEventListener('pointermove', onMove);
               host.removeEventListener('pointerdown', onDown);
               host.removeEventListener('pointerleave', onLeave); }
  };
}

return { init };
})();
