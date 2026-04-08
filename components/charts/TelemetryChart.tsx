'use client';
import React from 'react';
import {
  LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend,
} from 'recharts';
import type { TelemetryPacket } from '@/lib/types';

interface TelemetryChartProps {
  data: TelemetryPacket[];
  fields: Array<{ key: keyof TelemetryPacket; color: string; label: string }>;
  title: string;
  yUnit?: string;
  height?: number;
}

const CustomTooltip = ({ active, payload, label }: any) => {
  if (!active || !payload?.length) return null;
  return (
    <div style={{
      background: 'var(--bg-card)', border: '1px solid var(--border-bright)',
      padding: '10px 14px', borderRadius: 2, fontFamily: 'var(--font-mono)', fontSize: 11,
    }}>
      <div style={{ color: 'var(--text-muted)', marginBottom: 6, fontSize: 10 }}>PKT #{label}</div>
      {payload.map((p: any) => (
        <div key={p.dataKey} style={{ color: p.color, display: 'flex', gap: 8, justifyContent: 'space-between' }}>
          <span>{p.name}</span>
          <span>{typeof p.value === 'number' ? p.value.toFixed(2) : p.value}</span>
        </div>
      ))}
    </div>
  );
};

export default function TelemetryChart({ data, fields, title, yUnit, height = 180 }: TelemetryChartProps) {
  return (
    <div style={{ width: '100%' }}>
      <div style={{ fontSize: 10, color: 'var(--text-muted)', fontFamily: 'var(--font-mono)', letterSpacing: '0.12em', marginBottom: 12 }}>
        {title}
      </div>
      <ResponsiveContainer width="100%" height={height}>
        <LineChart data={data} margin={{ top: 4, right: 8, bottom: 0, left: 0 }}>
          <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.04)" />
          <XAxis
            dataKey="PACKET_NO"
            stroke="none"
            tick={{ fill: '#3d6080', fontSize: 9, fontFamily: "'Space Mono', monospace" }}
          />
          <YAxis
            stroke="none"
            tick={{ fill: '#3d6080', fontSize: 9, fontFamily: "'Space Mono', monospace" }}
            unit={yUnit}
            width={42}
          />
          <Tooltip content={<CustomTooltip />} />
          {fields.length > 1 && (
            <Legend
              wrapperStyle={{ fontSize: 10, fontFamily: "'Space Mono', monospace", color: 'var(--text-muted)' }}
            />
          )}
          {fields.map((f) => (
            <Line
              key={f.key as string}
              type="monotone"
              dataKey={f.key as string}
              name={f.label}
              stroke={f.color}
              strokeWidth={1.5}
              dot={false}
              activeDot={{ r: 3, fill: f.color }}
              isAnimationActive={false}
            />
          ))}
        </LineChart>
      </ResponsiveContainer>
    </div>
  );
}
