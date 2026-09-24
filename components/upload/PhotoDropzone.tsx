'use client';

import React, { useState, useRef } from 'react';
import { processBatchPhotos } from '@/lib/ingestion';
import { matchOrphansToAnchors, clusterPhotosIntoStops, computeTotalDistanceKm } from '@/lib/stitcher';
import { enrichStop } from '@/lib/enrichment';
import { parseTrackFile, interpolateTrackCoords, TrackPoint } from '@/lib/gpx';
import { EpiLogTrip, PhotoAsset, TravelStop } from '@/types/epilog';
import {
  UploadCloud,
  FileImage,
  Smartphone,
  Camera,
  CheckCircle2,
  AlertCircle,
  Sparkles,
  Sliders,
  X,
  ArrowRight,
  Layers,
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

  // Parameter tuning
  const [windowMinutes, setWindowMinutes] = useState(15);
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
      alert('Error extracting metadata from photos.');
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
      const enrichedStops = await Promise.all(
        initialStops.map(async (stop) => {
          const enriched = await enrichStop(stop);
          return enriched;
        })
      );

      const totalDistanceKm = computeTotalDistanceKm(enrichedStops);

      const allDates = enrichedStops.map((s) => s.startTime.getTime());
      const minDate = new Date(Math.min(...allDates));
      const maxDate = new Date(Math.max(...enrichedStops.map((s) => s.endTime.getTime())));

      const trip: EpiLogTrip = {
        id: `trip-${Date.now().toString(36)}`,
        title: tripTitle || 'Trip To Spain',
        dateRange: { start: minDate, end: maxDate },
        stops: enrichedStops,
        totalDistanceKm,
      };

      onTripGenerated(trip);
      onClose();
    } catch (err) {
      console.error('Failed generating trip:', err);
      alert('Error creating trip from photos.');
    } finally {
      setIsProcessing(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md animate-in fade-in duration-200">
      <div
        className="relative w-full max-w-2xl bg-stone-900 border border-stone-800 rounded-3xl shadow-2xl p-6 sm:p-8 space-y-6 max-h-[90vh] overflow-y-auto"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-start justify-between">
          <div>
            <div className="flex items-center gap-2 text-xs font-bold text-orange-400 uppercase tracking-wider">
              <UploadCloud className="w-4 h-4" />
              <span>Phase 1 & 2 Ingestion</span>
            </div>
            <h2 className="text-2xl font-bold text-white mt-1">Upload Photo Batch &amp; GPS Tracks</h2>
            <p className="text-xs text-stone-400 mt-1">
              Supports mixed JPG/PNG, iPhone HEIC, and companion <span className="text-amber-400 font-mono">.gpx / Google Timeline</span> tracks for 1–3 meter POI precision.
            </p>
          </div>
          <button
            onClick={onClose}
            className="p-2 rounded-full bg-stone-800 hover:bg-stone-700 text-stone-300 hover:text-white"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

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
              ? 'border-orange-500 bg-orange-500/10'
              : 'border-stone-700 bg-stone-800/40 hover:border-stone-500 hover:bg-stone-800/70'
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
            <div className="w-14 h-14 mx-auto rounded-2xl bg-orange-600/20 border border-orange-500/30 flex items-center justify-center text-orange-400 shadow-inner">
              <UploadCloud className="w-7 h-7" />
            </div>

            <div>
              <p className="text-sm font-bold text-white">
                Drag &amp; drop photos and optional <span className="text-amber-400">.gpx track</span> here, or <span className="text-orange-400">browse files</span>
              </p>
              <p className="text-xs text-stone-400 mt-1">
                EXIF GPS, camera models, and GPS tracks are stitched client-side with zero upload latency
              </p>
            </div>
          </div>
        </div>

        {/* Progress bar */}
        {isProcessing && (
          <div className="p-4 rounded-xl bg-stone-800/80 border border-stone-700 space-y-2">
            <div className="flex items-center justify-between text-xs text-stone-300 font-semibold">
              <span className="flex items-center gap-2">
                <Sparkles className="w-3.5 h-3.5 text-orange-400 animate-spin" />
                <span>{progressMsg}</span>
              </span>
              <span>{progressPercent}%</span>
            </div>
            <div className="w-full h-2 rounded-full bg-stone-700 overflow-hidden">
              <div
                className="h-full bg-orange-500 transition-all duration-300"
                style={{ width: `${progressPercent}%` }}
              />
            </div>
          </div>
        )}

        {/* Extraction Stats Summary */}
        {stats && (
          <div className="p-4 rounded-2xl bg-stone-800/60 border border-stone-700/80 space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-stone-200 flex items-center gap-1.5">
                <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                <span>Spatiotemporal Ingestion Summary</span>
              </span>
              <span className="text-xs text-stone-400">{extractedAssets.length} Photos Analyzed</span>
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 text-xs">
              <div className="p-2.5 rounded-xl bg-stone-900 border border-stone-800">
                <div className="text-[11px] text-stone-400 flex items-center gap-1">
                  <Smartphone className="w-3 h-3 text-emerald-400" />
                  <span>GPS Anchors</span>
                </div>
                <div className="text-base font-bold text-emerald-400 mt-0.5">{stats.anchors}</div>
              </div>

              <div className="p-2.5 rounded-xl bg-stone-900 border border-stone-800">
                <div className="text-[11px] text-stone-400 flex items-center gap-1">
                  <Camera className="w-3 h-3 text-amber-400" />
                  <span>DSLR Orphans</span>
                </div>
                <div className="text-base font-bold text-amber-400 mt-0.5">{stats.orphans}</div>
              </div>

              <div className="p-2.5 rounded-xl bg-stone-900 border border-stone-800">
                <div className="text-[11px] text-stone-400">Matched to Anchors</div>
                <div className="text-base font-bold text-white mt-0.5">
                  {stats.matched} <span className="text-[10px] text-stone-400">(&plusmn;{windowMinutes}m)</span>
                </div>
              </div>

              <div className="p-2.5 rounded-xl bg-stone-900 border border-stone-800">
                <div className="text-[11px] text-stone-400 flex items-center gap-1">
                  <Navigation2 className="w-3 h-3 text-sky-400" />
                  <span>GPS Trackpoints</span>
                </div>
                <div className="text-base font-bold text-sky-400 mt-0.5">
                  {stats.trackPoints > 0 ? stats.trackPoints : 'N/A'}
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Algorithm Tuning Accordion */}
        <div className="p-4 rounded-2xl bg-stone-800/40 border border-stone-800 space-y-4">
          <div className="flex items-center gap-2 text-xs font-bold text-stone-300">
            <Sliders className="w-4 h-4 text-orange-400" />
            <span>Spatiotemporal Clustering Parameters</span>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 text-xs">
            <div className="space-y-1">
              <label className="text-stone-400">Trip Name</label>
              <input
                type="text"
                value={tripTitle}
                onChange={(e) => setTripTitle(e.target.value)}
                className="w-full px-3 py-1.5 rounded-lg bg-stone-900 border border-stone-700 text-white text-xs"
              />
            </div>

            <div className="space-y-1">
              <label className="text-stone-400">Orphan Window: {windowMinutes} min</label>
              <input
                type="range"
                min={1}
                max={10}
                value={windowMinutes}
                onChange={(e) => setWindowMinutes(Number(e.target.value))}
                className="w-full accent-orange-500"
              />
            </div>

            <div className="space-y-1">
              <label className="text-stone-400">Stop Cluster Radius: {distanceMeters}m</label>
              <input
                type="range"
                min={100}
                max={1000}
                step={50}
                value={distanceMeters}
                onChange={(e) => setDistanceMeters(Number(e.target.value))}
                className="w-full accent-orange-500"
              />
            </div>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex items-center justify-end gap-3 pt-2">
          <button
            onClick={onClose}
            className="px-4 py-2.5 rounded-xl text-xs font-semibold text-stone-400 hover:text-white"
          >
            Cancel
          </button>

          <button
            onClick={handleFinalizeTrip}
            disabled={extractedAssets.length === 0 || isProcessing}
            className="flex items-center gap-2 px-5 py-2.5 rounded-xl bg-orange-600 hover:bg-orange-500 text-white font-bold text-xs shadow-lg shadow-orange-600/30 transition-all disabled:opacity-50"
          >
            <span>Synthesize Travel Log</span>
            <ArrowRight className="w-4 h-4" />
          </button>
        </div>
      </div>
    </div>
  );
};
