/**
 * Firebase Cloud Function
 * File: functions/index.js
 *
 * Deploy with:
 *   cd functions
 *   npm install
 *   firebase deploy --only functions
 *
 * This function triggers whenever a new telemetry packet is written
 * to Firebase Realtime Database at /telemetry/{packetId}
 * and saves it to Firebase PostgreSQL (Cloud SQL).
 */

const { onValueCreated } = require('firebase-functions/v2/database');
const { initializeApp }  = require('firebase-admin/app');
const { Pool }           = require('pg');

initializeApp();

// PostgreSQL connection — use Cloud SQL socket in production
const pool = new Pool({
  host:     process.env.DB_HOST     || '/cloudsql/YOUR_PROJECT:YOUR_REGION:YOUR_INSTANCE',
  database: process.env.DB_NAME     || 'hab_telemetry',
  user:     process.env.DB_USER     || 'postgres',
  password: process.env.DB_PASSWORD || '',
  port:     parseInt(process.env.DB_PORT || '5432'),
});

// Ensure table exists on cold start
let tableReady = false;
async function ensureTable() {
  if (tableReady) return;
  await pool.query(`
    CREATE TABLE IF NOT EXISTS telemetry (
      id               SERIAL PRIMARY KEY,
      hab_id           VARCHAR(64),
      mission_time     VARCHAR(32),
      packet_no        INTEGER,
      temperature      FLOAT,
      pressure         FLOAT,
      humidity         FLOAT,
      uv_index         FLOAT,
      magnetic_field   FLOAT,
      latitude         DOUBLE PRECISION,
      longitude        DOUBLE PRECISION,
      altitude         FLOAT,
      battery_percent  FLOAT,
      gyro_x           FLOAT,
      gyro_y           FLOAT,
      gyro_z           FLOAT,
      accel_x          FLOAT,
      accel_y          FLOAT,
      accel_z          FLOAT,
      camera_status    VARCHAR(32),
      status_flag      VARCHAR(64),
      rssi             INTEGER,
      timestamp        TIMESTAMPTZ,
      created_at       TIMESTAMPTZ DEFAULT NOW()
    );
    CREATE INDEX IF NOT EXISTS idx_telemetry_timestamp ON telemetry (timestamp DESC);
    CREATE INDEX IF NOT EXISTS idx_telemetry_packet_no ON telemetry (packet_no);
  `);
  tableReady = true;
}

/**
 * Triggered on every new packet written to /telemetry/{packetId}
 */
exports.onNewTelemetry = onValueCreated(
  { ref: '/telemetry/{packetId}', region: 'us-central1' },
  async (event) => {
    const p = event.data.val();
    if (!p) return;

    try {
      await ensureTable();

      await pool.query(`
        INSERT INTO telemetry (
          hab_id, mission_time, packet_no, temperature, pressure, humidity,
          uv_index, magnetic_field, latitude, longitude, altitude,
          battery_percent, gyro_x, gyro_y, gyro_z, accel_x, accel_y, accel_z,
          camera_status, status_flag, rssi, timestamp
        ) VALUES (
          $1,$2,$3,$4,$5,$6,$7,$8,$9,$10,$11,
          $12,$13,$14,$15,$16,$17,$18,$19,$20,$21,$22
        )
        ON CONFLICT DO NOTHING
      `, [
        p.HAB_ID, p.MISSION_TIME, p.PACKET_NO,
        p.TEMPERATURE, p.PRESSURE, p.HUMIDITY,
        p.UV_INDEX, p.MAGNETIC_FIELD,
        p.LATITUDE, p.LONGITUDE, p.ALTITUDE,
        p.BATTERY_PERCENT,
        p.GYRO_X, p.GYRO_Y, p.GYRO_Z,
        p.ACCEL_X, p.ACCEL_Y, p.ACCEL_Z,
        p.CAMERA_STATUS, p.STATUS_FLAG, p.RSSI,
        p.TIMESTAMP || new Date().toISOString(),
      ]);

      console.log(`✓ Packet #${p.PACKET_NO} saved to PostgreSQL`);
    } catch (err) {
      console.error('PostgreSQL insert error:', err);
    }
  }
);
