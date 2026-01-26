import React, { useState } from 'react';
import { useStore } from '../store/useStore';
import { CostBenefitAnalysis, RecoveryOption } from '../types';
import { DollarSign, TrendingUp, BarChart3, Plus, Edit, Trash2, X, Save, Calculator } from 'lucide-react';

export default function CostBenefitAnalysisComponent() {
  const {
    costBenefitAnalyses,
    recoveryOptions,
    addCostBenefitAnalysis,
    updateCostBenefitAnalysis,
    deleteCostBenefitAnalysis,
    calculateCBA,
  } = useStore();

  const [showModal, setShowModal] = useState(false);
  const [editingAnalysis, setEditingAnalysis] = useState<CostBenefitAnalysis | null>(null);
  const [activeTab, setActiveTab] = useState<'list' | 'create'>('list');
  const [formData, setFormData] = useState<Partial<CostBenefitAnalysis>>({
    title: '',
    description: '',
    recoveryOptionIds: [],
    implementationCosts: { personnel: 0, technology: 0, infrastructure: 0, training: 0, external: 0, other: 0, total: 0 },
    operationalCosts: { personnel: 0, technology: 0, infrastructure: 0, training: 0, external: 0, other: 0, total: 0 },
    maintenanceCosts: { personnel: 0, technology: 0, infrastructure: 0, training: 0, external: 0, other: 0, total: 0 },
    avoidedLosses: { financial: 0, operational: 0, reputational: 0, legal: 0, total: 0 },
    totalCost: 0,
    totalBenefit: 0,
    netBenefit: 0,
    roi: 0,
    paybackPeriod: 0,
    bcRatio: 0,
    riskReduction: 0,
    status: 'draft',
    intangibleBenefits: [],
    recommendation: 'approve',
    recommendationNotes: '',
    bestCase: { roi: 0, netBenefit: 0 },
    worstCase: { roi: 0, netBenefit: 0 },
  });

  const handleCalculate = async () => {
    if (editingAnalysis) {
      await calculateCBA(editingAnalysis.id);
    }
  };

  const handleSave = async () => {
    if (!formData.title) {
      alert('Please enter a title');
      return;
    }

    try {
      // Calculate totals
      const implCosts = formData.implementationCosts || { personnel: 0, technology: 0, infrastructure: 0, training: 0, external: 0, other: 0, total: 0 };
      const operCosts = formData.operationalCosts || { personnel: 0, technology: 0, infrastructure: 0, training: 0, external: 0, other: 0, total: 0 };
      const maintCosts = formData.maintenanceCosts || { personnel: 0, technology: 0, infrastructure: 0, training: 0, external: 0, other: 0, total: 0 };
      const avoided = formData.avoidedLosses || { financial: 0, operational: 0, reputational: 0, legal: 0, total: 0 };

      const implTotal = implCosts.personnel + implCosts.technology + implCosts.infrastructure + implCosts.training + implCosts.external + implCosts.other;
      const operTotal = operCosts.personnel + operCosts.technology + operCosts.infrastructure + operCosts.training + operCosts.external + operCosts.other;
      const maintTotal = maintCosts.personnel + maintCosts.technology + maintCosts.infrastructure + maintCosts.training + maintCosts.external + maintCosts.other;

      const totalCost = implTotal + (operTotal * 3) + (maintTotal * 3); // 3-year total
      const totalBenefit = avoided.financial + avoided.operational + avoided.reputational + avoided.legal;
      const netBenefit = totalBenefit - totalCost;
      const roi = totalCost > 0 ? (netBenefit / totalCost) * 100 : 0;
      const bcRatio = totalCost > 0 ? totalBenefit / totalCost : 0;
      const paybackPeriod = totalBenefit > 0 ? (totalCost / (totalBenefit / 36)) : 0;

      const dataToSave = {
        ...formData,
        implementationCosts: { ...implCosts, total: implTotal },
        operationalCosts: { ...operCosts, total: operTotal },
        maintenanceCosts: { ...maintCosts, total: maintTotal },
        avoidedLosses: { ...avoided, total: totalBenefit },
        totalCost,
        totalBenefit,
        netBenefit,
        roi,
        bcRatio,
        paybackPeriod,
      };

      if (editingAnalysis) {
        await updateCostBenefitAnalysis(editingAnalysis.id, dataToSave);
      } else {
        await addCostBenefitAnalysis(dataToSave);
      }
      setShowModal(false);
      setEditingAnalysis(null);
      setFormData({
        title: '',
        description: '',
        recoveryOptionIds: [],
        implementationCosts: { personnel: 0, technology: 0, infrastructure: 0, training: 0, external: 0, other: 0, total: 0 },
        operationalCosts: { personnel: 0, technology: 0, infrastructure: 0, training: 0, external: 0, other: 0, total: 0 },
        maintenanceCosts: { personnel: 0, technology: 0, infrastructure: 0, training: 0, external: 0, other: 0, total: 0 },
        avoidedLosses: { financial: 0, operational: 0, reputational: 0, legal: 0, total: 0 },
        totalCost: 0,
        totalBenefit: 0,
        netBenefit: 0,
        roi: 0,
        paybackPeriod: 0,
        bcRatio: 0,
        riskReduction: 0,
        status: 'draft',
        intangibleBenefits: [],
        recommendation: 'approve',
        recommendationNotes: '',
        bestCase: { roi: 0, netBenefit: 0 },
        worstCase: { roi: 0, netBenefit: 0 },
      });
      setActiveTab('list');
    } catch (error) {
      console.error('Failed to save analysis', error);
      alert('Failed to save analysis');
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Delete this analysis?')) return;
    try {
      await deleteCostBenefitAnalysis(id);
    } catch (error) {
      console.error('Failed to delete analysis', error);
    }
  };

  return (
    <div className="space-y-8 animate-fade-in">
      {/* Hero Section */}
      <div className="glass-panel p-8">
        <h1 className="text-3xl font-bold text-bia-text-primary mb-6">Cost-Benefit Analysis</h1>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          <div className="text-center">
            <div className="text-3xl font-bold text-emerald-400">
              {costBenefitAnalyses.length > 0
                ? costBenefitAnalyses[0].roi?.toFixed(1) || '0'
                : '0'}
              %
            </div>
            <div className="text-sm text-bia-text-secondary">Avg ROI</div>
          </div>
          <div className="text-center">
            <div className="text-3xl font-bold text-blue-400">
              ${(costBenefitAnalyses.reduce((acc, a) => acc + (a.netBenefit || 0), 0) / 1000000).toFixed(1)}M
            </div>
            <div className="text-sm text-bia-text-secondary">Total Net Benefit</div>
          </div>
          <div className="text-center">
            <div className="text-3xl font-bold text-yellow-400">
              {costBenefitAnalyses.length}
            </div>
            <div className="text-sm text-bia-text-secondary">Analyses</div>
          </div>
          <div className="text-center">
            <div className="text-3xl font-bold text-purple-400">
              {(costBenefitAnalyses.reduce((acc, a) => acc + (a.bcRatio || 0), 0) / (costBenefitAnalyses.length || 1)).toFixed(2)}
            </div>
            <div className="text-sm text-bia-text-secondary">Avg BC Ratio</div>
          </div>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex gap-4">
        <button
          onClick={() => setActiveTab('list')}
          className={`px-6 py-3 rounded-lg font-medium transition ${
            activeTab === 'list'
              ? 'bg-strategy-gold text-black'
              : 'bg-gray-700 hover:bg-gray-600'
          }`}>
          All Analyses
        </button>
        <button
          onClick={() => {
            setEditingAnalysis(null);
            setFormData({
              title: '',
              description: '',
              recoveryOptionIds: [],
              implementationCosts: { personnel: 0, technology: 0, infrastructure: 0, training: 0, external: 0, other: 0, total: 0 },
              operationalCosts: { personnel: 0, technology: 0, infrastructure: 0, training: 0, external: 0, other: 0, total: 0 },
              maintenanceCosts: { personnel: 0, technology: 0, infrastructure: 0, training: 0, external: 0, other: 0, total: 0 },
              avoidedLosses: { financial: 0, operational: 0, reputational: 0, legal: 0, total: 0 },
              totalCost: 0,
              totalBenefit: 0,
              netBenefit: 0,
              roi: 0,
              paybackPeriod: 0,
              bcRatio: 0,
              riskReduction: 0,
              status: 'draft',
              intangibleBenefits: [],
              recommendation: 'approve',
              recommendationNotes: '',
              bestCase: { roi: 0, netBenefit: 0 },
              worstCase: { roi: 0, netBenefit: 0 },
            });
            setActiveTab('create');
          }}
          className={`px-6 py-3 rounded-lg font-medium transition flex items-center gap-2 ${
            activeTab === 'create'
              ? 'bg-strategy-gold text-black'
              : 'bg-gray-700 hover:bg-gray-600'
          }`}>
          <Plus className="w-4 h-4" /> New Analysis
        </button>
      </div>

      {/* Analyses List */}
      {activeTab === 'list' && (
        <div className="space-y-4">
          {costBenefitAnalyses.map((analysis) => (
            <div key={analysis.id} className="glass-panel p-6">
              <div className="flex justify-between items-start mb-4">
                <div className="flex-1">
                  <h3 className="text-xl font-bold text-bia-text-primary">{analysis.title}</h3>
                  <p className="text-sm text-bia-text-secondary mt-1">{analysis.description}</p>
                </div>
                <div className="flex gap-2">
                  <button
                    onClick={() => {
                      setEditingAnalysis(analysis);
                      setFormData(analysis);
                      setActiveTab('create');
                    }}
                    className="p-2 hover:bg-gray-700 rounded transition">
                    <Edit className="w-4 h-4 text-blue-400" />
                  </button>
                  <button
                    onClick={() => handleDelete(analysis.id)}
                    className="p-2 hover:bg-gray-700 rounded transition">
                    <Trash2 className="w-4 h-4 text-red-400" />
                  </button>
                </div>
              </div>

              <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
                <div>
                  <div className="text-xs text-bia-text-secondary">ROI</div>
                  <div className="text-2xl font-bold text-emerald-400">
                    {analysis.roi?.toFixed(1)}%
                  </div>
                </div>
                <div>
                  <div className="text-xs text-bia-text-secondary">Net Benefit</div>
                  <div className="text-2xl font-bold text-blue-400">
                    ${(analysis.netBenefit / 1000000).toFixed(2)}M
                  </div>
                </div>
                <div>
                  <div className="text-xs text-bia-text-secondary">BC Ratio</div>
                  <div className="text-2xl font-bold text-yellow-400">
                    {analysis.bcRatio?.toFixed(2)}
                  </div>
                </div>
                <div>
                  <div className="text-xs text-bia-text-secondary">Payback</div>
                  <div className="text-2xl font-bold text-purple-400">
                    {analysis.paybackPeriod?.toFixed(0)} mo
                  </div>
                </div>
              </div>

              <div className="mt-4 pt-4 border-t border-gray-700">
                <span className={`px-3 py-1 rounded text-xs font-bold ${
                  analysis.status === 'approved' ? 'bg-emerald-500/20 text-emerald-400' :
                  analysis.status === 'rejected' ? 'bg-red-500/20 text-red-400' :
                  'bg-gray-700 text-gray-300'
                }`}>
                  {analysis.status}
                </span>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Create/Edit Form */}
      {activeTab === 'create' && (
        <div className="glass-panel p-8">
          <h2 className="text-2xl font-bold mb-6">
            {editingAnalysis ? 'Edit Analysis' : 'New Cost-Benefit Analysis'}
          </h2>

          <form className="space-y-6">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
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
                <label className="block text-sm font-medium mb-2">Status</label>
                <select
                  value={formData.status || 'draft'}
                  onChange={(e) => setFormData({ ...formData, status: e.target.value as any })}
                  className="w-full px-4 py-2 bg-gray-800 border border-gray-700 rounded focus:outline-none focus:border-strategy-gold">
                  <option value="draft">Draft</option>
                  <option value="submitted">Submitted</option>
                  <option value="approved">Approved</option>
                  <option value="rejected">Rejected</option>
                </select>
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium mb-2">Description</label>
              <textarea
                value={formData.description || ''}
                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                rows={3}
                className="w-full px-4 py-2 bg-gray-800 border border-gray-700 rounded focus:outline-none focus:border-strategy-gold"
              />
            </div>

            <div className="border-t border-gray-700 pt-6">
              <h3 className="text-lg font-bold mb-4">Implementation Costs (One-time)</h3>
              <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                {['personnel', 'technology', 'infrastructure', 'training', 'external', 'other'].map((key) => (
                  <div key={key}>
                    <label className="block text-sm font-medium mb-2 capitalize">{key}</label>
                    <input
                      type="number"
                      value={(formData.implementationCosts as any)?.[key] || 0}
                      onChange={(e) => setFormData({
                        ...formData,
                        implementationCosts: {
                          ...(formData.implementationCosts || {}),
                          [key]: parseFloat(e.target.value),
                        } as any,
                      })}
                      className="w-full px-4 py-2 bg-gray-800 border border-gray-700 rounded focus:outline-none focus:border-strategy-gold"
                    />
                  </div>
                ))}
              </div>
            </div>

            <div className="border-t border-gray-700 pt-6">
              <h3 className="text-lg font-bold mb-4">Avoided Losses (Annual)</h3>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                {['financial', 'operational', 'reputational', 'legal'].map((key) => (
                  <div key={key}>
                    <label className="block text-sm font-medium mb-2 capitalize">{key}</label>
                    <input
                      type="number"
                      value={(formData.avoidedLosses as any)?.[key] || 0}
                      onChange={(e) => setFormData({
                        ...formData,
                        avoidedLosses: {
                          ...(formData.avoidedLosses || {}),
                          [key]: parseFloat(e.target.value),
                        } as any,
                      })}
                      className="w-full px-4 py-2 bg-gray-800 border border-gray-700 rounded focus:outline-none focus:border-strategy-gold"
                    />
                  </div>
                ))}
              </div>
            </div>

            <div className="flex gap-4">
              <button
                type="button"
                onClick={handleSave}
                className="btn-primary flex items-center gap-2">
                <Save className="w-4 h-4" /> Save Analysis
              </button>
              <button
                type="button"
                onClick={() => setActiveTab('list')}
                className="btn-secondary">
                Cancel
              </button>
            </div>
          </form>
        </div>
      )}
    </div>
  );
}
