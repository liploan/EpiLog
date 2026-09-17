import { EpiLogTrip } from '@/types/epilog';

export const SAMPLE_KYOTO_TRIP: EpiLogTrip = {
  id: 'trip-kyoto-2024',
  title: 'Kyoto & Higashiyama Autumn Odyssey',
  dateRange: {
    start: new Date('2024-11-14T08:30:00Z'),
    end: new Date('2024-11-16T18:45:00Z'),
  },
  totalDistanceKm: 24.8,
  stops: [
    {
      id: 'stop-fushimi-inari',
      stopIndex: 1,
      startTime: new Date('2024-11-14T08:30:00Z'),
      endTime: new Date('2024-11-14T10:45:00Z'),
      centerCoords: { lat: 34.9671, lng: 135.7727, altitude: 72 },
      poiName: 'Fushimi Inari-Taisha (Senbon Torii)',
      locationContext: {
        neighborhood: 'Fushimi Ward',
        city: 'Kyoto',
        country: 'Japan',
      },
      heroPhotoId: 'p-inari-1',
      photos: [
        {
          id: 'p-inari-1',
          previewUrl: 'https://images.unsplash.com/photo-1493976040374-85c8e12f0c0e?q=80&w=1200&auto=format&fit=crop',
          timestamp: new Date('2024-11-14T08:35:10Z'),
          coords: { lat: 34.9671, lng: 135.7727 },
          cameraModel: 'iPhone 15 Pro (24mm f/1.78)',
          isAnchor: true,
        },
        {
          id: 'p-inari-2',
          previewUrl: 'https://images.unsplash.com/photo-1503899036084-c55cdd92da26?q=80&w=1200&auto=format&fit=crop',
          timestamp: new Date('2024-11-14T08:36:20Z'),
          coords: { lat: 34.9671, lng: 135.7727 },
          cameraModel: 'Sony A7 IV (85mm f/1.4 GM)',
          isAnchor: false,
          matchedAnchorId: 'p-inari-1',
          timeDiffSeconds: 70,
        },
        {
          id: 'p-inari-3',
          previewUrl: 'https://images.unsplash.com/photo-1578632767115-351597cf2477?q=80&w=1200&auto=format&fit=crop',
          timestamp: new Date('2024-11-14T09:20:00Z'),
          coords: { lat: 34.968, lng: 135.774 },
          cameraModel: 'iPhone 15 Pro (13mm Ultra-wide)',
          isAnchor: true,
        },
      ],
      narrativeCaption:
        'Ascending through the vermilion mountain arcades at dawn, the morning mist hung quietly between thousand-year-old cedar trunks.',
      reflection: {
        category: 'Cultural',
        takeawayText:
          'Each torii gate is inscribed with the donor’s merchant guild name—a sacred intersection of commercial gratitude and mountain Shintoism that has persisted for over 1,300 years.',
        userNotes: 'Arrive before 7:30 AM to catch the low sun shafts through the upper shrine gates.',
      },
      worldOnThisDay: {
        dateStr: 'November 14',
        headline: '1889: Pioneer investigative reporter Nellie Bly began her record-breaking 72-day journey around the world.',
        sourceUrl: 'https://en.wikipedia.org/wiki/Nellie_Bly',
      },
    },
    {
      id: 'stop-kiyomizu-dera',
      stopIndex: 2,
      startTime: new Date('2024-11-14T13:15:00Z'),
      endTime: new Date('2024-11-14T15:40:00Z'),
      centerCoords: { lat: 34.9948, lng: 135.785, altitude: 138 },
      poiName: 'Kiyomizu-dera & Sannenzaka Slope',
      locationContext: {
        neighborhood: 'Higashiyama Ward',
        city: 'Kyoto',
        country: 'Japan',
      },
      heroPhotoId: 'p-kiyo-1',
      photos: [
        {
          id: 'p-kiyo-1',
          previewUrl: 'https://images.unsplash.com/photo-1545569341-9eb8b30979d9?q=80&w=1200&auto=format&fit=crop',
          timestamp: new Date('2024-11-14T13:20:00Z'),
          coords: { lat: 34.9948, lng: 135.785 },
          cameraModel: 'iPhone 15 Pro (48mm f/1.78)',
          isAnchor: true,
        },
        {
          id: 'p-kiyo-2',
          previewUrl: 'https://images.unsplash.com/photo-1528164344705-475426879c0d?q=80&w=1200&auto=format&fit=crop',
          timestamp: new Date('2024-11-14T13:22:15Z'),
          coords: { lat: 34.9948, lng: 135.785 },
          cameraModel: 'Leica Q3 (28mm Summilux)',
          isAnchor: false,
          matchedAnchorId: 'p-kiyo-1',
          timeDiffSeconds: 135,
        },
      ],
      narrativeCaption:
        'The monumental wooden stage juts dramatically over maple foliage, offering panoramic vistas of Kyoto framed against the western ridge.',
      reflection: {
        category: 'Architectural',
        takeawayText:
          'Constructed entirely without a single metal nail using traditional kigumi interlocking timber joinery, flexible enough to absorb regional seismic vibrations.',
      },
      worldOnThisDay: {
        dateStr: 'November 14',
        headline: '1971: NASA Mariner 9 became the first spacecraft to enter orbit around Mars.',
        sourceUrl: 'https://en.wikipedia.org/wiki/Mariner_9',
      },
    },
    {
      id: 'stop-arashiyama-bamboo',
      stopIndex: 3,
      startTime: new Date('2024-11-15T09:10:00Z'),
      endTime: new Date('2024-11-15T11:50:00Z'),
      centerCoords: { lat: 35.017, lng: 135.6713, altitude: 45 },
      poiName: 'Sagano Bamboo Forest & Tenryu-ji',
      locationContext: {
        neighborhood: 'Ukyo Ward',
        city: 'Kyoto',
        country: 'Japan',
      },
      heroPhotoId: 'p-arash-1',
      photos: [
        {
          id: 'p-arash-1',
          previewUrl: 'https://images.unsplash.com/photo-1503899036084-c55cdd92da26?q=80&w=1200&auto=format&fit=crop',
          timestamp: new Date('2024-11-15T09:15:00Z'),
          coords: { lat: 35.017, lng: 135.6713 },
          cameraModel: 'iPhone 15 Pro (24mm)',
          isAnchor: true,
        },
        {
          id: 'p-arash-2',
          previewUrl: 'https://images.unsplash.com/photo-1493976040374-85c8e12f0c0e?q=80&w=1200&auto=format&fit=crop',
          timestamp: new Date('2024-11-15T09:17:30Z'),
          coords: { lat: 35.017, lng: 135.6713 },
          cameraModel: 'Fujifilm X-T5 (35mm f/1.4)',
          isAnchor: false,
          matchedAnchorId: 'p-arash-1',
          timeDiffSeconds: 150,
        },
      ],
      narrativeCaption:
        'Towering moso culms filter emerald daylight while rhythmic bamboo rustling creates an acoustic sanctuary designated as one of Japan’s 100 Soundscapes.',
      reflection: {
        category: 'Natural',
        takeawayText:
          'Bamboo can grow up to 90 centimeters in 24 hours due to simultaneous rhizome elongation, playing a vital role in natural riparian soil stabilization.',
      },
      worldOnThisDay: {
        dateStr: 'November 15',
        headline: '1920: The League of Nations held its first general assembly in Geneva.',
        sourceUrl: 'https://en.wikipedia.org/wiki/League_of_Nations',
      },
    },
    {
      id: 'stop-kinkaku-ji',
      stopIndex: 4,
      startTime: new Date('2024-11-15T14:30:00Z'),
      endTime: new Date('2024-11-15T16:20:00Z'),
      centerCoords: { lat: 35.0394, lng: 135.7292, altitude: 80 },
      poiName: 'Kinkaku-ji (The Golden Pavilion)',
      locationContext: {
        neighborhood: 'Kita Ward',
        city: 'Kyoto',
        country: 'Japan',
      },
      heroPhotoId: 'p-gold-1',
      photos: [
        {
          id: 'p-gold-1',
          previewUrl: 'https://images.unsplash.com/photo-1545569341-9eb8b30979d9?q=80&w=1200&auto=format&fit=crop',
          timestamp: new Date('2024-11-15T14:35:00Z'),
          coords: { lat: 35.0394, lng: 135.7292 },
          cameraModel: 'iPhone 15 Pro (77mm 3x Telephoto)',
          isAnchor: true,
        },
      ],
      narrativeCaption:
        'Reflecting across the Kyoko-chi mirror pond, the upper tiers gleam with pure gold leaf against dark pine silhouettes.',
      reflection: {
        category: 'Architectural',
        takeawayText:
          'Combines three distinct architectural styles across its floors: Shinden-zukuri palace style, Buke-zukuri samurai style, and Zen Buddhist hall style.',
      },
      worldOnThisDay: {
        dateStr: 'November 15',
        headline: '1971: Intel released the 4004, the world’s first commercial single-chip microprocessor.',
        sourceUrl: 'https://en.wikipedia.org/wiki/Intel_4004',
      },
    },
    {
      id: 'stop-pontocho-alley',
      stopIndex: 5,
      startTime: new Date('2024-11-16T18:00:00Z'),
      endTime: new Date('2024-11-16T20:30:00Z'),
      centerCoords: { lat: 35.0062, lng: 135.7709, altitude: 38 },
      poiName: 'Pontocho Alley & Kamogawa Riverbanks',
      locationContext: {
        neighborhood: 'Nakagyo Ward',
        city: 'Kyoto',
        country: 'Japan',
      },
      heroPhotoId: 'p-ponto-1',
      photos: [
        {
          id: 'p-ponto-1',
          previewUrl: 'https://images.unsplash.com/photo-1503899036084-c55cdd92da26?q=80&w=1200&auto=format&fit=crop',
          timestamp: new Date('2024-11-16T18:15:00Z'),
          coords: { lat: 35.0062, lng: 135.7709 },
          cameraModel: 'Sony A7 IV (35mm f/1.4 GM)',
          isAnchor: false,
          matchedAnchorId: 'p-ponto-2',
          timeDiffSeconds: 45,
        },
        {
          id: 'p-ponto-2',
          previewUrl: 'https://images.unsplash.com/photo-1528164344705-475426879c0d?q=80&w=1200&auto=format&fit=crop',
          timestamp: new Date('2024-11-16T18:16:00Z'),
          coords: { lat: 35.0062, lng: 135.7709 },
          cameraModel: 'iPhone 15 Pro (24mm Night Mode)',
          isAnchor: true,
        },
      ],
      narrativeCaption:
        'Red paper lanterns illuminate the narrow cobblestone alleyway, filled with the aroma of charcoal yakitori and simmering dashi broths.',
      reflection: {
        category: 'Culinary',
        takeawayText:
          'Traditional kaiseki cuisine is built upon "shun"—celebrating ingredients harvested at the exact peak of seasonality, paired with soft Kyoto groundwaters.',
      },
      worldOnThisDay: {
        dateStr: 'November 16',
        headline: '1945: UNESCO was founded with the signing of its Constitution in London.',
        sourceUrl: 'https://en.wikipedia.org/wiki/UNESCO',
      },
    },
  ],
};
