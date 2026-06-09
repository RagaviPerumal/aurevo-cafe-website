const CART_KEY = 'aurevo-cart';

function getCart() {
  try {
    return JSON.parse(localStorage.getItem(CART_KEY)) || [];
  } catch {
    return [];
  }
}

function saveCart(cart) {
  localStorage.setItem(CART_KEY, JSON.stringify(cart));
  updateCartBadge();
}

function parsePrice(text) {
  const match = text?.match(/[\d.]+/);
  return match ? parseFloat(match[0]) : 0;
}

function itemId(name) {
  return name.toLowerCase().replace(/[^a-z0-9]+/g, '-');
}

function addToCart(name, price) {
  const cart = getCart();
  const id = itemId(name);
  const existing = cart.find((item) => item.id === id);

  if (existing) {
    existing.qty += 1;
  } else {
    cart.push({ id, name, price, qty: 1 });
  }

  saveCart(cart);
  showToast(`${name} added to cart`);
}

function removeFromCart(id) {
  saveCart(getCart().filter((item) => item.id !== id));
}

function updateQty(id, qty) {
  const cart = getCart();
  const item = cart.find((i) => i.id === id);
  if (!item) return;

  if (qty <= 0) {
    removeFromCart(id);
    return;
  }

  item.qty = qty;
  saveCart(cart);
}

function clearCart() {
  saveCart([]);
}

function cartTotal(cart) {
  return cart.reduce((sum, item) => sum + item.price * item.qty, 0);
}

function cartCount(cart) {
  return cart.reduce((sum, item) => sum + item.qty, 0);
}

function formatPrice(amount) {
  return `$${amount.toFixed(2)}`;
}

function updateCartBadge() {
  const badge = document.querySelector('.header__cart-count');
  if (!badge) return;

  const count = cartCount(getCart());
  badge.textContent = count;
  badge.hidden = count === 0;
}

function showToast(message) {
  let toast = document.querySelector('.cart-toast');
  if (!toast) {
    toast = document.createElement('div');
    toast.className = 'cart-toast';
    document.body.appendChild(toast);
  }

  toast.textContent = message;
  toast.classList.add('cart-toast--visible');
  clearTimeout(showToast.timer);
  showToast.timer = setTimeout(() => toast.classList.remove('cart-toast--visible'), 2200);
}

function initAddToCartButtons() {
  document.querySelectorAll('.menu-item').forEach((row) => {
    if (row.querySelector('[data-add-to-cart]')) return;

    const name = row.querySelector('.menu-item__info h4')?.textContent?.trim();
    const price = parsePrice(row.querySelector('.menu-item__price')?.textContent);
    if (!name || !price) return;

    const actions = document.createElement('div');
    actions.className = 'menu-item__actions';

    const priceEl = row.querySelector('.menu-item__price');
    if (priceEl) actions.appendChild(priceEl);

    const btn = document.createElement('button');
    btn.type = 'button';
    btn.className = 'btn btn--dark btn--sm';
    btn.textContent = 'Add';
    btn.dataset.addToCart = '';
    btn.dataset.name = name;
    btn.dataset.price = price;
    actions.appendChild(btn);

    row.appendChild(actions);
  });

  document.querySelectorAll('.menu-showcase__item').forEach((card) => {
    if (card.querySelector('[data-add-to-cart]')) return;

    const name = card.querySelector('h4')?.textContent?.trim();
    const price = parsePrice(card.querySelector('.menu-showcase__label p')?.textContent);
    if (!name || !price) return;

    const btn = document.createElement('button');
    btn.type = 'button';
    btn.className = 'btn btn--white btn--sm menu-showcase__add';
    btn.textContent = 'Add to Cart';
    btn.dataset.addToCart = '';
    btn.dataset.name = name;
    btn.dataset.price = price;
    card.querySelector('.menu-showcase__label')?.appendChild(btn);
  });

  document.querySelectorAll('[data-add-to-cart]').forEach((btn) => {
    btn.addEventListener('click', () => {
      addToCart(btn.dataset.name, parseFloat(btn.dataset.price));
    });
  });
}

function renderCartPage() {
  const cartMain = document.querySelector('.cart-page');
  if (!cartMain) return;

  const listEl = document.querySelector('.cart-list');
  const emptyEl = document.querySelector('.cart-empty');
  const contentEl = document.querySelector('.cart-content');
  const subtotalEl = document.querySelector('.cart-summary__subtotal');
  const totalEl = document.querySelector('.cart-summary__total');
  const checkoutForm = document.querySelector('.checkout-form');
  const successEl = document.querySelector('.checkout-success');

  function render() {
    const cart = getCart();

    if (cart.length === 0) {
      emptyEl.hidden = false;
      contentEl.hidden = true;
      return;
    }

    emptyEl.hidden = true;
    contentEl.hidden = false;

    listEl.innerHTML = cart.map((item) => `
      <div class="cart-item" data-id="${item.id}">
        <div class="cart-item__info">
          <h4 class="cart-item__name">${item.name}</h4>
          <p class="cart-item__price">${formatPrice(item.price)} each</p>
        </div>
        <div class="cart-item__controls">
          <div class="qty-control">
            <button type="button" class="qty-control__btn" data-qty="-1" aria-label="Decrease quantity">−</button>
            <span class="qty-control__value">${item.qty}</span>
            <button type="button" class="qty-control__btn" data-qty="1" aria-label="Increase quantity">+</button>
          </div>
          <span class="cart-item__total">${formatPrice(item.price * item.qty)}</span>
          <button type="button" class="cart-item__remove" aria-label="Remove item">×</button>
        </div>
      </div>
    `).join('');

    const subtotal = cartTotal(cart);
    subtotalEl.textContent = formatPrice(subtotal);
    totalEl.textContent = formatPrice(subtotal);

    listEl.querySelectorAll('.cart-item').forEach((row) => {
      const id = row.dataset.id;

      row.querySelector('[data-qty="-1"]').addEventListener('click', () => {
        const item = getCart().find((i) => i.id === id);
        if (item) updateQty(id, item.qty - 1);
        render();
      });

      row.querySelector('[data-qty="1"]').addEventListener('click', () => {
        const item = getCart().find((i) => i.id === id);
        if (item) updateQty(id, item.qty + 1);
        render();
      });

      row.querySelector('.cart-item__remove').addEventListener('click', () => {
        removeFromCart(id);
        render();
      });
    });
  }

  checkoutForm?.addEventListener('submit', (e) => {
    e.preventDefault();
    if (getCart().length === 0) return;

    contentEl.hidden = true;
    successEl.hidden = false;
    clearCart();
    updateCartBadge();
  });

  render();
}

document.addEventListener('DOMContentLoaded', () => {
  updateCartBadge();
  initAddToCartButtons();
  renderCartPage();
});
