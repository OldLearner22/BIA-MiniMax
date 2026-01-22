import React, { useState } from 'react';
import { useStore } from '../store/useStore';
import { StrategyApproval, ApprovalStep } from '../types';
import {
  CheckCircle2,
  XCircle,
  Clock,
  User,
  Plus,
  X,
  Send,
  MessageCircle,
  FileDown,
} from 'lucide-react';

export default function StrategyApprovalComponent() {
  const {
    strategyApprovals,
    recoveryOptions,
    costBenefitAnalyses,
    submitForApproval,
    approveStep,
    rejectStep,
    exportStrategyDecision,
    exportStrategyComparison,
    downloadStrategyDocument,
  } = useStore();

  const [selectedApprovalId, setSelectedApprovalId] = useState<string | null>(null);
  const [showSubmitModal, setShowSubmitModal] = useState(false);
  const [stepComments, setStepComments] = useState<Record<string, string>>({});
  const [formData, setFormData] = useState<Partial<StrategyApproval>>({
    strategyType: 'recovery-option',
    status: 'not-started',
    currentStep: 0,
    steps: [
      { stepNumber: 1, title: 'Initial Review', status: 'pending', approvers: [], id: '1' } as any,
      { stepNumber: 2, title: 'Manager Approval', status: 'pending', approvers: [], id: '2' } as any,
      { stepNumber: 3, title: 'Executive Sign-off', status: 'pending', approvers: [], id: '3' } as any,
    ],
    submittedBy: 'current-user',
    auditLog: [],
  });

  const selectedApproval = selectedApprovalId && strategyApprovals
    ? strategyApprovals.find((a) => a.id === selectedApprovalId)
    : null;

  const handleSubmitApproval = async () => {
    if (!formData.strategyId || !formData.strategyTitle) {
      alert('Please select a strategy and provide a title');
      return;
    }

    try {
      await submitForApproval({
        ...formData,
        steps: formData.steps || [],
      });
      setShowSubmitModal(false);
      setFormData({
        strategyType: 'recovery-option',
        status: 'not-started',
        currentStep: 0,
        steps: [
          { stepNumber: 1, title: 'Initial Review', status: 'pending', approvers: [], id: '1' } as any,
          { stepNumber: 2, title: 'Manager Approval', status: 'pending', approvers: [], id: '2' } as any,
          { stepNumber: 3, title: 'Executive Sign-off', status: 'pending', approvers: [], id: '3' } as any,
        ],
        submittedBy: 'current-user',
        auditLog: [],
      });
    } catch (error) {
      console.error('Failed to submit for approval', error);
      alert('Failed to submit for approval');
    }
  };

  const handleApproveStep = async (approval: StrategyApproval, step: ApprovalStep) => {
    try {
      await approveStep(approval.id, step.id, stepComments[step.id]);
      setStepComments({ ...stepComments, [step.id]: '' });
    } catch (error) {
      console.error('Failed to approve step', error);
      alert('Failed to approve step');
    }
  };

  const handleRejectStep = async (approval: StrategyApproval, step: ApprovalStep) => {
    const reason = prompt('Enter rejection reason:');
    if (!reason) return;
    try {
      await rejectStep(approval.id, step.id, reason);
    } catch (error) {
      console.error('Failed to reject step', error);
      alert('Failed to reject step');
    }
  };

  const handleExportDecision = async (approval: StrategyApproval) => {
    try {
      const document = await exportStrategyDecision(approval.id);
      if (document) {
        downloadStrategyDocument(document, `strategy-decision-${approval.strategyTitle}`);
      }
    } catch (error) {
      console.error('Failed to export decision', error);
      alert('Failed to export decision document');
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'approved':
        return 'bg-emerald-500/20 text-emerald-400';
      case 'rejected':
        return 'bg-red-500/20 text-red-400';
      case 'in-progress':
        return 'bg-blue-500/20 text-blue-400';
      default:
        return 'bg-gray-700 text-gray-300';
    }
  };

  const getStepIcon = (status: string) => {
    switch (status) {
      case 'approved':
        return <CheckCircle2 className="w-6 h-6 text-emerald-400" />;
      case 'rejected':
        return <XCircle className="w-6 h-6 text-red-400" />;
      case 'in-review':
        return <User className="w-6 h-6 text-blue-400" />;
      default:
        return <Clock className="w-6 h-6 text-gray-400" />;
    }
  };

  return (
    <div className="space-y-8 animate-fade-in">
      {/* Hero Section */}
      <div className="glass-panel p-8">
        <h1 className="text-3xl font-bold text-bia-text-primary mb-6">Strategy Approvals</h1>
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
          <div className="text-center">
            <div className="text-4xl font-bold text-strategy-gold">{strategyApprovals?.length || 0}</div>
            <div className="text-sm text-bia-text-secondary">Total Requests</div>
          </div>
          <div className="text-center">
            <div className="text-4xl font-bold text-emerald-400">
              {strategyApprovals?.filter((a) => a.status === 'approved').length || 0}
            </div>
            <div className="text-sm text-bia-text-secondary">Approved</div>
          </div>
          <div className="text-center">
            <div className="text-4xl font-bold text-blue-400">
              {strategyApprovals?.filter((a) => a.status === 'in-progress').length || 0}
            </div>
            <div className="text-sm text-bia-text-secondary">In Progress</div>
          </div>
        </div>
      </div>

      <button
        onClick={() => {
          setFormData({
            strategyType: 'recovery-option',
            status: 'not-started',
            currentStep: 0,
            steps: [
              { stepNumber: 1, title: 'Initial Review', status: 'pending', approvers: [], id: '1' } as any,
              { stepNumber: 2, title: 'Manager Approval', status: 'pending', approvers: [], id: '2' } as any,
              { stepNumber: 3, title: 'Executive Sign-off', status: 'pending', approvers: [], id: '3' } as any,
            ],
            submittedBy: 'current-user',
            auditLog: [],
          });
          setShowSubmitModal(true);
        }}
        className="btn-primary flex items-center gap-2">
        <Plus className="w-4 h-4" /> Submit for Approval
      </button>

      {/* Approvals List */}
      <div className="space-y-4">
        {!strategyApprovals || strategyApprovals.length === 0 ? (
          <div className="glass-panel p-8 text-center">
            <p className="text-bia-text-secondary">No approval requests yet</p>
          </div>
        ) : (
          strategyApprovals.map((approval) => (
            <div
              key={approval.id}
              className={`glass-panel p-6 cursor-pointer transition hover:bg-gray-800 ${
                selectedApprovalId === approval.id ? 'ring-2 ring-strategy-gold' : ''
              }`}
              onClick={() => setSelectedApprovalId(approval.id)}>
              <div className="flex justify-between items-start">
                <div className="flex-1">
                  <h3 className="text-xl font-bold text-bia-text-primary">{approval.strategyTitle}</h3>
                  <p className="text-sm text-bia-text-secondary mt-1">
                    Type: {approval.strategyType.replace('-', ' ')} • Submitted by {approval.submittedBy}
                  </p>
                </div>
                <span className={`px-3 py-1 rounded text-xs font-bold ${getStatusColor(approval.status)}`}>
                  {approval.status}
                </span>
              </div>

              <div className="mt-4 pt-4 border-t border-gray-700">
                <div className="flex items-center gap-2 text-sm">
                  <div className="w-full bg-gray-700 rounded-full h-2">
                    <div
                      className="bg-strategy-gold h-2 rounded-full transition-all"
                      style={{
                        width: `${
                          (approval.steps && approval.steps.length > 0)
                            ? (approval.steps.filter((s) => s.status === 'approved').length /
                                approval.steps.length) *
                              100
                            : 0
                        }%`,
                      }}
                    />
                  </div>
                  <span className="text-bia-text-secondary">
                    Step {approval.currentStep + 1}/{approval.steps?.length || 0}
                  </span>
                </div>
              </div>
            </div>
          ))
        )}
      </div>

      {/* Selected Approval Details */}
      {selectedApproval && (
        <div className="glass-panel p-8">
          <div className="flex justify-between items-center mb-6">
            <h2 className="text-2xl font-bold">{selectedApproval.strategyTitle}</h2>
            <button
              type="button"
              onClick={() => handleExportDecision(selectedApproval)}
              className="btn-primary flex items-center gap-2">
              <FileDown className="w-4 h-4" /> Export Decision
            </button>
          </div>

          <div className="space-y-6">
            {(selectedApproval.steps || []).map((step, index) => (
              <div key={step.id} className="border-l-4 border-strategy-gold pl-6 pb-6">
                <div className="flex items-start gap-4">
                  {getStepIcon(step.status)}
                  <div className="flex-1">
                    <div className="flex justify-between items-start mb-2">
                      <div>
                        <h3 className="font-bold text-lg">{step.title}</h3>
                        <p className="text-sm text-bia-text-secondary">Step {index + 1}</p>
                      </div>
                      <span className={`px-2 py-1 rounded text-xs font-bold ${getStatusColor(step.status)}`}>
                        {step.status}
                      </span>
                    </div>

                    {step.description && (
                      <p className="text-sm text-bia-text-secondary mb-4">{step.description}</p>
                    )}

                    {step.comments && (
                      <div className="bg-gray-800 rounded p-3 mb-4">
                        <div className="flex gap-2 items-start">
                          <MessageCircle className="w-4 h-4 text-blue-400 mt-1 flex-shrink-0" />
                          <div>
                            <p className="text-xs text-bia-text-secondary">
                              {step.decidedBy || 'Unknown'} • {step.decidedAt || 'No date'}
                            </p>
                            <p className="text-sm mt-1">{step.comments}</p>
                          </div>
                        </div>
                      </div>
                    )}

                    {step.status === 'pending' && selectedApproval.currentStep === index && (
                      <div className="space-y-3">
                        <textarea
                          placeholder="Add comments (optional)"
                          value={stepComments[step.id] || ''}
                          onChange={(e) =>
                            setStepComments({ ...stepComments, [step.id]: e.target.value })
                          }
                          className="w-full px-4 py-2 bg-gray-800 border border-gray-700 rounded text-sm focus:outline-none focus:border-strategy-gold"
                          rows={2}
                        />
                        <div className="flex gap-2">
                          <button
                            onClick={() => handleApproveStep(selectedApproval, step)}
                            className="flex-1 btn-primary flex items-center justify-center gap-2">
                            <CheckCircle2 className="w-4 h-4" /> Approve
                          </button>
                          <button
                            onClick={() => handleRejectStep(selectedApproval, step)}
                            className="flex-1 btn-secondary flex items-center justify-center gap-2">
                            <XCircle className="w-4 h-4" /> Reject
                          </button>
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>

          {selectedApproval.status === 'approved' && (
            <div className="mt-8 p-4 bg-emerald-500/20 border border-emerald-500/50 rounded">
              <p className="text-emerald-400 font-bold">✓ Approved</p>
              <p className="text-sm text-bia-text-secondary mt-1">
                Approved by {selectedApproval.finalDecisionBy} on {selectedApproval.finalDecisionDate}
              </p>
            </div>
          )}

          {selectedApproval.status === 'rejected' && (
            <div className="mt-8 p-4 bg-red-500/20 border border-red-500/50 rounded">
              <p className="text-red-400 font-bold">✗ Rejected</p>
              <p className="text-sm text-bia-text-secondary mt-1">
                {selectedApproval.finalDecisionNotes}
              </p>
            </div>
          )}
        </div>
      )}

      {/* Submit Modal */}
      {showSubmitModal && (
        <div className="fixed inset-0 bg-black/75 flex items-center justify-center z-50 p-4">
          <div className="glass-panel p-8 max-w-2xl w-full max-h-[90vh] overflow-y-auto">
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-2xl font-bold">Submit for Approval</h2>
              <button onClick={() => setShowSubmitModal(false)} className="p-1 hover:bg-gray-700 rounded">
                <X className="w-6 h-6" />
              </button>
            </div>

            <form className="space-y-4">
              <div>
                <label className="block text-sm font-medium mb-2">Strategy Type *</label>
                <select
                  value={formData.strategyType || 'recovery-option'}
                  onChange={(e) => {
                    setFormData({ ...formData, strategyType: e.target.value as any });
                    // Clear strategy ID when type changes
                    setFormData((prev) => ({ ...prev, strategyId: '', strategyTitle: '' }));
                  }}
                  className="w-full px-4 py-2 bg-gray-800 border border-gray-700 rounded focus:outline-none focus:border-strategy-gold">
                  <option value="recovery-option">Recovery Option</option>
                  <option value="cost-benefit">Cost-Benefit Analysis</option>
                  <option value="comprehensive-plan">Comprehensive Plan</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium mb-2">Select Strategy *</label>
                <select
                  value={formData.strategyId || ''}
                  onChange={(e) => {
                    const selected =
                      formData.strategyType === 'recovery-option'
                        ? (recoveryOptions || []).find((r) => r.id === e.target.value)
                        : (costBenefitAnalyses || []).find((c) => c.id === e.target.value);

                    setFormData({
                      ...formData,
                      strategyId: e.target.value,
                      strategyTitle: selected?.title || '',
                    });
                  }}
                  className="w-full px-4 py-2 bg-gray-800 border border-gray-700 rounded focus:outline-none focus:border-strategy-gold">
                  <option value="">Select a strategy</option>
                  {formData.strategyType === 'recovery-option'
                    ? (recoveryOptions || []).map((r) => (
                        <option key={r.id} value={r.id}>
                          {r.title}
                        </option>
                      ))
                    : (costBenefitAnalyses || []).map((c) => (
                        <option key={c.id} value={c.id}>
                          {c.title}
                        </option>
                      ))}
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium mb-2">Submission Notes</label>
                <textarea
                  value={formData.submissionNotes || ''}
                  onChange={(e) => setFormData({ ...formData, submissionNotes: e.target.value })}
                  rows={4}
                  className="w-full px-4 py-2 bg-gray-800 border border-gray-700 rounded focus:outline-none focus:border-strategy-gold"
                />
              </div>

              <div className="flex gap-4">
                <button
                  type="button"
                  onClick={handleSubmitApproval}
                  className="btn-primary flex items-center gap-2">
                  <Send className="w-4 h-4" /> Submit
                </button>
                <button
                  type="button"
                  onClick={() => setShowSubmitModal(false)}
                  className="btn-secondary">
                  Cancel
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
