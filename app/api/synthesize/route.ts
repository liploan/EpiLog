import { NextRequest, NextResponse } from 'next/server';
import { GoogleGenerativeAI } from '@google/generative-ai';

interface SynthesizeRequest {
  apiKey?: string;
  photoBase64?: string; // base64 string without data: prefix or with it
  mimeType?: string;
  poiName?: string;
  city?: string;
  country?: string;
  stopIndex?: number;
  existingReflection?: {
    category?: string;
    userNotes?: string;
  };
}

export async function POST(req: NextRequest) {
  try {
    const body: SynthesizeRequest = await req.json();
    const apiKey = body.apiKey || process.env.GEMINI_API_KEY;

    const locationContextStr = [body.poiName, body.city, body.country]
      .filter(Boolean)
      .join(', ');

    if (!apiKey) {
      // Fallback heuristics when API key is not provided
      const category = (body.existingReflection?.category || 'Cultural') as any;
      const sampleInsights: Record<string, string> = {
        Architectural:
          'The structural harmony reflects classical construction traditions designed to withstand time and natural elements while blending seamlessly into the surrounding geography.',
        Culinary:
          'Local gastronomic customs emphasize hyper-seasonal freshness and artisanal preparation techniques passed down across generations.',
        Natural:
          'The microclimate and topography foster a rich ecosystem, offering a profound sense of seasonal rhythm and ecological serenity.',
        Cultural:
          'Rooted in centuries of local heritage, the traditions here preserve community memory through sacred geometry and architectural symbolism.',
      };

      return NextResponse.json({
        success: true,
        narrativeCaption: `Immersed in ${locationContextStr || 'the scene'}, the natural light illuminates the textured atmosphere of this memorable stop.`,
        category: category,
        takeawayText:
          sampleInsights[category] || sampleInsights.Cultural,
        isMock: true,
        note: 'Generated with built-in heuristic synthesizer. Add a Gemini API Key in Settings to enable real-time Multimodal Vision analysis.',
      });
    }

    const genAI = new GoogleGenerativeAI(apiKey);
    const model = genAI.getGenerativeModel({ model: 'gemini-1.5-flash' });

    const prompt = `You are EpiLog's travel intelligence synthesizer.
Analyze this travel photo and its location context:
Location: ${locationContextStr || 'Unknown location'}
${body.existingReflection?.userNotes ? `User notes: "${body.existingReflection.userNotes}"` : ''}

Generate an editorial, evocative travel log entry adhering strictly to this JSON format:
{
  "narrativeCaption": "1-2 evocative sentences summarizing the scene mood, atmosphere, and visual essence (like a National Geographic or Monocle travel journal).",
  "category": "Architectural" | "Culinary" | "Natural" | "Cultural",
  "takeawayText": "A 1-2 sentence 'What I Learned' insight explaining a cultural, architectural, historical, or ecological truth about this place."
}

Return ONLY valid raw JSON with no backticks or markdown codeblocks.`;

    const parts: any[] = [prompt];

    if (body.photoBase64) {
      let cleanBase64 = body.photoBase64;
      let detectedMime = body.mimeType || 'image/jpeg';

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

    // Clean up potential markdown JSON formatting
    const jsonStr = responseText
      .replace(/^```json\s*/i, '')
      .replace(/^```\s*/i, '')
      .replace(/\s*```$/, '')
      .trim();

    const parsed = JSON.parse(jsonStr);

    return NextResponse.json({
      success: true,
      narrativeCaption: parsed.narrativeCaption,
      category: parsed.category || 'Cultural',
      takeawayText: parsed.takeawayText,
      isMock: false,
    });
  } catch (err: any) {
    console.error('Gemini synthesis API error:', err);
    return NextResponse.json(
      {
        success: false,
        error: err?.message || 'Synthesis failed',
      },
      { status: 500 }
    );
  }
}
