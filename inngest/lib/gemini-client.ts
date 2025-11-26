/**
 * Inngest Client Configuration
 *
 * Inngest is a durable execution engine for background jobs and workflows.
 * It provides:
 * - Durable execution: Steps are retried on failure, progress is never lost
 * - Parallel execution: Run multiple steps simultaneously for better performance
 * - Observability: Built-in logging, metrics, and tracing
 * - Type safety: Full TypeScript support for events and functions
 *
 * Architecture:
 * - Client is used to define functions and send events
 * - Functions run on Inngest's infrastructure (or self-hosted)
 * - Events trigger functions via the /api/inngest webhook
 *
 */

import { GoogleGenerativeAI } from "@google/generative-ai";

export const gemini = new GoogleGenerativeAI("AIzaSyA2N0_DcitOrbr6PI79WEoQ95wpsMtJYU4");
//   const model = ai.getGenerativeModel({ model: "gemini-2.5-flash" });
