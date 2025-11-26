import type { step as InngestStep } from "inngest";
import { formatTimestamp } from "@/lib/format";
import type { TranscriptWithExtras } from "../../types/assemblyai";
import { gemini } from "../../lib/gemini-client";

type YouTubeTimestamp = {
  timestamp: string;
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

/**
 * Gemini 2.5 Flash version of YouTube timestamp generation
 */
export async function generateYouTubeTimestamps(
  step: typeof InngestStep,
  transcript: TranscriptWithExtras
): Promise<YouTubeTimestamp[]> {
  console.log("Generating YouTube timestamps using Gemini 2.5 Flash");

  const model =  gemini.getGenerativeModel({
        model: "gemini-2.5-flash",
      });
 
  const chapters = transcript.chapters || [];

  if (!chapters || chapters.length === 0) {
    throw new Error("No chapters available from AssemblyAI.");
  }

  const chaptersToUse = chapters.slice(0, 100);

  const chapterData = chaptersToUse.map((chapter, idx) => ({
    index: idx,
    timestamp: Math.floor(chapter.start / 1000),
    headline: chapter.headline,
    summary: chapter.summary,
  }));

  const prompt = `
You are a YouTube content optimization expert. Create SHORT CHAPTER TITLES (3–6 words each).

CRITICAL:
- Do NOT copy transcript text.
- Do NOT write long sentences.
- ONLY create short, punchy titles.
- Return ONLY JSON.

CHAPTER DATA:
${chapterData
  .map(
    (ch) =>
      `Index: ${ch.index}\nTime: ${ch.timestamp}s\nHeadline: ${ch.headline}\nSummary: ${ch.summary}`
  )
  .join("\n\n")}

JSON FORMAT (RETURN ONLY THIS):
{
  "titles": [
    { "index": 0, "title": "Intro to Automation" },
    { "index": 1, "title": "Setting Up Tools" }
  ]
}
`;

  // -------------------------
  // Gemini call
  // -------------------------
  // Gemini API call wrapper for Inngest
    const createCompletion = async (args: { prompt: string }) => {
      const model = gemini.getGenerativeModel({
        model: "gemini-2.5-flash",
      });

      // Gemini equivalent of chat completion
      const result = await model.generateContent(args.prompt);
      console.log("Gemini raw response:", result);
      return { text: result.response.text() };
    };

  const result = await step.ai.wrap(
    "generate-youtube-titles-gemini",
    createCompletion,
      { prompt }
  );

  const text = result.text;
  console.log("Gemini Raw Response:", text.substring(0, 500));

  const parsed = extractJson(text);

  let aiTitles: { index: number; title: string }[] = [];

  if (parsed && parsed.titles) {
    aiTitles = parsed.titles;
    console.log(`Parsed ${aiTitles.length} AI titles`);
  } else {
    console.error("Failed to extract JSON from Gemini. Using fallback headlines.");
  }

  // Merge AI titles + timestamps
  const aiTimestamps = chapterData.map((chapter) => {
    const aiTitle = aiTitles.find((t) => t.index === chapter.index);
    return {
      timestamp: chapter.timestamp,
      description: aiTitle?.title || chapter.headline,
    };
  });

  // Final YouTube formatting
  const youtubeTimestamps = aiTimestamps.map((item) => ({
    timestamp: formatTimestamp(item.timestamp, { padHours: false }),
    description: item.description,
  }));

  console.log("YouTube timestamps ready:", youtubeTimestamps.length);

  return youtubeTimestamps;
}
