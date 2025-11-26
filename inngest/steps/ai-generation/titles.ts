import type { step as InngestStep } from "inngest";
import { GoogleGenerativeAI } from "@google/generative-ai";
import { titlesSchema, type Titles } from "../../schemas/ai-outputs";
import type { TranscriptWithExtras } from "../../types/assemblyai";
import { gemini as genAI } from "../../lib/gemini-client";

// Gemini client
const model = genAI.getGenerativeModel({ model: "gemini-2.5-flash" });

const TITLES_SYSTEM_PROMPT = `
You are an expert in SEO, content marketing, and viral content creation.
You ALWAYS return valid JSON. No text, no markdown, no explanation.
`;

function buildTitlesPrompt(transcript: TranscriptWithExtras): string {
  return `
Generate optimized titles for this podcast episode.
Output ONLY valid JSON in this format:

{
  "youtubeShort": ["...", "...", "..."],
  "youtubeLong": ["...", "...", "..."],
  "podcastTitles": ["...", "...", "..."],
  "seoKeywords": ["...", "..."]
}

TRANSCRIPT PREVIEW:
${transcript.text.substring(0, 2000)}...

${
  transcript.chapters.length > 0
    ? `MAIN TOPICS COVERED:\n${transcript.chapters
        .map((ch, idx) => `${idx + 1}. ${ch.headline}`)
        .join("\n")}`
    : ""
}

RULES:

1. YOUTUBE SHORT TITLES (exactly 3):
   - 40–60 characters
   - Curiosity-driven hook
   - Clickable but not clickbait

2. YOUTUBE LONG TITLES (exactly 3):
   - 70–100 characters
   - SEO-focused
   - Format: "Main Topic: Subtitle | Extra context"

3. PODCAST TITLES (exactly 3):
   - Creative + memorable
   - RSS directory friendly

4. SEO KEYWORDS (5–10):
   - High traffic search intent
   - Mix broad + niche
   - Only keywords, no sentences

Return ONLY JSON, no markdown.
  `;
}
function extractJsonBlock(text: string): any {
  try {
    // Extract the first {...} block from the model output
    const match = text.match(/\{[\s\S]*\}/);
    if (!match) throw new Error("No JSON object found in model output");

    return JSON.parse(match[0]);
  } catch (err) {
    console.error("JSON extraction/parsing failed:", err, "\nRAW:", text);
    return null;
  }
}
export async function generateTitles(
  step: typeof InngestStep,
  transcript: TranscriptWithExtras
): Promise<Titles> {
  console.log("Generating title suggestions with Gemini 2.5 Flash");

  try {
    const prompt = `${TITLES_SYSTEM_PROMPT}\n${buildTitlesPrompt(transcript)}`;
 const geminiCall = async ({ messages }: any) => {
      const prompt = messages[0].content + "\n\n" + messages[1].content;
      const result = await model.generateContent(prompt);
      return { text: result.response.text() };
    };
    // Inngest wrapper around Gemini call
     const response = await step.ai.wrap(
      "generate-titles-with-gemini",
      geminiCall,
      {
        messages: [
          { role: "system", content: TITLES_SYSTEM_PROMPT },
{ role: "user", content: buildTitlesPrompt(transcript) },
        ],
      }
    );

    const text = response.text;

    // Parse + validate using Zod
     
    const json = extractJsonBlock(text);
    const parsed = titlesSchema.parse(json);

    return parsed;
  } catch (error) {
    console.error("Gemini titles error:", error);

    return {
      youtubeShort: ["⚠️ Title generation failed"],
      youtubeLong: ["⚠️ Title generation failed"],
      podcastTitles: ["⚠️ Title generation failed"],
      seoKeywords: ["error"],
    };
  }
}
