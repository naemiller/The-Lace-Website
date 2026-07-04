import React, { useState, useEffect, useMemo } from 'react';
import { ShoppingBag, X, PlusCircle, ArrowLeft, ArrowRight, SlidersHorizontal } from 'lucide-react';

// Preloaded Catalog Baseline Array 
const BASELINE_PRODUCTS = [
  { id: 1, title: "Ultra HD Raw Straight Lace Wig", price: 350.00, texture: "straight", img: "https://unsplash.com" },
  { id: 2, title: "Luxury Body Wave HD Swiss Lace", price: 380.00, texture: "bodywave", img: "https://unsplash.com" },
  { id: 3, title: "Exotic Deep Curly HD Frontal Wig", price: 410.00, texture: "curly", img: "https://unsplash.com" },
  { id: 4, title: "Classic Silky Straight Closure Wig", price: 290.00, texture: "straight", img: "https://unsplash.com" }
];

const FALLBACK_IMG = "https://placeholder.com";

export default function App() {
  // Application State Hub
  const [products, setProducts] = useState(() => {
    const saved = localStorage.getItem('wig_inventory');
    return saved ? JSON.parse(saved) : BASELINE_PRODUCTS;
  });
  const [cart, setCart] = useState([]);
  const [category, setCategory] = useState('all');
  const [sortBy, setSortBy] = useState('featured');
  const [isCartOpen, setIsCartOpen] = useState(false);
  const [slideIndex, setSlideIndex] = useState(0);

  // Form Entry Field Data Hook Bindings
  const [newTitle, setNewTitle] = useState('');
  const [newPrice, setNewPrice] = useState('');
  const [newTexture, setNewTexture] = useState('straight');
  const [newImg, setNewImg] = useState('');

  // Save product changes automatically to local browser cache
  useEffect(() => {
    localStorage.setItem('wig_inventory', JSON.stringify(products));
  }, [products]);

  // Handle Automatic Slide Movements for the Carousel Slider
  const featuredWigs = useMemo(() => products.slice(0, 4), [products]);
  
  useEffect(() => {
    if (featuredWigs.length <= 1) return;
    const interval = setInterval(() => {
      setSlideIndex((prev) => (prev + 1) % featuredWigs.length);
    }, 4000);
    return () => clearInterval(interval);
  }, [featuredWigs]);

  // Dynamic Product Grid Filtering & Calculation Systems
  const computedProducts = useMemo(() => {
    let result = products.filter(p => category === 'all' || p.texture === category);
    if (sortBy === 'low-high') result.sort((a, b) => a.price - b.price);
    if (sortBy === 'high-low') result.sort((a, b) => b.price - a.price);
    return result;
  }, [products, category, sortBy]);

  const totalCartUnits = cart.reduce((sum, item) => sum + item.quantity, 0);
  const totalSubtotal = cart.reduce((sum, item) => sum + (item.price * item.quantity), 0);

  // Operations Control Board Actions
  const handleCreateProduct = (e) => {
    e.preventDefault();
    const productObj = {
      id: Date.now(),
      title: newTitle,
      price: parseFloat(newPrice) || 0,
      texture: newTexture,
      img: newImg.trim() || FALLBACK_IMG
    };
    setProducts([productObj, ...products]);
    setNewTitle('');
    setNewPrice('');
    setNewImg('');
  };

  const handleAddToBag = (product) => {
    setCart(prev => {
      const match = prev.find(item => item.id === product.id);
      if (match) return prev.map(item => item.id === product.id ? { ...item, quantity: item.quantity + 1 } : item);
      return [...prev, { ...product, quantity: 1 }];
    });
    setIsCartOpen(true);
  };

  const handleRemoveFromBag = (id) => {
    setCart(prev => prev.filter(item => item.id !== id));
  };

  return (
    <div className="min-h-screen bg-white font-sans text-luxury-black antialiased">
      
      {/* Premium Header Menu Layout Component */}
      <header className="sticky top-0 z-40 flex items-center justify-between border-b border-luxury-border bg-white px-6 py-4 md:px-12">
        <div className="text-xl font-black tracking-widest uppercase">THE LACE WIGS</div>
        <nav className="hidden space-x-8 text-xs font-bold tracking-wider uppercase md:flex">
          <a href="#" className="transition hover:text-luxury-gold">Home</a>
          <a href="#" className="text-luxury-gold">Shop</a>
          <a href="#" className="transition hover:text-luxury-gold">Our Story</a>
        </nav>
        <button onClick={() => setIsCartOpen(true)} className="relative p-2 transition hover:text-luxury-gold">
          <ShoppingBag className="h-6 w-6 stroke-[1.5]" />
          {totalCartUnits > 0 && (
            <span className="absolute -top-1 -right-1 flex h-5 w-5 items-center justify-center rounded-full bg-luxury-black text-[10px] font-bold text-white">
              {totalCartUnits}
            </span>
          )}
        </button>
      </header>

      {/* Featured Hair Dynamic Carousel Component Slider */}
      {featuredWigs.length > 0 && (
        <section className="relative h-[400px] w-100 overflow-hidden bg-black md:h-[500px]">
          <div 
            className="flex h-full w-full transition-transform duration-700 ease-out"
            style={{ transform: `translateX(-${slideIndex * 100}%)` }}
          >
            {featuredWigs.map((wig) => (
              <div key={wig.id} className="relative h-full w-full shrink-0">
                <img 
                  src={wig.img} 
                  alt={wig.title} 
                  className="h-full w-full object-cover opacity-60"
                  onError={(e) => { e.target.src = FALLBACK_IMG; }}
                />
                <div className="absolute inset-0 flex flex-col justify-end p-8 md:p-16">
                  <span className="text-xs font-bold tracking-widest text-luxury-gold uppercase">Trending Luxury Look</span>
                  <h2 className="mt-2 text-3xl font-extrabold text-white md:text-5xl uppercase tracking-tight">{wig.title}</h2>
                  <p className="mt-2 text-lg font-bold text-white">${wig.price.toFixed(2)}</p>
                </div>
              </div>
            ))}
          </div>
          <button 
            onClick={() => setSlideIndex(prev => (prev - 1 + featuredWigs.length) % featuredWigs.length)}
            className="absolute top-1/2 left-4 -translate-y-1/2 rounded-full bg-white/10 p-3 text-white backdrop-blur-md transition hover:bg-luxury-gold"
          >
            <ArrowLeft className="h-5 w-5" />
          </button>
          <button 
            onClick={() => setSlideIndex(prev => (prev + 1) % featuredWigs.length)}
            className="absolute top-1/2 right-4 -translate-y-1/2 rounded-full bg-white/10 p-3 text-white backdrop-blur-md transition hover:bg-luxury-gold"
          >
            <ArrowRight className="h-5 w-5" />
          </button>
        </section>
      )}

      {/* E-Commerce Structural Columns Layout Area */}
      <main className="mx-auto max-w-7xl px-4 py-12 md:px-8 lg:grid lg:grid-cols-[280px_1fr] lg:gap-12">
        
        {/* Responsive Control Panel Sidebar */}
        <aside className="space-y-8 lg:sticky lg:top-24 lg:h-fit">
          
          {/* Store Filters */}
          <div className="border-b border-luxury-border pb-6">
            <h3 className="flex items-center gap-2 text-sm font-black uppercase tracking-wider mb-4">
              <SlidersHorizontal className="h-4 w-4" /> Filter Textures
            </h3>
            <div className="flex flex-wrap gap-2 lg:flex-col lg:items-start lg:gap-1">
              {['all', 'straight', 'bodywave', 'curly'].map((txt) => (
                <button
                  key={txt}
                  onClick={() => setCategory(txt)}
                  className={`rounded px-3 py-1.5 text-sm font-semibold capitalize transition lg:w-full lg:text-left ${
                    category === txt ? 'bg-luxury-black text-white' : 'text-zinc-500 hover:text-luxury-gold'
                  }`}
                >
                  {txt === 'bodywave' ? 'Body Wave' : txt}
                </button>
              ))}
            </div>
          </div>

          {/* Catalog Sorting Options */}
          <div className="border-b border-luxury-border pb-6">
            <h3 className="text-sm font-black uppercase tracking-wider mb-3">Sort Inventory</h3>
            <select 
              value={sortBy} 
              onChange={(e) => setSortBy(e.target.value)}
              className="w-full rounded border border-luxury-border bg-white p-2.5 text-sm outline-none transition focus:border-luxury-gold"
            >
              <option value="featured">Featured Collection</option>
              <option value="low-high">Price: Low to High</option>
              <option value="high-low">Price: High to Low</option>
            </select>
          </div>

          {/* Admin Section: Form to Add Products For Sale */}
          <div className="rounded-xl border border-dashed border-luxury-gold bg-luxury-gray p-5">
            <h3 className="flex items-center gap-2 text-sm font-black uppercase tracking-wider text-luxury-black mb-4">
              <PlusCircle className="h-4 w-4 text-luxury-gold" /> Add Product For Sale
            </h3>
            <form onSubmit={handleCreateProduct} className="space-y-4">
              <div>
                <label className="block text-[10px] font-bold uppercase text-zinc-500 mb-1">Product Title</label>
                <input 
                  type="text" required value={newTitle} onChange={(e) => setNewTitle(e.target.value)}
                  placeholder="e.g., Brazilian Water Frontal"
                  className="w-full rounded border border-luxury-border bg-white p-2 text-sm outline-none focus:border-luxury-gold"
                />
              </div>
              <div>
                <label className="block text-[10px] font-bold uppercase text-zinc-500 mb-1">Price ($ USD)</label>
                <input 
