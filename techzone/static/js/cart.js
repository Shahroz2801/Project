/* ═══════════════════════════════════════════
   TECHZONE — Cart JavaScript
   ═══════════════════════════════════════════ */

async function loadCart() {
  const container = document.getElementById('cart-items');
  const emptyEl   = document.getElementById('empty-cart');
  const summaryEl = document.getElementById('cart-summary');
  if (!container) return;

  container.innerHTML = '<div style="text-align:center;padding:2rem;color:var(--text-secondary)"><div class="spinner"></div> Loading cart…</div>';

  const session = await loadSession();
  if (!session.logged_in) {
    container.innerHTML = '';
    emptyEl.style.display = 'block';
    emptyEl.querySelector('h3').textContent = 'Please login first';
    emptyEl.querySelector('p').textContent = 'You need to be logged in to view your cart.';
    emptyEl.querySelector('a').href = '/login';
    emptyEl.querySelector('a').textContent = 'Login Now';
    if (summaryEl) summaryEl.style.display = 'none';
    return;
  }

  try {
    const res  = await fetch('/api/cart');
    const data = await res.json();

    if (!data.success || data.cart.length === 0) {
      container.innerHTML = '';
      emptyEl.style.display = 'block';
      if (summaryEl) summaryEl.style.display = 'none';
      return;
    }

    emptyEl.style.display = 'none';
    if (summaryEl) summaryEl.style.display = 'block';

    container.innerHTML = data.cart.map(item => `
      <div class="cart-item" id="cart-item-${item.id}">
        <div class="cart-item-img">${item.image || '📦'}</div>
        <div class="cart-item-info">
          <div class="cart-item-cat">${item.product_id}</div>
          <div class="cart-item-name">${item.name}</div>
          <div class="cart-item-price">$${parseFloat(item.price).toFixed(2)} each</div>
        </div>
        <div class="qty-control">
          <button class="qty-btn" onclick="changeQty(${item.id}, ${item.quantity - 1})">−</button>
          <span class="qty-num">${item.quantity}</span>
          <button class="qty-btn" onclick="changeQty(${item.id}, ${item.quantity + 1})">+</button>
        </div>
        <div style="text-align:right;min-width:90px">
          <div style="font-family:var(--font-display);color:var(--accent-blue);font-size:1rem;">
            $${(item.price * item.quantity).toFixed(2)}
          </div>
          <button class="btn-remove" onclick="removeItem(${item.id})" style="margin-top:0.5rem">Remove</button>
        </div>
      </div>
    `).join('');

    updateSummary(data.cart);
  } catch (e) {
    container.innerHTML = '<p style="color:#f87171;text-align:center">Error loading cart. Please try again.</p>';
  }
}

function updateSummary(cart) {
  const subtotal = cart.reduce((s, i) => s + (i.price * i.quantity), 0);
  const shipping  = subtotal > 100 ? 0 : 9.99;
  const tax       = subtotal * 0.08;
  const total     = subtotal + shipping + tax;

  const el = id => document.getElementById(id);
  if (el('summary-subtotal')) el('summary-subtotal').textContent = '$' + subtotal.toFixed(2);
  if (el('summary-shipping')) el('summary-shipping').textContent = shipping === 0 ? 'FREE' : '$' + shipping.toFixed(2);
  if (el('summary-tax'))      el('summary-tax').textContent      = '$' + tax.toFixed(2);
  if (el('summary-total'))    el('summary-total').textContent    = '$' + total.toFixed(2);
}

async function changeQty(cartId, newQty) {
  try {
    const res  = await fetch('/api/cart/update', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ cart_id: cartId, quantity: newQty })
    });
    const data = await res.json();
    if (data.success) { loadCart(); updateCartBadge(); }
    else showToast(data.message, 'error');
  } catch { showToast('Error updating cart', 'error'); }
}

async function removeItem(cartId) {
  try {
    const res  = await fetch('/api/cart/remove', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ cart_id: cartId })
    });
    const data = await res.json();
    if (data.success) { showToast('Item removed', 'info'); loadCart(); updateCartBadge(); }
    else showToast(data.message, 'error');
  } catch { showToast('Error removing item', 'error'); }
}

async function checkout() {
  const btn = document.getElementById('checkout-btn');
  if (btn) { btn.disabled = true; btn.innerHTML = '<span class="spinner"></span> Processing…'; }
  try {
    const res  = await fetch('/api/cart/checkout', { method: 'POST' });
    const data = await res.json();
    if (data.success) {
      showToast(data.message, 'success');
      setTimeout(() => { loadCart(); updateCartBadge(); }, 1000);
    } else {
      showToast(data.message, 'error');
    }
  } catch { showToast('Checkout failed. Try again.', 'error'); }
  finally {
    if (btn) { btn.disabled = false; btn.innerHTML = '🛒 Place Order'; }
  }
}

document.addEventListener('DOMContentLoaded', loadCart);
