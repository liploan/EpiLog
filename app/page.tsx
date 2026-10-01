'use client';

import React, { useState, useEffect, useRef } from 'react';
import dynamic from 'next/dynamic';
import { EpiLogTrip, TravelStop } from '@/types/epilog';
import { SAMPLE_KYOTO_TRIP, SAMPLE_BARCELONA_TRIP } from '@/lib/sampleData';
import { Header } from '@/components/navigation/Header';
import { TimelineView } from '@/components/timeline/TimelineView';
import { SocialCardModal } from '@/components/export/SocialCardModal';
import { BookMonographModal } from '@/components/export/BookMonographModal';
import { PhotoDropzone } from '@/components/upload/PhotoDropzone';
import { SettingsModal } from '@/components/settings/SettingsModal';

// Dynamic import for MapCanvas with an editorial map skeleton
const MapCanvas = dynamic(
  () => import('@/components/map/MapCanvas').then((mod) => mod.MapCanvas),
  {
    ssr: false,
    loading: () => (
      <div className="w-full h-full bg-atelier-warm dark:bg-atelier-ink relative flex flex-col items-center justify-center overflow-hidden">
        {/* Subtle decorative grid background */}
        <div
          className="absolute inset-0 opacity-20 text-sand-400"
          style={{
            backgroundImage:
              'linear-gradient(to right, currentColor 1px, transparent 1px), linear-gradient(to bottom, currentColor 1px, transparent 1px)',
            backgroundSize: '48px 48px',
          }}
        />
        <div className="relative z-10 flex flex-col items-center gap-3.5 text-sand-600 dark:text-sand-400">
          <div className="w-11 h-11 rounded-2xl bg-atelier-terracotta/10 border border-atelier-terracotta/30 flex items-center justify-center text-atelier-terracotta shadow-subtle animate-pulse">
            <span className="w-3 h-3 rounded-full bg-atelier-terracotta" />
          </div>
          <div className="text-xs font-serif tracking-widest uppercase font-bold text-sand-800 dark:text-sand-200">
            Rendering Cartographic Canvas
          </div>
          <p className="text-[11px] text-sand-500 font-mono">Loading OpenStreetMap &amp; Micro-Corridor Trajectories</p>
        </div>
      </div>
    ),
  }
);

export default function EpiLogDashboard() {
  const [trip, setTrip] = useState<EpiLogTrip>(SAMPLE_KYOTO_TRIP);
  const [activeStopId, setActiveStopId] = useState<string | null>(
    SAMPLE_KYOTO_TRIP.stops[0]?.id || null
  );
  const [hoveredStopId, setHoveredStopId] = useState<string | null>(null);

  // Modals & Sheets
  const [socialModalStop, setSocialModalStop] = useState<TravelStop | null>(null);
  const [isBookModalOpen, setIsBookModalOpen] = useState(false);
  const [isUploadModalOpen, setIsUploadModalOpen] = useState(false);
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);
  const [apiKey, setApiKey] = useState('');

  // Mobile viewport tab
  const [mobileTab, setMobileTab] = useState<'timeline' | 'map'>('timeline');

  // AI Synthesis Loading
  const [synthesizingStopId, setSynthesizingStopId] = useState<string | null>(null);
  const [isSynthesizingAll, setIsSynthesizingAll] = useState(false);
  const [synthesisError, setSynthesisError] = useState<string | null>(null);
  const [synthesisProgress, setSynthesisProgress] = useState<{ current: number; total: number } | null>(null);
  const abortSynthesisRef = useRef(false);

  // Load API key from localStorage on mount
  useEffect(() => {
    const saved = localStorage.getItem('epilog_gemini_api_key');
    if (saved) {
      setApiKey(saved);
    }
  }, []);

  const handleSaveApiKey = (newKey: string) => {
    setApiKey(newKey);
    localStorage.setItem('epilog_gemini_api_key', newKey);
  };

  const handleLoadSampleTrip = (tripKey: 'kyoto' | 'barcelona' = 'kyoto') => {
    const selected = tripKey === 'barcelona' ? SAMPLE_BARCELONA_TRIP : SAMPLE_KYOTO_TRIP;
    setTrip(selected);
    setActiveStopId(selected.stops[0]?.id || null);
  };

  const handleTripGenerated = (newTrip: EpiLogTrip) => {
    setTrip(newTrip);
    setActiveStopId(newTrip.stops[0]?.id || null);
  };

  const handleUpdateStop = (updated: TravelStop) => {
    setTrip((prev) => ({
      ...prev,
      stops: prev.stops.map((s) => (s.id === updated.id ? updated : s)),
    }));
  };

  // Synthesize single stop with client-side Gemini engine (compatible with GitHub Pages)
  const handleSynthesizeStop = async (stop: TravelStop) => {
    setSynthesizingStopId(stop.id);

    try {
      const heroPhoto = stop.photos.find((p) => p.id === stop.heroPhotoId) || stop.photos[0];

      const { synthesizeSceneWithGemini, downscaleImage } = await import('@/lib/gemini');
      let photoBase64: string | undefined = undefined;
      
      if (heroPhoto?.file) {
        photoBase64 = await downscaleImage(heroPhoto.file);
      } else if (heroPhoto?.previewUrl) {
        try {
          const response = await fetch(heroPhoto.previewUrl);
          const blob = await response.blob();
          const file = new File([blob], 'sample.jpg', { type: blob.type });
          photoBase64 = await downscaleImage(file);
        } catch {
          // Fall through to text-only synthesis
        }
      }

      const result = await synthesizeSceneWithGemini({
        apiKey,
        poiName: stop.poiName,
        city: stop.locationContext.city,
        country: stop.locationContext.country,
        stopIndex: stop.stopIndex,
        lat: stop.centerCoords.lat,
        lng: stop.centerCoords.lng,
        photoBase64,
        existingReflection: {
          category: stop.reflection.category,
          userNotes: stop.reflection.userNotes,
        },
      });

      if (result.success) {
        handleUpdateStop({
          ...stop,
          centerCoords: result.exactVenue?.coords || stop.centerCoords,
          exactVenueName: result.exactVenue?.name || result.detectedVenueName || stop.exactVenueName,
          resolvedPrecisionMeters: result.resolvedPrecisionMeters || stop.resolvedPrecisionMeters,
          venueCandidates: result.venueCandidates || stop.venueCandidates,
          detectedDishes: result.detectedDishes || stop.detectedDishes,
          narrativeCaption: result.narrativeCaption,
          reflection: {
            ...stop.reflection,
            category: result.category || stop.reflection.category,
            takeawayText: result.takeawayText,
          },
        });
      }
    } catch (err) {
      console.error('Failed synthesizing stop:', err);
      setSynthesisError(`AI synthesis failed: ${err instanceof Error ? err.message : 'Unknown error'}`);
      setTimeout(() => setSynthesisError(null), 8000);
    } finally {
      setSynthesizingStopId(null);
    }
  };

  // Synthesize all stops sequentially
  const handleSynthesizeAllStops = async () => {
    if (trip.stops.length === 0) return;
    setIsSynthesizingAll(true);
    abortSynthesisRef.current = false;

    for (let i = 0; i < trip.stops.length; i++) {
      if (abortSynthesisRef.current) break;
      setSynthesisProgress({ current: i + 1, total: trip.stops.length });
      await handleSynthesizeStop(trip.stops[i]);
    }

    setSynthesisProgress(null);
    abortSynthesisRef.current = false;
    setIsSynthesizingAll(false);
  };

  return (
    <div className="flex flex-col h-screen w-screen overflow-hidden bg-sand-100 dark:bg-sand-950 text-sand-900 dark:text-sand-100">
      {/* Top Masthead Navigation Bar */}
      <Header
        currentTripId={trip.id}
        currentTripTitle={trip.title}
        onLoadSampleTrip={handleLoadSampleTrip}
        onOpenUploadModal={() => setIsUploadModalOpen(true)}
        onOpenSettingsModal={() => setIsSettingsOpen(true)}
        onOpenBookModal={() => setIsBookModalOpen(true)}
        mobileTab={mobileTab}
        onSetMobileTab={setMobileTab}
      />

      {synthesisError && (
        <div className="absolute top-16 left-1/2 transform -translate-x-1/2 z-50 flex items-center gap-3 bg-red-50 text-red-700 px-4 py-3 rounded-lg shadow-elevated border border-red-200">
          <span className="text-sm font-medium">{synthesisError}</span>
          <button onClick={() => setSynthesisError(null)} className="text-red-500 hover:text-red-700 font-bold">&times;</button>
        </div>
      )}

      {/* Option B: Clean Split Editorial Spread */}
      <main className="flex-1 flex overflow-hidden relative">
        {/* Left Pane: Chronological Monograph Journal */}
        <div
          className={`w-full md:w-[45%] shrink-0 h-full border-r border-sand-200 dark:border-sand-800/80 bg-sand-50/70 dark:bg-sand-950/70 backdrop-blur-sm z-10 transition-all flex flex-col relative ${
            mobileTab === 'timeline' ? 'block' : 'hidden md:block'
          }`}
        >
          {isSynthesizingAll && synthesisProgress && (
            <div className="absolute bottom-6 left-1/2 transform -translate-x-1/2 z-50 bg-white dark:bg-sand-900 border border-sand-200 dark:border-sand-700 shadow-elevated rounded-full px-4 py-2 flex items-center gap-3">
              <span className="text-sm font-medium whitespace-nowrap">
                Synthesizing {synthesisProgress.current} / {synthesisProgress.total}...
              </span>
              <button 
                onClick={() => { abortSynthesisRef.current = true; }}
                className="text-xs bg-red-100 text-red-700 px-2 py-1 rounded-full hover:bg-red-200"
              >
                Cancel
              </button>
            </div>
          )}
          <TimelineView
            trip={trip}
            activeStopId={activeStopId}
            hoveredStopId={hoveredStopId}
            onSelectStop={(id) => {
              setActiveStopId(id);
              if (window.innerWidth < 768) {
                setMobileTab('map');
              }
            }}
            onHoverStop={setHoveredStopId}
            onOpenSocialModal={(stop) => setSocialModalStop(stop)}
            onSynthesizeStop={handleSynthesizeStop}
            onSynthesizeAllStops={handleSynthesizeAllStops}
            onUpdateStop={handleUpdateStop}
            onOpenUploadModal={() => setIsUploadModalOpen(true)}
            onSelectSampleTrip={handleLoadSampleTrip}
            synthesizingStopId={synthesizingStopId}
            isSynthesizingAll={isSynthesizingAll}
          />
        </div>

        {/* Right Pane: MapLibre GL Cartography Canvas */}
        <div
          className={`flex-1 h-full relative ${
            mobileTab === 'map' ? 'block' : 'hidden md:block'
          }`}
        >
          <MapCanvas
            stops={trip.stops}
            activeStopId={activeStopId}
            hoveredStopId={hoveredStopId}
            onSelectStop={(id) => {
              setActiveStopId(id);
            }}
            onHoverStop={setHoveredStopId}
          />
        </div>
      </main>

      {/* 9:16 & 1:1 Social Story Modal */}
      <SocialCardModal
        stop={socialModalStop}
        isOpen={socialModalStop !== null}
        onClose={() => setSocialModalStop(null)}
      />

      {/* Fine-Art Coffee Table Book Layflat Monograph Modal */}
      <BookMonographModal
        trip={trip}
        isOpen={isBookModalOpen}
        onClose={() => setIsBookModalOpen(false)}
      />

      {/* Batch Ingestion & Extraction Dropzone */}
      <PhotoDropzone
        isOpen={isUploadModalOpen}
        onClose={() => setIsUploadModalOpen(false)}
        onTripGenerated={handleTripGenerated}
      />

      {/* Gemini Settings Modal */}
      <SettingsModal
        isOpen={isSettingsOpen}
        onClose={() => setIsSettingsOpen(false)}
        apiKey={apiKey}
        onSaveApiKey={handleSaveApiKey}
      />
    </div>
  );
}
