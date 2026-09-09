# Graph Report - Batallon11  (2026-08-30)

## Corpus Check
- 138 files · ~78,317 words
- Verdict: corpus is large enough that graph structure adds value.

## Summary
- 796 nodes · 1505 edges · 54 communities (36 shown, 6 thin omitted)
- Extraction: 91% EXTRACTED · 9% INFERRED · 0% AMBIGUOUS · INFERRED: 132 edges (avg confidence: 0.85)
- Token cost: 31,000 input · 4,200 output

## Community Hubs (Navigation)
- React Pages and Components
- Auth Sessions and Cookies
- Express Server Bootstrap
- Post Content Controllers
- Server Runtime Dependencies
- Site Layout and Branding
- Project Docs and Emblems
- Server Package Manifest
- Stage Definitions and Seeding
- Auth Middleware and Stage Routes
- Root Workspace Scripts
- TOTP and Encryption at Rest
- Events and File URLs
- Stage Gallery and Daily Shuffle
- Client Build Tooling
- Client Runtime Dependencies
- Initial Schema Migrations
- Image Processing Pipeline
- Supabase Storage Adapter
- Request Validation and Gallery Routes
- Gallery Controller and Audit Log
- Prisma Client and Image Refs
- Post Routes
- Event Routes and Upload Limiter
- Public Stage Routes
- Zod Content Schemas
- Image Repair Script
- Admin Date Time Field
- Stage Gallery Routes
- Client Package Scripts
- Visit Us and Map Config
- Contact WhatsApp Section
- Stage Contact WhatsApp
- Multer Upload Config
- Client Package Identity
- Storage and Deployment Rationale
- Framer Motion Dependency
- React Type Definitions
- Vercel Headers Config
- Vite Config
- Stage Media Migration
- Usuarios Table

## God Nodes (most connected - your core abstractions)
1. `asset()` - 24 edges
2. `fileToStorageReference()` - 19 edges
3. `audit()` - 18 edges
4. `login()` - 17 edges
5. `Seo()` - 15 edges
6. `useAuth()` - 15 edges
7. `api` - 15 edges
8. `withResolvedImageUrl()` - 13 edges
9. `breadcrumbLd()` - 12 edges
10. `scripts` - 12 edges

## Surprising Connections (you probably didn't know these)
- `Battalion Group Photo Hero` --references--> `Public Site Sections`  [INFERRED]
  client/public/Fondo_Primera_seccion.jpg → README.md
- `Stage Pages` --references--> `Baqueanos Emblem`  [EXTRACTED]
  README.md → client/public/Logo_Baqueanos.png
- `Stage Pages` --references--> `Caminantes y Chispistas Emblem`  [EXTRACTED]
  README.md → client/public/Logo_Caminantes_y_Chispistas.png
- `Stage Pages` --references--> `Horneros y Pichones Emblem`  [EXTRACTED]
  README.md → client/public/Logo_Honeros_Pichones.jpg
- `Stage Pages` --references--> `Soles Emblem`  [EXTRACTED]
  README.md → client/public/Logo_Soles.png

## Import Cycles
- None detected.

## Hyperedges (group relationships)
- **Six Formative Stages** — claude_stages_static_config, readme_stage_pages, client_public_logo_honeros_pichones_emblem, client_public_logo_caminantes_y_chispistas_emblem, client_public_logo_pioneros_y_fuegos_emblem, client_public_logo_rastradores_emblem, client_public_logo_baqueanos_emblem, client_public_logo_soles_emblem [EXTRACTED 1.00]
- **Admin Access Control Chain** — claude_gate_token_auth, claude_role_stage_scoping, readme_admin_panel, client_public_robots_crawl_policy [INFERRED 0.85]
- **Supply Chain Security Controls** — claude_security_posture, _github_workflows_security_audit_job, pnpm_workspace_security_overrides [INFERRED 0.85]

## Communities (54 total, 6 thin omitted)

### Community 0 - "React Pages and Components"
Cohesion: 0.05
Nodes (74): App(), AboutSection(), VALUES, AdminFileInput(), CoordinatorIndexRedirect(), EventsSection(), formatDate(), Gallery() (+66 more)

### Community 1 - "Auth Sessions and Cookies"
Cohesion: 0.05
Nodes (65): accessCookieMaxAgeMs(), accessCookieOptions(), baseCookieOptions(), clearCookieOptions(), csrfCookieOptions(), parseSameSite(), refreshCookieOptions(), { audit, maskEmail } (+57 more)

### Community 2 - "Express Server Bootstrap"
Cohesion: 0.05
Nodes (35): validateEnv(), WEAK_VALUES, cleanupExpiredRecords(), prisma, correlationId(), crypto, apiLimiter, app (+27 more)

### Community 3 - "Post Content Controllers"
Cohesion: 0.11
Nodes (36): { audit }, createPost(), { deleteImagesIfUnused }, deleteImageUrls(), deletePost(), { fileToStorageReference }, mirrorImagesToHomeGallery(), mirrorImageToHomeGallery() (+28 more)

### Community 4 - "Server Runtime Dependencies"
Cohesion: 0.06
Nodes (35): @aws-sdk/client-s3, bcrypt, cookie-parser, cors, dotenv, express, express-rate-limit, express-slow-down (+27 more)

### Community 5 - "Site Layout and Branding"
Cohesion: 0.11
Nodes (26): Footer(), INFO_LINKS, scrollToTarget(), SOCIAL_LINKS, Hero(), scrollToId(), DarkModeToggle(), links (+18 more)

### Community 6 - "Project Docs and Emblems"
Cohesion: 0.11
Nodes (28): Security Audit CI Job, Client Layout Structure, General vs Per-Stage Content Model, Gate Token Admin Access, Role and Stage Scoping, Hardened Security Posture, Stages as Static Config, Organization JSON-LD Schema (+20 more)

### Community 7 - "Server Package Manifest"
Cohesion: 0.07
Nodes (26): nodemon, prisma, description, devDependencies, nodemon, prisma, vitest, vitest (+18 more)

### Community 8 - "Stage Definitions and Seeding"
Cohesion: 0.12
Nodes (21): listStages(), {
  listStagesMerged,
  getStageMergedBySlug,
}, { postInclude, toPostApiList }, prisma, { withResolvedImageUrlList }, getStageMergedBySlug(), {
  listStages,
  getStageBySlug,
  isValidStageSlug,
}, listStagesMerged() (+13 more)

### Community 9 - "Auth Middleware and Stage Routes"
Cohesion: 0.11
Nodes (22): attachUserOptional(), { COOKIE_ACCESS }, prisma, { verifyAccessToken }, authRequired(), { COOKIE_ACCESS }, prisma, readAccessToken() (+14 more)

### Community 10 - "Root Workspace Scripts"
Cohesion: 0.08
Nodes (23): concurrently, description, devDependencies, concurrently, engines, node, pnpm, name (+15 more)

### Community 11 - "TOTP and Encryption at Rest"
Cohesion: 0.12
Nodes (19): { encrypt }, { generateSecret, generateURI }, main(), prisma, { PrismaClient }, { encrypt }, main(), prisma (+11 more)

### Community 12 - "Events and File URLs"
Cohesion: 0.15
Nodes (19): { audit }, createEvent(), deleteEvent(), {
  fileToStorageReference,
  withResolvedImageUrl,
  withResolvedImageUrlList,
  deleteOldFileFromUrl,
}, fs, getEvent(), prisma, updateEvent() (+11 more)

### Community 13 - "Stage Gallery and Daily Shuffle"
Cohesion: 0.16
Nodes (16): listEvents(), listImages(), { audit }, { dailySeed, dailyShuffle }, { deleteImageIfUnused }, {
  fileToStorageReference,
  withResolvedImageUrl,
  withResolvedImageUrlList,
}, { isValidStageSlug }, listImagesByStageSlug() (+8 more)

### Community 14 - "Client Build Tooling"
Cohesion: 0.12
Nodes (17): autoprefixer, devDependencies, autoprefixer, jsdom, postcss, tailwindcss, @types/react-dom, vite (+9 more)

### Community 15 - "Client Runtime Dependencies"
Cohesion: 0.12
Nodes (17): axios, dependencies, axios, dompurify, lucide-react, react, react-dom, react-router (+9 more)

### Community 16 - "Initial Schema Migrations"
Cohesion: 0.15
Nodes (14): "events", "gallery_images", "hero_section", "posts", "stage_gallery_images", "stage_posts", "stages", "users" (+6 more)

### Community 17 - "Image Processing Pipeline"
Cohesion: 0.16
Nodes (15): ALLOWED_BEFORE_WEBP, bufferToWebpDisk(), crypto, detectMimeFromBuffer(), fs, {
  isStorageConfigured,
  uploadBuffer,
  buildStorageKey,
}, MAX_EDGE, MAX_PIXELS (+7 more)

### Community 18 - "Supabase Storage Adapter"
Cohesion: 0.23
Nodes (15): persistWebp(), buildStorageKey(), deleteStorageObject(), encodeObjectKey(), extractStorageKey(), getS3Client(), isStorageConfigured(), KIND_FOLDER (+7 more)

### Community 19 - "Request Validation and Gallery Routes"
Cohesion: 0.18
Nodes (12): formatZodErrors(), validateBody(), validateQuery(), { authRequired, requireRole }, { galleryImageSchema }, {
  listImages,
  createImage,
  updateImage,
  deleteImage,
}, { processUploadedImages, tagUploadKind }, router (+4 more)

### Community 20 - "Gallery Controller and Audit Log"
Cohesion: 0.22
Nodes (11): { audit }, createImage(), deleteImage(), { deleteImageIfUnused }, {
  fileToStorageReference,
  withResolvedImageUrl,
  withResolvedImageUrlList,
}, prisma, updateImage(), deleteImage() (+3 more)

### Community 21 - "Prisma Client and Image Refs"
Cohesion: 0.18
Nodes (9): databaseUrl, { PrismaClient }, prismaOptions, countImageRefs(), { deleteOldFileFromUrl }, fs, normalizeRef(), prisma (+1 more)

### Community 22 - "Post Routes"
Cohesion: 0.17
Nodes (11): getPost(), { attachUserOptional }, { authRequired, requireRole }, {
  listPosts,
  getPost,
  createPost,
  updatePost,
  deletePost,
}, { MAX_POST_IMAGES }, { postBodySchema, postBodyUpdateSchema }, { processUploadedImages, tagUploadKind }, router (+3 more)

### Community 23 - "Event Routes and Upload Limiter"
Cohesion: 0.18
Nodes (10): rateLimit, uploadLimiter, { authRequired, requireRole }, { eventBodySchema, eventBodyUpdateSchema }, {
  listEvents,
  getEvent,
  createEvent,
  updateEvent,
  deleteEvent,
}, { processUploadedImages, tagUploadKind }, router, { upload } (+2 more)

### Community 24 - "Public Stage Routes"
Cohesion: 0.20
Nodes (10): listPosts(), getStageBySlug(), listImagesBySlug(), listStagePostsBySlug(), listStagePostsByStageSlug(), { listImagesBySlug }, { listStagePostsBySlug }, {
  listStages,
  getStageBySlug,
} (+2 more)

### Community 25 - "Zod Content Schemas"
Cohesion: 0.18
Nodes (10): eventBodySchema, eventBodyUpdateSchema, postBodySchema, postBodyUpdateSchema, publishedField, publishedFieldOptional, stageGalleryImageSchema, stagePostBodySchema (+2 more)

### Community 26 - "Image Repair Script"
Cohesion: 0.24
Nodes (10): APPLY, basename(), bucket, isLocalOrAbsolute(), listAllKeys(), main(), path, prisma (+2 more)

### Community 27 - "Admin Date Time Field"
Cohesion: 0.44
Nodes (8): AdminDateTimeField(), formatDisplay(), MONTHS, pad(), parseValue(), sameDay(), toLocalValue(), WEEKDAYS

### Community 28 - "Stage Gallery Routes"
Cohesion: 0.22
Nodes (8): { authRequired, requireRole, requireStageScope }, {
  listMixedImages,
  listImagesByStageSlug,
  createImage,
  updateImage,
  deleteImage,
}, { processUploadedImages, tagUploadKind }, router, { stageGalleryImageSchema }, { upload }, { uploadLimiter }, { validateBody }

### Community 29 - "Client Package Scripts"
Cohesion: 0.29
Nodes (7): scripts, build, dev, lint, preview, test, test:watch

### Community 30 - "Visit Us and Map Config"
Cohesion: 0.38
Nodes (3): VisitUsSection(), BATTALION_MAP_EMBED_URL, BATTALION_MAP_OPEN_URL

### Community 31 - "Contact WhatsApp Section"
Cohesion: 0.40
Nodes (4): buildWhatsAppUrl(), ContactSection(), LEADERS, LeaderWhatsAppButton()

### Community 32 - "Stage Contact WhatsApp"
Cohesion: 0.47
Nodes (4): buildWhatsAppMessage(), buildWhatsAppUrl(), STAGE_COORDINATORS, StageContactSection()

### Community 33 - "Multer Upload Config"
Cohesion: 0.33
Nodes (5): fs, maxSizeMb, multer, path, upload

### Community 34 - "Client Package Identity"
Cohesion: 0.40
Nodes (4): name, private, type, version

### Community 35 - "Storage and Deployment Rationale"
Cohesion: 0.50
Nodes (4): Image Upload Pipeline, Deployment Targets, PostgreSQL Database Setup, Supabase Storage Option

## Knowledge Gaps
- **323 isolated node(s):** `name`, `private`, `version`, `type`, `dev` (+318 more)
  These have ≤1 connection - possible missing edges or undocumented components. (Counts symbols only; 354 node(s) total have ≤1 connection when file, concept and rationale nodes are included.)
- **6 thin communities (<3 nodes) omitted from report** — run `graphify query` to explore isolated nodes.

## Suggested Questions
_Questions this graph is uniquely positioned to answer:_

- **Why does `audit()` connect `Gallery Controller and Audit Log` to `Auth Sessions and Cookies`, `Post Content Controllers`, `Events and File URLs`, `Stage Gallery and Daily Shuffle`?**
  _High betweenness centrality (0.015) - this node is a cross-community bridge._
- **Why does `dependencies` connect `Server Runtime Dependencies` to `Server Package Manifest`?**
  _High betweenness centrality (0.005) - this node is a cross-community bridge._
- **Why does `fileToStorageReference()` connect `Post Content Controllers` to `Stage Gallery and Daily Shuffle`, `Events and File URLs`, `Gallery Controller and Audit Log`?**
  _High betweenness centrality (0.004) - this node is a cross-community bridge._
- **Are the 5 inferred relationships involving `fileToStorageReference()` (e.g. with `createPost()` and `updatePost()`) actually correct?**
  _`fileToStorageReference()` has 5 INFERRED edges - model-reasoned connections that need verification._
- **What connects `name`, `private`, `version` to the rest of the system?**
  _323 weakly-connected nodes found - possible documentation gaps or missing edges._
- **Should `React Pages and Components` be split into smaller, more focused modules?**
  _Cohesion score 0.050768514205868656 - nodes in this community are weakly interconnected._
- **Should `Auth Sessions and Cookies` be split into smaller, more focused modules?**
  _Cohesion score 0.0518326545723806 - nodes in this community are weakly interconnected._