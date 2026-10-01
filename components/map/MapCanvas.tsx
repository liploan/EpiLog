'use client';

import React, { useEffect, useRef, useState } from 'react';
import maplibregl from 'maplibre-gl';
import 'maplibre-gl/dist/maplibre-gl.css';
import { TravelStop } from '@/types/epilog';
import { Layers, MapPin, ZoomIn, ZoomOut, Compass, Navigation, LocateFixed } from 'lucide-react';
import { getMapUrl } from '@/lib/utils';

function escapeHtml(str: string): string {
  return str.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;').replace(/'/g, '&#039;');
}

interface MapCanvasProps {
  stops: TravelStop[];
  activeStopId: string | null;
  hoveredStopId: string | null;
  onSelectStop: (stopId: string) => void;
  onHoverStop?: (stopId: string | null) => void;
  className?: string;
}

type MapStyleKey = 'hot' | 'osm' | 'detailed' | 'topo';

const MAP_STYLES: Record<MapStyleKey, { name: string; style: any }> = {
  hot: {
    name: 'Atelier Pastel (HOT)',
    style: {
      version: 8,
      sources: {
        'osm-hot': {
          type: 'raster',
          tiles: [
            'https://a.tile.openstreetmap.fr/hot/{z}/{x}/{y}.png',
            'https://b.tile.openstreetmap.fr/hot/{z}/{x}/{y}.png',
            'https://c.tile.openstreetmap.fr/hot/{z}/{x}/{y}.png',
          ],
          tileSize: 256,
          maxzoom: 19,
          attribution: '© OpenStreetMap contributors, Tiles style by Humanitarian OpenStreetMap Team',
        },
      },
      layers: [
        {
          id: 'osm-hot-layer',
          type: 'raster',
          source: 'osm-hot',
          minzoom: 0,
          maxzoom: 22,
        },
      ],
    },
  },
  osm: {
    name: 'OpenStreetMap Standard',
    style: {
      version: 8,
      sources: {
        'osm-tiles': {
          type: 'raster',
          tiles: ['https://tile.openstreetmap.org/{z}/{x}/{y}.png'],
          tileSize: 256,
          maxzoom: 19,
          attribution: '© OpenStreetMap contributors',
        },
      },
      layers: [
        {
          id: 'osm-tiles-layer',
          type: 'raster',
          source: 'osm-tiles',
          minzoom: 0,
          maxzoom: 22,
        },
      ],
    },
  },
  detailed: {
    name: 'Cartographic Detailed',
    style: {
      version: 8,
      sources: {
        'osm-detailed': {
          type: 'raster',
          tiles: [
            'https://a.tile.openstreetmap.fr/osmfr/{z}/{x}/{y}.png',
            'https://b.tile.openstreetmap.fr/osmfr/{z}/{x}/{y}.png',
            'https://c.tile.openstreetmap.fr/osmfr/{z}/{x}/{y}.png',
          ],
          tileSize: 256,
          maxzoom: 19,
          attribution: '© OpenStreetMap contributors, OpenStreetMap France',
        },
      },
      layers: [
        {
          id: 'osm-detailed-layer',
          type: 'raster',
          source: 'osm-detailed',
          minzoom: 0,
          maxzoom: 22,
        },
      ],
    },
  },
  topo: {
    name: 'Topographic Relief',
    style: {
      version: 8,
      sources: {
        'opentopomap': {
          type: 'raster',
          tiles: [
            'https://a.tile.opentopomap.org/{z}/{x}/{y}.png',
            'https://b.tile.opentopomap.org/{z}/{x}/{y}.png',
            'https://c.tile.opentopomap.org/{z}/{x}/{y}.png',
          ],
          tileSize: 256,
          maxzoom: 17,
          attribution: '© OpenStreetMap contributors, SRTM | OpenTopoMap',
        },
      },
      layers: [
        {
          id: 'opentopomap-layer',
          type: 'raster',
          source: 'opentopomap',
          minzoom: 0,
          maxzoom: 22,
        },
      ],
    },
  },
};

export const MapCanvas: React.FC<MapCanvasProps> = ({
  stops,
  activeStopId,
  hoveredStopId,
  onSelectStop,
  onHoverStop,
  className = '',
}) => {
  const mapContainer = useRef<HTMLDivElement>(null);
  const mapRef = useRef<maplibregl.Map | null>(null);
  const markersRef = useRef<Map<string, { marker: maplibregl.Marker; el: HTMLDivElement }>>(new Map());
  const hasInitialFitted = useRef(false);
  const [activeStyle, setActiveStyle] = useState<MapStyleKey>('hot');
  const [styleMenuOpen, setStyleMenuOpen] = useState(false);
  const [autoPanEnabled, setAutoPanEnabled] = useState(true);

  // Initialize Map
  useEffect(() => {
    if (!mapContainer.current || mapRef.current) return;

    const initialCenter: [number, number] = stops.length > 0
      ? [stops[0].centerCoords.lng, stops[0].centerCoords.lat]
      : [135.7681, 35.0116]; // Kyoto fallback

    const map = new maplibregl.Map({
      container: mapContainer.current,
      style: MAP_STYLES[activeStyle].style,
      center: initialCenter,
      zoom: 13,
      pitch: 20,
      maxZoom: 22,
      minZoom: 2,
      attributionControl: false,
    });

    map.addControl(new maplibregl.AttributionControl({ compact: true }), 'bottom-right');

    map.on('load', () => {
      mapRef.current = map;
      updateRouteLayer(map, stops);
      updateMarkers(map, stops);
      if (!hasInitialFitted.current && stops.length > 0) {
        fitToStops(map, stops);
        hasInitialFitted.current = true;
      }
    });

    const resizeObserver = new ResizeObserver(() => { map.resize(); });
    if (mapContainer.current) {
      resizeObserver.observe(mapContainer.current);
    }

    return () => {
      resizeObserver.disconnect();
      markersRef.current.forEach(({ marker }) => marker.remove());
      markersRef.current.clear();
      map.remove();
      mapRef.current = null;
    };
  }, []);

  // Change Basemap Style
  const handleStyleChange = (styleKey: MapStyleKey) => {
    setActiveStyle(styleKey);
    setStyleMenuOpen(false);
    if (!mapRef.current) return;

    mapRef.current.setStyle(MAP_STYLES[styleKey].style);
    mapRef.current.once('style.load', () => {
      if (mapRef.current) {
        updateRouteLayer(mapRef.current, stops);
      }
    });
  };

  // Update Route Polyline Layer
  const updateRouteLayer = (map: maplibregl.Map, currentStops: TravelStop[]) => {
    if (currentStops.length < 2) {
      if (map.getSource('route-line')) {
        (map.getSource('route-line') as maplibregl.GeoJSONSource).setData({
          type: 'FeatureCollection',
          features: [],
        });
      }
      return;
    }

    const coordinates = currentStops.map((s) => [s.centerCoords.lng, s.centerCoords.lat]);

    const routeGeoJson: GeoJSON.FeatureCollection<GeoJSON.LineString> = {
      type: 'FeatureCollection',
      features: [
        {
          type: 'Feature',
          properties: {},
          geometry: {
            type: 'LineString',
            coordinates: coordinates,
          },
        },
      ],
    };

    if (map.getSource('route-line')) {
      (map.getSource('route-line') as maplibregl.GeoJSONSource).setData(routeGeoJson);
    } else {
      map.addSource('route-line', {
        type: 'geojson',
        data: routeGeoJson,
      });

      // Shadow glow layer
      map.addLayer({
        id: 'route-glow',
        type: 'line',
        source: 'route-line',
        layout: {
          'line-join': 'round',
          'line-cap': 'round',
        },
        paint: {
          'line-color': '#933e1a',
          'line-width': 8,
          'line-opacity': 0.2,
          'line-blur': 4,
        },
      });

      // Main route polyline with refined dashed travel trajectory
      map.addLayer({
        id: 'route-main',
        type: 'line',
        source: 'route-line',
        layout: {
          'line-join': 'round',
          'line-cap': 'round',
        },
        paint: {
          'line-color': '#b85429',
          'line-width': 3,
          'line-dasharray': [2, 1.5],
        },
      });
    }
  };

  // Update Markers
  const updateMarkers = (map: maplibregl.Map, currentStops: TravelStop[]) => {
    // Remove existing markers
    markersRef.current.forEach(({ marker }) => marker.remove());
    markersRef.current.clear();

    currentStops.forEach((stop) => {
      const el = document.createElement('div');
      el.className = 'custom-pin-marker cursor-pointer select-none';
      el.dataset.stopId = stop.id;

      const inner = document.createElement('div');
      inner.className =
        'flex items-center justify-center w-8 h-8 rounded-full font-serif font-bold text-xs shadow-editorial transition-all duration-300 border-2 border-white bg-[#2a2420] text-[#faf7f2]';
      inner.innerText = `0${stop.stopIndex}`;
      el.appendChild(inner);

      // Pulse ring element for active state
      const pulse = document.createElement('div');
      pulse.className = 'absolute -inset-1.5 rounded-full bg-atelier-terracotta/25 -z-10 hidden pulse-ring-el';
      el.appendChild(pulse);

      // Tooltip preview with direct Map link
      const mapUrl = getMapUrl(
        stop.centerCoords.lat,
        stop.centerCoords.lng,
        stop.exactVenueName || stop.poiName
      );

      const popup = new maplibregl.Popup({
        offset: 20,
        closeButton: false,
        closeOnClick: false,
        className: 'epilog-pin-popup',
      }).setHTML(
        `<div class="p-3 max-w-[230px] text-xs space-y-1.5 bg-[#FAF7F2] text-[#1C1917] font-sans rounded-xl">
          <div class="font-serif font-bold text-sm text-[#1C1917] truncate">Stop 0${stop.stopIndex}: ${escapeHtml(stop.poiName)}</div>
          <div class="text-[#57534E] text-[11px] font-medium">${stop.photos.length} photos &bull; ${escapeHtml(stop.reflection.category)}</div>
          <div class="pt-1.5 border-t border-[#E7DED1] flex items-center justify-between">
            <span class="text-[10px] text-[#8C827A] font-mono">${stop.centerCoords.lat.toFixed(4)}, ${stop.centerCoords.lng.toFixed(4)}</span>
            <a href="${mapUrl}" target="_blank" rel="noopener noreferrer" class="text-[11px] font-semibold text-[#B85429] hover:underline flex items-center gap-0.5" onclick="event.stopPropagation()">Open in Maps ↗</a>
          </div>
        </div>`
      );

      let popupTimeout: NodeJS.Timeout;

      el.addEventListener('mouseenter', () => {
        clearTimeout(popupTimeout);
        popup.setLngLat([stop.centerCoords.lng, stop.centerCoords.lat]).addTo(map);
        onHoverStop?.(stop.id);

        const popupEl = popup.getElement();
        if (popupEl) {
          popupEl.addEventListener('mouseenter', () => clearTimeout(popupTimeout));
          popupEl.addEventListener('mouseleave', () => {
            popupTimeout = setTimeout(() => {
              popup.remove();
              onHoverStop?.(null);
            }, 200);
          });
        }
      });

      el.addEventListener('mouseleave', () => {
        popupTimeout = setTimeout(() => {
          popup.remove();
          onHoverStop?.(null);
        }, 200);
      });

      el.addEventListener('click', (e) => {
        e.stopPropagation();
        onSelectStop(stop.id);
      });

      const marker = new maplibregl.Marker({ element: el })
        .setLngLat([stop.centerCoords.lng, stop.centerCoords.lat])
        .addTo(map);

      markersRef.current.set(stop.id, { marker, el });
    });
  };

  // Fit bounds to all stops (called on user request or initial load)
  const fitToStops = (map: maplibregl.Map, currentStops: TravelStop[]) => {
    if (currentStops.length === 0) return;
    if (currentStops.length === 1) {
      map.easeTo({
        center: [currentStops[0].centerCoords.lng, currentStops[0].centerCoords.lat],
        zoom: 14,
        duration: 800,
      });
      return;
    }

    const bounds = new maplibregl.LngLatBounds();
    currentStops.forEach((s) => bounds.extend([s.centerCoords.lng, s.centerCoords.lat]));
    map.fitBounds(bounds, {
      padding: { top: 70, bottom: 70, left: 70, right: 70 },
      maxZoom: 15,
      duration: 800,
    });
  };

  // Sync Stop changes without forcing disorienting zoom jumps
  useEffect(() => {
    if (!mapRef.current) return;
    updateRouteLayer(mapRef.current, stops);
    updateMarkers(mapRef.current, stops);
  }, [stops]);

  // Sync Active / Hovered Markers
  useEffect(() => {
    markersRef.current.forEach(({ el }, stopId) => {
      const inner = el.querySelector('div') as HTMLElement;
      const pulse = el.querySelector('.pulse-ring-el') as HTMLElement;
      const isActive = stopId === activeStopId;
      const isHovered = stopId === hoveredStopId;

      el.classList.toggle('active', isActive);
      el.classList.toggle('hovered', isHovered);

      if (isActive) {
        inner.className =
          'flex items-center justify-center w-9 h-9 rounded-full font-serif font-bold text-sm shadow-monograph border-2 border-white bg-atelier-terracotta text-white ring-4 ring-atelier-terracotta/30';
        if (pulse) pulse.classList.remove('hidden');
      } else if (isHovered) {
        inner.className =
          'flex items-center justify-center w-8 h-8 rounded-full font-serif font-bold text-xs shadow-editorial border-2 border-white bg-atelier-terracotta-light text-white ring-2 ring-atelier-terracotta/40';
        if (pulse) pulse.classList.add('hidden');
      } else {
        inner.className =
          'flex items-center justify-center w-8 h-8 rounded-full font-serif font-bold text-xs shadow-subtle border-2 border-white bg-[#2a2420] text-[#faf7f2] hover:bg-atelier-terracotta';
        if (pulse) pulse.classList.add('hidden');
      }
    });

    // Smoothly pan to the selected stop without altering the user's chosen zoom level
    if (activeStopId && mapRef.current && autoPanEnabled) {
      const target = stops.find((s) => s.id === activeStopId);
      if (target) {
        mapRef.current.easeTo({
          center: [target.centerCoords.lng, target.centerCoords.lat],
          duration: 600,
          essential: true,
        });
      }
    }
  }, [activeStopId, hoveredStopId, stops, autoPanEnabled]);

  return (
    <div className={`relative w-full h-full overflow-hidden ${className}`}>
      {/* Map Container */}
      <div ref={mapContainer} className="w-full h-full" />

      {/* Floating Basemap Switcher */}
      <div className="absolute top-4 left-4 z-20">
        <div className="relative">
          <button
            onClick={() => setStyleMenuOpen(!styleMenuOpen)}
            className="flex items-center gap-2 px-3.5 py-2 rounded-2xl bg-[#FAF7F2]/95 dark:bg-[#1e1914]/95 backdrop-blur-md shadow-editorial border border-sand-300/80 dark:border-sand-800 text-xs font-semibold text-sand-900 dark:text-sand-100 hover:bg-white transition-all"
            title="Switch Map Style"
          >
            <Layers className="w-3.5 h-3.5 text-atelier-terracotta" />
            <span className="font-serif">{MAP_STYLES[activeStyle].name}</span>
          </button>

          {styleMenuOpen && (
            <div className="absolute top-full left-0 mt-2 w-48 rounded-2xl bg-[#FAF7F2] dark:bg-[#1e1914] shadow-monograph border border-sand-300/80 dark:border-sand-800 py-2 z-30 animate-in fade-in slide-in-from-top-2 duration-150">
              {(Object.keys(MAP_STYLES) as MapStyleKey[]).map((key) => (
                <button
                  key={key}
                  onClick={() => handleStyleChange(key)}
                  className={`w-full text-left px-3.5 py-2 text-xs flex items-center justify-between transition-colors ${
                    activeStyle === key
                      ? 'bg-sand-200/80 dark:bg-sand-800/80 text-atelier-terracotta font-bold'
                      : 'text-sand-700 dark:text-sand-300 hover:bg-sand-200/40 dark:hover:bg-sand-800/40'
                  }`}
                >
                  <span className="font-serif">{MAP_STYLES[key].name}</span>
                  {activeStyle === key && <span className="w-1.5 h-1.5 rounded-full bg-atelier-terracotta" />}
                </button>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Floating Controls */}
      <div className="absolute bottom-6 right-4 z-20 flex flex-col gap-2">
        {/* Toggle Auto-Pan Tracking */}
        <button
          onClick={() => setAutoPanEnabled(!autoPanEnabled)}
          className={`p-2.5 rounded-2xl backdrop-blur-md shadow-editorial border text-xs transition-all ${
            autoPanEnabled
              ? 'bg-atelier-terracotta text-white border-atelier-terracotta shadow-atelier-terracotta/25'
              : 'bg-[#FAF7F2]/95 dark:bg-[#1e1914]/95 border-sand-300/80 dark:border-sand-800 text-sand-500 hover:text-sand-900 dark:hover:text-sand-100'
          }`}
          title={autoPanEnabled ? 'Auto-pan camera enabled (click to lock camera)' : 'Auto-pan camera disabled (click to follow timeline)'}
        >
          <LocateFixed className="w-4 h-4" />
        </button>

        <button
          onClick={() => mapRef.current?.zoomIn()}
          className="p-2.5 rounded-2xl bg-[#FAF7F2]/95 dark:bg-[#1e1914]/95 backdrop-blur-md shadow-editorial border border-sand-300/80 dark:border-sand-800 text-sand-800 dark:text-sand-200 hover:text-atelier-terracotta hover:bg-white transition-all"
          title="Zoom In"
        >
          <ZoomIn className="w-4 h-4" />
        </button>
        <button
          onClick={() => mapRef.current?.zoomOut()}
          className="p-2.5 rounded-2xl bg-[#FAF7F2]/95 dark:bg-[#1e1914]/95 backdrop-blur-md shadow-editorial border border-sand-300/80 dark:border-sand-800 text-sand-800 dark:text-sand-200 hover:text-atelier-terracotta hover:bg-white transition-all"
          title="Zoom Out"
        >
          <ZoomOut className="w-4 h-4" />
        </button>
        <button
          onClick={() => {
            if (mapRef.current) fitToStops(mapRef.current, stops);
          }}
          className="p-2.5 rounded-2xl bg-[#FAF7F2]/95 dark:bg-[#1e1914]/95 backdrop-blur-md shadow-editorial border border-sand-300/80 dark:border-sand-800 text-sand-800 dark:text-sand-200 hover:text-atelier-terracotta hover:bg-white transition-all"
          title="Fit All Stops"
        >
          <Compass className="w-4 h-4" />
        </button>
      </div>
    </div>
  );
};
