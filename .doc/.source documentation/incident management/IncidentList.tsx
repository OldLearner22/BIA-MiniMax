// frontend/src/components/incident/IncidentList.tsx
import React, { useState, useEffect } from 'react';
import { Incident, IncidentStatus, IncidentSeverity, IncidentCategory } from '../../../shared/types/incident.types';
import IncidentCard from './IncidentCard';
import IncidentFilters from './IncidentFilters';

interface IncidentListProps {
  incidents: Incident[];
  onIncidentSelect: (incident: Incident) => void;
  onStatusChange: (incidentId: string, newStatus: IncidentStatus) => Promise<void>;
}

const IncidentList: React.FC<IncidentListProps> = ({ incidents, onIncidentSelect, onStatusChange }) => {
  const [filteredIncidents, setFilteredIncidents] = useState<Incident[]>(incidents);
  const [filters, setFilters] = useState({
    status: [] as IncidentStatus[],
    severity: [] as IncidentSeverity[],
    category: [] as IncidentCategory[],
    searchText: ''
  });

  useEffect(() => {
    let result = incidents;
    
    if (filters.status.length > 0) {
      result = result.filter(incident => filters.status.includes(incident.status));
    }
    
    if (filters.severity.length > 0) {
      result = result.filter(incident => filters.severity.includes(incident.severity));
    }
    
    if (filters.category.length > 0) {
      result = result.filter(incident => filters.category.includes(incident.category));
    }
    
    if (filters.searchText) {
      const searchLower = filters.searchText.toLowerCase();
      result = result.filter(incident =>
        incident.title.toLowerCase().includes(searchLower) ||
        incident.description.toLowerCase().includes(searchLower) ||
        incident.incidentNumber.toLowerCase().includes(searchLower)
      );
    }
    
    setFilteredIncidents(result);
  }, [incidents, filters]);

  const getStatusCounts = () => {
    const counts: Record<IncidentStatus, number> = {
      [IncidentStatus.REPORTED]: 0,
      [IncidentStatus.ASSESSED]: 0,
      [IncidentStatus.RESPONDING]: 0,
      [IncidentStatus.ESCALATED]: 0,
      [IncidentStatus.RESOLVED]: 0,
      [IncidentStatus.CLOSED]: 0,
      [IncidentStatus.CANCELLED]: 0
    };
    
    incidents.forEach(incident => {
      counts[incident.status]++;
    });
    
    return counts;
  };

  return (
    <div className="space-y-6">
      <div className="bg-white rounded-lg shadow">
        <div className="px-6 py-4 border-b border-gray-200">
          <div className="flex justify-between items-center">
            <h2 className="text-xl font-semibold text-gray-800">Incident Management</h2>
            <div className="text-sm text-gray-600">
              Total: {incidents.length} | Active: {incidents.filter(i => i.status !== IncidentStatus.CLOSED && i.status !== IncidentStatus.CANCELLED).length}
            </div>
          </div>
        </div>
        
        <IncidentFilters
          filters={filters}
          onFiltersChange={setFilters}
          statusCounts={getStatusCounts()}
        />
        
        <div className="divide-y divide-gray-200">
          {filteredIncidents.length === 0 ? (
            <div className="px-6 py-12 text-center">
              <p className="text-gray-500">No incidents found matching your criteria</p>
            </div>
          ) : (
            filteredIncidents.map(incident => (
              <IncidentCard
                key={incident.id}
                incident={incident}
                onClick={() => onIncidentSelect(incident)}
                onStatusChange={onStatusChange}
              />
            ))
          )}
        </div>
      </div>
    </div>
  );
};

export default IncidentList;