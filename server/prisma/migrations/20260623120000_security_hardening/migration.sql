-- AdminGateChallenge
CREATE TABLE "admin_gate_challenges" (
  "id"         TEXT NOT NULL,
  "tokenHash"  TEXT NOT NULL,
  "expiresAt"  TIMESTAMP(3) NOT NULL,
  "usedAt"     TIMESTAMP(3),
  "createdAt"  TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT "admin_gate_challenges_pkey" PRIMARY KEY ("id")
);
CREATE UNIQUE INDEX "admin_gate_challenges_tokenHash_key"
  ON "admin_gate_challenges"("tokenHash");
CREATE INDEX "admin_gate_challenges_expiresAt_idx"
  ON "admin_gate_challenges"("expiresAt");

-- TotpUsedCode
CREATE TABLE "totp_used_codes" (
  "id"        TEXT NOT NULL,
  "userId"    INTEGER NOT NULL,
  "codeHash"  TEXT NOT NULL,
  "usedAt"    TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "expiresAt" TIMESTAMP(3) NOT NULL,
  CONSTRAINT "totp_used_codes_pkey" PRIMARY KEY ("id")
);
CREATE INDEX "totp_used_codes_userId_codeHash_idx"
  ON "totp_used_codes"("userId", "codeHash");
CREATE INDEX "totp_used_codes_expiresAt_idx"
  ON "totp_used_codes"("expiresAt");
ALTER TABLE "totp_used_codes"
  ADD CONSTRAINT "totp_used_codes_userId_fkey"
  FOREIGN KEY ("userId") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- TotpBackupCode
CREATE TABLE "totp_backup_codes" (
  "id"        TEXT NOT NULL,
  "userId"    INTEGER NOT NULL,
  "codeHash"  TEXT NOT NULL,
  "usedAt"    TIMESTAMP(3),
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT "totp_backup_codes_pkey" PRIMARY KEY ("id")
);
CREATE UNIQUE INDEX "totp_backup_codes_codeHash_key"
  ON "totp_backup_codes"("codeHash");
CREATE INDEX "totp_backup_codes_userId_idx"
  ON "totp_backup_codes"("userId");
ALTER TABLE "totp_backup_codes"
  ADD CONSTRAINT "totp_backup_codes_userId_fkey"
  FOREIGN KEY ("userId") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;
