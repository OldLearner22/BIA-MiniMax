/*
  Warnings:

  - Added the required column `strategyType` to the `RecoveryOption` table without a default value. This is not possible if the table is not empty.

*/
-- CreateEnum
CREATE TYPE "RecoveryStrategyType" AS ENUM ('prevention', 'response', 'recovery');

-- AlterTable
ALTER TABLE "RecoveryOption" ADD COLUMN     "recoveryCapacity" INTEGER NOT NULL DEFAULT 100,
ADD COLUMN     "strategyType" "RecoveryStrategyType" NOT NULL;
