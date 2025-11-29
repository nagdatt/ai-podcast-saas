import type { step as InngestStep } from "inngest";
import { formatTimestamp } from "@/lib/format";
import type { TranscriptWithExtras } from "../../types/assemblyai";
import { gemini } from "../../lib/gemini-client";

type KeyMoment = {
  time: string;
  timestamp: number;
  text: string;
  description: string;
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

export async function generateKeyMoments(
  step: typeof InngestStep,
  transcript: TranscriptWithExtras
): Promise<KeyMoment[]> {
  console.log("Generating key moments using Gemini 2.5 Flash");
  console.log("Transcript received:", transcript);

  // -------------------------
  // HARDENED SAFETY CHECK
  // -------------------------
  if (!transcript || !Array.isArray(transcript.chapters)) {
    console.error("❌ transcript.chapters is missing or transcript is undefined");
    console.error("Transcript value:", transcript);
    return [];
  }

  const chapters = transcript.chapters;

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
- Create concise, engaging titles (3-6 words).
- Summarize each chapter into 1-2 sentences.
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
      `Index: ${ch.index}
Time: ${ch.timestamp}s
Headline: ${ch.headline}
Summary: ${ch.summary}`
  )
  .join("\n\n")}
`;

  // Gemini wrapper
  const createCompletion = async (args: { prompt: string }) => {
    const model = gemini.getGenerativeModel({
      model: "gemini-2.5-flash",
    });

    const result = await model.generateContent(args.prompt);
    return { text: result.response.text() };
  };

  const result = await step.ai.wrap(
    "generate-key-moments-gemini",
    createCompletion,
    { prompt }
  );

  const text = result.text;
  console.log("Gemini Raw Response:", text.substring(0, 500));

  const parsed = extractJson(text);

  let aiMoments: { index: number; text: string; description: string }[] = [];

  if (parsed?.keyMoments) {
    aiMoments = parsed.keyMoments;
    console.log(`Parsed ${aiMoments.length} AI key moments`);
  } else {
    console.error("Failed to extract JSON from Gemini. Using fallback AssemblyAI data.");
  }

  // Merge AI + timestamps
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
