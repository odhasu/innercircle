'use strict';

// ── COUNTRIES ──
const COUNTRIES = [
  { f: '🇺🇸', c: '+1', n: 'United States' }, { f: '🇬🇧', c: '+44', n: 'United Kingdom' }, { f: '🇨🇦', c: '+1', n: 'Canada' },
  { f: '🇦🇺', c: '+61', n: 'Australia' }, { f: '🇩🇪', c: '+49', n: 'Germany' }, { f: '🇫🇷', c: '+33', n: 'France' },
  { f: '🇳🇱', c: '+31', n: 'Netherlands' }, { f: '🇧🇪', c: '+32', n: 'Belgium' }, { f: '🇨🇭', c: '+41', n: 'Switzerland' },
  { f: '🇦🇹', c: '+43', n: 'Austria' }, { f: '🇮🇹', c: '+39', n: 'Italy' }, { f: '🇪🇸', c: '+34', n: 'Spain' },
  { f: '🇵🇹', c: '+351', n: 'Portugal' }, { f: '🇸🇪', c: '+46', n: 'Sweden' }, { f: '🇳🇴', c: '+47', n: 'Norway' },
  { f: '🇩🇰', c: '+45', n: 'Denmark' }, { f: '🇫🇮', c: '+358', n: 'Finland' }, { f: '🇵🇱', c: '+48', n: 'Poland' },
  { f: '🇨🇿', c: '+420', n: 'Czech Republic' }, { f: '🇷🇴', c: '+40', n: 'Romania' }, { f: '🇬🇷', c: '+30', n: 'Greece' },
  { f: '🇭🇺', c: '+36', n: 'Hungary' }, { f: '🇧🇬', c: '+359', n: 'Bulgaria' }, { f: '🇭🇷', c: '+385', n: 'Croatia' },
  { f: '🇸🇰', c: '+421', n: 'Slovakia' }, { f: '🇷🇸', c: '+381', n: 'Serbia' }, { f: '🇺🇦', c: '+380', n: 'Ukraine' },
  { f: '🇷🇺', c: '+7', n: 'Russia' }, { f: '🇹🇷', c: '+90', n: 'Turkey' }, { f: '🇮🇱', c: '+972', n: 'Israel' },
  { f: '🇸🇦', c: '+966', n: 'Saudi Arabia' }, { f: '🇦🇪', c: '+971', n: 'UAE' }, { f: '🇶🇦', c: '+974', n: 'Qatar' },
  { f: '🇰🇼', c: '+965', n: 'Kuwait' }, { f: '🇧🇭', c: '+973', n: 'Bahrain' }, { f: '🇮🇳', c: '+91', n: 'India' },
  { f: '🇨🇳', c: '+86', n: 'China' }, { f: '🇯🇵', c: '+81', n: 'Japan' }, { f: '🇰🇷', c: '+82', n: 'South Korea' },
  { f: '🇸🇬', c: '+65', n: 'Singapore' }, { f: '🇲🇾', c: '+60', n: 'Malaysia' }, { f: '🇵🇭', c: '+63', n: 'Philippines' },
  { f: '🇹🇭', c: '+66', n: 'Thailand' }, { f: '🇮🇩', c: '+62', n: 'Indonesia' }, { f: '🇻🇳', c: '+84', n: 'Vietnam' },
  { f: '🇳🇿', c: '+64', n: 'New Zealand' }, { f: '🇿🇦', c: '+27', n: 'South Africa' }, { f: '🇳🇬', c: '+234', n: 'Nigeria' },
  { f: '🇰🇪', c: '+254', n: 'Kenya' }, { f: '🇬🇭', c: '+233', n: 'Ghana' }, { f: '🇪🇬', c: '+20', n: 'Egypt' },
  { f: '🇲🇦', c: '+212', n: 'Morocco' }, { f: '🇧🇷', c: '+55', n: 'Brazil' }, { f: '🇲🇽', c: '+52', n: 'Mexico' },
  { f: '🇦🇷', c: '+54', n: 'Argentina' }, { f: '🇨🇴', c: '+57', n: 'Colombia' }, { f: '🇨🇱', c: '+56', n: 'Chile' },
  { f: '🇵🇪', c: '+51', n: 'Peru' }, { f: '🇯🇲', c: '+1', n: 'Jamaica' }, { f: '🇹🇹', c: '+1', n: 'Trinidad & Tobago' },
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
const TOTAL = 6;
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

// ── SUBMIT → FORMSPREE ──
function submitForm() {
  document.getElementById('f-experience').value = ans.q1 || '';
  document.getElementById('f-goal').value = ans.q2 || '';
  document.getElementById('f-age').value = ans.q3 || '';
  document.getElementById('f-budget').value = ans.q4 || '';
  document.getElementById('f-email').value = ans.email || '';
  document.getElementById('f-name').value = ans.name || '';
  document.getElementById('f-phone').value = ans.phone || '';

  fetch('https://formspree.io/f/mdalegvn', {
    method: 'POST',
    body: new FormData(document.getElementById('fs-form')),
    headers: { 'Accept': 'application/json' }
  }).catch(() => { }); // silent fail — user already sees success

  document.querySelectorAll('.question').forEach(q => q.classList.remove('active'));
  document.getElementById('q-ok').classList.add('active');
  buildDots(99);
  setTimeout(() => {
    document.getElementById('theForm').scrollIntoView({ behavior: 'smooth', block: 'center' });
  }, 100);
  launchConfetti();
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

  // If we are on the Name/Phone step (step 6), handle Enter navigation between fields
  if (cur === 6 && e.key === 'Enter') {
    e.preventDefault();
    const active = document.activeElement;
    if (active.id === 'firstName') {
      document.getElementById('lastName').focus();
    } else if (active.id === 'lastName') {
      document.getElementById('phoneVal').focus();
    } else {
      // If on phone or button, try to validate and proceed
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