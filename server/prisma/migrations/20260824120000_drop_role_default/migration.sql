-- Elimina el valor por defecto ADMIN de usuarios.role.
-- Motivo: cualquier inserción futura que omitiera "role" quedaba
-- silenciosamente promovida a ADMIN. Todo el código actual (seed.js) ya
-- especifica el rol explícitamente, así que esto no cambia comportamiento
-- existente, solo evita que un olvido futuro escale privilegios por defecto.
ALTER TABLE "usuarios" ALTER COLUMN "role" DROP DEFAULT;
