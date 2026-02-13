

document.addEventListener('DOMContentLoaded', () => {
  /* ---------------- WELCOME ANIMATION ---------------- */
  const welcomeOverlay = document.getElementById('welcome-overlay');
  const welcomeCube = document.getElementById('welcome-cube');
  const welcomeEnter = document.getElementById('welcome-enter');
  const welcomeSkip = document.getElementById('welcome-skip');
  const welcomeNoShow = document.getElementById('welcome-no-show');

  function showWelcome() {
    if (!welcomeOverlay) return;
    if (localStorage.getItem('mohit_welcome_hide') === '1') { welcomeOverlay.style.display = 'none'; return; }
    welcomeOverlay.style.display = 'flex';
    welcomeOverlay.setAttribute('aria-hidden', 'false');

    // cube auto-rotate (CSS transform updates)
    let running = true;
    let rx = -18, ry = 25;
    const anim = setInterval(() => {
      if (!running) return;
      ry += 2.4;
      rx += Math.sin(Date.now() / 1600) * 0.6;
      if (welcomeCube) welcomeCube.style.transform = `rotateX(${rx}deg) rotateY(${ry}deg)`;
    }, 90);

    function close(clean) {
      running = false;
      clearInterval(anim);
      if (welcomeNoShow?.checked) localStorage.setItem('mohit_welcome_hide', '1');
      welcomeOverlay.style.transition = 'opacity .45s ease';
      welcomeOverlay.style.opacity = 0;
      setTimeout(() => {
        welcomeOverlay.style.display = 'none';
        welcomeOverlay.setAttribute('aria-hidden', 'true');
        welcomeOverlay.style.opacity = 1;
      }, 480);
    }

    welcomeEnter?.addEventListener('click', () => close(), { once: true });
    welcomeSkip?.addEventListener('click', () => close(), { once: true });
    welcomeOverlay?.addEventListener('keydown', (e) => { if (e.key === 'Escape') close(); });
  }

  // show on load unless disabled
  showWelcome();

  /* ---------------- HERO SLIDESHOW ---------------- */
  (function heroSlides() {
    const slides = Array.from(document.querySelectorAll('.hs-slide'));
    if (!slides.length) return;
    let idx = 0;
    slides.forEach((s, i) => s.classList.toggle('hs-active', i === 0));
    setInterval(() => {
      slides[idx].classList.remove('hs-active');
      idx = (idx + 1) % slides.length;
      slides[idx].classList.add('hs-active');
    }, 3600);
  })();

  /* ---------------- CAROUSELS ---------------- */
  (function carousels() {
    document.querySelectorAll('[data-carousel]').forEach(car => {
      const track = car.querySelector('.car-track');
      const items = Array.from(track.querySelectorAll('.car-item'));
      const prev = car.querySelector('.prev');
      const next = car.querySelector('.next');
      if (!items.length) return;
      let idx = 0;

      const update = () => {
        items.forEach((it, i) => {
          const offset = i - idx;
          it.style.transform = `translateX(${offset * 12}%) scale(${i === idx ? 1 : 0.96})`;
          it.style.opacity = i === idx ? '1' : '0.82';
        });
        // ensure first visible
        const scrollX = Math.max(0, items[idx].offsetLeft - track.clientWidth * 0.08);
        track.scrollTo({ left: scrollX, behavior: 'smooth' });
      };

      prev?.addEventListener('click', () => { idx = Math.max(0, idx - 1); update(); });
      next?.addEventListener('click', () => { idx = Math.min(items.length - 1, idx + 1); update(); });

      let auto = setInterval(() => { idx = (idx + 1) % items.length; update(); }, 4800);
      car.addEventListener('mouseenter', () => clearInterval(auto));
      car.addEventListener('mouseleave', () => auto = setInterval(() => { idx = (idx + 1) % items.length; update(); }, 4800));
      update();
      window.addEventListener('resize', update);
    });
  })();

  /* ---------------- NAV RIPPLE EFFECT ---------------- */
  document.querySelectorAll('.nav-link').forEach(link => {
    link.addEventListener('pointerdown', (e) => {
      const rect = link.getBoundingClientRect();
      const rx = (e.clientX - rect.left);
      const ry = (e.clientY - rect.top);
      link.style.setProperty('--rx', rx + 'px');
      link.style.setProperty('--ry', ry + 'px');
      link.classList.add('ripple');
      setTimeout(() => link.classList.remove('ripple'), 600);
    });
  });

  /* ---------------- TILT & PARALLAX ---------------- */
  (function tiltAndParallax() {
    document.querySelectorAll('.glass-card, .hero-card').forEach(el => {
      el.addEventListener('mousemove', (e) => {
        const r = el.getBoundingClientRect();
        const x = (e.clientX - r.left) / r.width;
        const y = (e.clientY - r.top) / r.height;
        const rx = (y - 0.5) * 8; // tilt X
        const ry = (x - 0.5) * -10; // tilt Y
        el.style.transform = `perspective(900px) rotateX(${rx}deg) rotateY(${ry}deg) translateZ(6px)`;
        el.style.boxShadow = '0 30px 90px rgba(2,6,23,0.6)';
      });
      el.addEventListener('mouseleave', () => {
        el.style.transform = '';
        el.style.boxShadow = '';
      });
    });

    const blobs = document.querySelectorAll('.blob');
    document.addEventListener('mousemove', (e) => {
      const w = window.innerWidth, h = window.innerHeight;
      const mx = (e.clientX / w - 0.5) * 2;
      const my = (e.clientY / h - 0.5) * 2;
      blobs.forEach((b, i) => {
        const depth = (i + 1) * 8;
        b.style.transform = `translate(${mx * depth}px, ${my * depth}px)`;
      });
    });
  })();

  /* ---------------- FADE IN ON SCROLL ---------------- */
  (function fadeOnScroll() {
    const nodes = document.querySelectorAll('[data-animate]');
    const io = new IntersectionObserver(entries => {
      entries.forEach(e => {
        if (e.isIntersecting) {
          e.target.style.opacity = 0;
          e.target.style.transform = 'translateY(10px)';
          requestAnimationFrame(() => {
            e.target.style.transition = 'opacity .8s ease, transform .8s cubic-bezier(.2,.9,.2,1)';
            e.target.style.opacity = 1;
            e.target.style.transform = 'translateY(0)';
          });
          io.unobserve(e.target);
        }
      });
    }, { threshold: 0.12 });
    nodes.forEach(n => io.observe(n));
  })();

  /* ---------------- SECTION CLICK VISUAL FEEDBACK (enhanced Gen-AI feeling) ---------------- */
  document.querySelectorAll('section.panel, section.hero').forEach(sec => {
    sec.addEventListener('click', (e) => {
      // ignore clicks inside inputs / agent / links / buttons
      if (e.target.closest('input,button,a')) return;

      // create neon ripple at click position
      const rect = sec.getBoundingClientRect();
      const cx = e.clientX - rect.left;
      const cy = e.clientY - rect.top;

      const ripple = document.createElement('div');
      ripple.className = 'genai-ripple';
      ripple.style.left = (cx) + 'px';
      ripple.style.top = (cy) + 'px';

      // particles
      const particles = document.createElement('div');
      particles.className = 'genai-particles';
      for (let i = 0; i < 8; i++) {
        const p = document.createElement('span');
        p.className = 'genai-p';
        p.style.setProperty('--dir', (Math.random() * 360) + 'deg');
        p.style.setProperty('--dist', (80 + Math.random() * 120) + 'px');
        p.style.setProperty('--delay', (Math.random() * 120) + 'ms');
        particles.appendChild(p);
      }

      sec.appendChild(ripple);
      sec.appendChild(particles);

      // small AI-like pulse on the section
      sec.classList.add('genai-hit');
      setTimeout(() => sec.classList.remove('genai-hit'), 900);

      // ai character visual reaction (top-right)
      const ai = document.getElementById('ai-char');
      if (ai) {
        const reactions = ['smile','wink','laugh','bounce'];
        const pick = reactions[Math.floor(Math.random() * reactions.length)];
        ai.classList.remove('smile','wink','laugh','bounce');
        void ai.offsetWidth; // reflow
        ai.classList.add(pick);

        // show the ai speech bubble briefly (visual)
        const speech = ai.querySelector('.ai-speech');
        if (speech) {
          speech.textContent = '✨';
          speech.classList.add('show');
          const live = document.getElementById('ai-live');
          if (live) live.textContent = 'Assistant: ✨';
          setTimeout(() => {
            speech.classList.remove('show');
            // reset reaction class
            ai.classList.remove(pick);
          }, 1400);
        } else {
          // remove reaction after short time
          setTimeout(() => ai.classList.remove(pick), 1400);
        }
      }

      // cleanup after finish (matches animation durations in CSS)
      setTimeout(() => {
        ripple.remove();
        particles.remove();
      }, 1100);
    });
  });

  /* ---------------- MOHIT'S AGENT (fixed & working) ---------------- */
  (function mohitsAgent() {
    // Knowledge base
    const kb = {
      name: "Mohit Kumar",
      academics: "BCA student at RKDF University, Ranchi. Strong foundation in computer fundamentals & programming.",
      skills: ["HTML", "CSS", "C++", "DSA", "JavaScript"],
      certifications: [
        { id: "VFQSQXJVOBJ3", title: "AI Foundations (Coursera)", url: "https://www.coursera.org/account/accomplishments/verify/VFQSQXJVOBJ3" },
        { id: "7Y3T1B1EHSKW", title: "Web Development (Coursera)", url: "https://www.coursera.org/account/accomplishments/verify/7Y3T1B1EHSKW" }
      ],
      achievements: ["National-level long jump player", "Multiple medals & certificates", "Awarded 'Mr. Decent'"],
      extracurricular: ["Track & Field — long jump & sprint"],
      marks: { class10: "79%", class12: "71% (PCM)" },
      interests: ["Fitness & Bodybuilding", "Cooking", "Respect & Discipline"]
    };

    const agentMini = document.getElementById('agent-mini');
    const agentPanel = document.getElementById('agent-panel');
    const agentClose = document.getElementById('agent-close');
    const agentBody = document.getElementById('agent-body');
    const agentForm = document.getElementById('agent-form');
    const agentInput = document.getElementById('agent-input');

    // Toggle panel
    function toggleAgent(open) {
      if (!agentPanel) return;
      if (open === undefined) open = !agentPanel.classList.contains('open');
      if (open) {
        agentPanel.classList.add('open');
        agentPanel.setAttribute('aria-hidden', 'false');
        agentInput?.focus();
      } else {
        agentPanel.classList.remove('open');
        agentPanel.setAttribute('aria-hidden', 'true');
        agentMini?.focus();
      }
    }

    agentMini?.addEventListener('click', () => toggleAgent());
    agentClose?.addEventListener('click', () => toggleAgent(false));

    // Small utility: append message
    function appendMsg(type, html) {
      const el = document.createElement('div');
      el.className = 'agent-msg ' + (type === 'bot' ? 'bot' : 'user');
      el.innerHTML = html;
      agentBody.appendChild(el);
      agentBody.scrollTop = agentBody.scrollHeight;
    }

    // Simple NLU + search
    function searchKB(q) {
      const t = q.toLowerCase();
      const out = [];

      // direct intents
      if (/\bskill|skills\b/.test(t)) out.push({ type: 'skills', data: kb.skills });
      if (/\b(cert|certificate|coursera|vfqsq|7y3t)/i.test(t)) out.push({ type: 'certifications', data: kb.certifications });
      if (/\b(medal|award|achiev|long jump|national|athlet)/i.test(t)) out.push({ type: 'achievements', data: kb.achievements });
      if (/\b(class 10|10th|79|class10)/.test(t)) out.push({ type: 'marks', data: { class10: kb.marks.class10 } });
      if (/\b(class 12|12th|71|class12|pcm)/.test(t)) out.push({ type: 'marks', data: { class12: kb.marks.class12 } });
      if (/\b(fit|fitness|bodybuild|cook|cooking|values|mr decent)/.test(t)) out.push({ type: 'interests', data: kb.interests });
      if (/\bbca|rkdf|university|study|academics?/.test(t)) out.push({ type: 'academics', data: kb.academics });
      if (/\bmotivat|inspir|drive|what motivates|motivation\b/.test(t)) out.push({ type: 'motivation', data: {
        text: [
          "I am motivated by curiosity and the desire to grow — to learn new things and create meaningful projects.",
          "Challenges encourage me to improve and become stronger; they push me to think smarter.",
          "Building helpful or entertaining projects for others inspires me and keeps me focused."
        ]
      }});

      // detect cert id directly
      kb.certifications.forEach(c => { if (t.includes(c.id.toLowerCase())) out.push({ type: 'cert_direct', data: c }); });

      // fallback substring fuzzy
      if (!out.length) {
        const hay = [
          { key: 'skills', text: kb.skills.join(' '), data: kb.skills },
          { key: 'certifications', text: kb.certifications.map(x => x.title + ' ' + x.id).join(' '), data: kb.certifications },
          { key: 'achievements', text: kb.achievements.join(' '), data: kb.achievements },
          { key: 'interests', text: kb.interests.join(' '), data: kb.interests },
          { key: 'academics', text: kb.academics, data: kb.academics }
        ];
        hay.forEach(h => { if (h.text.toLowerCase().includes(t)) out.push({ type: h.key, data: h.data }); });
      }

      return out;
    }

    // Process query and respond
    function handleQuery(raw) {
      const q = (raw || '').trim();
      if (!q) { appendMsg('bot', 'Please type a question — e.g. "show skills"'); return; }
      appendMsg('user', escapeHtml(q));

      // typing indicator
      const typing = document.createElement('div');
      typing.className = 'agent-msg bot';
      typing.textContent = 'searching...';
      agentBody.appendChild(typing);
      agentBody.scrollTop = agentBody.scrollHeight;

      setTimeout(() => {
        if (typing.parentNode) typing.remove();
        const results = searchKB(q);
        if (!results.length) {
          appendMsg('bot', 'No results found. Try "show skills" or paste a certificate ID (VFQSQ...).');
          return;
        }
        results.forEach(r => {
          if (r.type === 'skills') appendMsg('bot', `<strong>Skills:</strong> ${r.data.join(', ')}`);
          else if (r.type === 'certifications') {
            const html = '<strong>Certificates:</strong><ul>' + r.data.map(c => `<li>${escapeHtml(c.title)} — <a href="${c.url}" target="_blank" rel="noopener">${c.id}</a></li>`).join('') + '</ul>';
            appendMsg('bot', html);
          } else if (r.type === 'achievements') appendMsg('bot', `<strong>Achievements:</strong><ul>${r.data.map(s => `<li>${escapeHtml(s)}</li>`).join('')}</ul>`);
          else if (r.type === 'marks') appendMsg('bot', `<strong>Marks:</strong> ${Object.entries(r.data).map(([k,v])=> `${k}: ${v}`).join(', ')}`);
          else if (r.type === 'interests') appendMsg('bot', `<strong>Interests:</strong> ${r.data.join(', ')}`);
          else if (r.type === 'academics') appendMsg('bot', `<strong>Academics:</strong> ${r.data}`);
          else if (r.type === 'motivation') {
            appendMsg('bot', `<strong>Motivation:</strong><ul>${r.data.text.map(s => `<li>${escapeHtml(s)}</li>`).join('')}</ul>`);
          }
          else if (r.type === 'cert_direct') {
            appendMsg('bot', `<strong>${escapeHtml(r.data.title)}</strong><br><a href="${r.data.url}" target="_blank" rel="noopener">Open certificate • ${r.data.id}</a>`);
          }
        });

        // highlight first relevant section
        const primary = results[0];
        const map = { skills: '#skills', certifications: '#certs', achievements: '#certs', interests: '#interesting', academics: '#about', marks: '#marks', motivation: '#motivation' };
        const selector = map[primary.type] || null;
        if (selector) {
          const el = document.querySelector(selector);
          if (el) {
            el.scrollIntoView({ behavior: 'smooth', block: 'center' });
            el.classList.add('pulse');
            setTimeout(() => el.classList.remove('pulse'), 2000);
          }
        }
      }, 420);
    }

    // quick-action buttons
    document.querySelectorAll('.small-action').forEach(btn => {
      btn.addEventListener('click', () => {
        const a = btn.dataset.action;
        if (a === 'skills') handleQuery('show skills');
        if (a === 'certs') handleQuery('show certificates');
        if (a === 'medals') handleQuery('show medals');
        if (a === 'marks') handleQuery('show marks');
      });
    });

    agentForm?.addEventListener('submit', (e) => {
      e.preventDefault();
      const q = agentInput.value.trim();
      if (!q) return;
      agentInput.value = '';
      handleQuery(q);
    });

    // hero-open agent button
    document.getElementById('open-agent')?.addEventListener('click', () => {
      if (!agentPanel.classList.contains('open')) toggleOpen();
      setTimeout(() => agentInput?.focus(), 220);
    });

    // helper to toggle (kept local to maintain closure)
    function toggleOpen() {
      if (agentPanel.classList.contains('open')) {
        agentPanel.classList.remove('open');
        agentPanel.setAttribute('aria-hidden', 'true');
      } else {
        agentPanel.classList.add('open');
        agentPanel.setAttribute('aria-hidden', 'false');
      }
    }

    // close with ESC
    document.addEventListener('keydown', (e) => {
      if (e.key === 'Escape' && agentPanel.classList.contains('open')) toggleOpen();
    });

    function escapeHtml(s){ const d = document.createElement('div'); d.textContent = s; return d.innerHTML; }
  })();

  /* ---------------- Photo interactions & lightbox ---------------- */
  (function profilePhotoInteractions() {
    const photoBtn = document.getElementById('profile-photo-btn');
    const photoImg = document.getElementById('profile-photo');
    const lightbox = document.getElementById('photo-lightbox');
    const lightboxImg = document.getElementById('lightbox-img');
    const lbClose = document.getElementById('photo-lightbox-close');

    if (!photoBtn || !photoImg || !lightbox || !lightboxImg) return;

    // Add click animation + open lightbox
    function openLightbox() {
      // brief pop animation
      photoBtn.classList.add('photo-click');
      setTimeout(() => photoBtn.classList.remove('photo-click'), 700);

      // set image src (same file) — already set in markup but keep for fallback
      lightboxImg.src = photoImg.src;
      lightbox.setAttribute('aria-hidden', 'false');
      lightbox.classList.add('open');

      // trap focus to close button
      lbClose?.focus();
      document.documentElement.style.overflow = 'hidden'; // prevent page scroll behind lightbox
    }

    function closeLightbox() {
      lightbox.classList.remove('open');
      lightbox.setAttribute('aria-hidden', 'true');
      document.documentElement.style.overflow = ''; // restore
      // return focus to the profile button
      photoBtn.focus();
    }

    // Click / keyboard open
    photoBtn.addEventListener('click', (e) => {
      e.preventDefault();
      openLightbox();
    });
    photoBtn.addEventListener('keydown', (e) => {
      if (e.key === 'Enter' || e.key === ' ') {
        e.preventDefault();
        openLightbox();
      }
    });

    // Close handlers
    lbClose?.addEventListener('click', closeLightbox);
    lightbox.addEventListener('click', (e) => {
      // close only when clicking overlay, not the image itself
      if (e.target === lightbox || e.target === lightboxImg) {
        closeLightbox();
      }
    });

    document.addEventListener('keydown', (e) => {
      if (e.key === 'Escape' && lightbox.classList.contains('open')) closeLightbox();
    });

    // subtle interaction: double click to toggle a quick tilt effect
    photoImg.addEventListener('dblclick', () => {
      photoBtn.classList.add('photo-click');
      setTimeout(() => photoBtn.classList.remove('photo-click'), 700);
    });
  })();

  /* ---------------- RESULT GRAPHS ANIMATION ---------------- */
  (function resultGraphs() {
    const fills = document.querySelectorAll('.result-graphs .fill');
    if (!fills.length) return;
    fills.forEach(f => {
      f.style.width = '0%';
      f.setAttribute('aria-valuenow', '0');
    });

    const io = new IntersectionObserver(entries => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          const el = entry.target;
          const pct = parseInt(el.dataset.percent || '0', 10);
          el.style.transition = 'width 900ms var(--ease)';
          el.style.width = pct + '%';
          // reflect accessible value
          const bar = el.closest('.bar');
          if (bar) bar.setAttribute('aria-valuenow', String(pct));
          io.unobserve(el);
        }
      });
    }, { threshold: 0.28 });

    fills.forEach(f => io.observe(f));
  })();

  /* ---------------- SMOOTH HASH NAVIGATION ---------------- */
  document.querySelectorAll('a[href^="#"]').forEach(a => {
    a.addEventListener('click', (e) => {
      const href = a.getAttribute('href');
      if (href === '#' || href === '') return;
      const target = document.querySelector(href);
      if (target) {
        e.preventDefault();
        target.scrollIntoView({ behavior: 'smooth', block: 'center' });
        // quick visual pulse
        target.classList.add('pulse');
        setTimeout(() => target.classList.remove('pulse'), 900);
      }
    });
  });

  /* ---------------- Cute Gen-AI Assistant (top-right) ---------------- */
  (function aiCharacter() {
    const ai = document.getElementById('ai-char');
    if (!ai) return;
    const speech = ai.querySelector('.ai-speech');
    const live = document.getElementById('ai-live');

    // pick a friendly high-quality voice when possible
    function selectVoice(lang = 'en') {
      const voices = speechSynthesis.getVoices();
      if (!voices || !voices.length) return null;

      // Preferred keywords for higher-quality / neural-like voices (varies by browser)
      const preferred = ['neural','google','microsoft','samantha','joanna','daniel','alloy','amy','emily','zira','filip','olivia','ryan','alloy'];
      // prefer exact language match and preferred words
      const candidates = voices.filter(v => {
        const ln = v.lang ? v.lang.toLowerCase() : '';
        const name = v.name ? v.name.toLowerCase() : '';
        const matchLang = ln.startsWith(lang.toLowerCase());
        const hasPreferred = preferred.some(p => name.includes(p));
        return matchLang && hasPreferred;
      });

      if (candidates.length) return candidates[0];

      // fallback: any voice with language match and then any voice
      const langCandidates = voices.filter(v => v.lang && v.lang.toLowerCase().startsWith(lang.toLowerCase()));
      if (langCandidates.length) return langCandidates[0];

      return voices[0];
    }

    function speak(text = 'Hi!') {
      try {
        if (!('speechSynthesis' in window)) {
          // fallback: show visual bubble
          showBubble(text);
          return;
        }

        // many browsers require a user gesture to allow audio; still attempt to speak
        const utter = new SpeechSynthesisUtterance(text);
        const v = selectVoice('en');
        if (v) utter.voice = v;
        // tuning to sound more natural
        utter.rate = 1;
        utter.pitch = 1.05;
        utter.volume = 1;

        // prefer 'en-US' if available
        utter.lang = (utter.voice && utter.voice.lang) ? utter.voice.lang : 'en-US';

        utter.onstart = () => {
          // optional: animate mouth / cheeks if desired
        };
        utter.onend = () => {
          // cleanup if needed
        };

        // cancel any queued speech to avoid overlapping greetings
        speechSynthesis.cancel();
        speechSynthesis.speak(utter);
      } catch (err) {
        // if speech fails (e.g., blocked), just show bubble
        showBubble(text);
      }
    }

    // show a small speech bubble visually
    function showBubble(text = 'Hi!', duration = 1600) {
      if (!speech) return;
      speech.textContent = text;
      speech.classList.add('show');
      if (live) live.textContent = 'Assistant: ' + text;
      setTimeout(() => speech.classList.remove('show'), duration);
    }

    // random reaction (smile, wink, laugh, bounce)
    function react(name) {
      ai.classList.remove('smile','wink','laugh','bounce');
      void ai.offsetWidth; // force reflow for repeatable animations

      if (name === 'smile') {
        ai.classList.add('smile');
        showBubble('😊 Hi!');
      } else if (name === 'wink') {
        ai.classList.add('wink');
        showBubble('Wink! Hi!');
      } else if (name === 'laugh') {
        ai.classList.add('laugh');
        showBubble('Haha! Hi!');
      } else { // bounce
        ai.classList.add('bounce');
        showBubble('Hi!');
      }

      // revert reaction after a short duration
      setTimeout(() => {
        ai.classList.remove('smile','wink','laugh','bounce');
      }, 1400);
    }

    // handle greeting: speak "Hi!" and show reaction
    function greet() {
      // Visual + aria
      showBubble('Hi!');
      if (live) live.textContent = 'Assistant: Hi!';

      // speak (some browsers require user gesture - speak may be blocked until click)
      speak('Hi!');

      // pick a random reaction to display (visual)
      const reactions = ['smile','wink','laugh','bounce'];
      const pick = reactions[Math.floor(Math.random()*reactions.length)];
      react(pick);
    }

    // click / keyboard interaction
    ai.addEventListener('click', (e) => {
      // always speak "Hi!" on click per requirement
      speak('Hi!');
      // show visual bubble and reaction
      const reactions = ['smile','wink','laugh','bounce'];
      react(reactions[Math.floor(Math.random()*reactions.length)]);
    });
    ai.addEventListener('keydown', (e) => {
      if (e.key === 'Enter' || e.key === ' ') {
        e.preventDefault();
        ai.click();
      }
    });

    // auto-greet shortly after load
    // If browser blocks speech on load, the visual bubble still appears.
    setTimeout(() => {
      try { greet(); } catch (err) { /* ignore */ }
    }, 900);

    // Respect prefers-reduced-motion by disabling auto-bob animation
    const reduce = window.matchMedia('(prefers-reduced-motion: reduce)');
    if (reduce && reduce.matches) {
      ai.style.animation = 'none';
      const eyes = ai.querySelector('.eyes');
      if (eyes) eyes.style.animation = 'none';
    }
  })();

  /* ---------------- Init: attach shine overlays and section bubbles for all panels ---------------- */
  (function initSectionBubbles() {
    document.querySelectorAll('section.panel').forEach(sec => {
      // add decorative bubble nodes only once
      if (!sec.querySelector('.section-bubble')) {
        const b1 = document.createElement('div'); b1.className = 'section-bubble b1';
        const b2 = document.createElement('div'); b2.className = 'section-bubble b2';
        const b3 = document.createElement('div'); b3.className = 'section-bubble b3';
        sec.appendChild(b1); sec.appendChild(b2); sec.appendChild(b3);
      }
      // add shine overlay if missing
      if (!sec.querySelector('.panel-shine')) {
        const shine = document.createElement('div'); shine.className = 'panel-shine';
        sec.appendChild(shine);
      }
    });

    // quick wire: "Ask agent what motivates me" button in the motivation section
    const motivateBtn = document.getElementById('motivate-agent');
    if (motivateBtn) {
      motivateBtn.addEventListener('click', () => {
        // delegate to the agent's form handler by triggering an input + submit
        const input = document.getElementById('agent-input');
        if (input) {
          input.value = 'what motivates me';
          const ev = new Event('submit', { bubbles: true, cancelable: true });
          document.getElementById('agent-form')?.dispatchEvent(ev);
          // Also open the agent panel so user sees the response
          const panel = document.getElementById('agent-panel');
          if (panel && !panel.classList.contains('open')) panel.classList.add('open');
          const agentMini = document.getElementById('agent-mini');
          agentMini?.focus();
        }
      });
    }
  })();

  /* ---------------- PROFILE PHOTO OUTLINE ANIMATION ---------------- */
  (function profileOutline() {
    // The outline uses an SVG <rect> overlay. JS reads the image layout and sizes the SVG accordingly.
    const img = document.getElementById('profile-photo');
    const svg = document.querySelector('.photo-outline');
    const rect = svg ? svg.querySelector('.outline-rect') : null;

    if (!img || !svg || !rect) return;

    // Helper: create rounded rect path length via SVGGeometry (use getBBox after setting)
    function updateOutline() {
      // dimensions of the image element (rendered)
      const imgRect = img.getBoundingClientRect();
      const w = Math.max(48, Math.round(imgRect.width));
      const h = Math.max(48, Math.round(imgRect.height));

      // Set SVG viewBox to match image pixel dims to keep shape crisp
      svg.setAttribute('viewBox', `0 0 ${w} ${h}`);
      svg.setAttribute('width', `${w}px`);
      svg.setAttribute('height', `${h}px`);
      svg.style.left = '0';
      svg.style.top = '0';
      svg.style.transform = 'translateZ(0)';

      // match the rect to the image bounds with small inset so stroke doesn't clip
      const inset = Math.min(14, Math.round(Math.min(w, h) * 0.04));
      const rx = Math.min(22, Math.round(Math.min(w, h) * 0.06)); // corner radius
      rect.setAttribute('x', inset);
      rect.setAttribute('y', inset);
      rect.setAttribute('width', Math.max(4, w - inset * 2));
      rect.setAttribute('height', Math.max(4, h - inset * 2));
      rect.setAttribute('rx', rx);
      rect.setAttribute('ry', rx);

      // compute approximate path length using perimeter of rounded rect:
      // length = 2*(w + h - 4*rx) + 2 * (PI * rx)
      const pw = Math.max(4, w - inset * 2);
      const ph = Math.max(4, h - inset * 2);
      const perimeter = 2 * (pw + ph - 4 * rx) + 2 * Math.PI * rx;
      const dash = Math.round(perimeter);

      // set CSS variable for animation and stroke-dasharray values
      rect.style.setProperty('--dash-total', dash);
      rect.style.strokeDasharray = dash;
      rect.style.strokeDashoffset = dash;

      // add animate class to trigger CSS keyframes
      rect.classList.remove('animate');
      // reflow to restart animation
      void rect.getBoundingClientRect();
      rect.classList.add('animate');
    }

    // update on load and resize and when image finishes loading (safer)
    if (img.complete) updateOutline();
    else img.addEventListener('load', updateOutline);

    // update on window resize / layout changes
    window.addEventListener('resize', () => {
      // small delay to allow layout to settle
      setTimeout(updateOutline, 120);
    });

    // also observe the image for layout changes via ResizeObserver if available
    if ('ResizeObserver' in window) {
      const ro = new ResizeObserver(() => updateOutline());
      ro.observe(img);
    }
  })();

});