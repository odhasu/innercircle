/* ================================
   OGs Inner Circle – App Logic
================================ */

const SUPABASE_URL = "https://eqmagffuzblywevszosw.supabase.co";
const SUPABASE_KEY = "sb_publishable_AU0KXJRdQlCTJfPDxojN_A_oOACqn_h";

// ── COUNTRIES ──
const COUNTRIES = [
  { c: '+1',   f: '🇺🇸', n: 'United States / Canada' },
  { c: '+44',  f: '🇬🇧', n: 'United Kingdom' },
  { c: '+61',  f: '🇦🇺', n: 'Australia' },
  { c: '+31',  f: '🇳🇱', n: 'Netherlands' },
  { c: '+49',  f: '🇩🇪', n: 'Germany' },
  { c: '+33',  f: '🇫🇷', n: 'France' },
  { c: '+34',  f: '🇪🇸', n: 'Spain' },
  { c: '+39',  f: '🇮🇹', n: 'Italy' },
  { c: '+41',  f: '🇨🇭', n: 'Switzerland' },
  { c: '+46',  f: '🇸🇪', n: 'Sweden' },
  { c: '+47',  f: '🇳🇴', n: 'Norway' },
  { c: '+45',  f: '🇩🇰', n: 'Denmark' },
  { c: '+353', f: '🇮🇪', n: 'Ireland' },
  { c: '+64',  f: '🇳🇿', n: 'New Zealand' },
];

function buildCountrySelect() {
  const sel = document.getElementById('countrySelect');
  if (!sel) return;
  COUNTRIES.forEach((co, i) => {
    const opt = document.createElement('option');
    opt.value = i;
    opt.textContent = `${co.f} ${co.n} (${co.c})`;
    if (i === 0) opt.selected = true;
    sel.appendChild(opt);
  });
  sel.addEventListener('change', () => {
    const co = COUNTRIES[+sel.value];
    document.getElementById('flagDisplay').textContent = co.f;
    document.getElementById('codeDisplay').textContent = co.c;
  });
}

// ── FORM STATE ──
const TOTAL = 7;
let cur = 1;
const ans = {};

// ── SCROLL REVEAL ──
const revealObs = new IntersectionObserver(entries => {
  entries.forEach(e => {
    if (e.isIntersecting) { e.target.classList.add('visible'); revealObs.unobserve(e.target); }
  });
}, { threshold: 0.1 });
document.querySelectorAll('.reveal').forEach(el => revealObs.observe(el));

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

// ── DOTS ──
function buildDots(active) {
  for (let i = 1; i <= TOTAL; i++) {
    const c = document.getElementById('d' + i);
    if (!c) continue;
    c.innerHTML = '';
    for (let d = 1; d <= TOTAL; d++) {
      const el = document.createElement('div');
      el.className = 'dot' + (d === active ? ' active' : d < active ? ' done' : '');
      c.appendChild(el);
    }
  }
  const sc = document.getElementById('d-ok');
  if (sc) {
    sc.innerHTML = '';
    for (let d = 0; d < TOTAL; d++) {
      const el = document.createElement('div');
      el.className = 'dot done';
      sc.appendChild(el);
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

// ── PICK ──
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
  if (n <= 4 && !ans['q' + n]) {
    document.getElementById('e' + n).textContent = 'Please select an option.';
    shake('q' + n); return false;
  }
  if (n === 5) {
    const v = document.getElementById('emailVal').value.trim();
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(v)) {
      document.getElementById('e5').textContent = 'Please enter a valid email address.';
      shake('q5'); return false;
    }
    ans.email = v;
  }
  if (n === 6) {
    const fn = document.getElementById('firstName').value.trim();
    const ph = document.getElementById('phoneVal').value.trim();
    if (!fn) { document.getElementById('e6').textContent = 'Please enter your first name.'; shake('q6'); return false; }
    if (!ph) { document.getElementById('e6').textContent = 'Please enter your phone number.'; shake('q6'); return false; }
    ans.name = fn + ' ' + document.getElementById('lastName').value.trim();
    const code = document.getElementById('codeDisplay').textContent;
    ans.phone = code + ' ' + ph;
  }
  if (n === 7) {
    if (!ans['q7']) {
      document.getElementById('e7').textContent = 'Please select an option.';
      shake('q7'); return false;
    }
    ans.contact_preference = ans['q7'];
  }
  return true;
}

function shake(qId) {
  const el = document.getElementById(qId);
  if (!el) return;
  el.style.animation = 'none';
  void el.offsetHeight;
  el.style.animation = 'shake 0.4s ease';
}

// ── NEXT / BACK ──
function next(n) {
  if (!validate(n)) return;
  if (n < TOTAL) {
    showQ(n + 1);
    if (n + 1 === 5) setTimeout(() => document.getElementById('emailVal').focus(), 200);
    if (n + 1 === 6) setTimeout(() => document.getElementById('firstName').focus(), 200);
  } else {
    submitForm();
  }
}
function back(n) { if (n > 1) showQ(n - 1); }

// ── SUBMIT → SUPABASE ──
async function submitForm() {
  const payload = {
    experience:         ans.q1 || '',
    goal:               ans.q2 || '',
    age:                ans.q3 || '',
    budget:             ans.q4 || '',
    email:              ans.email || '',
    name:               ans.name || '',
    phone:              ans.phone || '',
    contact_preference: ans.contact_preference || '',
  };

  // Show success immediately — submit in background
  document.querySelectorAll('.question').forEach(q => q.classList.remove('active'));
  document.getElementById('q-ok').classList.add('active');
  buildDots(99);
  setTimeout(() => {
    document.getElementById('theForm').scrollIntoView({ behavior: 'smooth', block: 'center' });
  }, 100);
  launchConfetti();

  // Fire & forget to Supabase
  fetch(`${SUPABASE_URL}/rest/v1/applications`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'apikey': SUPABASE_KEY,
      'Authorization': `Bearer ${SUPABASE_KEY}`,
      'Prefer': 'return=minimal'
    },
    body: JSON.stringify(payload)
  }).catch(() => {});
}

// ── CONFETTI ──
function launchConfetti() {
  const colors = ['#39FF14', '#ffffff', '#a0ff60', '#00ff88'];
  for (let i = 0; i < 70; i++) {
    const el = document.createElement('div');
    const size = Math.random() * 8 + 4;
    el.style.cssText = [
      `position:fixed`,
      `width:${size}px`,
      `height:${size}px`,
      `background:${colors[Math.floor(Math.random() * colors.length)]}`,
      `border-radius:${Math.random() > 0.5 ? '50%' : '2px'}`,
      `left:${Math.random() * 100}vw`,
      `top:-10px`,
      `z-index:9999`,
      `pointer-events:none`,
      `opacity:${(Math.random() * 0.8 + 0.2).toFixed(2)}`,
      `animation:confettiFall ${(Math.random() * 1.5 + 1).toFixed(2)}s ${(Math.random() * 0.8).toFixed(2)}s ease-in forwards`,
    ].join(';');
    document.body.appendChild(el);
    setTimeout(() => el.remove(), 3500);
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
  const tag = document.activeElement.tagName;

  if (cur === 6 && e.key === 'Enter') {
    e.preventDefault();
    const active = document.activeElement;
    if (active.id === 'firstName') {
      document.getElementById('lastName').focus();
    } else if (active.id === 'lastName') {
      document.getElementById('phoneVal').focus();
    } else {
      next(cur);
    }
    return;
  }

  if (tag === 'INPUT' || tag === 'SELECT') {
    if (e.key === 'Enter') { e.preventDefault(); next(cur); }
    return;
  }
  if (e.key === 'Enter' && cur <= TOTAL) { next(cur); return; }
  if (cur >= 1 && cur <= 4) {
    const map = { a: 0, b: 1, c: 2, d: 3, e: 4 };
    const idx = map[e.key.toLowerCase()];
    if (idx !== undefined) {
      const items = document.querySelectorAll('#c' + cur + ' .choice');
      if (items[idx]) items[idx].click();
    }
  }
});

// ── INIT ──
buildDots(1);
buildCountrySelect();