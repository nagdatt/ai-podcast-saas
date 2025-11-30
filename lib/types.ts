/**
 * Shared type definitions used across the application
 */

/**
 * Phase status for processing workflow
 * Used by UI components to display current processing state
 * Matches Convex schema jobStatus field
 * Status updates flow from Inngest → Convex → UI (via subscriptions)
 */
export type PhaseStatus = "pending" | "running" | "completed" | "failed";

/**
 * Upload status for file uploads
 */
export type UploadStatus =
  | "idle"
  | "uploading"
  | "processing"
  | "completed"
  | "error";

export type StepStatus =
  | "completed"
  | "failed"
  | "pending"
  | "running";

export interface JobStatus {
  transcription?: StepStatus;
  contentGeneration?: StepStatus;
  keyMoments?: StepStatus;
  summary?: StepStatus;
  social?: StepStatus;
  titles?: StepStatus;
  hashtags?: StepStatus;
  youtubeTimestamps?: StepStatus;
}
