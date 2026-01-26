// backend/src/controllers/incident.controller.ts
import { Request, Response } from 'express';
import {
  Incident,
  IncidentSearchCriteria,
  IncidentStatus,
  IncidentUpdate
} from '../../shared/types/incident.types';
import { incidentService } from '../services/incident.service';
import { validationService } from '../services/validation.service';
import { auditLogger } from '../utils/auditLogger';

class IncidentController {
  // Create new incident (ISO 22301 Clause 8.2)
  async createIncident(req: Request, res: Response): Promise<void> {
    try {
      const incidentData = req.body;
      const userId = req.user.id; // From authentication middleware
      
      // ISO 22301 requires validation of incident data
      const validation = validationService.validateIncident(incidentData);
      if (!validation.isValid) {
        res.status(400).json({ error: 'Validation failed', details: validation.errors });
        return;
      }
      
      const incident = await incidentService.createIncident(incidentData, userId);
      
      // Audit log for compliance (ISO 22301 Clause 9.1)
      auditLogger.log({
        action: 'INCIDENT_CREATED',
        userId,
        incidentId: incident.id,
        timestamp: new Date(),
        details: { category: incident.category, severity: incident.severity }
      });
      
      res.status(201).json({
        success: true,
        data: incident,
        message: 'Incident recorded successfully'
      });
    } catch (error) {
      res.status(500).json({ error: 'Failed to create incident', details: error.message });
    }
  }

  // Get incidents with filtering (ISO 22301 Clause 9.1)
  async getIncidents(req: Request, res: Response): Promise<void> {
    try {
      const criteria: IncidentSearchCriteria = {
        status: req.query.status ? (Array.isArray(req.query.status) ? req.query.status : [req.query.status]) as IncidentStatus[] : undefined,
        severity: req.query.severity ? (Array.isArray(req.query.severity) ? req.query.severity : [req.query.severity]) as IncidentSeverity[] : undefined,
        dateFrom: req.query.dateFrom ? new Date(req.query.dateFrom as string) : undefined,
        dateTo: req.query.dateTo ? new Date(req.query.dateTo as string) : undefined,
        page: req.query.page ? parseInt(req.query.page as string) : 1,
        limit: req.query.limit ? parseInt(req.query.limit as string) : 50
      };

      const { incidents, total } = await incidentService.getIncidents(criteria);
      
      res.json({
        success: true,
        data: incidents,
        pagination: {
          page: criteria.page,
          limit: criteria.limit,
          total,
          pages: Math.ceil(total / (criteria.limit || 50))
        }
      });
    } catch (error) {
      res.status(500).json({ error: 'Failed to fetch incidents', details: error.message });
    }
  }

  // Get incident by ID
  async getIncidentById(req: Request, res: Response): Promise<void> {
    try {
      const { id } = req.params;
      const incident = await incidentService.getIncidentById(id);
      
      if (!incident) {
        res.status(404).json({ error: 'Incident not found' });
        return;
      }
      
      res.json({ success: true, data: incident });
    } catch (error) {
      res.status(500).json({ error: 'Failed to fetch incident', details: error.message });
    }
  }

  // Update incident (ISO 22301 Clause 8.2.2)
  async updateIncident(req: Request, res: Response): Promise<void> {
    try {
      const { id } = req.params;
      const updateData = req.body;
      const userId = req.user.id;
      
      // Check if incident exists
      const existingIncident = await incidentService.getIncidentById(id);
      if (!existingIncident) {
        res.status(404).json({ error: 'Incident not found' });
        return;
      }
      
      // Validate update data
      const validation = validationService.validateIncidentUpdate(updateData, existingIncident);
      if (!validation.isValid) {
        res.status(400).json({ error: 'Validation failed', details: validation.errors });
        return;
      }
      
      const updatedIncident = await incidentService.updateIncident(id, updateData, userId);
      
      // Log the update for audit trail
      auditLogger.log({
        action: 'INCIDENT_UPDATED',
        userId,
        incidentId: id,
        timestamp: new Date(),
        details: { changes: Object.keys(updateData) }
      });
      
      res.json({
        success: true,
        data: updatedIncident,
        message: 'Incident updated successfully'
      });
    } catch (error) {
      res.status(500).json({ error: 'Failed to update incident', details: error.message });
    }
  }

  // Add update to incident (ISO 22301 Clause 8.2.2)
  async addIncidentUpdate(req: Request, res: Response): Promise<void> {
    try {
      const { id } = req.params;
      const updateData: IncidentUpdate = req.body;
      const userId = req.user.id;
      
      const incidentUpdate = await incidentService.addIncidentUpdate(id, updateData, userId);
      
      res.status(201).json({
        success: true,
        data: incidentUpdate,
        message: 'Incident update recorded'
      });
    } catch (error) {
      res.status(500).json({ error: 'Failed to add incident update', details: error.message });
    }
  }

  // Get incident statistics (ISO 22301 Clause 9.1)
  async getIncidentStatistics(req: Request, res: Response): Promise<void> {
    try {
      const statistics = await incidentService.getIncidentStatistics();
      res.json({ success: true, data: statistics });
    } catch (error) {
      res.status(500).json({ error: 'Failed to get statistics', details: error.message });
    }
  }

  // Export incidents (ISO 22301 Clause 9.1 - Monitoring & Measurement)
  async exportIncidents(req: Request, res: Response): Promise<void> {
    try {
      const criteria: IncidentSearchCriteria = req.query;
      const format = req.query.format || 'csv';
      
      const exportData = await incidentService.exportIncidents(criteria, format as string);
      
      res.setHeader('Content-Type', 'text/csv');
      res.setHeader('Content-Disposition', `attachment; filename=incidents-${Date.now()}.csv`);
      res.send(exportData);
    } catch (error) {
      res.status(500).json({ error: 'Failed to export incidents', details: error.message });
    }
  }
}

export const incidentController = new IncidentController();