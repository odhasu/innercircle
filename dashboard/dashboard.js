const SUPABASE_URL = "https://eqmagffuzblywevszosw.supabase.co";
const SUPABASE_KEY = "sb_publishable_AU0KXJRdQlCTJfPDxojN_A_oOACqn_h";
const SESSION_KEY  = "og_dash_session";

function isLoggedIn() { return sessionStorage.getItem(SESSION_KEY) === "authenticated"; }

function logout() {
  sessionStorage.removeItem(SESSION_KEY);
  window.location.href = "/login";
}

async function loadApplications() {
  const loader = document.getElementById("table-loader");
  const empty  = document.getElementById("table-empty");
  const table  = document.getElementById("applications-table");
  const icon   = document.getElementById("refresh-icon");

  loader.style.display = "flex"; empty.style.display  = "none"; table.style.display  = "none";
  icon.style.animation = "spin 0.7s linear infinite";

  try {
    const res = await fetch(`${SUPABASE_URL}/rest/v1/applications?select=*&order=created_at.desc`, {
      headers: { "apikey": SUPABASE_KEY, "Authorization": `Bearer ${SUPABASE_KEY}`, "Content-Type": "application/json" }
    });
    if (!res.ok) throw new Error("Failed to fetch");
    const rows = await res.json();
    
    loader.style.display = "none"; icon.style.animation = "";
    
    if (!rows || rows.length === 0) { empty.style.display = "flex"; updateStats([]); return; }
    
    updateStats(rows); renderTable(rows); table.style.display = "table";
  } catch (err) {
    loader.style.display = "none"; icon.style.animation = ""; empty.style.display  = "flex";
    empty.innerHTML = `<span>⚠️</span><p>Error loading data. Check your connection.</p>`;
    console.error(err);
  }
}

function updateStats(rows) {
  const today = new Date().toISOString().slice(0, 10);
  const todayCount     = rows.filter(r => r.created_at && r.created_at.startsWith(today)).length;
  const emailCount     = rows.filter(r => r.contact_preference === "email").length;
  const whatsappCount  = rows.filter(r => r.contact_preference === "whatsapp").length;

  animateCount("stat-total",    rows.length);
  animateCount("stat-today",    todayCount);
  animateCount("stat-email",    emailCount);
  animateCount("stat-whatsapp", whatsappCount);
}

function animateCount(id, target) {
  const el = document.getElementById(id); if (!el) return;
  let current = 0; const step  = Math.ceil(target / 20) || 1;
  const tick  = () => {
    current = Math.min(current + step, target); el.innerText = current;
    if (current < target) requestAnimationFrame(tick);
  };
  requestAnimationFrame(tick);
}

const EXPERIENCE_LABELS = { just_starting: "Just Starting", less_6mo: "< 6 Months", "6mo_1yr": "6mo – 1yr", "1_2yr": "1–2 Years", "2yr_plus": "2+ Years" };
const GOAL_LABELS = { side_income: "Side Income", fulltime: "Full Time", scale: "Scale Store", freedom: "Financial Freedom" };
const BUDGET_LABELS = { under_200: "< $200", "200-500": "$200–$500", "500-1k": "$500–$1K", "1k-3k": "$1K–$3K", "3k+": "$3K+" };
const CONTACT_BADGE = { email: "badge-blue", sms: "badge-muted", whatsapp: "badge-green" };
const CONTACT_LABEL = { email: "📧 Email", sms: "💬 SMS", whatsapp: "🟢 WhatsApp" };

function formatDate(iso) {
  if (!iso) return "—";
  const d = new Date(iso);
  return d.toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" }) + " · " + d.toLocaleTimeString("en-US", { hour: "2-digit", minute: "2-digit" });
}

function renderTable(rows) {
  const body = document.getElementById("table-body");
  body.innerHTML = rows.map(r => `
    <tr>
      <td class="id-cell">#${r.id}</td>
      <td class="name-cell">${r.name || "—"}</td>
      <td class="email-cell">${r.email || "—"}</td>
      <td>${r.phone || "—"}</td>
      <td><span class="badge badge-muted">${EXPERIENCE_LABELS[r.experience] || r.experience || "—"}</span></td>
      <td><span class="badge badge-purple">${GOAL_LABELS[r.goal] || r.goal || "—"}</span></td>
      <td><span class="badge badge-muted">${BUDGET_LABELS[r.budget] || r.budget || "—"}</span></td>
      <td>${r.age || "—"}</td>
      <td><span class="badge ${CONTACT_BADGE[r.contact_preference] || 'badge-muted'}">${CONTACT_LABEL[r.contact_preference] || r.contact_preference || "—"}</span></td>
      <td style="color:var(--muted);font-size:12px;white-space:nowrap;">${formatDate(r.created_at)}</td>
    </tr>
  `).join("");
}

function addRipple(e) {
  const btn  = e.currentTarget; const rect = btn.getBoundingClientRect();
  const r    = document.createElement("span"); const size = Math.max(btn.offsetWidth, btn.offsetHeight);
  r.className = "ripple";
  r.style.cssText = `width:${size}px;height:${size}px;left:${e.clientX - rect.left - size/2}px;top:${e.clientY - rect.top - size/2}px;`;
  btn.appendChild(r); setTimeout(() => r.remove(), 600);
}

document.addEventListener("DOMContentLoaded", () => {
  if (!isLoggedIn()) { window.location.href = "/login"; return; }
  
  document.getElementById("dashboard").style.display = "flex";
  document.querySelectorAll(".ripple-btn").forEach(btn => btn.addEventListener("click", addRipple));
  loadApplications();
});
