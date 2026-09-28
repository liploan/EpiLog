'use client';

import React, { useState } from 'react';
import { EpiLogTrip, TravelStop, ReflectionCategory } from '@/types/epilog';
import { StopCard } from './StopCard';
import { formatDateRange } from '@/lib/utils';
import {
  Compass,
  Route,
  Camera,
  Smartphone,
  Sparkles,
  Calendar,
  Filter,
  Search,
  Plus,
} from 'lucide-react';

interface TimelineViewProps {
  trip: EpiLogTrip;
  activeStopId: string | null;
  hoveredStopId: string | null;
  onSelectStop: (stopId: string) => void;
  onHoverStop: (stopId: string | null) => void;
  onOpenSocialModal: (stop: TravelStop) => void;
  onSynthesizeStop: (stop: TravelStop) => Promise<void>;
  onSynthesizeAllStops: () => Promise<void>;
  onUpdateStop: (updated: TravelStop) => void;
  onOpenUploadModal: () => void;
  onSelectSampleTrip?: (tripKey: 'kyoto' | 'barcelona') => void;
  synthesizingStopId: string | null;
  isSynthesizingAll: boolean;
}

export const TimelineView: React.FC<TimelineViewProps> = ({
  trip,
  activeStopId,
  hoveredStopId,
  onSelectStop,
  onHoverStop,
  onOpenSocialModal,
  onSynthesizeStop,
  onSynthesizeAllStops,
  onUpdateStop,
  onOpenUploadModal,
  onSelectSampleTrip,
  synthesizingStopId,
  isSynthesizingAll,
}) => {
  const [categoryFilter, setCategoryFilter] = useState<string>('all');
  const [searchQuery, setSearchQuery] = useState('');

  const allPhotos = trip.stops.flatMap((s) => s.photos);
  const anchorPhotos = allPhotos.filter((p) => p.isAnchor);
  const orphanPhotos = allPhotos.filter((p) => !p.isAnchor);

  const filteredStops = trip.stops.filter((stop) => {
    if (categoryFilter !== 'all' && stop.reflection.category !== categoryFilter) {
      return false;
    }
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      const matchesPoi = stop.poiName.toLowerCase().includes(q);
      const matchesCity = stop.locationContext.city.toLowerCase().includes(q);
      const matchesCaption = stop.narrativeCaption.toLowerCase().includes(q);
      return matchesPoi || matchesCity || matchesCaption;
    }
    return true;
  });

  return (
    <div className="flex flex-col h-full overflow-y-auto px-4 sm:px-6 py-6 space-y-6">
      {/* Sample Journeys Switcher Bar */}
      {onSelectSampleTrip && (
        <div className="p-1 rounded-2xl bg-sand-200/60 dark:bg-sand-900 border border-sand-300/70 dark:border-sand-800 text-xs shadow-subtle">
          <div className="flex items-center gap-1">
            <button
              onClick={() => onSelectSampleTrip('kyoto')}
              className={`flex-1 flex items-center justify-center gap-1.5 py-2 px-2.5 rounded-xl font-medium transition-all ${
                trip.id !== 'trip-barcelona-2024'
                  ? 'bg-white dark:bg-sand-800 text-atelier-terracotta font-semibold shadow-subtle border border-sand-200/60 dark:border-sand-700/60'
                  : 'text-sand-600 dark:text-sand-400 hover:text-sand-900 dark:hover:text-sand-200 hover:bg-sand-200/50'
              }`}
            >
              <span>⛩️</span>
              <span className="truncate font-serif">Kyoto &amp; Higashiyama (5 Stops)</span>
            </button>
            <button
              onClick={() => onSelectSampleTrip('barcelona')}
              className={`flex-1 flex items-center justify-center gap-1.5 py-2 px-2.5 rounded-xl font-medium transition-all ${
                trip.id === 'trip-barcelona-2024'
                  ? 'bg-white dark:bg-sand-800 text-atelier-terracotta font-semibold shadow-subtle border border-sand-200/60 dark:border-sand-700/60'
                  : 'text-sand-600 dark:text-sand-400 hover:text-sand-900 dark:hover:text-sand-200 hover:bg-sand-200/50'
              }`}
            >
              <span>🇪🇸</span>
              <span className="truncate font-serif">Barcelona Modernisme (6 Stops)</span>
            </button>
          </div>
        </div>
      )}

      {/* Editorial Folio Masthead Banner */}
      <div className="p-6 sm:p-7 rounded-3xl bg-gradient-to-b from-[#f6efe4] to-[#ede3d4] dark:from-[#25201b] dark:to-[#1b1714] border border-sand-300/80 dark:border-sand-800/80 shadow-editorial space-y-4">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div className="flex items-center gap-2 px-3 py-1 rounded-full bg-white/60 dark:bg-sand-900/60 backdrop-blur-md text-[11px] font-semibold text-atelier-terracotta border border-sand-300/60 dark:border-sand-700/60 tracking-wide uppercase">
            <Compass className="w-3.5 h-3.5" />
            <span>Spatiotemporal Journal</span>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={onSynthesizeAllStops}
              disabled={isSynthesizingAll || trip.stops.length === 0}
              className="flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl bg-atelier-terracotta hover:bg-atelier-terracotta-dark text-white text-xs font-semibold shadow-subtle transition-all disabled:opacity-50 border border-atelier-terracotta-dark/20"
            >
              <Sparkles className={`w-3.5 h-3.5 ${isSynthesizingAll ? 'animate-spin' : ''}`} />
              <span>{isSynthesizingAll ? 'Synthesizing Journal...' : 'Synthesize All Stops'}</span>
            </button>
          </div>
        </div>

        <div>
          <h1 className="text-2xl sm:text-3xl font-serif font-bold tracking-tight text-sand-950 dark:text-sand-50 leading-tight">
            {trip.title}
          </h1>
          <p className="text-xs sm:text-sm text-sand-600 dark:text-sand-400 mt-1.5 flex items-center gap-2 font-serif italic">
            <Calendar className="w-3.5 h-3.5 text-atelier-terracotta" />
            <span>{formatDateRange(trip.dateRange.start, trip.dateRange.end)}</span>
          </p>
        </div>

        {/* Refined Archival Metadata Metrics */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 pt-3 border-t border-sand-300/60 dark:border-sand-800/60 text-xs">
          <div className="p-2.5 rounded-xl bg-white/60 dark:bg-sand-900/40 border border-sand-200/60 dark:border-sand-800/60">
            <div className="text-sand-500 text-[10.5px] uppercase tracking-wider font-semibold">Travel Stops</div>
            <div className="text-lg font-serif font-bold text-sand-900 dark:text-sand-100 mt-0.5">{trip.stops.length}</div>
          </div>
          <div className="p-2.5 rounded-xl bg-white/60 dark:bg-sand-900/40 border border-sand-200/60 dark:border-sand-800/60">
            <div className="text-sand-500 text-[10.5px] uppercase tracking-wider font-semibold flex items-center gap-1">
              <Route className="w-3 h-3 text-atelier-terracotta" />
              <span>Distance</span>
            </div>
            <div className="text-lg font-serif font-bold text-sand-900 dark:text-sand-100 mt-0.5">{trip.totalDistanceKm} km</div>
          </div>
          <div className="p-2.5 rounded-xl bg-white/60 dark:bg-sand-900/40 border border-sand-200/60 dark:border-sand-800/60">
            <div className="text-sand-500 text-[10.5px] uppercase tracking-wider font-semibold flex items-center gap-1">
              <Smartphone className="w-3 h-3 text-atelier-olive" />
              <span>GPS Anchors</span>
            </div>
            <div className="text-lg font-serif font-bold text-atelier-olive dark:text-emerald-400 mt-0.5">{anchorPhotos.length}</div>
          </div>
          <div className="p-2.5 rounded-xl bg-white/60 dark:bg-sand-900/40 border border-sand-200/60 dark:border-sand-800/60">
            <div className="text-sand-500 text-[10.5px] uppercase tracking-wider font-semibold flex items-center gap-1">
              <Camera className="w-3 h-3 text-atelier-ochre" />
              <span>DSLR Photos</span>
            </div>
            <div className="text-lg font-serif font-bold text-atelier-ochre dark:text-amber-400 mt-0.5">{orphanPhotos.length}</div>
          </div>
        </div>
      </div>

      {/* Filter & Search Bar */}
      <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3">
        {/* Category Tabs */}
        <div className="flex items-center gap-1 p-1 rounded-xl bg-sand-200/70 dark:bg-sand-900 border border-sand-300/60 dark:border-sand-800 text-xs font-medium overflow-x-auto">
          {['all', 'Architectural', 'Culinary', 'Natural', 'Cultural'].map((cat) => (
            <button
              key={cat}
              onClick={() => setCategoryFilter(cat)}
              className={`px-3 py-1.5 rounded-lg whitespace-nowrap transition-all ${
                categoryFilter === cat
                  ? 'bg-white dark:bg-sand-800 text-atelier-terracotta shadow-subtle font-semibold border border-sand-200/60 dark:border-sand-700/60'
                  : 'text-sand-600 dark:text-sand-400 hover:text-sand-950 dark:hover:text-sand-100'
              }`}
            >
              {cat === 'all' ? 'All Stops' : cat}
            </button>
          ))}
        </div>

        {/* Search Input */}
        <div className="relative">
          <Search className="w-3.5 h-3.5 text-sand-400 absolute left-3 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            placeholder="Search stops, cities, tags..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full sm:w-52 pl-8 pr-3 py-1.5 text-xs rounded-xl bg-white/80 dark:bg-sand-900 border border-sand-300/70 dark:border-sand-800 focus:outline-none focus:ring-1 focus:ring-atelier-terracotta text-sand-900 dark:text-sand-100 placeholder-sand-400 shadow-subtle"
          />
        </div>
      </div>

      {/* Stops Timeline List */}
      {filteredStops.length > 0 ? (
        <div className="space-y-6 relative before:absolute before:top-4 before:bottom-4 before:left-7 sm:before:left-8 before:w-[2px] before:bg-sand-300/80 dark:before:bg-sand-800 before:-z-0">
          {filteredStops.map((stop) => (
            <StopCard
              key={stop.id}
              stop={stop}
              isActive={stop.id === activeStopId}
              isHovered={stop.id === hoveredStopId}
              onSelect={() => onSelectStop(stop.id)}
              onMouseEnter={() => onHoverStop(stop.id)}
              onMouseLeave={() => onHoverStop(null)}
              onOpenSocialModal={onOpenSocialModal}
              onSynthesizeStop={onSynthesizeStop}
              onUpdateStop={onUpdateStop}
              isSynthesizing={synthesizingStopId === stop.id || isSynthesizingAll}
            />
          ))}
        </div>
      ) : (
        <div className="py-16 text-center rounded-3xl border-2 border-dashed border-sand-300 dark:border-sand-800 bg-sand-50/50 dark:bg-sand-900/30 space-y-3">
          <Camera className="w-10 h-10 text-sand-400 mx-auto stroke-[1.5]" />
          <div className="text-sm font-serif font-bold text-sand-800 dark:text-sand-200">
            No stops match your filter
          </div>
          <p className="text-xs text-sand-500 max-w-xs mx-auto">
            Try resetting your category search, or upload new travel photos to create stops automatically.
          </p>
          <button
            onClick={onOpenUploadModal}
            className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-atelier-terracotta text-white text-xs font-semibold hover:bg-atelier-terracotta-dark shadow-subtle transition-all"
          >
            <Plus className="w-3.5 h-3.5" />
            <span>Upload Photo Batch</span>
          </button>
        </div>
      )}
    </div>
  );
};
