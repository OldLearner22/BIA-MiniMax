import React from 'react';
import { X, AlertTriangle, Layers, Database, ArrowRight } from 'lucide-react';
import { Process, BusinessResource } from '../types';

interface ComplianceViolation {
    id: string;
    name: string;
    type: 'process' | 'resource';
    rto: number;
    targetRto: number;
}

interface WarningDetailsModalProps {
    isOpen: boolean;
    onClose: () => void;
    type: 'spof' | 'compliance' | null;
    spofProcesses: Process[];
    complianceViolations: ComplianceViolation[];
}

export function WarningDetailsModal({ isOpen, onClose, type, spofProcesses, complianceViolations }: WarningDetailsModalProps) {
    if (!isOpen || !type) return null;

    return (
        <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/50 backdrop-blur-sm p-4">
            <div className="w-full max-w-2xl bg-bia-card border border-bia-border rounded-xl shadow-2xl flex flex-col max-h-[80vh] overflow-hidden animate-fade-in">
                {/* Header */}
                <div className="flex items-center justify-between p-6 border-b border-white/10 bg-black/20">
                    <div className="flex items-center gap-3">
                        <div className={`p-2 rounded-lg ${type === 'spof' ? 'bg-bia-critical/10 text-bia-critical' : 'bg-red-500/10 text-red-500'}`}>
                            <AlertTriangle className="w-6 h-6" />
                        </div>
                        <div>
                            <h2 className="text-xl font-bold text-bia-text-primary">
                                {type === 'spof' ? 'Single Points of Failure (SPOF)' : 'Compliance Gaps'}
                            </h2>
                            <p className="text-sm text-bia-text-secondary mt-1">
                                {type === 'spof'
                                    ? 'These processes have 2 or more downstream dependencies but may lack redundancy.'
                                    : 'These dependencies have recovery times (RTO) that exceed the main process targets.'}
                            </p>
                        </div>
                    </div>
                    <button onClick={onClose} className="p-2 hover:bg-white/10 rounded-lg transition-colors text-bia-text-secondary hover:text-white">
                        <X className="w-5 h-5" />
                    </button>
                </div>

                {/* Content */}
                <div className="flex-1 overflow-y-auto p-6 space-y-4">
                    {type === 'spof' && (
                        <div className="grid gap-3">
                            {spofProcesses.map(p => (
                                <div key={p.id} className="p-4 bg-white/5 border border-white/10 rounded-lg flex items-center justify-between group hover:border-bia-critical/50 transition-colors">
                                    <div className="flex items-center gap-4">
                                        <div className="p-2 bg-pink-500/10 rounded text-pink-500">
                                            <Layers className="w-5 h-5" />
                                        </div>
                                        <div>
                                            <h4 className="font-semibold text-bia-text-primary">{p.name}</h4>
                                            <div className="flex items-center gap-2 mt-1">
                                                <span className={`px-2 py-0.5 text-[10px] uppercase rounded-full bg-black/40 border border-white/10 font-medium criticality-${p.criticality}`}>
                                                    {p.criticality}
                                                </span>
                                                <span className="text-xs text-bia-text-secondary">Depended on by multiple processes</span>
                                            </div>
                                        </div>
                                    </div>
                                    <div className="text-right">
                                        <span className="text-xs font-mono text-bia-critical bg-bia-critical/10 px-2 py-1 rounded">Potential Bottleneck</span>
                                    </div>
                                </div>
                            ))}
                        </div>
                    )}

                    {type === 'compliance' && (
                        <div className="grid gap-3">
                            {complianceViolations.map(v => (
                                <div key={v.id} className="p-4 bg-white/5 border border-white/10 rounded-lg flex items-center justify-between group hover:border-red-500/50 transition-colors">
                                    <div className="flex items-center gap-4">
                                        <div className={`p-2 rounded ${v.type === 'process' ? 'bg-pink-500/10 text-pink-500' : 'bg-blue-500/10 text-blue-500'}`}>
                                            {v.type === 'process' ? <Layers className="w-5 h-5" /> : <Database className="w-5 h-5" />}
                                        </div>
                                        <div>
                                            <h4 className="font-semibold text-bia-text-primary">{v.name}</h4>
                                            <div className="flex items-center gap-2 mt-1 text-xs text-bia-text-secondary">
                                                <span className="uppercase">{v.type}</span>
                                                <span>•</span>
                                                <span>Impacts Main Process</span>
                                            </div>
                                        </div>
                                    </div>

                                    <div className="flex items-center gap-4">
                                        <div className="flex flex-col items-end">
                                            <span className="text-xs text-bia-text-tertiary mb-1">Recovery Time</span>
                                            <div className="flex items-center gap-2 font-mono text-sm">
                                                <span className="text-red-400 font-bold">{v.rto}h</span>
                                                <ArrowRight className="w-4 h-4 text-white/20" />
                                                <span className="text-bia-text-secondary" title="Target RTO">{v.targetRto}h</span>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            ))}
                        </div>
                    )}
                </div>

                {/* Footer */}
                <div className="p-4 border-t border-white/10 bg-black/20 flex justify-end">
                    <button onClick={onClose} className="px-4 py-2 bg-white/10 hover:bg-white/20 text-white rounded-lg text-sm font-medium transition-colors">
                        Close
                    </button>
                </div>
            </div>
        </div>
    );
}
