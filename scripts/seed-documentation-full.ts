import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

async function main() {
  console.log("🌱 Starting full documentation module seeding...\n");

  // Clear existing data
  console.log("🧹 Clearing existing documentation data...");
  await prisma.documentShare.deleteMany();
  await prisma.documentCollaboration.deleteMany();
  await prisma.approvalAction.deleteMany();
  await prisma.approvalStep.deleteMany();
  await prisma.documentApprovalWorkflow.deleteMany();
  await prisma.documentChange.deleteMany();
  await prisma.documentVersion.deleteMany();
  await prisma.document.deleteMany();
  await prisma.documentTemplate.deleteMany();
  await prisma.documentCategory.deleteMany();

  console.log("✅ Cleared existing data\n");

  // Create categories
  console.log("📁 Creating document categories...");
  const categories = await Promise.all([
    prisma.documentCategory.create({
      data: {
        name: "Policies & Governance",
        description: "BCMS policies and governance documents",
        color: "#3b82f6",
      },
    }),
    prisma.documentCategory.create({
      data: {
        name: "Incident Management",
        description: "Incident response procedures and playbooks",
        color: "#ef4444",
      },
    }),
    prisma.documentCategory.create({
      data: {
        name: "Operational Procedures",
        description: "Day-to-day BCMS operational procedures",
        color: "#10b981",
      },
    }),
    prisma.documentCategory.create({
      data: {
        name: "Testing & Exercises",
        description: "BCMS testing and exercise documentation",
        color: "#f59e0b",
      },
    }),
    prisma.documentCategory.create({
      data: {
        name: "Risk Management",
        description: "Risk assessment and treatment documentation",
        color: "#8b5cf6",
      },
    }),
    prisma.documentCategory.create({
      data: {
        name: "Communication",
        description: "Communication plans and contact directories",
        color: "#ec4899",
      },
    }),
    prisma.documentCategory.create({
      data: {
        name: "Compliance & Audit",
        description: "Regulatory compliance and audit documents",
        color: "#14b8a6",
      },
    }),
  ]);

  console.log(`✅ Created ${categories.length} categories\n`);

  // Create system templates
  console.log("📋 Creating system templates...");

  const systemTemplates = [
    {
      name: "BCMS Policy Template",
      description: "Template for Business Continuity Management System policy",
      type: "POLICY" as const,
      categoryId: categories[0].id,
      content: `# Business Continuity Management System Policy

## Document Information
- **Policy Owner**: {{policyOwner}}
- **Effective Date**: {{effectiveDate}}
- **Review Date**: {{reviewDate}}
- **Version**: 1.0

## 1. Purpose
This policy establishes the organization's commitment to maintaining business continuity and ensuring resilience against disruptions.

## 2. Scope
This policy applies to all organizational units, employees, contractors, and third-party service providers.

## 3. Policy Statement
{{organizationName}} is committed to:
- Identifying critical business processes and resources
- Assessing potential risks and impacts
- Developing and maintaining effective continuity plans
- Conducting regular testing and exercises
- Continuously improving BCMS capabilities

## 4. Responsibilities
- **Senior Management**: Overall BCMS governance and resource allocation
- **BC Manager**: BCMS implementation and maintenance
- **Department Heads**: Process-specific continuity planning
- **All Employees**: Awareness and participation in BCMS activities

## 5. Key Requirements
- Maximum Tolerable Period of Disruption (MTPD): {{mtpd}} days
- Recovery Time Objective (RTO): {{rto}} hours
- Recovery Point Objective (RPO): {{rpo}} hours

## 6. Compliance
This policy is maintained in accordance with ISO 22301:2019 requirements.

---
**Approved By**: {{approver}}
**Approval Date**: {{approvalDate}}`,
      isSystem: true,
      placeholders: [
        { key: "policyOwner", label: "Policy Owner", type: "text" },
        { key: "organizationName", label: "Organization Name", type: "text" },
        { key: "effectiveDate", label: "Effective Date", type: "date" },
        { key: "reviewDate", label: "Review Date", type: "date" },
        { key: "mtpd", label: "MTPD (days)", type: "number" },
        { key: "rto", label: "RTO (hours)", type: "number" },
        { key: "rpo", label: "RPO (hours)", type: "number" },
        { key: "approver", label: "Approver Name", type: "text" },
        { key: "approvalDate", label: "Approval Date", type: "date" },
      ],
    },
    {
      name: "Incident Response Playbook Template",
      description:
        "Template for creating incident-specific response procedures",
      type: "PLAYBOOK" as const,
      categoryId: categories[1].id,
      content: `# {{incidentType}} Incident Response Playbook

## Incident Classification
- **Incident Type**: {{incidentType}}
- **Severity Level**: {{severityLevel}}
- **Likelihood**: {{likelihood}}
- **Estimated Impact**: {{estimatedImpact}}

## 1. Initial Response
### Detection & Reporting
1. **Who can detect**: {{detectionRoles}}
2. **How to report**: {{reportingMechanism}}
3. **Escalation timeframe**: {{escalationTimeframe}}

### Immediate Actions
1. Assess incident scope and impact
2. Notify incident response team: {{teamContacts}}
3. Activate response plan if threshold exceeded: {{activationThreshold}}

## 2. Response Procedures
### Phase 1: Triage ({{triageTime}} minutes)
- {{triageActions}}

### Phase 2: Containment ({{containmentTime}} hours)
- {{containmentActions}}

### Phase 3: Eradication ({{eradicationTime}} hours)
- {{eradicationActions}}

### Phase 4: Recovery ({{recoveryTime}} hours)
- {{recoveryActions}}

## 3. Communication Plan
### Internal Stakeholders
- {{stakeholders}}

### External Parties (if required)
- Regulatory: {{regulatoryContacts}}
- Customers: {{customerContacts}}
- Media: {{mediaContacts}}

### Communication Frequency
- Status updates every: {{updateFrequency}}

## 4. Recovery Objectives
- **RTO**: {{rto}} hours
- **RPO**: {{rpo}} hours
- **Minimum Business Continuity Objective (MBCO)**: {{mbco}}

## 5. Post-Incident Activities
### Documentation
- Incident timeline
- Actions taken
- Root cause analysis
- Lessons learned

### Review & Improvement
- Conduct post-incident review within: {{reviewTimeline}} days
- Update playbook based on findings
- Conduct follow-up exercises if needed

## 6. References
- Related processes: {{relatedProcesses}}
- Backup procedures: {{backupProcedures}}
- Vendor contacts: {{vendorContacts}}

---
**Last Updated**: {{lastUpdated}}
**Next Review**: {{nextReview}}`,
      isSystem: true,
      placeholders: [
        { key: "incidentType", label: "Incident Type", type: "text" },
        {
          key: "severityLevel",
          label: "Severity Level",
          type: "select",
          options: ["LOW", "MEDIUM", "HIGH", "CRITICAL"],
        },
        {
          key: "likelihood",
          label: "Likelihood",
          type: "select",
          options: ["RARE", "UNLIKELY", "POSSIBLE", "LIKELY", "ALMOST CERTAIN"],
        },
        { key: "estimatedImpact", label: "Estimated Impact", type: "text" },
        { key: "detectionRoles", label: "Detection Roles", type: "text" },
        {
          key: "reportingMechanism",
          label: "Reporting Mechanism",
          type: "text",
        },
        {
          key: "escalationTimeframe",
          label: "Escalation Timeframe",
          type: "text",
        },
        { key: "teamContacts", label: "Team Contacts", type: "text" },
        {
          key: "activationThreshold",
          label: "Activation Threshold",
          type: "text",
        },
        { key: "triageTime", label: "Triage Time (min)", type: "number" },
        {
          key: "containmentTime",
          label: "Containment Time (hrs)",
          type: "number",
        },
        {
          key: "eradicationTime",
          label: "Eradication Time (hrs)",
          type: "number",
        },
        { key: "recoveryTime", label: "Recovery Time (hrs)", type: "number" },
        { key: "rto", label: "RTO (hrs)", type: "number" },
        { key: "rpo", label: "RPO (hrs)", type: "number" },
        { key: "mbco", label: "MBCO", type: "text" },
        { key: "stakeholders", label: "Stakeholders", type: "textarea" },
        {
          key: "regulatoryContacts",
          label: "Regulatory Contacts",
          type: "textarea",
        },
        {
          key: "customerContacts",
          label: "Customer Contacts",
          type: "textarea",
        },
        { key: "mediaContacts", label: "Media Contacts", type: "textarea" },
        { key: "updateFrequency", label: "Update Frequency", type: "text" },
        {
          key: "reviewTimeline",
          label: "Review Timeline (days)",
          type: "number",
        },
        {
          key: "relatedProcesses",
          label: "Related Processes",
          type: "textarea",
        },
        {
          key: "backupProcedures",
          label: "Backup Procedures",
          type: "textarea",
        },
        { key: "vendorContacts", label: "Vendor Contacts", type: "textarea" },
        { key: "lastUpdated", label: "Last Updated", type: "date" },
        { key: "nextReview", label: "Next Review", type: "date" },
      ],
    },
    {
      name: "Contact Directory Template",
      description: "Template for BCMS contact directory",
      type: "MANUAL" as const,
      categoryId: categories[5].id,
      content: `# Business Continuity Contact Directory

## Emergency Contacts
### BCMS Team
- **BC Manager**: {{bcManager}} - {{bcManagerPhone}} - {{bcManagerEmail}}
- **Deputy BC Manager**: {{deputyBCManager}} - {{deputyBCManagerPhone}} - {{deputyBCManagerEmail}}
- **BC Coordinator**: {{bcCoordinator}} - {{bcCoordinatorPhone}} - {{bcCoordinatorEmail}}

### Executive Management
- **CEO**: {{ceo}} - {{ceoPhone}} - {{ceoEmail}}
- **COO**: {{coo}} - {{cooPhone}} - {{cooEmail}}
- **CFO**: {{cfo}} - {{cfoPhone}} - {{cfoEmail}}

### IT & Technical
- **IT Director**: {{itDirector}} - {{itDirectorPhone}} - {{itDirectorEmail}}
- **Network Admin**: {{networkAdmin}} - {{networkAdminPhone}} - {{networkAdminEmail}}
- **System Admin**: {{systemAdmin}} - {{systemAdminPhone}} - {{systemAdminEmail}}

### Facilities
- **Facilities Manager**: {{facilitiesManager}} - {{facilitiesManagerPhone}} - {{facilitiesManagerEmail}}
- **Security**: {{security}} - {{securityPhone}} - {{securityEmail}}
- **Building Management**: {{buildingManager}} - {{buildingManagerPhone}} - {{buildingManagerEmail}}

## Vendor Contacts
### Critical Vendors
{{vendorContacts}}

### Backup Locations
- **Primary**: {{primaryBackupLocation}}
- **Secondary**: {{secondaryBackupLocation}}

## Communication Channels
### Primary
- **Email**: {{primaryEmail}}
- **Phone**: {{primaryPhone}}
- **SMS**: {{smsGateway}}

### Secondary
- **Radio**: {{radioFrequency}}
- **Conference Bridge**: {{conferenceBridge}}

## Contact Hierarchy
1. First point of contact: {{firstContact}}
2. Escalation level 1: {{escalation1}}
3. Escalation level 2: {{escalation2}}
4. Executive escalation: {{executiveEscalation}}

---
**Last Updated**: {{lastUpdated}}
**Next Review**: {{nextReview}}`,
      isSystem: true,
      placeholders: [
        { key: "bcManager", label: "BC Manager Name", type: "text" },
        { key: "bcManagerPhone", label: "BC Manager Phone", type: "text" },
        { key: "bcManagerEmail", label: "BC Manager Email", type: "email" },
        { key: "deputyBCManager", label: "Deputy BC Manager", type: "text" },
        { key: "deputyBCManagerPhone", label: "Deputy Phone", type: "text" },
        { key: "deputyBCManagerEmail", label: "Deputy Email", type: "email" },
        { key: "bcCoordinator", label: "BC Coordinator", type: "text" },
        { key: "bcCoordinatorPhone", label: "Coordinator Phone", type: "text" },
        {
          key: "bcCoordinatorEmail",
          label: "Coordinator Email",
          type: "email",
        },
        { key: "ceo", label: "CEO Name", type: "text" },
        { key: "ceoPhone", label: "CEO Phone", type: "text" },
        { key: "ceoEmail", label: "CEO Email", type: "email" },
        { key: "coo", label: "COO Name", type: "text" },
        { key: "cooPhone", label: "COO Phone", type: "text" },
        { key: "cooEmail", label: "COO Email", type: "email" },
        { key: "cfo", label: "CFO Name", type: "text" },
        { key: "cfoPhone", label: "CFO Phone", type: "text" },
        { key: "cfoEmail", label: "CFO Email", type: "email" },
        { key: "itDirector", label: "IT Director", type: "text" },
        { key: "itDirectorPhone", label: "IT Director Phone", type: "text" },
        { key: "itDirectorEmail", label: "IT Director Email", type: "email" },
        { key: "networkAdmin", label: "Network Admin", type: "text" },
        {
          key: "networkAdminPhone",
          label: "Network Admin Phone",
          type: "text",
        },
        {
          key: "networkAdminEmail",
          label: "Network Admin Email",
          type: "email",
        },
        { key: "systemAdmin", label: "System Admin", type: "text" },
        { key: "systemAdminPhone", label: "System Admin Phone", type: "text" },
        { key: "systemAdminEmail", label: "System Admin Email", type: "email" },
        { key: "facilitiesManager", label: "Facilities Manager", type: "text" },
        {
          key: "facilitiesManagerPhone",
          label: "Facilities Phone",
          type: "text",
        },
        {
          key: "facilitiesManagerEmail",
          label: "Facilities Email",
          type: "email",
        },
        { key: "security", label: "Security Contact", type: "text" },
        { key: "securityPhone", label: "Security Phone", type: "text" },
        { key: "securityEmail", label: "Security Email", type: "email" },
        { key: "buildingManager", label: "Building Manager", type: "text" },
        { key: "buildingManagerPhone", label: "Building Phone", type: "text" },
        { key: "buildingManagerEmail", label: "Building Email", type: "email" },
        {
          key: "vendorContacts",
          label: "Vendor Contacts (format)",
          type: "textarea",
        },
        {
          key: "primaryBackupLocation",
          label: "Primary Backup Location",
          type: "text",
        },
        {
          key: "secondaryBackupLocation",
          label: "Secondary Backup Location",
          type: "text",
        },
        { key: "primaryEmail", label: "Primary Email", type: "email" },
        { key: "primaryPhone", label: "Primary Phone", type: "text" },
        { key: "smsGateway", label: "SMS Gateway", type: "text" },
        { key: "radioFrequency", label: "Radio Frequency", type: "text" },
        { key: "conferenceBridge", label: "Conference Bridge", type: "text" },
        { key: "firstContact", label: "First Contact", type: "text" },
        { key: "escalation1", label: "Escalation Level 1", type: "text" },
        { key: "escalation2", label: "Escalation Level 2", type: "text" },
        {
          key: "executiveEscalation",
          label: "Executive Escalation",
          type: "text",
        },
        { key: "lastUpdated", label: "Last Updated", type: "date" },
        { key: "nextReview", label: "Next Review", type: "date" },
      ],
    },
    {
      name: "Testing Checklist Template",
      description: "Template for BCMS testing and exercise checklists",
      type: "CHECKLIST" as const,
      categoryId: categories[3].id,
      content: `# BCMS Testing & Exercise Checklist

## Exercise Information
- **Exercise Title**: {{exerciseTitle}}
- **Exercise Type**: {{exerciseType}}
- **Date**: {{exerciseDate}}
- **Lead Facilitator**: {{facilitator}}
- **Exercise Scope**: {{exerciseScope}}

## Pre-Exercise Checklist
### Planning Phase
- [ ] Exercise objectives defined
- [ ] Scope and boundaries established
- [ ] Participants identified and notified
- [ ] Resources allocated
- [ ] Schedule communicated
- [ ] Roles and responsibilities assigned
- [ ] Exercise scenario developed
- [ ] Evaluation criteria defined

### Logistics
- [ ] Venue secured (if required)
- [ ] Equipment tested and ready
- [ ] Backup systems verified
- [ ] Communication channels tested
- [ ] Documentation materials prepared

## Exercise Execution Checklist
### During Exercise
- [ ] Exercise started on time
- [ ] Scenario initiated properly
- [ ] All participants engaged
- [ ] Timeline followed
- [ ] Observers documenting
- [ ] Deviations recorded
- [ ] Issues logged
- [ ] Decisions documented

### Response Actions
- [ ] Incident detection and reporting
- [ ] Team activation and mobilization
- [ ] Response procedures executed
- [ ] Communication flow maintained
- [ ] Stakeholders notified appropriately
- [ ] Recovery actions initiated
- [ ] Resource utilization tracked
- [ ] Timeline adherence monitored

## Post-Exercise Checklist
### Immediate Actions
- [ ] Exercise formally concluded
- [ ] Hot wash conducted with participants
- [ ] Initial observations gathered
- [ ] Systems restored to normal operation
- [ ] Data backed up

### Documentation
- [ ] Exercise report drafted
- [ ] Findings documented
- [ ] Lessons learned captured
- [ ] Performance metrics analyzed
- [ ] Timeline documented
- [ ] Photo/video evidence collected

### Evaluation
- [ ] Objectives achieved: {{objectivesAchieved}}
- [ ] Response times: {{responseTimes}}
- [ ] Recovery times: {{recoveryTimes}}
- [ ] Communication effectiveness: {{commEffectiveness}}
- [ ] Resource adequacy: {{resourceAdequacy}}
- [ ] Overall performance rating: {{performanceRating}}/10

## Follow-Up Actions
### Improvement Actions
{{improvementActions}}

### Timeline
- [ ] Action items assigned
- [ ] Owners identified
- [ ] Due dates set
- [ ] Progress tracking established

### Reporting
- [ ] Final report prepared
- [ ] Management briefed
- [ ] Findings shared with participants
- [ ] BCMS updated based on findings
- [ ] Next exercise scheduled

## Appendices
### Participant Roster
{{participantRoster}}

### Exercise Timeline
{{exerciseTimeline}}

### Scenario Details
{{scenarioDetails}}

---
**Exercise Report Completed By**: {{completedBy}}
**Date**: {{completionDate}}
**Reviewed By**: {{reviewedBy}}
**Review Date**: {{reviewDate}}`,
      isSystem: true,
      placeholders: [
        { key: "exerciseTitle", label: "Exercise Title", type: "text" },
        {
          key: "exerciseType",
          label: "Exercise Type",
          type: "select",
          options: ["TABLETOP", "WALKTHROUGH", "SIMULATION", "FULL_SCALE"],
        },
        { key: "exerciseDate", label: "Exercise Date", type: "date" },
        { key: "facilitator", label: "Lead Facilitator", type: "text" },
        { key: "exerciseScope", label: "Exercise Scope", type: "textarea" },
        {
          key: "objectivesAchieved",
          label: "Objectives Achieved",
          type: "text",
        },
        { key: "responseTimes", label: "Response Times", type: "text" },
        { key: "recoveryTimes", label: "Recovery Times", type: "text" },
        {
          key: "commEffectiveness",
          label: "Communication Effectiveness",
          type: "select",
          options: [
            "EXCELLENT",
            "GOOD",
            "SATISFACTORY",
            "NEEDS IMPROVEMENT",
            "POOR",
          ],
        },
        {
          key: "resourceAdequacy",
          label: "Resource Adequacy",
          type: "select",
          options: [
            "EXCELLENT",
            "GOOD",
            "SATISFACTORY",
            "NEEDS IMPROVEMENT",
            "POOR",
          ],
        },
        {
          key: "performanceRating",
          label: "Performance Rating (1-10)",
          type: "number",
        },
        {
          key: "improvementActions",
          label: "Improvement Actions",
          type: "textarea",
        },
        {
          key: "participantRoster",
          label: "Participant Roster",
          type: "textarea",
        },
        {
          key: "exerciseTimeline",
          label: "Exercise Timeline",
          type: "textarea",
        },
        { key: "scenarioDetails", label: "Scenario Details", type: "textarea" },
        { key: "completedBy", label: "Completed By", type: "text" },
        { key: "completionDate", label: "Completion Date", type: "date" },
        { key: "reviewedBy", label: "Reviewed By", type: "text" },
        { key: "reviewDate", label: "Review Date", type: "date" },
      ],
    },
    {
      name: "Risk Assessment Report Template",
      description: "Template for documenting risk assessments",
      type: "REPORT" as const,
      categoryId: categories[4].id,
      content: `# Risk Assessment Report

## Report Information
- **Report ID**: {{reportId}}
- **Assessment Date**: {{assessmentDate}}
- **Assessment Period**: {{assessmentPeriod}}
- **Assessment Team**: {{assessmentTeam}}
- **Report Status**: {{reportStatus}}

## Executive Summary
{{executiveSummary}}

## Risk Register Summary
- **Total Risks Identified**: {{totalRisks}}
- **Critical Risks**: {{criticalRisks}}
- **High Risks**: {{highRisks}}
- **Medium Risks**: {{mediumRisks}}
- **Low Risks**: {{lowRisks}}

## Detailed Risk Analysis
{{riskDetails}}

## Risk Matrix
| Likelihood / Impact | Negligible | Minor | Moderate | Major | Catastrophic |
|---------------------|-------------|--------|-----------|--------|--------------|
| Almost Certain | | | | | |
| Likely | | | | | |
| Possible | | | | | |
| Unlikely | | | | | |
| Rare | | | | | |

## Top 5 Risks
### 1. {{risk1Name}}
- **Risk Score**: {{risk1Score}}
- **Impact**: {{risk1Impact}}
- **Likelihood**: {{risk1Likelihood}}
- **Current Treatment**: {{risk1Treatment}}

### 2. {{risk2Name}}
- **Risk Score**: {{risk2Score}}
- **Impact**: {{risk2Impact}}
- **Likelihood**: {{risk2Likelihood}}
- **Current Treatment**: {{risk2Treatment}}

### 3. {{risk3Name}}
- **Risk Score**: {{risk3Score}}
- **Impact**: {{risk3Impact}}
- **Likelihood**: {{risk3Likelihood}}
- **Current Treatment**: {{risk3Treatment}}

### 4. {{risk4Name}}
- **Risk Score**: {{risk4Score}}
- **Impact**: {{risk4Impact}}
- **Likelihood**: {{risk4Likelihood}}
- **Current Treatment**: {{risk4Treatment}}

### 5. {{risk5Name}}
- **Risk Score**: {{risk5Score}}
- **Impact**: {{risk5Impact}}
- **Likelihood**: {{risk5Likelihood}}
- **Current Treatment**: {{risk5Treatment}}

## Risk Treatment Recommendations
{{treatmentRecommendations}}

## Conclusion and Next Steps
{{conclusion}}

## Approvals
- **Prepared By**: {{preparedBy}} - {{preparedDate}}
- **Reviewed By**: {{reviewedBy}} - {{reviewDate}}
- **Approved By**: {{approvedBy}} - {{approvalDate}}

---
**Document Version**: {{version}}
**Next Review Date**: {{nextReviewDate}}`,
      isSystem: true,
      placeholders: [
        { key: "reportId", label: "Report ID", type: "text" },
        { key: "assessmentDate", label: "Assessment Date", type: "date" },
        { key: "assessmentPeriod", label: "Assessment Period", type: "text" },
        { key: "assessmentTeam", label: "Assessment Team", type: "text" },
        {
          key: "reportStatus",
          label: "Report Status",
          type: "select",
          options: ["DRAFT", "FINAL", "SUPERSEDED"],
        },
        {
          key: "executiveSummary",
          label: "Executive Summary",
          type: "textarea",
        },
        { key: "totalRisks", label: "Total Risks", type: "number" },
        { key: "criticalRisks", label: "Critical Risks", type: "number" },
        { key: "highRisks", label: "High Risks", type: "number" },
        { key: "mediumRisks", label: "Medium Risks", type: "number" },
        { key: "lowRisks", label: "Low Risks", type: "number" },
        {
          key: "riskDetails",
          label: "Risk Details (format)",
          type: "textarea",
        },
        { key: "risk1Name", label: "Risk #1 Name", type: "text" },
        { key: "risk1Score", label: "Risk #1 Score", type: "number" },
        { key: "risk1Impact", label: "Risk #1 Impact", type: "text" },
        { key: "risk1Likelihood", label: "Risk #1 Likelihood", type: "text" },
        { key: "risk1Treatment", label: "Risk #1 Treatment", type: "text" },
        { key: "risk2Name", label: "Risk #2 Name", type: "text" },
        { key: "risk2Score", label: "Risk #2 Score", type: "number" },
        { key: "risk2Impact", label: "Risk #2 Impact", type: "text" },
        { key: "risk2Likelihood", label: "Risk #2 Likelihood", type: "text" },
        { key: "risk2Treatment", label: "Risk #2 Treatment", type: "text" },
        { key: "risk3Name", label: "Risk #3 Name", type: "text" },
        { key: "risk3Score", label: "Risk #3 Score", type: "number" },
        { key: "risk3Impact", label: "Risk #3 Impact", type: "text" },
        { key: "risk3Likelihood", label: "Risk #3 Likelihood", type: "text" },
        { key: "risk3Treatment", label: "Risk #3 Treatment", type: "text" },
        { key: "risk4Name", label: "Risk #4 Name", type: "text" },
        { key: "risk4Score", label: "Risk #4 Score", type: "number" },
        { key: "risk4Impact", label: "Risk #4 Impact", type: "text" },
        { key: "risk4Likelihood", label: "Risk #4 Likelihood", type: "text" },
        { key: "risk4Treatment", label: "Risk #4 Treatment", type: "text" },
        { key: "risk5Name", label: "Risk #5 Name", type: "text" },
        { key: "risk5Score", label: "Risk #5 Score", type: "number" },
        { key: "risk5Impact", label: "Risk #5 Impact", type: "text" },
        { key: "risk5Likelihood", label: "Risk #5 Likelihood", type: "text" },
        { key: "risk5Treatment", label: "Risk #5 Treatment", type: "text" },
        {
          key: "treatmentRecommendations",
          label: "Treatment Recommendations",
          type: "textarea",
        },
        { key: "conclusion", label: "Conclusion", type: "textarea" },
        { key: "preparedBy", label: "Prepared By", type: "text" },
        { key: "preparedDate", label: "Prepared Date", type: "date" },
        { key: "reviewedBy", label: "Reviewed By", type: "text" },
        { key: "reviewDate", label: "Review Date", type: "date" },
        { key: "approvedBy", label: "Approved By", type: "text" },
        { key: "approvalDate", label: "Approval Date", type: "date" },
        { key: "version", label: "Document Version", type: "text" },
        { key: "nextReviewDate", label: "Next Review Date", type: "date" },
      ],
    },
  ];

  const createdTemplates = await prisma.documentTemplate.createMany({
    data: systemTemplates.map((t) => ({
      ...t,
      createdBy: "system",
    })),
  });

  console.log(`✅ Created ${systemTemplates.length} system templates\n`);

  // Create sample documents from templates
  console.log("📄 Creating sample documents from templates...");

  const sampleDocuments = await Promise.all([
    // Generate BCMS Policy from template
    prisma.document.create({
      data: {
        title: "Sample BCMS Policy",
        content: systemTemplates[0].content
          .replace("{{policyOwner}}", "John Smith")
          .replace("{{organizationName}}", "Acme Corporation")
          .replace("{{effectiveDate}}", "2025-01-22")
          .replace("{{reviewDate}}", "2026-01-22")
          .replace("{{mtpd}}", "5")
          .replace("{{rto}}", "24")
          .replace("{{rpo}}", "4")
          .replace("{{approver}}", "Jane Doe")
          .replace("{{approvalDate}}", "2025-01-15"),
        categoryId: categories[0].id,
        status: "APPROVED",
        approvalStatus: "APPROVED",
        type: "POLICY",
        createdBy: "system",
        updatedBy: "system",
        publishedAt: new Date(),
      },
    }),

    // Generate Incident Playbook from template
    prisma.document.create({
      data: {
        title: "IT System Failure Playbook",
        content: systemTemplates[1].content
          .replace("{{incidentType}}", "IT System Failure")
          .replace("{{severityLevel}}", "HIGH")
          .replace("{{likelihood}}", "POSSIBLE")
          .replace("{{estimatedImpact}}", "Major operational disruption")
          .replace("{{detectionRoles}}", "IT Operations, Help Desk")
          .replace(
            "{{reportingMechanism}}",
            "Phone, Email, IT Ticketing System",
          )
          .replace("{{escalationTimeframe}}", "15 minutes")
          .replace("{{teamContacts}}", "IT Director, System Admins")
          .replace(
            "{{activationThreshold}}",
            "More than 1 critical system down",
          )
          .replace("{{triageTime}}", "15")
          .replace("{{containmentTime}}", "4")
          .replace("{{eradicationTime}}", "8")
          .replace("{{recoveryTime}}", "24")
          .replace("{{rto}}", "24")
          .replace("{{rpo}}", "4")
          .replace("{{mbco}}", "Core systems operational"),
        categoryId: categories[1].id,
        status: "APPROVED",
        approvalStatus: "APPROVED",
        type: "PLAYBOOK",
        createdBy: "system",
        updatedBy: "system",
        publishedAt: new Date(),
      },
    }),

    // Generate Contact Directory from template
    prisma.document.create({
      data: {
        title: "BCMS Contact Directory",
        content: systemTemplates[2].content
          .replace("{{bcManager}}", "Sarah Johnson")
          .replace("{{bcManagerPhone}}", "+1-555-0101")
          .replace("{{bcManagerEmail}}", "sarah.johnson@example.com")
          .replace("{{lastUpdated}}", new Date().toISOString().split("T")[0])
          .replace("{{nextReview}}", "2025-07-22"),
        categoryId: categories[5].id,
        status: "APPROVED",
        approvalStatus: "APPROVED",
        type: "MANUAL",
        createdBy: "system",
        updatedBy: "system",
        publishedAt: new Date(),
      },
    }),
  ]);

  console.log(`✅ Created ${sampleDocuments.length} sample documents\n`);

  // Create initial versions for sample documents
  console.log("📝 Creating initial document versions...");

  await prisma.documentVersion.createMany({
    data: sampleDocuments.map((doc, index) => ({
      documentId: doc.id,
      version: 1,
      title: doc.title,
      content: doc.content,
      changes:
        index === 0
          ? "Initial BCMS Policy"
          : index === 1
            ? "Initial Incident Playbook"
            : "Initial Contact Directory",
      createdBy: "system",
    })),
  });

  console.log("✅ Created initial document versions\n");

  console.log("🎉 Full documentation module seeding completed successfully!\n");
  console.log("Summary:");
  console.log(`- ${categories.length} document categories`);
  console.log(`- ${systemTemplates.length} system templates`);
  console.log(`- ${sampleDocuments.length} sample documents`);
  console.log(`- ${sampleDocuments.length} initial versions\n`);
}

main()
  .catch((e) => {
    console.error("❌ Error seeding documentation module:", e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
