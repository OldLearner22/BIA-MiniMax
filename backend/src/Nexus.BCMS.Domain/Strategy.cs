namespace Nexus.BCMS.Domain
{
    public class StrategyAssessment
    {
        public string Id { get; set; } = string.Empty;
        public required string Dimension { get; set; }
        public double CurrentScore { get; set; }
        public double TargetScore { get; set; }
        public DateTime AssessmentDate { get; set; }
        public string OrganizationId { get; set; } = string.Empty;
        public DateTime CreatedAt { get; set; }
        public DateTime UpdatedAt { get; set; }
    }

    public class StrategyObjective
    {
        public string Id { get; set; } = string.Empty;
        public required string Title { get; set; }
        public required string Description { get; set; }
        public required string Kpi { get; set; }
        public double TargetValue { get; set; }
        public double CurrentValue { get; set; }
        public required string Status { get; set; }
        public string OrganizationId { get; set; } = string.Empty;
        public DateTime CreatedAt { get; set; }
        public DateTime UpdatedAt { get; set; }
    }

    public class StrategyInitiative
    {
        public string Id { get; set; } = string.Empty;
        public required string Title { get; set; }
        public required string Description { get; set; }
        public required string Status { get; set; }
        public required string Priority { get; set; }
        public string? Owner { get; set; }
        public int Progress { get; set; }
        public string OrganizationId { get; set; } = string.Empty;
        public DateTime CreatedAt { get; set; }
        public DateTime UpdatedAt { get; set; }
    }
}
