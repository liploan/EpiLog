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

export interface CulinaryDish {
  name: string;
  cuisineOrOrigin?: string;
  description?: string;
  ingredients?: string[];
  pairingOrNotes?: string;
}

export interface ArtworkArtifact {
  title: string;
  artistOrCreator?: string;
  creationYearOrPeriod?: string;
  mediumOrStyle?: string;
  description?: string;
  museumOrLocationName?: string;
  significanceOrInsight?: string;
}

export interface ArchitecturalFeature {
  elementName: string;
  architectOrSchool?: string;
  eraOrStyle?: string;
  description?: string;
}

export interface MicroEstablishment {
  name: string;
  type: string; // restaurant, cafe, bar, museum, gallery, theater, monument, landmark, etc.
  coords: GeoCoordinate;
  address?: string;
  precisionMeters: number; // e.g. 1.0
  photoIds?: string[];
}

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
  exactVenueName?: string;
  resolvedPrecisionMeters?: number;
  venueCandidates?: {
    name: string;
    type: string;
    coords: GeoCoordinate;
    address?: string;
    distanceMeters?: number;
  }[];
  microEstablishments?: MicroEstablishment[];
  detectedDishes?: CulinaryDish[];
  detectedArtworks?: ArtworkArtifact[];
  detectedArchitecture?: ArchitecturalFeature[];
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
