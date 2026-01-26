using System.Text.Json;

namespace Nexus.BCMS.Domain
{
    public class StrategyApproval
    {
        public string Id { get; set; } = string.Empty;
        public required string StrategyType { get; set; }
        public required string StrategyId { get; set; }
        public required string StrategyTitle { get; set; }
        public required string Status { get; set; }
        public int CurrentStep { get; set; }
        public required string SubmittedBy { get; set; }
        public DateTime SubmittedAt { get; set; }
        public string? SubmissionNotes { get; set; }
        public string? FinalDecision { get; set; }
        public DateTime? FinalDecisionDate { get; set; }
        public string? FinalDecisionBy { get; set; }
        public string? FinalDecisionNotes { get; set; }
        public string[] ApprovalConditions { get; set; } = Array.Empty<string>();
        public string AuditLog { get; set; } = "[]"; // Store as JSON string for Dapper
        public DateTime CreatedAt { get; set; }
        public DateTime UpdatedAt { get; set; }
        public string OrganizationId { get; set; } = string.Empty;

        public List<StrategyApprovalStep> Steps { get; set; } = new();
    }

    public class StrategyApprovalStep
    {
        public string Id { get; set; } = string.Empty;
        public string ApprovalId { get; set; } = string.Empty;
        public int StepNumber { get; set; }
        public required string Title { get; set; }
        public string? Description { get; set; }
        public string? RequiredRole { get; set; }
        public string[] Approvers { get; set; } = Array.Empty<string>();
        public required string Status { get; set; }
        public string? AssignedTo { get; set; }
        public string? Comments { get; set; }
        public string? Decision { get; set; }
        public string? DecidedBy { get; set; }
        public DateTime? DecidedAt { get; set; }
    }
}
