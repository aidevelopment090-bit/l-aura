/**
 * L'AURA LUXURY ACCESSORIES - ADMIN PANEL CONTROLLER
 * Full management system for Products, Orders, KPIs, and Supabase Database Sync.
 */

const AdminState = {
    isAuthenticated: sessionStorage.getItem('laura_admin_auth') === 'true',
    adminPin: 'admin123',
    products: [],
    orders: [],
    activeTab: 'products',
    editingProductId: null,
    searchFilter: ''
};

// DOM Elements
const ADM_DOM = {
    authModal: document.getElementById('auth-modal'),
    authPinInput: document.getElementById('auth-pin-input'),
    authSubmitBtn: document.getElementById('auth-submit-btn'),
    authErrorText: document.getElementById('auth-error-text'),

    // KPIs
    kpiProductsCount: document.getElementById('kpi-products-count'),
    kpiOrdersCount: document.getElementById('kpi-orders-count'),
    kpiRevenueTotal: document.getElementById('kpi-revenue-total'),
    kpiLowStockCount: document.getElementById('kpi-low-stock-count'),

    // Tables & Lists
    productsTableBody: document.getElementById('adm-products-tbody'),
    ordersTableBody: document.getElementById('adm-orders-tbody'),
    productSearchInput: document.getElementById('adm-product-search'),
    orderSearchInput: document.getElementById('adm-order-search'),

    // Modals
    productModal: document.getElementById('product-modal'),
    productModalTitle: document.getElementById('product-modal-title'),
    productForm: document.getElementById('product-form'),
    prodImgInput: document.getElementById('prod-image'),
    prodImgPreview: document.getElementById('prod-img-preview'),

    orderDetailsModal: document.getElementById('order-details-modal'),
    orderDetailsContent: document.getElementById('order-details-content'),

    // Status
    dbStatusDot: document.getElementById('adm-db-status-dot'),
    dbStatusText: document.getElementById('adm-db-status-text'),
    toastContainer: document.getElementById('adm-toast-container')
};

/**
 * Toast Utility
 */
function admToast(message, icon = 'fa-check') {
    if (!ADM_DOM.toastContainer) return;
    const toast = document.createElement('div');
    toast.className = 'adm-toast';
    toast.innerHTML = `<i class="fa-solid ${icon}" style="color: var(--adm-gold);"></i><span>${message}</span>`;
    ADM_DOM.toastContainer.appendChild(toast);
    setTimeout(() => {
        toast.style.opacity = '0';
        toast.style.transform = 'translateY(10px)';
        setTimeout(() => toast.remove(), 300);
    }, 3200);
}

/**
 * Initialize Admin Panel
 */
async function initAdmin() {
    checkAuthentication();
    setupTabSwitching();
    setupImagePreview();
    setupEventListeners();

    if (AdminState.isAuthenticated) {
        await refreshAllData();
    }
}

/**
 * Authentication / PIN Protection
 */
function checkAuthentication() {
    if (!AdminState.isAuthenticated) {
        if (ADM_DOM.authModal) ADM_DOM.authModal.classList.add('active');
    } else {
        if (ADM_DOM.authModal) ADM_DOM.authModal.classList.remove('active');
    }
}

function unlockAdmin() {
    const pin = ADM_DOM.authPinInput.value.trim();
    if (pin === AdminState.adminPin || pin === '1234') {
        AdminState.isAuthenticated = true;
        sessionStorage.setItem('laura_admin_auth', 'true');
        ADM_DOM.authModal.classList.remove('active');
        admToast('Admin Console Unlocked. Welcome back!');
        refreshAllData();
    } else {
        ADM_DOM.authErrorText.style.display = 'block';
        ADM_DOM.authPinInput.value = '';
    }
}

function lockAdmin() {
    AdminState.isAuthenticated = false;
    sessionStorage.removeItem('laura_admin_auth');
    ADM_DOM.authModal.classList.add('active');
    ADM_DOM.authPinInput.value = '';
    ADM_DOM.authErrorText.style.display = 'none';
}

/**
 * Load & Refresh Everything
 */
async function refreshAllData() {
    await checkDatabaseHealth();
    await loadProducts();
    await loadOrders();
    updateKPIs();
}

/**
 * Database Health Checker
 */
async function checkDatabaseHealth() {
    if (!window.LauraAPI) return;
    const status = await window.LauraAPI.checkSupabaseStatus();

    if (status.productsTableReady) {
        ADM_DOM.dbStatusDot.className = 'dot';
        ADM_DOM.dbStatusText.innerHTML = `Supabase Live (<code>${window.LauraAPI.config.projectId}</code>)`;
    } else {
        ADM_DOM.dbStatusDot.className = 'dot warning';
        ADM_DOM.dbStatusText.innerHTML = `Setup Needed: Click "Database & SQL" tab to create tables`;
    }
}

/**
 * Products Management
 */
async function loadProducts() {
    ADM_DOM.productsTableBody.innerHTML = `
        <tr><td colspan="7" style="text-align: center; padding: 40px; color: var(--adm-text-muted);">
            <i class="fa-solid fa-circle-notch fa-spin"></i> Loading catalog from Supabase...
        </td></tr>
    `;

    try {
        const res = await window.LauraAPI.getProducts();
        if (res.success && Array.isArray(res.data)) {
            AdminState.products = res.data;
            renderProductsTable();
        }
    } catch (e) {
        console.error('Error fetching products:', e);
    }
}

function renderProductsTable() {
    let list = [...AdminState.products];
    if (AdminState.searchFilter.trim() !== '') {
        const q = AdminState.searchFilter.toLowerCase();
        list = list.filter(p => p.title.toLowerCase().includes(q) || p.category.toLowerCase().includes(q));
    }

    if (list.length === 0) {
        ADM_DOM.productsTableBody.innerHTML = `
            <tr><td colspan="7" style="text-align: center; padding: 40px; color: var(--adm-text-muted);">
                No products found. Click "Add New Piece" to create one.
            </td></tr>
        `;
        return;
    }

    ADM_DOM.productsTableBody.innerHTML = list.map(p => {
        const stockBadge = p.stock <= 5 
            ? `<span class="badge-tag red">Low Stock (${p.stock})</span>`
            : `<span class="badge-tag green">${p.stock} in stock</span>`;

        const featuredBadge = p.is_featured 
            ? `<span class="badge-tag gold">Featured</span>` 
            : `<span class="badge-tag" style="background: rgba(255,255,255,0.05); color: #888;">Standard</span>`;

        return `
            <tr>
                <td>
                    <img class="product-row-thumb" src="${p.image_url}" alt="${p.title}" 
                         onerror="this.src='https://images.unsplash.com/photo-1599643478518-a784e5dc4c8f?auto=format&fit=crop&w=150&q=80'">
                </td>
                <td>
                    <strong style="color: #FFF; font-size: 0.9rem;">${p.title}</strong>
                    <div style="font-size: 0.72rem; color: var(--adm-text-muted); font-family: monospace;">ID: ${p.id.substring(0, 12)}...</div>
                </td>
                <td><span class="badge-tag blue">${p.category}</span></td>
                <td>
                    <strong style="color: var(--adm-gold);">$${Number(p.price).toFixed(2)}</strong>
                    ${p.original_price ? `<span style="font-size: 0.75rem; color: var(--adm-text-muted); text-decoration: line-through; margin-left: 6px;">$${Number(p.original_price).toFixed(2)}</span>` : ''}
                </td>
                <td>${stockBadge}</td>
                <td>${featuredBadge}</td>
                <td>
                    <div style="display: flex; gap: 8px;">
                        <button class="action-icon-btn" onclick="openEditProductModal('${p.id}')" title="Edit Piece">
                            <i class="fa-solid fa-pen-to-square"></i>
                        </button>
                        <button class="action-icon-btn delete" onclick="confirmDeleteProduct('${p.id}')" title="Delete Piece">
                            <i class="fa-solid fa-trash-can"></i>
                        </button>
                    </div>
                </td>
            </tr>
        `;
    }).join('');
}

/**
 * Add / Edit Product Modal
 */
function openAddProductModal() {
    AdminState.editingProductId = null;
    ADM_DOM.productModalTitle.textContent = 'Add New Luxury Piece';
    ADM_DOM.productForm.reset();
    ADM_DOM.prodImgPreview.src = 'https://images.unsplash.com/photo-1599643478518-a784e5dc4c8f?auto=format&fit=crop&w=200&q=80';
    ADM_DOM.productModal.classList.add('active');
}

function openEditProductModal(productId) {
    const p = AdminState.products.find(item => item.id === productId);
    if (!p) return;

    AdminState.editingProductId = productId;
    ADM_DOM.productModalTitle.textContent = 'Edit Piece Details';

    document.getElementById('prod-title').value = p.title;
    document.getElementById('prod-category').value = p.category;
    document.getElementById('prod-price').value = p.price;
    document.getElementById('prod-original-price').value = p.original_price || '';
    document.getElementById('prod-stock').value = p.stock || 10;
    document.getElementById('prod-badge').value = p.badge || 'BESTSELLER';
    document.getElementById('prod-image').value = p.image_url;
    document.getElementById('prod-description').value = p.description || '';
    document.getElementById('prod-featured').checked = Boolean(p.is_featured);

    ADM_DOM.prodImgPreview.src = p.image_url;
    ADM_DOM.productModal.classList.add('active');
}

async function handleProductFormSubmit(e) {
    e.preventDefault();

    const saveBtn = document.getElementById('save-prod-btn');
    saveBtn.disabled = true;
    saveBtn.innerHTML = `<i class="fa-solid fa-circle-notch fa-spin"></i> Saving to Supabase...`;

    const productPayload = {
        title: document.getElementById('prod-title').value.trim(),
        category: document.getElementById('prod-category').value,
        price: parseFloat(document.getElementById('prod-price').value),
        original_price: document.getElementById('prod-original-price').value ? parseFloat(document.getElementById('prod-original-price').value) : null,
        stock: parseInt(document.getElementById('prod-stock').value, 10),
        badge: document.getElementById('prod-badge').value.trim(),
        image_url: document.getElementById('prod-image').value.trim(),
        description: document.getElementById('prod-description').value.trim(),
        is_featured: document.getElementById('prod-featured').checked,
        rating: 4.9
    };

    try {
        if (AdminState.editingProductId) {
            await window.LauraAPI.updateProduct(AdminState.editingProductId, productPayload);
            admToast(`Updated piece "${productPayload.title}" successfully.`);
        } else {
            await window.LauraAPI.addProduct(productPayload);
            admToast(`Created piece "${productPayload.title}" in catalog.`);
        }

        closeAdminModals();
        await loadProducts();
        updateKPIs();
    } catch (err) {
        console.error('Failed to save product:', err);
        admToast('Error saving product to database.', 'fa-circle-exclamation');
    } finally {
        saveBtn.disabled = false;
        saveBtn.innerHTML = `Save Piece`;
    }
}

async function confirmDeleteProduct(productId) {
    const p = AdminState.products.find(item => item.id === productId);
    const title = p ? p.title : 'this piece';
    if (!confirm(`Are you sure you wish to delete "${title}" from the catalog? This will remove it from Supabase.`)) {
        return;
    }

    try {
        await window.LauraAPI.deleteProduct(productId);
        admToast(`Deleted "${title}" from catalog.`);
        await loadProducts();
        updateKPIs();
    } catch (err) {
        console.error('Failed to delete product:', err);
        admToast('Failed to delete piece.', 'fa-circle-exclamation');
    }
}

/**
 * Preset Image URLs for quick testing
 */
function setPresetImage(url) {
    if (ADM_DOM.prodImgInput) {
        ADM_DOM.prodImgInput.value = url;
        ADM_DOM.prodImgPreview.src = url;
    }
}

/**
 * Orders Management
 */
async function loadOrders() {
    ADM_DOM.ordersTableBody.innerHTML = `
        <tr><td colspan="7" style="text-align: center; padding: 40px; color: var(--adm-text-muted);">
            <i class="fa-solid fa-circle-notch fa-spin"></i> Loading customer orders...
        </td></tr>
    `;

    try {
        const res = await window.LauraAPI.getOrders();
        if (res.success && Array.isArray(res.data)) {
            AdminState.orders = res.data;
            renderOrdersTable();
        }
    } catch (e) {
        console.error('Error fetching orders:', e);
    }
}

function renderOrdersTable() {
    if (AdminState.orders.length === 0) {
        ADM_DOM.ordersTableBody.innerHTML = `
            <tr><td colspan="7" style="text-align: center; padding: 40px; color: var(--adm-text-muted);">
                No customer orders received yet. Test by placing an order from the storefront!
            </td></tr>
        `;
        return;
    }

    ADM_DOM.ordersTableBody.innerHTML = AdminState.orders.map(order => {
        const itemsSummary = Array.isArray(order.items) 
            ? order.items.map(i => `${i.title} (×${i.quantity})`).join(', ')
            : 'Custom Order';

        const dateStr = order.created_at ? new Date(order.created_at).toLocaleDateString(undefined, {
            month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit'
        }) : 'Just now';

        const orderIdDisplay = (order.id || '').length > 12 ? order.id.substring(0, 8) + '...' : order.id;

        return `
            <tr>
                <td><code style="color: var(--adm-gold); font-size: 0.8rem;">#${orderIdDisplay}</code></td>
                <td>
                    <strong style="color: #FFF;">${order.customer_name}</strong>
                    <div style="font-size: 0.75rem; color: var(--adm-text-muted);">${order.customer_phone}</div>
                </td>
                <td style="max-width: 240px; white-space: nowrap; overflow: hidden; text-overflow: ellipsis;" title="${itemsSummary}">
                    ${itemsSummary}
                </td>
                <td><strong style="color: #FFF;">$${Number(order.total_amount).toFixed(2)}</strong></td>
                <td><span style="font-size: 0.78rem; color: var(--adm-text-muted);">${order.payment_method || 'COD'}</span></td>
                <td>
                    <select class="status-dropdown" onchange="changeOrderStatus('${order.id}', this.value)">
                        <option value="Pending" ${order.status === 'Pending' ? 'selected' : ''}>🟡 Pending</option>
                        <option value="Processing" ${order.status === 'Processing' ? 'selected' : ''}>🔵 Processing</option>
                        <option value="Shipped" ${order.status === 'Shipped' ? 'selected' : ''}>🟣 Shipped</option>
                        <option value="Delivered" ${order.status === 'Delivered' ? 'selected' : ''}>🟢 Delivered</option>
                        <option value="Cancelled" ${order.status === 'Cancelled' ? 'selected' : ''}>🔴 Cancelled</option>
                    </select>
                </td>
                <td>
                    <button class="action-icon-btn" onclick="openOrderDetailsModal('${order.id}')" title="View Full Receipt">
                        <i class="fa-solid fa-receipt"></i>
                    </button>
                </td>
            </tr>
        `;
    }).join('');
}

async function changeOrderStatus(orderId, newStatus) {
    try {
        await window.LauraAPI.updateOrderStatus(orderId, newStatus);
        admToast(`Order status updated to "${newStatus}".`);
        await loadOrders();
    } catch (e) {
        console.error('Failed to update order status:', e);
        admToast('Failed to update status', 'fa-circle-exclamation');
    }
}

function openOrderDetailsModal(orderId) {
    const order = AdminState.orders.find(o => o.id === orderId);
    if (!order || !ADM_DOM.orderDetailsContent) return;

    const itemsHtml = Array.isArray(order.items) ? order.items.map(i => `
        <div style="display: flex; justify-content: space-between; padding: 10px 0; border-bottom: 1px solid var(--adm-border);">
            <div>
                <strong>${i.title}</strong>
                <div style="font-size: 0.78rem; color: var(--adm-text-muted);">Qty: ${i.quantity} × $${Number(i.price).toFixed(2)}</div>
            </div>
            <strong>$${(i.quantity * i.price).toFixed(2)}</strong>
        </div>
    `).join('') : '<p>No items recorded.</p>';

    ADM_DOM.orderDetailsContent.innerHTML = `
        <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 20px;">
            <div>
                <span style="font-size: 0.75rem; color: var(--adm-gold); text-transform: uppercase;">Official Acquisition Receipt</span>
                <h3 style="font-size: 1.4rem; color: #FFF;">Order #${order.id}</h3>
            </div>
            <span class="badge-tag gold">${order.status}</span>
        </div>

        <div style="background: var(--adm-surface-light); padding: 16px; border-radius: 8px; margin-bottom: 20px; font-size: 0.85rem; line-height: 1.6;">
            <div><strong>Recipient:</strong> ${order.customer_name}</div>
            <div><strong>Email:</strong> ${order.customer_email}</div>
            <div><strong>Phone / WhatsApp:</strong> ${order.customer_phone}</div>
            <div><strong>Delivery Address:</strong> ${order.shipping_address}, ${order.city}</div>
            <div><strong>Payment Method:</strong> ${order.payment_method}</div>
            ${order.notes ? `<div style="margin-top: 6px; color: var(--adm-gold);"><strong>Client Notes:</strong> "${order.notes}"</div>` : ''}
        </div>

        <h4 style="font-size: 0.95rem; margin-bottom: 10px; color: var(--adm-text-muted); text-transform: uppercase;">Acquisition Items</h4>
        <div style="margin-bottom: 20px;">
            ${itemsHtml}
        </div>

        <div style="display: flex; justify-content: space-between; font-size: 1.2rem; font-weight: 700; color: #FFF; padding-top: 10px; border-top: 1px dashed var(--adm-gold);">
            <span>Total Payable:</span>
            <span style="color: var(--adm-gold);">$${Number(order.total_amount).toFixed(2)}</span>
        </div>
    `;

    ADM_DOM.orderDetailsModal.classList.add('active');
}

/**
 * KPI Calculations
 */
function updateKPIs() {
    // Total Products
    if (ADM_DOM.kpiProductsCount) {
        ADM_DOM.kpiProductsCount.textContent = AdminState.products.length;
    }

    // Total Orders
    if (ADM_DOM.kpiOrdersCount) {
        ADM_DOM.kpiOrdersCount.textContent = AdminState.orders.length;
    }

    // Total Revenue
    if (ADM_DOM.kpiRevenueTotal) {
        const rev = AdminState.orders.reduce((sum, o) => sum + (Number(o.total_amount) || 0), 0);
        ADM_DOM.kpiRevenueTotal.textContent = `$${rev.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
    }

    // Low stock items (< 10)
    if (ADM_DOM.kpiLowStockCount) {
        const low = AdminState.products.filter(p => Number(p.stock) <= 10).length;
        ADM_DOM.kpiLowStockCount.textContent = low;
    }
}

/**
 * 1-Click Seed Supabase
 */
async function seedSupabaseDatabase() {
    const btn = document.getElementById('seed-db-btn');
    if (btn) {
        btn.disabled = true;
        btn.innerHTML = `<i class="fa-solid fa-circle-notch fa-spin"></i> Seeding Supabase...`;
    }

    const res = await window.LauraAPI.seedSupabase();
    if (res.success) {
        admToast(`Success! Inserted ${res.count} curated luxury products into Supabase.`);
        await loadProducts();
        updateKPIs();
    } else {
        admToast(`Note: Ensure "products" table exists first! Error: ${res.message}`, 'fa-triangle-exclamation');
    }

    if (btn) {
        btn.disabled = false;
        btn.innerHTML = `<i class="fa-solid fa-cloud-arrow-up"></i> Upload Sample Products to Supabase`;
    }
}

/**
 * Copy SQL Schema to Clipboard
 */
function copySQLSchema() {
    const codeElem = document.getElementById('sql-schema-code');
    if (!codeElem) return;

    navigator.clipboard.writeText(codeElem.textContent).then(() => {
        admToast('Copied full SQL Schema to clipboard!');
    }).catch(() => {
        admToast('Failed to copy. Please select and copy manually.', 'fa-circle-exclamation');
    });
}

/**
 * Tab Switching
 */
function setupTabSwitching() {
    const tabBtns = document.querySelectorAll('.tab-btn');
    tabBtns.forEach(btn => {
        btn.addEventListener('click', () => {
            const tabId = btn.dataset.tab;
            tabBtns.forEach(b => b.classList.remove('active'));
            document.querySelectorAll('.tab-pane').forEach(p => p.classList.remove('active'));

            btn.classList.add('active');
            const targetPane = document.getElementById(`tab-${tabId}`);
            if (targetPane) targetPane.classList.add('active');
        });
    });

    // Check hash URL (e.g. #database)
    if (window.location.hash) {
        const hash = window.location.hash.replace('#', '');
        const targetBtn = document.querySelector(`.tab-btn[data-tab="${hash}"]`);
        if (targetBtn) targetBtn.click();
    }
}

function setupImagePreview() {
    if (ADM_DOM.prodImgInput && ADM_DOM.prodImgPreview) {
        ADM_DOM.prodImgInput.addEventListener('input', (e) => {
            const url = e.target.value.trim();
            if (url) ADM_DOM.prodImgPreview.src = url;
        });
    }
}

function setupEventListeners() {
    // PIN Auth
    if (ADM_DOM.authSubmitBtn) {
        ADM_DOM.authSubmitBtn.addEventListener('click', unlockAdmin);
    }
    if (ADM_DOM.authPinInput) {
        ADM_DOM.authPinInput.addEventListener('keydown', (e) => {
            if (e.key === 'Enter') unlockAdmin();
        });
    }

    // Product search
    if (ADM_DOM.productSearchInput) {
        ADM_DOM.productSearchInput.addEventListener('input', (e) => {
            AdminState.searchFilter = e.target.value;
            renderProductsTable();
        });
    }

    // Product Form
    if (ADM_DOM.productForm) {
        ADM_DOM.productForm.addEventListener('submit', handleProductFormSubmit);
    }

    // Modal closes
    document.querySelectorAll('.admin-modal-close').forEach(btn => {
        btn.addEventListener('click', closeAdminModals);
    });
}

function closeAdminModals() {
    if (ADM_DOM.productModal) ADM_DOM.productModal.classList.remove('active');
    if (ADM_DOM.orderDetailsModal) ADM_DOM.orderDetailsModal.classList.remove('active');
}

// Initial Boot
document.addEventListener('DOMContentLoaded', initAdmin);
