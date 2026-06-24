import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useRestOS } from '../context/RestOSContext';
import { 
  ShoppingBag, 
  ArrowLeft, 
  Check, 
  ChevronRight, 
  X,
  Phone,
  Signal,
  Wifi,
  Battery,
  AlertCircle,
  ClipboardList
} from 'lucide-react';

const MENU_DATA = {
  STARTERS: [
    { id: 'st-1', name: 'Veg Gyoza', price: 220, type: 'veg', icon: '🥟', desc: 'Pan-fried Japanese dumplings with mixed vegetables stuffing.' },
    { id: 'st-2', name: 'Chicken Karaage', price: 320, type: 'non-veg', icon: '🍗', desc: 'Crispy deep-fried Japanese chicken marinated with soy sauce.' },
    { id: 'st-3', name: 'Tempura Prawns', price: 450, type: 'non-veg', icon: '🍤', desc: 'Lightly battered and deep-fried prawns served with tempura sauce.' },
    { id: 'st-4', name: 'Edamame', price: 180, type: 'veg', icon: '🫛', desc: 'Steamed soybeans sprinkled with coarse sea salt.' }
  ],
  SUSHI: [
    { id: 'su-1', name: 'California Roll', price: 420, type: 'non-veg', icon: '🍣', desc: 'Crabstick, avocado, cucumber rolled with sesame seeds.' },
    { id: 'su-2', name: 'Avocado Maki', price: 350, type: 'veg', icon: '🥑', desc: 'Simple and elegant avocado wrapped in seaweed rice roll.' },
    { id: 'su-3', name: 'Salmon Nigiri', price: 520, type: 'non-veg', icon: '🍣', desc: 'Fresh slices of salmon over hand-formed vinegared rice.' }
  ],
  RAMEN: [
    { id: 'ra-1', name: 'Miso Ramen', price: 420, type: 'veg', icon: '🍜', desc: 'Ramen noodles served in rich soybean paste broth with tofu.' },
    { id: 'ra-2', name: 'Spicy Chicken Ramen', price: 480, type: 'non-veg', icon: '🍜', desc: 'Fiery chicken broth with noodles, roasted chicken slices, bamboo shoot.' },
    { id: 'ra-3', name: 'Tonkotsu Ramen', price: 560, type: 'non-veg', icon: '🍜', desc: 'Creamy and rich pork bone broth ramen served with chashu pork slices.' }
  ],
  DESSERTS: [
    { id: 'de-1', name: 'Chocolate Mochi', price: 220, type: 'veg', icon: '🍮', desc: 'Sweet glutinous rice cake stuffed with rich chocolate ganache.' },
    { id: 'de-2', name: 'Matcha Ice Cream', price: 180, type: 'veg', icon: '🍨', desc: 'Creamy green tea flavoured authentic Japanese ice cream.' }
  ]
};

// Add categories with icons
const CATEGORIES = [
  { key: 'STARTERS', name: 'Starters', icon: '🥗' },
  { key: 'SUSHI', name: 'Sushi', icon: '🍣' },
  { key: 'RAMEN', name: 'Ramen', icon: '🍜' },
  { key: 'DESSERTS', name: 'Desserts', icon: '🍮' }
];

const GuestOrdering = () => {
  const { 
    placeOrder, 
    orders, 
    tables, 
    requestBill, 
    setOrderTrackerStatus,
    notifications = [],
    kpis
  } = useRestOS();

  // Internal states
  const [activeCategory, setActiveCategory] = useState('STARTERS');
  const [cart, setCart] = useState([]);
  const [currentScreen, setCurrentScreen] = useState('menu'); // menu | cart | tracker
  const [activeOrderId, setActiveOrderId] = useState(null);
  const [selectedItem, setSelectedItem] = useState(null); // for bottom sheet
  const [instructions, setInstructions] = useState('');
  const [qty, setQty] = useState(1);
  
  // Customization choices
  const [variant, setVariant] = useState('Regular');
  const [spice, setSpice] = useState('Medium');
  const [addOns, setAddOns] = useState({
    extraCheese: false,
    extraEgg: false,
    extraSauce: false,
    noriSheets: false
  });

  const activeOrder = activeOrderId ? orders[activeOrderId] : null;
  const isTableBillRequested = tables[12]?.status === 'bill_requested';

  const cartTotal = cart.reduce((sum, item) => sum + (item.price * item.qty), 0);

  // Auto-scroll inside sidebar helper
  const selectCategory = (categoryKey) => {
    setActiveCategory(categoryKey);
    // In a real app we would scroll to the element.
  };

  // Add Item handler
  const handleItemTap = (item) => {
    setSelectedItem(item);
    setVariant('Regular');
    setSpice('Medium');
    setAddOns({
      extraCheese: false,
      extraEgg: false,
      extraSauce: false,
      noriSheets: false
    });
    setInstructions('');
    setQty(1);
  };

  const handleAddToCart = () => {
    if (!selectedItem) return;
    
    // Calculate final price with addons
    let finalPrice = selectedItem.price;
    const addOnList = [];
    if (addOns.extraCheese) { finalPrice += 50; addOnList.push('Extra Cheese'); }
    if (addOns.extraEgg) { finalPrice += 40; addOnList.push('Extra Egg'); }
    if (addOns.extraSauce) { finalPrice += 30; addOnList.push('Extra Sauce'); }
    if (addOns.noriSheets) { finalPrice += 20; addOnList.push('Nori Sheets'); }

    const cartItem = {
      id: `${selectedItem.id}-${Date.now()}`,
      name: selectedItem.name,
      basePrice: selectedItem.price,
      price: finalPrice,
      variant,
      spice,
      addOns: addOnList,
      instructions,
      qty,
      icon: selectedItem.icon
    };

    setCart([...cart, cartItem]);
    setSelectedItem(null);
  };

  const updateCartItemQty = (itemId, change) => {
    setCart(prev => prev.map(item => {
      if (item.id === itemId) {
        const newQty = Math.max(1, item.qty + change);
        return { ...item, qty: newQty };
      }
      return item;
    }));
  };

  const handlePlaceOrder = () => {
    if (cart.length === 0) return;
    
    // We target Table 12
    const placedId = placeOrder(12, cart, null);
    setActiveOrderId(placedId);
    setCart([]);
    setCurrentScreen('tracker');
  };

  const handleOrderMore = () => {
    // Add Round 2 item directly to cart for demo convenience
    const mochi = MENU_DATA.DESSERTS[0]; // Chocolate Mochi
    setCart([
      {
        id: `round2-mochi-${Date.now()}`,
        name: mochi.name,
        basePrice: mochi.price,
        price: mochi.price,
        variant: 'Regular',
        spice: 'None',
        addOns: [],
        instructions: '',
        qty: 1,
        icon: mochi.icon
      }
    ]);
    setCurrentScreen('menu');
  };

  const handleRequestBill = () => {
    requestBill(12);
  };

  return (
    <div className="max-w-7xl mx-auto px-4 py-12 md:px-8">
      {/* Hero Header */}
      <div className="bg-blue-primary text-white p-8 rounded-3xl mb-12 text-center relative overflow-hidden border border-blue-400/20 shadow-xl">
        <div className="relative z-10">
          <span className="bg-blue-light text-white font-black text-xs px-3 py-1 rounded-full uppercase tracking-wider mb-3 inline-block">
            STATION 01
          </span>
          <h1 className="text-4xl md:text-5xl font-black uppercase tracking-tight mb-2">GUEST ORDERING</h1>
          <p className="text-sm md:text-base text-blue-100 max-w-xl mx-auto font-medium">
            Test the live customer-facing flow. QR scan takes guests to this exact menu inside their web browsers.
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        {/* Left 60%: Android Frame */}
        <div className="lg:col-span-7 flex justify-center">
          <div className="relative w-[360px] h-[720px] bg-slate-900 rounded-[50px] p-3 shadow-2xl border-4 border-slate-700 flex flex-col overflow-hidden">
            {/* Camera notch */}
            <div className="absolute top-4 left-1/2 transform -translate-x-1/2 w-32 h-5 bg-black rounded-full z-50 flex items-center justify-center">
              <span className="w-2.5 h-2.5 bg-gray-800 rounded-full mr-2"></span>
              <span className="w-1.5 h-1.5 bg-blue-900 rounded-full"></span>
            </div>

            {/* Top Status Bar */}
            <div className="h-10 px-6 pt-4 pb-1.5 flex justify-between items-center text-[10px] text-white/90 z-40 bg-blue-primary">
              <span className="font-bold font-mono">12:34</span>
              <div className="flex items-center gap-1.5">
                <Signal size={10} />
                <Wifi size={10} />
                <Battery size={12} className="rotate-90" />
              </div>
            </div>

            {/* Screen Inner Container */}
            <div className="flex-1 bg-blue-primary relative flex flex-col overflow-hidden rounded-[38px] select-none text-white">
              
              {/* --- SCREEN 1: MENU --- */}
              {currentScreen === 'menu' && (
                <div className="flex flex-col h-full relative">
                  {/* Menu Header */}
                  <div className="px-4 py-3 flex justify-between items-center border-b border-blue-400/20 bg-blue-primary">
                    <span className="text-lg font-black uppercase tracking-wider">Rest<span className="text-yellow-400">OS</span></span>
                    
                    <div className="flex items-center gap-2">
                      {/* Your Orders/Tracker Icon trigger */}
                      <button 
                        onClick={() => setCurrentScreen('tracker')}
                        className="relative p-2 rounded-full transition-colors bg-blue-light/50 text-white hover:bg-blue-light"
                        title="Your Orders"
                      >
                        <ClipboardList size={16} />
                        {Object.values(orders).filter(o => o.tableId === 12).length > 0 && (
                          <span className="absolute -top-1 -right-1 bg-yellow-400 text-blue-950 text-[8px] font-black px-1 rounded-full border border-blue-primary">
                            {Object.values(orders).filter(o => o.tableId === 12).length}
                          </span>
                        )}
                      </button>

                      {/* Cart Icon trigger */}
                      <button 
                        onClick={() => cart.length > 0 && setCurrentScreen('cart')}
                        className={`relative p-2 rounded-full transition-colors ${cart.length > 0 ? 'bg-yellow-400 text-blue-950 font-bold' : 'bg-blue-light/50 text-white'}`}
                      >
                        <ShoppingBag size={16} />
                        {cart.length > 0 && (
                          <span className="absolute -top-1.5 -right-1.5 bg-red-500 text-white text-[9px] font-black w-4.5 h-4.5 rounded-full flex items-center justify-center border border-blue-primary">
                            {cart.reduce((sum, item) => sum + item.qty, 0)}
                          </span>
                        )}
                      </button>
                    </div>
                  </div>

                  {/* Table active status banner */}
                  <div className="bg-white text-blue-primary text-center py-1.5 px-3 mx-4 my-2 rounded-full font-bold text-xs uppercase tracking-wider shadow-sm flex items-center justify-center gap-1.5">
                    <span className="w-2 h-2 bg-green-500 rounded-full animate-pulse-green"></span>
                    Table 12 &bull; Session Active
                  </div>

                  {/* Top horizontal pills */}
                  <div className="flex overflow-x-auto no-scrollbar gap-2 px-4 py-2 bg-blue-dark/30 border-b border-blue-400/10">
                    {CATEGORIES.map((cat) => (
                      <button
                        key={cat.key}
                        onClick={() => selectCategory(cat.key)}
                        className={`px-4 py-1.5 rounded-full text-[10px] font-black uppercase tracking-wider whitespace-nowrap transition-colors border ${
                          activeCategory === cat.key
                            ? 'bg-white text-blue-primary border-white shadow-sm'
                            : 'bg-transparent text-blue-100 border-blue-400/30 hover:bg-blue-light/20'
                        }`}
                      >
                        {cat.name}
                      </button>
                    ))}
                  </div>

                  {/* Two-column Area: Sidebar + Grid */}
                  <div className="flex-1 flex overflow-hidden">
                    {/* Left Sidebar */}
                    <div className="w-[60px] bg-blue-dark/50 border-r border-blue-400/10 flex flex-col items-center py-4 gap-4 overflow-y-auto no-scrollbar">
                      {CATEGORIES.map((cat) => (
                        <button
                          key={cat.key}
                          onClick={() => selectCategory(cat.key)}
                          className={`flex flex-col items-center transition-all ${activeCategory === cat.key ? 'scale-110 opacity-100' : 'opacity-60 hover:opacity-85'}`}
                        >
                          <div className={`w-10 h-10 rounded-full flex items-center justify-center text-lg shadow-sm border ${
                            activeCategory === cat.key ? 'bg-yellow-400 border-yellow-400' : 'bg-blue-primary/40 border-blue-400/15'
                          }`}>
                            {cat.icon}
                          </div>
                          <span className="text-[7px] font-black tracking-wider uppercase mt-1 text-center truncate w-12 text-blue-100">
                            {cat.name}
                          </span>
                        </button>
                      ))}
                      {/* Additional static categories for visual filler */}
                      {['Mains', 'Drinks', 'Mocktails', 'Specials'].map((fill, i) => (
                        <div key={i} className="flex flex-col items-center opacity-30 cursor-not-allowed">
                          <div className="w-10 h-10 rounded-full bg-blue-primary/20 border border-blue-400/10 flex items-center justify-center text-lg">
                            {['🍽️', '🥤', '🧃', '⭐'][i]}
                          </div>
                          <span className="text-[7px] font-black tracking-wider uppercase mt-1 text-center truncate w-12">{fill}</span>
                        </div>
                      ))}
                    </div>

                    {/* Right Menu Grid */}
                    <div className="flex-1 p-3 overflow-y-auto no-scrollbar bg-blue-dark/10">
                      <p className="text-[10px] font-black tracking-widest text-blue-200 uppercase mb-2">
                        {activeCategory} ({MENU_DATA[activeCategory]?.length || 0})
                      </p>
                      
                      <div className="grid grid-cols-2 gap-2">
                        {MENU_DATA[activeCategory]?.map((item) => (
                          <div
                            key={item.id}
                            onClick={() => handleItemTap(item)}
                            className="bg-white rounded-2xl p-2.5 flex flex-col justify-between shadow-md cursor-pointer hover:scale-[1.02] active:scale-[0.98] transition-all border border-blue-100 text-slate-800"
                          >
                            {/* Gradient emoji preview */}
                            <div className="w-full aspect-[4/3] bg-gradient-to-tr from-blue-50 to-blue-100/60 rounded-xl flex items-center justify-center text-3xl mb-2 relative overflow-hidden">
                              <span>{item.icon}</span>
                              <span className={`absolute top-1 right-1 w-2 h-2 rounded-full ${item.type === 'veg' ? 'bg-green-500' : 'bg-red-500'}`} title={item.type}></span>
                            </div>
                            
                            <h4 className="text-[10px] font-black uppercase text-slate-900 tracking-wider truncate mb-0.5">{item.name}</h4>
                            <div className="flex justify-between items-center mt-1">
                              <span className="text-xs font-black text-blue-primary">₹{item.price}</span>
                              <span className="bg-blue-50 text-blue-primary text-[8px] font-bold px-1 py-0.5 rounded uppercase">Customize</span>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>

                  {/* Sticky Cart Bar */}
                  {cart.length > 0 && (
                    <div 
                      onClick={() => setCurrentScreen('cart')}
                      className="absolute bottom-0 left-0 right-0 bg-yellow-400 text-blue-950 font-black px-4 py-3 flex justify-between items-center rounded-t-2xl shadow-2xl cursor-pointer hover:bg-yellow-300 transition-colors z-30"
                    >
                      <span className="text-[11px] uppercase tracking-wider">
                        {cart.reduce((sum, item) => sum + item.qty, 0)} Items &bull; ₹{cartTotal}
                      </span>
                      <span className="text-[11px] uppercase tracking-widest flex items-center gap-1">
                        VIEW CART <ChevronRight size={14} />
                      </span>
                    </div>
                  )}

                  {/* Order Tracker Link if active order exists */}
                  {activeOrderId && cart.length === 0 && (
                    <Link 
                      to="/your-orders"
                      className="absolute bottom-0 left-0 right-0 bg-blue-light text-white font-black px-4 py-3 flex justify-between items-center rounded-t-2xl shadow-2xl cursor-pointer hover:bg-blue-600 transition-colors z-30 border-t border-blue-400/20 text-center"
                    >
                      <span className="text-[10px] uppercase tracking-wider flex items-center gap-1.5">
                        <span className="w-2 h-2 bg-green-400 rounded-full animate-pulse-green"></span>
                        Active Table Orders
                      </span>
                      <span className="text-[10px] uppercase tracking-widest flex items-center gap-1">
                        VIEW BILL & TRACK STATUS <ChevronRight size={12} />
                      </span>
                    </Link>
                  )}
                </div>
              )}

              {/* --- SCREEN 2: CART PAGE --- */}
              {currentScreen === 'cart' && (
                <div className="flex flex-col h-full bg-blue-dark">
                  {/* Header */}
                  <div className="px-4 py-3 flex items-center border-b border-blue-400/10">
                    <button onClick={() => setCurrentScreen('menu')} className="p-1 mr-2 text-white/80 hover:text-white">
                      <ArrowLeft size={18} />
                    </button>
                    <span className="text-sm font-black uppercase tracking-widest">YOUR ORDER</span>
                  </div>

                  {/* Cart Items list */}
                  <div className="flex-1 overflow-y-auto p-4 space-y-3">
                    <div className="text-[10px] font-black text-blue-200 uppercase mb-1">
                      {activeOrderId ? 'ROUND 2 ADDITIONS' : 'ROUND 1 ITEMS'}
                    </div>

                    {cart.map((item) => (
                      <div key={item.id} className="bg-white/5 border border-white/10 rounded-xl p-3 flex gap-3 text-left">
                        <span className="text-2xl mt-1">{item.icon}</span>
                        <div className="flex-1 min-w-0">
                          <div className="flex justify-between items-start">
                            <h4 className="text-[11px] font-black uppercase tracking-wider truncate w-32">{item.name}</h4>
                            <span className="text-xs font-bold text-yellow-400">₹{item.price}</span>
                          </div>
                          
                          <div className="text-[8px] text-blue-200 font-medium space-y-0.5 mt-1">
                            <p>Variant: {item.variant} &bull; Spice: {item.spice}</p>
                            {item.addOns.length > 0 && <p>Add-ons: {item.addOns.join(', ')}</p>}
                            {item.instructions && <p className="italic text-yellow-300">"{item.instructions}"</p>}
                          </div>

                          <div className="flex justify-between items-center mt-2.5 pt-2 border-t border-white/5">
                            <div className="flex items-center gap-2">
                              <button 
                                onClick={() => updateCartItemQty(item.id, -1)}
                                className="w-5 h-5 bg-white/10 hover:bg-white/20 text-white rounded flex items-center justify-center text-xs font-black"
                              >
                                -
                              </button>
                              <span className="text-[10px] font-black w-4 text-center">{item.qty}</span>
                              <button 
                                onClick={() => updateCartItemQty(item.id, 1)}
                                className="w-5 h-5 bg-white/10 hover:bg-white/20 text-white rounded flex items-center justify-center text-xs font-black"
                              >
                                +
                              </button>
                            </div>
                            <button 
                              onClick={() => setCart(cart.filter(c => c.id !== item.id))}
                              className="text-[9px] uppercase font-bold text-red-400 hover:text-red-300"
                            >
                              Remove
                            </button>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>

                  {/* Bill Summary and Checkout */}
                  <div className="bg-blue-primary/95 border-t border-blue-400/20 p-4 space-y-3">
                    <div className="bg-blue-dark/50 p-3 rounded-xl space-y-1.5 text-xs text-left">
                      <div className="flex justify-between">
                        <span className="text-blue-200">Subtotal</span>
                        <span className="font-semibold">₹{cartTotal}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-blue-200">GST (5%)</span>
                        <span className="font-semibold">₹{Math.round(cartTotal * 0.05)}</span>
                      </div>
                      <div className="h-px bg-white/10 my-1"></div>
                      <div className="flex justify-between font-black text-sm text-yellow-400">
                        <span>Grand Total</span>
                        <span>₹{Math.round(cartTotal * 1.05)}</span>
                      </div>
                    </div>

                    <button
                      onClick={handlePlaceOrder}
                      className="w-full py-3 bg-yellow-400 text-blue-950 font-black text-xs uppercase tracking-widest rounded-xl hover:bg-yellow-300 transition-colors shadow-lg"
                    >
                      PLACE ORDER &rarr;
                    </button>
                  </div>
                </div>
              )}

              {/* --- SCREEN 3: TRACKER / CONFIRMATION --- */}
              {currentScreen === 'tracker' && (
                <div className="flex flex-col h-full bg-blue-dark overflow-y-auto no-scrollbar p-4 text-center">
                  
                  {/* Top Header */}
                  <div className="flex justify-between items-center mb-4 shrink-0">
                    <button 
                      onClick={() => setCurrentScreen('menu')} 
                      className="text-xs uppercase font-bold tracking-widest text-blue-200 hover:text-white flex items-center gap-1"
                    >
                      <ArrowLeft size={14} /> Menu
                    </button>
                    <span className="text-[10px] font-black uppercase tracking-wider bg-blue-primary px-3 py-1 rounded-full text-white">
                      Table 12 Dashboard
                    </span>
                    <span className="text-[10px] font-bold text-yellow-400">
                      Total: ₹{tables[12]?.currentAmount || 0}
                    </span>
                  </div>

                  {/* If Table is Free (Paid & Settled) */}
                  {tables[12]?.status === 'free' && Object.values(orders).filter(o => o.tableId === 12 && o.status !== 'cancelled').length === 0 ? (
                    <div className="flex-grow flex flex-col items-center justify-center py-12 px-4 space-y-6">
                      <div className="w-16 h-16 bg-green-500 rounded-full flex items-center justify-center border-4 border-green-600/30 animate-bounce">
                        <Check size={32} className="text-white" />
                      </div>
                      <div>
                        <h3 className="text-xl font-black uppercase tracking-wider text-white">PAID & SETTLED</h3>
                        <p className="text-xs text-blue-200 mt-2 leading-relaxed">
                          Your table session has been settled. Thank you for dining with us!
                        </p>
                      </div>
                      <button
                        onClick={() => {
                          setActiveOrderId(null);
                          setCurrentScreen('menu');
                        }}
                        className="px-6 py-3 bg-yellow-400 text-blue-950 font-black text-xs uppercase tracking-widest rounded-xl hover:bg-yellow-300 transition-colors shadow-lg"
                      >
                        Place New Order
                      </button>
                    </div>
                  ) : (
                    <div className="flex-grow flex flex-col justify-between text-left space-y-4">
                      
                      {/* Active Session Status */}
                      <div className="bg-white/5 border border-white/10 rounded-xl p-3 text-xs flex justify-between items-center shrink-0">
                        <div>
                          <p className="font-bold text-white uppercase tracking-wider text-[10px]">Session Status</p>
                          <p className="text-[10px] text-blue-200 mt-0.5 font-medium">
                            {tables[12]?.status === 'bill_requested' ? '🔔 Bill Requested' : '🍽️ Dining Active'}
                          </p>
                        </div>
                        <button
                          onClick={handleRequestBill}
                          disabled={isTableBillRequested || (tables[12]?.currentAmount || 0) === 0}
                          className={`px-3 py-1.5 rounded-lg text-[9px] font-black uppercase tracking-widest transition-all ${
                            isTableBillRequested
                              ? 'bg-green-600 text-white cursor-not-allowed'
                              : (tables[12]?.currentAmount || 0) === 0
                              ? 'bg-white/10 text-white/40 cursor-not-allowed'
                              : 'bg-amber-500 hover:bg-amber-400 text-white'
                          }`}
                        >
                          {isTableBillRequested ? 'Bill Requested ✓' : 'Request Bill'}
                        </button>
                      </div>

                      {/* Orders List Container */}
                      <div className="flex-grow space-y-3 overflow-y-auto no-scrollbar pr-1 max-h-[300px]">
                        <h4 className="text-[10px] font-black uppercase tracking-wider text-blue-200 mb-1">
                          Placed Orders ({Object.values(orders).filter(o => o.tableId === 12).length})
                        </h4>

                        {Object.values(orders)
                          .filter(o => o.tableId === 12)
                          .sort((a, b) => b.id.localeCompare(a.id))
                          .map((order) => {
                            const isCancelled = order.status === 'cancelled';
                            const statuses = ['new', 'accepted', 'preparing', 'ready', 'served'];
                            const currentIdx = statuses.indexOf(order.status);

                            return (
                              <div 
                                key={order.id}
                                className={`p-3 rounded-xl border text-[11px] font-semibold ${
                                  isCancelled
                                    ? 'bg-red-500/10 border-red-500/30 text-red-200'
                                    : order.status === 'ready'
                                    ? 'bg-green-500/10 border-green-500/30 text-green-200 animate-pulse'
                                    : 'bg-white/5 border-white/10 text-white'
                                }`}
                              >
                                <div className="flex justify-between items-center pb-1.5 border-b border-white/10 mb-2">
                                  <div>
                                    <span className="font-mono font-black">{order.id}</span>
                                    <span className="text-[8px] bg-white/10 px-1 py-0.5 rounded ml-1.5">Round {order.round}</span>
                                  </div>
                                  <span className={`text-[8px] font-black px-2 py-0.5 rounded uppercase ${
                                    isCancelled
                                      ? 'bg-red-500 text-white'
                                      : order.status === 'ready'
                                      ? 'bg-green-500 text-white font-extrabold'
                                      : 'bg-blue-500 text-white'
                                  }`}>
                                    {order.status}
                                  </span>
                                </div>

                                <div className="space-y-1 mb-3">
                                  {order.items.map((item, idx) => (
                                    <div key={idx} className="flex justify-between text-[10px] opacity-90">
                                      <span>{item.qty}x {item.name} <span className="text-[8px] opacity-60">({item.variant})</span></span>
                                      <span>₹{item.price * item.qty}</span>
                                    </div>
                                  ))}
                                </div>

                                {isCancelled ? (
                                  <div className="bg-red-500/15 border border-red-500/30 rounded-lg p-2 text-[9px] text-red-200 leading-normal">
                                    <strong>Declined:</strong> {order.cancelReason || 'Unavailable'}
                                  </div>
                                ) : (
                                  <div className="relative pt-1 px-1">
                                    <div className="absolute top-[13px] left-2 right-2 h-0.5 bg-white/10 -z-10"></div>
                                    <div 
                                      className="absolute top-[13px] left-2 h-0.5 bg-yellow-400 -z-10 transition-all duration-300" 
                                      style={{ width: `${(Math.min(currentIdx, 4) / 4) * 90}%` }}
                                    ></div>
                                    <div className="flex justify-between text-[8px] font-black uppercase tracking-wider">
                                      {['Placed', 'Accepted', 'Cooking', 'Ready', 'Served'].map((step, idx) => {
                                        const isActive = idx <= currentIdx;
                                        const isExact = idx === currentIdx;
                                        return (
                                          <div 
                                            key={step} 
                                            onClick={() => setOrderTrackerStatus(order.id, statuses[idx])}
                                            className="flex flex-col items-center cursor-pointer"
                                          >
                                            <div className={`w-3.5 h-3.5 rounded-full border flex items-center justify-center mb-1 ${
                                              isExact 
                                                ? 'bg-yellow-400 border-yellow-400 animate-pulse' 
                                                : isActive 
                                                ? 'bg-green-500 border-green-500' 
                                                : 'bg-blue-dark border-white/20'
                                            }`}>
                                              {isActive && !isExact && <Check size={6} className="text-white font-bold" />}
                                            </div>
                                            <span className={isExact ? 'text-yellow-400 font-extrabold' : 'opacity-65'}>{step}</span>
                                          </div>
                                        );
                                      })}
                                    </div>
                                  </div>
                                )}
                              </div>
                            );
                          })}
                      </div>

                      {/* Micro Live Activity Feed inside phone */}
                      <div className="bg-blue-primary/30 border border-white/10 rounded-xl p-3 text-left shrink-0">
                        <div className="flex items-center justify-between pb-1.5 border-b border-white/5 mb-1.5">
                          <span className="text-[9px] font-black uppercase tracking-wider text-blue-200">Live Kitchen Updates</span>
                          <span className="w-1.5 h-1.5 bg-green-400 rounded-full animate-pulse-green"></span>
                        </div>
                        <div className="space-y-1 max-h-[60px] overflow-y-auto no-scrollbar text-[9px] font-semibold text-blue-100">
                          {notifications.filter(n => n.message.includes('Table 12') || n.message.toLowerCase().includes('order')).slice(0, 3).map((notif) => (
                            <div key={notif.id} className="flex justify-between py-0.5 border-b border-white/5 last:border-0 gap-2">
                              <span className="truncate flex-1">{notif.message}</span>
                              <span className="opacity-60 shrink-0 font-mono text-[8px]">{notif.timestamp}</span>
                            </div>
                          ))}
                          {notifications.filter(n => n.message.includes('Table 12') || n.message.toLowerCase().includes('order')).length === 0 && (
                            <p className="text-center opacity-40 py-1">No recent updates</p>
                          )}
                        </div>
                      </div>

                      {/* Action Buttons */}
                      <div className="space-y-2 mt-auto pt-2 shrink-0">
                        <button
                          onClick={handleOrderMore}
                          className="w-full py-2.5 border border-white/20 text-white hover:text-white rounded-xl text-[10px] font-black uppercase tracking-widest hover:bg-white/5 transition-colors"
                        >
                          + Order More (Round 2)
                        </button>
                      </div>

                    </div>
                  )}

                </div>
              )}

              {/* --- BOTTOM SHEET CUSTOMIZER MODAL --- */}
              {selectedItem && (
                <div className="absolute inset-0 bg-black/60 z-50 flex items-end animate-fade-in">
                  <div className="bg-white rounded-t-3xl w-full text-slate-800 flex flex-col max-h-[90%] overflow-hidden animate-slide-up">
                    
                    {/* Header */}
                    <div className="p-4 flex justify-between items-start border-b border-slate-100">
                      <div>
                        <span className="text-3xl">{selectedItem.icon}</span>
                        <h3 className="text-lg font-black uppercase tracking-wide text-slate-900 mt-1">{selectedItem.name}</h3>
                        <p className="text-xs text-blue-primary font-black mt-0.5">₹{selectedItem.price}</p>
                      </div>
                      <button 
                        onClick={() => setSelectedItem(null)}
                        className="p-1 bg-slate-100 hover:bg-slate-200 text-slate-500 rounded-full"
                      >
                        <X size={16} />
                      </button>
                    </div>

                    {/* Scrollable details */}
                    <div className="p-4 overflow-y-auto space-y-4 text-left">
                      <p className="text-xs text-slate-500 font-medium leading-relaxed">{selectedItem.desc}</p>
                      
                      {/* Variant Selection */}
                      <div>
                        <h4 className="text-[10px] font-black uppercase tracking-wider text-slate-400 mb-2">Select Variant</h4>
                        <div className="flex gap-2">
                          {['Small', 'Regular', 'Large'].map((v) => (
                            <button
                              key={v}
                              onClick={() => setVariant(v)}
                              className={`flex-1 py-2 rounded-xl text-[10px] font-bold uppercase tracking-wider border text-center transition-colors ${
                                variant === v
                                  ? 'bg-blue-primary text-white border-blue-primary shadow'
                                  : 'bg-white text-slate-600 border-slate-200 hover:bg-slate-50'
                              }`}
                            >
                              {v}
                            </button>
                          ))}
                        </div>
                      </div>

                      {/* Spice Level selection */}
                      {selectedItem.id.startsWith('ra-') && (
                        <div>
                          <h4 className="text-[10px] font-black uppercase tracking-wider text-slate-400 mb-2">Spice Level</h4>
                          <div className="flex flex-wrap gap-1.5">
                            {['None', 'Mild', 'Medium', 'Hot', 'Extra Hot'].map((s) => (
                              <button
                                key={s}
                                onClick={() => setSpice(s)}
                                className={`px-3 py-1.5 rounded-full text-[9px] font-bold uppercase tracking-wider border transition-colors ${
                                  spice === s
                                    ? 'bg-red-500 text-white border-red-500 shadow'
                                    : 'bg-white text-slate-600 border-slate-200 hover:bg-slate-50'
                                }`}
                              >
                                {s}
                              </button>
                            ))}
                          </div>
                        </div>
                      )}

                      {/* Add-ons selection */}
                      <div>
                        <h4 className="text-[10px] font-black uppercase tracking-wider text-slate-400 mb-2">Add-ons</h4>
                        <div className="grid grid-cols-2 gap-2">
                          {[
                            { key: 'extraCheese', label: 'Extra Cheese', price: 50 },
                            { key: 'extraEgg', label: 'Extra Egg', price: 40 },
                            { key: 'extraSauce', label: 'Extra Sauce', price: 30 },
                            { key: 'noriSheets', label: 'Nori Sheets', price: 20 }
                          ].map((addon) => (
                            <label 
                              key={addon.key} 
                              className={`p-2.5 rounded-xl border flex items-center justify-between cursor-pointer transition-colors ${
                                addOns[addon.key] ? 'bg-blue-50/60 border-blue-primary' : 'bg-white border-slate-200'
                              }`}
                            >
                              <div className="flex items-center gap-2">
                                <input
                                  type="checkbox"
                                  checked={addOns[addon.key]}
                                  onChange={(e) => setAddOns({ ...addOns, [addon.key]: e.target.checked })}
                                  className="accent-blue-primary rounded"
                                />
                                <span className="text-[10px] font-semibold text-slate-700">{addon.label}</span>
                              </div>
                              <span className="text-[10px] font-bold text-blue-primary">+₹{addon.price}</span>
                            </label>
                          ))}
                        </div>
                      </div>

                      {/* Special Instructions */}
                      <div>
                        <h4 className="text-[10px] font-black uppercase tracking-wider text-slate-400 mb-2">Special Instructions</h4>
                        <input
                          type="text"
                          value={instructions}
                          onChange={(e) => setInstructions(e.target.value)}
                          placeholder="Less salt please, no onions..."
                          className="w-full p-2.5 rounded-xl border border-slate-200 text-xs focus:outline-none focus:border-blue-primary bg-slate-50"
                        />
                      </div>

                      {/* Quantity Selection */}
                      <div className="pt-3 border-t border-slate-100 flex items-center justify-between">
                        <span className="text-[10px] font-black uppercase tracking-wider text-slate-400">Quantity</span>
                        <div className="flex items-center gap-3">
                          <button
                            onClick={() => setQty(q => Math.max(1, q - 1))}
                            className="w-7 h-7 bg-slate-100 hover:bg-slate-200 text-slate-800 rounded-xl flex items-center justify-center font-black text-sm transition-colors"
                          >
                            -
                          </button>
                          <span className="text-sm font-black w-4 text-center">{qty}</span>
                          <button
                            onClick={() => setQty(q => q + 1)}
                            className="w-7 h-7 bg-slate-100 hover:bg-slate-200 text-slate-800 rounded-xl flex items-center justify-center font-black text-sm transition-colors"
                          >
                            +
                          </button>
                        </div>
                      </div>

                    </div>

                    {/* Checkout Button */}
                    <div className="p-4 bg-slate-50 border-t border-slate-100">
                      <button
                        onClick={handleAddToCart}
                        className="w-full py-3.5 bg-blue-primary text-white font-black text-xs uppercase tracking-widest rounded-xl hover:bg-blue-dark transition-colors shadow-md"
                      >
                        ADD TO CART &bull; ₹{
                          (selectedItem.price + 
                          (addOns.extraCheese ? 50 : 0) + 
                          (addOns.extraEgg ? 40 : 0) + 
                          (addOns.extraSauce ? 30 : 0) + 
                          (addOns.noriSheets ? 20 : 0)) * qty
                        }
                      </button>
                    </div>

                  </div>
                </div>
              )}

            </div>
          </div>
        </div>

        {/* Right 40%: Feature lists and Sync box */}
        <div className="lg:col-span-5 space-y-6">
          <div className="bg-white p-8 rounded-3xl border border-blue-100 shadow-xl text-left">
            <h2 className="text-2xl font-black uppercase text-blue-primary tracking-tight mb-4">
              WHAT YOUR GUESTS EXPERIENCE
            </h2>
            
            <ul className="space-y-4">
              {[
                { title: 'QR SCAN INSTANT ENTRY', desc: 'Saves downloading heavy apps or loading logins; users scan and order directly from their browsers.' },
                { title: '10 CATEGORIES & 30+ ITEMS', desc: 'Browse multiple categories instantly using the horizontal scrolling pill headers or the sidebar shortcut icons.' },
                { title: 'PRECISE MODIFIERS Selection', desc: 'Configure variants (size), spice levels, and multiple add-ons. Changes reflect in pricing immediately.' },
                { title: 'REAL-TIME TIMELINE TRACKING', desc: 'Track preparation phases from Kitchen acceptance to server delivery directly on screen.' },
                { title: 'MULTI-ROUND ORDERING', desc: 'Place secondary rounds of desserts or extra drinks while your main table bill continues updating.' },
                { title: 'ONE-TAP BILL REQUEST', desc: 'Notify waiters immediately when ready to settle, and trigger POS payment preparations.' }
              ].map((feature, i) => (
                <li key={i} className="flex items-start gap-3">
                  <span className="text-blue-primary text-xl font-bold mt-0.5">✦</span>
                  <div>
                    <h4 className="text-[11px] font-black uppercase tracking-wider text-blue-primary">{feature.title}</h4>
                    <p className="text-xs text-slate-600 leading-relaxed font-medium">{feature.desc}</p>
                  </div>
                </li>
              ))}
            </ul>
          </div>

          {/* Sync status box */}
          <div className="bg-blue-primary text-white p-6 rounded-3xl border border-blue-400/20 shadow-xl text-left">
            <h3 className="text-xs uppercase font-black tracking-widest text-blue-200 mb-4">LIVE WORKSPACE CONNECTION</h3>
            
            <div className="space-y-3 font-semibold text-xs">
              <div className="flex items-center justify-between pb-2 border-b border-blue-400/20">
                <span>Kitchen Display</span>
                <span className="flex items-center gap-1.5 text-green-400 font-bold">
                  <span className="w-2.5 h-2.5 bg-green-500 rounded-full animate-pulse-green"></span>
                  CONNECTED
                </span>
              </div>
              <div className="flex items-center justify-between pb-2 border-b border-blue-400/20">
                <span>Owner's Dashboard</span>
                <span className="flex items-center gap-1.5 text-green-400 font-bold">
                  <span className="w-2.5 h-2.5 bg-green-500 rounded-full animate-pulse-green"></span>
                  CONNECTED
                </span>
              </div>
              <div className="flex items-center justify-between pt-1">
                <span className="text-blue-200">Session Status</span>
                <span className="font-mono text-yellow-300">
                  {activeOrderId ? `Active (${activeOrderId})` : 'Awaiting Table 12 Order'}
                </span>
              </div>
              {activeOrderId && orders[activeOrderId] && (
                <div className="bg-blue-dark/50 p-2.5 rounded-lg text-[10px] font-mono text-blue-200 mt-2">
                  Last State change: {orders[activeOrderId].status.toUpperCase()}
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default GuestOrdering;
