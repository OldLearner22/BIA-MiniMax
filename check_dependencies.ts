import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

async function checkDependencies() {
  try {
    console.log("\n=== Process-to-Process Dependencies ===");
    const dependencies = await prisma.dependency.findMany({
      include: {
        sourceProcess: { select: { name: true } },
        targetProcess: { select: { name: true } },
      },
    });
    console.log(
      `Found ${dependencies.length} process-to-process dependencies:`,
    );
    dependencies.forEach((dep) => {
      console.log(
        `  ${dep.sourceProcess.name} → ${dep.targetProcess.name} (Type: ${dep.type}, Criticality: ${dep.criticality})`,
      );
    });

    console.log("\n=== Process-to-Resource Links ===");
    const processResourceLinks = await prisma.processResourceLink.findMany({
      include: {
        process: { select: { name: true } },
        resource: { select: { name: true, type: true } },
      },
    });
    console.log(`Found ${processResourceLinks.length} process-resource links:`);
    processResourceLinks.forEach((link) => {
      console.log(
        `  ${link.process.name} → ${link.resource.name} (${link.resource.type}) - Criticality: ${link.criticality}`,
      );
    });

    console.log("\n=== Resource-to-Resource Dependencies ===");
    const resourceDependencies = await prisma.resourceDependency.findMany({
      include: {
        sourceResource: { select: { name: true, type: true } },
        targetResource: { select: { name: true, type: true } },
      },
    });
    console.log(
      `Found ${resourceDependencies.length} resource-resource dependencies:`,
    );
    resourceDependencies.forEach((dep) => {
      console.log(
        `  ${dep.sourceResource.name} (${dep.sourceResource.type}) → ${dep.targetResource.name} (${dep.targetResource.type}) - Type: ${dep.type}`,
      );
    });

    // Also check for specific process (Customer Support)
    console.log("\n=== Dependencies for Customer Support Process ===");
    const customerSupportProcess = await prisma.process.findFirst({
      where: { name: "Customer Support" },
    });

    if (customerSupportProcess) {
      console.log(`Process ID: ${customerSupportProcess.id}`);

      const csProcessDeps = await prisma.dependency.findMany({
        where: { sourceProcessId: customerSupportProcess.id },
        include: { targetProcess: { select: { name: true } } },
      });
      console.log(`Process dependencies (as source): ${csProcessDeps.length}`);
      csProcessDeps.forEach((dep) => {
        console.log(`  → ${dep.targetProcess.name}`);
      });

      const csResourceLinks = await prisma.processResourceLink.findMany({
        where: { processId: customerSupportProcess.id },
        include: { resource: { select: { name: true, type: true } } },
      });
      console.log(`Resource links: ${csResourceLinks.length}`);
      csResourceLinks.forEach((link) => {
        console.log(`  → ${link.resource.name} (${link.resource.type})`);
      });
    }
  } catch (error) {
    console.error("Error:", error);
  } finally {
    await prisma.$disconnect();
  }
}

checkDependencies();

checkDependencies();
