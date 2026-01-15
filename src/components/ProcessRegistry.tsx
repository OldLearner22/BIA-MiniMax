import { useState } from 'react';
import { useStore } from '../store/useStore';
import { Process, Criticality, ProcessStatus } from '../types';
import { Plus, Pencil, Trash2, Search, X } from 'lucide-react';

const DEPARTMENTS = ['Finance', 'Operations', 'IT', 'HR', 'Supply Chain', 'Legal', 'Marketing'];
const CRITICALITY_OPTIONS: Criticality[] = ['critical', 'high', 'medium', 'low', 'minimal'];
const STATUS_OPTIONS: ProcessStatus[] = ['draft', 'in-review', 'approved'];

interface ModalProps {
  isOpen: boolean;
  onClose: () => void;
  process?: Process;
}

function ProcessModal({ isOpen, onClose, process }: ModalProps) {
  const { addProcess, updateProcess } = useStore();
  const [form, setForm] = useState<Partial<Process>>(process || {
    name: '', owner: '', department: 'IT', description: '', criticality: 'medium', status: 'draft'
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (process) {
      updateProcess(process.id, form);
    } else {
      const newProcess: Process = {
        ...form as Process,
        id: `PROC-${String(Date.now()).slice(-6)}`,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      };
      addProcess(newProcess);
    }
    onClose();
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm animate-fade-in">
      <div className="glass-panel p-6 w-full max-w-lg animate-scale-in">
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-xl font-semibold text-bia-text-primary">{process ? 'Edit Process' : 'Add Process'}</h2>
          <button onClick={onClose} className="text-bia-text-secondary hover:text-bia-text-primary"><X className="w-5 h-5" /></button>
        </div>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm text-bia-text-secondary mb-1">Process Name</label>
            <input type="text" required className="glass-input w-full" value={form.name || ''} onChange={(e) => setForm({ ...form, name: e.target.value })} />
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm text-bia-text-secondary mb-1">Owner</label>
              <input type="text" required className="glass-input w-full" value={form.owner || ''} onChange={(e) => setForm({ ...form, owner: e.target.value })} />
            </div>
            <div>
              <label className="block text-sm text-bia-text-secondary mb-1">Department</label>
              <select className="glass-input w-full" value={form.department || ''} onChange={(e) => setForm({ ...form, department: e.target.value })}>
                {DEPARTMENTS.map(d => <option key={d} value={d}>{d}</option>)}
              </select>
            </div>
          </div>
          <div>
            <label className="block text-sm text-bia-text-secondary mb-1">Description</label>
            <textarea className="glass-input w-full h-24 resize-none" value={form.description || ''} onChange={(e) => setForm({ ...form, description: e.target.value })} />
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm text-bia-text-secondary mb-1">Criticality</label>
              <select className="glass-input w-full" value={form.criticality || 'medium'} onChange={(e) => setForm({ ...form, criticality: e.target.value as Criticality })}>
                {CRITICALITY_OPTIONS.map(c => <option key={c} value={c}>{c.charAt(0).toUpperCase() + c.slice(1)}</option>)}
              </select>
            </div>
            <div>
              <label className="block text-sm text-bia-text-secondary mb-1">Status</label>
              <select className="glass-input w-full" value={form.status || 'draft'} onChange={(e) => setForm({ ...form, status: e.target.value as ProcessStatus })}>
                {STATUS_OPTIONS.map(s => <option key={s} value={s}>{s.replace('-', ' ')}</option>)}
              </select>
            </div>
          </div>
          <div className="flex justify-end gap-3 mt-6">
            <button type="button" onClick={onClose} className="glass-button">Cancel</button>
            <button type="submit" className="glass-button-solid">Save Process</button>
          </div>
        </form>
      </div>
    </div>
  );
}

export function ProcessRegistry() {
  const { processes, deleteProcess, calculateRiskScore, setCurrentView, setSelectedProcessId } = useStore();
  const [search, setSearch] = useState('');
  const [filterCriticality, setFilterCriticality] = useState<string>('all');
  const [modalOpen, setModalOpen] = useState(false);
  const [editingProcess, setEditingProcess] = useState<Process | undefined>();

  const filtered = processes.filter(p => {
    const matchSearch = p.name.toLowerCase().includes(search.toLowerCase()) || p.department.toLowerCase().includes(search.toLowerCase());
    const matchCrit = filterCriticality === 'all' || p.criticality === filterCriticality;
    return matchSearch && matchCrit;
  });

  const handleEdit = (p: Process) => { setEditingProcess(p); setModalOpen(true); };
  const handleAdd = () => { setEditingProcess(undefined); setModalOpen(true); };
  const handleAssess = (id: string) => { setSelectedProcessId(id); setCurrentView('assessment'); };

  return (
    <div className="animate-fade-in space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-bia-text-primary">Process Registry</h1>
          <p className="text-bia-text-secondary mt-1">Manage business processes and their assessments</p>
        </div>
        <button onClick={handleAdd} className="glass-button-solid flex items-center gap-2">
          <Plus className="w-4 h-4" /> Add Process
        </button>
      </div>

      {/* Filters */}
      <div className="glass-panel p-4 flex flex-wrap gap-4 items-center">
        <div className="relative flex-1 min-w-[200px]">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-bia-text-tertiary" />
          <input type="text" placeholder="Search processes..." className="glass-input w-full pl-10" value={search} onChange={(e) => setSearch(e.target.value)} />
        </div>
        <select className="glass-input" value={filterCriticality} onChange={(e) => setFilterCriticality(e.target.value)}>
          <option value="all">All Criticality</option>
          {CRITICALITY_OPTIONS.map(c => <option key={c} value={c}>{c.charAt(0).toUpperCase() + c.slice(1)}</option>)}
        </select>
      </div>

      {/* Table */}
      <div className="glass-panel overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-black/20">
              <tr className="text-left text-xs text-bia-text-secondary uppercase tracking-wider">
                <th className="p-4">ID</th>
                <th className="p-4">Process Name</th>
                <th className="p-4">Owner</th>
                <th className="p-4">Department</th>
                <th className="p-4">Criticality</th>
                <th className="p-4">Risk Score</th>
                <th className="p-4">Status</th>
                <th className="p-4">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[rgba(255,255,255,0.05)]">
              {filtered.map((proc) => (
                <tr key={proc.id} className="hover:bg-[rgba(255,255,255,0.02)] transition-colors">
                  <td className="p-4 text-bia-text-tertiary font-mono text-sm">{proc.id}</td>
                  <td className="p-4 text-bia-text-primary font-medium">{proc.name}</td>
                  <td className="p-4 text-bia-text-secondary">{proc.owner}</td>
                  <td className="p-4 text-bia-text-secondary">{proc.department}</td>
                  <td className="p-4">
                    <span className={`px-2 py-1 rounded-full text-xs font-medium criticality-${proc.criticality}`}>
                      {proc.criticality}
                    </span>
                  </td>
                  <td className="p-4 text-bia-text-primary font-medium">{calculateRiskScore(proc.id)}</td>
                  <td className="p-4">
                    <span className={`px-2 py-1 rounded text-xs ${proc.status === 'approved' ? 'bg-bia-success/20 text-bia-success' : proc.status === 'in-review' ? 'bg-bia-warning/20 text-bia-warning' : 'bg-bia-text-tertiary/20 text-bia-text-tertiary'}`}>
                      {proc.status.replace('-', ' ')}
                    </span>
                  </td>
                  <td className="p-4">
                    <div className="flex items-center gap-2">
                      <button onClick={() => handleAssess(proc.id)} className="text-bia-primary hover:text-bia-primary/80 text-sm">Assess</button>
                      <button onClick={() => handleEdit(proc)} className="p-1.5 hover:bg-bia-glass-hover rounded"><Pencil className="w-4 h-4 text-bia-text-secondary" /></button>
                      <button onClick={() => deleteProcess(proc.id)} className="p-1.5 hover:bg-bia-critical/20 rounded"><Trash2 className="w-4 h-4 text-bia-critical" /></button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
          {filtered.length === 0 && (
            <div className="text-center py-12 text-bia-text-secondary">No processes found</div>
          )}
        </div>
      </div>

      <ProcessModal isOpen={modalOpen} onClose={() => setModalOpen(false)} process={editingProcess} />
    </div>
  );
}
