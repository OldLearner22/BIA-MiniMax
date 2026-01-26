import express from "express";


const router = express.Router();
import { prisma } from "../db";

// GET /api/bc-team-structure - Fetch all teams, people, roles, and assignments
// Test endpoint
router.get("/test", async (req, res) => {
  res.json({ message: "Test endpoint working - code updated at " + new Date().toISOString() });
});

router.get("/", async (req, res) => {
  try {
    const organizationId = "00000000-0000-0000-0000-000000000001";

    // Fetch all teams
    const teams = await prisma.bCTeamStructure.findMany({
      where: { organization_id: organizationId },
      orderBy: [{ level: "asc" }, { display_order: "asc" }],
    });

    // Fetch all active people
    const people = await prisma.bCPerson.findMany({
      where: {
        organization_id: organizationId,
        employment_status: "active",
      },
      orderBy: [{ last_name: "asc" }, { first_name: "asc" }],
    });

    // Fetch all roles
    const roles = await prisma.bCRole.findMany({
      where: { organization_id: organizationId },
      orderBy: { name: "asc" },
    });

    // Fetch all role assignments
    const assignments = await prisma.bCRoleAssignment.findMany({
      where: { is_active: true },
    });

    res.json({
      teams,
      people,
      roles,
      assignments,
    });
  } catch (error: any) {
    console.error("Error fetching BC team structure:", error.message, error.code);
    res.status(500).json({ error: "Failed to fetch team structure data", details: error.message });
  }
});

// POST /api/bc-team-structure/teams - Create a new team
router.post("/teams", async (req, res) => {
  try {
    const { name, description, structure_type, position_x, position_y } =
      req.body;
    const organizationId = "00000000-0000-0000-0000-000000000001";

    const team = await prisma.bCTeamStructure.create({
      data: {
        name,
        description,
        structure_type,
        level: 2,
        display_order: 0,
        is_active: true,
        position_x,
        position_y,
        organization_id: organizationId,
      },
    });

    res.status(201).json(team);
  } catch (error) {
    console.error("Error creating team:", error);
    res.status(500).json({ error: "Failed to create team" });
  }
});

// PUT /api/bc-team-structure - Update team positions and assignments
router.put("/", async (req, res) => {
  try {
    const { teamPositions, assignments } = req.body;
    const organizationId = "00000000-0000-0000-0000-000000000001";

    // Update team positions
    for (const [teamId, position] of Object.entries(teamPositions) as [
      string,
      any,
    ][]) {
      await prisma.bCTeamStructure.update({
        where: { id: teamId },
        data: {
          position_x: (position as any).x,
          position_y: (position as any).y,
        },
      });
    }

    // Delete existing assignments for this organization's teams
    await prisma.bCRoleAssignment.deleteMany({
      where: {
        team_structure: {
          organization_id: organizationId,
        },
      },
    });

    // Create new assignments
    for (const [key, assignment] of Object.entries(assignments) as [
      string,
      any,
    ][]) {
      await prisma.bCRoleAssignment.create({
        data: {
          team_structure_id: assignment.teamId,
          person_id: assignment.personId,
          role_id: assignment.roleId || "00000000-0000-0000-0000-000000000000", // Default role if not provided
          assignment_type: assignment.roleType || "primary",
          is_active: true,
        },
      });
    }

    res.json({ success: true });
  } catch (error) {
    console.error("Error updating team structure:", error);
    res.status(500).json({ error: "Failed to update team structure" });
  }
});

// DELETE /api/bc-team-structure/teams/:teamId - Delete a team
router.delete("/teams/:teamId", async (req, res) => {
  try {
    const { teamId } = req.params;

    await prisma.bCTeamStructure.update({
      where: { id: teamId },
      data: { is_active: false },
    });

    res.json({ success: true });
  } catch (error) {
    console.error("Error deleting team:", error);
    res.status(500).json({ error: "Failed to delete team" });
  }
});

export default router;
