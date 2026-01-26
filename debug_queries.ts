import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

async function debugQuery() {
  const organizationId = "00000000-0000-0000-0000-000000000001";
  try {
    console.log("Testing bc_team_structure...");
    const teams =
      await prisma.$queryRaw`SELECT * FROM bc_team_structure WHERE organization_id = ${organizationId}::uuid`;
    console.log("Teams count:", (teams as any[]).length);

    console.log("Testing bc_people...");
    const people =
      await prisma.$queryRaw`SELECT * FROM bc_people WHERE organization_id = ${organizationId}::uuid`;
    console.log("People count:", (people as any[]).length);

    console.log("Testing bc_roles...");
    const roles =
      await prisma.$queryRaw`SELECT * FROM bc_roles WHERE organization_id = ${organizationId}::uuid`;
    console.log("Roles count:", (roles as any[]).length);

    console.log("Testing bc_role_assignments with JOIN...");
    const assignments = await prisma.$queryRaw`
      SELECT ra.* FROM bc_role_assignments ra
      JOIN bc_team_structure ts ON ra.team_structure_id = ts.id
      WHERE ts.organization_id = ${organizationId}::uuid
    `;
    console.log("Assignments count:", (assignments as any[]).length);
  } catch (error) {
    console.error("Query failed:", error);
  } finally {
    await prisma.$disconnect();
  }
}

debugQuery();
