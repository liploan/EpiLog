import os
import sys
import struct
import json
import subprocess
from collections import Counter

PHOTOS_DIR = '/Users/liploan/Documents/EpiLog/demo/TripToSpainPhotos'

def analyze_raw_exif_registers():
    print("=================================================================")
    print("      PIXEL 2 HDR+ GPS LONGITUDE REGISTER FORENSIC ANALYSIS       ")
    print("=================================================================")

    # Run exiftool in -v3 or -v2 mode or json with raw values
    cmd = [
        'exiftool',
        '-json',
        '-num', # numeric output
        '-FileName',
        '-GPSLatitude',
        '-GPSLatitudeRef',
        '-GPSLongitude',
        '-GPSLongitudeRef',
        '-GPSAltitude',
        '-GPSProcessingMethod',
        PHOTOS_DIR
    ]
    res = subprocess.run(cmd, capture_output=True, text=True)
    if res.returncode != 0:
        print("ExifTool error:", res.stderr)
        return

    items = json.loads(res.stdout)
    jpgs = [i for i in items if i.get('FileName', '').lower().endswith(('.jpg', '.jpeg'))]

    raw_longitudes = Counter()
    raw_latitudes = []
    
    for item in jpgs:
        lon = item.get('GPSLongitude')
        if lon is not None:
            raw_longitudes[str(lon)] += 1
        lat = item.get('GPSLatitude')
        if lat is not None and lat != 0:
            raw_latitudes.append((item.get('FileName'), lat, lon))

    print(f"\n[1] Total Photos Examined: {len(jpgs)}")
    print(f"[2] Raw Numeric Longitude Value Distribution:")
    for val, count in raw_longitudes.most_common(10):
        print(f"    - {val:<35} : {count:3d} photos")

    # Let's inspect the binary hex of the dominant corrupted registers
    print(f"\n[3] Bitwise Binary Register Decompilation:")
    dominant_vals = [71594846, 12110]
    for val in dominant_vals:
        hex_val = hex(val)
        bin_val = bin(val)
        print(f"    - Decimal: {val:<12} | Hex: 0x{val:08X} | Binary: {bin_val}")
        # Check IEEE 754 float interpretation
        try:
            float_interp = struct.unpack('!f', struct.pack('!I', val))[0]
            print(f"      * IEEE 754 Float32 view: {float_interp}")
        except:
            pass

    print(f"\n[4] Register Correlation with Capture Location & Date:")
    seg_photos = [x for x in raw_latitudes if str(x[2]).startswith('12110')]
    print(f"    - Segovia Register (12110 / 0x00002F4E): {len(seg_photos)} photos")
    for fn, lat, lon in seg_photos[:3]:
        print(f"        * {fn} -> Lat: {lat}, Lon: {lon}")

    other_photos = [x for x in raw_latitudes if str(x[2]).startswith('71594846')]
    print(f"    - Central/Western Register (71594846 / 0x0444735E): {len(other_photos)} photos")
    for fn, lat, lon in other_photos[:3]:
        print(f"        * {fn} -> Lat: {lat}, Lon: {lon}")

if __name__ == '__main__':
    analyze_raw_exif_registers()
