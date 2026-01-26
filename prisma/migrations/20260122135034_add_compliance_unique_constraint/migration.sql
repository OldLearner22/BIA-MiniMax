/*
  Warnings:

  - A unique constraint covering the columns `[frameworkId,clause]` on the table `ComplianceRequirement` will be added. If there are existing duplicate values, this will fail.

*/
-- CreateIndex
CREATE UNIQUE INDEX "ComplianceRequirement_frameworkId_clause_key" ON "ComplianceRequirement"("frameworkId", "clause");
