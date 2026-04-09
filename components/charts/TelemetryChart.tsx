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
      background: 'rgba(13, 17, 23, 0.9)', // Matching the space theme
      border: '1px solid rgba(255, 255, 255, 0.1)',
      padding: '10px 14px', borderRadius: 4, fontFamily: 'var(--font-mono)', fontSize: 11,
      backdropFilter: 'blur(4px)',
    }}>
      <div style={{ color: 'var(--text-muted)', marginBottom: 6, fontSize: 10 }}>PKT #{label}</div>
      {payload.map((p: any) => (
        <div key={p.dataKey} style={{ color: p.color, display: 'flex', gap: 12, justifyContent: 'space-between' }}>
          <span>{p.name}</span>
          <span style={{ fontWeight: 'bold' }}>
            {typeof p.value === 'number' ? p.value.toFixed(2) : p.value}
          </span>
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
          <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.04)" vertical={false} />
          <XAxis
            // CHANGED: lowercase to match your database columns
            dataKey="packet_no" 
            stroke="none"
            tick={{ fill: 'rgba(255,255,255,0.3)', fontSize: 9, fontFamily: "var(--font-mono)" }}
          />
          <YAxis
            stroke="none"
            tick={{ fill: 'rgba(255,255,255,0.3)', fontSize: 9, fontFamily: "var(--font-mono)" }}
            unit={yUnit}
            width={42}
            domain={['auto', 'auto']} // This makes the chart zoom into the data range
          />
          <Tooltip content={<CustomTooltip />} isAnimationActive={false} />
          {fields.length > 1 && (
            <Legend
              wrapperStyle={{ fontSize: 10, fontFamily: "var(--font-mono)", color: 'var(--text-muted)', paddingTop: '10px' }}
            />
          )}
          {fields.map((f) => (
            <Line
              key={f.key as string}
              type="monotone"
              dataKey={f.key as string} // This will work as long as your fields list uses lowercase keys
              name={f.label}
              stroke={f.color}
              strokeWidth={2}
              dot={false}
              activeDot={{ r: 4, fill: f.color, stroke: '#000', strokeWidth: 2 }}
              isAnimationActive={false} // Improves performance for real-time data
            />
          ))}
        </LineChart>
      </ResponsiveContainer>
    </div>
  );
}