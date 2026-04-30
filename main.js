/* ================================
   OGs Inner Circle - App Logic
================================ */

const SUPABASE_URL = "https://eqmagffuzblywevszosw.supabase.co";
const SUPABASE_KEY = "sb_publishable_AU0KXJRdQlCTJfPDxojN_A_oOACqn_h";

let currentStep = 1;
const totalSteps = 7;
let formData = {
  experience: "",
  goal: "",
  age: "",
  budget: "",
  email: "",
  name: "",
  phone: "",
  contact_preference: ""
};

function updateDots() {
  for (let i = 1; i <= totalSteps; i++) {
    const dotRow = document.getElementById(`d${i}`);
    if (dotRow) {
      dotRow.innerHTML = Array.from({ length: totalSteps }).map((_, idx) => {
        let cls = "dot";
        if (idx + 1 === i) cls += " active";
        else if (idx + 1 < i) cls += " done";
        return `<div class="${cls}"></div>`;
      }).join('');
    }
  }
}

document.addEventListener("DOMContentLoaded", () => {
  updateDots();
  
  const setupEnterKey = (id, step) => {
    const el = document.getElementById(id);
    if (el) {
      el.addEventListener("keypress", (e) => {
        if (e.key === "Enter") next(step);
      });
    }
  };

  setupEnterKey("emailVal", 5);
  setupEnterKey("firstName", 6);
  setupEnterKey("lastName", 6);
  setupEnterKey("phoneVal", 6);
});

function pick(qId, el) {
  const container = document.getElementById(qId);
  const choices = container.querySelectorAll('.choice');
  choices.forEach(c => c.classList.remove('selected'));
  el.classList.add('selected');
  
  const step = parseInt(qId.replace('q', ''));
  
  const errEl = document.getElementById(`e${step}`);
  if (errEl) errEl.innerText = "";
  
  setTimeout(() => {
    if (step < totalSteps) {
      next(step);
    } else {
      // last step — collect value then submit
      const val = el.getAttribute('data-v');
      formData.contact_preference = val;
      submitForm();
    }
  }, 350);
}

function showStep(n) {
  document.querySelectorAll('.question').forEach(q => q.classList.remove('active'));
  const el = document.getElementById(`q${n}`);
  if (el) el.classList.add('active');
  currentStep = n;
}

function next(step) {
  const errEl = document.getElementById(`e${step}`);
  if (errEl) errEl.innerText = "";
  
  if ([1, 2, 3, 4].includes(step)) {
    const selected = document.querySelector(`#q${step} .choice.selected`);
    if (!selected) {
      if (errEl) errEl.innerText = "Please select an option.";
      return;
    }
    const val = selected.getAttribute("data-v");
    if (step === 1) formData.experience = val;
    if (step === 2) formData.goal = val;
    if (step === 3) formData.age = val;
    if (step === 4) formData.budget = val;
  }
  
  if (step === 5) {
    const email = document.getElementById("emailVal").value.trim();
    if (!email || !email.includes("@")) {
      if (errEl) errEl.innerText = "Please enter a valid email address.";
      return;
    }
    formData.email = email;
  }
  
  if (step === 6) {
    const fn = document.getElementById("firstName").value.trim();
    const ln = document.getElementById("lastName").value.trim();
    const phone = document.getElementById("phoneVal").value.trim();
    if (!fn || !ln) {
      if (errEl) errEl.innerText = "Please enter your full name.";
      return;
    }
    if (!phone) {
      if (errEl) errEl.innerText = "Please enter your phone number.";
      return;
    }
    formData.name = `${fn} ${ln}`;
    const codeEl = document.getElementById("codeDisplay");
    const code = codeEl ? (codeEl.textContent || "+1") : "+1";
    formData.phone = `${code} ${phone}`;
  }
  
  showStep(step + 1);
}

function back(step) {
  if (step <= 1) return;
  showStep(step - 1);
}

async function submitForm() {
  const step = 7;
  const errEl = document.getElementById(`e${step}`);
  if (errEl) errEl.innerText = "";
  
  const selected = document.querySelector(`#q${step} .choice.selected`);
  if (!selected && !formData.contact_preference) {
    if (errEl) errEl.innerText = "Please select an option.";
    return;
  }
  
  if (selected) {
    formData.contact_preference = selected.getAttribute("data-v");
  }

  const btn = document.querySelector(`#q${step} .btn-ok`);
  if (btn) {
    btn.innerText = "Submitting...";
    btn.disabled = true;
  }

  try {
    const response = await fetch(`${SUPABASE_URL}/rest/v1/applications`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'apikey': SUPABASE_KEY,
        'Authorization': `Bearer ${SUPABASE_KEY}`,
        'Prefer': 'return=minimal'
      },
      body: JSON.stringify(formData)
    });

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    document.getElementById(`q${step}`).classList.remove("active");
    document.getElementById(`q-ok`).classList.add("active");
    
  } catch (error) {
    console.error('Error submitting form:', error);
    if (errEl) errEl.innerText = "There was an error submitting your application. Please try again.";
    if (btn) {
      btn.innerText = "Submit →";
      btn.disabled = false;
    }
  }
}

const countries = [
  { code: "+1", flag: "🇺🇸", name: "United States / Canada" },
  { code: "+44", flag: "🇬🇧", name: "United Kingdom" },
  { code: "+61", flag: "🇦🇺", name: "Australia" },
  { code: "+31", flag: "🇳🇱", name: "Netherlands" },
  { code: "+49", flag: "🇩🇪", name: "Germany" },
  { code: "+33", flag: "🇫🇷", name: "France" },
  { code: "+34", flag: "🇪🇸", name: "Spain" },
  { code: "+39", flag: "🇮🇹", name: "Italy" },
  { code: "+41", flag: "🇨🇭", name: "Switzerland" },
  { code: "+46", flag: "🇸🇪", name: "Sweden" },
  { code: "+47", flag: "🇳🇴", name: "Norway" },
  { code: "+45", flag: "🇩🇰", name: "Denmark" },
  { code: "+353", flag: "🇮🇪", name: "Ireland" },
  { code: "+64", flag: "🇳🇿", name: "New Zealand" }
];

document.addEventListener("DOMContentLoaded", () => {
  const select = document.getElementById("countrySelect");
  if (select) {
    select.innerHTML = countries.map(c => `<option value="${c.code}" data-flag="${c.flag}">${c.name} (${c.code})</option>`).join("");
    
    select.addEventListener("change", (e) => {
      const option = e.target.options[e.target.selectedIndex];
      document.getElementById("codeDisplay").innerText = option.value;
      document.getElementById("flagDisplay").innerText = option.getAttribute("data-flag");
    });
  }
});

function toggleFaq(el) {
  el.classList.toggle("open");
  const answer = el.querySelector('.faq-a');
  const icon = el.querySelector('.faq-icon');
  
  if (el.classList.contains("open")) {
    icon.innerText = "−";
    if(answer) answer.style.display = "block";
  } else {
    icon.innerText = "+";
    if(answer) answer.style.display = "none";
  }
}