'use client';

import React, { useRef, useState } from 'react';
import { TravelStop } from '@/types/epilog';
import { SocialCard916, CardTheme, AspectRatioType } from './SocialCard916';
import { toPng } from 'html-to-image';
import {
  X,
  Download,
  Check,
  Sparkles,
  Share2,
  Palette,
  LayoutTemplate,
  Smartphone,
  Square,
} from 'lucide-react';

interface SocialCardModalProps {
  stop: TravelStop | null;
  isOpen: boolean;
  onClose: () => void;
}

const THEMES: { id: CardTheme; name: string; desc: string; previewBg: string }[] = [
  {
    id: 'editorial-dark',
    name: 'Editorial Dark',
    desc: 'Deep obsidian with orange accents',
    previewBg: 'bg-stone-900 border-orange-500',
  },
  {
    id: 'magazine-light',
    name: 'Magazine Light',
    desc: 'Editorial ivory paper aesthetic',
    previewBg: 'bg-stone-100 border-stone-800',
  },
  {
    id: 'sunset-terracotta',
    name: 'Terracotta Sunset',
    desc: 'Warm gradient with glassmorphism',
    previewBg: 'bg-orange-900 border-amber-500',
  },
  {
    id: 'vintage-stamp',
    name: 'Vintage Passport',
    desc: 'Classic explorer border and stamp',
    previewBg: 'bg-amber-100 border-amber-800',
  },
];

export const SocialCardModal: React.FC<SocialCardModalProps> = ({
  stop,
  isOpen,
  onClose,
}) => {
  const [selectedTheme, setSelectedTheme] = useState<CardTheme>('editorial-dark');
  const [aspectRatio, setAspectRatio] = useState<AspectRatioType>('9:16');
  const [isExporting, setIsExporting] = useState(false);
  const cardRef = useRef<HTMLDivElement>(null);

  if (!isOpen || !stop) return null;

  const handleDownloadImage = async () => {
    if (!cardRef.current) return;
    setIsExporting(true);

    try {
      // High-res capture
      const dataUrl = await toPng(cardRef.current, {
        cacheBust: true,
        pixelRatio: 2.5,
      });

      const link = document.createElement('a');
      link.download = `EpiLog-${aspectRatio === '1:1' ? 'Square' : 'Story'}-Stop-${stop.stopIndex}-${stop.poiName.replace(/[^a-zA-Z0-9]/g, '_')}.png`;
      link.href = dataUrl;
      link.click();
    } catch (err) {
      console.error('Failed to export card image:', err);
    } finally {
      setIsExporting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md animate-in fade-in duration-200">
      <div
        className="relative w-full max-w-4xl max-h-[92vh] bg-stone-900 border border-stone-800 rounded-3xl shadow-2xl flex flex-col md:flex-row overflow-hidden"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Close Button */}
        <button
          onClick={onClose}
          className="absolute top-4 right-4 z-20 p-2 rounded-full bg-stone-800/80 hover:bg-stone-700 text-stone-300 hover:text-white transition-colors"
        >
          <X className="w-5 h-5" />
        </button>

        {/* Card Live Preview (Left / Center) */}
        <div className="flex-1 p-6 md:p-8 flex items-center justify-center bg-black/40 overflow-y-auto">
          <div className="scale-[0.80] sm:scale-90 md:scale-95 origin-center transition-transform">
            <SocialCard916
              stop={stop}
              theme={selectedTheme}
              aspectRatio={aspectRatio}
              cardRef={cardRef}
            />
          </div>
        </div>

        {/* Control Panel (Right) */}
        <div className="w-full md:w-80 p-6 flex flex-col justify-between border-t md:border-t-0 md:border-l border-stone-800 bg-stone-900/95 space-y-6">
          <div className="space-y-5">
            <div>
              <div className="flex items-center gap-2 text-xs font-bold text-orange-400 uppercase tracking-wider">
                <Palette className="w-4 h-4" />
                <span>Social Event Studio</span>
              </div>
              <h3 className="text-xl font-bold text-white mt-1">Export Social Card</h3>
              <p className="text-xs text-stone-400 mt-1">
                Client-rendered DOM cards for Instagram Stories, square posts, and Pinterest pins.
              </p>
            </div>

            {/* Format / Aspect Ratio Selector */}
            <div className="space-y-2">
              <label className="text-xs font-semibold text-stone-300">Aspect Ratio</label>
              <div className="grid grid-cols-2 gap-2">
                <button
                  onClick={() => setAspectRatio('9:16')}
                  className={`flex items-center justify-center gap-2 p-2.5 rounded-xl border text-xs font-bold transition-all ${
                    aspectRatio === '9:16'
                      ? 'border-orange-500 bg-orange-500/15 text-orange-400'
                      : 'border-stone-800 bg-stone-800/40 text-stone-400 hover:text-stone-200'
                  }`}
                >
                  <Smartphone className="w-3.5 h-3.5" />
                  <span>9:16 Story</span>
                </button>
                <button
                  onClick={() => setAspectRatio('1:1')}
                  className={`flex items-center justify-center gap-2 p-2.5 rounded-xl border text-xs font-bold transition-all ${
                    aspectRatio === '1:1'
                      ? 'border-orange-500 bg-orange-500/15 text-orange-400'
                      : 'border-stone-800 bg-stone-800/40 text-stone-400 hover:text-stone-200'
                  }`}
                >
                  <Square className="w-3.5 h-3.5" />
                  <span>1:1 Post</span>
                </button>
              </div>
            </div>

            {/* Theme Selector */}
            <div className="space-y-2">
              <label className="text-xs font-semibold text-stone-300">Editorial Palette</label>
              <div className="space-y-1.5">
                {THEMES.map((theme) => (
                  <button
                    key={theme.id}
                    onClick={() => setSelectedTheme(theme.id)}
                    className={`w-full p-2.5 rounded-xl border text-left flex items-center gap-3 transition-all ${
                      selectedTheme === theme.id
                        ? 'border-orange-500 bg-orange-500/10 text-white shadow-md'
                        : 'border-stone-800 bg-stone-800/40 text-stone-400 hover:text-stone-200 hover:bg-stone-800'
                    }`}
                  >
                    <span className={`w-3.5 h-3.5 rounded-full border-2 ${theme.previewBg}`} />
                    <div className="flex-1 truncate">
                      <div className="text-xs font-bold">{theme.name}</div>
                      <div className="text-[10px] text-stone-400 truncate">{theme.desc}</div>
                    </div>
                    {selectedTheme === theme.id && <Check className="w-4 h-4 text-orange-400" />}
                  </button>
                ))}
              </div>
            </div>
          </div>

          {/* Export Action Buttons */}
          <div className="space-y-2.5 pt-4 border-t border-stone-800">
            <button
              onClick={handleDownloadImage}
              disabled={isExporting}
              className="w-full flex items-center justify-center gap-2 px-4 py-3 rounded-xl bg-orange-600 hover:bg-orange-500 text-white font-bold text-sm shadow-lg shadow-orange-600/30 transition-all disabled:opacity-50"
            >
              <Download className={`w-4 h-4 ${isExporting ? 'animate-bounce' : ''}`} />
              <span>{isExporting ? 'Rendering Card...' : `Download ${aspectRatio} PNG`}</span>
            </button>

            <button
              onClick={onClose}
              className="w-full py-1.5 text-xs font-semibold text-stone-400 hover:text-stone-200 transition-colors text-center"
            >
              Close Studio
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
