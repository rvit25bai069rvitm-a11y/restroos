import React, { createContext, useContext, useState, useEffect } from 'react';

const RestOSContext = createContext(null);

const DEFAULT_TABLES = {};
for (let i = 1; i <= 24; i++) {
  if (i === 4) {
    DEFAULT_TABLES[i] = { status: 'occupied', currentAmount: 1260, sessionMinutes: 14 };
  } else if (i === 7) {
    DEFAULT_TABLES[i] = { status: 'occupied', currentAmount: 1460, sessionMinutes: 23 };
  } else if (i === 9) {
    DEFAULT_TABLES[i] = { status: 'occupied', currentAmount: 840, sessionMinutes: 40 };
  } else if (i === 12) {
    DEFAULT_TABLES[i] = { status: 'free', currentAmount: 0, sessionMinutes: 0 };
  } else if (i === 8) {
    DEFAULT_TABLES[i] = { status: 'reserved', currentAmount: 0, sessionMinutes: 0 };
  } else if (i === 2) {
    DEFAULT_TABLES[i] = { status: 'cleaning', currentAmount: 0, sessionMinutes: 0 };
  } else {
    // Randomize a few occupied tables to match activeTables count
    if ([3, 10, 15, 18, 22].includes(i)) {
      DEFAULT_TABLES[i] = { status: 'occupied', currentAmount: 650, sessionMinutes: 18 };
    } else {
      DEFAULT_TABLES[i] = { status: 'free', currentAmount: 0, sessionMinutes: 0 };
    }
  }
}

const DEFAULT_ORDERS = {
  'ORD-0031': {
    id: 'ORD-0031',
    tableId: 9,
    status: 'ready', // new|accepted|preparing|ready|served|cancelled
    items: [
      { name: 'California Roll', qty: 2, price: 420, variant: 'Regular', spice: 'None' }
    ],
    total: 840,
    round: 1,
    timestamp: '12:15 PM'
  },
  'ORD-0032': {
    id: 'ORD-0032',
    tableId: 7,
    status: 'preparing',
    items: [
      { name: 'Tonkotsu Ramen', qty: 1, price: 560, variant: 'Regular', spice: 'Medium' },
      { name: 'Tempura Prawns', qty: 2, price: 450, variant: 'Regular', spice: 'None' }
    ],
    total: 1460,
    round: 1,
    timestamp: '12:20 PM'
  },
  'ORD-0038': {
    id: 'ORD-0038',
    tableId: 4,
    status: 'preparing',
    items: [
      { name: 'California Roll', qty: 2, price: 420, variant: 'Regular', spice: 'None' },
      { name: 'Miso Ramen', qty: 1, price: 420, variant: 'Regular', spice: 'None' }
    ],
    total: 1260,
    round: 1,
    timestamp: '12:30 PM'
  }
};

const DEFAULT_KPIS = {
  revenue: 48750,
  ordersToday: 128,
  activeTables: 8,
  cancelledOrders: 3,
  avgPrepTime: 14
};

const DEFAULT_STATE = {
  orders: DEFAULT_ORDERS,
  tables: DEFAULT_TABLES,
  kpis: DEFAULT_KPIS,
  lastAction: 'System Initialized',
  lastActionTime: new Date().toLocaleTimeString(),
  notifications: [],
  transactions: [
    { tableId: 4, amount: 1420, method: 'UPI', time: '1:15 PM' },
    { tableId: 7, amount: 850, method: 'Cash', time: '12:48 PM' },
    { tableId: 2, amount: 2100, method: 'Card', time: '12:20 PM' }
  ]
};

// Create a cross-tab communication channel
const syncChannel = new BroadcastChannel('restos_sync');

export const RestOSProvider = ({ children }) => {
  const [state, setState] = useState(() => {
    const saved = localStorage.getItem('restos_state');
    return saved ? JSON.parse(saved) : DEFAULT_STATE;
  });

  const [toasts, setToasts] = useState([]);

  // Save to localStorage whenever state changes
  useEffect(() => {
    localStorage.setItem('restos_state', JSON.stringify(state));
  }, [state]);

  // Toast helper
  const addToast = (message, type = 'info') => {
    const id = Date.now() + Math.random().toString(36).substr(2, 9);
    setToasts((prev) => [...prev, { id, message, type }]);
    setTimeout(() => {
      setToasts((prev) => prev.filter((t) => t.id !== id));
    }, 5000);
  };

  // Sync state across browser tabs
  useEffect(() => {
    const handleSync = (event) => {
      if (event.data && event.data.type === 'STATE_UPDATE') {
        setState(event.data.state);
        if (event.data.toast) {
          addToast(event.data.toast.message, event.data.toast.type);
        }
      }
    };

    syncChannel.addEventListener('message', handleSync);
    return () => {
      syncChannel.removeEventListener('message', handleSync);
    };
  }, []);

  const updateState = (newState, actionLabel, toastData = null) => {
    const timeStr = new Date().toLocaleTimeString();
    
    // Add notification to history if toastData is provided
    let updatedNotifications = newState.notifications || [];
    if (toastData) {
      const newNotif = {
        id: Date.now() + Math.random().toString(36).substr(2, 9),
        message: toastData.message,
        type: toastData.type,
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' })
      };
      updatedNotifications = [newNotif, ...updatedNotifications].slice(0, 30);
    }

    const finalState = {
      ...newState,
      notifications: updatedNotifications,
      lastAction: actionLabel,
      lastActionTime: timeStr
    };
    setState(finalState);
    
    // Broadcast to other tabs
    syncChannel.postMessage({
      type: 'STATE_UPDATE',
      state: finalState,
      toast: toastData
    });

    if (toastData) {
      addToast(toastData.message, toastData.type);
    }
  };

  // Reset demo function
  const resetDemo = () => {
    updateState(DEFAULT_STATE, 'Demo Reset', {
      message: 'Demo state has been reset to defaults.',
      type: 'info'
    });
  };

  // Action: Place Order
  const placeOrder = (tableId, items, orderId = null) => {
    const newOrderId = orderId || `ORD-${String(state.kpis.ordersToday + 1).padStart(4, '0')}`;
    const total = items.reduce((sum, item) => sum + (item.price * (item.qty || 1)), 0);
    
    const updatedOrders = {
      ...state.orders,
      [newOrderId]: {
        id: newOrderId,
        tableId: Number(tableId),
        status: 'new',
        items,
        total,
        round: state.orders[newOrderId] ? state.orders[newOrderId].round + 1 : 1,
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
      }
    };

    const currentTableAmount = (state.tables[tableId]?.currentAmount || 0) + total;
    const updatedTables = {
      ...state.tables,
      [tableId]: {
        ...state.tables[tableId],
        status: 'occupied',
        currentAmount: currentTableAmount,
        sessionMinutes: state.tables[tableId]?.status === 'occupied' ? state.tables[tableId].sessionMinutes : 5
      }
    };

    // Recalculate KPIs
    const activeTablesCount = Object.values(updatedTables).filter(t => t.status === 'occupied' || t.status === 'bill_requested').length;
    const updatedKpis = {
      ...state.kpis,
      ordersToday: state.kpis.ordersToday + 1,
      activeTables: activeTablesCount
    };

    updateState(
      { ...state, orders: updatedOrders, tables: updatedTables, kpis: updatedKpis },
      `Order Placed: ${newOrderId}`,
      { message: `New order ${newOrderId} placed for Table ${tableId}!`, type: 'success' }
    );
    return newOrderId;
  };

  // Action: KDS Accept Order
  const acceptOrder = (orderId) => {
    if (!state.orders[orderId]) return;
    const order = state.orders[orderId];
    
    const updatedOrders = {
      ...state.orders,
      [orderId]: {
        ...order,
        status: 'accepted'
      }
    };

    updateState(
      { ...state, orders: updatedOrders },
      `Order Accepted: ${orderId}`,
      { message: `Order ${orderId} has been accepted by kitchen.`, type: 'info' }
    );
  };

  // Action: KDS Cancel Order
  const cancelOrder = (orderId, reason) => {
    if (!state.orders[orderId]) return;
    const order = state.orders[orderId];
    
    const updatedOrders = {
      ...state.orders,
      [orderId]: {
        ...order,
        status: 'cancelled',
        cancelReason: reason
      }
    };

    // Check if table has other active orders, if not update table status
    const tableId = order.tableId;
    const hasActiveOrders = Object.values(updatedOrders).some(
      o => o.tableId === tableId && o.status !== 'cancelled' && o.status !== 'served'
    );
    
    const updatedTables = { ...state.tables };
    if (!hasActiveOrders && updatedTables[tableId]) {
      updatedTables[tableId] = {
        ...updatedTables[tableId],
        status: 'free',
        currentAmount: 0
      };
    }

    const activeTablesCount = Object.values(updatedTables).filter(t => t.status === 'occupied' || t.status === 'bill_requested').length;
    const updatedKpis = {
      ...state.kpis,
      cancelledOrders: state.kpis.cancelledOrders + 1,
      activeTables: activeTablesCount
    };

    updateState(
      { ...state, orders: updatedOrders, tables: updatedTables, kpis: updatedKpis },
      `Order Cancelled: ${orderId}`,
      { message: `Order ${orderId} cancelled: ${reason}`, type: 'warning' }
    );
  };

  // Action: KDS Preparing
  const startPreparingOrder = (orderId) => {
    if (!state.orders[orderId]) return;
    const order = state.orders[orderId];
    
    const updatedOrders = {
      ...state.orders,
      [orderId]: {
        ...order,
        status: 'preparing'
      }
    };

    updateState(
      { ...state, orders: updatedOrders },
      `Order Preparing: ${orderId}`,
      { message: `Kitchen is preparing order ${orderId}.`, type: 'info' }
    );
  };

  // Action: KDS Ready
  const markOrderReady = (orderId) => {
    if (!state.orders[orderId]) return;
    const order = state.orders[orderId];
    
    const updatedOrders = {
      ...state.orders,
      [orderId]: {
        ...order,
        status: 'ready'
      }
    };

    updateState(
      { ...state, orders: updatedOrders },
      `Order Ready: ${orderId}`,
      { message: `🔔 Order ${orderId} for Table ${order.tableId} is READY!`, type: 'success' }
    );
  };

  // Action: Mark Served
  const markOrderServed = (orderId) => {
    if (!state.orders[orderId]) return;
    const order = state.orders[orderId];
    
    const updatedOrders = {
      ...state.orders,
      [orderId]: {
        ...order,
        status: 'served'
      }
    };

    updateState(
      { ...state, orders: updatedOrders },
      `Order Served: ${orderId}`,
      { message: `Order ${orderId} has been served to Table ${order.tableId}.`, type: 'success' }
    );
  };

  // Action: Request Bill (Guest)
  const requestBill = (tableId) => {
    if (!state.tables[tableId]) return;
    
    const updatedTables = {
      ...state.tables,
      [tableId]: {
        ...state.tables[tableId],
        status: 'bill_requested'
      }
    };

    updateState(
      { ...state, tables: updatedTables },
      `Bill Requested: Table ${tableId}`,
      { message: `Table ${tableId} requested their bill.`, type: 'warning' }
    );
  };

  // Action: Complete Payment / Clear Table
  const completePayment = (tableId, paymentMethod) => {
    if (!state.tables[tableId]) return;
    const amount = state.tables[tableId].currentAmount;
    
    const updatedTables = {
      ...state.tables,
      [tableId]: {
        status: 'free',
        currentAmount: 0,
        sessionMinutes: 0
      }
    };

    // Add to transaction history
    const updatedTransactions = [
      {
        tableId: Number(tableId),
        amount,
        method: paymentMethod,
        time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
      },
      ...state.transactions
    ];

    // Mark all table's orders as served if they aren't cancelled or served yet
    const updatedOrders = { ...state.orders };
    Object.keys(updatedOrders).forEach(id => {
      if (updatedOrders[id].tableId === Number(tableId) && updatedOrders[id].status !== 'cancelled') {
        updatedOrders[id].status = 'served';
      }
    });

    const activeTablesCount = Object.values(updatedTables).filter(t => t.status === 'occupied' || t.status === 'bill_requested').length;
    const updatedKpis = {
      ...state.kpis,
      revenue: state.kpis.revenue + amount,
      activeTables: activeTablesCount
    };

    updateState(
      {
        ...state,
        tables: updatedTables,
        orders: updatedOrders,
        kpis: updatedKpis,
        transactions: updatedTransactions
      },
      `Payment Confirmed: Table ${tableId}`,
      { message: `Table ${tableId} closed. ₹${amount} collected via ${paymentMethod}.`, type: 'success' }
    );
  };

  // Action: Notify Delay
  const notifyDelay = (orderId) => {
    if (!state.orders[orderId]) return;
    const order = state.orders[orderId];

    const updatedOrders = {
      ...state.orders,
      [orderId]: {
        ...order,
        delayNotified: true
      }
    };

    updateState(
      { ...state, orders: updatedOrders },
      `Delay Notified: ${orderId}`,
      { message: `📱 Guest on Table ${order.tableId} notified about delay.`, type: 'info' }
    );
  };

  // Direct state sync helper for manual simulations
  const setOrderTrackerStatus = (orderId, newStatus) => {
    if (!state.orders[orderId]) return;
    const order = state.orders[orderId];
    
    const updatedOrders = {
      ...state.orders,
      [orderId]: {
        ...order,
        status: newStatus
      }
    };

    updateState(
      { ...state, orders: updatedOrders },
      `Simulated Status Change: ${orderId} -> ${newStatus}`,
      { message: `Simulated: Order ${orderId} is now ${newStatus.toUpperCase()}`, type: 'info' }
    );
  };

  return (
    <RestOSContext.Provider
      value={{
        ...state,
        toasts,
        placeOrder,
        acceptOrder,
        cancelOrder,
        startPreparingOrder,
        markOrderReady,
        markOrderServed,
        requestBill,
        completePayment,
        notifyDelay,
        setOrderTrackerStatus,
        resetDemo
      }}
    >
      {children}
    </RestOSContext.Provider>
  );
};

export const useRestOS = () => {
  const context = useContext(RestOSContext);
  if (!context) {
    throw new Error('useRestOS must be used within a RestOSProvider');
  }
  return context;
};
