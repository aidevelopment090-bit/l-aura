# L'AURA — Haute Luxury Accessories & Fine Accents 💎

A luxurious, aesthetic, and fully functional E-Commerce Accessories Shop and Executive Admin Console built with modern HTML5, CSS3, JavaScript, and connected directly with your **Supabase** database backend.

---

## 🌟 Key Features

### 🛍️ Client Storefront (`index.html`)
- **Aesthetic Luxury Design System**: Warm ivory palette, deep obsidian, and champagne gold (`#C5A880`) inspired by European high-fashion maisons.
- **Dynamic Product Catalog**: Filter by category (*Fine Jewelry*, *Timepieces*, *Designer Bags*, *Eyewear*, *Rings & Accents*), instant real-time search, and price/rating sorting.
- **Multi-Currency Converter**: Real-time price conversion between **USD ($)**, **PKR (₨)**, **EUR (€)**, **GBP (£)**, and **AED (د.إ)**.
- **Interactive Slide-Out Shopping Bag**: Quantity adjustments (`+` / `-`), subtotal calculations, and free shipping progress.
- **Wishlist System**: Save favorite pieces with live counters and 1-click move to shopping bag.
- **Quick View Modal**: Inspect high-res imagery, product specifications, material details, and stock availability.
- **Seamless Checkout**: Complete customer acquisition form (Name, Email, WhatsApp, Delivery Address, City, Payment method) that saves orders directly into Supabase.
- **Live Supabase Indicator**: Displays real-time connection status to your Supabase project.

### ⚙️ Executive Admin Console (`admin.html`)
- **PIN-Protected Access**: Secure entrance (Default PIN: `admin123`).
- **Real-Time KPIs**: Total products, customer orders received, gross revenue calculation, and low-stock alerts.
- **Full Inventory Management (CRUD)**: Add new pieces, upload/preview image URLs, edit pricing, update stock, and delete items.
- **Customer Order Dispatch**: View customer orders, phone numbers, delivery addresses, and update fulfillment status (*Pending*, *Processing*, *Shipped*, *Delivered*, *Cancelled*).
- **1-Click Supabase Sync**: Built-in SQL schema viewer and a 1-click button to seed your Supabase database with starter luxury pieces.

---

## 🔑 Configured Supabase Credentials

Your Supabase project is already configured in `js/supabase-config.js`:
- **Project URL:** `https://idnvnfeffmddgyazdobu.supabase.co`
- **Anon Public Key:** `eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImlkbnZuZmVmZm1kZGd5YXpkb2J1Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3OTIzMzAzNjQsImV4cCI6MjEwNzkwNjM2NH0.S0gJmS1no0eG5v1lX0O1YDzTi6EG28K8kNSh9tMoip0`
- **Publishable Key:** `sb_publishable__VuEE0XC2kBGtOpazb4YrA_MEFBOwu0`

---

## ⚡ How to Setup Your Supabase Database in 2 Minutes

Even without running the SQL script yet, the website runs smoothly with a built-in fallback. To enable 100% live Supabase syncing:

1. Open your Supabase SQL Editor:
   👉 **[https://supabase.com/dashboard/project/idnvnfeffmddgyazdobu/sql/new](https://supabase.com/dashboard/project/idnvnfeffmddgyazdobu/sql/new)**
2. Open the file `schema.sql` (or open the **Database & SQL Schema** tab in `admin.html` and click **"Copy Full SQL Script"**).
3. Paste the SQL code into the Supabase SQL Editor and click **Run**.
4. That's it! Both `products` and `orders` tables are now created with initial luxury products and Row Level Security policies.

---

## 🚀 How to Run the Website Locally

You can open `index.html` or `admin.html` directly in any web browser:

1. Double-click **`index.html`** to browse the store.
2. Double-click **`admin.html`** to open the Admin Console (PIN: `admin123`).

Or run a local server in PowerShell:
```powershell
# In the project directory:
python -m http.server 3000
# Then visit: http://localhost:3000
```

---

## 📂 Project Structure

```text
├── index.html              # Customer luxury storefront
├── admin.html              # Executive admin dashboard
├── schema.sql              # Supabase PostgreSQL tables & initial data
├── css/
│   ├── style.css           # Storefront luxury styling
│   └── admin.css           # Admin dashboard dark-mode styling
├── js/
│   ├── supabase-config.js  # Supabase client & API wrapper
│   ├── store.js            # Storefront catalog, cart & checkout logic
│   └── admin.js            # Admin inventory & order management logic
└── README.md               # Documentation & setup guide
```

---

### اردو میں ہدایات (Urdu Instructions)

1. **ویب سائٹ کھولنے کا طریقہ**: اپنے فولڈر میں موجود `index.html` فائل پر ڈبل کلک کریں، ویب سائٹ براؤزر میں اوپن ہو جائے گی۔
2. **ایڈمن پینل**: `admin.html` فائل کو کھولیں اور پن کوڈ **`admin123`** درج کریں۔
3. **Supabase ڈیٹا بیس کنکشن**:
   - `schema.sql` فائل کا سارا کوڈ کاپی کریں اور اپنے [Supabase SQL Editor](https://supabase.com/dashboard/project/idnvnfeffmddgyazdobu/sql/new) میں پیسٹ کر کے **Run** کے بٹن پر کلک کریں۔
   - اس سے آپ کے Supabase اکاؤنٹ میں `products` اور `orders` کے ٹیبلز خودکار طور پر بن جائیں گے اور پروڈکٹس لائیو سِنک ہو جائیں گی!
