# Point of Sale (POS) System

Offline-first billing system with a separated React frontend and Node/Express backend.  
All data — menu items, bill history, reservations, and **images** — lives inside the **backend**.  
No database, no internet connection required.

---

## Features

- Menu grid with images and live pricing loaded from backend API
- One-click add from menu or manual item entry with numpad
- Billing with 18% GST, tender buttons ($2 / $5 / $10 / $50)
- Save bill → persisted to `backend/data/bills.json`
- Reserved Transaction — park an order and restore it later
- Goods Return — remove individual items from an open order
- Print receipt — popup print dialog with full itemised receipt
- Sales Report — aggregated sales table with date filters (today / week / month / custom)
- Inventory — purchased vs sold vs in-stock for every menu item

---

## Project Structure

```
BillingSystem/
├── backend/
│   ├── data/
│   │   ├── images/           ← all menu item images served by Express
│   │   ├── bills.json        ← saved bills (appended at runtime)
│   │   ├── menu.json         ← 28 menu items (name, price, stock)
│   │   └── reservations.json ← parked orders
│   ├── package.json
│   ├── Readme.md
│   └── server.js
└── frontend/
    ├── public/
    ├── src/
    │   ├── App.jsx           ← full POS UI (single component)
    │   ├── main.jsx
    │   └── styles.css
    ├── .env                  ← VITE_API_BASE=http://localhost:4000
    ├── index.html
    ├── package.json
    └── vite.config.js
```

---

## Quick Start

### 1) Start the backend

```bash
cd backend
npm install
node server.js
```

API + image server → **http://localhost:4000**

### 2) Start the frontend

```bash
cd frontend
npm install
npm run dev
```

Open **http://localhost:5173** in your browser.

---

## API Endpoints

| Method | Route | Description |
|--------|-------|-------------|
| GET | `/api/health` | Server health check |
| GET | `/api/menu` | All 28 menu items |
| GET | `/images/:file` | Serve a menu item image |
| GET | `/api/bills` | All saved bills |
| POST | `/api/bills` | Create and persist a new bill |
| DELETE | `/api/bills` | Delete all bills |
| GET | `/api/reservations` | List parked orders |
| POST | `/api/reservations` | Park current order |
| DELETE | `/api/reservations/:id` | Delete a reservation |

---

## Data Files

All data is stored as plain JSON under `backend/data/` — no database needed.

| File | Purpose |
|------|---------|
| `menu.json` | Menu items — name, image path, unit price, quantity purchased |
| `bills.json` | Completed bills including GST, tender and change |
| `reservations.json` | Currently parked orders |
| `images/` | PNG images for every menu item (served by backend at `/images/*`) |
