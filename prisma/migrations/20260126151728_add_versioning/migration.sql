-- AlterTable
ALTER TABLE "Dependency" ALTER COLUMN "updatedAt" DROP DEFAULT;

-- AlterTable
ALTER TABLE "ProcessResourceLink" ALTER COLUMN "updatedAt" DROP DEFAULT;

-- AlterTable
ALTER TABLE "ResourceDependency" ALTER COLUMN "updatedAt" DROP DEFAULT;
