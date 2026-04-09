'use client';
import { useEffect, useState, useRef } from 'react';
import { db, ref, onValue, off, query, orderByKey, limitToLast } from '@/lib/firebase';
import type { TelemetryPacket } from '@/lib/types';

const HISTORY_SIZE = 100;

export function useTelemetry() {
  const [latest, setLatest]   = useState<TelemetryPacket | null>(null);
  const [history, setHistory] = useState<TelemetryPacket[]>([]);
  const [connected, setConnected] = useState(false);
  const historyRef = useRef<TelemetryPacket[]>([]);

  useEffect(() => {
    const latestRef = query(ref(db, 'telemetry'), orderByKey(), limitToLast(1));

    const unsubLatest = onValue(latestRef, (snapshot) => {
      if (snapshot.exists()) {
        const rawData = snapshot.val();
        const key = Object.keys(rawData)[0];
        const rawPacket = rawData[key];

        // 🛠️ THE FIX: Force all keys to LOWERCASE
        const normalized: any = {};
        Object.keys(rawPacket).forEach(k => {
          normalized[k.toLowerCase()] = rawPacket[k];
        });

        // Add short aliases for the map and gauges
        const finalPacket: TelemetryPacket = {
          ...normalized,
          lat: normalized.latitude ?? 0,
          lng: normalized.longitude ?? 0,
          alt: normalized.altitude ?? 0,
          packet_no: normalized.packet_no ?? 0,
        };

        // DEBUG: Uncomment the line below to see exactly what is arriving
        // console.log("📡 Normalized Packet:", finalPacket);

        setLatest(finalPacket);
        setConnected(true);

        historyRef.current = [
          ...historyRef.current.slice(-(HISTORY_SIZE - 1)),
          finalPacket,
        ];
        setHistory([...historyRef.current]);
      }
    });

    return () => off(latestRef, 'value', unsubLatest);
  }, []);

  return { latest, history, connected };
}