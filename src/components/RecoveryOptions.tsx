import React, { useState } from 'react';
import { useStore } from '../store/useStore';
import { RecoveryOption } from '../types';
import {
  Clock,
  Shield,
  DollarSign,
  Plus,
  Edit,
  Trash2,
  X,
  Save,
} from 'lucide-react';

const TIER_INFO = {
  immediate: { label: 'Immediate', range: '0-1 hour', color: 'border-red-500 bg-red-500/10' },
  rapid: { label: 'Rapid', range: '1-4 hours', color: 'border-orange-500 bg-orange-500/10' },
  standard: { label: 'Standard', range: '4-24 hours', color: 'border-blue-500 bg-blue-500/10' },
  extended: { label: 'Extended', range: '24+ hours', color: 'border-emerald-500 bg-emerald-500/10' },
};

export default function RecoveryOptions() {
  const {
    recoveryOptions,
    processes,
    addRecoveryOption,
    updateRecoveryOption,
    deleteRecoveryOption,
  } = useStore();

  const [selectedTier, setSelectedTier] = useState<string>('all');
  const [showModal, setShowModal] = useState(false);
  const [editingOption, setEditingOption] = useState<RecoveryOption | null>(null);
  const [formData, setFormData] = useState<Partial<RecoveryOption>>({
    strategyType: 'response',
    tier: 'rapid',
    technologyType: 'cloud',
    facilityType: 'primary',
    testingStatus: 'not-tested',
    status: 'draft',
    readinessScore: 0,
    recoveryCapacity: 100,
    implementationCost: 0,
    operationalCost: 0,
    rtoValue: 4,
    rtoUnit: 'hours',
    rpoValue: 1,
    rpoUnit: 'hours',
  });

  const filteredOptions =
    selectedTier === 'all'
      ? (recoveryOptions || [])
      : (recoveryOptions || []).filter((o) => o.tier === selectedTier);

  const avgReadiness = recoveryOptions ? Math.round(
    recoveryOptions.reduce((acc, o) => acc + o.readinessScore, 0) / (recoveryOptions.length || 1)
  ) : 0;

  const handleSave = async () => {
    if (!formData.title || !formData.description || !formData.processId) {
      alert('Please fill in all required fields');
      return;
    }

    try {
      if (editingOption) {
        await updateRecoveryOption(editingOption.id, formData);
      } else {
        await addRecoveryOption({
          ...formData,
          createdBy: 'current-user',
        } as Partial<RecoveryOption>);
      }
      setShowModal(false);
      setEditingOption(null);
      setFormData({
        strategyType: 'response',
        tier: 'rapid',
        technologyType: 'cloud',
        facilityType: 'primary',
        testingStatus: 'not-tested',
        status: 'draft',
        readinessScore: 0,
        recoveryCapacity: 100,
        implementationCost: 0,
        operationalCost: 0,
        rtoValue: 4,
        rtoUnit: 'hours',
        rpoValue: 1,
        rpoUnit: 'hours',
      });
    } catch (error) {
      console.error('Failed to save recovery option', error);
      alert('Failed to save recovery option');
    }
  };

  const handleEdit = (option: RecoveryOption) => {
    setEditingOption(option);
    setFormData(option);
    setShowModal(true);
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Are you sure you want to delete this recovery option?')) return;
    try {
      await deleteRecoveryOption(id);
    } catch (error) {
      console.error('Failed to delete recovery option', error);
      alert('Failed to delete recovery option');
    }
  };

  return (
    <div className="space-y-8 animate-fade-in">
      {/* Hero Section */}
      <div className="glass-panel p-8">
        <h1 className="text-3xl font-bold text-bia-text-primary mb-6">Recovery Options</h1>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="text-center">
            <div className="text-4xl font-bold text-strategy-gold">{recoveryOptions?.length || 0}</div>
            <div className="text-sm text-bia-text-secondary">Total Options</div>
          </div>
          <div className="text-center">
            <div className="text-4xl font-bold text-operational-emerald">{avgReadiness}%</div>
            <div className="text-sm text-bia-text-secondary">Avg Readiness</div>
          </div>
          <div className="text-center">
            <div className="text-4xl font-bold text-tactical-azure">
              {recoveryOptions && recoveryOptions.length > 0
                ? Math.round(
                    recoveryOptions.reduce((acc, o) => acc + o.rtoValue, 0) /
                      recoveryOptions.length
                  )
                : 0}
              h
            </div>
            <div className="text-sm text-bia-text-secondary">Avg RTO</div>
          </div>
        </div>
      </div>

      {/* Recovery Timeline */}
      <div className="glass-panel p-8">
        <h2 className="text-xl font-bold mb-4">Recovery Timeline</h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {Object.entries(TIER_INFO).map(([tier, info]) => (
            <div
              key={tier}
              className={`p-4 rounded-lg border-2 cursor-pointer transition ${info.color} ${
                selectedTier === tier ? 'ring-2 ring-offset-2 ring-strategy-gold' : ''
              }`}
              onClick={() => setSelectedTier(tier)}>
              <div className="font-bold">{info.label}</div>
              <div className="text-xs mt-1 text-bia-text-secondary">{info.range}</div>
              <div className="text-2xl font-bold mt-2">
                {(recoveryOptions || []).filter((o) => o.tier === tier).length}
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Filter & Add Button */}
      <div className="flex justify-between items-center">
        <div className="flex gap-2">
          <button
            onClick={() => setSelectedTier('all')}
            className={`px-4 py-2 rounded-lg transition ${
              selectedTier === 'all' ? 'bg-strategy-gold text-black' : 'bg-gray-700 hover:bg-gray-600'
            }`}>
            All
          </button>
        </div>
        <button
          onClick={() => {
            setEditingOption(null);
            setFormData({
              tier: 'rapid',
              technologyType: 'cloud',
              facilityType: 'primary',
              testingStatus: 'not-tested',
              status: 'draft',
              readinessScore: 0,
              implementationCost: 0,
              operationalCost: 0,
              rtoValue: 4,
              rtoUnit: 'hours',
              rpoValue: 1,
              rpoUnit: 'hours',
            });
            setShowModal(true);
          }}
          className="btn-primary flex items-center gap-2">
          <Plus className="w-4 h-4" /> Add Recovery Option
        </button>
      </div>

      {/* Options Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {filteredOptions.map((option) => (
          <div
            key={option.id}
            className={`glass-panel p-6 border-l-4 ${
              TIER_INFO[option.tier as keyof typeof TIER_INFO]?.color || ''
            }`}>
            <div className="flex justify-between items-start mb-4">
              <div className="flex-1">
                <h3 className="text-lg font-bold text-bia-text-primary">{option.title}</h3>
                <p className="text-sm text-bia-text-secondary mt-1">{option.description}</p>
                <div className="flex gap-2 mt-2">
                  <span className="inline-block px-2 py-1 rounded text-xs font-semibold bg-strategy-gold/20 text-strategy-gold capitalize">
                    {option.strategyType}
                  </span>
                  <span className="inline-block px-2 py-1 rounded text-xs font-semibold bg-blue-500/20 text-blue-400">
                    {option.recoveryCapacity}% Capacity
                  </span>
                </div>
              </div>
              <div className="flex gap-2">
                <button
                  onClick={() => handleEdit(option)}
                  className="p-2 hover:bg-gray-700 rounded transition">
                  <Edit className="w-4 h-4 text-blue-400" />
                </button>
                <button
                  onClick={() => handleDelete(option.id)}
                  className="p-2 hover:bg-gray-700 rounded transition">
                  <Trash2 className="w-4 h-4 text-red-400" />
                </button>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-3 text-sm">
              <div className="flex items-center gap-2">
                <Clock className="w-4 h-4 text-blue-400" />
                <span>RTO: {option.rtoValue}{option.rtoUnit.charAt(0)}</span>
              </div>
              <div className="flex items-center gap-2">
                <Clock className="w-4 h-4 text-green-400" />
                <span>RPO: {option.rpoValue}{option.rpoUnit.charAt(0)}</span>
              </div>
              <div className="flex items-center gap-2">
                <DollarSign className="w-4 h-4 text-yellow-400" />
                <span>${(option.implementationCost / 1000).toFixed(0)}k</span>
              </div>
              <div className="flex items-center gap-2">
                <Shield className="w-4 h-4 text-emerald-400" />
                <span>{option.readinessScore}% Ready</span>
              </div>
            </div>

            <div className="mt-4 pt-4 border-t border-gray-700">
              <div className="inline-block px-2 py-1 rounded text-xs font-bold bg-gray-700">
                {option.testingStatus}
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Modal */}
      {showModal && (
        <div className="fixed inset-0 bg-black/75 flex items-center justify-center z-50 p-4">
          <div className="glass-panel p-8 max-w-2xl w-full max-h-[90vh] overflow-y-auto">
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-2xl font-bold">
                {editingOption ? 'Edit Recovery Option' : 'New Recovery Option'}
              </h2>
              <button onClick={() => setShowModal(false)} className="p-1 hover:bg-gray-700 rounded">
                <X className="w-6 h-6" />
              </button>
            </div>

            <form className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium mb-2">Title *</label>
                  <input
                    type="text"
                    value={formData.title || ''}
                    onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                    className="w-full px-4 py-2 bg-gray-800 border border-gray-700 rounded focus:outline-none focus:border-strategy-gold"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-2">Process *</label>
                  <select
                    value={formData.processId || ''}
                    onChange={(e) => setFormData({ ...formData, processId: e.target.value })}
                    className="w-full px-4 py-2 bg-gray-800 border border-gray-700 rounded focus:outline-none focus:border-strategy-gold">
                    <option value="">Select a process</option>
                    {processes.map((p) => (
                      <option key={p.id} value={p.id}>
                        {p.name}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium mb-2">Description *</label>
                <textarea
                  value={formData.description || ''}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  rows={3}
                  className="w-full px-4 py-2 bg-gray-800 border border-gray-700 rounded focus:outline-none focus:border-strategy-gold"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium mb-2">Strategy Type *</label>
                  <select
                    value={formData.strategyType || 'response'}
                    onChange={(e) => setFormData({ ...formData, strategyType: e.target.value as any })}
                    className="w-full px-4 py-2 bg-gray-800 border border-gray-700 rounded focus:outline-none focus:border-strategy-gold">
                    <option value="prevention">Prevention</option>
                    <option value="response">Response</option>
                    <option value="recovery">Recovery</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium mb-2">Recovery Capacity (%)</label>
                  <input
                    type="number"
                    min="0"
                    max="100"
                    value={formData.recoveryCapacity || 100}
                    onChange={(e) => setFormData({ ...formData, recoveryCapacity: parseInt(e.target.value) })}
                    className="w-full px-4 py-2 bg-gray-800 border border-gray-700 rounded focus:outline-none focus:border-strategy-gold"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium mb-2">Recovery Tier</label>
                  <select
                    value={formData.tier || 'rapid'}
                    onChange={(e) => setFormData({ ...formData, tier: e.target.value as any })}
                    className="w-full px-4 py-2 bg-gray-800 border border-gray-700 rounded focus:outline-none focus:border-strategy-gold">
                    <option value="immediate">Immediate (0-1h)</option>
                    <option value="rapid">Rapid (1-4h)</option>
                    <option value="standard">Standard (4-24h)</option>
                    <option value="extended">Extended (24h+)</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium mb-2">Readiness Score (0-100)</label>
                  <input
                    type="number"
                    min="0"
                    max="100"
                    value={formData.readinessScore || 0}
                    onChange={(e) => setFormData({ ...formData, readinessScore: parseInt(e.target.value) })}
                    className="w-full px-4 py-2 bg-gray-800 border border-gray-700 rounded focus:outline-none focus:border-strategy-gold"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium mb-2">Implementation Cost ($)</label>
                  <input
                    type="number"
                    value={formData.implementationCost || 0}
                    onChange={(e) => setFormData({ ...formData, implementationCost: parseFloat(e.target.value) })}
                    className="w-full px-4 py-2 bg-gray-800 border border-gray-700 rounded focus:outline-none focus:border-strategy-gold"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-2">Operational Cost (Annual $)</label>
                  <input
                    type="number"
                    value={formData.operationalCost || 0}
                    onChange={(e) => setFormData({ ...formData, operationalCost: parseFloat(e.target.value) })}
                    className="w-full px-4 py-2 bg-gray-800 border border-gray-700 rounded focus:outline-none focus:border-strategy-gold"
                  />
                </div>
              </div>

              <div className="flex gap-4">
                <button
                  type="button"
                  onClick={handleSave}
                  className="btn-primary flex items-center gap-2">
                  <Save className="w-4 h-4" /> Save
                </button>
                <button
                  type="button"
                  onClick={() => setShowModal(false)}
                  className="btn-secondary flex items-center gap-2">
                  <X className="w-4 h-4" /> Cancel
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
