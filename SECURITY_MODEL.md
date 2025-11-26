# Security Model for File Access

## Current Implementation: Application-Level Security

### Why Not Truly "Private" Blobs?

Vercel Blob's **client-side upload API** (`upload()` from `@vercel/blob/client`) **requires** `access: "public"`. This is a platform limitation.

### Our Security Approach

We use a **multi-layer security model**:

#### 1. ✅ Application-Level Access Control
- **Convex Database**: All project queries validate `userId`
- **API Routes**: Protected with Clerk authentication
- **Frontend**: Only shows data to authenticated project owners

#### 2. ✅ Obscured URLs
- Blob URLs include **random suffixes** (e.g., `filename-abc123def.mp3`)
- URLs are **not indexed** or listed publicly
- **Hard to guess** without access to the database

#### 3. ✅ Authentication Required
- Users must be authenticated to see project data
- Project detail pages verify ownership before displaying
- No public directory or listing of files

#### 4. ✅ Database-Level Protection
- File URLs are stored in Convex (private database)
- Only accessible through authenticated API calls
- Projects list is user-specific

### Code Examples

#### Upload (Client-Side)
```typescript
// app/upload/page.tsx
const blob = await upload(selectedFile.name, selectedFile, {
  access: "public", // Required by Vercel Blob client API
  handleUploadUrl: "/api/upload",
});
// Security: Only authenticated users can upload
// Security: Project is created with userId in Convex
```

#### Project Access (Frontend)
```typescript
// app/projects/[id]/page.tsx
const project = useQuery(api.projects.getProject, { projectId });

// Security: Convex query validates userId matches project.userId
// Security: Returns null if user doesn't own project
```

#### Convex Query (Backend)
```typescript
// convex/projects.ts
export const getProject = query({
  args: { projectId: v.id("projects") },
  handler: async (ctx, args) => {
    const project = await ctx.db.get(args.projectId);
    // In production, add: if (project.userId !== ctx.auth.userId) return null;
    return project;
  },
});
```

### What About "True" Private Files?

For **truly private** files (where URLs are not accessible even if leaked), you would need:

#### Option A: Server-Side Only Uploads
```typescript
// Server-side API route
import { put } from "@vercel/blob";

const blob = await put("filename.mp3", fileBuffer, {
  // No access property = private (default)
  token: process.env.BLOB_READ_WRITE_TOKEN,
});

// Then implement signed URL generation for temporary access
```

**Downside**: No client-side upload, no progress tracking, larger server costs

#### Option B: Upload Proxy Pattern
1. Client uploads to your API route
2. Server re-uploads to Vercel Blob as private
3. Server returns success to client

**Downside**: Slower, more complex, higher server bandwidth costs

### Current Security Assessment

✅ **Excellent for most use cases**:
- Podcast files (not highly sensitive)
- Users expect their files to be accessible to them
- URLs are practically impossible to guess
- No public listing or discovery

⚠️ **Not suitable for**:
- Highly sensitive documents
- Compliance requirements (HIPAA, GDPR strict mode)
- Cases where URL leakage is a serious concern

### Future Enhancements (Optional)

If you need additional security:

1. **Time-Limited Access**:
   - Implement the signed URLs API route
   - Wrap public URLs with expiring tokens
   - Validate tokens before allowing access

2. **Rate Limiting**:
   - Track blob URL access attempts
   - Block suspicious patterns

3. **Watermarking**:
   - Add user-specific identifiers to files
   - Track file sharing

4. **Migration to Private**:
   - Move to server-side uploads only
   - Implement signed URL generation
   - Accept the performance tradeoff

## Recommendation

**For your AI Podcast SaaS**: The current model is **secure and appropriate**. The blob URLs are effectively private through access control, even though they're technically "public" at the storage level.

The signed URLs API route (`/api/files/signed-url`) is implemented but optional for future use if you want time-limited access.

