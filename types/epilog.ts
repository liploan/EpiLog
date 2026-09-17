// types/epilog.ts

export interface GeoCoordinate {
  lat: number;
  lng: number;
  altitude?: number;
}

export interface PhotoAsset {
  id: string;
  file?: File;
  previewUrl: string;
  name?: string;
  timestamp: Date;
  coords: GeoCoordinate | null;
  cameraModel?: string;
  isAnchor: boolean; // true = phone with GPS, false = DSLR orphan
  matchedAnchorId?: string;
  timeDiffSeconds?: number;
}

export type ReflectionCategory = 'Architectural' | 'Culinary' | 'Natural' | 'Cultural';

export interface TravelStop {
  id: string;
  stopIndex: number;
  startTime: Date;
  endTime: Date;
  centerCoords: GeoCoordinate;
  poiName: string;
  locationContext: {
    neighborhood?: string;
    city: string;
    country: string;
  };
  photos: PhotoAsset[];
  heroPhotoId: string;
  narrativeCaption: string; // 1-2 sentence scene summary
  reflection: {
    category: ReflectionCategory;
    takeawayText: string; // "What I Learned"
    userNotes?: string;
  };
  worldOnThisDay?: {
    dateStr: string;
    headline: string;
    sourceUrl?: string;
  };
}

export interface EpiLogTrip {
  id: string;
  title: string;
  dateRange: { start: Date; end: Date };
  stops: TravelStop[];
  totalDistanceKm: number;
}

export interface IngestionStats {
  totalFiles: number;
  anchorCount: number;
  orphanCount: number;
  matchedOrphanCount: number;
  stopCount: number;
}
