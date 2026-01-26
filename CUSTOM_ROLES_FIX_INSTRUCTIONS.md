# Fix for Custom Roles Not Displaying

## Problem

Custom roles defined when creating a team are not being rendered because the code has hardcoded role rendering for specific team types only.

## Solution

Replace lines 493-644 in `src/components/BCTeamStructure.tsx` with the following dynamic role rendering code:

```tsx
<div className="bc-team-roles">
  {/* Dynamically render all roles for this team */}
  {getTeamRoles(team).map((roleId) => {
    const assignmentKey = `${team.id}-${roleId}`;
    const assignment = assignments[assignmentKey];

    return (
      <div
        key={roleId}
        className={`bc-role-slot ${assignment ? "has-assignment" : ""}`}
        onDragOver={handleDragOver}
        onDrop={(e) => handleDrop(e, team.id, roleId)}>
        <div className="bc-role-label">{getRoleLabel(roleId)}</div>
        {assignment ? (
          <div className="bc-assigned-person">
            <div className="bc-assigned-avatar">
              {assignment.personName
                .split(" ")
                .map((n) => n[0])
                .join("")}
            </div>
            <div className="bc-assigned-info">
              <div className="bc-assigned-name">{assignment.personName}</div>
              <div className="bc-assigned-role">{assignment.personTitle}</div>
            </div>
            <button
              className="bc-remove-btn"
              onClick={() => handleRemoveAssignment(team.id, roleId)}>
              ×
            </button>
          </div>
        ) : (
          <div className="bc-empty-state">Drop person here</div>
        )}
      </div>
    );
  })}
</div>
```

## What This Does:

1. Uses `getTeamRoles(team)` to get the list of roles for each team
2. For custom teams, this returns the roles you defined when creating the team
3. For default teams, it returns the hardcoded roles
4. Dynamically renders a role slot for each role
5. Uses `getRoleLabel()` to format the role name nicely

## Quick Fix Steps:

1. Open `src/components/BCTeamStructure.tsx`
2. Find line 493 (search for "bc-team-roles")
3. Select from line 493 to line 644 (the entire hardcoded role section)
4. Replace with the code above
5. Save the file

The custom roles will now display correctly!
