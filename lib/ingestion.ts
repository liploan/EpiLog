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
    // Dynamic import to avoid SSR issues
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
 * Extracts EXIF metadata (GPS, Timestamp, Camera model) using exifr
 */
export async function extractPhotoMetadata(
  file: File,
  previewBlob: Blob
): Promise<PhotoAsset> {
  const exifr = await import('exifr');

  let exifData: any = null;
  try {
    // Parse full EXIF + GPS + TIFF headers
    exifData = await exifr.parse(file, {
      gps: true,
      pick: [
        'latitude',
        'longitude',
        'altitude',
        'DateTimeOriginal',
        'CreateDate',
        'ModifyDate',
        'Make',
        'Model',
        'LensModel',
        'FocalLength',
        'FNumber',
      ],
    });
  } catch (err) {
    console.warn(`EXIF parsing failed for ${file.name}:`, err);
  }

  const id = `photo-${Date.now()}-${Math.random().toString(36).substring(2, 9)}`;
  const previewUrl = URL.createObjectURL(previewBlob);

  // Determine timestamp: EXIF DateTimeOriginal -> File lastModified -> Now
  let timestamp = new Date();
  if (exifData?.DateTimeOriginal) {
    timestamp = new Date(exifData.DateTimeOriginal);
  } else if (exifData?.CreateDate) {
    timestamp = new Date(exifData.CreateDate);
  } else if (file.lastModified) {
    timestamp = new Date(file.lastModified);
  }

  // Determine GPS coordinates
  let coords = null;
  const hasValidGps =
    exifData &&
    typeof exifData.latitude === 'number' &&
    typeof exifData.longitude === 'number' &&
    !isNaN(exifData.latitude) &&
    !isNaN(exifData.longitude);

  if (hasValidGps) {
    coords = {
      lat: Number(exifData.latitude.toFixed(6)),
      lng: Number(exifData.longitude.toFixed(6)),
      altitude: exifData.altitude ? Number(exifData.altitude.toFixed(1)) : undefined,
    };
  }

  // Camera model
  let cameraModel: string | undefined = undefined;
  if (exifData?.Make || exifData?.Model) {
    const make = exifData.Make || '';
    const model = exifData.Model || '';
    cameraModel = model.includes(make) ? model : `${make} ${model}`.trim();
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
      // 2. Extract EXIF metadata & GPS
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
