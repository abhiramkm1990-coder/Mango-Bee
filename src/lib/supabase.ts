import { createClient } from '@supabase/supabase-js';
import { Product, Order, Lead, SiteContent } from '../types';

// Let the user store their credentials in localStorage for preview testing if env vars aren't set
const LS_KEYS = {
  URL: 'mangobee_supabase_url',
  ANON_KEY: 'mangobee_supabase_anon_key',
  PRODUCTS: 'mangobee_db_products',
  ORDERS: 'mangobee_db_orders',
  LEADS: 'mangobee_db_leads',
  CONTENT: 'mangobee_db_content',
};

const getCredentials = () => {
  const envUrl = (import.meta as any).env?.VITE_SUPABASE_URL || '';
  const envKey = (import.meta as any).env?.VITE_SUPABASE_ANON_KEY || '';
  
  const localUrl = localStorage.getItem(LS_KEYS.URL) || '';
  const localKey = localStorage.getItem(LS_KEYS.ANON_KEY) || '';

  return {
    url: envUrl || localUrl,
    anonKey: envKey || localKey,
    isCustom: !!(!envUrl && localUrl)
  };
};

const credentials = getCredentials();
export const isRealSupabase = !!(credentials.url && credentials.anonKey);

export const supabase = isRealSupabase 
  ? createClient(credentials.url, credentials.anonKey) 
  : null;

// Default Seed Products
const SEED_PRODUCTS: Product[] = [
  {
    id: 'kb-combo',
    name: 'Modern Wireless Keyboard & Mouse Combo',
    category: 'Computers & Gaming',
    price: 59.99,
    stock_quantity: 45,
    description: 'Ultra-slim, rechargeable wireless keyboard and mouse with silent mechanical feel. Designed to elevate your desk aesthetic and productivity.',
    specs: { 'Battery Life': 'Up to 3 months on single charge', 'Switch Type': 'Quiet Tactile Scissor', 'Compatibility': 'Windows, macOS, iOS, Android', 'Weight': '420g' },
    image_url: 'keyboard', // used as SVG type or actual URL
    variants: ['Minimalist White', 'Carbon Slate'],
    is_active: true,
    badge: 'Premium Edition',
    rating: 4.9,
    reviewCount: 142,
    features: ['Multi-Device Pairing (2.4Ghz + Dual Bluetooth)', 'Rechargeable 500mAh Lithium Battery', 'Whisper-Quiet Mechanical Scissor-Switches', 'Ergonomic Natural Wrist Slope'],
    imageType: 'keyboard'
  },
  {
    id: 'laptop-stand',
    name: 'Adjustable Aluminum Ergonomic Laptop Stand',
    category: 'Computers & Gaming',
    price: 39.99,
    stock_quantity: 60,
    description: '6-level height adjustment, solid heat-dissipation aluminum body. Engineered from aircraft-grade sandblasted aluminum to prevent neck fatigue.',
    specs: { 'Material': '6063 Aluminum Alloy', 'Support Weight': 'Up to 20kg', 'Size Folded': '260 x 45 x 15 mm', 'Heat Dissipation': 'Passive Open-Air design' },
    image_url: 'stand',
    variants: ['Anodized Silver', 'Space Gray'],
    is_active: true,
    badge: 'Best Seller',
    rating: 4.8,
    reviewCount: 98,
    features: ['6 Adjustable Angle Levels (15° to 45°)', 'Aircraft-Grade Sandblasted Aluminum', 'Fully Collapsible with Carrying Sleeve', 'Thick Protective Silicone Padding'],
    imageType: 'stand'
  },
  {
    id: 'usbc-cable',
    name: '65W Braided Fast-Charging USB-C Cable',
    category: 'Charging & Accessories',
    price: 15.99,
    stock_quantity: 120,
    description: 'High-speed Power Delivery (PD) braided nylon cable with reinforced orange connectors. Built to survive a lifetime of daily charging.',
    specs: { 'Length': '1.8 Meters (6 Feet)', 'Data Speed': '480 Mbps', 'Max Output': '20V / 3.25A', 'Bend Lifespan': '25,000+ Bends' },
    image_url: 'cable',
    variants: ['Mango Orange & Black Accent', 'Solid Black Slate'],
    is_active: true,
    badge: 'iPhone 15/16/17 Compatible',
    rating: 4.9,
    reviewCount: 214,
    features: ['Supports 65W Power Delivery (PD)', 'Double-Braided Ballistic Nylon Armor', 'Strain-Relief Flexible Joints', 'Smart IC E-Marker Safety Chip Inside'],
    imageType: 'cable'
  },
  {
    id: 'phone-case',
    name: 'Shockproof Premium Case (Mixed Models)',
    category: 'Charging & Accessories',
    price: 18.99,
    stock_quantity: 85,
    description: 'MagSafe-compatible, ultra-slim hard casing with impact defense edges. Engineered with a proprietary shock-absorbing inner bumper.',
    specs: { 'Thickness': '1.2 mm', 'Materials': 'Flexible TPU + Solid Polycarbonate', 'Magnets': '38x N52 Neodymium', 'Models': 'iPhone 17, 16, 15 | Samsung S24, S23' },
    image_url: 'case',
    variants: ['iPhone 17 Pro Max', 'iPhone 16 Pro', 'Samsung Galaxy S24 Ultra'],
    is_active: true,
    badge: 'New Launch',
    rating: 4.7,
    reviewCount: 186,
    features: ['MagSafe Compatible Ring Built-in', '10ft Mil-Grade Drop Protection', 'Anti-Yellowing Matte Finish Shield', 'Ultra-Responsive Tactile Buttons'],
    imageType: 'case'
  },
  {
    id: 'usb-hub',
    name: 'Aluminum Multi-Port USB 3.0 Hub',
    category: 'Electronics',
    price: 29.99,
    stock_quantity: 35,
    description: 'Sleek aluminum casing expanding to 4-7 ultra-fast data ports. Instantly organize your desktop peripherals with high-speed lanes.',
    specs: { 'Body Material': 'Anodized Aluminum', 'Cable Length': '30cm', 'Power Source': 'Bus-Powered or 5V DC Auxiliary', 'Chipset': 'Premium GL3520 Controller' },
    image_url: 'hub',
    variants: ['4-Port Compact', '7-Port Pro Expanded'],
    is_active: true,
    badge: 'Pro Utility',
    rating: 4.8,
    reviewCount: 74,
    features: ['4-7 Dedicated USB 3.0 Ports', '5Gbps Blazing Fast Data Sync', 'Anodized Premium Alloy Structure', 'Individual Blue LED Port Indicators'],
    imageType: 'hub'
  },
  {
    id: 'wired-earphones',
    name: 'High-Fidelity Ergonomic Wired Earphones',
    category: 'Audio Devices',
    price: 19.99,
    stock_quantity: 50,
    description: 'Experience crisp vocal clarity and clean punchy bass. Tangle-resistant reinforced cable and integrated HD microphone with passive isolation.',
    specs: { 'Frequency Response': '20 Hz - 20 kHz', 'Impedance': '32 Ohm', 'Connector': 'Type-C / 3.5mm Gold-Plated', 'Cord Length': '1.2 Meters' },
    image_url: 'earphones',
    variants: ['Type-C Connector', '3.5mm Audio Jack'],
    is_active: true,
    badge: 'Premium Audio',
    rating: 4.7,
    reviewCount: 112,
    features: ['10mm High-Resolution Dynamic Drivers', '3-Button Inline Remote & HD Mic', 'Ergonomic In-Ear Fit for Exercise', 'Passive Acoustic Noise Isolation'],
    imageType: 'earphones'
  },
  {
    id: 'ring-light',
    name: 'USB-Powered 8" LED Ring Light',
    category: 'Home & Kitchen',
    price: 34.99,
    stock_quantity: 40,
    description: 'Professional lighting made portable. Instantly boost your video conferencing, streaming, or content creation quality with warm, natural, and cool modes.',
    specs: { 'Outer Diameter': '8 Inches', 'Color Temp': '3000K - 6500K', 'USB Cord Length': '2 Meters', 'Power Output': '12 Watts' },
    image_url: 'light',
    variants: ['Desktop Tripod Edition', 'Premium Tall Stand Edition'],
    is_active: true,
    badge: 'Perfect for Vlogs',
    rating: 4.6,
    reviewCount: 81,
    features: ['3 Glow Modes (Warm, Natural, Cool White)', '10 Distinct Brightness Levels', 'Stable Non-Wobble Metal Tripod', 'USB-Powered for Desk Portability'],
    imageType: 'light'
  },
  {
    id: 'car-mount',
    name: '360° Magnetic Air-Vent Mobile Holder',
    category: 'Outdoor & Camping',
    price: 24.99,
    stock_quantity: 90,
    description: 'Military-grade air vent grip, ultra-strong N52 magnetic lock. Keep your smartphone visible and secure on bumpy roads with single-hand snap action.',
    specs: { 'Magnet Pull Force': 'Up to 2.5kg load', 'Material': 'Carbon-reinforced Polycarbonate', 'Compatibility': 'All iPhone/Galaxy Models', 'Weight': '65g' },
    image_url: 'holder',
    variants: ['Stealth Charcoal Black', 'Sunset Orange Trim'],
    is_active: true,
    badge: 'Travel Essential',
    rating: 4.8,
    reviewCount: 119,
    features: ['Secure Dual-Claw Vent Grip', '360° Ball-Joint Rotation System', 'Safe Neodymium Shielded Magnetic Field', 'One-Hand Quick Snap-On Action'],
    imageType: 'holder'
  }
];

const SEED_CONTENT: SiteContent[] = [
  { key: 'hero_headline', value: 'High-Performance Workspaces Start Here.', section: 'hero' },
  { key: 'hero_subheadline', value: 'Premium, military-grade accessories engineered to optimize your daily speed, comfort, and digital workflow.', section: 'hero' },
  { key: 'about_text', value: 'At Mangobee, we believe that your workspace accessories shouldn\'t just work — they should inspire. What began as a search for high-speed charging cables turned into a dedicated obsession with structural ergonomics, sleek materials, and long-lasting durability.', section: 'about' },
  { key: 'about_headline', value: 'Crafting the tools of the modern digital artisan.', section: 'about' },
  { key: 'cta_headline', value: 'Ready to upgrade your daily flow?', section: 'cta' },
  { key: 'cta_subheadline', value: 'Save up to 15% when you bundle any custom fast cable, mechanical keyboard combo, and adjustable aluminum stand today.', section: 'cta' }
];

const SEED_LEADS: Lead[] = [
  {
    id: 'lead-1',
    name: 'Marcus Vance',
    email: 'marcus.v@designstudio.com',
    topic: 'Bulk Corporate Orders (Discount Inquiry)',
    message: 'Hello! We are looking to buy 35 units of your Adjustable Aluminum Ergonomic Laptop Stand and Keyboard combos for our design lab. Do you offer custom laser logo engraving or corporate volume discounts?',
    status: 'new',
    created_at: new Date(Date.now() - 3600000 * 2).toISOString(),
  },
  {
    id: 'lead-2',
    name: 'Sarah Jenkins',
    email: 'sarah@techflow.io',
    topic: 'Pre-order Reservation Help',
    message: 'Hi, I registered for the fast charging cable pre-order, is the orange accent cable compatible with Samsung S24 Ultra chargers at 45W super fast charging?',
    status: 'replied',
    created_at: new Date(Date.now() - 3600000 * 12).toISOString(),
  }
];

const SEED_ORDERS: Order[] = [
  {
    id: 'ord-9821a',
    customer_name: 'Daniel Peterson',
    email: 'dan.pete@gmail.com',
    phone: '+1 (555) 321-4567',
    shipping_address: '742 Evergreen Terrace, Springfield, OR 97477',
    items: [
      {
        product_id: 'kb-combo',
        product_name: 'Modern Wireless Keyboard & Mouse Combo',
        price: 59.99,
        qty: 1,
        variant: 'Minimalist White',
        imageType: 'keyboard'
      },
      {
        product_id: 'usbc-cable',
        product_name: '65W Braided Fast-Charging USB-C Cable',
        price: 15.99,
        qty: 2,
        variant: 'Mango Orange & Black Accent',
        imageType: 'cable'
      }
    ],
    subtotal: 91.97,
    status: 'confirmed',
    pre_order_id: 'MB-PRE-87321',
    created_at: new Date(Date.now() - 3600000 * 5).toISOString()
  },
  {
    id: 'ord-4412b',
    customer_name: 'Sophia Carter',
    email: 'sophia@carterconsulting.net',
    phone: '+1 (415) 888-0099',
    shipping_address: '450 Mission St, San Francisco, CA 94105',
    items: [
      {
        product_id: 'laptop-stand',
        product_name: 'Adjustable Aluminum Ergonomic Laptop Stand',
        price: 39.99,
        qty: 1,
        variant: 'Anodized Silver',
        imageType: 'stand'
      }
    ],
    subtotal: 39.99,
    status: 'pending',
    pre_order_id: 'MB-PRE-32981',
    created_at: new Date(Date.now() - 3600000 * 24).toISOString()
  }
];

// Initialize Storage if empty
if (!localStorage.getItem(LS_KEYS.PRODUCTS)) {
  localStorage.setItem(LS_KEYS.PRODUCTS, JSON.stringify(SEED_PRODUCTS));
}
if (!localStorage.getItem(LS_KEYS.CONTENT)) {
  localStorage.setItem(LS_KEYS.CONTENT, JSON.stringify(SEED_CONTENT));
}
if (!localStorage.getItem(LS_KEYS.LEADS)) {
  localStorage.setItem(LS_KEYS.LEADS, JSON.stringify(SEED_LEADS));
}
if (!localStorage.getItem(LS_KEYS.ORDERS)) {
  localStorage.setItem(LS_KEYS.ORDERS, JSON.stringify(SEED_ORDERS));
}

// Global state functions
export const getLocalProducts = (): Product[] => {
  return JSON.parse(localStorage.getItem(LS_KEYS.PRODUCTS) || '[]');
};

export const setLocalProducts = (products: Product[]) => {
  localStorage.setItem(LS_KEYS.PRODUCTS, JSON.stringify(products));
};

export const getLocalOrders = (): Order[] => {
  return JSON.parse(localStorage.getItem(LS_KEYS.ORDERS) || '[]');
};

export const setLocalOrders = (orders: Order[]) => {
  localStorage.setItem(LS_KEYS.ORDERS, JSON.stringify(orders));
};

export const getLocalLeads = (): Lead[] => {
  return JSON.parse(localStorage.getItem(LS_KEYS.LEADS) || '[]');
};

export const setLocalLeads = (leads: Lead[]) => {
  localStorage.setItem(LS_KEYS.LEADS, JSON.stringify(leads));
};

export const getLocalContent = (): SiteContent[] => {
  return JSON.parse(localStorage.getItem(LS_KEYS.CONTENT) || '[]');
};

export const setLocalContent = (content: SiteContent[]) => {
  localStorage.setItem(LS_KEYS.CONTENT, JSON.stringify(content));
};

// API Bridge Methods
export const getProducts = async (): Promise<Product[]> => {
  if (isRealSupabase && supabase) {
    try {
      const { data, error } = await supabase
        .from('products')
        .select('*')
        .order('created_at', { ascending: false });
      
      if (error) throw error;
      // Map schema variables if needed
      return (data || []).map(p => ({
        ...p,
        imageType: p.image_url as any || 'cable', // fall back if empty
        specs: typeof p.specs === 'string' ? JSON.parse(p.specs) : p.specs || {},
        variants: typeof p.variants === 'string' ? JSON.parse(p.variants) : p.variants || [],
      }));
    } catch (err) {
      console.warn('Supabase fetch failed, falling back to LocalStorage:', err);
    }
  }
  return getLocalProducts();
};

export const saveProduct = async (product: Partial<Product> & { id: string }): Promise<Product> => {
  if (isRealSupabase && supabase) {
    try {
      const dbProduct = {
        id: product.id,
        name: product.name,
        category: product.category,
        price: Number(product.price),
        stock_quantity: Number(product.stock_quantity),
        description: product.description,
        specs: product.specs,
        image_url: product.image_url || product.imageType || 'cable',
        variants: product.variants,
        is_active: product.is_active ?? true,
      };

      const { data, error } = await supabase
        .from('products')
        .upsert(dbProduct)
        .select()
        .single();

      if (error) throw error;
      return {
        ...data,
        imageType: data.image_url as any,
        specs: typeof data.specs === 'string' ? JSON.parse(data.specs) : data.specs || {},
        variants: typeof data.variants === 'string' ? JSON.parse(data.variants) : data.variants || [],
      };
    } catch (err) {
      console.warn('Supabase save failed, writing to LocalStorage:', err);
    }
  }

  const products = getLocalProducts();
  const existingIndex = products.findIndex(p => p.id === product.id);
  
  // Ensure imageType is aligned
  const imageType = product.imageType || product.image_url as any || 'cable';
  const fullProduct: Product = {
    ...SEED_PRODUCTS.find(p => p.id === product.id), // merge defaults if existing mockup
    ...product,
    id: product.id,
    name: product.name || '',
    category: product.category || 'Electronics',
    price: Number(product.price) || 0,
    stock_quantity: Number(product.stock_quantity) || 0,
    description: product.description || '',
    specs: product.specs || {},
    image_url: product.image_url || imageType,
    imageType: imageType,
    variants: product.variants || [],
    is_active: product.is_active ?? true,
  };

  if (existingIndex > -1) {
    products[existingIndex] = fullProduct;
  } else {
    products.unshift(fullProduct);
  }
  setLocalProducts(products);
  return fullProduct;
};

export const deleteProduct = async (id: string): Promise<boolean> => {
  if (isRealSupabase && supabase) {
    try {
      const { error } = await supabase
        .from('products')
        .delete()
        .eq('id', id);
      if (error) throw error;
      return true;
    } catch (err) {
      console.warn('Supabase delete failed:', err);
    }
  }

  const products = getLocalProducts();
  const filtered = products.filter(p => p.id !== id);
  setLocalProducts(filtered);
  return true;
};

export const getOrders = async (): Promise<Order[]> => {
  if (isRealSupabase && supabase) {
    try {
      const { data, error } = await supabase
        .from('orders')
        .select('*')
        .order('created_at', { ascending: false });
      
      if (error) throw error;
      return (data || []).map(o => ({
        ...o,
        items: typeof o.items === 'string' ? JSON.parse(o.items) : o.items || [],
      }));
    } catch (err) {
      console.warn('Supabase fetch failed:', err);
    }
  }
  return getLocalOrders();
};

export const saveOrder = async (order: Omit<Order, 'id' | 'created_at'>): Promise<Order> => {
  const newId = 'ord-' + Math.random().toString(36).substr(2, 5);
  const newOrder: Order = {
    ...order,
    id: newId,
    created_at: new Date().toISOString(),
  };

  if (isRealSupabase && supabase) {
    try {
      const { data, error } = await supabase
        .from('orders')
        .insert({
          id: newOrder.id,
          customer_name: newOrder.customer_name,
          email: newOrder.email,
          phone: newOrder.phone,
          shipping_address: newOrder.shipping_address,
          items: newOrder.items,
          subtotal: Number(newOrder.subtotal),
          status: newOrder.status,
          pre_order_id: newOrder.pre_order_id,
        })
        .select()
        .single();

      if (error) throw error;
      return {
        ...data,
        items: typeof data.items === 'string' ? JSON.parse(data.items) : data.items || [],
      };
    } catch (err) {
      console.warn('Supabase order save failed:', err);
    }
  }

  const orders = getLocalOrders();
  orders.unshift(newOrder);
  setLocalOrders(orders);
  return newOrder;
};

export const updateOrderStatus = async (id: string, status: Order['status']): Promise<boolean> => {
  if (isRealSupabase && supabase) {
    try {
      const { error } = await supabase
        .from('orders')
        .update({ status })
        .eq('id', id);
      if (error) throw error;
      return true;
    } catch (err) {
      console.warn('Supabase status update failed:', err);
    }
  }

  const orders = getLocalOrders();
  const index = orders.findIndex(o => o.id === id);
  if (index > -1) {
    orders[index].status = status;
    setLocalOrders(orders);
    return true;
  }
  return false;
};

export const getLeads = async (): Promise<Lead[]> => {
  if (isRealSupabase && supabase) {
    try {
      const { data, error } = await supabase
        .from('leads')
        .select('*')
        .order('created_at', { ascending: false });
      
      if (error) throw error;
      return data || [];
    } catch (err) {
      console.warn('Supabase fetch failed:', err);
    }
  }
  return getLocalLeads();
};

export const saveLead = async (lead: Omit<Lead, 'id' | 'created_at' | 'status'>): Promise<Lead> => {
  const newLead: Lead = {
    ...lead,
    id: 'lead-' + Math.random().toString(36).substr(2, 5),
    status: 'new',
    created_at: new Date().toISOString(),
  };

  if (isRealSupabase && supabase) {
    try {
      const { data, error } = await supabase
        .from('leads')
        .insert({
          id: newLead.id,
          name: newLead.name,
          email: newLead.email,
          topic: newLead.topic,
          message: newLead.message,
          status: newLead.status,
        })
        .select()
        .single();

      if (error) throw error;
      return data;
    } catch (err) {
      console.warn('Supabase lead save failed:', err);
    }
  }

  const leads = getLocalLeads();
  leads.unshift(newLead);
  setLocalLeads(leads);
  return newLead;
};

export const updateLeadStatus = async (id: string, status: Lead['status']): Promise<boolean> => {
  if (isRealSupabase && supabase) {
    try {
      const { error } = await supabase
        .from('leads')
        .update({ status })
        .eq('id', id);
      if (error) throw error;
      return true;
    } catch (err) {
      console.warn('Supabase lead update failed:', err);
    }
  }

  const leads = getLocalLeads();
  const index = leads.findIndex(l => l.id === id);
  if (index > -1) {
    leads[index].status = status;
    setLocalLeads(leads);
    return true;
  }
  return false;
};

export const getSiteContent = async (): Promise<SiteContent[]> => {
  if (isRealSupabase && supabase) {
    try {
      const { data, error } = await supabase
        .from('site_content')
        .select('*');
      
      if (error) throw error;
      return data || [];
    } catch (err) {
      console.warn('Supabase fetch failed:', err);
    }
  }
  return getLocalContent();
};

export const updateSiteContent = async (key: string, value: string, section: SiteContent['section']): Promise<boolean> => {
  if (isRealSupabase && supabase) {
    try {
      const { error } = await supabase
        .from('site_content')
        .upsert({ key, value, section });
      if (error) throw error;
      return true;
    } catch (err) {
      console.warn('Supabase content update failed:', err);
    }
  }

  const content = getLocalContent();
  const index = content.findIndex(c => c.key === key);
  if (index > -1) {
    content[index].value = value;
  } else {
    content.push({ key, value, section });
  }
  setLocalContent(content);
  return true;
};

// Simple Mock Image Uploader
export const uploadProductImage = async (file: File): Promise<string> => {
  if (isRealSupabase && supabase) {
    try {
      const fileName = `${Date.now()}_${file.name.replace(/\s+/g, '_')}`;
      const { data, error } = await supabase.storage
        .from('product-images')
        .upload(fileName, file);

      if (error) throw error;

      const { data: publicUrlData } = supabase.storage
        .from('product-images')
        .getPublicUrl(fileName);

      return publicUrlData.publicUrl;
    } catch (err) {
      console.warn('Supabase image upload failed, returning object URL:', err);
    }
  }

  // Fallback to object URL or simple data url
  return new Promise((resolve) => {
    const reader = new FileReader();
    reader.onloadend = () => resolve(reader.result as string);
    reader.readAsDataURL(file);
  });
};

// Help helper to update credentials dynamically
export const saveSupabaseCredentials = (url: string, anonKey: string) => {
  if (url && anonKey) {
    localStorage.setItem(LS_KEYS.URL, url);
    localStorage.setItem(LS_KEYS.ANON_KEY, anonKey);
  } else {
    localStorage.removeItem(LS_KEYS.URL);
    localStorage.removeItem(LS_KEYS.ANON_KEY);
  }
  window.location.reload();
};
