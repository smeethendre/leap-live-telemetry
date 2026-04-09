'use client';
import React, { useEffect, useRef } from 'react';

interface GPSMapProps {
  path: Array<{ lat: number; lng: number; alt: number }>;
  current: any;
}

export default function GPSMap({ path, current }: GPSMapProps) {
  const mapRef = useRef<HTMLDivElement>(null);
  const leafletRef = useRef<any>(null);
  const markerRef = useRef<any>(null);
  const polyRef   = useRef<any>(null);

  // 🛠️ HELPER: Standardize coordinates regardless of key case
  const getCoords = (obj: any) => ({
    lat: obj?.lat ?? obj?.latitude ?? obj?.LATITUDE ?? 19.0760,
    lng: obj?.lng ?? obj?.longitude ?? obj?.LONGITUDE ?? 72.8777,
    alt: obj?.alt ?? obj?.altitude ?? obj?.ALTITUDE ?? 0
  });

  useEffect(() => {
    if (!mapRef.current || typeof window === 'undefined') return;

    const initMap = async () => {
      const L = await import('leaflet');
      
      // 🛑 THE FIX: Check if the DOM element already has a map attached
      // This prevents the "Map container is already initialized" error
      const container = L.DomUtil.get(mapRef.current!);
      if ((container as any)?._leaflet_id) return;

      const coords = getCoords(current);
      const map = L.map(mapRef.current!, {
        center: [coords.lat, coords.lng],
        zoom: 13,
        zoomControl: true,
        attributionControl: false,
      });

      L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png').addTo(map);

      const icon = L.divIcon({
        html: `<div style="width:14px;height:14px;background:#00d4ff;border-radius:50%;border:2px solid #fff;box-shadow:0 0 12px #00d4ff;"></div>`,
        iconSize: [14, 14],
        className: '',
      });

      markerRef.current = L.marker([coords.lat, coords.lng], { icon }).addTo(map);
      polyRef.current   = L.polyline([], { color: '#00d4ff', weight: 3 }).addTo(map);
      leafletRef.current = map;
    };

    initMap();

    return () => {
      if (leafletRef.current) {
        leafletRef.current.remove();
        leafletRef.current = null;
      }
    };
  }, []);

  useEffect(() => {
    if (!leafletRef.current || !current) return;
    const coords = getCoords(current);
    markerRef.current?.setLatLng([coords.lat, coords.lng]);
    polyRef.current?.setLatLngs(path.map(p => [getCoords(p).lat, getCoords(p).lng]));
    leafletRef.current.setView([coords.lat, coords.lng], leafletRef.current.getZoom());
  }, [current, path]);

  const display = getCoords(current);

  return (
    <div style={{ position: 'relative', height: '100%', minHeight: 280 }}>
      <div ref={mapRef} style={{ height: '100%', width: '100%', borderRadius: 2 }} />
      <div style={{
        position: 'absolute', bottom: 12, left: 12, zIndex: 1000,
        background: 'rgba(10,18,32,0.9)', padding: '8px 12px', fontSize: 10, color: '#fff'
      }}>
        <div>LAT <span style={{ color: '#00d4ff' }}>{display.lat.toFixed(6)}°</span></div>
        <div>LNG <span style={{ color: '#00d4ff' }}>{display.lng.toFixed(6)}°</span></div>
        <div>ALT <span style={{ color: '#00ff9d' }}>{display.alt.toFixed(0)} m</span></div>
      </div>
    </div>
  );
}