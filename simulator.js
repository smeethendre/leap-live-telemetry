const axios = require('axios');
const { initializeApp } = require('firebase/app');
const { getDatabase, ref, push } = require('firebase/database');

// 1. RE-PASTE YOUR FIREBASE CONFIG HERE
const firebaseConfig = {
  apiKey: "AIzaSy...", 
  authDomain: "leap-2df27.firebaseapp.com",
  databaseURL: "https://leap-2df27-default-rtdb.firebaseio.com/", 
  projectId: "leap-2df27",
};

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
    temperature: parseFloat((24 + Math.random()).toFixed(2)),
    pressure: parseFloat((990 - Math.random() * 10).toFixed(2)),
    humidity: 43 + Math.floor(Math.random() * 5),
    uv_index: 3.4,
    magnetic_field: 44.2,
    latitude: lat += 0.0001,
    longitude: lng += 0.0001,
    altitude: alt += 10,
    battery_percent: 89,
    // Add randomness to IMU so bars move
    gyro_x: parseFloat((Math.random() * 10).toFixed(3)),
    gyro_y: parseFloat((Math.random() * 10).toFixed(3)),
    gyro_z: parseFloat((Math.random() * -10).toFixed(3)),
    accel_x: parseFloat((Math.random() * 0.5).toFixed(3)),
    accel_y: parseFloat((Math.random() * -0.5).toFixed(3)),
    accel_z: 9.995,
    camera_status: 'ON',
    status_flag: 'OK',
    rssi: -74,
    timestamp: new Date().toISOString()
  };

  try {
    // This sends to BOTH Firebase and your Local Database
    await Promise.all([
      push(ref(db, 'telemetry'), packet),
      axios.post('http://localhost:3000/api/telemetry', packet)
    ]);
    console.log(`✅ Packet #${packet.packet_no} Synced.`);
  } catch (err) {
    console.log(`❌ Sync Failed: ${err.message}`);
  }
}

console.log("🚀 AkashDhwani Simulator Active...");
setInterval(sendPacket, 2000);