'use client';

import React, { useState } from 'react';
import {
  Compass,
  UploadCloud,
  Sparkles,
  Settings,
  Map,
  List,
  RotateCcw,
  BookOpen,
  ChevronDown,
  Globe,
} from 'lucide-react';

interface HeaderProps {
  currentTripId?: string;
  onLoadSampleTrip: (tripKey: 'kyoto' | 'barcelona') => void;
  onOpenUploadModal: () => void;
  onOpenSettingsModal: () => void;
  onOpenBookModal: () => void;
  mobileTab: 'timeline' | 'map';
  onSetMobileTab: (tab: 'timeline' | 'map') => void;
}

export const Header: React.FC<HeaderProps> = ({
  currentTripId,
  onLoadSampleTrip,
  onOpenUploadModal,
  onOpenSettingsModal,
  onOpenBookModal,
  mobileTab,
  onSetMobileTab,
}) => {
  const [demoMenuOpen, setDemoMenuOpen] = useState(false);

  return (
    <header className="h-16 border-b border-stone-200 dark:border-stone-800 bg-white/80 dark:bg-stone-900/80 backdrop-blur-md px-4 sm:px-6 flex items-center justify-between z-30 shrink-0">
      {/* Brand */}
      <div className="flex items-center gap-3">
        <div className="w-9 h-9 rounded-2xl bg-gradient-to-tr from-orange-600 to-amber-500 flex items-center justify-center text-white shadow-md shadow-orange-600/20">
          <Compass className="w-5 h-5" />
        </div>
        <div>
          <div className="flex items-center gap-2">
            <span className="font-serif font-extrabold text-lg sm:text-xl tracking-tight text-stone-900 dark:text-stone-100">
              EpiLog
            </span>
            <span className="px-1.5 py-0.5 rounded text-[10px] font-bold bg-orange-100 dark:bg-orange-950/60 text-orange-600 dark:text-orange-400">
              v1.0
            </span>
            <span className="hidden lg:inline text-[11px] font-serif italic text-stone-400 pl-2 border-l border-stone-700">
              “A picture is worth a thousand words—let them write it for you.”
            </span>
          </div>
          <p className="text-[11px] text-stone-500 dark:text-stone-400 hidden sm:block">
            The AI Travel Journal &amp; Intellectual Keepsake
          </p>
        </div>
      </div>

      {/* Mobile Tab Toggle (visible on small screens) */}
      <div className="flex md:hidden items-center p-1 rounded-xl bg-stone-100 dark:bg-stone-800 text-xs font-semibold">
        <button
          onClick={() => onSetMobileTab('timeline')}
          className={`flex items-center gap-1 px-3 py-1.5 rounded-lg transition-all ${
            mobileTab === 'timeline'
              ? 'bg-white dark:bg-stone-900 text-orange-600 shadow-sm font-bold'
              : 'text-stone-500'
          }`}
        >
          <List className="w-3.5 h-3.5" />
          <span>Journal</span>
        </button>
        <button
          onClick={() => onSetMobileTab('map')}
          className={`flex items-center gap-1 px-3 py-1.5 rounded-lg transition-all ${
            mobileTab === 'map'
              ? 'bg-white dark:bg-stone-900 text-orange-600 shadow-sm font-bold'
              : 'text-stone-500'
          }`}
        >
          <Map className="w-3.5 h-3.5" />
          <span>Map</span>
        </button>
      </div>

      {/* Action Toolbar */}
      <div className="flex items-center gap-2">
        {/* Sample Trip Dropdown Picker */}
        <div className="relative">
          <button
            onClick={() => setDemoMenuOpen(!demoMenuOpen)}
            className="hidden sm:flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-semibold text-stone-700 dark:text-stone-200 bg-stone-100 dark:bg-stone-800 hover:bg-stone-200 dark:hover:bg-stone-700 border border-stone-200 dark:border-stone-700 transition-colors shadow-sm"
            title="Switch between sample travel demos"
          >
            <Globe className="w-3.5 h-3.5 text-orange-500" />
            <span>{currentTripId === 'trip-barcelona-2024' ? '🇪🇸 Barcelona Demo' : '⛩️ Kyoto Demo'}</span>
            <ChevronDown className="w-3 h-3 opacity-60 ml-0.5" />
          </button>

          {demoMenuOpen && (
            <div className="absolute top-full right-0 mt-2 w-56 rounded-2xl bg-white dark:bg-stone-900 shadow-2xl border border-stone-200 dark:border-stone-800 py-1.5 z-40 animate-in fade-in slide-in-from-top-2 duration-150">
              <div className="px-3 py-1.5 text-[10px] font-bold uppercase tracking-wider text-stone-400 border-b border-stone-100 dark:border-stone-800">
                Sample Journeys
              </div>
              <button
                onClick={() => {
                  onLoadSampleTrip('kyoto');
                  setDemoMenuOpen(false);
                }}
                className={`w-full text-left px-3.5 py-2.5 text-xs flex items-center justify-between transition-colors ${
                  currentTripId !== 'trip-barcelona-2024'
                    ? 'bg-orange-50 dark:bg-orange-950/40 text-orange-600 font-bold'
                    : 'text-stone-700 dark:text-stone-300 hover:bg-stone-100 dark:hover:bg-stone-800'
                }`}
              >
                <div>
                  <div className="font-semibold">⛩️ Kyoto & Higashiyama</div>
                  <div className="text-[10px] text-stone-500 dark:text-stone-400 font-normal">5 stops &bull; Autumn Kaiseki</div>
                </div>
                {currentTripId !== 'trip-barcelona-2024' && <span className="w-2 h-2 rounded-full bg-orange-600" />}
              </button>

              <button
                onClick={() => {
                  onLoadSampleTrip('barcelona');
                  setDemoMenuOpen(false);
                }}
                className={`w-full text-left px-3.5 py-2.5 text-xs flex items-center justify-between transition-colors ${
                  currentTripId === 'trip-barcelona-2024'
                    ? 'bg-orange-50 dark:bg-orange-950/40 text-orange-600 font-bold'
                    : 'text-stone-700 dark:text-stone-300 hover:bg-stone-100 dark:hover:bg-stone-800'
                }`}
              >
                <div>
                  <div className="font-semibold">🇪🇸 Barcelona Modernisme</div>
                  <div className="text-[10px] text-stone-500 dark:text-stone-400 font-normal">4 stops &bull; Gaudí &amp; Tapas</div>
                </div>
                {currentTripId === 'trip-barcelona-2024' && <span className="w-2 h-2 rounded-full bg-orange-600" />}
              </button>
            </div>
          )}
        </div>

        <button
          onClick={onOpenBookModal}
          className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-semibold text-amber-300 bg-amber-950/60 hover:bg-amber-900/80 border border-amber-500/30 transition-all shadow-sm"
          title="Preview and export Fine-Art Layflat Coffee Table Monograph"
        >
          <BookOpen className="w-3.5 h-3.5 text-amber-400" />
          <span className="hidden sm:inline">Coffee Table Book</span>
          <span className="sm:hidden">Book</span>
        </button>

        <button
          onClick={onOpenUploadModal}
          className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-bold bg-orange-600 hover:bg-orange-500 text-white shadow-md shadow-orange-600/20 transition-all"
        >
          <UploadCloud className="w-3.5 h-3.5" />
          <span className="hidden sm:inline">Upload Photos</span>
          <span className="sm:hidden">Upload</span>
        </button>

        <button
          onClick={onOpenSettingsModal}
          className="p-2 rounded-xl text-stone-600 dark:text-stone-300 hover:bg-stone-100 dark:hover:bg-stone-800 transition-colors"
          title="AI & API Settings"
        >
          <Settings className="w-4 h-4" />
        </button>
      </div>
    </header>
  );
};
