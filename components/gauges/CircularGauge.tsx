'use client';
import React from 'react';

interface GaugeProps {
  value: number;
  min?: number;
  max?: number;
  label: string;
  unit?: string;
  color?: string;
  size?: number;
}

export default function CircularGauge({
  value, min = 0, max = 100, label, unit = '', color = '#00d4ff', size = 120,
}: GaugeProps) {
  const pct    = Math.min(Math.max((value - min) / (max - min), 0), 1);
  const R      = 44;
  const cx     = size / 2;
  const cy     = size / 2;
  const start  = Math.PI * 0.75;
  const sweep  = Math.PI * 1.5;
  const angle  = start + sweep * pct;

  const arcPath = (r: number, startA: number, endA: number) => {
    const x1 = cx + r * Math.cos(startA);
    const y1 = cy + r * Math.sin(startA);
    const x2 = cx + r * Math.cos(endA);
    const y2 = cy + r * Math.sin(endA);
    const la = endA - startA > Math.PI ? 1 : 0;
    return `M ${x1} ${y1} A ${r} ${r} 0 ${la} 1 ${x2} ${y2}`;
  };

  const trackEnd = start + sweep;

  return (
    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 4 }}>
      <svg width={size} height={size} viewBox={`0 0 ${size} ${size}`}>
        {/* Track */}
        <path
          d={arcPath(R, start, trackEnd)}
          fill="none"
          stroke="rgba(255,255,255,0.06)"
          strokeWidth="6"
          strokeLinecap="round"
        />
        {/* Value arc */}
        {pct > 0 && (
          <path
            d={arcPath(R, start, angle)}
            fill="none"
            stroke={color}
            strokeWidth="6"
            strokeLinecap="round"
            style={{ filter: `drop-shadow(0 0 6px ${color}88)` }}
          />
        )}
        {/* Tick marks */}
        {[0, 0.25, 0.5, 0.75, 1].map((t) => {
          const a = start + sweep * t;
          const inner = R - 10, outer = R - 6;
          return (
            <line
              key={t}
              x1={cx + inner * Math.cos(a)} y1={cy + inner * Math.sin(a)}
              x2={cx + outer * Math.cos(a)} y2={cy + outer * Math.sin(a)}
              stroke="rgba(255,255,255,0.2)" strokeWidth="1.5"
            />
          );
        })}
        {/* Center value */}
        <text x={cx} y={cy - 2} textAnchor="middle" dominantBaseline="middle"
          fill={color} fontSize="16" fontFamily="'Space Mono', monospace" fontWeight="700">
          {typeof value === 'number' ? value.toFixed(1) : '—'}
        </text>
        <text x={cx} y={cy + 14} textAnchor="middle" dominantBaseline="middle"
          fill="rgba(255,255,255,0.3)" fontSize="9" fontFamily="'Space Mono', monospace">
          {unit}
        </text>
      </svg>
      <span style={{ fontSize: 10, color: 'var(--text-muted)', fontFamily: 'var(--font-mono)', letterSpacing: '0.1em', textTransform: 'uppercase' }}>
        {label}
      </span>
    </div>
  );
}
