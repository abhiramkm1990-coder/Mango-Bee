# Mangobee Retailer Platform - Technical Documentation & Deployment Guide

Welcome to the comprehensive technical documentation for the **Mangobee Retailer Platform**. This document serves as a guide for you or your development team to take this application from git, deploy it to a Linux server, understand the database architecture, and operate the platform.

---

## 1. Project Overview & Architecture

The Mangobee Retailer Platform is a modern, responsive **Single-Page Application (SPA)** built using **React (v18+)** and **Vite**, styled with **Tailwind CSS**. It incorporates highly interactive dynamic controls (e.g., custom visual builders, animated layouts) using **Motion** (`motion/react`) and custom vector illustrations.

### Technical Stack
*   **Frontend Framework:** React 18 with TypeScript (`.tsx`)
*   **Build Tooling & Dev Server:** Vite 5+ (fast HMR, optimized production bundling)
*   **Styling:** Tailwind CSS (fully customized theme including dark-mode utilities and smooth transitions)
*   **State & Persistence:** Flexible Local-First state fallbacks paired with **Supabase JS Client** for live real-time synchronization.
*   **Database Service:** Supabase (PostgreSQL under the hood)

---

## 2. Understanding Supabase

### What is Supabase?
**Supabase** is an open-source Firebase alternative. It provides developer-ready backend services built on top of a highly reliable **PostgreSQL relational database**.
By leveraging Supabase, this project avoids the need to maintain an active, complex custom backend application (like Express/Node) because the frontend communicates directly with the Supabase API securely using standard HTTP and WebSocket requests, fully constrained by security rules.

### Features Utilized:
1.  **PostgreSQL Database:** Storing product inventories, leads, orders, and dynamic site configurations.
2.  **Supabase Storage:** Storing high-quality uploaded product images into custom storage buckets.
3.  **Real-Time Subscriptions:** Reactively fetching and saving transactions.

---

## 3. How Supabase Connection Settings Work

To ensure the application is functional instantly on launch (without forcing you to provision database servers beforehand), the platform uses a **Dual-Mode Persistence Architecture**:

### Mode A: Mock Local Storage Fallback (Default)
If the Supabase connection keys are absent or unconfigured, the system automatically runs in a local sandbox mode. 
*   It reads and writes to the browser's `localStorage`.
*   A default catalog of premium products (such as Keyboard Combos, Aluminum Stands, Cable Armor, MagSafe Cases) is automatically seeded.
*   Orders, contact leads, and site customizations made in this mode persist locally in your browser. This is ideal for risk-free sandbox testing.

### Mode B: Live Database Sync Mode
Once valid Supabase credentials (**Supabase URL** and **Anon Public Key**) are provided, the system seamlessly transitions to live mode:
*   The application overrides its local fallbacks and initiates active connection client channels using `@supabase/supabase-js`.
*   All orders, products, and contact requests are written and read directly from your live PostgreSQL tables.
*   You can upload real files (e.g., PNG, JPEG) through the admin interface, which are stored in Supabase Storage.

### How to Configure the Connection Settings:
1.  **Via Code / Environment Variables:**
    *   Rename `.env.example` in the root folder to `.env` (or add them to your server environment):
        ```env
        VITE_SUPABASE_URL=your_supabase_project_url
        VITE_SUPABASE_ANON_KEY=your_supabase_anon_public_key
        ```
    *   During the build step, Vite injects these variables into the bundle (`import.meta.env`).
2.  **Via Admin Dashboard UI (Dynamic Override):**
    *   Go to the **Admin Dashboard** (Login by bypassing or with credentials).
    *   Open the **Settings Tab**.
    *   Input your **Supabase Project URL** and **Supabase Anon Key** directly in the UI fields.
    *   Click **"Save Connection Keys"**. The keys are stored in `localStorage` securely and the application instantly refreshes to sync with your database. This allows rapid testing of different Supabase instances directly from the browser!

---

## 4. Supabase Database Schema Bootstrapping

Before running the app in Live Mode, execute the following SQL script inside the **Supabase SQL Editor** (available in your Supabase project online dashboard). This sets up the relational structure required by the client:

```sql
-- 1. Create PRODUCTS Table
CREATE TABLE IF NOT EXISTS products (
  id TEXT PRIMARY KEY,
  name TEXT NOT NULL,
  category TEXT NOT NULL,
  price NUMERIC NOT NULL,
  stock_quantity INTEGER NOT NULL DEFAULT 0,
  description TEXT,
  specs JSONB DEFAULT '{}'::jsonb,
  image_url TEXT,
  variants JSONB DEFAULT '[]'::jsonb,
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT now()
);

-- 2. Create ORDERS Table
CREATE TABLE IF NOT EXISTS orders (
  id TEXT PRIMARY KEY,
  customer_name TEXT NOT NULL,
  email TEXT NOT NULL,
  phone TEXT,
  shipping_address TEXT NOT NULL,
  items JSONB DEFAULT '[]'::jsonb,
  subtotal NUMERIC NOT NULL,
  status TEXT DEFAULT 'pending',
  pre_order_id TEXT,
  created_at TIMESTAMPTZ DEFAULT now()
);

-- 3. Create LEADS Table
CREATE TABLE IF NOT EXISTS leads (
  id TEXT PRIMARY KEY,
  name TEXT NOT NULL,
  email TEXT NOT NULL,
  topic TEXT NOT NULL,
  message TEXT NOT NULL,
  status TEXT DEFAULT 'new',
  created_at TIMESTAMPTZ DEFAULT now()
);

-- 4. Create SITE_CONTENT Table
CREATE TABLE IF NOT EXISTS site_content (
  key TEXT PRIMARY KEY,
  value TEXT NOT NULL,
  section TEXT NOT NULL
);

-- 5. Storage Bucket Configuration (Optional)
-- Ensure you create a public Storage Bucket named "product-images" in Supabase Storage
-- to enable drag-and-drop media uploads in the Admin Dashboard.
```

---

## 5. Website & Admin Dashboard Features

### User-Facing Website Features
1.  **Dynamic Customizer Studio (MANGOBEE CUSTOMIZER STUDIO):**
    *   An interactive visual canvas showcasing real-time vector-drawn mockups of the configured product kit.
    *   Interactive controls to add/remove accessories like the **Aluminum Stand** and **Shockproof Case**, change **Cable Armor colors** (e.g., Mango Orange, Black Slate), and configure the **Keyboard finish**.
    *   **Automated Bundle Price Engine:** Instantly calculates the total amount with multi-product discounts in the selected currency (USD / INR).
2.  **Product Catalog:**
    *   Browse beautiful product listing cards.
    *   Filter by categories (e.g., Computers, Gaming, Charging, Accessories, Audio).
    *   Individual detailed visual drawers containing specifications (Battery life, Switch type, Compatibility), features, dynamic ratings, and reviews.
3.  **Active Currency Toggle:**
    *   Switch between **US Dollar ($)** and **Indian Rupee (₹)** seamlessly across the entire interface.
    *   Fetches live real-time foreign exchange rates (via Open ER API) to perform exact mathematical conversions.
4.  **Premium Cart & Check-out Flows:**
    *   Real-time cart drawer demonstrating quantities, sub-totals, automated combo promo discounts, tax calculations, and dynamic shipping rates.
    *   Complete physical shipping address forms with clean validations.
    *   Fully interactive **Razorpay Secure Checkout Portal Sandbox**, complete with card details validation, OTP-verification visual prompts, and instant order tracking generation.
5.  **Interactive Support Ticketing & Leads Form:**
    *   Submit dynamic inquiries about bulk corporate orders, compatibility queries, or active tracking codes. This pushes directly to the dashboard leads log.

---

### Admin Dashboard Features (Protected Portal)
1.  **Access Security Gateway:**
    *   Enter by logging in with default admin credentials (`admin@mangobee.com` / `admin123`) or via local bypass to check capabilities instantly.
2.  **Live Business Analytics & Data Visualizers:**
    *   Comprehensive performance statistics (Active Sales Subtotals, Pending orders count, Resolved leads).
    *   Beautiful interactive visual charts plotting daily or monthly sales subtotal volumes dynamically.
3.  **Real-Time Order Fulfillment Center:**
    *   Search, filter, and track orders by customer name, order ID, or fulfillment status.
    *   Change order statuses dynamically (e.g., Pending, Processing, Shipped, Delivered) with visual color badge indicators.
    *   Examine granular order item compositions, buyer contact coordinates, and shipment destinations.
4.  **Comprehensive Products Inventory & Media Manager:**
    *   Add new items, edit descriptions, adjust retail prices, configure custom variants, and track stock counts.
    *   **Rich Media Dropzone:** Supports standard file uploads (image files are automatically stored on Supabase Storage).
    *   Prices automatically adapt to the user's active currency selection.
5.  **Interactive Leads CRM & Ticketing Panel:**
    *   Review customer complaints, inquiries, and corporate bulk deals.
    *   Direct email reply visual template loader.
    *   Change ticket statuses to mark resolve status.
6.  **Supabase Live Connection & SQL Manager:**
    *   Configure dynamic database client keys.
    *   Examine database connectivity statuses.
    *   Copy bootstrap SQL commands directly.

---

## 6. Linux Deployment Guide

To deploy this platform on your own Linux Server (e.g., Ubuntu, Debian, CentOS) using Git, follow these detailed steps:

### Step 1: Install Node.js & Git
Log in to your server via SSH and execute:
```bash
# Update local packages
sudo apt update && sudo apt upgrade -y

# Install Git
sudo apt install git -y

# Install Node.js (Version 20 is recommended)
curl -fsSL https://deb.nodesource.com/setup_20.x | sudo -E bash -
sudo apt install -y nodejs
```

### Step 2: Clone the Project Repository
```bash
# Clone your repository
git clone https://github.com/your-username/mangobee-platform.git

# Enter the project directory
cd mangobee-platform
```

### Step 3: Install Project Dependencies
```bash
# Install packages
npm install
```

### Step 4: Configure Production Environment Variables
Create a permanent `.env` file containing your production endpoints:
```bash
nano .env
```
Paste your Supabase credentials (or leave empty to run in Sandbox Local Storage mode):
```env
VITE_SUPABASE_URL=https://your-project-id.supabase.co
VITE_SUPABASE_ANON_KEY=your-anon-public-key
```
Press `Ctrl + O` then `Enter` to save, and `Ctrl + X` to exit Nano.

### Step 5: Build the Static Application
Compile the TypeScript code and asset tree into high-performance, minified static files inside the `dist` directory:
```bash
npm run build
```

### Step 6: Serve the Site Using Nginx (Recommended)
Since the build produces static files, the most efficient way to serve them in production is using **Nginx**:

1.  **Install Nginx:**
    ```bash
    sudo apt install nginx -y
    ```
2.  **Configure Nginx Server Block:**
    Create a configuration file:
    ```bash
    sudo nano /etc/nginx/sites-available/mangobee
    ```
    Paste the following configuration (replace `yourdomain.com` with your domain name or server IP):
    ```nginx
    server {
        listen 80;
        server_name yourdomain.com;

        root /home/ubuntu/mangobee-platform/dist; # Adjust path to your directory
        index index.html;

        location / {
            try_files $uri $uri/ /index.html;
        }

        # Cache static assets efficiently
        location ~* \.(js|css|png|jpg|jpeg|gif|ico|svg|woff|woff2)$ {
            expires max;
            log_not_found off;
        }
    }
    ```
3.  **Enable Configuration & Restart Nginx:**
    ```bash
    # Link to enabled sites
    sudo ln -s /etc/nginx/sites-available/mangobee /etc/nginx/sites-enabled/

    # Test configuration for typos
    sudo nginx -t

    # Restart service
    sudo systemctl restart nginx
    ```

### Alternative Deployment: Simple Node Server
If you prefer to serve the application directly through Node.js (e.g., via PM2):
1.  Install PM2 globally:
    ```bash
    sudo npm install pm2 -g
    ```
2.  Create a simple file server `serve.js` in the project root:
    ```javascript
    const express = require('express');
    const path = require('path');
    const app = express();
    const port = process.env.PORT || 3000;

    app.use(express.static(path.join(__dirname, 'dist')));

    app.get('*', (req, res) => {
      res.sendFile(path.join(__dirname, 'dist', 'index.html'));
    });

    app.listen(port, () => {
      console.log(`Server running on port ${port}`);
    });
    ```
3.  Start with PM2:
    ```bash
    pm2 start serve.js --name "mangobee-site"
    pm2 save
    pm2 startup
    ```

---

## 7. Developer's Checklist
When modifying the code in the future, follow these architectural directives:
*   **Price Formatting:** Always wrap raw pricing variables in the `formatPrice()` function to support real-time exchange conversions automatically.
*   **Database Synchronization:** When adding a database table, ensure helper methods inside `src/lib/supabase.ts` contain `try-catch` blocks and gracefully fall back to `localStorage` operations if `supabase` is null.
*   **Responsiveness:** Do not use hardcoded pixel sizing calculations based on window properties. Use flexible Tailwind CSS utility classes (`lg:`, `md:`, `sm:`) to maintain fluid designs.

---
*Documented with care for Mangobee Developers.*
