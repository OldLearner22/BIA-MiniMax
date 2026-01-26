import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

async function checkImpactValues() {
  try {
    const customerSupport = await prisma.process.findFirst({
      where: { name: "Customer Support" },
      include: { impactAssessment: true },
    });

    if (customerSupport) {
      console.log("\n=== Customer Support Process ===");
      console.log("Process ID:", customerSupport.id);
      console.log("\nImpact Assessment Values:");
      if (customerSupport.impactAssessment) {
        console.log("Financial:", customerSupport.impactAssessment.financial);
        console.log(
          "Operational:",
          customerSupport.impactAssessment.operational,
        );
        console.log(
          "Reputational:",
          customerSupport.impactAssessment.reputational,
        );
        console.log("Legal:", customerSupport.impactAssessment.legal);
        console.log("Health:", customerSupport.impactAssessment.health);
        console.log(
          "Environmental:",
          customerSupport.impactAssessment.environmental,
        );
      } else {
        console.log("No impact assessment found");
      }
    }

    // Check all impact assessments
    console.log("\n=== All Impact Assessments ===");
    const allImpacts = await prisma.impactAssessment.findMany({
      include: { process: { select: { name: true } } },
    });

    allImpacts.forEach((impact) => {
      console.log(`\n${impact.process.name}:`);
      console.log(
        `  Financial: ${impact.financial}, Operational: ${impact.operational}, Reputational: ${impact.reputational}`,
      );
      console.log(
        `  Legal: ${impact.legal}, Health: ${impact.health}, Environmental: ${impact.environmental}`,
      );
    });
  } catch (error) {
    console.error("Error:", error);
  } finally {
    await prisma.$disconnect();
  }
}

checkImpactValues();
