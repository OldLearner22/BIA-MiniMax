// backend/src/services/incident.service.ts
import { 
  Incident, 
  IncidentCategory, 
  IncidentSearchCriteria, 
  IncidentSeverity, 
  IncidentStatus,
  IncidentStatistics,
  IncidentUpdate 
} from '../../shared/types/incident.types';
import { incidentRepository } from '../repositories/incident.repository';
import { notificationService } from './notification.service';
import { biaService } from './bia.service';

class IncidentService {
  async createIncident(data: Partial<Incident>, userId: string): Promise<Incident> {
    // Generate incident number (ISO 22301 requirement for unique identification)
    const incidentNumber = `INC-${Date.now()}-${Math.random().toString(36).substr(2, 9).toUpperCase()}`;
    
    const incident: Partial<Incident> = {
      ...data,
      incidentNumber,
      status: IncidentStatus.REPORTED,
      detectionTime: data.detectionTime || new Date(),
      reportTime: new Date(),
      createdAt: new Date(),
      updatedAt: new Date(),
      createdBy: userId,
      updatedBy: userId,
      version: 1,
      isActive: true
    };
    
    const createdIncident = await incidentRepository.create(incident as Incident);
    
    // Notify relevant stakeholders (ISO 22301 Clause 8.2.2)
    await this.notifyStakeholders(createdIncident);
    
    // Link to BIA if applicable (ISO 22301 Clause 8.2.1)
    if (data.affectedProcesses && data.affectedProcesses.length > 0) {
      await biaService.linkIncidentToBIA(createdIncident.id, data.affectedProcesses);
    }
    
    return createdIncident;
  }

  async getIncidents(criteria: IncidentSearchCriteria): Promise<{ incidents: Incident[], total: number }> {
    return await incidentRepository.findByCriteria(criteria);
  }

  async getIncidentById(id: string): Promise<Incident | null> {
    return await incidentRepository.findById(id);
  }

  async updateIncident(id: string, updateData: Partial<Incident>, userId: string): Promise<Incident> {
    const existingIncident = await incidentRepository.findById(id);
    if (!existingIncident) {
      throw new Error('Incident not found');
    }
    
    // Handle status transitions
    if (updateData.status && updateData.status !== existingIncident.status) {
      this.validateStatusTransition(existingIncident.status, updateData.status);
      
      // Set timestamps based on status changes
      if (updateData.status === IncidentStatus.RESPONDING && !existingIncident.responseStartTime) {
        updateData.responseStartTime = new Date();
      } else if (updateData.status === IncidentStatus.RESOLVED && !existingIncident.resolutionTime) {
        updateData.resolutionTime = new Date();
      } else if (updateData.status === IncidentStatus.CLOSED && !existingIncident.closureTime) {
        updateData.closureTime = new Date();
      }
    }
    
    const updatedIncident = await incidentRepository.update(id, {
      ...updateData,
      updatedAt: new Date(),
      updatedBy: userId,
      version: existingIncident.version + 1
    });
    
    // If severity increased, escalate
    if (updateData.severity && this.isSeverityIncreased(existingIncident.severity, updateData.severity)) {
      await this.escalateIncident(updatedIncident, userId);
    }
    
    return updatedIncident;
  }

  async addIncidentUpdate(incidentId: string, updateData: Partial<IncidentUpdate>, userId: string): Promise<IncidentUpdate> {
    const incidentUpdate: IncidentUpdate = {
      id: `update-${Date.now()}`,
      incidentId,
      updateType: updateData.updateType || 'INFORMATION_UPDATE',
      description: updateData.description || '',
      previousStatus: updateData.previousStatus,
      newStatus: updateData.newStatus,
      actionsTaken: updateData.actionsTaken || [],
      createdBy: userId,
      createdAt: new Date()
    };
    
    return await incidentRepository.addIncidentUpdate(incidentUpdate);
  }

  async getIncidentStatistics(): Promise<IncidentStatistics> {
    const stats = await incidentRepository.getStatistics();
    
    // Calculate MTTR (Mean Time to Resolution)
    const resolvedIncidents = await incidentRepository.findResolvedIncidents();
    let totalResolutionTime = 0;
    let resolvedCount = 0;
    
    resolvedIncidents.forEach(incident => {
      if (incident.detectionTime && incident.resolutionTime) {
        const detectionTime = new Date(incident.detectionTime);
        const resolutionTime = new Date(incident.resolutionTime);
        totalResolutionTime += (resolutionTime.getTime() - detectionTime.getTime()) / (1000 * 60 * 60); // Convert to hours
        resolvedCount++;
      }
    });
    
    const mttr = resolvedCount > 0 ? totalResolutionTime / resolvedCount : 0;
    
    return {
      ...stats,
      mttr: parseFloat(mttr.toFixed(2))
    };
  }

  async exportIncidents(criteria: IncidentSearchCriteria, format: string): Promise<string> {
    const { incidents } = await this.getIncidents(criteria);
    
    if (format === 'csv') {
      return this.convertToCSV(incidents);
    }
    
    return JSON.stringify(incidents, null, 2);
  }

  private async notifyStakeholders(incident: Incident): Promise<void> {
    const recipients = await this.getNotificationRecipients(incident);
    
    for (const recipient of recipients) {
      await notificationService.sendIncidentNotification({
        recipient,
        incident,
        template: 'INCIDENT_CREATED'
      });
    }
  }

  private async getNotificationRecipients(incident: Incident): Promise<string[]> {
    // This would typically fetch from configuration or based on incident severity/category
    const baseRecipients = ['bcp.team@company.com', 'management@company.com'];
    
    if (incident.severity === IncidentSeverity.CRITICAL || incident.severity === IncidentSeverity.HIGH) {
      baseRecipients.push('crisis.team@company.com', 'executive.team@company.com');
    }
    
    return baseRecipients;
  }

  private validateStatusTransition(from: IncidentStatus, to: IncidentStatus): void {
    const validTransitions: Record<IncidentStatus, IncidentStatus[]> = {
      [IncidentStatus.REPORTED]: [IncidentStatus.ASSESSED, IncidentStatus.CANCELLED],
      [IncidentStatus.ASSESSED]: [IncidentStatus.RESPONDING, IncidentStatus.ESCALATED, IncidentStatus.CANCELLED],
      [IncidentStatus.RESPONDING]: [IncidentStatus.RESOLVED, IncidentStatus.ESCALATED],
      [IncidentStatus.ESCALATED]: [IncidentStatus.RESPONDING, IncidentStatus.RESOLVED],
      [IncidentStatus.RESOLVED]: [IncidentStatus.CLOSED],
      [IncidentStatus.CLOSED]: [],
      [IncidentStatus.CANCELLED]: []
    };
    
    if (!validTransitions[from].includes(to)) {
      throw new Error(`Invalid status transition from ${from} to ${to}`);
    }
  }

  private isSeverityIncreased(current: IncidentSeverity, newSeverity: IncidentSeverity): boolean {
    const severityOrder = [
      IncidentSeverity.LOW,
      IncidentSeverity.MEDIUM,
      IncidentSeverity.HIGH,
      IncidentSeverity.CRITICAL
    ];
    
    return severityOrder.indexOf(newSeverity) > severityOrder.indexOf(current);
  }

  private async escalateIncident(incident: Incident, userId: string): Promise<void> {
    await this.updateIncident(incident.id, {
      status: IncidentStatus.ESCALATED,
      escalationDetails: `Incident escalated due to increased severity to ${incident.severity}`
    }, userId);
  }

  private convertToCSV(incidents: Incident[]): string {
    const headers = [
      'Incident Number',
      'Title',
      'Category',
      'Severity',
      'Status',
      'Detection Time',
      'Resolution Time',
      'Business Impact',
      'Affected Processes'
    ];
    
    const rows = incidents.map(incident => [
      incident.incidentNumber,
      incident.title,
      incident.category,
      incident.severity,
      incident.status,
      incident.detectionTime.toISOString(),
      incident.resolutionTime?.toISOString() || '',
      incident.businessImpact,
      incident.affectedProcesses.join('; ')
    ]);
    
    return [headers, ...rows].map(row => row.join(',')).join('\n');
  }
}

export const incidentService = new IncidentService();