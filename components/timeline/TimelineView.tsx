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
      {/* Trip Header Banner */}
      <div className="p-6 rounded-3xl bg-gradient-to-br from-stone-900 to-stone-800 text-white shadow-xl space-y-4">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div className="flex items-center gap-2 px-3 py-1 rounded-full bg-white/10 backdrop-blur-md text-xs font-semibold text-orange-300">
            <Compass className="w-3.5 h-3.5 text-orange-400" />
            <span>Spatiotemporal Journey</span>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={onSynthesizeAllStops}
              disabled={isSynthesizingAll || trip.stops.length === 0}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-orange-600 hover:bg-orange-500 text-white text-xs font-bold shadow-md transition-all disabled:opacity-50"
            >
              <Sparkles className={`w-3.5 h-3.5 ${isSynthesizingAll ? 'animate-spin' : ''}`} />
              <span>{isSynthesizingAll ? 'Synthesizing All...' : 'Synthesize All Stops'}</span>
            </button>
          </div>
        </div>

        <div>
          <h1 className="text-2xl sm:text-3xl font-serif font-bold tracking-tight text-stone-100">
            {trip.title}
          </h1>
          <p className="text-xs sm:text-sm text-stone-300 mt-1 flex items-center gap-2">
            <Calendar className="w-3.5 h-3.5 text-stone-400" />
            <span>{formatDateRange(trip.dateRange.start, trip.dateRange.end)}</span>
          </p>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5 pt-2 border-t border-white/10 text-xs">
          <div className="p-2.5 rounded-xl bg-white/5 backdrop-blur-sm">
            <div className="text-stone-400 text-[11px]">Travel Stops</div>
            <div className="text-lg font-bold text-white mt-0.5">{trip.stops.length}</div>
          </div>
          <div className="p-2.5 rounded-xl bg-white/5 backdrop-blur-sm">
            <div className="text-stone-400 text-[11px] flex items-center gap-1">
              <Route className="w-3 h-3 text-orange-400" />
              <span>Total Distance</span>
            </div>
            <div className="text-lg font-bold text-white mt-0.5">{trip.totalDistanceKm} km</div>
          </div>
          <div className="p-2.5 rounded-xl bg-white/5 backdrop-blur-sm">
            <div className="text-stone-400 text-[11px] flex items-center gap-1">
              <Smartphone className="w-3 h-3 text-emerald-400" />
              <span>GPS Anchors</span>
            </div>
            <div className="text-lg font-bold text-emerald-300 mt-0.5">{anchorPhotos.length}</div>
          </div>
          <div className="p-2.5 rounded-xl bg-white/5 backdrop-blur-sm">
            <div className="text-stone-400 text-[11px] flex items-center gap-1">
              <Camera className="w-3 h-3 text-amber-400" />
              <span>DSLR Orphans</span>
            </div>
            <div className="text-lg font-bold text-amber-300 mt-0.5">{orphanPhotos.length}</div>
          </div>
        </div>
      </div>

      {/* Filter & Search Bar */}
      <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3">
        {/* Category Tabs */}
        <div className="flex items-center gap-1 p-1 rounded-xl bg-stone-100 dark:bg-stone-800 text-xs font-semibold overflow-x-auto">
          {['all', 'Architectural', 'Culinary', 'Natural', 'Cultural'].map((cat) => (
            <button
              key={cat}
              onClick={() => setCategoryFilter(cat)}
              className={`px-3 py-1.5 rounded-lg whitespace-nowrap transition-all ${
                categoryFilter === cat
                  ? 'bg-white dark:bg-stone-900 text-orange-600 shadow-sm font-bold'
                  : 'text-stone-600 dark:text-stone-400 hover:text-stone-900 dark:hover:text-stone-100'
              }`}
            >
              {cat === 'all' ? 'All Stops' : cat}
            </button>
          ))}
        </div>

        {/* Search Input */}
        <div className="relative">
          <Search className="w-4 h-4 text-stone-400 absolute left-3 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            placeholder="Search stops or cities..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full sm:w-56 pl-9 pr-3 py-1.5 text-xs rounded-xl bg-stone-100 dark:bg-stone-800 border-none focus:ring-2 focus:ring-orange-500 text-stone-900 dark:text-stone-100 placeholder-stone-400"
          />
        </div>
      </div>

      {/* Stops Timeline List */}
      {filteredStops.length > 0 ? (
        <div className="space-y-6 relative before:absolute before:top-4 before:bottom-4 before:left-7 sm:before:left-8 before:w-0.5 before:bg-stone-200 dark:before:bg-stone-800 before:-z-0">
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
        <div className="py-16 text-center rounded-2xl border-2 border-dashed border-stone-200 dark:border-stone-800 space-y-3">
          <Camera className="w-10 h-10 text-stone-300 mx-auto" />
          <div className="text-sm font-semibold text-stone-700 dark:text-stone-300">
            No stops match your filter
          </div>
          <p className="text-xs text-stone-500 max-w-xs mx-auto">
            Try resetting your category search, or upload new travel photos to create stops automatically.
          </p>
          <button
            onClick={onOpenUploadModal}
            className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-orange-600 text-white text-xs font-bold hover:bg-orange-700 shadow-md transition-all"
          >
            <Plus className="w-3.5 h-3.5" />
            <span>Upload Photo Batch</span>
          </button>
        </div>
      )}
    </div>
  );
};
