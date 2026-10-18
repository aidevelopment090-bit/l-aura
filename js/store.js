/**
 * L'AURA LUXURY ACCESSORIES - STOREFRONT CONTROLLER
 * Handles product rendering, cart, wishlist, quick view, currency conversion & checkout.
 */

// Application State
const StoreState = {
    products: [],
    filteredProducts: [],
    activeCategory: 'All',
    searchQuery: '',
    sortBy: 'featured',
    cart: JSON.parse(localStorage.getItem('laura_cart')) || [],
    wishlist: JSON.parse(localStorage.getItem('laura_wishlist')) || [],
    currency: localStorage.getItem('laura_currency') || 'USD',
    rates: {
        USD: { symbol: '$', rate: 1.0, decimals: 2 },
        PKR: { symbol: '₨ ', rate: 280.0, decimals: 0 },
        EUR: { symbol: '€', rate: 0.92, decimals: 2 },
        GBP: { symbol: '£', rate: 0.79, decimals: 2 },
        AED: { symbol: 'AED ', rate: 3.67, decimals: 2 }
    }
};

// DOM Elements
const DOM = {
    productsGrid: document.getElementById('products-grid'),
    filterBtns: document.querySelectorAll('.filter-btn'),
    searchInput: document.getElementById('search-input'),
    sortSelect: document.getElementById('sort-select'),
    currencySelect: document.getElementById('currency-select'),
    
    // Counters
    cartCountBadges: document.querySelectorAll('.cart-count'),
    wishlistCountBadges: document.querySelectorAll('.wishlist-count'),
    
    // Drawers & Modals
    cartDrawer: document.getElementById('cart-drawer'),
    drawerBackdrop: document.getElementById('drawer-backdrop'),
    cartItemsList: document.getElementById('cart-items-list'),
    cartSubtotal: document.getElementById('cart-subtotal'),
    cartTotal: document.getElementById('cart-total'),
    cartDrawerOpenBtn: document.getElementById('cart-open-btn'),
    cartDrawerCloseBtn: document.getElementById('cart-close-btn'),
    
    wishlistDrawer: document.getElementById('wishlist-drawer'),
    wishlistItemsList: document.getElementById('wishlist-items-list'),
    wishlistOpenBtn: document.getElementById('wishlist-open-btn'),
    wishlistCloseBtn: document.getElementById('wishlist-close-btn'),
    
    quickViewModal: document.getElementById('quick-view-modal'),
    quickViewContent: document.getElementById('quick-view-content'),
    
    checkoutModal: document.getElementById('checkout-modal'),
    checkoutForm: document.getElementById('checkout-form'),
    checkoutOpenBtn: document.getElementById('checkout-open-btn'),
    checkoutSummaryList: document.getElementById('checkout-summary-list'),
    checkoutSummaryTotal: document.getElementById('checkout-summary-total'),
    
    toastContainer: document.getElementById('toast-container'),
    supabaseStatusDot: document.getElementById('supabase-status-dot'),
    supabaseStatusText: document.getElementById('supabase-status-text')
};

/**
 * Currency Formatter Helper
 */
function formatPrice(amountInUSD) {
    const curr = StoreState.rates[StoreState.currency] || StoreState.rates.USD;
    const converted = amountInUSD * curr.rate;
    return `${curr.symbol}${converted.toLocaleString(undefined, {
        minimumFractionDigits: curr.decimals,
        maximumFractionDigits: curr.decimals
    })}`;
}

/**
 * Toast Notification Utility
 */
function showToast(message, icon = 'fa-check') {
    if (!DOM.toastContainer) return;
    const toast = document.createElement('div');
    toast.className = 'toast';
    toast.innerHTML = `<i class="fa-solid ${icon} text-gold"></i><span>${message}</span>`;
    DOM.toastContainer.appendChild(toast);
    
    setTimeout(() => {
        toast.style.opacity = '0';
        toast.style.transform = 'translateY(10px)';
        setTimeout(() => toast.remove(), 300);
    }, 3200);
}

/**
 * Initialize Application
 */
async function initStore() {
    // Check Supabase health
    updateSupabaseIndicator();

    // Set initial currency
    if (DOM.currencySelect) {
        DOM.currencySelect.value = StoreState.currency;
        DOM.currencySelect.addEventListener('change', (e) => {
            StoreState.currency = e.target.value;
            localStorage.setItem('laura_currency', StoreState.currency);
            renderProducts();
            renderCart();
            renderWishlist();
        });
    }

    // Load Products
    await loadProducts();

    // Event Listeners
    setupEventListeners();
    updateBadges();
}

/**
 * Supabase Indicator Check
 */
async function updateSupabaseIndicator() {
    if (!window.LauraAPI) return;
    try {
        const state = await window.LauraAPI.checkSupabaseStatus();
        if (DOM.supabaseStatusDot && DOM.supabaseStatusText) {
            if (state.productsTableReady) {
                DOM.supabaseStatusDot.className = 'status-dot';
                DOM.supabaseStatusText.textContent = `Supabase Live Connected (${window.LauraAPI.config.projectId})`;
            } else {
                DOM.supabaseStatusDot.className = 'status-dot local-mode';
                DOM.supabaseStatusText.innerHTML = `Supabase Connected (Setup tables in Admin Panel) • Local Mode Active`;
            }
        }
    } catch (e) {
        console.log('Status ping note:', e);
    }
}

/**
 * Fetch and Load Products
 */
async function loadProducts() {
    if (DOM.productsGrid) {
        DOM.productsGrid.innerHTML = `
            <div style="grid-column: 1/-1; text-align: center; padding: 60px 0;">
                <i class="fa-solid fa-circle-notch fa-spin text-gold" style="font-size: 2rem;"></i>
                <p style="margin-top: 14px; color: var(--text-muted); font-size: 0.9rem;">Curating fine collection...</p>
            </div>
        `;
    }

    try {
        const res = await window.LauraAPI.getProducts();
        if (res.success && Array.isArray(res.data)) {
            StoreState.products = res.data;
            applyFilters();
        }
    } catch (err) {
        console.error('Failed to load products:', err);
    }
}

/**
 * Filter & Sort Logic
 */
function applyFilters() {
    let result = [...StoreState.products];

    // Category Filter
    if (StoreState.activeCategory !== 'All') {
        result = result.filter(p => p.category.toLowerCase() === StoreState.activeCategory.toLowerCase());
    }

    // Search Query
    if (StoreState.searchQuery.trim() !== '') {
        const query = StoreState.searchQuery.toLowerCase();
        result = result.filter(p => 
            p.title.toLowerCase().includes(query) ||
            p.category.toLowerCase().includes(query) ||
            (p.description && p.description.toLowerCase().includes(query))
        );
    }

    // Sort
    switch (StoreState.sortBy) {
        case 'price-asc':
            result.sort((a, b) => Number(a.price) - Number(b.price));
            break;
        case 'price-desc':
            result.sort((a, b) => Number(b.price) - Number(a.price));
            break;
        case 'rating':
            result.sort((a, b) => (b.rating || 5) - (a.rating || 5));
            break;
        case 'newest':
            result.sort((a, b) => new Date(b.created_at || 0) - new Date(a.created_at || 0));
            break;
        default: // featured
            result.sort((a, b) => (b.is_featured ? 1 : 0) - (a.is_featured ? 1 : 0));
    }

    StoreState.filteredProducts = result;
    renderProducts();
}

/**
 * Render Product Cards in Catalog
 */
function renderProducts() {
    if (!DOM.productsGrid) return;

    if (StoreState.filteredProducts.length === 0) {
        DOM.productsGrid.innerHTML = `
            <div style="grid-column: 1/-1; text-align: center; padding: 70px 20px; background: #fff; border-radius: 8px; border: 1px dashed var(--border-color);">
                <i class="fa-regular fa-gem text-gold" style="font-size: 2.5rem; margin-bottom: 14px;"></i>
                <h3 style="font-family: var(--font-serif); font-size: 1.6rem; margin-bottom: 8px;">No Pieces Found</h3>
                <p style="color: var(--text-secondary); font-size: 0.9rem;">Try selecting a different category or clearing your search filter.</p>
                <button class="btn btn-primary" style="margin-top: 18px; padding: 10px 24px;" onclick="resetFilters()">View All Collections</button>
            </div>
        `;
        return;
    }

    DOM.productsGrid.innerHTML = StoreState.filteredProducts.map(product => {
        const isWishlisted = StoreState.wishlist.some(id => id === product.id);
        const originalPriceHtml = product.original_price && Number(product.original_price) > Number(product.price)
            ? `<span class="price-original">${formatPrice(product.original_price)}</span>`
            : '';

        return `
            <article class="product-card" data-id="${product.id}">
                <div class="product-thumb-wrap">
                    ${product.badge ? `<span class="product-badge">${product.badge}</span>` : ''}
                    <button class="wishlist-btn ${isWishlisted ? 'active' : ''}" 
                            title="${isWishlisted ? 'Remove from Wishlist' : 'Add to Wishlist'}" 
                            onclick="toggleWishlist('${product.id}')">
                        <i class="${isWishlisted ? 'fa-solid' : 'fa-regular'} fa-heart"></i>
                    </button>
                    <img class="product-img" src="${product.image_url}" alt="${product.title}" loading="lazy" 
                         onerror="this.src='https://images.unsplash.com/photo-1599643478518-a784e5dc4c8f?auto=format&fit=crop&w=800&q=80'">
                    <button class="quick-view-overlay-btn" onclick="openQuickView('${product.id}')">
                        <i class="fa-regular fa-eye"></i> Quick View
                    </button>
                </div>

                <div class="product-info">
                    <div class="product-meta-row">
                        <span class="product-category">${product.category}</span>
                        <span class="product-rating">
                            <i class="fa-solid fa-star"></i> ${product.rating || '4.9'}
                        </span>
                    </div>

                    <h3 class="product-title" onclick="openQuickView('${product.id}')">${product.title}</h3>
                    <p class="product-desc-snippet">${product.description || 'Exclusive luxury accessory piece handcrafted to elevate your timeless style.'}</p>

                    <div class="product-footer">
                        <div class="product-prices">
                            <span class="price-current">${formatPrice(product.price)}</span>
                            ${originalPriceHtml}
                        </div>
                        <button class="add-cart-btn" onclick="addToCart('${product.id}')">
                            <i class="fa-solid fa-bag-shopping"></i> Add
                        </button>
                    </div>
                </div>
            </article>
        `;
    }).join('');
}

function resetFilters() {
    StoreState.activeCategory = 'All';
    StoreState.searchQuery = '';
    if (DOM.searchInput) DOM.searchInput.value = '';
    DOM.filterBtns.forEach(btn => {
        btn.classList.toggle('active', btn.dataset.category === 'All');
    });
    applyFilters();
}

/**
 * Quick View Modal Logic
 */
function openQuickView(productId) {
    const product = StoreState.products.find(p => p.id === productId);
    if (!product || !DOM.quickViewModal || !DOM.quickViewContent) return;

    const isWishlisted = StoreState.wishlist.some(id => id === product.id);
    const origPriceHtml = product.original_price && Number(product.original_price) > Number(product.price)
        ? `<span class="qv-original-price">${formatPrice(product.original_price)}</span>`
        : '';

    DOM.quickViewContent.innerHTML = `
        <div class="quick-view-grid">
            <div style="background: #FAF8F5; border-radius: var(--radius-md); overflow: hidden;">
                <img class="quick-view-img" src="${product.image_url}" alt="${product.title}">
            </div>

            <div class="qv-details">
                <span class="qv-category">${product.category} • ${product.badge || 'L\'AURA EXCLUSIVE'}</span>
                <h2 class="qv-title">${product.title}</h2>

                <div style="display: flex; align-items: center; gap: 12px; margin-bottom: 12px;">
                    <div class="product-rating" style="font-size: 0.9rem;">
                        <i class="fa-solid fa-star"></i>
                        <i class="fa-solid fa-star"></i>
                        <i class="fa-solid fa-star"></i>
                        <i class="fa-solid fa-star"></i>
                        <i class="fa-solid fa-star"></i>
                        <span style="color: var(--text-primary); font-weight: 600; margin-left: 4px;">${product.rating || '4.9'}</span>
                    </div>
                    <span style="font-size: 0.8rem; color: #10B981; font-weight: 600;">
                        <i class="fa-solid fa-circle-check"></i> In Stock (${product.stock || 15} available)
                    </span>
                </div>

                <div class="qv-prices">
                    <span class="qv-price">${formatPrice(product.price)}</span>
                    ${origPriceHtml}
                </div>

                <p class="qv-desc">${product.description || 'Mastercrafted with the highest degree of artisan attention. Designed to be an enduring heirloom piece that accentuates any high-fashion attire.'}</p>

                <div class="qv-specs-box">
                    <div><strong>Material:</strong> 18K Gold Vermeil / Italian Leather</div>
                    <div><strong>Certification:</strong> Hallmarked & Authenticated</div>
                    <div><strong>Packaging:</strong> Signature L\'AURA Velvet Box</div>
                    <div><strong>Warranty:</strong> 2-Year International Care</div>
                </div>

                <div class="qv-actions">
                    <div class="qty-control" style="height: 48px;">
                        <button class="qty-btn" onclick="adjustQuickViewQty(-1)" style="width: 38px; font-size: 1.1rem;">-</button>
                        <span id="qv-qty-val" class="qty-val" style="padding: 0 16px; font-size: 1rem;">1</span>
                        <button class="qty-btn" onclick="adjustQuickViewQty(1)" style="width: 38px; font-size: 1.1rem;">+</button>
                    </div>
                    <button class="btn btn-primary" style="flex-grow: 1;" onclick="addQuickViewToCart('${product.id}')">
                        <i class="fa-solid fa-bag-shopping"></i> Add To Bag
                    </button>
                    <button class="action-btn" style="width: 48px; height: 48px; border: 1px solid var(--border-color);" 
                            onclick="toggleWishlist('${product.id}')" title="Wishlist">
                        <i class="${isWishlisted ? 'fa-solid text-gold' : 'fa-regular'} fa-heart"></i>
                    </button>
                </div>
            </div>
        </div>
    `;

    DOM.quickViewModal.classList.add('active');
}

let quickViewQty = 1;
function adjustQuickViewQty(delta) {
    quickViewQty = Math.max(1, quickViewQty + delta);
    const elem = document.getElementById('qv-qty-val');
    if (elem) elem.textContent = quickViewQty;
}

function addQuickViewToCart(productId) {
    addToCart(productId, quickViewQty);
    closeAllModals();
    quickViewQty = 1;
}

/**
 * Cart Logic
 */
function addToCart(productId, qty = 1) {
    const product = StoreState.products.find(p => p.id === productId);
    if (!product) return;

    const existingIndex = StoreState.cart.findIndex(item => item.id === productId);
    if (existingIndex > -1) {
        StoreState.cart[existingIndex].quantity += qty;
    } else {
        StoreState.cart.push({
            id: product.id,
            title: product.title,
            price: Number(product.price),
            image_url: product.image_url,
            category: product.category,
            quantity: qty
        });
    }

    saveCart();
    renderCart();
    updateBadges();
    showToast(`Added "${product.title}" to your Shopping Bag.`);
}

function updateCartQty(productId, delta) {
    const item = StoreState.cart.find(i => i.id === productId);
    if (!item) return;

    item.quantity += delta;
    if (item.quantity <= 0) {
        removeFromCart(productId);
        return;
    }

    saveCart();
    renderCart();
    updateBadges();
}

function removeFromCart(productId) {
    StoreState.cart = StoreState.cart.filter(i => i.id !== productId);
    saveCart();
    renderCart();
    updateBadges();
    showToast('Item removed from Shopping Bag', 'fa-trash');
}

function saveCart() {
    localStorage.setItem('laura_cart', JSON.stringify(StoreState.cart));
}

function getCartSubtotal() {
    return StoreState.cart.reduce((sum, item) => sum + (item.price * item.quantity), 0);
}

function renderCart() {
    if (!DOM.cartItemsList) return;

    if (StoreState.cart.length === 0) {
        DOM.cartItemsList.innerHTML = `
            <div class="empty-cart-view">
                <i class="fa-solid fa-bag-shopping"></i>
                <h4 style="font-family: var(--font-serif); font-size: 1.4rem; color: var(--text-primary); margin-bottom: 6px;">Your Bag Is Empty</h4>
                <p style="font-size: 0.85rem; margin-bottom: 20px;">Indulge in our exquisite accessories collection.</p>
                <button class="btn btn-primary" onclick="closeCartDrawer()" style="padding: 10px 22px; font-size: 0.75rem;">Explore Catalog</button>
            </div>
        `;
        if (DOM.cartSubtotal) DOM.cartSubtotal.textContent = formatPrice(0);
        if (DOM.cartTotal) DOM.cartTotal.textContent = formatPrice(0);
        if (DOM.checkoutOpenBtn) DOM.checkoutOpenBtn.disabled = true;
        return;
    }

    if (DOM.checkoutOpenBtn) DOM.checkoutOpenBtn.disabled = false;

    DOM.cartItemsList.innerHTML = StoreState.cart.map(item => `
        <div class="cart-item">
            <img class="cart-item-thumb" src="${item.image_url}" alt="${item.title}">
            <div class="cart-item-info">
                <h4 class="cart-item-title">${item.title}</h4>
                <span class="cart-item-price">${formatPrice(item.price)}</span>
                <div class="cart-item-actions">
                    <div class="qty-control">
                        <button class="qty-btn" onclick="updateCartQty('${item.id}', -1)">-</button>
                        <span class="qty-val">${item.quantity}</span>
                        <button class="qty-btn" onclick="updateCartQty('${item.id}', 1)">+</button>
                    </div>
                    <button class="cart-item-remove" onclick="removeFromCart('${item.id}')" title="Remove">
                        <i class="fa-solid fa-trash-can"></i>
                    </button>
                </div>
            </div>
        </div>
    `).join('');

    const subtotal = getCartSubtotal();
    if (DOM.cartSubtotal) DOM.cartSubtotal.textContent = formatPrice(subtotal);
    if (DOM.cartTotal) DOM.cartTotal.textContent = formatPrice(subtotal);
}

/**
 * Wishlist Logic
 */
function toggleWishlist(productId) {
    const index = StoreState.wishlist.indexOf(productId);
    const product = StoreState.products.find(p => p.id === productId);
    const title = product ? product.title : 'Piece';

    if (index > -1) {
        StoreState.wishlist.splice(index, 1);
        showToast(`Removed from Wishlist`, 'fa-heart');
    } else {
        StoreState.wishlist.push(productId);
        showToast(`Saved "${title}" to your Wishlist`, 'fa-heart');
    }

    localStorage.setItem('laura_wishlist', JSON.stringify(StoreState.wishlist));
    renderProducts();
    renderWishlist();
    updateBadges();
}

function renderWishlist() {
    if (!DOM.wishlistItemsList) return;

    const wishlistedProducts = StoreState.products.filter(p => StoreState.wishlist.includes(p.id));

    if (wishlistedProducts.length === 0) {
        DOM.wishlistItemsList.innerHTML = `
            <div class="empty-cart-view">
                <i class="fa-regular fa-heart"></i>
                <h4 style="font-family: var(--font-serif); font-size: 1.4rem; color: var(--text-primary); margin-bottom: 6px;">Your Wishlist Is Empty</h4>
                <p style="font-size: 0.85rem;">Click the heart icon on any piece to save your favorite treasures.</p>
            </div>
        `;
        return;
    }

    DOM.wishlistItemsList.innerHTML = wishlistedProducts.map(product => `
        <div class="cart-item">
            <img class="cart-item-thumb" src="${product.image_url}" alt="${product.title}">
            <div class="cart-item-info">
                <h4 class="cart-item-title">${product.title}</h4>
                <span class="cart-item-price">${formatPrice(product.price)}</span>
                <div style="display: flex; gap: 10px; margin-top: 10px;">
                    <button class="btn btn-primary" style="padding: 6px 14px; font-size: 0.7rem;" 
                            onclick="addToCart('${product.id}'); toggleWishlist('${product.id}')">
                        Move to Bag
                    </button>
                    <button class="cart-item-remove" onclick="toggleWishlist('${product.id}')">
                        Remove
                    </button>
                </div>
            </div>
        </div>
    `).join('');
}

/**
 * Badges Update
 */
function updateBadges() {
    const totalCartCount = StoreState.cart.reduce((sum, item) => sum + item.quantity, 0);
    DOM.cartCountBadges.forEach(b => b.textContent = totalCartCount);

    const totalWishlistCount = StoreState.wishlist.length;
    DOM.wishlistCountBadges.forEach(b => b.textContent = totalWishlistCount);
}

/**
 * Checkout Flow
 */
function openCheckoutModal() {
    if (StoreState.cart.length === 0) {
        showToast('Your bag is currently empty', 'fa-circle-exclamation');
        return;
    }

    // Populate Order Summary
    if (DOM.checkoutSummaryList) {
        DOM.checkoutSummaryList.innerHTML = StoreState.cart.map(item => `
            <div class="summary-item-line">
                <span>${item.title} × ${item.quantity}</span>
                <strong>${formatPrice(item.price * item.quantity)}</strong>
            </div>
        `).join('');
    }

    const subtotal = getCartSubtotal();
    if (DOM.checkoutSummaryTotal) {
        DOM.checkoutSummaryTotal.textContent = formatPrice(subtotal);
    }

    closeCartDrawer();
    DOM.checkoutModal.classList.add('active');
}

async function handleCheckoutSubmit(e) {
    e.preventDefault();

    const submitBtn = document.getElementById('place-order-btn');
    if (submitBtn) {
        submitBtn.disabled = true;
        submitBtn.innerHTML = `<i class="fa-solid fa-circle-notch fa-spin"></i> Processing Acquisition...`;
    }

    const orderData = {
        customer_name: document.getElementById('cust-name').value.trim(),
        customer_email: document.getElementById('cust-email').value.trim(),
        customer_phone: document.getElementById('cust-phone').value.trim(),
        shipping_address: document.getElementById('cust-address').value.trim(),
        city: document.getElementById('cust-city').value.trim(),
        items: StoreState.cart,
        total_amount: getCartSubtotal(),
        payment_method: document.getElementById('cust-payment').value,
        notes: document.getElementById('cust-notes')?.value || '',
        status: 'Pending'
    };

    try {
        const res = await window.LauraAPI.createOrder(orderData);
        if (res.success) {
            // Clear cart
            StoreState.cart = [];
            saveCart();
            renderCart();
            updateBadges();

            const orderId = res.data.id || 'LAURA-' + Math.floor(100000 + Math.random() * 900000);

            // Display Success Screen
            DOM.checkoutModal.querySelector('.modal-card').innerHTML = `
                <div style="padding: 50px 30px; text-align: center;">
                    <div style="width: 80px; height: 80px; background: rgba(197, 168, 128, 0.15); border-radius: 50%; margin: 0 auto 24px auto; display: flex; align-items: center; justify-content: center;">
                        <i class="fa-solid fa-check text-gold" style="font-size: 2.4rem;"></i>
                    </div>
                    <span class="section-subtitle">ORDER CONFIRMED</span>
                    <h2 style="font-family: var(--font-serif); font-size: 2.6rem; margin-bottom: 12px;">Thank You, ${orderData.customer_name}</h2>
                    <p style="color: var(--text-secondary); max-width: 480px; margin: 0 auto 24px auto; line-height: 1.7;">
                        Your acquisition has been safely received. A dedicated concierge will pack your pieces in our signature velvet packaging and dispatch via express courier.
                    </p>

                    <div style="background: var(--bg-secondary); border: 1px dashed var(--gold); border-radius: 8px; padding: 20px; max-width: 420px; margin: 0 auto 30px auto;">
                        <div style="display: flex; justify-content: space-between; margin-bottom: 8px;">
                            <span style="font-size: 0.85rem; color: var(--text-muted);">Order Tracking Reference:</span>
                            <strong style="font-family: monospace; font-size: 0.95rem; color: var(--gold-dark);">${orderId}</strong>
                        </div>
                        <div style="display: flex; justify-content: space-between;">
                            <span style="font-size: 0.85rem; color: var(--text-muted);">Payment Method:</span>
                            <span style="font-size: 0.85rem; font-weight: 600;">${orderData.payment_method}</span>
                        </div>
                    </div>

                    <div style="display: flex; gap: 16px; justify-content: center;">
                        <button class="btn btn-primary" onclick="window.location.reload()">
                            Continue Exploring
                        </button>
                        <a href="admin.html" class="btn btn-outline-light" style="color: var(--text-primary); border-color: var(--border-color);">
                            <i class="fa-solid fa-lock"></i> View In Admin Panel
                        </a>
                    </div>
                </div>
            `;
        }
    } catch (err) {
        console.error('Order creation failed:', err);
        showToast('Order processing failed. Please check your details.', 'fa-circle-exclamation');
        if (submitBtn) {
            submitBtn.disabled = false;
            submitBtn.innerHTML = `Complete Acquisition`;
        }
    }
}

/**
 * Event Listeners Registration
 */
function setupEventListeners() {
    // Category pills
    DOM.filterBtns.forEach(btn => {
        btn.addEventListener('click', () => {
            DOM.filterBtns.forEach(b => b.classList.remove('active'));
            btn.classList.add('active');
            StoreState.activeCategory = btn.dataset.category;
            applyFilters();
        });
    });

    // Search Box
    if (DOM.searchInput) {
        DOM.searchInput.addEventListener('input', (e) => {
            StoreState.searchQuery = e.target.value;
            applyFilters();
        });
    }

    // Sort Dropdown
    if (DOM.sortSelect) {
        DOM.sortSelect.addEventListener('change', (e) => {
            StoreState.sortBy = e.target.value;
            applyFilters();
        });
    }

    // Cart Drawer Toggles
    if (DOM.cartDrawerOpenBtn) {
        DOM.cartDrawerOpenBtn.addEventListener('click', openCartDrawer);
    }
    if (DOM.cartDrawerCloseBtn) {
        DOM.cartDrawerCloseBtn.addEventListener('click', closeCartDrawer);
    }
    if (DOM.drawerBackdrop) {
        DOM.drawerBackdrop.addEventListener('click', () => {
            closeCartDrawer();
            closeWishlistDrawer();
            closeAllModals();
        });
    }

    // Wishlist Drawer Toggles
    if (DOM.wishlistOpenBtn) {
        DOM.wishlistOpenBtn.addEventListener('click', openWishlistDrawer);
    }
    if (DOM.wishlistCloseBtn) {
        DOM.wishlistCloseBtn.addEventListener('click', closeWishlistDrawer);
    }

    // Checkout Open
    if (DOM.checkoutOpenBtn) {
        DOM.checkoutOpenBtn.addEventListener('click', openCheckoutModal);
    }

    // Checkout Form
    if (DOM.checkoutForm) {
        DOM.checkoutForm.addEventListener('submit', handleCheckoutSubmit);
    }

    // Close Modals on click outside or close buttons
    document.querySelectorAll('.modal-close').forEach(btn => {
        btn.addEventListener('click', closeAllModals);
    });

    // Close on Escape key
    document.addEventListener('keydown', (e) => {
        if (e.key === 'Escape') {
            closeCartDrawer();
            closeWishlistDrawer();
            closeAllModals();
        }
    });

    // Newsletter form demo
    const newsletterForm = document.getElementById('newsletter-form');
    if (newsletterForm) {
        newsletterForm.addEventListener('submit', (e) => {
            e.preventDefault();
            const input = newsletterForm.querySelector('input');
            if (input && input.value) {
                showToast(`Welcome to L'AURA Society! Enjoy 15% off with code "AURA15".`, 'fa-envelope');
                input.value = '';
            }
        });
    }
}

function openCartDrawer() {
    renderCart();
    DOM.cartDrawer.classList.add('active');
    DOM.drawerBackdrop.classList.add('active');
}

function closeCartDrawer() {
    if (DOM.cartDrawer) DOM.cartDrawer.classList.remove('active');
    if (DOM.drawerBackdrop) DOM.drawerBackdrop.classList.remove('active');
}

function openWishlistDrawer() {
    renderWishlist();
    DOM.wishlistDrawer.classList.add('active');
    DOM.drawerBackdrop.classList.add('active');
}

function closeWishlistDrawer() {
    if (DOM.wishlistDrawer) DOM.wishlistDrawer.classList.remove('active');
    if (DOM.drawerBackdrop) DOM.drawerBackdrop.classList.remove('active');
}

function closeAllModals() {
    document.querySelectorAll('.modal-overlay').forEach(m => m.classList.remove('active'));
}

// Initial Boot
document.addEventListener('DOMContentLoaded', initStore);
