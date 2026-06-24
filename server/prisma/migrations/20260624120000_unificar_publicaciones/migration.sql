BEGIN;

ALTER TABLE "publicaciones"
  ADD COLUMN IF NOT EXISTS "etapaSlug" TEXT;

INSERT INTO "publicaciones" (
  "title",
  "content",
  "imageUrl",
  "published",
  "createdAt",
  "updatedAt",
  "etapaSlug"
)
SELECT
  "title",
  "content",
  "imageUrl",
  "published",
  "createdAt",
  "updatedAt",
  "stageSlug"
FROM "publicaciones_etapa";

CREATE TABLE "imagenes_publicacion" (
  "id" TEXT NOT NULL,
  "publicacionId" INTEGER NOT NULL,
  "rutaOriginal" TEXT,
  "rutaOptimizada" TEXT NOT NULL,
  "nombreOriginal" TEXT,
  "tipoMimeOriginal" TEXT,
  "tamanoOriginal" INTEGER,
  "tamanoOptimizado" INTEGER,
  "ancho" INTEGER,
  "alto" INTEGER,
  "leyenda" TEXT,
  "orden" INTEGER NOT NULL DEFAULT 0,
  "creadaEn" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

  CONSTRAINT "imagenes_publicacion_pkey" PRIMARY KEY ("id"),
  CONSTRAINT "imagenes_publicacion_publicacionId_fkey"
    FOREIGN KEY ("publicacionId") REFERENCES "publicaciones"("id")
    ON DELETE CASCADE ON UPDATE CASCADE
);

INSERT INTO "imagenes_publicacion" (
  "id",
  "publicacionId",
  "rutaOriginal",
  "rutaOptimizada",
  "orden"
)
SELECT
  md5(random()::text || clock_timestamp()::text || "id"::text),
  "id",
  "imageUrl",
  "imageUrl",
  0
FROM "publicaciones"
WHERE "imageUrl" IS NOT NULL;

DROP INDEX IF EXISTS "publicaciones_createdAt_idx";
DROP INDEX IF EXISTS "publicaciones_etapa_stageSlug_createdAt_idx";

ALTER TABLE "publicaciones" DROP COLUMN "imageUrl";
ALTER TABLE "publicaciones" RENAME COLUMN "title" TO "titulo";
ALTER TABLE "publicaciones" RENAME COLUMN "content" TO "contenido";
ALTER TABLE "publicaciones" RENAME COLUMN "published" TO "publicada";
ALTER TABLE "publicaciones" RENAME COLUMN "createdAt" TO "creadaEn";
ALTER TABLE "publicaciones" RENAME COLUMN "updatedAt" TO "actualizadaEn";

CREATE INDEX "publicaciones_etapaSlug_creadaEn_idx"
  ON "publicaciones"("etapaSlug", "creadaEn");
CREATE INDEX "imagenes_publicacion_publicacionId_orden_idx"
  ON "imagenes_publicacion"("publicacionId", "orden");

DROP TABLE "publicaciones_etapa";

COMMIT;