import { useState } from 'react';
import { useStore } from '../store/useStore';
import { Dependency, DependencyType } from '../types';
import { Plus, Trash2, AlertTriangle, ArrowRight, X } from 'lucide-react';

const DEP_TYPES: DependencyType[] = ['technical', 'operational', 'resource'];
const DEP_COLORS = { technical: 'text-bia-primary', operational: 'text-bia-warning', resource: 'text-bia-secondary' };

export function Dependencies() {
  const { processes, dependencies, addDependency, removeDependency, getDependenciesForProcess } = useStore();
  const [showModal, setShowModal] = useState(false);
  const [form, setForm] = useState({ sourceProcessId: '', targetProcessId: '', type: 'technical' as DependencyType, criticality: 3, description: '' });

  const handleAdd = () => {
    if (form.sourceProcessId && form.targetProcessId && form.sourceProcessId !== form.targetProcessId) {
      addDependency({ ...form, id: `DEP-${Date.now()}` });
      setShowModal(false);
      setForm({ sourceProcessId: '', targetProcessId: '', type: 'technical', criticality: 3, description: '' });
    }
  };

  // Find single points of failure (processes with many downstream dependencies)
  const spofProcesses = processes.filter((p) => {
    const downstream = dependencies.filter((d) => d.targetProcessId === p.id);
    return downstream.length >= 2;
  });

  // Group dependencies by source for visualization
  const depsBySource = processes.map((p) => ({
    process: p,
    upstream: dependencies.filter((d) => d.sourceProcessId === p.id),
    downstream: dependencies.filter((d) => d.targetProcessId === p.id)
  }));

  const getProcessName = (id: string) => processes.find((p) => p.id === id)?.name || id;

  return (
    <div className="animate-fade-in space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-bia-text-primary">Dependency Analysis</h1>
          <p className="text-bia-text-secondary mt-1">Map process dependencies and identify cascading risks</p>
        </div>
        <button onClick={() => setShowModal(true)} className="glass-button-solid flex items-center gap-2">
          <Plus className="w-4 h-4" /> Add Dependency
        </button>
      </div>

      {/* SPOF Warning */}
      {spofProcesses.length > 0 && (
        <div className="glass-panel p-4 border-l-4 border-bia-critical">
          <div className="flex items-center gap-2 text-bia-critical mb-2">
            <AlertTriangle className="w-5 h-5" />
            <span className="font-semibold">Single Points of Failure Detected</span>
          </div>
          <div className="flex flex-wrap gap-2">
            {spofProcesses.map((p) => (
              <span key={p.id} className="px-2 py-1 bg-bia-critical/20 text-bia-critical rounded text-sm">{p.name}</span>
            ))}
          </div>
        </div>
      )}

      {/* Dependency Network Visualization */}
      <div className="glass-panel p-6">
        <h3 className="text-lg font-semibold text-bia-text-primary mb-4">Dependency Network</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {depsBySource.filter((d) => d.upstream.length > 0 || d.downstream.length > 0).map(({ process, upstream, downstream }) => (
            <div key={process.id} className="glass-panel p-4 space-y-3">
              <h4 className="font-semibold text-bia-text-primary">{process.name}</h4>
              {upstream.length > 0 && (
                <div>
                  <p className="text-xs text-bia-text-tertiary mb-1">Depends on:</p>
                  {upstream.map((dep) => (
                    <div key={dep.id} className="flex items-center gap-2 text-sm">
                      <ArrowRight className="w-3 h-3 text-bia-text-tertiary" />
                      <span className={DEP_COLORS[dep.type]}>{getProcessName(dep.targetProcessId)}</span>
                      <span className="text-xs text-bia-text-tertiary">({dep.type})</span>
                    </div>
                  ))}
                </div>
              )}
              {downstream.length > 0 && (
                <div>
                  <p className="text-xs text-bia-text-tertiary mb-1">Required by:</p>
                  {downstream.map((dep) => (
                    <div key={dep.id} className="flex items-center gap-2 text-sm">
                      <ArrowRight className="w-3 h-3 text-bia-success rotate-180" />
                      <span className="text-bia-success">{getProcessName(dep.sourceProcessId)}</span>
                    </div>
                  ))}
                </div>
              )}
            </div>
          ))}
        </div>
      </div>

      {/* Dependency Table */}
      <div className="glass-panel p-6">
        <h3 className="text-lg font-semibold text-bia-text-primary mb-4">All Dependencies</h3>
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-black/20">
              <tr className="text-left text-xs text-bia-text-secondary uppercase">
                <th className="p-3">Source Process</th>
                <th className="p-3">Depends On</th>
                <th className="p-3">Type</th>
                <th className="p-3">Criticality</th>
                <th className="p-3">Description</th>
                <th className="p-3">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-bia-border">
              {dependencies.map((dep) => (
                <tr key={dep.id} className="hover:bg-bia-glass-hover">
                  <td className="p-3 text-bia-text-primary">{getProcessName(dep.sourceProcessId)}</td>
                  <td className="p-3 text-bia-text-primary">{getProcessName(dep.targetProcessId)}</td>
                  <td className="p-3"><span className={`px-2 py-1 rounded text-xs ${DEP_COLORS[dep.type]}`}>{dep.type}</span></td>
                  <td className="p-3 text-bia-text-primary">{dep.criticality}/5</td>
                  <td className="p-3 text-bia-text-secondary text-sm">{dep.description}</td>
                  <td className="p-3">
                    <button onClick={() => removeDependency(dep.id)} className="p-1 hover:bg-bia-critical/20 rounded">
                      <Trash2 className="w-4 h-4 text-bia-critical" />
                    </button>
                  </td>
                </tr>
              ))}
              {dependencies.length === 0 && (
                <tr><td colSpan={6} className="p-8 text-center text-bia-text-tertiary">No dependencies defined</td></tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Add Modal */}
      {showModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm animate-fade-in">
          <div className="glass-panel p-6 w-full max-w-lg animate-scale-in">
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-xl font-semibold text-bia-text-primary">Add Dependency</h2>
              <button onClick={() => setShowModal(false)}><X className="w-5 h-5 text-bia-text-secondary" /></button>
            </div>
            <div className="space-y-4">
              <div>
                <label className="block text-sm text-bia-text-secondary mb-1">Source Process (depends on target)</label>
                <select className="glass-input w-full" value={form.sourceProcessId} onChange={(e) => setForm({ ...form, sourceProcessId: e.target.value })}>
                  <option value="">Select process...</option>
                  {processes.map((p) => <option key={p.id} value={p.id}>{p.name}</option>)}
                </select>
              </div>
              <div>
                <label className="block text-sm text-bia-text-secondary mb-1">Target Process (required by source)</label>
                <select className="glass-input w-full" value={form.targetProcessId} onChange={(e) => setForm({ ...form, targetProcessId: e.target.value })}>
                  <option value="">Select process...</option>
                  {processes.filter((p) => p.id !== form.sourceProcessId).map((p) => <option key={p.id} value={p.id}>{p.name}</option>)}
                </select>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm text-bia-text-secondary mb-1">Type</label>
                  <select className="glass-input w-full" value={form.type} onChange={(e) => setForm({ ...form, type: e.target.value as DependencyType })}>
                    {DEP_TYPES.map((t) => <option key={t} value={t}>{t}</option>)}
                  </select>
                </div>
                <div>
                  <label className="block text-sm text-bia-text-secondary mb-1">Criticality (1-5)</label>
                  <input type="number" min="1" max="5" className="glass-input w-full" value={form.criticality} onChange={(e) => setForm({ ...form, criticality: parseInt(e.target.value) })} />
                </div>
              </div>
              <div>
                <label className="block text-sm text-bia-text-secondary mb-1">Description</label>
                <textarea className="glass-input w-full h-20" value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })} />
              </div>
              <div className="flex justify-end gap-3">
                <button onClick={() => setShowModal(false)} className="glass-button">Cancel</button>
                <button onClick={handleAdd} className="glass-button-solid">Add Dependency</button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
