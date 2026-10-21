/* The Fit Monster — site runtime: theme, preloader, curtain, smooth scroll, reveals, nav/menu, hero,
   the Apology, reels + lightbox, chat (front desk), forms, and lazy 3D. No framework. */
(() => {
  'use strict';
  window.FM_BOOT = true;
  const root = document.documentElement;
  const $ = (s, c = document) => c.querySelector(s);
  const $$ = (s, c = document) => Array.from(c.querySelectorAll(s));
  const RM = matchMedia('(prefers-reduced-motion: reduce)').matches;
  const FINE = matchMedia('(hover: hover) and (pointer: fine)').matches;
  const G = window.gsap, ST = window.ScrollTrigger;
  if (G && ST) G.registerPlugin(ST);
  const store = {
    get: (k, s = localStorage) => { try { return s.getItem(k); } catch (e) { return null; } },
    set: (k, v, s = localStorage) => { try { s.setItem(k, v); } catch (e) { } },
    del: (k, s = localStorage) => { try { s.removeItem(k); } catch (e) { } }
  };
  const ICON = {
    wa: '<svg viewBox="0 0 24 24" fill="currentColor" aria-hidden="true"><path d="M12.04 2C6.58 2 2.14 6.44 2.14 11.9c0 1.75.46 3.45 1.32 4.95L2.05 22l5.28-1.38a9.86 9.86 0 0 0 4.71 1.2c5.46 0 9.9-4.44 9.9-9.9S17.5 2 12.04 2zm5.8 14.06c-.24.68-1.4 1.3-1.94 1.35-.5.05-1.13.07-1.82-.11-.42-.13-.96-.31-1.65-.61-2.9-1.25-4.8-4.17-4.95-4.37-.14-.2-1.18-1.57-1.18-3s.75-2.13 1.02-2.42c.26-.29.58-.36.77-.36l.55.01c.18.01.42-.07.65.5.24.58.82 2 .89 2.14.07.15.12.32.02.51-.09.2-.14.32-.28.49l-.42.49c-.14.14-.28.29-.12.57.16.29.72 1.18 1.54 1.91 1.06.94 1.95 1.23 2.23 1.37.28.15.44.12.6-.07.17-.2.7-.81.88-1.09.19-.29.37-.24.63-.14.25.09 1.62.76 1.9.9.28.15.46.22.53.34.07.12.07.68-.17 1.34z"/></svg>'
  };

  /* ------------------------------------------------------------ data bindings (config.js) */
  function bind() {
    const F = window.FM; if (!F) return;
    $$('[data-fm]').forEach(el => { const v = F[el.dataset.fm]; if (v != null) el.textContent = v; });
    $$('[data-tel]').forEach(a => a.href = 'tel:' + F.phone.replace(/\s/g, ''));
    $$('[data-wa]').forEach(a => { a.href = F.wa(a.dataset.wa || undefined); a.target = '_blank'; a.rel = 'noopener'; });
    $$('[data-maps]').forEach(a => { a.href = F.maps; a.target = '_blank'; a.rel = 'noopener'; });
    $$('[data-ig]').forEach(a => { if (F.instagram) { a.href = F.instagram; a.target = '_blank'; a.rel = 'noopener'; } else a.closest('li') ? a.closest('li').remove() : a.remove(); });
    $$('iframe[data-map]').forEach(f => { f.dataset.src = F.mapEmbed; });
    $$('[data-year]').forEach(el => el.textContent = new Date().getFullYear());
    const paint = () => {
      const s = F.status();
      $$('[data-status]').forEach(el => { el.classList.toggle('is-open', s.open); const t = $('span', el); if (t) t.textContent = s.text; });
    };
    paint(); setInterval(paint, 60000);
    $$('[data-hours]').forEach(ul => {
      const names = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
      const today = F.now().day;
      ul.innerHTML = [1, 2, 3, 4, 5, 6, 0].map(d => `<li class="${d === today ? 'today' : ''}"><span>${names[d]}</span><span class="mono">${F.fmt(F.hours[d][0])} – ${F.fmt(F.hours[d][1])}</span></li>`).join('');
    });
  }

  /* ------------------------------------------------------------ theme (circle wipe from the toggle) */
  function theme() {
    const btn = $('[data-theme-btn]'); if (!btn) return;
    const paint = () => { const t = root.dataset.theme; btn.setAttribute('aria-checked', String(t !== 'light')); btn.setAttribute('aria-label', t === 'light' ? 'Switch to dark mode' : 'Switch to light mode'); };
    btn.addEventListener('click', () => {
      const next = root.dataset.theme === 'light' ? 'dark' : 'light';
      const go = () => { root.dataset.theme = next; store.set('fm-theme', next); paint(); window.dispatchEvent(new CustomEvent('fm:theme', { detail: next })); };
      if (!document.startViewTransition || RM) { go(); return; }
      const r = $('.tpill2__k', btn).getBoundingClientRect(), x = r.left + r.width / 2, y = r.top + r.height / 2;
      const end = Math.hypot(Math.max(x, innerWidth - x), Math.max(y, innerHeight - y));
      const t = document.startViewTransition(go);
      t.ready.then(() => root.animate({ clipPath: [`circle(0px at ${x}px ${y}px)`, `circle(${end}px at ${x}px ${y}px)`] }, { duration: 700, easing: 'cubic-bezier(.65,0,.35,1)', pseudoElement: '::view-transition-new(root)' }));
    });
    paint();
  }

  /* ------------------------------------------------------------ smooth scroll */
  let lenis = null;
  function smooth() {
    if (RM || !FINE || !window.Lenis) return;
    lenis = new Lenis({ lerp: 0.1, smoothWheel: true, wheelMultiplier: 1 });
    window.FM_LENIS = lenis;
    if (G && ST) { lenis.on('scroll', ST.update); G.ticker.add(t => lenis.raf(t * 1000)); G.ticker.lagSmoothing(0); }
    else { const raf = t => { lenis.raf(t); requestAnimationFrame(raf); }; requestAnimationFrame(raf); }
    $$('a[href^="#"]').forEach(a => a.addEventListener('click', e => { const id = a.getAttribute('href'); if (id.length > 1 && $(id)) { e.preventDefault(); lenis.scrollTo(id, { offset: -20, duration: 1.4 }); } }));
  }
  const lock = on => { if (lenis) on ? lenis.stop() : lenis.start(); root.style.overflow = on ? 'hidden' : ''; };

  /* ------------------------------------------------------------ split text */
  function split(el) {
    let i = 0;
    const walk = node => Array.from(node.childNodes).forEach(ch => {
      if (ch.nodeType === 3) {
        if (!ch.textContent.trim()) return;
        const f = document.createDocumentFragment();
        ch.textContent.split(/(\s+)/).forEach(t => {
          if (!t) return;
          if (/^\s+$/.test(t)) { f.appendChild(document.createTextNode(' ')); return; }
          const w = document.createElement('span'); w.className = 'w';
          const s = document.createElement('span'); s.textContent = t; s.style.setProperty('--i', i++);
          w.appendChild(s); f.appendChild(w);
        });
        ch.replaceWith(f);
      } else if (ch.nodeType === 1 && !ch.matches('br,svg,img')) walk(ch);
    });
    walk(el); el.classList.add('is-split');
  }
  function reveals(ready) {
    $$('[data-rise]').forEach(split);
    const els = $$('[data-rise],[data-fade],[data-wipe],.hl');
    if (RM || !('IntersectionObserver' in window)) { els.forEach(e => e.classList.add('in')); return; }
    ready.then(() => {
      const io = new IntersectionObserver(es => es.forEach(en => { if (en.isIntersecting) { en.target.classList.add('in'); io.unobserve(en.target); } }), { rootMargin: '0px 0px -8% 0px', threshold: 0.01 });
      els.forEach(e => io.observe(e));
    });
  }

  /* ------------------------------------------------------------ preloader: MONSTER fills with molten gold, then we dive through the O */
  function loader() {
    const on = root.classList.contains('ld-on');
    const kill = () => { $$('.ldr').forEach(n => n.remove()); root.classList.remove('ld-on'); };
    if (!on) { kill(); return Promise.resolve(); }
    store.set('fm-seen', '1', sessionStorage);
    if (RM || !G) { kill(); return Promise.resolve(); }
    lock(true); scrollTo(0, 0);
    const stage = $('.ldr__stage'), fill = $('.ldr__fill'), crest = $('.ldr__crest'), N = $('#ldN');
    const L = $$('.ldr__base span, .ldr__fill span'), metas = $$('.ldr__m');
    G.set(L, { yPercent: 110, opacity: 1 }); G.set(metas, { autoAlpha: 0, y: 10 });
    const st = { lv: 0, r: 0 };
    const paint = () => { const v = st.lv.toFixed(2); fill.style.setProperty('--lv', v); crest.style.setProperty('--lv', v); N.textContent = String(Math.round(st.lv)).padStart(3, '0'); };
    const fonts = Promise.race([document.fonts ? document.fonts.load('800 100px "Tomorrow"') : Promise.resolve(), new Promise(r => setTimeout(r, 1200))]);
    const hv = $('.hero video');
    const video = hv ? Promise.race([new Promise(r => { if (hv.readyState >= 3) r(); else hv.addEventListener('canplay', r, { once: true }); }), new Promise(r => setTimeout(r, 2600))]) : Promise.resolve();
    return fonts.then(() => new Promise(res => {
      const E = 'expo.out';
      const tl = G.timeline();
      tl.to(metas, { autoAlpha: 1, y: 0, duration: .8, ease: E, stagger: .06 }, 0)
        .to(L, { yPercent: 0, duration: 1.15, ease: E, stagger: { each: .06, from: 'start' } }, .1)
        .to(st, { lv: 92, duration: 2.1, ease: 'power2.inOut', onUpdate: paint }, .3);
      tl.add(() => {
        tl.pause();
        video.then(() => {
          G.to(st, { lv: 100, duration: .45, ease: 'power2.out', onUpdate: paint, onComplete: () => tl.play() });
        });
      }, 2.4);
      tl.add(() => {
        const O = $('.ldr__base .o'), w = $('.ldr__word');
        const or = O.getBoundingClientRect(), sr = stage.getBoundingClientRect();
        const ox = or.left + or.width / 2 - sr.left, oy = or.top + or.height * .52 - sr.top;
        stage.style.transformOrigin = `${ox}px ${oy}px`;
        stage.style.setProperty('--ox', ox + 'px'); stage.style.setProperty('--oy', oy + 'px');
        const hole = or.width * .2;
        stage.style.setProperty('--r', '0px');
        stage.style.webkitMaskImage = stage.style.maskImage = `radial-gradient(circle at ${ox}px ${oy}px, transparent var(--r), #000 calc(var(--r) + 1.5px))`;
        G.to(st, { r: hole, duration: .5, ease: 'power3.in', onUpdate: () => stage.style.setProperty('--r', st.r + 'px') });
      }, 2.45)
        .to(metas, { autoAlpha: 0, y: -8, duration: .35, ease: 'power2.in' }, 2.45)
        .to(stage, { scale: 46, duration: 1.25, ease: 'expo.in' }, 2.75)
        .add(() => { lock(false); res(); }, 3.55)
        .to(stage, { autoAlpha: 0, duration: .3 }, 3.75)
        .add(kill, 4.1);
    }));
  }

  /* ------------------------------------------------------------ curtain between pages */
  const PAGES = { 'index.html': 'Home', '': 'Home', 'training.html': 'Training', 'floor.html': 'The Floor', 'coaches.html': 'Coaches', 'membership.html': 'Membership', 'visit.html': 'Visit' };
  const fileOf = p => { const f = (p.split('/').pop() || 'index.html'); return /\.html$/.test(f) ? f : (f ? f + '.html' : 'index.html'); };
  function curtain() {
    const c = $('.curtain'); if (!c) return Promise.resolve();
    const t = $('.curtain__t span', c);
    let p = Promise.resolve();
    if (root.classList.contains('pt-on')) {
      t.textContent = store.get('fm-pt', sessionStorage) || 'The Fit Monster'; store.del('fm-pt', sessionStorage);
      p = new Promise(res => {
        const go = () => { c.classList.add('lift'); setTimeout(res, 300); setTimeout(() => { root.classList.remove('pt-on'); c.classList.remove('lift'); }, 1050); };
        const f = document.fonts && document.fonts.ready ? Promise.race([document.fonts.ready, new Promise(r => setTimeout(r, 600))]) : Promise.resolve();
        f.then(() => setTimeout(go, 120));
      });
    }
    if (RM) return p;
    document.addEventListener('click', e => {
      if (e.defaultPrevented || e.button !== 0 || e.metaKey || e.ctrlKey || e.shiftKey || e.altKey) return;
      const a = e.target.closest('a[href]'); if (!a || a.target === '_blank' || a.hasAttribute('download')) return;
      let u; try { u = new URL(a.href, location.href); } catch (er) { return; }
      if (u.origin !== location.origin || u.hash && u.pathname === location.pathname) return;
      const file = fileOf(u.pathname); if (!(file in PAGES) || file === fileOf(location.pathname)) return;
      e.preventDefault();
      store.set('fm-pt', PAGES[file], sessionStorage);
      t.textContent = PAGES[file]; c.classList.add('go'); lock(true);
      setTimeout(() => { location.href = u.href; }, 680);
    });
    addEventListener('pageshow', e => { if (e.persisted) { c.classList.remove('go', 'lift'); root.classList.remove('pt-on', 'menu-open'); lock(false); } });
    return p;
  }

  /* ------------------------------------------------------------ nav + overlay menu */
  function nav() {
    const n = $('.nav'); if (!n) return;
    let last = scrollY, tick = 0;
    addEventListener('scroll', () => {
      if (tick) return; tick = requestAnimationFrame(() => {
        tick = 0; const y = scrollY;
        if (!root.classList.contains('menu-open')) n.classList.toggle('is-hidden', y > last && y > 240);
        last = y;
      });
    }, { passive: true });
    const m = $('.menu'), btn = $('.menu-t'); if (!m || !btn) return;
    let opener = null;
    const set = on => {
      root.classList.toggle('menu-open', on); btn.setAttribute('aria-expanded', String(on)); m.setAttribute('aria-hidden', String(!on));
      m.inert = !on; n.classList.remove('is-hidden');
      if (on) { opener = document.activeElement; setTimeout(() => { const f = $('.menu__list a', m); f && f.focus({ preventScroll: true }); }, 220); }
      else if (opener && m.contains(document.activeElement)) opener.focus({ preventScroll: true });
    };
    m.inert = true;
    btn.addEventListener('click', e => { e.stopPropagation(); set(!root.classList.contains('menu-open')); });
    document.addEventListener('click', e => { if (root.classList.contains('menu-open') && !e.target.closest('.menu') && !e.target.closest('.menu-t')) set(false); });
    addEventListener('keydown', e => { if (e.key === 'Escape' && root.classList.contains('menu-open')) { set(false); btn.focus(); } });
    addEventListener('scroll', () => { if (root.classList.contains('menu-open') && Math.abs(scrollY - openedAt) > 120) set(false); }, { passive: true });
    let openedAt = 0; btn.addEventListener('click', () => { openedAt = scrollY; });
    $$('.menu__list a', m).forEach(a => a.addEventListener('click', () => { if (fileOf(new URL(a.href).pathname) === fileOf(location.pathname)) set(false); }));
  }

  /* ------------------------------------------------------------ hero video: right cut for the screen, starts during the preloader */
  function hero() {
    const v = $('.hero video'); if (!v) return;
    const wide = matchMedia('(min-width: 981px) and (min-aspect-ratio: 1/1)').matches;
    const base = 'media/video/' + (wide ? 'hero-wide' : 'hero-portrait');
    v.poster = 'media/poster/' + (wide ? 'hero-wide' : 'hero-portrait') + '.webp';
    const can = v.canPlayType('video/webm; codecs="vp9"');
    v.src = base + (can ? '.webm' : '.mp4');
    v.muted = true; v.playsInline = true;
    if (RM) { v.removeAttribute('autoplay'); return; }
    const p = v.play(); if (p) p.catch(() => { });
    if ('IntersectionObserver' in window) new IntersectionObserver(es => es.forEach(e => e.isIntersecting ? v.play().catch(() => { }) : v.pause())).observe(v);
  }

  /* ------------------------------------------------------------ the Apology (their campaign as a pinned chapter) */
  function apology() {
    const sec = $('.apology'); if (!sec) return;
    const items = $$('.apology__item', sec), cnt = $('.apology__count b', sec), bar = $('.apology__bar', sec);
    const desktop = matchMedia('(min-width: 901px)').matches;
    if (!desktop || RM || !G || !ST) {
      if (RM || !('IntersectionObserver' in window)) return;
      items.forEach(it => it.setAttribute('data-fade', ''));
      const io = new IntersectionObserver(es => es.forEach(e => { if (e.isIntersecting) { e.target.classList.add('in'); io.unobserve(e.target); } }), { rootMargin: '0px 0px -8% 0px' });
      items.forEach(it => io.observe(it)); return;
    }
    sec.classList.add('is-pinned');
    let cur = -1, z = 1;
    const go = i => {
      if (i === cur) return;
      const it = items[i]; it.classList.add('on'); it.style.zIndex = ++z;
      const ph = $('.apology__ph', it), img = $('img', ph), line = $('.apology__line', it);
      G.fromTo(ph, { clipPath: i > cur ? 'inset(100% 0 0 0 round 24px)' : 'inset(0 0 100% 0 round 24px)' }, { clipPath: 'inset(0% 0 0% 0 round 24px)', duration: 1, ease: 'expo.out' });
      G.fromTo(img, { scale: 1.18 }, { scale: 1, duration: 1.4, ease: 'expo.out' });
      G.fromTo(line, { yPercent: 60, autoAlpha: 0 }, { yPercent: 0, autoAlpha: 1, duration: .9, ease: 'expo.out', delay: .08 });
      const prev = items[cur]; if (prev) setTimeout(() => { if (items.indexOf(prev) !== cur) prev.classList.remove('on'); }, 1000);
      cur = i; if (cnt) cnt.textContent = String(i + 1).padStart(2, '0');
    };
    go(0);
    ST.create({
      trigger: sec, start: 'top top', end: () => '+=' + (items.length * 0.75 * innerHeight), pin: $('.apology__pin', sec), pinSpacing: true, anticipatePin: 1,
      onUpdate: s => { bar && bar.style.setProperty('--p', s.progress.toFixed(3)); go(Math.min(items.length - 1, Math.floor(s.progress * items.length * 0.999))); }
    });
  }

  /* ------------------------------------------------------------ hover-to-play media (tracks + reels) */
  function hoverPlay() {
    const cards = $$('[data-hover-video]');
    const ensure = v => { if (!v.src && v.dataset.src) { const webm = v.canPlayType('video/webm; codecs="vp9"'); v.src = v.dataset.src + (webm ? '.webm' : '.mp4'); } };
    cards.forEach(card => {
      const v = $('video', card); if (!v) return;
      v.muted = true; v.loop = true; v.playsInline = true;
      const on = () => { ensure(v); v.play().then(() => card.classList.add('is-playing')).catch(() => { }); };
      const off = () => { v.pause(); card.classList.remove('is-playing'); };
      if (FINE) { card.addEventListener('mouseenter', on); card.addEventListener('mouseleave', off); card.addEventListener('focusin', on); card.addEventListener('focusout', off); }
    });
    /* touch: the card nearest the middle of the screen plays */
    if (!FINE && !RM && 'IntersectionObserver' in window) {
      const io = new IntersectionObserver(es => es.forEach(en => {
        const v = $('video', en.target); if (!v) return;
        if (en.isIntersecting) { ensure(v); v.play().then(() => en.target.classList.add('is-playing')).catch(() => { }); } else { v.pause(); en.target.classList.remove('is-playing'); }
      }), { rootMargin: '-35% 0px -35% 0px' });
      cards.forEach(c => io.observe(c));
    }
    /* silent loops that just run while visible (exercise library) */
    const loops = $$('video[data-loop]');
    if (loops.length && 'IntersectionObserver' in window) {
      const io = new IntersectionObserver(es => es.forEach(en => { const v = en.target; if (en.isIntersecting && !RM) { ensure(v); v.play().catch(() => { }); } else v.pause(); }), { rootMargin: '120px' });
      loops.forEach(v => { v.muted = true; v.loop = true; v.playsInline = true; io.observe(v); });
    }
  }

  /* ------------------------------------------------------------ drag-to-scroll rails */
  function rails() {
    $$('.rail').forEach(r => {
      const ctl = r.id && $$(`[data-rail="${r.id}"]`);
      ctl && ctl.forEach(b => b.addEventListener('click', () => r.scrollBy({ left: (b.dataset.dir === 'prev' ? -1 : 1) * r.clientWidth * .8, behavior: RM ? 'auto' : 'smooth' })));
      if (!FINE) return;
      let down = false, sx = 0, sl = 0, moved = 0;
      r.addEventListener('pointerdown', e => { if (e.pointerType !== 'mouse') return; down = true; moved = 0; sx = e.clientX; sl = r.scrollLeft; });
      addEventListener('pointermove', e => { if (!down) return; const dx = e.clientX - sx; moved = Math.max(moved, Math.abs(dx)); if (moved > 6) r.classList.add('is-drag'); r.scrollLeft = sl - dx; });
      addEventListener('pointerup', () => { if (!down) return; down = false; setTimeout(() => r.classList.remove('is-drag'), 0); });
      r.addEventListener('click', e => { if (moved > 6) { e.preventDefault(); e.stopPropagation(); } }, true);
    });
  }

  /* ------------------------------------------------------------ lightbox (reels with sound, photos) */
  function lightbox() {
    const lb = $('.lb'); if (!lb) return;
    const box = $('.lb__box', lb);
    let list = [], idx = 0, opener = null;
    const show = i => {
      idx = (i + list.length) % list.length; const it = list[idx];
      box.innerHTML = ''; box.classList.toggle('is-img', it.type === 'img');
      if (it.type === 'video') {
        const v = document.createElement('video');
        v.controls = true; v.playsInline = true; v.autoplay = true; v.poster = it.poster || '';
        const webm = v.canPlayType('video/webm; codecs="vp9"');
        v.src = it.src + (webm ? '.webm' : '.mp4'); box.appendChild(v); v.play().catch(() => { v.muted = true; v.play().catch(() => { }); });
      } else { const im = new Image(); im.src = it.src; im.alt = it.alt || ''; box.appendChild(im); }
    };
    const open = (group, el) => {
      list = $$(`[data-lb="${group}"]:not(.is-out)`).map(n => ({ type: n.dataset.type || 'video', src: n.dataset.src, poster: n.dataset.poster, alt: n.dataset.alt }));
      opener = el; show(list.findIndex(x => x.src === el.dataset.src));
      lb.classList.add('on'); lb.setAttribute('aria-hidden', 'false'); lb.inert = false; lock(true);
      $$('.hero video, [data-hover-video] video').forEach(v => v.pause());
      setTimeout(() => $('.x', lb).focus(), 50);
    };
    const close = () => { lb.classList.remove('on'); lb.setAttribute('aria-hidden', 'true'); lb.inert = true; box.innerHTML = ''; lock(false); opener && opener.focus({ preventScroll: true }); const hv = $('.hero video'); hv && !RM && hv.play().catch(() => { }); };
    lb.inert = true;
    document.addEventListener('click', e => { const t = e.target.closest('[data-lb]'); if (t) { e.preventDefault(); open(t.dataset.lb, t); } });
    $('.x', lb).addEventListener('click', close);
    $('.lb__nav.prev', lb).addEventListener('click', () => show(idx - 1));
    $('.lb__nav.next', lb).addEventListener('click', () => show(idx + 1));
    lb.addEventListener('click', e => { if (e.target === lb) close(); });
    addEventListener('keydown', e => { if (!lb.classList.contains('on')) return; if (e.key === 'Escape') close(); if (e.key === 'ArrowRight') show(idx + 1); if (e.key === 'ArrowLeft') show(idx - 1); });
  }

  /* ------------------------------------------------------------ chat: the front desk */
  function chat() {
    const c = $('.chat'), fab = $('.fab'); if (!c || !fab || !window.FM) return;
    const F = FM, log = $('.chat__log', c), form = $('.chat__f', c), inp = $('input', form);
    const KEY = 'fm-chat';
    const hoursText = () => { const n = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat']; return [1, 2, 3, 4, 5, 6, 0].map(d => `${n[d]} ${F.fmt(F.hours[d][0])}–${F.fmt(F.hours[d][1])}`).join('<br>'); };
    const waLink = (q, label = 'Continue on WhatsApp') => `<a href="${F.wa(q)}" target="_blank" rel="noopener">${label}</a>`;
    const intents = [
      [/^(hi|hello|hey|salam|aoa|assalam|slam|asalam)/i, () => `Wa alaikum assalam! I'm the front desk. Ask me about timings, fees, coaches, the ladies' side or how to visit.`],
      [/tim(e|ing)|hour|open|close|band|khul|kab|schedule|raat|night|morning|subah/i, () => { const s = F.status(); return `<b>${s.text}.</b><br>${hoursText()}`; }],
      [/where|locat|address|kahan|kidhar|map|direction|nazimabad|liaquatabad|area/i, () => `We're at ${F.address}. <a href="${F.maps}" target="_blank" rel="noopener">Open in Google Maps</a>.`],
      [/fee|price|rate|cost|kitn|charge|package|membership|plan|paise|rupe/i, () => `Rates depend on the plan and whether you want a coach, so the desk shares today's numbers directly on WhatsApp. ${waLink('Assalam o Alaikum, what are the current membership rates?', 'Ask for today’s rates')}`],
      [/lad(y|ies)|women|woman|female|girl|larki|aurat|sister|behen/i, () => `Women train on our floor every day, with female coaches on it too. Ask the desk which hours suit you. ${waLink('Assalam o Alaikum, I want to ask about training for women.', 'Ask on WhatsApp')}`],
      [/coach|trainer|personal|\bpt\b|sikha|guide/i, () => `Every member gets coaches on the floor. Personal training is one-to-one with a programme built around you. <a href="coaches.html">Meet the coaches</a> or ${waLink('Assalam o Alaikum, I want personal training.', 'book a PT intro')}.`],
      [/equip|machine|hammer|nautilus|dumbbell|weight|cardio|treadmill|cycle|turf|rig/i, () => `Hammer Strength dumbbells, Nautilus machines, Smith and squat racks, a turf lane with a rig, and a cardio deck. <a href="floor.html">See the floor</a>.`],
      [/visit|trial|join|start|register|admission|dakhla|aana|come/i, () => `Come see it. Send a message and the desk will set a time. ${waLink('Assalam o Alaikum, I want to book a visit to The Fit Monster.', 'Book a visit')}`],
      [/call|phone|number|contact|whatsapp/i, () => `Call <a href="tel:${F.phone.replace(/\s/g, '')}">${F.phone}</a> or ${waLink(undefined, 'message us on WhatsApp')}.`],
      [/thank|shukria|thanks|jazak/i, () => `Anytime. See you on the floor.`]
    ];
    const reply = q => { for (const [re, fn] of intents) if (re.test(q)) return fn(); return `Good question for the front desk itself. ${waLink('Assalam o Alaikum, ' + q, 'Send it on WhatsApp')} and they'll answer you directly.`; };
    const save = () => store.set(KEY, log.innerHTML, sessionStorage);
    const add = (who, html) => { const m = document.createElement('div'); m.className = 'msg ' + who; m.innerHTML = html; log.appendChild(m); log.scrollTop = log.scrollHeight; save(); return m; };
    const ask = q => {
      add('u', q.replace(/[<>&]/g, s => ({ '<': '&lt;', '>': '&gt;', '&': '&amp;' }[s])));
      const t = document.createElement('div'); t.className = 'msg b typing'; t.innerHTML = '<i></i><i></i><i></i>'; t.setAttribute('aria-label', 'Typing'); log.appendChild(t); log.scrollTop = log.scrollHeight;
      setTimeout(() => { t.remove(); add('b', reply(q)); }, RM ? 0 : 520 + Math.random() * 380);
    };
    const prior = store.get(KEY, sessionStorage);
    if (prior) log.innerHTML = prior; else add('b', `Assalam o Alaikum. I'm the Fit Monster front desk. <b>${F.status().text}.</b> What do you want to know?`);
    const set = on => {
      root.classList.toggle('chat-open', on); fab.setAttribute('aria-expanded', String(on)); c.setAttribute('aria-hidden', String(!on)); c.inert = !on;
      if (on) { setTimeout(() => { if (FINE) inp.focus({ preventScroll: true }); log.scrollTop = log.scrollHeight; }, 250); }
      else fab.focus({ preventScroll: true });
    };
    c.inert = true;
    fab.addEventListener('click', () => set(true));
    document.addEventListener('pointerdown', e => { if (root.classList.contains('chat-open') && !e.target.closest('.chat') && !e.target.closest('.fab') && !e.target.closest('[data-open-chat]')) set(false); });
    $('.chat__x', c).addEventListener('click', () => set(false));
    addEventListener('keydown', e => { if (e.key === 'Escape' && root.classList.contains('chat-open')) set(false); });
    $$('.chip[data-q]', c).forEach(b => b.addEventListener('click', () => ask(b.dataset.q)));
    form.addEventListener('submit', e => { e.preventDefault(); const q = inp.value.trim(); if (!q) return; inp.value = ''; ask(q); });
    $$('[data-open-chat]').forEach(b => b.addEventListener('click', e => { e.preventDefault(); set(true); }));
  }

  /* ------------------------------------------------------------ gallery filters */
  function filters() {
    const bar = $('.filters'); if (!bar) return;
    const tiles = $$('.tile');
    $$('.chip', bar).forEach(b => b.addEventListener('click', () => {
      $$('.chip', bar).forEach(x => x.setAttribute('aria-pressed', String(x === b)));
      const k = b.dataset.f;
      tiles.forEach(t => t.classList.toggle('is-out', k !== 'all' && !t.dataset.cat.split(' ').includes(k)));
      if (ST) ST.refresh();
    }));
  }

  /* ------------------------------------------------------------ enquiry form → WhatsApp */
  function forms() {
    $$('form[data-enquiry]').forEach(f => f.addEventListener('submit', e => {
      e.preventDefault();
      let ok = true;
      $$('[required]', f).forEach(el => {
        const bad = !el.value.trim() || (el.type === 'tel' && el.value.replace(/\D/g, '').length < 10);
        el.setAttribute('aria-invalid', String(bad)); const er = el.parentNode.querySelector('.err');
        if (er) er.textContent = bad ? (el.type === 'tel' ? 'Enter a number we can call back, like 0300 1234567.' : 'This one is needed so the desk can reply.') : '';
        if (bad && ok) { el.focus(); ok = false; }
      });
      if (!ok) return;
      const d = Object.fromEntries(new FormData(f));
      const msg = `Assalam o Alaikum, I'd like to join The Fit Monster.\nName: ${d.name}\nPhone: ${d.phone}\nPlan: ${d.plan || '-'}\nGoal: ${d.goal || '-'}\nBest time: ${d.time || '-'}${d.note ? '\nNote: ' + d.note : ''}`;
      const b = $('button[type="submit"]', f); b.dataset.state = 'success'; b.querySelector('span').textContent = 'Opening WhatsApp';
      window.open(FM.wa(msg), '_blank', 'noopener');
      setTimeout(() => { delete b.dataset.state; b.querySelector('span').textContent = 'Send on WhatsApp'; }, 2400);
    }));
    $$('[data-plan]').forEach(b => b.addEventListener('click', () => { const s = $('select[name="plan"]'); if (s) s.value = b.dataset.plan; }));
  }

  /* ------------------------------------------------------------ maps: load the iframe only when near */
  function maps() {
    const fr = $$('iframe[data-map]'); if (!fr.length) return;
    const io = new IntersectionObserver(es => es.forEach(e => { if (e.isIntersecting) { e.target.src = e.target.dataset.src; io.unobserve(e.target); } }), { rootMargin: '400px' });
    fr.forEach(f => io.observe(f));
  }

  /* ------------------------------------------------------------ 3D: import Three.js only when a scene is near the screen */
  function scenes() {
    const els = $$('[data-scene]'); if (!els.length) return;
    const start = el => {
      const kind = el.dataset.scene;
      const mod = kind === 'dumbbell' ? 'scene-dumbbell.js' : kind === 'machine' ? 'scene-machine.js' : 'scene-halo.js';
      import('./' + mod + '?v=' + ((window.FM_V || {})[kind === 'dumbbell' ? 'd' : kind === 'machine' ? 'm' : 'h'] || '1')).then(m => m.mount(el)).catch(err => { console.warn('[FM] 3D off:', err); el.classList.add('no-3d'); });
    };
    if (!('IntersectionObserver' in window)) { els.forEach(start); return; }
    const io = new IntersectionObserver(es => es.forEach(e => { if (e.isIntersecting) { io.unobserve(e.target); start(e.target); } }), { rootMargin: '600px 0px' });
    els.forEach(e => io.observe(e));
  }

  /* ------------------------------------------------------------ boot */
  bind(); theme(); smooth(); nav(); hero(); lightbox(); chat(); filters(); forms(); maps(); rails(); hoverPlay();
  const L = Promise.all([loader(), curtain()]);
  reveals(L);
  L.then(() => { apology(); scenes(); if (ST) { ST.refresh(); if (document.fonts) document.fonts.ready.then(() => ST.refresh()); } });
})();
