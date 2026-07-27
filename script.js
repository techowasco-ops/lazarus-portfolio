// =========================================================
// Lazarus Chinemerem Owah — Portfolio interactivity
// =========================================================

document.addEventListener('DOMContentLoaded', () => {
  initTheme();
  initNav();
  initRoleTyping();
  initQueryConsole();
  initReveal();
  initCounters();
  initGallery();
  initYear();
  initContactForm();
});

/* ---------- Theme (light / dark) ---------- */
function initTheme() {
  const root = document.documentElement;
  const toggle = document.getElementById('themeToggle');
  const stored = window.__theme || null; // in-memory only, no localStorage per artifact rules
  const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
  let theme = stored || (prefersDark ? 'dark' : 'light');
  root.setAttribute('data-theme', theme);
  updateToggleIcon(theme);

  toggle.addEventListener('click', () => {
    theme = root.getAttribute('data-theme') === 'dark' ? 'light' : 'dark';
    root.setAttribute('data-theme', theme);
    window.__theme = theme;
    updateToggleIcon(theme);
  });

  function updateToggleIcon(t) {
    toggle.textContent = t === 'dark' ? '☀️' : '🌙';
    toggle.setAttribute('aria-label', t === 'dark' ? 'Switch to light theme' : 'Switch to dark theme');
  }
}

/* ---------- Nav: scrolled state, active link, mobile menu ---------- */
function initNav() {
  const nav = document.getElementById('siteNav');
  const links = document.querySelectorAll('.nav-links a');
  const sections = [...document.querySelectorAll('main section[id]')];
  const toggleBtn = document.getElementById('navToggle');
  const navLinks = document.getElementById('navLinks');

  window.addEventListener('scroll', () => {
    nav.classList.toggle('scrolled', window.scrollY > 12);

    let current = sections[0]?.id;
    for (const sec of sections) {
      if (window.scrollY >= sec.offsetTop - 140) current = sec.id;
    }
    links.forEach(a => a.classList.toggle('active', a.getAttribute('href') === `#${current}`));
  }, { passive: true });

  toggleBtn?.addEventListener('click', () => {
    navLinks.classList.toggle('mobile-open');
  });
  links.forEach(a => a.addEventListener('click', () => navLinks.classList.remove('mobile-open')));
}

/* ---------- Typed role rotator ---------- */
function initRoleTyping() {
  const el = document.getElementById('roleTyped');
  if (!el) return;
  const roles = ['PHP Developer', 'Data Analyst', 'Virtual Assistant', 'Content Writer'];
  let ri = 0, ci = 0, deleting = false;

  function tick() {
    const word = roles[ri];
    if (!deleting) {
      ci++;
      el.textContent = word.slice(0, ci);
      if (ci === word.length) { deleting = true; setTimeout(tick, 1400); return; }
    } else {
      ci--;
      el.textContent = word.slice(0, ci);
      if (ci === 0) { deleting = false; ri = (ri + 1) % roles.length; }
    }
    setTimeout(tick, deleting ? 40 : 85);
  }
  tick();
}

/* ---------- Signature hero element: a typed SQL query ---------- */
function initQueryConsole() {
  const el = document.getElementById('typedQuery');
  if (!el) return;

  const full =
`SELECT name, role, focus
FROM   developers
WHERE  name = 'Lazarus Owah'
  AND  ships_things = TRUE;

-- 1 row returned
name  : Lazarus Chinemerem Owah
role  : PHP Developer / Data Analyst
focus : clean data, working code,
        happy clients`;

  let i = 0;
  function type() {
    if (i <= full.length) {
      el.textContent = full.slice(0, i);
      i += 2;
      setTimeout(type, 14);
    }
  }

  const observer = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        type();
        observer.disconnect();
      }
    });
  }, { threshold: 0.4 });
  observer.observe(el.closest('.console'));
}

/* ---------- Scroll reveal ---------- */
function initReveal() {
  const targets = document.querySelectorAll('.reveal');
  const observer = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        entry.target.classList.add('in');
        observer.unobserve(entry.target);
      }
    });
  }, { threshold: 0.12 });
  targets.forEach(t => observer.observe(t));
}

/* ---------- Animated stat counters ---------- */
function initCounters() {
  const counters = document.querySelectorAll('[data-count]');
  const observer = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (!entry.isIntersecting) return;
      const el = entry.target;
      const target = parseFloat(el.dataset.count);
      const suffix = el.dataset.suffix || '';
      const duration = 1200;
      const start = performance.now();

      function frame(now) {
        const progress = Math.min((now - start) / duration, 1);
        const eased = 1 - Math.pow(1 - progress, 3);
        const value = (target * eased);
        el.textContent = (Number.isInteger(target) ? Math.round(value) : value.toFixed(1)) + suffix;
        if (progress < 1) requestAnimationFrame(frame);
      }
      requestAnimationFrame(frame);
      observer.unobserve(el);
    });
  }, { threshold: 0.6 });
  counters.forEach(c => observer.observe(c));
}

/* ---------- Gallery lightbox ---------- */
function initGallery() {
  const items = document.querySelectorAll('.gallery-item');
  const lightbox = document.getElementById('lightbox');
  const lightboxImg = document.getElementById('lightboxImg');
  const lightboxCap = document.getElementById('lightboxCap');
  const closeBtn = document.getElementById('lightboxClose');
  if (!lightbox) return;

  items.forEach(item => {
    item.addEventListener('click', () => {
      const img = item.querySelector('img');
      lightboxImg.src = img.src;
      lightboxImg.alt = img.alt;
      lightboxCap.textContent = img.alt;
      lightbox.classList.add('open');
    });
  });

  function close() { lightbox.classList.remove('open'); }
  closeBtn.addEventListener('click', close);
  lightbox.addEventListener('click', (e) => { if (e.target === lightbox) close(); });
  document.addEventListener('keydown', (e) => { if (e.key === 'Escape') close(); });
}

/* ---------- Contact form ---------- */
function initContactForm() {
  const form = document.getElementById('contactForm');
  if (!form) return;
  const status = document.getElementById('formStatus');
  const submitBtn = document.getElementById('formSubmit');

  // Point this at contact-handler.php on whichever server actually
  // runs PHP. If the site is on GitHub Pages, PHP won't run there —
  // host contact-handler.php elsewhere and use its full URL here,
  // e.g. 'https://yourdomain.com/contact-handler.php'.
  const ENDPOINT = 'contact-handler.php';

  form.addEventListener('submit', async (e) => {
    e.preventDefault();

    const payload = {
      name: form.name.value.trim(),
      email: form.email.value.trim(),
      subject: form.subject.value.trim(),
      message: form.message.value.trim(),
      company: form.company.value // honeypot — should stay empty
    };

    submitBtn.disabled = true;
    submitBtn.textContent = 'Sending…';
    status.textContent = '';
    status.style.color = '';

    try {
      const res = await fetch(ENDPOINT, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      });
      const result = await res.json();

      if (res.ok && result.ok) {
        status.textContent = "Message sent — I'll get back to you soon.";
        status.style.color = 'var(--code-green)';
        form.reset();
      } else {
        status.textContent = result.error || 'Something went wrong. Please try again.';
        status.style.color = '#F87171';
      }
    } catch (err) {
      status.textContent = "Couldn't reach the server. If this site is on GitHub Pages, the PHP handler needs to be hosted separately — see the note in js/script.js.";
      status.style.color = '#F87171';
    } finally {
      submitBtn.disabled = false;
      submitBtn.textContent = 'Send Message';
    }
  });
}

/* ---------- Footer year ---------- */
function initYear() {
  const el = document.getElementById('year');
  if (el) el.textContent = new Date().getFullYear();
}
