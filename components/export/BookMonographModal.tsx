'use client';

import React, { useState, useRef } from 'react';
import { EpiLogTrip } from '@/types/epilog';
import { formatDate, getAssetUrl } from '@/lib/utils';
import { toPng } from 'html-to-image';
import {
  BookOpen,
  X,
  ChevronLeft,
  ChevronRight,
  Download,
  Utensils,
} from 'lucide-react';

interface BookMonographModalProps {
  trip: EpiLogTrip;
  isOpen: boolean;
  onClose: () => void;
}

export const BookMonographModal: React.FC<BookMonographModalProps> = ({
  trip,
  isOpen,
  onClose,
}) => {
  const [currentSpreadIndex, setCurrentSpreadIndex] = useState(0);
  const [isExporting, setIsExporting] = useState(false);
  const spreadRef = useRef<HTMLDivElement>(null);

  if (!isOpen || trip.stops.length === 0) return null;

  const totalSpreads = trip.stops.length;
  const currentStop = trip.stops[currentSpreadIndex] || trip.stops[0];
  const heroPhoto = currentStop.photos.find((p) => p.id === currentStop.heroPhotoId) || currentStop.photos[0];

  const handleExportSpread = async () => {
    if (!spreadRef.current) return;
    setIsExporting(true);

    try {
      const dataUrl = await toPng(spreadRef.current, {
        cacheBust: true,
        pixelRatio: 2.0,
      });

      const link = document.createElement('a');
      link.download = `EpiLog_Monograph_Spread_${currentSpreadIndex + 1}_${currentStop.poiName.replace(/[^a-zA-Z0-9]/g, '_')}.png`;
      link.href = dataUrl;
      link.click();
    } catch (err) {
      console.error('Failed to export monograph spread:', err);
    } finally {
      setIsExporting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/85 backdrop-blur-lg animate-in fade-in duration-200">
      <div
        className="relative w-full max-w-5xl max-h-[92vh] bg-sand-900 border border-sand-800 rounded-3xl shadow-2xl flex flex-col overflow-hidden"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Modal Header */}
        <div className="px-6 py-4 border-b border-sand-800 flex items-center justify-between bg-sand-950/60">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-xl bg-atelier-ochre/20 text-atelier-ochre flex items-center justify-center">
              <BookOpen className="w-4 h-4" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="text-base font-bold text-white">Fine-Art Coffee Table Monograph</h3>
                <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-atelier-ochre/20 text-atelier-ochre-light border border-atelier-ochre/30">
                  Archival 200+ GSM Layflat
                </span>
              </div>
              <p className="text-xs text-sand-400">
                Automated luxury book typesetting preview • Spread {currentSpreadIndex + 1} of {totalSpreads}
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-1.5 rounded-full bg-sand-800 hover:bg-sand-700 text-sand-300 hover:text-white transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Book Layflat Spread Viewport */}
        <div className="flex-1 p-6 md:p-10 flex items-center justify-center bg-sand-950/80 overflow-y-auto">
          {/* Two-Page Layflat Spread Container */}
          <div
            ref={spreadRef}
            className="relative w-full max-w-4xl aspect-[16/10] bg-atelier-paper text-atelier-ink rounded-xl shadow-2xl border border-sand-300 grid grid-cols-2 overflow-hidden select-none"
            style={{
              boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.7), inset 0 0 40px rgba(0, 0, 0, 0.05)',
            }}
          >
            {/* Center Gutter / Crease Shadow */}
            <div className="absolute top-0 bottom-0 left-1/2 -translate-x-1/2 w-8 bg-gradient-to-r from-black/10 via-black/20 to-black/10 pointer-events-none z-20" />

            {/* LEFT PAGE: Hero Visual & Sensor Stamp */}
            <div className="p-8 md:p-10 flex flex-col justify-between border-r border-sand-200 relative bg-atelier-paper">
              <div className="flex items-center justify-between text-[10px] text-sand-500 uppercase tracking-widest font-serif">
                <span>{trip.title}</span>
                <span>Plate No. 0{currentStop.stopIndex}</span>
              </div>

              {/* Photo Frame */}
              <div className="my-auto w-full aspect-[4/3] rounded-lg overflow-hidden shadow-md border border-sand-300 bg-sand-200">
                {heroPhoto?.previewUrl ? (
                  <img
                    src={getAssetUrl(heroPhoto.previewUrl)}
                    alt={currentStop.poiName}
                    crossOrigin="anonymous"
                    className="w-full h-full object-cover"
                  />
                ) : (
                  <div className="w-full h-full flex items-center justify-center text-sand-400 text-xs">
                    No image available
                  </div>
                )}
              </div>

              {/* Technical Photo Details */}
              <div className="flex items-center justify-between text-[10px] text-sand-500 font-mono pt-2 border-t border-sand-200">
                <span className="truncate max-w-[200px]">
                  {heroPhoto?.cameraModel || 'Optical Sensor'}
                </span>
                <span>
                  {currentStop.centerCoords.lat.toFixed(4)}°N, {currentStop.centerCoords.lng.toFixed(4)}°E
                </span>
              </div>
            </div>

            {/* RIGHT PAGE: Typeset Literature & Intellectual Insights */}
            <div className="p-8 md:p-10 flex flex-col justify-between bg-atelier-paper">
              {/* Header */}
              <div className="space-y-1">
                <div className="flex items-center justify-between text-[10px] text-sand-500 uppercase tracking-widest font-serif">
                  <span>{currentStop.reflection.category} Monograph</span>
                  <span>{formatDate(currentStop.startTime)}</span>
                </div>
                <h2 className="text-2xl md:text-3xl font-serif font-bold text-sand-900 leading-tight pt-2">
                  {currentStop.poiName}
                </h2>
                <div className="text-xs text-sand-500 font-serif italic">
                  {[currentStop.locationContext.neighborhood, currentStop.locationContext.city, currentStop.locationContext.country]
                    .filter(Boolean)
                    .join(', ')}
                </div>
              </div>

              {/* Narrative & Takeaways */}
              <div className="space-y-4 my-auto py-3">
                {currentStop.narrativeCaption && (
                  <p className="text-xs md:text-sm font-serif text-sand-800 leading-relaxed first-letter:text-3xl first-letter:font-bold first-letter:float-left first-letter:mr-2 first-letter:text-atelier-terracotta">
                    {currentStop.narrativeCaption}
                  </p>
                )}

                {/* "What I Learned" Box */}
                <div className="p-4 rounded-lg bg-atelier-warm border-l-2 border-atelier-ochre space-y-1">
                  <div className="text-[10px] font-bold uppercase tracking-widest text-atelier-ochre">
                    What I Learned &bull; {currentStop.reflection.category}
                  </div>
                  <p className="text-xs font-serif text-sand-800 leading-normal">
                    {currentStop.reflection.takeawayText}
                  </p>
                </div>

                {/* Gastronomic Notes if Dishes Identified */}
                {currentStop.detectedDishes && currentStop.detectedDishes.length > 0 && (
                  <div className="p-3 rounded-lg bg-sand-50 border border-sand-300 space-y-1">
                    <div className="flex items-center gap-1.5 text-[9.5px] font-bold uppercase tracking-wider text-atelier-ochre-light">
                      <Utensils className="w-3 h-3 text-atelier-ochre" />
                      <span>Gastronomy: {currentStop.detectedDishes.map((d) => d.name).join(' &bull; ')}</span>
                    </div>
                    {currentStop.detectedDishes[0].description && (
                      <p className="text-[10.5px] font-serif text-sand-700 italic">
                        "{currentStop.detectedDishes[0].description}"
                      </p>
                    )}
                  </div>
                )}

                {/* World On This Day */}
                {currentStop.worldOnThisDay && (
                  <div className="text-[10px] font-serif text-sand-600 pt-2 border-t border-sand-200">
                    <span className="font-bold text-sand-800">World on this day: </span>
                    <span>{currentStop.worldOnThisDay.headline}</span>
                  </div>
                )}
              </div>

              {/* Bottom Pagination */}
              <div className="flex items-center justify-between text-[10px] text-sand-400 font-serif pt-2 border-t border-sand-200">
                <span>EpiLog Press &bull; First Edition</span>
                <span>Page {currentStop.stopIndex * 2}</span>
              </div>
            </div>
          </div>
        </div>

        {/* Modal Footer Controls */}
        <div className="px-6 py-4 border-t border-sand-800 bg-sand-950/90 flex flex-wrap items-center justify-between gap-4">
          <div className="flex items-center gap-2">
            <button
              onClick={() => setCurrentSpreadIndex((prev) => Math.max(0, prev - 1))}
              disabled={currentSpreadIndex === 0}
              className="flex items-center gap-1 px-3 py-1.5 rounded-xl bg-sand-800 hover:bg-sand-700 text-sand-300 disabled:opacity-40 text-xs font-semibold"
            >
              <ChevronLeft className="w-4 h-4" />
              <span>Previous Spread</span>
            </button>

            <span className="text-xs text-sand-400 px-2 font-mono">
              {currentSpreadIndex + 1} / {totalSpreads}
            </span>

            <button
              onClick={() => setCurrentSpreadIndex((prev) => Math.min(totalSpreads - 1, prev + 1))}
              disabled={currentSpreadIndex === totalSpreads - 1}
              className="flex items-center gap-1 px-3 py-1.5 rounded-xl bg-sand-800 hover:bg-sand-700 text-sand-300 disabled:opacity-40 text-xs font-semibold"
            >
              <span>Next Spread</span>
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>

          <div className="flex items-center gap-3">
            <button
              onClick={handleExportSpread}
              disabled={isExporting}
              className="flex items-center gap-1.5 px-4 py-2 rounded-xl bg-atelier-terracotta hover:bg-atelier-terracotta-light text-white font-bold text-xs shadow-md transition-all disabled:opacity-50"
            >
              <Download className={`w-3.5 h-3.5 ${isExporting ? 'animate-bounce' : ''}`} />
              <span>{isExporting ? 'Exporting...' : 'Export High-Res Spread (PNG)'}</span>
            </button>

            <button
              onClick={onClose}
              className="px-3 py-2 text-xs font-semibold text-sand-400 hover:text-white"
            >
              Close
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
