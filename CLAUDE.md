# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project

Institutional site for Batallón 11 General José María Paz (Exploradores Argentinos de Don Bosco). A pnpm workspace with two packages: `client/` (React + Vite public site and admin panel) and `server/` (Express + Prisma API), plus `shared/` (stage data used by both). Content is in Spanish; Prisma models use Spanish column names (`@map`) with English field names.

## Commands

Run from the repo root unless noted.

```bash
pnpm install                 # install everything (workspace)
pnpm dev                     # server + client together
pnpm dev:server              # API only (nodemon, port 4000)
pnpm dev:client              # Vite only (port 5173)
pnpm build                   # production build of client
pnpm start                   # run server in production mode

pnpm prisma:migrate          # dev migration (server/prisma)
pnpm prisma:deploy           # deploy migrations (prod)
pnpm prisma:generate
pnpm prisma:seed
pnpm prisma:studio
```

Tests and lint are per-package (run with `--filter` from root, or `cd` into the package):

```bash
pnpm --filter batallon11-server test          # vitest run (server)
pnpm --filter batallon11-client test          # vitest run (client, jsdom)
pnpm --filter batallon11-client lint          # eslint, zero warnings allowed

# single test file
pnpm --filter batallon11-server exec vitest run middleware/csrf.test.js
pnpm --filter batallon11-client exec vitest run src/lib/safeText.test.js
```

Both packages use Vitest; test files live next to the code they test (`*.test.js`), not in a separate `__tests__` tree.

Env files: `server/.env` and `client/.env` (see README for required keys — DB, JWT, admin gate, maps, Turnstile). `server/config/validateEnv.js` fails fast at boot if required vars are missing.

## Architecture

### Auth is capability/token-gated, not a login form

There is no public `/login` page with a password field. Admin access starts from a one-time **gate token** URL (`/p/:token`, `server/utils/adminGate.js`, `DesafioAccesoAdmin` model) that exchanges for a session. Sessions are short-lived JWT **access tokens** in an httpOnly cookie plus a rotating **refresh token** persisted in `SesionRefresco` (hash only, never raw), with revocation via `JtiAccesoRevocado`. TOTP (`otplib`) with backup codes (`CodigoRespaldoTotp`) is supported per user. When touching auth, read `server/controllers/authController.js`, `server/middleware/auth.js`, `server/utils/tokens.js`, and `server/config/cookies.js` together — the pieces are split deliberately (token minting, cookie config, revocation check, CSRF) and changes usually need to stay consistent across all of them.

CSRF: all mutating `/api` routes require a CSRF token (`server/middleware/csrf.js`) except the auth bootstrap endpoints (`login`, `refresh`, `prepare`, `gate` — see the regex in `server.js`).

### Roles and stage scoping

Three roles (`ADMIN`, `EDITOR`, `COORDINATOR`) on `Usuario.role`. `COORDINATOR` accounts are pinned to one stage via `Usuario.stageSlug`; `requireStageScope` (`server/middleware/auth.js`) auto-fills or validates `stageSlug` on requests so a coordinator can only ever touch their own stage's content. On the client, `RoleRoute` gates admin pages by role and `CoordinatorIndexRedirect` sends coordinators straight to their stage's content instead of the general dashboard.

### Stages are static config, not a DB table

The 6 "etapas" (Horneros y Pichones, Caminantes y Chispistas, Pioneros y Fuegos, Rastreadores, Baqueanos, Soles) are fixed and defined in `shared/stagesData.json`, read by both sides:
- Server: `shared/stages.js` (`listStages`, `getStageBySlug`, `isValidStageSlug`) — also re-exported via `server/lib/stages.js`.
- Client: `client/src/lib/stages.js` + `client/src/lib/stageAssets.js` for per-stage images/colors.

Content that belongs to a stage (posts, gallery images) references the stage by `stageSlug` string, not a foreign key — there's no `Etapa` table. Adding/renaming a stage means editing `stagesData.json`, not running a migration.

### Content model: general vs. per-stage, twice

Posts and galleries each exist in two parallel flavors — general (`Publicacion`/`ImagenGaleria`, no stage) and per-stage (same shape + `stageSlug`, `ImagenGaleriaEtapa`). This is mirrored end-to-end: separate controllers (`postController.js` vs `stagePostController.js`, `galleryController.js` vs `stageGalleryController.js`), separate routes (`/api/posts` vs `/api/stage-posts`, `/api/gallery` vs `/api/stage-gallery`), and separate admin pages/routes on the client (`PostsAdmin` vs `StagePostsAdmin`, `GalleryAdmin` vs `StageGalleryAdmin`). When fixing a bug or adding a feature in one, check whether the sibling needs the same change.

### Images

Uploads go through `server/middleware/upload.js` (multer) → `server/middleware/processImage.js` (sharp: resize/optimize, strips metadata) → stored either on local disk (`server/uploads/`, served statically with a path-traversal guard in `server.js`) or Supabase Storage (`server/utils/supabaseStorage.js`), depending on config. `ImagenPublicacion` keeps both the original and optimized path plus dimensions; `server/utils/imageRefs.js` and `server/scripts/repairImages.js` exist for reconciling orphaned/broken references.

### Security posture

This app is deliberately hardened (see `.github/workflows/security.yml` and the `security-review` skill) — helmet with a strict CSP, CORS allowlist (LAN IPs allowed only in dev, via `server/utils/lanUrls.js`), rate limiting + slow-down on `/api`, audit logging (`server/utils/auditLog.js`), encryption at rest for TOTP secrets (`server/utils/cryptoAtRest.js`), and a daily cleanup job for expired sessions/tokens (`server/jobs/cleanupExpiredRecords.js`). Preserve these properties when modifying auth, uploads, or CORS/CSP config — don't loosen them to "make something work" without flagging it.

### Client structure

React Router v6, two top-level layouts: `PublicLayout` (site) and `AdminLayout` (behind `ProtectedRoute`). `AuthContext` holds the session; `services/api.js` is the axios client (cookie-based, so no manual token attachment). `PageBackgroundContext` drives per-route background theming. Public pages fetch general content on `/`, `/publicaciones`, `/galeria`, and per-stage content on `/etapas/:slug*`.
