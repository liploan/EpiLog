'use client';

import React, { useState, useEffect } from 'react';
import { Key, X, Check, ExternalLink, Sparkles } from 'lucide-react';

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
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/75 backdrop-blur-md animate-in fade-in duration-200">
      <div
        className="relative w-full max-w-md bg-atelier-paper dark:bg-sand-900 border border-sand-300/80 dark:border-sand-800 rounded-3xl shadow-monograph p-6 space-y-6 text-sand-900 dark:text-sand-100"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-start justify-between">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-atelier-terracotta/10 text-atelier-terracotta flex items-center justify-center border border-atelier-terracotta/25">
              <Key className="w-4.5 h-4.5" />
            </div>
            <div>
              <h3 className="text-base font-serif font-bold text-sand-950 dark:text-sand-50">AI Intelligence Settings</h3>
              <p className="text-xs text-sand-500 dark:text-sand-400">Gemini 1.5 Flash Multimodal Vision</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-full bg-sand-200/60 dark:bg-sand-800 hover:bg-sand-300 dark:hover:bg-sand-700 text-sand-600 dark:text-sand-300 transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        <div className="space-y-3">
          <label className="text-xs font-semibold text-sand-800 dark:text-sand-200">
            Google Gemini API Key
          </label>
          <input
            type="password"
            placeholder="AIzaSy..."
            value={keyInput}
            onChange={(e) => setKeyInput(e.target.value)}
            className="w-full px-3.5 py-2.5 rounded-xl bg-white dark:bg-sand-800 border border-sand-300 dark:border-sand-700 text-sand-900 dark:text-sand-100 text-xs font-mono focus:outline-none focus:ring-1 focus:ring-atelier-terracotta shadow-subtle"
          />
          <div className="flex items-center justify-between text-[11px] text-sand-500 dark:text-sand-400">
            <span>Saved securely in local browser storage</span>
            <a
              href="https://aistudio.google.com/app/apikey"
              target="_blank"
              rel="noreferrer"
              className="text-atelier-terracotta hover:underline flex items-center gap-1 font-semibold"
            >
              <span>Get API Key</span>
              <ExternalLink className="w-3 h-3" />
            </a>
          </div>
        </div>

        <div className="p-3.5 rounded-2xl bg-sand-100/80 dark:bg-sand-800/60 border border-sand-200/80 dark:border-sand-700/80 text-xs text-sand-700 dark:text-sand-300 space-y-1.5">
          <div className="flex items-center gap-1.5 font-bold text-atelier-terracotta">
            <Sparkles className="w-3.5 h-3.5" />
            <span>Zero-Key Heuristic Mode</span>
          </div>
          <p className="text-[11px] text-sand-600 dark:text-sand-400 leading-normal">
            If left blank, EpiLog uses smart heuristic multimodal simulation so you can explore all clustering, maps, and social card features freely.
          </p>
        </div>

        <div className="flex items-center justify-end gap-2 pt-2">
          <button
            onClick={onClose}
            className="px-4 py-2 text-xs font-semibold text-sand-500 hover:text-sand-800 dark:hover:text-sand-200"
          >
            Cancel
          </button>
          <button
            onClick={handleSave}
            className="flex items-center gap-1.5 px-5 py-2 rounded-xl bg-atelier-terracotta hover:bg-atelier-terracotta-dark text-white font-semibold text-xs shadow-subtle transition-all"
          >
            {isSaved ? <Check className="w-3.5 h-3.5 text-emerald-300" /> : null}
            <span>{isSaved ? 'Saved!' : 'Save Key'}</span>
          </button>
        </div>
      </div>
    </div>
  );
};
