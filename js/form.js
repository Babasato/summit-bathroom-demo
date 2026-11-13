/*
  form.js: handles the quote form on index.html.

  What happens when someone clicks "Send":
    1. We check every field in the browser (so people get quick, clear errors).
    2. We turn the answers into a JSON object (a labelled list of values).
    3. We POST that JSON to a Make.com "webhook", a web address that Make
       listens on. Make then saves the lead to a Google Sheet and sends emails.
    4. If Make says OK, we send the visitor to thank-you.html.

  IMPORTANT: this file runs in the visitor's browser, so everything in it is public.
  Never put passwords or private API keys here. A webhook URL is OK for a demo only.
*/

// Paste your Make webhook URL between the quotes. While it still says
// PASTE_..., the form runs in "practice mode": it logs the data to the browser
// console (F12 > Console) and does not send anything anywhere.
const WEBHOOK_URL = "https://hook.eu1.make.com/svdnz4earunob902doa8nv36s3rabq64";

const FALLBACK_PHONE = "(913) 555-0142"; // fictional demo number

const form = document.getElementById("quote-form");
const button = document.getElementById("submit-btn");
const statusBox = document.getElementById("form-status");

// Each rule: field id -> function returning an error message, or "" if fine.
const rules = {
  name: (v) => (v.trim().length < 2 ? "Please enter your full name." : ""),
  email: (v) => (/^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(v.trim()) ? "" : "Please enter a valid email address."),
  phone: (v) => (v.replace(/\D/g, "").length >= 10 ? "" : "Please enter a phone number with area code."),
  zip: (v) => (/^\d{5}(-\d{4})?$/.test(v.trim()) ? "" : "Please enter a 5-digit ZIP code."),
  project: (v) => (v ? "" : "Please choose a project type."),
  budget: (v) => (v ? "" : "Please choose an approximate budget."),
};

function showError(id, message) {
  const input = document.getElementById(id);
  const box = document.getElementById(id + "-error");
  if (!input || !box) return;
  box.textContent = message;
  if (message) input.setAttribute("aria-invalid", "true");
  else input.removeAttribute("aria-invalid");
}

// Returns true when every field passes. Focuses the first bad field.
function validate() {
  let firstBad = null;
  for (const id of Object.keys(rules)) {
    const message = rules[id](document.getElementById(id).value);
    showError(id, message);
    if (message && !firstBad) firstBad = id;
  }
  if (firstBad) document.getElementById(firstBad).focus();
  return !firstBad;
}

// Clear an error as soon as the person fixes the field.
for (const id of Object.keys(rules)) {
  document.getElementById(id).addEventListener("input", () => showError(id, rules[id](document.getElementById(id).value)));
}

function setStatus(message, kind) {
  statusBox.textContent = message;
  statusBox.className = "form-status" + (kind ? " is-" + kind : "");
}

form.addEventListener("submit", async (event) => {
  event.preventDefault(); // stop the browser's default page reload
  setStatus("", "");

  // Bots tend to fill every field, including the hidden one. If it has text,
  // pretend it worked but send nothing.
  if (document.getElementById("company_website").value.trim() !== "") {
    window.location.href = "thank-you.html";
    return;
  }

  if (!validate()) return;

  const lead = {
    name: form.name.value.trim(),
    email: form.email.value.trim(),
    phone: form.phone.value.trim(),
    zip: form.zip.value.trim(),
    project: form.project.value,
    budget: form.budget.value,
    message: form.message.value.trim(),
    source: "demo-site",
    submittedAt: new Date().toISOString(),
  };

  button.disabled = true;
  button.textContent = "Sending...";

  // Practice mode: no webhook configured yet.
  if (WEBHOOK_URL.startsWith("PASTE_")) {
    console.log("Practice mode. This is what would be sent:", lead);
    setStatus("Practice mode: data logged to the browser console (press F12). Add your Make webhook URL in js/form.js to send it for real.", "ok");
    button.disabled = false;
    button.textContent = "Send my quote request";
    return;
  }

  try {
    const response = await fetch(WEBHOOK_URL, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(lead),
    });
    if (!response.ok) throw new Error("Server answered " + response.status);
    window.location.href = "thank-you.html";
  } catch (error) {
    console.error("Quote form failed:", error);
    setStatus("Sorry, something went wrong and your request was not sent. Please try again, or call us at " + FALLBACK_PHONE + ".", "error");
    button.disabled = false;
    button.textContent = "Send my quote request";
  }
});
