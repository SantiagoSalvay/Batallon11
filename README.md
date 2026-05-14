# Batallón 11 — General José María Paz

Sitio institucional del **Batallón 11 General José María Paz**, perteneciente a los **Exploradores Argentinos de Don Bosco**.

> Landing moderna, página por etapa, galerías, eventos y panel administrativo con autenticación JWT.

---

## Stack

### Frontend (`/client`)

- React + Vite
- TailwindCSS
- React Router DOM
- Axios
- Framer Motion

### Backend (`/server`)

- Node.js + Express.js
- Prisma ORM
- PostgreSQL
- JWT + bcrypt
- multer (uploads)

---

## Arquitectura

```
React Frontend
      ↓
Express API
      ↓
Prisma ORM
      ↓
PostgreSQL
```

---

## Estructura del repositorio

```
Batallon11/
├── client/                 # Frontend React + Vite
│   ├── src/
│   ├── index.html
│   └── ...
│
├── server/                 # Backend Express + Prisma
│   ├── prisma/
│   │   ├── schema.prisma
│   │   └── seed.js
│   ├── controllers/
│   ├── middleware/
│   ├── routes/
│   ├── config/
│   ├── utils/
│   ├── uploads/
│   └── server.js
│
├── package.json            # Scripts globales (concurrently)
└── README.md
```

---

## Requisitos

- Node.js 18+
- PostgreSQL 14+
- pnpm 9+ (`npm i -g pnpm` o `corepack enable`)

> El repo usa **pnpm workspaces**: una sola instalación maneja `client` y `server`.

---

## Setup inicial

### 1. Instalar dependencias (monorepo)

```bash
pnpm install
```

### 2. Variables de entorno

Copiar el ejemplo y completar:

```bash
cp server/.env.example server/.env
cp client/.env.example client/.env
```

Editar `server/.env` y completar:

- `DATABASE_URL` con tu conexión PostgreSQL (recomendado: **Supabase**, ver abajo)
- `DIRECT_URL` (solo si usás un pooler como Supabase/Neon)
- `JWT_SECRET` con una clave fuerte
- `ADMIN_EMAIL` y `ADMIN_PASSWORD` para el seed

#### Conexión con Supabase

1. En tu proyecto Supabase ir a **Project Settings → Database**.
2. En **Connection string** elegir **URI** y copiar dos versiones:
   - **Transaction pooler** (puerto `6543`) → va en `DATABASE_URL` y se le agrega `?pgbouncer=true&connection_limit=1`.
   - **Session pooler / Direct** (puerto `5432`) → va en `DIRECT_URL`.
3. Reemplazar `[YOUR-PASSWORD]`, `[PROJECT-REF]` y `[REGION]` por los valores reales.
4. Si no sabés la contraseña de la DB, en Supabase: **Database → Reset database password**.

Ejemplo final en `server/.env`:

```env
DATABASE_URL="postgresql://postgres.abcd1234:MiPassword@aws-0-sa-east-1.pooler.supabase.com:6543/postgres?pgbouncer=true&connection_limit=1"
DIRECT_URL="postgresql://postgres.abcd1234:MiPassword@aws-0-sa-east-1.pooler.supabase.com:5432/postgres"
```

> Prisma usa `DATABASE_URL` para queries (pooler) y `DIRECT_URL` para migraciones — esto ya está configurado en `schema.prisma`.

### 3. Base de datos (Prisma)

```bash
pnpm prisma:migrate     # crea el esquema
pnpm prisma:generate    # genera el cliente
pnpm prisma:seed        # crea admin + 4 etapas iniciales
```

### 4. Desarrollo

```bash
pnpm dev
```

> Equivalentes útiles:
>
> - `pnpm dev:server` / `pnpm dev:client`
> - `pnpm --filter batallon11-server <script>` para ejecutar algo solo en el backend
> - `pnpm --filter batallon11-client <script>` para el frontend

- Backend: http://localhost:4000
- Frontend: http://localhost:5173

---

## Etapas del batallón

| Etapa                       | Slug                       |
| --------------------------- | -------------------------- |
| Horneros y Pichones         | `horneros-pichones`        |
| Caminantes y Chispistas     | `caminantes-chispistas`    |
| Pioneros y Fuegos           | `pioneros-fuegos`          |
| Rastreadores y Baquianos    | `rastreadores-baquianos`   |

Cada etapa tiene su hero propio, logo, galería y publicaciones exclusivas.

---

## Endpoints principales

### Público

- `GET  /api/hero`
- `GET  /api/video`
- `GET  /api/stages`
- `GET  /api/stages/:slug`
- `GET  /api/posts`
- `GET  /api/stages/:slug/posts`
- `GET  /api/gallery`
- `GET  /api/stages/:slug/gallery`
- `GET  /api/events`

### Auth

- `POST /api/auth/login`
- `GET  /api/auth/me`

### Admin (requiere JWT)

- `PUT    /api/hero`
- `PUT    /api/video`
- `POST   /api/stages`, `PUT /api/stages/:id`, `DELETE /api/stages/:id`
- CRUD análogo para `posts`, `stage-posts`, `gallery`, `stage-gallery`, `events`

---

## Deploy

- **DB**: Railway / Supabase / Neon
- **Server**: Railway / Render
- **Client**: Vercel / Netlify

Configurar `VITE_API_URL` en el cliente y `DATABASE_URL` + `JWT_SECRET` + `CLIENT_URL` en el servidor.

---

## Licencia

MIT — ver [LICENSE](./LICENSE).
