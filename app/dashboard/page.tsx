'use client';
import React, { useState, useMemo } from 'react';
import { useTelemetry } from '@/lib/useTelemetry';
import Header from '@/components/Header';
import StatCard from '@/components/StatCard';
import CircularGauge from '@/components/gauges/CircularGauge';
import IMUDisplay from '@/components/gauges/IMUDisplay';
import TelemetryChart from '@/components/charts/TelemetryChart';
import dynamic from 'next/dynamic';

// Leaflet must be loaded client-side only
const GPSMap = dynamic(() => import('@/components/map/GPSMap'), { ssr: false });

export default function Dashboard() {
  const { latest, history, connected } = useTelemetry();
  const [activeChart, setActiveChart] = useState<'env' | 'imu' | 'signal'>('env');

  const gpsPath = useMemo(() =>
    history
      .filter(p => p.LATITUDE && p.LONGITUDE)
      .map(p => ({ lat: p.LATITUDE, lng: p.LONGITUDE, alt: p.ALTITUDE })),
    [history]
  );

  const currentGPS = latest ? { lat: latest.LATITUDE, lng: latest.LONGITUDE, alt: latest.ALTITUDE } : null;

  const fmt = (v: number | undefined, d = 1) =>
    v !== undefined && v !== null ? v.toFixed(d) : '—';

  return (
    <div style={{ position: 'relative', zIndex: 1, minHeight: '100vh' }}>
      <Header latest={latest} connected={connected} packetCount={history.length} />

      {/* No data yet */}
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
          <div style={{ fontFamily: 'var(--font-mono)', fontSize: 10, color: 'var(--text-muted)', opacity: 0.5 }}>
            Listening on Firebase Realtime Database
          </div>
        </div>
      )}

      {latest && (
        <main style={{ maxWidth: 1600, margin: '0 auto', padding: '20px 24px 40px', display: 'flex', flexDirection: 'column', gap: 16 }}>

          {/* ── Row 1: Key stats ── */}
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(160px, 1fr))', gap: 12 }}>
            <StatCard
              label="Altitude"
              value={fmt(latest.ALTITUDE, 0)}
              unit="m"
              color="cyan"
              sub={`${(latest.ALTITUDE * 3.28084).toFixed(0)} ft`}
            />
            <StatCard
              label="Temperature"
              value={fmt(latest.TEMPERATURE)}
              unit="°C"
              color={latest.TEMPERATURE < -30 ? 'cyan' : latest.TEMPERATURE > 60 ? 'red' : 'amber'}
            />
            <StatCard
              label="Pressure"
              value={fmt(latest.PRESSURE, 1)}
              unit="hPa"
              color="purple"
            />
            <StatCard
              label="Humidity"
              value={fmt(latest.HUMIDITY, 0)}
              unit="%"
              color="cyan"
            />
            <StatCard
              label="UV Index"
              value={fmt(latest.UV_INDEX, 1)}
              unit=""
              color={latest.UV_INDEX > 8 ? 'red' : latest.UV_INDEX > 5 ? 'amber' : 'green'}
              alert={latest.UV_INDEX > 10}
            />
            <StatCard
              label="Magnetic Field"
              value={fmt(latest.MAGNETIC_FIELD, 1)}
              unit="µT"
              color="purple"
            />
            <StatCard
              label="Battery"
              value={fmt(latest.BATTERY_PERCENT, 0)}
              unit="%"
              color={latest.BATTERY_PERCENT < 20 ? 'red' : latest.BATTERY_PERCENT < 50 ? 'amber' : 'green'}
              alert={latest.BATTERY_PERCENT < 15}
              sub={latest.BATTERY_PERCENT < 20 ? '⚠ LOW BATTERY' : undefined}
            />
            <StatCard
              label="RSSI"
              value={fmt(latest.RSSI, 0)}
              unit="dBm"
              color={latest.RSSI < -90 ? 'red' : latest.RSSI < -70 ? 'amber' : 'green'}
            />
          </div>

          {/* ── Row 2: Map + Gauges + IMU ── */}
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 280px 280px', gap: 16 }}>

            {/* GPS Map */}
            <div className="panel" style={{ padding: 0, minHeight: 320, overflow: 'hidden' }}>
              <div style={{ padding: '12px 16px', borderBottom: '1px solid var(--border)', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                <span style={{ fontFamily: 'var(--font-mono)', fontSize: 10, color: 'var(--text-muted)', letterSpacing: '0.12em' }}>
                  FLIGHT PATH
                </span>
                <span style={{ fontFamily: 'var(--font-mono)', fontSize: 10, color: 'var(--accent)' }}>
                  {gpsPath.length} pts
                </span>
              </div>
              <div style={{ height: 280 }}>
                <GPSMap path={gpsPath} current={currentGPS} />
              </div>
            </div>

            {/* Environmental Gauges */}
            <div className="panel" style={{ padding: 20 }}>
              <div style={{ fontFamily: 'var(--font-mono)', fontSize: 10, color: 'var(--text-muted)', letterSpacing: '0.12em', marginBottom: 20 }}>
                ENVIRONMENTAL
              </div>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 16, alignItems: 'center' }}>
                <CircularGauge value={latest.HUMIDITY}   min={0}   max={100}  label="Humidity"    unit="%" color="#00d4ff" />
                <CircularGauge value={latest.PRESSURE}   min={100} max={1013} label="Pressure"    unit="hPa" color="#a78bfa" />
                <CircularGauge value={latest.BATTERY_PERCENT} min={0} max={100} label="Battery"  unit="%" color={latest.BATTERY_PERCENT < 20 ? '#ff4466' : '#00ff9d'} />
              </div>
            </div>

            {/* IMU */}
            <div className="panel" style={{ padding: 20 }}>
              <div style={{ fontFamily: 'var(--font-mono)', fontSize: 10, color: 'var(--text-muted)', letterSpacing: '0.12em', marginBottom: 20 }}>
                IMU / MOTION
              </div>
              <IMUDisplay
                gyroX={latest.GYRO_X}   gyroY={latest.GYRO_Y}   gyroZ={latest.GYRO_Z}
                accelX={latest.ACCEL_X} accelY={latest.ACCEL_Y} accelZ={latest.ACCEL_Z}
              />
            </div>
          </div>

          {/* ── Row 3: Charts ── */}
          <div className="panel" style={{ padding: 20 }}>
            {/* Chart tabs */}
            <div style={{ display: 'flex', gap: 0, marginBottom: 20, borderBottom: '1px solid var(--border)' }}>
              {(['env', 'imu', 'signal'] as const).map((tab) => (
                <button
                  key={tab}
                  onClick={() => setActiveChart(tab)}
                  style={{
                    background: 'none', border: 'none', cursor: 'pointer',
                    fontFamily: 'var(--font-mono)', fontSize: 10, letterSpacing: '0.12em',
                    padding: '8px 20px', textTransform: 'uppercase',
                    color: activeChart === tab ? 'var(--accent)' : 'var(--text-muted)',
                    borderBottom: activeChart === tab ? '2px solid var(--accent)' : '2px solid transparent',
                    marginBottom: -1,
                    transition: 'all 0.2s',
                  }}
                >
                  {tab === 'env' ? 'Environment' : tab === 'imu' ? 'IMU Data' : 'Signal'}
                </button>
              ))}
            </div>

            {history.length < 2 && (
              <div style={{ textAlign: 'center', padding: '40px 0', color: 'var(--text-muted)', fontFamily: 'var(--font-mono)', fontSize: 11 }}>
                Collecting data... ({history.length}/2 packets)
              </div>
            )}

            {history.length >= 2 && activeChart === 'env' && (
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 24 }}>
                <TelemetryChart
                  data={history} title="TEMPERATURE (°C)" yUnit="°C"
                  fields={[{ key: 'TEMPERATURE', color: '#ffb400', label: 'Temp' }]}
                />
                <TelemetryChart
                  data={history} title="ALTITUDE (m)" yUnit="m"
                  fields={[{ key: 'ALTITUDE', color: '#00d4ff', label: 'Alt' }]}
                />
                <TelemetryChart
                  data={history} title="PRESSURE (hPa)"
                  fields={[{ key: 'PRESSURE', color: '#a78bfa', label: 'Pressure' }]}
                />
                <TelemetryChart
                  data={history} title="HUMIDITY (%) · UV INDEX"
                  fields={[
                    { key: 'HUMIDITY', color: '#00d4ff', label: 'Humidity %' },
                    { key: 'UV_INDEX', color: '#ff4466', label: 'UV Index' },
                  ]}
                />
              </div>
            )}

            {history.length >= 2 && activeChart === 'imu' && (
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 24 }}>
                <TelemetryChart
                  data={history} title="GYROSCOPE X · Y · Z"
                  fields={[
                    { key: 'GYRO_X', color: '#00d4ff', label: 'Gyro X' },
                    { key: 'GYRO_Y', color: '#00ff9d', label: 'Gyro Y' },
                    { key: 'GYRO_Z', color: '#a78bfa', label: 'Gyro Z' },
                  ]}
                />
                <TelemetryChart
                  data={history} title="ACCELEROMETER X · Y · Z"
                  fields={[
                    { key: 'ACCEL_X', color: '#ffb400', label: 'Accel X' },
                    { key: 'ACCEL_Y', color: '#ff9d00', label: 'Accel Y' },
                    { key: 'ACCEL_Z', color: '#ff6b00', label: 'Accel Z' },
                  ]}
                />
                <TelemetryChart
                  data={history} title="MAGNETIC FIELD (µT)"
                  fields={[{ key: 'MAGNETIC_FIELD', color: '#a78bfa', label: 'Mag Field' }]}
                />
              </div>
            )}

            {history.length >= 2 && activeChart === 'signal' && (
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 24 }}>
                <TelemetryChart
                  data={history} title="RSSI (dBm)" yUnit="dBm"
                  fields={[{ key: 'RSSI', color: '#00ff9d', label: 'RSSI' }]}
                />
                <TelemetryChart
                  data={history} title="BATTERY (%)" yUnit="%"
                  fields={[{ key: 'BATTERY_PERCENT', color: '#ffb400', label: 'Battery' }]}
                />
              </div>
            )}
          </div>

          {/* ── Row 4: Raw packet log ── */}
          <div className="panel" style={{ padding: 20 }}>
            <div style={{ fontFamily: 'var(--font-mono)', fontSize: 10, color: 'var(--text-muted)', letterSpacing: '0.12em', marginBottom: 12 }}>
              RAW PACKET LOG (last 10)
            </div>
            <div style={{ overflowX: 'auto' }}>
              <table style={{ width: '100%', borderCollapse: 'collapse', fontFamily: 'var(--font-mono)', fontSize: 10 }}>
                <thead>
                  <tr style={{ borderBottom: '1px solid var(--border)' }}>
                    {['PKT', 'TIME', 'TEMP', 'PRES', 'HUM', 'ALT', 'LAT', 'LNG', 'BAT%', 'RSSI', 'FLAG'].map(h => (
                      <th key={h} style={{ padding: '6px 10px', color: 'var(--text-muted)', textAlign: 'left', fontWeight: 400, letterSpacing: '0.08em' }}>
                        {h}
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {[...history].reverse().slice(0, 10).map((p, i) => (
                    <tr key={i} style={{ borderBottom: '1px solid rgba(26,47,80,0.5)', opacity: i === 0 ? 1 : 0.6 + i * -0.04 }}>
                      <td style={{ padding: '6px 10px', color: 'var(--accent)' }}>#{p.PACKET_NO}</td>
                      <td style={{ padding: '6px 10px', color: 'var(--text-secondary)' }}>{p.MISSION_TIME}</td>
                      <td style={{ padding: '6px 10px', color: '#ffb400' }}>{fmt(p.TEMPERATURE)}°C</td>
                      <td style={{ padding: '6px 10px', color: 'var(--text-secondary)' }}>{fmt(p.PRESSURE)} hPa</td>
                      <td style={{ padding: '6px 10px', color: 'var(--text-secondary)' }}>{fmt(p.HUMIDITY, 0)}%</td>
                      <td style={{ padding: '6px 10px', color: '#00d4ff' }}>{fmt(p.ALTITUDE, 0)} m</td>
                      <td style={{ padding: '6px 10px', color: 'var(--text-secondary)' }}>{p.LATITUDE?.toFixed(5)}</td>
                      <td style={{ padding: '6px 10px', color: 'var(--text-secondary)' }}>{p.LONGITUDE?.toFixed(5)}</td>
                      <td style={{ padding: '6px 10px', color: p.BATTERY_PERCENT < 20 ? '#ff4466' : '#00ff9d' }}>{fmt(p.BATTERY_PERCENT, 0)}%</td>
                      <td style={{ padding: '6px 10px', color: p.RSSI < -90 ? '#ff4466' : p.RSSI < -70 ? '#ffb400' : '#00ff9d' }}>{p.RSSI}</td>
                      <td style={{ padding: '6px 10px', color: p.STATUS_FLAG === 'OK' ? '#00ff9d' : '#ffb400' }}>{p.STATUS_FLAG}</td>
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
