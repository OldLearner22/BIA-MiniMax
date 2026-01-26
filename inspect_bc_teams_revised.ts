import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

async function inspectTeamTable() {
  try {
    const columns = await prisma.$queryRaw`
      SELECT column_name, data_type 
      FROM information_schema.columns 
      WHERE table_name = 'bc_team_structure'
    `;
    console.log(
      "Columns in bc_team_structure:",
      JSON.stringify(columns, null, 2),
    );
  } catch (error) {
    console.error("Error inspecting table:", error);
  } finally {
    await prisma.$disconnect();
  }
}

inspectTeamTable();
