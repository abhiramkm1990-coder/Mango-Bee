export interface Product {
  id: string;
  name: string;
  category: string;
  price: number;
  stock_quantity?: number;
  description?: string;
  specs: Record<string, string>;
  image_url?: string;
  variants: string[];
  is_active?: boolean;
  created_at?: string;
  // Extra fields for compatibility with existing UI
  badge?: string;
  rating?: number;
  reviewCount?: number;
  features?: string[];
  shortDesc?: string;
  longDesc?: string;
  imageType: 'cable' | 'stand' | 'keyboard' | 'case' | 'holder' | 'earphones' | 'hub' | 'light';
}

export interface Order {
  id: string;
  customer_name: string;
  email: string;
  phone: string;
  shipping_address: string;
  items: {
    product_id: string;
    product_name: string;
    price: number;
    qty: number;
    variant: string;
    imageType: string;
  }[];
  subtotal: number;
  status: 'pending' | 'confirmed' | 'shipped' | 'cancelled';
  pre_order_id: string;
  created_at: string;
}

export interface Lead {
  id: string;
  name: string;
  email: string;
  topic: string;
  message: string;
  status: 'new' | 'replied' | 'closed';
  created_at: string;
}

export interface SiteContent {
  key: string;
  value: string;
  section: 'hero' | 'about' | 'cta' | 'contact';
}
