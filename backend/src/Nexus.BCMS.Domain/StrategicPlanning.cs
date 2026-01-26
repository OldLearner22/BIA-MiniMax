namespace Nexus.BCMS.Domain
{
    public class StrategicPlanning
    {
        public string Id { get; set; } = string.Empty;
        public required string Type { get; set; }
        public required string Title { get; set; }
        public required string Description { get; set; }
        public required string Source { get; set; }
        public required string Impact { get; set; }
        public required string ActionPlan { get; set; }
        public required string Priority { get; set; }
        public required string Status { get; set; }
        public string? Owner { get; set; }
        public DateTime CreatedAt { get; set; }
        public DateTime UpdatedAt { get; set; }
        public string OrganizationId { get; set; } = string.Empty;
    }
}
