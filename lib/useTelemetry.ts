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
    // Listen to the last 1 packet for live "latest" data
    const latestRef = query(
      ref(db, 'telemetry'),
      orderByKey(),
      limitToLast(1)
    );

    const unsubLatest = onValue(latestRef, (snapshot) => {
      if (snapshot.exists()) {
        const data = snapshot.val();
        const key = Object.keys(data)[0];
        const packet: TelemetryPacket = data[key];
        setLatest(packet);
        setConnected(true);

        // Append to rolling history
        historyRef.current = [
          ...historyRef.current.slice(-(HISTORY_SIZE - 1)),
          packet,
        ];
        setHistory([...historyRef.current]);
      }
    }, (error) => {
      console.error('Firebase listener error:', error);
      setConnected(false);
    });

    return () => off(latestRef, 'value', unsubLatest);
  }, []);

  return { latest, history, connected };
}
