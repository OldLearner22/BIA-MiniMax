import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

async function cleanupDuplicates() {
  try {
    console.log("\n=== Cleaning up duplicate dependencies ===");

    // Find duplicates in Dependency table
    const dependencies = await prisma.dependency.findMany({
      where: { isActive: true },
      orderBy: { createdAt: "asc" },
    });

    const depMap = new Map<string, any>();
    const duplicateDeps: string[] = [];

    dependencies.forEach((dep) => {
      const key = `${dep.sourceProcessId}-${dep.targetProcessId}`;
      if (depMap.has(key)) {
        // This is a duplicate, mark the older one for deactivation
        duplicateDeps.push(depMap.get(key).id);
      }
      depMap.set(key, dep);
    });

    if (duplicateDeps.length > 0) {
      console.log(
        `Found ${duplicateDeps.length} duplicate process dependencies`,
      );
      await prisma.dependency.updateMany({
        where: { id: { in: duplicateDeps } },
        data: { isActive: false },
      });
      console.log(`Deactivated ${duplicateDeps.length} duplicate entries`);
    } else {
      console.log("No duplicate process dependencies found");
    }

    // Find duplicates in ProcessResourceLink table
    const links = await prisma.processResourceLink.findMany({
      where: { isActive: true },
      orderBy: { createdAt: "asc" },
    });

    const linkMap = new Map<string, any>();
    const duplicateLinks: string[] = [];

    links.forEach((link) => {
      const key = `${link.processId}-${link.resourceId}`;
      if (linkMap.has(key)) {
        duplicateLinks.push(linkMap.get(key).id);
      }
      linkMap.set(key, link);
    });

    if (duplicateLinks.length > 0) {
      console.log(
        `Found ${duplicateLinks.length} duplicate process-resource links`,
      );
      await prisma.processResourceLink.updateMany({
        where: { id: { in: duplicateLinks } },
        data: { isActive: false },
      });
      console.log(`Deactivated ${duplicateLinks.length} duplicate entries`);
    } else {
      console.log("No duplicate process-resource links found");
    }

    // Find duplicates in ResourceDependency table
    const resourceDeps = await prisma.resourceDependency.findMany({
      where: { isActive: true },
      orderBy: { createdAt: "asc" },
    });

    const resourceDepMap = new Map<string, any>();
    const duplicateResourceDeps: string[] = [];

    resourceDeps.forEach((dep) => {
      const key = `${dep.sourceResourceId}-${dep.targetResourceId}`;
      if (resourceDepMap.has(key)) {
        duplicateResourceDeps.push(resourceDepMap.get(key).id);
      }
      resourceDepMap.set(key, dep);
    });

    if (duplicateResourceDeps.length > 0) {
      console.log(
        `Found ${duplicateResourceDeps.length} duplicate resource dependencies`,
      );
      await prisma.resourceDependency.updateMany({
        where: { id: { in: duplicateResourceDeps } },
        data: { isActive: false },
      });
      console.log(
        `Deactivated ${duplicateResourceDeps.length} duplicate entries`,
      );
    } else {
      console.log("No duplicate resource dependencies found");
    }

    console.log("\n=== Cleanup complete ===");
  } catch (error) {
    console.error("Error:", error);
  } finally {
    await prisma.$disconnect();
  }
}

cleanupDuplicates();
