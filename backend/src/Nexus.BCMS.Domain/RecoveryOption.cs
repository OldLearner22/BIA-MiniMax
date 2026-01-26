namespace Nexus.BCMS.Domain
{
    public enum RecoveryStrategyType { Prevention, Response, Recovery }
    public enum RecoveryTier { Immediate, Rapid, Standard, Extended }
    public enum TestingStatus { Pass, Fail, Pending, NotTested }
    public enum StrategyStatus { Draft, Submitted, Approved, Rejected, Active, Retired }

    public class RecoveryOption
    {
        public string Id { get; set; } = string.Empty;
        public required string ProcessId { get; set; }
        public required string Title { get; set; }
        public required string Description { get; set; }
        public required string StrategyType { get; set; } // Enums as strings for simplicity in Dapper/Postgres unless we map enums
        public required string Tier { get; set; }
        public double RtoValue { get; set; }
        public required string RtoUnit { get; set; }
        public double RpoValue { get; set; }
        public required string RpoUnit { get; set; }
        public int RecoveryCapacity { get; set; } = 100;
        public int PeopleRequired { get; set; }
        public required string TechnologyType { get; set; }
        public required string FacilityType { get; set; }
        public double ImplementationCost { get; set; }
        public double OperationalCost { get; set; }
        public int ReadinessScore { get; set; }
        public DateTime? LastTestedDate { get; set; }
        public required string TestingStatus { get; set; }
        public string? TestingNotes { get; set; }
        public string[] DependsOn { get; set; } = Array.Empty<string>();
        public string[] ActivationTriggers { get; set; } = Array.Empty<string>();
        public string? ActivationProcedure { get; set; }
        public required string Status { get; set; }
        public DateTime CreatedAt { get; set; }
        public DateTime UpdatedAt { get; set; }
        public required string CreatedBy { get; set; }
        public string OrganizationId { get; set; } = string.Empty;
    }
}
