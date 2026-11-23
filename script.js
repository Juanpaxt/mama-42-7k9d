(() => {
  'use strict';

  const body = document.body;
  const intro = document.getElementById('intro');
  const openGift = document.getElementById('openGift');
  const musicBtn = document.getElementById('musicBtn');
  const confettiBtn = document.getElementById('confettiBtn');
  const blowBtn = document.getElementById('blowBtn');
  const cake = document.getElementById('cake');
  const wish = document.getElementById('wish');
  const polaroid = document.getElementById('polaroid');
  const foto = document.getElementById('foto');

  const params = new URLSearchParams(location.search);
  const preview = params.has('preview');
  const reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  if (params.has('still')) body.classList.add('still');
  if (params.has('og')) body.classList.add('og');

  const pageRegions = document.querySelectorAll('.hero, main, .footer, .music');
  pageRegions.forEach((el) => { el.inert = true; });

  function setPageInert(value) {
    pageRegions.forEach((el) => { el.inert = value; });
  }

  /* ---------- Música ---------- */
  const FREQ = {
    C3: 130.81, F3: 174.61, G3: 196.0,
    C4: 261.63, D4: 293.66, E4: 329.63, F4: 349.23, G4: 392.0, A4: 440.0, B4: 493.88,
    C5: 523.25, D5: 587.33, E5: 659.25, F5: 698.46, G5: 783.99, A5: 880.0, C6: 1046.5
  };

  const MELODY = [
    ['G4', .5], ['G4', .5], ['A4', 1], ['G4', 1], ['C5', 1], ['B4', 1.5], ['', .5],
    ['G4', .5], ['G4', .5], ['A4', 1], ['G4', 1], ['D5', 1], ['C5', 2],
    ['G4', .5], ['G4', .5], ['G5', 1], ['E5', 1], ['C5', 1], ['D5', 1], ['C5', 2],
    ['F5', .5], ['F5', .5], ['E5', 1], ['C5', 1], ['D5', 1], ['C5', 2]
  ];

  const BEAT = 0.56;
  let audioCtx = null;
  let master = null;
  let musicStarted = false;
  let musicTimer = null;
  let musicOn = true;

  try {
    musicOn = localStorage.getItem('regalo-mama-musica') !== 'off';
  } catch (e) { /* modo privado */ }

  function ensureAudio() {
    if (audioCtx) return;
    const AudioCtx = window.AudioContext || window.webkitAudioContext;
    if (!AudioCtx) return;
    audioCtx = new AudioCtx();
    master = audioCtx.createGain();
    master.gain.value = musicOn ? 0.8 : 0;
    master.connect(audioCtx.destination);
  }

  function musicBoxNote(freq, when, dur, vol) {
    if (!audioCtx || !master) return;
    const g = audioCtx.createGain();
    g.gain.setValueAtTime(0.0001, when);
    g.gain.exponentialRampToValueAtTime(vol, when + 0.012);
    g.gain.exponentialRampToValueAtTime(0.0001, when + dur);

    const filter = audioCtx.createBiquadFilter();
    filter.type = 'lowpass';
    filter.frequency.value = 3600;

    const o1 = audioCtx.createOscillator();
    o1.type = 'triangle';
    o1.frequency.value = freq;

    const o2 = audioCtx.createOscillator();
    o2.type = 'sine';
    o2.frequency.value = freq * 2;

    const g2 = audioCtx.createGain();
    g2.gain.value = 0.22;

    o1.connect(filter);
    o2.connect(g2);
    g2.connect(filter);
    filter.connect(g);
    g.connect(master);

    const end = when + dur + 0.05;
    o1.start(when); o2.start(when);
    o1.stop(end); o2.stop(end);
  }

  function scheduleSong() {
    if (!audioCtx || !musicStarted) return;
    const start = audioCtx.currentTime + 0.12;
    let t = start;

    MELODY.forEach(([note, beats]) => {
      if (note) musicBoxNote(FREQ[note], t, beats * BEAT * 0.92, 0.11);
      t += beats * BEAT;
    });

    // Notas graves muy suaves al inicio de cada frase.
    [[0, 'C3'], [6, 'F3'], [12, 'G3'], [19, 'C3']].forEach(([beat, note]) => {
      musicBoxNote(FREQ[note], start + beat * BEAT, 2.4 * BEAT, 0.04);
    });

    const loopMs = (t - start + 1.6) * 1000;
    musicTimer = window.setTimeout(scheduleSong, loopMs);
  }

  function startMusic() {
    if (!musicOn) return;
    ensureAudio();
    if (!audioCtx) return;
    audioCtx.resume().catch(() => {});
    if (!musicStarted) {
      musicStarted = true;
      scheduleSong();
    }
    master.gain.cancelScheduledValues(audioCtx.currentTime);
    master.gain.setTargetAtTime(0.8, audioCtx.currentTime, 0.08);
  }

  function stopMusic() {
    if (!audioCtx) return;
    window.clearTimeout(musicTimer);
    musicStarted = false;
    master.gain.cancelScheduledValues(audioCtx.currentTime);
    master.gain.setTargetAtTime(0, audioCtx.currentTime, 0.08);
  }

  function setMusic(on, save = true) {
    musicOn = on;
    body.classList.toggle('music-off', !on);
    musicBtn.setAttribute('aria-pressed', String(on));
    musicBtn.setAttribute('aria-label', on ? 'Silenciar música' : 'Activar música');
    if (save) {
      try { localStorage.setItem('regalo-mama-musica', on ? 'on' : 'off'); } catch (e) { /* nada */ }
    }
    if (on) startMusic();
    else stopMusic();
  }

  function sfxTone(freq, dur, vol, type = 'sine', slideTo = null) {
    if (!musicOn) return;
    ensureAudio();
    if (!audioCtx) return;
    audioCtx.resume().catch(() => {});
    const now = audioCtx.currentTime;
    const o = audioCtx.createOscillator();
    const g = audioCtx.createGain();
    o.type = type;
    o.frequency.setValueAtTime(freq, now);
    if (slideTo) o.frequency.exponentialRampToValueAtTime(slideTo, now + dur);
    g.gain.setValueAtTime(0.0001, now);
    g.gain.exponentialRampToValueAtTime(vol, now + 0.01);
    g.gain.exponentialRampToValueAtTime(0.0001, now + dur);
    o.connect(g);
    g.connect(master);
    o.start(now);
    o.stop(now + dur + 0.02);
  }

  function blowSound() {
    if (!musicOn) return;
    ensureAudio();
    if (!audioCtx) return;
    audioCtx.resume().catch(() => {});
    const now = audioCtx.currentTime;
    const dur = 0.75;
    const buffer = audioCtx.createBuffer(1, Math.floor(audioCtx.sampleRate * dur), audioCtx.sampleRate);
    const data = buffer.getChannelData(0);
    for (let i = 0; i < data.length; i++) {
      data[i] = (Math.random() * 2 - 1) * (1 - i / data.length);
    }
    const src = audioCtx.createBufferSource();
    src.buffer = buffer;
    const filter = audioCtx.createBiquadFilter();
    filter.type = 'bandpass';
    filter.Q.value = 0.8;
    filter.frequency.setValueAtTime(760, now);
    filter.frequency.exponentialRampToValueAtTime(210, now + dur);
    const g = audioCtx.createGain();
    g.gain.setValueAtTime(0.0001, now);
    g.gain.exponentialRampToValueAtTime(0.2, now + 0.05);
    g.gain.exponentialRampToValueAtTime(0.0001, now + dur);
    src.connect(filter);
    filter.connect(g);
    g.connect(master);
    src.start(now);
    src.stop(now + dur);
  }

  function chime() {
    if (!musicOn) return;
    ensureAudio();
    if (!audioCtx) return;
    audioCtx.resume().catch(() => {});
    const now = audioCtx.currentTime;
    [['C5', 0], ['E5', 0.11], ['G5', 0.22], ['C6', 0.34]].forEach(([n, d]) => {
      musicBoxNote(FREQ[n], now + d, 0.9, 0.1);
    });
  }

  musicBtn.addEventListener('click', () => setMusic(!musicOn));

  /* ---------- Confeti ---------- */
  const canvas = document.getElementById('confetti');
  const ctx = canvas.getContext('2d');
  const COLORS = ['#ff5c8a', '#ffc93c', '#2ec4b6', '#7b5ea7', '#4d96ff', '#ff7a59', '#ffffff'];
  let W = window.innerWidth;
  let H = window.innerHeight;
  let particles = [];
  let raf = null;

  function sizeCanvas() {
    const dpr = Math.min(window.devicePixelRatio || 1, 2);
    W = window.innerWidth;
    H = window.innerHeight;
    canvas.width = Math.floor(W * dpr);
    canvas.height = Math.floor(H * dpr);
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
  }

  function burst(x, y, count = 90, power = 10) {
    if (reduceMotion) return;
    for (let i = 0; i < count; i++) {
      const angle = Math.random() * Math.PI * 2;
      const speed = Math.random() * power + 2;
      particles.push({
        x,
        y,
        vx: Math.cos(angle) * speed * (0.6 + Math.random() * 0.8),
        vy: Math.sin(angle) * speed - Math.random() * 5,
        w: 5 + Math.random() * 6,
        h: 8 + Math.random() * 8,
        color: COLORS[Math.floor(Math.random() * COLORS.length)],
        rot: Math.random() * Math.PI * 2,
        vr: (Math.random() - 0.5) * 0.3,
        shape: Math.random() > 0.78 ? 'circle' : 'rect',
        life: 110 + Math.random() * 90,
        maxLife: 200
      });
    }
    if (!raf) raf = requestAnimationFrame(tick);
  }

  function tick() {
    ctx.clearRect(0, 0, W, H);
    for (let i = particles.length - 1; i >= 0; i--) {
      const p = particles[i];
      p.vy += 0.2;
      p.vx *= 0.994;
      p.vy *= 0.994;
      p.x += p.vx;
      p.y += p.vy;
      p.rot += p.vr;
      p.life -= 1;

      if (p.life <= 0 || p.y > H + 60 || p.x < -60 || p.x > W + 60) {
        particles.splice(i, 1);
        continue;
      }

      ctx.save();
      ctx.globalAlpha = Math.min(1, p.life / 55);
      ctx.translate(p.x, p.y);
      ctx.rotate(p.rot);
      ctx.fillStyle = p.color;
      if (p.shape === 'circle') {
        ctx.beginPath();
        ctx.arc(0, 0, p.w / 2, 0, Math.PI * 2);
        ctx.fill();
      } else {
        ctx.fillRect(-p.w / 2, -p.h / 2, p.w, p.h);
      }
      ctx.restore();
    }

    if (particles.length) {
      raf = requestAnimationFrame(tick);
    } else {
      raf = null;
      ctx.clearRect(0, 0, W, H);
    }
  }

  function celebrate() {
    burst(W * 0.5, H * 0.36, 120, 13);
    window.setTimeout(() => burst(W * 0.18, H * 0.3, 60, 10), 140);
    window.setTimeout(() => burst(W * 0.82, H * 0.28, 60, 10), 260);
  }

  sizeCanvas();
  window.addEventListener('resize', sizeCanvas);

  confettiBtn.addEventListener('click', () => {
    burst(W * 0.5, H * 0.62, 140, 13);
    sfxTone(520, 0.12, 0.06, 'triangle', 880);
  });

  /* ---------- Apertura del regalo ---------- */
  let opened = false;

  function markReveals() {
    document.querySelectorAll('.reveal').forEach((el) => el.classList.add('is-visible'));
  }

  function openPage(withSound = true) {
    if (opened) return;
    opened = true;
    body.classList.remove('intro-open');
    body.classList.add('opened');
    intro.classList.add('is-closing');
    intro.setAttribute('aria-hidden', 'true');
    setPageInert(false);
    window.setTimeout(() => intro.remove(), reduceMotion ? 80 : 780);

    if (withSound) {
      celebrate();
      if (musicOn) startMusic();
      window.setTimeout(() => sfxTone(660, 0.18, 0.06, 'triangle', 990), 150);
    }

    const title = document.querySelector('.hero__title');
    if (title) title.focus({ preventScroll: true });
  }

  openGift.addEventListener('click', () => openPage(true));

  /* ---------- Foto ---------- */
  function photoLoaded() {
    polaroid.classList.add('has-photo');
  }

  if (foto.complete && foto.naturalWidth > 0) {
    photoLoaded();
  } else if (foto.complete) {
    foto.hidden = true;
  } else {
    foto.addEventListener('load', photoLoaded);
    foto.addEventListener('error', () => {
      foto.hidden = true;
    });
  }

  /* ---------- Cartitas ---------- */
  function setCardState(card, open) {
    const front = card.querySelector('.flip__front');
    const back = card.querySelector('.flip__back');
    card.setAttribute('aria-expanded', String(open));
    if (front) front.setAttribute('aria-hidden', String(open));
    if (back) back.setAttribute('aria-hidden', String(!open));
  }

  document.querySelectorAll('.flip').forEach((card) => {
    card.addEventListener('click', () => {
      const open = card.getAttribute('aria-expanded') === 'true';
      setCardState(card, !open);
      sfxTone(open ? 430 : 520, 0.07, 0.035, 'sine');
    });
  });
  /* ---------- Pastel ---------- */
  let candlesOut = false;

  function relight() {
    candlesOut = false;
    cake.classList.remove('is-blown');
    wish.classList.remove('is-shown');
    wish.setAttribute('aria-hidden', 'true');
    blowBtn.textContent = 'Soplar las velas';
  }

  function blowCandles() {
    if (candlesOut) {
      relight();
      return;
    }
    candlesOut = true;
    cake.classList.add('is-blown');
    wish.classList.add('is-shown');
    wish.setAttribute('aria-hidden', 'false');
    blowBtn.textContent = 'Volver a pedir un deseo';

    const live = document.getElementById('wishLive');
    if (live) live.textContent = '¡Deseo pedido! Que este año te devuelva todo el amor que das, y un poquito más.';

    blowSound();
    const r = cake.getBoundingClientRect();
    burst(r.left + r.width / 2, r.top + r.height * 0.4, 130, 12);
    window.setTimeout(() => burst(r.left + r.width / 2, r.top + r.height * 0.2, 50, 8), 220);
    window.setTimeout(chime, 720);
  }

  blowBtn.addEventListener('click', blowCandles);
  cake.addEventListener('click', () => {
    if (!candlesOut) blowCandles();
  });

  /* ---------- Revelado al hacer scroll ---------- */
  const revealEls = document.querySelectorAll('.reveal');

  if (preview || reduceMotion || !('IntersectionObserver' in window)) {
    markReveals();
  } else {
    const observer = new IntersectionObserver((entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          entry.target.classList.add('is-visible');
          observer.unobserve(entry.target);
        }
      });
    }, { threshold: 0.12, rootMargin: '0px 0px -45px' });

    revealEls.forEach((el) => observer.observe(el));
  }

  /* ---------- Estado inicial ---------- */
  body.classList.toggle('music-off', !musicOn);
  musicBtn.setAttribute('aria-pressed', String(musicOn));
  musicBtn.setAttribute('aria-label', musicOn ? 'Silenciar música' : 'Activar música');

  if (preview) {
    body.classList.remove('intro-open');
    body.classList.add('opened', 'preview');
    intro.remove();
    setPageInert(false);
    markReveals();

    if (params.has('flipped')) {
      document.querySelectorAll('.flip').forEach((card) => setCardState(card, true));
    }

    if (params.has('blown')) {
      cake.classList.add('is-blown');
      wish.classList.add('is-shown');
      wish.setAttribute('aria-hidden', 'false');
      blowBtn.textContent = 'Volver a pedir un deseo';
    }

    const target = params.get('scroll');
    if (target) {
      window.requestAnimationFrame(() => {
        const el = document.getElementById(target);
        if (el) el.scrollIntoView({ block: 'start' });
      });
    }

    const focus = params.get('focus');
    if (focus) {
      document.querySelectorAll('.hero, main > .section, .footer').forEach((el) => {
        if (el.id !== focus) el.style.display = 'none';
      });
      window.scrollTo(0, 0);
    }
  }
})();
