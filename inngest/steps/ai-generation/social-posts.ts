import type { step as InngestStep } from "inngest";
import { GoogleGenerativeAI } from "@google/generative-ai";
import { type SocialPosts, socialPostsSchema } from "../../schemas/ai-outputs";
import type { TranscriptWithExtras } from "../../types/assemblyai";
import { gemini as genAI } from "../../lib/gemini-client";

// Remove ```json fences
function extractJson(text: string): string {
  const cleaned = text
    .replace(/```json/i, "")
    .replace(/```/g, "")
    .trim();

  const match = cleaned.match(/\{[\s\S]*\}/);
  if (!match) throw new Error("No JSON found in Gemini output");
  return match[0];
}

const SOCIAL_SYSTEM_PROMPT =
  "You are a viral social media marketing expert who understands each platform's unique audience, tone, and best practices. You create platform-optimized content that drives engagement and grows audiences.";

function buildSocialPrompt(transcript: TranscriptWithExtras): string {
  return `Create platform-specific promotional posts for this podcast episode.

PODCAST SUMMARY:
${transcript.chapters?.[0]?.summary || transcript.text.substring(0, 500)}

KEY TOPICS DISCUSSED:
${
  transcript.chapters
    ?.slice(0, 5)
    .map((ch, idx) => `${idx + 1}. ${ch.headline}`)
    .join("\n") || "See transcript"
}

OUTPUT REQUIREMENTS:
Return STRICT JSON with this structure:

{
  "twitter": "string",
  "linkedin": "string",
  "instagram": "string",
  "tiktok": "string",
  "youtube": "string",
  "facebook": "string"
}

NO extra text. NO explanations. NO markdown fences. ONLY pure JSON.

Now generate:

1. TWITTER/X — compelling post  
2. LINKEDIN — 1–2 paragraphs  
3. INSTAGRAM — caption with 2–4 emojis  
4. TIKTOK — short hype caption  
5. YOUTUBE — 2–3 para description  
6. FACEBOOK — 2–3 paras engaging style  
`;
}

export async function generateSocialPosts(
  step: typeof InngestStep,
  transcript: TranscriptWithExtras
): Promise<SocialPosts> {
  console.log("Generating social posts with Gemini");

  try {
    const model = genAI.getGenerativeModel({ model: "gemini-2.5-flash" });

    const geminiCall = async ({ messages }: any) => {
      const prompt = messages[0].content + "\n\n" + messages[1].content;
      const result = await model.generateContent(prompt);
      return { text: result.response.text() };
    };

    const response = await step.ai.wrap(
      "generate-social-posts-with-gemini",
      geminiCall,
      {
        messages: [
          { role: "system", content: SOCIAL_SYSTEM_PROMPT },
          { role: "user", content: buildSocialPrompt(transcript) },
        ],
      }
    );

    const rawText = response.text;
    const jsonText = extractJson(rawText);
    const parsed = JSON.parse(jsonText);

    // Validate with Zod schema (no twitter limit anymore)
    // const socialPosts = socialPostsSchema.parse(parsed);

    return parsed;
  } catch (error) {
    console.error("Gemini social post generation error:", error);

    return {
      twitter: "⚠️ Error generating social post. Check logs.",
      linkedin: "⚠️ Error generating social post. Check logs.",
      instagram: "⚠️ Error generating social post. Check logs.",
      tiktok: "⚠️ Error generating social post. Check logs.",
      youtube: "⚠️ Error generating social post. Check logs.",
      facebook: "⚠️ Error generating social post. Check logs.",
    };
  }
}
