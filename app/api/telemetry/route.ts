import { NextResponse } from 'next/server';
import { query } from '@/lib/db';

export async function POST(request: Request) {
  try {
    const body = await request.json();

    // 1. Standardize keys to lowercase
    const p = Object.keys(body).reduce((acc, key) => {
      acc[key.toLowerCase()] = body[key];
      return acc;
    }, {} as any);

    // 2. The SQL Insert
    const sql = `
      INSERT INTO telemetry (
        hab_id, mission_time, packet_no, temperature, pressure, humidity,
        uv_index, magnetic_field, latitude, longitude, altitude,
        battery_percent, gyro_x, gyro_y, gyro_z, accel_x, accel_y, accel_z,
        camera_status, status_flag, rssi, timestamp
      ) VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10,$11,$12,$13,$14,$15,$16,$17,$18,$19,$20,$21,$22)
    `;

    const values = [
      p.hab_id || 'N/A', p.mission_time || '00:00:00', p.packet_no || 0,
      p.temperature || 0, p.pressure || 0, p.humidity || 0,
      p.uv_index || 0, p.magnetic_field || 0, p.latitude || 0, p.longitude || 0, p.altitude || 0,
      p.battery_percent || 0, p.gyro_x || 0, p.gyro_y || 0, p.gyro_z || 0,
      p.accel_x || 0, p.accel_y || 0, p.accel_z || 0,
      p.camera_status || 'OFF', p.status_flag || 'OK', p.rssi || 0, p.timestamp || new Date().toISOString()
    ];

    await query(sql, values);
    return NextResponse.json({ status: "success" });

  } catch (err: any) {
    console.error('❌ DB Error:', err.message);
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}