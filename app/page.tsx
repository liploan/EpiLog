'use client';

import React, { useState, useEffect } from 'react';
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
      <div className="w-full h-full bg-[#121316] relative flex flex-col items-center justify-center overflow-hidden">
        {/* Subtle decorative grid background */}
        <div
          className="absolute inset-0 opacity-15"
          style={{
            backgroundImage:
              'linear-gradient(to right, #334155 1px, transparent 1px), linear-gradient(to bottom, #334155 1px, transparent 1px)',
            backgroundSize: '40px 40px',
          }}
        />
        <div className="relative z-10 flex flex-col items-center gap-3 text-stone-400">
          <div className="w-10 h-10 rounded-2xl bg-orange-600/20 border border-orange-500/30 flex items-center justify-center text-orange-400 animate-pulse">
            <span className="w-3 h-3 rounded-full bg-orange-500" />
          </div>
          <div className="text-xs font-semibold tracking-wider uppercase text-stone-300">
            Mounting Cartography Canvas
          </div>
          <p className="text-[11px] text-stone-500 font-mono">Initializing WebGL &amp; OpenStreetMap Vector Engine</p>
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

      let photoBase64: string | undefined = undefined;
      if (heroPhoto?.file) {
        photoBase64 = await new Promise((resolve) => {
          const reader = new FileReader();
          reader.onloadend = () => resolve(reader.result as string);
          reader.readAsDataURL(heroPhoto.file!);
        });
      }

      const { synthesizeSceneWithGemini } = await import('@/lib/gemini');
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
    } finally {
      setSynthesizingStopId(null);
    }
  };

  // Synthesize all stops sequentially
  const handleSynthesizeAllStops = async () => {
    if (trip.stops.length === 0) return;
    setIsSynthesizingAll(true);

    for (const stop of trip.stops) {
      await handleSynthesizeStop(stop);
    }

    setIsSynthesizingAll(false);
  };

  return (
    <div className="flex flex-col h-screen w-screen overflow-hidden bg-stone-950 text-stone-100">
      {/* Top Navigation Bar */}
      <Header
        currentTripId={trip.id}
        onLoadSampleTrip={handleLoadSampleTrip}
        onOpenUploadModal={() => setIsUploadModalOpen(true)}
        onOpenSettingsModal={() => setIsSettingsOpen(true)}
        onOpenBookModal={() => setIsBookModalOpen(true)}
        mobileTab={mobileTab}
        onSetMobileTab={setMobileTab}
      />

      {/* Main Dual-Pane Workspace */}
      <main className="flex-1 flex overflow-hidden relative">
        {/* Left Pane: Chronological Timeline Journal */}
        <div
          className={`w-full md:w-[480px] lg:w-[540px] xl:w-[580px] shrink-0 h-full border-r border-stone-800/80 bg-stone-950/60 backdrop-blur-sm z-10 ${
            mobileTab === 'timeline' ? 'block' : 'hidden md:block'
          }`}
        >
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
