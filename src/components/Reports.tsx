import { useState, useMemo } from 'react';
import { useStore } from '../store/useStore';
import { DEFAULT_IMPACT_CATEGORIES, DEFAULT_BUSINESS_RESOURCES, TimeValue } from '../types';
import { ScatterChart, Scatter, XAxis, YAxis, ZAxis, Tooltip, ResponsiveContainer, Cell } from 'recharts';
import { FileText, Download, AlertTriangle, CheckCircle, XCircle, Shield, AlertOctagon, Clock, Users, Layers } from 'lucide-react';

type ReportType = 'executive' | 'risk-matrix' | 'compliance' | 'bcdr-gap';

// Helper to convert TimeValue to hours
const timeValueToHours = (tv?: TimeValue): number => {
  if (!tv) return Infinity;
  switch (tv.unit) {
    case 'minutes': return tv.value / 60;
    case 'hours': return tv.value;
    case 'days': return tv.value * 24;
    default: return tv.value;
  }
};

const formatTimeValue = (tv?: TimeValue) => tv ? `${tv.value} ${tv.unit}` : 'Not defined';

// Risk Matrix Grid Component
interface RiskMatrixViewProps {
  processes: any[];
  impacts: Record<string, any>;
  categories: any[];
  calculateRiskScore: (id: string) => number;
}

function RiskMatrixView({ processes, impacts, categories, calculateRiskScore }: RiskMatrixViewProps) {
  const [selectedProcess, setSelectedProcess] = useState<any | null>(null);
  const [filterDept, setFilterDept] = useState<string>('all');
  const [filterCriticality, setFilterCriticality] = useState<string>('all');

  const departments = [...new Set(processes.map(p => p.department))];

  // Calculate grid position for each process
  const processPositions = useMemo(() => {
    return processes.map(p => {
      const impact = impacts[p.id] as Record<string, number> | undefined;
      const avgImpact = impact 
        ? Math.round(categories.reduce((sum, cat) => sum + (impact[cat.id] || 0), 0) / categories.length)
        : 0;
      const likelihood = p.criticality === 'critical' ? 5 : p.criticality === 'high' ? 4 : p.criticality === 'medium' ? 3 : p.criticality === 'low' ? 2 : 1;
      const riskScore = calculateRiskScore(p.id);
      return { ...p, impact: Math.min(5, Math.max(1, avgImpact || 1)), likelihood, riskScore };
    });
  }, [processes, impacts, categories, calculateRiskScore]);

  // Filter processes
  const filteredProcesses = processPositions.filter(p => {
    if (filterDept !== 'all' && p.department !== filterDept) return false;
    if (filterCriticality !== 'all' && p.criticality !== filterCriticality) return false;
    return true;
  });

  // Group processes by cell
  const gridCells: Record<string, any[]> = {};
  filteredProcesses.forEach(p => {
    const key = `${p.likelihood}-${p.impact}`;
    if (!gridCells[key]) gridCells[key] = [];
    gridCells[key].push(p);
  });

  // Cell color based on risk level
  const getCellColor = (likelihood: number, impact: number) => {
    const risk = likelihood * impact;
    if (risk >= 20) return 'bg-red-500/30 border-red-500/50';
    if (risk >= 12) return 'bg-orange-500/30 border-orange-500/50';
    if (risk >= 6) return 'bg-yellow-500/30 border-yellow-500/50';
    return 'bg-green-500/30 border-green-500/50';
  };

  // Quadrant labels
  const getQuadrantLabel = (likelihood: number, impact: number) => {
    if (likelihood >= 4 && impact >= 4) return 'Critical - Immediate Action';
    if (likelihood >= 4 && impact < 4) return 'Monitor Closely';
    if (likelihood < 4 && impact >= 4) return 'Manage Proactively';
    return 'Low Priority';
  };

  // Zone counts
  const zoneCounts = {
    critical: filteredProcesses.filter(p => p.likelihood * p.impact >= 20).length,
    high: filteredProcesses.filter(p => p.likelihood * p.impact >= 12 && p.likelihood * p.impact < 20).length,
    medium: filteredProcesses.filter(p => p.likelihood * p.impact >= 6 && p.likelihood * p.impact < 12).length,
    low: filteredProcesses.filter(p => p.likelihood * p.impact < 6).length,
  };

  return (
    <div className="space-y-6">
      {/* Filters */}
      <div className="glass-panel p-4 flex flex-wrap gap-4 items-center">
        <div className="flex items-center gap-2">
          <span className="text-sm text-bia-text-secondary">Department:</span>
          <select value={filterDept} onChange={(e) => setFilterDept(e.target.value)} className="glass-input text-sm py-1">
            <option value="all">All Departments</option>
            {departments.map(d => <option key={d} value={d}>{d}</option>)}
          </select>
        </div>
        <div className="flex items-center gap-2">
          <span className="text-sm text-bia-text-secondary">Criticality:</span>
          <select value={filterCriticality} onChange={(e) => setFilterCriticality(e.target.value)} className="glass-input text-sm py-1">
            <option value="all">All Levels</option>
            <option value="critical">Critical</option>
            <option value="high">High</option>
            <option value="medium">Medium</option>
            <option value="low">Low</option>
          </select>
        </div>
        <div className="flex-1" />
        {/* Zone Summary */}
        <div className="flex gap-3 text-xs">
          <span className="px-2 py-1 bg-red-500/20 text-red-400 rounded">Critical: {zoneCounts.critical}</span>
          <span className="px-2 py-1 bg-orange-500/20 text-orange-400 rounded">High: {zoneCounts.high}</span>
          <span className="px-2 py-1 bg-yellow-500/20 text-yellow-400 rounded">Medium: {zoneCounts.medium}</span>
          <span className="px-2 py-1 bg-green-500/20 text-green-400 rounded">Low: {zoneCounts.low}</span>
        </div>
      </div>

      {/* 5x5 Risk Matrix Grid */}
      <div className="glass-panel p-6">
        <h3 className="text-lg font-semibold text-bia-text-primary mb-4">Risk Matrix (5×5 Grid)</h3>
        
        <div className="flex">
          {/* Y-axis label */}
          <div className="flex flex-col justify-center items-center pr-2 w-8">
            <span className="text-xs text-bia-text-tertiary writing-mode-vertical transform -rotate-180" style={{ writingMode: 'vertical-rl' }}>
              LIKELIHOOD →
            </span>
          </div>

          <div className="flex-1">
            {/* Grid */}
            <div className="grid grid-cols-6 gap-1">
              {/* Header row */}
              <div className="h-10" />
              {[1, 2, 3, 4, 5].map(i => (
                <div key={i} className="h-10 flex items-center justify-center text-xs text-bia-text-tertiary font-medium">
                  {i === 1 ? 'Very Low' : i === 2 ? 'Low' : i === 3 ? 'Medium' : i === 4 ? 'High' : 'Very High'}
                </div>
              ))}

              {/* Grid rows (5 to 1) */}
              {[5, 4, 3, 2, 1].map(likelihood => (
                <>
                  {/* Row label */}
                  <div key={`label-${likelihood}`} className="h-20 flex items-center justify-center text-xs text-bia-text-tertiary">
                    {likelihood}
                  </div>
                  {/* Cells */}
                  {[1, 2, 3, 4, 5].map(impact => {
                    const key = `${likelihood}-${impact}`;
                    const cellProcesses = gridCells[key] || [];
                    return (
                      <div
                        key={key}
                        className={`h-20 rounded border ${getCellColor(likelihood, impact)} p-1 flex flex-wrap gap-1 content-start overflow-hidden relative group`}
                      >
                        {cellProcesses.slice(0, 4).map((p, i) => (
                          <button
                            key={p.id}
                            onClick={() => setSelectedProcess(p)}
                            className={`w-6 h-6 rounded-full flex items-center justify-center text-[10px] font-bold transition-transform hover:scale-110 ${
                              p.criticality === 'critical' ? 'bg-red-500 text-white' :
                              p.criticality === 'high' ? 'bg-orange-500 text-white' :
                              p.criticality === 'medium' ? 'bg-blue-500 text-white' :
                              'bg-green-500 text-white'
                            }`}
                            title={p.name}
                          >
                            {p.name.slice(0, 2).toUpperCase()}
                          </button>
                        ))}
                        {cellProcesses.length > 4 && (
                          <span className="text-[10px] text-bia-text-tertiary">+{cellProcesses.length - 4}</span>
                        )}
                        {/* Quadrant tooltip on hover */}
                        <div className="absolute inset-0 opacity-0 group-hover:opacity-100 bg-black/80 flex items-center justify-center transition-opacity pointer-events-none z-10">
                          <span className="text-[10px] text-white text-center px-1">{getQuadrantLabel(likelihood, impact)}</span>
                        </div>
                      </div>
                    );
                  })}
                </>
              ))}
            </div>

            {/* X-axis label */}
            <div className="text-center mt-2">
              <span className="text-xs text-bia-text-tertiary">IMPACT →</span>
            </div>
          </div>
        </div>

        {/* Legend */}
        <div className="flex justify-center gap-4 mt-4 pt-4 border-t border-bia-border">
          <div className="flex items-center gap-2"><div className="w-4 h-4 rounded bg-red-500/50" /><span className="text-xs text-bia-text-secondary">Critical (≥20)</span></div>
          <div className="flex items-center gap-2"><div className="w-4 h-4 rounded bg-orange-500/50" /><span className="text-xs text-bia-text-secondary">High (12-19)</span></div>
          <div className="flex items-center gap-2"><div className="w-4 h-4 rounded bg-yellow-500/50" /><span className="text-xs text-bia-text-secondary">Medium (6-11)</span></div>
          <div className="flex items-center gap-2"><div className="w-4 h-4 rounded bg-green-500/50" /><span className="text-xs text-bia-text-secondary">Low (&lt;6)</span></div>
        </div>
      </div>

      {/* Selected Process Detail */}
      {selectedProcess && (
        <div className="glass-panel p-6 border-2 border-bia-primary/50">
          <div className="flex items-start justify-between mb-4">
            <div>
              <h3 className="text-lg font-semibold text-bia-text-primary">{selectedProcess.name}</h3>
              <p className="text-sm text-bia-text-tertiary">{selectedProcess.department} • {selectedProcess.owner}</p>
            </div>
            <button onClick={() => setSelectedProcess(null)} className="text-bia-text-tertiary hover:text-bia-text-primary">
              <XCircle className="w-5 h-5" />
            </button>
          </div>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div className="text-center p-3 bg-black/20 rounded">
              <p className="text-xs text-bia-text-tertiary">Criticality</p>
              <p className={`text-lg font-bold criticality-${selectedProcess.criticality}`}>{selectedProcess.criticality}</p>
            </div>
            <div className="text-center p-3 bg-black/20 rounded">
              <p className="text-xs text-bia-text-tertiary">Likelihood</p>
              <p className="text-lg font-bold text-bia-warning">{selectedProcess.likelihood}/5</p>
            </div>
            <div className="text-center p-3 bg-black/20 rounded">
              <p className="text-xs text-bia-text-tertiary">Impact</p>
              <p className="text-lg font-bold text-bia-secondary">{selectedProcess.impact}/5</p>
            </div>
            <div className="text-center p-3 bg-black/20 rounded">
              <p className="text-xs text-bia-text-tertiary">Risk Score</p>
              <p className="text-lg font-bold text-bia-critical">{selectedProcess.riskScore}</p>
            </div>
          </div>
          <p className="text-sm text-bia-text-secondary mt-4">{selectedProcess.description}</p>
        </div>
      )}

      {/* Process List sorted by risk */}
      <div className="glass-panel p-6">
        <h3 className="text-lg font-semibold text-bia-text-primary mb-4">All Processes by Risk Score</h3>
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-black/20">
              <tr className="text-left text-xs text-bia-text-secondary uppercase">
                <th className="p-3">Process</th>
                <th className="p-3">Department</th>
                <th className="p-3">Criticality</th>
                <th className="p-3">Likelihood</th>
                <th className="p-3">Impact</th>
                <th className="p-3">Risk Score</th>
                <th className="p-3">Zone</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[rgba(255,255,255,0.05)]">
              {[...filteredProcesses].sort((a, b) => b.riskScore - a.riskScore).map((p) => {
                const risk = p.likelihood * p.impact;
                const zone = risk >= 20 ? 'Critical' : risk >= 12 ? 'High' : risk >= 6 ? 'Medium' : 'Low';
                const zoneColor = risk >= 20 ? 'text-red-400 bg-red-500/20' : risk >= 12 ? 'text-orange-400 bg-orange-500/20' : risk >= 6 ? 'text-yellow-400 bg-yellow-500/20' : 'text-green-400 bg-green-500/20';
                return (
                  <tr key={p.id} className="hover:bg-[rgba(255,255,255,0.02)] cursor-pointer" onClick={() => setSelectedProcess(p)}>
                    <td className="p-3 text-bia-text-primary font-medium">{p.name}</td>
                    <td className="p-3 text-bia-text-secondary">{p.department}</td>
                    <td className="p-3"><span className={`px-2 py-1 rounded-full text-xs font-medium criticality-${p.criticality}`}>{p.criticality}</span></td>
                    <td className="p-3 text-bia-text-secondary">{p.likelihood}/5</td>
                    <td className="p-3 text-bia-text-secondary">{p.impact}/5</td>
                    <td className="p-3 text-bia-warning font-bold">{p.riskScore}</td>
                    <td className="p-3"><span className={`px-2 py-1 rounded text-xs ${zoneColor}`}>{zone}</span></td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}

export function Reports() {
  const { processes, impacts, recoveryObjectives, settings, temporalData } = useStore();
  const [activeReport, setActiveReport] = useState<ReportType>('executive');

  const categories = settings.impactCategories || DEFAULT_IMPACT_CATEGORIES;
  const businessResources = settings.businessResources || DEFAULT_BUSINESS_RESOURCES;
  const timelinePoints = settings.customTimelinePoints || [];

  // Load dependency maps from localStorage
  const dependencyMaps = useMemo(() => {
    try {
      const saved = localStorage.getItem('bia-process-dependency-maps');
      return saved ? JSON.parse(saved) : {};
    } catch { return {}; }
  }, []);

  // Calculate risk score using dynamic categories
  const calculateRiskScore = (processId: string): number => {
    const impact = impacts[processId] as Record<string, number> | undefined;
    if (!impact) return 0;
    let total = 0, weightSum = 0;
    categories.forEach(cat => {
      const value = impact[cat.id] || 0;
      total += value * cat.weight;
      weightSum += cat.weight;
    });
    return weightSum > 0 ? parseFloat((total / weightSum).toFixed(2)) : 0;
  };

  const criticalCount = processes.filter(p => p.criticality === 'critical').length;
  const highCount = processes.filter(p => p.criticality === 'high').length;
  const compliantCount = processes.filter(p => p.status === 'approved').length;
  const avgRisk = processes.length > 0 
    ? (processes.reduce((a, p) => a + calculateRiskScore(p.id), 0) / processes.length).toFixed(2) 
    : '0.00';

  // BCDR Gap Analysis
  const bcdrAnalysis = useMemo(() => {
    const rtoGaps: { processName: string; processRTO: number; resourceName: string; resourceRTO: number; gap: number }[] = [];
    const rpoGaps: { processName: string; processRPO: number; resourceName: string; resourceRPO: number; gap: number }[] = [];
    const singlePointsOfFailure: { resourceName: string; resourceId: string; processCount: number; processes: string[] }[] = [];
    const missingDependencies: { processId: string; processName: string }[] = [];
    const cascadeImpacts: { resourceName: string; resourceId: string; affectedProcesses: string[] }[] = [];
    const quantityWarnings: { processName: string; timepoint: string; needed: number; available: number }[] = [];
    const recoveryPriority: { processId: string; processName: string; criticality: string; rto: number; score: number }[] = [];

    // Resource usage map
    const resourceUsage: Record<string, string[]> = {};

    // Analyze each process
    processes.forEach(process => {
      const processRecovery = recoveryObjectives[process.id];
      const processRTOHours = processRecovery?.rto || Infinity;
      const processRPOHours = processRecovery?.rpo || Infinity;
      
      // Check if process has dependency mapping
      const depMap = dependencyMaps[process.id];
      if (!depMap || depMap.nodes?.length <= 1) {
        missingDependencies.push({ processId: process.id, processName: process.name });
      }

      // Analyze dependencies
      if (depMap?.nodes) {
        depMap.nodes.forEach((node: any) => {
          if (node.data?.resourceType) {
            // It's a resource node
            const resource = businessResources.find(r => node.data.label === r.name);
            if (resource) {
              // Track resource usage
              if (!resourceUsage[resource.id]) resourceUsage[resource.id] = [];
              if (!resourceUsage[resource.id].includes(process.name)) {
                resourceUsage[resource.id].push(process.name);
              }

              // RTO gap analysis
              const resourceRTOHours = timeValueToHours(resource.rto);
              if (resourceRTOHours > processRTOHours && processRTOHours < Infinity) {
                rtoGaps.push({
                  processName: process.name,
                  processRTO: processRTOHours,
                  resourceName: resource.name,
                  resourceRTO: resourceRTOHours,
                  gap: resourceRTOHours - processRTOHours
                });
              }

              // RPO gap analysis (for data/systems)
              if (resource.type === 'data' || resource.type === 'systems') {
                const resourceRPOHours = timeValueToHours(resource.rpo);
                if (resourceRPOHours > processRPOHours && processRPOHours < Infinity) {
                  rpoGaps.push({
                    processName: process.name,
                    processRPO: processRPOHours,
                    resourceName: resource.name,
                    resourceRPO: resourceRPOHours,
                    gap: resourceRPOHours - processRPOHours
                  });
                }
              }
            }
          }
        });
      }

      // Recovery priority
      const critScore = process.criticality === 'critical' ? 5 : process.criticality === 'high' ? 4 : process.criticality === 'medium' ? 3 : 2;
      const riskScore = calculateRiskScore(process.id);
      recoveryPriority.push({
        processId: process.id,
        processName: process.name,
        criticality: process.criticality,
        rto: processRTOHours === Infinity ? 999 : processRTOHours,
        score: critScore * 10 + riskScore * 5 + (processRTOHours < 24 ? 20 : processRTOHours < 72 ? 10 : 0)
      });
    });

    // Single points of failure & cascade impact
    Object.entries(resourceUsage).forEach(([resourceId, procs]) => {
      const resource = businessResources.find(r => r.id === resourceId);
      if (!resource) return;
      
      if (procs.length >= 2) {
        singlePointsOfFailure.push({
          resourceName: resource.name,
          resourceId,
          processCount: procs.length,
          processes: procs
        });
      }
      if (procs.length > 0) {
        cascadeImpacts.push({
          resourceName: resource.name,
          resourceId,
          affectedProcesses: procs
        });
      }
    });

    // Sort recovery priority
    recoveryPriority.sort((a, b) => b.score - a.score);

    // Calculate readiness score
    const totalChecks = processes.length * 4; // RTO, RPO, dependencies, quantities
    let passedChecks = 0;
    
    // RTO alignment
    passedChecks += processes.length - rtoGaps.length;
    // RPO alignment  
    passedChecks += processes.length - rpoGaps.length;
    // Dependency coverage
    passedChecks += processes.length - missingDependencies.length;
    // No single points of failure penalty
    passedChecks += Math.max(0, processes.length - singlePointsOfFailure.length);

    const readinessScore = totalChecks > 0 ? Math.round((passedChecks / totalChecks) * 100) : 0;

    return {
      rtoGaps,
      rpoGaps,
      singlePointsOfFailure,
      missingDependencies,
      cascadeImpacts,
      quantityWarnings,
      recoveryPriority: recoveryPriority.slice(0, 10),
      readinessScore,
      criticalIssues: rtoGaps.length + rpoGaps.length,
      warnings: singlePointsOfFailure.length + missingDependencies.length
    };
  }, [processes, recoveryObjectives, dependencyMaps, businessResources, categories, calculateRiskScore]);

  const getReadinessColor = (score: number) => {
    if (score >= 80) return 'text-bia-success';
    if (score >= 60) return 'text-bia-warning';
    return 'text-bia-critical';
  };

  const getReadinessBg = (score: number) => {
    if (score >= 80) return 'bg-bia-success/20 border-bia-success/50';
    if (score >= 60) return 'bg-bia-warning/20 border-bia-warning/50';
    return 'bg-bia-critical/20 border-bia-critical/50';
  };

  const riskMatrixData = processes.map((p) => {
    const impact = impacts[p.id] as Record<string, number> | undefined;
    const avgImpact = impact 
      ? categories.reduce((sum, cat) => sum + (impact[cat.id] || 0), 0) / categories.length 
      : 0;
    const criticality = p.criticality === 'critical' ? 5 : p.criticality === 'high' ? 4 : p.criticality === 'medium' ? 3 : 2;
    return { name: p.name, likelihood: criticality, impact: avgImpact, z: 100, criticality: p.criticality };
  });

  const getColor = (crit: string) => {
    if (crit === 'critical') return '#F87171';
    if (crit === 'high') return '#FBBF24';
    if (crit === 'medium') return '#60A5FA';
    return '#34D399';
  };

  const downloadReport = () => {
    const content = generateReportContent();
    const blob = new Blob([content], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `bia-${activeReport}-report.txt`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const generateReportContent = () => {
    const date = new Date().toISOString().split('T')[0];
    let content = `BIA Report - ${activeReport.toUpperCase()}\nGenerated: ${date}\n${'='.repeat(50)}\n\n`;

    if (activeReport === 'executive') {
      content += `EXECUTIVE SUMMARY\n\nTotal Processes: ${processes.length}\nCritical Processes: ${criticalCount}\nHigh Priority: ${highCount}\nAverage Risk Score: ${avgRisk}/5\nCompliance Rate: ${processes.length > 0 ? ((compliantCount / processes.length) * 100).toFixed(0) : 0}%\n\n`;
      content += `IMPACT CATEGORIES:\n`;
      categories.forEach(cat => {
        content += `- ${cat.name} (${cat.weight}%): ${cat.description}\n`;
      });
    } else if (activeReport === 'bcdr-gap') {
      content += `BCDR GAP ANALYSIS\n\n`;
      content += `BCDR Readiness Score: ${bcdrAnalysis.readinessScore}%\n`;
      content += `Critical Issues: ${bcdrAnalysis.criticalIssues}\n`;
      content += `Warnings: ${bcdrAnalysis.warnings}\n\n`;
      
      content += `RTO GAPS:\n`;
      bcdrAnalysis.rtoGaps.forEach(g => {
        content += `- ${g.processName} needs ${g.processRTO}h, but ${g.resourceName} has RTO of ${g.resourceRTO}h (Gap: ${g.gap}h)\n`;
      });
      
      content += `\nRPO GAPS:\n`;
      bcdrAnalysis.rpoGaps.forEach(g => {
        content += `- ${g.processName} needs RPO ${g.processRPO}h, but ${g.resourceName} has RPO of ${g.resourceRPO}h\n`;
      });
      
      content += `\nSINGLE POINTS OF FAILURE:\n`;
      bcdrAnalysis.singlePointsOfFailure.forEach(s => {
        content += `- ${s.resourceName} affects ${s.processCount} processes: ${s.processes.join(', ')}\n`;
      });

      content += `\nRECOVERY PRIORITY:\n`;
      bcdrAnalysis.recoveryPriority.forEach((p, i) => {
        content += `${i + 1}. ${p.processName} (${p.criticality}, RTO: ${p.rto}h)\n`;
      });
    } else if (activeReport === 'risk-matrix') {
      content += `RISK MATRIX\n\n`;
      processes.forEach(p => {
        const impact = impacts[p.id] as Record<string, number> | undefined;
        content += `\n${p.name}\n  Criticality: ${p.criticality}\n`;
        categories.forEach(cat => {
          content += `  ${cat.name}: ${impact?.[cat.id] || 0}/5\n`;
        });
      });
    } else {
      content += `COMPLIANCE REPORT (ISO 22301:2019)\n\n`;
      processes.forEach(p => {
        const recovery = recoveryObjectives[p.id];
        content += `${p.name}\n  Status: ${p.status}\n  RTO: ${recovery?.rto || '-'}h\n  RPO: ${recovery?.rpo || '-'}h\n  MTPD: ${recovery?.mtpd || '-'}h\n\n`;
      });
    }
    return content;
  };

  return (
    <div className="animate-fade-in space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-bia-text-primary">Reports</h1>
          <p className="text-bia-text-secondary mt-1">Generate and export BIA reports</p>
        </div>
        <button onClick={downloadReport} className="glass-button-solid flex items-center gap-2">
          <Download className="w-4 h-4" /> Export Report
        </button>
      </div>

      {/* Report Tabs */}
      <div className="glass-panel p-2 flex flex-wrap gap-2">
        {[
          { id: 'executive', label: 'Executive Summary', icon: FileText },
          { id: 'risk-matrix', label: 'Risk Matrix', icon: AlertTriangle },
          { id: 'compliance', label: 'Compliance', icon: CheckCircle },
          { id: 'bcdr-gap', label: 'BCDR Gap Analysis', icon: Shield },
        ].map((tab) => (
          <button key={tab.id} onClick={() => setActiveReport(tab.id as ReportType)}
            className={`flex items-center gap-2 px-4 py-2 rounded-bia-sm transition-all ${activeReport === tab.id ? 'bg-bia-glass-active text-bia-primary' : 'text-bia-text-secondary hover:text-bia-text-primary'}`}>
            <tab.icon className="w-4 h-4" />
            {tab.label}
          </button>
        ))}
      </div>

      {/* BCDR Gap Analysis */}
      {activeReport === 'bcdr-gap' && (
        <div className="space-y-6">
          {/* Readiness Score */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div className={`glass-panel p-6 text-center border-2 ${getReadinessBg(bcdrAnalysis.readinessScore)}`}>
              <p className="text-bia-text-secondary text-sm">BCDR Readiness</p>
              <p className={`text-4xl font-bold mt-2 ${getReadinessColor(bcdrAnalysis.readinessScore)}`}>{bcdrAnalysis.readinessScore}%</p>
            </div>
            <div className="glass-panel p-6 text-center">
              <p className="text-bia-text-secondary text-sm">Critical Issues</p>
              <p className="text-4xl font-bold text-bia-critical mt-2">{bcdrAnalysis.criticalIssues}</p>
            </div>
            <div className="glass-panel p-6 text-center">
              <p className="text-bia-text-secondary text-sm">Warnings</p>
              <p className="text-4xl font-bold text-bia-warning mt-2">{bcdrAnalysis.warnings}</p>
            </div>
            <div className="glass-panel p-6 text-center">
              <p className="text-bia-text-secondary text-sm">Resources Mapped</p>
              <p className="text-4xl font-bold text-bia-primary mt-2">{businessResources.length}</p>
            </div>
          </div>

          {/* RTO Gaps */}
          <div className="glass-panel p-6">
            <h3 className="text-lg font-semibold text-bia-text-primary mb-4 flex items-center gap-2">
              <Clock className="w-5 h-5 text-bia-critical" /> RTO Gap Analysis
            </h3>
            {bcdrAnalysis.rtoGaps.length === 0 ? (
              <div className="flex items-center gap-2 text-bia-success">
                <CheckCircle className="w-5 h-5" />
                <span>All resource RTOs align with process requirements</span>
              </div>
            ) : (
              <div className="space-y-2">
                {bcdrAnalysis.rtoGaps.map((gap, i) => (
                  <div key={i} className="p-3 bg-bia-critical/10 border border-bia-critical/30 rounded-lg flex items-start gap-3">
                    <AlertOctagon className="w-5 h-5 text-bia-critical flex-shrink-0 mt-0.5" />
                    <div>
                      <p className="text-bia-text-primary">
                        <span className="font-medium">{gap.processName}</span> requires recovery in <span className="text-bia-warning font-bold">{gap.processRTO}h</span>, 
                        but <span className="font-medium">{gap.resourceName}</span> has RTO of <span className="text-bia-critical font-bold">{gap.resourceRTO}h</span>
                      </p>
                      <p className="text-xs text-bia-text-tertiary mt-1">Gap: {gap.gap} hours - Resource is a bottleneck</p>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* RPO Gaps */}
          <div className="glass-panel p-6">
            <h3 className="text-lg font-semibold text-bia-text-primary mb-4 flex items-center gap-2">
              <Layers className="w-5 h-5 text-bia-secondary" /> RPO Compliance Check
            </h3>
            {bcdrAnalysis.rpoGaps.length === 0 ? (
              <div className="flex items-center gap-2 text-bia-success">
                <CheckCircle className="w-5 h-5" />
                <span>All data/system resource RPOs meet process requirements</span>
              </div>
            ) : (
              <div className="space-y-2">
                {bcdrAnalysis.rpoGaps.map((gap, i) => (
                  <div key={i} className="p-3 bg-bia-warning/10 border border-bia-warning/30 rounded-lg flex items-start gap-3">
                    <AlertTriangle className="w-5 h-5 text-bia-warning flex-shrink-0 mt-0.5" />
                    <div>
                      <p className="text-bia-text-primary">
                        <span className="font-medium">{gap.processName}</span> requires RPO of <span className="text-bia-secondary font-bold">{gap.processRPO}h</span>, 
                        but <span className="font-medium">{gap.resourceName}</span> has RPO of <span className="text-bia-warning font-bold">{gap.resourceRPO}h</span>
                      </p>
                      <p className="text-xs text-bia-text-tertiary mt-1">Potential data loss exceeds acceptable limits</p>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Single Points of Failure */}
          <div className="glass-panel p-6">
            <h3 className="text-lg font-semibold text-bia-text-primary mb-4 flex items-center gap-2">
              <AlertTriangle className="w-5 h-5 text-bia-warning" /> Single Points of Failure
            </h3>
            {bcdrAnalysis.singlePointsOfFailure.length === 0 ? (
              <div className="flex items-center gap-2 text-bia-success">
                <CheckCircle className="w-5 h-5" />
                <span>No single points of failure detected</span>
              </div>
            ) : (
              <div className="space-y-2">
                {bcdrAnalysis.singlePointsOfFailure.map((spof, i) => (
                  <div key={i} className="p-3 bg-bia-warning/10 border border-bia-warning/30 rounded-lg">
                    <div className="flex items-center gap-2 mb-2">
                      <Users className="w-4 h-4 text-bia-warning" />
                      <span className="text-bia-text-primary font-medium">{spof.resourceName}</span>
                      <span className="text-xs px-2 py-0.5 bg-bia-warning/20 text-bia-warning rounded">Affects {spof.processCount} processes</span>
                    </div>
                    <p className="text-sm text-bia-text-tertiary">
                      If this resource fails: <span className="text-bia-text-secondary">{spof.processes.join(', ')}</span> will be impacted
                    </p>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Missing Dependencies */}
          {bcdrAnalysis.missingDependencies.length > 0 && (
            <div className="glass-panel p-6">
              <h3 className="text-lg font-semibold text-bia-text-primary mb-4 flex items-center gap-2">
                <XCircle className="w-5 h-5 text-bia-text-tertiary" /> Missing Dependency Mappings
              </h3>
              <div className="flex flex-wrap gap-2">
                {bcdrAnalysis.missingDependencies.map((m, i) => (
                  <span key={i} className="px-3 py-1.5 bg-black/30 border border-bia-border rounded text-sm text-bia-text-secondary">
                    {m.processName}
                  </span>
                ))}
              </div>
              <p className="text-xs text-bia-text-tertiary mt-2">These processes have no resource dependencies mapped in Process Dependencies</p>
            </div>
          )}

          {/* Recovery Priority Matrix */}
          <div className="glass-panel p-6">
            <h3 className="text-lg font-semibold text-bia-text-primary mb-4 flex items-center gap-2">
              <Shield className="w-5 h-5 text-bia-primary" /> Recovery Priority Matrix
            </h3>
            <p className="text-sm text-bia-text-tertiary mb-4">Suggested recovery order based on criticality, impact scores, and RTO requirements</p>
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-black/20">
                  <tr className="text-left text-xs text-bia-text-secondary uppercase">
                    <th className="p-3">Priority</th>
                    <th className="p-3">Process</th>
                    <th className="p-3">Criticality</th>
                    <th className="p-3">RTO</th>
                    <th className="p-3">Priority Score</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-[rgba(255,255,255,0.05)]">
                  {bcdrAnalysis.recoveryPriority.map((p, i) => (
                    <tr key={p.processId} className="hover:bg-[rgba(255,255,255,0.02)]">
                      <td className="p-3">
                        <span className={`w-6 h-6 rounded-full inline-flex items-center justify-center text-xs font-bold ${
                          i < 3 ? 'bg-bia-critical text-white' : i < 6 ? 'bg-bia-warning text-black' : 'bg-bia-border text-bia-text-primary'
                        }`}>{i + 1}</span>
                      </td>
                      <td className="p-3 text-bia-text-primary font-medium">{p.processName}</td>
                      <td className="p-3"><span className={`px-2 py-1 rounded-full text-xs font-medium criticality-${p.criticality}`}>{p.criticality}</span></td>
                      <td className="p-3 text-bia-text-secondary">{p.rto === 999 ? 'Not set' : `${p.rto}h`}</td>
                      <td className="p-3 text-bia-primary font-bold">{p.score}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* Executive Summary */}
      {activeReport === 'executive' && (
        <div className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div className="glass-panel p-6 text-center">
              <p className="text-bia-text-secondary text-sm">Total Processes</p>
              <p className="text-4xl font-bold text-bia-primary mt-2">{processes.length}</p>
            </div>
            <div className="glass-panel p-6 text-center">
              <p className="text-bia-text-secondary text-sm">Critical</p>
              <p className="text-4xl font-bold text-bia-critical mt-2">{criticalCount}</p>
            </div>
            <div className="glass-panel p-6 text-center">
              <p className="text-bia-text-secondary text-sm">Avg Risk Score</p>
              <p className="text-4xl font-bold text-bia-warning mt-2">{avgRisk}</p>
            </div>
            <div className="glass-panel p-6 text-center">
              <p className="text-bia-text-secondary text-sm">Compliance</p>
              <p className="text-4xl font-bold text-bia-success mt-2">{processes.length > 0 ? ((compliantCount / processes.length) * 100).toFixed(0) : 0}%</p>
            </div>
          </div>

          <div className="glass-panel p-6">
            <h3 className="text-lg font-semibold text-bia-text-primary mb-4">Impact Categories</h3>
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-3">
              {categories.map(cat => (
                <div key={cat.id} className="p-3 bg-black/20 rounded-lg text-center">
                  <div className="w-4 h-4 rounded mx-auto mb-2" style={{ backgroundColor: cat.color }} />
                  <p className="text-sm text-bia-text-primary font-medium">{cat.name}</p>
                  <p className="text-xs text-bia-text-tertiary">{cat.weight}%</p>
                </div>
              ))}
            </div>
          </div>

          <div className="glass-panel p-6">
            <h3 className="text-lg font-semibold text-bia-text-primary mb-4">Critical Process Summary</h3>
            <div className="space-y-3">
              {processes.filter(p => p.criticality === 'critical' || p.criticality === 'high').map(p => (
                <div key={p.id} className="flex items-center justify-between p-3 rounded-bia-sm bg-black/20">
                  <div>
                    <p className="text-bia-text-primary font-medium">{p.name}</p>
                    <p className="text-sm text-bia-text-tertiary">{p.department} - {p.owner}</p>
                  </div>
                  <div className="flex items-center gap-4">
                    <span className={`px-2 py-1 rounded-full text-xs font-medium criticality-${p.criticality}`}>{p.criticality}</span>
                    <span className="text-bia-text-primary font-mono">Risk: {calculateRiskScore(p.id)}</span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* Risk Matrix */}
      {activeReport === 'risk-matrix' && (
        <RiskMatrixView 
          processes={processes} 
          impacts={impacts} 
          categories={categories}
          calculateRiskScore={calculateRiskScore}
        />
      )}

      {/* Compliance */}
      {activeReport === 'compliance' && (
        <div className="glass-panel p-6">
          <h3 className="text-lg font-semibold text-bia-text-primary mb-4">ISO 22301:2019 Compliance Status</h3>
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-black/20">
                <tr className="text-left text-xs text-bia-text-secondary uppercase">
                  <th className="p-3">Process</th>
                  <th className="p-3">Status</th>
                  <th className="p-3">RTO</th>
                  <th className="p-3">RPO</th>
                  <th className="p-3">MTPD</th>
                  <th className="p-3">Strategy</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[rgba(255,255,255,0.05)]">
                {processes.map((p) => {
                  const r = recoveryObjectives[p.id];
                  return (
                    <tr key={p.id} className="hover:bg-[rgba(255,255,255,0.02)]">
                      <td className="p-3 text-bia-text-primary">{p.name}</td>
                      <td className="p-3">
                        {p.status === 'approved' ? <CheckCircle className="w-5 h-5 text-bia-success" /> : <XCircle className="w-5 h-5 text-bia-warning" />}
                      </td>
                      <td className="p-3 text-bia-text-secondary">{r?.rto || '-'}h</td>
                      <td className="p-3 text-bia-text-secondary">{r?.rpo || '-'}h</td>
                      <td className="p-3 text-bia-text-secondary">{r?.mtpd || '-'}h</td>
                      <td className="p-3 text-bia-text-secondary capitalize">{r?.recoveryStrategy?.replace('-', ' ') || '-'}</td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
}
