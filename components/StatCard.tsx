'use client';
import React from 'react';

interface StatCardProps {
  label: string;
  value: string | number;
  unit?: string;
  icon?: React.ReactNode;
  color?: 'cyan' | 'green' | 'amber' | 'red' | 'purple';
  sub?: string;
  alert?: boolean;
}

const colorMap = {
  cyan:   { border: '#00d4ff22', accent: '#00d4ff', glow: '0 0 24px rgba(0,212,255,0.2)' },
  green:  { border: '#00ff9d22', accent: '#00ff9d', glow: '0 0 24px rgba(0,255,157,0.2)' },
  amber:  { border: '#ffb40022', accent: '#ffb400', glow: '0 0 24px rgba(255,180,0,0.2)' },
  red:    { border: '#ff446622', accent: '#ff4466', glow: '0 0 24px rgba(255,68,102,0.2)' },
  purple: { border: '#a78bfa22', accent: '#a78bfa', glow: '0 0 24px rgba(167,139,250,0.2)' },
};

export default function StatCard({ label, value, unit, icon, color = 'cyan', sub, alert }: StatCardProps) {
  const c = colorMap[color];

  return (
    <div
      className="panel panel-corner fade-in"
      style={{
        padding: '16px',
        borderColor: alert ? '#ff4466' : c.border,
        boxShadow: alert ? '0 0 24px rgba(255,68,102,0.2)' : c.glow,
        transition: 'all 0.3s ease',
      }}
    >
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 8 }}>
        <span style={{ fontSize: 10, fontFamily: 'var(--font-mono)', color: 'var(--text-muted)', letterSpacing: '0.12em', textTransform: 'uppercase' }}>
          {label}
        </span>
        {icon && <span style={{ color: c.accent, opacity: 0.7 }}>{icon}</span>}
      </div>

      <div style={{ display: 'flex', alignItems: 'baseline', gap: 4 }}>
        <span
          className="mono"
          style={{ fontSize: 28, fontWeight: 700, color: alert ? '#ff4466' : c.accent, lineHeight: 1 }}
        >
          {value === null || value === undefined ? '—' : value}
        </span>
        {unit && (
          <span style={{ fontSize: 12, color: 'var(--text-muted)', fontFamily: 'var(--font-mono)' }}>
            {unit}
          </span>
        )}
      </div>

      {sub && (
        <div style={{ marginTop: 6, fontSize: 11, color: 'var(--text-muted)', fontFamily: 'var(--font-mono)' }}>
          {sub}
        </div>
      )}

      {/* Bottom accent line */}
      <div style={{
        position: 'absolute', bottom: 0, left: 0, right: 0, height: 2,
        background: `linear-gradient(90deg, transparent, ${c.accent}66, transparent)`,
      }} />
    </div>
  );
}
