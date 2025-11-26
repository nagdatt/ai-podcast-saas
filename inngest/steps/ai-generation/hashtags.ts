/**
 * Platform-Specific Hashtag Generation
 */
import type { step as InngestStep } from "inngest";
import { type Hashtags, hashtagsSchema } from "../../schemas/ai-outputs";
import type { TranscriptWithExtras } from "../../types/assemblyai";
import { gemini as genAI } from "../../lib/gemini-client";

// --- Utility: Extract JSON from Gemini output ---
function extractJson(text: string): string {
  const cleaned = text
    .replace(/```json/i, "")
    .replace(/```/g, "")
    .trim();

  const match = cleaned.match(/\{[\s\S]*\}/);
  if (!match) throw new Error("No JSON found in Gemini output");
  return match[0];
}

// --- System Prompt ---
const HASHTAGS_SYSTEM_PROMPT =
  "You are a social media growth expert who understands platform algorithms and trending hashtag strategies. You create hashtag sets that maximize reach and engagement.";

// --- Build Prompt ---
function buildHashtagsPrompt(transcript: TranscriptWithExtras): string {
  return `Create platform-optimized hashtag strategies for this podcast.

TOPICS COVERED:
${
  transcript.chapters
    ?.map((ch, idx) => `${idx + 1}. ${ch.headline}`)
    .join("\n") || "General discussion"
}

OUTPUT FORMAT (STRICT JSON ONLY):

{
  "youtube": ["#tag1", "#tag2", "#tag3", "#tag4", "#tag5"],
  "instagram": ["#tag1", "... 6 to 8 tags ..."],
  "tiktok": ["5 to 6 tags"],
  "linkedin": ["5 tags"],
  "twitter": ["5 tags"]
}

Instructions:
- YOUTUBE: exactly 5 hashtags
- INSTAGRAM: 6–8 hashtags
- TIKTOK: 5–6 hashtags
- LINKEDIN: exactly 5 hashtags
- TWITTER: exactly 5 hashtags
- ALL hashtags must start with #
- NO text outside JSON
- NO explanations, no markdown`;
}

// --- Main Generator ---
export async function generateHashtags(
  step: typeof InngestStep,
  transcript: TranscriptWithExtras
): Promise<Hashtags> {
  console.log("Generating hashtags with Gemini");

  try {
    const model = genAI.getGenerativeModel({ model: "gemini-2.5-flash" });

    const geminiCall = async ({ messages }: any) => {
      const prompt = messages[0].content + "\n\n" + messages[1].content;
      const result = await model.generateContent(prompt);
      return { text: result.response.text() };
    };

    // Call Gemini inside Inngest wrapper
    const response = await step.ai.wrap(
      "generate-hashtags-with-gemini",
      geminiCall,
      {
        messages: [
          { role: "system", content: HASHTAGS_SYSTEM_PROMPT },
          { role: "user", content: buildHashtagsPrompt(transcript) },
        ],
      }
    );

    const rawText = response.text;

    // Extract JSON
    const jsonText = extractJson(rawText);
    const parsed = JSON.parse(jsonText);

    // Validate using Zod schema
    const hashtags: Hashtags = hashtagsSchema.parse(parsed);

    return hashtags;
  } catch (error) {
    console.error("Gemini hashtag generation error:", error);

    // Fallback with warnings
    return {
      youtube: ["⚠️ Hashtag generation failed"],
      instagram: ["⚠️ Hashtag generation failed"],
      tiktok: ["⚠️ Hashtag generation failed"],
      linkedin: ["⚠️ Hashtag generation failed"],
      twitter: ["⚠️ Hashtag generation failed"],
    };
  }
}
