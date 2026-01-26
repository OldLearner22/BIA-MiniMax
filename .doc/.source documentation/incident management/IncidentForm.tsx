// frontend/src/components/incident/IncidentForm.tsx
import React, { useState } from 'react';
import {
  Incident,
  IncidentCategory,
  IncidentSeverity,
  BIAImpactArea
} from '../../../shared/types/incident.types';

interface IncidentFormProps {
  initialData?: Partial<Incident>;
  onSubmit: (data: Partial<Incident>) => Promise<void>;
  onCancel: () => void;
}

const IncidentForm: React.FC<IncidentFormProps> = ({ initialData, onSubmit, onCancel }) => {
  const [formData, setFormData] = useState<Partial<Incident>>({
    title: '',
    description: '',
    category: IncidentCategory.OTHER,
    severity: IncidentSeverity.MEDIUM,
    impactAreas: [],
    businessImpact: '',
    affectedProcesses: [],
    affectedLocations: [],
    affectedSystems: [],
    initialResponseActions: '',
    ...initialData
  });

  const [errors, setErrors] = useState<Record<string, string>>({});

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    // Validation
    const validationErrors: Record<string, string> = {};
    if (!formData.title?.trim()) validationErrors.title = 'Title is required';
    if (!formData.description?.trim()) validationErrors.description = 'Description is required';
    if (!formData.businessImpact?.trim()) validationErrors.businessImpact = 'Business impact is required';
    
    if (Object.keys(validationErrors).length > 0) {
      setErrors(validationErrors);
      return;
    }
    
    try {
      await onSubmit(formData);
    } catch (error) {
      console.error('Failed to submit incident:', error);
    }
  };

  const handleImpactAreaToggle = (area: BIAImpactArea) => {
    setFormData(prev => ({
      ...prev,
      impactAreas: prev.impactAreas?.includes(area)
        ? prev.impactAreas.filter(a => a !== area)
        : [...(prev.impactAreas || []), area]
    }));
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Basic Information */}
        <div className="md:col-span-2">
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Title *
          </label>
          <input
            type="text"
            value={formData.title}
            onChange={(e) => setFormData({ ...formData, title: e.target.value })}
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            placeholder="Brief description of the incident"
          />
          {errors.title && <p className="text-red-500 text-sm mt-1">{errors.title}</p>}
        </div>

        <div className="md:col-span-2">
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Description *
          </label>
          <textarea
            value={formData.description}
            onChange={(e) => setFormData({ ...formData, description: e.target.value })}
            rows={4}
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            placeholder="Detailed description of what happened"
          />
          {errors.description && <p className="text-red-500 text-sm mt-1">{errors.description}</p>}
        </div>

        {/* Categorization */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Category *
          </label>
          <select
            value={formData.category}
            onChange={(e) => setFormData({ ...formData, category: e.target.value as IncidentCategory })}
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            {Object.values(IncidentCategory).map(category => (
              <option key={category} value={category}>
                {category.replace('_', ' ').toLowerCase()}
              </option>
            ))}
          </select>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Severity *
          </label>
          <select
            value={formData.severity}
            onChange={(e) => setFormData({ ...formData, severity: e.target.value as IncidentSeverity })}
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            {Object.values(IncidentSeverity).map(severity => (
              <option key={severity} value={severity}>
                {severity}
              </option>
            ))}
          </select>
        </div>

        {/* Business Impact */}
        <div className="md:col-span-2">
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Business Impact Areas *
          </label>
          <div className="grid grid-cols-2 md:grid-cols-3 gap-2">
            {Object.values(BIAImpactArea).map(area => (
              <label key={area} className="flex items-center space-x-2">
                <input
                  type="checkbox"
                  checked={formData.impactAreas?.includes(area)}
                  onChange={() => handleImpactAreaToggle(area)}
                  className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                />
                <span className="text-sm text-gray-700">{area}</span>
              </label>
            ))}
          </div>
        </div>

        <div className="md:col-span-2">
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Business Impact Description *
          </label>
          <textarea
            value={formData.businessImpact}
            onChange={(e) => setFormData({ ...formData, businessImpact: e.target.value })}
            rows={3}
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            placeholder="Describe the impact on business operations"
          />
          {errors.businessImpact && <p className="text-red-500 text-sm mt-1">{errors.businessImpact}</p>}
        </div>

        {/* Affected Items */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Affected Processes
          </label>
          <input
            type="text"
            value={formData.affectedProcesses?.join(', ')}
            onChange={(e) => setFormData({ 
              ...formData, 
              affectedProcesses: e.target.value.split(',').map(s => s.trim()).filter(Boolean)
            })}
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            placeholder="Process1, Process2, ..."
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Initial Response Actions
          </label>
          <textarea
            value={formData.initialResponseActions}
            onChange={(e) => setFormData({ ...formData, initialResponseActions: e.target.value })}
            rows={3}
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            placeholder="Immediate actions taken to respond"
          />
        </div>
      </div>

      {/* Form Actions */}
      <div className="flex justify-end space-x-4 pt-6 border-t">
        <button
          type="button"
          onClick={onCancel}
          className="px-4 py-2 text-sm font-medium text-gray-700 bg-gray-100 hover:bg-gray-200 rounded-md focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-gray-500"
        >
          Cancel
        </button>
        <button
          type="submit"
          className="px-4 py-2 text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 rounded-md focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
        >
          {initialData?.id ? 'Update Incident' : 'Create Incident'}
        </button>
      </div>
    </form>
  );
};

export default IncidentForm;