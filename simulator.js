/**
 * AKASHDHWANI MISSION SIMULATOR (Secure Version)
 * Purpose: Streams live telemetry to Firebase and logs history to PostgreSQL.
 */

// 1. Load environment variables from .env.local
require('dotenv').config({ path: '.env.local' }); 

const axios = require('axios');
const { initializeApp } = require('firebase/app');
const { getDatabase, ref, push } = require('firebase/database');

// 2. Reference the secret from your environment variables
const SIMULATOR_KEY = process.env.SIMULATOR_SECRET_KEY;

// 3. YOUR FIREBASE CONFIG
const firebaseConfig = {
  apiKey: "AIzaSy...", 
  authDomain: "leap-2df27.firebaseapp.com",
  databaseURL: "https://leap-2df27-default-rtdb.firebaseio.com/", 
  projectId: "leap-2df27",
};

// Safety check: Exit if the security key is missing
if (!SIMULATOR_KEY) {
  console.error("❌ ERROR: SIMULATOR_SECRET_KEY not found in .env.local!");
  process.exit(1);
}

const app = initializeApp(firebaseConfig);
const db  = getDatabase(app);

let pNo = 1;
let alt = 100;
let lat = 19.0760;
let lng = 72.8777;

async function sendPacket() {
  const packet = {
    hab_id: 'HAB-MUM-01',
    mission_time: new Date().toLocaleTimeString(),
    packet_no: pNo++,
    
    // Core Environment (Random fluctuations)
    temperature: parseFloat((24 + Math.random()).toFixed(2)),
    pressure: parseFloat((990 - Math.random() * 10).toFixed(2)),
    humidity: 43 + Math.floor(Math.random() * 5),
    uv_index: 3.4,
    magnetic_field: 44.2,
    
    // GPS & Flight Path (Incremental)
    latitude: lat += 0.0001,
    longitude: lng += 0.0001,
    altitude: alt += 10,
    
    // IMU / Motion (Twitching bars)
    gyro_x: parseFloat((Math.random() * 10).toFixed(3)),
    gyro_y: parseFloat((Math.random() * 10).toFixed(3)),
    gyro_z: parseFloat((Math.random() * -10).toFixed(3)),
    accel_x: parseFloat((Math.random() * 0.5).toFixed(3)),
    accel_y: parseFloat((Math.random() * -0.5).toFixed(3)),
    accel_z: 9.995,
    
    // Status & Signal
    battery_percent: 89,
    rssi: -74,
    camera_status: 'ON',
    status_flag: 'OK',
    timestamp: new Date().toISOString()
  };

  try {
    // 🚀 SYNC TO BOTH SYSTEMS
    await Promise.all([
      // A. Realtime Database (For Live Gauges)
      push(ref(db, 'telemetry'), packet),
      
      // B. PostgreSQL API (For History/Charts via Handshake)
      axios.post('http://localhost:3000/api/telemetry', packet, {
        headers: {
          'x-api-key': SIMULATOR_KEY // Verified Handshake 🔐
        }
      })
    ]);
    
    console.log(`✅ [PKT #${packet.packet_no}] Synced | Alt: ${packet.altitude}m | Auth: SUCCESS`);
    
  } catch (err) {
    if (err.response?.status === 401) {
      console.log("❌ ERROR 401: Unauthorized. Check if SIMULATOR_SECRET_KEY in .env.local matches.");
    } else {
      console.log(`❌ ERROR: ${err.message}`);
    }
  }
}

console.log("🚀 HAB-01 Simulator Active...");
console.log(`📡 Handshake Key Loaded from Environment.`);
console.log("-----------------------------------------");

// Data stream interval (1 seconds)
setInterval(sendPacket, 1000);