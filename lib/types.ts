export interface TelemetryPacket {
  hab_id: string;
  mission_time: string;
  packet_no: number;
  temperature: number;
  pressure: number;
  humidity: number;
  uv_index: number;
  magnetic_field: number;
  latitude: number;
  longitude: number;
  altitude: number;
  timestamp: string;
  battery_percent: number;
  gyro_x: number;
  gyro_y: number;
  gyro_z: number;
  accel_x: number;
  accel_y: number;
  accel_z: number;
  camera_status: string;
  status_flag: string;
  rssi: number;
  // Add these short aliases to prevent map crashes
  lat?: number;
  lng?: number;
  alt?: number;
}

export interface TelemetryRow extends TelemetryPacket {
  id: number;
  created_at: string;
}