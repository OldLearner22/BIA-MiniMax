import { prisma } from "../db";
import {
  IncidentCategory,
  IncidentSeverity,
  IncidentStatus,
  ImpactArea,
} from "../src/types/incident";

async function seedIncidents() {
  console.log("Seeding incidents...");

  const incidents = await prisma.incident.createMany({
    data: [
      {
        id: "INC-001",
        incidentNumber: "INC-2026-001",
        title: "Database Server Outage",
        description:
          "Primary database server experienced a hardware failure resulting in complete service unavailability",
        category: IncidentCategory.TECHNICAL_FAILURE,
        severity: IncidentSeverity.CRITICAL,
        status: IncidentStatus.RESOLVED,
        impactAreas: [ImpactArea.OPERATIONAL, ImpactArea.FINANCIAL],
        businessImpact: "Payment processing halted for 2 hours",
        estimatedFinancialImpact: 50000,
        affectedProcessIds: ["PROC-001", "PROC-002"],
        affectedLocations: ["Primary Data Center"],
        affectedSystems: ["Payment System", "Reporting Database"],
        detectionTime: new Date("2026-01-15T09:00:00Z"),
        reportTime: new Date("2026-01-15T09:05:00Z"),
        responseStartTime: new Date("2026-01-15T09:10:00Z"),
        resolutionTime: new Date("2026-01-15T11:00:00Z"),
        initialResponseActions:
          "Activated backup server, initiated manual transaction reconciliation",
        escalationDetails: "Escalated to VP of Operations",
        rootCause: "Disk array controller failure",
        correctiveActions: "Replaced failed hardware components",
        reportedBy: "System Monitor Alert",
        assignedTo: "Database Administrator",
        organizationId: "ORG-001",
      },
      {
        id: "INC-002",
        incidentNumber: "INC-2026-002",
        title: "Cyber Attack - Ransomware Detection",
        description:
          "Ransomware detected on network segment containing document repository",
        category: IncidentCategory.MALICIOUS_ACTIVITY,
        severity: IncidentSeverity.HIGH,
        status: IncidentStatus.RESPONDING,
        impactAreas: [
          ImpactArea.OPERATIONAL,
          ImpactArea.LEGAL,
          ImpactArea.REPUTATIONAL,
        ],
        businessImpact: "Document access restricted to prevent spread",
        estimatedFinancialImpact: 100000,
        affectedProcessIds: ["PROC-005", "PROC-006"],
        affectedLocations: ["Corporate Office"],
        affectedSystems: ["Document Management System", "Shared File Storage"],
        detectionTime: new Date("2026-01-20T14:30:00Z"),
        reportTime: new Date("2026-01-20T14:35:00Z"),
        responseStartTime: new Date("2026-01-20T14:40:00Z"),
        initialResponseActions:
          "Isolated affected network segment, engaged cybersecurity team and law enforcement",
        escalationDetails: "CEO and Board notified",
        reportedBy: "Antivirus Alert",
        assignedTo: "IT Security Manager",
        organizationId: "ORG-001",
      },
      {
        id: "INC-003",
        incidentNumber: "INC-2026-003",
        title: "Natural Disaster - Flooding",
        description:
          "Unexpected flooding affected secondary data center facility",
        category: IncidentCategory.NATURAL_DISASTER,
        severity: IncidentSeverity.HIGH,
        status: IncidentStatus.ESCALATED,
        impactAreas: [ImpactArea.OPERATIONAL, ImpactArea.FINANCIAL],
        businessImpact:
          "Secondary site unavailable, increased load on primary datacenter",
        estimatedFinancialImpact: 200000,
        affectedProcessIds: ["PROC-003", "PROC-004"],
        affectedLocations: ["Secondary Data Center"],
        affectedSystems: ["Backup Systems", "Disaster Recovery Site"],
        detectionTime: new Date("2026-01-18T02:00:00Z"),
        reportTime: new Date("2026-01-18T02:15:00Z"),
        responseStartTime: new Date("2026-01-18T02:30:00Z"),
        initialResponseActions:
          "Activated disaster recovery procedures, transferred workloads to primary site",
        escalationDetails: "Executive crisis team activated",
        rootCause: "Heavy rainfall exceeded drainage capacity",
        reportedBy: "Facility Manager",
        assignedTo: "Disaster Recovery Coordinator",
        organizationId: "ORG-001",
      },
    ],
    skipDuplicates: true,
  });

  console.log(`✓ Seeded ${incidents.count} incidents`);
}

export default seedIncidents;
