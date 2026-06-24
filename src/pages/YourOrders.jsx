import React, { useState, useEffect } from 'react';
import { useRestOS } from '../context/RestOSContext';
import { Link } from 'react-router-dom';
import { 
  ShoppingBag, 
  Clock, 
  CheckCircle, 
  AlertCircle, 
  Receipt, 
  Bell, 
  ChevronRight, 
  Utensils, 
  DollarSign, 
  Info,
  Check,
  X,
  AlertTriangle,
  RotateCcw
} from 'lucide-react';

const YourOrders = () => {
  const {
    orders,
    tables,
    requestBill,
    notifications = [], // fallback if not initialized
    lastAction,
    lastActionTime
  } = useRestOS();

  // Selected Table number to view (default to Table 12, the guest table)
  const [selectedTable, setSelectedTable] = useState(12);
  const [justNotifiedReady, setJustNotifiedReady] = useState(null);
  const [justNotifiedDeclined, setJustNotifiedDeclined] = useState(null);

  const tableData = tables[selectedTable] || { status: 'free', currentAmount: 0, sessionMinutes: 0 };
  
  // Filter orders for the selected table
  const tableOrders = Object.values(orders)
    .filter(o => o.tableId === Number(selectedTable))
    // Sort so most recent order is at the top
    .sort((a, b) => b.id.localeCompare(a.id));

  // Active orders (not cancelled and not served)
  const activeOrders = tableOrders.filter(o => o.status !== 'cancelled' && o.status !== 'served');
  
  // Calculate running session total (excluding cancelled orders)
  const nonCancelledOrders = tableOrders.filter(o => o.status !== 'cancelled');
  const sessionTotal = nonCancelledOrders.reduce((sum, o) => sum + o.total, 0);

  // Split calculations
  const gst = Math.round(sessionTotal * 0.05);
  const grandTotal = Math.round(sessionTotal * 1.05);

  // Monitor order statuses for live notifications/alerts on this page
  useEffect(() => {
    if (notifications.length > 0) {
      const latest = notifications[0];
      // Check if it concerns the current table
      if (latest.message.includes(`Table ${selectedTable}`) || latest.message.includes(`order`) || latest.message.includes(`Order`)) {
        // If an order for this table is ready, show a special visual alert
        const readyMatch = latest.message.match(/Order (ORD-\d+) for Table (\d+) is READY/);
        if (readyMatch && Number(readyMatch[2]) === selectedTable) {
          setJustNotifiedReady(readyMatch[1]);
          const timer = setTimeout(() => setJustNotifiedReady(null), 8000);
          return () => clearTimeout(timer);
        }

        // If an order for this table is cancelled/declined
        const cancelMatch = latest.message.match(/Order (ORD-\d+) cancelled/);
        if (cancelMatch) {
          const cancelledOrderId = cancelMatch[1];
          const isOurOrder = tableOrders.some(o => o.id === cancelledOrderId);
          if (isOurOrder) {
            setJustNotifiedDeclined(cancelledOrderId);
            const timer = setTimeout(() => setJustNotifiedDeclined(null), 8000);
            return () => clearTimeout(timer);
          }
        }
      }
    }
  }, [notifications, selectedTable]);

  return (
    <div className="max-w-7xl mx-auto px-4 py-12 md:px-8">
      {/* Hero Header */}
      <div className="bg-blue-primary text-white p-8 rounded-3xl mb-12 text-center relative overflow-hidden border border-blue-400/20 shadow-xl">
        <div className="relative z-10">
          <span className="bg-blue-light text-white font-black text-xs px-3 py-1 rounded-full uppercase tracking-wider mb-3 inline-block">
            STATION 05
          </span>
          <h1 className="text-4xl md:text-5xl font-black uppercase tracking-tight mb-2">YOUR ORDERS & BILL</h1>
          <p className="text-sm md:text-base text-blue-100 max-w-xl mx-auto font-medium">
            Live order status pipeline, direct KDS updates, and connected payment settle tracking for dining tables.
          </p>
        </div>
      </div>

      {/* Table Selector bar */}
      <div className="bg-white p-5 rounded-2xl border border-blue-100 shadow-sm mb-8 flex flex-col sm:flex-row sm:items-center justify-between gap-4 text-left">
        <div className="flex items-center gap-2.5">
          <span className="p-2 bg-blue-50 text-blue-primary rounded-xl">
            <Utensils size={20} />
          </span>
          <div>
            <h3 className="text-sm font-black uppercase text-slate-800">Select Table to Settle / Track</h3>
            <p className="text-[10px] text-slate-400 font-bold uppercase">View and track order updates by Table number</p>
          </div>
        </div>
        
        <div className="flex flex-wrap gap-1.5">
          {Object.entries(tables).map(([num, tbl]) => {
            const hasActiveOrders = Object.values(orders).some(o => o.tableId === Number(num) && o.status !== 'cancelled' && o.status !== 'served');
            const isBillRequested = tbl.status === 'bill_requested';
            
            return (
              <button
                key={num}
                onClick={() => {
                  setSelectedTable(Number(num));
                  setJustNotifiedReady(null);
                  setJustNotifiedDeclined(null);
                }}
                className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all ${
                  selectedTable === Number(num)
                    ? 'bg-blue-primary text-white shadow font-black'
                    : isBillRequested
                    ? 'bg-yellow-100 text-yellow-800 border border-yellow-300 animate-pulse font-black'
                    : hasActiveOrders
                    ? 'bg-red-50 text-red-700 border border-red-200 font-black'
                    : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                }`}
              >
                T{num} {isBillRequested ? '🔔' : hasActiveOrders ? '🔥' : ''}
              </button>
            );
          })}
        </div>
      </div>

      {/* Notification Alert Banners */}
      {justNotifiedReady && (
        <div className="bg-green-600 text-white font-black text-center py-4 px-4 rounded-2xl mb-8 animate-bounce flex items-center justify-center gap-2 border border-green-700 uppercase tracking-widest text-xs sm:text-sm shadow-lg">
          <span className="text-lg">🔔</span>
          <span>ORDER {justNotifiedReady} IS READY FOR PICKUP! TABLE {selectedTable}</span>
          <button onClick={() => setJustNotifiedReady(null)} className="ml-4 text-white/80 hover:text-white">
            <X size={16} />
          </button>
        </div>
      )}

      {justNotifiedDeclined && (
        <div className="bg-red-600 text-white font-black text-center py-4 px-4 rounded-2xl mb-8 animate-pulse flex items-center justify-center gap-2 border border-red-700 uppercase tracking-widest text-xs sm:text-sm shadow-lg">
          <span className="text-lg">⚠️</span>
          <span>ORDER {justNotifiedDeclined} WAS DECLINED BY THE KITCHEN MANAGER!</span>
          <button onClick={() => setJustNotifiedDeclined(null)} className="ml-4 text-white/80 hover:text-white">
            <X size={16} />
          </button>
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        {/* Left 65%: Order Tickets and Status */}
        <div className="lg:col-span-8 space-y-6 text-left">
          
          {/* Active Orders Section */}
          <div className="bg-white p-6 md:p-8 rounded-3xl border border-blue-100 shadow-md">
            <div className="flex justify-between items-center pb-4 mb-6 border-b border-slate-100">
              <div className="flex items-center gap-2">
                <ShoppingBag className="text-blue-primary" size={20} />
                <h2 className="text-xl font-black uppercase tracking-wider text-slate-800">
                  Active Orders &mdash; Table {selectedTable}
                </h2>
              </div>
              <span className="bg-blue-50 text-blue-primary text-[10px] font-black px-2.5 py-1 rounded-full uppercase tracking-wider">
                {activeOrders.length} Pending Tickets
              </span>
            </div>

            {tableOrders.length === 0 ? (
              <div className="text-center py-16 text-slate-500 font-medium italic space-y-4">
                <p>No orders placed for Table {selectedTable} yet.</p>
                {selectedTable === 12 && (
                  <Link 
                    to="/guest-ordering" 
                    className="inline-block px-5 py-2.5 bg-blue-primary text-white text-xs font-black uppercase tracking-widest rounded-xl hover:bg-blue-dark transition-colors shadow"
                  >
                    Go to Guest Ordering Menu
                  </Link>
                )}
              </div>
            ) : (
              <div className="space-y-6">
                {tableOrders.map((order) => {
                  const isCancelled = order.status === 'cancelled';
                  const isServed = order.status === 'served';
                  
                  // Status step configuration
                  const steps = [
                    { key: 'new', label: 'Placed' },
                    { key: 'accepted', label: 'Accepted' },
                    { key: 'preparing', label: 'Preparing' },
                    { key: 'ready', label: 'Ready!' },
                    { key: 'served', label: 'Served' }
                  ];

                  const statuses = ['new', 'accepted', 'preparing', 'ready', 'served'];
                  const currentIdx = statuses.indexOf(order.status);

                  return (
                    <div 
                      key={order.id} 
                      className={`border rounded-2xl p-5 md:p-6 transition-all bg-white ${
                        isCancelled 
                          ? 'border-red-200 bg-red-50/20' 
                          : order.status === 'ready' 
                          ? 'border-green-300 ring-2 ring-green-500/20 shadow-md'
                          : 'border-slate-200 shadow-sm'
                      }`}
                    >
                      {/* Ticket Header */}
                      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pb-4 mb-4 border-b border-slate-100">
                        <div>
                          <div className="flex items-center gap-2">
                            <span className="font-mono text-sm font-black text-slate-900">{order.id}</span>
                            <span className="bg-slate-100 text-slate-600 text-[8px] font-black px-1.5 py-0.5 rounded uppercase tracking-wider">
                              Round {order.round}
                            </span>
                          </div>
                          <p className="text-[10px] text-slate-400 font-bold uppercase mt-0.5">Placed at {order.timestamp}</p>
                        </div>
                        <div className="flex items-center gap-2 self-start sm:self-center">
                          <span className="text-xs font-black text-slate-500 mr-2">Total: ₹{order.total}</span>
                          <span className={`text-[9px] font-black px-2.5 py-1 rounded-full uppercase tracking-wider ${
                            isCancelled 
                              ? 'bg-red-100 text-red-700' 
                              : order.status === 'ready'
                              ? 'bg-green-100 text-green-700 animate-pulse font-extrabold'
                              : order.status === 'served'
                              ? 'bg-emerald-100 text-emerald-800'
                              : 'bg-blue-50 text-blue-700'
                          }`}>
                            {order.status}
                          </span>
                        </div>
                      </div>

                      {/* Items */}
                      <div className="space-y-3 mb-6">
                        {order.items.map((item, idx) => (
                          <div key={idx} className="flex justify-between items-start text-xs font-semibold">
                            <div>
                              <span className="text-slate-900 font-bold">{item.qty}x {item.name}</span>
                              <div className="text-[9px] text-slate-400 font-medium space-x-1.5 mt-0.5">
                                <span>Variant: {item.variant}</span>
                                {item.spice && item.spice !== 'None' && <span>&bull; Spice: {item.spice}</span>}
                                {item.addOns && item.addOns.length > 0 && <span>&bull; Add-ons: {item.addOns.join(', ')}</span>}
                              </div>
                              {item.instructions && (
                                <p className="text-[9px] italic text-amber-600 mt-1">Note: "{item.instructions}"</p>
                              )}
                            </div>
                            <span className="text-slate-900 font-bold">₹{item.price * item.qty}</span>
                          </div>
                        ))}
                      </div>

                      {/* Status Tracker Stepper or Cancellation Reason */}
                      {isCancelled ? (
                        <div className="bg-red-50 border border-red-200 rounded-xl p-3.5 flex items-start gap-2.5">
                          <AlertTriangle className="text-red-500 shrink-0 mt-0.5" size={16} />
                          <div>
                            <h4 className="text-[10px] font-black uppercase tracking-wider text-red-700">Order Declined by Kitchen</h4>
                            <p className="text-xs text-red-600 font-medium mt-0.5 leading-relaxed">
                              Reason: {order.cancelReason || 'Item out of stock / Unavailable'}
                            </p>
                            <p className="text-[9px] text-red-500 font-bold uppercase mt-2">
                              Please consult the waiter or place another order.
                            </p>
                          </div>
                        </div>
                      ) : (
                        <div>
                          {/* Horizontal Timeline */}
                          <div className="relative pt-2">
                            <div className="absolute top-[21px] left-4 right-4 h-0.5 bg-slate-100 -z-10"></div>
                            <div 
                              className="absolute top-[21px] left-4 h-0.5 bg-blue-primary -z-10 transition-all duration-500" 
                              style={{ width: `${(Math.min(currentIdx, 4) / 4) * 100}%` }}
                            ></div>

                            <div className="flex justify-between">
                              {steps.map((step, idx) => {
                                const isActive = idx <= currentIdx;
                                const isCurrent = idx === currentIdx;

                                return (
                                  <div key={step.key} className="flex flex-col items-center flex-1">
                                    <div className={`w-7 h-7 rounded-full flex items-center justify-center border-2 transition-all ${
                                      isCurrent
                                        ? 'bg-blue-primary border-blue-primary text-white scale-110 shadow shadow-blue-500/50'
                                        : isActive
                                        ? 'bg-green-500 border-green-500 text-white'
                                        : 'bg-white border-slate-200 text-slate-400'
                                    }`}>
                                      {isActive && !isCurrent ? (
                                        <Check size={12} className="stroke-[3]" />
                                      ) : step.key === 'ready!' ? (
                                        <span className="text-[10px] font-black">🔔</span>
                                      ) : (
                                        <span className="text-[10px] font-bold">{idx + 1}</span>
                                      )}
                                    </div>
                                    <span className={`text-[9px] font-black uppercase tracking-wider mt-1.5 ${
                                      isCurrent ? 'text-blue-primary' : isActive ? 'text-slate-800' : 'text-slate-400'
                                    }`}>
                                      {step.label}
                                    </span>
                                  </div>
                                );
                              })}
                            </div>
                          </div>
                        </div>
                      )}

                    </div>
                  );
                })}
              </div>
            )}

          </div>
        </div>

        {/* Right 35%: Bill Request & Settle, Live Notifications Console */}
        <div className="lg:col-span-4 space-y-6">
          
          {/* Bill & Settle Card */}
          <div className="bg-white p-6 md:p-8 rounded-3xl border border-blue-100 shadow-md text-left space-y-6">
            <div className="flex items-center gap-2 pb-3 border-b border-slate-100">
              <Receipt className="text-blue-primary" size={20} />
              <h2 className="text-lg font-black uppercase tracking-wider text-slate-800">BILL SUMMARY</h2>
            </div>

            {/* Table status indicators */}
            <div className="space-y-3 font-semibold text-xs text-slate-600">
              <div className="flex justify-between">
                <span>Table Number:</span>
                <span className="font-bold text-slate-900">Table {selectedTable}</span>
              </div>
              <div className="flex justify-between">
                <span>Table Status:</span>
                <span className={`px-2 py-0.5 rounded text-[9px] font-black uppercase tracking-wider ${
                  tableData.status === 'bill_requested'
                    ? 'bg-yellow-100 text-yellow-800 border border-yellow-300 animate-pulse'
                    : tableData.status === 'occupied'
                    ? 'bg-red-100 text-red-800'
                    : 'bg-green-100 text-green-800'
                }`}>
                  {tableData.status === 'bill_requested' ? 'Bill Requested' : tableData.status}
                </span>
              </div>
              <div className="flex justify-between">
                <span>Dining Session:</span>
                <span className="font-bold text-slate-900">{tableData.sessionMinutes || 0} mins</span>
              </div>
            </div>

            <div className="h-px bg-slate-100"></div>

            {/* Invoice items cost */}
            <div className="space-y-2 text-xs font-semibold text-slate-600">
              <div className="flex justify-between">
                <span>Items Subtotal:</span>
                <span className="text-slate-900 font-bold">₹{sessionTotal}</span>
              </div>
              <div className="flex justify-between">
                <span>GST Tax (5%):</span>
                <span className="text-slate-900 font-bold">₹{gst}</span>
              </div>
              <div className="h-px bg-slate-100 my-1"></div>
              <div className="flex justify-between text-sm font-black text-blue-primary uppercase">
                <span>Total Amount:</span>
                <span>₹{grandTotal}</span>
              </div>
            </div>

            {/* Settle / Settle status notifications */}
            {tableData.status === 'free' && sessionTotal === 0 ? (
              <div className="bg-green-50 border border-green-100 text-green-800 rounded-2xl p-4 text-xs text-center space-y-2 font-medium">
                <div className="w-8 h-8 bg-green-500 rounded-full flex items-center justify-center mx-auto border-2 border-green-200">
                  <Check className="text-white" size={16} />
                </div>
                <h4 className="font-black uppercase tracking-wider">PAID & SETTLED ✓</h4>
                <p className="text-green-700">Table is fully settled and cleared. Thank you!</p>
              </div>
            ) : (
              <div className="space-y-3">
                <button
                  onClick={() => requestBill(selectedTable)}
                  disabled={tableData.status === 'bill_requested' || sessionTotal === 0}
                  className={`w-full py-3.5 rounded-xl text-xs font-black uppercase tracking-widest transition-all shadow ${
                    tableData.status === 'bill_requested'
                      ? 'bg-green-600 text-white cursor-not-allowed'
                      : sessionTotal === 0
                      ? 'bg-slate-100 text-slate-400 cursor-not-allowed shadow-none border border-slate-200'
                      : 'bg-amber-500 hover:bg-amber-400 text-white'
                  }`}
                >
                  {tableData.status === 'bill_requested' ? 'Bill Requested ✓' : 'REQUEST BILL'}
                </button>

                {tableData.status === 'bill_requested' && (
                  <p className="text-[10px] text-center text-amber-600 font-semibold uppercase animate-pulse">
                    🔔 Waiter is on their way with the bill folder
                  </p>
                )}
              </div>
            )}
          </div>

          {/* Connected Live Notifications Board */}
          <div className="bg-blue-primary text-white p-6 md:p-8 rounded-3xl border border-blue-400/20 shadow-md text-left space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-blue-400/20">
              <div className="flex items-center gap-2">
                <Bell size={18} className="text-blue-200" />
                <h3 className="text-sm font-black uppercase tracking-wider text-white">LIVE ACTIVITY FEED</h3>
              </div>
              <span className="w-2.5 h-2.5 bg-green-400 rounded-full animate-pulse-green"></span>
            </div>

            <div className="space-y-3 max-h-[260px] overflow-y-auto pr-1 no-scrollbar text-[11px] font-semibold text-blue-100">
              {notifications.length === 0 ? (
                <div className="text-center py-8 text-blue-200/50 font-medium italic">
                  Listening for workspace changes...
                </div>
              ) : (
                notifications.map((notif) => (
                  <div 
                    key={notif.id} 
                    className="pb-2 border-b border-blue-400/10 last:border-0 flex justify-between gap-3"
                  >
                    <div>
                      <p className="text-white leading-normal">{notif.message}</p>
                      <span className="text-[9px] text-blue-300/80 font-mono block mt-0.5">{notif.timestamp}</span>
                    </div>
                    {/* Badge for Type */}
                    <span className="shrink-0 mt-0.5">
                      {notif.type === 'success' && '🟢'}
                      {notif.type === 'warning' && '🟡'}
                      {notif.type === 'error' && '🔴'}
                      {notif.type === 'info' && '🔵'}
                    </span>
                  </div>
                ))
              )}
            </div>

            <div className="bg-blue-dark/50 p-2.5 rounded-xl text-[10px] font-mono text-blue-200 leading-normal">
              Sync Channel: restos_sync<br />
              Last Action: {lastAction}
            </div>
          </div>

        </div>
      </div>
    </div>
  );
};

export default YourOrders;
