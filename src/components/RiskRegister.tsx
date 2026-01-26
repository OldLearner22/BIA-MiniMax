import React, { useState, useMemo } from 'react';
import { useStore } from '../store/useStore';
import {
    Shield,
    Plus,
    TrendingUp,
    AlertTriangle,
    Activity,
    ChevronRight,
    LineChart,
    Download,
    Filter,
    Search,
    MoreVertical,
    X,
    Target,
    BarChart2,
    Lock,
    Zap,
    RotateCcw
} from 'lucide-react';
import {
    AreaChart,
    Area,
    XAxis,
    YAxis,
    CartesianGrid,
    Tooltip,
    ResponsiveContainer,
    Bar,
    ComposedChart,
    Line,
    Cell
} from 'recharts';
import { Risk } from '../types';

export function RiskRegister() {
    const { risks, addRisk, updateRisk, deleteRisk } = useStore();
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [editingRisk, setEditingRisk] = useState<Partial<Risk> | null>(null);
    const [searchTerm, setSearchTerm] = useState('');
    const [categoryFilter, setCategoryFilter] = useState('all');
    const [simulationRunning, setSimulationRunning] = useState(false);
    const [simulationResults, setSimulationResults] = useState<any[]>([]);

    // Simulation Logic (Monte Carlo)
    const runSimulation = () => {
        setSimulationRunning(true);
        setTimeout(() => {
            const iterations = 5000;
            const results = [];

            // Aggregate simulation for all active risks
            for (let i = 0; i < iterations; i++) {
                let totalLoss = 0;
                risks.forEach(risk => {
                    // Bernoulli trial for probability
                    if (Math.random() <= (risk.probability || 0.1)) {
                        // Triangle distribution for impact if parameters exist, else use point estimate
                        if (risk.minImpact && risk.maxImpact && risk.mostLikelyImpact) {
                            totalLoss += triangleRandom(risk.minImpact, risk.maxImpact, risk.mostLikelyImpact);
                        } else {
                            totalLoss += risk.impact || 0;
                        }
                    }
                });
                results.push(totalLoss);
            }

            // Process results into histogram data
            const bins = 40;
            const sorted = [...results].sort((a, b) => a - b);
            const min = sorted[0];
            const max = sorted[sorted.length - 1];
            const step = (max - min) / bins;

            const histogram = Array.from({ length: bins }, (_, i) => {
                const binStart = min + (i * step);
                const binEnd = binStart + step;
                const count = results.filter(r => r >= binStart && r < binEnd).length;
                return {
                    bin: Math.round(binStart),
                    count,
                    cumulative: (results.filter(r => r <= binEnd).length / iterations) * 100
                };
            });

            setSimulationResults(histogram);
            setSimulationRunning(false);
        }, 1200);
    };

    const triangleRandom = (min: number, max: number, mode: number) => {
        const u = Math.random();
        const f = (mode - min) / (max - min);
        if (u < f) {
            return min + Math.sqrt(u * (max - min) * (mode - min));
        } else {
            return max - Math.sqrt((1 - u) * (max - min) * (max - mode));
        }
    };

    // Metrics
    const stats = useMemo(() => {
        const total = risks.length;
        const extreme = risks.filter(r => r.criticality === 'Extreme').length;
        const high = risks.filter(r => r.criticality === 'High').length;
        const avgExposure = total > 0 ? risks.reduce((sum, r) => sum + r.exposure, 0) / total : 0;
        return { total, extreme, high, avgExposure };
    }, [risks]);

    const filteredRisks = risks.filter(r => {
        const matchesSearch = r.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
            r.description.toLowerCase().includes(searchTerm.toLowerCase());
        const matchesCat = categoryFilter === 'all' || r.category === categoryFilter;
        return matchesSearch && matchesCat;
    });

    const getCriticalityColor = (level: string) => {
        switch (level) {
            case 'Extreme': return 'text-rose-400 bg-rose-400/10 border-rose-400/20';
            case 'High': return 'text-orange-400 bg-orange-400/10 border-orange-400/20';
            case 'Medium': return 'text-blue-400 bg-blue-400/10 border-blue-400/20';
            case 'Low': return 'text-emerald-400 bg-emerald-400/10 border-emerald-400/20';
            default: return 'text-slate-400 bg-slate-400/10 border-slate-400/20';
        }
    };

    const handleSaveRisk = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!editingRisk?.title) return;

        // Calculate exposure
        const prob = editingRisk.probability || 0;
        const impact = editingRisk.impact || 0;
        const exposure = prob * impact;

        const data = { ...editingRisk, exposure } as Risk;

        if (data.id) {
            await updateRisk(data.id, data);
        } else {
            await addRisk(data);
        }
        setIsModalOpen(false);
        setEditingRisk(null);
    };

    return (
        <div className="space-y-8 animate-in fade-in duration-700">
            {/* Header */}
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-3xl font-bold flex items-center gap-3 bg-gradient-to-r from-white to-white/60 bg-clip-text text-transparent">
                        <Shield className="w-8 h-8 text-indigo-400" />
                        Quantitative Risk Register
                    </h1>
                    <p className="text-slate-400 mt-1">Enterprise-grade risk modeling with Monte Carlo simulation</p>
                </div>
                <div className="flex gap-3">
                    <button
                        onClick={runSimulation}
                        className="premium-btn px-6 py-2.5 rounded-xl font-bold flex items-center gap-2 bg-indigo-500/10 border-indigo-500/30 hover:bg-indigo-500/20 transition-all"
                    >
                        <Zap className={`w-4 h-4 ${simulationRunning ? 'animate-pulse text-yellow-400' : 'text-indigo-400'}`} />
                        Run Simulation
                    </button>
                    <button
                        onClick={() => {
                            setEditingRisk({
                                title: '',
                                description: '',
                                category: 'Operational',
                                criticality: 'Medium',
                                probability: 0.1,
                                impact: 10000,
                                status: 'Open'
                            });
                            setIsModalOpen(true);
                        }}
                        className="premium-btn px-6 py-2.5 rounded-xl font-bold flex items-center gap-2 bg-blue-500 text-white hover:bg-blue-400 shadow-lg shadow-blue-500/20"
                    >
                        <Plus className="w-4 h-4" />
                        New Risk
                    </button>
                </div>
            </div>

            {/* Stats Grid */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
                {[
                    { label: 'Total Risks', value: stats.total, icon: Activity, color: 'text-indigo-400', bg: 'bg-indigo-400/10' },
                    { label: 'Extreme Risks', value: stats.extreme, icon: AlertTriangle, color: 'text-rose-400', bg: 'bg-rose-400/10' },
                    { label: 'High Risks', value: stats.high, icon: TrendingUp, color: 'text-orange-400', bg: 'bg-orange-400/10' },
                    { label: 'Avg Exposure', value: `$${Math.round(stats.avgExposure).toLocaleString()}`, icon: Target, color: 'text-emerald-400', bg: 'bg-emerald-400/10' },
                ].map((stat, i) => (stat.label !== 'Avg Exposure' || stats.total > 0) && (
                    <div key={i} className="glass-panel p-6 border border-white/5 relative overflow-hidden group">
                        <div className={`absolute top-0 right-0 w-24 h-24 ${stat.bg} blur-3xl rounded-full -mr-12 -mt-12 group-hover:scale-150 transition-transform duration-700`} />
                        <div className="relative flex justify-between items-start">
                            <div>
                                <p className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-1">{stat.label}</p>
                                <div className="text-2xl font-bold text-white font-mono">{stat.value}</div>
                            </div>
                            <div className={`p-3 rounded-xl ${stat.bg}`}>
                                <stat.icon className={`w-5 h-5 ${stat.color}`} />
                            </div>
                        </div>
                    </div>
                ))}
            </div>

            {/* Analysis Section */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {/* Risk Distribution Chart */}
                <div className="glass-panel p-6 border border-white/5">
                    <div className="flex items-center justify-between mb-6">
                        <h3 className="text-lg font-bold flex items-center gap-2">
                            <BarChart2 className="w-5 h-5 text-blue-400" />
                            Risk Distribution
                        </h3>
                        <div className="text-xs text-slate-400">By Criticality</div>
                    </div>
                    <div className="h-[300px]">
                        <ResponsiveContainer width="100%" height="100%">
                            <ComposedChart data={[
                                { name: 'Extreme', count: risks.filter(r => r.criticality === 'Extreme').length, color: '#fb7185' },
                                { name: 'High', count: risks.filter(r => r.criticality === 'High').length, color: '#fb923c' },
                                { name: 'Medium', count: risks.filter(r => r.criticality === 'Medium').length, color: '#60a5fa' },
                                { name: 'Low', count: risks.filter(r => r.criticality === 'Low').length, color: '#34d399' },
                            ]}>
                                <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" vertical={false} />
                                <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{ fill: '#94a3b8', fontSize: 12 }} />
                                <YAxis axisLine={false} tickLine={false} tick={{ fill: '#94a3b8', fontSize: 12 }} />
                                <Tooltip
                                    contentStyle={{ backgroundColor: '#1e293b', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '12px' }}
                                    itemStyle={{ color: '#fff' }}
                                />
                                <Bar dataKey="count" radius={[8, 8, 0, 0]}>
                                    {[0, 1, 2, 3].map((entry, index) => (
                                        <Cell key={`cell-${index}`} fill={index === 0 ? '#fb7185' : index === 1 ? '#fb923c' : index === 2 ? '#60a5fa' : '#34d399'} />
                                    ))}
                                </Bar>
                            </ComposedChart>
                        </ResponsiveContainer>
                    </div>
                </div>

                {/* Monte Carlo Results */}
                <div className="glass-panel p-6 border border-white/5 overflow-hidden relative">
                    <div className="flex items-center justify-between mb-6">
                        <h3 className="text-lg font-bold flex items-center gap-2">
                            <LineChart className="w-5 h-5 text-purple-400" />
                            Monte Carlo Loss Simulation
                        </h3>
                        <div className="text-xs text-slate-400">Iterations: 5,000</div>
                    </div>
                    {simulationResults.length > 0 ? (
                        <div className="h-[300px]">
                            <ResponsiveContainer width="100%" height="100%">
                                <AreaChart data={simulationResults}>
                                    <defs>
                                        <linearGradient id="colorLoss" x1="0" y1="0" x2="0" y2="1">
                                            <stop offset="5%" stopColor="#8b5cf6" stopOpacity={0.3} />
                                            <stop offset="95%" stopColor="#8b5cf6" stopOpacity={0} />
                                        </linearGradient>
                                    </defs>
                                    <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" vertical={false} />
                                    <XAxis dataKey="bin" axisLine={false} tickLine={false} tick={{ fill: '#94a3b8', fontSize: 10 }} tickFormatter={(v) => `$${(v / 1000).toFixed(0)}k`} />
                                    <YAxis axisLine={false} tickLine={false} tick={{ fill: '#94a3b8', fontSize: 12 }} />
                                    <Tooltip
                                        contentStyle={{ backgroundColor: '#1e293b', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '12px' }}
                                        labelFormatter={(v) => `Loss: $${v.toLocaleString()}`}
                                    />
                                    <Area type="monotone" dataKey="count" stroke="#8b5cf6" fillOpacity={1} fill="url(#colorLoss)" />
                                    <Area type="monotone" dataKey="cumulative" stroke="#ec4899" fill="transparent" strokeDasharray="5 5" name="Confidence %" />
                                </AreaChart>
                            </ResponsiveContainer>
                        </div>
                    ) : (
                        <div className="h-[300px] flex flex-col items-center justify-center text-center space-y-4">
                            <div className="p-4 rounded-full bg-slate-800/50">
                                <Lock className="w-8 h-8 text-slate-500" />
                            </div>
                            <div>
                                <p className="text-slate-400 font-medium">Simulation Data Locked</p>
                                <p className="text-xs text-slate-500 max-w-[240px]">Run the engine to generate probabilistic loss distribution models</p>
                            </div>
                        </div>
                    )}
                </div>
            </div>

            {/* Risk Register Table */}
            <div className="glass-panel border border-white/5 overflow-hidden">
                <div className="p-6 border-b border-white/5 flex flex-col md:flex-row md:items-center justify-between gap-4 bg-white/5">
                    <h3 className="text-lg font-bold flex items-center gap-2">
                        <Filter className="w-5 h-5 text-indigo-400" />
                        Risk Register
                    </h3>
                    <div className="flex gap-3">
                        <div className="relative">
                            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500" />
                            <input
                                type="text"
                                placeholder="Search risks..."
                                className="bg-slate-900/50 border border-white/10 rounded-xl pl-10 pr-4 py-2 text-sm text-white focus:outline-none focus:border-blue-500 w-64"
                                value={searchTerm}
                                onChange={e => setSearchTerm(e.target.value)}
                            />
                        </div>
                        <select
                            className="bg-slate-900/50 border border-white/10 rounded-xl px-4 py-2 text-sm text-white focus:outline-none focus:border-blue-500"
                            value={categoryFilter}
                            onChange={e => setCategoryFilter(e.target.value)}
                        >
                            <option value="all">All Categories</option>
                            <option value="Operational">Operational</option>
                            <option value="Financial">Financial</option>
                            <option value="Strategic">Strategic</option>
                            <option value="Compliance">Compliance</option>
                        </select>
                    </div>
                </div>
                <div className="overflow-x-auto">
                    <table className="w-full text-left">
                        <thead className="text-[11px] uppercase tracking-wider text-slate-500 bg-white/5">
                            <tr>
                                <th className="px-6 py-4 font-bold">Risk Identification</th>
                                <th className="px-6 py-4 font-bold">Criticality</th>
                                <th className="px-6 py-4 font-bold text-center">Probability</th>
                                <th className="px-6 py-4 font-bold text-center">Avg Impact</th>
                                <th className="px-6 py-4 font-bold text-center text-blue-400">Exposure</th>
                                <th className="px-6 py-4 font-bold">Status</th>
                                <th className="px-6 py-4 font-bold text-right">Actions</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-white/5">
                            {filteredRisks.length === 0 ? (
                                <tr>
                                    <td colSpan={7} className="px-6 py-24 text-center">
                                        <div className="flex flex-col items-center gap-3">
                                            <div className="p-4 rounded-full bg-slate-800/50">
                                                <Shield className="w-8 h-8 text-slate-600" />
                                            </div>
                                            <p className="text-slate-400">No risks found matching your filters.</p>
                                        </div>
                                    </td>
                                </tr>
                            ) : filteredRisks.map(risk => (
                                <tr key={risk.id} className="group hover:bg-white/[0.02] transition-colors">
                                    <td className="px-6 py-4">
                                        <div className="font-bold text-white group-hover:text-blue-400 transition-colors uppercase text-sm tracking-tight">{risk.title}</div>
                                        <div className="text-xs text-slate-500 mt-0.5">{risk.category} • {risk.owner || 'Unassigned'}</div>
                                    </td>
                                    <td className="px-6 py-4">
                                        <span className={`px-2.5 py-1 rounded-lg text-[10px] font-bold border ${getCriticalityColor(risk.criticality)}`}>
                                            {risk.criticality}
                                        </span>
                                    </td>
                                    <td className="px-6 py-4 text-center font-mono text-xs text-slate-300">
                                        {(risk.probability * 100).toFixed(0)}%
                                    </td>
                                    <td className="px-6 py-4 text-center font-mono text-xs text-slate-300">
                                        ${risk.impact.toLocaleString()}
                                    </td>
                                    <td className="px-6 py-4 text-center font-mono font-bold text-blue-400">
                                        ${risk.exposure.toLocaleString()}
                                    </td>
                                    <td className="px-6 py-4">
                                        <span className={`px-2 py-0.5 rounded-full text-[10px] uppercase font-bold ${risk.status === 'Open' ? 'bg-rose-500/10 text-rose-500' : 'bg-emerald-500/10 text-emerald-500'
                                            }`}>
                                            {risk.status}
                                        </span>
                                    </td>
                                    <td className="px-6 py-4 text-right">
                                        <div className="flex justify-end gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                                            <button
                                                onClick={() => { setEditingRisk(risk); setIsModalOpen(true); }}
                                                className="p-2 hover:bg-white/10 rounded-lg text-slate-400 hover:text-white transition-all"
                                            >
                                                <MoreVertical className="w-4 h-4" />
                                            </button>
                                            <button
                                                onClick={() => deleteRisk(risk.id)}
                                                className="p-2 hover:bg-rose-500/20 rounded-lg text-slate-500 hover:text-rose-400 transition-all"
                                            >
                                                <RotateCcw className="w-4 h-4" />
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
                    <div className="relative glass-panel w-full max-w-2xl border border-white/10 shadow-2xl animate-in zoom-in-95 duration-200">
                        <div className="flex items-center justify-between p-6 border-b border-white/5">
                            <h2 className="text-xl font-bold flex items-center gap-2">
                                {editingRisk?.id ? 'Edit Risk Analysis' : 'New Quantitative Risk'}
                            </h2>
                            <button onClick={() => setIsModalOpen(false)} className="text-slate-400 hover:text-white">
                                <X className="w-6 h-6" />
                            </button>
                        </div>

                        <form onSubmit={handleSaveRisk} className="p-6 space-y-6">
                            <div className="grid grid-cols-2 gap-6">
                                <div className="col-span-2 space-y-2">
                                    <label className="text-xs font-bold text-slate-400 uppercase">Risk Title</label>
                                    <input
                                        type="text"
                                        required
                                        className="w-full bg-slate-900/50 border border-white/10 rounded-xl px-4 py-2.5 text-white focus:outline-none focus:border-indigo-500"
                                        value={editingRisk?.title}
                                        onChange={e => setEditingRisk({ ...editingRisk!, title: e.target.value })}
                                    />
                                </div>

                                <div className="space-y-2">
                                    <label className="text-xs font-bold text-slate-400 uppercase">Category</label>
                                    <select
                                        className="w-full bg-slate-900/50 border border-white/10 rounded-xl px-4 py-2.5 text-white focus:outline-none focus:border-indigo-500"
                                        value={editingRisk?.category}
                                        onChange={e => setEditingRisk({ ...editingRisk!, category: e.target.value })}
                                    >
                                        <option>Operational</option>
                                        <option>Financial</option>
                                        <option>Strategic</option>
                                        <option>Compliance</option>
                                    </select>
                                </div>

                                <div className="space-y-2">
                                    <label className="text-xs font-bold text-slate-400 uppercase">Criticality</label>
                                    <select
                                        className="w-full bg-slate-900/50 border border-white/10 rounded-xl px-4 py-2.5 text-white focus:outline-none focus:border-indigo-500"
                                        value={editingRisk?.criticality}
                                        onChange={e => setEditingRisk({ ...editingRisk!, criticality: e.target.value })}
                                    >
                                        <option>Low</option>
                                        <option>Medium</option>
                                        <option>High</option>
                                        <option>Extreme</option>
                                    </select>
                                </div>

                                <div className="space-y-2">
                                    <label className="text-xs font-bold text-slate-400 uppercase tracking-tighter flex justify-between">
                                        Probability <span>{Math.round((editingRisk?.probability || 0) * 100)}%</span>
                                    </label>
                                    <input
                                        type="range" min="0" max="1" step="0.01"
                                        className="w-full h-1.5 bg-slate-800 rounded-lg appearance-none cursor-pointer accent-indigo-500"
                                        value={editingRisk?.probability}
                                        onChange={e => setEditingRisk({ ...editingRisk!, probability: parseFloat(e.target.value) })}
                                    />
                                </div>

                                <div className="space-y-2">
                                    <label className="text-xs font-bold text-slate-400 uppercase">Est. Impact ($)</label>
                                    <input
                                        type="number"
                                        className="w-full bg-slate-900/50 border border-white/10 rounded-xl px-4 py-2.5 text-white focus:outline-none focus:border-indigo-500 font-mono"
                                        value={editingRisk?.impact}
                                        onChange={e => setEditingRisk({ ...editingRisk!, impact: parseFloat(e.target.value) })}
                                    />
                                </div>
                            </div>

                            {/* Advanced Simulation Parameters */}
                            <div className="pt-4 border-t border-white/5 space-y-4">
                                <div className="flex items-center gap-2 text-indigo-400 text-sm font-bold">
                                    <RotateCcw className="w-4 h-4" /> Simulation Parameters (Triangle Distribution)
                                </div>
                                <div className="grid grid-cols-3 gap-4">
                                    <div className="space-y-1">
                                        <label className="text-[10px] text-slate-500 font-bold uppercase">Min Loss ($)</label>
                                        <input
                                            type="number"
                                            className="w-full bg-slate-900/50 border border-white/10 rounded-lg px-3 py-1.5 text-xs text-white focus:outline-none"
                                            value={editingRisk?.minImpact || ''}
                                            placeholder="Low end"
                                            onChange={e => setEditingRisk({ ...editingRisk!, minImpact: parseFloat(e.target.value) })}
                                        />
                                    </div>
                                    <div className="space-y-1">
                                        <label className="text-[10px] text-slate-500 font-bold uppercase">Most Likely ($)</label>
                                        <input
                                            type="number"
                                            className="w-full bg-slate-900/50 border border-white/10 rounded-lg px-3 py-1.5 text-xs text-white focus:outline-none border-indigo-500/30"
                                            value={editingRisk?.mostLikelyImpact || ''}
                                            placeholder="Peak"
                                            onChange={e => setEditingRisk({ ...editingRisk!, mostLikelyImpact: parseFloat(e.target.value) })}
                                        />
                                    </div>
                                    <div className="space-y-1">
                                        <label className="text-[10px] text-slate-500 font-bold uppercase">Max Loss ($)</label>
                                        <input
                                            type="number"
                                            className="w-full bg-slate-900/50 border border-white/10 rounded-lg px-3 py-1.5 text-xs text-white focus:outline-none"
                                            value={editingRisk?.maxImpact || ''}
                                            placeholder="High end"
                                            onChange={e => setEditingRisk({ ...editingRisk!, maxImpact: parseFloat(e.target.value) })}
                                        />
                                    </div>
                                </div>
                            </div>

                            <div className="flex justify-end gap-3 pt-4">
                                <button
                                    type="button"
                                    onClick={() => setIsModalOpen(false)}
                                    className="px-6 py-2 rounded-xl text-slate-400 hover:bg-white/5 transition-all"
                                >
                                    Cancel
                                </button>
                                <button
                                    type="submit"
                                    className="px-8 py-2 rounded-xl bg-indigo-500 text-white font-bold hover:bg-indigo-400 transition-all shadow-lg shadow-indigo-500/20"
                                >
                                    Analyze & Save
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
}
