'use client';
import React from 'react';
import type { TelemetryPacket } from '@/lib/types';

interface HeaderProps {
  latest: TelemetryPacket | null;
  connected: boolean;
  packetCount: number;
}

export default function Header({ latest, connected, packetCount }: HeaderProps) {
  return (
    <header style={{
      borderBottom: '1px solid var(--border)',
      background: 'rgba(5,8,16,0.95)',
      backdropFilter: 'blur(12px)',
      position: 'sticky', top: 0, zIndex: 100,
      padding: '0 24px',
    }}>
      <div style={{ maxWidth: 1600, margin: '0 auto', display: 'flex', alignItems: 'center', height: 56, gap: 24 }}>
        {/* Logo */}
        <div style={{ display: 'flex', alignItems: 'center', gap: 10, minWidth: 200 }}>
          <svg width="24" height="24" viewBox="0 0 24 24" fill="none">
            <circle cx="12" cy="12" r="10" stroke="#00d4ff" strokeWidth="1.5" strokeDasharray="4 2" />
            <circle cx="12" cy="6" r="3" fill="#00d4ff" />
            <path d="M12 9 L10 14 L12 13 L14 14 Z" fill="#00d4ff" />
          </svg>
          <span className="display" style={{ fontSize: 13, letterSpacing: '0.2em', color: '#00d4ff' }}>
            HAB·TELEM
          </span>
        </div>

        {/* Mission info */}
        {latest && (
          <div style={{ display: 'flex', gap: 24, flex: 1, alignItems: 'center' }}>
            <div style={{ fontFamily: 'var(--font-mono)', fontSize: 11 }}>
              <span style={{ color: 'var(--text-muted)' }}>ID  </span>
              <span style={{ color: 'var(--accent)' }}>{latest.HAB_ID}</span>
            </div>
            <div style={{ fontFamily: 'var(--font-mono)', fontSize: 11 }}>
              <span style={{ color: 'var(--text-muted)' }}>T+  </span>
              <span style={{ color: 'var(--text-primary)' }}>{latest.MISSION_TIME}</span>
            </div>
            <div style={{ fontFamily: 'var(--font-mono)', fontSize: 11 }}>
              <span style={{ color: 'var(--text-muted)' }}>PKT  </span>
              <span style={{ color: 'var(--text-primary)' }}>#{latest.PACKET_NO}</span>
            </div>
            <div style={{ fontFamily: 'var(--font-mono)', fontSize: 11 }}>
              <span style={{ color: 'var(--text-muted)' }}>FLAG  </span>
              <span style={{ color: latest.STATUS_FLAG === 'OK' ? 'var(--green)' : 'var(--amber)' }}>
                {latest.STATUS_FLAG}
              </span>
            </div>
            <div style={{ fontFamily: 'var(--font-mono)', fontSize: 11 }}>
              <span style={{ color: 'var(--text-muted)' }}>RSSI  </span>
              <span style={{ color: latest.RSSI < -90 ? 'var(--red)' : latest.RSSI < -70 ? 'var(--amber)' : 'var(--green)' }}>
                {latest.RSSI} dBm
              </span>
            </div>
            <div style={{ fontFamily: 'var(--font-mono)', fontSize: 11 }}>
              <span style={{ color: 'var(--text-muted)' }}>CAM  </span>
              <span style={{ color: latest.CAMERA_STATUS === 'ON' ? 'var(--green)' : 'var(--text-muted)' }}>
                {latest.CAMERA_STATUS}
              </span>
            </div>
          </div>
        )}

        {/* Connection status */}
        <div style={{ marginLeft: 'auto', display: 'flex', alignItems: 'center', gap: 16 }}>
          {packetCount > 0 && (
            <span style={{ fontFamily: 'var(--font-mono)', fontSize: 10, color: 'var(--text-muted)' }}>
              {packetCount} pkts received
            </span>
          )}
          {connected ? (
            <span className="status-live">LIVE</span>
          ) : (
            <span style={{ fontFamily: 'var(--font-mono)', fontSize: 10, color: 'var(--text-muted)', letterSpacing: '0.1em' }}>
              WAITING...
            </span>
          )}
        </div>
      </div>
    </header>
  );
}
