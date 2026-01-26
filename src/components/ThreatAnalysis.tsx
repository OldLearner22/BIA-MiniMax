import React, { useState, useMemo } from 'react';
import { useStore } from '../store/useStore';
import {
    AlertOctagon,
    Plus,
    ShieldAlert,
    Tornado,
    Zap,
    Globe,
    Truck,
    Activity,
    Search,
    Filter,
    MoreVertical,
    X,
    ArrowRight,
    ChevronRight,
    CloudLightning,
    UserCheck
} from 'lucide-react';
import {
    ScatterChart,
    Scatter,
    XAxis,
    YAxis,
    ZAxis,
    CartesianGrid,
    Tooltip,
    ResponsiveContainer,
    Cell,
    LabelList
} from 'recharts';
import { Threat } from '../types';

export function ThreatAnalysis() {
    const { threats, addThreat, updateThreat, deleteThreat } = useStore();
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [editingThreat, setEditingThreat] = useState<Partial<Threat> | null>(null);
    const [searchTerm, setSearchTerm] = useState('');
    const [categoryFilter, setCategoryFilter] = useState('all');

    const categories = [
        { id: 'Natural', icon: Tornado, color: 'text-blue-400', bg: 'bg-blue-400/10' },
        { id: 'Technical', icon: Zap, color: 'text-amber-400', bg: 'bg-amber-400/10' },
        { id: 'Cyber', icon: ShieldAlert, color: 'text-rose-400', bg: 'bg-rose-400/10' },
        { id: 'Geopolitical', icon: Globe, color: 'text-purple-400', bg: 'bg-purple-400/10' },
        { id: 'Supply Chain', icon: Truck, color: 'text-emerald-400', bg: 'bg-emerald-400/10' },
    ];

    const chartData = useMemo(() => {
        return threats.map(t => ({
            ...t,
            x: t.likelihood,
            y: t.impact,
            z: 100
        }));
    }, [threats]);

    const stats = useMemo(() => {
        const total = threats.length;
        const critical = threats.filter(t => t.riskScore >= 15).length;
        const active = threats.filter(t => t.status !== 'Mitigated').length;
        const avgScore = total > 0 ? threats.reduce((sum, t) => sum + t.riskScore, 0) / total : 0;
        return { total, critical, active, avgScore };
    }, [threats]);

    const filteredThreats = threats.filter(t => {
        const matchesSearch = t.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
            t.description.toLowerCase().includes(searchTerm.toLowerCase());
        const matchesCat = categoryFilter === 'all' || t.category === categoryFilter;
        return matchesSearch && matchesCat;
    });

    const getRiskColor = (score: number) => {
        if (score >= 20) return '#f43f5e'; // Critical
        if (score >= 12) return '#f59e0b'; // High
        if (score >= 6) return '#3b82f6';  // Medium
        return '#10b981';                 // Low
    };

    const getRiskLevel = (score: number) => {
        if (score >= 20) return 'Critical';
        if (score >= 12) return 'High';
        if (score >= 6) return 'Medium';
        return 'Low';
    };

    const handleSaveThreat = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!editingThreat?.title) return;

        const data = {
            ...editingThreat,
            riskScore: (editingThreat.likelihood || 1) * (editingThreat.impact || 1)
        } as Threat;

        if (data.id) {
            await updateThreat(data.id, data);
        } else {
            await addThreat(data);
        }
        setIsModalOpen(false);
        setEditingThreat(null);
    };

    return (
        <div className="space-y-8 animate-in fade-in duration-700">
            {/* Header */}
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-3xl font-bold flex items-center gap-3 bg-gradient-to-r from-white to-white/60 bg-clip-text text-transparent">
                        <AlertOctagon className="w-8 h-8 text-rose-500" />
                        ISO 22301 Threat Analysis
                    </h1>
                    <p className="text-slate-400 mt-1">Identification and evaluation of hazards to business continuity</p>
                </div>
                <button
                    onClick={() => {
                        setEditingThreat({
                            title: '',
                            description: '',
                            category: 'Technical',
                            source: 'External',
                            likelihood: 3,
                            impact: 3,
                            status: 'Identified'
                        });
                        setIsModalOpen(true);
                    }}
                    className="premium-btn px-6 py-2.5 rounded-xl font-bold flex items-center gap-2 bg-rose-500 text-white hover:bg-rose-400 shadow-lg shadow-rose-500/20"
                >
                    <Plus className="w-4 h-4" />
                    Identify Threat
                </button>
            </div>

            {/* Stats Cards */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
                {[
                    { label: 'Identified Threats', value: stats.total, icon: Activity, color: 'text-blue-400', bg: 'bg-blue-400/10' },
                    { label: 'Critical Threshold', value: stats.critical, icon: ShieldAlert, color: 'text-rose-400', bg: 'bg-rose-400/10' },
                    { label: 'Action Required', value: stats.active, icon: CloudLightning, color: 'text-amber-400', bg: 'bg-amber-400/10' },
                    { label: 'Avg Risk Score', value: stats.avgScore.toFixed(1), icon: ArrowRight, color: 'text-emerald-400', bg: 'bg-emerald-400/10' },
                ].map((stat, i) => (
                    <div key={i} className="glass-panel p-6 border border-white/5 relative overflow-hidden">
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

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {/* Risk Matrix Visualization */}
                <div className="glass-panel p-6 border border-white/5">
                    <div className="flex items-center justify-between mb-8">
                        <h3 className="text-lg font-bold">Threat Landscape Matrix</h3>
                        <div className="flex gap-2 text-[10px] uppercase font-bold">
                            <span className="flex items-center gap-1"><div className="w-2 h-2 rounded-full bg-emerald-500" /> Low</span>
                            <span className="flex items-center gap-1"><div className="w-2 h-2 rounded-full bg-blue-500" /> Med</span>
                            <span className="flex items-center gap-1"><div className="w-2 h-2 rounded-full bg-amber-500" /> High</span>
                            <span className="flex items-center gap-1"><div className="w-2 h-2 rounded-full bg-rose-500" /> Crit</span>
                        </div>
                    </div>
                    <div className="h-[400px] w-full relative">
                        {/* Background Grid Colors */}
                        <div className="absolute inset-0 grid grid-cols-5 grid-rows-5 opacity-10 pointer-events-none p-8 pl-10 pb-10">
                            {[...Array(25)].map((_, i) => {
                                const row = 4 - Math.floor(i / 5);
                                const col = i % 5;
                                const score = (row + 1) * (col + 1);
                                return <div key={i} style={{ backgroundColor: getRiskColor(score) }} />;
                            })}
                        </div>

                        <ResponsiveContainer width="100%" height="100%">
                            <ScatterChart margin={{ top: 20, right: 30, bottom: 40, left: 20 }}>
                                <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" />
                                <XAxis
                                    type="number"
                                    dataKey="x"
                                    name="Likelihood"
                                    domain={[0.5, 5.5]}
                                    ticks={[1, 2, 3, 4, 5]}
                                    label={{ value: 'Likelihood', position: 'bottom', fill: '#94a3b8', fontSize: 12, offset: 20 }}
                                    axisLine={false}
                                    tick={{ fill: '#94a3b8' }}
                                />
                                <YAxis
                                    type="number"
                                    dataKey="y"
                                    name="Impact"
                                    domain={[0.5, 5.5]}
                                    ticks={[1, 2, 3, 4, 5]}
                                    label={{ value: 'Impact', angle: -90, position: 'left', fill: '#94a3b8', fontSize: 12, offset: 10 }}
                                    axisLine={false}
                                    tick={{ fill: '#94a3b8' }}
                                />
                                <ZAxis type="number" dataKey="z" range={[100, 100]} />
                                <Tooltip
                                    cursor={{ strokeDasharray: '3 3' }}
                                    content={({ active, payload }) => {
                                        if (active && payload && payload.length) {
                                            const data = payload[0].payload as Threat;
                                            return (
                                                <div className="bg-slate-900 border border-white/10 p-3 rounded-xl shadow-2xl">
                                                    <p className="font-bold text-white mb-1">{data.title}</p>
                                                    <p className="text-[10px] text-slate-400 mb-2 uppercase">{data.category}</p>
                                                    <div className="flex justify-between items-center gap-4 text-xs">
                                                        <span className="text-slate-400">Score: <span className="text-white font-mono">{data.riskScore}</span></span>
                                                        <span style={{ color: getRiskColor(data.riskScore) }} className="font-bold">{getRiskLevel(data.riskScore)}</span>
                                                    </div>
                                                </div>
                                            );
                                        }
                                        return null;
                                    }}
                                />
                                <Scatter data={chartData} shape="circle">
                                    {chartData.map((entry, index) => (
                                        <Cell key={`cell-${index}`} fill={getRiskColor(entry.riskScore)} />
                                    ))}
                                    <LabelList dataKey="title" position="top" style={{ fill: '#cbd5e1', fontSize: '9px', fontWeight: 'bold' }} />
                                </Scatter>
                            </ScatterChart>
                        </ResponsiveContainer>
                    </div>
                </div>

                {/* Threat Categories */}
                <div className="grid grid-cols-1 gap-6">
                    <div className="glass-panel p-6 border border-white/5 h-full">
                        <h3 className="text-lg font-bold mb-6 flex items-center gap-2">
                            <Filter className="w-5 h-5 text-indigo-400" />
                            Category Breakdown
                        </h3>
                        <div className="space-y-4">
                            {categories.map(cat => {
                                const catThreats = threats.filter(t => t.category === cat.id);
                                const count = catThreats.length;
                                const avgScore = count > 0 ? catThreats.reduce((s, t) => s + t.riskScore, 0) / count : 0;

                                return (
                                    <div key={cat.id} className="flex items-center justify-between p-4 rounded-xl bg-white/5 border border-white/5 group hover:bg-white/[0.08] transition-all cursor-pointer">
                                        <div className="flex items-center gap-4">
                                            <div className={`p-3 rounded-xl ${cat.bg}`}>
                                                <cat.icon className={`w-5 h-5 ${cat.color}`} />
                                            </div>
                                            <div>
                                                <p className="font-bold text-white group-hover:text-blue-400 transition-colors">{cat.id}</p>
                                                <p className="text-xs text-slate-500">{count} threats identified</p>
                                            </div>
                                        </div>
                                        <div className="text-right">
                                            <div className="text-sm font-bold text-white">Avg Score</div>
                                            <div className={`text-xs font-mono font-bold ${avgScore >= 15 ? 'text-rose-400' : 'text-slate-400'}`}>{avgScore.toFixed(1)}</div>
                                        </div>
                                    </div>
                                );
                            })}
                        </div>
                    </div>
                </div>
            </div>

            {/* Threat List Table */}
            <div className="glass-panel border border-white/5 overflow-hidden">
                <div className="p-6 border-b border-white/5 flex flex-col md:flex-row md:items-center justify-between gap-4 bg-white/5">
                    <div className="flex items-center gap-3">
                        <div className="p-2 rounded-lg bg-indigo-500/10 text-indigo-400">
                            <AlertOctagon className="w-5 h-5" />
                        </div>
                        <h3 className="text-lg font-bold">Threat Inventory</h3>
                    </div>
                    <div className="flex gap-3">
                        <div className="relative">
                            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500" />
                            <input
                                type="text"
                                placeholder="Search threats..."
                                className="bg-slate-900/50 border border-white/10 rounded-xl pl-10 pr-4 py-2 text-sm text-white focus:outline-none focus:border-blue-500 w-64"
                                value={searchTerm}
                                onChange={e => setSearchTerm(e.target.value)}
                            />
                        </div>
                    </div>
                </div>

                <div className="overflow-x-auto">
                    <table className="w-full text-left">
                        <thead className="text-[11px] uppercase tracking-wider text-slate-500 bg-white/5">
                            <tr>
                                <th className="px-6 py-4 font-bold">Threat Context</th>
                                <th className="px-6 py-4 font-bold">Source</th>
                                <th className="px-6 py-4 font-bold text-center">Likelihood</th>
                                <th className="px-6 py-4 font-bold text-center">Impact</th>
                                <th className="px-6 py-4 font-bold text-center">Score</th>
                                <th className="px-6 py-4 font-bold">Status</th>
                                <th className="px-6 py-4 font-bold text-right">Actions</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-white/5">
                            {filteredThreats.length === 0 ? (
                                <tr>
                                    <td colSpan={7} className="px-6 py-24 text-center">
                                        <div className="flex flex-col items-center gap-3">
                                            <div className="p-4 rounded-full bg-slate-800/50 text-slate-600">
                                                <ShieldAlert className="w-8 h-8" />
                                            </div>
                                            <p className="text-slate-400">No threats registered. Start identifying hazards.</p>
                                        </div>
                                    </td>
                                </tr>
                            ) : filteredThreats.map(threat => (
                                <tr key={threat.id} className="group hover:bg-white/[0.02] transition-colors">
                                    <td className="px-6 py-4">
                                        <div className="font-bold text-white group-hover:text-rose-400 transition-colors uppercase text-sm tracking-tight">{threat.title}</div>
                                        <div className="text-xs text-slate-500 mt-0.5">{threat.category} • {threat.owner || 'Unassigned'}</div>
                                    </td>
                                    <td className="px-6 py-4">
                                        <span className={`px-2 py-0.5 rounded-lg text-[10px] font-bold border ${threat.source === 'External' ? 'text-purple-400 border-purple-400/20 bg-purple-400/10' : 'text-blue-400 border-blue-400/20 bg-blue-400/10'
                                            }`}>
                                            {threat.source}
                                        </span>
                                    </td>
                                    <td className="px-6 py-4 text-center">
                                        <div className="flex items-center justify-center gap-1">
                                            {[...Array(5)].map((_, i) => (
                                                <div key={i} className={`w-1.5 h-3 rounded-sm ${i < threat.likelihood ? 'bg-indigo-500' : 'bg-white/5'}`} />
                                            ))}
                                        </div>
                                    </td>
                                    <td className="px-6 py-4 text-center">
                                        <div className="flex items-center justify-center gap-1">
                                            {[...Array(5)].map((_, i) => (
                                                <div key={i} className={`w-1.5 h-3 rounded-sm ${i < threat.impact ? 'bg-rose-500' : 'bg-white/5'}`} />
                                            ))}
                                        </div>
                                    </td>
                                    <td className="px-6 py-4 text-center">
                                        <span className={`px-2.5 py-1 rounded-lg text-xs font-mono font-bold border group-hover:scale-110 transition-transform inline-block ${threat.riskScore >= 15 ? 'text-rose-400 border-rose-400 bg-rose-400/10' :
                                                threat.riskScore >= 10 ? 'text-amber-400 border-amber-400 bg-amber-400/10' :
                                                    'text-blue-400 border-blue-400 bg-blue-400/10'
                                            }`}>
                                            {threat.riskScore}
                                        </span>
                                    </td>
                                    <td className="px-6 py-4">
                                        <span className={`px-2 py-0.5 rounded-full text-[10px] uppercase font-bold flex items-center gap-1.5 ${threat.status === 'Mitigated' ? 'text-emerald-400' : 'text-rose-400'
                                            }`}>
                                            <div className={`w-1.5 h-1.5 rounded-full ${threat.status === 'Mitigated' ? 'bg-emerald-400' : 'bg-rose-400 animate-pulse'}`} />
                                            {threat.status}
                                        </span>
                                    </td>
                                    <td className="px-6 py-4 text-right">
                                        <div className="flex justify-end gap-2 opacity-0 group-hover:opacity-100 transition-all scale-95 group-hover:scale-100">
                                            <button
                                                onClick={() => { setEditingThreat(threat); setIsModalOpen(true); }}
                                                className="p-2 hover:bg-white/10 rounded-lg text-slate-400 hover:text-white transition-all shadow-xl"
                                            >
                                                <MoreVertical className="w-4 h-4" />
                                            </button>
                                            <button
                                                onClick={() => deleteThreat(threat.id)}
                                                className="p-2 hover:bg-rose-500/20 rounded-lg text-slate-500 hover:text-rose-400 transition-all font-bold"
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

            {/* Identify Threat Modal */}
            {isModalOpen && (
                <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
                    <div className="absolute inset-0 bg-slate-950/80 backdrop-blur-sm" onClick={() => setIsModalOpen(false)} />
                    <div className="relative glass-panel w-full max-w-2xl border border-white/10 shadow-2xl animate-in zoom-in-95 duration-200 overflow-hidden">
                        <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-rose-500 via-indigo-500 to-rose-500" />

                        <div className="flex items-center justify-between p-6 border-b border-white/5">
                            <h2 className="text-xl font-bold flex items-center gap-2">
                                <AlertOctagon className="w-5 h-5 text-rose-400" />
                                {editingThreat?.id ? 'Adjust Threat Assessment' : 'Identify New Hazard'}
                            </h2>
                            <button onClick={() => setIsModalOpen(false)} className="text-slate-400 hover:text-white">
                                <X className="w-6 h-6" />
                            </button>
                        </div>

                        <form onSubmit={handleSaveThreat} className="p-6 space-y-6">
                            <div className="grid grid-cols-2 gap-6">
                                <div className="col-span-2 space-y-2">
                                    <label className="text-xs font-bold text-slate-400 uppercase tracking-widest">Threat Scenario</label>
                                    <input
                                        type="text"
                                        required
                                        placeholder="e.g. Failure of primary ISP provider"
                                        className="w-full bg-slate-900/50 border border-white/10 rounded-xl px-4 py-2.5 text-white focus:outline-none focus:border-rose-500 transition-all"
                                        value={editingThreat?.title}
                                        onChange={e => setEditingThreat({ ...editingThreat!, title: e.target.value })}
                                    />
                                </div>

                                <div className="space-y-2">
                                    <label className="text-xs font-bold text-slate-400 uppercase tracking-widest">Category</label>
                                    <select
                                        className="w-full bg-slate-900/50 border border-white/10 rounded-xl px-4 py-2.5 text-white focus:outline-none focus:border-rose-500"
                                        value={editingThreat?.category}
                                        onChange={e => setEditingThreat({ ...editingThreat!, category: e.target.value })}
                                    >
                                        {categories.map(c => <option key={c.id} value={c.id}>{c.id}</option>)}
                                    </select>
                                </div>

                                <div className="space-y-2">
                                    <label className="text-xs font-bold text-slate-400 uppercase tracking-widest">Source</label>
                                    <select
                                        className="w-full bg-slate-900/50 border border-white/10 rounded-xl px-4 py-2.5 text-white focus:outline-none focus:border-rose-500"
                                        value={editingThreat?.source}
                                        onChange={e => setEditingThreat({ ...editingThreat!, source: e.target.value })}
                                    >
                                        <option>Internal</option>
                                        <option>External</option>
                                    </select>
                                </div>

                                <div className="col-span-2 space-y-2">
                                    <label className="text-xs font-bold text-slate-400 uppercase tracking-widest">Context / Narrative</label>
                                    <textarea
                                        rows={2}
                                        className="w-full bg-slate-900/50 border border-white/10 rounded-xl px-4 py-2.5 text-white focus:outline-none focus:border-rose-500"
                                        value={editingThreat?.description}
                                        onChange={e => setEditingThreat({ ...editingThreat!, description: e.target.value })}
                                    />
                                </div>

                                <div className="space-y-4">
                                    <div className="flex justify-between items-center">
                                        <label className="text-xs font-bold text-slate-400 uppercase">Likelihood</label>
                                        <span className="text-xs font-mono font-bold text-indigo-400">{editingThreat?.likelihood}/5</span>
                                    </div>
                                    <div className="flex gap-2">
                                        {[1, 2, 3, 4, 5].map(v => (
                                            <button
                                                key={v}
                                                type="button"
                                                onClick={() => setEditingThreat({ ...editingThreat!, likelihood: v })}
                                                className={`flex-1 h-2 rounded-full transition-all ${editingThreat?.likelihood && editingThreat.likelihood >= v ? 'bg-indigo-500 shadow-lg shadow-indigo-500/20' : 'bg-slate-800 hover:bg-slate-700'}`}
                                            />
                                        ))}
                                    </div>
                                </div>

                                <div className="space-y-4">
                                    <div className="flex justify-between items-center">
                                        <label className="text-xs font-bold text-slate-400 uppercase">Impact</label>
                                        <span className="text-xs font-mono font-bold text-rose-400">{editingThreat?.impact}/5</span>
                                    </div>
                                    <div className="flex gap-2">
                                        {[1, 2, 3, 4, 5].map(v => (
                                            <button
                                                key={v}
                                                type="button"
                                                onClick={() => setEditingThreat({ ...editingThreat!, impact: v })}
                                                className={`flex-1 h-2 rounded-full transition-all ${editingThreat?.impact && editingThreat.impact >= v ? 'bg-rose-500 shadow-lg shadow-rose-500/20' : 'bg-slate-800 hover:bg-slate-700'}`}
                                            />
                                        ))}
                                    </div>
                                </div>

                                <div className="space-y-2">
                                    <label className="text-xs font-bold text-slate-400 uppercase">Status</label>
                                    <select
                                        className="w-full bg-slate-900/50 border border-white/10 rounded-xl px-4 py-2.5 text-white focus:outline-none focus:border-rose-500"
                                        value={editingThreat?.status}
                                        onChange={e => setEditingThreat({ ...editingThreat!, status: e.target.value })}
                                    >
                                        <option>Identified</option>
                                        <option>Assessed</option>
                                        <option>Mitigated</option>
                                    </select>
                                </div>

                                <div className="space-y-2">
                                    <label className="text-xs font-bold text-slate-400 uppercase">Owner</label>
                                    <div className="relative">
                                        <UserCheck className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500 pointer-events-none" />
                                        <input
                                            type="text"
                                            className="w-full bg-slate-900/50 border border-white/10 rounded-xl pl-10 pr-4 py-2.5 text-white focus:outline-none focus:border-rose-500 font-medium"
                                            value={editingThreat?.owner || ''}
                                            onChange={e => setEditingThreat({ ...editingThreat!, owner: e.target.value })}
                                        />
                                    </div>
                                </div>
                            </div>

                            <div className="flex justify-end gap-3 pt-6 border-t border-white/5">
                                <button
                                    type="button"
                                    onClick={() => setIsModalOpen(false)}
                                    className="px-6 py-2.5 rounded-xl text-slate-400 hover:bg-white/5 transition-all font-medium"
                                >
                                    Cancel
                                </button>
                                <button
                                    type="submit"
                                    className="px-10 py-2.5 rounded-xl bg-gradient-to-r from-rose-500 to-rose-600 text-white font-bold hover:shadow-lg hover:shadow-rose-500/30 transition-all active:scale-95"
                                >
                                    Confirm Assessment
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
}
