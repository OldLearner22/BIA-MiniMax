/*
  Warnings:

  - Added the required column `updatedAt` to the `Dependency` table without a default value. This is not possible if the table is not empty.
  - Added the required column `updatedAt` to the `ProcessResourceLink` table without a default value. This is not possible if the table is not empty.
  - Added the required column `updatedAt` to the `ResourceDependency` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "Dependency" ADD COLUMN     "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
ADD COLUMN     "isActive" BOOLEAN NOT NULL DEFAULT true,
ADD COLUMN     "updatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
ADD COLUMN     "version" INTEGER NOT NULL DEFAULT 1;

-- AlterTable
ALTER TABLE "ProcessResourceLink" ADD COLUMN     "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
ADD COLUMN     "isActive" BOOLEAN NOT NULL DEFAULT true,
ADD COLUMN     "updatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
ADD COLUMN     "version" INTEGER NOT NULL DEFAULT 1;

-- AlterTable
ALTER TABLE "ResourceDependency" ADD COLUMN     "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
ADD COLUMN     "isActive" BOOLEAN NOT NULL DEFAULT true,
ADD COLUMN     "updatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
ADD COLUMN     "version" INTEGER NOT NULL DEFAULT 1;

-- CreateIndex
CREATE INDEX "Dependency_sourceProcessId_targetProcessId_isActive_idx" ON "Dependency"("sourceProcessId", "targetProcessId", "isActive");

-- CreateIndex
CREATE INDEX "ProcessResourceLink_processId_resourceId_isActive_idx" ON "ProcessResourceLink"("processId", "resourceId", "isActive");

-- CreateIndex
CREATE INDEX "ResourceDependency_sourceResourceId_targetResourceId_isActi_idx" ON "ResourceDependency"("sourceResourceId", "targetResourceId", "isActive");
