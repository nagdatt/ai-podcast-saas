# AI Podcast Assistant - Pricing Structure

## Overview

Three tiers designed to scale with creator needs: **FREE** (trial), **PRO** (AI content generation), and **ULTRA** (advanced AI intelligence).

---

## Pricing Tiers

### 🆓 FREE

**Perfect for:** Testing the platform

| Feature | Limit |
|---------|-------|
| Projects | 3 (lifetime, hard cap) |
| File Size | 10 MB max |
| Duration | 10 min max |

**What You Get:**
- ✓ AI Summary

**What Happens Behind the Scenes:**
- AI analyzes your audio (transcription) to generate content
- You DON'T get access to the raw transcript (ULTRA only)

**Goal:** Experience AI-powered content generation and prove value.

---

### 💼 PRO - $29/month

**Perfect for:** Regular podcasters who need AI content distribution

| Feature | Limit |
|---------|-------|
| Projects | 30 per month |
| File Size | 200 MB max |
| Duration | 2 hours max |

**What You Get:**

Everything in FREE, plus:

#### 🤖 AI Content Generation
- ✓ **AI Captions** - Ready-to-use SRT files
- ✓ **AI Social Posts** - Optimized copy for 6 platforms:
  - Twitter
  - LinkedIn
  - Instagram
  - TikTok
  - YouTube
  - Facebook
- ✓ **AI Titles** - 4 different styles:
  - YouTube Short
  - YouTube Long
  - Podcast Titles
  - SEO Keywords
- ✓ **AI Hashtags** - Platform-specific tags for:
  - YouTube
  - Instagram
  - TikTok
  - LinkedIn
  - Twitter

**Key Value:** "AI writes all your distribution content"

---

### 🚀 ULTRA - $69/month

**Perfect for:** Serious creators & agencies who need advanced AI intelligence

| Feature | Limit |
|---------|-------|
| Projects | Unlimited |
| File Size | 3 GB max |
| Duration | Unlimited |

**What You Get:**

Everything in PRO, plus:

#### 🧠 Advanced AI Intelligence
- ✓ **AI YouTube Timestamps** - Smart chapter recommendations
- ✓ **AI Key Moments** - Viral clip opportunities identified
- ✓ **AI Speaker Diarization** - Who said what and when
- ✓ **Full Transcript Access** - View the complete transcript with speaker dialogue

**Key Value:** "AI finds your best content and scales with you"

---

## Feature Comparison Table

| Feature | FREE | PRO | ULTRA |
|---------|:----:|:---:|:-----:|
| **Limits** |
| Projects | 3 lifetime | 30/month | ∞ |
| File Size | 10 MB | 200 MB | 3 GB |
| Max Duration | 10 min | 2 hours | ∞ |
| **AI Features** |
| AI Summary | ✓ | ✓ | ✓ |
| **AI Content Generation** |
| AI Captions (SRT) | ✗ | ✓ | ✓ |
| AI Social Posts | ✗ | ✓ | ✓ |
| AI Titles | ✗ | ✓ | ✓ |
| AI Hashtags | ✗ | ✓ | ✓ |
| **Advanced AI (ULTRA Only)** |
| Full Transcript Access | ✗ | ✗ | ✓ |
| YouTube Timestamps | ✗ | ✗ | ✓ |
| Key Moments | ✗ | ✗ | ✓ |
| Speaker Diarization | ✗ | ✗ | ✓ |

**Note:** AI analyzes audio (transcription) for ALL plans to generate content, but transcript text is only accessible to ULTRA users.

---

## File Size Reference

### What the limits support:

**FREE (10 MB):**
- ~10 minutes of MP3 @ 128kbps

**PRO (200 MB):**
- ~2 hours of MP3 @ 192kbps
- ~1 hour of MP3 @ 320kbps

**ULTRA (3 GB):**
- ~10+ hours of MP3 @ 320kbps
- ~5 hours of uncompressed WAV
- ~1-1.5 hours of 720p video
- Professional audio formats (FLAC, ALAC)

---

## Implementation Checklist

### 1. File Validation (Upload Route)
- Check `file.size` against tier limits
- Estimate or validate duration
- Return clear error messages

### 2. Feature Gating (Inngest Workflow)
- Skip YouTube timestamps for non-ULTRA users
- Skip key moments for non-ULTRA users
- Skip speaker diarization for non-ULTRA users
- Skip content generation (social posts, titles, hashtags) for FREE users
- Transcription runs for ALL users (not gated)

### 3. Project Quota (Convex)
- Track project count per month for PRO users
- Hard cap at 3 projects for FREE users
- No limits for ULTRA users

### 4. Tier Storage
Store subscription tier in one of:
- Clerk `publicMetadata.subscriptionTier` (recommended)
- Convex `users` table with tier field

---

## Messaging

### FREE → PRO Upgrade
> "Stop writing social posts manually. Let AI generate platform-optimized content for all 6 platforms, plus titles and hashtags."

### PRO → ULTRA Upgrade
> "Go beyond distribution. Access your full podcast transcript, let advanced AI find your viral moments, generate perfect YouTube chapters, and identify speakers automatically."

---

## Pricing Philosophy

- **FREE**: Prove the AI works (AI-generated summary from your podcast)
- **PRO**: AI does your content distribution work ($29)
- **ULTRA**: AI provides intelligence + full transcript access + removes all limits ($69)

