const axios = require('axios');

let pNo = 1;
let alt = 100;
let lat = 19.0760;
let lng = 72.8777;

async function sendPacket() {
  const packet = {
    hab_id: 'HAB-MUM-01',
    mission_time: '00:01:00',
    packet_no: pNo++,
    temperature: parseFloat((24 + Math.random()).toFixed(2)),
    pressure: parseFloat((990 - Math.random() * 10).toFixed(2)),
    humidity: 45,
    uv_index: 2.5,
    magnetic_field: 44.1,
    latitude: lat += 0.0001,
    longitude: lng += 0.0001,
    altitude: alt += 10,
    battery_percent: 98.5,
    gyro_x: 0.1, gyro_y: 0.2, gyro_z: 0.3,
    accel_x: 0.0, accel_y: 0.1, accel_z: 9.8,
    camera_status: 'ON',
    status_flag: 'OK',
    rssi: -65,
    timestamp: new Date().toISOString()
  };

  try {
    await axios.post('http://localhost:3000/api/telemetry', packet);
    console.log(`✅ Packet #${packet.packet_no} Synced.`);
  } catch (err) {
    console.log(`❌ Packet #${packet.packet_no} Failed: ${err.message}`);
  }
}

console.log("🚀 Leap Simulator Active...");
setInterval(sendPacket, 2000);