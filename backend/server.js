const express = require('express');
const cors = require('cors');
const path = require('path');
const { readFile, writeFile } = require('fs/promises');

const app = express();
const PORT = process.env.PORT || 4000;

const dataDir = path.join(__dirname, 'data');
const menuPath          = path.join(dataDir, 'menu.json');
const billsPath         = path.join(dataDir, 'bills.json');
const reservationsPath  = path.join(dataDir, 'reservations.json');

app.use(cors({
  origin: '*',          // allow any localhost port (Vite may pick 5173-5180)
  methods: ['GET','POST','PUT','DELETE','OPTIONS'],
  allowedHeaders: ['Content-Type']
}));
app.use(express.json({ limit: '2mb' }));

// Serve menu images from backend/data/images/
app.use('/images', express.static(path.join(dataDir, 'images')));

/* ─── helpers ─── */
async function readJson(filePath, fallback) {
  try {
    const raw = await readFile(filePath, 'utf-8');
    return JSON.parse(raw);
  } catch (err) {
    if (err.code === 'ENOENT') return fallback;
    throw err;
  }
}

async function writeJson(filePath, data) {
  await writeFile(filePath, JSON.stringify(data, null, 2));
}

function buildId() {
  return `${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 8)}`;
}

/* ─── health ─── */
app.get('/api/health', (_req, res) => res.json({ status: 'ok' }));

/* ══════════════════════════════════════
   MENU
══════════════════════════════════════ */
app.get('/api/menu', async (_req, res) => {
  try {
    const menu = await readJson(menuPath, []);
    res.json(menu);
  } catch {
    res.status(500).json({ error: 'Failed to load menu.' });
  }
});

/* ══════════════════════════════════════
   BILLS
══════════════════════════════════════ */
app.get('/api/bills', async (_req, res) => {
  try {
    res.json(await readJson(billsPath, []));
  } catch {
    res.status(500).json({ error: 'Failed to load bills.' });
  }
});

app.post('/api/bills', async (req, res) => {
  try {
    const payload = req.body || {};
    const raw = Array.isArray(payload.items) ? payload.items : [];
    if (raw.length === 0) return res.status(400).json({ error: 'Bill items required.' });

    const items = raw.map(i => ({
      name:      String(i.name || '').trim(),
      quantity:  Number(i.quantity  || 0),
      unitPrice: Number(i.unitPrice || 0)
    })).filter(i => i.name && i.quantity > 0 && i.unitPrice > 0);

    if (items.length === 0) return res.status(400).json({ error: 'All items invalid.' });

    const total   = items.reduce((s, i) => s + i.quantity * i.unitPrice, 0);
    const gst     = total * 0.18;
    const payable = total + gst;
    const tender  = Number(payload.tender || 0);

    const bill = {
      id: buildId(),
      date: new Date().toISOString(),
      tableNo: payload.tableNo || '',
      cover:   payload.cover   || '',
      items,
      total,
      gst,
      payable,
      tender,
      change: tender - payable
    };

    const bills = await readJson(billsPath, []);
    bills.push(bill);
    await writeJson(billsPath, bills);
    res.status(201).json(bill);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Failed to save bill.' });
  }
});

/* DELETE /api/bills — wipe all bills */
app.delete('/api/bills', async (_req, res) => {
  try {
    await writeJson(billsPath, []);
    res.json({ ok: true });
  } catch {
    res.status(500).json({ error: 'Failed to delete bills.' });
  }
});

/* ══════════════════════════════════════
   RESERVATIONS
══════════════════════════════════════ */
app.get('/api/reservations', async (_req, res) => {
  try {
    res.json(await readJson(reservationsPath, []));
  } catch {
    res.status(500).json({ error: 'Failed to load reservations.' });
  }
});

app.post('/api/reservations', async (req, res) => {
  try {
    const payload = req.body || {};
    const items = Array.isArray(payload.items) ? payload.items : [];
    if (items.length === 0) return res.status(400).json({ error: 'No items to reserve.' });

    const reservation = {
      id:         buildId(),
      reservedAt: payload.reservedAt || new Date().toISOString(),
      tableNo:    payload.tableNo || '',
      cover:      payload.cover   || '',
      items
    };

    const list = await readJson(reservationsPath, []);
    list.push(reservation);
    await writeJson(reservationsPath, list);
    res.status(201).json(reservation);
  } catch {
    res.status(500).json({ error: 'Failed to save reservation.' });
  }
});

app.delete('/api/reservations/:id', async (req, res) => {
  try {
    const list = await readJson(reservationsPath, []);
    const filtered = list.filter(r => r.id !== req.params.id);
    await writeJson(reservationsPath, filtered);
    res.json({ ok: true });
  } catch {
    res.status(500).json({ error: 'Failed to delete reservation.' });
  }
});

/* ══════════════════════════════════════
   START
══════════════════════════════════════ */
app.listen(PORT, () => {
  console.log(`Backend running on http://localhost:${PORT}`);
});
