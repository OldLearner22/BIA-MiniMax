import React, { useState, useEffect, useRef, DragEvent } from "react";
import {
  BCPerson,
  BCTeamStructure as BCTeamStructureType,
  BCRole,
  BCRoleAssignment,
  OrganigramData,
} from "../types";
import "./BCTeamStructure.css";

interface TeamNodePosition {
  x: number;
  y: number;
}

interface Assignment {
  personId: string;
  personName: string;
  personTitle: string;
  roleType: string;
  teamId: string;
}

export default function BCTeamStructure() {
  const [organigramData, setOrganigramData] = useState<OrganigramData | null>(
    null,
  );
  const [draggedPerson, setDraggedPerson] = useState<BCPerson | null>(null);
  const [teamPositions, setTeamPositions] = useState<
    Record<string, TeamNodePosition>
  >({});
  const [assignments, setAssignments] = useState<Record<string, Assignment>>(
    {},
  );
  const [saveIndicatorVisible, setSaveIndicatorVisible] = useState(false);
  const [showCreateTeamModal, setShowCreateTeamModal] = useState(false);
  const [newTeam, setNewTeam] = useState({
    name: "",
    description: "",
    structure_type: "business_unit" as const,
    roles: [""] as string[],
  });
  const [draggedTeam, setDraggedTeam] = useState<string | null>(null);
  const [dragOffset, setDragOffset] = useState({ x: 0, y: 0 });
  const [customTeamRoles, setCustomTeamRoles] = useState<
    Record<string, string[]>
  >({});
  const [isCreatingTeam, setIsCreatingTeam] = useState(false);

  // Load organigram data
  useEffect(() => {
    loadOrganigramData();
  }, []);

  const loadOrganigramData = async () => {
    try {
      const response = await fetch("/api/bc-team-structure");
      if (!response.ok) throw new Error("Failed to fetch data");
      const data: OrganigramData = await response.json();

      setOrganigramData(data);

      // Map assignments to state
      const mappedAssignments: Record<string, Assignment> = {};
      (data.assignments as any[]).forEach((asgn: any) => {
        const person = data.people.find((p) => p.id === asgn.person_id);
        if (person) {
          const key = `${asgn.team_structure_id}-${asgn.assignment_type}`;
          mappedAssignments[key] = {
            personId: asgn.person_id,
            personName: `${person.first_name} ${person.last_name}`,
            personTitle: person.job_title || "",
            roleType: asgn.assignment_type,
            teamId: asgn.team_structure_id,
          };
        }
      });
      setAssignments(mappedAssignments);

      // Map positions to state
      const positions: Record<string, TeamNodePosition> = {};
      data.teams.forEach((team: any) => {
        positions[team.id] = {
          x: team.position_x || 0,
          y: team.position_y || 0,
        };
      });
      setTeamPositions(positions);
    } catch (error) {
      console.error("Failed to load organigram data:", error);
    }
  };

  const handleDragStart = (person: BCPerson) => {
    setDraggedPerson(person);
  };

  const handleDragEnd = () => {
    setDraggedPerson(null);
  };

  const handleDragOver = (e: DragEvent) => {
    e.preventDefault();
  };

  const handleDrop = (e: DragEvent, teamId: string, roleType: string) => {
    e.preventDefault();
    if (!draggedPerson) return;

    const assignmentKey = `${teamId}-${roleType}`;
    const newAssignment: Assignment = {
      personId: draggedPerson.id,
      personName: `${draggedPerson.first_name} ${draggedPerson.last_name}`,
      personTitle: draggedPerson.job_title || "",
      roleType,
      teamId,
    };

    setAssignments((prev) => ({
      ...prev,
      [assignmentKey]: newAssignment,
    }));

    showSaveIndicator();
    setDraggedPerson(null);
  };

  const handleRemoveAssignment = (teamId: string, roleType: string) => {
    const assignmentKey = `${teamId}-${roleType}`;
    setAssignments((prev) => {
      const newAssignments = { ...prev };
      delete newAssignments[assignmentKey];
      return newAssignments;
    });
    showSaveIndicator();
  };

  const showSaveIndicator = () => {
    setSaveIndicatorVisible(true);
    setTimeout(() => setSaveIndicatorVisible(false), 2000);
  };

  const saveStructure = async () => {
    try {
      const response = await fetch("/api/bc-team-structure", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ teamPositions, assignments }),
      });
      if (response.ok) {
        showSaveIndicator();
      }
    } catch (error) {
      console.error("Failed to save structure:", error);
    }
  };

  const getInitials = (firstName: string, lastName: string) => {
    return `${firstName.charAt(0)}${lastName.charAt(0)}`.toUpperCase();
  };

  const getTeamIcon = (type: string) => {
    const icons: Record<string, string> = {
      crisis_team: "🎯",
      recovery_team: "💻",
      communication_team: "📢",
      emergency_response: "🚨",
      business_unit: "🏢",
    };
    return icons[type] || "📋";
  };

  const isPersonAssigned = (personId: string) => {
    return Object.values(assignments).some((a) => a.personId === personId);
  };

  const getTeamRoles = (team: BCTeamStructureType): string[] => {
    // Check if this team has custom roles defined
    if (customTeamRoles[team.id]) {
      return customTeamRoles[team.id];
    }

    // Default team roles
    switch (team.structure_type) {
      case "crisis_team":
        return ["crisis-manager", "deputy-manager"];
      case "recovery_team":
        return ["it-lead"];
      case "communication_team":
        return ["comms-manager"];
      default:
        return ["team-lead"];
    }
  };

  const getRoleLabel = (roleId: string): string => {
    const labels: Record<string, string> = {
      "crisis-manager": "Crisis Manager",
      "deputy-manager": "Deputy Manager",
      "it-lead": "IT Recovery Lead",
      "comms-manager": "Communications Manager",
      "team-lead": "Team Lead",
      "team-member": "Team Member",
    };
    return (
      labels[roleId] ||
      roleId
        .split("-")
        .map((w) => w.charAt(0).toUpperCase() + w.slice(1))
        .join(" ")
    );
  };

  const handleCreateTeam = async () => {
    if (
      !newTeam.name.trim() ||
      newTeam.roles.filter((r) => r.trim()).length === 0
    ) {
      alert("Please provide a team name and at least one role");
      return;
    }

    // Prevent double submission
    if (isCreatingTeam) {
      return;
    }

    setIsCreatingTeam(true);

    try {
      const response = await fetch("/api/bc-team-structure/teams", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: newTeam.name,
          description: newTeam.description,
          structure_type: newTeam.structure_type,
          position_x: 400,
          position_y: (organigramData?.teams.length || 0) * 250 + 100,
        }),
      });

      if (!response.ok) throw new Error("Failed to create team");
      const createdTeam = await response.json();

      setOrganigramData((prev) =>
        prev
          ? {
              ...prev,
              teams: [...prev.teams, createdTeam],
            }
          : null,
      );

      setTeamPositions((prev) => ({
        ...prev,
        [createdTeam.id]: {
          x: createdTeam.position_x || 400,
          y: createdTeam.position_y || 100,
        },
      }));

      // Store custom roles for this team
      const validRoles = newTeam.roles
        .filter((r) => r.trim())
        .map((r) => r.toLowerCase().replace(/\s+/g, "-"));

      if (validRoles.length > 0) {
        setCustomTeamRoles((prev) => ({
          ...prev,
          [createdTeam.id]: validRoles,
        }));
      }

      // Reset form
      setNewTeam({
        name: "",
        description: "",
        structure_type: "business_unit",
        roles: [""],
      });
      setShowCreateTeamModal(false);
    } catch (error) {
      console.error("Error creating team:", error);
    } finally {
      setIsCreatingTeam(false);
    }
  };

  const handleAddRole = () => {
    setNewTeam((prev) => ({
      ...prev,
      roles: [...prev.roles, ""],
    }));
  };

  const handleRemoveRole = (index: number) => {
    setNewTeam((prev) => ({
      ...prev,
      roles: prev.roles.filter((_, i) => i !== index),
    }));
  };

  const handleRoleChange = (index: number, value: string) => {
    setNewTeam((prev) => ({
      ...prev,
      roles: prev.roles.map((role, i) => (i === index ? value : role)),
    }));
  };

  const handleDeleteTeam = async (teamId: string) => {
    if (
      !confirm(
        "Are you sure you want to delete this team? All role assignments will be removed.",
      )
    ) {
      return;
    }

    try {
      const response = await fetch(`/api/bc-team-structure/teams/${teamId}`, {
        method: "DELETE",
      });

      if (!response.ok) throw new Error("Failed to delete team");

      // Remove team from state
      setOrganigramData((prev) =>
        prev
          ? {
              ...prev,
              teams: prev.teams.filter((t) => t.id !== teamId),
            }
          : null,
      );

      // Remove team positions
      setTeamPositions((prev) => {
        const newPositions = { ...prev };
        delete newPositions[teamId];
        return newPositions;
      });

      // Remove all assignments for this team
      setAssignments((prev) => {
        const newAssignments = { ...prev };
        Object.keys(newAssignments).forEach((key) => {
          if (key.startsWith(`${teamId}-`)) {
            delete newAssignments[key];
          }
        });
        return newAssignments;
      });
    } catch (error) {
      console.error("Error deleting team:", error);
    }
  };

  const handleTeamMouseDown = (e: React.MouseEvent, teamId: string) => {
    // Don't start dragging if clicking on interactive elements
    const target = e.target as HTMLElement;
    if (
      target.closest(".bc-role-slot") ||
      target.closest(".bc-team-delete-btn")
    ) {
      return;
    }

    const teamPosition = teamPositions[teamId];
    if (!teamPosition) return;

    const container = document.querySelector(".bc-organigram-container");
    if (!container) return;

    const containerRect = container.getBoundingClientRect();

    setDraggedTeam(teamId);
    setDragOffset({
      x: e.clientX - containerRect.left - teamPosition.x,
      y: e.clientY - containerRect.top - teamPosition.y + container.scrollTop,
    });

    e.preventDefault();
  };

  const handleTeamMouseMove = (e: React.MouseEvent) => {
    if (!draggedTeam) return;

    const container = document.querySelector(".bc-organigram-container");
    if (!container) return;

    const containerRect = container.getBoundingClientRect();

    // Calculate new position relative to container
    const newX = e.clientX - containerRect.left - dragOffset.x;
    const newY =
      e.clientY - containerRect.top - dragOffset.y + container.scrollTop;

    setTeamPositions((prev) => ({
      ...prev,
      [draggedTeam]: {
        x: Math.max(0, newX),
        y: Math.max(0, newY),
      },
    }));
  };

  const handleTeamMouseUp = () => {
    if (draggedTeam) {
      setDraggedTeam(null);
      showSaveIndicator();
    }
  };

  if (!organigramData) {
    return <div className="bc-team-loading">Loading team structure...</div>;
  }

  return (
    <div className="bc-team-container">
      {/* Sidebar with People Pool */}
      <aside className="bc-sidebar">
        <div className="bc-sidebar-header">
          <h1 className="bc-sidebar-title">People Pool</h1>
          <p className="bc-sidebar-subtitle">Drag people into BC team roles</p>
        </div>

        <div className="bc-people-pool">
          <div className="bc-pool-section">
            <h2 className="bc-pool-title">Available Personnel</h2>

            {organigramData.people.map((person) => (
              <div
                key={person.id}
                className={`bc-person-card ${isPersonAssigned(person.id) ? "assigned" : ""}`}
                draggable
                onDragStart={() => handleDragStart(person)}
                onDragEnd={handleDragEnd}>
                <div className="bc-person-avatar">
                  {getInitials(person.first_name, person.last_name)}
                </div>
                <div className="bc-person-name">
                  {person.first_name} {person.last_name}
                </div>
                <div className="bc-person-title">{person.job_title}</div>
                <div className="bc-person-contact">{person.email}</div>
              </div>
            ))}
          </div>
        </div>
      </aside>

      {/* Main Canvas */}
      <main className="bc-main-canvas">
        <div className="bc-canvas-header">
          <h1 className="bc-canvas-title">BC Team Structure</h1>
          <div className="bc-canvas-controls">
            <button
              className="bc-control-btn bc-control-btn-primary"
              onClick={() => setShowCreateTeamModal(true)}>
              ➕ Create Team
            </button>
            <button className="bc-control-btn" onClick={saveStructure}>
              💾 Save Structure
            </button>
            <button className="bc-control-btn" onClick={loadOrganigramData}>
              🔄 Reset Layout
            </button>
          </div>
        </div>

        <div
          className="bc-organigram-container"
          onMouseMove={handleTeamMouseMove}
          onMouseUp={handleTeamMouseUp}
          onMouseLeave={handleTeamMouseUp}>
          {organigramData.teams.map((team) => (
            <div
              key={team.id}
              className={`bc-team-node ${draggedTeam === team.id ? "dragging" : ""}`}
              style={{
                left: `${teamPositions[team.id]?.x || 0}px`,
                top: `${teamPositions[team.id]?.y || 0}px`,
                cursor: draggedTeam === team.id ? "grabbing" : "grab",
              }}
              onMouseDown={(e) => handleTeamMouseDown(e, team.id)}>
              <div className="bc-team-header">
                <div className="bc-team-icon">
                  {getTeamIcon(team.structure_type)}
                </div>
                <div className="bc-team-info">
                  <h3>{team.name}</h3>
                  <p>{team.description}</p>
                </div>
                <button
                  className="bc-team-delete-btn"
                  onClick={(e) => {
                    e.stopPropagation();
                    handleDeleteTeam(team.id);
                  }}
                  title="Delete Team">
                  🗑️
                </button>
              </div>

              <div className="bc-team-roles">
                {getTeamRoles(team).map((roleId) => {
                  const assignmentKey = `${team.id}-${roleId}`;
                  const assignment = assignments[assignmentKey];

                  return (
                    <div
                      key={roleId}
                      className={`bc-role-slot ${assignment ? "has-assignment" : ""}`}
                      onDragOver={handleDragOver}
                      onDrop={(e) => handleDrop(e, team.id, roleId)}>
                      <div className="bc-role-label">
                        {getRoleLabel(roleId)}
                      </div>
                      {assignment ? (
                        <div className="bc-assigned-person">
                          <div className="bc-assigned-avatar">
                            {assignment.personName
                              .split(" ")
                              .map((n) => n[0])
                              .join("")}
                          </div>
                          <div className="bc-assigned-info">
                            <div className="bc-assigned-name">
                              {assignment.personName}
                            </div>
                            <div className="bc-assigned-role">
                              {assignment.personTitle}
                            </div>
                          </div>
                          <button
                            className="bc-remove-btn"
                            onClick={() =>
                              handleRemoveAssignment(team.id, roleId)
                            }>
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
            </div>
          ))}
        </div>
      </main>

      {/* Save Indicator */}
      <div
        className={`bc-save-indicator ${saveIndicatorVisible ? "show" : ""}`}>
        ✅ Structure saved successfully
      </div>

      {/* Create Team Modal */}
      {showCreateTeamModal && (
        <div
          className="bc-modal-overlay"
          onClick={() => setShowCreateTeamModal(false)}>
          <div className="bc-modal" onClick={(e) => e.stopPropagation()}>
            <div className="bc-modal-header">
              <h2>Create New Team</h2>
              <button
                className="bc-modal-close"
                onClick={() => setShowCreateTeamModal(false)}>
                ×
              </button>
            </div>
            <div className="bc-modal-body">
              <div className="bc-form-group">
                <label>Team Name *</label>
                <input
                  type="text"
                  value={newTeam.name}
                  onChange={(e) =>
                    setNewTeam((prev) => ({ ...prev, name: e.target.value }))
                  }
                  placeholder="e.g., Support Team"
                  className="bc-input"
                />
              </div>

              <div className="bc-form-group">
                <label>Description</label>
                <textarea
                  value={newTeam.description}
                  onChange={(e) =>
                    setNewTeam((prev) => ({
                      ...prev,
                      description: e.target.value,
                    }))
                  }
                  placeholder="Brief description of this team's purpose"
                  className="bc-textarea"
                  rows={3}
                />
              </div>

              <div className="bc-form-group">
                <label>Team Type</label>
                <select
                  value={newTeam.structure_type}
                  onChange={(e) =>
                    setNewTeam((prev) => ({
                      ...prev,
                      structure_type: e.target.value as any,
                    }))
                  }
                  className="bc-select">
                  <option value="business_unit">Business Unit</option>
                  <option value="crisis_team">Crisis Team</option>
                  <option value="recovery_team">Recovery Team</option>
                  <option value="emergency_response">Emergency Response</option>
                  <option value="communication_team">Communication Team</option>
                </select>
              </div>

              <div className="bc-form-group">
                <label>Roles *</label>
                {newTeam.roles.map((role, index) => (
                  <div key={index} className="bc-role-input-group">
                    <input
                      type="text"
                      value={role}
                      onChange={(e) => handleRoleChange(index, e.target.value)}
                      placeholder="e.g., Team Lead, Coordinator"
                      className="bc-input"
                    />
                    {newTeam.roles.length > 1 && (
                      <button
                        className="bc-btn-remove-role"
                        onClick={() => handleRemoveRole(index)}>
                        ×
                      </button>
                    )}
                  </div>
                ))}
                <button className="bc-btn-add-role" onClick={handleAddRole}>
                  + Add Role
                </button>
              </div>
            </div>
            <div className="bc-modal-footer">
              <button
                className="bc-btn-secondary"
                onClick={() => setShowCreateTeamModal(false)}
                disabled={isCreatingTeam}>
                Cancel
              </button>
              <button
                className="bc-btn-primary"
                onClick={handleCreateTeam}
                disabled={isCreatingTeam}>
                {isCreatingTeam ? "Creating..." : "Create Team"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
