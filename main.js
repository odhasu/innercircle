const TOTAL = 5;
let cur = 1;
const ans = {};

// ── CURSOR GLOW (desktop only) ──
if (window.innerWidth > 768) {
  const glow = document.createElement('div');
  glow.className = 'cursor-glow';
  document.body.appendChild(glow);
  document.addEventListener('mousemove', e => {
    glow.style.left = e.clientX + 'px';
    glow.style.top  = e.clientY + 'px';
  });
}

// ── SCROLL REVEAL ──
const revealObserver = new IntersectionObserver(entries => {
  entries.forEach(e => {
    if (e.isIntersecting) {
      e.target.classList.add('visible');
      revealObserver.unobserve(e.target);
    }
  });
}, { threshold: 0.12 });
document.querySelectorAll('.reveal').forEach(el => revealObserver.observe(el));

// ── RIPPLE ──
document.addEventListener('click', e => {
  const btn = e.target.closest('.ripple-btn');
  if (!btn) return;
  const r = document.createElement('span');
  r.className = 'ripple';
  const rect = btn.getBoundingClientRect();
  const size = Math.max(rect.width, rect.height);
  r.style.cssText = `width:${size}px;height:${size}px;left:${e.clientX - rect.left - size / 2}px;top:${e.clientY - rect.top - size / 2}px`;
  btn.appendChild(r);
  setTimeout(() => r.remove(), 700);
});

// ── DOT BUILDER ──
function buildDots(active) {
  for (let i = 1; i <= TOTAL; i++) {
    const row = document.getElementById('d' + i);
    if (!row) continue;
    row.innerHTML = '';
    for (let d = 1; d <= TOTAL; d++) {
      const dot = document.createElement('div');
      dot.className = 'dot' + (d === active ? ' active' : d < active ? ' done' : '');
      row.appendChild(dot);
    }
  }
  const okRow = document.getElementById('d-ok');
  if (okRow) {
    okRow.innerHTML = '';
    for (let d = 0; d < TOTAL; d++) {
      const dot = document.createElement('div');
      dot.className = 'dot done';
      okRow.appendChild(dot);
    }
  }
}

// ── SHOW QUESTION ──
function showQ(n) {
  document.querySelectorAll('.question').forEach(q => q.classList.remove('active'));
  const el = document.getElementById('q' + n) || document.getElementById('q-ok');
  if (el) el.classList.add('active');
  cur = n;
  buildDots(n);
  setTimeout(() => {
    document.getElementById('theForm').scrollIntoView({ behavior: 'smooth', block: 'center' });
  }, 50);
}

// ── PICK CHOICE (auto-advance) ──
function pick(qId, el) {
  const num = qId.replace('q', '');
  document.querySelectorAll('#c' + num + ' .choice').forEach(c => c.classList.remove('selected'));
  el.classList.add('selected');
  ans[qId] = el.dataset.v;
  document.getElementById('e' + num).textContent = '';

  const okBtn = document.querySelector('#q' + num + ' .btn-ok');
  if (okBtn) okBtn.classList.add('ready');

  setTimeout(() => next(parseInt(num)), 320);
}

// ── VALIDATE ──
function validate(n) {
  if (n <= 3 && !ans['q' + n]) {
    document.getElementById('e' + n).textContent = 'Please select an option.';
    shake('q' + n);
    return false;
  }
  if (n === 4) {
    const v = document.getElementById('emailVal').value.trim();
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(v)) {
      document.getElementById('e4').textContent = 'Please enter a valid email.';
      shake('q4');
      return false;
    }
    ans.email = v;
  }
  if (n === 5) {
    const fn = document.getElementById('firstName').value.trim();
    const ph = document.getElementById('phoneVal').value.trim();
    if (!fn) { document.getElementById('e5').textContent = 'Please enter your first name.'; shake('q5'); return false; }
    if (!ph) { document.getElementById('e5').textContent = 'Please enter your phone number.'; shake('q5'); return false; }
    ans.name  = fn + ' ' + document.getElementById('lastName').value.trim();
    ans.phone = ph;
  }
  return true;
}

// ── SHAKE ──
function shake(qId) {
  const el = document.getElementById(qId);
  if (!el) return;
  el.style.animation = 'none';
  el.offsetHeight; // force reflow
  el.style.animation = 'shake 0.4s ease';
}

// ── NEXT / BACK ──
function next(n) {
  if (!validate(n)) return;
  if (n < TOTAL) {
    showQ(n + 1);
    if (n + 1 === 4) setTimeout(() => document.getElementById('emailVal').focus(), 200);
    if (n + 1 === 5) setTimeout(() => document.getElementById('firstName').focus(), 200);
  } else {
    submit();
  }
}

function back(n) {
  if (n > 1) showQ(n - 1);
}

// ── SUBMIT ──
function submit() {
  // Submit to Formspree via fetch (no page redirect)
  const formData = new FormData(document.getElementById('formspree-form'));
  document.getElementById('f-experience').value = ans.q1;
  document.getElementById('f-goal').value       = ans.q2;
  document.getElementById('f-age').value        = ans.q3;
  document.getElementById('f-email').value      = ans.email;
  document.getElementById('f-name').value       = ans.name;
  document.getElementById('f-phone').value      = ans.phone;

  fetch('https://formspree.io/f/mdalegvn', {
    method: 'POST',
    body: new FormData(document.getElementById('formspree-form')),
    headers: { 'Accept': 'application/json' }
  });

  document.querySelectorAll('.question').forEach(q => q.classList.remove('active'));
  document.getElementById('q-ok').classList.add('active');
  buildDots(99);
  setTimeout(() => document.getElementById('theForm').scrollIntoView({ behavior: 'smooth', block: 'center' }), 100);
  launchConfetti();
}

// ── CONFETTI ──
function launchConfetti() {
  const colors = ['#39ff00', '#ffffff', '#a0ff60', '#00ff88'];
  for (let i = 0; i < 60; i++) {
    const el = document.createElement('div');
    const size = Math.random() * 8 + 4;
    el.style.cssText = `
      position:fixed; width:${size}px; height:${size}px;
      background:${colors[Math.floor(Math.random() * colors.length)]};
      border-radius:${Math.random() > 0.5 ? '50%' : '2px'};
      left:${Math.random() * 100}vw; top:-10px;
      z-index:9999; pointer-events:none;
      opacity:${Math.random() * 0.8 + 0.2};
      animation:confettiFall ${Math.random() * 1.5 + 1}s ${Math.random() * 0.8}s ease-in forwards;
    `;
    document.body.appendChild(el);
    setTimeout(() => el.remove(), 3000);
  }
}

// ── FAQ ──
function toggleFaq(el) {
  const isOpen = el.classList.contains('open');
  document.querySelectorAll('.faq-item').forEach(f => f.classList.remove('open'));
  if (!isOpen) el.classList.add('open');
}

// ── KEYBOARD SHORTCUTS ──
document.addEventListener('keydown', e => {
  if (document.activeElement.tagName === 'INPUT') {
    if (e.key === 'Enter') { e.preventDefault(); next(cur); }
    return;
  }
  if (e.key === 'Enter' && cur <= TOTAL) next(cur);
  if (cur >= 1 && cur <= 3) {
    const map = { a: 0, b: 1, c: 2, d: 3, e: 4 };
    const idx = map[e.key.toLowerCase()];
    if (idx !== undefined) {
      const items = document.querySelectorAll('#c' + cur + ' .choice');
      if (items[idx]) items[idx].click();
    }
  }
});

// ── INIT ──
document.querySelectorAll('.hero-cta, .btn-ok, .bottom-cta-btn').forEach(el => el.classList.add('ripple-btn'));
buildDots(1);