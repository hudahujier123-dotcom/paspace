(function () {
  'use strict';
  var root = document.documentElement;
  root.classList.add('js');
  var D2R = Math.PI / 180, TAU = Math.PI * 2;
  var mqReduce = window.matchMedia('(prefers-reduced-motion: reduce)');
  var reduce = mqReduce.matches;

  /* ---------- سنة الفوتر ---------- */
  var yr = document.getElementById('yr');
  if (yr) yr.textContent = new Date().getFullYear();

  /* ---------- بطاقات الأعمال ---------- */
  var KINDS = {
    web:    ['i-web', 'موقع إلكتروني'],
    app:    ['i-app', 'تطبيق جوال'],
    edu:    ['i-edu', 'تطبيق تعليمي'],
    travel: ['i-travel', 'تطبيق سفر'],
    video:  ['i-video', 'إعلان مرئي']
  };
  function esc(s) { return String(s).replace(/[&<>"']/g, function (c) { return { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]; }); }
  function icon(id) { return '<svg class="ic" aria-hidden="true"><use href="#' + id + '"/></svg>'; }
  function workCard(w, i) {
    var k = KINDS[w.icon] || KINDS.web;
    var eng = w.type === 'eng';
    var cta = eng ? 'زيارة' : 'مشاهدة';
    var link = '<a class="btn btn--ghost btn--sm" href="' + esc(w.url) + '" target="_blank" rel="noopener" aria-label="' + cta + ' ' + esc(w.title) + '">' + cta + icon('i-arrow') + '</a>';
    var el = document.createElement('article');
    el.className = 'work glass rv ' + (eng ? 'work--eng' : 'work--reel');
    el.style.setProperty('--d', (i * 90) + 'ms');
    el.innerHTML = eng
      ? '<span class="work-ic">' + icon(k[0]) + '</span><div class="work-txt"><span class="work-kind">' + k[1] + '</span><h4>' + esc(w.title) + '</h4></div>' + link
      : '<span class="work-ic">' + icon(k[0]) + '</span><h4>' + esc(w.title) + '</h4>' + link;
    return el;
  }
  var gEng = document.getElementById('cardsEng'), gCon = document.getElementById('cardsContent');
  var nE = 0, nC = 0;
  WORKS.forEach(function (w) {
    if (w.type === 'eng') gEng.appendChild(workCard(w, nE++));
    else gCon.appendChild(workCard(w, nC++));
  });

  /* ---------- التنقل ---------- */
  var links = document.getElementById('links'), menuBtn = document.getElementById('menuBtn');
  function setMenu(open) { links.classList.toggle('open', open); menuBtn.setAttribute('aria-expanded', open ? 'true' : 'false'); }
  menuBtn.addEventListener('click', function () { setMenu(!links.classList.contains('open')); });
  document.addEventListener('keydown', function (e) { if (e.key === 'Escape') setMenu(false); });
  document.addEventListener('click', function (e) {
    var a = e.target.closest ? e.target.closest('a[href^="#"]') : null;
    if (!a) return;
    var id = a.getAttribute('href').slice(1);
    var target = id && document.getElementById(id);
    if (!target) return;
    e.preventDefault();
    setMenu(false);
    target.scrollIntoView({ behavior: reduce ? 'auto' : 'smooth', block: 'start' });
  });
  var secs = ['home', 'about', 'services', 'work', 'contact'].map(function (id) { return document.getElementById(id); });
  var navLinks = [].slice.call(links.querySelectorAll('a'));
  function setActive(id) {
    navLinks.forEach(function (a) { if (a.dataset.sec === id) a.setAttribute('aria-current', 'true'); else a.removeAttribute('aria-current'); });
  }
  setActive('home');
  if ('IntersectionObserver' in window) {
    var spy = new IntersectionObserver(function (es) {
      es.forEach(function (en) { if (en.isIntersecting) setActive(en.target.id); });
    }, { rootMargin: '-45% 0px -50% 0px' });
    secs.forEach(function (s) { if (s) spy.observe(s); });
  }

  /* ---------- ظهور تدريجي عند التمرير ---------- */
  var rvEls = [].slice.call(document.querySelectorAll('.rv'));
  if ('IntersectionObserver' in window) {
    var io = new IntersectionObserver(function (es) {
      es.forEach(function (en) { if (en.isIntersecting) { en.target.classList.add('in'); io.unobserve(en.target); } });
    }, { rootMargin: '0px 0px -8% 0px', threshold: 0.08 });
    rvEls.forEach(function (el) { io.observe(el); });
  } else {
    rvEls.forEach(function (el) { el.classList.add('in'); });
  }

  /* ---------- توهج البطاقات مع المؤشر ---------- */
  document.addEventListener('pointermove', function (e) {
    var g = e.target.closest ? e.target.closest('.glass') : null;
    if (!g) return;
    var r = g.getBoundingClientRect();
    g.style.setProperty('--mx', (e.clientX - r.left) + 'px');
    g.style.setProperty('--my', (e.clientY - r.top) + 'px');
  }, { passive: true });

  /* ---------- حقل النجوم ---------- */
  var cv = document.createElement('canvas');
  cv.id = 'sky'; cv.setAttribute('aria-hidden', 'true');
  var ph = document.getElementById('sky-placeholder');
  ph.parentNode.replaceChild(cv, ph);
  var cx = cv.getContext('2d');
  var W = 0, H = 0, DPR = 1, stars = [];
  var COLORS = ['#ffffff', '#bcd4ff', '#d9c4ff', '#a8f0ff'];
  var LAYERS = [
    { r: [.35, .75], a: [.25, .6],  vx: 1.5, par: .02, twp: .25 },
    { r: [.65, 1.15], a: [.4, .8],  vx: 4,   par: .06, twp: .35 },
    { r: [1, 1.7],   a: [.55, .95], vx: 9,   par: .14, twp: .5 }
  ];
  function pickColor() { var r = Math.random(); return r < .6 ? 0 : r < .78 ? 1 : r < .91 ? 2 : 3; }
  function seedStars() {
    var count = Math.round(Math.min(560, Math.max(190, W * H / 4300)));
    stars = [];
    for (var i = 0; i < count; i++) {
      var q = Math.random(), L = LAYERS[q < .58 ? 0 : q < .88 ? 1 : 2];
      stars.push({
        x: Math.random() * W, y: Math.random() * H,
        r: L.r[0] + Math.random() * (L.r[1] - L.r[0]),
        a: L.a[0] + Math.random() * (L.a[1] - L.a[0]),
        vx: L.vx * (.7 + Math.random() * .6), par: L.par,
        tw: Math.random() < L.twp ? .35 + Math.random() * .5 : 0,
        ts: .6 + Math.random() * 1.8, ph: Math.random() * TAU, c: pickColor()
      });
    }
    stars.sort(function (a, b) { return a.c - b.c; });
  }
  function sizeSky(force) {
    var nw = window.innerWidth, nh = window.innerHeight;
    var reseed = force || !W || Math.abs(nw - W) > 40;
    DPR = Math.min(window.devicePixelRatio || 1, 2);
    W = nw; H = nh;
    cv.width = Math.round(W * DPR); cv.height = Math.round(H * DPR);
    cx.setTransform(DPR, 0, 0, DPR, 0, 0);
    if (reseed) seedStars();
  }
  function drawSky(t) {
    cx.clearRect(0, 0, W, H);
    var sy = reduce ? 0 : window.scrollY, last = -1;
    for (var i = 0; i < stars.length; i++) {
      var s = stars[i], x, y, a = s.a;
      if (reduce) { x = s.x; y = s.y; }
      else {
        x = ((s.x - t * s.vx) % W + W) % W;
        y = (((s.y - t * s.vx * .25 - sy * s.par) % H) + H) % H;
        if (s.tw) a *= 1 - s.tw + s.tw * (.5 + .5 * Math.sin(t * s.ts + s.ph));
      }
      if (s.c !== last) { cx.fillStyle = COLORS[s.c]; last = s.c; }
      cx.globalAlpha = a;
      cx.beginPath(); cx.arc(x, y, s.r, 0, TAU); cx.fill();
      if (s.r > 1.25) { cx.globalAlpha = a * .18; cx.beginPath(); cx.arc(x, y, s.r * 3, 0, TAU); cx.fill(); }
    }
    cx.globalAlpha = 1;
  }

  /* ---------- الكرة الأرضية (SVG بإسقاط حقيقي) ---------- */
  var LAND = [
    // أوراسيا
    [[-9.5,37],[-9,43],[-1.5,43.4],[-1.2,46],[-4.5,48.3],[-1.5,49.5],[1.5,50.8],[4.5,52.5],[8.5,54],[8.5,57],[10.5,57.6],[10.5,55],[12,54.2],[14,54.5],[18.5,54.6],[21,56.5],[24,57.5],[23.5,59.5],[28,60],[30,60.2],[24,60.5],[21.5,61.5],[21.5,64.5],[25,65.5],[22,65.8],[17.5,62.5],[18.5,59.7],[16.5,57],[13,55.5],[11.5,58.8],[8,58],[5,59],[5,62],[11,65],[15,68],[20,70],[28,71.2],[33,69.5],[41,67],[41,66.2],[44,68.5],[54,68.5],[60,69.5],[66,69],[69,73],[76,72],[80,73],[87,75],[100,77],[105,78],[113,74],[120,73],[130,71],[140,72],[150,71.5],[160,70],[170,70],[179.5,69],[179.5,65.5],[174,64.5],[170,60],[164,59.5],[163,57],[160,54],[156.5,51],[156,53],[155.5,57],[158,59.5],[155,59.5],[150,59.5],[143,59],[137,54.5],[141,52.5],[140,48],[135,43.5],[130,42.5],[129.5,41],[128,38],[129.3,35.5],[126.5,34.5],[126.5,37.5],[125,39.5],[121.5,40.5],[121,38.8],[118,39],[120,37],[122.5,37],[119,35],[121.5,32],[122,30],[120,27],[117,23.5],[114,22.3],[110,21],[108,21.5],[106,19],[108,15],[109,11.5],[105,8.7],[104,10.5],[100.5,13.2],[99.5,10],[100.5,7],[103,5],[104,1.5],[101,3],[100,6],[98.5,8],[98,12],[97.5,16.5],[94.5,16],[94,19],[92,21.5],[91,22.5],[88,21.8],[86.5,20],[84.5,18.5],[80.5,15.5],[80,13],[79.5,10.3],[77.5,8.1],[76,10.5],[74.5,15],[73,18],[72.8,21],[70,21],[68.5,23.5],[66.5,25.3],[62,25.2],[57,25.7],[56.5,27],[53,27],[51,28.5],[50,30],[48,30],[48.5,28.5],[50.5,26],[51.5,24.5],[54,24],[56,26],[56.4,24.5],[58.5,23.5],[59.5,22.3],[57,19],[55,17],[52,16],[49,14.2],[45,12.8],[43.3,12.7],[42.8,15.5],[41,19],[39,21.5],[37,25],[35,28],[34.5,29.5],[34.2,31.2],[35,33],[36,35.5],[36,36.7],[34,36.2],[30,36.2],[27.5,37],[26.5,38.5],[26.2,40],[28.5,41],[29.5,41.2],[26.5,40.5],[24,40.8],[23.5,40],[24,38],[22.5,36.5],[21.5,37.5],[21,39],[19.5,41],[19,42.5],[15.5,44.5],[13.5,45.6],[12.3,44.5],[14,42.3],[16,41.5],[18.5,40.2],[17,39],[16.5,38],[15.7,38],[16,39.5],[15.5,40],[14,40.7],[12.5,41.5],[10.5,43],[8.8,44.3],[6.5,43.2],[4,43.5],[3.2,42.4],[0.5,40.5],[-0.5,38.5],[-2,36.8],[-5.2,36.1],[-6.3,36.7],[-8.8,37.2]],
    // أفريقيا
    [[-5.9,35.8],[-2,35.1],[0,35.8],[3,36.8],[8,37],[10,37.2],[11,35.5],[10.2,34],[11,33.2],[15,32.3],[19,30.3],[20.2,32.2],[22,32.9],[25,31.8],[29,30.9],[32,31.2],[32.6,29.9],[34,27],[35.5,24],[37.2,21],[38.5,18],[40,15.5],[42.5,13],[43.2,11.7],[44.5,10.4],[48,11.2],[51.2,11.8],[50.8,10],[48.5,6],[46,2.5],[43,-1],[41,-2],[40,-4.5],[39,-8],[40.5,-11.5],[40.7,-15],[37,-18],[35,-20],[35.5,-24],[32.8,-26],[32.5,-28.5],[30,-31.5],[27,-33.5],[22,-34.2],[19,-34.7],[18.4,-34],[17.8,-31.5],[16.5,-28.5],[15,-26],[14,-22.5],[12,-18],[13.5,-12],[13,-9],[12,-5.5],[9.5,-1],[9.7,2],[9,4],[6,4.3],[4.5,6],[1.5,6],[-2,4.8],[-5,5],[-8,4.5],[-11,6.5],[-13.5,9.5],[-15.5,11.5],[-17,14.7],[-16.5,18.5],[-16,21],[-14.5,25],[-12.5,28],[-10,29.8],[-9.5,32],[-6.5,34]],
    // أمريكا الشمالية
    [[-166,68.5],[-156,71.3],[-141,69.7],[-128,70.3],[-115,68.5],[-108,68],[-98,68],[-95,71.5],[-90,69],[-85,69.5],[-82,66.5],[-86,64],[-93,61.5],[-94.5,59],[-92.5,57],[-86,55.5],[-82,52.8],[-80,51.5],[-79.5,54.5],[-77,56],[-78,59.5],[-77.5,62.3],[-73,62],[-69.5,59.5],[-65,60],[-61.5,56.5],[-58,54],[-56,52],[-59,50.5],[-65,50],[-68,49.2],[-65,48.5],[-64.5,47],[-61.5,45.8],[-65,43.7],[-67,44.7],[-70,43.7],[-70.7,42.6],[-71,41.5],[-74,40.5],[-75.5,38.5],[-76,37],[-75.5,35.2],[-78,34],[-79.5,32.7],[-81,31],[-81,29],[-80,26.7],[-80.3,25.2],[-81.2,25.3],[-82.7,27.7],[-83,29.5],[-85,29.7],[-87.5,30.3],[-89.5,30.1],[-91,29.2],[-93.5,29.7],[-95.5,28.8],[-97.3,26.5],[-97.7,23.5],[-97.2,21],[-96.2,19],[-94.5,18.2],[-91.5,18.5],[-90.5,21],[-87,21.5],[-87.5,18.5],[-88.3,16],[-86,15.8],[-83.3,15.1],[-83.5,12],[-83.8,10.5],[-82,9],[-80,9],[-79,9.5],[-77.5,8.7],[-77.3,7.5],[-78,7.2],[-79.7,8.3],[-80.5,7.5],[-81.5,8.2],[-83.5,8.5],[-85.8,10],[-87.5,13],[-90.5,13.8],[-92.5,14.7],[-94.5,16],[-97,15.8],[-100,16.8],[-102,18],[-105,19.8],[-105.5,22],[-108,25],[-110.5,27.5],[-112.8,31],[-114.8,31.8],[-114.7,30.2],[-112.8,27.3],[-111,25],[-109.5,23.2],[-110.5,23.5],[-112,24.8],[-114.5,27.5],[-115.7,29.5],[-116.7,31.5],[-117.2,32.6],[-118.5,34],[-120.6,34.6],[-121.9,36.6],[-122.5,37.8],[-124,40],[-124.5,42.5],[-124,46],[-124.7,48.3],[-125,49],[-127.5,51],[-130,54],[-133,56.5],[-136,58.5],[-140,59.8],[-144,60],[-148,60.3],[-151.5,59.2],[-154,57.5],[-158,56.5],[-162,55],[-164.8,54.6],[-160,57.2],[-158,58.7],[-162,59.8],[-165,60.8],[-165,62.5],[-161,64.5],[-166,65.5],[-168,66.5]],
    // أمريكا الجنوبية
    [[-77.3,8.6],[-75.5,10.8],[-72,12],[-71,11],[-68,10.6],[-64,10.5],[-61,10.7],[-60,8.5],[-57,6],[-53,5.5],[-51,4.5],[-50,1.5],[-50,-0.5],[-48,-1],[-44.5,-2.5],[-41,-3],[-38,-4],[-35.2,-5.5],[-34.8,-8],[-37,-11.5],[-39,-14],[-39,-18],[-40.5,-21],[-42,-23],[-45,-23.8],[-48.5,-26],[-48.7,-28.5],[-50.5,-31],[-53,-34],[-55,-35],[-57.5,-34.5],[-58.4,-34.8],[-57,-36.5],[-57.5,-38.5],[-62,-39],[-62.5,-41],[-65,-41],[-64.5,-43],[-67,-46],[-66,-48],[-68.5,-50.2],[-69,-52.3],[-68.5,-54.5],[-72,-54],[-74,-51],[-75.5,-48],[-74,-44],[-73.5,-40],[-73.5,-37],[-71.7,-33],[-71.5,-30],[-70.5,-24],[-70.3,-18.5],[-75,-15.5],[-77.5,-11.5],[-79.5,-7.5],[-81,-5.7],[-80.3,-3],[-80.2,-1],[-79.8,1.5],[-78.5,2.8],[-77.5,4.5],[-77.3,6.5]],
    // أستراليا
    [[114,-22],[122,-18],[130,-12],[136,-12],[137,-16],[142,-11],[146,-19],[153,-26],[151,-34],[147,-38],[140,-38],[135,-34],[130,-32],[123,-34],[115,-34],[113,-26]],
    // غرينلاند
    [[-73,78],[-60,82],[-30,83],[-20,80],[-20,72],[-24,68],[-40,65],[-44,60],[-50,62],[-54,67],[-58,75]],
    // جزر
    [[-5,50],[1,51],[2,53],[-2,56],[-3,58.5],[-6,58],[-5,55],[-3,54],[-5,52]],
    [[-10,52],[-6,52],[-6,55],[-9,55]],
    [[-24,65.5],[-22,66.3],[-16,66.4],[-13.5,65],[-18,63.4],[-22.5,63.8]],
    [[130,31],[132,34],[136,34],[140,36],[142,40],[141,45],[145,44],[142,42],[140,38],[136,36],[132,35],[130,33]],
    [[95,5],[98,4],[104,-2],[106,-6],[101,-3]],
    [[109,1],[117,7],[119,1],[116,-4],[110,-3]],
    [[105,-6],[114,-7],[114,-8.5],[106,-7]],
    [[131,-1],[141,-3],[150,-10],[143,-9],[138,-8],[132,-4]],
    [[44,-25],[47,-25],[50,-15],[49,-12],[44,-17]],
    [[172,-34],[178,-38],[175,-41],[172,-41]],
    [[172,-41],[174,-42],[170,-46],[167,-46]],
    [[80,9.8],[81.8,7.5],[80.5,6],[79.8,8]],
    [[120.5,18.5],[122,18],[122,14],[120.5,14.5]],
    [[-85,22],[-82,23.2],[-78,22.5],[-74.3,20.2],[-77.5,20],[-80,21.8],[-83.5,22.4]],
    [[-59,47.6],[-55,47.5],[-53,46.7],[-52.8,49],[-55.5,51.5],[-59,48.5]],
    [[-80,73.5],[-70,73],[-62,66.5],[-65,63],[-72,64],[-78,64.5],[-73,68],[-80,70]]
  ];
  var CITIES = [[31.2,30],[-0.1,51.5],[2.3,48.9],[13.4,52.5],[-3.7,40.4],[12.5,41.9],[29,41],[37.6,55.8],[55.3,25.2],[46.7,24.7],[51.4,35.7],[72.9,19.1],[77.2,28.6],[90.4,23.8],[100.5,13.8],[103.8,1.35],[106.8,-6.2],[114.2,22.3],[121.5,31.2],[116.4,39.9],[127,37.6],[139.7,35.7],[151.2,-33.9],[145,-37.8],[3.4,6.5],[36.8,-1.3],[28,-26.2],[18.4,-33.9],[-7.6,33.6],[38.7,9],[32.5,15.6],[15.3,-4.3],[-74,40.7],[-87.6,41.9],[-118.2,34],[-95.4,29.8],[-79.4,43.7],[-99.1,19.4],[-74.1,4.7],[-77,-12],[-46.6,-23.5],[-58.4,-34.6],[-70.7,-33.4],[-80.2,25.8],[-123,49.3],[44.4,33.3],[67,24.9],[39.2,21.5],[35.9,32],[3,36.7]];
  var JIT = [[0, 0], [1.6, .9], [-1.2, -1.4]];

  function vec(lon, lat) { var l = lon * D2R, p = lat * D2R, c = Math.cos(p); return [c * Math.cos(l), c * Math.sin(l), Math.sin(p)]; }
  function densify(poly, step) {
    var out = [], n = poly.length;
    for (var i = 0; i < n; i++) {
      var a = poly[i], b = poly[(i + 1) % n];
      var d = Math.max(Math.abs(b[0] - a[0]), Math.abs(b[1] - a[1]));
      var m = Math.max(1, Math.ceil(d / step));
      for (var k = 0; k < m; k++) out.push([a[0] + (b[0] - a[0]) * k / m, a[1] + (b[1] - a[1]) * k / m]);
    }
    return out;
  }
  function ccw(poly) {
    var s = 0, n = poly.length;
    for (var i = 0; i < n; i++) { var a = poly[i], b = poly[(i + 1) % n]; s += a[0] * b[1] - b[0] * a[1]; }
    return s < 0 ? poly.slice().reverse() : poly;
  }
  function rng(seed) { return function () { seed |= 0; seed = seed + 0x6D2B79F5 | 0; var t = Math.imul(seed ^ seed >>> 15, 1 | seed); t = t + Math.imul(t ^ t >>> 7, 61 | t) ^ t; return ((t ^ t >>> 14) >>> 0) / 4294967296; }; }

  var landV = LAND.map(function (p) { return densify(ccw(p), 4).map(function (q) { return vec(q[0], q[1]); }); });
  var rand = rng(7), cloudV = [];
  for (var ci = 0; ci < 18; ci++) {
    var clon = rand() * 360 - 180, clat = rand() * 110 - 52, rx = 4 + rand() * 9, ry = 1.4 + rand() * 3, poly = [];
    for (var k = 0; k < 14; k++) { var ang = k / 14 * TAU, nz = .8 + rand() * .4; poly.push([clon + Math.cos(ang) * rx * nz, clat + Math.sin(ang) * ry * nz]); }
    cloudV.push(ccw(poly).map(function (q) { return vec(q[0], q[1]); }));
  }
  var cityV = CITIES.map(function (c) { return JIT.map(function (j) { return vec(c[0] + j[0], c[1] + j[1]); }); });

  var GR = 215, GCX = 320, GCY = 320, PHI0 = 20 * D2R;
  var SUN = (function () { var v = [-.55, .5, .68], l = Math.hypot(v[0], v[1], v[2]); return [v[0] / l, v[1] / l, v[2] / l]; })();
  var bx = new Float32Array(4096), by = new Float32Array(4096), bz = new Float32Array(4096);
  function basis(l0) {
    var sl = Math.sin(l0), cl = Math.cos(l0), sp = Math.sin(PHI0), cp = Math.cos(PHI0);
    return { e: [-sl, cl, 0], u: [-sp * cl, -sp * sl, cp], w: [cp * cl, cp * sl, sp] };
  }
  function rnd(v) { return Math.round(v * 10) / 10; }
  function toD(p) {
    var s = 'M' + rnd(GCX + p[0] * GR) + ' ' + rnd(GCY - p[1] * GR);
    for (var i = 2; i < p.length; i += 2) s += 'L' + rnd(GCX + p[i] * GR) + ' ' + rnd(GCY - p[i + 1] * GR);
    return s + 'Z';
  }
  function limbCross(a, b) {
    var t = bz[a] / (bz[a] - bz[b]);
    var x = bx[a] + (bx[b] - bx[a]) * t, y = by[a] + (by[b] - by[a]) * t, l = Math.hypot(x, y) || 1;
    return [x / l, y / l];
  }
  function polyD(P, B) {
    var n = P.length, vis = 0, e = B.e, u = B.u, w = B.w, i, j;
    for (i = 0; i < n; i++) {
      var p = P[i];
      bx[i] = p[0] * e[0] + p[1] * e[1] + p[2] * e[2];
      by[i] = p[0] * u[0] + p[1] * u[1] + p[2] * u[2];
      bz[i] = p[0] * w[0] + p[1] * w[1] + p[2] * w[2];
      if (bz[i] >= 0) vis++;
    }
    if (!vis) return '';
    var all = [];
    if (vis === n) {
      for (i = 0; i < n; i++) all.push(bx[i], by[i]);
      return toD(all);
    }
    var s = 0;
    for (i = 0; i < n; i++) { if (bz[i] >= 0 && bz[(i + n - 1) % n] < 0) { s = i; break; } }
    var chains = [], cur = null;
    for (var k = 0; k < n; k++) {
      i = (s + k) % n; j = (i + 1) % n;
      if (bz[i] < 0) continue;
      var pi = (i + n - 1) % n, c;
      if (bz[pi] < 0) {
        c = limbCross(pi, i);
        cur = { pts: [c[0], c[1]], aN: Math.atan2(c[1], c[0]), aE: 0, used: false };
        chains.push(cur);
      }
      cur.pts.push(bx[i], by[i]);
      if (bz[j] < 0) {
        c = limbCross(i, j);
        cur.pts.push(c[0], c[1]);
        cur.aE = Math.atan2(c[1], c[0]);
      }
    }
    var d = '';
    for (var ci = 0; ci < chains.length; ci++) {
      if (chains[ci].used) continue;
      var out = [], ch = chains[ci], guard = 0;
      while (ch && !ch.used && guard++ <= chains.length) {
        ch.used = true;
        for (var q = 0; q < ch.pts.length; q++) out.push(ch.pts[q]);
        var best = null, bd = 1e9;
        for (var m = 0; m < chains.length; m++) {
          var dd = chains[m].aN - ch.aE;
          if (dd < -.02) dd += TAU; else if (dd < 0) dd = 0;
          if (dd < bd) { bd = dd; best = chains[m]; }
        }
        var steps = Math.ceil(bd / .12);
        for (var st = 1; st < steps; st++) { var aa = ch.aE + bd * st / steps; out.push(Math.cos(aa), Math.sin(aa)); }
        ch = best;
      }
      if (out.length >= 6) d += toD(out);
    }
    return d;
  }

  var elLand = document.getElementById('eLandPath'), elCloud = document.getElementById('eCloudPath');
  var L = {
    nb: [document.getElementById('lNB'), document.getElementById('lNBg')],
    db: [document.getElementById('lDB'), document.getElementById('lDBg')],
    ns: [document.getElementById('lNS')], ds: [document.getElementById('lDS')]
  };
  function setD(list, d) { for (var i = 0; i < list.length; i++) list[i].setAttribute('d', d); }
  var L0 = -32 * D2R, SPEED = 1.7 * D2R;

  function updateGlobe(t) {
    var l0 = L0 - t * SPEED, B = basis(l0), Bc = basis(l0 - t * .5 * D2R - 0.3), d = '', c = '', i;
    for (i = 0; i < landV.length; i++) d += polyD(landV[i], B);
    for (i = 0; i < cloudV.length; i++) c += polyD(cloudV[i], Bc);
    elLand.setAttribute('d', d); elCloud.setAttribute('d', c);
    var nb = '', ns = '', db = '', ds = '';
    for (i = 0; i < cityV.length; i++) {
      for (var k = 0; k < 3; k++) {
        var p = cityV[i][k];
        var z = p[0] * B.w[0] + p[1] * B.w[1] + p[2] * B.w[2];
        if (z < .06) continue;
        var x = p[0] * B.e[0] + p[1] * B.e[1] + p[2] * B.e[2];
        var y = p[0] * B.u[0] + p[1] * B.u[1] + p[2] * B.u[2];
        var lit = x * SUN[0] + y * SUN[1] + z * SUN[2];
        if (lit > .5) continue;
        var seg = 'M' + rnd(GCX + x * GR) + ' ' + rnd(GCY - y * GR) + 'h.1', night = lit < .18;
        if (k === 0) { if (night) nb += seg; else db += seg; } else { if (night) ns += seg; else ds += seg; }
      }
    }
    setD(L.nb, nb); setD(L.db, db); setD(L.ns, ns); setD(L.ds, ds);
  }

  /* ---------- أجرام تدور (قمر الأرض + قمر الكوكب ذي الحلقة) ---------- */
  function mkOrbit(o) {
    var front = document.getElementById(o.front), back = document.getElementById(o.back);
    return function (t) {
      var th = o.phase + t * o.speed, s = Math.sin(th), a = o.tilt * D2R;
      var x = o.rx * Math.cos(th), y = o.ry * s;
      var X = o.cx + x * Math.cos(a) - y * Math.sin(a), Y = o.cy + x * Math.sin(a) + y * Math.cos(a);
      var tr = 'translate(' + X.toFixed(1) + ' ' + Y.toFixed(1) + ') scale(' + (1 + .14 * s).toFixed(3) + ')';
      front.setAttribute('transform', tr); back.setAttribute('transform', tr);
      front.style.display = s > 0 ? '' : 'none'; back.style.display = s > 0 ? 'none' : '';
    };
  }
  var orbEarth = mkOrbit({ front: 'moonFront', back: 'moonBack', cx: 320, cy: 320, rx: 300, ry: 64, tilt: -18, speed: .16, phase: 2.2 });
  var orbRing = mkOrbit({ front: 'aMoonFront', back: 'aMoonBack', cx: 190, cy: 160, rx: 150, ry: 46, tilt: -16, speed: .3, phase: 0.6 });

  /* ---------- بارالاكس العناصر ---------- */
  var pars = [].slice.call(document.querySelectorAll('.par[data-speed]')).map(function (el) {
    return { el: el, host: el.parentElement, k: parseFloat(el.dataset.speed) || 0 };
  });
  var lastScroll = -1, vh = window.innerHeight;
  function updateParallax(force) {
    var sy = window.scrollY;
    if (!force && sy === lastScroll) return;
    lastScroll = sy;
    for (var i = 0; i < pars.length; i++) {
      var p = pars[i], r = p.host.getBoundingClientRect();
      if (r.bottom < -vh || r.top > vh * 2) continue;
      var off = (r.top + r.height / 2 - vh / 2) * p.k;
      p.el.style.setProperty('--py', off.toFixed(1) + 'px');
    }
  }

  /* ---------- حلقة الرسم ---------- */
  var earthOn = true, aboutOn = true, raf = 0, lastGlobe = 0;
  if ('IntersectionObserver' in window) {
    new IntersectionObserver(function (es) { earthOn = es[es.length - 1].isIntersecting; }).observe(document.getElementById('earth'));
    new IntersectionObserver(function (es) { aboutOn = es[es.length - 1].isIntersecting; }).observe(document.querySelector('.ringed'));
  }
  function loop(now) {
    var t = now / 1000;
    drawSky(t);
    updateParallax(false);
    if (earthOn) {
      orbEarth(t);
      if (now - lastGlobe > 32) { lastGlobe = now; updateGlobe(t); }
    }
    if (aboutOn) orbRing(t);
    raf = requestAnimationFrame(loop);
  }
  function renderStatic() {
    drawSky(0); updateGlobe(0); orbEarth(0); orbRing(0);
  }
  function start() {
    cancelAnimationFrame(raf);
    if (reduce) { renderStatic(); return; }
    updateParallax(true);
    raf = requestAnimationFrame(loop);
  }
  sizeSky(true);
  start();

  var rt = 0;
  window.addEventListener('resize', function () {
    clearTimeout(rt);
    rt = setTimeout(function () { vh = window.innerHeight; sizeSky(false); if (reduce) renderStatic(); else updateParallax(true); }, 120);
  });
  var onMq = function () {
    reduce = mqReduce.matches;
    if (reduce) pars.forEach(function (p) { p.el.style.removeProperty('--py'); });
    start();
  };
  if (mqReduce.addEventListener) mqReduce.addEventListener('change', onMq); else if (mqReduce.addListener) mqReduce.addListener(onMq);
})();
