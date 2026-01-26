namespace Nexus.BCMS.Domain
{
    public class SimulationScenario
    {
        public string Id { get; set; } = Guid.NewGuid().ToString();
        public required string Name { get; set; }
        public string? Description { get; set; }
        public List<string> FailedResourceIds { get; set; } = new();
        public DateTime CreatedAt { get; set; } = DateTime.UtcNow;
        public string? CreatedBy { get; set; }
        public string OrganizationId { get; set; } = string.Empty;
        public string Status { get; set; } = "draft"; // draft, active, archived
    }

    public class SimulationResult
    {
        public string ScenarioId { get; set; } = string.Empty;
        public List<AffectedNode> AffectedNodes { get; set; } = new();
        public int TotalImpactedProcesses { get; set; }
        public List<string> CriticalFailures { get; set; } = new(); // Names of processes failing RTO
    }

    public class AffectedNode
    {
        public string NodeId { get; set; } = string.Empty;
        public string NodeType { get; set; } = string.Empty; // Process, Resource
        public string ImpactLevel { get; set; } = string.Empty; // Total Failure, Degraded
        public string Reason { get; set; } = string.Empty;
    }
}
