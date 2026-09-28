import { EpiLogTrip } from '@/types/epilog';

export const SAMPLE_KYOTO_TRIP: EpiLogTrip = {
  id: 'trip-kyoto-2024',
  title: 'Kyoto & Higashiyama Autumn Odyssey',
  dateRange: {
    start: new Date('2024-11-14T08:30:00Z'),
    end: new Date('2024-11-16T20:30:00Z'),
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
          previewUrl: '/sample/fushimi_inari.jpg',
          timestamp: new Date('2024-11-14T08:35:10Z'),
          coords: { lat: 34.9671, lng: 135.7727 },
          cameraModel: 'iPhone 15 Pro (24mm f/1.78)',
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
      exactVenueName: 'Fushimi Inari-Taisha',
      resolvedPrecisionMeters: 1.0,
      detectedArchitecture: [
        {
          elementName: 'Senbon Torii (Thousand Torii Gate Arcade)',
          architectOrSchool: 'Fushimi Shinto Guild Masons',
          eraOrStyle: 'Traditional Japanese Shinto Shrine Architecture',
          description: 'Dual winding tunnels of vermilion cinnabar-lacquered cedar torii gates dedicated to Inari Okami.',
        },
      ],
      microEstablishments: [
        {
          name: 'Senbon Torii Lower Arcade',
          type: 'shrine',
          coords: { lat: 34.9671, lng: 135.7727 },
          precisionMeters: 1.0,
        },
        {
          name: 'Okusha Hohaisho Inner Shrine',
          type: 'shrine',
          coords: { lat: 34.9675, lng: 135.7732 },
          precisionMeters: 1.0,
        },
      ],
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
          previewUrl: '/sample/kiyomizu_dera.jpg',
          timestamp: new Date('2024-11-14T13:20:00Z'),
          coords: { lat: 34.9948, lng: 135.785 },
          cameraModel: 'iPhone 15 Pro (48mm f/1.78)',
          isAnchor: true,
        },
        {
          id: 'p-kiyo-2',
          previewUrl: '/sample/sannenzaka.jpg',
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
      exactVenueName: 'Kiyomizu-dera Hondo (Main Hall)',
      resolvedPrecisionMeters: 1.0,
      detectedArchitecture: [
        {
          elementName: 'Floating Hondo Veranda (Kiyomizu Stage)',
          architectOrSchool: 'Master Kigumi Timber Joiners',
          eraOrStyle: 'Heian / Edo-period Kigumi Timber Framework',
          description: '13-meter high timber veranda built over a steep cliffside using 139 giant zelkova pillars without nails.',
        },
      ],
      microEstablishments: [
        {
          name: 'Kiyomizu-dera Main Stage',
          type: 'temple',
          coords: { lat: 34.9948, lng: 135.785 },
          precisionMeters: 1.0,
        },
        {
          name: 'Sannenzaka Stone Slope & Tea Houses',
          type: 'historic_street',
          coords: { lat: 34.9962, lng: 135.7825 },
          precisionMeters: 1.0,
        },
      ],
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
          previewUrl: '/sample/arashiyama_bamboo.jpg',
          timestamp: new Date('2024-11-15T09:15:00Z'),
          coords: { lat: 35.017, lng: 135.6713 },
          cameraModel: 'iPhone 15 Pro (24mm)',
          isAnchor: true,
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
      exactVenueName: 'Sagano Bamboo Forest Grove',
      resolvedPrecisionMeters: 1.0,
      microEstablishments: [
        {
          name: 'Sagano Bamboo Walking Path',
          type: 'natural_reserve',
          coords: { lat: 35.017, lng: 135.6713 },
          precisionMeters: 1.0,
        },
        {
          name: 'Tenryu-ji Sogenchi Zen Garden',
          type: 'temple_garden',
          coords: { lat: 35.0158, lng: 135.6775 },
          precisionMeters: 1.0,
        },
      ],
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
          previewUrl: '/sample/kinkakuji.jpg',
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
      exactVenueName: 'Rokuon-ji (Kinkaku-ji Pavilion)',
      resolvedPrecisionMeters: 1.0,
      detectedArchitecture: [
        {
          elementName: 'Kinkaku-ji Three-Tier Gold Pavilion',
          architectOrSchool: 'Ashikaga Yoshimitsu & Muromachi Zen Masters',
          eraOrStyle: 'Muromachi Period (Kitayama Culture)',
          description: 'Top two stories covered in pure 24-karat gold leaf, crowned by a bronze Chinese phoenix (Fenghuang).',
        },
      ],
    },
    {
      id: 'stop-pontocho-alley',
      stopIndex: 5,
      startTime: new Date('2024-11-16T18:00:00Z'),
      endTime: new Date('2024-11-16T20:30:00Z'),
      centerCoords: { lat: 35.0062, lng: 135.7709, altitude: 38 },
      poiName: 'Pontocho Alley & Gion Kaiseki Gastronomy',
      locationContext: {
        neighborhood: 'Nakagyo Ward',
        city: 'Kyoto',
        country: 'Japan',
      },
      heroPhotoId: 'p-ponto-1',
      photos: [
        {
          id: 'p-ponto-1',
          previewUrl: '/sample/kyoto_kaiseki.jpg',
          timestamp: new Date('2024-11-16T18:15:00Z'),
          coords: { lat: 35.0062, lng: 135.7709 },
          cameraModel: 'Sony A7 IV (35mm f/1.4 GM)',
          isAnchor: false,
          matchedAnchorId: 'p-ponto-2',
          timeDiffSeconds: 45,
        },
        {
          id: 'p-ponto-2',
          previewUrl: '/sample/omakase_sushi.jpg',
          timestamp: new Date('2024-11-16T18:16:00Z'),
          coords: { lat: 35.0062, lng: 135.7709 },
          cameraModel: 'iPhone 15 Pro (24mm Night Mode)',
          isAnchor: true,
        },
        {
          id: 'p-ponto-3',
          previewUrl: '/sample/pontocho_alley.jpg',
          timestamp: new Date('2024-11-16T19:05:00Z'),
          coords: { lat: 35.0062, lng: 135.7709 },
          cameraModel: 'iPhone 15 Pro (48mm Night Mode)',
          isAnchor: true,
        },
      ],
      narrativeCaption:
        'Warm lantern light spills onto polished wooden machiya facades as an exquisite multi-course autumnal Kaiseki feast is served in intimate lacquered bowls.',
      reflection: {
        category: 'Culinary',
        takeawayText:
          'Traditional Kyoto Kyo-ryori centers around "shun" (旬)—celebrating seasonal micro-harvests and balancing five distinct flavors and textures with soft underground well waters.',
      },
      worldOnThisDay: {
        dateStr: 'November 16',
        headline: '1945: UNESCO was founded with the signing of its Constitution in London.',
        sourceUrl: 'https://en.wikipedia.org/wiki/UNESCO',
      },
      exactVenueName: 'Kitcho Gion (吉兆)',
      resolvedPrecisionMeters: 1.0,
      detectedDishes: [
        {
          name: 'Kyoto Autumn Kaiseki Tasting Course',
          cuisineOrOrigin: 'Traditional Kyo-ryori',
          description: 'A multi-course tasting highlighting charcoal-seared Kamo duck with ginkgo leaf, fresh seasonal maguro sashimi, simmered matsutake mushrooms, and delicate yuba tofu skin.',
          ingredients: ['Kamo Duck', 'Fresh Yuba (Tofu Skin)', 'Matsutake Dashi', 'Sansho Pepper', 'Maguro Sashimi'],
          pairingOrNotes: 'Paired with chilled Fushimi Junmai Daiginjo sake',
        },
        {
          name: 'Edomae Omakase Nigiri Selection',
          cuisineOrOrigin: 'Artisanal Nigiri',
          description: 'Line-caught Hon-Maguro bluefin otoro, shima-aji with ginger scallion, and fresh Hokkaido uni sea urchin brushed with nikiri shoyu glaze.',
          ingredients: ['Otoro Bluefin Tuna', 'Hokkaido Uni', 'Akazu Sushi Rice', 'Fresh Wasabi', 'Shima-Aji'],
          pairingOrNotes: 'Served with warm sencha green tea',
        },
      ],
    },
  ],
};

export const SAMPLE_BARCELONA_TRIP: EpiLogTrip = {
  id: 'trip-barcelona-2024',
  title: 'Barcelona Modernisme & Gothic Mediterranean Odyssey',
  dateRange: {
    start: new Date('2024-05-18T09:00:00Z'),
    end: new Date('2024-05-20T21:00:00Z'),
  },
  totalDistanceKm: 21.6,
  stops: [
    {
      id: 'stop-sagrada-familia',
      stopIndex: 1,
      startTime: new Date('2024-05-18T09:15:00Z'),
      endTime: new Date('2024-05-18T12:00:00Z'),
      centerCoords: { lat: 41.4036, lng: 2.1744, altitude: 45 },
      poiName: 'Basílica de la Sagrada Família (Forest Nave)',
      locationContext: {
        neighborhood: 'Eixample',
        city: 'Barcelona',
        country: 'Spain',
      },
      heroPhotoId: 'p-sagrada-1',
      photos: [
        {
          id: 'p-sagrada-1',
          previewUrl: '/sample/barcelona/sagrada_familia.jpg',
          timestamp: new Date('2024-05-18T09:30:00Z'),
          coords: { lat: 41.4036, lng: 2.1744 },
          cameraModel: 'Sony A7R V (24-70mm f/2.8 GM II)',
          isAnchor: true,
        },
      ],
      narrativeCaption:
        'Stepping inside the monumental basilica, morning sunlight ignited a kaleidoscope of cobalt, emerald, and amber stained glass across soaring stone tree columns.',
      reflection: {
        category: 'Architectural',
        takeawayText:
          'Antoni Gaudí designed the interior columns using hyper-paraboloid geometries branching like trees to distribute load organically without external flying buttresses.',
        userNotes: 'Book the Nativity tower elevator for 9:30 AM to catch the eastern morning light illuminating the main altar.',
      },
      worldOnThisDay: {
        dateStr: 'March 19',
        headline: '1882: The foundation stone of the Basílica de la Sagrada Família was laid under original architect Francisco de Paula del Villar.',
        sourceUrl: 'https://en.wikipedia.org/wiki/Sagrada_Fam%C3%ADlia',
      },
      exactVenueName: 'Basílica de la Sagrada Família',
      resolvedPrecisionMeters: 1.0,
      detectedArchitecture: [
        {
          elementName: 'Hyperboloid Forest Nave & Branching Stone Columns',
          architectOrSchool: 'Antoni Gaudí',
          eraOrStyle: 'Catalan Modernisme / Organic Structuralism',
          description: 'Double-twist porphyry and basalt stone tree columns branching to hold hyperboloid vault canopies.',
        },
      ],
      detectedArtworks: [
        {
          title: 'Nativity Facade Sculptural Triptych & Tree of Life',
          artistOrCreator: 'Antoni Gaudí & Llorenç Matamala',
          creationYearOrPeriod: '1894–1930',
          mediumOrStyle: 'Montjuïc sandstone relief sculpture',
          museumOrLocationName: 'Eastern Facade, Sagrada Família',
          significanceOrInsight: 'Directly sculpted from live plaster casts of local Barcelona citizens and animals to capture raw humanity and biological fidelity.',
        },
      ],
      microEstablishments: [
        {
          name: 'Sagrada Família Central Nave',
          type: 'basilica',
          coords: { lat: 41.4036, lng: 2.1744 },
          precisionMeters: 1.0,
        },
        {
          name: 'Nativity Facade Portal',
          type: 'monument',
          coords: { lat: 41.4038, lng: 2.1751 },
          precisionMeters: 1.0,
        },
      ],
    },
    {
      id: 'stop-park-guell',
      stopIndex: 2,
      startTime: new Date('2024-05-18T14:30:00Z'),
      endTime: new Date('2024-05-18T17:15:00Z'),
      centerCoords: { lat: 41.4145, lng: 2.1527, altitude: 152 },
      poiName: 'Park Güell & Serpentine Mosaic Terrace',
      locationContext: {
        neighborhood: 'Gràcia',
        city: 'Barcelona',
        country: 'Spain',
      },
      heroPhotoId: 'p-guell-1',
      photos: [
        {
          id: 'p-guell-1',
          previewUrl: '/sample/barcelona/park_guell.jpg',
          timestamp: new Date('2024-05-18T14:45:00Z'),
          coords: { lat: 41.4145, lng: 2.1527 },
          cameraModel: 'Leica Q3 (28mm Summilux)',
          isAnchor: true,
        },
      ],
      narrativeCaption:
        'The ergonomic serpentine mosaic bench curved gracefully above the hypostyle room, framing panoramic views of Barcelona stretching to the sparkling Mediterranean.',
      reflection: {
        category: 'Natural',
        takeawayText:
          'Constructed using "trencadís"—a pioneering sustainable mosaic technique designed by Josep Maria Jujol using discarded porcelain and tile shards from local ceramic factories.',
      },
      worldOnThisDay: {
        dateStr: 'November 2',
        headline: '1984: UNESCO inscribed the works of Antoni Gaudí, including Park Güell, as a World Heritage Site.',
        sourceUrl: 'https://en.wikipedia.org/wiki/Park_G%C3%BCell',
      },
      exactVenueName: 'Park Güell',
      resolvedPrecisionMeters: 1.0,
      detectedArtworks: [
        {
          title: 'El Drac (The Salamander Fountain) & Serpentine Trencadís Bench',
          artistOrCreator: 'Antoni Gaudí & Josep Maria Jujol',
          creationYearOrPeriod: '1900–1914',
          mediumOrStyle: 'Glazed ceramic tile trencadís mosaic',
          museumOrLocationName: 'Monumental Zone Staircase & Hypostyle Terrace',
          significanceOrInsight: 'Masterpiece of proto-surrealist mosaic recycled from broken cups and tile discards from local kilns.',
        },
      ],
      detectedArchitecture: [
        {
          elementName: 'Hypostyle Room & 86 Doric Columns',
          architectOrSchool: 'Antoni Gaudí',
          eraOrStyle: 'Modernisme Classical Synthesis',
          description: 'Supported stone terrace housing subterranean rainwater cistern system with ceramic rosette vaults.',
        },
      ],
    },
    {
      id: 'stop-casa-batllo',
      stopIndex: 3,
      startTime: new Date('2024-05-19T10:00:00Z'),
      endTime: new Date('2024-05-19T12:30:00Z'),
      centerCoords: { lat: 41.3917, lng: 2.1649, altitude: 38 },
      poiName: 'Casa Batlló (Passeig de Gràcia)',
      locationContext: {
        neighborhood: 'Eixample',
        city: 'Barcelona',
        country: 'Spain',
      },
      heroPhotoId: 'p-batllo-1',
      photos: [
        {
          id: 'p-batllo-1',
          previewUrl: '/sample/barcelona/casa_batllo.jpg',
          timestamp: new Date('2024-05-19T10:15:00Z'),
          coords: { lat: 41.3917, lng: 2.1649 },
          cameraModel: 'iPhone 15 Pro (24mm f/1.78)',
          isAnchor: true,
        },
      ],
      narrativeCaption:
        'Gleaming under the Iberian sun along the Block of Discord, Casa Batlló’s bone-like stone columns and shimmering dragon-scale ceramic roof captivated passersby.',
      reflection: {
        category: 'Cultural',
        takeawayText:
          'Symbolizes the Catalan legend of Sant Jordi (Saint George) slaying the dragon—the tiled roof represents the dragon’s arched back and the turret sword pierces its spine.',
      },
      worldOnThisDay: {
        dateStr: 'April 23',
        headline: 'La Diada de Sant Jordi: Catalonia celebrates books and roses in honor of Saint George, inspiring UNESCO World Book Day.',
        sourceUrl: 'https://en.wikipedia.org/wiki/Casa_Batll%C3%B3',
      },
      exactVenueName: 'Casa Batlló',
      resolvedPrecisionMeters: 1.0,
      detectedArtworks: [
        {
          title: 'Noble Floor Stained Glass & Swirling Spiral Ceiling',
          artistOrCreator: 'Antoni Gaudí & Josep Pelegrí',
          creationYearOrPeriod: '1904–1906',
          mediumOrStyle: 'Lead-framed stained glass and sculpted plaster',
          museumOrLocationName: 'Main Salon, Casa Batlló',
          significanceOrInsight: 'Subaqueous light effect recreating underwater marine caverns and nautilus shells.',
        },
      ],
      detectedArchitecture: [
        {
          elementName: 'Dragon Back Ceramic Roof & Bone Balconies',
          architectOrSchool: 'Antoni Gaudí',
          eraOrStyle: 'Catalan Modernisme',
          description: 'Iridescent glazed tile roof simulating the scales of the dragon of Sant Jordi, punctured by a cross-shaped lance turret.',
        },
      ],
    },
    {
      id: 'stop-bar-pinotxo',
      stopIndex: 4,
      startTime: new Date('2024-05-19T13:00:00Z'),
      endTime: new Date('2024-05-19T14:45:00Z'),
      centerCoords: { lat: 41.3817, lng: 2.1716, altitude: 12 },
      poiName: 'Bar Restaurant Pinotxo (Mercat de la Boqueria)',
      locationContext: {
        neighborhood: 'El Raval / La Rambla',
        city: 'Barcelona',
        country: 'Spain',
      },
      heroPhotoId: 'p-pinotxo-1',
      photos: [
        {
          id: 'p-pinotxo-1',
          previewUrl: '/sample/barcelona/bar_pinotxo.jpg',
          timestamp: new Date('2024-05-19T13:15:00Z'),
          coords: { lat: 41.3817, lng: 2.1716 },
          cameraModel: 'Sony A7R V (35mm f/1.4 GM)',
          isAnchor: true,
        },
      ],
      narrativeCaption:
        'Squeezing onto the polished counter at legendary Bar Pinotxo, the aroma of sizzling baby squid and savory botifarra chickpeas filled the buzzing Boqueria market air.',
      reflection: {
        category: 'Culinary',
        takeawayText:
          'Pioneered the art of "tapeo de mercado" (market counter dining) under the late Juanito Bayén for over 80 years, celebrating pure seasonal market ingredients cooked fresh on the plancha with zero pretension.',
        userNotes: 'Order the famous warm chickpeas with black sausage and ask for a chilled glass of Catalan Cava.',
      },
      worldOnThisDay: {
        dateStr: 'March 19',
        headline: '1840: Official foundation stone laid for the historic Mercat de Sant Josep (La Boqueria) on the grounds of the former Saint Joseph convent.',
        sourceUrl: 'https://en.wikipedia.org/wiki/La_Boqueria',
      },
      exactVenueName: 'Bar Pinotxo (Mercat de la Boqueria)',
      resolvedPrecisionMeters: 1.0,
      detectedDishes: [
        {
          name: 'Cigrons amb Botifarra Negra',
          cuisineOrOrigin: 'Catalan Market Gastronomy',
          description: 'Tender baby chickpeas sautéed with rich Catalan botifarra black blood sausage, sweet caramelized sofrito onions, and toasted pine nuts.',
          ingredients: ['Baby Chickpeas (Cigrons)', 'Botifarra Negra (Catalan Blood Sausage)', 'Caramelized Onion', 'Pine Nuts', 'Olive Oil'],
          pairingOrNotes: 'Signature dish of Bar Pinotxo, best paired with a flute of cold Cava',
        },
        {
          name: 'Chipirones con Judías de Santa Pau',
          cuisineOrOrigin: 'Catalan Seafood Plancha',
          description: 'Baby squid seared on the sizzling plancha tossed over miniature buttery Santa Pau white beans with fresh garlic and parsley-infused olive oil.',
          ingredients: ['Chipirones (Baby Squid)', 'Judías de Santa Pau (PDO White Beans)', 'Garlic', 'Flat-leaf Parsley', 'Sea Salt'],
          pairingOrNotes: 'Served sizzling hot straight from the market plancha',
        },
      ],
      microEstablishments: [
        {
          name: 'Bar Pinotxo Counter (Stalls 66-67)',
          type: 'tapas_bar',
          coords: { lat: 41.3817, lng: 2.1716 },
          precisionMeters: 1.0,
        },
        {
          name: 'Mercat de la Boqueria Fruit & Spice Aisle',
          type: 'market',
          coords: { lat: 41.3818, lng: 2.1714 },
          precisionMeters: 1.0,
        },
      ],
    },
    {
      id: 'stop-barri-gotic',
      stopIndex: 5,
      startTime: new Date('2024-05-19T18:00:00Z'),
      endTime: new Date('2024-05-19T21:30:00Z'),
      centerCoords: { lat: 41.384, lng: 2.1762, altitude: 14 },
      poiName: 'Barri Gòtic & Pont del Bisbe',
      locationContext: {
        neighborhood: 'Ciutat Vella',
        city: 'Barcelona',
        country: 'Spain',
      },
      heroPhotoId: 'p-gotic-1',
      photos: [
        {
          id: 'p-gotic-1',
          previewUrl: '/sample/barcelona/barri_gotic.jpg',
          timestamp: new Date('2024-05-19T18:30:00Z'),
          coords: { lat: 41.384, lng: 2.1762 },
          cameraModel: 'Sony A7R V (35mm f/1.4 GM)',
          isAnchor: true,
        },
      ],
      narrativeCaption:
        'Twilight descended upon the narrow medieval cobblestone passages as warm amber streetlamps illuminated the Pont del Bisbe and quiet stone alleyways.',
      reflection: {
        category: 'Cultural',
        takeawayText:
          'The Barri Gòtic stands upon the 2,000-year-old Roman colony of Barcino, where modern stone pavers still follow the ancient decumanus maximus axis beneath medieval gothic arches.',
      },
      worldOnThisDay: {
        dateStr: 'December 14',
        headline: '1990: Historic gothic quarters and Roman foundations of Barcelona received expanded European cultural heritage status.',
        sourceUrl: 'https://en.wikipedia.org/wiki/Gothic_Quarter,_Barcelona',
      },
      exactVenueName: 'Pont del Bisbe (Bishop’s Bridge)',
      resolvedPrecisionMeters: 1.0,
      detectedArchitecture: [
        {
          elementName: 'Pont del Bisbe (Bishop’s Bridge Neo-Gothic Arch)',
          architectOrSchool: 'Joan Rubió i Bellver',
          eraOrStyle: 'Flamoyant Neo-Gothic (Built 1928)',
          description: 'Intricately carved covered bridge connecting the Palau de la Generalitat with the Casa dels Canonges, featuring a hidden skull and dagger on its underside.',
        },
      ],
      detectedDishes: [
        {
          name: 'Jamón Ibérico de Bellota con Pa amb Tomàquet',
          cuisineOrOrigin: 'Traditional Catalan Tapas',
          description: 'Acorn-fed 100% Iberian cured ham hand-carved into paper-thin slices, served over toasted rustic coca bread rubbed with ripe Ramallet tomato, extra virgin Arbequina olive oil, and sea salt.',
          ingredients: ['Jamón Ibérico de Bellota', 'Pan de Cristal / Coca Bread', 'Ramallet Tomato', 'Arbequina EVOO', 'Flor de Sal'],
          pairingOrNotes: 'Paired with chilled Brut Nature Reserva Cava from Penedès',
        },
      ],
    },
    {
      id: 'stop-columbus-monument',
      stopIndex: 6,
      startTime: new Date('2024-05-20T10:30:00Z'),
      endTime: new Date('2024-05-20T12:45:00Z'),
      centerCoords: { lat: 41.3758, lng: 2.1778, altitude: 60 },
      poiName: 'Columbus Monument (Mirador de Colom & Port Vell)',
      locationContext: {
        neighborhood: 'Port Vell / Ciutat Vella',
        city: 'Barcelona',
        country: 'Spain',
      },
      heroPhotoId: 'p-colom-1',
      photos: [
        {
          id: 'p-colom-1',
          previewUrl: '/sample/barcelona/columbus_monument.jpg',
          timestamp: new Date('2024-05-20T11:00:00Z'),
          coords: { lat: 41.3758, lng: 2.1778 },
          cameraModel: 'iPhone 15 Pro (24mm f/1.78)',
          isAnchor: true,
        },
      ],
      narrativeCaption:
        'At the southern foot of La Rambla, the 60-meter iron column rises against the Mediterranean sky as Columbus points with outstretched arm toward the open sea.',
      reflection: {
        category: 'Cultural',
        takeawayText:
          'The Fascinating Orientation Mystery: While most visitors assume Columbus points toward America, the New World actually lies directly West-Southwest across mainland Spain! Instead, he points South-Southeast (~170° SSE) straight into the Mediterranean toward North Africa and his sea route out toward the Strait of Gibraltar. Sculptor Rafael Atché deliberately chose this seaward gaze so the monument would welcome the maritime harbor rather than awkwardly pointing inland back into the city.',
        userNotes: 'Take the internal elevator up the column to the panoramic observation deck under Columbus’s feet for 360-degree views of Port Vell and Montjuïc.',
      },
      worldOnThisDay: {
        dateStr: 'April 3',
        headline: '1493: Christopher Columbus was formally received in Barcelona by Catholic Monarchs Isabella I and Ferdinand II at the Saló del Tinell following his first transatlantic return.',
        sourceUrl: 'https://en.wikipedia.org/wiki/Columbus_Monument,_Barcelona',
      },
      exactVenueName: 'Monument a Colom (Mirador de Colom)',
      resolvedPrecisionMeters: 1.0,
      detectedArtworks: [
        {
          title: 'Statue of Christopher Columbus & Bronze Relief Friezes',
          artistOrCreator: 'Rafael Atché (sculptor) & Gaietà Buïgas (architect)',
          creationYearOrPeriod: '1888',
          mediumOrStyle: 'Gilded bronze statue and cast-iron Corinthian column',
          museumOrLocationName: 'Plaça del Portal de la Pau',
          significanceOrInsight: '7.2-meter bronze colossus holding a nautical chart, cast for the 1888 Barcelona Universal Exposition.',
        },
      ],
      detectedArchitecture: [
        {
          elementName: '60-Meter Iron Corinthian Monumental Column',
          architectOrSchool: 'Gaietà Buïgas i Monravà',
          eraOrStyle: '19th Century Historicist Ironwork',
          description: 'Octagonal stone plinth flanked by four bronze winged victories and eight historical medallion reliefs.',
        },
      ],
    },
  ],
};


