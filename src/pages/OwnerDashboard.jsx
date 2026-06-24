import React, { useState } from 'react';
import { useRestOS } from '../context/RestOSContext';
import { 
  BarChart3, 
  Layers, 
  Map, 
  Clock, 
  TrendingUp, 
  DollarSign, 
  ShoppingBag, 
  Users, 
  AlertTriangle,
  X,
  Info,
  CheckCircle,
  AlertOctagon,
  ChevronRight
} from 'lucide-react';

const OwnerDashboard = () => {
  const {
    orders,
    tables,
    kpis,
    notifyDelay,
    markOrderServed,
    completePayment,
    requestBill,
    lastAction,
    lastActionTime
  } = useRestOS();

  // Selected Order for details modal
  const [selectedOrderId, setSelectedOrderId] = useState(null);
  // Selected Table for session summary modal
  const [selectedTableId, setSelectedTableId] = useState(null);

  const selectedOrder = selectedOrderId ? orders[selectedOrderId] : null;
  const selectedTable = selectedTableId ? tables[selectedTableId] : null;

  // Find all orders for the selected table
  const selectedTableOrders = selectedTableId 
    ? Object.values(orders).filter(o => o.tableId === Number(selectedTableId))
    : [];
  
  const selectedTableTotal = selectedTableOrders
    .filter(o => o.status !== 'cancelled')
    .reduce((sum, o) => sum + o.total, 0);

  // Group orders for KANBAN
  const kanbanColumns = {
    new: { label: 'NEW', color: 'bg-blue-600 text-white', status: 'new' },
    accepted: { label: 'ACCEPTED', color: 'bg-indigo-600 text-white', status: 'accepted' },
    preparing: { label: 'PREPARING', color: 'bg-amber-500 text-slate-900', status: 'preparing' },
    ready: { label: 'READY', color: 'bg-green-600 text-white', status: 'ready' },
    served: { label: 'SERVED', color: 'bg-emerald-700 text-white', status: 'served' },
    cancelled: { label: 'CANCELLED', color: 'bg-red-600 text-white', status: 'cancelled' }
  };

  // Status mapping
  const tableColors = {
    free: { bg: 'bg-green-500/10 border-green-500 text-green-700', label: 'Free' },
    occupied: { bg: 'bg-red-500/10 border-red-500 text-red-700', label: 'Occupied' },
    bill_requested: { bg: 'bg-yellow-500/20 border-yellow-500 text-yellow-700 font-bold animate-pulse', label: 'Bill Requested' },
    reserved: { bg: 'bg-blue-500/10 border-blue-500 text-blue-700', label: 'Reserved' },
    cleaning: { bg: 'bg-gray-500/10 border-gray-400 text-gray-600', label: 'Cleaning' }
  };

  const activeTablesCount = Object.values(tables).filter(t => t.status === 'occupied' || t.status === 'bill_requested').length;
  const computedAvgOrderValue = Math.round(kpis.revenue / kpis.ordersToday) || 381;

  const handleClearTable = (tableId) => {
    // Collect payment via UPI by default on clear
    completePayment(tableId, 'UPI');
    setSelectedTableId(null);
  };

  return (
    <div className="max-w-7xl mx-auto px-4 py-12 md:px-8">
      {/* Header */}
      <div className="bg-blue-primary text-white p-8 rounded-3xl mb-12 text-center relative overflow-hidden border border-blue-400/20 shadow-xl">
        <div className="relative z-10">
          <span className="bg-blue-light text-white font-black text-xs px-3 py-1 rounded-full uppercase tracking-wider mb-3 inline-block">
            STATION 03
          </span>
          <h1 className="text-4xl md:text-5xl font-black uppercase tracking-tight mb-2">OWNER'S DESK</h1>
          <p className="text-sm md:text-base text-blue-100 max-w-xl mx-auto font-medium">
            Unified dashboard monitoring operations, active tables map, Kanban orders flow, and live sales diagnostics.
          </p>
        </div>
      </div>

      {/* KPI Cards Row */}
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4 mb-8">
        {[
          { label: 'Today\'s Revenue', val: `₹${kpis.revenue.toLocaleString()}`, icon: <DollarSign size={20} className="text-blue-primary" /> },
          { label: 'Orders Today', val: kpis.ordersToday, icon: <ShoppingBag size={20} className="text-blue-primary" /> },
          { label: 'Avg Order Value', val: `₹${computedAvgOrderValue}`, icon: <TrendingUp size={20} className="text-blue-primary" /> },
          { label: 'Active Tables', val: `${activeTablesCount} / 24`, icon: <Users size={20} className="text-blue-primary" /> },
          { label: 'Cancelled Orders', val: kpis.cancelledOrders, icon: <AlertOctagon size={20} className="text-red-500" /> },
          { label: 'Avg Prep Time', val: `${kpis.avgPrepTime} min`, icon: <Clock size={20} className="text-blue-primary" /> }
        ].map((kpi, idx) => (
          <div key={idx} className="bg-white rounded-2xl p-5 border border-blue-100 shadow-sm flex flex-col justify-between hover:shadow transition-shadow">
            <div className="flex justify-between items-center mb-4">
              <span className="text-[10px] font-black uppercase tracking-wider text-slate-400">{kpi.label}</span>
              <div className="p-1.5 bg-blue-50 rounded-lg">
                {kpi.icon}
              </div>
            </div>
            <p className="text-2xl font-black text-blue-primary uppercase">{kpi.val}</p>
          </div>
        ))}
      </div>

      {/* Table Map Grid */}
      <div className="bg-white p-6 rounded-3xl border border-blue-100 shadow-sm mb-8 text-left">
        <div className="flex justify-between items-center pb-4 mb-6 border-b border-slate-100">
          <div className="flex items-center gap-2">
            <Map className="text-blue-primary" size={20} />
            <h2 className="text-xl font-black uppercase tracking-wider text-slate-800">TABLE MAP</h2>
          </div>
          <div className="flex flex-wrap gap-2 text-[10px] font-bold">
            <span className="flex items-center gap-1"><span className="w-2.5 h-2.5 bg-green-500 rounded"></span> Free</span>
            <span className="flex items-center gap-1"><span className="w-2.5 h-2.5 bg-red-500 rounded"></span> Occupied</span>
            <span className="flex items-center gap-1"><span className="w-2.5 h-2.5 bg-yellow-500 rounded"></span> Bill Requested</span>
            <span className="flex items-center gap-1"><span className="w-2.5 h-2.5 bg-blue-500 rounded"></span> Reserved</span>
            <span className="flex items-center gap-1"><span className="w-2.5 h-2.5 bg-gray-400 rounded"></span> Cleaning</span>
          </div>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-6 gap-3">
          {Object.entries(tables).map(([num, tbl]) => {
            const isSelected = selectedTableId === num;
            const style = tableColors[tbl.status] || tableColors.free;
            
            return (
              <div
                key={num}
                onClick={() => setSelectedTableId(num)}
                className={`border-2 rounded-2xl p-3.5 flex flex-col justify-between min-h-[92px] cursor-pointer transition-all hover:scale-[1.02] ${style.bg} ${
                  isSelected ? 'ring-2 ring-blue-primary border-transparent' : ''
                }`}
              >
                <div className="flex justify-between items-start">
                  <span className="text-lg font-black text-slate-900">Table {num}</span>
                  <span className="text-[8px] uppercase tracking-wider font-extrabold opacity-75">{style.label}</span>
                </div>
                {tbl.currentAmount > 0 && (
                  <div className="mt-2 text-right">
                    <p className="text-xs font-black text-slate-900">₹{tbl.currentAmount}</p>
                    <p className="text-[8px] font-bold opacity-60 text-slate-700">{tbl.sessionMinutes} mins active</p>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </div>

      {/* Live Order Kanban Board */}
      <div className="bg-white p-6 rounded-3xl border border-blue-100 shadow-sm mb-8 text-left">
        <div className="flex items-center gap-2 pb-4 mb-6 border-b border-slate-100">
          <Layers className="text-blue-primary" size={20} />
          <h2 className="text-xl font-black uppercase tracking-wider text-slate-800">LIVE ORDER BOARD</h2>
        </div>

        {/* columns container */}
        <div className="flex overflow-x-auto gap-4 pb-2 no-scrollbar">
          {Object.entries(kanbanColumns).map(([colKey, col]) => {
            const colOrders = Object.values(orders).filter(o => o.status === col.status);

            return (
              <div 
                key={colKey}
                className="w-72 shrink-0 bg-slate-50/70 border border-slate-200/60 rounded-2xl p-4 flex flex-col min-h-[350px]"
              >
                {/* Column header */}
                <div className={`px-3 py-1.5 rounded-xl font-black text-[10px] tracking-wider uppercase mb-4 flex justify-between items-center ${col.color}`}>
                  <span>{col.label}</span>
                  <span className="bg-black/25 px-1.5 py-0.5 rounded text-[9px] font-bold">{colOrders.length}</span>
                </div>

                {/* Cards stack */}
                <div className="space-y-3 overflow-y-auto max-h-[400px] pr-1 no-scrollbar flex-1">
                  {colOrders.length === 0 ? (
                    <div className="text-center py-12 text-[10px] text-slate-400 font-medium italic">
                      Empty column
                    </div>
                  ) : (
                    colOrders.map((order) => (
                      <div 
                        key={order.id}
                        className="bg-white p-3.5 rounded-xl border border-slate-200 shadow-sm flex flex-col justify-between space-y-3 hover:border-blue-300 transition-colors"
                      >
                        <div className="flex justify-between items-start">
                          <div>
                            <span className="font-mono text-xs font-black text-slate-900">{order.id}</span>
                            <p className="text-[9px] font-bold text-slate-500 uppercase">Table {order.tableId}</p>
                          </div>
                          <span className="text-[10px] font-black text-blue-primary">₹{order.total}</span>
                        </div>

                        {order.delayNotified && (
                          <span className="bg-amber-100 text-amber-800 text-[8px] font-black px-1.5 py-0.5 rounded self-start uppercase tracking-wider">
                            ⚠️ Delay Notified
                          </span>
                        )}

                        {/* Card CTA actions */}
                        <div className="flex flex-wrap gap-1.5 pt-2 border-t border-slate-100">
                          <button
                            onClick={() => setSelectedOrderId(order.id)}
                            className="bg-slate-100 hover:bg-slate-200 text-slate-700 text-[8px] font-black px-2 py-1 rounded uppercase tracking-wider"
                          >
                            Details
                          </button>

                          {order.status !== 'served' && order.status !== 'cancelled' && (
                            <button
                              onClick={() => notifyDelay(order.id)}
                              className="border border-amber-400 hover:bg-amber-50 text-amber-600 text-[8px] font-black px-2 py-1 rounded uppercase tracking-wider"
                            >
                              Delay Alert
                            </button>
                          )}

                          {order.status === 'ready' && (
                            <button
                              onClick={() => markOrderServed(order.id)}
                              className="bg-green-600 hover:bg-green-500 text-white text-[8px] font-black px-2 py-1 rounded uppercase tracking-wider"
                            >
                              Serve
                            </button>
                          )}
                        </div>
                      </div>
                    ))
                  )}
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Analytics Snapshot Row */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 text-left">
        {/* Card 1: Popular Items */}
        <div className="bg-white p-6 rounded-3xl border border-blue-100 shadow-sm">
          <div className="flex items-center gap-2 pb-3 mb-4 border-b border-slate-100">
            <BarChart3 size={18} className="text-blue-primary" />
            <h3 className="text-sm font-black uppercase tracking-wider text-slate-800">Popular Items</h3>
          </div>
          
          <div className="space-y-3.5">
            {[
              { rank: 1, name: 'Chicken Ramen', count: 47, pct: 100 },
              { rank: 2, name: 'California Roll', count: 38, pct: 80 },
              { rank: 3, name: 'Veg Gyoza', count: 31, pct: 65 },
              { rank: 4, name: 'Chocolate Mochi', count: 24, pct: 50 },
              { rank: 5, name: 'Tempura Prawns', count: 19, pct: 40 }
            ].map((item) => (
              <div key={item.rank} className="text-xs">
                <div className="flex justify-between font-semibold mb-1 text-slate-700">
                  <span>{item.rank}. {item.name}</span>
                  <span className="font-bold">{item.count} orders</span>
                </div>
                <div className="w-full bg-slate-100 h-2.5 rounded-full overflow-hidden">
                  <div className="bg-blue-primary h-full rounded-full" style={{ width: `${item.pct}%` }}></div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Card 2: Peak Hours */}
        <div className="bg-white p-6 rounded-3xl border border-blue-100 shadow-sm">
          <div className="flex items-center gap-2 pb-3 mb-4 border-b border-slate-100">
            <Clock size={18} className="text-blue-primary" />
            <h3 className="text-sm font-black uppercase tracking-wider text-slate-800">Peak Hours</h3>
          </div>

          <div className="flex items-end justify-between h-[160px] pt-4">
            {[
              { label: '12 PM', height: 'h-[140px]', count: 35 },
              { label: '2 PM', height: 'h-[70px]', count: 18 },
              { label: '4 PM', height: 'h-[30px]', count: 8 },
              { label: '6 PM', height: 'h-[90px]', count: 24 },
              { label: '8 PM', height: 'h-[150px]', count: 42 },
              { label: '10 PM', height: 'h-[60px]', count: 15 }
            ].map((bar, i) => (
              <div key={i} className="flex flex-col items-center flex-1 gap-2">
                <span className="text-[9px] font-bold text-slate-400">{bar.count}</span>
                <div className={`w-6 bg-blue-primary rounded-t-md hover:bg-blue-light transition-colors ${bar.height}`}></div>
                <span className="text-[8px] font-black uppercase tracking-wider text-slate-500 whitespace-nowrap">{bar.label}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Card 3: QR Adoption */}
        <div className="bg-white p-6 rounded-3xl border border-blue-100 shadow-sm flex flex-col justify-between">
          <div>
            <div className="flex items-center gap-2 pb-3 mb-4 border-b border-slate-100">
              <Layers size={18} className="text-blue-primary" />
              <h3 className="text-sm font-black uppercase tracking-wider text-slate-800">QR Adoption</h3>
            </div>
            
            <div className="flex items-center gap-6 py-2">
              <div className="w-24 h-24 rounded-full border-8 border-slate-100 border-t-blue-primary border-r-blue-primary border-l-blue-primary flex items-center justify-center">
                <span className="text-2xl font-black text-blue-primary">82%</span>
              </div>
              <div className="space-y-2 text-xs">
                <p className="font-semibold text-slate-700">Orders via Guest QR</p>
                <p className="text-[10px] text-slate-400 font-medium">82% of transactions completed via self checkouts</p>
                <div className="flex items-center gap-2 font-bold text-[9px]">
                  <span className="w-2.5 h-2.5 bg-blue-primary rounded"></span> QR ordering
                  <span className="w-2.5 h-2.5 bg-slate-200 rounded"></span> Staff POS
                </div>
              </div>
            </div>
          </div>

          <div className="bg-slate-50 border border-slate-100 rounded-2xl p-3 text-[10px] text-slate-500 leading-relaxed font-semibold">
            QR Ordering saves an average of 4.5 minutes per table turn.
          </div>
        </div>
      </div>

      {/* --- ORDER DETAILS MODAL --- */}
      {selectedOrder && (
        <div className="fixed inset-0 bg-black/60 z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl max-w-md w-full p-6 text-slate-800 text-left space-y-4">
            <div className="flex justify-between items-start pb-2 border-b border-slate-100">
              <div>
                <span className="font-mono text-sm font-black text-slate-900">{selectedOrder.id}</span>
                <p className="text-[10px] font-bold text-slate-400 uppercase">Table {selectedOrder.tableId}</p>
              </div>
              <button 
                onClick={() => setSelectedOrderId(null)}
                className="p-1 bg-slate-100 hover:bg-slate-200 text-slate-500 rounded-full"
              >
                <X size={16} />
              </button>
            </div>

            {/* Status indicators */}
            <div className="flex items-center justify-between bg-blue-50 p-2.5 rounded-xl text-xs font-semibold text-blue-800">
              <span>Current Status:</span>
              <span className="bg-blue-primary text-white text-[9px] px-2 py-0.5 rounded font-black uppercase tracking-wider">
                {selectedOrder.status}
              </span>
            </div>

            {/* Items */}
            <div className="space-y-3">
              <h4 className="text-[10px] font-black uppercase tracking-wider text-slate-400">Order Items</h4>
              {selectedOrder.items.map((item, idx) => (
                <div key={idx} className="flex justify-between text-xs font-medium border-b border-slate-50 pb-2">
                  <div>
                    <span className="font-bold text-slate-900">{item.qty}x {item.name}</span>
                    <p className="text-[9px] text-slate-400">Variant: {item.variant} | Spice: {item.spice}</p>
                    {item.addOns && item.addOns.length > 0 && <p className="text-[9px] text-yellow-600">Add-ons: {item.addOns.join(', ')}</p>}
                  </div>
                  <span className="font-bold text-blue-primary">₹{item.price * item.qty}</span>
                </div>
              ))}
            </div>

            <div className="flex justify-between font-black text-sm text-slate-900 pt-2 border-t border-slate-100">
              <span>Total Payable</span>
              <span>₹{selectedOrder.total}</span>
            </div>

            {selectedOrder.instructions && (
              <div className="bg-yellow-50 p-3 rounded-xl border border-yellow-100 text-xs">
                <span className="font-bold text-yellow-800 uppercase text-[9px] tracking-wider block mb-1">Chef instructions:</span>
                <p className="italic text-yellow-900">"{selectedOrder.instructions}"</p>
              </div>
            )}
          </div>
        </div>
      )}

      {/* --- TABLE SESSION SUMMARY MODAL --- */}
      {selectedTable && (
        <div className="fixed inset-0 bg-black/60 z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl max-w-md w-full p-6 text-slate-800 text-left space-y-4">
            <div className="flex justify-between items-start pb-2 border-b border-slate-100">
              <div>
                <span className="text-lg font-black text-slate-900">TABLE {selectedTableId}</span>
                <span className="ml-2 bg-blue-50 text-blue-800 text-[8px] font-black px-1.5 py-0.5 rounded uppercase tracking-wider">
                  {selectedTable.status}
                </span>
              </div>
              <button 
                onClick={() => setSelectedTableId(null)}
                className="p-1 bg-slate-100 hover:bg-slate-200 text-slate-500 rounded-full"
              >
                <X size={16} />
              </button>
            </div>

            {/* Orders list */}
            <div className="space-y-3">
              <h4 className="text-[10px] font-black uppercase tracking-wider text-slate-400">Session Orders</h4>
              {selectedTableOrders.length === 0 ? (
                <p className="text-xs text-slate-400 italic">No orders logged in this session</p>
              ) : (
                selectedTableOrders.map((ord) => (
                  <div key={ord.id} className="flex justify-between text-xs border-b border-slate-50 pb-2">
                    <div>
                      <span className="font-mono font-bold">{ord.id}</span>
                      <span className={`ml-2 text-[8px] font-black px-1 rounded uppercase ${ord.status === 'cancelled' ? 'bg-red-100 text-red-700' : 'bg-green-100 text-green-700'}`}>
                        {ord.status}
                      </span>
                    </div>
                    <span className="font-bold text-slate-700">₹{ord.total}</span>
                  </div>
                ))
              )}
            </div>

            <div className="flex justify-between font-black text-sm text-slate-900 pt-2 border-t border-slate-100">
              <span>Session Total</span>
              <span>₹{selectedTableTotal}</span>
            </div>

            <div className="grid grid-cols-2 gap-3 pt-3">
              {selectedTable.status === 'occupied' && (
                <button
                  onClick={() => {
                    requestBill(selectedTableId);
                    setSelectedTableId(null);
                  }}
                  className="bg-yellow-500 hover:bg-yellow-400 text-white py-2.5 rounded-xl text-[10px] font-black uppercase tracking-widest transition-colors shadow"
                >
                  REQUEST BILL
                </button>
              )}

              {selectedTable.status === 'bill_requested' && (
                <button
                  onClick={() => handleClearTable(selectedTableId)}
                  className="bg-green-600 hover:bg-green-500 text-white py-2.5 rounded-xl text-[10px] font-black uppercase tracking-widest transition-colors shadow"
                >
                  SETTLE & CLEAR
                </button>
              )}

              {selectedTable.status === 'free' ? (
                <p className="col-span-2 text-center text-xs text-slate-400 font-medium">Table is currently vacant</p>
              ) : (
                <button
                  onClick={() => handleClearTable(selectedTableId)}
                  className="border border-red-500/40 hover:bg-red-50 text-red-500 py-2.5 rounded-xl text-[10px] font-black uppercase tracking-widest transition-colors text-center"
                >
                  FORCE CLEAR
                </button>
              )}
            </div>
          </div>
        </div>
      )}

    </div>
  );
};

export default OwnerDashboard;
