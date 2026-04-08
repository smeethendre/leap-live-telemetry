'use client';
import React from 'react';

interface IMUDisplayProps {
  gyroX: number; gyroY: number; gyroZ: number;
  accelX: number; accelY: number; accelZ: number;
}

function Bar({ label, value, max = 5, color }: { label: string; value: number; max?: number; color: string }) {
  // Use a fallback to 0 if value is undefined/null to prevent math errors
  const safeValue = value ?? 0; 
  const pct = Math.min(Math.abs(safeValue) / max, 1);
  const isNeg = safeValue < 0;

  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: 8, fontSize: 11 }}>
      <span style={{ width: 28, color: 'var(--text-muted)', fontFamily: 'var(--font-mono)', textAlign: 'right' }}>{label}</span>
      <div style={{ flex: 1, height: 8, background: 'rgba(255,255,255,0.05)', borderRadius: 2, position: 'relative', overflow: 'hidden' }}>
        <div style={{
          position: 'absolute',
          top: 0, bottom: 0,
          width: `${pct * 50}%`,
          left: isNeg ? `${50 - pct * 50}%` : '50%',
          background: color,
          boxShadow: `0 0 8px ${color}88`,
          borderRadius: 2,
          transition: 'all 0.2s ease',
        }} />
        <div style={{ position: 'absolute', top: 0, bottom: 0, left: '50%', width: 1, background: 'rgba(255,255,255,0.15)' }} />
      </div>
      <span style={{ width: 52, color, fontFamily: 'var(--font-mono)', fontSize: 10 }}>
        {/* The Safety Net: if value is null, show 0.000 instead of crashing */}
        {safeValue.toFixed(3)}
      </span>
    </div>
  );
}

export default function IMUDisplay({ gyroX, gyroY, gyroZ, accelX, accelY, accelZ }: IMUDisplayProps) {
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
      <div>
        <div style={{ fontSize: 10, color: 'var(--text-muted)', fontFamily: 'var(--font-mono)', letterSpacing: '0.12em', marginBottom: 8 }}>
          GYROSCOPE (°/s)
        </div>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
          <Bar label="X" value={gyroX} max={200} color="#00d4ff" />
          <Bar label="Y" value={gyroY} max={200} color="#00ff9d" />
          <Bar label="Z" value={gyroZ} max={200} color="#a78bfa" />
        </div>
      </div>
      <div>
        <div style={{ fontSize: 10, color: 'var(--text-muted)', fontFamily: 'var(--font-mono)', letterSpacing: '0.12em', marginBottom: 8 }}>
          ACCELEROMETER (m/s²)
        </div>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
          <Bar label="X" value={accelX} max={20} color="#ffb400" />
          <Bar label="Y" value={accelY} max={20} color="#ff9d00" />
          <Bar label="Z" value={accelZ} max={20} color="#ff6b00" />
        </div>
      </div>
    </div>
  );
}
