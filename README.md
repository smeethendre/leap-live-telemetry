# 🎈 HAB Telemetry Dashboard

A real-time High Altitude Balloon telemetry dashboard built with **Next.js**, **Firebase Realtime Database**, and **Firebase PostgreSQL (Cloud SQL)**.

---

## Architecture

```
HAB Balloon ──RF/LoRa──► Ground Station ──upload──► Firebase Realtime DB
                                                              │
                                              onValueCreated  │ Cloud Function
                                                              ▼
                                                    Firebase PostgreSQL
                                                              │
                                              Next.js Dashboard (local)
                                              ├── Realtime listener (live)
                                              └── API route query (history)
```

---

## Quick Start

### 1. Clone & Install

```bash
cd hab-dashboard
npm install
```

### 2. Set up Firebase

1. Go to [Firebase Console](https://console.firebase.google.com) → Create project
2. Enable **Realtime Database** (Start in test mode)
3. Go to **Project Settings → Your Apps** → Add a Web App → copy the config

### 3. Set up Firebase PostgreSQL (Cloud SQL)

1. In Firebase Console → **Build → Cloud SQL**
2. Create a **PostgreSQL** instance
3. Create a database called `hab_telemetry`
4. Note the connection details

### 4. Configure environment variables

```bash
cp .env.local.example .env.local
# Edit .env.local and fill in your Firebase config + DB credentials
```

### 5. Run the dashboard

```bash
npm run dev
# Open http://localhost:3000
```

### 6. Test with the simulator (no real hardware needed)

```bash
# Edit simulator.js and paste your Firebase config at the top
node simulator.js
```

You'll see packets streaming in on the dashboard immediately!

---

## Deploy the Cloud Function (saves data to PostgreSQL automatically)

```bash
# Install Firebase CLI if needed
npm install -g firebase-tools
firebase login

# Deploy the function
cd functions
npm install
cd ..
firebase deploy --only functions
```

The function `onNewTelemetry` will fire automatically every time your friend pushes a packet to `/telemetry` in Firebase Realtime DB, and it will insert that row into PostgreSQL.

---

## How your friend uploads data

Your friend's ground station should push packets to Firebase Realtime DB like this:

```javascript
import { initializeApp } from 'firebase/app';
import { getDatabase, ref, push } from 'firebase/database';

const app = initializeApp(firebaseConfig); // same config
const db  = getDatabase(app);

// Call this whenever a new packet arrives from the balloon
async function uploadPacket(packet) {
  await push(ref(db, 'telemetry'), {
    HAB_ID:         'HAB-01',
    MISSION_TIME:   '00:12:34',
    PACKET_NO:      42,
    TEMPERATURE:    -23.5,
    PRESSURE:       512.3,
    HUMIDITY:       34.2,
    UV_INDEX:       7.1,
    MAGNETIC_FIELD: 44.8,
    LATITUDE:       19.0760,
    LONGITUDE:      72.8777,
    ALTITUDE:       12500,
    TIMESTAMP:      new Date().toISOString(),
    BATTERY_PERCENT: 78,
    GYRO_X:         1.23,
    GYRO_Y:         -0.45,
    GYRO_Z:         0.12,
    ACCEL_X:        0.03,
    ACCEL_Y:        -0.01,
    ACCEL_Z:        9.81,
    CAMERA_STATUS:  'ON',
    STATUS_FLAG:    'OK',
    RSSI:           -72,
  });
}
```

---

## Project Structure

```
hab-dashboard/
├── app/
│   ├── layout.tsx              # Root layout + Google Fonts
│   ├── globals.css             # Dark space aesthetic theme
│   ├── page.tsx                # Redirects → /dashboard
│   ├── dashboard/
│   │   └── page.tsx            # Main dashboard UI
│   └── api/
│       └── telemetry/
│           └── route.ts        # GET/POST API for PostgreSQL
├── components/
│   ├── Header.tsx              # Mission status bar
│   ├── StatCard.tsx            # Individual sensor value card
│   ├── charts/
│   │   └── TelemetryChart.tsx  # Recharts line chart wrapper
│   ├── gauges/
│   │   ├── CircularGauge.tsx   # SVG circular gauge
│   │   └── IMUDisplay.tsx      # Gyro/accel bar display
│   └── map/
│       └── GPSMap.tsx          # Leaflet flight path map
├── lib/
│   ├── firebase.ts             # Firebase client setup
│   ├── db.ts                   # PostgreSQL pool + helpers
│   ├── types.ts                # TelemetryPacket TypeScript types
│   └── useTelemetry.ts         # React hook for realtime data
├── functions/
│   ├── index.js                # Cloud Function: RTDB → PostgreSQL
│   └── package.json
├── simulator.js                # Test data generator (no hardware needed)
├── firebase.json               # Firebase project config
├── database.rules.json         # RTDB security rules
├── .env.local.example          # Environment variable template
└── README.md
```

---

## Dashboard Features

| Section | What it shows |
|---|---|
| **Header bar** | HAB ID, mission time, packet #, status flag, RSSI, camera status |
| **Stat cards** | Live values: altitude, temperature, pressure, humidity, UV, magnetic field, battery, RSSI |
| **Flight map** | Live GPS path on OpenStreetMap (blue dot = balloon position) |
| **Gauges** | Circular gauges for humidity, pressure, battery |
| **IMU panel** | Gyro X/Y/Z and Accel X/Y/Z bidirectional bar display |
| **Charts** | Environment tab (temp, altitude, pressure, humidity/UV) · IMU tab (gyro, accel, mag) · Signal tab (RSSI, battery) |
| **Packet log** | Last 10 raw packets in a table |

---

## Alerts

The dashboard automatically highlights:
- 🔴 **Battery < 15%** — red glow on stat card
- 🔴 **UV Index > 10** — red alert
- 🔴 **RSSI < -90 dBm** — poor signal warning
- 🟡 **RSSI -70 to -90 dBm** — marginal signal

---

## Troubleshooting

**Dashboard shows "AWAITING TELEMETRY SIGNAL..."**
→ Check your Firebase config in `.env.local`
→ Make sure Realtime Database is enabled
→ Run `node simulator.js` to send test data

**Map not loading**
→ Leaflet is client-side only — this is normal during SSR
→ The map loads after hydration

**PostgreSQL connection error**
→ For local dev, set `DB_HOST=localhost` and ensure PostgreSQL is running
→ For production, use Cloud SQL socket path
