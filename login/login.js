const MAX_ATTEMPTS = 5;
const LOCKOUT_MS   = 15 * 60 * 1000;
const RATE_KEY     = "og_dash_rate";
const SESSION_KEY  = "og_dash_session";

function getRateData() {
  try { return JSON.parse(localStorage.getItem(RATE_KEY)) || { attempts: 0, lockedUntil: null }; } 
  catch { return { attempts: 0, lockedUntil: null }; }
}
function saveRateData(data) { localStorage.setItem(RATE_KEY, JSON.stringify(data)); }
function isLockedOut() {
  const d = getRateData();
  if (!d.lockedUntil) return false;
  if (Date.now() < d.lockedUntil) return true;
  saveRateData({ attempts: 0, lockedUntil: null });
  return false;
}
function getLockoutRemaining() {
  const d = getRateData();
  if (!d.lockedUntil) return 0;
  return Math.max(0, Math.ceil((d.lockedUntil - Date.now()) / 1000));
}
function recordFailedAttempt() {
  const d = getRateData();
  d.attempts = (d.attempts || 0) + 1;
  if (d.attempts >= MAX_ATTEMPTS) { d.lockedUntil = Date.now() + LOCKOUT_MS; }
  saveRateData(d);
  return d.attempts;
}
function resetRateData() { saveRateData({ attempts: 0, lockedUntil: null }); }
function isLoggedIn() { return sessionStorage.getItem(SESSION_KEY) === "authenticated"; }
function setLoggedIn() { sessionStorage.setItem(SESSION_KEY, "authenticated"); }

let lockoutTimer = null;
function checkLockout() {
  const lockoutEl  = document.getElementById("login-lockout");
  const inputEl    = document.getElementById("login-input");
  const btnEl      = document.getElementById("login-btn");
  const warningEl  = document.getElementById("attempts-warning");

  if (isLockedOut()) {
    clearInterval(lockoutTimer);
    inputEl.disabled = true; btnEl.disabled = true;
    lockoutEl.style.display = "block"; warningEl.style.display = "none";
    const tick = () => {
      const secs = getLockoutRemaining();
      const m = Math.floor(secs / 60); const s = secs % 60;
      lockoutEl.innerHTML = `🔒 Too many failed attempts. Try again in <strong>${m}:${String(s).padStart(2,'0')}</strong>.`;
      if (secs <= 0) {
        clearInterval(lockoutTimer);
        inputEl.disabled = false; btnEl.disabled = false;
        lockoutEl.style.display = "none";
      }
    };
    tick();
    lockoutTimer = setInterval(tick, 1000);
  } else {
    const d = getRateData();
    const remaining = MAX_ATTEMPTS - (d.attempts || 0);
    if (d.attempts > 0 && remaining > 0) {
      warningEl.style.display = "block";
      warningEl.innerText = `⚠ ${remaining} attempt${remaining !== 1 ? 's' : ''} remaining before lockout.`;
    } else {
      warningEl.style.display = "none";
    }
  }
}

function attemptLogin() {
  if (isLockedOut()) return;
  const input  = document.getElementById("login-input");
  const errEl  = document.getElementById("login-error");
  const code   = input.value.trim();
  errEl.innerText = "";
  if (!code) { errEl.innerText = "Please enter your access code."; return; }

  const btn = document.getElementById("login-btn");
  const btnText = document.getElementById("login-btn-text");
  btn.disabled = true; btnText.innerText = "Verifying...";

  setTimeout(() => {
    if (code === "og22") {
      resetRateData();
      setLoggedIn();
      window.location.href = "/dashboard";
    } else {
      const attempts = recordFailedAttempt();
      input.value = "";
      input.classList.remove("shake"); void input.offsetWidth; input.classList.add("shake");
      setTimeout(() => input.classList.remove("shake"), 500);

      if (isLockedOut()) {
        errEl.innerText = "Access denied."; checkLockout();
      } else {
        const remaining = MAX_ATTEMPTS - attempts;
        errEl.innerText = `Incorrect code. ${remaining} attempt${remaining !== 1 ? 's' : ''} remaining.`;
        checkLockout();
      }
      btn.disabled = false; btnText.innerText = "Access Dashboard →";
    }
  }, 600);
}

function addRipple(e) {
  const btn  = e.currentTarget; const rect = btn.getBoundingClientRect();
  const r    = document.createElement("span"); const size = Math.max(btn.offsetWidth, btn.offsetHeight);
  r.className = "ripple";
  r.style.cssText = `width:${size}px;height:${size}px;left:${e.clientX - rect.left - size/2}px;top:${e.clientY - rect.top - size/2}px;`;
  btn.appendChild(r); setTimeout(() => r.remove(), 600);
}

document.addEventListener("DOMContentLoaded", () => {
  document.querySelectorAll(".ripple-btn").forEach(btn => btn.addEventListener("click", addRipple));
  document.getElementById("login-input").addEventListener("keydown", e => { if (e.key === "Enter") attemptLogin(); });
  
  if (isLoggedIn()) { window.location.href = "/dashboard"; } 
  else { checkLockout(); }
});
