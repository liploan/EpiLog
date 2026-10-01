'use client';

import React, { useState, useEffect } from 'react';
import {
  Compass,
  UploadCloud,
  Settings,
  Map,
  List,
  BookOpen,
  ChevronDown,
  Globe,
  Sun,
  Moon,
} from 'lucide-react';

interface HeaderProps {
  currentTripId?: string;
  currentTripTitle?: string;
  onLoadSampleTrip: (tripKey: 'kyoto' | 'barcelona') => void;
  onOpenUploadModal: () => void;
  onOpenSettingsModal: () => void;
  onOpenBookModal: () => void;
  mobileTab: 'timeline' | 'map';
  onSetMobileTab: (tab: 'timeline' | 'map') => void;
}

export const Header: React.FC<HeaderProps> = ({
  currentTripId,
  currentTripTitle,
  onLoadSampleTrip,
  onOpenUploadModal,
  onOpenSettingsModal,
  onOpenBookModal,
  mobileTab,
  onSetMobileTab,
}) => {
  const [demoMenuOpen, setDemoMenuOpen] = useState(false);
  const [isDarkMode, setIsDarkMode] = useState(false);

  useEffect(() => {
    const savedTheme = localStorage.getItem('epilog_theme');
    if (savedTheme === 'dark') {
      setIsDarkMode(true);
      document.documentElement.classList.add('dark');
    } else {
      setIsDarkMode(false);
      document.documentElement.classList.remove('dark');
    }
  }, []);

  const toggleTheme = () => {
    const nextTheme = !isDarkMode;
    setIsDarkMode(nextTheme);
    if (nextTheme) {
      document.documentElement.classList.add('dark');
      localStorage.setItem('epilog_theme', 'dark');
    } else {
      document.documentElement.classList.remove('dark');
      localStorage.setItem('epilog_theme', 'light');
    }
  };

  const dropdownRef = React.useRef<HTMLDivElement>(null);
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target as Node)) {
        setDemoMenuOpen(false);
      }
    };
    if (demoMenuOpen) {
      document.addEventListener('mousedown', handleClickOutside);
      return () => document.removeEventListener('mousedown', handleClickOutside);
    }
  }, [demoMenuOpen]);

  return (
    <header className="h-16 border-b border-sand-200 dark:border-sand-800/80 bg-atelier-paper/90 dark:bg-atelier-ink/90 backdrop-blur-md px-4 sm:px-6 flex items-center justify-between z-30 shrink-0 transition-colors">
      {/* Brand Masthead */}
      <div className="flex items-center gap-3.5">
        <div className="w-9 h-9 rounded-xl bg-atelier-terracotta text-white flex items-center justify-center shadow-sm shadow-atelier-terracotta/25 border border-atelier-terracotta-dark/20">
          <Compass className="w-4.5 h-4.5 stroke-[1.75]" />
        </div>
        <div>
          <div className="flex items-center gap-2.5">
            <span className="font-serif text-lg sm:text-xl font-bold tracking-tight text-sand-950 dark:text-sand-50">
              EpiLog
            </span>
            <span className="px-2 py-0.5 rounded-full text-[10px] font-medium tracking-wide bg-sand-200/80 dark:bg-sand-800 text-atelier-terracotta dark:text-sand-300 border border-sand-300/60 dark:border-sand-700/60">
              Atelier Edition
            </span>
            <span className="hidden lg:inline text-xs font-serif italic text-sand-500 dark:text-sand-400 pl-3 border-l border-sand-300 dark:border-sand-800">
              “A picture is worth a thousand words—let them write it for you.”
            </span>
          </div>
          <p className="text-[11px] text-sand-500 dark:text-sand-400 hidden sm:block font-medium">
            The AI Travel Journal &amp; Intellectual Keepsake
          </p>
        </div>
      </div>

      {/* Mobile Tab Toggle (visible on small screens) */}
      <div className="flex md:hidden items-center p-1 rounded-xl bg-sand-200/70 dark:bg-sand-900 border border-sand-300/60 dark:border-sand-800 text-xs font-semibold">
        <button
          onClick={() => onSetMobileTab('timeline')}
          className={`flex items-center gap-1 px-3 py-1.5 rounded-lg transition-all ${
            mobileTab === 'timeline'
              ? 'bg-white dark:bg-sand-800 text-atelier-terracotta shadow-sm font-bold'
              : 'text-sand-600 dark:text-sand-400'
          }`}
        >
          <List className="w-3.5 h-3.5" />
          <span>Journal</span>
        </button>
        <button
          onClick={() => onSetMobileTab('map')}
          className={`flex items-center gap-1 px-3 py-1.5 rounded-lg transition-all ${
            mobileTab === 'map'
              ? 'bg-white dark:bg-sand-800 text-atelier-terracotta shadow-sm font-bold'
              : 'text-sand-600 dark:text-sand-400'
          }`}
        >
          <Map className="w-3.5 h-3.5" />
          <span>Map</span>
        </button>
      </div>

      {/* Action Toolbar */}
      <div className="flex items-center gap-2.5">
        {/* Sample Trip Dropdown Picker */}
        <div className="relative" ref={dropdownRef}>
          <button
            onClick={() => setDemoMenuOpen(!demoMenuOpen)}
            className="hidden sm:flex items-center gap-2 px-3 py-1.5 rounded-xl text-xs font-semibold text-sand-800 dark:text-sand-200 bg-sand-200/60 dark:bg-sand-900 hover:bg-sand-200 dark:hover:bg-sand-800 border border-sand-300/70 dark:border-sand-700/70 transition-colors shadow-subtle"
            title="Switch between curated travel journals"
          >
            <Globe className="w-3.5 h-3.5 text-atelier-terracotta" />
            <span className="font-medium truncate max-w-[200px]">
              {currentTripTitle || 'Trip Details'}
            </span>
            <ChevronDown className="w-3 h-3 opacity-60 ml-0.5" />
          </button>

          {demoMenuOpen && (
            <div className="absolute top-full right-0 mt-2 w-64 rounded-2xl bg-white dark:bg-sand-900 shadow-editorial border border-sand-200 dark:border-sand-800 py-2 z-40 animate-in fade-in slide-in-from-top-2 duration-150">
              <div className="px-3.5 py-1 text-[10px] font-bold uppercase tracking-widest text-sand-400 border-b border-sand-100 dark:border-sand-800">
                Curated Travel Folios
              </div>
              <button
                onClick={() => {
                  onLoadSampleTrip('kyoto');
                  setDemoMenuOpen(false);
                }}
                className={`w-full text-left px-3.5 py-2.5 text-xs flex items-center justify-between transition-colors ${
                  currentTripId !== 'trip-barcelona-2024'
                    ? 'bg-sand-100 dark:bg-sand-800/80 text-atelier-terracotta font-bold'
                    : 'text-sand-700 dark:text-sand-300 hover:bg-sand-50 dark:hover:bg-sand-800/50'
                }`}
              >
                <div>
                  <div className="font-serif font-bold text-sm">⛩️ Kyoto &amp; Higashiyama</div>
                  <div className="text-[11px] text-sand-500 dark:text-sand-400 font-normal">5 stops &bull; Autumn Kaiseki &amp; Temples</div>
                </div>
                {currentTripId !== 'trip-barcelona-2024' && <span className="w-2 h-2 rounded-full bg-atelier-terracotta" />}
              </button>

              <button
                onClick={() => {
                  onLoadSampleTrip('barcelona');
                  setDemoMenuOpen(false);
                }}
                className={`w-full text-left px-3.5 py-2.5 text-xs flex items-center justify-between transition-colors ${
                  currentTripId === 'trip-barcelona-2024'
                    ? 'bg-sand-100 dark:bg-sand-800/80 text-atelier-terracotta font-bold'
                    : 'text-sand-700 dark:text-sand-300 hover:bg-sand-50 dark:hover:bg-sand-800/50'
                }`}
              >
                <div>
                  <div className="font-serif font-bold text-sm">🇪🇸 Barcelona Modernisme</div>
                  <div className="text-[11px] text-sand-500 dark:text-sand-400 font-normal">6 stops &bull; Gaudí, Tapas &amp; Port Vell</div>
                </div>
                {currentTripId === 'trip-barcelona-2024' && <span className="w-2 h-2 rounded-full bg-atelier-terracotta" />}
              </button>
            </div>
          )}
        </div>

        {/* Coffee Table Monograph Book Button */}
        <button
          onClick={onOpenBookModal}
          className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-semibold text-atelier-ochre dark:text-amber-300 bg-amber-500/10 dark:bg-amber-950/40 hover:bg-amber-500/20 border border-amber-500/25 transition-all shadow-subtle"
          title="Preview and export Fine-Art Layflat Coffee Table Monograph"
        >
          <BookOpen className="w-3.5 h-3.5" />
          <span className="hidden sm:inline font-medium">Coffee Table Monograph</span>
          <span className="sm:hidden font-medium">Book</span>
        </button>

        {/* Upload Photos Button */}
        <button
          onClick={onOpenUploadModal}
          aria-label="Upload photos"
          className="flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl text-xs font-semibold bg-atelier-terracotta hover:bg-atelier-terracotta-dark text-white shadow-subtle shadow-atelier-terracotta/30 border border-atelier-terracotta-dark/20 transition-all"
        >
          <UploadCloud className="w-3.5 h-3.5" />
          <span className="hidden sm:inline">Upload Photos</span>
          <span className="sm:hidden">Upload</span>
        </button>

        {/* Theme Toggle Button */}
        <button
          onClick={toggleTheme}
          aria-label="Toggle dark mode"
          className="p-2 rounded-xl text-sand-600 dark:text-sand-300 hover:bg-sand-200/70 dark:hover:bg-sand-800 transition-colors"
          title={isDarkMode ? 'Switch to Warm Linen Paper Mode' : 'Switch to Dark Espresso Mode'}
        >
          {isDarkMode ? <Sun className="w-4 h-4 text-amber-400" /> : <Moon className="w-4 h-4 text-sand-600" />}
        </button>

        {/* Settings Button */}
        <button
          onClick={onOpenSettingsModal}
          aria-label="Settings"
          className="p-2 rounded-xl text-sand-600 dark:text-sand-300 hover:bg-sand-200/70 dark:hover:bg-sand-800 transition-colors"
          title="AI & API Settings"
        >
          <Settings className="w-4 h-4" />
        </button>
      </div>
    </header>
  );
};
