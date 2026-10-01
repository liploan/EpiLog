'use client';

import React, { useState, useRef } from 'react';
import { processBatchPhotos } from '@/lib/ingestion';
import { matchOrphansToAnchors, clusterPhotosIntoStops, computeTotalDistanceKm } from '@/lib/stitcher';
import { enrichStopsSequentially } from '@/lib/enrichment';
import { parseTrackFile, interpolateTrackCoords, TrackPoint } from '@/lib/gpx';
import { EpiLogTrip, PhotoAsset, TravelStop } from '@/types/epilog';
import {
  UploadCloud,
  Smartphone,
  Camera,
  CheckCircle2,
  Sparkles,
  Sliders,
  X,
  ArrowRight,
  Navigation2,
} from 'lucide-react';

interface PhotoDropzoneProps {
  isOpen: boolean;
  onClose: () => void;
  onTripGenerated: (trip: EpiLogTrip) => void;
}

export const PhotoDropzone: React.FC<PhotoDropzoneProps> = ({
  isOpen,
  onClose,
  onTripGenerated,
}) => {
  const [isDragging, setIsDragging] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);
  const [progressMsg, setProgressMsg] = useState('');
  const [progressPercent, setProgressPercent] = useState(0);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  // Parameter tuning
  const [windowMinutes, setWindowMinutes] = useState(3);
  const [timeGapHours, setTimeGapHours] = useState(3);
  const [distanceMeters, setDistanceMeters] = useState(2000);
  const [tripTitle, setTripTitle] = useState('Trip To Spain');

  // Extraction results
  const [extractedAssets, setExtractedAssets] = useState<PhotoAsset[]>([]);
  const [trackPointsCount, setTrackPointsCount] = useState<number>(0);
  const [stats, setStats] = useState<{
    anchors: number;
    orphans: number;
    matched: number;
    unmatched: number;
    trackPoints: number;
  } | null>(null);

  const fileInputRef = useRef<HTMLInputElement>(null);

  if (!isOpen) return null;

  const handleFiles = async (fileList: FileList | null) => {
    if (!fileList || fileList.length === 0) return;

    const allFiles = Array.from(fileList);
    const trackFiles = allFiles.filter((f) => {
      const name = f.name.toLowerCase();
      return name.endsWith('.gpx') || name.endsWith('.kml') || name.endsWith('.json');
    });
    const photoFiles = allFiles.filter((f) => {
      const name = f.name.toLowerCase();
      return !name.endsWith('.gpx') && !name.endsWith('.kml') && !name.endsWith('.json');
    });

    setIsProcessing(true);
    setProgressPercent(10);
    setProgressMsg(`Reading files...`);

    try {
      // 1. Parse companion GPX / Location track files if present
      let allTrackPoints: TrackPoint[] = [];
      if (trackFiles.length > 0) {
        setProgressMsg(`Parsing ${trackFiles.length} GPS track files...`);
        for (const tf of trackFiles) {
          const text = await tf.text();
          const pts = parseTrackFile(text);
          allTrackPoints.push(...pts);
        }
        allTrackPoints.sort((a, b) => a.timestamp.getTime() - b.timestamp.getTime());
        setTrackPointsCount(allTrackPoints.length);
      }

      // 2. Process EXIF metadata for photos
      const rawAssets = await processBatchPhotos(photoFiles, (current, total, name) => {
        const pct = Math.round((current / (total || 1)) * 50) + 15;
        setProgressPercent(pct);
        setProgressMsg(`Extracting EXIF metadata: ${name} (${current}/${total})`);
      });

      // 3. If track points exist, interpolate coordinates for photos
      if (allTrackPoints.length > 0) {
        setProgressMsg('Snapping photos to GPX track log (1-3m accuracy)...');
        for (const asset of rawAssets) {
          const trackCoord = interpolateTrackCoords(asset.timestamp, allTrackPoints, 900);
          if (trackCoord) {
            asset.coords = trackCoord;
            asset.isAnchor = true;
          }
        }
      }

      // 4. Sort chronologically
      const sorted = [...rawAssets].sort(
        (a, b) => new Date(a.timestamp).getTime() - new Date(b.timestamp).getTime()
      );

      // 5. Run Spatiotemporal Stitcher
      setProgressPercent(80);
      setProgressMsg('Matching DSLR orphans to GPS anchor shots...');
      const stitched = matchOrphansToAnchors(sorted, windowMinutes * 60);

      setExtractedAssets(stitched.photos);
      setStats({
        anchors: stitched.anchorsCount,
        orphans: stitched.orphansCount,
        matched: stitched.matchedOrphansCount,
        unmatched: stitched.unmatchedOrphansCount,
        trackPoints: allTrackPoints.length,
      });

      setProgressPercent(100);
      setProgressMsg('Extraction and orphan matching complete!');
    } catch (err) {
      console.error('Batch processing failed:', err);
      setErrorMsg('Error extracting metadata from photos.');
    } finally {
      setIsProcessing(false);
    }
  };

  const handleFinalizeTrip = async () => {
    if (extractedAssets.length === 0) return;

    setIsProcessing(true);
    setProgressMsg('Clustering stops and enriching with Reverse Geocoding & Wikimedia...');

    try {
      // 1. Ensure sorted chronologically
      const sortedAssets = [...extractedAssets].sort(
        (a, b) => new Date(a.timestamp).getTime() - new Date(b.timestamp).getTime()
      );

      // 2. Cluster stops
      const initialStops = clusterPhotosIntoStops(sortedAssets, {
        maxTimeGapHours: timeGapHours,
        maxDistanceMeters: distanceMeters,
      });

      // 3. Reverse Geocode & Historical Enrich stops in parallel
      setProgressMsg(`Enriching ${initialStops.length} stops with reverse geocoding & historical trivia...`);
      const enrichedStops = await enrichStopsSequentially(initialStops);

      const totalDistanceKm = computeTotalDistanceKm(enrichedStops);

      const allDates = enrichedStops.map((s) => s.startTime.getTime());
      const minDate = new Date(Math.min(...allDates));
      const maxDate = new Date(Math.max(...enrichedStops.map((s) => s.endTime.getTime())));

      const trip: EpiLogTrip = {
        id: `trip-${Date.now().toString(36)}`,
        title: tripTitle || 'My Trip',
        dateRange: { start: minDate, end: maxDate },
        stops: enrichedStops,
        totalDistanceKm,
      };

      onTripGenerated(trip);
      onClose();
    } catch (err) {
      console.error('Failed generating trip:', err);
      setErrorMsg('Error creating trip from photos.');
    } finally {
      setIsProcessing(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/75 backdrop-blur-md animate-in fade-in duration-200">
      <div
        className="relative w-full max-w-2xl bg-atelier-paper dark:bg-sand-900 border border-sand-300/80 dark:border-sand-800 rounded-3xl shadow-monograph p-6 sm:p-8 space-y-6 max-h-[90vh] overflow-y-auto text-sand-900 dark:text-sand-100"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-start justify-between">
          <div>
            <div className="flex items-center gap-2 text-xs font-bold text-atelier-terracotta uppercase tracking-wider">
              <UploadCloud className="w-4 h-4" />
              <span>Spatiotemporal Ingestion</span>
            </div>
            <h2 className="text-2xl font-serif font-bold text-sand-950 dark:text-sand-50 mt-1">Upload Photo Batch &amp; GPS Tracks</h2>
            <p className="text-xs text-sand-600 dark:text-sand-400 mt-1">
              Supports mixed JPG/PNG, iPhone HEIC, and companion <span className="text-atelier-ochre font-mono">.gpx / Google Timeline</span> tracks for 1–3 meter POI precision.
            </p>
          </div>
          <button
            onClick={onClose}
            className="p-2 rounded-full bg-sand-200/60 dark:bg-sand-800 hover:bg-sand-300 dark:hover:bg-sand-700 text-sand-600 dark:text-sand-300 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {errorMsg && (
          <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg text-sm flex items-center justify-between">
            <span>{errorMsg}</span>
            <button onClick={() => setErrorMsg(null)} className="ml-2 text-red-500 hover:text-red-700">✕</button>
          </div>
        )}

        {/* Dropzone Area */}
        <div
          onDragOver={(e) => {
            e.preventDefault();
            setIsDragging(true);
          }}
          onDragLeave={() => setIsDragging(false)}
          onDrop={(e) => {
            e.preventDefault();
            setIsDragging(false);
            handleFiles(e.dataTransfer.files);
          }}
          onClick={() => fileInputRef.current?.click()}
          className={`relative border-2 border-dashed rounded-2xl p-8 sm:p-10 text-center cursor-pointer transition-all ${
            isDragging
              ? 'border-atelier-terracotta bg-atelier-terracotta/10'
              : 'border-sand-300 dark:border-sand-700 bg-sand-100/60 dark:bg-sand-800/40 hover:border-atelier-terracotta hover:bg-sand-200/50'
          }`}
        >
          <input
            ref={fileInputRef}
            type="file"
            multiple
            accept=".jpg,.jpeg,.png,.heic,.heif,.gpx,.kml,.json"
            className="hidden"
            onChange={(e) => handleFiles(e.target.files)}
          />

          <div className="space-y-3">
            <div className="w-14 h-14 mx-auto rounded-2xl bg-atelier-terracotta/10 border border-atelier-terracotta/30 flex items-center justify-center text-atelier-terracotta shadow-inner">
              <UploadCloud className="w-7 h-7" />
            </div>

            <div>
              <p className="text-sm font-serif font-bold text-sand-900 dark:text-sand-100">
                Drag &amp; drop photos and optional <span className="text-atelier-ochre">.gpx track</span> here, or <span className="text-atelier-terracotta font-semibold">browse files</span>
              </p>
              <p className="text-xs text-sand-500 dark:text-sand-400 mt-1">
                EXIF GPS, camera models, and GPS tracks are stitched client-side with zero upload latency
              </p>
            </div>
          </div>
        </div>

        {/* Progress bar */}
        {isProcessing && (
          <div className="p-4 rounded-2xl bg-sand-100/80 dark:bg-sand-800/80 border border-sand-300 dark:border-sand-700 space-y-2">
            <div className="flex items-center justify-between text-xs text-sand-800 dark:text-sand-200 font-semibold">
              <span className="flex items-center gap-2">
                <Sparkles className="w-3.5 h-3.5 text-atelier-terracotta animate-spin" />
                <span>{progressMsg}</span>
              </span>
              <span>{progressPercent}%</span>
            </div>
            <div className="w-full h-2 rounded-full bg-sand-200 dark:bg-sand-700 overflow-hidden">
              <div
                className="h-full bg-atelier-terracotta transition-all duration-300"
                style={{ width: `${progressPercent}%` }}
              />
            </div>
          </div>
        )}

        {/* Extraction Stats Summary */}
        {stats && (
          <div className="p-4 rounded-2xl bg-sand-100/70 dark:bg-sand-800/60 border border-sand-300/80 dark:border-sand-700/80 space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-sand-900 dark:text-sand-100 flex items-center gap-1.5 font-serif">
                <CheckCircle2 className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
                <span>Spatiotemporal Ingestion Summary</span>
              </span>
              <span className="text-xs text-sand-500">{extractedAssets.length} Photos Analyzed</span>
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 text-xs">
              <div className="p-2.5 rounded-xl bg-white/80 dark:bg-sand-900 border border-sand-200 dark:border-sand-800">
                <div className="text-[11px] text-sand-500 flex items-center gap-1">
                  <Smartphone className="w-3 h-3 text-atelier-olive" />
                  <span>GPS Anchors</span>
                </div>
                <div className="text-base font-serif font-bold text-atelier-olive dark:text-emerald-400 mt-0.5">{stats.anchors}</div>
              </div>

              <div className="p-2.5 rounded-xl bg-white/80 dark:bg-sand-900 border border-sand-200 dark:border-sand-800">
                <div className="text-[11px] text-sand-500 flex items-center gap-1">
                  <Camera className="w-3 h-3 text-atelier-ochre" />
                  <span>DSLR Orphans</span>
                </div>
                <div className="text-base font-serif font-bold text-atelier-ochre dark:text-amber-400 mt-0.5">{stats.orphans}</div>
              </div>

              <div className="p-2.5 rounded-xl bg-white/80 dark:bg-sand-900 border border-sand-200 dark:border-sand-800">
                <div className="text-[11px] text-sand-500">Matched to Anchors</div>
                <div className="text-base font-serif font-bold text-sand-900 dark:text-sand-100 mt-0.5">
                  {stats.matched} <span className="text-[10px] text-sand-500">(&plusmn;{windowMinutes}m)</span>
                </div>
              </div>

              <div className="p-2.5 rounded-xl bg-white/80 dark:bg-sand-900 border border-sand-200 dark:border-sand-800">
                <div className="text-[11px] text-sand-500 flex items-center gap-1">
                  <Navigation2 className="w-3 h-3 text-atelier-terracotta" />
                  <span>GPS Trackpoints</span>
                </div>
                <div className="text-base font-serif font-bold text-sand-900 dark:text-sand-100 mt-0.5">
                  {stats.trackPoints > 0 ? stats.trackPoints : 'N/A'}
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Algorithm Tuning Parameters */}
        <div className="p-4 rounded-2xl bg-sand-100/50 dark:bg-sand-800/40 border border-sand-200/80 dark:border-sand-800 space-y-4">
          <div className="flex items-center gap-2 text-xs font-bold text-sand-800 dark:text-sand-200 font-serif">
            <Sliders className="w-4 h-4 text-atelier-terracotta" />
            <span>Spatiotemporal Clustering Parameters</span>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 text-xs">
            <div className="space-y-1">
              <label className="text-sand-500">Trip Name</label>
              <input
                type="text"
                value={tripTitle}
                onChange={(e) => setTripTitle(e.target.value)}
                className="w-full px-3 py-1.5 rounded-xl bg-white dark:bg-sand-900 border border-sand-300 dark:border-sand-700 text-sand-900 dark:text-sand-100 text-xs shadow-subtle"
              />
            </div>

            <div className="space-y-1">
              <label className="text-sand-500">Orphan Window: {windowMinutes} min</label>
              <input
                type="range"
                min={1}
                max={10}
                value={windowMinutes}
                onChange={(e) => setWindowMinutes(Number(e.target.value))}
                className="w-full accent-atelier-terracotta"
              />
            </div>

            <div className="space-y-1">
              <label className="text-sand-500">Stop Cluster Radius: {distanceMeters}m</label>
              <input
                type="range"
                min={100}
                max={1000}
                step={50}
                value={distanceMeters}
                onChange={(e) => setDistanceMeters(Number(e.target.value))}
                className="w-full accent-atelier-terracotta"
              />
            </div>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex items-center justify-end gap-3 pt-2">
          <button
            onClick={onClose}
            className="px-4 py-2 text-xs font-semibold text-sand-500 hover:text-sand-800 dark:hover:text-sand-200"
          >
            Cancel
          </button>

          <button
            onClick={handleFinalizeTrip}
            disabled={extractedAssets.length === 0 || isProcessing}
            className="flex items-center gap-2 px-5 py-2.5 rounded-xl bg-atelier-terracotta hover:bg-atelier-terracotta-dark text-white font-semibold text-xs shadow-subtle transition-all disabled:opacity-50"
          >
            <span>Synthesize Travel Log</span>
            <ArrowRight className="w-4 h-4" />
          </button>
        </div>
      </div>
    </div>
  );
};
