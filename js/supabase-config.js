/**
 * L'AURA LUXURY ACCESSORIES - SUPABASE CONFIGURATION & DATA LAYER
 * Handles connection to Supabase backend, real-time fallbacks, and local synchronization.
 */

const SUPABASE_CONFIG = {
    url: 'https://idnvnfeffmddgyazdobu.supabase.co',
    anonKey: 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImlkbnZuZmVmZm1kZGd5YXpkb2J1Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3OTIzMzAzNjQsImV4cCI6MjEwNzkwNjM2NH0.S0gJmS1no0eG5v1lX0O1YDzTi6EG28K8kNSh9tMoip0',
    publishableKey: 'sb_publishable__VuEE0XC2kBGtOpazb4YrA_MEFBOwu0',
    projectId: 'idnvnfeffmddgyazdobu'
};

// Initial aesthetic starter products (used when database table is fresh or initializing)
const DEFAULT_PRODUCTS = [
    {
        id: 'prod-001',
        title: 'Aurelia 18K Gold Vermeil Link Necklace',
        price: 145.00,
        original_price: 185.00,
        category: 'Jewelry',
        image_url: 'https://images.unsplash.com/photo-1599643478518-a784e5dc4c8f?auto=format&fit=crop&w=900&q=80',
        description: 'Handcrafted in 18k gold vermeil over 925 sterling silver with a refined radiant finish. Hypoallergenic, tarnish-resistant, and timelessly versatile for day to evening wear.',
        stock: 18,
        is_featured: true,
        rating: 4.9,
        badge: 'BESTSELLER'
    },
    {
        id: 'prod-002',
        title: 'Chronos Minimalist Rose Gold Chronograph',
        price: 220.00,
        original_price: 280.00,
        category: 'Watches',
        image_url: 'https://images.unsplash.com/photo-1524805444758-089113d48a6d?auto=format&fit=crop&w=900&q=80',
        description: 'Featuring anti-reflective sapphire crystal glass, Japanese precision quartz movement, and an Italian genuine leather strap in matte saddle brown.',
        stock: 12,
        is_featured: true,
        rating: 5.0,
        badge: 'LUXURY EDIT'
    },
    {
        id: 'prod-003',
        title: 'Monaco Italian Calfskin Quilted Crossbody',
        price: 340.00,
        original_price: 420.00,
        category: 'Bags',
        image_url: 'https://images.unsplash.com/photo-1584917865442-de89df76afd3?auto=format&fit=crop&w=900&q=80',
        description: 'Exquisitely soft full-grain Italian calfskin leather with signature chevron diamond quilt pattern and brushed champagne gold lock hardware.',
        stock: 9,
        is_featured: true,
        rating: 4.9,
        badge: 'LIMITED'
    },
    {
        id: 'prod-004',
        title: 'Riviera Polarized Tortoiseshell Sunglasses',
        price: 115.00,
        original_price: 150.00,
        category: 'Sunglasses',
        image_url: 'https://images.unsplash.com/photo-1511499767150-a48a237f0083?auto=format&fit=crop&w=900&q=80',
        description: 'Hand-cut Italian Mazzucchelli acetate frames with Category-3 UV400 polarized emerald gradient lenses for supreme visual clarity and UV shield.',
        stock: 25,
        is_featured: false,
        rating: 4.8,
        badge: 'TRENDING'
    },
    {
        id: 'prod-005',
        title: 'Celeste Freshwater Pearl & Gold Huggies',
        price: 89.00,
        original_price: 120.00,
        category: 'Jewelry',
        image_url: 'https://images.unsplash.com/photo-1630019852942-f89202989a59?auto=format&fit=crop&w=900&q=80',
        description: 'Grade-AAA natural organic freshwater pearls suspended from delicate 14k gold-filled huggie hoops. Lightweight and endlessly graceful.',
        stock: 15,
        is_featured: true,
        rating: 4.9,
        badge: 'NEW ARRIVAL'
    },
    {
        id: 'prod-006',
        title: 'Elysium Diamond Solitaire Signet Ring',
        price: 165.00,
        original_price: 210.00,
        category: 'Rings & Accents',
        image_url: 'https://images.unsplash.com/photo-1605100804763-247f67b3557e?auto=format&fit=crop&w=900&q=80',
        description: 'Subtle statement signet ring inset with a brilliant bezel-set lab-grown diamond in brushed satin yellow gold. Comfortable contoured fit.',
        stock: 14,
        is_featured: true,
        rating: 5.0,
        badge: 'HOT'
    },
    {
        id: 'prod-007',
        title: 'Sienna 100% Mulberry Silk Scarf',
        price: 75.00,
        original_price: 95.00,
        category: 'Rings & Accents',
        image_url: 'https://images.unsplash.com/photo-1607604276583-eef5d076aa5f?auto=format&fit=crop&w=900&q=80',
        description: '100% pure mulberry twill silk with artisanal hand-rolled hems. Decorated with an opulent abstract flora pattern inspired by Mediterranean summers.',
        stock: 22,
        is_featured: false,
        rating: 4.7,
        badge: 'CURATED'
    },
    {
        id: 'prod-008',
        title: 'Vanguard Matte Noir Automatic Dive Watch',
        price: 380.00,
        original_price: 450.00,
        category: 'Watches',
        image_url: 'https://images.unsplash.com/photo-1522335789203-aabd1fc54bc9?auto=format&fit=crop&w=900&q=80',
        description: 'Water-resistant up to 200 meters. Features 24-jewel automatic self-winding movement, scratch-resistant ceramic rotating bezel, and luminescent markers.',
        stock: 7,
        is_featured: true,
        rating: 4.9,
        badge: 'EXCLUSIVE'
    }
];

// Initialize Supabase Client
let db = null;
if (window.supabase) {
    try {
        db = window.supabase.createClient(SUPABASE_CONFIG.url, SUPABASE_CONFIG.anonKey);
    } catch (e) {
        console.warn('Supabase client failed to initialize:', e);
    }
}

// Database Status state tracker
const DB_STATE = {
    isSupabaseOnline: false,
    productsTableReady: false,
    ordersTableReady: false,
    checkedAt: null
};

/**
 * Verify Supabase Table Health
 */
async function checkSupabaseStatus() {
    if (!db) {
        DB_STATE.isSupabaseOnline = false;
        return DB_STATE;
    }

    try {
        const { data, error } = await db.from('products').select('id').limit(1);
        if (error) {
            console.info('Supabase responded with note:', error.message);
            DB_STATE.isSupabaseOnline = true;
            DB_STATE.productsTableReady = error.code !== 'PGRST205'; // PGRST205 means table not created yet
        } else {
            DB_STATE.isSupabaseOnline = true;
            DB_STATE.productsTableReady = true;
        }

        // Test orders table
        const ordersRes = await db.from('orders').select('id').limit(1);
        DB_STATE.ordersTableReady = !ordersRes.error || ordersRes.error.code !== 'PGRST205';
    } catch (err) {
        console.warn('Network or Supabase ping issue:', err);
        DB_STATE.isSupabaseOnline = false;
    }

    DB_STATE.checkedAt = new Date();
    return DB_STATE;
}

/**
 * Local Storage Helpers
 */
function getLocalProducts() {
    const stored = localStorage.getItem('laura_products');
    if (!stored) {
        localStorage.setItem('laura_products', JSON.stringify(DEFAULT_PRODUCTS));
        return DEFAULT_PRODUCTS;
    }
    try {
        return JSON.parse(stored);
    } catch (e) {
        return DEFAULT_PRODUCTS;
    }
}

function saveLocalProducts(products) {
    localStorage.setItem('laura_products', JSON.stringify(products));
}

function getLocalOrders() {
    const stored = localStorage.getItem('laura_orders');
    if (!stored) return [];
    try {
        return JSON.parse(stored);
    } catch (e) {
        return [];
    }
}

function saveLocalOrder(order) {
    const orders = getLocalOrders();
    orders.unshift(order);
    localStorage.setItem('laura_orders', JSON.stringify(orders));
    return orders;
}

/**
 * High-Level Product Data Operations
 */
async function apiGetProducts() {
    if (db) {
        try {
            const { data, error } = await db
                .from('products')
                .select('*')
                .order('created_at', { ascending: false });

            if (!error && Array.isArray(data) && data.length > 0) {
                // Update local backup
                saveLocalProducts(data);
                return { success: true, source: 'supabase', data };
            }
            if (error && error.code === 'PGRST205') {
                console.log('Products table not created in Supabase yet. Using local fallback.');
            }
        } catch (err) {
            console.warn('Error reading from Supabase:', err);
        }
    }
    // Fallback to local products
    return { success: true, source: 'local', data: getLocalProducts() };
}

async function apiAddProduct(product) {
    const newProduct = {
        ...product,
        created_at: new Date().toISOString()
    };

    if (db) {
        try {
            // Remove local temp id so Supabase generates UUID
            const payload = { ...newProduct };
            if (payload.id && payload.id.startsWith('prod-')) {
                delete payload.id;
            }
            const { data, error } = await db.from('products').insert([payload]).select();
            if (!error && data && data.length > 0) {
                // Update local storage too
                const local = getLocalProducts();
                local.unshift(data[0]);
                saveLocalProducts(local);
                return { success: true, source: 'supabase', data: data[0] };
            }
            if (error) console.warn('Supabase insert note:', error.message);
        } catch (err) {
            console.warn('Supabase addProduct failed:', err);
        }
    }

    // Local Fallback
    newProduct.id = 'prod-' + Date.now();
    const local = getLocalProducts();
    local.unshift(newProduct);
    saveLocalProducts(local);
    return { success: true, source: 'local', data: newProduct };
}

async function apiUpdateProduct(id, updates) {
    if (db) {
        try {
            const { data, error } = await db
                .from('products')
                .update(updates)
                .eq('id', id)
                .select();
            if (!error && data) {
                const local = getLocalProducts().map(p => (p.id === id ? { ...p, ...updates } : p));
                saveLocalProducts(local);
                return { success: true, source: 'supabase', data: data[0] };
            }
        } catch (err) {
            console.warn('Supabase updateProduct failed:', err);
        }
    }

    // Local Fallback
    const local = getLocalProducts().map(p => (p.id === id ? { ...p, ...updates } : p));
    saveLocalProducts(local);
    const updated = local.find(p => p.id === id);
    return { success: true, source: 'local', data: updated };
}

async function apiDeleteProduct(id) {
    if (db) {
        try {
            const { error } = await db.from('products').delete().eq('id', id);
            if (!error) {
                const local = getLocalProducts().filter(p => p.id !== id);
                saveLocalProducts(local);
                return { success: true, source: 'supabase' };
            }
        } catch (err) {
            console.warn('Supabase deleteProduct failed:', err);
        }
    }

    // Local Fallback
    const local = getLocalProducts().filter(p => p.id !== id);
    saveLocalProducts(local);
    return { success: true, source: 'local' };
}

/**
 * High-Level Orders Data Operations
 */
async function apiCreateOrder(orderData) {
    const formattedOrder = {
        ...orderData,
        created_at: new Date().toISOString(),
        status: orderData.status || 'Pending'
    };

    if (db) {
        try {
            const { data, error } = await db.from('orders').insert([formattedOrder]).select();
            if (!error && data && data.length > 0) {
                saveLocalOrder(data[0]);
                return { success: true, source: 'supabase', data: data[0] };
            }
            if (error) console.warn('Supabase createOrder note:', error.message);
        } catch (err) {
            console.warn('Supabase createOrder error:', err);
        }
    }

    // Local Fallback
    formattedOrder.id = 'ord-' + Date.now().toString().slice(-6);
    saveLocalOrder(formattedOrder);
    return { success: true, source: 'local', data: formattedOrder };
}

async function apiGetOrders() {
    if (db) {
        try {
            const { data, error } = await db
                .from('orders')
                .select('*')
                .order('created_at', { ascending: false });
            if (!error && Array.isArray(data)) {
                return { success: true, source: 'supabase', data };
            }
        } catch (err) {
            console.warn('Supabase getOrders error:', err);
        }
    }
    return { success: true, source: 'local', data: getLocalOrders() };
}

async function apiUpdateOrderStatus(id, newStatus) {
    if (db) {
        try {
            const { data, error } = await db
                .from('orders')
                .update({ status: newStatus })
                .eq('id', id)
                .select();
            if (!error && data) {
                const orders = getLocalOrders().map(o => (o.id === id ? { ...o, status: newStatus } : o));
                localStorage.setItem('laura_orders', JSON.stringify(orders));
                return { success: true, source: 'supabase', data: data[0] };
            }
        } catch (err) {
            console.warn('Supabase update order status error:', err);
        }
    }

    const orders = getLocalOrders().map(o => (o.id === id ? { ...o, status: newStatus } : o));
    localStorage.setItem('laura_orders', JSON.stringify(orders));
    return { success: true, source: 'local', data: { id, status: newStatus } };
}

/**
 * 1-Click Seed Supabase with Starter Products
 */
async function apiSeedSupabase() {
    if (!db) return { success: false, message: 'Supabase client not loaded' };
    try {
        const seedData = DEFAULT_PRODUCTS.map(p => {
            const copy = { ...p };
            delete copy.id; // Allow Supabase to assign UUID
            return copy;
        });

        const { data, error } = await db.from('products').insert(seedData).select();
        if (error) throw error;
        return { success: true, count: data.length, data };
    } catch (err) {
        return { success: false, message: err.message };
    }
}

// Export for usage across scripts
window.LauraAPI = {
    config: SUPABASE_CONFIG,
    db,
    checkSupabaseStatus,
    getProducts: apiGetProducts,
    addProduct: apiAddProduct,
    updateProduct: apiUpdateProduct,
    deleteProduct: apiDeleteProduct,
    createOrder: apiCreateOrder,
    getOrders: apiGetOrders,
    updateOrderStatus: apiUpdateOrderStatus,
    seedSupabase: apiSeedSupabase,
    defaultProducts: DEFAULT_PRODUCTS
};
