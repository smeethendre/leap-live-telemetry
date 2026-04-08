export interface TelemetryPacket {
  HAB_ID: string;
  MISSION_TIME: string;
  PACKET_NO: number;
  TEMPERATURE: number;
  PRESSURE: number;
  HUMIDITY: number;
  UV_INDEX: number;
  MAGNETIC_FIELD: number;
  LATITUDE: number;
  LONGITUDE: number;
  ALTITUDE: number;
  TIMESTAMP: string;
  BATTERY_PERCENT: number;
  GYRO_X: number;
  GYRO_Y: number;
  GYRO_Z: number;
  ACCEL_X: number;
  ACCEL_Y: number;
  ACCEL_Z: number;
  CAMERA_STATUS: string;
  STATUS_FLAG: string;
  RSSI: number;
}

export interface TelemetryRow extends TelemetryPacket {
  id: number;
  created_at: string;
}
