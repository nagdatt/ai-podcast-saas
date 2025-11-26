# 🚀 Quick Start Guide

## Get Your MVP Running in 5 Minutes

### Step 1: Install Dependencies ✅
Already done! Your packages are installed.

### Step 2: Set Up Environment Variables

Create `.env.local` in the project root:

```bash
# Vercel Blob (Get from: https://vercel.com/dashboard/stores)
BLOB_READ_WRITE_TOKEN=vercel_blob_rw_xxxxx

# Convex (Get from: https://dashboard.convex.dev)
NEXT_PUBLIC_CONVEX_URL=https://your-deployment.convex.cloud
CONVEX_DEPLOY_KEY=prod:your-deployment|xxxxx

# Clerk (Get from: https://dashboard.clerk.com)
NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY=pk_test_aW5maW5pdGUtbGFyay03OS5jbGVyay5hY2NvdW50cy5kZXYk
CLERK_SECRET_KEY=sk_test_0ieK4Sg9MgzAesC4WQDL0L3TheeOQpSIyl2AnCZZAw

# Inngest (Get from: https://app.inngest.com)
INNGEST_EVENT_KEY=your_event_key
INNGEST_SIGNING_KEY=signkey-prod-xxxxx

# AssemblyAI (Get from: https://www.assemblyai.com/dashboard)
ASSEMBLYAI_API_KEY=e41783dbb4e349e69755986630041111
```

### Step 2.5: Configure Clerk-Convex Integration ⚠️ IMPORTANT

**This is required for the app to work!**

1. Go to [Clerk Dashboard](https://dashboard.clerk.com)
2. Select your application
3. Navigate to **Configure** → **JWT Templates**
4. Click **"New template"**
5. Choose **"Convex"** from the templates list
6. Name it: `convex` (must be exactly this name)
7. The template will auto-configure the correct claims
8. Click **Save**

**Why this is needed:** Clerk needs to issue JWT tokens that Convex can verify. Without this, you'll get a 404 error when trying to fetch data.

### Step 3: Start Convex

```bash
pnpm convex dev
```

This will:
- Initialize your Convex deployment
- Push the database schema
- Start syncing

### Step 4: Start the Dev Server

```bash
pnpm dev
```

This starts both Next.js and Convex.

### Step 5: Test the Upload!

1. Open http://localhost:3000
2. Sign in with Clerk (or create account)
3. Click "Upload Podcast"
4. Drag & drop an audio file (MP3, M4A, etc.)
5. Watch the progress bar
6. Get redirected to your project dashboard
7. See real-time processing updates!

## 🎯 What to Test

### Upload Flow:
- ✅ Drag & drop works
- ✅ File validation (100MB limit)
- ✅ Progress bar updates
- ✅ Error handling for large files

### Processing:
- ✅ Project created in Convex
- ✅ Inngest workflow triggered
- ✅ Real AssemblyAI transcription
- ✅ Auto chapters → key moments
- ✅ Real-time status updates

### Dashboard:
- ✅ Project list shows all uploads
- ✅ Project detail shows processing steps
- ✅ Results appear when completed
- ✅ Download SRT captions

## 🧪 Test with Sample Audio

Use a short audio file (< 5 minutes) for testing:
- Podcast clip
- Voice recording
- Any MP3/M4A file

AssemblyAI will:
1. Transcribe it (takes ~10-30 seconds)
2. Identify speakers (if multiple)
3. Generate chapters
4. Create word-level timestamps

## 🔍 Monitoring

### Check Convex Dashboard:
- See projects being created
- Watch real-time updates

### Check Inngest Dashboard:
- See workflow executions
- Monitor step progress
- Debug any failures

### Check AssemblyAI Dashboard:
- View transcription usage
- Monitor costs
- Check API logs

## ⚠️ Common Issues

### "404 Not Found" when fetching Convex data:
- **Most common issue!** You need to set up Clerk-Convex JWT integration
- Go to Clerk Dashboard → JWT Templates → Create "Convex" template
- Name must be exactly `convex`
- Refresh your browser after setting this up

### "Unauthorized" error:
- Check Clerk keys are correct
- Ensure you're signed in

### Projects page not loading:
- Verify Clerk-Convex JWT template is set up (see above)
- Check browser console for 404 errors on `/tokens/convex`
- Ensure `dynamic` prop is on ClerkProvider in layout.tsx

### "AssemblyAI transcription failed":
- Verify ASSEMBLYAI_API_KEY is set
- Check API key is valid
- Ensure file URL is accessible

### No progress updates:
- Check Convex is running (`pnpm convex dev`)
- Verify NEXT_PUBLIC_CONVEX_URL is correct

### Inngest not triggering:
- Check INNGEST_EVENT_KEY and INNGEST_SIGNING_KEY
- Visit http://localhost:3000/api/inngest to sync

## 📊 What You'll See

### During Upload:
```
Uploading... 45%
Processing... 100%
→ Redirect to project dashboard
```

### Project Dashboard:
```
Processing Steps:
✓ Audio Extraction: Skipped (audio file)
⏳ Transcription: Running
⏳ Key Moments: Pending
⏳ Summary: Pending
...
```

### After Processing (~1-2 minutes):
```
Processing Steps:
✓ Transcription: Completed
✓ Key Moments: Completed (from AssemblyAI chapters!)
✓ Summary: Completed (mock)
✓ Captions: Completed (real SRT)
✓ Titles: Completed (mock)
✓ Hashtags: Completed (mock)

Results:
- Full transcript with timestamps
- Auto-detected key moments ✨
- Download SRT captions
- Generated titles & hashtags
```

## 🎉 Success Criteria

Your MVP is working when:
- ✅ You can upload a file via drag & drop
- ✅ Progress bar shows upload percentage
- ✅ You get redirected to project dashboard
- ✅ **Real transcript appears** (from AssemblyAI)
- ✅ **Key moments extracted from auto chapters**
- ✅ You can download SRT captions
- ✅ Processing steps update in real-time

## 🚀 You're Ready!

Everything is implemented and ready to test. Start with a short audio file (3-5 minutes) to see the full flow in action!

**Next:** Consider implementing GPT for summary/titles/hashtags generation to complete the full AI pipeline.

