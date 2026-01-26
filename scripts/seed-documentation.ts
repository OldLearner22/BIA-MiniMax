import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

async function seedDocumentation() {
  console.log("🌱 Seeding documentation module...");

  // Create document categories
  const categories = await Promise.all([
    prisma.documentCategory.upsert({
      where: { name: "BCMS Policy" },
      update: {},
      create: {
        name: "BCMS Policy",
        description:
          "Business Continuity Management System policies and procedures",
        color: "#38BDF8",
      },
    }),
    prisma.documentCategory.upsert({
      where: { name: "Incident Response" },
      update: {},
      create: {
        name: "Incident Response",
        description: "Incident response procedures and playbooks",
        color: "#F87171",
      },
    }),
    prisma.documentCategory.upsert({
      where: { name: "Recovery Procedures" },
      update: {},
      create: {
        name: "Recovery Procedures",
        description: "Business recovery and continuity procedures",
        color: "#34D399",
      },
    }),
    prisma.documentCategory.upsert({
      where: { name: "Contact Directory" },
      update: {},
      create: {
        name: "Contact Directory",
        description: "Emergency contact information and escalation procedures",
        color: "#FBBF24",
      },
    }),
  ]);

  console.log(`✅ Created ${categories.length} document categories`);

  // Create sample documents
  const documents = await Promise.all([
    // BCMS Policy Document
    prisma.document.upsert({
      where: { id: "doc-bc-policy-001" },
      update: {},
      create: {
        id: "doc-bc-policy-001",
        title: "Business Continuity Management System Policy",
        content: `# Business Continuity Management System Policy

## 1. Purpose
This policy establishes the framework for ensuring the continuity of critical business operations during disruptive events.

## 2. Scope
This policy applies to all employees, contractors, and third-party service providers of the organization.

## 3. Objectives
- Minimize the impact of disruptive events on business operations
- Ensure timely recovery of critical business functions
- Maintain customer confidence and regulatory compliance
- Protect the organization's reputation and financial stability

## 4. Policy Statement
The organization is committed to implementing and maintaining a comprehensive Business Continuity Management System (BCMS) in accordance with ISO 22301:2019 standards.

## 5. Responsibilities
- **Executive Management**: Overall responsibility for BCMS implementation
- **BCM Coordinator**: Day-to-day management and coordination
- **Department Heads**: Implementation within their areas
- **All Employees**: Awareness and participation in BCM activities

## 6. Key Principles
- Proactive risk management approach
- Regular testing and exercises
- Continuous improvement
- Clear communication and escalation procedures

## 7. Review and Approval
This policy is reviewed annually or following significant organizational changes.`,
        categoryId: categories[0].id,
        status: "PUBLISHED",
        createdBy: "system",
        updatedBy: "system",
      },
    }),

    // Incident Response Procedure
    prisma.document.upsert({
      where: { id: "doc-incident-response-001" },
      update: {},
      create: {
        id: "doc-incident-response-001",
        title: "Critical Incident Response Procedure",
        content: `# Critical Incident Response Procedure

## 1. Incident Classification
Incidents are classified as:
- **Critical**: Immediate threat to life, safety, or business continuity
- **High**: Significant operational impact within 4 hours
- **Medium**: Moderate operational impact within 24 hours
- **Low**: Minor operational impact, business as usual

## 2. Initial Response Steps
1. **Assess the Situation**: Determine the scope and impact
2. **Ensure Safety**: Protect personnel and assets
3. **Notify Key Personnel**: Alert incident response team
4. **Activate Incident Response Plan**: Follow predefined procedures
5. **Document Actions**: Record all decisions and actions taken

## 3. Escalation Procedures
- **Level 1**: Department manager notification
- **Level 2**: Executive team notification
- **Level 3**: Board of directors notification
- **Level 4**: External authorities notification (if required)

## 4. Communication Protocol
- Internal: Use established communication channels
- External: Coordinate through designated spokesperson
- Media: Prepare official statements and press releases

## 5. Recovery and Lessons Learned
1. **Post-Incident Review**: Conduct thorough analysis
2. **Lessons Learned**: Document findings and recommendations
3. **Process Improvement**: Update procedures based on experience
4. **Training**: Provide additional training as needed

## 6. Contact Information
- Incident Response Coordinator: [Name] - [Phone] - [Email]
- Emergency Services: 911
- IT Support: [Phone] - [Email]`,
        categoryId: categories[1].id,
        status: "PUBLISHED",
        createdBy: "system",
        updatedBy: "system",
      },
    }),

    // Contact Directory
    prisma.document.upsert({
      where: { id: "doc-contacts-001" },
      update: {},
      create: {
        id: "doc-contacts-001",
        title: "Emergency Contact Directory",
        content: `# Emergency Contact Directory

## Crisis Management Team
| Role | Name | Primary Phone | Secondary Phone | Email |
|------|------|---------------|-----------------|-------|
| Incident Commander | John Smith | +1-555-0101 | +1-555-0102 | john.smith@company.com |
| Operations Lead | Sarah Johnson | +1-555-0201 | +1-555-0202 | sarah.johnson@company.com |
| Communications Lead | Mike Davis | +1-555-0301 | +1-555-0302 | mike.davis@company.com |
| Technical Lead | Lisa Chen | +1-555-0401 | +1-555-0402 | lisa.chen@company.com |

## Department Contacts
### Finance
- Director: Robert Wilson (+1-555-0501)
- Backup: Maria Garcia (+1-555-0502)

### IT
- Director: David Brown (+1-555-0601)
- Backup: Jennifer Lee (+1-555-0602)

### Operations
- Director: Tom Anderson (+1-555-0701)
- Backup: Karen White (+1-555-0702)

## External Contacts
### Emergency Services
- Police: 911
- Fire Department: 911
- Ambulance: 911

### Utilities
- Electricity: [Provider] - [Emergency Number]
- Water: [Provider] - [Emergency Number]
- Gas: [Provider] - [Emergency Number]

### Vendors
- Primary IT Vendor: TechCorp - 24/7 Support: +1-800-TECH-911
- Backup IT Vendor: DataSafe - Support: +1-800-DATA-911

## Escalation Procedures
1. **Immediate Response**: Contact Incident Commander
2. **Department Level**: Notify department director and backup
3. **Executive Level**: Alert executive team via emergency notification system
4. **Board Level**: Contact board chairman for major incidents

## Communication Methods
- **Primary**: Company emergency notification system
- **Backup**: SMS and email distribution lists
- **Emergency**: Designated emergency phone tree`,
        categoryId: categories[3].id,
        status: "PUBLISHED",
        createdBy: "system",
        updatedBy: "system",
      },
    }),
  ]);

  console.log(`✅ Created ${documents.length} sample documents`);

  // Create initial versions for each document
  for (const doc of documents) {
    await prisma.documentVersion.create({
      data: {
        documentId: doc.id,
        version: 1,
        title: doc.title,
        content: doc.content,
        createdBy: doc.createdBy,
      },
    });
  }

  console.log("✅ Created initial document versions");

  console.log("🎉 Documentation module seeding completed!");
}

seedDocumentation()
  .catch((e) => {
    console.error("❌ Error seeding documentation:", e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
