/* ============================================================
   OUR STORY — script.js
   Vanilla JS only. No frameworks, no build step.

   TABLE OF CONTENTS
   0.  Small utilities
   1.  Loading screen
   2.  Intro screen
   3.  Custom cursor + cursor butterfly
   4.  Canvas: twinkling starfield
   5.  Canvas: ambient particles (fireflies / hearts / sparkles)
   6.  Constellation thread (signature scroll motif)
   7.  AOS init
   8.  Chapter 2 — typewriter
   9.  Chapter 7 — gallery lightbox
   10. Chapter 9 — envelope + letter
   11. Chapter 10 — finale sequence (rain / butterflies / confetti / fireworks)
   12. Music player controls
   13. Ripple effect on glass buttons
   14. Easter eggs (butterfly / moon / hearts / keys / double-click)
   15. Boot sequence
   ============================================================ */

(function () {
  'use strict';

  /* ============================================================
     0. SMALL UTILITIES
     ============================================================ */
  const $  = (sel, ctx = document) => ctx.querySelector(sel);
  const $$ = (sel, ctx = document) => Array.from(ctx.querySelectorAll(sel));
  const rand = (min, max) => Math.random() * (max - min) + min;
  const isTouchDevice = 'ontouchstart' in window || navigator.maxTouchPoints > 0;
  const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  /** Show the small glassy toast used for every easter egg. */
  let toastTimer = null;
  function showToast(message) {
    const toast = $('#easter-toast');
    if (!toast) return;
    toast.textContent = message;
    toast.classList.add('visible');
    clearTimeout(toastTimer);
    toastTimer = setTimeout(() => toast.classList.remove('visible'), 2600);
  }

  /** Spawn a single emoji that drifts/falls across the screen, then removes itself. */
  function spawnFloatingEmoji({
    emoji = '❤️',
    left = rand(0, 100),
    top = -5,
    duration = rand(4, 7),
    size = rand(1.1, 1.9),
    direction = 'down',   // 'down' | 'up'
    container = document.body,
    clickable = false,
    onClick = null
  } = {}) {
    const el = document.createElement('span');
    el.textContent = emoji;
    el.setAttribute('aria-hidden', clickable ? 'false' : 'true');
    el.style.position = 'fixed';
    el.style.left = left + 'vw';
    el.style.top = (direction === 'down' ? top : 100 - top) + 'vh';
    el.style.fontSize = size + 'rem';
    el.style.zIndex = 250;
    el.style.pointerEvents = clickable ? 'auto' : 'none';
    el.style.filter = 'drop-shadow(0 0 8px rgba(255,179,209,0.55))';
    el.style.transition = `transform ${duration}s linear, opacity ${duration}s linear`;
    el.style.willChange = 'transform, opacity';
    if (clickable) el.style.cursor = 'pointer';
    container.appendChild(el);

    // force layout, then kick off the transform so the transition animates
    requestAnimationFrame(() => {
      const travel = direction === 'down' ? '112vh' : '-112vh';
      const sway = rand(-40, 40);
      el.style.transform = `translate(${sway}px, ${travel}) rotate(${rand(-40, 40)}deg)`;
      el.style.opacity = '0';
    });

    if (clickable) {
      el.addEventListener('click', (e) => {
        e.stopPropagation();
        if (onClick) onClick();
        el.remove();
      });
    }

    setTimeout(() => el.remove(), duration * 1000 + 200);
    return el;
  }

  /* ============================================================
     1. LOADING SCREEN
     ============================================================ */
  function runLoadingScreen(onDone) {
    const screen = $('#loading-screen');
    const fill = $('#progress-fill');
    let progress = 0;

    const tick = () => {
      // ease toward 100 with a little randomness so it doesn't feel mechanical
      progress += rand(4, 12);
      progress = Math.min(progress, 100);
      fill.style.width = progress + '%';
      if (progress < 100) {
        setTimeout(tick, rand(120, 260));
      } else {
        setTimeout(() => {
          screen.classList.add('fade-out');
          setTimeout(() => {
            screen.style.display = 'none';
            onDone();
          }, 950);
        }, 350);
      }
    };
    tick();
  }

  /* ============================================================
     2. INTRO SCREEN
     ============================================================ */
  function runIntroScreen(onBegin) {
    const intro = $('#intro-screen');
    const line = $('#intro-line');
    const btn = $('#begin-btn');

    intro.classList.add('active');
    intro.removeAttribute('aria-hidden');

    setTimeout(() => line.classList.add('reveal'), 400);
    setTimeout(() => {
      btn.classList.add('reveal');
      btn.removeAttribute('aria-hidden');
    }, 2600);

    btn.addEventListener('click', function handleBegin() {
      btn.removeEventListener('click', handleBegin);
      intro.classList.add('fade-out');
      setTimeout(() => {
        intro.style.display = 'none';
        onBegin();
      }, 1450);
    });
  }

  /* ============================================================
     3. CUSTOM CURSOR + CURSOR BUTTERFLY
     ============================================================ */
  function initCursor() {
    if (isTouchDevice) {
      document.body.classList.add('touch-device');
      return;
    }
    const glow = $('#glow-cursor');
    const butterfly = $('#cursor-butterfly');
    let bx = window.innerWidth / 2, by = window.innerHeight / 2; // butterfly trails with lag

    window.addEventListener('mousemove', (e) => {
      glow.style.left = e.clientX + 'px';
      glow.style.top = e.clientY + 'px';
    });
    window.addEventListener('mousedown', () => glow.classList.add('pressed'));
    window.addEventListener('mouseup', () => glow.classList.remove('pressed'));
    window.addEventListener('mouseleave', () => {
      glow.classList.add('hidden');
      butterfly.classList.add('hidden');
    });
    window.addEventListener('mouseenter', () => {
      glow.classList.remove('hidden');
      butterfly.classList.remove('hidden');
    });

    // butterfly follows with easing/lag for a floaty feel
    function animateButterfly() {
      const targetX = parseFloat(glow.style.left) || bx;
      const targetY = parseFloat(glow.style.top) || by;
      bx += (targetX - bx) * 0.06;
      by += (targetY - by) * 0.06 - 0.4; // slight upward bias
      butterfly.style.left = bx + 'px';
      butterfly.style.top = by + 'px';
      requestAnimationFrame(animateButterfly);
    }
    animateButterfly();

    // sparkles on click
    window.addEventListener('click', (e) => {
      spawnClickSparkles(e.clientX, e.clientY, 6);
    });
  }

  function spawnClickSparkles(x, y, count = 8) {
    for (let i = 0; i < count; i++) {
      const s = document.createElement('span');
      s.textContent = '✨';
      s.style.position = 'fixed';
      s.style.left = x + 'px';
      s.style.top = y + 'px';
      s.style.fontSize = rand(0.7, 1.2) + 'rem';
      s.style.zIndex = 260;
      s.style.pointerEvents = 'none';
      s.style.transition = 'transform 0.8s ease-out, opacity 0.8s ease-out';
      document.body.appendChild(s);
      const angle = rand(0, Math.PI * 2);
      const dist = rand(30, 90);
      requestAnimationFrame(() => {
        s.style.transform = `translate(${Math.cos(angle) * dist}px, ${Math.sin(angle) * dist}px) scale(0.3)`;
        s.style.opacity = '0';
      });
      setTimeout(() => s.remove(), 850);
    }
  }

  /* ============================================================
     4. CANVAS — TWINKLING STARFIELD
     ============================================================ */
  function initStarfield() {
    const canvas = $('#canvas-stars');
    const ctx = canvas.getContext('2d');
    let stars = [];
    let w, h;

    function resize() {
      w = canvas.width = window.innerWidth;
      h = canvas.height = window.innerHeight;
      const count = Math.floor((w * h) / 9000); // density scales with screen size
      stars = Array.from({ length: count }, () => ({
        x: rand(0, w),
        y: rand(0, h),
        r: rand(0.4, 1.6),
        baseAlpha: rand(0.25, 0.9),
        speed: rand(0.6, 1.8),
        phase: rand(0, Math.PI * 2)
      }));
    }

    let t = 0;
    function draw() {
      ctx.clearRect(0, 0, w, h);
      t += 0.016;
      for (const s of stars) {
        const alpha = s.baseAlpha * (0.6 + 0.4 * Math.sin(t * s.speed + s.phase));
        ctx.beginPath();
        ctx.fillStyle = `rgba(253, 249, 255, ${alpha.toFixed(2)})`;
        ctx.shadowColor = 'rgba(244, 213, 141, 0.6)';
        ctx.shadowBlur = s.r * 2.4;
        ctx.arc(s.x, s.y, s.r, 0, Math.PI * 2);
        ctx.fill();
      }
      requestAnimationFrame(draw);
    }

    resize();
    window.addEventListener('resize', resize);
    if (!prefersReducedMotion) draw();
    else { // draw a single static frame
      ctx.clearRect(0, 0, w, h);
      for (const s of stars) {
        ctx.beginPath();
        ctx.fillStyle = `rgba(253,249,255,${s.baseAlpha})`;
        ctx.arc(s.x, s.y, s.r, 0, Math.PI * 2);
        ctx.fill();
      }
    }
  }

  /* ============================================================
     5. CANVAS — AMBIENT PARTICLES (fireflies / hearts / sparkles)
     ============================================================ */
  function initAmbientParticles() {
    const canvas = $('#canvas-particles');
    const ctx = canvas.getContext('2d');
    let w, h, particles;

    function makeParticle() {
      const kinds = ['firefly', 'heart', 'spark'];
      const kind = kinds[Math.floor(rand(0, kinds.length))];
      return {
        kind,
        x: rand(0, w),
        y: h + rand(0, 100),
        size: kind === 'heart' ? rand(8, 15) : rand(1.5, 3.5),
        speed: rand(0.25, 0.7),
        sway: rand(0.4, 1.4),
        phase: rand(0, Math.PI * 2),
        alpha: rand(0.35, 0.85)
      };
    }

    function resize() {
      w = canvas.width = window.innerWidth;
      h = canvas.height = window.innerHeight;
      const count = Math.min(38, Math.floor((w * h) / 45000));
      particles = Array.from({ length: count }, makeParticle);
    }

    let t = 0;
    function draw() {
      ctx.clearRect(0, 0, w, h);
      t += 0.016;
      for (const p of particles) {
        p.y -= p.speed;
        p.x += Math.sin(t * p.sway + p.phase) * 0.4;
        if (p.y < -20) { p.y = h + 20; p.x = rand(0, w); }

        ctx.globalAlpha = p.alpha * (0.6 + 0.4 * Math.sin(t * 2 + p.phase));
        if (p.kind === 'firefly') {
          ctx.fillStyle = '#f4d58d';
          ctx.shadowColor = '#f4d58d';
          ctx.shadowBlur = 8;
          ctx.beginPath();
          ctx.arc(p.x, p.y, p.size, 0, Math.PI * 2);
          ctx.fill();
        } else if (p.kind === 'spark') {
          ctx.fillStyle = '#ffffff';
          ctx.shadowColor = '#ffb3d1';
          ctx.shadowBlur = 6;
          ctx.beginPath();
          ctx.arc(p.x, p.y, p.size, 0, Math.PI * 2);
          ctx.fill();
        } else {
          ctx.fillStyle = 'rgba(255,179,209,0.9)';
          ctx.shadowColor = 'rgba(255,179,209,0.7)';
          ctx.shadowBlur = 6;
          ctx.font = `${p.size}px sans-serif`;
          ctx.fillText('❤', p.x, p.y);
        }
      }
      ctx.globalAlpha = 1;
      requestAnimationFrame(draw);
    }

    resize();
    window.addEventListener('resize', resize);
    if (!prefersReducedMotion) draw();
  }

  /* ============================================================
     6. CONSTELLATION THREAD (signature scroll motif)
     ============================================================ */
  function initConstellation() {
    const svg = $('#constellation');
    const path = $('#constellation-path');
    const heartPath = $('#constellation-heart');
    if (!svg || !path) return;

    // inject the gradient definition the CSS references (url(#thread-gradient))
    svg.insertAdjacentHTML('afterbegin', `
      <defs>
        <linearGradient id="thread-gradient" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%"  stop-color="#ffb3d1"/>
          <stop offset="50%" stop-color="#f4d58d"/>
          <stop offset="100%" stop-color="#b6a3e0"/>
        </linearGradient>
      </defs>
    `);

    let docHeight, vw;
    let pathLength = 0;

    function buildPath() {
      docHeight = document.documentElement.scrollHeight;
      vw = window.innerWidth;
      svg.setAttribute('width', vw);
      svg.setAttribute('height', docHeight);
      svg.setAttribute('viewBox', `0 0 ${vw} ${docHeight}`);
      svg.style.height = docHeight + 'px';

      // one anchor point per chapter, alternating left/right like a gentle ribbon
      const anchors = $$('.hero, .chapter');
      const xPattern = [0.5, 0.22, 0.78, 0.22, 0.78, 0.5, 0.22, 0.78, 0.22, 0.78, 0.5];
      const points = anchors.map((el, i) => ({
        x: vw * (xPattern[i % xPattern.length]),
        y: el.offsetTop + el.offsetHeight / 2
      }));

      if (points.length < 2) return;

      // smooth the polyline into a curve using simple quadratic joins
      let d = `M ${points[0].x} ${points[0].y}`;
      for (let i = 1; i < points.length; i++) {
        const prev = points[i - 1];
        const curr = points[i];
        const midX = (prev.x + curr.x) / 2;
        const midY = (prev.y + curr.y) / 2;
        d += ` Q ${prev.x} ${prev.y}, ${midX} ${midY}`;
      }
      d += ` T ${points[points.length - 1].x} ${points[points.length - 1].y}`;
      path.setAttribute('d', d);

      pathLength = path.getTotalLength();
      path.style.strokeDasharray = pathLength;
      path.style.strokeDashoffset = pathLength;

      // position the finale heart centered on chapter 10
      const finale = $('#chapter-10');
      if (finale && heartPath) {
        const cx = vw / 2;
        const cy = finale.offsetTop + finale.offsetHeight * 0.28;
        const scale = Math.max(1, vw / 900);
        const heartD = 'M0,10 C-20,-14 -55,-2 0,34 C55,-2 20,-14 0,10 Z';
        heartPath.setAttribute('d', heartD);
        heartPath.setAttribute('transform', `translate(${cx}, ${cy}) scale(${scale})`);
      }
    }

    function onScroll() {
      const scrollTop = window.scrollY;
      const maxScroll = document.documentElement.scrollHeight - window.innerHeight;
      const progress = Math.min(1, Math.max(0, scrollTop / maxScroll));
      path.style.strokeDashoffset = pathLength * (1 - progress);
    }

    buildPath();
    window.addEventListener('resize', buildPath);
    window.addEventListener('scroll', () => requestAnimationFrame(onScroll), { passive: true });

    // reveal the heart once the finale chapter is reached
    const finale = $('#chapter-10');
    if (finale) {
      const io = new IntersectionObserver((entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) heartPath.classList.add('visible');
        });
      }, { threshold: 0.35 });
      io.observe(finale);
    }
  }

  /* ============================================================
     7. AOS INIT
     ============================================================ */
  function initAOS() {
    if (window.AOS) {
      window.AOS.init({
        duration: 900,
        easing: 'ease-out-cubic',
        offset: 80,
        once: true
      });
    }
  }

  /* ============================================================
     8. CHAPTER 2 — TYPEWRITER
     ============================================================ */
  function initTypewriter() {
    const block = $('#typewriter-2');
    if (!block) return;
    const target = $('.typewriter-line', block);
    let lines = [];
    try { lines = JSON.parse(block.dataset.lines); } catch (e) { lines = []; }
    let started = false;

    function typeLoop(index = 0) {
      if (index >= lines.length) return; // finished — leave the last line visible
      const text = lines[index];
      let i = 0;
      target.textContent = '';
      const typeInterval = setInterval(() => {
        target.textContent = text.slice(0, i + 1);
        i++;
        if (i >= text.length) {
          clearInterval(typeInterval);
          setTimeout(() => typeLoop(index + 1), 950);
        }
      }, 38);
    }

    const io = new IntersectionObserver((entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting && !started) {
          started = true;
          typeLoop(0);
        }
      });
    }, { threshold: 0.5 });
    io.observe(block);
  }

  /* ============================================================
     9. CHAPTER 7 — GALLERY LIGHTBOX
     ============================================================ */
  function initGallery() {
    const items = $$('.gallery-item');
    const lightbox = $('#lightbox');
    const lightboxImg = $('#lightbox-img');
    const caption = $('#lightbox-caption');
    const closeBtn = $('#lightbox-close');
    if (!lightbox) return;

    function open(item) {
      const img = $('img', item);
      lightboxImg.src = img.src;
      lightboxImg.alt = img.alt;
      caption.textContent = item.dataset.caption || '';
      lightbox.classList.add('active');
      lightbox.removeAttribute('aria-hidden');
    }
    function close() {
      lightbox.classList.remove('active');
      lightbox.setAttribute('aria-hidden', 'true');
    }

    items.forEach((item) => item.addEventListener('click', () => open(item)));
    closeBtn.addEventListener('click', close);
    lightbox.addEventListener('click', (e) => { if (e.target === lightbox) close(); });
    window.addEventListener('keydown', (e) => { if (e.key === 'Escape') close(); });
  }

  /* ============================================================
     10. CHAPTER 9 — ENVELOPE + LETTER
     ============================================================ */
  function initLetter() {
    const envelope = $('#envelope');
    const letter = $('#letter');
    const hint = $('#envelope-hint');
    if (!envelope || !letter) return;

    let opened = false;
    let petalTimer = null;

    envelope.addEventListener('click', () => {
      opened = !opened;
      envelope.classList.toggle('open', opened);
      letter.classList.toggle('open', opened);
      hint.textContent = opened ? 'tap to close' : 'tap to open';

      if (opened) {
        letter.scrollIntoView({ behavior: 'smooth', block: 'center' });
        let bursts = 0;
        petalTimer = setInterval(() => {
          if (bursts++ > 14) { clearInterval(petalTimer); return; }
          spawnFloatingEmoji({
            emoji: Math.random() > 0.5 ? '🌸' : '💗',
            left: rand(10, 90),
            duration: rand(3.5, 5.5),
            size: rand(0.9, 1.4),
            direction: 'down',
            container: $('#letter-petals')
          });
        }, 300);
      } else {
        clearInterval(petalTimer);
      }
    });
  }

  /* ============================================================
     11. CHAPTER 10 — FINALE SEQUENCE
     ============================================================ */
  function initFinale() {
    const btn = $('#surprise-btn');
    const music = $('#bg-music');
    if (!btn) return;

    let fired = false;
    btn.addEventListener('click', () => {
      if (fired) return;
      fired = true;
      btn.style.pointerEvents = 'none';
      btn.style.opacity = '0.6';

      swellMusicVolume();
      startHeartRain();
      startFinaleButterflies();
      burstConfetti();
      runFireworks();
      typewriterFinaleText();
    });
  }

  function swellMusicVolume() {
    const music = $('#bg-music');
    const slider = $('#volume-slider');
    if (!music) return;
    let vol = music.volume;
    const target = 0.85;
    const step = setInterval(() => {
      vol = Math.min(target, vol + 0.03);
      music.volume = vol;
      if (slider) slider.value = vol;
      if (vol >= target) clearInterval(step);
    }, 90);
  }

  function startHeartRain() {
    let count = 0;
    const rain = setInterval(() => {
      if (count++ > 60) { clearInterval(rain); return; }
      spawnFloatingEmoji({
        emoji: '❤️',
        left: rand(0, 100),
        duration: rand(4, 7),
        size: rand(1, 1.8),
        direction: 'down'
      });
    }, 160);
  }

  function startFinaleButterflies() {
    let count = 0;
    const flight = setInterval(() => {
      if (count++ > 10) { clearInterval(flight); return; }
      spawnFloatingEmoji({
        emoji: '🦋',
        left: rand(0, 100),
        top: rand(10, 80),
        duration: rand(5, 8),
        size: rand(1.2, 1.8),
        direction: Math.random() > 0.5 ? 'up' : 'down'
      });
    }, 500);
  }

  function burstConfetti() {
    const colors = ['🎉', '💛', '💜', '🎊', '✨'];
    let count = 0;
    const burst = setInterval(() => {
      if (count++ > 40) { clearInterval(burst); return; }
      const fromLeft = count % 2 === 0;
      spawnFloatingEmoji({
        emoji: colors[Math.floor(rand(0, colors.length))],
        left: fromLeft ? rand(0, 20) : rand(80, 100),
        duration: rand(3, 5.5),
        size: rand(0.9, 1.5),
        direction: 'down'
      });
    }, 70);
  }

  function runFireworks() {
    const canvas = $('#canvas-fireworks');
    if (!canvas || prefersReducedMotion) return;
    const ctx = canvas.getContext('2d');
    const finale = $('#chapter-10');
    let w, h;
    function resize() {
      w = canvas.width = finale.offsetWidth;
      h = canvas.height = finale.offsetHeight;
    }
    resize();
    window.addEventListener('resize', resize);

    let particles = [];
    function explode(x, y) {
      const hue = [ '#ffb3d1', '#f4d58d', '#b6a3e0', '#e8b4a6' ][Math.floor(rand(0, 4))];
      const count = 34;
      for (let i = 0; i < count; i++) {
        const angle = (Math.PI * 2 * i) / count;
        const speed = rand(1.5, 4.5);
        particles.push({
          x, y,
          vx: Math.cos(angle) * speed,
          vy: Math.sin(angle) * speed,
          life: 1,
          color: hue
        });
      }
    }

    let running = true;
    function loop() {
      if (!running) return;
      ctx.fillStyle = 'rgba(12,6,24,0.18)';
      ctx.fillRect(0, 0, w, h);
      particles.forEach((p) => {
        p.x += p.vx;
        p.y += p.vy;
        p.vy += 0.03; // gentle gravity
        p.life -= 0.014;
        ctx.globalAlpha = Math.max(p.life, 0);
        ctx.fillStyle = p.color;
        ctx.beginPath();
        ctx.arc(p.x, p.y, 2.2, 0, Math.PI * 2);
        ctx.fill();
      });
      ctx.globalAlpha = 1;
      particles = particles.filter((p) => p.life > 0);
      requestAnimationFrame(loop);
    }
    loop();

    let launches = 0;
    const launcher = setInterval(() => {
      if (launches++ > 7) { clearInterval(launcher); return; }
      explode(rand(w * 0.15, w * 0.85), rand(h * 0.15, h * 0.55));
    }, 700);

    // let the canvas settle and clear after the show
    setTimeout(() => {
      running = false;
      ctx.clearRect(0, 0, w, h);
    }, 9000);
  }

  function typewriterFinaleText() {
    const l1 = $('#finale-line-1');
    const l2 = $('#finale-line-2');
    const l3 = $('#finale-line-3');

    const text1 = "No matter where life takes us,\nyou'll always be my favorite person.\n\nThank you for being my better half.\n\nHappy Friendship Day,\nAmmaaaaaa \u2764\ufe0f";
    const text2 = "Forever yours,\n\nUr Shershaaaaaa. \ud83e\udd42";
    const text3 = "Love you bujjiiiiii \ud83d\ude2d\ud83e\udee0\ud83c\udf0e\u267e\ufe0f\ud83d\udc93\ud83e\ude84\ud83d\udd2e\ud83d\udcaf\ud83e\uddff";

    function typeInto(el, text, speed = 30) {
      return new Promise((resolve) => {
        el.style.opacity = '1';
        let i = 0;
        const iv = setInterval(() => {
          el.textContent = text.slice(0, i + 1);
          i++;
          if (i >= text.length) { clearInterval(iv); resolve(); }
        }, speed);
      });
    }

    (async () => {
      await typeInto(l1, text1, 28);
      await new Promise((r) => setTimeout(r, 3000));
      await typeInto(l2, text2, 45);
      await new Promise((r) => setTimeout(r, 1600));
      await typeInto(l3, text3, 45);
    })();
  }

  /* ============================================================
     12. MUSIC PLAYER CONTROLS
     ============================================================ */
  function initMusicPlayer() {
    const music = $('#bg-music');
    const player = $('#music-player');
    const toggleBtn = $('#music-toggle');
    const icon = $('#music-icon');
    const muteBtn = $('#mute-toggle');
    const slider = $('#volume-slider');

    music.volume = 0.5;

    function play() {
      music.play().catch(() => {
        // autoplay was blocked or the placeholder file is missing — fail silently
      });
      icon.textContent = '❚❚';
    }
    function pause() {
      music.pause();
      icon.textContent = '♪';
    }

    toggleBtn.addEventListener('click', () => {
      if (music.paused) play(); else pause();
    });
    muteBtn.addEventListener('click', () => {
      music.muted = !music.muted;
      muteBtn.textContent = music.muted ? '🔇' : '🔊';
    });
    slider.addEventListener('input', (e) => {
      music.volume = parseFloat(e.target.value);
      if (music.volume === 0) {
        music.muted = true;
        muteBtn.textContent = '🔇';
      } else if (music.muted) {
        music.muted = false;
        muteBtn.textContent = '🔊';
      }
    });

    // exposed so the intro "Begin" button and the finale can trigger playback
    window.__ourStoryMusic = { play, pause, showPlayer: () => player.classList.add('visible') };
  }

  /* ============================================================
     13. RIPPLE EFFECT ON GLASS BUTTONS
     ============================================================ */
  function initRipples() {
    $$('.btn-glass').forEach((btn) => {
      btn.addEventListener('click', (e) => {
        const rect = btn.getBoundingClientRect();
        const ripple = document.createElement('span');
        const size = Math.max(rect.width, rect.height);
        ripple.className = 'ripple';
        ripple.style.width = ripple.style.height = size + 'px';
        ripple.style.left = (e.clientX - rect.left - size / 2) + 'px';
        ripple.style.top = (e.clientY - rect.top - size / 2) + 'px';
        btn.appendChild(ripple);
        setTimeout(() => ripple.remove(), 750);
      });
    });
  }

  /* ============================================================
     14. EASTER EGGS
     ============================================================ */
  function initEasterEggs() {
    // clicking any drifting butterfly (chapter 1, or finale butterflies)
    document.addEventListener('click', (e) => {
      if (e.target.classList && e.target.classList.contains('drift-butterfly')) {
        showToast('You make my world brighter. 🦋');
      }
    });

    // the moon, fixed top-right
    const moon = $('#moon');
    if (moon) {
      moon.addEventListener('click', () => {
        showToast('Some friendships are written by fate. 🌙');
      });
    }

    // periodically spawn a few clickable floating hearts across the page
    function spawnClickableHeart() {
      spawnFloatingEmoji({
        emoji: '❤️',
        left: rand(5, 95),
        top: rand(60, 95),
        duration: rand(6, 9),
        size: rand(1.3, 1.9),
        direction: 'up',
        clickable: true,
        onClick: () => showToast('Forever Best Friends ❤️')
      });
    }
    setInterval(spawnClickableHeart, 5000);

    // keyboard easter eggs
    window.addEventListener('keydown', (e) => {
      if (e.key.toLowerCase() === 'r') {
        for (let i = 0; i < 18; i++) {
          setTimeout(() => spawnFloatingEmoji({
            emoji: '🌹', left: rand(0, 100), duration: rand(4, 6.5), size: rand(1, 1.7)
          }), i * 60);
        }
      }
      if (e.key.toLowerCase() === 'h') {
        for (let i = 0; i < 18; i++) {
          setTimeout(() => spawnFloatingEmoji({
            emoji: '❤️', left: rand(0, 100), top: rand(70, 100), duration: rand(4, 6.5),
            size: rand(1, 1.6), direction: 'up'
          }), i * 60);
        }
      }
    });

    // double-click anywhere: sparkling stars burst
    window.addEventListener('dblclick', (e) => {
      spawnClickSparkles(e.clientX, e.clientY, 14);
    });
  }

  /* ============================================================
     15. BOOT SEQUENCE
     ============================================================ */
  document.addEventListener('DOMContentLoaded', () => {
    // ambient layers can run immediately, underneath the loading screen
    initCursor();
    initStarfield();
    initAmbientParticles();
    initMusicPlayer();
    initRipples();
    initEasterEggs();

    runLoadingScreen(() => {
      runIntroScreen(() => {
        // "Begin" was clicked — start the music and reveal the story
        window.__ourStoryMusic.play();
        window.__ourStoryMusic.showPlayer();

        const story = $('#story');
        story.classList.add('visible');
        story.removeAttribute('aria-hidden');

        initAOS();
        initConstellation();
        initTypewriter();
        initGallery();
        initLetter();
        initFinale();

        // give layout a moment to settle, then refresh AOS + constellation geometry
        setTimeout(() => {
          if (window.AOS) window.AOS.refresh();
          window.dispatchEvent(new Event('resize'));
        }, 600);
      });
    });
  });

})();
// ================= MUSIC PLAYER =================

const bgMusic = document.getElementById("bg-music");
const beginBtn = document.getElementById("begin-btn");

if (bgMusic) {
    bgMusic.volume = 0.5;
}

// Play music after user clicks Begin
if (beginBtn && bgMusic) {
    beginBtn.addEventListener("click", function () {

        bgMusic.play().then(() => {
            console.log("Music Playing");
        }).catch((err)=>{
            console.log(err);
        });

    });
}

// Keyboard shortcut (M) Play/Pause
document.addEventListener("keydown",function(e){

    if(e.key==="m" || e.key==="M"){

        if(bgMusic.paused){

            bgMusic.play();

        }else{

            bgMusic.pause();

        }

    }

});
