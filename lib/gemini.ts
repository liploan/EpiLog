import { GoogleGenerativeAI } from '@google/generative-ai';
import { ReflectionCategory, GeoCoordinate, CulinaryDish, ArtworkArtifact, ArchitecturalFeature } from '@/types/epilog';
import { queryCorridorVenues, matchVenueFromCandidates, VenueCandidate } from './poiResolver';

export interface SynthesizeParams {
  apiKey?: string;
  photoBase64?: string;
  mimeType?: string;
  poiName?: string;
  city?: string;
  country?: string;
  stopIndex?: number;
  lat?: number;
  lng?: number;
  existingReflection?: {
    category?: ReflectionCategory;
    userNotes?: string;
  };
}

export interface SynthesizeResult {
  success: boolean;
  narrativeCaption: string;
  category: ReflectionCategory;
  takeawayText: string;
  isMock: boolean;
  detectedVenueName?: string;
  detectedAddress?: string;
  exactVenue?: VenueCandidate;
  venueCandidates?: VenueCandidate[];
  resolvedPrecisionMeters?: number;
  detectedDishes?: CulinaryDish[];
  detectedArtworks?: ArtworkArtifact[];
  detectedArchitecture?: ArchitecturalFeature[];
  error?: string;
}

/**
 * Synthesizes scene narrative caption, takeaway reflection, sub-meter POI resolution,
 * automatic dish/menu identification, and museum artwork/architecture cataloging
 * using client-side Gemini Vision.
 */
export async function synthesizeSceneWithGemini(
  params: SynthesizeParams
): Promise<SynthesizeResult> {
  const locationContextStr = [params.poiName, params.city, params.country]
    .filter(Boolean)
    .join(', ');

  const currentCategory = (params.existingReflection?.category || 'Cultural') as ReflectionCategory;

  // Pre-fetch corridor candidates if coordinates are available
  let candidates: VenueCandidate[] = [];
  if (typeof params.lat === 'number' && typeof params.lng === 'number') {
    candidates = await queryCorridorVenues(params.lat, params.lng, 1.5).catch(() => []);
  }

  if (!params.apiKey) {
    // Heuristic fallback when no API key is provided
    const sampleInsights: Record<ReflectionCategory, string> = {
      Architectural:
        'The structural harmony reflects classical regional masonry and construction traditions designed to blend seamlessly into the surrounding geography.',
      Culinary:
        'Local gastronomic customs emphasize hyper-seasonal freshness and artisanal preparation techniques passed down across generations.',
      Natural:
        'The microclimate and topography foster a rich ecosystem, offering a profound sense of seasonal rhythm and ecological serenity.',
      Cultural:
        'Rooted in centuries of local heritage, the traditions here preserve community memory through sacred geometry and architectural symbolism.',
    };

    // If we have candidates nearby, select the top candidate
    const topCandidate = candidates.length > 0 ? candidates[0] : undefined;

    return {
      success: true,
      narrativeCaption: `Immersed in ${topCandidate?.name || locationContextStr || 'the scene'}, the natural light illuminates the textured atmosphere of this memorable stop.`,
      category: currentCategory,
      takeawayText: sampleInsights[currentCategory] || sampleInsights.Cultural,
      isMock: true,
      exactVenue: topCandidate,
      venueCandidates: candidates.slice(0, 8),
      resolvedPrecisionMeters: topCandidate ? 1.0 : undefined,
    };
  }

  try {
    const genAI = new GoogleGenerativeAI(params.apiKey);
    const model = genAI.getGenerativeModel({ model: 'gemini-1.5-flash' });

    const candidateNamesStr = candidates.length > 0
      ? `\nNearby Known Venues along this street corridor: [${candidates.map((c) => `"${c.name}" (${c.type})`).slice(0, 15).join(', ')}]`
      : '';

    const prompt = `You are EpiLog's travel intelligence synthesizer, museum artwork cataloger, gastronomy expert, and sub-meter precision spatial matcher.
Analyze this travel stop, its photo, and its location context:
Location: ${locationContextStr || 'Unknown location'}
${params.existingReflection?.userNotes ? `User notes: "${params.existingReflection.userNotes}"` : ''}
${candidateNamesStr}

Please perform the following visual and context analyses on the image:
1. STOREFRONT & SIGNAGE (Micro ~1m accuracy): Look for restaurant/bar/cafe signs, chalkboard menus, plaques, theater marquees, or museum/monument names.
2. DISH & MENU LOOKUP: If food, plates, tapas, wine, coffee, or beverages are present, match them against the establishment's known menu and regional specialties. Identify the specific dish name(s) (e.g. "Xuixo de Crema", "Garbanzos con Morcilla", "Jamón Ibérico de Bellota", "Paella de Marisco", "Cochinillo Asado"), regional cuisine style, key ingredients, appetizing 1-sentence description, and pairing notes.
3. ARTWORK & MUSEUM CATALOGING: If inside a museum, gallery, church, or cultural venue and an artwork, painting, sculpture, or relic is visible, identify the specific artwork title, artist/creator, creation period/year, medium/style (e.g. "Oil on canvas", "Gothic polychrome wood", "Catalan Modernisme mosaic"), and historical significance.
4. ARCHITECTURE & MONUMENT DETAILS: If an architectural facade, monument, cloister, or historic tower is featured, identify the architectural element, architect/school (e.g. "Antoni Gaudí", "Juan de Álava", "Mudéjar craftsman"), era/style, and structural description.
5. EDITORIAL SYNTHESIS: Provide an evocative 1-2 sentence narrative caption and a "What I Learned" takeaway insight. Categorize accurately into "Architectural", "Culinary", "Natural", or "Cultural".

Generate an editorial travel log entry adhering strictly to this JSON format:
{
  "narrativeCaption": "1-2 evocative sentences summarizing the scene mood, atmosphere, and visual essence.",
  "category": "Architectural" | "Culinary" | "Natural" | "Cultural",
  "takeawayText": "A 1-2 sentence 'What I Learned' insight explaining a cultural, culinary, architectural, or historical truth about this place.",
  "detectedVenueName": "The specific restaurant, cafe, bar, museum, or landmark name visible in the image or corridor, or null",
  "detectedAddress": "Street address or plaza name (if discernible), or null",
  "detectedDishes": [
    {
      "name": "Specific dish or beverage name from restaurant menu",
      "cuisineOrOrigin": "Regional cuisine style",
      "description": "1-sentence sensory culinary description highlighting preparation and flavors",
      "ingredients": ["Ingredient 1", "Ingredient 2"],
      "pairingOrNotes": "Drink pairing or culinary tradition"
    }
  ],
  "detectedArtworks": [
    {
      "title": "Title of the painting, sculpture, or art piece",
      "artistOrCreator": "Artist or workshop name",
      "creationYearOrPeriod": "e.g. 1656 or Late 19th Century",
      "mediumOrStyle": "e.g. Oil on canvas / Marble / Stained glass",
      "description": "Visual and compositional description",
      "museumOrLocationName": "Name of the museum or hall",
      "significanceOrInsight": "Why this piece is historically or artistically renowned"
    }
  ],
  "detectedArchitecture": [
    {
      "elementName": "Specific facade, portal, dome, arch, or cloister",
      "architectOrSchool": "Architect, master mason, or school",
      "eraOrStyle": "e.g. Catalan Modernisme / Plateresque / Mudéjar / Romanesque",
      "description": "Architectural masonry or stylistic detail"
    }
  ]
}

If no food is present, return "detectedDishes": [].
If no specific museum artwork is present, return "detectedArtworks": [].
If no notable architectural element is present, return "detectedArchitecture": [].
Return ONLY valid raw JSON with no backticks or markdown codeblocks.`;

    const parts: any[] = [prompt];

    if (params.photoBase64) {
      let cleanBase64 = params.photoBase64;
      let detectedMime = params.mimeType || 'image/jpeg';

      if (cleanBase64.includes(';base64,')) {
        const split = cleanBase64.split(';base64,');
        detectedMime = split[0].replace('data:', '');
        cleanBase64 = split[1];
      }

      parts.push({
        inlineData: {
          data: cleanBase64,
          mimeType: detectedMime,
        },
      });
    }

    const result = await model.generateContent(parts);
    const responseText = result.response.text().trim();

    // Clean up potential markdown formatting
    const jsonStr = responseText
      .replace(/^```json\s*/i, '')
      .replace(/^```\s*/i, '')
      .replace(/\s*```$/, '')
      .trim();

    const parsed = JSON.parse(jsonStr);

    let matchedVenue: VenueCandidate | null = null;
    if (parsed.detectedVenueName && candidates.length > 0) {
      matchedVenue = matchVenueFromCandidates(parsed.detectedVenueName, candidates);
    }

    const dishes: CulinaryDish[] = Array.isArray(parsed.detectedDishes)
      ? parsed.detectedDishes.filter((d: any) => d && d.name)
      : [];

    const artworks: ArtworkArtifact[] = Array.isArray(parsed.detectedArtworks)
      ? parsed.detectedArtworks.filter((a: any) => a && a.title)
      : [];

    const architecture: ArchitecturalFeature[] = Array.isArray(parsed.detectedArchitecture)
      ? parsed.detectedArchitecture.filter((a: any) => a && a.elementName)
      : [];

    // Determine category based on richest detected artifact if not explicitly overridden
    let finalCategory = (parsed.category as ReflectionCategory) || currentCategory;
    if (dishes.length > 0 && currentCategory === 'Cultural') {
      finalCategory = 'Culinary';
    } else if (artworks.length > 0 && currentCategory === 'Cultural') {
      finalCategory = 'Cultural';
    } else if (architecture.length > 0 && currentCategory === 'Cultural') {
      finalCategory = 'Architectural';
    }

    return {
      success: true,
      narrativeCaption: parsed.narrativeCaption,
      category: finalCategory,
      takeawayText: parsed.takeawayText,
      detectedVenueName: parsed.detectedVenueName || undefined,
      detectedAddress: parsed.detectedAddress || undefined,
      exactVenue: matchedVenue || undefined,
      venueCandidates: candidates.slice(0, 8),
      resolvedPrecisionMeters: matchedVenue ? 1.0 : (candidates.length > 0 ? 3.0 : undefined),
      detectedDishes: dishes.length > 0 ? dishes : undefined,
      detectedArtworks: artworks.length > 0 ? artworks : undefined,
      detectedArchitecture: architecture.length > 0 ? architecture : undefined,
      isMock: false,
    };
  } catch (err: any) {
    console.error('Client-side Gemini synthesis error:', err);
    const topCandidate = candidates.length > 0 ? candidates[0] : undefined;

    return {
      success: false,
      narrativeCaption: `Capturing the atmosphere of ${locationContextStr || 'this stop'}.`,
      category: currentCategory,
      takeawayText: 'Reflecting on personal memories and the cultural landscape.',
      venueCandidates: candidates.slice(0, 8),
      exactVenue: topCandidate,
      isMock: true,
      error: err?.message || 'Synthesis failed',
    };
  }
}


