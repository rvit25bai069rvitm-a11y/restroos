import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import { useRestOS } from '../context/RestOSContext';
import { Activity, RefreshCw } from 'lucide-react';

const Navbar = () => {
  const { lastAction, lastActionTime, resetDemo } = useRestOS();
  const location = useLocation();

  const navLinks = [
    { name: 'Guest Ordering', path: '/guest-ordering' },
    { name: 'Your Orders', path: '/your-orders' },
    { name: 'Kitchen Display', path: '/kitchen-display' },
    { name: 'Owner Dashboard', path: '/owner-dashboard' },
    { name: 'Billing & POS', path: '/billing' }
  ];

  return (
    <header className="sticky top-0 z-50 w-full bg-blue-primary text-white border-b border-blue-light shadow-md">
      <div className="max-w-7xl mx-auto px-4 md:px-8">
        {/* Top bar for small screens or sync info */}
        <div className="flex flex-wrap items-center justify-between py-2 border-b border-blue-light text-xs text-blue-200">
          <div className="flex items-center gap-2">
            <span className="inline-block w-2.5 h-2.5 bg-green-500 rounded-full animate-pulse-green"></span>
            <span className="font-semibold uppercase tracking-wider">LIVE SYNC ACTIVE</span>
            <span className="hidden sm:inline opacity-60">|</span>
            <span className="hidden sm:inline font-mono">Last Action: {lastAction} ({lastActionTime})</span>
          </div>
          <button 
            onClick={resetDemo} 
            className="flex items-center gap-1.5 hover:text-white transition-colors bg-blue-light hover:bg-blue-dark px-2 py-0.5 rounded text-[10px] uppercase font-bold tracking-wider"
          >
            <RefreshCw size={10} /> Reset Demo Data
          </button>
        </div>

        {/* Main Nav Bar */}
        <div className="flex flex-col md:flex-row items-center justify-between py-4 md:h-[64px]">
          {/* Left - Link */}
          <div className="flex-1 hidden md:flex items-center justify-start gap-4">
            {navLinks.slice(0, 2).map((link) => {
              const isActive = location.pathname === link.path;
              return (
                <Link
                  key={link.path}
                  to={link.path}
                  className={`text-[13px] font-black uppercase tracking-widest transition-all duration-200 hover:text-white ${
                    isActive ? 'text-white border-b-2 border-white pb-1' : 'text-blue-100 opacity-85 hover:opacity-100'
                  }`}
                >
                  {link.name}
                </Link>
              );
            })}
          </div>

          {/* Logo Center */}
          <Link 
            to="/" 
            className="text-3xl font-black uppercase tracking-wider text-white select-none hover:scale-105 transition-transform"
            style={{ fontFamily: 'var(--font-heading)' }}
          >
            Rest<span className="text-yellow-400">OS</span>
          </Link>

          {/* Right - Link */}
          <div className="flex-1 hidden md:flex items-center justify-end gap-6">
            {navLinks.slice(2).map((link) => {
              const isActive = location.pathname === link.path;
              return (
                <Link
                  key={link.path}
                  to={link.path}
                  className={`text-[13px] font-black uppercase tracking-widest transition-all duration-200 hover:text-white ${
                    isActive ? 'text-white border-b-2 border-white pb-1' : 'text-blue-100 opacity-85 hover:opacity-100'
                  }`}
                >
                  {link.name}
                </Link>
              );
            })}
          </div>

          {/* Mobile links list */}
          <div className="flex md:hidden flex-wrap justify-center gap-4 mt-3 w-full border-t border-blue-800/40 pt-3">
            {navLinks.map((link) => {
              const isActive = location.pathname === link.path;
              return (
                <Link
                  key={link.path}
                  to={link.path}
                  className={`text-[11px] font-black uppercase tracking-wider ${
                    isActive ? 'text-yellow-400 font-black' : 'text-blue-100 opacity-80'
                  }`}
                >
                  {link.name}
                </Link>
              );
            })}
          </div>
        </div>
      </div>
    </header>
  );
};

export default Navbar;
