import React, { useEffect, useRef } from 'react';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import { Navigation, ExternalLink } from 'lucide-react';

interface LocationPreviewMapProps {
  latitude?: number | null;
  longitude?: number | null;
  venueName?: string;
  address?: string;
  city?: string;
}

const CITY_FALLBACKS: Record<string, [number, number]> = {
  bandung: [-6.8915, 107.6107],
  depok: [-6.3686, 106.8271],
  jakarta: [-6.2146, 106.8076],
  yogyakarta: [-7.7707, 110.3777],
  surabaya: [-7.2819, 112.7953],
};

const createCustomPinIcon = () =>
  L.divIcon({
    className: 'convena-leaflet-preview-pin',
    html: `<div style="width:32px;height:32px;border-radius:9999px;background:#4F46E5;border:3px solid #ffffff;box-shadow:0 4px 12px rgba(79,70,229,0.45);display:flex;align-items:center;justify-content:center;">
      <div style="width:10px;height:10px;border-radius:9999px;background:#ffffff;"></div>
    </div>`,
    iconSize: [32, 32],
    iconAnchor: [16, 16],
  });

export const LocationPreviewMap: React.FC<LocationPreviewMapProps> = ({
  latitude,
  longitude,
  venueName,
  address,
  city,
}) => {
  const containerRef = useRef<HTMLDivElement | null>(null);
  const mapRef = useRef<L.Map | null>(null);

  const cityKey = (city || '').trim().toLowerCase();
  const fallbackCoords = CITY_FALLBACKS[cityKey] || [-6.8915, 107.6107];

  const hasExactCoords =
    typeof latitude === 'number' &&
    !Number.isNaN(latitude) &&
    typeof longitude === 'number' &&
    !Number.isNaN(longitude);

  const lat = hasExactCoords ? (latitude as number) : fallbackCoords[0];
  const lng = hasExactCoords ? (longitude as number) : fallbackCoords[1];

  const destinationQuery = hasExactCoords
    ? `${lat},${lng}`
    : encodeURIComponent([venueName, address, city].filter(Boolean).join(', '));

  const googleMapsDirectionsUrl = `https://www.google.com/maps/dir/?api=1&destination=${destinationQuery}`;
  const googleMapsPlaceUrl = `https://www.google.com/maps/search/?api=1&query=${destinationQuery}`;

  useEffect(() => {
    if (!containerRef.current) return;

    if (mapRef.current) {
      mapRef.current.remove();
      mapRef.current = null;
    }

    const map = L.map(containerRef.current, {
      center: [lat, lng],
      zoom: 15,
      scrollWheelZoom: false,
    });

    L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
      attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>',
      maxZoom: 19,
    }).addTo(map);

    const marker = L.marker([lat, lng], {
      icon: createCustomPinIcon(),
    }).addTo(map);

    if (venueName || address) {
      marker.bindPopup(
        `<div style="font-family:sans-serif;font-size:12px;line-height:1.4;">
          <strong>${venueName || 'Lokasi Event'}</strong><br/>
          <span>${address || city || ''}</span>
        </div>`
      );
    }

    mapRef.current = map;

    setTimeout(() => {
      map.invalidateSize();
    }, 150);

    return () => {
      map.remove();
      mapRef.current = null;
    };
  }, [lat, lng, venueName, address, city]);

  return (
    <div className="mt-4 space-y-3">
      <div className="overflow-hidden rounded-xl border border-slate-200 bg-slate-100 shadow-xs">
        <div ref={containerRef} className="h-64 w-full z-0" />
      </div>

      <div className="flex flex-wrap items-center justify-between gap-3 rounded-xl border border-slate-200 bg-slate-50 px-4 py-3">
        <div className="text-xs text-slate-600">
          <p className="font-semibold text-slate-900">{venueName || 'Lokasi Offline Event'}</p>
          <p className="text-slate-500">
            {address}
            {city ? `, ${city}` : ''} ({lat.toFixed(5)}, {lng.toFixed(5)})
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          <a
            href={googleMapsDirectionsUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-2 rounded-lg bg-indigo-600 px-3.5 py-2 text-xs font-semibold text-white shadow-xs transition hover:bg-indigo-700"
          >
            <Navigation className="h-3.5 w-3.5" />
            Petunjuk Arah (Google Maps)
          </a>
          <a
            href={googleMapsPlaceUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-1.5 rounded-lg border border-slate-200 bg-white px-3 py-2 text-xs font-medium text-slate-700 transition hover:bg-slate-100"
          >
            <ExternalLink className="h-3.5 w-3.5" />
            Buka Peta
          </a>
        </div>
      </div>
    </div>
  );
};
