'use client';

import React, { useEffect, useRef, useState } from 'react';
import maplibregl from 'maplibre-gl';
import 'maplibre-gl/dist/maplibre-gl.css';
import { TravelStop } from '@/types/epilog';
import { Layers, MapPin, ZoomIn, ZoomOut, Compass, Navigation, LocateFixed } from 'lucide-react';
import { getMapUrl } from '@/lib/utils';

interface MapCanvasProps {
  stops: TravelStop[];
  activeStopId: string | null;
  hoveredStopId: string | null;
  onSelectStop: (stopId: string) => void;
  onHoverStop?: (stopId: string | null) => void;
  className?: string;
}

type MapStyleKey = 'voyager' | 'positron' | 'dark' | 'satellite';

const MAP_STYLES: Record<MapStyleKey, { name: string; style: any }> = {
  voyager: {
    name: 'Editorial Street',
    style: {
      version: 8,
      sources: {
        'carto-voyager': {
          type: 'raster',
          tiles: [
            'https://a.basemaps.cartocdn.com/rastertiles/voyager/{z}/{x}/{y}@2x.png',
            'https://b.basemaps.cartocdn.com/rastertiles/voyager/{z}/{x}/{y}@2x.png',
            'https://c.basemaps.cartocdn.com/rastertiles/voyager/{z}/{x}/{y}@2x.png',
            'https://d.basemaps.cartocdn.com/rastertiles/voyager/{z}/{x}/{y}@2x.png',
          ],
          tileSize: 256,
          maxzoom: 20,
          attribution: '© OpenStreetMap contributors, © CARTO',
        },
      },
      layers: [
        {
          id: 'carto-voyager-layer',
          type: 'raster',
          source: 'carto-voyager',
          minzoom: 0,
          maxzoom: 22,
        },
      ],
    },
  },
  dark: {
    name: 'Midnight Dark',
    style: {
      version: 8,
      sources: {
        'carto-dark': {
          type: 'raster',
          tiles: [
            'https://a.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}@2x.png',
            'https://b.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}@2x.png',
            'https://c.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}@2x.png',
            'https://d.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}@2x.png',
          ],
          tileSize: 256,
          maxzoom: 20,
          attribution: '© OpenStreetMap contributors, © CARTO',
        },
      },
      layers: [
        {
          id: 'carto-dark-layer',
          type: 'raster',
          source: 'carto-dark',
          minzoom: 0,
          maxzoom: 22,
        },
      ],
    },
  },
  positron: {
    name: 'Minimal Light',
    style: {
      version: 8,
      sources: {
        'carto-light': {
          type: 'raster',
          tiles: [
            'https://a.basemaps.cartocdn.com/light_all/{z}/{x}/{y}@2x.png',
            'https://b.basemaps.cartocdn.com/light_all/{z}/{x}/{y}@2x.png',
            'https://c.basemaps.cartocdn.com/light_all/{z}/{x}/{y}@2x.png',
            'https://d.basemaps.cartocdn.com/light_all/{z}/{x}/{y}@2x.png',
          ],
          tileSize: 256,
          maxzoom: 20,
          attribution: '© OpenStreetMap contributors, © CARTO',
        },
      },
      layers: [
        {
          id: 'carto-light-layer',
          type: 'raster',
          source: 'carto-light',
          minzoom: 0,
          maxzoom: 22,
        },
      ],
    },
  },
  satellite: {
    name: 'Satellite Topo',
    style: {
      version: 8,
      sources: {
        'esri-sat': {
          type: 'raster',
          tiles: [
            'https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}',
          ],
          tileSize: 256,
          maxzoom: 19,
          attribution: '© Esri, Maxar, Earthstar Geographics',
        },
      },
      layers: [
        {
          id: 'esri-sat-layer',
          type: 'raster',
          source: 'esri-sat',
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
  const [activeStyle, setActiveStyle] = useState<MapStyleKey>('voyager');
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

    return () => {
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
          'line-color': '#ea580c',
          'line-width': 8,
          'line-opacity': 0.25,
          'line-blur': 4,
        },
      });

      // Main route polyline with dashed travel flow
      map.addLayer({
        id: 'route-main',
        type: 'line',
        source: 'route-line',
        layout: {
          'line-join': 'round',
          'line-cap': 'round',
        },
        paint: {
          'line-color': '#f97316',
          'line-width': 3.5,
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
        'flex items-center justify-center w-8 h-8 rounded-full font-bold text-xs shadow-lg transition-all duration-300 border-2 border-white bg-amber-600 text-white';
      inner.innerText = String(stop.stopIndex);
      el.appendChild(inner);

      // Pulse ring element for active state
      const pulse = document.createElement('div');
      pulse.className = 'absolute -inset-1.5 rounded-full bg-orange-500/30 -z-10 hidden pulse-ring-el';
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
        `<div class="p-2.5 max-w-[220px] text-xs space-y-1.5">
          <div class="font-bold text-gray-900 truncate">Stop ${stop.stopIndex}: ${stop.poiName}</div>
          <div class="text-gray-500 text-[11px]">${stop.photos.length} photos &bull; ${stop.reflection.category}</div>
          <div class="pt-1.5 border-t border-gray-200/80 flex items-center justify-between">
            <span class="text-[10px] text-gray-400 font-mono">${stop.centerCoords.lat.toFixed(4)}, ${stop.centerCoords.lng.toFixed(4)}</span>
            <a href="${mapUrl}" target="_blank" rel="noopener noreferrer" class="text-[11px] font-bold text-orange-600 hover:text-orange-700 underline underline-offset-2 flex items-center gap-0.5" onclick="event.stopPropagation()">Open in Maps ↗</a>
          </div>
        </div>`
      );

      el.addEventListener('mouseenter', () => {
        popup.setLngLat([stop.centerCoords.lng, stop.centerCoords.lat]).addTo(map);
        onHoverStop?.(stop.id);
      });

      el.addEventListener('mouseleave', () => {
        popup.remove();
        onHoverStop?.(null);
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
          'flex items-center justify-center w-9 h-9 rounded-full font-bold text-sm shadow-2xl border-2 border-white bg-orange-600 text-white ring-4 ring-orange-400/40';
        if (pulse) pulse.classList.remove('hidden');
      } else if (isHovered) {
        inner.className =
          'flex items-center justify-center w-8 h-8 rounded-full font-bold text-xs shadow-xl border-2 border-white bg-orange-500 text-white ring-2 ring-orange-300';
        if (pulse) pulse.classList.add('hidden');
      } else {
        inner.className =
          'flex items-center justify-center w-8 h-8 rounded-full font-bold text-xs shadow-md border-2 border-white bg-stone-800 text-stone-100 hover:bg-orange-600';
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
            className="flex items-center gap-2 px-3.5 py-2 rounded-xl bg-white/95 dark:bg-stone-900/95 backdrop-blur-md shadow-lg border border-stone-200/80 dark:border-stone-800 text-xs font-semibold text-stone-800 dark:text-stone-200 hover:bg-stone-50 transition-all"
            title="Switch Map Style"
          >
            <Layers className="w-3.5 h-3.5 text-orange-600" />
            <span>{MAP_STYLES[activeStyle].name}</span>
          </button>

          {styleMenuOpen && (
            <div className="absolute top-full left-0 mt-2 w-48 rounded-xl bg-white dark:bg-stone-900 shadow-2xl border border-stone-200 dark:border-stone-800 py-1.5 z-30 animate-in fade-in slide-in-from-top-2 duration-150">
              {(Object.keys(MAP_STYLES) as MapStyleKey[]).map((key) => (
                <button
                  key={key}
                  onClick={() => handleStyleChange(key)}
                  className={`w-full text-left px-3.5 py-2 text-xs flex items-center justify-between transition-colors ${
                    activeStyle === key
                      ? 'bg-orange-50 dark:bg-orange-950/40 text-orange-600 font-bold'
                      : 'text-stone-700 dark:text-stone-300 hover:bg-stone-100 dark:hover:bg-stone-800'
                  }`}
                >
                  <span>{MAP_STYLES[key].name}</span>
                  {activeStyle === key && <span className="w-1.5 h-1.5 rounded-full bg-orange-600" />}
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
          className={`p-2.5 rounded-xl backdrop-blur-md shadow-lg border text-xs transition-all ${
            autoPanEnabled
              ? 'bg-orange-600 text-white border-orange-500 shadow-orange-600/20'
              : 'bg-white/95 dark:bg-stone-900/95 border-stone-200/80 dark:border-stone-800 text-stone-400 hover:text-stone-700 dark:hover:text-stone-200'
          }`}
          title={autoPanEnabled ? 'Auto-pan camera enabled (click to lock camera)' : 'Auto-pan camera disabled (click to follow timeline)'}
        >
          <LocateFixed className="w-4 h-4" />
        </button>

        <button
          onClick={() => mapRef.current?.zoomIn()}
          className="p-2.5 rounded-xl bg-white/95 dark:bg-stone-900/95 backdrop-blur-md shadow-lg border border-stone-200/80 dark:border-stone-800 text-stone-700 dark:text-stone-300 hover:text-orange-600 hover:bg-stone-50 transition-all"
          title="Zoom In"
        >
          <ZoomIn className="w-4 h-4" />
        </button>
        <button
          onClick={() => mapRef.current?.zoomOut()}
          className="p-2.5 rounded-xl bg-white/95 dark:bg-stone-900/95 backdrop-blur-md shadow-lg border border-stone-200/80 dark:border-stone-800 text-stone-700 dark:text-stone-300 hover:text-orange-600 hover:bg-stone-50 transition-all"
          title="Zoom Out"
        >
          <ZoomOut className="w-4 h-4" />
        </button>
        <button
          onClick={() => {
            if (mapRef.current) fitToStops(mapRef.current, stops);
          }}
          className="p-2.5 rounded-xl bg-white/95 dark:bg-stone-900/95 backdrop-blur-md shadow-lg border border-stone-200/80 dark:border-stone-800 text-stone-700 dark:text-stone-300 hover:text-orange-600 hover:bg-stone-50 transition-all"
          title="Fit All Stops"
        >
          <Compass className="w-4 h-4" />
        </button>
      </div>
    </div>
  );
};
