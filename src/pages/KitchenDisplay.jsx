import React, { useState, useEffect } from 'react';
import { useRestOS } from '../context/RestOSContext';
import { 
  Tv, 
  Clock, 
  Check, 
  X, 
  AlertTriangle, 
  AlertCircle,
  Play,
  RotateCcw
} from 'lucide-react';

// Sub-component for individual ticket timers
const TicketTimer = ({ initialSeconds }) => {
  const [seconds, setSeconds] = useState(initialSeconds);

  useEffect(() => {
    const timer = setInterval(() => {
      setSeconds(prev => prev + 1);
    }, 1000);
    return () => clearInterval(timer);
  }, []);

  const formatTime = (totalSecs) => {
    const mins = Math.floor(totalSecs / 60);
    const secs = totalSecs % 60;
    return `${String(mins).padStart(2, '0')}:${String(secs).padStart(2, '0')}`;
  };

  const getColorClass = (totalSecs) => {
    if (totalSecs < 600) return 'text-green-400 border-green-500/30'; // < 10 mins
    if (totalSecs < 1200) return 'text-yellow-400 border-yellow-500/30'; // 10-20 mins
    return 'text-red-400 border-red-500/30'; // > 20 mins
  };

  return (
    <span className={`font-mono font-bold px-2 py-0.5 rounded border text-xs bg-black/30 ${getColorClass(seconds)}`}>
      {formatTime(seconds)}
    </span>
  );
};

const KitchenDisplay = () => {
  const {
    orders,
    acceptOrder,
    cancelOrder,
    startPreparingOrder,
    markOrderReady,
    markOrderServed,
    lastAction,
    lastActionTime
  } = useRestOS();

  // Clock
  const [time, setTime] = useState(new Date());
  useEffect(() => {
    const timer = setInterval(() => setTime(new Date()), 1000);
    return () => clearInterval(timer);
  }, []);

  // Cancellation Modal states
  const [cancellingOrderId, setCancellingOrderId] = useState(null);
  const [pin, setPin] = useState('');
  const [cancelReason, setCancelReason] = useState('Item unavailable');
  const [pinError, setPinError] = useState('');

  // Map to hold order initial timer offsets so they don't reset when component re-renders
  const [timerOffsets] = useState(() => {
    return {
      'ORD-0031': 2400, // 40 mins
      'ORD-0032': 1395, // 23 mins 15s
      'ORD-0038': 852,  // 14 mins 12s
      'ORD-0042': 205   // 3 mins 25s
    };
  });

  const getTimerOffset = (orderId) => {
    if (timerOffsets[orderId]) return timerOffsets[orderId];
    // If it's a new order created during this session, start from 0
    return 0;
  };

  // Filter orders by status
  const activeOrdersList = Object.values(orders).filter(o => o.status !== 'cancelled' && o.status !== 'served');
  
  const newOrders = activeOrdersList.filter(o => o.status === 'new');
  const inProgressOrders = activeOrdersList.filter(o => o.status === 'accepted' || o.status === 'preparing');
  const readyOrders = activeOrdersList.filter(o => o.status === 'ready');

  // Find the last ready order to display in the header banner
  const lastReadyOrder = readyOrders[readyOrders.length - 1];

  const handleCancelClick = (orderId) => {
    setCancellingOrderId(orderId);
    setPin('');
    setPinError('');
  };

  const handleConfirmCancel = (e) => {
    e.preventDefault();
    if (pin === '1234') {
      cancelOrder(cancellingOrderId, cancelReason);
      setCancellingOrderId(null);
    } else {
      setPinError('Invalid Manager PIN. Use 1234');
    }
  };

  return (
    <div className="bg-dark-bg min-h-screen text-gray-100 flex flex-col font-sans">
      
      {/* Top Header Banner (Kozy blue style) */}
      <div className="bg-blue-primary text-white py-6 px-6 text-center border-b border-blue-900 shadow-md">
        <span className="bg-blue-dark text-white font-black text-xs px-3 py-1 rounded-full uppercase tracking-wider mb-2.5 inline-block">
          STATION 02
        </span>
        <h1 className="text-3xl md:text-4xl font-black uppercase tracking-wider">KITCHEN DISPLAY SYSTEM</h1>
        <p className="text-xs text-blue-100 font-medium">
          Real-time order management for your kitchen crew. Runs on widescreen TVs in the kitchen.
        </p>
      </div>

      {/* READY BANNER (🔔 flashes when order is ready) */}
      {lastReadyOrder && (
        <div className="bg-green-600 text-white font-black text-center py-3.5 px-4 animate-pulse flex items-center justify-center gap-2 border-b border-green-700 uppercase tracking-widest text-xs sm:text-sm">
          <span>🔔 READY FOR PICKUP &mdash; {lastReadyOrder.id} &mdash; TABLE {lastReadyOrder.tableId}</span>
        </div>
      )}

      {/* Main KDS TV Body */}
      <div className="flex-1 p-6 flex flex-col lg:flex-row gap-6">
        
        {/* KDS Widescreen Grid (Left 75%) */}
        <div className="flex-1 flex flex-col bg-black/40 rounded-3xl p-6 border border-gray-800">
          
          {/* KDS Header Bar */}
          <div className="flex justify-between items-center pb-4 mb-6 border-b border-gray-800">
            <div className="flex items-center gap-2">
              <span className="p-1.5 bg-blue-primary rounded text-xs font-black uppercase tracking-wider text-white">KDS</span>
              <h2 className="text-sm font-black uppercase tracking-wider text-gray-300">
                TODAY'S ORDERS &mdash; <span className="text-blue-400">{activeOrdersList.length} ACTIVE</span>
              </h2>
            </div>
            <div className="text-right">
              <p className="text-sm font-black text-white">{time.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' })}</p>
              <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">{time.toLocaleDateString([], { weekday: 'short', month: 'short', day: 'numeric' })}</p>
            </div>
          </div>

          {/* Three Columns Layout */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 flex-1 items-start">
            
            {/* Column 1: NEW ORDERS */}
            <div className="bg-gray-950/80 rounded-2xl p-4 border border-gray-900 flex flex-col max-h-[550px]">
              <div className="bg-blue-900/30 text-blue-300 px-3 py-2 rounded-xl mb-4 flex justify-between items-center border border-blue-900/30">
                <span className="text-xs font-black uppercase tracking-wider">NEW ORDERS</span>
                <span className="bg-blue-900 text-blue-200 text-[10px] px-2 py-0.5 rounded-full font-bold">
                  {newOrders.length}
                </span>
              </div>

              <div className="space-y-4 overflow-y-auto no-scrollbar dark-scroll flex-1 pr-1">
                {newOrders.length === 0 ? (
                  <div className="text-center py-12 text-xs text-gray-500 font-medium italic">
                    No new orders pending
                  </div>
                ) : (
                  newOrders.map((order) => (
                    <div 
                      key={order.id} 
                      className={`bg-gray-900 border rounded-2xl p-4 space-y-3 shadow-md hover:border-blue-500 transition-colors ${
                        getTimerOffset(order.id) > 1200 ? 'border-red-600/50' : 'border-gray-800'
                      }`}
                    >
                      {/* Ticket Header */}
                      <div className="flex justify-between items-start pb-2 border-b border-gray-800/80">
                        <div>
                          <p className="font-mono text-sm font-black text-white">{order.id}</p>
                          <p className="text-[10px] font-bold text-gray-400 uppercase">Table {order.tableId}</p>
                        </div>
                        <div className="flex flex-col items-end gap-1">
                          <span className="text-[9px] text-gray-500 font-mono">{order.timestamp}</span>
                          <TicketTimer initialSeconds={getTimerOffset(order.id)} />
                        </div>
                      </div>

                      {/* Items List */}
                      <div className="space-y-2">
                        {order.items.map((item, idx) => (
                          <div key={idx} className="text-xs">
                            <div className="flex justify-between font-bold text-gray-200">
                              <span>{item.qty}x {item.name}</span>
                              <span className="text-blue-400 text-[10px]">{item.variant}</span>
                            </div>
                            {item.spice && item.spice !== 'None' && (
                              <p className="text-[9px] text-red-400/90 font-medium pl-3">Spice: {item.spice}</p>
                            )}
                            {item.addOns && item.addOns.length > 0 && (
                              <p className="text-[9px] text-yellow-500/90 font-medium pl-3">Add-ons: {item.addOns.join(', ')}</p>
                            )}
                            {item.instructions && (
                              <div className="mt-1 bg-yellow-400/5 border border-yellow-400/20 text-yellow-300 text-[9px] px-2 py-0.5 rounded font-mono">
                                Note: "{item.instructions}"
                              </div>
                            )}
                          </div>
                        ))}
                      </div>

                      {/* Ticket Footer Action Buttons */}
                      <div className="grid grid-cols-2 gap-2 pt-2 border-t border-gray-800/60">
                        <button
                          onClick={() => acceptOrder(order.id)}
                          className="bg-green-600 hover:bg-green-500 text-white py-1.5 rounded-lg text-[10px] font-black uppercase tracking-wider transition-colors"
                        >
                          ACCEPT
                        </button>
                        <button
                          onClick={() => handleCancelClick(order.id)}
                          className="border border-red-500/40 hover:bg-red-950/20 text-red-400 py-1.5 rounded-lg text-[10px] font-black uppercase tracking-wider transition-colors"
                        >
                          CANCEL
                        </button>
                      </div>
                    </div>
                  ))
                )}
              </div>
            </div>

            {/* Column 2: IN PROGRESS */}
            <div className="bg-gray-950/80 rounded-2xl p-4 border border-gray-900 flex flex-col max-h-[550px]">
              <div className="bg-amber-900/30 text-amber-300 px-3 py-2 rounded-xl mb-4 flex justify-between items-center border border-amber-900/30">
                <span className="text-xs font-black uppercase tracking-wider">IN PREPARATION</span>
                <span className="bg-amber-900 text-amber-200 text-[10px] px-2 py-0.5 rounded-full font-bold">
                  {inProgressOrders.length}
                </span>
              </div>

              <div className="space-y-4 overflow-y-auto no-scrollbar dark-scroll flex-1 pr-1">
                {inProgressOrders.length === 0 ? (
                  <div className="text-center py-12 text-xs text-gray-500 font-medium italic">
                    No active preparations
                  </div>
                ) : (
                  inProgressOrders.map((order) => {
                    const elapsed = getTimerOffset(order.id);
                    let borderClass = 'border-gray-800';
                    if (elapsed >= 1200) borderClass = 'border-red-600/65 shadow-lg shadow-red-900/5';
                    else if (elapsed >= 600) borderClass = 'border-yellow-500/50';

                    return (
                      <div 
                        key={order.id} 
                        className={`bg-gray-900 border rounded-2xl p-4 space-y-3 shadow-md hover:border-amber-400 transition-colors ${borderClass}`}
                      >
                        {/* Ticket Header */}
                        <div className="flex justify-between items-start pb-2 border-b border-gray-800/80">
                          <div>
                            <p className="font-mono text-sm font-black text-white">{order.id}</p>
                            <p className="text-[10px] font-bold text-gray-400 uppercase">Table {order.tableId}</p>
                          </div>
                          <div className="flex flex-col items-end gap-1">
                            <span className="text-[9px] text-gray-500 font-mono">{order.timestamp}</span>
                            <TicketTimer initialSeconds={elapsed} />
                          </div>
                        </div>

                        {/* Items */}
                        <div className="space-y-2">
                          {order.items.map((item, idx) => (
                            <div key={idx} className="text-xs">
                              <div className="flex justify-between font-bold text-gray-200">
                                <span>{item.qty}x {item.name}</span>
                                <span className="text-blue-400 text-[10px]">{item.variant}</span>
                              </div>
                              {item.spice && item.spice !== 'None' && (
                                <p className="text-[9px] text-red-400/95 font-medium pl-3">Spice: {item.spice}</p>
                              )}
                              {item.addOns && item.addOns.length > 0 && (
                                <p className="text-[9px] text-yellow-500/90 font-medium pl-3">Add-ons: {item.addOns.join(', ')}</p>
                              )}
                              {item.instructions && (
                                <div className="mt-1 bg-yellow-400/5 border border-yellow-400/20 text-yellow-300 text-[9px] px-2 py-0.5 rounded font-mono">
                                  Note: "{item.instructions}"
                                </div>
                              )}
                            </div>
                          ))}
                        </div>

                        {/* Prep Level tracker */}
                        {order.status === 'accepted' ? (
                          <button
                            onClick={() => startPreparingOrder(order.id)}
                            className="w-full bg-amber-600 hover:bg-amber-500 text-white py-1.5 rounded-lg text-[10px] font-black uppercase tracking-wider transition-colors flex items-center justify-center gap-1"
                          >
                            <Play size={10} /> START PREPARING
                          </button>
                        ) : (
                          <div className="flex gap-2">
                            <div className="flex-1 bg-amber-900/30 text-amber-400 border border-amber-800/40 py-1.5 rounded-lg text-[9px] font-black uppercase tracking-wider text-center flex items-center justify-center gap-1.5">
                              <span className="w-1.5 h-1.5 bg-amber-500 rounded-full animate-ping"></span>
                              COOKING...
                            </div>
                            <button
                              onClick={() => markOrderReady(order.id)}
                              className="bg-green-600 hover:bg-green-500 text-white px-4 py-1.5 rounded-lg text-[10px] font-black uppercase tracking-wider transition-colors"
                            >
                              READY
                            </button>
                          </div>
                        )}
                      </div>
                    );
                  })
                )}
              </div>
            </div>

            {/* Column 3: READY FOR PICKUP */}
            <div className="bg-gray-950/80 rounded-2xl p-4 border border-gray-900 flex flex-col max-h-[550px]">
              <div className="bg-green-900/30 text-green-300 px-3 py-2 rounded-xl mb-4 flex justify-between items-center border border-green-900/30">
                <span className="text-xs font-black uppercase tracking-wider">READY / PASS</span>
                <span className="bg-green-900 text-green-200 text-[10px] px-2 py-0.5 rounded-full font-bold">
                  {readyOrders.length}
                </span>
              </div>

              <div className="space-y-4 overflow-y-auto no-scrollbar dark-scroll flex-1 pr-1">
                {readyOrders.length === 0 ? (
                  <div className="text-center py-12 text-xs text-gray-500 font-medium italic">
                    No tickets ready to serve
                  </div>
                ) : (
                  readyOrders.map((order) => (
                    <div 
                      key={order.id} 
                      className="bg-gray-900 border border-green-500/30 rounded-2xl p-4 space-y-3 shadow-md hover:border-green-400 transition-colors"
                    >
                      {/* Ticket Header */}
                      <div className="flex justify-between items-start pb-2 border-b border-gray-800/80">
                        <div>
                          <p className="font-mono text-sm font-black text-white">{order.id}</p>
                          <p className="text-[10px] font-bold text-gray-400 uppercase">Table {order.tableId}</p>
                        </div>
                        <span className="text-[9px] text-gray-500 font-mono mt-0.5">{order.timestamp}</span>
                      </div>

                      {/* Items */}
                      <div className="space-y-1.5">
                        {order.items.map((item, idx) => (
                          <div key={idx} className="text-xs font-semibold text-gray-300">
                            {item.qty}x {item.name} <span className="text-gray-500 text-[9px]">({item.variant})</span>
                          </div>
                        ))}
                      </div>

                      <button
                        onClick={() => markOrderServed(order.id)}
                        className="w-full bg-green-600 hover:bg-green-500 text-white py-2 rounded-lg text-[10px] font-black uppercase tracking-wider transition-colors flex items-center justify-center gap-1.5"
                      >
                        <Check size={12} /> MARK SERVED
                      </button>
                    </div>
                  ))
                )}
              </div>
            </div>

          </div>

          {/* KDS Sync Panel Footer */}
          <div className="mt-6 bg-gray-900 border border-gray-800 rounded-2xl p-4 flex flex-wrap justify-between items-center text-xs font-semibold text-gray-400">
            <div className="flex items-center gap-4">
              <span className="uppercase text-[10px] tracking-wider text-gray-500 font-bold">KDS Sync:</span>
              <span className="flex items-center gap-1 text-green-400">
                <span className="w-2 h-2 bg-green-500 rounded-full animate-pulse-green"></span>
                GUEST APP
              </span>
              <span className="flex items-center gap-1 text-green-400">
                <span className="w-2 h-2 bg-green-500 rounded-full animate-pulse-green"></span>
                OWNER PANEL
              </span>
            </div>
            <div className="font-mono text-[10px] mt-2 sm:mt-0 text-gray-500">
              Last update triggered: {lastAction} ({lastActionTime})
            </div>
          </div>
        </div>

        {/* Feature List (Right 25%) */}
        <div className="w-full lg:w-80 flex flex-col gap-6">
          <div className="bg-blue-primary text-white p-6 rounded-3xl border border-blue-400/20 shadow-xl text-left">
            <h3 className="text-lg font-black uppercase tracking-wide mb-4">KITCHEN TV HIGHLIGHTS</h3>
            
            <ul className="space-y-4">
              {[
                { title: 'INSTANT KITCHEN INTAKE', desc: 'New orders flow onto KDS within 500ms of checkout, eliminating slip print delays.' },
                { title: 'TIMERS & COLOR CODING', desc: 'Borders transition from neutral to amber (10m) and flashing red (20m) to keep chefs on target.' },
                { title: 'MANAGER PIN CANCELLATION', desc: 'Secure cancellations. Entering Manager PIN "1234" clears tickets and triggers guest refunds.' },
                { title: 'AUTO SERVED ARCHIVE', desc: 'Saves active screen space. Settle dishes as they leave the pass.' }
              ].map((f, i) => (
                <li key={i} className="flex items-start gap-2.5">
                  <span className="text-white text-md font-bold mt-0.5">✦</span>
                  <div>
                    <h4 className="text-[10px] font-black uppercase tracking-wider text-blue-200">{f.title}</h4>
                    <p className="text-[11px] text-blue-100 leading-relaxed font-medium">{f.desc}</p>
                  </div>
                </li>
              ))}
            </ul>
          </div>
        </div>

      </div>

      {/* --- CANCELLATION MANAGER PIN MODAL --- */}
      {cancellingOrderId && (
        <div className="fixed inset-0 bg-black/75 z-50 flex items-center justify-center p-4">
          <form 
            onSubmit={handleConfirmCancel}
            className="bg-gray-900 border border-gray-800 rounded-3xl p-6 max-w-sm w-full space-y-4 text-left"
          >
            <div className="flex justify-between items-center">
              <h3 className="text-base font-black uppercase tracking-wider text-white flex items-center gap-1.5 text-red-500">
                <AlertTriangle size={18} /> Cancel Order {cancellingOrderId}
              </h3>
              <button 
                type="button" 
                onClick={() => setCancellingOrderId(null)}
                className="text-gray-400 hover:text-white"
              >
                <X size={16} />
              </button>
            </div>

            <p className="text-xs text-gray-400 leading-relaxed font-medium">
              Cancellations require managers credentials. This will instantly notify the Guest Ordering table and update Owner financials.
            </p>

            <div>
              <label className="text-[10px] font-black uppercase tracking-wider text-gray-500 mb-1 block">Enter Manager PIN (1234)</label>
              <input
                type="password"
                required
                maxLength={4}
                value={pin}
                onChange={(e) => {
                  setPin(e.target.value);
                  setPinError('');
                }}
                placeholder="••••"
                className="w-full p-2.5 rounded-xl bg-gray-950 border border-gray-800 text-center font-mono text-xl tracking-widest text-white focus:outline-none focus:border-red-500"
              />
              {pinError && <p className="text-[10px] font-semibold text-red-500 mt-1 flex items-center gap-1"><AlertCircle size={10} /> {pinError}</p>}
            </div>

            <div>
              <label className="text-[10px] font-black uppercase tracking-wider text-gray-500 mb-1 block">Cancellation Reason</label>
              <select
                value={cancelReason}
                onChange={(e) => setCancelReason(e.target.value)}
                className="w-full p-2.5 rounded-xl bg-gray-950 border border-gray-800 text-xs text-white focus:outline-none focus:border-red-500"
              >
                <option value="Item unavailable">Item unavailable / Out of stock</option>
                <option value="Kitchen overloaded">Kitchen overloaded</option>
                <option value="Guest requested cancellation">Guest requested cancellation</option>
                <option value="Other / Typo error">Other / Typo error</option>
              </select>
            </div>

            <div className="grid grid-cols-2 gap-3 pt-2">
              <button
                type="submit"
                className="bg-red-600 hover:bg-red-500 text-white py-2 rounded-xl text-[10px] font-black uppercase tracking-widest transition-colors"
              >
                CONFIRM CANCEL
              </button>
              <button
                type="button"
                onClick={() => setCancellingOrderId(null)}
                className="border border-gray-700 text-gray-300 py-2 rounded-xl text-[10px] font-black uppercase tracking-widest hover:bg-gray-800 transition-colors text-center"
              >
                ABORT
              </button>
            </div>
          </form>
        </div>
      )}

    </div>
  );
};

export default KitchenDisplay;
