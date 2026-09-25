'use client';

import React, { useState } from 'react';
import { TravelStop, PhotoAsset, ReflectionCategory } from '@/types/epilog';
import { formatTime, formatDate, getAssetUrl, getMapUrl } from '@/lib/utils';
import {
  Sparkles,
  Share2,
  Camera,
  Smartphone,
  MapPin,
  Clock,
  BookOpen,
  Calendar,
  ExternalLink,
  ChevronRight,
  Landmark,
  Utensils,
  Trees,
  Globe2,
  Check,
  Edit3,
  Navigation,
} from 'lucide-react';

interface StopCardProps {
  stop: TravelStop;
  isActive: boolean;
  isHovered: boolean;
  onSelect: () => void;
  onMouseEnter: () => void;
  onMouseLeave: () => void;
  onOpenSocialModal: (stop: TravelStop) => void;
  onSynthesizeStop: (stop: TravelStop) => Promise<void>;
  onUpdateStop: (updated: TravelStop) => void;
  isSynthesizing?: boolean;
}

const CATEGORY_CONFIG: Record<
  ReflectionCategory,
  { icon: React.ComponentType<{ className?: string }>; color: string; bg: string; border: string }
> = {
  Architectural: {
    icon: Landmark,
    color: 'text-sky-700 dark:text-sky-300',
    bg: 'bg-sky-50 dark:bg-sky-950/40',
    border: 'border-sky-200 dark:border-sky-800',
  },
  Culinary: {
    icon: Utensils,
    color: 'text-amber-700 dark:text-amber-300',
    bg: 'bg-amber-50 dark:bg-amber-950/40',
    border: 'border-amber-200 dark:border-amber-800',
  },
  Natural: {
    icon: Trees,
    color: 'text-emerald-700 dark:text-emerald-300',
    bg: 'bg-emerald-50 dark:bg-emerald-950/40',
    border: 'border-emerald-200 dark:border-emerald-800',
  },
  Cultural: {
    icon: Globe2,
    color: 'text-rose-700 dark:text-rose-300',
    bg: 'bg-rose-50 dark:bg-rose-950/40',
    border: 'border-rose-200 dark:border-rose-800',
  },
};

export const StopCard: React.FC<StopCardProps> = ({
  stop,
  isActive,
  isHovered,
  onSelect,
  onMouseEnter,
  onMouseLeave,
  onOpenSocialModal,
  onSynthesizeStop,
  onUpdateStop,
  isSynthesizing = false,
}) => {
  const [selectedPhotoIndex, setSelectedPhotoIndex] = useState(0);
  const [isEditingNotes, setIsEditingNotes] = useState(false);
  const [notesInput, setNotesInput] = useState(stop.reflection.userNotes || '');

  const activePhoto: PhotoAsset = stop.photos[selectedPhotoIndex] || stop.photos[0];
  const catConfig = CATEGORY_CONFIG[stop.reflection.category] || CATEGORY_CONFIG.Cultural;
  const CategoryIcon = catConfig.icon;

  const handleSaveNotes = () => {
    onUpdateStop({
      ...stop,
      reflection: {
        ...stop.reflection,
        userNotes: notesInput,
      },
    });
    setIsEditingNotes(false);
  };

  return (
    <div
      onClick={onSelect}
      onMouseEnter={onMouseEnter}
      onMouseLeave={onMouseLeave}
      className={`group relative rounded-2xl bg-white dark:bg-stone-900 border transition-all duration-300 cursor-pointer overflow-hidden ${
        isActive
          ? 'border-orange-500 shadow-xl ring-2 ring-orange-500/20 translate-y-[-2px]'
          : isHovered
          ? 'border-orange-300 dark:border-orange-800 shadow-lg'
          : 'border-stone-200/80 dark:border-stone-800/80 shadow-sm hover:border-stone-300'
      }`}
    >
      {/* Top Header */}
      <div className="p-4 sm:p-5 border-b border-stone-100 dark:border-stone-800/60">
        <div className="flex items-start justify-between gap-3">
          <div className="flex items-center gap-3">
            <span
              className={`flex items-center justify-center w-7 h-7 rounded-full text-xs font-bold transition-colors ${
                isActive
                  ? 'bg-orange-600 text-white shadow-md'
                  : 'bg-stone-100 dark:bg-stone-800 text-stone-700 dark:text-stone-300 group-hover:bg-orange-100 group-hover:text-orange-700'
              }`}
            >
              {stop.stopIndex}
            </span>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="text-base sm:text-lg font-bold text-stone-900 dark:text-stone-100 tracking-tight leading-snug">
                  {stop.poiName}
                </h3>
                {stop.exactVenueName && (
                  <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md bg-emerald-500/10 border border-emerald-500/30 text-[10px] font-bold text-emerald-400">
                    <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
                    <span>🎯 {stop.resolvedPrecisionMeters ? `${stop.resolvedPrecisionMeters}m` : '<1m'}</span>
                  </span>
                )}
              </div>
              <div className="flex items-center gap-1.5 mt-0.5 text-xs">
                <a
                  href={getMapUrl(
                    stop.centerCoords.lat,
                    stop.centerCoords.lng,
                    stop.exactVenueName || stop.poiName
                  )}
                  target="_blank"
                  rel="noopener noreferrer"
                  onClick={(e) => e.stopPropagation()}
                  className="group/loc inline-flex items-center gap-1.5 text-stone-500 dark:text-stone-400 hover:text-orange-600 dark:hover:text-orange-400 transition-colors py-0.5 rounded"
                  title="Open location in Maps application (Apple Maps / Google Maps)"
                >
                  <MapPin className="w-3.5 h-3.5 text-orange-500 shrink-0 group-hover/loc:scale-110 transition-transform" />
                  <span className="truncate border-b border-dashed border-stone-300 dark:border-stone-700 group-hover/loc:border-orange-500">
                    {[stop.exactVenueName || stop.locationContext.neighborhood, stop.locationContext.city, stop.locationContext.country]
                      .filter(Boolean)
                      .join(', ')}
                  </span>
                  <ExternalLink className="w-2.5 h-2.5 opacity-60 group-hover/loc:opacity-100 shrink-0" />
                </a>
              </div>
            </div>
          </div>

          {/* Time badge */}
          <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-stone-100 dark:bg-stone-800 text-[11px] font-medium text-stone-600 dark:text-stone-300 shrink-0">
            <Clock className="w-3 h-3 text-stone-400" />
            <span>
              {formatTime(stop.startTime)} – {formatTime(stop.endTime)}
            </span>
          </div>
        </div>
      </div>

      {/* Main Photo & Thumbnail Reel */}
      <div className="p-4 sm:p-5 space-y-3">
        <div className="relative aspect-[16/10] w-full rounded-xl overflow-hidden bg-stone-100 dark:bg-stone-800 group/photo">
          {activePhoto?.previewUrl ? (
            <img
              src={getAssetUrl(activePhoto.previewUrl)}
              alt={stop.poiName}
              className="w-full h-full object-cover transition-transform duration-500 group-hover/photo:scale-105"
            />
          ) : (
            <div className="w-full h-full flex items-center justify-center text-stone-400">
              <Camera className="w-8 h-8 opacity-40" />
            </div>
          )}

          {/* Camera & Anchor Metadata Badge */}
          <div className="absolute bottom-2.5 left-2.5 flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-black/70 backdrop-blur-md text-[11px] font-medium text-white shadow-md">
            {activePhoto?.isAnchor ? (
              <>
                <Smartphone className="w-3 h-3 text-emerald-400" />
                <span>GPS Anchor</span>
              </>
            ) : (
              <>
                <Camera className="w-3 h-3 text-amber-400" />
                <span>
                  DSLR Orphan
                  {activePhoto?.timeDiffSeconds !== undefined
                    ? ` (Matched ±${activePhoto.timeDiffSeconds}s)`
                    : ''}
                </span>
              </>
            )}
            {activePhoto?.cameraModel && (
              <span className="text-white/60 pl-1 border-l border-white/20 truncate max-w-[140px]">
                {activePhoto.cameraModel}
              </span>
            )}
          </div>

          {/* Food / Dish Badge */}
          {stop.detectedDishes && stop.detectedDishes.length > 0 && (
            <div className="absolute top-2.5 left-2.5 flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-black/75 backdrop-blur-md border border-amber-500/40 text-[11px] font-semibold text-amber-300 shadow-md">
              <Utensils className="w-3.5 h-3.5 text-amber-400" />
              <span>{stop.detectedDishes.length === 1 ? stop.detectedDishes[0].name : `${stop.detectedDishes.length} Dishes Identified`}</span>
            </div>
          )}

          {/* Number of photos pill */}
          <div className="absolute top-2.5 right-2.5 px-2 py-0.5 rounded-md bg-black/60 backdrop-blur-md text-[10px] font-semibold text-white">
            {selectedPhotoIndex + 1} / {stop.photos.length}
          </div>
        </div>

        {/* Thumbnail Selector (if multiple photos) */}
        {stop.photos.length > 1 && (
          <div className="flex items-center gap-2 overflow-x-auto pb-1 pt-0.5">
            {stop.photos.map((photo, idx) => (
              <button
                key={photo.id}
                onClick={(e) => {
                  e.stopPropagation();
                  setSelectedPhotoIndex(idx);
                }}
                className={`relative w-12 h-12 rounded-lg overflow-hidden shrink-0 border-2 transition-all ${
                  selectedPhotoIndex === idx
                    ? 'border-orange-500 scale-105 shadow-md'
                    : 'border-transparent opacity-70 hover:opacity-100'
                }`}
              >
                <img src={getAssetUrl(photo.previewUrl)} alt="" className="w-full h-full object-cover" />
                <span
                  className={`absolute top-0.5 right-0.5 w-2 h-2 rounded-full ${
                    photo.isAnchor ? 'bg-emerald-400' : 'bg-amber-400'
                  }`}
                />
              </button>
            ))}
          </div>
        )}

        {/* Narrative Caption */}
        {stop.narrativeCaption ? (
          <p className="text-sm font-serif italic text-stone-700 dark:text-stone-300 leading-relaxed pl-3 border-l-2 border-orange-400">
            "{stop.narrativeCaption}"
          </p>
        ) : (
          <div className="text-xs text-stone-400 italic py-1">
            No narrative generated yet. Click &ldquo;Synthesize Scene&rdquo; to draft with Gemini Vision.
          </div>
        )}

        {/* Reflection Block ("What I Learned") */}
        <div className={`p-3.5 rounded-xl border ${catConfig.bg} ${catConfig.border} space-y-1.5`}>
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-1.5">
              <CategoryIcon className={`w-3.5 h-3.5 ${catConfig.color}`} />
              <span className={`text-xs font-bold uppercase tracking-wider ${catConfig.color}`}>
                {stop.reflection.category} Insight
              </span>
            </div>
            <span className="text-[10px] font-medium text-stone-500 dark:text-stone-400">
              What I Learned
            </span>
          </div>

          <p className="text-xs font-medium text-stone-800 dark:text-stone-200 leading-normal">
            {stop.reflection.takeawayText || 'Capturing memories and reflections...'}
          </p>

          {/* User Notes Preview or Edit */}
          {stop.reflection.userNotes && !isEditingNotes && (
            <p className="text-[11px] text-stone-600 dark:text-stone-400 pt-1 border-t border-stone-200/60 dark:border-stone-700/60 flex items-start gap-1">
              <span className="font-semibold text-stone-700 dark:text-stone-300 shrink-0">Note:</span>
              <span>{stop.reflection.userNotes}</span>
            </p>
          )}

          {isEditingNotes && (
            <div className="pt-2 space-y-2" onClick={(e) => e.stopPropagation()}>
              <textarea
                value={notesInput}
                onChange={(e) => setNotesInput(e.target.value)}
                placeholder="Add your personal takeaway or travel memory notes..."
                className="w-full text-xs p-2 rounded-lg bg-white dark:bg-stone-800 border border-stone-300 dark:border-stone-700 focus:outline-none focus:ring-1 focus:ring-orange-500"
                rows={2}
              />
              <div className="flex items-center justify-end gap-2">
                <button
                  onClick={() => setIsEditingNotes(false)}
                  className="px-2 py-1 text-[11px] text-stone-500 hover:text-stone-700"
                >
                  Cancel
                </button>
                <button
                  onClick={handleSaveNotes}
                  className="px-2.5 py-1 text-[11px] font-semibold bg-orange-600 text-white rounded-md hover:bg-orange-700"
                >
                  Save Note
                </button>
              </div>
            </div>
          )}
        </div>

        {/* Gastronomy & Identified Dishes Card */}
        {stop.detectedDishes && stop.detectedDishes.length > 0 && (
          <div className="p-3.5 rounded-xl bg-amber-50/70 dark:bg-amber-950/30 border border-amber-200/80 dark:border-amber-800/60 space-y-2.5">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-1.5 text-amber-800 dark:text-amber-300">
                <Utensils className="w-3.5 h-3.5 text-amber-600 dark:text-amber-400" />
                <span className="text-xs font-bold uppercase tracking-wider">
                  Gastronomy &bull; Identified Dishes
                </span>
              </div>
              <span className="text-[10px] font-semibold px-2 py-0.5 rounded-full bg-amber-200/60 dark:bg-amber-900/60 text-amber-900 dark:text-amber-200">
                AI Vision
              </span>
            </div>

            <div className="space-y-2">
              {stop.detectedDishes.map((dish, idx) => (
                <div key={idx} className="p-2.5 rounded-lg bg-white/80 dark:bg-stone-900/80 border border-amber-200/50 dark:border-amber-900/40 space-y-1">
                  <div className="flex items-center justify-between gap-2">
                    <span className="text-xs font-bold text-stone-900 dark:text-amber-100">{dish.name}</span>
                    {dish.cuisineOrOrigin && (
                      <span className="text-[10px] text-amber-700 dark:text-amber-300/80 font-medium shrink-0">
                        {dish.cuisineOrOrigin}
                      </span>
                    )}
                  </div>
                  {dish.description && (
                    <p className="text-[11px] text-stone-600 dark:text-stone-300 leading-snug">
                      {dish.description}
                    </p>
                  )}
                  {dish.ingredients && dish.ingredients.length > 0 && (
                    <div className="flex flex-wrap gap-1 pt-0.5">
                      {dish.ingredients.map((ing, iIdx) => (
                        <span key={iIdx} className="px-1.5 py-0.5 rounded text-[9.5px] bg-amber-100/80 dark:bg-stone-800 text-amber-900 dark:text-amber-200">
                          {ing}
                        </span>
                      ))}
                    </div>
                  )}
                  {dish.pairingOrNotes && (
                    <div className="text-[10px] text-stone-500 dark:text-stone-400 italic pt-0.5">
                      &bull; {dish.pairingOrNotes}
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>
        )}

        {/* World On This Day Banner (Wikimedia API) */}
        {stop.worldOnThisDay && (
          <div className="flex items-start gap-2.5 p-2.5 rounded-lg bg-stone-50 dark:bg-stone-800/60 text-xs text-stone-600 dark:text-stone-400 border border-stone-100 dark:border-stone-800">
            <Calendar className="w-3.5 h-3.5 text-stone-400 shrink-0 mt-0.5" />
            <div className="flex-1 text-[11px] leading-snug">
              <span className="font-semibold text-stone-800 dark:text-stone-200">
                On This Day ({stop.worldOnThisDay.dateStr}):{' '}
              </span>
              <span>{stop.worldOnThisDay.headline}</span>
            </div>
            {stop.worldOnThisDay.sourceUrl && (
              <a
                href={stop.worldOnThisDay.sourceUrl}
                target="_blank"
                rel="noreferrer"
                onClick={(e) => e.stopPropagation()}
                className="text-stone-400 hover:text-orange-500 shrink-0"
                title="Read Wikipedia article"
              >
                <ExternalLink className="w-3 h-3" />
              </a>
            )}
          </div>
        )}

        {/* Corridor POI Candidates (1–3m Precision Snapping) */}
        {stop.venueCandidates && stop.venueCandidates.length > 0 && (
          <div className="p-2.5 rounded-xl bg-stone-50 dark:bg-stone-800/40 border border-stone-100 dark:border-stone-800/80 space-y-1.5">
            <div className="flex items-center justify-between text-[10px] font-bold text-stone-500 uppercase tracking-wider">
              <span>Nearby Corridor Venues (1–3m Ribbon)</span>
              <span>Click to Snap</span>
            </div>
            <div className="flex flex-wrap gap-1.5">
              {stop.venueCandidates.slice(0, 5).map((cand) => {
                const isSelected = stop.exactVenueName === cand.name;
                return (
                  <button
                    key={cand.name}
                    onClick={(e) => {
                      e.stopPropagation();
                      onUpdateStop({
                        ...stop,
                        poiName: cand.name,
                        exactVenueName: cand.name,
                        centerCoords: cand.coords,
                        resolvedPrecisionMeters: 1.0,
                      });
                    }}
                    className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-md text-[11px] font-medium transition-all ${
                      isSelected
                        ? 'bg-emerald-600 text-white shadow-sm'
                        : 'bg-stone-200/70 dark:bg-stone-800 text-stone-700 dark:text-stone-300 hover:bg-orange-100 dark:hover:bg-orange-950/40 hover:text-orange-600'
                    }`}
                  >
                    <span>{cand.name}</span>
                    {cand.type && <span className="text-[9px] opacity-70">({cand.type})</span>}
                  </button>
                );
              })}
            </div>
          </div>
        )}
      </div>

      {/* Card Action Footer */}
      <div className="px-4 py-3 bg-stone-50/70 dark:bg-stone-800/40 border-t border-stone-100 dark:border-stone-800/80 flex items-center justify-between gap-2">
        <div className="flex items-center gap-1.5">
          <button
            onClick={(e) => {
              e.stopPropagation();
              onSynthesizeStop(stop);
            }}
            disabled={isSynthesizing}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold bg-white dark:bg-stone-800 text-stone-700 dark:text-stone-200 border border-stone-200 dark:border-stone-700 hover:border-orange-500 hover:text-orange-600 shadow-sm transition-all disabled:opacity-50"
            title="Synthesize scene caption and reflection using Gemini Multimodal AI"
          >
            <Sparkles className={`w-3.5 h-3.5 text-orange-500 ${isSynthesizing ? 'animate-spin' : ''}`} />
            <span>{isSynthesizing ? 'Synthesizing...' : 'Synthesize Scene'}</span>
          </button>

          <button
            onClick={(e) => {
              e.stopPropagation();
              setIsEditingNotes(!isEditingNotes);
            }}
            className="p-1.5 rounded-lg text-stone-500 hover:text-stone-700 dark:hover:text-stone-300 hover:bg-stone-100 dark:hover:bg-stone-700 transition-colors"
            title="Edit Personal Notes"
          >
            <Edit3 className="w-3.5 h-3.5" />
          </button>
        </div>

        <button
          onClick={(e) => {
            e.stopPropagation();
            onOpenSocialModal(stop);
          }}
          className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold bg-orange-600 text-white hover:bg-orange-700 shadow-sm transition-all"
        >
          <Share2 className="w-3.5 h-3.5" />
          <span>Export 9:16</span>
        </button>
      </div>
    </div>
  );
};
