import os
import sys
import json
import re
import subprocess
from datetime import datetime
import pandas as pd
import matplotlib
import matplotlib.pyplot as plt
import matplotlib.dates as mdates

# Set temp matplotlib config dir to prevent permission warning
os.environ['MPLCONFIGDIR'] = '/tmp/matplotlib'

PHOTOS_DIR = '/Users/liploan/Documents/EpiLog/demo/TripToSpainPhotos'
OUTPUT_IMG = '/Users/liploan/Documents/EpiLog/spain_gps_analysis.png'
OUTPUT_JSON = '/Users/liploan/Documents/EpiLog/spain_gps_data.json'

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

def extract_metadata_via_exiftool():
    print(f"Scanning photos in: {PHOTOS_DIR} ...")
    cmd = [
        'exiftool',
        '-json',
        '-FileName',
        '-CreateDate',
        '-ModifyDate',
        '-DateTimeOriginal',
        '-GPSLatitude',
        '-GPSLatitudeRef',
        '-GPSLongitude',
        '-GPSLongitudeRef',
        '-GPSAltitude',
        '-Model',
        PHOTOS_DIR
    ]
    res = subprocess.run(cmd, capture_output=True, text=True)
    if res.returncode != 0:
        print("Exiftool error:", res.stderr)
        return []
    
    raw_data = json.loads(res.stdout)
    records = []

    for item in raw_data:
        fn = item.get('FileName', '')
        if not fn.lower().endswith(('.jpg', '.jpeg')):
            continue

        fn_dt = parse_filename_time(fn)
        
        # Parse latitude
        lat_str = item.get('GPSLatitude')
        lat_ref = item.get('GPSLatitudeRef', 'N')
        lat = None
        if lat_str is not None:
            if isinstance(lat_str, (int, float)):
                lat = float(lat_str)
            elif isinstance(lat_str, str):
                parts = re.findall(r'[\d\.]+', lat_str)
                if len(parts) >= 3:
                    d, m, s = map(float, parts[:3])
                    lat = d + m/60.0 + s/3600.0
                elif len(parts) == 1:
                    lat = float(parts[0])
            if lat_ref == 'S' and lat is not None:
                lat = -lat

        # Parse raw longitude string from exiftool
        lng_str = item.get('GPSLongitude')
        lng_ref = item.get('GPSLongitudeRef', 'W')
        raw_lng_parts = []
        if lng_str is not None:
            if isinstance(lng_str, str):
                raw_lng_parts = re.findall(r'[\d\.]+', lng_str)

        records.append({
            'filename': fn,
            'timestamp': fn_dt,
            'model': item.get('Model', 'Unknown'),
            'lat': lat,
            'lat_ref': lat_ref,
            'lng_raw_str': str(lng_str),
            'lng_parts': raw_lng_parts,
            'lng_ref': lng_ref,
        })

    return records

def analyze_and_plot():
    records = extract_metadata_via_exiftool()
    if not records:
        print("No records extracted.")
        return

    df = pd.DataFrame(records)
    df = df.sort_values('timestamp').reset_index(drop=True)
    print(f"Extracted {len(df)} total photos.")
    
    with_gps = df[df['lat'].notnull() & (df['lat'] > 0)].copy()
    print(f"Photos with valid GPS Latitude: {len(with_gps)} / {len(df)}")

    # Save data summary
    with open(OUTPUT_JSON, 'w') as f:
        json.dump([{
            'filename': r['filename'],
            'timestamp': r['timestamp'].isoformat() if r['timestamp'] else None,
            'lat': r['lat'],
            'lng_raw': r['lng_raw_str'],
        } for r in records], f, indent=2)

    # Plotting
    plt.style.use('seaborn-v0_8-whitegrid' if 'seaborn-v0_8-whitegrid' in plt.style.available else 'default')
    fig, axes = plt.subplots(2, 2, figsize=(16, 12), dpi=150)
    fig.suptitle('EpiLog GPS Forensic Analysis: Spain Trip Photo Dataset (Pixel 2 HDR+ EXIF)', fontsize=16, fontweight='bold', y=0.98)

    # --- Plot 1: Timeline vs Latitude (Ground Truth Identification) ---
    ax1 = axes[0, 0]
    ax1.plot(with_gps['timestamp'], with_gps['lat'], 'o-', color='#8c7ae6', markersize=4, alpha=0.7, linewidth=1, label='Photo Capture Latitude')
    ax1.axhspan(40.38, 40.45, color='#00d2d3', alpha=0.25, label='Madrid (40.41° N)')
    ax1.axhspan(40.88, 40.92, color='#1dd1a1', alpha=0.25, label='Segovia (40.90° N)')
    ax1.axhspan(40.94, 40.98, color='#ff9f43', alpha=0.25, label='Salamanca (40.96° N)')
    ax1.axhspan(39.44, 39.50, color='#ff9ff3', alpha=0.25, label='Guadalupe (39.47° N)')
    ax1.axhspan(39.83, 39.88, color='#ff6b6b', alpha=0.25, label='Toledo (39.86° N)')

    ax1.set_title('1. Chronological Latitude Timeline (Pristine Hardware Sensor)', fontsize=12, fontweight='bold')
    ax1.set_ylabel('Latitude (°N)', fontsize=11)
    ax1.xaxis.set_major_formatter(mdates.DateFormatter('%b %d'))
    ax1.legend(loc='lower left', fontsize=9, frameon=True)

    # --- Plot 2: Forensic Inspection of Corrupted Longitude Degrees ---
    ax2 = axes[0, 1]
    raw_degs = []
    for parts in with_gps['lng_parts']:
        if parts:
            try:
                raw_degs.append(float(parts[0]))
            except:
                raw_degs.append(0)
        else:
            raw_degs.append(0)
    
    with_gps['raw_deg_val'] = raw_degs
    ax2.scatter(with_gps['timestamp'], with_gps['raw_deg_val'], color='#ee5253', s=22, alpha=0.7)
    ax2.set_yscale('log')
    ax2.set_title('2. Raw EXIF Longitude Degrees Register (Log Scale Anomaly)', fontsize=12, fontweight='bold')
    ax2.set_ylabel('Raw Degree Value (Corrupted Overflow)', fontsize=11)
    ax2.xaxis.set_major_formatter(mdates.DateFormatter('%b %d'))
    ax2.axhline(71594846, color='#5f27cd', linestyle='--', label='Madrid/Salamanca/Toledo register (71,594,846 = 0x0444735E)')
    ax2.axhline(12110, color='#e67e22', linestyle='--', label='Segovia register (12,110 = 0x00002F4E)')
    ax2.legend(loc='upper right', fontsize=8, frameon=True)

    # --- Plot 3: Geographic Spatial Map of Resolved Locations ---
    ax3 = axes[1, 0]
    resolved_lngs = []
    cities = []
    for lat in with_gps['lat']:
        if 40.35 <= lat <= 40.55:
            resolved_lngs.append(-3.7038)
            cities.append('Madrid')
        elif 40.85 <= lat < 40.93:
            resolved_lngs.append(-4.1215)
            cities.append('Segovia')
        elif 40.93 <= lat <= 41.05:
            resolved_lngs.append(-5.6642)
            cities.append('Salamanca')
        elif 39.40 <= lat <= 39.60:
            resolved_lngs.append(-5.3258)
            cities.append('Guadalupe')
        elif 39.80 <= lat <= 39.95:
            resolved_lngs.append(-4.0245)
            cities.append('Toledo')
        else:
            resolved_lngs.append(-3.7038)
            cities.append('Other')

    with_gps['resolved_lng'] = resolved_lngs
    with_gps['city'] = cities

    color_map = {
        'Madrid': '#00d2d3',
        'Segovia': '#1dd1a1',
        'Salamanca': '#ff9f43',
        'Guadalupe': '#ff9ff3',
        'Toledo': '#ff6b6b'
    }

    for city, grp in with_gps.groupby('city'):
        ax3.scatter(grp['resolved_lng'], grp['lat'], label=city, color=color_map.get(city, 'gray'), s=40, alpha=0.85, edgecolors='none')

    # Draw travel path
    ax3.plot(with_gps['resolved_lng'], with_gps['lat'], color='#576574', linestyle=':', alpha=0.4, linewidth=1.5, zorder=1)

    ax3.set_title('3. Reconstructed Geographic Spatial Journey Map', fontsize=12, fontweight='bold')
    ax3.set_xlabel('Longitude (°W)', fontsize=11)
    ax3.set_ylabel('Latitude (°N)', fontsize=11)
    ax3.legend(loc='lower left', fontsize=9, frameon=True)

    # Annotations
    ax3.annotate('Madrid (-3.70°, 40.41°)', xy=(-3.7038, 40.41), xytext=(-3.4, 40.43), arrowprops=dict(facecolor='black', arrowstyle='->', lw=0.8))
    ax3.annotate('Segovia (-4.12°, 40.90°)', xy=(-4.1215, 40.90), xytext=(-4.0, 40.82), arrowprops=dict(facecolor='black', arrowstyle='->', lw=0.8))
    ax3.annotate('Salamanca (-5.66°, 40.96°)', xy=(-5.6642, 40.96), xytext=(-5.4, 41.02), arrowprops=dict(facecolor='black', arrowstyle='->', lw=0.8))
    ax3.annotate('Guadalupe (-5.33°, 39.47°)', xy=(-5.3258, 39.47), xytext=(-5.1, 39.38), arrowprops=dict(facecolor='black', arrowstyle='->', lw=0.8))
    ax3.annotate('Toledo (-4.02°, 39.86°)', xy=(-4.0245, 39.86), xytext=(-3.7, 39.78), arrowprops=dict(facecolor='black', arrowstyle='->', lw=0.8))

    # --- Plot 4: Photo Distribution per Destination ---
    ax4 = axes[1, 1]
    city_counts = with_gps['city'].value_counts()
    ordered_cities = ['Madrid', 'Segovia', 'Salamanca', 'Guadalupe', 'Toledo']
    ordered_counts = [city_counts.get(c, 0) for c in ordered_cities]
    bars = ax4.bar(ordered_cities, ordered_counts, color=[color_map[c] for c in ordered_cities], edgecolor='#222f3e', linewidth=1)
    
    for bar in bars:
        h = bar.get_height()
        ax4.text(bar.get_x() + bar.get_width()/2., h + 2, f'{int(h)}', ha='center', va='bottom', fontsize=10, fontweight='bold')

    ax4.set_title('4. Geolocated Photos per Destination', fontsize=12, fontweight='bold')
    ax4.set_ylabel('Number of Photos', fontsize=11)
    ax4.set_ylim(0, max(ordered_counts) * 1.18)

    plt.tight_layout()
    plt.savefig(OUTPUT_IMG, dpi=150)
    print(f"\nAnalysis plot successfully generated and saved to: {OUTPUT_IMG}")
    print(f"Data summary saved to: {OUTPUT_JSON}")

if __name__ == '__main__':
    analyze_and_plot()
