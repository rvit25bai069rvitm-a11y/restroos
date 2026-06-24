import React from 'react';
import { Link } from 'react-router-dom';

const Footer = () => {
  return (
    <footer className="bg-blue-dark text-white py-12 px-6 border-t border-blue-900 mt-auto">
      <div className="max-w-7xl mx-auto flex flex-col items-center justify-center text-center">
        {/* Large Logo */}
        <Link 
          to="/" 
          className="text-4xl font-black uppercase tracking-wider text-white mb-2"
          style={{ fontFamily: 'var(--font-heading)' }}
        >
          Rest<span className="text-yellow-400">OS</span>
        </Link>
        
        <p className="text-blue-200 text-sm mb-6 max-w-md font-medium">
          Powering smarter restaurants. A unified demo of contactless guest ordering, KDS screen, billing POS, and real-time dashboard analytics.
        </p>

        {/* Links repeated */}
        <nav className="flex flex-wrap gap-6 md:gap-10 justify-center mb-8">
          <Link to="/" className="text-xs uppercase font-bold tracking-widest text-blue-200 hover:text-white transition-colors">Home</Link>
          <Link to="/guest-ordering" className="text-xs uppercase font-bold tracking-widest text-blue-200 hover:text-white transition-colors">Guest Ordering</Link>
          <Link to="/kitchen-display" className="text-xs uppercase font-bold tracking-widest text-blue-200 hover:text-white transition-colors">Kitchen Display</Link>
          <Link to="/owner-dashboard" className="text-xs uppercase font-bold tracking-widest text-blue-200 hover:text-white transition-colors">Owner's Desk</Link>
          <Link to="/billing" className="text-xs uppercase font-bold tracking-widest text-blue-200 hover:text-white transition-colors">Billing & POS</Link>
        </nav>

        {/* Copyright */}
        <div className="text-xs text-blue-300/60 font-mono">
          &copy; 2026 RestOS. All rights reserved. Made for Restaurant Operations Excellence.
        </div>
      </div>
    </footer>
  );
};

export default Footer;
