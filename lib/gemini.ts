import { GoogleGenerativeAI } from '@google/generative-ai';
import { ReflectionCategory } from '@/types/epilog';

export interface SynthesizeParams {
  apiKey?: string;
  photoBase64?: string;
  mimeType?: string;
  poiName?: string;
  city?: string;
  country?: string;
  stopIndex?: number;
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
  error?: string;
}

/**
 * Synthesizes scene narrative caption and takeaway reflection using client-side Gemini Vision
 * (Fully compatible with static GitHub Pages hosting - zero backend server required)
 */
export async function synthesizeSceneWithGemini(
  params: SynthesizeParams
): Promise<SynthesizeResult> {
  const locationContextStr = [params.poiName, params.city, params.country]
    .filter(Boolean)
    .join(', ');

  const currentCategory = (params.existingReflection?.category || 'Cultural') as ReflectionCategory;

  if (!params.apiKey) {
    // Intelligent heuristic fallback when no API key is provided
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

    return {
      success: true,
      narrativeCaption: `Immersed in ${locationContextStr || 'the scene'}, the natural light illuminates the textured atmosphere of this memorable stop.`,
      category: currentCategory,
      takeawayText: sampleInsights[currentCategory] || sampleInsights.Cultural,
      isMock: true,
    };
  }

  try {
    const genAI = new GoogleGenerativeAI(params.apiKey);
    const model = genAI.getGenerativeModel({ model: 'gemini-1.5-flash' });

    const prompt = `You are EpiLog's travel intelligence synthesizer.
Analyze this travel stop and its location context:
Location: ${locationContextStr || 'Unknown location'}
${params.existingReflection?.userNotes ? `User notes: "${params.existingReflection.userNotes}"` : ''}

Generate an editorial, evocative travel log entry adhering strictly to this JSON format:
{
  "narrativeCaption": "1-2 evocative sentences summarizing the scene mood, atmosphere, and visual essence (like a National Geographic or Monocle travel journal).",
  "category": "Architectural" | "Culinary" | "Natural" | "Cultural",
  "takeawayText": "A 1-2 sentence 'What I Learned' insight explaining a cultural, architectural, historical, or ecological truth about this place."
}

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

    return {
      success: true,
      narrativeCaption: parsed.narrativeCaption,
      category: (parsed.category as ReflectionCategory) || currentCategory,
      takeawayText: parsed.takeawayText,
      isMock: false,
    };
  } catch (err: any) {
    console.error('Client-side Gemini synthesis error:', err);
    return {
      success: false,
      narrativeCaption: `Capturing the atmosphere of ${locationContextStr || 'this stop'}.`,
      category: currentCategory,
      takeawayText: 'Reflecting on personal memories and the cultural landscape.',
      isMock: true,
      error: err?.message || 'Synthesis failed',
    };
  }
}
