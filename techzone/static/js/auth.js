/* ═══════════════════════════════════════════
   TECHZONE — Auth JavaScript (login / register)
   ═══════════════════════════════════════════ */

// ── REGISTER ────────────────────────────────
async function handleRegister(e) {
  e.preventDefault();
  const btn = document.getElementById('register-btn');
  const alertEl = document.getElementById('register-alert');

  const payload = {
    full_name: document.getElementById('full_name')?.value.trim(),
    email:     document.getElementById('email')?.value.trim(),
    password:  document.getElementById('password')?.value,
    phone:     document.getElementById('phone')?.value.trim(),
  };

  const confirm_pw = document.getElementById('confirm_password')?.value;
  if (payload.password !== confirm_pw) {
    showAlert(alertEl, 'Passwords do not match.', 'error');
    return;
  }
  if (payload.password.length < 6) {
    showAlert(alertEl, 'Password must be at least 6 characters.', 'error');
    return;
  }

  btn.disabled = true;
  btn.innerHTML = '<span class="spinner"></span> Creating Account…';
  hideAlert(alertEl);

  try {
    const res  = await fetch('/api/register', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload),
    });
    const data = await res.json();

    if (data.success) {
      showAlert(alertEl, `Welcome, ${data.name}! Redirecting…`, 'success');
      setTimeout(() => window.location.href = '/', 1200);
    } else {
      showAlert(alertEl, data.message, 'error');
    }
  } catch {
    showAlert(alertEl, 'Network error. Please try again.', 'error');
  } finally {
    btn.disabled = false;
    btn.innerHTML = 'Create Account';
  }
}

// ── LOGIN ────────────────────────────────────
async function handleLogin(e) {
  e.preventDefault();
  const btn     = document.getElementById('login-btn');
  const alertEl = document.getElementById('login-alert');

  const payload = {
    email:    document.getElementById('email')?.value.trim(),
    password: document.getElementById('password')?.value,
  };

  btn.disabled = true;
  btn.innerHTML = '<span class="spinner"></span> Signing In…';
  hideAlert(alertEl);

  try {
    const res  = await fetch('/api/login', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload),
    });
    const data = await res.json();

    if (data.success) {
      showAlert(alertEl, `Welcome back, ${data.name}!`, 'success');
      setTimeout(() => {
        const next = new URLSearchParams(window.location.search).get('next') || '/';
        window.location.href = next;
      }, 1000);
    } else {
      showAlert(alertEl, data.message, 'error');
    }
  } catch {
    showAlert(alertEl, 'Network error. Please try again.', 'error');
  } finally {
    btn.disabled = false;
    btn.innerHTML = 'Sign In';
  }
}

// ── CONTACT FORM ─────────────────────────────
async function handleContact(e) {
  e.preventDefault();
  const btn     = document.getElementById('contact-btn');
  const alertEl = document.getElementById('contact-alert');

  const payload = {
    name:    document.getElementById('c_name')?.value.trim(),
    email:   document.getElementById('c_email')?.value.trim(),
    subject: document.getElementById('c_subject')?.value.trim(),
    message: document.getElementById('c_message')?.value.trim(),
  };

  btn.disabled = true;
  btn.innerHTML = '<span class="spinner"></span> Sending…';
  hideAlert(alertEl);

  try {
    const res  = await fetch('/api/contact', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload),
    });
    const data = await res.json();

    if (data.success) {
      showAlert(alertEl, data.message, 'success');
      e.target.reset();
    } else {
      showAlert(alertEl, data.message, 'error');
    }
  } catch {
    showAlert(alertEl, 'Network error. Please try again.', 'error');
  } finally {
    btn.disabled = false;
    btn.innerHTML = 'Send Message';
  }
}

// ── Helpers ──────────────────────────────────
function showAlert(el, message, type) {
  if (!el) return;
  el.textContent = message;
  el.className   = `alert alert-${type} show`;
}
function hideAlert(el) {
  if (!el) return;
  el.className = 'alert';
  el.textContent = '';
}

// ── Password toggle ───────────────────────────
document.addEventListener('DOMContentLoaded', () => {
  document.querySelectorAll('.toggle-pw').forEach(btn => {
    btn.addEventListener('click', () => {
      const input = btn.previousElementSibling;
      if (!input) return;
      input.type = input.type === 'password' ? 'text' : 'password';
      btn.textContent = input.type === 'password' ? '👁️' : '🙈';
    });
  });
});
