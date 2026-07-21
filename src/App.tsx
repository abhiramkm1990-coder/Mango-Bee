import React, { useState, useMemo, useEffect } from 'react';
import { 
  ShoppingBag, 
  Menu, 
  X, 
  Check, 
  Star, 
  ArrowRight, 
  ChevronRight, 
  Smartphone, 
  Monitor, 
  Sliders, 
  Phone, 
  Mail, 
  MapPin, 
  Clock, 
  ShieldCheck, 
  Sparkles, 
  Truck, 
  RotateCcw,
  Plus,
  Minus,
  Trash2,
  Info
} from 'lucide-react';
import { Product, Order, Lead, SiteContent } from './types';
import AdminDashboard from './components/AdminDashboard';
import { 
  getProducts, 
  saveOrder, 
  saveLead, 
  getSiteContent,
  isRealSupabase
} from './lib/supabase';

// Initial Product Data
const PRODUCTS: Product[] = [
  {
    id: 'kb-combo',
    name: 'Modern Wireless Keyboard & Mouse Combo',
    price: 59.99,
    rating: 4.9,
    reviewCount: 142,
    category: 'Computers & Gaming',
    badge: 'Premium Edition',
    shortDesc: 'Ultra-slim, rechargeable wireless keyboard and mouse with silent mechanical feel.',
    longDesc: 'Designed to elevate your desk aesthetic and productivity. Crafted from solid polycarbonate and soft alloy, it offers multi-device dual-channel wireless connectivity, dynamic white backlighting, and whisper-quiet scissor-switch feedback.',
    features: ['Multi-Device Pairing (2.4Ghz + Dual Bluetooth)', 'Rechargeable 500mAh Lithium Battery', 'Whisper-Quiet Mechanical Scissor-Switches', 'Ergonomic Natural Wrist Slope'],
    specs: { 'Battery Life': 'Up to 3 months on single charge', 'Switch Type': 'Quiet Tactile Scissor', 'Compatibility': 'Windows, macOS, iOS, Android', 'Weight': '420g' },
    variants: ['Minimalist White', 'Carbon Slate'],
    imageType: 'keyboard'
  },
  {
    id: 'laptop-stand',
    name: 'Adjustable Aluminum Ergonomic Laptop Stand',
    price: 39.99,
    rating: 4.8,
    reviewCount: 98,
    category: 'Computers & Gaming',
    badge: 'Best Seller',
    shortDesc: '6-level height adjustment, solid heat-dissipation aluminum body.',
    longDesc: 'An elegant solution to laptop strain. Engineered from aircraft-grade sandblasted aluminum to prevent neck fatigue, with non-slip protective silicone pads and an open airflow design to maximize cooling performance.',
    features: ['6 Adjustable Angle Levels (15° to 45°)', 'Aircraft-Grade Sandblasted Aluminum', 'Fully Collapsible with Carrying Sleeve', 'Thick Protective Silicone Padding'],
    specs: { 'Material': '6063 Aluminum Alloy', 'Support Weight': 'Up to 20kg', 'Size Folded': '260 x 45 x 15 mm', 'Heat Dissipation': 'Passive Open-Air design' },
    variants: ['Anodized Silver', 'Space Gray'],
    imageType: 'stand'
  },
  {
    id: 'usbc-cable',
    name: '65W Braided Fast-Charging USB-C Cable',
    price: 15.99,
    rating: 4.9,
    reviewCount: 214,
    category: 'Charging & Accessories',
    badge: 'iPhone 15/16/17 Compatible',
    shortDesc: 'High-speed Power Delivery (PD) braided nylon cable with reinforced orange connectors.',
    longDesc: 'Built to survive a lifetime. This robust cable supports high-speed charging up to 65W for laptops, tablets, and flagship smartphones. The double-braided ballistic nylon jacket resists tangles and preserves internal copper shielding.',
    features: ['Supports 65W Power Delivery (PD)', 'Double-Braided Ballistic Nylon Armor', 'Strain-Relief Flexible Joints', 'Smart IC E-Marker Safety Chip Inside'],
    specs: { 'Length': '1.8 Meters (6 Feet)', 'Data Speed': '480 Mbps', 'Max Output': '20V / 3.25A', 'Bend Lifespan': '25,000+ Bends' },
    variants: ['Mango Orange & Black Accent', 'Solid Black Slate'],
    imageType: 'cable'
  },
  {
    id: 'phone-case',
    name: 'Shockproof Premium Case (Mixed Models)',
    price: 18.99,
    rating: 4.7,
    reviewCount: 186,
    category: 'Charging & Accessories',
    badge: 'New Launch',
    shortDesc: 'MagSafe-compatible, ultra-slim hard casing with impact defense edges.',
    longDesc: 'Protect your device without the bulk. Engineered with a proprietary shock-absorbing inner bumper, raised camera bevels, and integrated strong neodymium magnets for flawless MagSafe accessories alignment.',
    features: ['MagSafe Compatible Ring Built-in', '10ft Mil-Grade Drop Protection', 'Anti-Yellowing Matte Finish Shield', 'Ultra-Responsive Tactile Buttons'],
    specs: { 'Thickness': '1.2 mm', 'Materials': 'Flexible TPU + Solid Polycarbonate', 'Magnets': '38x N52 Neodymium', 'Models': 'iPhone 17, 16, 15 | Samsung S24, S23' },
    variants: ['iPhone 17 Pro Max', 'iPhone 16 Pro', 'Samsung Galaxy S24 Ultra'],
    imageType: 'case'
  },
  {
    id: 'usb-hub',
    name: 'Aluminum Multi-Port USB 3.0 Hub',
    price: 29.99,
    rating: 4.8,
    reviewCount: 74,
    category: 'Electronics',
    badge: 'Pro Utility',
    shortDesc: 'Sleek aluminum casing expanding to 4-7 ultra-fast data ports.',
    longDesc: 'Instantly organize your peripherals. This aluminum-clad hub expands a single USB connection into high-speed lanes. Equipped with individual LED indicators and built-in overcurrent protection to keep devices secure.',
    features: ['4-7 Dedicated USB 3.0 Ports', '5Gbps Blazing Fast Data Sync', 'Anodized Premium Alloy Structure', 'Individual Blue LED Port Indicators'],
    specs: { 'Body Material': 'Anodized Aluminum', 'Cable Length': '30cm', 'Power Source': 'Bus-Powered or 5V DC Auxiliary', 'Chipset': 'Premium GL3520 Controller' },
    variants: ['4-Port Compact', '7-Port Pro Expanded'],
    imageType: 'hub'
  },
  {
    id: 'wired-earphones',
    name: 'High-Fidelity Ergonomic Wired Earphones',
    price: 19.99,
    rating: 4.7,
    reviewCount: 112,
    category: 'Audio Devices',
    badge: 'Premium Audio',
    shortDesc: 'Deep-bass drivers, noise-isolating silicone tips, built-in remote.',
    longDesc: 'Experience crisp vocal clarity and clean punchy bass. Specially structured to sit comfortably inside the ear canal for hours, featuring a tangle-resistant reinforced cable and integrated HD microphone.',
    features: ['10mm High-Resolution Dynamic Drivers', '3-Button Inline Remote & HD Mic', 'Ergonomic In-Ear Fit for Exercise', 'Passive Acoustic Noise Isolation'],
    specs: { 'Frequency Response': '20 Hz - 20 kHz', 'Impedance': '32 Ohm', 'Connector': 'Type-C / 3.5mm Gold-Plated', 'Cord Length': '1.2 Meters' },
    variants: ['Type-C Connector', '3.5mm Audio Jack'],
    imageType: 'earphones'
  },
  {
    id: 'ring-light',
    name: 'USB-Powered 8" LED Ring Light',
    price: 34.99,
    rating: 4.6,
    reviewCount: 81,
    category: 'Home & Kitchen',
    badge: 'Perfect for Vlogs',
    shortDesc: '3 lighting modes, adjustable tripod stand, flexible phone bracket.',
    longDesc: 'Professional lighting made portable. Instantly boost your video conferencing, streaming, or content creation quality. The adjustable solid aluminum desktop stand locks firmly at any angle.',
    features: ['3 Glow Modes (Warm, Natural, Cool White)', '10 Distinct Brightness Levels', 'Stable Non-Wobble Metal Tripod', 'USB-Powered for Desk Portability'],
    specs: { 'Outer Diameter': '8 Inches', 'Color Temp': '3000K - 6500K', 'USB Cord Length': '2 Meters', 'Power Output': '12 Watts' },
    variants: ['Desktop Tripod Edition', 'Premium Tall Stand Edition'],
    imageType: 'light'
  },
  {
    id: 'car-mount',
    name: '360° Magnetic Air-Vent Mobile Holder',
    price: 24.99,
    rating: 4.8,
    reviewCount: 119,
    category: 'Outdoor & Camping',
    badge: 'Travel Essential',
    shortDesc: 'Military-grade air vent grip, ultra-strong N52 magnetic lock.',
    longDesc: 'Keep your smartphone visible and secure on bumpy roads. This clamp installs onto any horizontal or vertical air vent slat in seconds, backed by high-strength magnetic pull that will not interfere with cellular GPS signal.',
    features: ['Secure Dual-Claw Vent Grip', '360° Ball-Joint Rotation System', 'Safe Neodymium Shielded Magnetic Field', 'One-Hand Quick Snap-On Action'],
    specs: { 'Magnet Pull Force': 'Up to 2.5kg load', 'Material': 'Carbon-reinforced Polycarbonate', 'Compatibility': 'All iPhone/Galaxy Models', 'Weight': '65g' },
    variants: ['Stealth Charcoal Black', 'Sunset Orange Trim'],
    imageType: 'holder'
  }
];

// All available categories
const CATEGORIES = [
  'All',
  'Electronics',
  'Charging & Accessories',
  'Home & Kitchen',
  'Audio Devices',
  'Computers & Gaming',
  'Self-Care',
  'Outdoor & Camping'
];

export default function App() {
  // Navigation / Drawer state
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [cartOpen, setCartOpen] = useState(false);
  const [adminOpen, setAdminOpen] = useState(false);
  
  // Filtering
  const [selectedCategory, setSelectedCategory] = useState('All');
  const [searchQuery, setSearchQuery] = useState('');

  // Live database inventories and copies
  const [productsList, setProductsList] = useState<Product[]>(PRODUCTS);
  const [liveContent, setLiveContent] = useState<SiteContent[]>([]);

  // Cart State
  const [cart, setCart] = useState<{ product: Product; quantity: number; variant: string }[]>([]);
  
  // Detail Modal State
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);
  const [modalVariant, setModalVariant] = useState('');

  // Configurator sandbox states
  const [cfgStand, setCfgStand] = useState(true);
  const [cfgKeyboardColor, setCfgKeyboardColor] = useState('Minimalist White');
  const [cfgCableColor, setCfgCableColor] = useState('Mango Orange & Black Accent');
  const [cfgCase, setCfgCase] = useState(true);

  // Checkout simulation
  const [checkoutStep, setCheckoutStep] = useState<'cart' | 'shipping' | 'success'>('cart');
  const [shippingInfo, setShippingInfo] = useState({ name: '', email: '', address: '', phone: '' });
  const [preorderId, setPreorderId] = useState('');
  
  // Contact Form State
  const [contactForm, setContactForm] = useState({ name: '', email: '', message: '', topic: 'General Support' });
  const [contactSubmitted, setContactSubmitted] = useState(false);

  // Synchronize collections
  const loadDatabaseStore = async () => {
    try {
      const [dbProds, dbContent] = await Promise.all([
        getProducts(),
        getSiteContent()
      ]);
      if (dbProds && dbProds.length > 0) {
        setProductsList(dbProds.filter(p => p.is_active));
      }
      if (dbContent && dbContent.length > 0) {
        setLiveContent(dbContent);
      }
    } catch (err) {
      console.warn('Sync issues loading database states. Falling back to memory catalog.');
    }
  };

  useEffect(() => {
    loadDatabaseStore();
  }, []);

  const getContent = (key: string, defaultValue: string) => {
    return liveContent.find(c => c.key === key)?.value || defaultValue;
  };

  // Filtered Products
  const filteredProducts = useMemo(() => {
    return productsList.filter(p => {
      const matchCat = selectedCategory === 'All' || p.category === selectedCategory;
      const matchSearch = p.name.toLowerCase().includes(searchQuery.toLowerCase()) || 
                          p.shortDesc.toLowerCase().includes(searchQuery.toLowerCase());
      return matchCat && matchSearch;
    });
  }, [productsList, selectedCategory, searchQuery]);

  // Cart summary calculations
  const cartTotals = useMemo(() => {
    const subtotal = cart.reduce((acc, item) => acc + item.product.price * item.quantity, 0);
    const shipping = subtotal > 49.99 || subtotal === 0 ? 0 : 4.99;
    const tax = subtotal * 0.08;
    const total = subtotal + shipping + tax;
    const totalCount = cart.reduce((acc, item) => acc + item.quantity, 0);
    return { subtotal, shipping, tax, total, totalCount };
  }, [cart]);

  // Cart operations
  const addToCart = (product: Product, variant?: string) => {
    const selectedVar = variant || product.variants?.[0] || 'Default';
    setCart(prev => {
      const existingIdx = prev.findIndex(item => item.product.id === product.id && item.variant === selectedVar);
      if (existingIdx > -1) {
        const next = [...prev];
        next[existingIdx].quantity += 1;
        return next;
      }
      return [...prev, { product, quantity: 1, variant: selectedVar }];
    });
    // Trigger tiny cart opening preview or keep closed
    setCartOpen(true);
  };

  const updateCartQty = (id: string, variant: string, delta: number) => {
    setCart(prev => {
      return prev.map(item => {
        if (item.product.id === id && item.variant === variant) {
          const newQty = item.quantity + delta;
          return newQty > 0 ? { ...item, quantity: newQty } : null;
        }
        return item;
      }).filter((item): item is typeof item => item !== null);
    });
  };

  const removeCartItem = (id: string, variant: string) => {
    setCart(prev => prev.filter(item => !(item.product.id === id && item.variant === variant)));
  };

  // Submit checkout to Supabase / LocalStorage
  const handleCheckoutSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!shippingInfo.name || !shippingInfo.email || !shippingInfo.address) return;
    
    const preId = 'MB-PRE-' + Math.floor(10000 + Math.random() * 90000);
    setPreorderId(preId);

    const orderPayload = {
      customer_name: shippingInfo.name,
      email: shippingInfo.email,
      phone: shippingInfo.phone,
      shipping_address: shippingInfo.address,
      items: cart.map(item => ({
        product_id: item.product.id,
        product_name: item.product.name,
        price: item.product.price,
        qty: item.quantity,
        variant: item.variant,
        imageType: item.product.imageType,
      })),
      subtotal: Number(cartTotals.subtotal),
      status: 'pending' as const,
      pre_order_id: preId,
    };

    try {
      await saveOrder(orderPayload);
    } catch (err) {
      console.warn('Fallback to local checkout log:', err);
    }
    
    setCheckoutStep('success');
  };

  // Submit contact to Supabase / LocalStorage
  const handleContactSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!contactForm.name || !contactForm.email || !contactForm.message) return;

    try {
      await saveLead({
        name: contactForm.name,
        email: contactForm.email,
        topic: contactForm.topic,
        message: contactForm.message,
      });
    } catch (err) {
      console.warn('Fallback to local lead queue:', err);
    }

    setContactSubmitted(true);
  };

  const resetCheckout = () => {
    setCart([]);
    setCheckoutStep('cart');
    setShippingInfo({ name: '', email: '', address: '', phone: '' });
    setCartOpen(false);
  };

  // SVG Render Helper to keep things clean and modular
  const renderProductSVG = (type: string, isLight: boolean = true) => {
    const mainColor = '#f97316'; // mango orange
    const darkAccent = '#18181b'; // slate dark
    const lightGrey = '#f4f4f5';

    switch (type) {
      case 'keyboard':
        return (
          <svg viewBox="0 0 120 100" className="w-full h-32 md:h-40 mx-auto" id="svg-keyboard">
            <rect x="10" y="30" width="100" height="40" rx="6" fill={isLight ? lightGrey : darkAccent} stroke={mainColor} strokeWidth="2" />
            {/* Keys */}
            <rect x="15" y="36" width="8" height="6" rx="1" fill={mainColor} />
            <rect x="26" y="36" width="8" height="6" rx="1" fill={darkAccent} />
            <rect x="37" y="36" width="8" height="6" rx="1" fill={darkAccent} />
            <rect x="48" y="36" width="8" height="6" rx="1" fill={darkAccent} />
            <rect x="59" y="36" width="8" height="6" rx="1" fill={darkAccent} />
            <rect x="70" y="36" width="8" height="6" rx="1" fill={darkAccent} />
            <rect x="81" y="36" width="8" height="6" rx="1" fill={darkAccent} />
            <rect x="92" y="36" width="13" height="6" rx="1" fill={mainColor} />

            <rect x="15" y="45" width="12" height="6" rx="1" fill={darkAccent} />
            <rect x="30" y="45" width="8" height="6" rx="1" fill={darkAccent} />
            <rect x="41" y="45" width="8" height="6" rx="1" fill={darkAccent} />
            <rect x="52" y="45" width="8" height="6" rx="1" fill={darkAccent} />
            <rect x="63" y="45" width="8" height="6" rx="1" fill={darkAccent} />
            <rect x="74" y="45" width="8" height="6" rx="1" fill={darkAccent} />
            <rect x="85" y="45" width="20" height="6" rx="1" fill={mainColor} />

            <rect x="15" y="54" width="15" height="6" rx="1" fill={mainColor} />
            <rect x="34" y="54" width="40" height="6" rx="1" fill={darkAccent} />
            <rect x="78" y="54" width="10" height="6" rx="1" fill={darkAccent} />
            <rect x="91" y="54" width="14" height="6" rx="1" fill={mainColor} />
            {/* Mouse */}
            <rect x="88" y="10" width="18" height="15" rx="9" fill={isLight ? lightGrey : darkAccent} stroke={mainColor} strokeWidth="1.5" />
            <line x1="97" y1="10" x2="97" y2="18" stroke={mainColor} strokeWidth="1" />
          </svg>
        );
      case 'stand':
        return (
          <svg viewBox="0 0 120 100" className="w-full h-32 md:h-40 mx-auto" id="svg-stand">
            {/* Laptop Stand Design */}
            <path d="M20,75 L45,35 L95,55" fill="none" stroke={darkAccent} strokeWidth="4" strokeLinecap="round" strokeLinejoin="round" />
            <path d="M30,80 L55,40 L100,58" fill="none" stroke={mainColor} strokeWidth="2.5" strokeLinecap="round" />
            <line x1="20" y1="75" x2="30" y2="80" stroke={darkAccent} strokeWidth="3" />
            <line x1="45" y1="35" x2="55" y2="40" stroke={darkAccent} strokeWidth="3" />
            {/* Silicon Stoppers */}
            <circle cx="95" cy="55" r="4" fill={mainColor} />
            <circle cx="100" cy="58" r="4" fill={darkAccent} />
            {/* Base platform */}
            <line x1="15" y1="78" x2="105" y2="78" stroke={darkAccent} strokeWidth="2" strokeDasharray="3,3" />
          </svg>
        );
      case 'cable':
        return (
          <svg viewBox="0 0 120 100" className="w-full h-32 md:h-40 mx-auto" id="svg-cable">
            {/* Braided Coils */}
            <path d="M30,50 Q45,30 60,50 T90,50" fill="none" stroke={mainColor} strokeWidth="4.5" strokeLinecap="round" />
            <path d="M30,50 Q45,30 60,50 T90,50" fill="none" stroke={darkAccent} strokeWidth="1.5" strokeLinecap="round" strokeDasharray="2,3" />
            {/* USB-C Connector heads */}
            <rect x="15" y="44" width="15" height="12" rx="2" fill={darkAccent} />
            <rect x="10" y="47" width="5" height="6" rx="1" fill="#a1a1aa" />
            <line x1="15" y1="50" x2="25" y2="50" stroke={mainColor} strokeWidth="2" />

            <rect x="90" y="44" width="15" height="12" rx="2" fill={darkAccent} />
            <rect x="105" y="47" width="5" height="6" rx="1" fill="#a1a1aa" />
            <line x1="95" y1="50" x2="105" y2="50" stroke={mainColor} strokeWidth="2" />
          </svg>
        );
      case 'case':
        return (
          <svg viewBox="0 0 120 100" className="w-full h-32 md:h-40 mx-auto" id="svg-case">
            {/* Smartphone Case */}
            <rect x="40" y="15" width="40" height="70" rx="10" fill={darkAccent} stroke={mainColor} strokeWidth="2" />
            {/* Camera cutout */}
            <rect x="45" y="20" width="14" height="22" rx="3" fill="#09090b" />
            <circle cx="52" cy="26" r="3" fill="#27272a" />
            <circle cx="52" cy="35" r="3" fill="#27272a" />
            {/* MagSafe Ring */}
            <circle cx="60" cy="53" r="14" fill="none" stroke={mainColor} strokeWidth="2" strokeDasharray="4,2" />
            <line x1="60" y1="67" x2="60" y2="74" stroke={mainColor} strokeWidth="2" />
          </svg>
        );
      case 'holder':
        return (
          <svg viewBox="0 0 120 100" className="w-full h-32 md:h-40 mx-auto" id="svg-holder">
            {/* Car Mount */}
            <rect x="45" y="25" width="30" height="30" rx="15" fill={darkAccent} stroke={mainColor} strokeWidth="2" />
            <circle cx="60" cy="40" r="10" fill="none" stroke={mainColor} strokeWidth="1.5" />
            <path d="M40,55 L80,55" stroke={darkAccent} strokeWidth="4" strokeLinecap="round" />
            {/* Slat claw */}
            <path d="M52,55 L48,80 C48,85 72,85 72,80 L68,55" fill={lightGrey} stroke={darkAccent} strokeWidth="1.5" />
            <circle cx="60" cy="40" r="3" fill={mainColor} />
          </svg>
        );
      case 'earphones':
        return (
          <svg viewBox="0 0 120 100" className="w-full h-32 md:h-40 mx-auto" id="svg-earphones">
            {/* High-Fi In-Ear buds */}
            <rect x="20" y="25" width="16" height="12" rx="4" fill={darkAccent} stroke={mainColor} strokeWidth="1.5" />
            <rect x="36" y="27" width="6" height="8" rx="1" fill={mainColor} />
            <path d="M28,37 L28,65" fill="none" stroke={darkAccent} strokeWidth="2" />

            <rect x="84" y="25" width="16" height="12" rx="4" fill={darkAccent} stroke={mainColor} strokeWidth="1.5" />
            <rect x="78" y="27" width="6" height="8" rx="1" fill={mainColor} />
            <path d="M92,37 L92,65" fill="none" stroke={darkAccent} strokeWidth="2" />

            <path d="M28,65 Q60,95 92,65" fill="none" stroke={mainColor} strokeWidth="2" />
            {/* Control Pod */}
            <rect x="52" y="68" width="16" height="6" rx="2" fill={darkAccent} />
            <circle cx="56" cy="71" r="1" fill={mainColor} />
            <circle cx="60" cy="71" r="1" fill={mainColor} />
            <circle cx="64" cy="71" r="1" fill={mainColor} />
          </svg>
        );
      case 'hub':
        return (
          <svg viewBox="0 0 120 100" className="w-full h-32 md:h-40 mx-auto" id="svg-hub">
            {/* Sleek Aluminum Hub */}
            <rect x="15" y="35" width="90" height="30" rx="4" fill={lightGrey} stroke={darkAccent} strokeWidth="2" />
            {/* Brand Accent */}
            <rect x="15" y="35" width="8" height="30" rx="2" fill={mainColor} />
            {/* Ports */}
            <rect x="32" y="43" width="12" height="14" rx="1" fill={darkAccent} />
            <line x1="38" y1="43" x2="38" y2="48" stroke="#38bdf8" strokeWidth="1.5" /> {/* Blue LED indicator */}
            <rect x="52" y="43" width="12" height="14" rx="1" fill={darkAccent} />
            <line x1="58" y1="43" x2="58" y2="48" stroke="#38bdf8" strokeWidth="1.5" />
            <rect x="72" y="43" width="12" height="14" rx="1" fill={darkAccent} />
            <line x1="78" y1="43" x2="78" y2="48" stroke="#38bdf8" strokeWidth="1.5" />
            <rect x="92" y="43" width="6" height="14" rx="1" fill={darkAccent} />
          </svg>
        );
      case 'light':
        return (
          <svg viewBox="0 0 120 100" className="w-full h-32 md:h-40 mx-auto" id="svg-light">
            {/* Ring Light */}
            <circle cx="60" cy="35" r="25" fill="none" stroke={lightGrey} strokeWidth="8" />
            <circle cx="60" cy="35" r="25" fill="none" stroke={mainColor} strokeWidth="2" />
            <circle cx="60" cy="35" r="21" fill="none" stroke="#e4e4e7" strokeWidth="1" />
            {/* Bracket holder */}
            <line x1="60" y1="60" x2="60" y2="80" stroke={darkAccent} strokeWidth="4" />
            {/* Tripod Base */}
            <path d="M60,80 L40,100" stroke={darkAccent} strokeWidth="3" strokeLinecap="round" />
            <path d="M60,80 L80,100" stroke={darkAccent} strokeWidth="3" strokeLinecap="round" />
            <path d="M60,80 L60,100" stroke={mainColor} strokeWidth="2.5" strokeLinecap="round" />
          </svg>
        );
      default:
        return null;
    }
  };

  // Configurator total price
  const configuratorTotal = useMemo(() => {
    let price = 59.99; // Base Keyboard Combo price
    if (cfgStand) price += 39.99;
    if (cfgCase) price += 18.99;
    // Cable comes included as premium bonus in custom kit
    price += 9.99; 
    return price;
  }, [cfgStand, cfgCase]);

  const addConfiguratorToCart = () => {
    // Add the selected components in one flow
    const bundleItems = [
      { product: productsList.find(p => p.id === 'kb-combo')!, variant: cfgKeyboardColor },
      ...(cfgStand ? [{ product: productsList.find(p => p.id === 'laptop-stand')!, variant: 'Anodized Silver' }] : []),
      ...(cfgCase ? [{ product: productsList.find(p => p.id === 'phone-case')!, variant: 'iPhone 17 Pro Max' }] : []),
      { product: productsList.find(p => p.id === 'usbc-cable')!, variant: cfgCableColor }
    ];

    bundleItems.forEach(item => {
      if (item.product) {
        addToCart(item.product, item.variant);
      }
    });
    
    setCartOpen(true);
  };

  return (
    <div className="min-h-screen bg-white text-zinc-900 font-sans antialiased" id="mangobee-app">
      
      {/* 1. Header / Navbar */}
      <header className="sticky top-0 z-40 bg-white/90 backdrop-blur-md border-b border-zinc-100" id="navbar">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
          
          {/* Logo Section */}
          <a href="#" className="flex items-center space-x-2 select-none" id="nav-logo">
            {/* Custom Interactive Inline SVG for Logo */}
            <div className="flex items-center">
              <span className="font-extrabold text-2xl tracking-tight text-zinc-950">mango</span>
              {/* Specialized Orange Bee Winged Mascot inline */}
              <div className="mx-1 mt-1 relative w-8 h-8 flex items-center justify-center">
                <svg viewBox="0 0 40 40" className="w-7 h-7 transform hover:scale-115 hover:rotate-6 transition-all duration-300">
                  {/* Wings */}
                  <ellipse cx="14" cy="14" rx="5" ry="8" fill="#f97316" opacity="0.8" transform="rotate(-30 14 14)" />
                  <ellipse cx="26" cy="14" rx="5" ry="8" fill="#f97316" opacity="0.8" transform="rotate(30 26 14)" />
                  {/* Face Body */}
                  <circle cx="20" cy="24" r="10" fill="#f97316" />
                  {/* Eyes */}
                  <circle cx="16" cy="22" r="1.5" fill="#18181b" />
                  <circle cx="24" cy="22" r="1.5" fill="#18181b" />
                  {/* Smile */}
                  <path d="M17,26 Q20,29 23,26" fill="none" stroke="#18181b" strokeWidth="1.5" strokeLinecap="round" />
                  {/* Antennae */}
                  <path d="M17,14 Q16,9 13,10" fill="none" stroke="#18181b" strokeWidth="1.2" />
                  <path d="M23,14 Q24,9 27,10" fill="none" stroke="#18181b" strokeWidth="1.2" />
                  <circle cx="13" cy="10" r="1" fill="#18181b" />
                  <circle cx="27" cy="10" r="1" fill="#18181b" />
                </svg>
              </div>
              <span className="font-extrabold text-2xl tracking-tight text-orange-500">bee</span>
            </div>
          </a>

          {/* Desktop Nav */}
          <nav className="hidden md:flex space-x-8 text-sm font-medium items-center" id="desktop-links">
            <a href="#products-showcase" className="text-zinc-600 hover:text-orange-500 transition-colors">Products</a>
            <a href="#workspace-studio" className="text-zinc-600 hover:text-orange-500 transition-colors">Workspace Configurator</a>
            <a href="#about-section" className="text-zinc-600 hover:text-orange-500 transition-colors">About Us</a>
            <a href="#contact-section" className="text-zinc-600 hover:text-orange-500 transition-colors">Contact</a>
            
            <button
              onClick={() => setAdminOpen(true)}
              className="bg-zinc-950 hover:bg-orange-500 text-white text-xs font-bold px-3.5 py-2 rounded-xl flex items-center space-x-1.5 shadow-md shadow-orange-500/10 transition-colors cursor-pointer"
            >
              <Sliders className="w-3.5 h-3.5 text-orange-500" />
              <span>Manager Central</span>
            </button>
          </nav>

          {/* Action Buttons */}
          <div className="flex items-center space-x-4" id="nav-actions">
            {/* Search Input Quick Filter */}
            <div className="relative hidden lg:block">
              <input
                type="text"
                placeholder="Search premium gear..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-48 bg-zinc-50 focus:bg-white text-xs px-3 py-1.5 pl-8 rounded-full border border-zinc-200 focus:border-orange-500 focus:ring-1 focus:ring-orange-500 transition-all outline-none"
              />
              <svg className="w-3.5 h-3.5 text-zinc-400 absolute left-3 top-2.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
              </svg>
              {searchQuery && (
                <button onClick={() => setSearchQuery('')} className="absolute right-3 top-2.5 text-zinc-400 hover:text-zinc-600">
                  <X className="w-3 h-3" />
                </button>
              )}
            </div>

            {/* Interactive Cart Button */}
            <button 
              onClick={() => { setCartOpen(true); setCheckoutStep('cart'); }}
              className="relative p-2 text-zinc-700 hover:text-orange-500 hover:bg-zinc-100 rounded-full transition-all duration-200"
              id="cart-toggle"
              aria-label="View Shopping Cart"
            >
              <ShoppingBag className="w-6 h-6" />
              {cartTotals.totalCount > 0 && (
                <span className="absolute -top-1 -right-1 bg-orange-500 text-white font-bold text-[10px] w-5 h-5 flex items-center justify-center rounded-full animate-pulse">
                  {cartTotals.totalCount}
                </span>
              )}
            </button>

            {/* Mobile Menu Toggle */}
            <button 
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="p-2 md:hidden text-zinc-700 hover:text-orange-500 hover:bg-zinc-100 rounded-full transition-colors"
              id="mobile-menu-toggle"
              aria-label="Toggle menu"
            >
              {mobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
            </button>
          </div>

        </div>
      </header>

      {/* Mobile Drawer Navigation */}
      {mobileMenuOpen && (
        <div className="md:hidden fixed inset-0 z-30 bg-zinc-900/40 backdrop-blur-sm" id="mobile-drawer-overlay">
          <div className="absolute top-16 left-0 right-0 bg-white border-b border-zinc-200 px-6 py-6 space-y-4 shadow-xl flex flex-col">
            {/* Search */}
            <div className="relative">
              <input
                type="text"
                placeholder="Search premium gear..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full bg-zinc-100 text-sm px-4 py-2 pl-10 rounded-lg border-0 outline-none focus:ring-2 focus:ring-orange-500"
              />
              <svg className="w-4 h-4 text-zinc-400 absolute left-3.5 top-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
              </svg>
            </div>
            
            <a 
              href="#products-showcase" 
              onClick={() => setMobileMenuOpen(false)}
              className="text-lg font-medium text-zinc-800 hover:text-orange-500 transition-colors py-2 border-b border-zinc-100"
            >
              Products
            </a>
            <a 
              href="#workspace-studio" 
              onClick={() => setMobileMenuOpen(false)}
              className="text-lg font-medium text-zinc-800 hover:text-orange-500 transition-colors py-2 border-b border-zinc-100"
            >
              Workspace Configurator
            </a>
            <a 
              href="#about-section" 
              onClick={() => setMobileMenuOpen(false)}
              className="text-lg font-medium text-zinc-800 hover:text-orange-500 transition-colors py-2 border-b border-zinc-100"
            >
              About Us
            </a>
            <a 
              href="#contact-section" 
              onClick={() => setMobileMenuOpen(false)}
              className="text-lg font-medium text-zinc-800 hover:text-orange-500 transition-colors py-2 border-b border-zinc-100"
            >
              Contact
            </a>

            <button 
              onClick={() => { setMobileMenuOpen(false); setAdminOpen(true); }}
              className="text-lg font-bold text-orange-500 hover:text-orange-600 transition-colors py-2 flex items-center space-x-2 text-left"
            >
              <Sliders className="w-5 h-5" />
              <span>Manager Central</span>
            </button>

            <button 
              onClick={() => { setMobileMenuOpen(false); setCartOpen(true); }}
              className="w-full bg-orange-500 text-white py-3 rounded-lg font-semibold flex items-center justify-center space-x-2"
            >
              <ShoppingBag className="w-5 h-5" />
              <span>Cart ({cartTotals.totalCount} items)</span>
            </button>
          </div>
        </div>
      )}

      {/* 2. Hero Section */}
      <section className="relative overflow-hidden bg-gradient-to-b from-orange-50/40 via-white to-white py-16 sm:py-24" id="hero-section">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-center">
            
            {/* Left Content Column */}
            <div className="lg:col-span-7 space-y-6 text-left" id="hero-text">
              <div className="inline-flex items-center space-x-2 bg-orange-100/60 border border-orange-200 rounded-full px-3 py-1" id="hero-badge">
                <Sparkles className="w-4 h-4 text-orange-600" />
                <span className="text-xs font-semibold text-orange-800 tracking-wide">Premium Tech Essentials Redefined</span>
              </div>
              
              <h1 className="text-4xl sm:text-5xl lg:text-6xl font-black text-zinc-950 tracking-tight leading-tight" id="hero-heading">
                {getContent('hero_headline', 'Elevate Your Digital Workspace.')}
              </h1>
              
              <p className="text-zinc-600 text-base sm:text-lg max-w-2xl leading-relaxed" id="hero-subtext">
                {getContent('hero_subheadline', "Explore Mangobee's signature selection of high-performance keyboards, custom aluminum stands, fast-charging braided cables, and ergonomic tech gear designed to seamlessly transform how you work and play.")}
              </p>

              {/* USP Highlights Mini Section */}
              <div className="grid grid-cols-3 gap-4 py-2 border-y border-zinc-100 max-w-xl" id="hero-usps">
                <div className="flex flex-col items-start">
                  <span className="text-lg font-extrabold text-orange-500">Premium</span>
                  <span className="text-xs text-zinc-500">Alloys & Materials</span>
                </div>
                <div className="flex flex-col items-start border-l border-zinc-100 pl-4">
                  <span className="text-lg font-extrabold text-zinc-950">Fast</span>
                  <span className="text-xs text-zinc-500">Worldwide Shipping</span>
                </div>
                <div className="flex flex-col items-start border-l border-zinc-100 pl-4">
                  <span className="text-lg font-extrabold text-orange-500">100%</span>
                  <span className="text-xs text-zinc-500">Guaranteed Fit</span>
                </div>
              </div>

              {/* Call to Actions */}
              <div className="flex flex-col sm:flex-row space-y-3 sm:space-y-0 sm:space-x-4 pt-2" id="hero-ctas">
                <a 
                  href="#products-showcase" 
                  className="bg-orange-500 hover:bg-orange-600 text-white font-bold px-8 py-4 rounded-xl flex items-center justify-center space-x-2 shadow-lg shadow-orange-500/20 transform hover:-translate-y-0.5 transition-all duration-200"
                >
                  <span>Shop Collection</span>
                  <ArrowRight className="w-5 h-5" />
                </a>
                <a 
                  href="#workspace-studio" 
                  className="bg-zinc-100 hover:bg-zinc-200 text-zinc-900 font-semibold px-8 py-4 rounded-xl flex items-center justify-center space-x-2 transition-all duration-200"
                >
                  <span>Configurator Kit</span>
                  <Sliders className="w-5 h-5 text-orange-500" />
                </a>
              </div>
            </div>

            {/* Right Interactive Hero Preview (Sleek Minimal Setup Interactive Showcase) */}
            <div className="lg:col-span-5 relative" id="hero-visual">
              <div className="relative mx-auto max-w-md lg:max-w-none bg-zinc-50 border border-zinc-200/60 rounded-3xl p-6 sm:p-8 shadow-2xl">
                {/* Visual Glow */}
                <div className="absolute top-0 right-0 w-48 h-48 bg-orange-200/30 rounded-full blur-3xl -z-10"></div>
                
                <div className="flex items-center justify-between mb-6">
                  <div className="flex items-center space-x-2">
                    <span className="w-3 h-3 rounded-full bg-red-400"></span>
                    <span className="w-3 h-3 rounded-full bg-yellow-400"></span>
                    <span className="w-3 h-3 rounded-full bg-green-400"></span>
                  </div>
                  <span className="text-xs font-mono font-semibold text-orange-500 bg-orange-50 px-2 py-0.5 rounded">MANGOBEE STUDIO</span>
                </div>

                {/* Desk visual renderer representing White/Orange combination */}
                <div className="border border-zinc-200 bg-white rounded-2xl p-6 relative overflow-hidden transition-all duration-500">
                  <div className="absolute top-2 right-2 flex items-center space-x-1 text-xs text-zinc-400">
                    <Monitor className="w-3.5 h-3.5" />
                    <span>Live Desk preview</span>
                  </div>

                  <div className="space-y-6 pt-4">
                    {/* Stand Render */}
                    <div className="flex justify-center transform hover:scale-102 transition-transform duration-300">
                      {renderProductSVG('stand', true)}
                    </div>
                    {/* Keyboard Render */}
                    <div className="flex justify-center -mt-6">
                      {renderProductSVG('keyboard', true)}
                    </div>
                  </div>
                </div>

                {/* Live Banner overlay promo */}
                <div className="mt-6 bg-zinc-950 text-white p-4 rounded-xl flex items-center justify-between">
                  <div>
                    <span className="text-[10px] text-orange-400 tracking-wider uppercase font-bold block">Exclusive Combo Offer</span>
                    <h3 className="text-sm font-bold mt-0.5">Aluminum Stand + Keyboard Bundle</h3>
                  </div>
                  <div className="text-right">
                    <span className="text-xs line-through text-zinc-400 block">$99.98</span>
                    <span className="text-base font-extrabold text-orange-400">$84.99</span>
                  </div>
                </div>

                {/* Add bundle to cart action button */}
                <button 
                  onClick={() => {
                    const stand = productsList.find(p => p.id === 'laptop-stand')!;
                    const kb = productsList.find(p => p.id === 'kb-combo')!;
                    if (stand) addToCart(stand);
                    if (kb) addToCart(kb);
                  }}
                  className="w-full mt-4 bg-orange-500 hover:bg-orange-600 text-white font-bold py-3 px-4 rounded-xl flex items-center justify-center space-x-2 transition-colors duration-200 text-sm shadow-md"
                >
                  <Plus className="w-4 h-4" />
                  <span>Add This Combo Bundle to Cart</span>
                </button>
              </div>
            </div>

          </div>
        </div>
      </section>

      {/* 3. Product Collection with Interactive Filters */}
      <section className="py-16 sm:py-24 bg-zinc-50 border-y border-zinc-100" id="products-showcase">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          
          <div className="text-center max-w-3xl mx-auto space-y-4 mb-12">
            <h2 className="text-3xl sm:text-4xl font-extrabold text-zinc-950 tracking-tight">
              Premium Accessories Collection
            </h2>
            <p className="text-zinc-600">
              Browse our handcrafted catalogue designed with focus, ergonomics, and seamless utility in mind. Enjoy free delivery on orders over $50!
            </p>

            {/* In-app Search bar */}
            <div className="relative max-w-md mx-auto pt-2">
              <input
                type="text"
                placeholder="Filter by keyword (e.g. 'cables', 'stand')..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full bg-white text-sm px-4 py-3 pl-11 rounded-xl border border-zinc-200 outline-none focus:ring-2 focus:ring-orange-500 transition-all shadow-sm"
              />
              <svg className="w-5 h-5 text-zinc-400 absolute left-4 top-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
              </svg>
            </div>
          </div>

          {/* Categories Tab Selector */}
          <div className="flex overflow-x-auto pb-4 mb-8 -mx-4 px-4 scrollbar-thin justify-start md:justify-center" id="category-tabs">
            <div className="flex space-x-2">
              {CATEGORIES.map((cat) => (
                <button
                  key={cat}
                  onClick={() => setSelectedCategory(cat)}
                  className={`px-4 py-2 rounded-full text-xs font-bold whitespace-nowrap transition-all duration-200 ${
                    selectedCategory === cat
                      ? 'bg-orange-500 text-white shadow-md shadow-orange-500/10'
                      : 'bg-white text-zinc-700 border border-zinc-200 hover:border-orange-500'
                  }`}
                >
                  {cat}
                </button>
              ))}
            </div>
          </div>

          {/* Product Grid */}
          {filteredProducts.length === 0 ? (
            <div className="text-center py-12 bg-white rounded-2xl border border-zinc-200">
              <Info className="w-12 h-12 text-zinc-400 mx-auto mb-3" />
              <p className="text-zinc-600 font-medium">No accessories found matching your query.</p>
              <button 
                onClick={() => { setSelectedCategory('All'); setSearchQuery(''); }}
                className="text-orange-500 hover:text-orange-600 font-bold text-sm mt-2"
              >
                Reset Filters
              </button>
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8" id="product-grid">
              {filteredProducts.map((product) => (
                <div 
                  key={product.id}
                  className="bg-white border border-zinc-100 hover:border-orange-100 rounded-2xl overflow-hidden shadow-sm hover:shadow-xl hover:-translate-y-1 transition-all duration-300 flex flex-col group"
                  id={`product-card-${product.id}`}
                >
                  {/* Badge & Rating bar */}
                  <div className="p-4 pb-0 flex justify-between items-center z-10">
                    {product.badge ? (
                      <span className="bg-orange-100 text-orange-800 text-[10px] font-extrabold px-2.5 py-0.5 rounded-full uppercase tracking-wider">
                        {product.badge}
                      </span>
                    ) : (
                      <span className="text-xs font-semibold text-zinc-400">{product.category}</span>
                    )}
                    <div className="flex items-center space-x-1 bg-zinc-50 px-2 py-0.5 rounded text-xs font-bold text-zinc-700">
                      <Star className="w-3.5 h-3.5 text-amber-400 fill-amber-400" />
                      <span>{product.rating}</span>
                    </div>
                  </div>

                  {/* SVG Product Preview Area */}
                  <div 
                    onClick={() => { setSelectedProduct(product); setModalVariant(product.variants?.[0] || ''); }}
                    className="p-6 cursor-pointer bg-gradient-to-b from-white to-zinc-50/50 flex items-center justify-center h-48 group-hover:scale-102 transition-transform duration-300"
                  >
                    {renderProductSVG(product.imageType)}
                  </div>

                  {/* Detailed Description */}
                  <div className="p-5 flex-1 flex flex-col justify-between">
                    <div>
                      <h3 
                        onClick={() => { setSelectedProduct(product); setModalVariant(product.variants?.[0] || ''); }}
                        className="font-extrabold text-base text-zinc-950 group-hover:text-orange-500 transition-colors cursor-pointer line-clamp-1"
                      >
                        {product.name}
                      </h3>
                      <p className="text-xs text-zinc-500 mt-2 line-clamp-2">
                        {product.shortDesc}
                      </p>
                    </div>

                    <div className="mt-4 pt-4 border-t border-zinc-100">
                      {/* Price / Add to cart row */}
                      <div className="flex items-center justify-between">
                        <div>
                          <span className="text-xs text-zinc-400 block font-medium">Price</span>
                          <span className="text-xl font-black text-zinc-950">${product.price}</span>
                        </div>
                        <div className="flex space-x-1.5">
                          <button 
                            onClick={() => { setSelectedProduct(product); setModalVariant(product.variants?.[0] || ''); }}
                            className="p-2.5 bg-zinc-100 hover:bg-zinc-200 text-zinc-800 rounded-xl transition-colors"
                            title="Quick View Details"
                          >
                            <Info className="w-4 h-4" />
                          </button>
                          <button 
                            onClick={() => addToCart(product)}
                            className="bg-orange-500 hover:bg-orange-600 text-white px-4 py-2.5 rounded-xl font-bold text-xs flex items-center space-x-1 shadow-md shadow-orange-500/10 transition-colors"
                          >
                            <Plus className="w-3.5 h-3.5" />
                            <span>Add</span>
                          </button>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}

        </div>
      </section>

      {/* 4. Custom Desk Studio Configurator Section */}
      <section className="py-16 sm:py-24 bg-white" id="workspace-studio">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          
          <div className="bg-gradient-to-br from-zinc-50 to-zinc-100 rounded-3xl p-8 sm:p-12 border border-zinc-200 relative overflow-hidden">
            {/* Visual background circle decoration */}
            <div className="absolute -bottom-24 -left-24 w-96 h-96 bg-orange-100/50 rounded-full blur-3xl -z-10"></div>
            
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-center">
              
              {/* Configurator Visualizer */}
              <div className="lg:col-span-6 space-y-6">
                <div className="bg-white rounded-2xl p-6 sm:p-8 border border-zinc-200 shadow-xl relative min-h-[300px] flex flex-col justify-between">
                  <div className="flex items-center justify-between border-b border-zinc-100 pb-4">
                    <span className="text-xs font-bold text-zinc-400 tracking-widest uppercase">MANGOBEE CUSTOMIZER STUDIO</span>
                    <span className="text-xs font-bold text-green-600 flex items-center space-x-1 bg-green-50 px-2 py-0.5 rounded">
                      <span className="w-1.5 h-1.5 bg-green-500 rounded-full animate-ping"></span>
                      <span>Configured Bundle</span>
                    </span>
                  </div>

                  {/* Render simulated dynamic desk preview based on options toggled */}
                  <div className="py-6 space-y-4">
                    {cfgStand ? (
                      <div className="flex justify-center transform scale-110 transition-all duration-300">
                        {renderProductSVG('stand', true)}
                      </div>
                    ) : (
                      <div className="h-12 flex items-center justify-center text-xs text-zinc-400 border border-dashed border-zinc-200 rounded-lg">
                        Stand removed from set
                      </div>
                    )}

                    <div className="flex justify-center -mt-6">
                      {renderProductSVG('keyboard', cfgKeyboardColor === 'Minimalist White')}
                    </div>

                    <div className="flex justify-center space-x-6 items-center pt-2">
                      <div className="flex flex-col items-center">
                        <span className="text-[10px] text-zinc-400 uppercase font-bold">Cable Armor</span>
                        <span className="text-xs font-bold text-orange-600">{cfgCableColor.split(' ')[0]}</span>
                      </div>
                      {cfgCase && (
                        <div className="flex flex-col items-center">
                          <span className="text-[10px] text-zinc-400 uppercase font-bold">Phone Case</span>
                          <span className="text-xs font-bold text-zinc-800">MagSafe Armor</span>
                        </div>
                      )}
                    </div>
                  </div>

                  <div className="border-t border-zinc-100 pt-4 flex justify-between items-center">
                    <div>
                      <span className="text-xs text-zinc-400 block">Bundle Price</span>
                      <span className="text-2xl font-black text-zinc-950">${configuratorTotal.toFixed(2)}</span>
                    </div>
                    <span className="text-xs text-green-600 font-bold bg-green-50 px-2 py-1 rounded">Includes Promo Discount!</span>
                  </div>
                </div>
              </div>

              {/* Controls Column */}
              <div className="lg:col-span-6 space-y-6">
                <div>
                  <span className="text-xs font-extrabold text-orange-500 tracking-wider uppercase bg-orange-100 px-3 py-1 rounded-full">Interactive Configurator</span>
                  <h2 className="text-3xl sm:text-4xl font-black text-zinc-950 tracking-tight mt-3">
                    Design Your Ideal Setup
                  </h2>
                  <p className="text-zinc-600 mt-2">
                    Toggle accessories, choose premium finishes, and build a high-performance workspace bundle tailored precisely to your everyday productivity.
                  </p>
                </div>

                {/* Toggle Controls Form */}
                <div className="space-y-4 bg-white p-6 rounded-2xl border border-zinc-200/80">
                  {/* Keyboard Color */}
                  <div>
                    <label className="block text-xs font-bold uppercase tracking-wider text-zinc-500 mb-2">Keyboard Finish</label>
                    <div className="grid grid-cols-2 gap-2">
                      {['Minimalist White', 'Carbon Slate'].map(color => (
                        <button
                          key={color}
                          type="button"
                          onClick={() => setCfgKeyboardColor(color)}
                          className={`py-2 px-3 text-xs font-bold border rounded-lg transition-all ${
                            cfgKeyboardColor === color 
                              ? 'bg-orange-500 text-white border-orange-500' 
                              : 'bg-zinc-50 hover:bg-zinc-100 text-zinc-700 border-zinc-200'
                          }`}
                        >
                          {color}
                        </button>
                      ))}
                    </div>
                  </div>

                  {/* Laptop Stand Toggle */}
                  <div className="flex items-center justify-between py-2 border-t border-zinc-100">
                    <div>
                      <span className="text-xs font-extrabold uppercase tracking-wider text-zinc-800 block">Add Aluminum Stand</span>
                      <span className="text-xs text-zinc-500">Ergonomic elevation & cooling base (+ $39.99)</span>
                    </div>
                    <button
                      type="button"
                      onClick={() => setCfgStand(!cfgStand)}
                      className={`w-12 h-6 rounded-full p-1 transition-all ${cfgStand ? 'bg-orange-500' : 'bg-zinc-300'}`}
                    >
                      <div className={`w-4 h-4 rounded-full bg-white transition-all transform ${cfgStand ? 'translate-x-6' : 'translate-x-0'}`} />
                    </button>
                  </div>

                  {/* Case Toggle */}
                  <div className="flex items-center justify-between py-2 border-t border-zinc-100">
                    <div>
                      <span className="text-xs font-extrabold uppercase tracking-wider text-zinc-800 block">Add Shockproof Case</span>
                      <span className="text-xs text-zinc-500">MagSafe Armor protection (+ $18.99)</span>
                    </div>
                    <button
                      type="button"
                      onClick={() => setCfgCase(!cfgCase)}
                      className={`w-12 h-6 rounded-full p-1 transition-all ${cfgCase ? 'bg-orange-500' : 'bg-zinc-300'}`}
                    >
                      <div className={`w-4 h-4 rounded-full bg-white transition-all transform ${cfgCase ? 'translate-x-6' : 'translate-x-0'}`} />
                    </button>
                  </div>

                  {/* Cable Selection */}
                  <div>
                    <label className="block text-xs font-bold uppercase tracking-wider text-zinc-500 mb-2">65W Braided Fast Cable Finish</label>
                    <div className="grid grid-cols-2 gap-2">
                      {['Mango Orange & Black Accent', 'Solid Black Slate'].map(color => (
                        <button
                          key={color}
                          type="button"
                          onClick={() => setCfgCableColor(color)}
                          className={`py-2 px-3 text-xs font-bold border rounded-lg transition-all ${
                            cfgCableColor === color 
                              ? 'bg-orange-500 text-white border-orange-500' 
                              : 'bg-zinc-50 hover:bg-zinc-100 text-zinc-700 border-zinc-200'
                          }`}
                        >
                          {color.split(' ')[0]}
                        </button>
                      ))}
                    </div>
                  </div>
                </div>

                {/* Add Bundle to Cart */}
                <button
                  onClick={addConfiguratorToCart}
                  className="w-full bg-zinc-950 hover:bg-zinc-900 text-white font-extrabold py-4 px-6 rounded-xl flex items-center justify-center space-x-2 shadow-xl hover:-translate-y-0.5 transition-all"
                >
                  <ShoppingBag className="w-5 h-5 text-orange-500" />
                  <span>Purchase Workspace Bundle</span>
                </button>
              </div>

            </div>
          </div>

        </div>
      </section>

      {/* 5. About Section: "The Mangobee Standard" */}
      <section className="py-16 sm:py-24 bg-zinc-50 border-t border-zinc-200" id="about-section">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-center">
            
            {/* Image/Visual Mock Column */}
            <div className="lg:col-span-5 relative">
              <div className="bg-white border border-zinc-200 p-8 rounded-3xl shadow-xl space-y-6 relative overflow-hidden">
                <div className="absolute top-0 right-0 w-32 h-32 bg-orange-100/30 rounded-full blur-2xl"></div>
                
                <div className="flex items-center space-x-3">
                  <div className="bg-orange-500 text-white p-2 rounded-xl">
                    <ShieldCheck className="w-6 h-6" />
                  </div>
                  <div>
                    <h4 className="font-extrabold text-zinc-950">High-Performance Build</h4>
                    <p className="text-xs text-zinc-500">Mil-Grade, sustainable materials</p>
                  </div>
                </div>

                <div className="space-y-3 font-medium text-sm text-zinc-700">
                  <div className="flex items-center space-x-2">
                    <Check className="w-4 h-4 text-orange-500" />
                    <span>6063 Aluminum CNC Milled Frames</span>
                  </div>
                  <div className="flex items-center space-x-2">
                    <Check className="w-4 h-4 text-orange-500" />
                    <span>Ballistic Nylon Outer Braiding</span>
                  </div>
                  <div className="flex items-center space-x-2">
                    <Check className="w-4 h-4 text-orange-500" />
                    <span>E-Marker Integrated Power Control Chipsets</span>
                  </div>
                </div>

                {/* Mini testimonial block */}
                <div className="bg-zinc-50 p-4 rounded-xl border border-zinc-100">
                  <p className="text-xs italic text-zinc-500">
                    &quot;The typing comfort on the Keyboard Combo is incredible, and the aluminum laptop stand stays completely locked. Mangobee is my go-to tech brand.&quot;
                  </p>
                  <span className="block text-[10px] font-bold text-zinc-800 mt-2">— Marcus V., Senior Product Designer</span>
                </div>
              </div>
            </div>

            {/* About text column */}
            <div className="lg:col-span-7 space-y-6">
              <span className="text-xs font-bold text-orange-500 tracking-wider uppercase">Our Design Philosophy</span>
              <h2 className="text-3xl sm:text-4xl font-black text-zinc-950 tracking-tight leading-tight">
                {getContent('about_headline', 'Crafting the tools of the modern digital artisan.')}
              </h2>
              <p className="text-zinc-600 leading-relaxed">
                {getContent('about_text', "At Mangobee, we believe that your workspace accessories shouldn't just work — they should inspire. What began as a search for high-speed charging cables turned into a dedicated obsession with structural ergonomics, sleek materials, and long-lasting durability.")}
              </p>
              <p className="text-zinc-600 leading-relaxed">
                Every single keyboard, mouse, stand, and multi-port hub we build undergoes rigorous load and bend tests, ensuring they survive the daily commute, intensive coding sessions, or rugged outdoor travel.
              </p>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-4">
                <div className="flex space-x-3">
                  <div className="bg-orange-50 text-orange-500 p-2.5 rounded-lg h-10 w-10 flex items-center justify-center">
                    <Truck className="w-5 h-5" />
                  </div>
                  <div>
                    <h4 className="font-bold text-sm text-zinc-950">Fast Global Logistics</h4>
                    <p className="text-xs text-zinc-500 mt-0.5">Dispatched securely from local centers with active tracking.</p>
                  </div>
                </div>

                <div className="flex space-x-3">
                  <div className="bg-orange-50 text-orange-500 p-2.5 rounded-lg h-10 w-10 flex items-center justify-center">
                    <RotateCcw className="w-5 h-5" />
                  </div>
                  <div>
                    <h4 className="font-bold text-sm text-zinc-950">30-Day Hassle-Free Returns</h4>
                    <p className="text-xs text-zinc-500 mt-0.5">Not perfect? We process free prepaid labels instantly.</p>
                  </div>
                </div>
              </div>
            </div>

          </div>
        </div>
      </section>

      {/* 6. Contact Section with interactive Form */}
      <section className="py-16 sm:py-24 bg-white" id="contact-section">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-12">
            
            {/* Info column */}
            <div className="lg:col-span-5 space-y-6">
              <div>
                <span className="text-xs font-extrabold text-orange-500 tracking-wider uppercase">Contact Support</span>
                <h2 className="text-3xl sm:text-4xl font-black text-zinc-950 tracking-tight mt-3">
                  Get in Touch with Our Team
                </h2>
                <p className="text-zinc-600 mt-2">
                  Have questions about compatibility, bulk corporate orders, or an active shipping tracking number? Drop us a line and receive a reply in under 12 hours.
                </p>
              </div>

              <div className="space-y-4 pt-4">
                <div className="flex items-center space-x-3 text-sm">
                  <div className="bg-zinc-100 p-2.5 rounded-lg text-zinc-700">
                    <Mail className="w-5 h-5" />
                  </div>
                  <div>
                    <span className="text-xs text-zinc-400 block font-medium">Email Support</span>
                    <a href="mailto:support@mangobee.co" className="font-bold text-zinc-800 hover:text-orange-500 transition-colors">support@mangobee.co</a>
                  </div>
                </div>

                <div className="flex items-center space-x-3 text-sm">
                  <div className="bg-zinc-100 p-2.5 rounded-lg text-zinc-700">
                    <Phone className="w-5 h-5" />
                  </div>
                  <div>
                    <span className="text-xs text-zinc-400 block font-medium">Corporate Headquarters</span>
                    <span className="font-bold text-zinc-800">+1 (800) 555-MANGOBEE</span>
                  </div>
                </div>

                <div className="flex items-center space-x-3 text-sm">
                  <div className="bg-zinc-100 p-2.5 rounded-lg text-zinc-700">
                    <MapPin className="w-5 h-5" />
                  </div>
                  <div>
                    <span className="text-xs text-zinc-400 block font-medium">Design Lab Location</span>
                    <span className="font-bold text-zinc-800">45 Mango Way, Suite 300, San Francisco, CA</span>
                  </div>
                </div>
              </div>
            </div>

            {/* Form Column */}
            <div className="lg:col-span-7 bg-zinc-50 border border-zinc-200/80 rounded-3xl p-6 sm:p-8 relative">
              {contactSubmitted ? (
                <div className="text-center py-16 space-y-4">
                  <div className="w-16 h-16 bg-green-100 text-green-600 rounded-full flex items-center justify-center mx-auto mb-4 animate-bounce">
                    <Check className="w-8 h-8" />
                  </div>
                  <h3 className="text-2xl font-black text-zinc-950">Inquiry Received!</h3>
                  <p className="text-zinc-600 max-w-md mx-auto">
                    Thanks for reaching out, <span className="font-bold text-zinc-900">{contactForm.name}</span>. A workspace assistant has been assigned to your ticket and will follow up shortly at <span className="font-semibold text-zinc-800">{contactForm.email}</span>.
                  </p>
                  <button
                    onClick={() => {
                      setContactSubmitted(false);
                      setContactForm({ name: '', email: '', message: '', topic: 'General Support' });
                    }}
                    className="mt-4 text-orange-500 hover:text-orange-600 font-bold text-sm"
                  >
                    Send another message
                  </button>
                </div>
              ) : (
                <form 
                  onSubmit={handleContactSubmit}
                  className="space-y-4"
                  id="contact-form"
                >
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-xs font-bold uppercase tracking-wider text-zinc-500 mb-1.5">Full Name</label>
                      <input
                        type="text"
                        required
                        value={contactForm.name}
                        onChange={(e) => setContactForm({ ...contactForm, name: e.target.value })}
                        placeholder="John Doe"
                        className="w-full bg-white text-sm px-4 py-3 rounded-xl border border-zinc-200 focus:border-orange-500 focus:ring-1 focus:ring-orange-500 outline-none transition-all"
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-bold uppercase tracking-wider text-zinc-500 mb-1.5">Email Address</label>
                      <input
                        type="email"
                        required
                        value={contactForm.email}
                        onChange={(e) => setContactForm({ ...contactForm, email: e.target.value })}
                        placeholder="john@example.com"
                        className="w-full bg-white text-sm px-4 py-3 rounded-xl border border-zinc-200 focus:border-orange-500 focus:ring-1 focus:ring-orange-500 outline-none transition-all"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-xs font-bold uppercase tracking-wider text-zinc-500 mb-1.5">What can we help you with?</label>
                    <select
                      value={contactForm.topic}
                      onChange={(e) => setContactForm({ ...contactForm, topic: e.target.value })}
                      className="w-full bg-white text-sm px-4 py-3 rounded-xl border border-zinc-200 focus:border-orange-500 focus:ring-1 focus:ring-orange-500 outline-none transition-all"
                    >
                      <option>General Support</option>
                      <option>Bulk Corporate Orders (Discount Inquiry)</option>
                      <option>Pre-order Reservation Help</option>
                      <option>Shipping & Delivery Tracking</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-xs font-bold uppercase tracking-wider text-zinc-500 mb-1.5">Message / Inquiry Details</label>
                    <textarea
                      required
                      rows={4}
                      value={contactForm.message}
                      onChange={(e) => setContactForm({ ...contactForm, message: e.target.value })}
                      placeholder="Please outline any questions regarding cable specs, custom sizing support..."
                      className="w-full bg-white text-sm px-4 py-3 rounded-xl border border-zinc-200 focus:border-orange-500 focus:ring-1 focus:ring-orange-500 outline-none transition-all resize-none"
                    />
                  </div>

                  <button
                    type="submit"
                    className="w-full bg-orange-500 hover:bg-orange-600 text-white font-extrabold py-3.5 px-6 rounded-xl transition-colors duration-200 shadow-md"
                  >
                    Submit Secure Form
                  </button>
                </form>
              )}
            </div>

          </div>

        </div>
      </section>

      {/* 7. Detailed Product Quick View Modal */}
      {selectedProduct && (
        <div className="fixed inset-0 z-50 bg-zinc-950/50 backdrop-blur-sm flex items-center justify-center p-4" id="quickview-modal">
          <div className="bg-white rounded-3xl max-w-3xl w-full max-h-[90vh] overflow-y-auto p-6 sm:p-8 shadow-2xl relative border border-zinc-100">
            
            {/* Close */}
            <button 
              onClick={() => setSelectedProduct(null)}
              className="absolute top-4 right-4 p-2 text-zinc-400 hover:text-zinc-600 hover:bg-zinc-100 rounded-full transition-colors"
            >
              <X className="w-6 h-6" />
            </button>

            <div className="grid grid-cols-1 md:grid-cols-12 gap-8 pt-4">
              
              {/* Product SVG Graphic Column */}
              <div className="md:col-span-5 bg-zinc-50/80 rounded-2xl p-6 flex flex-col justify-between border border-zinc-200/50">
                <div className="flex items-center justify-center h-48 md:h-64">
                  {renderProductSVG(selectedProduct.imageType)}
                </div>
                
                {/* Tech specifications table */}
                <div className="space-y-1 bg-white p-3 rounded-xl border border-zinc-100 mt-4">
                  <span className="text-[10px] uppercase font-bold text-zinc-400 tracking-wider">Specifications</span>
                  <div className="space-y-1.5">
                    {Object.entries(selectedProduct.specs).map(([k, v]) => (
                      <div key={k} className="flex justify-between text-xs border-b border-zinc-50 pb-1 last:border-0 last:pb-0">
                        <span className="text-zinc-400">{k}</span>
                        <span className="font-semibold text-zinc-800">{v}</span>
                      </div>
                    ))}
                  </div>
                </div>
              </div>

              {/* Product Context Details */}
              <div className="md:col-span-7 flex flex-col justify-between">
                <div>
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-xs font-bold text-orange-500 bg-orange-50 px-2.5 py-0.5 rounded-full">{selectedProduct.category}</span>
                    <span className="text-xs text-zinc-400 font-medium">Product SKU: {selectedProduct.id}</span>
                  </div>
                  
                  <h3 className="text-2xl sm:text-3xl font-black text-zinc-950 tracking-tight leading-tight">
                    {selectedProduct.name}
                  </h3>

                  <div className="flex items-center space-x-2 mt-2">
                    <div className="flex items-center space-x-0.5">
                      {[1, 2, 3, 4, 5].map((s) => (
                        <Star key={s} className="w-4 h-4 text-amber-400 fill-amber-400" />
                      ))}
                    </div>
                    <span className="text-xs font-bold text-zinc-600">({selectedProduct.reviewCount} customers reviewed)</span>
                  </div>

                  <p className="text-zinc-600 text-sm mt-4 leading-relaxed">
                    {selectedProduct.longDesc}
                  </p>

                  {/* Highlights Bullet List */}
                  <div className="mt-4 space-y-2">
                    <span className="text-xs uppercase font-extrabold text-zinc-400 tracking-wider">Premium Features</span>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs font-medium text-zinc-700">
                      {selectedProduct.features.map((feat, idx) => (
                        <div key={idx} className="flex items-center space-x-1.5">
                          <Check className="w-4 h-4 text-orange-500 shrink-0" />
                          <span>{feat}</span>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Options Variant Selector */}
                  {selectedProduct.variants && (
                    <div className="mt-6">
                      <label className="block text-xs font-extrabold uppercase tracking-wider text-zinc-500 mb-2">Select Variant Option</label>
                      <div className="flex space-x-2">
                        {selectedProduct.variants.map((v) => (
                          <button
                            key={v}
                            type="button"
                            onClick={() => setModalVariant(v)}
                            className={`px-3 py-2 text-xs font-bold border rounded-lg transition-all ${
                              modalVariant === v 
                                ? 'bg-orange-500 text-white border-orange-500 shadow-sm' 
                                : 'bg-white hover:bg-zinc-50 text-zinc-700 border-zinc-200'
                            }`}
                          >
                            {v}
                          </button>
                        ))}
                      </div>
                    </div>
                  )}
                </div>

                <div className="mt-8 pt-4 border-t border-zinc-100 flex items-center justify-between">
                  <div>
                    <span className="text-xs text-zinc-400 block font-medium">Guaranteed Price</span>
                    <span className="text-3xl font-black text-zinc-950">${selectedProduct.price}</span>
                  </div>
                  <div className="flex space-x-2">
                    <button
                      onClick={() => {
                        addToCart(selectedProduct, modalVariant);
                        setSelectedProduct(null);
                      }}
                      className="bg-orange-500 hover:bg-orange-600 text-white font-extrabold px-6 py-3.5 rounded-xl flex items-center space-x-2 shadow-lg shadow-orange-500/10 transition-colors duration-200"
                    >
                      <ShoppingBag className="w-5 h-5" />
                      <span>Add to Cart</span>
                    </button>
                  </div>
                </div>

              </div>

            </div>
          </div>
        </div>
      )}

      {/* 8. Interactive Cart Sliding Drawer Panel */}
      {cartOpen && (
        <div className="fixed inset-0 z-50 bg-zinc-950/50 backdrop-blur-xs flex justify-end" id="cart-drawer">
          <div className="bg-white w-full max-w-md h-full flex flex-col justify-between shadow-2xl border-l border-zinc-100 relative">
            
            {/* Drawer Header */}
            <div className="p-5 border-b border-zinc-100 flex items-center justify-between">
              <div className="flex items-center space-x-2">
                <ShoppingBag className="w-5 h-5 text-orange-500" />
                <h3 className="font-extrabold text-lg text-zinc-950">Your Shopping Cart</h3>
                <span className="bg-zinc-100 text-zinc-700 text-xs font-bold px-2 py-0.5 rounded-full">
                  {cartTotals.totalCount}
                </span>
              </div>
              <button 
                onClick={() => setCartOpen(false)}
                className="p-1.5 text-zinc-400 hover:text-zinc-600 hover:bg-zinc-100 rounded-full transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Middle Content */}
            <div className="flex-1 overflow-y-auto p-5 space-y-4">
              
              {checkoutStep === 'cart' && (
                <>
                  {cart.length === 0 ? (
                    <div className="text-center py-16 space-y-3">
                      <ShoppingBag className="w-12 h-12 text-zinc-300 mx-auto" />
                      <p className="text-zinc-600 font-medium">Your shopping cart is empty.</p>
                      <p className="text-xs text-zinc-400">Add custom-braided fast cables or ergonomic keyboard combos to start.</p>
                      <button 
                        onClick={() => setCartOpen(false)}
                        className="bg-orange-500 hover:bg-orange-600 text-white text-xs font-bold px-4 py-2 rounded-lg mt-2"
                      >
                        Keep Browsing
                      </button>
                    </div>
                  ) : (
                    <div className="space-y-4">
                      {cart.map((item, idx) => (
                        <div key={`${item.product.id}-${item.variant}-${idx}`} className="flex space-x-3 bg-zinc-50 border border-zinc-100 p-3 rounded-xl">
                          <div className="w-16 h-16 bg-white rounded-lg border border-zinc-100 flex items-center justify-center shrink-0">
                            {renderProductSVG(item.product.imageType)}
                          </div>
                          <div className="flex-1 flex flex-col justify-between">
                            <div>
                              <h4 className="text-sm font-extrabold text-zinc-900 line-clamp-1">{item.product.name}</h4>
                              <span className="text-[10px] text-orange-600 font-bold tracking-wide uppercase bg-orange-50 px-1.5 py-0.5 rounded block w-max mt-1">
                                {item.variant}
                              </span>
                            </div>
                            
                            <div className="flex items-center justify-between mt-2">
                              {/* Controls */}
                              <div className="flex items-center space-x-2 bg-white border border-zinc-200 rounded-lg p-0.5">
                                <button 
                                  onClick={() => updateCartQty(item.product.id, item.variant, -1)}
                                  className="p-1 hover:bg-zinc-100 text-zinc-500 rounded"
                                >
                                  <Minus className="w-3 h-3" />
                                </button>
                                <span className="text-xs font-bold px-1">{item.quantity}</span>
                                <button 
                                  onClick={() => updateCartQty(item.product.id, item.variant, 1)}
                                  className="p-1 hover:bg-zinc-100 text-zinc-500 rounded"
                                >
                                  <Plus className="w-3 h-3" />
                                </button>
                              </div>

                              {/* Price / Delete */}
                              <div className="flex items-center space-x-3">
                                <span className="text-sm font-black text-zinc-950">${(item.product.price * item.quantity).toFixed(2)}</span>
                                <button 
                                  onClick={() => removeCartItem(item.product.id, item.variant)}
                                  className="text-zinc-400 hover:text-red-500 transition-colors"
                                  title="Delete item"
                                >
                                  <Trash2 className="w-4 h-4" />
                                </button>
                              </div>
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </>
              )}

              {checkoutStep === 'shipping' && (
                <form onSubmit={handleCheckoutSubmit} className="space-y-4" id="checkout-form">
                  <div className="flex items-center space-x-2 bg-zinc-50 p-3 rounded-lg text-xs font-semibold text-zinc-600 mb-4 border border-zinc-200">
                    <Info className="w-4 h-4 text-orange-500 shrink-0" />
                    <span>Complete your shipping pre-order reservation. No payment required today.</span>
                  </div>

                  <div>
                    <label className="block text-xs font-bold uppercase tracking-wider text-zinc-500 mb-1">Your Full Name</label>
                    <input
                      type="text"
                      required
                      placeholder="Jane Smith"
                      value={shippingInfo.name}
                      onChange={(e) => setShippingInfo({ ...shippingInfo, name: e.target.value })}
                      className="w-full bg-zinc-50 text-sm px-3 py-2.5 rounded-lg border border-zinc-200 focus:border-orange-500 focus:bg-white outline-none transition-all"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-bold uppercase tracking-wider text-zinc-500 mb-1">Email Address</label>
                    <input
                      type="email"
                      required
                      placeholder="jane@example.com"
                      value={shippingInfo.email}
                      onChange={(e) => setShippingInfo({ ...shippingInfo, email: e.target.value })}
                      className="w-full bg-zinc-50 text-sm px-3 py-2.5 rounded-lg border border-zinc-200 focus:border-orange-500 focus:bg-white outline-none transition-all"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-bold uppercase tracking-wider text-zinc-500 mb-1">Delivery Address</label>
                    <input
                      type="text"
                      required
                      placeholder="123 Workspace Dr, Apt 4"
                      value={shippingInfo.address}
                      onChange={(e) => setShippingInfo({ ...shippingInfo, address: e.target.value })}
                      className="w-full bg-zinc-50 text-sm px-3 py-2.5 rounded-lg border border-zinc-200 focus:border-orange-500 focus:bg-white outline-none transition-all"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-bold uppercase tracking-wider text-zinc-500 mb-1">Contact Phone</label>
                    <input
                      type="tel"
                      placeholder="+1 (555) 000-0000"
                      value={shippingInfo.phone}
                      onChange={(e) => setShippingInfo({ ...shippingInfo, phone: e.target.value })}
                      className="w-full bg-zinc-50 text-sm px-3 py-2.5 rounded-lg border border-zinc-200 focus:border-orange-500 focus:bg-white outline-none transition-all"
                    />
                  </div>

                  <button
                    type="submit"
                    className="w-full mt-6 bg-orange-500 hover:bg-orange-600 text-white font-extrabold py-3.5 rounded-xl transition-colors shadow-md"
                  >
                    Confirm Pre-Order Reservation
                  </button>
                  <button
                    type="button"
                    onClick={() => setCheckoutStep('cart')}
                    className="w-full text-center text-xs text-zinc-400 hover:text-zinc-600 mt-2 font-bold"
                  >
                    Back to cart review
                  </button>
                </form>
              )}

              {checkoutStep === 'success' && (
                <div className="text-center py-12 space-y-4">
                  <div className="w-16 h-16 bg-green-100 text-green-600 rounded-full flex items-center justify-center mx-auto mb-4">
                    <Check className="w-8 h-8" />
                  </div>
                  <h3 className="text-2xl font-black text-zinc-950">Pre-Order Locked!</h3>
                  
                  <div className="bg-zinc-50 p-4 rounded-xl border border-zinc-200 space-y-2 text-left">
                    <div className="flex justify-between text-xs">
                      <span className="text-zinc-400">Order ID:</span>
                      <span className="font-mono font-bold text-zinc-800">{preorderId}</span>
                    </div>
                    <div className="flex justify-between text-xs">
                      <span className="text-zinc-400">Recipient:</span>
                      <span className="font-bold text-zinc-800">{shippingInfo.name}</span>
                    </div>
                    <div className="flex justify-between text-xs">
                      <span className="text-zinc-400">Destination:</span>
                      <span className="font-bold text-zinc-800 truncate max-w-[200px]">{shippingInfo.address}</span>
                    </div>
                  </div>

                  <p className="text-xs text-zinc-500 leading-relaxed max-w-sm mx-auto">
                    A confirmation invoice has been sent to <span className="font-semibold text-zinc-800">{shippingInfo.email}</span>. Our warehouse is preparing the package with active carrier notification!
                  </p>

                  <button
                    onClick={resetCheckout}
                    className="w-full bg-zinc-900 hover:bg-zinc-800 text-white font-extrabold py-3 rounded-xl mt-4"
                  >
                    Back to Shop
                  </button>
                </div>
              )}

            </div>

            {/* Bottom calculation bar (only shown if checkout is still active and items exist) */}
            {cart.length > 0 && checkoutStep === 'cart' && (
              <div className="p-5 border-t border-zinc-100 bg-zinc-50 space-y-3">
                <div className="space-y-1.5 text-sm font-medium">
                  <div className="flex justify-between text-zinc-500">
                    <span>Subtotal</span>
                    <span>${cartTotals.subtotal.toFixed(2)}</span>
                  </div>
                  <div className="flex justify-between text-zinc-500">
                    <span>Estimated Shipping</span>
                    <span>{cartTotals.shipping === 0 ? 'FREE' : `$${cartTotals.shipping.toFixed(2)}`}</span>
                  </div>
                  <div className="flex justify-between text-zinc-500 border-b border-zinc-100 pb-2">
                    <span>Sales Tax (8%)</span>
                    <span>${cartTotals.tax.toFixed(2)}</span>
                  </div>
                  <div className="flex justify-between text-zinc-950 font-extrabold text-base pt-1">
                    <span>Total Cost</span>
                    <span className="text-orange-500">${cartTotals.total.toFixed(2)}</span>
                  </div>
                </div>

                <button
                  onClick={() => setCheckoutStep('shipping')}
                  className="w-full bg-zinc-950 hover:bg-orange-500 text-white hover:text-white font-extrabold py-3.5 rounded-xl transition-all duration-200 mt-2 flex items-center justify-center space-x-2"
                >
                  <span>Proceed to Shipping info</span>
                  <ChevronRight className="w-4 h-4" />
                </button>
              </div>
            )}

          </div>
        </div>
      )}

      {/* 9. Premium Footer */}
      <footer className="bg-zinc-950 text-white py-12 border-t border-zinc-800" id="main-footer">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          
          <div className="grid grid-cols-1 md:grid-cols-12 gap-8 pb-8 border-b border-zinc-800">
            
            {/* Logo and brief */}
            <div className="md:col-span-4 space-y-4">
              <div className="flex items-center">
                <span className="font-extrabold text-xl tracking-tight text-white">mango</span>
                <span className="font-extrabold text-xl tracking-tight text-orange-500">bee</span>
              </div>
              <p className="text-zinc-400 text-xs leading-relaxed max-w-xs">
                Premium high-converting tech and workspace accessories designed for developers, creators, and modern digital artisans.
              </p>
              <div className="flex space-x-2 text-xs font-semibold text-orange-500">
                <span>© 2026 Mangobee Inc.</span>
                <span>•</span>
                <span>All rights reserved.</span>
              </div>
            </div>

            {/* Quick Links */}
            <div className="md:col-span-3 space-y-3">
              <h4 className="text-xs font-bold uppercase tracking-wider text-zinc-400">Categories</h4>
              <ul className="space-y-2 text-xs font-medium text-zinc-500">
                <li><a href="#products-showcase" onClick={() => setSelectedCategory('Computers & Gaming')} className="hover:text-orange-500 transition-colors">Computers & Gaming</a></li>
                <li><a href="#products-showcase" onClick={() => setSelectedCategory('Charging & Accessories')} className="hover:text-orange-500 transition-colors">Charging & Accessories</a></li>
                <li><a href="#products-showcase" onClick={() => setSelectedCategory('Electronics')} className="hover:text-orange-500 transition-colors">Electronics</a></li>
                <li><a href="#products-showcase" onClick={() => setSelectedCategory('Audio Devices')} className="hover:text-orange-500 transition-colors">Audio Devices</a></li>
              </ul>
            </div>

            {/* Support Links */}
            <div className="md:col-span-3 space-y-3">
              <h4 className="text-xs font-bold uppercase tracking-wider text-zinc-400">Inquire & Help</h4>
              <ul className="space-y-2 text-xs font-medium text-zinc-500">
                <li><a href="#contact-section" className="hover:text-orange-500 transition-colors">Corporate Accounts</a></li>
                <li><a href="#about-section" className="hover:text-orange-500 transition-colors">Warranty & Replacements</a></li>
                <li><a href="#about-section" className="hover:text-orange-500 transition-colors">Shipping Policy</a></li>
                <li><a href="#contact-section" className="hover:text-orange-500 transition-colors">Privacy and terms</a></li>
              </ul>
            </div>

            {/* Security certification */}
            <div className="md:col-span-2 space-y-3">
              <h4 className="text-xs font-bold uppercase tracking-wider text-zinc-400">Certified secure</h4>
              <div className="p-3 bg-zinc-900 rounded-lg border border-zinc-800 space-y-2">
                <div className="flex items-center space-x-1.5 text-[10px] text-zinc-400">
                  <ShieldCheck className="w-4 h-4 text-orange-500" />
                  <span>SSL encryption ready</span>
                </div>
                <div className="flex items-center space-x-1.5 text-[10px] text-zinc-400">
                  <Check className="w-4 h-4 text-green-500" />
                  <span>Instant confirmation</span>
                </div>
              </div>
            </div>

          </div>

          <div className="pt-6 text-center text-[10px] text-zinc-600">
            Designed for real conversion. Build customized tech setups with absolute stability. All device brand names are trademarks of their respective owners.
          </div>

        </div>
      </footer>

      {/* Admin Central Dashboard Modal */}
      {adminOpen && (
        <AdminDashboard 
          onClose={() => setAdminOpen(false)} 
          onContentChange={loadDatabaseStore} 
        />
      )}

    </div>
  );
}
