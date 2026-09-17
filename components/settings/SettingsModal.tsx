'use client';

import React, { useState, useEffect } from 'react';
import { Key, X, Check, ExternalLink, ShieldCheck, Sparkles } from 'lucide-react';

interface SettingsModalProps {
  isOpen: boolean;
  onClose: () => void;
  apiKey: string;
  onSaveApiKey: (key: string) => void;
}

export const SettingsModal: React.FC<SettingsModalProps> = ({
  isOpen,
  onClose,
  apiKey,
  onSaveApiKey,
}) => {
  const [keyInput, setKeyInput] = useState(apiKey);
  const [isSaved, setIsSaved] = useState(false);

  useEffect(() => {
    setKeyInput(apiKey);
  }, [apiKey]);

  if (!isOpen) return null;

  const handleSave = () => {
    onSaveApiKey(keyInput.trim());
    setIsSaved(true);
    setTimeout(() => {
      setIsSaved(false);
      onClose();
    }, 800);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md animate-in fade-in duration-200">
      <div
        className="relative w-full max-w-md bg-stone-900 border border-stone-800 rounded-3xl shadow-2xl p-6 space-y-6"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-start justify-between">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-xl bg-orange-600/20 text-orange-400 flex items-center justify-center">
              <Key className="w-4 h-4" />
            </div>
            <div>
              <h3 className="text-lg font-bold text-white">AI Intelligence Settings</h3>
              <p className="text-xs text-stone-400">Gemini 1.5 Flash Multimodal Vision</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-full bg-stone-800 hover:bg-stone-700 text-stone-400 hover:text-white"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        <div className="space-y-3">
          <label className="text-xs font-semibold text-stone-300">
            Google Gemini API Key
          </label>
          <input
            type="password"
            placeholder="AIzaSy..."
            value={keyInput}
            onChange={(e) => setKeyInput(e.target.value)}
            className="w-full px-3.5 py-2.5 rounded-xl bg-stone-800 border border-stone-700 text-white text-xs font-mono focus:outline-none focus:ring-2 focus:ring-orange-500"
          />
          <div className="flex items-center justify-between text-[11px] text-stone-400">
            <span>Saved securely in your local browser storage</span>
            <a
              href="https://aistudio.google.com/app/apikey"
              target="_blank"
              rel="noreferrer"
              className="text-orange-400 hover:underline flex items-center gap-1"
            >
              <span>Get API Key</span>
              <ExternalLink className="w-3 h-3" />
            </a>
          </div>
        </div>

        <div className="p-3 rounded-xl bg-stone-800/60 border border-stone-800 text-xs text-stone-300 space-y-1.5">
          <div className="flex items-center gap-1.5 font-bold text-orange-400">
            <Sparkles className="w-3.5 h-3.5" />
            <span>Zero-Key Heuristic Mode</span>
          </div>
          <p className="text-[11px] text-stone-400 leading-normal">
            If left blank, EpiLog uses smart heuristic multimodal simulation so you can explore all clustering, maps, and social card features freely.
          </p>
        </div>

        <div className="flex items-center justify-end gap-2 pt-2">
          <button
            onClick={onClose}
            className="px-4 py-2 text-xs font-semibold text-stone-400 hover:text-white"
          >
            Cancel
          </button>
          <button
            onClick={handleSave}
            className="flex items-center gap-1.5 px-5 py-2 rounded-xl bg-orange-600 hover:bg-orange-500 text-white font-bold text-xs shadow-md transition-all"
          >
            {isSaved ? <Check className="w-3.5 h-3.5 text-emerald-300" /> : null}
            <span>{isSaved ? 'Saved!' : 'Save Key'}</span>
          </button>
        </div>
      </div>
    </div>
  );
};
