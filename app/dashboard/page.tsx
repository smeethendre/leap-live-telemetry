'use client';
import React, { useState, useMemo } from 'react';
import { useTelemetry } from '@/lib/useTelemetry';
import Header from '@/components/Header';
import StatCard from '@/components/StatCard';
import CircularGauge from '@/components/gauges/CircularGauge';
import IMUDisplay from '@/components/gauges/IMUDisplay';
import TelemetryChart from '@/components/charts/TelemetryChart';
import dynamic from 'next/dynamic';

const GPSMap = dynamic(() => import('@/components/map/GPSMap'), { ssr: false });

export default function Dashboard() {
  const { latest, history, connected } = useTelemetry();
  const [activeChart, setActiveChart] = useState<'env' | 'imu' | 'signal'>('env');

  // 🛠️ FIX 1: Lowercase mapping for GPS Path
  const gpsPath = useMemo(() =>
    history
      .filter(p => (p.latitude || p.lat) && (p.longitude || p.lng))
      .map(p => ({ 
        lat: p.latitude ?? p.lat ?? 0, 
        lng: p.longitude ?? p.lng ?? 0, 
        alt: p.altitude ?? p.alt ?? 0 
      })),
    [history]
  );

  const currentGPS = latest ? { 
    lat: latest.latitude ?? latest.lat ?? 0, 
    lng: latest.longitude ?? latest.lng ?? 0, 
    alt: latest.altitude ?? latest.alt ?? 0 
  } : null;

  const fmt = (v: number | undefined | null, d = 1) =>
    v !== undefined && v !== null ? v.toFixed(d) : '0.0';

  return (
    <div style={{ position: 'relative', zIndex: 1, minHeight: '100vh' }}>
      <Header latest={latest} connected={connected} packetCount={history.length} />

      {!latest && (
        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', height: 'calc(100vh - 56px)', gap: 24 }}>
          <svg width="64" height="64" viewBox="0 0 64 64" fill="none" style={{ opacity: 0.3 }}>
            <circle cx="32" cy="20" r="12" stroke="#00d4ff" strokeWidth="2" strokeDasharray="6 3" />
            <path d="M32 32 L28 50 L32 46 L36 50 Z" fill="#00d4ff" />
            <circle cx="32" cy="20" r="4" fill="#00d4ff" />
          </svg>
          <div style={{ fontFamily: 'var(--font-mono)', fontSize: 13, color: 'var(--text-muted)', letterSpacing: '0.15em' }}>
            AWAITING TELEMETRY SIGNAL...
          </div>
        </div>
      )}

      {latest && (
        <main style={{ maxWidth: 1600, margin: '0 auto', padding: '20px 24px 40px', display: 'flex', flexDirection: 'column', gap: 16 }}>

          {/* Row 1: Key stats - FIXED to lowercase */}
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(160px, 1fr))', gap: 12 }}>
            <StatCard
              label="Altitude"
              value={fmt(latest.altitude, 0)}
              unit="m"
              color="cyan"
              sub={`${((latest.altitude || 0) * 3.28084).toFixed(0)} ft`}
            />
            <StatCard
              label="Temperature"
              value={fmt(latest.temperature)}
              unit="°C"
              color={(latest.temperature || 0) < -30 ? 'cyan' : (latest.temperature || 0) > 60 ? 'red' : 'amber'}
            />
            <StatCard
              label="Pressure"
              value={fmt(latest.pressure, 1)}
              unit="hPa"
              color="purple"
            />
            <StatCard
              label="Humidity"
              value={fmt(latest.humidity, 0)}
              unit="%"
              color="cyan"
            />
            <StatCard
              label="UV Index"
              value={fmt(latest.uv_index, 1)}
              unit=""
              color={(latest.uv_index || 0) > 8 ? 'red' : (latest.uv_index || 0) > 5 ? 'amber' : 'green'}
              alert={(latest.uv_index || 0) > 10}
            />
            <StatCard
              label="Magnetic Field"
              value={fmt(latest.magnetic_field, 1)}
              unit="µT"
              color="purple"
            />
            <StatCard
              label="Battery"
              value={fmt(latest.battery_percent, 0)}
              unit="%"
              color={(latest.battery_percent || 0) < 20 ? 'red' : (latest.battery_percent || 0) < 50 ? 'amber' : 'green'}
              alert={(latest.battery_percent || 0) < 15}
              sub={(latest.battery_percent || 0) < 20 ? '⚠ LOW BATTERY' : undefined}
            />
            <StatCard
              label="RSSI"
              value={fmt(latest.rssi, 0)}
              unit="dBm"
              color={(latest.rssi || 0) < -90 ? 'red' : (latest.rssi || 0) < -70 ? 'amber' : 'green'}
            />
          </div>

          {/* Row 2: Map + Gauges + IMU */}
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 280px 280px', gap: 16 }}>
            <div className="panel" style={{ padding: 0, minHeight: 320, overflow: 'hidden' }}>
              <div style={{ padding: '12px 16px', borderBottom: '1px solid var(--border)', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                <span style={{ fontFamily: 'var(--font-mono)', fontSize: 10, color: 'var(--text-muted)', letterSpacing: '0.12em' }}>FLIGHT PATH</span>
                <span style={{ fontFamily: 'var(--font-mono)', fontSize: 10, color: 'var(--accent)' }}>{gpsPath.length} pts</span>
              </div>
              <div style={{ height: 280 }}>
                <GPSMap path={gpsPath} current={currentGPS} />
              </div>
            </div>

            <div className="panel" style={{ padding: 20 }}>
              <div style={{ fontFamily: 'var(--font-mono)', fontSize: 10, color: 'var(--text-muted)', letterSpacing: '0.12em', marginBottom: 20 }}>ENVIRONMENTAL</div>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 16, alignItems: 'center' }}>
                <CircularGauge value={latest.humidity}   min={0}   max={100}  label="Humidity"    unit="%" color="#00d4ff" />
                <CircularGauge value={latest.pressure}   min={100} max={1013} label="Pressure"    unit="hPa" color="#a78bfa" />
                <CircularGauge value={latest.battery_percent} min={0} max={100} label="Battery"   unit="%" color={(latest.battery_percent || 0) < 20 ? '#ff4466' : '#00ff9d'} />
              </div>
            </div>

            <div className="panel" style={{ padding: 20 }}>
              <div style={{ fontFamily: 'var(--font-mono)', fontSize: 10, color: 'var(--text-muted)', letterSpacing: '0.12em', marginBottom: 20 }}>IMU / MOTION</div>
              <IMUDisplay
                gyroX={latest.gyro_x}   gyroY={latest.gyro_y}   gyroZ={latest.gyro_z}
                accelX={latest.accel_x} accelY={latest.accel_y} accelZ={latest.accel_z}
              />
            </div>
          </div>

          {/* Row 3: Charts - FIXED field keys */}
          <div className="panel" style={{ padding: 20 }}>
            <div style={{ display: 'flex', gap: 0, marginBottom: 20, borderBottom: '1px solid var(--border)' }}>
              {(['env', 'imu', 'signal'] as const).map((tab) => (
                <button
                  key={tab}
                  onClick={() => setActiveChart(tab)}
                  style={{
                    background: 'none', border: 'none', cursor: 'pointer',
                    fontFamily: 'var(--font-mono)', fontSize: 10, padding: '8px 20px',
                    color: activeChart === tab ? 'var(--accent)' : 'var(--text-muted)',
                    borderBottom: activeChart === tab ? '2px solid var(--accent)' : '2px solid transparent',
                  }}
                >
                  {tab === 'env' ? 'Environment' : tab === 'imu' ? 'IMU Data' : 'Signal'}
                </button>
              ))}
            </div>

            {history.length >= 2 && activeChart === 'env' && (
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 24 }}>
                <TelemetryChart data={history} title="TEMPERATURE (°C)" fields={[{ key: 'temperature', color: '#ffb400', label: 'Temp' }]} />
                <TelemetryChart data={history} title="ALTITUDE (m)" fields={[{ key: 'altitude', color: '#00d4ff', label: 'Alt' }]} />
              </div>
            )}
            {/* ... other charts should follow the same lowercase key pattern ... */}
          </div>

          {/* Row 4: Raw packet log - FIXED to lowercase */}
          <div className="panel" style={{ padding: 20 }}>
            <div style={{ fontFamily: 'var(--font-mono)', fontSize: 10, color: 'var(--text-muted)', letterSpacing: '0.12em', marginBottom: 12 }}>RAW PACKET LOG</div>
            <div style={{ overflowX: 'auto' }}>
              <table style={{ width: '100%', borderCollapse: 'collapse', fontFamily: 'var(--font-mono)', fontSize: 10 }}>
                <tbody>
                  {[...history].reverse().slice(0, 10).map((p, i) => (
                    <tr key={i} style={{ borderBottom: '1px solid rgba(26,47,80,0.5)' }}>
                      <td style={{ padding: '6px 10px', color: 'var(--accent)' }}>#{p.packet_no}</td>
                      <td style={{ padding: '6px 10px' }}>{p.mission_time}</td>
                      <td style={{ padding: '6px 10px', color: '#ffb400' }}>{fmt(p.temperature)}°C</td>
                      <td style={{ padding: '6px 10px', color: '#00d4ff' }}>{fmt(p.altitude, 0)} m</td>
                      <td style={{ padding: '6px 10px' }}>{p.status_flag}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </main>
      )}
    </div>
  );
}