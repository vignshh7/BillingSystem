# Backend — POS Billing System

Node.js + Express REST API. Stores all data locally as JSON files. No database required.

---

## Stack

- **Node.js** + **Express 4**
- **cors** — allows the Vite frontend on any localhost port
- **fs/promises** — read/write JSON data files
- Serves menu item images as static files via `/images/*`

---

## Folder Structure

```
backend/
├── data/
│   ├── images/            ← PNG images for all 28 menu items
│   ├── bills.json         ← persisted bills (appended at runtime)
│   ├── menu.json          ← menu items with name, unitPrice, quantityPurchased, img path
│   └── reservations.json  ← parked orders awaiting restore
├── package.json
├── Readme.md
└── server.js
```

---

## Setup

```bash
npm install
node server.js
```

Server starts at **http://localhost:4000**

---

## API Reference

### Health

| Method | Route | Response |
|--------|-------|----------|
| GET | `/api/health` | `{ status: "ok" }` |

### Images

| Method | Route | Description |
|--------|-------|-------------|
| GET | `/images/:filename` | Serve PNG from `data/images/` |

### Menu

| Method | Route | Response |
|--------|-------|----------|
| GET | `/api/menu` | Array of all menu items |

Menu item shape:
```json
{
  "name": "Coffee Black",
  "img": "images/coffee_black.png",
  "unitPrice": 16.5,
  "quantityPurchased": 45
}
```

### Bills

| Method | Route | Body | Description |
|--------|-------|------|-------------|
| GET | `/api/bills` | — | All saved bills |
| POST | `/api/bills` | `{ items, tender, tableNo?, cover? }` | Create + persist bill |
| DELETE | `/api/bills` | — | Wipe all bills |

POST body `items` array shape:
```json
[{ "name": "Coffee Black", "quantity": 2, "unitPrice": 16.5 }]
```

POST response includes computed `total`, `gst` (18%), `payable`, `change`, and a unique `id`.

### Reservations

| Method | Route | Body | Description |
|--------|-------|------|-------------|
| GET | `/api/reservations` | — | All parked orders |
| POST | `/api/reservations` | `{ items, tableNo?, cover? }` | Park an order |
| DELETE | `/api/reservations/:id` | — | Delete a specific reservation |

---

## Data Files

All files are valid JSON arrays. They are created automatically if missing.

| File | Notes |
|------|-------|
| `data/menu.json` | Edit to change prices or add items. `img` path is relative to `data/`. |
| `data/bills.json` | Appended on every saved bill. Delete to reset history. |
| `data/reservations.json` | Managed automatically by the API. |
| `data/images/` | Add PNG files here and reference them from `menu.json`. |
