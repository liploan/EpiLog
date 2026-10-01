import os
import sys
import json
import re
import subprocess
from datetime import datetime
from collections import defaultdict
import pandas as pd

PHOTOS_DIR = '/Users/liploan/Documents/EpiLog/demo/TripToSpainPhotos'
OUTPUT_REPORT_JSON = '/Users/liploan/Documents/EpiLog/gps_extraction_validation.json'

def parse_filename_time(filename):
    m = re.search(r'(\d{4})(\d{2})(\d{2})_(\d{2})(\d{2})(\d{2})', filename)
    if m:
        y, mo, d, h, mi, s = map(int, m.groups())
        return datetime(y, mo, d, h, mi, s)
    m = re.search(r'BURST(\d{4})(\d{2})(\d{2})(\d{2})(\d{2})(\d{2})', filename)
    if m:
        y, mo, d, h, mi, s = map(int, m.groups())
        return datetime(y, mo, d, h, mi, s)
    return None

def extract_exiftool_metadata():
    print(f"[1/4] Running ExifTool on {PHOTOS_DIR} ...")
    cmd = [
        'exiftool',
        '-json',
        '-FileName',
        '-CreateDate',
        '-ModifyDate',
        '-DateTimeOriginal',
        '-SubSecTimeOriginal',
        '-GPSLatitude',
        '-GPSLatitudeRef',
        '-GPSLongitude',
        '-GPSLongitudeRef',
        '-GPSAltitude',
        '-GPSAltitudeRef',
        '-GPSDateStamp',
        '-GPSTimeStamp',
        '-GPSProcessingMethod',
        '-Make',
        '-Model',
        '-Software',
        PHOTOS_DIR
    ]
    res = subprocess.run(cmd, capture_output=True, text=True)
    if res.returncode != 0:
        print("Error running exiftool:", res.stderr)
        return []
    return json.loads(res.stdout)

def extract_exifr_metadata():
    print(f"[2/4] Running Node.js exifr extraction ...")
    env = os.environ.copy()
    env['TARGET_DIR'] = PHOTOS_DIR
    node_script = """
    const exifr = require('exifr');
    const fs = require('fs');
    const path = require('path');

    async function run() {
      const dir = process.env.TARGET_DIR;
      const files = fs.readdirSync(dir).filter(f => f.toLowerCase().endsWith('.jpg') || f.toLowerCase().endsWith('.jpeg'));
      const results = [];

      for (const fn of files) {
        const filePath = path.join(dir, fn);
        const buffer = fs.readFileSync(filePath);
        let gpsData = null;
        let fullExif = null;

        try {
          gpsData = await exifr.gps(buffer);
        } catch(e) {}

        try {
          fullExif = await exifr.parse(buffer, {
            tiff: true,
            xmp: true,
            iptc: true,
            jfif: true,
            gps: true,
            translateValues: true,
            reviveValues: true,
            sanitize: true,
          });
        } catch(e) {}

        results.push({
          fileName: fn,
          gpsDataLatitude: gpsData ? gpsData.latitude : null,
          gpsDataLongitude: gpsData ? gpsData.longitude : null,
          gpsDataAltitude: gpsData ? gpsData.altitude : null,
          exifLatitude: fullExif ? fullExif.GPSLatitude : null,
          exifLatitudeRef: fullExif ? fullExif.GPSLatitudeRef : null,
          exifLongitude: fullExif ? fullExif.GPSLongitude : null,
          exifLongitudeRef: fullExif ? fullExif.GPSLongitudeRef : null,
          exifAltitude: fullExif ? fullExif.GPSAltitude : null,
          dateTimeOriginal: fullExif ? fullExif.DateTimeOriginal : null,
          make: fullExif ? fullExif.Make : null,
          model: fullExif ? fullExif.Model : null,
        });
      }
      console.log(JSON.stringify(results));
    }
    run();
    """
    res = subprocess.run(['node', '-e', node_script], env=env, capture_output=True, text=True)
    if res.returncode != 0:
        print("Error running exifr node script:", res.stderr)
        return []
    return json.loads(res.stdout)

def parse_dms_string_to_dd(dms_str, ref):
    if not dms_str:
        return None
    parts = re.findall(r'[\d\.]+', str(dms_str))
    if len(parts) >= 3:
        d, m, s = map(float, parts[:3])
        val = d + m/60.0 + s/3600.0
    elif len(parts) == 1:
        val = float(parts[0])
    else:
        return None
    if ref in ('S', 'W', 'South', 'West'):
        val = -val
    return val

def parse_exifr_dms_array_to_dd(dms_arr, ref):
    if dms_arr is None:
        return None
    if isinstance(dms_arr, (int, float)):
        val = float(dms_arr)
    elif isinstance(dms_arr, list) and len(dms_arr) >= 3:
        d, m, s = float(dms_arr[0]), float(dms_arr[1]), float(dms_arr[2])
        val = d + m/60.0 + s/3600.0
    elif isinstance(dms_arr, list) and len(dms_arr) == 1:
        val = float(dms_arr[0])
    else:
        return None
    if ref in ('S', 'W', 'South', 'West'):
        val = -val
    return val

def run_comparative_validation():
    exiftool_data = extract_exiftool_metadata()
    exifr_data = extract_exifr_metadata()

    print(f"[3/4] Cross-validating EXIF extraction methods ...")
    exifr_map = {item['fileName']: item for item in exifr_data}

    total_photos = 0
    categories = defaultdict(int)
    comparison_records = []
    lat_diffs = []

    for item in exiftool_data:
        fn = item.get('FileName', '')
        if not fn.lower().endswith(('.jpg', '.jpeg')):
            continue
        
        total_photos += 1
        fn_dt = parse_filename_time(fn)

        et_lat_raw = item.get('GPSLatitude')
        et_lat_ref = item.get('GPSLatitudeRef', 'N')
        et_lon_raw = item.get('GPSLongitude')
        et_lon_ref = item.get('GPSLongitudeRef', 'W')

        et_lat_dd = parse_dms_string_to_dd(et_lat_raw, et_lat_ref)
        et_lon_dd = parse_dms_string_to_dd(et_lon_raw, et_lon_ref)

        exifr_item = exifr_map.get(fn, {})
        exifr_lat_arr = exifr_item.get('exifLatitude')
        exifr_lat_ref = exifr_item.get('exifLatitudeRef')
        exifr_gps_lat = exifr_item.get('gpsDataLatitude')
        exifr_gps_lon = exifr_item.get('gpsDataLongitude')

        exifr_lat_from_arr = parse_exifr_dms_array_to_dd(exifr_lat_arr, exifr_lat_ref)

        # Classification
        has_gps_tag = et_lat_raw is not None
        is_zero_coord = False
        if et_lat_dd is not None and abs(et_lat_dd) < 0.0001:
            is_zero_coord = True

        if not has_gps_tag:
            category = 'NO_GPS_TAG' # DSLR / Burst cover / Non-GPS
        elif is_zero_coord:
            category = 'ZERO_COORDINATE_DUMMY' # Camera wrote 0 deg 0' 0"
        elif et_lat_dd > 0:
            category = 'VALID_LATITUDE'
        else:
            category = 'NEGATIVE_OR_ANOMALY'

        categories[category] += 1

        # Accuracy check between ExifTool and exifr
        diff = None
        if et_lat_dd is not None and exifr_lat_from_arr is not None:
            diff = abs(et_lat_dd - exifr_lat_from_arr)
            lat_diffs.append(diff)

        comparison_records.append({
            'filename': fn,
            'timestamp': fn_dt.isoformat() if fn_dt else None,
            'category': category,
            'exiftool': {
                'raw_lat': str(et_lat_raw),
                'lat_ref': et_lat_ref,
                'lat_dd': et_lat_dd,
                'raw_lon': str(et_lon_raw),
                'lon_ref': et_lon_ref,
                'lon_dd': et_lon_dd,
            },
            'exifr': {
                'raw_lat_array': exifr_lat_arr,
                'lat_ref': exifr_lat_ref,
                'lat_from_array': exifr_lat_from_arr,
                'gps_data_lat': exifr_gps_lat,
                'gps_data_lon': exifr_gps_lon,
            },
            'lat_precision_diff': diff,
        })

    print(f"[4/4] Validation Summary:")
    print(f"  Total JPG Photos: {total_photos}")
    for cat, count in categories.items():
        pct = (count / total_photos) * 100
        print(f"  - {cat:<25}: {count:3d} ({pct:5.1f}%)")

    max_diff = max(lat_diffs) if lat_diffs else 0
    avg_diff = sum(lat_diffs) / len(lat_diffs) if lat_diffs else 0
    print(f"  Latitude calculation consistency (ExifTool vs exifr):")
    print(f"    Max discrepancy: {max_diff:.8f}° ({max_diff * 111132:.4f} mm)")
    print(f"    Avg discrepancy: {avg_diff:.8f}°")

    with open(OUTPUT_REPORT_JSON, 'w') as f:
        json.dump({
            'summary': {
                'total_photos': total_photos,
                'categories': dict(categories),
                'max_lat_discrepancy_deg': max_diff,
                'avg_lat_discrepancy_deg': avg_diff,
            },
            'records': comparison_records
        }, f, indent=2)

    print(f"\nDetailed JSON report written to: {OUTPUT_REPORT_JSON}")

if __name__ == '__main__':
    run_comparative_validation()
