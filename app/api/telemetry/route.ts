import { NextResponse } from 'next/server';
import { query } from '@/lib/db';

export async function GET(request: Request) {
  try {
    const result = await query('SELECT * FROM telemetry ORDER BY timestamp DESC LIMIT 100');
    return NextResponse.json({ data: result.rows });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    const body = await request.json();

    // 1. NORMALIZE KEYS (This fixes the Uppercase/Lowercase problem)
    // We cast this 'as any' to stop the red squiggly lines in VS Code
    const p = Object.keys(body).reduce((acc, key) => {
      acc[key.toLowerCase()] = body[key];
      return acc;
    }, {} as any);

    console.log(`🚀 AkashDhwani: Processing Packet #${p.packet_no}`);

    // 2. SQL QUERY
    const sql = `
      INSERT INTO telemetry (
        hab_id, mission_time, packet_no, temperature, pressure, humidity,
        uv_index, magnetic_field, latitude, longitude, altitude,
        battery_percent, gyro_x, gyro_y, gyro_z, accel_x, accel_y, accel_z,
        camera_status, status_flag, rssi, timestamp
      ) VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10,$11,$12,$13,$14,$15,$16,$17,$18,$19,$20,$21,$22)
    `;

    // 3. VALUES ARRAY (22 total values)
    const values = [
      p.hab_id, p.mission_time, p.packet_no, p.temperature, p.pressure, p.humidity,
      p.uv_index, p.magnetic_field, p.latitude, p.longitude, p.altitude,
      p.battery_percent, p.gyro_x, p.gyro_y, p.gyro_z, p.accel_x, p.accel_y, p.accel_z,
      p.camera_status, p.status_flag, p.rssi, p.timestamp
    ];

    await query(sql, values);
    return NextResponse.json({ status: "success" });

  } catch (err: any) {
    console.error('❌ Database Insert Error:', err.message);
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}