/**
 * AI Summary Generation Step (Gemini Version)
 *
 * Generates multi-format podcast summaries using Google Gemini 1.5 Flash.
 */

import type { step as InngestStep } from "inngest";
import { gemini } from "../../lib/gemini-client";
import { type Summary, summarySchema } from "../../schemas/ai-outputs";
import type { TranscriptWithExtras } from "../../types/assemblyai";

const SUMMARY_SYSTEM_PROMPT =
  "You are an expert podcast content analyst and marketing strategist. Your summaries are engaging, insightful, and highlight the most valuable takeaways for listeners.";

function buildSummaryPrompt(transcript: TranscriptWithExtras): string {
  return `SYSTEM INSTRUCTION:
${SUMMARY_SYSTEM_PROMPT}

USER REQUEST:
Analyze this podcast transcript in detail and create a structured JSON summary.

TRANSCRIPT (first 3000 chars):
${transcript.text.substring(0, 3000)}...

${
  transcript.chapters.length
    ? `AUTO-DETECTED CHAPTERS:
${transcript.chapters
  .map((c, i) => `${i + 1}. ${c.headline} - ${c.summary}`)
  .join("\n")}`
    : ""
}

REQUIRED OUTPUT FORMAT (STRICT JSON):

{
  "full": "200-300 word overview...",
  "bullets": ["point1", "point2", ...],
  "insights": ["insight1", "insight2", ...],
  "tldr": "one-sentence summary"
}

DO NOT include any explanation. Return ONLY valid JSON.`;
}

export async function generateSummary(
  step: typeof InngestStep,
  transcript: TranscriptWithExtras
): Promise<Summary> {
  console.log("Generating podcast summary using Gemini…");

  try {
    const prompt = buildSummaryPrompt(transcript);

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

    // Inngest wrap
    const response = await step.ai.wrap(
      "generate-summary-with-gemini",
      createCompletion,
      { prompt }
    );

    const rawText = response.text;
const cleaned = rawText
  .replace(/```json/i, "")
  .replace(/```/g, "")
  .trim();

    let parsed;
    try {
      parsed = JSON.parse(cleaned);
    } catch (err) {
      console.error("JSON parse error:", err);
      throw err;
    }

    // Validate with Zod
    const summary = summarySchema.parse(parsed);
    return summary;
  } catch (error) {
    console.error("Gemini summary generation error:", error);

    return {
      full: "⚠️ Error generating summary with Gemini. Please check logs.",
      bullets: ["Summary generation failed - see transcript"],
      insights: ["No insights available due to error"],
      tldr: "Summary generation failed",
    };
  }
}
