'use client';

import React from 'react';
import { TravelStop } from '@/types/epilog';
import { formatDate, formatTime } from '@/lib/utils';
import { MapPin, Compass, Sparkles, Landmark, Utensils, Trees, Globe2, Calendar } from 'lucide-react';

export type CardTheme = 'editorial-dark' | 'magazine-light' | 'vintage-stamp' | 'sunset-terracotta';
export type AspectRatioType = '9:16' | '1:1';

interface SocialCard916Props {
  stop: TravelStop;
  theme: CardTheme;
  aspectRatio?: AspectRatioType;
  cardRef?: React.RefObject<HTMLDivElement>;
}

export const SocialCard916: React.FC<SocialCard916Props> = ({
  stop,
  theme,
  aspectRatio = '9:16',
  cardRef,
}) => {
  const heroPhoto = stop.photos.find((p) => p.id === stop.heroPhotoId) || stop.photos[0];

  const getThemeStyles = () => {
    switch (theme) {
      case 'magazine-light':
        return {
          wrapper: 'bg-[#faf8f5] text-[#1c1917] border border-[#e7e2d9]',
          badgeBg: 'bg-[#1c1917] text-white',
          accentColor: 'text-[#c2410c]',
          cardBox: 'bg-white border border-[#e7e2d9] shadow-sm',
          fontFamily: 'font-serif',
          quoteStyle: 'text-stone-700 italic border-l-2 border-stone-800',
          watermark: 'text-stone-400',
        };
      case 'vintage-stamp':
        return {
          wrapper: 'bg-[#f4efe6] text-[#292524] border-8 border double border-[#d6cbbe]',
          badgeBg: 'bg-[#78350f] text-[#fef3c7]',
          accentColor: 'text-[#9a3412]',
          cardBox: 'bg-[#fbf8f2] border border-[#d6cbbe] shadow-inner',
          fontFamily: 'font-serif',
          quoteStyle: 'text-stone-800 italic border-l-2 border-amber-800',
          watermark: 'text-amber-900/40',
        };
      case 'sunset-terracotta':
        return {
          wrapper: 'bg-gradient-to-b from-[#431407] via-[#2a1209] to-[#0c0a09] text-white',
          badgeBg: 'bg-gradient-to-r from-orange-500 to-amber-500 text-white',
          accentColor: 'text-orange-400',
          cardBox: 'bg-white/10 backdrop-blur-md border border-white/15',
          fontFamily: 'font-sans',
          quoteStyle: 'text-orange-100 italic border-l-2 border-orange-400',
          watermark: 'text-white/40',
        };
      case 'editorial-dark':
      default:
        return {
          wrapper: 'bg-[#121316] text-[#f3f4f6]',
          badgeBg: 'bg-orange-600 text-white',
          accentColor: 'text-orange-500',
          cardBox: 'bg-[#1a1c22] border border-stone-800/80',
          fontFamily: 'font-serif',
          quoteStyle: 'text-stone-300 italic border-l-2 border-orange-500',
          watermark: 'text-stone-500',
        };
    }
  };

  const styles = getThemeStyles();
  const isSquare = aspectRatio === '1:1';

  return (
    <div
      ref={cardRef}
      className={`relative rounded-3xl overflow-hidden flex flex-col justify-between p-6 sm:p-7 shadow-2xl select-none shrink-0 ${
        styles.wrapper
      } ${
        isSquare
          ? 'w-[420px] h-[420px] sm:w-[480px] sm:h-[480px]'
          : 'w-[360px] h-[640px] sm:w-[405px] sm:h-[720px]'
      }`}
      style={{
        aspectRatio: isSquare ? '1 / 1' : '9 / 16',
      }}
    >
      {/* Top Header */}
      <div className="space-y-2 z-10">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <span className={`px-2.5 py-0.5 rounded-full text-[10px] font-bold tracking-wider ${styles.badgeBg}`}>
              STOP 0{stop.stopIndex}
            </span>
            <span className="text-[10px] uppercase tracking-widest font-semibold opacity-75">
              {stop.reflection.category}
            </span>
          </div>

          <div className="flex items-center gap-1 text-[10px] opacity-75">
            <Compass className="w-3 h-3" />
            <span>
              {stop.centerCoords.lat.toFixed(2)}°N, {stop.centerCoords.lng.toFixed(2)}°E
            </span>
          </div>
        </div>

        <div>
          <h2 className={`text-lg sm:text-xl font-bold leading-tight tracking-tight ${styles.fontFamily}`}>
            {stop.poiName}
          </h2>
          <div className="flex items-center gap-1.5 mt-0.5 text-[11px] opacity-80">
            <MapPin className="w-3 h-3 text-orange-500 shrink-0" />
            <span className="truncate">
              {[stop.locationContext.neighborhood, stop.locationContext.city, stop.locationContext.country]
                .filter(Boolean)
                .join(', ')}
            </span>
            <span>&bull;</span>
            <span>{formatDate(stop.startTime)}</span>
          </div>
        </div>
      </div>

      {/* Main Hero Photo */}
      <div className={`relative my-auto w-full rounded-2xl overflow-hidden shadow-lg border border-black/10 ${
        isSquare ? 'aspect-[16/9] max-h-[160px]' : 'aspect-[4/3]'
      }`}>
        {heroPhoto?.previewUrl ? (
          <img
            src={heroPhoto.previewUrl}
            alt={stop.poiName}
            crossOrigin="anonymous"
            onError={(e) => {
              (e.target as HTMLImageElement).src = 'https://images.unsplash.com/photo-1493976040374-85c8e12f0c0e?q=80&w=1200&auto=format&fit=crop';
            }}
            className="w-full h-full object-cover"
          />
        ) : (
          <div className="w-full h-full bg-stone-800 flex items-center justify-center text-stone-500">
            No Photo
          </div>
        )}

        {/* Dish / Gastronomy Stamp Tag */}
        {stop.detectedDishes && stop.detectedDishes.length > 0 && (
          <div className="absolute top-2 left-2 px-2 py-0.5 rounded-md bg-black/75 backdrop-blur-md border border-amber-500/40 text-[8.5px] text-amber-300 font-semibold flex items-center gap-1 shadow-md">
            <Utensils className="w-2.5 h-2.5 text-amber-400" />
            <span className="truncate max-w-[170px]">{stop.detectedDishes[0].name}</span>
          </div>
        )}

        {/* Camera Stamp Tag */}
        {heroPhoto?.cameraModel && (
          <div className="absolute bottom-2 left-2 px-2 py-0.5 rounded-md bg-black/60 backdrop-blur-sm text-[8px] text-white/90 font-mono">
            {heroPhoto.cameraModel}
          </div>
        )}
      </div>

      {/* Bottom Insights Section */}
      <div className="space-y-2.5 z-10">
        {/* Narrative Scene Quote */}
        {stop.narrativeCaption && (
          <p className={`text-[11px] leading-relaxed pl-2.5 line-clamp-2 ${styles.quoteStyle}`}>
            "{stop.narrativeCaption}"
          </p>
        )}

        {/* Takeaway Insight Box */}
        <div className={`p-2.5 rounded-xl ${styles.cardBox} space-y-0.5`}>
          <div className="flex items-center justify-between text-[9px] font-bold uppercase tracking-wider">
            <div className="flex items-center gap-1">
              <Sparkles className={`w-3 h-3 ${styles.accentColor}`} />
              <span className={styles.accentColor}>What I Learned</span>
            </div>
            <span className="opacity-60">{formatTime(stop.startTime)}</span>
          </div>
          <p className="text-[10.5px] font-medium leading-tight opacity-95 line-clamp-2">
            {stop.reflection.takeawayText || 'Every journey leaves an imprint of history and architecture.'}
          </p>
        </div>

        {/* Footer Brand Watermark */}
        <div className="flex items-center justify-between pt-1 border-t border-current/10 text-[9px]">
          <div className="flex items-center gap-1.5 font-bold tracking-wider">
            <span className="w-1.5 h-1.5 rounded-full bg-orange-500 inline-block" />
            <span className="font-serif tracking-widest uppercase">EpiLog Travel Journal</span>
          </div>
          <span className={styles.watermark}>epilog.app</span>
        </div>
      </div>
    </div>
  );
};
