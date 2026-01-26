import React, { useState, useEffect } from "react";
import {
  Incident,
  IncidentStatus,
  IncidentSeverity,
  IncidentCategory,
} from "../../types/incident";

interface IncidentListProps {
  incidents: Incident[];
  onIncidentSelect: (incident: Incident) => void;
  onStatusChange: (
    incidentId: string,
    newStatus: IncidentStatus,
  ) => Promise<void>;
}

const IncidentList: React.FC<IncidentListProps> = ({
  incidents,
  onIncidentSelect,
  onStatusChange,
}) => {
  const [filteredIncidents, setFilteredIncidents] =
    useState<Incident[]>(incidents);
  const [filters, setFilters] = useState({
    status: [] as IncidentStatus[],
    severity: [] as IncidentSeverity[],
    category: [] as IncidentCategory[],
    searchText: "",
  });

  useEffect(() => {
    let result: Incident[] = incidents;

    if (filters.status.length > 0) {
      result = result.filter((incident) =>
        filters.status.includes(incident.status),
      );
    }

    if (filters.severity.length > 0) {
      result = result.filter((incident) =>
        filters.severity.includes(incident.severity),
      );
    }

    if (filters.category.length > 0) {
      result = result.filter((incident) =>
        filters.category.includes(incident.category),
      );
    }

    if (filters.searchText) {
      const searchLower = filters.searchText.toLowerCase();
      result = result.filter(
        (incident) =>
          incident.title.toLowerCase().includes(searchLower) ||
          incident.description.toLowerCase().includes(searchLower) ||
          incident.incidentNumber.toLowerCase().includes(searchLower),
      );
    }

    setFilteredIncidents(result);
  }, [incidents, filters]);

  const getStatusCounts = () => {
    const counts: Record<IncidentStatus, number> = {
      REPORTED: 0,
      ASSESSED: 0,
      RESPONDING: 0,
      ESCALATED: 0,
      RESOLVED: 0,
      CLOSED: 0,
      CANCELLED: 0,
    };

    incidents.forEach((incident) => {
      counts[incident.status]++;
    });

    return counts;
  };

  const severityConfig = {
    LOW: { color: "bg-blue-100 text-blue-800 border-blue-300" },
    MEDIUM: { color: "bg-yellow-100 text-yellow-800 border-yellow-300" },
    HIGH: { color: "bg-orange-100 text-orange-800 border-orange-300" },
    CRITICAL: { color: "bg-red-100 text-red-800 border-red-300" },
  };

  const statusConfig = {
    REPORTED: { color: "bg-gray-100 text-gray-800" },
    ASSESSED: { color: "bg-blue-100 text-blue-800" },
    RESPONDING: { color: "bg-yellow-100 text-yellow-800" },
    ESCALATED: { color: "bg-red-100 text-red-800" },
    RESOLVED: { color: "bg-green-100 text-green-800" },
    CLOSED: { color: "bg-gray-200 text-gray-800" },
    CANCELLED: { color: "bg-gray-300 text-gray-800" },
  };

  return (
    <div className="space-y-6">
      <div className="glass-panel">
        <div className="px-6 py-4 border-b border-white/10">
          <div className="flex justify-between items-center">
            <h2 className="text-xl font-semibold text-bia-text-primary">
              Incident Log
            </h2>
            <div className="text-sm text-bia-text-secondary">
              Total: {incidents.length} | Active:{" "}
              {
                incidents.filter(
                  (i) =>
                    i.status !== IncidentStatus.CLOSED &&
                    i.status !== IncidentStatus.CANCELLED,
                ).length
              }
            </div>
          </div>
        </div>

        {/* Filters */}
        <div className="px-6 py-4 border-b border-white/10 bg-white/[0.02]">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            {/* Search */}
            <div className="md:col-span-2">
              <label className="block text-sm font-medium text-bia-text-secondary mb-1">
                Search
              </label>
              <input
                type="text"
                value={filters.searchText}
                onChange={(e) =>
                  setFilters({ ...filters, searchText: e.target.value })
                }
                className="w-full glass-input"
                placeholder="Search by title, description, or incident number..."
              />
            </div>

            {/* Status Filter */}
            <div>
              <label
                htmlFor="incident-status-filter"
                className="block text-sm font-medium text-gray-700 mb-1">
                Status
              </label>
              <select
                id="incident-status-filter"
                title="Status"
                multiple
                aria-label="Status"
                value={filters.status}
                onChange={(e) => {
                  const selected = Array.from(
                    e.target.selectedOptions,
                    (opt) => opt.value as IncidentStatus,
                  );
                  setFilters({ ...filters, status: selected });
                }}
                className="w-full glass-input h-24">
                {Object.values(IncidentStatus).map((status) => (
                  <option key={status} value={status}>
                    {status.replace(/_/g, " ")}
                  </option>
                ))}
              </select>
            </div>

            {/* Severity Filter */}
            <div>
              <label className="block text-sm font-medium text-bia-text-secondary mb-1">
                Severity
              </label>
              <select
                id="incident-severity-filter"
                title="Severity"
                multiple
                value={filters.severity}
                onChange={(e) => {
                  const selected = Array.from(
                    e.target.selectedOptions,
                    (opt) => opt.value as IncidentSeverity,
                  );
                  setFilters({ ...filters, severity: selected });
                }}
                className="w-full glass-input h-24">
                {Object.values(IncidentSeverity).map((severity) => (
                  <option key={severity} value={severity}>
                    {severity}
                  </option>
                ))}
              </select>
            </div>

            {/* Category Filter */}
            <div>
              <label className="block text-sm font-medium text-bia-text-secondary mb-1">
                Category
              </label>
              <select
                title="Category"
                multiple
                value={filters.category}
                onChange={(e) => {
                  const selected = Array.from(
                    e.target.selectedOptions,
                    (opt) => opt.value as IncidentCategory,
                  );
                  setFilters({ ...filters, category: selected });
                }}
                className="w-full glass-input h-24">
                {Object.values(IncidentCategory).map((category) => (
                  <option key={category} value={category}>
                    {category.replace(/_/g, " ")}
                  </option>
                ))}
              </select>
            </div>
          </div>
        </div>

        {/* Status Counts */}
        <div className="px-6 py-3 border-b border-white/10">
          <div className="flex flex-wrap gap-2">
            {Object.entries(getStatusCounts()).map(([status, count]) => (
              <button
                key={status}
                type="button"
                onClick={() => {
                  const newStatus = filters.status.includes(
                    status as IncidentStatus,
                  )
                    ? filters.status.filter((s) => s !== status)
                    : [...filters.status, status as IncidentStatus];
                  setFilters({ ...filters, status: newStatus });
                }}
                className={`px-3 py-1 text-sm rounded-md transition-all ${
                  filters.status.includes(status as IncidentStatus)
                    ? "bg-blue-600 text-white"
                    : "glass-button hover:bg-blue-500/10"
                }`}>
                {status.replace(/_/g, " ")} ({count})
              </button>
            ))}
          </div>
        </div>

        {/* Incident List */}
        <div className="divide-y divide-white/5">
          {filteredIncidents.length === 0 ? (
            <div className="px-6 py-12 text-center">
              <p className="text-bia-text-secondary">
                No incidents found matching your criteria
              </p>
            </div>
          ) : (
            filteredIncidents.map((incident) => (
              <div
                key={incident.id}
                className="px-6 py-4 hover:bg-white/[0.02] cursor-pointer transition-colors"
                onClick={() => onIncidentSelect(incident)}>
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <div className="flex items-center gap-3 mb-2">
                      <span className="text-sm font-mono text-bia-text-tertiary">
                        {incident.incidentNumber}
                      </span>
                      <h3 className="text-lg font-semibold text-bia-text-primary">
                        {incident.title}
                      </h3>
                    </div>
                    <p className="text-sm text-bia-text-secondary mb-2 line-clamp-2">
                      {incident.description}
                    </p>
                    <div className="flex flex-wrap gap-2">
                      <span
                        className={`px-2 py-1 text-xs font-medium rounded-md ${
                          severityConfig[
                            incident.severity as keyof typeof severityConfig
                          ]?.color
                        }`}>
                        {incident.severity}
                      </span>
                      <span
                        className={`px-2 py-1 text-xs font-medium rounded-md ${
                          statusConfig[
                            incident.status as keyof typeof statusConfig
                          ]?.color
                        }`}>
                        {incident.status.replace(/_/g, " ")}
                      </span>
                      <span className="px-2 py-1 text-xs font-medium rounded-md bg-gray-100 text-gray-700">
                        {incident.category.replace(/_/g, " ")}
                      </span>
                    </div>
                  </div>
                  <div className="text-right">
                    <div className="text-sm text-gray-600">
                      {new Date(incident.createdAt).toLocaleDateString()}
                    </div>
                  </div>
                </div>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
};

export default IncidentList;
