import React, { useState, useEffect, useMemo } from 'react';
import { 
  Database, 
  Settings, 
  ShoppingBag, 
  Mail, 
  FileText, 
  LogOut, 
  Plus, 
  Edit2, 
  Trash2, 
  Check, 
  X, 
  Download, 
  ShieldAlert, 
  RefreshCw, 
  Eye, 
  Lock, 
  TrendingUp, 
  User, 
  PlusCircle, 
  Upload, 
  FileCode,
  Tag,
  Briefcase
} from 'lucide-react';
import { Product, Order, Lead, SiteContent } from '../types';
import { 
  isRealSupabase, 
  supabase, 
  getProducts, 
  saveProduct, 
  deleteProduct, 
  getOrders, 
  updateOrderStatus, 
  getLeads, 
  updateLeadStatus, 
  getSiteContent, 
  updateSiteContent,
  uploadProductImage,
  saveSupabaseCredentials
} from '../lib/supabase';

interface AdminDashboardProps {
  onClose: () => void;
  onContentChange?: () => void;
}

export default function AdminDashboard({ onClose, onContentChange }: AdminDashboardProps) {
  // Authentication state
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [authEmail, setAuthEmail] = useState('');
  const [authPassword, setAuthPassword] = useState('');
  const [authError, setAuthError] = useState('');
  const [authLoading, setAuthLoading] = useState(false);

  // Connection settings
  const [customUrl, setCustomUrl] = useState(localStorage.getItem('mangobee_supabase_url') || '');
  const [customKey, setCustomKey] = useState(localStorage.getItem('mangobee_supabase_anon_key') || '');

  // Tabs: 'overview' | 'products' | 'orders' | 'leads' | 'content' | 'settings'
  const [activeTab, setActiveTab] = useState<'overview' | 'products' | 'orders' | 'leads' | 'content' | 'settings'>('overview');

  // Database lists
  const [products, setProducts] = useState<Product[]>([]);
  const [orders, setOrders] = useState<Order[]>([]);
  const [leads, setLeads] = useState<Lead[]>([]);
  const [siteContent, setSiteContent] = useState<SiteContent[]>([]);
  const [loading, setLoading] = useState(true);

  // Toast Notification state
  const [toast, setToast] = useState<{ message: string; type: 'success' | 'error' | 'info' } | null>(null);

  // Product Form modal states
  const [editingProduct, setEditingProduct] = useState<Product | null>(null);
  const [productFormOpen, setProductFormOpen] = useState(false);
  const [prodId, setProdId] = useState('');
  const [prodName, setProdName] = useState('');
  const [prodCategory, setProdCategory] = useState('Electronics');
  const [prodPrice, setProdPrice] = useState(0);
  const [prodStock, setProdStock] = useState(0);
  const [prodDesc, setProdDesc] = useState('');
  const [prodVariants, setProdVariants] = useState('');
  const [prodImageType, setProdImageType] = useState<Product['imageType']>('cable');
  const [prodFeatures, setProdFeatures] = useState('');
  const [prodSpecs, setProdSpecs] = useState<[string, string][]>([['', '']]);
  const [isUploading, setIsUploading] = useState(false);

  // Order Details Modal
  const [selectedOrder, setSelectedOrder] = useState<Order | null>(null);

  // Lead Details Modal
  const [selectedLead, setSelectedLead] = useState<Lead | null>(null);
  const [leadReplyText, setLeadReplyText] = useState('');

  // Search/Filters inside tabs
  const [prodSearch, setProdSearch] = useState('');
  const [orderFilter, setOrderFilter] = useState<'all' | 'pending' | 'confirmed' | 'shipped' | 'cancelled'>('all');
  const [leadFilter, setLeadFilter] = useState<'all' | 'new' | 'replied' | 'closed'>('all');

  // Trigger brief toast
  const showToast = (message: string, type: 'success' | 'error' | 'info' = 'success') => {
    setToast({ message, type });
    setTimeout(() => setToast(null), 3000);
  };

  // Load everything
  const loadDashboardData = async () => {
    setLoading(true);
    try {
      const [prods, ords, lds, cnt] = await Promise.all([
        getProducts(),
        getOrders(),
        getLeads(),
        getSiteContent()
      ]);
      setProducts(prods);
      setOrders(ords);
      setLeads(lds);
      setSiteContent(cnt);
    } catch (err) {
      console.error(err);
      showToast('Error loading database tables.', 'error');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    // Check if user is already logged in on mock bypass
    const savedAuth = sessionStorage.getItem('mangobee_admin_logged');
    if (savedAuth === 'true') {
      setIsAuthenticated(true);
    }
    
    // Also check standard supabase auth session if configured
    if (isRealSupabase && supabase) {
      supabase.auth.getSession().then(({ data: { session } }) => {
        if (session) {
          setIsAuthenticated(true);
        }
      });
    }
  }, []);

  useEffect(() => {
    if (isAuthenticated) {
      loadDashboardData();
    }
  }, [isAuthenticated]);

  // Auth Handler
  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setAuthError('');
    setAuthLoading(true);

    // Bypass credentials for easy review
    if (authEmail === 'admin@mangobee.com' && authPassword === 'admin123') {
      sessionStorage.setItem('mangobee_admin_logged', 'true');
      setIsAuthenticated(true);
      setAuthLoading(false);
      showToast('Authenticated as Manager (Mock Mode)', 'success');
      return;
    }

    if (isRealSupabase && supabase) {
      try {
        const { data, error } = await supabase.auth.signInWithPassword({
          email: authEmail,
          password: authPassword,
        });
        if (error) throw error;
        if (data.user) {
          setIsAuthenticated(true);
          showToast('Successfully authenticated via Supabase!', 'success');
        }
      } catch (err: any) {
        setAuthError(err.message || 'Authentication failed. Please verify credentials.');
      } finally {
        setAuthLoading(false);
      }
    } else {
      setAuthError('To connect to live Supabase Auth, specify your credentials in settings. Otherwise, enter bypass: admin@mangobee.com / admin123');
      setAuthLoading(false);
    }
  };

  const handleLogout = async () => {
    if (isRealSupabase && supabase) {
      await supabase.auth.signOut();
    }
    sessionStorage.removeItem('mangobee_admin_logged');
    setIsAuthenticated(false);
    showToast('Signed out of Admin Dashboard', 'info');
  };

  // CSV Export for Orders
  const handleExportOrders = () => {
    if (orders.length === 0) {
      showToast('No orders to export', 'info');
      return;
    }

    const headers = ['Order ID', 'Date', 'Customer Name', 'Email', 'Phone', 'Address', 'Subtotal', 'Status', 'Pre-Order SKU'];
    const rows = orders.map(o => [
      o.id,
      new Date(o.created_at).toLocaleDateString(),
      o.customer_name,
      o.email,
      o.phone,
      `"${o.shipping_address.replace(/"/g, '""')}"`,
      o.subtotal.toFixed(2),
      o.status,
      o.pre_order_id
    ]);

    const csvContent = [headers.join(','), ...rows.map(r => r.join(','))].join('\n');
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.setAttribute('href', url);
    link.setAttribute('download', `mangobee_orders_${Date.now()}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    showToast('Orders exported successfully as CSV', 'success');
  };

  // Content Live Update
  const handleContentSave = async (key: string, value: string, section: SiteContent['section']) => {
    const success = await updateSiteContent(key, value, section);
    if (success) {
      showToast(`Key "${key}" updated successfully!`, 'success');
      loadDashboardData();
      if (onContentChange) onContentChange();
    } else {
      showToast('Failed to write content update', 'error');
    }
  };

  // Product Form Management
  const openProductModal = (product?: Product) => {
    if (product) {
      setEditingProduct(product);
      setProdId(product.id);
      setProdName(product.name);
      setProdCategory(product.category);
      setProdPrice(product.price);
      setProdStock(product.stock_quantity);
      setProdDesc(product.description);
      setProdVariants(product.variants?.join(', ') || '');
      setProdImageType(product.imageType || 'cable');
      setProdFeatures(product.features?.join('\n') || '');
      setProdSpecs(
        product.specs ? Object.entries(product.specs) : [['', '']]
      );
    } else {
      setEditingProduct(null);
      setProdId('prod-' + Math.random().toString(36).substr(2, 5));
      setProdName('');
      setProdCategory('Electronics');
      setProdPrice(19.99);
      setProdStock(50);
      setProdDesc('');
      setProdVariants('Default Finish');
      setProdImageType('cable');
      setProdFeatures('Aircraft-grade materials\nOvercurrent power control IC\nMil-grade stress-tested');
      setProdSpecs([['Material', 'Reinforced Polycarbonate'], ['Warranty', '1 Year Protection']]);
    }
    setProductFormOpen(true);
  };

  const handleProductSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!prodName || prodPrice <= 0) {
      showToast('Please enter a valid name and price.', 'error');
      return;
    }

    const specsObj: Record<string, string> = {};
    prodSpecs.forEach(([k, v]) => {
      if (k.trim() && v.trim()) specsObj[k.trim()] = v.trim();
    });

    const payload: Partial<Product> & { id: string } = {
      id: prodId,
      name: prodName,
      category: prodCategory,
      price: Number(prodPrice),
      stock_quantity: Number(prodStock),
      description: prodDesc,
      specs: specsObj,
      variants: prodVariants.split(',').map(s => s.trim()).filter(Boolean),
      imageType: prodImageType,
      badge: editingProduct?.badge || (prodStock < 10 ? 'Low Stock' : undefined),
      rating: editingProduct?.rating || 4.8,
      reviewCount: editingProduct?.reviewCount || 12,
      features: prodFeatures.split('\n').map(s => s.trim()).filter(Boolean),
      is_active: true,
    };

    try {
      await saveProduct(payload);
      showToast(editingProduct ? 'Product updated successfully!' : 'New product created!', 'success');
      setProductFormOpen(false);
      loadDashboardData();
    } catch (err) {
      showToast('Error writing product details', 'error');
    }
  };

  const handleDeleteProduct = async (id: string) => {
    if (confirm('Are you absolutely sure you want to delete this product?')) {
      await deleteProduct(id);
      showToast('Product deleted from active system', 'info');
      loadDashboardData();
    }
  };

  // Image Upload Simulate
  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setIsUploading(true);
    try {
      const publicUrl = await uploadProductImage(file);
      showToast('Mock Upload Successful', 'success');
      // Store publicUrl inside appropriate field or show user
    } catch (err) {
      showToast('Upload failed', 'error');
    } finally {
      setIsUploading(false);
    }
  };

  // Stats helper
  const stats = useMemo(() => {
    const totalSales = orders
      .filter(o => o.status !== 'cancelled')
      .reduce((sum, o) => sum + o.subtotal, 0);
    const activeProducts = products.filter(p => p.is_active).length;
    const pendingOrders = orders.filter(o => o.status === 'pending').length;
    const newLeads = leads.filter(l => l.status === 'new').length;

    return {
      totalSales,
      activeProducts,
      pendingOrders,
      newLeads,
    };
  }, [products, orders, leads]);

  // SQL Schema text for settings tab
  const sqlSchema = `-- Run this in your Supabase SQL Editor to bootstrap tables:

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
);`;

  return (
    <div className="fixed inset-0 z-50 bg-zinc-950/65 backdrop-blur-sm flex items-center justify-center p-0 md:p-4">
      {/* Toast */}
      {toast && (
        <div className={`fixed top-5 right-5 z-50 px-4 py-3 rounded-xl shadow-2xl flex items-center space-x-2 text-white font-semibold transition-all ${
          toast.type === 'success' ? 'bg-green-600' : toast.type === 'error' ? 'bg-red-600' : 'bg-zinc-800'
        }`}>
          {toast.type === 'success' ? <Check className="w-5 h-5" /> : <ShieldAlert className="w-5 h-5" />}
          <span>{toast.message}</span>
        </div>
      )}

      {!isAuthenticated ? (
        /* Login screen */
        <div className="bg-white w-full max-w-md p-8 rounded-3xl shadow-2xl border border-zinc-200 relative mx-4">
          <button 
            onClick={onClose}
            className="absolute top-4 right-4 p-2 text-zinc-400 hover:text-zinc-600 hover:bg-zinc-100 rounded-full"
          >
            <X className="w-5 h-5" />
          </button>

          <div className="text-center mb-8">
            <span className="text-xs font-black bg-orange-100 text-orange-600 px-3 py-1 rounded-full uppercase tracking-widest">
              Manager Panel
            </span>
            <h2 className="text-3xl font-black text-zinc-950 mt-3 tracking-tight">Mangobee Central</h2>
            <p className="text-xs text-zinc-500 mt-2">
              Sign in to manage inventory, track orders, live edit site text, and answer bulk lead requests.
            </p>
          </div>

          <form onSubmit={handleLogin} className="space-y-4">
            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-zinc-400 mb-1.5">Email Address</label>
              <input
                type="email"
                required
                value={authEmail}
                onChange={(e) => setAuthEmail(e.target.value)}
                placeholder="admin@mangobee.com"
                className="w-full bg-zinc-50 border border-zinc-200 px-4 py-3 rounded-xl focus:border-orange-500 outline-none focus:bg-white text-sm"
              />
            </div>

            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-zinc-400 mb-1.5">Secret Key Password</label>
              <input
                type="password"
                required
                value={authPassword}
                onChange={(e) => setAuthPassword(e.target.value)}
                placeholder="••••••••"
                className="w-full bg-zinc-50 border border-zinc-200 px-4 py-3 rounded-xl focus:border-orange-500 outline-none focus:bg-white text-sm"
              />
            </div>

            {authError && (
              <div className="p-3 bg-red-50 border border-red-200 rounded-xl text-xs text-red-600 leading-relaxed font-medium">
                {authError}
              </div>
            )}

            <button
              type="submit"
              disabled={authLoading}
              className="w-full bg-orange-500 hover:bg-orange-600 text-white font-extrabold py-3.5 rounded-xl text-sm transition-all shadow-lg shadow-orange-500/10 flex items-center justify-center space-x-2"
            >
              <Lock className="w-4 h-4" />
              <span>{authLoading ? 'Authenticating...' : 'Sign In To Panel'}</span>
            </button>
          </form>

          {/* Sandbox Bypass Note */}
          <div className="mt-6 pt-5 border-t border-zinc-100 text-center">
            <span className="text-[10px] uppercase font-bold text-zinc-400 tracking-wider">Interactive Test Login</span>
            <div className="bg-zinc-50 border border-dashed border-zinc-200 p-3 rounded-xl mt-2 text-left">
              <div className="flex justify-between text-xs">
                <span className="text-zinc-500">Email:</span>
                <span className="font-mono font-bold text-zinc-800 select-all">admin@mangobee.com</span>
              </div>
              <div className="flex justify-between text-xs mt-1">
                <span className="text-zinc-500">Password:</span>
                <span className="font-mono font-bold text-zinc-800 select-all">admin123</span>
              </div>
            </div>
            <p className="text-[10px] text-zinc-400 mt-2">
              Bypasses real database authentication during preview. Stored data is fully saved locally via persistent state engine!
            </p>
          </div>
        </div>
      ) : (
        /* Full Admin Panel Container */
        <div className="bg-zinc-50 w-full h-full md:max-w-7xl md:h-[90vh] md:rounded-3xl shadow-2xl flex flex-col overflow-hidden border border-zinc-200">
          
          {/* Header Row */}
          <header className="bg-white border-b border-zinc-200 px-6 py-4 flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <span className="font-black text-xl text-zinc-950 flex items-center space-x-1">
                <span className="bg-zinc-950 text-orange-500 p-1.5 rounded-lg mr-1.5 flex items-center">
                  <Database className="w-5 h-5" />
                </span>
                <span>MANGOBEE</span>
                <span className="text-orange-500 text-xs tracking-tight font-extrabold ml-1.5 uppercase bg-orange-100 px-2 py-0.5 rounded-md">
                  CENTRAL
                </span>
              </span>
            </div>

            <div className="flex items-center space-x-3">
              {/* Supabase Indicator */}
              <div className={`text-xs font-bold px-3 py-1.5 rounded-full flex items-center space-x-1.5 border ${
                isRealSupabase 
                  ? 'bg-green-50 text-green-700 border-green-200' 
                  : 'bg-amber-50 text-amber-700 border-amber-200'
              }`}>
                <span className={`w-2 h-2 rounded-full ${isRealSupabase ? 'bg-green-500' : 'bg-amber-500 animate-pulse'}`} />
                <span>{isRealSupabase ? 'Live Supabase API Active' : 'Persistent Sandbox Engine'}</span>
              </div>

              <button
                onClick={loadDashboardData}
                className="p-2 text-zinc-500 hover:text-zinc-800 bg-zinc-100 rounded-xl hover:bg-zinc-200 transition-colors"
                title="Force Reload Sync"
              >
                <RefreshCw className="w-4 h-4" />
              </button>

              <button
                onClick={handleLogout}
                className="bg-zinc-100 text-zinc-700 hover:bg-red-50 hover:text-red-600 px-3.5 py-2 rounded-xl text-xs font-bold flex items-center space-x-1.5 transition-colors"
              >
                <LogOut className="w-4 h-4" />
                <span className="hidden sm:inline">Logout</span>
              </button>

              <button
                onClick={onClose}
                className="bg-zinc-950 text-white hover:bg-orange-500 px-4 py-2 rounded-xl text-xs font-bold transition-colors"
              >
                Return to Shop
              </button>
            </div>
          </header>

          {/* Main Dashboard Layout Split */}
          <div className="flex-1 flex overflow-hidden">
            
            {/* Sidebar Columns */}
            <aside className="w-64 bg-white border-r border-zinc-200 p-4 hidden md:flex flex-col justify-between">
              <nav className="space-y-1.5">
                {[
                  { id: 'overview', label: 'Dashboard Overview', icon: TrendingUp },
                  { id: 'products', label: 'Products Inventory', icon: ShoppingBag },
                  { id: 'orders', label: 'Customer Orders', icon: FileText },
                  { id: 'leads', label: 'Corporate Leads', icon: Mail },
                  { id: 'content', label: 'Live Text overrides', icon: FileCode },
                  { id: 'settings', label: 'Supabase Settings', icon: Settings },
                ].map(item => {
                  const Icon = item.icon;
                  return (
                    <button
                      key={item.id}
                      onClick={() => setActiveTab(item.id as any)}
                      className={`w-full px-4 py-3 rounded-xl text-xs font-extrabold flex items-center space-x-3 transition-colors ${
                        activeTab === item.id 
                          ? 'bg-orange-500 text-white shadow-md shadow-orange-500/10' 
                          : 'text-zinc-600 hover:bg-zinc-100 hover:text-zinc-950'
                      }`}
                    >
                      <Icon className="w-4.5 h-4.5" />
                      <span>{item.label}</span>
                    </button>
                  );
                })}
              </nav>

              <div className="p-3 bg-zinc-50 border border-zinc-200 rounded-xl text-[10px] text-zinc-400">
                <span className="font-bold text-zinc-500 uppercase block">System Info</span>
                <span className="block mt-1">Workspace ID: 8bb3c794</span>
                <span className="block">Runtime: node-v20</span>
                <span className="block">Engine Version: v2.4.2</span>
              </div>
            </aside>

            {/* Content Area Column Scrollable */}
            <main className="flex-1 overflow-y-auto p-4 sm:p-6 lg:p-8">
              
              {/* Small responsive tab selector for mobile screens */}
              <div className="md:hidden grid grid-cols-3 gap-1 mb-4">
                {[
                  { id: 'overview', label: 'Stats' },
                  { id: 'products', label: 'Prods' },
                  { id: 'orders', label: 'Orders' },
                  { id: 'leads', label: 'Leads' },
                  { id: 'content', label: 'Text' },
                  { id: 'settings', label: 'Supa' },
                ].map(tab => (
                  <button
                    key={tab.id}
                    onClick={() => setActiveTab(tab.id as any)}
                    className={`py-2 text-[10px] font-black rounded-lg border text-center ${
                      activeTab === tab.id 
                        ? 'bg-orange-500 border-orange-500 text-white' 
                        : 'bg-white text-zinc-600 border-zinc-200'
                    }`}
                  >
                    {tab.label}
                  </button>
                ))}
              </div>

              {loading ? (
                <div className="h-64 flex flex-col items-center justify-center space-y-3">
                  <RefreshCw className="w-8 h-8 text-orange-500 animate-spin" />
                  <span className="text-xs font-bold text-zinc-500 uppercase">Synchronizing database tables...</span>
                </div>
              ) : (
                <>
                  {/* TAB 1: OVERVIEW */}
                  {activeTab === 'overview' && (
                    <div className="space-y-6 animate-fadeIn">
                      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                        <div>
                          <h1 className="text-2xl font-black text-zinc-950 tracking-tight">Overview Dashboard</h1>
                          <p className="text-xs text-zinc-500">Real-time stats synced directly with database schemas.</p>
                        </div>
                      </div>

                      {/* Stats grid */}
                      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
                        {[
                          { label: 'Total Revenue', value: `$${stats.totalSales.toFixed(2)}`, desc: 'Excludes cancelled orders', color: 'text-green-600 bg-green-50 border-green-100' },
                          { label: 'Sales Orders', value: orders.length, desc: `${stats.pendingOrders} awaiting fulfillment`, color: 'text-blue-600 bg-blue-50 border-blue-100' },
                          { label: 'Bulk Lead Inquiries', value: leads.length, desc: `${stats.newLeads} unresolved tickets`, color: 'text-amber-600 bg-amber-50 border-amber-100' },
                          { label: 'Active Inventory', value: stats.activeProducts, desc: 'Active items in stock', color: 'text-purple-600 bg-purple-50 border-purple-100' },
                        ].map((stat, i) => (
                          <div key={i} className="bg-white p-5 rounded-2xl border border-zinc-200">
                            <span className="text-[10px] uppercase font-bold text-zinc-400 tracking-wider block">{stat.label}</span>
                            <span className="text-2xl font-black text-zinc-950 block mt-1">{stat.value}</span>
                            <span className="text-[10px] text-zinc-500 block mt-1 font-medium">{stat.desc}</span>
                          </div>
                        ))}
                      </div>

                      {/* SVG Mini Charts Section */}
                      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
                        {/* Weekly Sales Chart */}
                        <div className="lg:col-span-8 bg-white p-6 rounded-3xl border border-zinc-200">
                          <span className="text-xs font-bold text-zinc-400 tracking-wider uppercase">Fulfillment and Orders Trend</span>
                          <h3 className="text-base font-black text-zinc-950 mt-1 mb-6">Recent Customer Traction</h3>
                          
                          {/* Simple CSS graph representing order dates */}
                          {orders.length === 0 ? (
                            <div className="h-48 border border-dashed border-zinc-100 rounded-xl flex items-center justify-center text-xs text-zinc-400">
                              Awaiting first order entry to chart traction
                            </div>
                          ) : (
                            <div className="h-48 flex items-end justify-between space-x-2 pt-4">
                              {orders.slice(0, 10).map((o, index) => {
                                const heightPercent = Math.min(100, Math.max(10, (o.subtotal / 120) * 100));
                                return (
                                  <div key={o.id} className="flex-1 flex flex-col items-center group relative cursor-pointer">
                                    {/* Tooltip */}
                                    <div className="absolute -top-12 bg-zinc-950 text-white text-[10px] px-2 py-1 rounded shadow-md opacity-0 group-hover:opacity-100 pointer-events-none transition-opacity font-bold whitespace-nowrap">
                                      {o.customer_name}: ${o.subtotal.toFixed(2)}
                                    </div>
                                    <div 
                                      className={`w-full rounded-t-lg transition-all duration-500 ${
                                        o.status === 'shipped' ? 'bg-green-500' : o.status === 'confirmed' ? 'bg-orange-500' : 'bg-zinc-400'
                                      }`}
                                      style={{ height: `${heightPercent}%` }}
                                    />
                                    <span className="text-[9px] text-zinc-400 font-bold mt-2 rotate-12 sm:rotate-0 block truncate max-w-[30px] sm:max-w-none">
                                      {o.id.split('-')[1] || o.id}
                                    </span>
                                  </div>
                                );
                              })}
                            </div>
                          )}
                        </div>

                        {/* Category Sales Share */}
                        <div className="lg:col-span-4 bg-white p-6 rounded-3xl border border-zinc-200 flex flex-col justify-between">
                          <div>
                            <span className="text-xs font-bold text-zinc-400 tracking-wider uppercase">Stock Analytics</span>
                            <h3 className="text-base font-black text-zinc-950 mt-1">Catalog Integrity</h3>
                          </div>

                          <div className="py-4 space-y-3">
                            {['Computers & Gaming', 'Charging & Accessories', 'Electronics', 'Audio Devices'].map((cat, i) => {
                              const count = products.filter(p => p.category === cat).length;
                              const total = products.length || 1;
                              const percent = Math.round((count / total) * 100);
                              return (
                                <div key={cat} className="space-y-1">
                                  <div className="flex justify-between text-xs font-bold text-zinc-700">
                                    <span>{cat}</span>
                                    <span>{percent}%</span>
                                  </div>
                                  <div className="w-full h-2 bg-zinc-100 rounded-full overflow-hidden">
                                    <div 
                                      className={`h-full rounded-full ${
                                        i === 0 ? 'bg-orange-500' : i === 1 ? 'bg-zinc-800' : i === 2 ? 'bg-indigo-500' : 'bg-green-500'
                                      }`}
                                      style={{ width: `${percent}%` }}
                                    />
                                  </div>
                                </div>
                              );
                            })}
                          </div>

                          <div className="text-[10px] text-zinc-400 leading-normal border-t border-zinc-100 pt-3">
                            Review custom desk configurator elements or upload photos to make inventories live.
                          </div>
                        </div>
                      </div>
                    </div>
                  )}

                  {/* TAB 2: PRODUCTS INVENTORY */}
                  {activeTab === 'products' && (
                    <div className="space-y-6 animate-fadeIn">
                      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                        <div>
                          <h1 className="text-2xl font-black text-zinc-950 tracking-tight">Active Inventory</h1>
                          <p className="text-xs text-zinc-500">Live stock items listed. Renders directly to storefront grid.</p>
                        </div>
                        <button
                          onClick={() => openProductModal()}
                          className="bg-orange-500 hover:bg-orange-600 text-white font-extrabold px-4 py-2.5 rounded-xl text-xs flex items-center space-x-1.5 transition-colors self-start sm:self-auto"
                        >
                          <Plus className="w-4 h-4" />
                          <span>Add New Product</span>
                        </button>
                      </div>

                      {/* Filter Search Input */}
                      <div className="bg-white p-4 rounded-2xl border border-zinc-200 flex items-center">
                        <input
                          type="text"
                          value={prodSearch}
                          onChange={(e) => setProdSearch(e.target.value)}
                          placeholder="Search database inventory by name or keywords..."
                          className="w-full bg-zinc-50 border border-zinc-200 px-4 py-2.5 rounded-xl text-xs focus:bg-white outline-none"
                        />
                      </div>

                      {/* Products list table */}
                      <div className="bg-white rounded-2xl border border-zinc-200 overflow-hidden">
                        <div className="overflow-x-auto">
                          <table className="w-full text-left text-xs text-zinc-500">
                            <thead className="text-[10px] uppercase tracking-wider text-zinc-400 bg-zinc-50 border-b border-zinc-200 font-extrabold">
                              <tr>
                                <th className="px-6 py-4">ID / Graphic</th>
                                <th className="px-6 py-4">Product Details</th>
                                <th className="px-6 py-4">Category</th>
                                <th className="px-6 py-4">Price</th>
                                <th className="px-6 py-4">Stock Status</th>
                                <th className="px-6 py-4 text-right">Actions</th>
                              </tr>
                            </thead>
                            <tbody className="divide-y divide-zinc-100 font-medium text-zinc-800">
                              {products
                                .filter(p => p.name.toLowerCase().includes(prodSearch.toLowerCase()))
                                .map(p => (
                                  <tr key={p.id} className="hover:bg-zinc-50/50">
                                    <td className="px-6 py-4">
                                      <div className="flex items-center space-x-3">
                                        <span className="font-mono text-[10px] text-zinc-400 bg-zinc-100 px-1.5 py-1 rounded">
                                          {p.id}
                                        </span>
                                        <div className="w-10 h-10 bg-zinc-100 rounded-lg flex items-center justify-center text-orange-500 font-bold uppercase text-[10px]">
                                          {p.imageType}
                                        </div>
                                      </div>
                                    </td>
                                    <td className="px-6 py-4">
                                      <span className="font-extrabold text-zinc-950 block">{p.name}</span>
                                      <span className="text-[10px] text-zinc-400 block line-clamp-1 mt-0.5">{p.description}</span>
                                    </td>
                                    <td className="px-6 py-4">
                                      <span className="bg-zinc-100 text-zinc-700 px-2 py-0.5 rounded text-[10px] font-bold">
                                        {p.category}
                                      </span>
                                    </td>
                                    <td className="px-6 py-4">
                                      <span className="font-black text-zinc-950">${p.price.toFixed(2)}</span>
                                    </td>
                                    <td className="px-6 py-4">
                                      <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${
                                        p.stock_quantity === 0 
                                          ? 'bg-red-100 text-red-800' 
                                          : p.stock_quantity < 10 
                                            ? 'bg-amber-100 text-amber-800' 
                                            : 'bg-green-100 text-green-800'
                                      }`}>
                                        {p.stock_quantity} units
                                      </span>
                                    </td>
                                    <td className="px-6 py-4 text-right">
                                      <div className="flex items-center justify-end space-x-2">
                                        <button
                                          onClick={() => openProductModal(p)}
                                          className="p-1.5 hover:bg-zinc-100 text-zinc-600 rounded hover:text-zinc-900"
                                          title="Edit details"
                                        >
                                          <Edit2 className="w-3.5 h-3.5" />
                                        </button>
                                        <button
                                          onClick={() => handleDeleteProduct(p.id)}
                                          className="p-1.5 hover:bg-red-50 text-red-500 rounded"
                                          title="Delete Product"
                                        >
                                          <Trash2 className="w-3.5 h-3.5" />
                                        </button>
                                      </div>
                                    </td>
                                  </tr>
                                ))}
                            </tbody>
                          </table>
                        </div>
                      </div>
                    </div>
                  )}

                  {/* TAB 3: CUSTOMER ORDERS */}
                  {activeTab === 'orders' && (
                    <div className="space-y-6 animate-fadeIn">
                      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                        <div>
                          <h1 className="text-2xl font-black text-zinc-950 tracking-tight">Sales Orders</h1>
                          <p className="text-xs text-zinc-500">Track and fulfill client reservations instantly.</p>
                        </div>
                        <div className="flex space-x-2">
                          <button
                            onClick={handleExportOrders}
                            className="bg-white border border-zinc-200 text-zinc-700 hover:bg-zinc-50 font-bold px-4 py-2.5 rounded-xl text-xs flex items-center space-x-1.5 transition-colors shadow-sm"
                          >
                            <Download className="w-4 h-4" />
                            <span>Export CSV</span>
                          </button>
                        </div>
                      </div>

                      {/* Orders table */}
                      <div className="bg-white rounded-2xl border border-zinc-200 overflow-hidden">
                        <div className="p-4 border-b border-zinc-200 bg-zinc-50/50 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                          <span className="text-xs font-bold text-zinc-400 uppercase tracking-widest">Order Processing Log</span>
                          
                          {/* Filter switches */}
                          <div className="flex space-x-1.5">
                            {['all', 'pending', 'confirmed', 'shipped', 'cancelled'].map(st => (
                              <button
                                key={st}
                                onClick={() => setOrderFilter(st as any)}
                                className={`px-2.5 py-1 text-[10px] font-black rounded-lg uppercase tracking-wide border transition-colors ${
                                  orderFilter === st 
                                    ? 'bg-zinc-950 border-zinc-950 text-white' 
                                    : 'bg-white hover:bg-zinc-100 text-zinc-600 border-zinc-200'
                                }`}
                              >
                                {st}
                              </button>
                            ))}
                          </div>
                        </div>

                        <div className="overflow-x-auto">
                          <table className="w-full text-left text-xs text-zinc-500">
                            <thead className="text-[10px] uppercase tracking-wider text-zinc-400 bg-zinc-50 border-b border-zinc-200 font-extrabold">
                              <tr>
                                <th className="px-6 py-4">Order ID</th>
                                <th className="px-6 py-4">Client</th>
                                <th className="px-6 py-4">Items / Qty</th>
                                <th className="px-6 py-4">Revenue</th>
                                <th className="px-6 py-4">Tracking Key</th>
                                <th className="px-6 py-4">Status</th>
                                <th className="px-6 py-4 text-right">Fulfillment</th>
                              </tr>
                            </thead>
                            <tbody className="divide-y divide-zinc-100 font-medium text-zinc-800">
                              {orders
                                .filter(o => orderFilter === 'all' || o.status === orderFilter)
                                .map(o => (
                                  <tr key={o.id} className="hover:bg-zinc-50/50">
                                    <td className="px-6 py-4">
                                      <span className="font-mono font-bold text-zinc-800 bg-zinc-100 px-2 py-1 rounded">
                                        {o.id}
                                      </span>
                                    </td>
                                    <td className="px-6 py-4">
                                      <span className="font-extrabold text-zinc-950 block">{o.customer_name}</span>
                                      <span className="text-[10px] text-zinc-400 block">{o.email}</span>
                                    </td>
                                    <td className="px-6 py-4">
                                      <div className="space-y-0.5">
                                        {(o.items || []).map((item, index) => (
                                          <span key={index} className="block text-[10px] text-zinc-600">
                                            {item.product_name} ({item.variant}) <strong className="text-zinc-900">x{item.qty}</strong>
                                          </span>
                                        ))}
                                      </div>
                                    </td>
                                    <td className="px-6 py-4">
                                      <span className="font-black text-zinc-950">${o.subtotal.toFixed(2)}</span>
                                    </td>
                                    <td className="px-6 py-4">
                                      <span className="font-mono text-[10px] text-zinc-400">{o.pre_order_id}</span>
                                    </td>
                                    <td className="px-6 py-4">
                                      <span className={`px-2 py-0.5 rounded text-[10px] font-black uppercase tracking-wide ${
                                        o.status === 'shipped' 
                                          ? 'bg-green-100 text-green-800' 
                                          : o.status === 'confirmed' 
                                            ? 'bg-orange-100 text-orange-800' 
                                            : o.status === 'cancelled' 
                                              ? 'bg-zinc-100 text-zinc-400' 
                                              : 'bg-amber-100 text-amber-800'
                                      }`}>
                                        {o.status}
                                      </span>
                                    </td>
                                    <td className="px-6 py-4 text-right">
                                      <div className="flex items-center justify-end space-x-1">
                                        <select
                                          value={o.status}
                                          onChange={async (e) => {
                                            await updateOrderStatus(o.id, e.target.value as any);
                                            showToast(`Status updated to ${e.target.value}`, 'info');
                                            loadDashboardData();
                                          }}
                                          className="bg-zinc-100 border border-zinc-200 rounded px-2 py-1 text-[10px] font-bold outline-none"
                                        >
                                          <option value="pending">Pending</option>
                                          <option value="confirmed">Confirmed</option>
                                          <option value="shipped">Shipped</option>
                                          <option value="cancelled">Cancelled</option>
                                        </select>
                                        <button
                                          onClick={() => setSelectedOrder(o)}
                                          className="p-1 hover:bg-zinc-100 text-zinc-600 rounded"
                                          title="Inspect Address Details"
                                        >
                                          <Eye className="w-4 h-4" />
                                        </button>
                                      </div>
                                    </td>
                                  </tr>
                                ))}
                            </tbody>
                          </table>
                        </div>
                      </div>
                    </div>
                  )}

                  {/* TAB 4: CORPORATE LEADS */}
                  {activeTab === 'leads' && (
                    <div className="space-y-6 animate-fadeIn">
                      <div>
                        <h1 className="text-2xl font-black text-zinc-950 tracking-tight">Corporate Leads Box</h1>
                        <p className="text-xs text-zinc-500">Respond to commercial bulk order requests and customer support queries.</p>
                      </div>

                      {/* Leads inbox log */}
                      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
                        {/* Leads List Left */}
                        <div className="lg:col-span-5 bg-white border border-zinc-200 rounded-2xl overflow-hidden flex flex-col">
                          <div className="p-4 border-b border-zinc-200 bg-zinc-50 flex items-center justify-between">
                            <span className="text-xs font-bold text-zinc-400 uppercase tracking-widest">Inbox Queue</span>
                            <select
                              value={leadFilter}
                              onChange={(e) => setLeadFilter(e.target.value as any)}
                              className="bg-white border border-zinc-200 rounded px-2 py-1 text-[10px] font-bold"
                            >
                              <option value="all">All statuses</option>
                              <option value="new">New only</option>
                              <option value="replied">Replied</option>
                              <option value="closed">Closed</option>
                            </select>
                          </div>

                          <div className="divide-y divide-zinc-100 max-h-[500px] overflow-y-auto">
                            {leads
                              .filter(l => leadFilter === 'all' || l.status === leadFilter)
                              .map(l => (
                                <div
                                  key={l.id}
                                  onClick={() => { setSelectedLead(l); setLeadReplyText(''); }}
                                  className={`p-4 cursor-pointer hover:bg-zinc-50/50 transition-colors ${
                                    selectedLead?.id === l.id ? 'bg-orange-50/40 border-l-4 border-l-orange-500' : ''
                                  }`}
                                >
                                  <div className="flex justify-between items-start">
                                    <h4 className="font-bold text-xs text-zinc-900 truncate max-w-[150px]">{l.name}</h4>
                                    <span className="text-[9px] text-zinc-400 font-bold">
                                      {new Date(l.created_at).toLocaleDateString()}
                                    </span>
                                  </div>
                                  <span className="text-[10px] font-bold text-orange-600 block mt-1 truncate">{l.topic}</span>
                                  <p className="text-[11px] text-zinc-500 mt-1 line-clamp-2 leading-relaxed">{l.message}</p>
                                  
                                  <div className="mt-2 flex items-center justify-between">
                                    <span className="text-[9px] text-zinc-400 font-mono">#{l.id}</span>
                                    <span className={`px-1.5 py-0.5 rounded text-[8px] font-black uppercase tracking-widest ${
                                      l.status === 'replied' 
                                        ? 'bg-blue-100 text-blue-800' 
                                        : l.status === 'closed' 
                                          ? 'bg-zinc-100 text-zinc-500' 
                                          : 'bg-amber-100 text-amber-800'
                                    }`}>
                                      {l.status}
                                    </span>
                                  </div>
                                </div>
                              ))}
                          </div>
                        </div>

                        {/* Selected Lead Details Panel Right */}
                        <div className="lg:col-span-7 bg-white border border-zinc-200 rounded-2xl p-6 flex flex-col justify-between">
                          {selectedLead ? (
                            <div className="space-y-6 flex-1 flex flex-col justify-between">
                              <div className="space-y-4">
                                <div className="flex justify-between items-start border-b border-zinc-100 pb-4">
                                  <div>
                                    <span className="text-[10px] text-orange-600 font-bold uppercase tracking-widest block">{selectedLead.topic}</span>
                                    <h2 className="text-lg font-black text-zinc-950 mt-1">{selectedLead.name}</h2>
                                    <a href={`mailto:${selectedLead.email}`} className="text-xs text-zinc-400 hover:text-orange-500 font-medium underline mt-0.5 block">
                                      {selectedLead.email}
                                    </a>
                                  </div>

                                  <div className="flex space-x-1">
                                    <button
                                      onClick={async () => {
                                        await updateLeadStatus(selectedLead.id, 'replied');
                                        showToast('Lead marked as Replied', 'info');
                                        setSelectedLead({ ...selectedLead, status: 'replied' });
                                        loadDashboardData();
                                      }}
                                      className="px-2.5 py-1 text-[10px] font-bold bg-blue-50 text-blue-700 hover:bg-blue-100 rounded-lg transition-colors border border-blue-100"
                                    >
                                      Mark Replied
                                    </button>
                                    <button
                                      onClick={async () => {
                                        await updateLeadStatus(selectedLead.id, 'closed');
                                        showToast('Lead marked as Closed', 'info');
                                        setSelectedLead({ ...selectedLead, status: 'closed' });
                                        loadDashboardData();
                                      }}
                                      className="px-2.5 py-1 text-[10px] font-bold bg-zinc-100 text-zinc-700 hover:bg-zinc-200 rounded-lg transition-colors border border-zinc-200"
                                    >
                                      Mark Closed
                                    </button>
                                  </div>
                                </div>

                                <div className="space-y-2">
                                  <span className="text-[10px] uppercase font-bold text-zinc-400 tracking-wider">Client Message Details</span>
                                  <div className="bg-zinc-50 p-4 rounded-xl border border-zinc-200 text-xs text-zinc-700 leading-relaxed italic whitespace-pre-wrap">
                                    &quot;{selectedLead.message}&quot;
                                  </div>
                                </div>
                              </div>

                              {/* Simple Responder Form */}
                              <div className="mt-6 border-t border-zinc-100 pt-4 space-y-3">
                                <label className="block text-xs font-bold uppercase tracking-wider text-zinc-400">Quick Draft Assistant Reply</label>
                                <textarea
                                  rows={4}
                                  value={leadReplyText}
                                  onChange={(e) => setLeadReplyText(e.target.value)}
                                  placeholder={`Hi ${selectedLead.name.split(' ')[0]},\n\nThank you for reaching out to Mangobee! We'd be happy to support your inquiry regarding "${selectedLead.topic}"...`}
                                  className="w-full bg-zinc-50 border border-zinc-200 text-xs px-3 py-2 rounded-xl focus:bg-white outline-none resize-none"
                                />
                                <div className="flex justify-between items-center">
                                  <span className="text-[10px] text-zinc-400">Prepares carrier draft. Logs response to customer ticket automatically.</span>
                                  <button
                                    onClick={async () => {
                                      if (!leadReplyText.trim()) {
                                        showToast('Write a quick message first!', 'error');
                                        return;
                                      }
                                      await updateLeadStatus(selectedLead.id, 'replied');
                                      showToast('Inquiry response submitted successfully!', 'success');
                                      setLeadReplyText('');
                                      setSelectedLead({ ...selectedLead, status: 'replied' });
                                      loadDashboardData();
                                    }}
                                    className="bg-zinc-950 hover:bg-orange-500 text-white font-extrabold px-4 py-2 rounded-xl text-xs flex items-center space-x-1 transition-colors"
                                  >
                                    <Check className="w-3.5 h-3.5" />
                                    <span>Send Ticket Response</span>
                                  </button>
                                </div>
                              </div>
                            </div>
                          ) : (
                            <div className="h-full flex flex-col items-center justify-center text-center p-8 text-zinc-400">
                              <Mail className="w-12 h-12 text-zinc-300 mb-2" />
                              <span className="text-xs font-bold uppercase tracking-wider">No lead selected</span>
                              <p className="text-[11px] max-w-xs mt-1">
                                Select any commercial inquiry from the queue sidebar to review message logs or write replies.
                              </p>
                            </div>
                          )}
                        </div>
                      </div>
                    </div>
                  )}

                  {/* TAB 5: SITE CONTENT OVERRIDES */}
                  {activeTab === 'content' && (
                    <div className="space-y-6 animate-fadeIn">
                      <div>
                        <h1 className="text-2xl font-black text-zinc-950 tracking-tight">Live Content Customizer</h1>
                        <p className="text-xs text-zinc-500">Edit storefront text overrides live in real-time. Changes sync instantly.</p>
                      </div>

                      {/* Content editor fields */}
                      <div className="bg-white rounded-2xl border border-zinc-200 overflow-hidden divide-y divide-zinc-100">
                        {[
                          { key: 'hero_headline', label: 'Storefront Hero Headline', desc: 'Main eye-catching headline displayed on the landing hero section', section: 'hero' },
                          { key: 'hero_subheadline', label: 'Storefront Hero Sub-Headline', desc: 'Subtext paragraph displayed under the primary storefront headline', section: 'hero' },
                          { key: 'about_headline', label: 'About Segment Highlight', desc: 'Bold title introducing our material choice standards', section: 'about' },
                          { key: 'about_text', label: 'About Segment Long Text', desc: 'Detailed narrative block expanding the Mangobee core values', section: 'about' },
                          { key: 'cta_headline', label: 'Footer Call To Action Title', desc: 'Banner headline persuading customers to explore setup bundles', section: 'cta' },
                          { key: 'cta_subheadline', label: 'Footer Call To Action Subtitle', desc: 'Subtext detailing package promo discounts (e.g. up to 15%)', section: 'cta' },
                        ].map(field => {
                          const dbVal = siteContent.find(c => c.key === field.key)?.value || '';
                          return (
                            <div key={field.key} className="p-6">
                              <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
                                <div className="lg:col-span-4">
                                  <label className="block text-xs font-extrabold text-zinc-900 uppercase tracking-wider">{field.label}</label>
                                  <span className="text-[10px] text-zinc-400 block mt-1 leading-normal">{field.desc}</span>
                                  <span className="font-mono text-[9px] text-zinc-400 block mt-2">DB Key: {field.key}</span>
                                </div>
                                <div className="lg:col-span-8 flex space-x-3 items-end">
                                  <textarea
                                    id={`input-${field.key}`}
                                    defaultValue={dbVal}
                                    rows={field.key.includes('text') || field.key.includes('subheadline') ? 4 : 2}
                                    className="flex-1 bg-zinc-50 border border-zinc-200 rounded-xl px-4 py-3 text-xs focus:bg-white outline-none font-medium text-zinc-800"
                                  />
                                  <button
                                    onClick={() => {
                                      const inputEl = document.getElementById(`input-${field.key}`) as HTMLTextAreaElement;
                                      if (inputEl) {
                                        handleContentSave(field.key, inputEl.value, field.section as any);
                                      }
                                    }}
                                    className="bg-zinc-950 hover:bg-orange-500 text-white font-extrabold px-4 py-2.5 rounded-xl text-xs transition-colors shrink-0 flex items-center space-x-1.5"
                                  >
                                    <Check className="w-3.5 h-3.5" />
                                    <span>Sync</span>
                                  </button>
                                </div>
                              </div>
                            </div>
                          );
                        })}
                      </div>
                    </div>
                  )}

                  {/* TAB 6: SUPABASE SETTINGS */}
                  {activeTab === 'settings' && (
                    <div className="space-y-6 animate-fadeIn">
                      <div>
                        <h1 className="text-2xl font-black text-zinc-950 tracking-tight">Supabase Connection Settings</h1>
                        <p className="text-xs text-zinc-500">Attach your active cloud database credentials to configure live syncing.</p>
                      </div>

                      {/* Connection Details */}
                      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
                        
                        {/* Connection Inputs Left */}
                        <div className="lg:col-span-5 bg-white p-6 rounded-3xl border border-zinc-200 space-y-4">
                          <span className="text-xs font-bold text-zinc-400 tracking-wider uppercase">Live Connection Client</span>
                          
                          <div className="space-y-3 pt-2">
                            <div>
                              <label className="block text-[10px] font-bold text-zinc-500 uppercase tracking-wider mb-1">Supabase URL</label>
                              <input
                                type="text"
                                value={customUrl}
                                onChange={(e) => setCustomUrl(e.target.value)}
                                placeholder="https://abc.supabase.co"
                                className="w-full bg-zinc-50 border border-zinc-200 px-3 py-2 rounded-lg text-xs font-mono outline-none focus:bg-white focus:border-orange-500"
                              />
                            </div>

                            <div>
                              <label className="block text-[10px] font-bold text-zinc-500 uppercase tracking-wider mb-1">Anon Public Key</label>
                              <input
                                type="password"
                                value={customKey}
                                onChange={(e) => setCustomKey(e.target.value)}
                                placeholder="eyJhbGciOiJIUzI1NiIsIn..."
                                className="w-full bg-zinc-50 border border-zinc-200 px-3 py-2 rounded-lg text-xs font-mono outline-none focus:bg-white focus:border-orange-500"
                              />
                            </div>
                          </div>

                          <div className="flex space-x-2 pt-2">
                            <button
                              onClick={() => {
                                saveSupabaseCredentials(customUrl, customKey);
                                showToast('Credentials configured! Reloading...', 'success');
                              }}
                              className="flex-1 bg-orange-500 hover:bg-orange-600 text-white font-extrabold py-2.5 rounded-xl text-xs transition-colors text-center"
                            >
                              Save & Connect Client
                            </button>
                            <button
                              onClick={() => {
                                saveSupabaseCredentials('', '');
                                setCustomUrl('');
                                setCustomKey('');
                                showToast('Restored local sandbox bypass.', 'info');
                              }}
                              className="px-3 bg-zinc-100 hover:bg-zinc-200 text-zinc-700 font-bold py-2.5 rounded-xl text-xs transition-colors"
                              title="Clear Credentials"
                            >
                              Disconnect
                            </button>
                          </div>

                          <div className="bg-zinc-50 p-3 rounded-xl border border-zinc-200 text-[10px] text-zinc-500 leading-normal">
                            Note: Once specified, the credentials are encrypted and stored inside your sandbox browser cache. You can also define them via <code className="font-bold">.env</code> keys to load them for all visiting clients.
                          </div>
                        </div>

                        {/* SQL Schema helper Right */}
                        <div className="lg:col-span-7 bg-white p-6 rounded-3xl border border-zinc-200 space-y-4">
                          <div className="flex justify-between items-center">
                            <span className="text-xs font-bold text-zinc-400 tracking-wider uppercase flex items-center space-x-1.5">
                              <Database className="w-4 h-4 text-orange-500" />
                              <span>SQL Blueprint Copier</span>
                            </span>
                            <button
                              onClick={() => {
                                navigator.clipboard.writeText(sqlSchema);
                                showToast('SQL blueprint copied to clipboard!', 'success');
                              }}
                              className="text-[10px] font-bold text-orange-500 hover:text-orange-600 uppercase tracking-widest flex items-center space-x-1"
                            >
                              <span>Copy Code</span>
                            </button>
                          </div>

                          <p className="text-xs text-zinc-500">
                            Create the necessary tables in your Supabase project with one click. Simply paste this block into the Supabase SQL editor:
                          </p>

                          <pre className="bg-zinc-900 text-zinc-300 p-4 rounded-xl text-[10px] font-mono leading-relaxed overflow-x-auto max-h-[250px]">
                            {sqlSchema}
                          </pre>
                        </div>

                      </div>
                    </div>
                  )}

                </>
              )}

            </main>

          </div>

          {/* Active Product Form Dialog Modal */}
          {productFormOpen && (
            <div className="fixed inset-0 z-50 bg-zinc-950/40 backdrop-blur-xs flex items-center justify-center p-4">
              <div className="bg-white rounded-3xl max-w-lg w-full max-h-[85vh] overflow-y-auto p-6 shadow-2xl relative border border-zinc-100 space-y-6">
                <div className="flex justify-between items-center border-b border-zinc-100 pb-3">
                  <h3 className="font-black text-lg text-zinc-950">
                    {editingProduct ? 'Modify Product Details' : 'Catalog New Product'}
                  </h3>
                  <button 
                    onClick={() => setProductFormOpen(false)}
                    className="p-1.5 text-zinc-400 hover:text-zinc-600 hover:bg-zinc-100 rounded-full"
                  >
                    <X className="w-5 h-5" />
                  </button>
                </div>

                <form onSubmit={handleProductSubmit} className="space-y-4 text-xs font-medium">
                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <label className="block text-[10px] uppercase font-bold text-zinc-400 mb-1">Product ID / SKU</label>
                      <input
                        type="text"
                        required
                        disabled={!!editingProduct}
                        value={prodId}
                        onChange={(e) => setProdId(e.target.value)}
                        placeholder="kb-combo"
                        className="w-full bg-zinc-50 border border-zinc-200 px-3 py-2 rounded-lg outline-none text-zinc-700 disabled:bg-zinc-100"
                      />
                    </div>
                    <div>
                      <label className="block text-[10px] uppercase font-bold text-zinc-400 mb-1">Product Name</label>
                      <input
                        type="text"
                        required
                        value={prodName}
                        onChange={(e) => setProdName(e.target.value)}
                        placeholder="Modern Mechanical Keyboard"
                        className="w-full bg-zinc-50 border border-zinc-200 px-3 py-2 rounded-lg outline-none"
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-3 gap-3">
                    <div>
                      <label className="block text-[10px] uppercase font-bold text-zinc-400 mb-1">Category</label>
                      <select
                        value={prodCategory}
                        onChange={(e) => setProdCategory(e.target.value)}
                        className="w-full bg-zinc-50 border border-zinc-200 px-3 py-2 rounded-lg outline-none"
                      >
                        <option>Electronics</option>
                        <option>Charging & Accessories</option>
                        <option>Home & Kitchen</option>
                        <option>Audio Devices</option>
                        <option>Computers & Gaming</option>
                        <option>Self-Care</option>
                        <option>Outdoor & Camping</option>
                      </select>
                    </div>
                    <div>
                      <label className="block text-[10px] uppercase font-bold text-zinc-400 mb-1">Retail Price ($)</label>
                      <input
                        type="number"
                        step="0.01"
                        required
                        value={prodPrice}
                        onChange={(e) => setProdPrice(Number(e.target.value))}
                        className="w-full bg-zinc-50 border border-zinc-200 px-3 py-2 rounded-lg outline-none"
                      />
                    </div>
                    <div>
                      <label className="block text-[10px] uppercase font-bold text-zinc-400 mb-1">Stock Quantity</label>
                      <input
                        type="number"
                        required
                        value={prodStock}
                        onChange={(e) => setProdStock(Number(e.target.value))}
                        className="w-full bg-zinc-50 border border-zinc-200 px-3 py-2 rounded-lg outline-none"
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <label className="block text-[10px] uppercase font-bold text-zinc-400 mb-1">Simulated SVG Icon Renders</label>
                      <select
                        value={prodImageType}
                        onChange={(e) => setProdImageType(e.target.value as any)}
                        className="w-full bg-zinc-50 border border-zinc-200 px-3 py-2 rounded-lg outline-none"
                      >
                        <option value="cable">USB-C Fast Cable</option>
                        <option value="stand">Aluminum Desk Stand</option>
                        <option value="keyboard">Keyboard & Mouse Combo</option>
                        <option value="case">Shockproof Case</option>
                        <option value="holder">Car Magnetic Vent Holder</option>
                        <option value="earphones">Wired In-Ear Earphones</option>
                        <option value="hub">USB Multiport Hub</option>
                        <option value="light">USB LED Ring Light</option>
                      </select>
                    </div>

                    <div>
                      <label className="block text-[10px] uppercase font-bold text-zinc-400 mb-1">Photo Upload (Supabase storage)</label>
                      <div className="relative flex items-center">
                        <input
                          type="file"
                          accept="image/*"
                          onChange={handleImageUpload}
                          className="absolute inset-0 opacity-0 cursor-pointer w-full h-full"
                          disabled={isUploading}
                        />
                        <div className="w-full bg-zinc-50 border border-zinc-200 border-dashed px-3 py-2 rounded-lg text-center flex items-center justify-center space-x-1 hover:bg-zinc-100 transition-colors">
                          <Upload className="w-3.5 h-3.5 text-zinc-400" />
                          <span>{isUploading ? 'Uploading...' : 'Browse Image File'}</span>
                        </div>
                      </div>
                    </div>
                  </div>

                  <div>
                    <label className="block text-[10px] uppercase font-bold text-zinc-400 mb-1">Short Catalog Description</label>
                    <textarea
                      required
                      rows={2}
                      value={prodDesc}
                      onChange={(e) => setProdDesc(e.target.value)}
                      placeholder="Enter a brief, eye-catching sales line..."
                      className="w-full bg-zinc-50 border border-zinc-200 px-3 py-2 rounded-lg outline-none resize-none"
                    />
                  </div>

                  <div>
                    <label className="block text-[10px] uppercase font-bold text-zinc-400 mb-1">Product Variants (Comma-Separated options)</label>
                    <input
                      type="text"
                      value={prodVariants}
                      onChange={(e) => setProdVariants(e.target.value)}
                      placeholder="Mango Orange, Slate Black, Stealth White"
                      className="w-full bg-zinc-50 border border-zinc-200 px-3 py-2 rounded-lg outline-none"
                    />
                  </div>

                  <div>
                    <label className="block text-[10px] uppercase font-bold text-zinc-400 mb-1">Catalog Feature Bullet Highlights (One per line)</label>
                    <textarea
                      rows={3}
                      value={prodFeatures}
                      onChange={(e) => setProdFeatures(e.target.value)}
                      className="w-full bg-zinc-50 border border-zinc-200 px-3 py-2 rounded-lg outline-none resize-none font-mono text-[10px]"
                    />
                  </div>

                  {/* Specifications builder */}
                  <div>
                    <div className="flex justify-between items-center mb-1">
                      <label className="text-[10px] uppercase font-bold text-zinc-400">Technical Specifications</label>
                      <button
                        type="button"
                        onClick={() => setProdSpecs([...prodSpecs, ['', '']])}
                        className="text-[10px] text-orange-500 hover:text-orange-600 font-extrabold flex items-center"
                      >
                        <Plus className="w-3 h-3 mr-0.5" /> Add Row
                      </button>
                    </div>
                    <div className="space-y-1.5 max-h-[120px] overflow-y-auto pr-1">
                      {prodSpecs.map(([k, v], idx) => (
                        <div key={idx} className="flex space-x-1.5 items-center">
                          <input
                            type="text"
                            placeholder="Specification Key (e.g. Length)"
                            value={k}
                            onChange={(e) => {
                              const copy = [...prodSpecs];
                              copy[idx][0] = e.target.value;
                              setProdSpecs(copy);
                            }}
                            className="flex-1 bg-zinc-50 border border-zinc-200 px-3 py-1.5 rounded-lg outline-none"
                          />
                          <input
                            type="text"
                            placeholder="Value (e.g. 1.8 Meters)"
                            value={v}
                            onChange={(e) => {
                              const copy = [...prodSpecs];
                              copy[idx][1] = e.target.value;
                              setProdSpecs(copy);
                            }}
                            className="flex-1 bg-zinc-50 border border-zinc-200 px-3 py-1.5 rounded-lg outline-none"
                          />
                          <button
                            type="button"
                            onClick={() => setProdSpecs(prodSpecs.filter((_, i) => i !== idx))}
                            className="text-red-500 hover:bg-red-50 p-1.5 rounded"
                          >
                            <X className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      ))}
                    </div>
                  </div>

                  <button
                    type="submit"
                    className="w-full bg-zinc-950 hover:bg-orange-500 hover:text-white text-white font-extrabold py-3 rounded-xl transition-all"
                  >
                    {editingProduct ? 'Apply Updated Inventory Details' : 'Commit New Catalog Item'}
                  </button>
                </form>
              </div>
            </div>
          )}

          {/* Inspect Order Dialog Modal */}
          {selectedOrder && (
            <div className="fixed inset-0 z-50 bg-zinc-950/40 backdrop-blur-xs flex items-center justify-center p-4">
              <div className="bg-white rounded-3xl max-w-md w-full p-6 shadow-2xl relative border border-zinc-100 space-y-4">
                <div className="flex justify-between items-center border-b border-zinc-100 pb-3">
                  <div>
                    <span className="text-[10px] text-zinc-400 font-bold uppercase">Order Inspection</span>
                    <h3 className="font-black text-base text-zinc-950">ID #{selectedOrder.id}</h3>
                  </div>
                  <button 
                    onClick={() => setSelectedOrder(null)}
                    className="p-1.5 text-zinc-400 hover:text-zinc-600 hover:bg-zinc-100 rounded-full"
                  >
                    <X className="w-5 h-5" />
                  </button>
                </div>

                <div className="space-y-3 text-xs font-semibold text-zinc-700">
                  <div className="bg-zinc-50 p-3 rounded-xl border border-zinc-200 space-y-1.5">
                    <span className="text-[10px] text-zinc-400 uppercase font-bold block">Delivery Recipient</span>
                    <div className="text-zinc-900 font-extrabold">{selectedOrder.customer_name}</div>
                    <div>Email: {selectedOrder.email}</div>
                    <div>Phone: {selectedOrder.phone || 'None provided'}</div>
                    <div className="pt-1.5 border-t border-zinc-200 mt-1.5 text-zinc-800 font-medium">
                      Address: <span className="font-bold">{selectedOrder.shipping_address}</span>
                    </div>
                  </div>

                  <div className="space-y-1.5">
                    <span className="text-[10px] text-zinc-400 uppercase font-bold block">Ordered Cart Items</span>
                    {selectedOrder.items.map((item, idx) => (
                      <div key={idx} className="flex justify-between items-center border-b border-zinc-50 pb-1.5">
                        <div>
                          <div className="font-extrabold text-zinc-900">{item.product_name}</div>
                          <div className="text-[10px] text-zinc-400 font-bold uppercase">{item.variant}</div>
                        </div>
                        <div className="text-right">
                          <div className="font-extrabold text-zinc-900">${(item.price * item.qty).toFixed(2)}</div>
                          <div className="text-[10px] text-zinc-400">Qty: {item.qty}</div>
                        </div>
                      </div>
                    ))}
                  </div>

                  <div className="flex justify-between items-center pt-2 border-t border-zinc-100">
                    <span className="text-zinc-400 font-bold">Total Sales Subtotal</span>
                    <span className="text-lg font-black text-zinc-950">${selectedOrder.subtotal.toFixed(2)}</span>
                  </div>
                </div>

                <button
                  onClick={() => setSelectedOrder(null)}
                  className="w-full bg-zinc-900 hover:bg-zinc-800 text-white font-extrabold py-3 rounded-xl transition-all text-xs"
                >
                  Close Address Panel
                </button>
              </div>
            </div>
          )}

        </div>
      )}
    </div>
  );
}
