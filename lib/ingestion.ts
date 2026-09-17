import { PhotoAsset } from '@/types/epilog';

/**
 * Converts a HEIC/HEIF file to JPEG blob using client-side heic2any
 */
export async function convertHeicToJpeg(file: File): Promise<Blob> {
  const isHeic =
    file.type === 'image/heic' ||
    file.type === 'image/heif' ||
    file.name.toLowerCase().endsWith('.heic') ||
    file.name.toLowerCase().endsWith('.heif');

  if (!isHeic) {
    return file;
  }

  try {
    const heic2any = (await import('heic2any')).default;
    const converted = await heic2any({
      blob: file,
      toType: 'image/jpeg',
      quality: 0.85,
    });

    if (Array.isArray(converted)) {
      return converted[0];
    }
    return converted;
  } catch (error) {
    console.warn(`HEIC conversion failed for ${file.name}, using raw file:`, error);
    return file;
  }
}

/**
 * Helper to convert Degrees Minutes Seconds (DMS) array to decimal degrees
 */
function dmsToDecimal(dms: any, ref?: string): number | null {
  if (typeof dms === 'number') {
    let val = dms;
    if (ref && (ref === 'S' || ref === 'W')) val = -val;
    return val;
  }

  if (Array.isArray(dms) && dms.length >= 3) {
    const deg = Number(dms[0]);
    const min = Number(dms[1]);
    const sec = Number(dms[2]);
    if (!isNaN(deg) && !isNaN(min) && !isNaN(sec)) {
      let decimal = deg + min / 60 + sec / 3600;
      if (ref && (ref === 'S' || ref === 'W')) decimal = -decimal;
      return decimal;
    }
  }

  return null;
}

/**
 * Extracts EXIF metadata & GPS coordinates comprehensively using exifr
 */
export async function extractPhotoMetadata(
  file: File,
  previewBlob: Blob
): Promise<PhotoAsset> {
  const exifr = await import('exifr');

  let gpsData: any = null;
  let fullExif: any = null;

  try {
    // 1. Dedicated GPS extraction (checks EXIF GPS IFD, XMP, and TIFF)
    gpsData = await exifr.gps(file).catch(() => null);
  } catch (err) {
    console.warn(`exifr.gps error on ${file.name}:`, err);
  }

  try {
    // 2. Full metadata extraction (no restrictive pick filter)
    fullExif = await exifr
      .parse(file, {
        tiff: true,
        xmp: true,
        iptc: true,
        jfif: true,
        gps: true,
        translateValues: true,
        reviveValues: true,
        sanitize: true,
      })
      .catch(() => null);
  } catch (err) {
    console.warn(`exifr.parse error on ${file.name}:`, err);
  }

  const id = `photo-${Date.now()}-${Math.random().toString(36).substring(2, 9)}`;
  const previewUrl = URL.createObjectURL(previewBlob);

  // Determine timestamp: DateTimeOriginal -> CreateDate -> ModifyDate -> lastModified
  let timestamp = new Date();
  if (fullExif?.DateTimeOriginal) {
    timestamp = new Date(fullExif.DateTimeOriginal);
  } else if (fullExif?.CreateDate) {
    timestamp = new Date(fullExif.CreateDate);
  } else if (fullExif?.ModifyDate) {
    timestamp = new Date(fullExif.ModifyDate);
  } else if (file.lastModified) {
    timestamp = new Date(file.lastModified);
  }

  // Determine GPS Coordinates
  let lat: number | null = null;
  let lng: number | null = null;
  let altitude: number | undefined = undefined;

  // Check 1: exifr.gps result
  if (
    gpsData &&
    typeof gpsData.latitude === 'number' &&
    typeof gpsData.longitude === 'number' &&
    !isNaN(gpsData.latitude) &&
    !isNaN(gpsData.longitude)
  ) {
    lat = gpsData.latitude;
    lng = gpsData.longitude;
    if (typeof gpsData.altitude === 'number' && !isNaN(gpsData.altitude)) {
      altitude = gpsData.altitude;
    }
  }

  // Check 2: fullExif parsed coordinates
  if (lat === null && fullExif) {
    if (typeof fullExif.latitude === 'number' && typeof fullExif.longitude === 'number') {
      lat = fullExif.latitude;
      lng = fullExif.longitude;
    } else if (fullExif.GPSLatitude && fullExif.GPSLongitude) {
      lat = dmsToDecimal(fullExif.GPSLatitude, fullExif.GPSLatitudeRef);
      lng = dmsToDecimal(fullExif.GPSLongitude, fullExif.GPSLongitudeRef);
    }
  }

  // Build final coordinates object if valid
  let coords = null;
  if (lat !== null && lng !== null && !isNaN(lat) && !isNaN(lng)) {
    coords = {
      lat: Number(lat.toFixed(6)),
      lng: Number(lng.toFixed(6)),
      altitude: altitude ? Number(altitude.toFixed(1)) : undefined,
    };
  }

  // Camera model detection
  let cameraModel: string | undefined = undefined;
  if (fullExif?.Make || fullExif?.Model) {
    const make = (fullExif.Make || '').trim();
    const model = (fullExif.Model || '').trim();
    cameraModel = model.toLowerCase().includes(make.toLowerCase()) ? model : `${make} ${model}`.trim();
  }

  const isAnchor = coords !== null;

  console.log(`[EpiLog Ingestion] ${file.name} -> Anchor: ${isAnchor}`, {
    coords,
    camera: cameraModel,
    timestamp: timestamp.toISOString(),
  });

  return {
    id,
    file,
    previewUrl,
    name: file.name,
    timestamp,
    coords,
    cameraModel,
    isAnchor,
  };
}

/**
 * Batch ingestion worker: processes multiple files concurrently
 */
export async function processBatchPhotos(
  files: File[],
  onProgress?: (processed: number, total: number, currentFileName: string) => void
): Promise<PhotoAsset[]> {
  const results: PhotoAsset[] = [];
  const total = files.length;

  for (let i = 0; i < total; i++) {
    const file = files[i];
    if (onProgress) {
      onProgress(i, total, file.name);
    }

    try {
      // 1. Convert HEIC if needed
      const previewBlob = await convertHeicToJpeg(file);
      // 2. Extract EXIF metadata & GPS with full multi-segment parser
      const asset = await extractPhotoMetadata(file, previewBlob);
      results.push(asset);
    } catch (err) {
      console.error(`Failed processing ${file.name}:`, err);
    }
  }

  if (onProgress) {
    onProgress(total, total, 'Complete');
  }

  return results;
}
