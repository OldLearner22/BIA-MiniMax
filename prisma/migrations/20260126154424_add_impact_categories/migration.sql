-- CreateTable
CREATE TABLE "ImpactCategory" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "description" TEXT NOT NULL,
    "weight" INTEGER NOT NULL,
    "color" TEXT NOT NULL,
    "displayOrder" INTEGER NOT NULL DEFAULT 0,
    "organizationId" TEXT NOT NULL DEFAULT '00000000-0000-0000-0000-000000000001',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "ImpactCategory_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "ImpactCategoryDefinition" (
    "id" TEXT NOT NULL,
    "categoryId" TEXT NOT NULL,
    "timelinePointId" TEXT NOT NULL,
    "description" TEXT NOT NULL,
    "organizationId" TEXT NOT NULL DEFAULT '00000000-0000-0000-0000-000000000001',

    CONSTRAINT "ImpactCategoryDefinition_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "ImpactCategory_organizationId_displayOrder_idx" ON "ImpactCategory"("organizationId", "displayOrder");

-- CreateIndex
CREATE UNIQUE INDEX "ImpactCategory_organizationId_name_key" ON "ImpactCategory"("organizationId", "name");

-- CreateIndex
CREATE UNIQUE INDEX "ImpactCategoryDefinition_categoryId_timelinePointId_key" ON "ImpactCategoryDefinition"("categoryId", "timelinePointId");

-- AddForeignKey
ALTER TABLE "ImpactCategoryDefinition" ADD CONSTRAINT "ImpactCategoryDefinition_categoryId_fkey" FOREIGN KEY ("categoryId") REFERENCES "ImpactCategory"("id") ON DELETE CASCADE ON UPDATE CASCADE;
