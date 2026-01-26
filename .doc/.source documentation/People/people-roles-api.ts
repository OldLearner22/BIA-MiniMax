// api/people-roles/team-structure/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/database';
import { TeamStructureUpdateRequest, OrganigramData } from '@/types/people-roles';

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const organizationId = searchParams.get('organizationId');
    
    if (!organizationId) {
      return NextResponse.json({ error: 'Organization ID required' }, { status: 400 });
    }

    // Fetch team structure hierarchy
    const teamsQuery = `
      SELECT * FROM bc_team_structure 
      WHERE organization_id = $1 AND is_active = true
      ORDER BY level, display_order
    `;
    
    const rolesQuery = `
      SELECT * FROM bc_roles 
      WHERE organization_id = $1
      ORDER BY name
    `;
    
    const peopleQuery = `
      SELECT * FROM bc_people 
      WHERE organization_id = $1 AND employment_status = 'active'
      ORDER BY last_name, first_name
    `;
    
    const assignmentsQuery = `
      SELECT ra.*, p.first_name, p.last_name, p.email, p.job_title,
             r.name as role_name, r.role_type, r.criticality_level,
             ts.name as team_name
      FROM bc_role_assignments ra
      JOIN bc_people p ON ra.person_id = p.id
      JOIN bc_roles r ON ra.role_id = r.id
      JOIN bc_team_structure ts ON ra.team_structure_id = ts.id
      WHERE ra.is_active = true AND p.organization_id = $1
      ORDER BY ts.level, ra.assignment_type
    `;

    const [teams, roles, people, assignments] = await Promise.all([
      db.query(teamsQuery, [organizationId]),
      db.query(rolesQuery, [organizationId]),
      db.query(peopleQuery, [organizationId]),
      db.query(assignmentsQuery, [organizationId])
    ]);

    const organigramData: OrganigramData = {
      teams: teams.rows,
      roles: roles.rows,
      people: people.rows,
      assignments: assignments.rows
    };

    return NextResponse.json(organigramData);
  } catch (error) {
    console.error('Error fetching organigram data:', error);
    return NextResponse.json({ error: 'Failed to fetch organigram data' }, { status: 500 });
  }
}

export async function PUT(request: NextRequest) {
  try {
    const data: TeamStructureUpdateRequest = await request.json();
    const { assignments, teamPositions } = data;

    await db.query('BEGIN');

    try {
      // Update team positions
      for (const [teamId, position] of Object.entries(teamPositions)) {
        await db.query(
          `UPDATE bc_team_structure 
           SET position_x = $1, position_y = $2, updated_at = NOW()
           WHERE id = $3`,
          [position.x, position.y, teamId]
        );
      }

      // Clear existing assignments and create new ones
      for (const [assignmentKey, assignment] of Object.entries(assignments)) {
        const [teamId, roleType] = assignmentKey.split('-');
        
        // Find the role ID based on name/type
        const roleResult = await db.query(
          `SELECT id FROM bc_roles WHERE LOWER(REPLACE(name, ' ', '-')) = $1`,
          [roleType.replace('-', ' ').toLowerCase()]
        );
        
        if (roleResult.rows.length === 0) continue;
        
        const roleId = roleResult.rows[0].id;
        const teamStructureId = teamId;
        
        // Remove existing assignment for this role/team combination
        await db.query(
          `UPDATE bc_role_assignments 
           SET is_active = false, end_date = CURRENT_DATE
           WHERE role_id = $1 AND team_structure_id = $2 AND is_active = true`,
          [roleId, teamStructureId]
        );
        
        // Create new assignment
        await db.query(
          `INSERT INTO bc_role_assignments 
           (id, person_id, role_id, team_structure_id, assignment_type, start_date, is_active)
           VALUES ($1, $2, $3, $4, $5, CURRENT_DATE, true)`,
          [
            crypto.randomUUID(),
            assignment.personId,
            roleId,
            teamStructureId,
            'primary'
          ]
        );
      }

      await db.query('COMMIT');
      
      return NextResponse.json({ success: true, message: 'Team structure updated successfully' });
    } catch (error) {
      await db.query('ROLLBACK');
      throw error;
    }
  } catch (error) {
    console.error('Error updating team structure:', error);
    return NextResponse.json({ error: 'Failed to update team structure' }, { status: 500 });
  }
}

// api/people-roles/people/route.ts
export async function POST(request: NextRequest) {
  try {
    const personData = await request.json();
    
    const result = await db.query(
      `INSERT INTO bc_people 
       (id, employee_id, first_name, last_name, email, phone, mobile, 
        department, job_title, location, manager_id, hire_date, 
        employment_status, emergency_contact_name, emergency_contact_phone,
        profile_photo_url, organization_id)
       VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14, $15, $16, $17)
       RETURNING *`,
      [
        crypto.randomUUID(),
        personData.employee_id,
        personData.first_name,
        personData.last_name,
        personData.email,
        personData.phone,
        personData.mobile,
        personData.department,
        personData.job_title,
        personData.location,
        personData.manager_id,
        personData.hire_date,
        personData.employment_status || 'active',
        personData.emergency_contact_name,
        personData.emergency_contact_phone,
        personData.profile_photo_url,
        personData.organization_id
      ]
    );

    return NextResponse.json(result.rows[0], { status: 201 });
  } catch (error) {
    console.error('Error creating person:', error);
    return NextResponse.json({ error: 'Failed to create person' }, { status: 500 });
  }
}

// api/people-roles/competencies/assess/route.ts
export async function POST(request: NextRequest) {
  try {
    const assessmentData = await request.json();
    
    // Upsert competency assessment
    const result = await db.query(
      `INSERT INTO bc_person_competencies 
       (id, person_id, competency_id, proficiency_level, assessment_date, 
        assessment_method, evidence, next_assessment_date)
       VALUES ($1, $2, $3, $4, $5, $6, $7, $8)
       ON CONFLICT (person_id, competency_id)
       DO UPDATE SET
         proficiency_level = EXCLUDED.proficiency_level,
         assessment_date = EXCLUDED.assessment_date,
         assessment_method = EXCLUDED.assessment_method,
         evidence = EXCLUDED.evidence,
         next_assessment_date = EXCLUDED.next_assessment_date
       RETURNING *`,
      [
        crypto.randomUUID(),
        assessmentData.person_id,
        assessmentData.competency_id,
        assessmentData.proficiency_level,
        new Date(),
        assessmentData.assessment_method,
        assessmentData.evidence,
        new Date(Date.now() + 365 * 24 * 60 * 60 * 1000) // 1 year from now
      ]
    );

    return NextResponse.json(result.rows[0], { status: 201 });
  } catch (error) {
    console.error('Error creating competency assessment:', error);
    return NextResponse.json({ error: 'Failed to create assessment' }, { status: 500 });
  }
}

// api/people-roles/training/route.ts
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const organizationId = searchParams.get('organizationId');
    const personId = searchParams.get('personId');
    
    let query = `
      SELECT tr.*, p.first_name, p.last_name
      FROM bc_training_records tr
      JOIN bc_people p ON tr.person_id = p.id
      WHERE p.organization_id = $1
    `;
    const params = [organizationId];
    
    if (personId) {
      query += ' AND tr.person_id = $2';
      params.push(personId);
    }
    
    query += ' ORDER BY tr.completion_date DESC';
    
    const result = await db.query(query, params);
    
    return NextResponse.json(result.rows);
  } catch (error) {
    console.error('Error fetching training records:', error);
    return NextResponse.json({ error: 'Failed to fetch training records' }, { status: 500 });
  }
}

// api/people-roles/contact-directory/route.ts
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const organizationId = searchParams.get('organizationId');
    
    const query = `
      SELECT 
        p.*,
        ra.assignment_type,
        ra.availability_status,
        r.name as role_name,
        r.criticality_level,
        ts.name as team_name,
        cm.contact_type,
        cm.contact_value,
        cm.is_primary,
        cm.is_24_7_available
      FROM bc_people p
      LEFT JOIN bc_role_assignments ra ON p.id = ra.person_id AND ra.is_active = true
      LEFT JOIN bc_roles r ON ra.role_id = r.id
      LEFT JOIN bc_team_structure ts ON ra.team_structure_id = ts.id
      LEFT JOIN bc_contact_methods cm ON p.id = cm.person_id
      WHERE p.organization_id = $1 AND p.employment_status = 'active'
      ORDER BY p.last_name, p.first_name, cm.priority_order
    `;
    
    const result = await db.query(query, [organizationId]);
    
    // Group by person
    const contactDirectory = result.rows.reduce((acc, row) => {
      const personId = row.id;
      
      if (!acc[personId]) {
        acc[personId] = {
          person: {
            id: row.id,
            first_name: row.first_name,
            last_name: row.last_name,
            email: row.email,
            department: row.department,
            job_title: row.job_title,
            location: row.location
          },
          roles: [],
          contact_methods: [],
          availability_status: row.availability_status
        };
      }
      
      if (row.role_name && !acc[personId].roles.find(r => r.name === row.role_name)) {
        acc[personId].roles.push({
          name: row.role_name,
          team_name: row.team_name,
          criticality_level: row.criticality_level,
          assignment_type: row.assignment_type
        });
      }
      
      if (row.contact_type && !acc[personId].contact_methods.find(c => c.contact_type === row.contact_type)) {
        acc[personId].contact_methods.push({
          contact_type: row.contact_type,
          contact_value: row.contact_value,
          is_primary: row.is_primary,
          is_24_7_available: row.is_24_7_available
        });
      }
      
      return acc;
    }, {});
    
    return NextResponse.json(Object.values(contactDirectory));
  } catch (error) {
    console.error('Error fetching contact directory:', error);
    return NextResponse.json({ error: 'Failed to fetch contact directory' }, { status: 500 });
  }
}

// api/people-roles/succession-planning/route.ts
export async function POST(request: NextRequest) {
  try {
    const successionData = await request.json();
    
    await db.query('BEGIN');
    
    try {
      // Clear existing succession plans for this role
      await db.query(
        `DELETE FROM bc_succession_plans WHERE primary_role_assignment_id = $1`,
        [successionData.primary_role_assignment_id]
      );
      
      // Create new succession plans
      for (const backup of successionData.backup_assignments) {
        await db.query(
          `INSERT INTO bc_succession_plans 
           (id, primary_role_assignment_id, backup_person_id, succession_order, 
            readiness_level, development_plan, last_updated_date)
           VALUES ($1, $2, $3, $4, $5, $6, CURRENT_DATE)`,
          [
            crypto.randomUUID(),
            successionData.primary_role_assignment_id,
            backup.person_id,
            backup.succession_order,
            backup.readiness_level,
            backup.development_plan
          ]
        );
      }
      
      await db.query('COMMIT');
      
      return NextResponse.json({ success: true, message: 'Succession plan updated successfully' });
    } catch (error) {
      await db.query('ROLLBACK');
      throw error;
    }
  } catch (error) {
    console.error('Error updating succession plan:', error);
    return NextResponse.json({ error: 'Failed to update succession plan' }, { status: 500 });
  }
}
