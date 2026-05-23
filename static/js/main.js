/* ═══════════════════════════════════════════
   TECHZONE — Main JavaScript
   ═══════════════════════════════════════════ */

// ── Toast Notifications ──────────────────────
function showToast(message, type = 'info') {
  let container = document.querySelector('.toast-container');
  if (!container) {
    container = document.createElement('div');
    container.className = 'toast-container';
    document.body.appendChild(container);
  }
  const icons = { success: '✅', error: '❌', info: '💡', warning: '⚠️' };
  const toast = document.createElement('div');
  toast.className = `toast ${type}`;
  toast.innerHTML = `<span>${icons[type] || '💡'}</span><span>${message}</span>`;
  container.appendChild(toast);
  setTimeout(() => { toast.style.opacity = '0'; toast.style.transition = 'opacity 0.4s'; setTimeout(() => toast.remove(), 400); }, 3500);
}

// ── Session / Auth State ─────────────────────
async function loadSession() {
  try {
    const res  = await fetch('/api/session');
    const data = await res.json();
    updateNavForUser(data);
    return data;
  } catch { return { logged_in: false }; }
}

function updateNavForUser(session) {
  const loginBtn    = document.getElementById('nav-login-btn');
  const registerBtn = document.getElementById('nav-register-btn');
  const userChip    = document.getElementById('nav-user-chip');
  const userNameEl  = document.getElementById('nav-user-name');

  if (session.logged_in) {
    if (loginBtn)    loginBtn.style.display    = 'none';
    if (registerBtn) registerBtn.style.display = 'none';
    if (userChip)  { userChip.style.display    = 'flex'; }
    if (userNameEl)  userNameEl.textContent    = session.name.split(' ')[0];
  } else {
    if (loginBtn)    loginBtn.style.display    = '';
    if (registerBtn) registerBtn.style.display = '';
    if (userChip)    userChip.style.display    = 'none';
  }
}

async function logout() {
  await fetch('/api/logout', { method: 'POST' });
  showToast('Logged out successfully', 'info');
  setTimeout(() => window.location.href = '/login', 800);
}

// ── Cart Badge ───────────────────────────────
async function updateCartBadge() {
  const badge = document.querySelector('.cart-badge');
  if (!badge) return;
  try {
    const res  = await fetch('/api/cart');
    const data = await res.json();
    if (data.success && data.cart.length > 0) {
      const total = data.cart.reduce((s, i) => s + i.quantity, 0);
      badge.textContent = total > 99 ? '99+' : total;
      badge.classList.add('visible');
    } else {
      badge.classList.remove('visible');
    }
  } catch { badge.classList.remove('visible'); }
}

// ── Add to Cart (from any page) ──────────────
async function addToCart(product) {
  const session = await loadSession();
  if (!session.logged_in) {
    showToast('Please login to add items to cart', 'warning');
    setTimeout(() => window.location.href = '/login', 1000);
    return;
  }
  try {
    const res  = await fetch('/api/cart/add', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(product)
    });
    const data = await res.json();
    if (data.success) {
      showToast(data.message, 'success');
      updateCartBadge();
    } else {
      showToast(data.message, 'error');
    }
  } catch { showToast('Network error. Try again.', 'error'); }
}

// ── Hamburger Menu ───────────────────────────
document.addEventListener('DOMContentLoaded', () => {
  const hamburger = document.querySelector('.hamburger');
  const navLinks  = document.querySelector('.nav-links');
  const navActions= document.querySelector('.nav-actions');

  hamburger?.addEventListener('click', () => {
    navLinks?.classList.toggle('open');
    navActions?.classList.toggle('open');
  });

  // active link
  const currentPath = window.location.pathname;
  document.querySelectorAll('.nav-links a').forEach(a => {
    if (a.getAttribute('href') === currentPath) a.classList.add('active');
  });

  loadSession();
  updateCartBadge();
});
