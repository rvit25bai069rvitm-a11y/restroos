import React from 'react';
import { Link } from 'react-router-dom';
import { 
  QrCode, 
  Tv, 
  TrendingUp, 
  ArrowRight, 
  Smartphone, 
  Receipt, 
  CheckCircle,
  Coffee,
  ChefHat,
  Bell,
  Clock
} from 'lucide-react';

const LandingPage = () => {
  const steps = [
    {
      num: '01',
      title: 'QR SCAN ORDERING',
      desc: 'Guests scan table QR codes to browse categories, customize orders, and submit instantly.',
      icon: <QrCode className="text-blue-primary" size={28} />
    },
    {
      num: '02',
      title: 'KITCHEN RECEPTION',
      desc: 'The kitchen team receives the orders immediately on the KDS monitor with timers and sound alerts.',
      icon: <ChefHat className="text-blue-primary" size={28} />
    },
    {
      num: '03',
      title: 'WAITER DESPATCH',
      desc: 'Once marked ready, KDS sends waiter notifications to serve fresh items straight to the table.',
      icon: <Bell className="text-blue-primary" size={28} />
    },
    {
      num: '04',
      title: 'AUTOMATIC BILLING',
      desc: 'Guests request bills from their phones, and the POS immediately structures the split or full invoice.',
      icon: <Receipt className="text-blue-primary" size={28} />
    },
    {
      num: '05',
      title: 'OWNER ANALYTICS',
      desc: 'Owners track sales, peak times, and table states in real time from a live interactive dashboard.',
      icon: <TrendingUp className="text-blue-primary" size={28} />
    }
  ];

  const devices = [
    {
      name: 'GUEST ORDERING',
      desc: 'Responsive, fast mobile ordering interface featuring customized selections and a live status tracker.',
      cta: 'View Guest Ordering',
      link: '/guest-ordering',
      type: 'phone',
      preview: (
        <div className="bg-[#1C4FD8]/10 h-full p-4 flex flex-col justify-between text-left text-xs">
          <div className="flex justify-between items-center pb-2 border-b border-blue-900/20">
            <span className="font-black text-blue-primary tracking-wider">RestOS Menu</span>
            <span className="bg-blue-primary text-white text-[9px] px-1.5 py-0.5 rounded-full">🛒 3 items</span>
          </div>
          <div className="my-auto space-y-2">
            <div className="bg-white p-2 rounded-lg shadow-sm border border-blue-100">
              <div className="w-8 h-8 bg-amber-400 rounded-full flex items-center justify-center text-sm">🍜</div>
              <p className="font-bold text-[10px] uppercase mt-1">Spicy Chicken Ramen</p>
              <p className="text-blue-primary font-bold text-[9px]">₹480</p>
            </div>
            <div className="bg-white p-2 rounded-lg shadow-sm border border-blue-100 opacity-70">
              <div className="w-8 h-8 bg-green-400 rounded-full flex items-center justify-center text-sm">🥟</div>
              <p className="font-bold text-[10px] uppercase mt-1">Veg Gyoza</p>
              <p className="text-blue-primary font-bold text-[9px]">₹220</p>
            </div>
          </div>
          <div className="bg-blue-primary text-white text-center py-1.5 rounded-md font-bold text-[9px] uppercase tracking-wider">
            View Cart &rarr;
          </div>
        </div>
      )
    },
    {
      name: 'KITCHEN KDS',
      desc: 'A dark-theme, real-time screen with ticket timers, urgency-themed borders, and quick preparation management.',
      cta: 'Open KDS Screen',
      link: '/kitchen-display',
      type: 'monitor',
      preview: (
        <div className="bg-[#111318] h-full p-3 flex flex-col justify-between text-left text-[10px] text-white">
          <div className="flex justify-between items-center pb-1.5 border-b border-gray-800 text-[8px] tracking-wider text-gray-400 font-mono">
            <span>KDS ACTIVE • 14 ORDERS</span>
            <span>12:34 PM</span>
          </div>
          <div className="grid grid-cols-2 gap-2 my-auto">
            <div className="border-l-4 border-green-500 bg-gray-900 p-2 rounded">
              <div className="flex justify-between font-bold text-gray-300 border-b border-gray-800 pb-0.5 mb-1">
                <span>ORD-0042</span>
                <span className="text-green-400">03:25</span>
              </div>
              <p className="font-semibold text-white">2x Veg Gyoza</p>
              <p className="text-[8px] text-gray-400 italic">Less salt</p>
            </div>
            <div className="border-l-4 border-amber-500 bg-gray-900 p-2 rounded">
              <div className="flex justify-between font-bold text-gray-300 border-b border-gray-800 pb-0.5 mb-1">
                <span>ORD-0038</span>
                <span className="text-amber-400">14:12</span>
              </div>
              <p className="font-semibold text-white">1x Miso Ramen</p>
            </div>
          </div>
          <div className="bg-green-600 text-white text-center py-1 rounded text-[8px] font-bold uppercase tracking-wider">
            Ready for Pickup Banner Active
          </div>
        </div>
      )
    },
    {
      name: 'OWNER BOARD',
      desc: 'Comprehensive dashboard presenting real-time tables, revenue trends, popular orders, and waiter metrics.',
      cta: 'Open Owner Desk',
      link: '/owner-dashboard',
      type: 'dashboard',
      preview: (
        <div className="bg-slate-50 h-full p-3 flex flex-col justify-between text-left text-[9px]">
          <div className="flex justify-between items-center pb-1.5 border-b border-slate-200">
            <span className="font-black text-slate-800 uppercase text-[9px] tracking-wider">Owner's Desk</span>
            <span className="text-blue-primary font-bold">₹48,750 today</span>
          </div>
          <div className="my-auto space-y-1.5">
            <div className="grid grid-cols-3 gap-1.5">
              <div className="bg-white p-1 rounded border border-slate-200 text-center">
                <p className="text-slate-400 text-[7px] uppercase font-bold">Orders</p>
                <p className="font-black text-blue-primary text-xs">128</p>
              </div>
              <div className="bg-white p-1 rounded border border-slate-200 text-center">
                <p className="text-slate-400 text-[7px] uppercase font-bold">Tables</p>
                <p className="font-black text-yellow-500 text-xs">16/24</p>
              </div>
              <div className="bg-white p-1 rounded border border-slate-200 text-center">
                <p className="text-slate-400 text-[7px] uppercase font-bold">Active</p>
                <p className="font-black text-green-500 text-xs">8</p>
              </div>
            </div>
            <div className="bg-white p-1.5 rounded border border-slate-200 flex justify-between items-center">
              <span className="font-semibold">Table 12 Request</span>
              <span className="bg-yellow-400 text-[7px] text-yellow-950 px-1 py-0.5 rounded font-bold uppercase">Bill Requested</span>
            </div>
          </div>
          <div className="text-[7px] text-slate-400 text-center font-mono">
            Synced with Kitchen and Billing Engine
          </div>
        </div>
      )
    }
  ];

  return (
    <div className="flex flex-col min-h-screen">
      {/* Hero Section */}
      <section className="bg-blue-primary text-white py-16 md:py-24 px-6 relative overflow-hidden">
        <div className="max-w-7xl mx-auto text-center flex flex-col items-center relative z-10">
          <span className="bg-blue-light text-white font-black text-xs md:text-sm px-4 py-1.5 rounded-full uppercase tracking-widest mb-6 border border-blue-400/30">
            Unified Restaurant OS
          </span>

          <h1 
            className="text-5xl sm:text-7xl md:text-8xl lg:text-[100px] font-black uppercase tracking-tight leading-none max-w-5xl mb-6 select-none"
            style={{ fontFamily: 'var(--font-heading)' }}
          >
            RESTAURANT OPERATIONS.<br />
            <span className="text-yellow-400">SIMPLIFIED.</span>
          </h1>

          <p className="text-lg md:text-2xl text-blue-100 font-medium max-w-3xl mb-10 leading-relaxed">
            QR Ordering &bull; Kitchen Display &bull; Billing &bull; Table Management <br />
            <span className="text-white font-bold opacity-100">&mdash; all connected in one real-time system.</span>
          </p>

          {/* CTA Buttons */}
          <div className="flex flex-col sm:flex-row gap-4 mb-16 justify-center w-full max-w-md sm:max-w-2xl px-4">
            <Link 
              to="/guest-ordering" 
              className="bg-white text-blue-primary hover:bg-yellow-400 hover:text-blue-950 transition-all font-black text-sm uppercase tracking-widest px-8 py-4.5 rounded-full text-center shadow-lg"
            >
              GUEST ORDERING DEMO
            </Link>
            <Link 
              to="/kitchen-display" 
              className="bg-blue-light text-white hover:bg-white hover:text-blue-primary transition-all font-black text-sm uppercase tracking-widest px-8 py-4.5 rounded-full text-center border border-blue-400/30 shadow-lg"
            >
              KITCHEN DISPLAY (KDS)
            </Link>
            <Link 
              to="/owner-dashboard" 
              className="bg-blue-dark text-white hover:bg-yellow-400 hover:text-blue-950 transition-all font-black text-sm uppercase tracking-widest px-8 py-4.5 rounded-full text-center shadow-lg"
            >
              OWNER'S DESK
            </Link>
          </div>

          {/* Connected Flow Cards */}
          <div className="w-full max-w-6xl mt-6">
            <p className="text-xs uppercase font-black tracking-widest text-blue-200 mb-6">REAL-TIME DATA FLOW SIMULATION</p>
            <div className="grid grid-cols-1 md:grid-cols-5 gap-4 items-center">
              {[
                { label: 'Customer Places Order', icon: '📱', color: 'border-yellow-400' },
                { label: 'Kitchen Receives Instantly', icon: '🍳', color: 'border-green-400' },
                { label: 'Waiter Serves Hot Food', icon: '🍽️', color: 'border-blue-400' },
                { label: 'Bill Generated Instantly', icon: '🧾', color: 'border-amber-400' },
                { label: 'Owner Tracks KPIs Live', icon: '📈', color: 'border-purple-400' }
              ].map((flow, index) => (
                <React.Fragment key={index}>
                  <div className={`bg-white text-blue-dark p-5 rounded-2xl shadow-xl flex flex-col items-center justify-center border-b-4 ${flow.color} transform hover:-translate-y-1 transition-all duration-200 h-28`}>
                    <span className="text-2xl mb-1.5">{flow.icon}</span>
                    <span className="text-xs font-black uppercase tracking-wider text-center">{flow.label}</span>
                  </div>
                  {index < 4 && (
                    <div className="hidden md:flex justify-center text-blue-300 animate-pulse">
                      <ArrowRight size={24} />
                    </div>
                  )}
                </React.Fragment>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* How It Works Section */}
      <section className="bg-white py-20 px-6">
        <div className="max-w-7xl mx-auto text-center">
          <span className="text-blue-primary font-black text-xs uppercase tracking-widest mb-2 inline-block">THE FULL PIPELINE</span>
          <h2 className="text-4xl md:text-5xl font-black uppercase text-blue-primary tracking-tight mb-12">HOW IT WORKS</h2>

          {/* Timeline Cards */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-6 text-left">
            {steps.map((step) => (
              <div 
                key={step.num}
                className="bg-off-white p-6 rounded-2xl border border-blue-100 hover:border-blue-primary hover:shadow-lg transition-all duration-300 flex flex-col h-full"
              >
                <div className="flex justify-between items-center mb-6">
                  <div className="p-3 bg-white rounded-xl shadow-sm border border-blue-50/50">
                    {step.icon}
                  </div>
                  <span className="text-2xl font-black text-blue-primary/30 tracking-widest">{step.num}</span>
                </div>
                <h3 className="text-lg font-black uppercase text-blue-primary tracking-wide mb-2">{step.title}</h3>
                <p className="text-sm text-slate-600 leading-relaxed font-medium mt-auto">{step.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Demo Preview Section */}
      <section className="bg-blue-primary text-white py-20 px-6 border-t border-blue-light">
        <div className="max-w-7xl mx-auto text-center">
          <span className="text-blue-200 font-black text-xs uppercase tracking-widest mb-2 inline-block">LIVE PREVIEW CARDS</span>
          <h2 className="text-4xl md:text-5xl font-black uppercase tracking-tight mb-12">EXPLORE THE STATIONS</h2>

          {/* 3 Column Grid */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {devices.map((device, idx) => (
              <div 
                key={idx}
                className="bg-[#2558E8] rounded-3xl p-6 flex flex-col border border-blue-400/20 shadow-xl hover:-translate-y-1.5 transition-all duration-300"
              >
                {/* Simulated Screen Box */}
                <div className="w-full aspect-[4/3] bg-[#1C4FD8]/40 rounded-2xl overflow-hidden mb-6 border border-blue-400/10 shadow-inner">
                  {device.preview}
                </div>

                <div className="text-left flex-1 flex flex-col">
                  <h3 className="text-xl font-black uppercase tracking-wider mb-2 text-white">{device.name}</h3>
                  <p className="text-sm text-blue-100 leading-relaxed font-medium mb-6 flex-1">{device.desc}</p>
                  
                  <Link 
                    to={device.link}
                    className="w-full py-3 bg-white text-blue-primary text-center rounded-xl font-black uppercase tracking-widest hover:bg-yellow-400 hover:text-blue-950 transition-colors shadow-md text-xs mt-auto"
                  >
                    {device.cta}
                  </Link>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>
    </div>
  );
};

export default LandingPage;
