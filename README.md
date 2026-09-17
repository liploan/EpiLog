# EpiLog (ἐπί logos)

> *"A picture is worth a thousand words—let them write it for you."*  
> **The AI Travel Journal & Intellectual Keepsake**

[![Next.js](https://img.shields.io/badge/Next.js-14.2-black?logo=next.js)](https://nextjs.org/)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.6-blue?logo=typescript)](https://www.typescriptlang.org/)
[![Tailwind CSS](https://img.shields.io/badge/Tailwind_CSS-3.4-38bdf8?logo=tailwind-css)](https://tailwindcss.com/)
[![MapLibre GL](https://img.shields.io/badge/MapLibre_GL-4.7-3969a6?logo=mapbox)](https://maplibre.org/)
[![Google Gemini](https://img.shields.io/badge/Google_Gemini-1.5_Flash-orange?logo=google)](https://ai.google.dev/)

---

## Overview

**EpiLog** is an intelligent travel memory platform that transforms raw photo dumps into interactive maps, narrative timelines, contextual daily news capsules, and reflective *"What I Learned"* takeaways—with zero manual journaling required during your trip.

Derived from the Greek *epílogos* (ἐπί logos = a speech or conclusion added after a journey), EpiLog bridges high-end DSLR photography with smartphone sensor telemetry to preserve the cultural, architectural, and culinary meaning of your travels.

---

## Key Features

- **Intelligent Sensor Fusion (DSLR + Phone Bridging)**:
  - **Temporal Alignment**: Indexes all photos chronologically via universal EXIF timestamps (`DateTimeOriginal`).
  - **Proximity GPS Tagging ($\pm 3\text{ min}$)**: Automatically matches GPS-less DSLR/mirrorless orphan photos to nearby phone GPS anchors.
  - **Hero Curation**: Automatically selects high-resolution camera frames as hero imagery with inherited coordinates.
- **Spatiotemporal Clustering**:
  - Groups photos into distinct stops using a threshold of $2\text{ hours}$ and $300\text{ meters}$ radius from the geographic centroid.
- **External Context & News Capsule**:
  - **OpenStreetMap Nominatim**: Reverse geocodes coordinates to human-readable POI, neighborhood, and city names.
  - **Wikimedia REST API**: Pulls *"On this day in the world..."* historical events matching the calendar day of each travel stop.
- **Multimodal Scene Intelligence**:
  - Powered by **Gemini 1.5 Flash Vision** to produce 1-2 sentence editorial scene captions and categorized reflections (*Architectural*, *Culinary*, *Natural*, *Cultural*).
- **Social Event Studio (9:16 & 1:1)**:
  - 1-click generation of DOM-based vertical cards (Instagram Stories / Pinterest) and square posts across 4 curated editorial themes (*Editorial Dark*, *Magazine Light*, *Terracotta Sunset*, *Vintage Passport*).
- **Fine-Art Coffee Table Book Monograph**:
  - Interactive two-page layflat book spread preview with archival 200+ GSM typography, optical sensor metadata, and high-res print export.
- **Executive Pitch Deck**:
  - Ready-to-present 8-slide presentation generated via `python-pptx` (`EpiLog_Pitch_Deck.pptx`).

---

## Architecture & Pipeline

```mermaid
flowchart TD
    A[Photo Batch Upload .jpg / .heic] --> B[Client Ingestion Worker]
    B -->|heic2any| C[Converted JPEG/Blob Preview]
    B -->|exifr| D[EXIF Metadata: Timestamp, Coords, Camera]
    
    D --> E{Has GPS?}
    E -->|Yes| F[Anchor Photos]
    E -->|No| G[DSLR Orphan Photos]
    
    F & G --> H[Spatiotemporal Stitcher]
    H -->|±3 min timestamp window| I[Matched Orphans to Anchors]
    I -->|Δt <= 2h, Δd <= 300m| J[Clustered Travel Stops]
    
    J --> K[External Context Enrichment]
    K -->|OSM Nominatim| L[City, Neighborhood, POI Name]
    K -->|Wikimedia API| M[World On This Day Historical Event]
    
    J & L & M --> N[Multimodal Synthesis - Gemini Vision]
    N --> O[Narrative Scene Captions + Takeaways]
    
    O --> P[Dual-Pane Dashboard]
    P --> Q[MapLibre Interactive Canvas]
    P --> R[Stop Cards with Hover/Pin Sync]
    P --> S[9:16 & 1:1 Social Export html-to-image]
    P --> T[Coffee Table Layflat Monograph Spread]
```

---

## Tech Stack

- **Frontend**: Next.js 14 (App Router), React 18, TypeScript, Tailwind CSS, Lucide React
- **Cartography**: MapLibre GL (Hardware-accelerated WebGL vector/raster maps)
- **Metadata Extraction**: `exifr` (GPS, camera tags, EXIF dates) + `heic2any` (Apple iPhone image conversion)
- **AI Intelligence**: Google Generative AI (`@google/generative-ai` / Gemini 1.5 Flash)
- **Export Engine**: `html-to-image` for high-DPI client-side card rendering
- **Presentation**: `python-pptx`

---

## Getting Started

### Prerequisites

- Node.js 18+ (tested on Node 20 / 22 / 26)
- npm or pnpm / yarn

### Installation

```bash
# Clone the repository
git clone https://github.com/liploan/EpiLog.git
cd EpiLog

# Install dependencies
npm install

# (Optional) Set your Gemini API key in .env.local
echo "GEMINI_API_KEY=your_key_here" > .env.local
```

### Development

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) to view the interactive dashboard.

### Run Tests

```bash
node tests/test-stitcher.mjs
```

### Generate Pitch Deck

```bash
python3 generate_deck.py
```

---

## License

MIT License &copy; 2024 EpiLog. All rights reserved.
