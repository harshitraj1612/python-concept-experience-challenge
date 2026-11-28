/*!
 * flower-bg.js — adds the 3D crystalline flower animation to a page.
 *   1. Background: a fixed, translucent flower behind all page content (every page).
 *   2. Hero panel: the full neon version on a black canvas (home page only).
 * Usage: <script src="flower-bg.js" defer></script> before </body>.
 * Optional: put <div id="flower-hero"></div> where you want the hero panel.
 */
(function () {
  'use strict';

  var reduceMotion = window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  function project(x, y, z, rx, ry, rz, fov, scale, w, h) {
    var y1 = y * Math.cos(rx) - z * Math.sin(rx);
    var z1 = y * Math.sin(rx) + z * Math.cos(rx);
    var x2 = x * Math.cos(ry) + z1 * Math.sin(ry);
    var z2 = -x * Math.sin(ry) + z1 * Math.cos(ry);
    var x3 = x2 * Math.cos(rz) - y1 * Math.sin(rz);
    var y3 = x2 * Math.sin(rz) + y1 * Math.cos(rz);
    var p = fov / (fov + z2 + 360);
    return { x: w / 2 + x3 * p * scale, y: h / 2 + y3 * p * scale };
  }

  function layerPoints(l, total, t) {
    var petals = 12, segments = 144, pts = [];
    var ratio = l / total;
    var baseR = 55 + l * 34;
    var phase = l * 0.42;
    var breathing = Math.sin(t * 1.4 - l * 0.55);
    var morph = Math.cos(t * 0.9 + l * 0.7);
    for (var i = 0; i < segments; i++) {
      var th = (i / segments) * Math.PI * 2;
      var primary = Math.sin(petals * th + t * 1.1 + phase);
      var secondary = Math.cos((petals / 2) * th - t * 0.8);
      var fold = Math.abs(((th * petals / Math.PI) % 2) - 1);
      var r = baseR + primary * (26 + 14 * breathing) + secondary * (12 * morph) + fold * 16;
      var z = Math.cos(petals * th + phase) * (28 + 18 * breathing) +
              (ratio - 0.5) * 95 * Math.sin(t * 0.7);
      pts.push({ x: r * Math.cos(th), y: r * Math.sin(th), z: z });
    }
    return pts;
  }

  // mode: 'hero' (neon on black, additive glow) or 'bg' (transparent, readable on light pages)
  function createFlower(canvas, getSize, mode) {
    var ctx = canvas.getContext('2d');
    var w = 0, h = 0, t = 0, raf = 0;

    function resize() {
      var s = getSize();
      var dpr = Math.min(window.devicePixelRatio || 1, 2);
      w = s.w; h = s.h;
      canvas.width = Math.max(1, Math.floor(w * dpr));
      canvas.height = Math.max(1, Math.floor(h * dpr));
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
      if (mode === 'hero') { ctx.fillStyle = '#000'; ctx.fillRect(0, 0, w, h); }
    }

    function frame() {
      t += 0.014;
      var isHero = mode === 'hero';

      if (isHero) {
        ctx.globalCompositeOperation = 'source-over';
        ctx.fillStyle = 'rgba(0,0,0,0.24)';
        ctx.fillRect(0, 0, w, h);
        ctx.globalCompositeOperation = 'lighter';
      } else {
        ctx.clearRect(0, 0, w, h);
      }

      var baseScale = Math.min(w, h) / (isHero ? 540 : 420);
      var fov = 480;
      var rx = Math.sin(t * 0.55) * 0.65 + 0.35;
      var ry = Math.cos(t * 0.45) * 0.65;
      var rz = t * 0.28;
      var total = 6, layers = [], l, i;

      for (l = 0; l < total; l++) {
        var raw = layerPoints(l, total, t), proj = [];
        for (i = 0; i < raw.length; i++) {
          proj.push(project(raw[i].x, raw[i].y, raw[i].z, rx, ry, rz + l * 0.08, fov, baseScale, w, h));
        }
        layers.push(proj);
      }

      for (l = 0; l < total; l++) {
        var pts = layers[l], len = pts.length, p, p1, p2;
        var hue = 268 + l * 6 + Math.sin(t + l) * 8;
        var alpha = 0.38 + (1 - l / total) * 0.35;
        var light = isHero ? 68 : 42;

        ctx.save();
        if (isHero) {
          ctx.shadowBlur = 14;
          ctx.shadowColor = 'hsla(' + hue + ',100%,62%,0.85)';
        }
        ctx.strokeStyle = 'hsla(' + hue + ',95%,' + light + '%,' + alpha + ')';
        ctx.lineWidth = 1.25;
        ctx.beginPath();
        for (i = 0; i <= len; i++) {
          p = pts[i % len];
          if (i === 0) ctx.moveTo(p.x, p.y); else ctx.lineTo(p.x, p.y);
        }
        ctx.stroke();

        ctx.beginPath();
        ctx.strokeStyle = 'hsla(' + (hue + 14) + ',100%,' + (isHero ? 74 : 48) + '%,' + (alpha * 0.55) + ')';
        ctx.lineWidth = 0.85;
        for (i = 0; i < len; i += 3) {
          p1 = pts[i]; p2 = pts[(i + 12) % len];
          ctx.moveTo(p1.x, p1.y); ctx.lineTo(p2.x, p2.y);
        }
        ctx.stroke();

        if (l < total - 1) {
          var next = layers[l + 1];
          ctx.beginPath();
          ctx.strokeStyle = 'hsla(' + (hue - 8) + ',90%,' + (isHero ? 60 : 40) + '%,' + (alpha * 0.45) + ')';
          ctx.lineWidth = 0.8;
          for (i = 0; i < len; i += 6) {
            var c = pts[i], a = next[(i + 3) % len], b = next[(i - 3 + len) % len];
            ctx.moveTo(c.x, c.y); ctx.lineTo(a.x, a.y);
            ctx.moveTo(c.x, c.y); ctx.lineTo(b.x, b.y);
          }
          ctx.stroke();
        }
        ctx.restore();
      }

      var ctr = project(0, 0, 0, rx, ry, rz, fov, baseScale, w, h);
      var pulse = 18 + Math.sin(t * 2.5) * 6;
      var g = ctx.createRadialGradient(ctr.x, ctr.y, 0, ctr.x, ctr.y, pulse * 3.2);
      g.addColorStop(0, isHero ? 'rgba(233,213,255,0.9)' : 'rgba(168,85,247,0.5)');
      g.addColorStop(0.3, 'rgba(168,85,247,0.45)');
      g.addColorStop(0.7, 'rgba(107,33,168,0.12)');
      g.addColorStop(1, 'rgba(0,0,0,0)');
      ctx.fillStyle = g;
      ctx.beginPath();
      ctx.arc(ctr.x, ctr.y, pulse * 3.2, 0, Math.PI * 2);
      ctx.fill();

      if (!reduceMotion) raf = requestAnimationFrame(frame);
    }

    resize();
    frame();
    return { resize: resize, stop: function () { cancelAnimationFrame(raf); } };
  }

  function init() {
    // ---------- 1. Page background (all pages) ----------
    var bg = document.createElement('canvas');
    bg.setAttribute('aria-hidden', 'true');
    bg.style.cssText =
      'position:fixed;top:0;left:0;width:100vw;height:100vh;z-index:-1;' +
      'pointer-events:none;opacity:0.4;';
    document.body.insertBefore(bg, document.body.firstChild);
    var bgFlower = createFlower(bg, function () {
      return { w: window.innerWidth, h: window.innerHeight };
    }, 'bg');

    // ---------- 2. Hero panel (home page only, or wherever #flower-hero exists) ----------
    var mount = document.getElementById('flower-hero');
    var isHome = /(^\/$|\/index\.html$)/.test(location.pathname);
    var heroFlower = null;

    if (!mount && isHome) {
      mount = document.createElement('div');
      mount.id = 'flower-hero';
      var h1 = document.querySelector('h1');
      var host = h1 && (h1.closest('section') || h1.parentElement);
      if (host && host.parentNode) host.parentNode.insertBefore(mount, host.nextSibling);
      else document.body.appendChild(mount);
    }

    if (mount) {
      mount.style.cssText =
        'position:relative;width:calc(100% - 40px);max-width:920px;' +
        'height:clamp(320px,60vh,560px);margin:40px auto;background:#000;' +
        'border:1px solid rgba(168,85,247,0.35);border-radius:12px;overflow:hidden;' +
        'box-shadow:0 0 35px rgba(139,92,246,0.18),inset 0 0 25px rgba(88,28,135,0.15);';
      var hero = document.createElement('canvas');
      hero.setAttribute('aria-hidden', 'true');
      hero.style.cssText = 'display:block;width:100%;height:100%;';
      mount.appendChild(hero);
      heroFlower = createFlower(hero, function () {
        var r = mount.getBoundingClientRect();
        return { w: r.width, h: r.height };
      }, 'hero');
    }

    var timer;
    window.addEventListener('resize', function () {
      clearTimeout(timer);
      timer = setTimeout(function () {
        bgFlower.resize();
        if (heroFlower) heroFlower.resize();
      }, 120);
    });
  }

  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', init);
  else init();
})();
