import React, { useEffect, useRef } from 'react';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import { MapPin, Navigation, Compass } from 'lucide-react';

interface LocationPickerMapProps {
  latitude?: number | null;
  longitude?: number | null;
  city?: string;
  venueName?: string;
  onChange: (coords: { latitude: number; longitude: number }) => void;
}

const CAMPUS_PRESETS: Array<{ label: string; city: string; lat: number; lng: number }> = [
  { label: 'ITB Ganesha (Bandung)', city: 'Bandung', lat: -6.8915, lng: 107.6107 },
  { label: 'Telkom University (Bandung)', city: 'Bandung', lat: -6.974, lng: 107.6305 },
  { label: 'Universitas Indonesia (Depok)', city: 'Depok', lat: -6.3686, lng: 106.8271 },
  { label: 'UGM Bulaksumur (Yogyakarta)', city: 'Yogyakarta', lat: -7.7707, lng: 110.3777 },
  { label: 'ITS Sukolilo (Surabaya)', city: 'Surabaya', lat: -7.2819, lng: 112.7953 },
  { label: 'Jakarta Convention Center', city: 'Jakarta', lat: -6.2146, lng: 106.8076 },
];

const createCustomPinIcon = () =>
  L.divIcon({
    className: 'convena-leaflet-pin',
    html: `<div style="width:32px;height:32px;border-radius:9999px;background:#4F46E5;border:3px solid #ffffff;box-shadow:0 4px 12px rgba(79,70,229,0.45);display:flex;align-items:center;justify-content:center;">
      <div style="width:10px;height:10px;border-radius:9999px;background:#ffffff;"></div>
    </div>`,
    iconSize: [32, 32],
    iconAnchor: [16, 16],
  });

export const LocationPickerMap: React.FC<LocationPickerMapProps> = ({
  latitude,
  longitude,
  venueName,
  onChange,
}) => {
  const containerRef = useRef<HTMLDivElement | null>(null);
  const mapRef = useRef<L.Map | null>(null);
  const markerRef = useRef<L.Marker | null>(null);

  const activeLat = typeof latitude === 'number' && !Number.isNaN(latitude) ? latitude : -6.8915;
  const activeLng = typeof longitude === 'number' && !Number.isNaN(longitude) ? longitude : 107.6107;

  useEffect(() => {
    if (!containerRef.current || mapRef.current) return;

    const map = L.map(containerRef.current, {
      center: [activeLat, activeLng],
      zoom: 15,
      scrollWheelZoom: false,
    });

    L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
      attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>',
      maxZoom: 19,
    }).addTo(map);

    const marker = L.marker([activeLat, activeLng], {
      draggable: true,
      icon: createCustomPinIcon(),
    }).addTo(map);

    marker.on('dragend', () => {
      const pos = marker.getLatLng();
      onChange({
        latitude: Number(pos.lat.toFixed(6)),
        longitude: Number(pos.lng.toFixed(6)),
      });
    });

    map.on('click', (e: L.LeafletMouseEvent) => {
      const { lat, lng } = e.latlng;
      marker.setLatLng([lat, lng]);
      onChange({
        latitude: Number(lat.toFixed(6)),
        longitude: Number(lng.toFixed(6)),
      });
    });

    mapRef.current = map;
    markerRef.current = marker;

    setTimeout(() => {
      map.invalidateSize();
    }, 150);

    return () => {
      map.remove();
      mapRef.current = null;
      markerRef.current = null;
    };
  }, []);

  useEffect(() => {
    if (!mapRef.current || !markerRef.current) return;
    if (typeof latitude === 'number' && typeof longitude === 'number') {
      const current = markerRef.current.getLatLng();
      if (
        Math.abs(current.lat - latitude) > 0.00001 ||
        Math.abs(current.lng - longitude) > 0.00001
      ) {
        markerRef.current.setLatLng([latitude, longitude]);
        mapRef.current.setView([latitude, longitude], mapRef.current.getZoom(), {
          animate: true,
        });
      }
    }
  }, [latitude, longitude]);

  const handleUseCurrentLocation = () => {
    if (!navigator.geolocation) return;
    navigator.geolocation.getCurrentPosition(
      (pos) => {
        const lat = Number(pos.coords.latitude.toFixed(6));
        const lng = Number(pos.coords.longitude.toFixed(6));
        onChange({ latitude: lat, longitude: lng });
        if (mapRef.current && markerRef.current) {
          markerRef.current.setLatLng([lat, lng]);
          mapRef.current.setView([lat, lng], 16, { animate: true });
        }
      },
      () => {
        // Ignore geolocation denial silently
      }
    );
  };

  return (
    <div className="space-y-3 rounded-xl border border-slate-200 bg-slate-50/70 p-4">
      <div className="flex flex-wrap items-center justify-between gap-2">
        <div>
          <label className="flex items-center gap-1.5 text-sm font-semibold text-slate-900">
            <MapPin className="h-4 w-4 text-indigo-600" />
            Pilih Titik Lokasi di Peta (Leaflet Maps)
          </label>
          <p className="text-xs text-slate-500">
            Klik pada peta atau geser pin biru untuk menentukan koordinat akurat lokasi acara.
          </p>
        </div>

        <button
          type="button"
          onClick={handleUseCurrentLocation}
          className="inline-flex items-center gap-1.5 rounded-lg border border-slate-200 bg-white px-3 py-1.5 text-xs font-medium text-slate-700 shadow-xs transition hover:border-indigo-300 hover:text-indigo-600"
        >
          <Compass className="h-3.5 w-3.5 text-indigo-600" />
          Gunakan Lokasi Saya
        </button>
      </div>

      <div className="flex flex-wrap gap-1.5">
        {CAMPUS_PRESETS.map((preset) => {
          const isSelected =
            typeof latitude === 'number' &&
            typeof longitude === 'number' &&
            Math.abs(latitude - preset.lat) < 0.002 &&
            Math.abs(longitude - preset.lng) < 0.002;
          return (
            <button
              key={preset.label}
              type="button"
              onClick={() => {
                onChange({ latitude: preset.lat, longitude: preset.lng });
                if (mapRef.current && markerRef.current) {
                  markerRef.current.setLatLng([preset.lat, preset.lng]);
                  mapRef.current.setView([preset.lat, preset.lng], 16, { animate: true });
                }
              }}
              className={`rounded-full px-2.5 py-1 text-xs font-medium transition ${
                isSelected
                  ? 'bg-indigo-600 text-white shadow-xs'
                  : 'border border-slate-200 bg-white text-slate-600 hover:border-indigo-200 hover:text-indigo-600'
              }`}
            >
              {preset.label}
            </button>
          );
        })}
      </div>

      <div className="relative overflow-hidden rounded-xl border border-slate-200 bg-slate-100 shadow-xs">
        <div ref={containerRef} className="h-72 w-full z-0" />
      </div>

      <div className="flex flex-wrap items-center justify-between gap-2 text-xs text-slate-600">
        <span className="font-mono">
          Koordinat:{' '}
          <strong className="text-slate-900">
            {activeLat.toFixed(5)}, {activeLng.toFixed(5)}
          </strong>
          {venueName ? ` — ${venueName}` : ''}
        </span>
        <a
          href={`https://www.google.com/maps/search/?api=1&query=${activeLat},${activeLng}`}
          target="_blank"
          rel="noopener noreferrer"
          className="inline-flex items-center gap-1 font-medium text-indigo-600 hover:text-indigo-700"
        >
          <Navigation className="h-3.5 w-3.5" />
          Cek di Google Maps
        </a>
      </div>
    </div>
  );
};
