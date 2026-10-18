-- ====================================================================
-- L'AURA LUXURY ACCESSORIES - SUPABASE DATABASE SCHEMA
-- Run this script in the Supabase SQL Editor:
-- https://supabase.com/dashboard/project/idnvnfeffmddgyazdobu/sql/new
-- ====================================================================

-- 1. Create PRODUCTS table
CREATE TABLE IF NOT EXISTS public.products (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
    title TEXT NOT NULL,
    price NUMERIC(10, 2) NOT NULL,
    original_price NUMERIC(10, 2),
    category TEXT NOT NULL,
    image_url TEXT NOT NULL,
    description TEXT,
    stock INTEGER DEFAULT 20 NOT NULL,
    is_featured BOOLEAN DEFAULT false,
    rating NUMERIC(2, 1) DEFAULT 4.9,
    badge TEXT DEFAULT 'BESTSELLER'
);

-- 2. Create ORDERS table
CREATE TABLE IF NOT EXISTS public.orders (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
    customer_name TEXT NOT NULL,
    customer_email TEXT NOT NULL,
    customer_phone TEXT NOT NULL,
    shipping_address TEXT NOT NULL,
    city TEXT NOT NULL,
    items JSONB NOT NULL,
    total_amount NUMERIC(10, 2) NOT NULL,
    payment_method TEXT DEFAULT 'Cash on Delivery',
    status TEXT DEFAULT 'Pending',
    notes TEXT
);

-- 3. Enable Row Level Security (RLS)
ALTER TABLE public.products ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.orders ENABLE ROW LEVEL SECURITY;

-- 4. Policies for PRODUCTS (Allow public read, insert, update, delete with anon key)
DROP POLICY IF EXISTS "Public can view products" ON public.products;
CREATE POLICY "Public can view products" ON public.products
    FOR SELECT USING (true);

DROP POLICY IF EXISTS "Admin and public can insert products" ON public.products;
CREATE POLICY "Admin and public can insert products" ON public.products
    FOR INSERT WITH CHECK (true);

DROP POLICY IF EXISTS "Admin and public can update products" ON public.products;
CREATE POLICY "Admin and public can update products" ON public.products
    FOR UPDATE USING (true);

DROP POLICY IF EXISTS "Admin and public can delete products" ON public.products;
CREATE POLICY "Admin and public can delete products" ON public.products
    FOR DELETE USING (true);

-- 5. Policies for ORDERS (Allow placing orders & admin management)
DROP POLICY IF EXISTS "Anyone can place order" ON public.orders;
CREATE POLICY "Anyone can place order" ON public.orders
    FOR INSERT WITH CHECK (true);

DROP POLICY IF EXISTS "Admin can view orders" ON public.orders;
CREATE POLICY "Admin can view orders" ON public.orders
    FOR SELECT USING (true);

DROP POLICY IF EXISTS "Admin can update orders" ON public.orders;
CREATE POLICY "Admin can update orders" ON public.orders
    FOR UPDATE USING (true);

DROP POLICY IF EXISTS "Admin can delete orders" ON public.orders;
CREATE POLICY "Admin can delete orders" ON public.orders
    FOR DELETE USING (true);

-- 6. Insert Curated Aesthetic Luxury Starter Products
INSERT INTO public.products (title, price, original_price, category, image_url, description, stock, is_featured, rating, badge)
VALUES
(
    'Aurelia 18K Gold Vermeil Link Necklace',
    145.00,
    185.00,
    'Jewelry',
    'https://images.unsplash.com/photo-1599643478518-a784e5dc4c8f?auto=format&fit=crop&w=800&q=80',
    'Handcrafted in 18k gold vermeil over 925 sterling silver with a refined radiant finish. Hypoallergenic and timeless.',
    18,
    true,
    4.9,
    'BESTSELLER'
),
(
    'Chronos Minimalist Rose Gold Chronograph',
    220.00,
    280.00,
    'Watches',
    'https://images.unsplash.com/photo-1524805444758-089113d48a6d?auto=format&fit=crop&w=800&q=80',
    'Featuring sapphire crystal glass, Japanese quartz movement, and an Italian genuine leather strap in matte saddle brown.',
    12,
    true,
    5.0,
    'LUXURY EDIT'
),
(
    'Monaco Italian Calfskin Quilted Crossbody',
    340.00,
    420.00,
    'Bags',
    'https://images.unsplash.com/photo-1584917865442-de89df76afd3?auto=format&fit=crop&w=800&q=80',
    'Exquisitely soft full-grain Italian calfskin with diamond quilt pattern and brushed champagne gold hardware.',
    9,
    true,
    4.9,
    'LIMITED EDITION'
),
(
    'Riviera Polarized Tortoiseshell Sunglasses',
    115.00,
    150.00,
    'Sunglasses',
    'https://images.unsplash.com/photo-1511499767150-a48a237f0083?auto=format&fit=crop&w=800&q=80',
    'Hand-cut Italian acetate frames with category-3 UV400 polarized emerald gradient lenses.',
    25,
    false,
    4.8,
    'TRENDING'
),
(
    'Celeste Freshwater Pearl & Gold Drop Earrings',
    89.00,
    120.00,
    'Jewelry',
    'https://images.unsplash.com/photo-1630019852942-f89202989a59?auto=format&fit=crop&w=800&q=80',
    'Grade-AAA natural baroque freshwater pearls suspended from delicate 14k gold-filled huggie hoops.',
    15,
    true,
    4.9,
    'NEW ARRIVAL'
),
(
    'Elysium Diamond Solitaire Signet Ring',
    165.00,
    210.00,
    'Rings & Accents',
    'https://images.unsplash.com/photo-1605100804763-247f67b3557e?auto=format&fit=crop&w=800&q=80',
    'Subtle statement signet ring inset with a bezel-set brilliant lab-grown moissanite diamond in satin gold.',
    14,
    true,
    5.0,
    'HOT'
),
(
    'Sienna Silk Scarf & Leather Cuff Duo',
    75.00,
    95.00,
    'Rings & Accents',
    'https://images.unsplash.com/photo-1607604276583-eef5d076aa5f?auto=format&fit=crop&w=800&q=80',
    '100% pure mulberry twill silk with hand-rolled hems, paired with an adjustable brass-buckled leather wrist cuff.',
    22,
    false,
    4.7,
    'CURATED'
),
(
    'Vanguard Matte Noir Automatic Dive Watch',
    380.00,
    450.00,
    'Watches',
    'https://images.unsplash.com/photo-1522335789203-aabd1fc54bc9?auto=format&fit=crop&w=800&q=80',
    'Water-resistant to 200m with automatic mechanical movement, unidirectional ceramic bezel, and superluminova hands.',
    7,
    true,
    4.9,
    'EXCLUSIVE'
);
