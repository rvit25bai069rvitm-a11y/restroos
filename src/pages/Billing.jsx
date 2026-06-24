import React, { useState } from 'react';
import { useRestOS } from '../context/RestOSContext';
import { 
  Receipt, 
  CreditCard, 
  Wallet, 
  QrCode, 
  Users, 
  CheckCircle, 
  Printer, 
  Download,
  AlertCircle
} from 'lucide-react';

const Billing = () => {
  const {
    orders,
    tables,
    completePayment,
    transactions,
    lastAction,
    lastActionTime
  } = useRestOS();

  // Selected Table to bill
  const [selectedTableId, setSelectedTableId] = useState('12');
  
  // Payment States
  const [paymentMethod, setPaymentMethod] = useState(null); // 'UPI' | 'CASH' | 'CARD' | 'SPLIT'
  const [splitAmounts, setSplitAmounts] = useState({
    cash: 500,
    upi: 466
  });
  const [paymentSuccess, setPaymentSuccess] = useState(false);
  const [receiptSummary, setReceiptSummary] = useState(null);

  // Get selected table details
  const table = tables[selectedTableId] || { status: 'free', currentAmount: 0 };
  
  // Get active orders for this table
  const tableOrders = Object.values(orders).filter(
    o => o.tableId === Number(selectedTableId) && o.status !== 'cancelled'
  );

  // If table has no current active orders, but has a current amount, we will mock the items list
  // to avoid showing an empty invoice. If table 12 is chosen and has no orders yet, we mock the default item sheet.
  const hasActiveOrders = tableOrders.length > 0 && table.currentAmount > 0;
  
  // Calculate subtotal, gst, total
  let subtotal = 0;
  let gst = 0;
  let total = 0;
  let items = [];

  if (hasActiveOrders) {
    items = tableOrders.flatMap(o => o.items);
    total = table.currentAmount;
    gst = Math.round(total * 0.05);
    subtotal = total - gst;
  } else {
    // Default prefilled Mock invoice for Table 12 if vacant
    items = [
      { name: 'Veg Gyoza', qty: 2, price: 220, variant: 'Regular', spice: 'None' },
      { name: 'Spicy Chicken Ramen', qty: 1, price: 480, variant: 'Regular', spice: 'Medium' }
    ];
    subtotal = 920;
    gst = 46;
    total = 966;
  }

  const handlePaymentConfirm = (method) => {
    // Settle in state
    completePayment(selectedTableId, method);
    
    // Set receipt summary for screen success display
    const finalAmount = total;
    setReceiptSummary({
      tableId: selectedTableId,
      amount: finalAmount,
      method: method,
      rounds: hasActiveOrders ? tableOrders.length : 2,
      time: tables[selectedTableId]?.sessionMinutes || 45
    });
    setPaymentSuccess(true);
    setPaymentMethod(null);
  };

  const handleSplitPaymentConfirm = (e) => {
    e.preventDefault();
    if (Number(splitAmounts.cash) + Number(splitAmounts.upi) !== total) {
      alert(`Split total must equal total payable ₹${total}`);
      return;
    }
    handlePaymentConfirm('Split (Cash/UPI)');
  };

  const handlePrint = () => {
    window.print();
  };

  const handleDownload = () => {
    alert("Tax Invoice PDF exported successfully (Mocked).");
  };

  const handleResetForm = () => {
    setPaymentSuccess(false);
    setReceiptSummary(null);
    setPaymentMethod(null);
  };

  return (
    <div className="max-w-7xl mx-auto px-4 py-12 md:px-8">
      {/* Header */}
      <div className="bg-blue-primary text-white p-8 rounded-3xl mb-12 text-center relative overflow-hidden border border-blue-400/20 shadow-xl">
        <div className="relative z-10">
          <span className="bg-blue-light text-white font-black text-xs px-3 py-1 rounded-full uppercase tracking-wider mb-3 inline-block">
            STATION 04
          </span>
          <h1 className="text-4xl md:text-5xl font-black uppercase tracking-tight mb-2">BILLING & POS</h1>
          <p className="text-sm md:text-base text-blue-100 max-w-xl mx-auto font-medium">
            Generate invoices, process split payments, and close active tables. Synced dynamically with guest orders.
          </p>
        </div>
      </div>

      {/* Select active tables quick banner */}
      <div className="bg-white p-4 rounded-2xl border border-blue-100 shadow-sm mb-8 flex flex-wrap items-center gap-4 text-left">
        <span className="text-xs font-black uppercase tracking-wider text-slate-400">Select Table to Settle:</span>
        <div className="flex flex-wrap gap-2">
          {Object.entries(tables).map(([num, tbl]) => {
            const hasAmount = tbl.currentAmount > 0;
            const isBillRequested = tbl.status === 'bill_requested';
            
            return (
              <button
                key={num}
                onClick={() => {
                  setSelectedTableId(num);
                  handleResetForm();
                }}
                className={`px-3 py-1.5 rounded-lg text-xs font-bold uppercase transition-all ${
                  selectedTableId === num
                    ? 'bg-blue-primary text-white shadow'
                    : isBillRequested
                    ? 'bg-yellow-100 text-yellow-800 border border-yellow-300 animate-pulse'
                    : hasAmount
                    ? 'bg-red-50 text-red-700 border border-red-200'
                    : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                }`}
              >
                T{num} {isBillRequested ? '🔔' : hasAmount ? '₹' : ''}
              </button>
            );
          })}
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        {/* Left 60%: Invoice Design */}
        <div className="lg:col-span-7">
          <div className="bg-white rounded-3xl border border-blue-100 shadow-xl overflow-hidden text-left p-6 md:p-8">
            
            {/* Professional Invoice Card */}
            <div className="border border-slate-200 p-6 rounded-2xl bg-white shadow-inner flex flex-col justify-between min-h-[480px]">
              <div>
                {/* Invoice Header */}
                <div className="flex justify-between items-start pb-4 border-b border-slate-200">
                  <div>
                    <h3 className="text-2xl font-black uppercase tracking-wider text-blue-primary">Rest<span className="text-yellow-400">OS</span></h3>
                    <p className="text-[10px] text-slate-400 font-bold mt-1">123 FOOD TECH STREET, METROPOLIS</p>
                    <p className="text-[10px] text-slate-400 font-bold">GSTIN: 27AAAAA1111A1Z1</p>
                  </div>
                  <div className="text-right">
                    <span className="bg-slate-100 text-slate-800 text-[9px] font-black px-2 py-0.5 rounded uppercase tracking-wider block mb-1.5">
                      TAX INVOICE
                    </span>
                    <p className="font-mono text-xs font-bold text-slate-800">INV-20260624-{selectedTableId.padStart(3, '0')}</p>
                    <p className="text-[9px] text-slate-400 font-medium">Date: 24 Jun 2026</p>
                    <p className="text-[10px] font-black text-blue-primary uppercase mt-1">Table: {selectedTableId}</p>
                  </div>
                </div>

                {/* Line Items Table */}
                <div className="mt-6 overflow-x-auto">
                  <table className="w-full text-xs text-left border-collapse">
                    <thead>
                      <tr className="border-b border-slate-200 text-slate-400 font-black uppercase tracking-wider text-[9px]">
                        <th className="py-2">Item</th>
                        <th className="py-2 text-center">HSN</th>
                        <th className="py-2 text-center">Qty</th>
                        <th className="py-2 text-right">Rate</th>
                        <th className="py-2 text-center">GST</th>
                        <th className="py-2 text-right">Amount</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100 text-slate-700 font-semibold">
                      {items.map((item, idx) => (
                        <tr key={idx}>
                          <td className="py-3 font-bold text-slate-900">
                            {item.name} <span className="text-[9px] text-slate-400 font-medium">({item.variant})</span>
                          </td>
                          <td className="py-3 text-center font-mono text-[10px] text-slate-400">21069099</td>
                          <td className="py-3 text-center">{item.qty || 1}</td>
                          <td className="py-3 text-right">₹{item.price || item.basePrice}</td>
                          <td className="py-3 text-center text-slate-400">5%</td>
                          <td className="py-3 text-right text-slate-900 font-bold">₹{(item.price || item.basePrice) * (item.qty || 1)}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>

              {/* Summary Summary */}
              <div className="mt-8 pt-4 border-t border-slate-200">
                <div className="w-full max-w-[280px] ml-auto space-y-2 text-xs font-semibold text-slate-700">
                  <div className="flex justify-between">
                    <span className="text-slate-400">Subtotal</span>
                    <span>₹{subtotal}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-400">GST (5%)</span>
                    <span>₹{gst}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-400">Round Off</span>
                    <span>₹0.00</span>
                  </div>
                  <div className="h-px bg-slate-200 my-1"></div>
                  <div className="flex justify-between font-black text-base text-blue-primary uppercase">
                    <span>TOTAL PAYABLE</span>
                    <span>₹{total}</span>
                  </div>
                </div>
              </div>
            </div>

            {/* Print & Download CTAs */}
            <div className="flex gap-4 mt-6">
              <button
                onClick={handlePrint}
                className="flex-1 py-3 bg-slate-100 hover:bg-slate-200 text-slate-700 font-black text-xs uppercase tracking-widest rounded-xl transition-colors flex items-center justify-center gap-2 border border-slate-200"
              >
                <Printer size={16} /> Print Invoice
              </button>
              <button
                onClick={handleDownload}
                className="flex-1 py-3 bg-blue-primary text-white hover:bg-blue-dark font-black text-xs uppercase tracking-widest rounded-xl transition-all flex items-center justify-center gap-2 shadow"
              >
                <Download size={16} /> Download PDF
              </button>
            </div>

          </div>
        </div>

        {/* Right 40%: Collect Payment Panels */}
        <div className="lg:col-span-5 space-y-6">
          <div className="bg-white p-6 md:p-8 rounded-3xl border border-blue-100 shadow-xl text-left">
            <h2 className="text-xl font-black uppercase text-blue-primary tracking-tight mb-4">
              COLLECT PAYMENT
            </h2>

            {/* Amount Box */}
            <div className="bg-blue-50 border border-blue-100 rounded-2xl p-5 mb-6 text-center">
              <p className="text-[10px] font-black uppercase tracking-wider text-blue-primary opacity-80 mb-1">DUE AMOUNT FOR T{selectedTableId}</p>
              <p className="text-4xl font-black text-blue-primary">₹{total}</p>
            </div>

            {/* Success Settle screen */}
            {paymentSuccess && receiptSummary ? (
              <div className="space-y-4 animate-fade-in">
                <div className="bg-green-50 border border-green-100 rounded-2xl p-5 text-center text-green-800 space-y-2">
                  <div className="w-12 h-12 bg-green-500 rounded-full flex items-center justify-center mx-auto border-4 border-green-200/50">
                    <CheckCircle className="text-white" size={24} />
                  </div>
                  <h3 className="font-black text-sm uppercase tracking-wider">PAID ✓</h3>
                  <p className="text-xs text-green-700 font-medium">
                    Table {receiptSummary.tableId} closed. Settle transaction logged in dashboard.
                  </p>
                </div>

                <div className="bg-slate-50 rounded-xl p-4 text-xs font-semibold text-slate-600 space-y-2">
                  <p className="text-[10px] font-black uppercase tracking-wider text-slate-400">Receipt Details</p>
                  <p>&bull; Amount Collected: <span className="font-bold text-slate-900">₹{receiptSummary.amount}</span></p>
                  <p>&bull; Method: <span className="font-bold text-slate-900">{receiptSummary.method}</span></p>
                  <p>&bull; Active Session: <span className="font-bold text-slate-900">{receiptSummary.time} mins</span> ({receiptSummary.rounds} order rounds)</p>
                </div>

                <button
                  onClick={handleResetForm}
                  className="w-full py-3 bg-blue-primary text-white font-black text-xs uppercase tracking-widest rounded-xl hover:bg-blue-dark transition-colors"
                >
                  Settle another table
                </button>
              </div>
            ) : (
              <div className="space-y-4">
                
                {/* Method selector pills */}
                {!paymentMethod ? (
                  <div className="grid grid-cols-2 gap-3">
                    {[
                      { key: 'UPI', label: '💳 UPI', icon: <QrCode size={16} /> },
                      { key: 'CASH', label: '💵 CASH', icon: <Wallet size={16} /> },
                      { key: 'CARD', label: '🃏 CARD', icon: <CreditCard size={16} /> },
                      { key: 'SPLIT', label: '✂️ SPLIT', icon: <Users size={16} /> }
                    ].map((m) => (
                      <button
                        key={m.key}
                        onClick={() => {
                          if (m.key === 'SPLIT') {
                            setPaymentMethod('SPLIT');
                            // Setup default split
                            setSplitAmounts({
                              cash: Math.round(total * 0.5),
                              upi: total - Math.round(total * 0.5)
                            });
                          } else {
                            handlePaymentConfirm(m.key);
                          }
                        }}
                        className="py-4 bg-slate-100 hover:bg-blue-primary hover:text-white text-slate-800 rounded-xl text-xs font-black uppercase tracking-wider transition-all flex flex-col items-center justify-center gap-2 border border-slate-200/50 hover:border-transparent hover:shadow-md"
                      >
                        <span className="text-lg">{m.label.split(' ')[0]}</span>
                        <span>{m.label.split(' ')[1]}</span>
                      </button>
                    ))}
                  </div>
                ) : (
                  /* Split payment UI */
                  <form onSubmit={handleSplitPaymentConfirm} className="bg-slate-50 border border-slate-200 rounded-2xl p-4 space-y-4 animate-slide-up">
                    <div className="flex justify-between items-center pb-2 border-b border-slate-200">
                      <span className="text-xs font-black uppercase tracking-wider text-slate-800">SPLIT PAYMENTS</span>
                      <button 
                        type="button" 
                        onClick={() => setPaymentMethod(null)}
                        className="text-[10px] font-black text-red-500 uppercase hover:underline"
                      >
                        Cancel
                      </button>
                    </div>

                    <div className="space-y-3">
                      <div>
                        <label className="text-[9px] font-black uppercase tracking-wider text-slate-400 mb-1 block">Person 1: Cash Settle</label>
                        <div className="flex gap-2">
                          <span className="p-2 bg-slate-200 text-slate-600 rounded-xl text-xs font-bold uppercase shrink-0">💵 CASH</span>
                          <input
                            type="number"
                            required
                            min={0}
                            max={total}
                            value={splitAmounts.cash}
                            onChange={(e) => {
                              const val = Number(e.target.value);
                              setSplitAmounts({
                                cash: val,
                                upi: total - val
                              });
                            }}
                            className="flex-1 p-2.5 rounded-xl border border-slate-200 bg-white text-xs font-bold focus:outline-none focus:border-blue-primary"
                          />
                        </div>
                      </div>

                      <div>
                        <label className="text-[9px] font-black uppercase tracking-wider text-slate-400 mb-1 block">Person 2: UPI Settle</label>
                        <div className="flex gap-2">
                          <span className="p-2 bg-slate-200 text-slate-600 rounded-xl text-xs font-bold uppercase shrink-0">💳 UPI</span>
                          <input
                            type="number"
                            required
                            min={0}
                            max={total}
                            value={splitAmounts.upi}
                            onChange={(e) => {
                              const val = Number(e.target.value);
                              setSplitAmounts({
                                upi: val,
                                cash: total - val
                              });
                            }}
                            className="flex-1 p-2.5 rounded-xl border border-slate-200 bg-white text-xs font-bold focus:outline-none focus:border-blue-primary"
                          />
                        </div>
                      </div>
                    </div>

                    <div className="bg-blue-50 p-2.5 rounded-xl border border-blue-100 flex justify-between items-center text-[10px] text-blue-800 font-semibold">
                      <span>Total Split: ₹{Number(splitAmounts.cash) + Number(splitAmounts.upi)}</span>
                      <span className="text-green-600 font-bold uppercase flex items-center gap-1">✓ Matching</span>
                    </div>

                    <button
                      type="submit"
                      className="w-full py-3 bg-yellow-400 text-blue-950 font-black text-xs uppercase tracking-widest rounded-xl hover:bg-yellow-300 transition-colors shadow"
                    >
                      CONFIRM SPLIT PAYMENT
                    </button>
                  </form>
                )}
              </div>
            )}
          </div>

          {/* Recent transactions list */}
          <div className="bg-white p-6 md:p-8 rounded-3xl border border-blue-100 shadow-xl text-left">
            <h3 className="text-sm font-black uppercase tracking-wider text-slate-800 mb-4 pb-2 border-b border-slate-100">
              RECENT TRANSACTIONS
            </h3>

            <div className="space-y-3 max-h-[220px] overflow-y-auto pr-1 no-scrollbar">
              {transactions.map((tx, idx) => (
                <div key={idx} className="flex justify-between items-center text-xs font-semibold border-b border-slate-50 pb-2">
                  <div>
                    <span className="font-bold text-slate-900">Table {tx.tableId}</span>
                    <p className="text-[9px] text-slate-400 font-medium">Closed via {tx.method} &bull; {tx.time}</p>
                  </div>
                  <span className="font-black text-green-600">₹{tx.amount}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Billing;
