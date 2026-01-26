import React, { useState } from 'react';
import {
    ShieldCheck,
    Plus,
    Search,
    Filter,
    MoreVertical,
    X,
    AlertCircle,
    CheckCircle2,
    Clock,
    ArrowRight,
    Target,
    User,
    Calendar,
    Zap
} from 'lucide-react';
import { useStore } from '../store/useStore';
import { RiskTreatment as RiskTreatmentType } from '../types';

export const RiskTreatment: React.FC = () => {
    const {
        riskTreatments,
        risks,
        threats,
        addRiskTreatment,
        updateRiskTreatment,
        deleteRiskTreatment
    } = useStore();

    const [isModalOpen, setIsModalOpen] = useState(false);
    const [editingTreatment, setEditingTreatment] = useState<Partial<RiskTreatmentType> | null>(null);
    const [searchTerm, setSearchTerm] = useState('');
    const [filterStrategy, setFilterStrategy] = useState('All');

    const handleSave = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!editingTreatment) return;

        if (editingTreatment.id) {
            await updateRiskTreatment(editingTreatment.id, editingTreatment);
        } else {
            await addRiskTreatment(editingTreatment);
        }
        setIsModalOpen(false);
        setEditingTreatment(null);
    };

    const filteredTreatments = riskTreatments.filter(t => {
        const matchesSearch = t.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
            t.description.toLowerCase().includes(searchTerm.toLowerCase());
        const matchesFilter = filterStrategy === 'All' || t.strategy === filterStrategy;
        return matchesSearch && matchesFilter;
    });

    const stats = {
        total: riskTreatments.length,
        completed: riskTreatments.filter(t => t.status === 'Completed').length,
        mitigation: riskTreatments.filter(t => t.strategy === 'Mitigate').length,
        highPriority: riskTreatments.filter(t => t.priority === 'High' && t.status !== 'Completed').length
    };

    return (
        <div className="p-8 animate-in fade-in duration-500">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-8">
                <div>
                    <h1 className="text-3xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-blue-400 to-emerald-400">
                        Risk Treatment Plans
                    </h1>
                    <p className="text-slate-400 mt-1 flex items-center gap-2">
                        <ShieldCheck className="w-4 h-4 text-emerald-400" />
                        ISO 22301 Clause 8.2.3 & 8.3 — Selecting and implementing risk treatment options
                    </p>
                </div>
                <button
                    onClick={() => {
                        setEditingTreatment({
                            title: '',
                            description: '',
                            strategy: 'Mitigate',
                            priority: 'Medium',
                            status: 'Proposed',
                            actionPlan: ''
                        });
                        setIsModalOpen(true);
                    }}
                    className="flex items-center gap-2 px-6 py-3 bg-blue-600 hover:bg-blue-500 text-white rounded-xl font-bold transition-all shadow-lg shadow-blue-500/20 active:scale-95 whitespace-nowrap"
                >
                    <Plus className="w-5 h-5" />
                    Create Treatment Plan
                </button>
            </div>

            {/* Stats Board */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
                {[
                    { label: 'Active Treatments', value: stats.total, icon: Target, color: 'text-blue-400', bg: 'bg-blue-500/10' },
                    { label: 'Implementation Rate', value: `${stats.total ? Math.round((stats.completed / stats.total) * 100) : 0}%`, icon: CheckCircle2, color: 'text-emerald-400', bg: 'bg-emerald-500/10' },
                    { label: 'Mitigation Strategy', value: stats.mitigation, icon: ShieldCheck, color: 'text-indigo-400', bg: 'bg-indigo-500/10' },
                    { label: 'High Priority (Pending)', value: stats.highPriority, icon: AlertCircle, color: 'text-rose-400', bg: 'bg-rose-500/10' }
                ].map((s, i) => (
                    <div key={i} className="glass-panel p-6 border border-white/5 relative overflow-hidden group">
                        <div className={`absolute top-0 right-0 w-24 h-24 ${s.bg} rounded-full -mr-12 -mt-12 blur-3xl group-hover:blur-2xl transition-all`} />
                        <div className="flex items-center gap-4">
                            <div className={`p-3 rounded-xl ${s.bg} ${s.color}`}>
                                <s.icon className="w-6 h-6" />
                            </div>
                            <div>
                                <div className="text-2xl font-bold text-white">{s.value}</div>
                                <div className="text-xs font-medium text-slate-500 uppercase tracking-wider">{s.label}</div>
                            </div>
                        </div>
                    </div>
                ))}
            </div>

            {/* Control Bar */}
            <div className="flex flex-col md:flex-row gap-4 mb-6">
                <div className="relative flex-1">
                    <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500" />
                    <input
                        type="text"
                        placeholder="Search treatment plans, owners, or descriptions..."
                        className="w-full bg-slate-900/50 border border-white/5 rounded-xl pl-12 pr-4 py-3 text-sm text-white focus:outline-none focus:border-blue-500/50 transition-colors"
                        value={searchTerm}
                        onChange={e => setSearchTerm(e.target.value)}
                    />
                </div>
                <div className="flex gap-2">
                    {['All', 'Mitigate', 'Avoid', 'Transfer', 'Accept'].map(strategy => (
                        <button
                            key={strategy}
                            onClick={() => setFilterStrategy(strategy)}
                            className={`px-4 py-2 rounded-lg text-xs font-bold transition-all ${filterStrategy === strategy ? 'bg-blue-600 text-white shadow-lg' : 'bg-slate-800/50 text-slate-400 hover:text-white border border-white/5'}`}
                        >
                            {strategy}
                        </button>
                    ))}
                </div>
            </div>

            {/* Treatment Inventory */}
            <div className="glass-panel border border-white/5 overflow-hidden">
                <div className="overflow-x-auto">
                    <table className="w-full text-left">
                        <thead className="text-[10px] uppercase tracking-widest text-slate-500 bg-white/5">
                            <tr>
                                <th className="px-6 py-4 font-bold">Treatment Plan</th>
                                <th className="px-6 py-4 font-bold">Strategy</th>
                                <th className="px-6 py-4 font-bold">Priority</th>
                                <th className="px-6 py-4 font-bold">Linked Risk/Threat</th>
                                <th className="px-6 py-4 font-bold">Status</th>
                                <th className="px-6 py-4 font-bold text-right">Actions</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-white/5">
                            {filteredTreatments.length === 0 ? (
                                <tr>
                                    <td colSpan={6} className="px-6 py-20 text-center">
                                        <div className="flex flex-col items-center gap-3">
                                            <div className="p-4 rounded-full bg-slate-800/50 text-slate-600">
                                                <ShieldCheck className="w-8 h-8" />
                                            </div>
                                            <p className="text-slate-400 text-sm">No treatment plans identified. Select a risk to begin mitigation.</p>
                                        </div>
                                    </td>
                                </tr>
                            ) : filteredTreatments.map(t => (
                                <tr key={t.id} className="group hover:bg-white/[0.02] transition-colors">
                                    <td className="px-6 py-4">
                                        <div className="flex items-center gap-3">
                                            <div className={`p-2 rounded-lg ${t.status === 'Completed' ? 'bg-emerald-500/10 text-emerald-400' : 'bg-blue-500/10 text-blue-400'}`}>
                                                <ShieldCheck className="w-4 h-4" />
                                            </div>
                                            <div>
                                                <div className="font-bold text-white text-sm group-hover:text-blue-400 transition-colors uppercase tracking-tight">{t.title}</div>
                                                <div className="text-[10px] text-slate-500 line-clamp-1">{t.description}</div>
                                            </div>
                                        </div>
                                    </td>
                                    <td className="px-6 py-4">
                                        <span className={`px-2 py-0.5 rounded text-[10px] font-bold ${t.strategy === 'Mitigate' ? 'bg-blue-500/10 text-blue-400' :
                                            t.strategy === 'Avoid' ? 'bg-rose-500/10 text-rose-400' :
                                                t.strategy === 'Transfer' ? 'bg-amber-500/10 text-amber-400' :
                                                    'bg-slate-500/10 text-slate-400'
                                            }`}>
                                            {t.strategy}
                                        </span>
                                    </td>
                                    <td className="px-6 py-4">
                                        <span className={`px-2 py-0.5 rounded text-[10px] font-bold ${t.priority === 'High' ? 'bg-rose-500/10 text-rose-400' :
                                            t.priority === 'Medium' ? 'bg-amber-500/10 text-amber-400' :
                                                'bg-blue-500/10 text-blue-400'
                                            }`}>
                                            {t.priority}
                                        </span>
                                    </td>
                                    <td className="px-6 py-4">
                                        <div className="flex items-center gap-2 text-[10px] text-slate-400 font-medium">
                                            {t.riskId ? (
                                                <>
                                                    <AlertCircle className="w-3 h-3 text-rose-400" />
                                                    <span>{risks.find(r => r.id === t.riskId)?.title || 'Unknown Risk'}</span>
                                                </>
                                            ) : t.threatId ? (
                                                <>
                                                    <Zap className="w-3 h-3 text-amber-400" />
                                                    <span>{threats.find(th => th.id === t.threatId)?.title || 'Unknown Threat'}</span>
                                                </>
                                            ) : (
                                                <span className="flex items-center gap-2">
                                                    <Target className="w-3 h-3" />
                                                    <span>Unlinked</span>
                                                </span>
                                            )}
                                        </div>
                                    </td>
                                    <td className="px-6 py-4">
                                        <div className="flex items-center gap-2">
                                            <span className={`w-1.5 h-1.5 rounded-full ${t.status === 'Completed' ? 'bg-emerald-400' :
                                                t.status === 'In Progress' ? 'bg-blue-400 animate-pulse' :
                                                    t.status === 'Approved' ? 'bg-amber-400' :
                                                        'bg-slate-500'
                                                }`} />
                                            <span className="text-[10px] text-slate-300 font-bold uppercase">{t.status}</span>
                                        </div>
                                    </td>
                                    <td className="px-6 py-4 text-right">
                                        <div className="flex justify-end gap-2 opacity-0 group-hover:opacity-100 transition-all scale-95 group-hover:scale-100">
                                            <button
                                                onClick={() => { setEditingTreatment(t); setIsModalOpen(true); }}
                                                className="p-1.5 hover:bg-white/10 rounded-lg text-slate-400 hover:text-white"
                                            >
                                                <MoreVertical className="w-4 h-4" />
                                            </button>
                                            <button
                                                onClick={() => deleteRiskTreatment(t.id)}
                                                className="p-1.5 hover:bg-rose-500/20 rounded-lg text-slate-400 hover:text-rose-400"
                                            >
                                                <X className="w-4 h-4" />
                                            </button>
                                        </div>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </div>

            {/* Modal */}
            {isModalOpen && (
                <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
                    <div className="absolute inset-0 bg-slate-950/80 backdrop-blur-sm" onClick={() => setIsModalOpen(false)} />
                    <div className="relative glass-panel w-full max-w-2xl border border-white/10 shadow-2xl animate-in zoom-in-95 duration-200 flex flex-col max-h-[90vh] overflow-hidden">
                        <div className={`absolute top-0 left-0 w-full h-1 bg-gradient-to-r ${editingTreatment?.priority === 'High' ? 'from-rose-500 via-amber-500 to-rose-500' : 'from-blue-500 via-emerald-500 to-blue-500'}`} />

                        <div className="flex items-center justify-between p-5 border-b border-white/5 flex-shrink-0">
                            <h2 className="text-xl font-bold flex items-center gap-2">
                                <ShieldCheck className="w-5 h-5 text-emerald-400" />
                                {editingTreatment?.id ? 'Edit Treatment Plan' : 'New Risk Treatment'}
                            </h2>
                            <button onClick={() => setIsModalOpen(false)} className="text-slate-400 hover:text-white transition-colors">
                                <X className="w-6 h-6" />
                            </button>
                        </div>

                        <form onSubmit={handleSave} className="flex flex-col flex-grow overflow-hidden">
                            <div className="p-6 space-y-6 overflow-y-auto flex-grow custom-scrollbar">
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                    <div className="md:col-span-2 space-y-2">
                                        <label className="text-xs font-bold text-slate-400 uppercase tracking-widest">Plan Title</label>
                                        <input
                                            type="text"
                                            required
                                            className="w-full bg-slate-900/50 border border-white/10 rounded-xl px-4 py-2.5 text-white focus:outline-none focus:border-blue-500 transition-colors"
                                            placeholder="e.g., Implementation of Immutable Backups"
                                            value={editingTreatment?.title || ''}
                                            onChange={e => setEditingTreatment({ ...editingTreatment!, title: e.target.value })}
                                        />
                                    </div>

                                    <div className="md:col-span-2 space-y-2">
                                        <label className="text-xs font-bold text-slate-400 uppercase tracking-widest">Description</label>
                                        <textarea
                                            rows={3}
                                            className="w-full bg-slate-900/50 border border-white/10 rounded-xl px-4 py-2.5 text-white focus:outline-none focus:border-blue-500 transition-colors"
                                            placeholder="Identify specific control objectives and scope..."
                                            value={editingTreatment?.description || ''}
                                            onChange={e => setEditingTreatment({ ...editingTreatment!, description: e.target.value })}
                                        />
                                    </div>

                                    <div className="space-y-2">
                                        <label className="text-xs font-bold text-slate-400 uppercase tracking-widest">Treatment Strategy</label>
                                        <select
                                            className="w-full bg-slate-900/50 border border-white/10 rounded-xl px-4 py-2.5 text-white focus:outline-none focus:border-blue-500 transition-colors"
                                            value={editingTreatment?.strategy}
                                            onChange={e => setEditingTreatment({ ...editingTreatment!, strategy: e.target.value as any })}
                                        >
                                            <option value="Mitigate">Mitigate (Reduce Likelihood/Impact)</option>
                                            <option value="Avoid">Avoid (Eliminate Source)</option>
                                            <option value="Transfer">Transfer (Insurance/Third-party)</option>
                                            <option value="Accept">Accept (Retention)</option>
                                        </select>
                                    </div>

                                    <div className="space-y-2">
                                        <label className="text-xs font-bold text-slate-400 uppercase tracking-widest">Priority</label>
                                        <select
                                            className="w-full bg-slate-900/50 border border-white/10 rounded-xl px-4 py-2.5 text-white focus:outline-none focus:border-blue-500 transition-colors"
                                            value={editingTreatment?.priority}
                                            onChange={e => setEditingTreatment({ ...editingTreatment!, priority: e.target.value as any })}
                                        >
                                            <option value="High">High</option>
                                            <option value="Medium">Medium</option>
                                            <option value="Low">Low</option>
                                        </select>
                                    </div>

                                    <div className="space-y-2">
                                        <label className="text-xs font-bold text-slate-400 uppercase tracking-widest">Phase/Status</label>
                                        <select
                                            className="w-full bg-slate-900/50 border border-white/10 rounded-xl px-4 py-2.5 text-white focus:outline-none focus:border-blue-500 transition-colors"
                                            value={editingTreatment?.status}
                                            onChange={e => setEditingTreatment({ ...editingTreatment!, status: e.target.value as any })}
                                        >
                                            <option value="Proposed">Proposed</option>
                                            <option value="Approved">Approved</option>
                                            <option value="In Progress">In Progress</option>
                                            <option value="Completed">Completed</option>
                                        </select>
                                    </div>

                                    <div className="space-y-2">
                                        <label className="text-xs font-bold text-slate-400 uppercase tracking-widest">Target Date</label>
                                        <input
                                            type="date"
                                            className="w-full bg-slate-900/50 border border-white/10 rounded-xl px-4 py-2.5 text-white focus:outline-none focus:border-blue-500 transition-colors [color-scheme:dark]"
                                            value={editingTreatment?.targetDate?.split('T')[0] || ''}
                                            onChange={e => setEditingTreatment({ ...editingTreatment!, targetDate: e.target.value })}
                                        />
                                    </div>

                                    <div className="md:col-span-2 space-y-2">
                                        <label className="text-xs font-bold text-slate-400 uppercase tracking-widest">Link to Risk or Threat</label>
                                        <select
                                            className="w-full bg-slate-900/50 border border-white/10 rounded-xl px-4 py-2.5 text-white focus:outline-none focus:border-blue-500 transition-colors"
                                            value={editingTreatment?.riskId || editingTreatment?.threatId || ''}
                                            onChange={e => {
                                                const val = e.target.value;
                                                const isRisk = risks.find(r => r.id === val);
                                                if (isRisk) {
                                                    setEditingTreatment({ ...editingTreatment!, riskId: val, threatId: undefined });
                                                } else {
                                                    setEditingTreatment({ ...editingTreatment!, threatId: val, riskId: undefined });
                                                }
                                            }}
                                        >
                                            <option value="">-- No link --</option>
                                            <optgroup label="Risks">
                                                {risks.map(r => <option key={r.id} value={r.id}>{r.title}</option>)}
                                            </optgroup>
                                            <optgroup label="Threats">
                                                {threats.map(th => <option key={th.id} value={th.id}>{th.title}</option>)}
                                            </optgroup>
                                        </select>
                                    </div>

                                    <div className="md:col-span-2 space-y-2">
                                        <label className="text-xs font-bold text-slate-400 uppercase tracking-widest">Action Plan Implementation</label>
                                        <textarea
                                            rows={3}
                                            className="w-full bg-slate-900/50 border border-white/10 rounded-xl px-4 py-2.5 text-white focus:outline-none focus:border-blue-500 transition-colors"
                                            placeholder="Step-by-step implementation guide..."
                                            value={editingTreatment?.actionPlan || ''}
                                            onChange={e => setEditingTreatment({ ...editingTreatment!, actionPlan: e.target.value })}
                                        />
                                    </div>

                                    <div className="space-y-2">
                                        <label className="text-xs font-bold text-slate-400 uppercase tracking-widest">Current Owner</label>
                                        <div className="relative">
                                            <User className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500" />
                                            <input
                                                type="text"
                                                className="w-full bg-slate-900/50 border border-white/10 rounded-xl pl-10 pr-4 py-2.5 text-white focus:outline-none focus:border-blue-500 transition-colors"
                                                value={editingTreatment?.owner || ''}
                                                onChange={e => setEditingTreatment({ ...editingTreatment!, owner: e.target.value })}
                                            />
                                        </div>
                                    </div>

                                    <div className="space-y-2">
                                        <label className="text-xs font-bold text-slate-400 uppercase tracking-widest">Residual Risk (Estimate)</label>
                                        <select
                                            className="w-full bg-slate-900/50 border border-white/10 rounded-xl px-4 py-2.5 text-white focus:outline-none focus:border-blue-500 transition-colors"
                                            value={editingTreatment?.residualRisk || 'Medium'}
                                            onChange={e => setEditingTreatment({ ...editingTreatment!, residualRisk: e.target.value })}
                                        >
                                            <option value="Low">Low (Safe)</option>
                                            <option value="Medium">Medium (Manageable)</option>
                                            <option value="High">High (Needs further review)</option>
                                        </select>
                                    </div>
                                </div>
                            </div>

                            <div className="flex justify-end gap-3 p-6 border-t border-white/5 flex-shrink-0 bg-white/[0.02]">
                                <button
                                    type="button"
                                    onClick={() => setIsModalOpen(false)}
                                    className="px-6 py-2.5 rounded-xl text-slate-400 hover:bg-white/5 transition-all font-medium"
                                >
                                    Cancel
                                </button>
                                <button
                                    type="submit"
                                    className="px-8 md:px-10 py-2.5 rounded-xl bg-gradient-to-r from-blue-600 to-indigo-600 text-white font-bold hover:shadow-lg hover:shadow-blue-500/30 transition-all active:scale-95"
                                >
                                    Save Treatment Plan
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
};
