-- Renombrar entidades de la base de datos al español

ALTER TYPE "Role" RENAME TO "Rol";

ALTER TABLE "users" RENAME TO "usuarios";
ALTER TABLE "refresh_sessions" RENAME TO "sesiones_refresco";
ALTER TABLE "revoked_access_jti" RENAME TO "jti_acceso_revocado";
ALTER TABLE "posts" RENAME TO "publicaciones";
ALTER TABLE "stage_posts" RENAME TO "publicaciones_etapa";
ALTER TABLE "gallery_images" RENAME TO "imagenes_galeria";
ALTER TABLE "stage_gallery_images" RENAME TO "imagenes_galeria_etapa";
ALTER TABLE "events" RENAME TO "eventos";
ALTER TABLE "admin_gate_challenges" RENAME TO "desafios_acceso_admin";
ALTER TABLE "totp_used_codes" RENAME TO "codigos_totp_usados";
ALTER TABLE "totp_backup_codes" RENAME TO "codigos_respaldo_totp";
