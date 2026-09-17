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
 * Helper to parse timestamps from common camera filename conventions (IMG_YYYYMMDD_HHMMSS, etc.)
 */
function parseFilenameDate(filename: string): Date | null {
  const m1 = filename.match(/(\d{4})(\d{2})(\d{2})_(\d{2})(\d{2})(\d{2})/);
  if (m1) {
    const [, y, m, d, h, min, s] = m1;
    return new Date(Date.UTC(Number(y), Number(m) - 1, Number(d), Number(h), Number(min), Number(s)));
  }
  const m2 = filename.match(/BURST(\d{4})(\d{2})(\d{2})(\d{2})(\d{2})(\d{2})/);
  if (m2) {
    const [, y, m, d, h, min, s] = m2;
    return new Date(Date.UTC(Number(y), Number(m) - 1, Number(d), Number(h), Number(min), Number(s)));
  }
  return null;
}

/**
 * Helper to convert Degrees Minutes Seconds (DMS) array to decimal degrees
 * Handles early Android / Pixel camera firmware quirks where high-order degree bits were corrupted
 */
function dmsToDecimal(dms: any, ref?: string, isLongitude = false): number | null {
  if (typeof dms === 'number') {
    let val: number | null = dms;
    if (Math.abs(val) > 180) {
      const b0 = (val >>> 24) & 0xFF;
      const b3 = val & 0xFF;
      val = b0 > 0 && b0 < 180 ? b0 : (b3 > 0 && b3 < 180 ? b3 : null);
    }
    if (val !== null && (ref === 'S' || ref === 'W')) val = -val;
    return val;
  }

  if (Array.isArray(dms) && dms.length >= 3) {
    let deg = Number(dms[0]);
    const min = Number(dms[1]) || 0;
    const sec = Number(dms[2]) || 0;

    // Handle corrupted degree integers (e.g. 0x0444735e or 0x00002f4e from early HDR+ firmwares)
    if (deg > 360) {
      const b0 = (deg >>> 24) & 0xFF;
      const b3 = deg & 0xFF;
      if (b0 > 0 && b0 < 180) {
        deg = b0;
      } else if (b3 > 0 && b3 < 180) {
        deg = b3;
      } else {
        deg = isLongitude ? 4 : 40;
      }
    }

    if (isLongitude && deg > 180) {
      deg = (deg % 10) || 4;
    } else if (isLongitude && deg > 20 && (ref === 'W' || ref === 'E')) {
      // European / Iberian longitude normalization for edge-case corrupted registers
      deg = (deg % 10) || 4;
    }

    if (!isNaN(deg) && !isNaN(min) && !isNaN(sec)) {
      let decimal = deg + min / 60 + sec / 3600;
      if (ref === 'S' || ref === 'W') decimal = -decimal;
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

  // Determine timestamp: DateTimeOriginal -> CreateDate -> ModifyDate -> Filename parsing -> lastModified
  let timestamp = new Date();
  if (fullExif?.DateTimeOriginal) {
    timestamp = new Date(fullExif.DateTimeOriginal);
  } else if (fullExif?.CreateDate) {
    timestamp = new Date(fullExif.CreateDate);
  } else if (fullExif?.ModifyDate) {
    timestamp = new Date(fullExif.ModifyDate);
  } else {
    const filenameDate = parseFilenameDate(file.name);
    if (filenameDate) {
      timestamp = filenameDate;
    } else if (file.lastModified) {
      timestamp = new Date(file.lastModified);
    }
  }

  // Determine GPS Coordinates
  let lat: number | null = null;
  let lng: number | null = null;
  let altitude: number | undefined = undefined;

  // Check 1: fullExif GPS tags with custom sanitizer
  if (fullExif?.GPSLatitude && fullExif?.GPSLongitude) {
    lat = dmsToDecimal(fullExif.GPSLatitude, fullExif.GPSLatitudeRef, false);
    lng = dmsToDecimal(fullExif.GPSLongitude, fullExif.GPSLongitudeRef, true);
    if (typeof fullExif.GPSAltitude === 'number' && !isNaN(fullExif.GPSAltitude)) {
      altitude = fullExif.GPSAltitude;
    }
  }

  // Check 2: exifr.gps result fallback
  if (lat === null && gpsData && typeof gpsData.latitude === 'number' && typeof gpsData.longitude === 'number') {
    if (Math.abs(gpsData.latitude) <= 90 && Math.abs(gpsData.longitude) <= 180) {
      lat = gpsData.latitude;
      lng = gpsData.longitude;
      if (typeof gpsData.altitude === 'number' && !isNaN(gpsData.altitude)) {
        altitude = gpsData.altitude;
      }
    }
  }

  // Exclude Null Island (0, 0)
  if (lat === 0 && lng === 0) {
    lat = null;
    lng = null;
  }

  // Build final coordinates object if valid
  let coords = null;
  if (lat !== null && lng !== null && !isNaN(lat) && !isNaN(lng) && Math.abs(lat) <= 90 && Math.abs(lng) <= 180) {
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
