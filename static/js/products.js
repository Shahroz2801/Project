/* ═══════════════════════════════════════════
   TECHZONE — Products JavaScript
   ═══════════════════════════════════════════ */

const PRODUCTS = [
  { id:'p001', name:'Logitech MX Master 3S', category:'mice', emoji:'🖱️', price:99.99, oldPrice:119.99, badge:'hot', desc:'Advanced wireless mouse with ultra-fast scroll wheel and ergonomic design.' },
  { id:'p002', name:'Mechanical RGB Keyboard', category:'keyboards', emoji:'⌨️', price:129.99, oldPrice:null, badge:'new', desc:'Full-size mechanical keyboard with Cherry MX switches and per-key RGB.' },
  { id:'p003', name:'Sony WH-1000XM5', category:'headsets', emoji:'🎧', price:349.99, oldPrice:399.99, badge:'sale', desc:'Industry-leading noise cancellation with crystal-clear audio quality.' },
  { id:'p004', name:'Samsung 27" 4K Monitor', category:'monitors', emoji:'🖥️', price:499.99, oldPrice:null, badge:'new', desc:'UHD 4K IPS panel with HDR600, 144Hz refresh rate and USB-C connectivity.' },
  { id:'p005', name:'SteelSeries Arctis Nova Pro', category:'headsets', emoji:'🎧', price:249.99, oldPrice:299.99, badge:'sale', desc:'Premium gaming headset with multiplatform active noise cancellation.' },
  { id:'p006', name:'Razer DeathAdder V3', category:'mice', emoji:'🖱️', price:69.99, oldPrice:null, badge:'hot', desc:'Ultra-lightweight ergonomic gaming mouse with optical sensor.' },
  { id:'p007', name:'Keychron Q1 Pro', category:'keyboards', emoji:'⌨️', price:199.99, oldPrice:229.99, badge:'sale', desc:'Wireless QMK/VIA mechanical keyboard with aluminum body.' },
  { id:'p008', name:'Dell UltraSharp 32"', category:'monitors', emoji:'🖥️', price:699.99, oldPrice:null, badge:'new', desc:'32-inch 6K retina-class display with 100% sRGB color accuracy.' },
  { id:'p009', name:'Elgato Wave:3 Mic', category:'accessories', emoji:'🎙️', price:149.99, oldPrice:179.99, badge:'sale', desc:'Professional USB condenser microphone with real-time mixing.' },
  { id:'p010', name:'Anker 10-Port USB Hub', category:'accessories', emoji:'🔌', price:49.99, oldPrice:null, badge:'new', desc:'10-port USB 3.0 hub with 60W charging and data transfer up to 5Gbps.' },
  { id:'p011', name:'Corsair K100 RGB', category:'keyboards', emoji:'⌨️', price:229.99, oldPrice:null, badge:'hot', desc:'Optical-mechanical gaming keyboard with 4000Hz polling rate.' },
  { id:'p012', name:'Asus ROG Swift Pro', category:'monitors', emoji:'🖥️', price:799.99, oldPrice:899.99, badge:'sale', desc:'360Hz 1080p esports monitor with ULMB2 blur reduction.' },
];

let currentFilter = 'all';

function renderProducts(filter = 'all') {
  const grid = document.getElementById('products-grid');
  if (!grid) return;
  const filtered = filter === 'all' ? PRODUCTS : PRODUCTS.filter(p => p.category === filter);
  grid.innerHTML = filtered.map(p => `
    <div class="product-card" data-id="${p.id}">
      ${p.badge ? `<span class="product-badge badge-${p.badge}">${p.badge}</span>` : ''}
      <div class="product-img-wrap">${p.emoji}</div>
      <div class="product-info">
        <div class="product-category">${p.category}</div>
        <div class="product-name">${p.name}</div>
        <div class="product-desc">${p.desc}</div>
        <div class="product-footer">
          <div class="product-price">
            $${p.price.toFixed(2)}
            ${p.oldPrice ? `<span class="old-price">$${p.oldPrice.toFixed(2)}</span>` : ''}
          </div>
          <button class="btn-add-cart" onclick="handleAddToCart('${p.id}')">Add to Cart</button>
        </div>
      </div>
    </div>
  `).join('');
}

function handleAddToCart(productId) {
  const product = PRODUCTS.find(p => p.id === productId);
  if (!product) return;
  addToCart({
    product_id: product.id,
    name: product.name,
    price: product.price,
    image: product.emoji
  });
}

// Filter tabs
document.addEventListener('DOMContentLoaded', () => {
  renderProducts('all');

  document.querySelectorAll('.filter-tab').forEach(tab => {
    tab.addEventListener('click', () => {
      document.querySelectorAll('.filter-tab').forEach(t => t.classList.remove('active'));
      tab.classList.add('active');
      currentFilter = tab.dataset.filter;
      renderProducts(currentFilter);
    });
  });
});
