import express from "express";
import { incidentService } from "../services/incident.service";

const router = express.Router();

/**
 * GET /api/incidents
 * Get all incidents with filtering and pagination
 */
router.get("/", async (req, res) => {
  try {
    const result = await incidentService.getIncidents(req.query);
    res.json(result);
  } catch (error: any) {
    console.error("Error fetching incidents:", error);
    res
      .status(500)
      .json({ error: "Failed to fetch incidents", details: error.message });
  }
});

/**
 * GET /api/incidents/statistics
 * Get incident statistics
 */
router.get("/statistics", async (req, res) => {
  try {
    const stats = await incidentService.getStatistics();
    res.json(stats);
  } catch (error: any) {
    console.error("Error fetching statistics:", error);
    res
      .status(500)
      .json({ error: "Failed to fetch statistics", details: error.message });
  }
});

/**
 * GET /api/incidents/:id
 * Get a single incident by ID
 */
router.get("/:id", async (req, res) => {
  try {
    const incident = await incidentService.getIncidentById(req.params.id);
    if (!incident) {
      return res.status(404).json({ error: "Incident not found" });
    }
    res.json(incident);
  } catch (error: any) {
    console.error("Error fetching incident:", error);
    res
      .status(500)
      .json({ error: "Failed to fetch incident", details: error.message });
  }
});

/**
 * POST /api/incidents
 * Create a new incident
 */
router.post("/", async (req, res) => {
  try {
    const incident = await incidentService.createIncident(req.body);
    res.status(201).json(incident);
  } catch (error: any) {
    console.error("Error creating incident:", error);
    res
      .status(500)
      .json({ error: "Failed to create incident", details: error.message });
  }
});

/**
 * PUT /api/incidents/:id
 * Update an existing incident
 */
router.put("/:id", async (req, res) => {
  try {
    const incident = await incidentService.updateIncident(
      req.params.id,
      req.body,
    );
    res.json(incident);
  } catch (error: any) {
    console.error("Error updating incident:", error);
    if (error.message === "Incident not found") {
      return res.status(404).json({ error: "Incident not found" });
    }
    res
      .status(500)
      .json({ error: "Failed to update incident", details: error.message });
  }
});

/**
 * POST /api/incidents/:id/updates
 * Add an update/log entry to an incident
 */
router.post("/:id/updates", async (req, res) => {
  try {
    const update = await incidentService.addIncidentUpdate(
      req.params.id,
      req.body,
    );
    res.status(201).json(update);
  } catch (error: any) {
    console.error("Error adding incident update:", error);
    if (error.message === "Incident not found") {
      return res.status(404).json({ error: "Incident not found" });
    }
    res
      .status(500)
      .json({ error: "Failed to add update", details: error.message });
  }
});

/**
 * DELETE /api/incidents/:id
 * Delete (cancel) an incident
 */
router.delete("/:id", async (req, res) => {
  try {
    const incident = await incidentService.deleteIncident(req.params.id);
    res.json(incident);
  } catch (error: any) {
    console.error("Error deleting incident:", error);
    res
      .status(500)
      .json({ error: "Failed to delete incident", details: error.message });
  }
});

export default router;
