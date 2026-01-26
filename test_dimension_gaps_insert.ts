import { prisma } from "./server/db";

async function testInsert() {
  try {
    console.log("Testing dimension gap analysis insert...");

    const result = await prisma.dimensionGapAnalysis.upsert({
      where: {
        organizationId_dimension: {
          organizationId: "00000000-0000-0000-0000-000000000001",
          dimension: "Coverage Maturity",
        },
      },
      update: {
        currentLevel: 3,
        targetLevel: 5,
        currentScore: 60,
        gapPercentage: 20,
        status: "at-risk",
        lastUpdated: new Date(),
      },
      create: {
        organizationId: "00000000-0000-0000-0000-000000000001",
        dimension: "Coverage Maturity",
        currentLevel: 3,
        targetLevel: 5,
        currentScore: 60,
        gapPercentage: 20,
        status: "at-risk",
      },
    });

    console.log("Insert successful:", result);
  } catch (error) {
    console.error("Insert failed:", error);
    if (error instanceof Error) {
      console.error("Error message:", error.message);
      console.error("Stack:", error.stack);
    }
  } finally {
    await prisma.$disconnect();
  }
}

testInsert();
