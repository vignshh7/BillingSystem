import { useCallback, useEffect, useMemo, useRef, useState } from 'react';

const API_BASE = import.meta.env.VITE_API_BASE || 'http://localhost:4000';
const GST_RATE = 0.18;
const fmt = v => `$${Number(v || 0).toFixed(2)}`;

/* ─── date range helper ─── */
function getDateRange(filter) {
  const t = new Date();
  if (filter === 'today') return {
    start: new Date(t.getFullYear(), t.getMonth(), t.getDate(), 0, 0, 0),
    end:   new Date(t.getFullYear(), t.getMonth(), t.getDate(), 23, 59, 59),
  };
  if (filter === 'yesterday') return {
    start: new Date(t.getFullYear(), t.getMonth(), t.getDate() - 1, 0, 0, 0),
    end:   new Date(t.getFullYear(), t.getMonth(), t.getDate() - 1, 23, 59, 59),
  };
  if (filter === 'thisWeek') {
    const d = new Date(t); d.setDate(t.getDate() - t.getDay());
    return {
      start: new Date(d.getFullYear(), d.getMonth(), d.getDate(), 0, 0, 0),
      end:   new Date(t.getFullYear(), t.getMonth(), t.getDate(), 23, 59, 59),
    };
  }
  if (filter === 'lastWeek') {
    const d1 = new Date(t); d1.setDate(t.getDate() - t.getDay() - 7);
    const d2 = new Date(d1); d2.setDate(d1.getDate() + 6);
    return {
      start: new Date(d1.getFullYear(), d1.getMonth(), d1.getDate(), 0, 0, 0),
      end:   new Date(d2.getFullYear(), d2.getMonth(), d2.getDate(), 23, 59, 59),
    };
  }
  if (filter === 'thisMonth') return {
    start: new Date(t.getFullYear(), t.getMonth(), 1, 0, 0, 0),
    end:   new Date(t.getFullYear(), t.getMonth(), t.getDate(), 23, 59, 59),
  };
  if (filter === 'lastMonth') return {
    start: new Date(t.getFullYear(), t.getMonth() - 1, 1, 0, 0, 0),
    end:   new Date(t.getFullYear(), t.getMonth(), 0, 23, 59, 59),
  };
  return null;
}

/* ─── print receipt in popup ─── */
function printBill(bill) {
  const w = window.open('', '_blank', 'width=420,height=640');
  if (!w) { alert('Pop-up blocked. Allow pop-ups to print.'); return; }
  const date = bill.date ? new Date(bill.date).toLocaleString() : new Date().toLocaleString();
  w.document.write(`<!DOCTYPE html><html><head>
    <title>Receipt</title>
    <style>
      body{font-family:Arial,sans-serif;padding:24px;max-width:360px;margin:0 auto;font-size:14px}
      h2{text-align:center;margin-bottom:4px;font-size:20px}
      .center{text-align:center;color:#555;margin-bottom:12px}
      hr{border:none;border-top:1px dashed #aaa;margin:10px 0}
      .row{display:flex;justify-content:space-between;margin:3px 0}
      .bold{font-weight:bold}
      .red{color:red}.green{color:#28a745}
      @media print{body{padding:0}}
    </style></head><body>
    <h2>RECEIPT</h2>
    <p class="center">${date}</p>
    ${bill.tableNo ? `<p class="center">Table: ${bill.tableNo}${bill.cover ? ' &nbsp;|&nbsp; Cover: ' + bill.cover : ''}</p>` : ''}
    <hr>
    ${(bill.items || []).map(it =>
      `<div class="row"><span>${it.name} &times;${it.quantity}</span><span>${fmt(it.quantity * it.unitPrice)}</span></div>`
    ).join('')}
    <hr>
    <div class="row"><span>Subtotal</span><span>${fmt(bill.total)}</span></div>
    <div class="row"><span>GST (18%)</span><span>${fmt(bill.gst)}</span></div>
    <hr>
    <div class="row bold red"><span>PAYABLE</span><span>${fmt(bill.payable)}</span></div>
    <div class="row"><span>Tender</span><span>${fmt(bill.tender)}</span></div>
    <div class="row bold green"><span>Change</span><span>${fmt(bill.change)}</span></div>
    <hr>
    <p class="center">Thank you for your visit!</p>
    </body></html>`);
  w.document.close();
  setTimeout(() => { w.focus(); w.print(); }, 400);
}

/* ─── Toast notification ─── */
function Toast({ message, type = 'info', onClose }) {
  useEffect(() => {
    const t = setTimeout(onClose, 3200);
    return () => clearTimeout(t);
  }, [onClose]);
  const bg = { info: '#333', success: '#28a745', error: '#dc3545', warning: '#e67e22' }[type] || '#333';
  return (
    <div style={{
      position: 'fixed', top: 18, right: 18, zIndex: 99999,
      background: bg, color: '#fff', padding: '11px 18px',
      borderRadius: 7, boxShadow: '0 4px 14px rgba(0,0,0,.35)',
      fontSize: 14, fontFamily: 'Arial,sans-serif', display: 'flex',
      alignItems: 'center', gap: 10, maxWidth: 320
    }}>
      {message}
      <button onClick={onClose} style={{ background: 'none', border: 'none', color: '#fff', fontSize: 18, cursor: 'pointer', lineHeight: 1, padding: 0 }}>×</button>
    </div>
  );
}

/* ─── Modal ─── */
function Modal({ title, children, onClose, width = 500 }) {
  return (
    <div style={{
      position: 'fixed', inset: 0, zIndex: 9000,
      background: 'rgba(0,0,0,.55)', display: 'flex',
      alignItems: 'center', justifyContent: 'center'
    }}>
      <div style={{
        background: '#fff', borderRadius: 8, padding: 24,
        width, maxWidth: '95vw', maxHeight: '80vh',
        display: 'flex', flexDirection: 'column', gap: 14,
        boxShadow: '0 8px 32px rgba(0,0,0,.3)'
      }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <h3 style={{ margin: 0, color: 'orange', fontFamily: 'Arial,sans-serif' }}>{title}</h3>
          <button onClick={onClose} style={{ background: 'none', border: 'none', fontSize: 22, cursor: 'pointer', lineHeight: 1 }}>×</button>
        </div>
        <div style={{ overflowY: 'auto', flex: 1, fontFamily: 'Arial,sans-serif' }}>{children}</div>
      </div>
    </div>
  );
}

/* ─── Filter bar for reports ─── */
function FilterBar({ filter, onFilterChange, customStart, setCustomStart, customEnd, setCustomEnd, showCustom }) {
  return (
    <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', gap: 10, marginBottom: 20, flexWrap: 'wrap' }}>
      <label style={{ fontFamily: 'Arial,sans-serif' }}>Filter By:</label>
      <select value={filter} onChange={e => onFilterChange(e.target.value)}
        style={{ padding: '6px 10px', fontSize: 14, borderRadius: 4, border: '1px solid #ccc' }}>
        <option value="">— All —</option>
        <option value="today">Today</option>
        <option value="yesterday">Yesterday</option>
        <option value="thisWeek">This Week</option>
        <option value="lastWeek">Last Week</option>
        <option value="thisMonth">This Month</option>
        <option value="lastMonth">Last Month</option>
        <option value="custom">Custom Range</option>
      </select>
      {showCustom && (
        <>
          <input type="datetime-local" value={customStart} onChange={e => setCustomStart(e.target.value)}
            style={{ padding: '5px 8px', fontSize: 13, borderRadius: 4, border: '1px solid #ccc' }} />
          <span style={{ fontFamily: 'Arial' }}>to</span>
          <input type="datetime-local" value={customEnd} onChange={e => setCustomEnd(e.target.value)}
            style={{ padding: '5px 8px', fontSize: 13, borderRadius: 4, border: '1px solid #ccc' }} />
        </>
      )}
    </div>
  );
}

/* ════════════════════════════════════════════
   MAIN APP
════════════════════════════════════════════ */
export default function App() {

  /* ── data ── */
  const [menuItems,   setMenuItems]   = useState([]);
  const [menuLoaded,  setMenuLoaded]  = useState(false);
  const [bills,       setBills]       = useState([]);

  /* ── current order ── */
  const [order,       setOrder]       = useState([]);
  const [history,     setHistory]     = useState([]);

  /* ── billing flow ── */
  const [isBilled,    setIsBilled]    = useState(false);
  const [billSummary, setBillSummary] = useState(null);   // {items,total,gst,payable}
  const [tender,      setTender]      = useState(0);      // accumulated via $2/$5/$10/$50
  const [tenderInput, setTenderInput] = useState('');     // typed override amount
  const [billSaved,   setBillSaved]   = useState(false);
  const [savedBill,   setSavedBill]   = useState(null);

  /* ── views ── */
  const [view,        setView]        = useState('main'); // 'main'|'sales'|'inventory'

  /* ── form inputs ── */
  const [itemNum,  setItemNum]  = useState('');
  const [qty,      setQty]      = useState('');
  const [price,    setPrice]    = useState('');
  const [tableNo,  setTableNo]  = useState('');
  const [cover,    setCover]    = useState('');

  /* ── report filters ── */
  const [filter,       setFilter]       = useState('');
  const [customStart,  setCustomStart]  = useState('');
  const [customEnd,    setCustomEnd]    = useState('');
  const [showCustom,   setShowCustom]   = useState(false);

  /* ── UI overlays ── */
  const [toast,              setToast]              = useState(null);   // {message, type}
  const [showRestoreModal,   setShowRestoreModal]   = useState(false);
  const [reservations,       setReservations]       = useState([]);
  const [showGoodsReturn,    setShowGoodsReturn]    = useState(false);


  /* ── numpad active input ref ── */
  const activeRef = useRef(null);   // holds a state-setter fn for the focused input

  /* ════ helpers ════ */
  const showToast = useCallback((message, type = 'info') => setToast({ message, type }), []);

  const resetBillingState = useCallback(() => {
    setIsBilled(false); setBillSummary(null);
    setTender(0); setTenderInput('');
    setBillSaved(false); setSavedBill(null);
  }, []);

  const resetOrder = useCallback(() => {
    setOrder([]); setHistory([]);
    setShowGoodsReturn(false);
    resetBillingState();
  }, [resetBillingState]);

  /* ════ LOAD MENU ════ */
  useEffect(() => {
    if (menuLoaded) return;
    fetch(`${API_BASE}/api/menu`)
      .then(r => r.json())
      .then(data => { setMenuItems(data); setMenuLoaded(true); })
      .catch(() => showToast('Cannot reach backend. Start the server on port 4000.', 'error'));
  }, [menuLoaded, showToast]);

  /* ════ LOAD BILLS (for reports) ════ */
  const loadBills = useCallback(() => {
    fetch(`${API_BASE}/api/bills`)
      .then(r => r.json())
      .then(data => setBills(Array.isArray(data) ? data : []))
      .catch(() => showToast('Failed to load bill history.', 'error'));
  }, [showToast]);

  useEffect(() => {
    if (view === 'sales' || view === 'inventory') loadBills();
  }, [view, loadBills]);

  /* ════ ORDER TOTAL ════ */
  const orderTotal = useMemo(
    () => order.reduce((s, it) => s + it.quantity * it.unitPrice, 0), [order]
  );

  /* ════ ADD ITEM ════ */
  const addItem = useCallback((name, quantity, unitPrice) => {
    if (isBilled) { showToast('Finish or cancel the current bill first.', 'warning'); return; }
    setOrder(prev => {
      const idx = prev.findIndex(it => it.name === name);
      if (idx >= 0) {
        const next = [...prev];
        next[idx] = { ...next[idx], quantity: next[idx].quantity + quantity };
        return next;
      }
      return [...prev, { name, quantity, unitPrice }];
    });
    setHistory(prev => [...prev, ...Array(quantity).fill(name)]);
  }, [isBilled, showToast]);

  /* ════ CANCEL LAST ITEM ════ */
  const handleCancelItem = useCallback(() => {
    if (isBilled) { showToast('Cannot cancel — bill already raised. Use New Bill.', 'warning'); return; }
    if (history.length === 0) { showToast('No items to cancel.', 'warning'); return; }
    const lastName = history[history.length - 1];
    setHistory(prev => prev.slice(0, -1));
    setOrder(prev => {
      const idx = prev.findIndex(it => it.name === lastName);
      if (idx < 0) return prev;
      const next = [...prev];
      if (next[idx].quantity > 1) next[idx] = { ...next[idx], quantity: next[idx].quantity - 1 };
      else next.splice(idx, 1);
      return next;
    });
  }, [isBilled, history, showToast]);

  /* ════ MANUAL ADD ════ */
  const handleManualAdd = useCallback(() => {
    const q = parseInt(qty, 10);
    const p = parseFloat(price);
    if (!itemNum.trim()) { showToast('Enter an Item Number.', 'warning'); return; }
    if (!(q > 0))        { showToast('Quantity must be > 0.', 'warning'); return; }
    if (!(p > 0))        { showToast('Price must be > 0.', 'warning'); return; }
    addItem(`Item ${itemNum.trim()}`, q, p);
    setItemNum(''); setQty(''); setPrice('');
  }, [itemNum, qty, price, addItem, showToast]);

  /* ════ BILL (raise invoice) ════ */
  const handleBill = useCallback(() => {
    if (order.length === 0) { showToast('Add items before raising the bill.', 'warning'); return; }
    const total   = order.reduce((s, it) => s + it.quantity * it.unitPrice, 0);
    const gst     = total * GST_RATE;
    const payable = total + gst;
    setBillSummary({ items: [...order], total, gst, payable });
    setTender(0); setTenderInput('');
    setBillSaved(false); setSavedBill(null);
    setIsBilled(true);
    setShowGoodsReturn(false);
  }, [order, showToast]);

  /* ════ TENDER BUTTONS ════ */
  const handleTenderBtn = useCallback(val => setTender(prev => prev + val), []);

  /* current effective tender (typed overrides buttons) */
  const currentTender = tenderInput !== '' ? (parseFloat(tenderInput) || 0) : tender;

  /* ════ SAVE TENDER → finalize bill via API ════ */
  const handleSaveTender = useCallback(async () => {
    if (!billSummary) return;
    const t = currentTender;
    if (t <= 0)                   { showToast('Enter a tender amount.', 'warning'); return; }
    if (t < billSummary.payable)  { showToast(`Tender too low. Payable: ${fmt(billSummary.payable)}`, 'warning'); return; }
    try {
      const res = await fetch(`${API_BASE}/api/bills`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          items: billSummary.items,
          tender: t,
          tableNo,
          cover
        })
      });
      if (!res.ok) throw new Error(await res.text());
      const saved = await res.json();
      setSavedBill(saved);
      setBills(prev => [...prev, saved]);
      setTender(t);
      setBillSaved(true);
      showToast(`Bill saved! Change: ${fmt(saved.change)}`, 'success');
    } catch (err) {
      showToast('Failed to save bill — ' + (err.message || 'server error'), 'error');
    }
  }, [billSummary, currentTender, tableNo, cover, showToast]);

  /* ════ NUMPAD ════ */
  const handleNumpad = useCallback(val => {
    if (isBilled && !billSaved) {
      // In billing mode: feed numpad into the tender input
      setTenderInput(prev => {
        if (val === '-') return prev;   // minus has no use in tender
        return prev + val;
      });
      return;
    }
    if (activeRef.current) activeRef.current(prev => prev + val);
  }, [isBilled, billSaved]);

  /* ════ RESERVE TRANSACTION (save aside) ════ */
  const handleReserveTransaction = useCallback(async () => {
    if (order.length === 0) { showToast('No items in order to reserve.', 'warning'); return; }
    if (isBilled) { showToast('Finish the bill before reserving.', 'warning'); return; }
    try {
      const res = await fetch(`${API_BASE}/api/reservations`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ items: order, tableNo, cover, reservedAt: new Date().toISOString() })
      });
      if (!res.ok) throw new Error();
      resetOrder();
      showToast('Transaction reserved! You can start a new order.', 'success');
    } catch {
      showToast('Failed to reserve transaction.', 'error');
    }
  }, [order, isBilled, tableNo, cover, resetOrder, showToast]);

  /* ════ RESTORE TRANSACTION ════ */
  const handleOpenRestore = useCallback(async () => {
    try {
      const res  = await fetch(`${API_BASE}/api/reservations`);
      const data = await res.json();
      if (!Array.isArray(data) || data.length === 0) {
        showToast('No reserved transactions found.', 'info');
        return;
      }
      setReservations(data);
      setShowRestoreModal(true);
    } catch {
      showToast('Failed to fetch reservations.', 'error');
    }
  }, [showToast]);

  const handleRestoreReservation = useCallback(async (rv) => {
    setShowRestoreModal(false);
    // reset billing state but preserve new items
    resetBillingState();
    setShowGoodsReturn(false);
    setOrder(rv.items);
    setHistory(rv.items.flatMap(it => Array(it.quantity).fill(it.name)));
    if (rv.tableNo) setTableNo(rv.tableNo);
    if (rv.cover)   setCover(rv.cover);
    // delete reservation from server
    try {
      await fetch(`${API_BASE}/api/reservations/${rv.id}`, { method: 'DELETE' });
    } catch { /* non-critical */ }
    showToast('Transaction restored!', 'success');
  }, [resetBillingState, showToast]);

  /* ════ GOODS RETURN ════ */
  const handleGoodsReturn = useCallback((itemName) => {
    if (isBilled) { showToast('Cannot return after billing. Use New Bill first.', 'warning'); return; }
    setOrder(prev => {
      const idx = prev.findIndex(it => it.name === itemName);
      if (idx < 0) return prev;
      const next = [...prev];
      if (next[idx].quantity > 1) next[idx] = { ...next[idx], quantity: next[idx].quantity - 1 };
      else next.splice(idx, 1);
      return next;
    });
    // remove one occurrence from history
    setHistory(prev => {
      const ri = [...prev].reverse().findIndex(n => n === itemName);
      if (ri < 0) return prev;
      const realIdx = prev.length - 1 - ri;
      return prev.filter((_, i) => i !== realIdx);
    });
    showToast(`Returned 1× ${itemName}`, 'success');
  }, [isBilled, showToast]);

  /* ════ TERMINATE TRANSACTION ════ */
  const handleTerminate = useCallback(() => {
    if (order.length === 0 && !isBilled) { showToast('No active transaction.', 'info'); return; }
    if (window.confirm('Terminate this transaction? All items will be cleared.')) resetOrder();
  }, [order, isBilled, resetOrder]);

  /* ════ DELETE ALL BILLS ════ */
  const handleDeleteAllTransactions = useCallback(async () => {
    if (!window.confirm('Permanently delete ALL saved bills? This cannot be undone.')) return;
    try {
      const res = await fetch(`${API_BASE}/api/bills`, { method: 'DELETE' });
      if (!res.ok) throw new Error();
      setBills([]);
      resetOrder();
      showToast('All transactions deleted.', 'success');
    } catch {
      showToast('Failed to delete transactions.', 'error');
    }
  }, [resetOrder, showToast]);

  /* ════ PRINT ════ */
  const handlePrint = useCallback(() => {
    if (savedBill)    { printBill(savedBill); return; }
    if (billSummary)  {
      printBill({ ...billSummary, id: 'PREVIEW', tableNo, cover,
        date: new Date().toISOString(), tender: currentTender, change: currentTender - billSummary.payable });
      return;
    }
    if (order.length === 0) { showToast('Nothing to print.', 'warning'); return; }
    const total = orderTotal, gst = total * GST_RATE, payable = total + gst;
    printBill({ items: order, total, gst, payable, tender: 0, change: 0,
      id: 'DRAFT', tableNo, cover, date: new Date().toISOString() });
  }, [savedBill, billSummary, order, orderTotal, tableNo, cover, currentTender, showToast]);

  /* ════ REPORT FILTER ════ */
  const handleFilterChange = useCallback(val => {
    setFilter(val);
    setShowCustom(val === 'custom');
  }, []);

  const filteredBills = useMemo(() => {
    if (!filter) return bills;
    if (filter === 'custom') {
      if (!customStart || !customEnd) return [];
      const s = new Date(customStart), e = new Date(customEnd);
      if (s > e) return [];
      return bills.filter(b => { const d = new Date(b.date); return d >= s && d <= e; });
    }
    const range = getDateRange(filter);
    if (!range) return bills;
    return bills.filter(b => { const d = new Date(b.date); return d >= range.start && d <= range.end; });
  }, [bills, filter, customStart, customEnd]);

  const salesRows = useMemo(() => {
    const map = new Map();
    filteredBills.forEach(bill => {
      bill.items.forEach(it => {
        const cur = map.get(it.name) || { name: it.name, quantity: 0, total: 0 };
        cur.quantity += it.quantity;
        cur.total += it.quantity * it.unitPrice;
        map.set(it.name, cur);
      });
    });
    return Array.from(map.values()).sort((a, b) => a.name.localeCompare(b.name));
  }, [filteredBills]);

  const inventoryRows = useMemo(() => {
    const map = new Map();
    menuItems.forEach(it => map.set(it.name, { name: it.name, purchased: it.quantityPurchased || 0, sold: 0 }));
    filteredBills.forEach(bill => {
      bill.items.forEach(it => {
        if (!map.has(it.name)) map.set(it.name, { name: it.name, purchased: 0, sold: 0 });
        map.get(it.name).sold += it.quantity;
      });
    });
    return Array.from(map.values())
      .map(r => ({ ...r, inStock: r.purchased - r.sold }))
      .sort((a, b) => a.name.localeCompare(b.name));
  }, [filteredBills, menuItems]);

  /* ════ TOP LABEL ════ */
  const topText = (isBilled && billSaved && savedBill)
    ? `Change: ${fmt(savedBill.change)}`
    : `Total Price: ${fmt(orderTotal)}`;

  /* ════════════════════════════════════════════
     SALES / INVENTORY VIEW
  ════════════════════════════════════════════ */
  if (view !== 'main') {
    const isSales  = view === 'sales';
    const rows     = isSales ? salesRows : inventoryRows;
    const headers  = isSales
      ? ['S.No', 'Item Name', 'Sold Qty', 'Total Revenue']
      : ['S.No', 'Item Name', 'Purchased', 'Sold', 'In Stock'];

    return (
      <div id="cc1" style={{ padding: 20, minHeight: '100vh', backgroundColor: '#f0f0f0', fontFamily: 'Arial,sans-serif' }}>
        {toast && <Toast {...toast} onClose={() => setToast(null)} />}
        <div style={{ padding: 20, backgroundColor: '#fff', borderRadius: 6, boxShadow: '0 0 10px rgba(0,0,0,.1)' }}>

          {/* header */}
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 20 }}>
            <h2 style={{ color: 'orange', margin: 0, flex: 1, textAlign: 'center', fontSize: 22 }}>
              {isSales ? 'Sales Report' : 'Inventory'}
            </h2>
            <button
              onClick={() => { setView('main'); setFilter(''); setCustomStart(''); setCustomEnd(''); setShowCustom(false); }}
              style={{ padding: '9px 20px', fontSize: 15, backgroundColor: 'orange', color: '#fff', border: 'none', borderRadius: 5, cursor: 'pointer', fontWeight: 'bold' }}>
              Home
            </button>
          </div>

          <FilterBar filter={filter} onFilterChange={handleFilterChange}
            customStart={customStart} setCustomStart={setCustomStart}
            customEnd={customEnd} setCustomEnd={setCustomEnd}
            showCustom={showCustom} />

          <table style={{ width: '100%', borderCollapse: 'collapse', boxShadow: '0 0 10px rgba(0,0,0,.08)' }}>
            <thead>
              <tr>{headers.map(h => (
                <th key={h} style={{ padding: '10px 12px', textAlign: 'left', backgroundColor: '#4CAF50', color: '#fff', borderBottom: '2px solid #388e3c' }}>{h}</th>
              ))}</tr>
            </thead>
            <tbody>
              {rows.length === 0 ? (
                <tr><td colSpan={headers.length} style={{ padding: 24, textAlign: 'center', color: '#999' }}>No data for the selected period.</td></tr>
              ) : rows.map((row, i) => (
                <tr key={row.name} style={{ backgroundColor: i % 2 === 0 ? '#f7f7f7' : '#fff' }}>
                  <td style={{ padding: '9px 12px', borderBottom: '1px solid #eee' }}>{i + 1}</td>
                  <td style={{ padding: '9px 12px', borderBottom: '1px solid #eee' }}>{row.name}</td>
                  {isSales ? (<>
                    <td style={{ padding: '9px 12px', borderBottom: '1px solid #eee' }}>{row.quantity}</td>
                    <td style={{ padding: '9px 12px', borderBottom: '1px solid #eee' }}>{fmt(row.total)}</td>
                  </>) : (<>
                    <td style={{ padding: '9px 12px', borderBottom: '1px solid #eee' }}>{row.purchased}</td>
                    <td style={{ padding: '9px 12px', borderBottom: '1px solid #eee' }}>{row.sold}</td>
                    <td style={{ padding: '9px 12px', borderBottom: '1px solid #eee', color: row.inStock < 0 ? '#dc3545' : 'inherit', fontWeight: row.inStock < 0 ? 'bold' : 'normal' }}>
                      {row.inStock}
                    </td>
                  </>)}
                </tr>
              ))}
            </tbody>
          </table>

          {/* totals row */}
          {isSales && salesRows.length > 0 && (
            <div style={{ marginTop: 12, textAlign: 'right', fontWeight: 'bold', fontSize: 15 }}>
              Total Revenue: {fmt(salesRows.reduce((s, r) => s + r.total, 0))} &nbsp;|&nbsp;
              Total Bills: {filteredBills.length}
            </div>
          )}
          {!isSales && inventoryRows.length > 0 && (
            <div style={{ marginTop: 12, display: 'flex', gap: 24, justifyContent: 'flex-end', fontWeight: 'bold', fontSize: 14 }}>
              <span style={{ color: '#dc3545' }}>Low/OOS: {inventoryRows.filter(r => r.inStock <= 0).length}</span>
              <span>Items tracked: {inventoryRows.length}</span>
            </div>
          )}
        </div>
      </div>
    );
  }

  /* ════════════════════════════════════════════
     MAIN POS VIEW — mirrors index.html exactly
  ════════════════════════════════════════════ */
  return (
    <div id="cc" className="container">

      {/* ── Toasts ── */}
      {toast && <Toast {...toast} onClose={() => setToast(null)} />}

      {/* ── Restore Modal ── */}
      {showRestoreModal && (
        <Modal title="Restore Reserved Transaction" onClose={() => setShowRestoreModal(false)}>
          {reservations.length === 0
            ? <p>No reservations available.</p>
            : reservations.map((rv, i) => (
              <div key={rv.id} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '10px 0', borderBottom: '1px solid #eee', gap: 12 }}>
                <div style={{ fontSize: 14 }}>
                  <strong>Reservation #{i + 1}</strong><br />
                  {rv.items.length} item(s)
                  {rv.tableNo ? ` · Table ${rv.tableNo}` : ''}
                  {rv.cover   ? ` · Cover ${rv.cover}` : ''}<br />
                  <span style={{ color: '#888', fontSize: 12 }}>{new Date(rv.reservedAt).toLocaleString()}</span>
                </div>
                <button onClick={() => handleRestoreReservation(rv)}
                  style={{ padding: '7px 16px', backgroundColor: '#28a745', color: '#fff', border: 'none', borderRadius: 5, cursor: 'pointer', fontWeight: 'bold', whiteSpace: 'nowrap' }}>
                  Restore
                </button>
              </div>
            ))
          }
        </Modal>
      )}

      {/* ── Goods Return Modal ── */}
      {showGoodsReturn && (
        <Modal title="Goods Return — Click item to return 1 unit" onClose={() => setShowGoodsReturn(false)}>
          {order.length === 0
            ? <p>No items in order.</p>
            : order.map(it => (
              <div key={it.name} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '10px 0', borderBottom: '1px solid #eee', gap: 12 }}>
                <div style={{ fontSize: 14 }}>
                  <strong>{it.name}</strong><br />
                  Qty: {it.quantity} × {fmt(it.unitPrice)} = {fmt(it.quantity * it.unitPrice)}
                </div>
                <button onClick={() => handleGoodsReturn(it.name)}
                  style={{ padding: '7px 14px', backgroundColor: '#dc3545', color: '#fff', border: 'none', borderRadius: 5, cursor: 'pointer', fontWeight: 'bold', whiteSpace: 'nowrap' }}>
                  Return 1
                </button>
              </div>
            ))
          }
        </Modal>
      )}


      {/* ═══════════ LEFT PANEL ═══════════ */}
      <div className="left-panel">

        {/* total / change display */}
        <div className="total-amount-section" id="h11">{topText}</div>

        {/* order list */}
        <div className="order-list">
          <div id="orderr">
            <div className="order-header">
              <div className="item-col">Item</div>
              <div className="qty-col">Quantity</div>
              <div className="price-col">Unit Price</div>
              <div className="total-col">Total Price</div>
            </div>

            <div id="order-items" className="order-item">
              {isBilled && billSummary ? (
                /* ── Bill Summary Panel ── */
                <div className="bill-summary-wrap">
                  <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 8 }}>
                    <h3 style={{ margin: 0 }}>Bill Summary</h3>
                    <div style={{ fontSize: 14 }}>
                      <strong>Date:</strong> {new Date().toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: '2-digit' })}
                    </div>
                    {(tableNo || cover) && (
                      <div style={{ fontSize: 13, color: '#555' }}>
                        {tableNo ? `Table: ${tableNo}` : ''}{tableNo && cover ? ' | ' : ''}{cover ? `Cover: ${cover}` : ''}
                      </div>
                    )}
                    <hr style={{ width: '85%', margin: '4px 0' }} />
                    <div><strong>Amount:</strong> {fmt(billSummary.total)}</div>
                    <div><strong>GST (18%):</strong> {fmt(billSummary.gst)}</div>
                    <hr style={{ width: '85%', margin: '4px 0' }} />
                    <div style={{ fontSize: 16 }}><strong style={{ color: 'red' }}>Payable:</strong> {fmt(billSummary.payable)}</div>
                    <hr style={{ width: '85%', margin: '4px 0' }} />
                    <div><strong>Tender:</strong> {fmt(currentTender)}</div>
                    <div>
                      <strong>Change: </strong>
                      <span style={{ color: currentTender >= billSummary.payable ? '#28a745' : '#dc3545', fontWeight: 'bold' }}>
                        {fmt(currentTender - billSummary.payable)}
                      </span>
                    </div>

                    {!billSaved ? (
                      <div style={{ marginTop: 10, display: 'flex', gap: 8, flexWrap: 'wrap', justifyContent: 'center', alignItems: 'center' }}>
                        <input
                          type="number"
                          placeholder="Type amount or use numpad"
                          value={tenderInput}
                          onChange={e => setTenderInput(e.target.value)}
                          onFocus={() => { activeRef.current = setTenderInput; }}
                          style={{ width: 180, fontSize: 15, padding: '5px 8px', borderRadius: 5, border: '1px solid #ccc' }}
                        />
                        <button onClick={handleSaveTender}
                          style={{ fontSize: 15, padding: '6px 18px', borderRadius: 5, backgroundColor: '#28a745', color: '#fff', border: 'none', cursor: 'pointer', fontWeight: 'bold' }}>
                          Save Bill
                        </button>
                      </div>
                    ) : (
                      <div style={{ marginTop: 10, padding: '8px 20px', backgroundColor: '#d4edda', borderRadius: 6, color: '#155724', fontWeight: 'bold', fontSize: 15 }}>
                        ✓ Bill Saved — Change: {fmt(savedBill?.change ?? (currentTender - billSummary.payable))}
                      </div>
                    )}
                  </div>

                  {/* items breakdown */}
                  <div style={{ marginTop: 14 }}>
                    <h4 style={{ margin: '0 0 6px 0' }}>Items</h4>
                    <hr style={{ margin: '0 0 8px 0' }} />
                    {billSummary.items.map(it => (
                      <div key={it.name} style={{ display: 'flex', justifyContent: 'space-between', padding: '3px 0', fontSize: 13 }}>
                        <span>{it.name}</span>
                        <span>×{it.quantity} @ {fmt(it.unitPrice)} = {fmt(it.quantity * it.unitPrice)}</span>
                      </div>
                    ))}
                  </div>
                </div>
              ) : order.length === 0 ? (
                <div className="cart-empty" />
              ) : (
                order.map(it => (
                  <div key={it.name} className="order-row">
                    <div className="item-col">{it.name}</div>
                    <div className="qty-col">{it.quantity}</div>
                    <div className="price-col">{fmt(it.unitPrice)}</div>
                    <div className="total-col">{fmt(it.quantity * it.unitPrice)}</div>
                  </div>
                ))
              )}
            </div>
          </div>
        </div>

        {/* input section */}
        <div className="input-section">
          <div className="input-group">
            <label>Item Number</label>
            <input type="text" id="item-number" value={itemNum}
              onChange={e => setItemNum(e.target.value)}
              onFocus={() => { activeRef.current = setItemNum; }}
              onKeyDown={e => e.key === 'Enter' && document.getElementById('quantity').focus()} />
          </div>
          <div className="input-group">
            <label>Quantity</label>
            <input type="text" id="quantity" value={qty}
              onChange={e => setQty(e.target.value)}
              onFocus={() => { activeRef.current = setQty; }}
              onKeyDown={e => e.key === 'Enter' && document.getElementById('itemss').focus()} />
          </div>
          <div className="input-group">
            <label>Price</label>
            <input type="text" id="itemss" value={price}
              onChange={e => setPrice(e.target.value)}
              onFocus={() => { activeRef.current = setPrice; }}
              onKeyDown={e => e.key === 'Enter' && handleManualAdd()} />
          </div>
          <button className="add-btn" onClick={handleManualAdd}>Add</button>
        </div>

        {/* keypad section */}
        <div className="keypad-section">
          <div className="left-keypad">
            <div className="table-input">
              <label>Table No</label>
              <input type="text" value={tableNo}
                onChange={e => setTableNo(e.target.value)}
                onFocus={() => { activeRef.current = setTableNo; }} />
            </div>
            <div className="cover-input">
              <label>No of Cover</label>
              <input type="text" value={cover}
                onChange={e => setCover(e.target.value)}
                onFocus={() => { activeRef.current = setCover; }} />
            </div>
          </div>

          <div className="number-keypad">
            {['7','8','9','4','5','6','1','2','3','0','.','−'].map(v => (
              <button key={v} className="number-btn"
                onClick={() => handleNumpad(v === '−' ? '-' : v)}>{v}</button>
            ))}
          </div>

          <div className="action-keypad">
            <button className="action-btn" onClick={resetOrder}>AC</button>
          </div>
        </div>
      </div>

      {/* ═══════════ RIGHT PANEL ═══════════ */}
      <div className="right-panel">

        {/* menu grid */}
        <div className="menu-section">
          <div className="menu-grid">
            {menuItems.map(item => (
              <div key={item.name} className="menu-item"
                title={`${item.name} — ${fmt(item.unitPrice)}`}
                onClick={() => addItem(item.name, 1, item.unitPrice)}>
                <img src={`${API_BASE}/${item.img}`} alt={item.name} className="menu-item-img"
                  onError={e => { e.currentTarget.style.display = 'none'; }} />
                <div className="menu-item-name">{item.name}</div>
              </div>
            ))}
            {!menuLoaded && (
              <div style={{ padding: 20, color: '#888', fontSize: 13 }}>Loading menu…</div>
            )}
          </div>
        </div>

        {/* ── control section — exact replica of original HTML grid ── */}
        <div className="control-section">
          <div className="control-buttons"
            style={{ display: 'grid', gridTemplateColumns: 'repeat(7, 100px)', gridTemplateRows: 'repeat(2, 100px)', gap: 5 }}>

            {/* col 1: New Bill + Inventory */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
              <button className="control-btn orange-btn" style={{ width: 100, height: 49 }}
                onClick={() => { setView('main'); resetOrder(); }}>
                New Bill
              </button>
              <button className="control-btn orange-btn" style={{ width: 100, height: 49 }}
                onClick={() => setView('inventory')}>
                Inventory
              </button>
            </div>

            {/* $2 */}
            <button id="b2" className="control-btn orange-btn" style={{ width: 100, height: 100 }}
              onClick={() => handleTenderBtn(2)}>$2</button>

            {/* $10 */}
            <button id="b10" className="control-btn orange-btn" style={{ width: 100, height: 100 }}
              onClick={() => handleTenderBtn(10)}>$10</button>

            {/* Open Cash Box + Terminate Transaction */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
              <button className="control-btn green-btn" style={{ width: 100, height: 49 }}
                onClick={() => showToast('Cash box opened!', 'success')}>
                Open Cash Box
              </button>
              <button className="control-btn green-btn" style={{ width: 100, height: 49 }}
                onClick={handleTerminate}>
                Terminate<br />Transaction
              </button>
            </div>

            {/* Goods Return + Print */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
              <button className="control-btn green-btn" style={{ width: 100, height: 49 }}
                onClick={() => {
                  if (order.length === 0) { showToast('No items in order to return.', 'warning'); return; }
                  setShowGoodsReturn(true);
                }}>
                Goods Return
              </button>
              <button className="control-btn green-btn" style={{ width: 100, height: 49 }}
                onClick={handlePrint}>
                Print
              </button>
            </div>

            {/* Cancel Item */}
            <button id="c1" className="control-btn green-btn" style={{ width: 100, height: 100 }}
              onClick={handleCancelItem}>
              Cancel Item
            </button>

            {/* Add Item */}
            <button className="control-btn green-btn" style={{ width: 100, height: 100 }}
              onClick={handleManualAdd}>
              Add Item
            </button>

            {/* ▶ Bill */}
            <button className="control-btn orange-btn" style={{ width: 100, height: 100 }}
              onClick={handleBill}>
              ▶ Bill
            </button>

            {/* $5 */}
            <button id="b5" className="control-btn orange-btn" style={{ width: 100, height: 100 }}
              onClick={() => handleTenderBtn(5)}>$5</button>

            {/* $50 */}
            <button id="b50" className="control-btn orange-btn" style={{ width: 100, height: 100 }}
              onClick={() => handleTenderBtn(50)}>$50</button>

            {/* Sales Report */}
            <button className="control-btn orange-btn" style={{ width: 100, height: 100 }}
              onClick={() => setView('sales')}>
              Sales Report
            </button>

            {/* Reserved Transaction + Restore */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
              <button className="control-btn green-btn" style={{ width: 100, height: 49 }}
                onClick={handleReserveTransaction}>
                Reserved<br />Transaction
              </button>
              <button className="control-btn green-btn" style={{ width: 100, height: 49 }}
                onClick={handleOpenRestore}>
                Restore
              </button>
            </div>

            {/* Delete All Transaction */}
            <button id="d1" className="control-btn green-btn" style={{ width: 100, height: 100 }}
              onClick={handleDeleteAllTransactions}>
              Delete All<br />Transaction
            </button>

            {/* Main Menu */}
            <button className="control-btn green-btn" style={{ width: 100, height: 100 }}
              onClick={() => { setView('main'); resetOrder(); }}>
              Main Menu
            </button>

          </div>
        </div>
      </div>
    </div>
  );
}
