import React, { useState, useMemo } from 'react';
import { useStore } from '../store/useStore';
import {
    Lightbulb,
    Target,
    TrendingUp,
    AlertTriangle,
    CheckCircle2,
    Clock,
    Plus,
    Search,
    Filter,
    ArrowUpRight,
    ArrowDownRight,
    MoreVertical,
    X,
    Zap,
    ShieldCheck,
    Flag,
    Info
} from 'lucide-react';
import { StrategicPlanning as StrategicItem } from '../types';

export function StrategicPlanning() {
    const { strategicItems, addStrategicItem, updateStrategicItem, deleteStrategicItem } = useStore();
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [editingItem, setEditingItem] = useState<Partial<StrategicItem> | null>(null);
    const [searchTerm, setSearchTerm] = useState('');
    const [typeFilter, setTypeFilter] = useState<'all' | 'Risk' | 'Opportunity'>('all');

    const stats = useMemo(() => {
        const total = strategicItems.length;
        const opportunities = strategicItems.filter(i => i.type === 'Opportunity').length;
        const risks = strategicItems.filter(i => i.type === 'Risk').length;
        const highPriority = strategicItems.filter(i => i.priority === 'High' && i.status !== 'Completed').length;
        return { total, opportunities, risks, highPriority };
    }, [strategicItems]);

    const filteredItems = strategicItems.filter(i => {
        const matchesSearch = i.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
            i.description.toLowerCase().includes(searchTerm.toLowerCase());
        const matchesType = typeFilter === 'all' || i.type === typeFilter;
        return matchesSearch && matchesType;
    });

    const handleSave = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!editingItem?.title) return;

        if (editingItem.id) {
            await updateStrategicItem(editingItem.id, editingItem);
        } else {
            await addStrategicItem(editingItem);
        }
        setIsModalOpen(false);
        setEditingItem(null);
    };

    const swotCategories = [
        { id: 'Strengths', title: 'Internal Strengths', color: 'text-emerald-400', bg: 'bg-emerald-400/10' },
        { id: 'Weaknesses', title: 'Internal Weaknesses', color: 'text-rose-400', bg: 'bg-rose-400/10' },
        { id: 'Opportunities', title: 'External Opportunities', color: 'text-blue-400', bg: 'bg-blue-400/10' },
        { id: 'Threats', title: 'External Threats', color: 'text-amber-400', bg: 'bg-amber-400/10' }
    ];

    return (
        <div className="space-y-8 animate-in fade-in duration-700">
            {/* Header */}
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-3xl font-bold flex items-center gap-3 bg-gradient-to-r from-white to-white/60 bg-clip-text text-transparent">
                        <Target className="w-8 h-8 text-blue-500" />
                        ISO 22301 Context & Planning
                    </h1>
                    <p className="text-slate-400 mt-1">Clause 6.1: Actions to address risks and opportunities for BCMS outcomes</p>
                </div>
                <button
                    onClick={() => {
                        setEditingItem({
                            type: 'Opportunity',
                            title: '',
                            description: '',
                            source: 'Context Review',
                            impact: '',
                            actionPlan: '',
                            priority: 'Medium',
                            status: 'Open'
                        });
                        setIsModalOpen(true);
                    }}
                    className="premium-btn px-6 py-2.5 rounded-xl font-bold flex items-center gap-2 bg-blue-600 text-white hover:bg-blue-500 shadow-lg shadow-blue-600/20"
                >
                    <Plus className="w-4 h-4" />
                    Add Strategic Item
                </button>
            </div>

            {/* Stats Cards */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
                {[
                    { label: 'Total Items', value: stats.total, icon: Zap, color: 'text-indigo-400', bg: 'bg-indigo-400/10' },
                    { label: 'Opportunities', value: stats.opportunities, icon: TrendingUp, color: 'text-emerald-400', bg: 'bg-emerald-400/10' },
                    { label: 'Strategic Risks', value: stats.risks, icon: AlertTriangle, color: 'text-rose-400', bg: 'bg-rose-400/10' },
                    { label: 'Active High Priority', value: stats.highPriority, icon: Flag, color: 'text-amber-400', bg: 'bg-amber-400/10' },
                ].map((stat, i) => (
                    <div key={i} className="glass-panel p-6 border border-white/5 relative overflow-hidden group hover:bg-white/[0.03] transition-all">
                        <div className={`absolute top-0 right-0 w-24 h-24 ${stat.bg} blur-3xl opacity-20 -mr-8 -mt-8 group-hover:opacity-40 transition-opacity`} />
                        <div className="flex justify-between items-start relative z-10">
                            <div>
                                <p className="text-xs font-bold text-slate-400 uppercase tracking-widest mb-1">{stat.label}</p>
                                <div className="text-2xl font-bold text-white font-mono">{stat.value}</div>
                            </div>
                            <div className={`p-3 rounded-xl ${stat.bg}`}>
                                <stat.icon className={`w-5 h-5 ${stat.color}`} />
                            </div>
                        </div>
                    </div>
                ))}
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                {/* SWOT / Context Board */}
                <div className="lg:col-span-1 space-y-6">
                    <div className="glass-panel p-6 border border-white/5">
                        <h3 className="text-lg font-bold mb-4 flex items-center gap-2 text-indigo-400">
                            <Info className="w-5 h-5" />
                            Strategic Context
                        </h3>
                        <p className="text-sm text-slate-400 leading-relaxed mb-6">
                            ISO 22301 require organizations to determine risks and opportunities to assure the BCMS can achieve outcomes, prevent undesired effects, and achieve continual improvement.
                        </p>
                        <div className="space-y-3">
                            <div className="p-3 rounded-xl bg-blue-500/5 border border-blue-500/10 flex gap-3 text-xs text-blue-300 italic">
                                <CheckCircle2 className="w-4 h-4 flex-shrink-0" />
                                Opportunities should prompt innovation during disruptions.
                            </div>
                            <div className="p-3 rounded-xl bg-rose-500/5 border border-rose-500/10 flex gap-3 text-xs text-rose-300 italic">
                                <ShieldCheck className="w-4 h-4 flex-shrink-0" />
                                Risks at this level focus on BCMS governance and support.
                            </div>
                        </div>
                    </div>

                    <div className="glass-panel p-4 border border-white/5 grid grid-cols-2 gap-2">
                        {swotCategories.map(cat => (
                            <div key={cat.id} className={`${cat.bg} p-4 rounded-xl border border-white/5 flex flex-col items-center justify-center text-center group cursor-help`}>
                                <div className={`text-xs font-black uppercase tracking-tighter ${cat.color} group-hover:scale-110 transition-transform mb-1`}>{cat.id}</div>
                                <div className="text-[10px] text-slate-500 font-bold leading-tight">{cat.title}</div>
                            </div>
                        ))}
                    </div>
                </div>

                {/* Register Table */}
                <div className="lg:col-span-2 glass-panel border border-white/5 overflow-hidden">
                    <div className="p-6 border-b border-white/5 flex items-center justify-between bg-white/5">
                        <div className="flex gap-4 items-center">
                            <div className="flex p-0.5 rounded-lg bg-slate-900 border border-white/10">
                                <button
                                    onClick={() => setTypeFilter('all')}
                                    className={`px-3 py-1 text-xs font-bold rounded-md transition-all ${typeFilter === 'all' ? 'bg-blue-600 text-white shadow-lg shadow-blue-600/20' : 'text-slate-400 hover:text-white'}`}
                                >
                                    All
                                </button>
                                <button
                                    onClick={() => setTypeFilter('Opportunity')}
                                    className={`px-3 py-1 text-xs font-bold rounded-md transition-all ${typeFilter === 'Opportunity' ? 'bg-emerald-600 text-white shadow-lg shadow-emerald-600/20' : 'text-slate-400 hover:text-white'}`}
                                >
                                    Opportunities
                                </button>
                                <button
                                    onClick={() => setTypeFilter('Risk')}
                                    className={`px-3 py-1 text-xs font-bold rounded-md transition-all ${typeFilter === 'Risk' ? 'bg-rose-600 text-white shadow-lg shadow-rose-600/20' : 'text-slate-400 hover:text-white'}`}
                                >
                                    Risks
                                </button>
                            </div>
                        </div>
                        <div className="relative">
                            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500" />
                            <input
                                type="text"
                                placeholder="Search plan..."
                                className="bg-slate-900/50 border border-white/10 rounded-xl pl-10 pr-4 py-1.5 text-xs text-white focus:outline-none focus:border-blue-500 w-48"
                                value={searchTerm}
                                onChange={e => setSearchTerm(e.target.value)}
                            />
                        </div>
                    </div>

                    <div className="overflow-x-auto">
                        <table className="w-full text-left">
                            <thead className="text-[10px] uppercase tracking-widest text-slate-500 bg-white/5">
                                <tr>
                                    <th className="px-6 py-4 font-bold">Strategic Item</th>
                                    <th className="px-6 py-4 font-bold">Source</th>
                                    <th className="px-6 py-4 font-bold">Priority</th>
                                    <th className="px-6 py-4 font-bold">Status</th>
                                    <th className="px-6 py-4 font-bold text-right">Actions</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-white/5">
                                {filteredItems.length === 0 ? (
                                    <tr>
                                        <td colSpan={5} className="px-6 py-20 text-center">
                                            <div className="flex flex-col items-center gap-3">
                                                <div className="p-4 rounded-full bg-slate-800/50 text-slate-600">
                                                    <Lightbulb className="w-8 h-8" />
                                                </div>
                                                <p className="text-slate-400 text-sm">No strategic items found. Identify planning gaps or initiatives.</p>
                                            </div>
                                        </td>
                                    </tr>
                                ) : filteredItems.map(item => (
                                    <tr key={item.id} className="group hover:bg-white/[0.02] transition-colors">
                                        <td className="px-6 py-4">
                                            <div className="flex items-center gap-3">
                                                <div className={`p-2 rounded-lg ${item.type === 'Opportunity' ? 'bg-emerald-500/10 text-emerald-400' : 'bg-rose-500/10 text-rose-400'}`}>
                                                    {item.type === 'Opportunity' ? <ArrowUpRight className="w-4 h-4" /> : <ArrowDownRight className="w-4 h-4" />}
                                                </div>
                                                <div>
                                                    <div className="font-bold text-white text-sm group-hover:text-blue-400 transition-colors uppercase tracking-tight">{item.title}</div>
                                                    <div className="text-[10px] text-slate-500 line-clamp-1">{item.description}</div>
                                                </div>
                                            </div>
                                        </td>
                                        <td className="px-6 py-4">
                                            <span className="text-xs text-slate-400 font-medium">
                                                {item.source}
                                            </span>
                                        </td>
                                        <td className="px-6 py-4">
                                            <span className={`px-2 py-0.5 rounded text-[10px] font-bold ${item.priority === 'High' ? 'bg-rose-500/10 text-rose-400' :
                                                item.priority === 'Medium' ? 'bg-amber-500/10 text-amber-400' :
                                                    'bg-blue-500/10 text-blue-400'
                                                }`}>
                                                {item.priority}
                                            </span>
                                        </td>
                                        <td className="px-6 py-4">
                                            <div className="flex items-center gap-2">
                                                <span className={`w-1.5 h-1.5 rounded-full ${item.status === 'Completed' ? 'bg-emerald-400' :
                                                    item.status === 'In Progress' ? 'bg-blue-400 animate-pulse' :
                                                        'bg-slate-500'
                                                    }`} />
                                                <span className="text-[10px] text-slate-300 font-bold uppercase">{item.status}</span>
                                            </div>
                                        </td>
                                        <td className="px-6 py-4 text-right">
                                            <div className="flex justify-end gap-2 opacity-0 group-hover:opacity-100 transition-all scale-95 group-hover:scale-100">
                                                <button
                                                    onClick={() => { setEditingItem(item); setIsModalOpen(true); }}
                                                    className="p-1.5 hover:bg-white/10 rounded-lg text-slate-400 hover:text-white"
                                                >
                                                    <MoreVertical className="w-4 h-4" />
                                                </button>
                                                <button
                                                    onClick={() => deleteStrategicItem(item.id)}
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
            </div>

            {/* Modal */}
            {isModalOpen && (
                <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
                    <div className="absolute inset-0 bg-slate-950/80 backdrop-blur-sm" onClick={() => setIsModalOpen(false)} />
                    <div className="relative glass-panel w-full max-w-2xl border border-white/10 shadow-2xl animate-in zoom-in-95 duration-200 flex flex-col max-h-[90vh] overflow-hidden">
                        <div className={`absolute top-0 left-0 w-full h-1 bg-gradient-to-r ${editingItem?.type === 'Opportunity' ? 'from-emerald-500 via-blue-500 to-emerald-500' : 'from-rose-500 via-amber-500 to-rose-500'}`} />

                        <div className="flex items-center justify-between p-5 border-b border-white/5 flex-shrink-0">
                            <h2 className="text-xl font-bold flex items-center gap-2">
                                <Target className="w-5 h-5 text-blue-400" />
                                {editingItem?.id ? 'Edit Planning Item' : 'New Planning Record'}
                            </h2>
                            <button onClick={() => setIsModalOpen(false)} className="text-slate-400 hover:text-white transition-colors">
                                <X className="w-6 h-6" />
                            </button>
                        </div>

                        <form onSubmit={handleSave} className="flex flex-col flex-grow overflow-hidden">
                            <div className="p-6 space-y-6 overflow-y-auto flex-grow custom-scrollbar">
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                    <div className="md:col-span-2 space-y-2">
                                        <label className="text-xs font-bold text-slate-400 uppercase tracking-widest">Type & Classification</label>
                                        <div className="flex p-1 rounded-xl bg-slate-900 border border-white/5">
                                            <button
                                                type="button"
                                                onClick={() => setEditingItem({ ...editingItem!, type: 'Opportunity' })}
                                                className={`flex-1 flex items-center justify-center gap-2 py-2.5 rounded-lg text-xs md:text-sm font-bold transition-all ${editingItem?.type === 'Opportunity' ? 'bg-emerald-600 text-white shadow-lg' : 'text-slate-500 hover:text-white'}`}
                                            >
                                                <ArrowUpRight className="w-4 h-4" />
                                                <span className="hidden sm:inline">Opportunity (Growth)</span>
                                                <span className="sm:hidden">Opportunity</span>
                                            </button>
                                            <button
                                                type="button"
                                                onClick={() => setEditingItem({ ...editingItem!, type: 'Risk' })}
                                                className={`flex-1 flex items-center justify-center gap-2 py-2.5 rounded-lg text-xs md:text-sm font-bold transition-all ${editingItem?.type === 'Risk' ? 'bg-rose-600 text-white shadow-lg' : 'text-slate-500 hover:text-white'}`}
                                            >
                                                <ArrowDownRight className="w-4 h-4" />
                                                <span className="hidden sm:inline">Risk (Governance)</span>
                                                <span className="sm:hidden">Risk</span>
                                            </button>
                                        </div>
                                    </div>

                                    <div className="md:col-span-2 space-y-2">
                                        <label className="text-xs font-bold text-slate-400 uppercase tracking-widest">Title</label>
                                        <input
                                            type="text"
                                            required
                                            className="w-full bg-slate-900/50 border border-white/10 rounded-xl px-4 py-2.5 text-white focus:outline-none focus:border-blue-500 transition-colors"
                                            placeholder="e.g., Cloud Modernization for Resilience"
                                            value={editingItem?.title || ''}
                                            onChange={e => setEditingItem({ ...editingItem!, title: e.target.value })}
                                        />
                                    </div>

                                    <div className="md:col-span-2 space-y-2">
                                        <label className="text-xs font-bold text-slate-400 uppercase tracking-widest">Description</label>
                                        <textarea
                                            rows={3}
                                            className="w-full bg-slate-900/50 border border-white/10 rounded-xl px-4 py-2.5 text-white focus:outline-none focus:border-blue-500 transition-colors"
                                            placeholder="Contextual details about this risk or opportunity..."
                                            value={editingItem?.description || ''}
                                            onChange={e => setEditingItem({ ...editingItem!, description: e.target.value })}
                                        />
                                    </div>

                                    <div className="space-y-2">
                                        <label className="text-xs font-bold text-slate-400 uppercase tracking-widest">Source of Issue</label>
                                        <input
                                            type="text"
                                            className="w-full bg-slate-900/50 border border-white/10 rounded-xl px-4 py-2.5 text-white focus:outline-none focus:border-blue-500 transition-colors"
                                            placeholder="e.g., Management Review"
                                            value={editingItem?.source || ''}
                                            onChange={e => setEditingItem({ ...editingItem!, source: e.target.value })}
                                        />
                                    </div>

                                    <div className="space-y-2">
                                        <label className="text-xs font-bold text-slate-400 uppercase tracking-widest">Priority</label>
                                        <select
                                            className="w-full bg-slate-900/50 border border-white/10 rounded-xl px-4 py-2.5 text-white focus:outline-none focus:border-blue-500 transition-colors"
                                            value={editingItem?.priority}
                                            onChange={e => setEditingItem({ ...editingItem!, priority: e.target.value as any })}
                                        >
                                            <option value="High">High</option>
                                            <option value="Medium">Medium</option>
                                            <option value="Low">Low</option>
                                        </select>
                                    </div>

                                    <div className="md:col-span-2 space-y-2">
                                        <label className="text-xs font-bold text-slate-400 uppercase tracking-widest">Impact on BCMS Outcomes</label>
                                        <input
                                            type="text"
                                            className="w-full bg-slate-900/50 border border-white/10 rounded-xl px-4 py-2.5 text-white focus:outline-none focus:border-blue-500 transition-colors"
                                            placeholder="How does this help or hinder resilience?"
                                            value={editingItem?.impact || ''}
                                            onChange={e => setEditingItem({ ...editingItem!, impact: e.target.value })}
                                        />
                                    </div>

                                    <div className="md:col-span-2 space-y-2">
                                        <label className="text-xs font-bold text-slate-400 uppercase tracking-widest">Action Plan Strategy</label>
                                        <textarea
                                            rows={2}
                                            className="w-full bg-slate-900/50 border border-white/10 rounded-xl px-4 py-2.5 text-white focus:outline-none focus:border-blue-500 transition-colors"
                                            placeholder="What specific steps are being taken?"
                                            value={editingItem?.actionPlan || ''}
                                            onChange={e => setEditingItem({ ...editingItem!, actionPlan: e.target.value })}
                                        />
                                    </div>

                                    <div className="space-y-2">
                                        <label className="text-xs font-bold text-slate-400 uppercase tracking-widest">Current Status</label>
                                        <select
                                            className="w-full bg-slate-900/50 border border-white/10 rounded-xl px-4 py-2.5 text-white focus:outline-none focus:border-blue-500 transition-colors"
                                            value={editingItem?.status}
                                            onChange={e => setEditingItem({ ...editingItem!, status: e.target.value as any })}
                                        >
                                            <option value="Open">Open</option>
                                            <option value="In Progress">In Progress</option>
                                            <option value="Completed">Completed</option>
                                            <option value="Monitored">Monitored</option>
                                        </select>
                                    </div>

                                    <div className="space-y-2">
                                        <label className="text-xs font-bold text-slate-400 uppercase tracking-widest">Owner</label>
                                        <input
                                            type="text"
                                            className="w-full bg-slate-900/50 border border-white/10 rounded-xl px-4 py-2.5 text-white focus:outline-none focus:border-blue-500 transition-colors"
                                            value={editingItem?.owner || ''}
                                            onChange={e => setEditingItem({ ...editingItem!, owner: e.target.value })}
                                        />
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
                                    Save Planning Item
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
}
