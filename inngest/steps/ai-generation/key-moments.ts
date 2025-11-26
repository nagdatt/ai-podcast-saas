/**
 * Key Moments Generation Step
 *
 * Extracts key moments from AssemblyAI's auto-generated chapters.
 * These moments represent interesting points for social media clips or navigation.
 *
 * Data Source: AssemblyAI Auto Chapters
 * - AssemblyAI's AI detects topic changes automatically
 * - Each chapter has: start time, headline, and summary
 * - No additional AI generation needed (fast and cost-free)
 *
 * Design Decision: Use AssemblyAI chapters vs. GPT analysis
 * - Pro: Fast, no additional API costs
 * - Pro: Reliable timing data from transcription source
 * - Con: Quality depends on AssemblyAI's chapter detection
 * - Trade-off: Good enough for most podcasts, cheaper than GPT analysis
 *
 * Use Cases:
 * - Social media clip selection
 * - Podcast navigation timestamps
 * - Episode highlight reel planning
 */import type { step as InngestStep } from "inngest";
import { formatTimestamp } from "@/lib/format";
import type { TranscriptWithExtras } from "../../types/assemblyai";
import { gemini } from "../../lib/gemini-client";

type KeyMoment = {
  time: string;        // Human-readable timestamp (MM:SS or HH:MM:SS)
  timestamp: number;   // Seconds for programmatic use
  text: string;        // AI-enhanced chapter headline
  description: string; // AI-enhanced summary/description
};

// -------------------------
// JSON Extract Helper
// -------------------------
function extractJson(text: string) {
  try {
    const match = text.match(/\{[\s\S]*\}/);
    if (!match) return null;
    return JSON.parse(match[0]);
  } catch (err) {
    console.error("Gemini JSON parse failed:", err);
    console.error("RAW:", text);
    return null;
  }
}

/**
 * Gemini 2.5 Flash version of Key Moments generation
 */
export async function generateKeyMoments(
  step: typeof InngestStep,
  transcript: TranscriptWithExtras
): Promise<KeyMoment[]> {
  console.log("Generating key moments using Gemini 2.5 Flash");

  const chapters = transcript.chapters || [];
  if (chapters.length === 0) {
    console.log("No chapters detected - returning empty key moments");
    return [];
  }

  const chapterData = chapters.map((chapter, idx) => ({
    index: idx,
    timestamp: Math.floor(chapter.start / 1000),
    headline: chapter.headline,
    summary: chapter.summary,
  }));

  const prompt = `
You are a content optimization expert. Transform these podcast chapters into key moments for viewers:

CRITICAL INSTRUCTIONS:
- Create concise, engaging titles (3-6 words) for each chapter.
- Summarize the chapter summary into 1-2 sentences.
- Return ONLY JSON in this format:

{
  "keyMoments": [
    {
      "index": 0,
      "text": "Short catchy title",
      "description": "Brief summary"
    }
  ]
}

CHAPTER DATA:
${chapterData
  .map(
    (ch) =>
      `Index: ${ch.index}\nTime: ${ch.timestamp}s\nHeadline: ${ch.headline}\nSummary: ${ch.summary}`
  )
  .join("\n\n")}
`;

  // Gemini call wrapper for Inngest
  const createCompletion = async (args: { prompt: string }) => {
    const model = gemini.getGenerativeModel({
      model: "gemini-2.5-flash",
    });
    const result = await model.generateContent(args.prompt);
    // Gemini response text
  return { text: result.response.text() };  };

  const result = await step.ai.wrap("generate-key-moments-gemini", createCompletion, {
    prompt,
  });

  const text = result.text;
  console.log("Gemini Raw Response:", text.substring(0, 500));

  const parsed = extractJson(text);

  let aiMoments: { index: number; text: string; description: string }[] = [];
  if (parsed && parsed.keyMoments) {
    aiMoments = parsed.keyMoments;
    console.log(`Parsed ${aiMoments.length} AI key moments`);
  } else {
    console.error("Failed to extract JSON from Gemini. Using fallback AssemblyAI data.");
  }

  // Merge AI-enhanced moments with timestamps
  const keyMoments: KeyMoment[] = chapterData.map((ch) => {
    const aiMoment = aiMoments.find((m) => m.index === ch.index);
    return {
      timestamp: ch.timestamp,
      time: formatTimestamp(ch.timestamp, { padHours: true, forceHours: true }),
      text: aiMoment?.text || ch.headline,
      description: aiMoment?.description || ch.summary,
    };
  });

  console.log("Generated key moments:", keyMoments.length);
  return keyMoments;
}
