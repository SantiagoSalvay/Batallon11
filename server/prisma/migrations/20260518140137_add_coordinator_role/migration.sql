-- AlterEnum
ALTER TYPE "Role" ADD VALUE 'COORDINATOR';

-- AlterTable
ALTER TABLE "users" ADD COLUMN     "stageId" INTEGER;

-- CreateIndex
CREATE INDEX "users_stageId_idx" ON "users"("stageId");

-- AddForeignKey
ALTER TABLE "users" ADD CONSTRAINT "users_stageId_fkey" FOREIGN KEY ("stageId") REFERENCES "stages"("id") ON DELETE SET NULL ON UPDATE CASCADE;
