-- CreateEnum
CREATE TYPE "Rol" AS ENUM ('ADMIN', 'EDITOR', 'COORDINATOR');

-- CreateTable
CREATE TABLE "usuarios" (
    "id" SERIAL NOT NULL,
    "email" TEXT NOT NULL,
    "password" TEXT NOT NULL,
    "name" TEXT,
    "role" "Rol" NOT NULL DEFAULT 'ADMIN',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "tokenVersion" INTEGER NOT NULL DEFAULT 0,
    "totpEnabled" BOOLEAN NOT NULL DEFAULT false,
    "totpSecret" TEXT,
    "stageSlug" TEXT,

    CONSTRAINT "usuarios_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "sesiones_refresco" (
    "id" TEXT NOT NULL,
    "userId" INTEGER NOT NULL,
    "tokenHash" TEXT NOT NULL,
    "jti" TEXT NOT NULL,
    "expiresAt" TIMESTAMP(3) NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "revokedAt" TIMESTAMP(3),
    "ip" TEXT,
    "userAgent" TEXT,

    CONSTRAINT "sesiones_refresco_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "jti_acceso_revocado" (
    "jti" TEXT NOT NULL,
    "expiresAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "jti_acceso_revocado_pkey" PRIMARY KEY ("jti")
);

-- CreateTable
CREATE TABLE "publicaciones" (
    "id" SERIAL NOT NULL,
    "title" TEXT NOT NULL,
    "content" TEXT NOT NULL,
    "imageUrl" TEXT,
    "published" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "publicaciones_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "publicaciones_etapa" (
    "id" SERIAL NOT NULL,
    "title" TEXT NOT NULL,
    "content" TEXT NOT NULL,
    "imageUrl" TEXT,
    "published" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "stageSlug" TEXT NOT NULL,

    CONSTRAINT "publicaciones_etapa_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "imagenes_galeria" (
    "id" SERIAL NOT NULL,
    "imageUrl" TEXT NOT NULL,
    "caption" TEXT,
    "order" INTEGER NOT NULL DEFAULT 0,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "imagenes_galeria_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "imagenes_galeria_etapa" (
    "id" SERIAL NOT NULL,
    "imageUrl" TEXT NOT NULL,
    "caption" TEXT,
    "order" INTEGER NOT NULL DEFAULT 0,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "stageSlug" TEXT NOT NULL,

    CONSTRAINT "imagenes_galeria_etapa_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "eventos" (
    "id" SERIAL NOT NULL,
    "title" TEXT NOT NULL,
    "description" TEXT NOT NULL,
    "imageUrl" TEXT,
    "location" TEXT,
    "date" TIMESTAMP(3) NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "eventos_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "desafios_acceso_admin" (
    "id" TEXT NOT NULL,
    "tokenHash" TEXT NOT NULL,
    "expiresAt" TIMESTAMP(3) NOT NULL,
    "usedAt" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "desafios_acceso_admin_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "codigos_totp_usados" (
    "id" TEXT NOT NULL,
    "userId" INTEGER NOT NULL,
    "codeHash" TEXT NOT NULL,
    "usedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "expiresAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "codigos_totp_usados_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "codigos_respaldo_totp" (
    "id" TEXT NOT NULL,
    "userId" INTEGER NOT NULL,
    "codeHash" TEXT NOT NULL,
    "usedAt" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "codigos_respaldo_totp_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "usuarios_email_key" ON "usuarios"("email");

-- CreateIndex
CREATE INDEX "usuarios_stageSlug_idx" ON "usuarios"("stageSlug");

-- CreateIndex
CREATE UNIQUE INDEX "sesiones_refresco_jti_key" ON "sesiones_refresco"("jti");

-- CreateIndex
CREATE INDEX "sesiones_refresco_userId_idx" ON "sesiones_refresco"("userId");

-- CreateIndex
CREATE INDEX "sesiones_refresco_expiresAt_idx" ON "sesiones_refresco"("expiresAt");

-- CreateIndex
CREATE INDEX "jti_acceso_revocado_expiresAt_idx" ON "jti_acceso_revocado"("expiresAt");

-- CreateIndex
CREATE INDEX "publicaciones_createdAt_idx" ON "publicaciones"("createdAt");

-- CreateIndex
CREATE INDEX "publicaciones_etapa_stageSlug_createdAt_idx" ON "publicaciones_etapa"("stageSlug", "createdAt");

-- CreateIndex
CREATE INDEX "imagenes_galeria_order_idx" ON "imagenes_galeria"("order");

-- CreateIndex
CREATE INDEX "imagenes_galeria_etapa_stageSlug_order_idx" ON "imagenes_galeria_etapa"("stageSlug", "order");

-- CreateIndex
CREATE INDEX "eventos_date_idx" ON "eventos"("date");

-- CreateIndex
CREATE UNIQUE INDEX "desafios_acceso_admin_tokenHash_key" ON "desafios_acceso_admin"("tokenHash");

-- CreateIndex
CREATE INDEX "desafios_acceso_admin_expiresAt_idx" ON "desafios_acceso_admin"("expiresAt");

-- CreateIndex
CREATE INDEX "codigos_totp_usados_expiresAt_idx" ON "codigos_totp_usados"("expiresAt");

-- CreateIndex
CREATE INDEX "codigos_totp_usados_userId_codeHash_idx" ON "codigos_totp_usados"("userId", "codeHash");

-- CreateIndex
CREATE UNIQUE INDEX "codigos_respaldo_totp_codeHash_key" ON "codigos_respaldo_totp"("codeHash");

-- CreateIndex
CREATE INDEX "codigos_respaldo_totp_userId_idx" ON "codigos_respaldo_totp"("userId");

-- AddForeignKey
ALTER TABLE "sesiones_refresco" ADD CONSTRAINT "sesiones_refresco_userId_fkey" FOREIGN KEY ("userId") REFERENCES "usuarios"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "codigos_totp_usados" ADD CONSTRAINT "codigos_totp_usados_userId_fkey" FOREIGN KEY ("userId") REFERENCES "usuarios"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "codigos_respaldo_totp" ADD CONSTRAINT "codigos_respaldo_totp_userId_fkey" FOREIGN KEY ("userId") REFERENCES "usuarios"("id") ON DELETE CASCADE ON UPDATE CASCADE;
