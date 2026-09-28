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
    color: 'text-stone-800 dark:text-stone-200',
    bg: 'bg-sand-100/80 dark:bg-sand-900/50',
    border: 'border-sand-300/80 dark:border-sand-800/80',
  },
  Culinary: {
    icon: Utensils,
    color: 'text-amber-900 dark:text-amber-200',
    bg: 'bg-amber-50/70 dark:bg-amber-950/30',
    border: 'border-amber-200/80 dark:border-amber-800/60',
  },
  Natural: {
    icon: Trees,
    color: 'text-emerald-900 dark:text-emerald-200',
    bg: 'bg-emerald-50/70 dark:bg-emerald-950/30',
    border: 'border-emerald-200/80 dark:border-emerald-800/60',
  },
  Cultural: {
    icon: Globe2,
    color: 'text-sand-900 dark:text-sand-100',
    bg: 'bg-sand-100/80 dark:bg-sand-900/50',
    border: 'border-sand-300/80 dark:border-sand-800/80',
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
      className={`group relative rounded-3xl bg-white dark:bg-[#1f1b17] border transition-all duration-300 cursor-pointer overflow-hidden ${
        isActive
          ? 'border-atelier-terracotta shadow-editorial ring-2 ring-atelier-terracotta/20 translate-y-[-2px]'
          : isHovered
          ? 'border-sand-400 dark:border-sand-700 shadow-editorial'
          : 'border-sand-300/80 dark:border-sand-800/80 shadow-subtle hover:border-sand-400'
      }`}
    >
      {/* Top Header */}
      <div className="p-4 sm:p-5 border-b border-sand-200/70 dark:border-sand-800/60 bg-sand-50/50 dark:bg-sand-900/20">
        <div className="flex items-start justify-between gap-3">
          <div className="flex items-center gap-3">
            <span
              className={`flex items-center justify-center w-8 h-8 rounded-full text-xs font-serif font-bold transition-colors ${
                isActive
                  ? 'bg-atelier-terracotta text-white shadow-subtle'
                  : 'bg-sand-200 dark:bg-sand-800 text-sand-800 dark:text-sand-200 group-hover:bg-sand-300 dark:group-hover:bg-sand-700'
              }`}
            >
              0{stop.stopIndex}
            </span>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="text-base sm:text-lg font-serif font-bold text-sand-950 dark:text-sand-50 tracking-tight leading-snug">
                  {stop.poiName}
                </h3>
                {stop.exactVenueName && (
                  <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-sand-200/80 dark:bg-sand-800 border border-sand-300/60 dark:border-sand-700/60 text-[10px] font-medium text-sand-700 dark:text-sand-300">
                    <span className="w-1.5 h-1.5 rounded-full bg-atelier-terracotta" />
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
                  className="group/loc inline-flex items-center gap-1.5 text-sand-600 dark:text-sand-400 hover:text-atelier-terracotta dark:hover:text-atelier-terracotta-light transition-colors py-0.5 rounded"
                  title="Open location in Maps application"
                >
                  <MapPin className="w-3.5 h-3.5 text-atelier-terracotta shrink-0 group-hover/loc:scale-110 transition-transform" />
                  <span className="truncate border-b border-dashed border-sand-400/80 dark:border-sand-600 group-hover/loc:border-atelier-terracotta font-medium">
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
          <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-sand-200/60 dark:bg-sand-800/80 text-[11px] font-medium text-sand-700 dark:text-sand-300 shrink-0 border border-sand-300/60 dark:border-sand-700/60 font-serif">
            <Clock className="w-3 h-3 text-sand-500" />
            <span>
              {formatTime(stop.startTime)} – {formatTime(stop.endTime)}
            </span>
          </div>
        </div>
      </div>

      {/* Main Photo & Thumbnail Reel */}
      <div className="p-4 sm:p-5 space-y-3.5">
        <div className="relative aspect-[16/10] w-full rounded-2xl overflow-hidden bg-sand-200/60 dark:bg-sand-900 group/photo border border-sand-300/60 dark:border-sand-800 shadow-subtle">
          {activePhoto?.previewUrl ? (
            <img
              src={getAssetUrl(activePhoto.previewUrl)}
              alt={stop.poiName}
              className="w-full h-full object-cover transition-transform duration-700 group-hover/photo:scale-105"
            />
          ) : (
            <div className="w-full h-full flex items-center justify-center text-sand-400">
              <Camera className="w-8 h-8 opacity-40 stroke-[1.5]" />
            </div>
          )}

          {/* Camera & Anchor Metadata Badge */}
          <div className="absolute bottom-2.5 left-2.5 flex items-center gap-1.5 px-2.5 py-1 rounded-xl bg-black/65 backdrop-blur-md text-[11px] font-medium text-white shadow-subtle border border-white/10">
            {activePhoto?.isAnchor ? (
              <>
                <Smartphone className="w-3 h-3 text-emerald-300" />
                <span>GPS Anchor</span>
              </>
            ) : (
              <>
                <Camera className="w-3 h-3 text-amber-300" />
                <span>
                  DSLR Match
                  {activePhoto?.timeDiffSeconds !== undefined
                    ? ` (±${activePhoto.timeDiffSeconds}s)`
                    : ''}
                </span>
              </>
            )}
            {activePhoto?.cameraModel && (
              <span className="text-white/70 pl-1 border-l border-white/20 truncate max-w-[140px] font-mono text-[10px]">
                {activePhoto.cameraModel}
              </span>
            )}
          </div>

          {/* Food / Dish Badge */}
          {stop.detectedDishes && stop.detectedDishes.length > 0 && (
            <div className="absolute top-2.5 left-2.5 flex items-center gap-1.5 px-2.5 py-1 rounded-xl bg-black/70 backdrop-blur-md border border-amber-400/30 text-[11px] font-semibold text-amber-200 shadow-subtle">
              <Utensils className="w-3.5 h-3.5 text-amber-300" />
              <span>{stop.detectedDishes.length === 1 ? stop.detectedDishes[0].name : `${stop.detectedDishes.length} Dishes Identified`}</span>
            </div>
          )}

          {/* Number of photos pill */}
          <div className="absolute top-2.5 right-2.5 px-2.5 py-0.5 rounded-full bg-black/60 backdrop-blur-md text-[10.5px] font-semibold text-white/90 border border-white/10 font-mono">
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
                className={`relative w-12 h-12 rounded-xl overflow-hidden shrink-0 border-2 transition-all ${
                  selectedPhotoIndex === idx
                    ? 'border-atelier-terracotta scale-105 shadow-subtle'
                    : 'border-transparent opacity-65 hover:opacity-100'
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
          <p className="text-[14px] font-serif italic text-sand-800 dark:text-sand-200 leading-relaxed pl-3.5 border-l-2 border-atelier-terracotta">
            "{stop.narrativeCaption}"
          </p>
        ) : (
          <div className="text-xs text-sand-400 italic py-1 font-serif">
            No narrative generated yet. Click &ldquo;Synthesize Scene&rdquo; to draft with Gemini Vision.
          </div>
        )}

        {/* Reflection Block ("What I Learned") */}
        <div className={`p-4 rounded-2xl border ${catConfig.bg} ${catConfig.border} space-y-1.5 shadow-subtle`}>
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-1.5">
              <CategoryIcon className={`w-3.5 h-3.5 ${catConfig.color}`} />
              <span className={`text-[11px] font-bold uppercase tracking-wider ${catConfig.color}`}>
                {stop.reflection.category} Insight
              </span>
            </div>
            <span className="text-[10px] font-serif font-medium text-sand-500 dark:text-sand-400">
              What I Learned
            </span>
          </div>

          <p className="text-xs font-serif text-sand-900 dark:text-sand-100 leading-relaxed">
            {stop.reflection.takeawayText || 'Capturing memories and reflections...'}
          </p>

          {/* User Notes Preview or Edit */}
          {stop.reflection.userNotes && !isEditingNotes && (
            <p className="text-[11px] text-sand-600 dark:text-sand-400 pt-1.5 border-t border-sand-200/80 dark:border-sand-800/80 flex items-start gap-1">
              <span className="font-semibold text-sand-800 dark:text-sand-200 shrink-0">Note:</span>
              <span>{stop.reflection.userNotes}</span>
            </p>
          )}

          {isEditingNotes && (
            <div className="pt-2 space-y-2" onClick={(e) => e.stopPropagation()}>
              <textarea
                value={notesInput}
                onChange={(e) => setNotesInput(e.target.value)}
                placeholder="Add your personal takeaway or travel memory notes..."
                className="w-full text-xs p-2.5 rounded-xl bg-white dark:bg-sand-800 border border-sand-300 dark:border-sand-700 focus:outline-none focus:ring-1 focus:ring-atelier-terracotta text-sand-900 dark:text-sand-100"
                rows={2}
              />
              <div className="flex items-center justify-end gap-2">
                <button
                  onClick={() => setIsEditingNotes(false)}
                  className="px-2.5 py-1 text-[11px] text-sand-500 hover:text-sand-700"
                >
                  Cancel
                </button>
                <button
                  onClick={handleSaveNotes}
                  className="px-3 py-1 text-[11px] font-semibold bg-atelier-terracotta text-white rounded-lg hover:bg-atelier-terracotta-dark shadow-subtle"
                >
                  Save Note
                </button>
              </div>
            </div>
          )}
        </div>

        {/* Gastronomy & Identified Dishes Card */}
        {stop.detectedDishes && stop.detectedDishes.length > 0 && (
          <div className="p-3.5 rounded-2xl bg-amber-50/70 dark:bg-amber-950/30 border border-amber-200/80 dark:border-amber-800/60 space-y-2.5 shadow-subtle">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-1.5 text-amber-900 dark:text-amber-300">
                <Utensils className="w-3.5 h-3.5 text-atelier-ochre" />
                <span className="text-[11px] font-bold uppercase tracking-wider font-serif">
                  Gastronomy &bull; Identified Dishes
                </span>
              </div>
              <span className="text-[9.5px] font-semibold px-2 py-0.5 rounded-full bg-amber-200/60 dark:bg-amber-900/60 text-amber-900 dark:text-amber-200">
                Menu Lookup &bull; ~1m
              </span>
            </div>

            <div className="space-y-2">
              {stop.detectedDishes.map((dish, idx) => (
                <div key={idx} className="p-2.5 rounded-xl bg-white/80 dark:bg-sand-900/80 border border-amber-200/60 dark:border-amber-900/40 space-y-1">
                  <div className="flex items-center justify-between gap-2">
                    <span className="text-xs font-serif font-bold text-sand-900 dark:text-amber-100">{dish.name}</span>
                    {dish.cuisineOrOrigin && (
                      <span className="text-[10px] text-amber-800 dark:text-amber-300 font-medium shrink-0">
                        {dish.cuisineOrOrigin}
                      </span>
                    )}
                  </div>
                  {dish.description && (
                    <p className="text-[11px] text-sand-600 dark:text-sand-300 leading-snug">
                      {dish.description}
                    </p>
                  )}
                  {dish.ingredients && dish.ingredients.length > 0 && (
                    <div className="flex flex-wrap gap-1 pt-0.5">
                      {dish.ingredients.map((ing, iIdx) => (
                        <span key={iIdx} className="px-1.5 py-0.5 rounded text-[9.5px] bg-amber-100/70 dark:bg-sand-800 text-amber-900 dark:text-amber-200 font-medium">
                          {ing}
                        </span>
                      ))}
                    </div>
                  )}
                  {dish.pairingOrNotes && (
                    <div className="text-[10px] text-sand-500 dark:text-sand-400 italic pt-0.5 font-serif">
                      &bull; {dish.pairingOrNotes}
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Fine Art, Museum Artifacts & Masterworks Card */}
        {stop.detectedArtworks && stop.detectedArtworks.length > 0 && (
          <div className="p-3.5 rounded-2xl bg-purple-50/70 dark:bg-purple-950/30 border border-purple-200/80 dark:border-purple-800/60 space-y-2.5 shadow-subtle">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-1.5 text-purple-900 dark:text-purple-300">
                <BookOpen className="w-3.5 h-3.5 text-purple-600 dark:text-purple-400" />
                <span className="text-[11px] font-bold uppercase tracking-wider font-serif">
                  Fine Art &bull; Museum Catalog
                </span>
              </div>
              <span className="text-[9.5px] font-semibold px-2 py-0.5 rounded-full bg-purple-200/60 dark:bg-purple-900/60 text-purple-900 dark:text-purple-200">
                Artifact &bull; ~1m
              </span>
            </div>

            <div className="space-y-2">
              {stop.detectedArtworks.map((art, idx) => (
                <div key={idx} className="p-2.5 rounded-xl bg-white/80 dark:bg-sand-900/80 border border-purple-200/50 dark:border-purple-900/40 space-y-1">
                  <div className="flex items-center justify-between gap-2">
                    <span className="text-xs font-serif font-bold text-sand-900 dark:text-purple-100">{art.title}</span>
                    {art.creationYearOrPeriod && (
                      <span className="text-[10px] text-purple-700 dark:text-purple-300/80 font-medium shrink-0">
                        {art.creationYearOrPeriod}
                      </span>
                    )}
                  </div>
                  {art.artistOrCreator && (
                    <p className="text-[11px] font-medium text-purple-900 dark:text-purple-300">
                      By {art.artistOrCreator} {art.mediumOrStyle ? `• ${art.mediumOrStyle}` : ''}
                    </p>
                  )}
                  {art.description && (
                    <p className="text-[11px] text-sand-600 dark:text-sand-300 leading-snug">
                      {art.description}
                    </p>
                  )}
                  {art.significanceOrInsight && (
                    <div className="text-[10.5px] text-purple-950 dark:text-purple-200/90 italic pt-0.5 border-t border-purple-100 dark:border-purple-900/50 font-serif">
                      ✨ {art.significanceOrInsight}
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Architectural Features & Masonry Heritage Card */}
        {stop.detectedArchitecture && stop.detectedArchitecture.length > 0 && (
          <div className="p-3.5 rounded-2xl bg-sand-100/80 dark:bg-sand-900/40 border border-sand-300/80 dark:border-sand-800/80 space-y-2.5 shadow-subtle">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-1.5 text-sand-900 dark:text-sand-200">
                <Landmark className="w-3.5 h-3.5 text-atelier-terracotta" />
                <span className="text-[11px] font-bold uppercase tracking-wider font-serif">
                  Architecture &bull; Structural Heritage
                </span>
              </div>
              <span className="text-[9.5px] font-semibold px-2 py-0.5 rounded-full bg-sand-200 dark:bg-sand-800 text-sand-800 dark:text-sand-200">
                Sub-Meter Locale
              </span>
            </div>

            <div className="space-y-2">
              {stop.detectedArchitecture.map((arch, idx) => (
                <div key={idx} className="p-2.5 rounded-xl bg-white/80 dark:bg-sand-900/80 border border-sand-200/70 dark:border-sand-800/60 space-y-1">
                  <div className="flex items-center justify-between gap-2">
                    <span className="text-xs font-serif font-bold text-sand-900 dark:text-sand-100">{arch.elementName}</span>
                    {arch.eraOrStyle && (
                      <span className="text-[10px] text-atelier-terracotta font-medium shrink-0">
                        {arch.eraOrStyle}
                      </span>
                    )}
                  </div>
                  {arch.architectOrSchool && (
                    <p className="text-[11px] font-medium text-sand-700 dark:text-sand-300">
                      Master / Architect: {arch.architectOrSchool}
                    </p>
                  )}
                  {arch.description && (
                    <p className="text-[11px] text-sand-600 dark:text-sand-300 leading-snug">
                      {arch.description}
                    </p>
                  )}
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Micro-Establishments Breakdown */}
        {stop.microEstablishments && stop.microEstablishments.length > 1 && (
          <div className="p-2.5 rounded-2xl bg-sand-100/60 dark:bg-sand-900/30 border border-sand-200/80 dark:border-sand-800/80 space-y-1.5">
            <div className="flex items-center justify-between text-[10px] font-bold text-sand-500 uppercase tracking-wider">
              <span>Micro-Establishments Visited (~1m accuracy)</span>
              <span>{stop.microEstablishments.length} Locales</span>
            </div>
            <div className="flex flex-wrap gap-1.5">
              {stop.microEstablishments.map((micro, mIdx) => (
                <span
                  key={mIdx}
                  className="inline-flex items-center gap-1 px-2 py-0.5 rounded-lg bg-sand-200/70 dark:bg-sand-800 text-sand-800 dark:text-sand-200 text-[10.5px] font-medium"
                >
                  <MapPin className="w-2.5 h-2.5 text-atelier-terracotta" />
                  <span>{micro.name}</span>
                  <span className="text-[9px] text-atelier-olive dark:text-emerald-400 font-semibold">±{micro.precisionMeters}m</span>
                </span>
              ))}
            </div>
          </div>
        )}

        {/* World On This Day Banner (Wikimedia API) */}
        {stop.worldOnThisDay && (
          <div className="flex items-start gap-2.5 p-3 rounded-xl bg-sand-100/70 dark:bg-sand-900/40 text-xs text-sand-600 dark:text-sand-400 border border-sand-200/80 dark:border-sand-800/80">
            <Calendar className="w-3.5 h-3.5 text-atelier-terracotta shrink-0 mt-0.5" />
            <div className="flex-1 text-[11px] leading-snug">
              <span className="font-semibold text-sand-900 dark:text-sand-100">
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
                className="text-sand-400 hover:text-atelier-terracotta shrink-0"
                title="Read Wikipedia article"
              >
                <ExternalLink className="w-3 h-3" />
              </a>
            )}
          </div>
        )}

        {/* Corridor POI Candidates */}
        {stop.venueCandidates && stop.venueCandidates.length > 0 && (
          <div className="p-2.5 rounded-2xl bg-sand-100/60 dark:bg-sand-900/30 border border-sand-200/80 dark:border-sand-800/80 space-y-1.5">
            <div className="flex items-center justify-between text-[10px] font-bold text-sand-500 uppercase tracking-wider">
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
                    className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-lg text-[11px] font-medium transition-all ${
                      isSelected
                        ? 'bg-atelier-terracotta text-white shadow-subtle'
                        : 'bg-sand-200/70 dark:bg-sand-800 text-sand-700 dark:text-sand-300 hover:bg-sand-300 dark:hover:bg-sand-700'
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
      <div className="px-4 py-3 bg-sand-50/70 dark:bg-sand-900/30 border-t border-sand-200/70 dark:border-sand-800/80 flex items-center justify-between gap-2">
        <div className="flex items-center gap-1.5">
          <button
            onClick={(e) => {
              e.stopPropagation();
              onSynthesizeStop(stop);
            }}
            disabled={isSynthesizing}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-semibold bg-white dark:bg-sand-800 text-sand-800 dark:text-sand-200 border border-sand-300 dark:border-sand-700 hover:border-atelier-terracotta hover:text-atelier-terracotta shadow-subtle transition-all disabled:opacity-50"
            title="Synthesize scene caption and reflection using Gemini Multimodal AI"
          >
            <Sparkles className={`w-3.5 h-3.5 text-atelier-terracotta ${isSynthesizing ? 'animate-spin' : ''}`} />
            <span>{isSynthesizing ? 'Synthesizing...' : 'Synthesize Scene'}</span>
          </button>

          <button
            onClick={(e) => {
              e.stopPropagation();
              setIsEditingNotes(!isEditingNotes);
            }}
            className="p-1.5 rounded-xl text-sand-500 hover:text-sand-800 dark:hover:text-sand-200 hover:bg-sand-200/60 dark:hover:bg-sand-800 transition-colors"
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
          className="flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl text-xs font-semibold bg-atelier-terracotta text-white hover:bg-atelier-terracotta-dark shadow-subtle transition-all"
        >
          <Share2 className="w-3.5 h-3.5" />
          <span>Export 9:16</span>
        </button>
      </div>
    </div>
  );
};
