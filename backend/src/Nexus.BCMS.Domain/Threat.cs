namespace Nexus.BCMS.Domain
{
    public class Threat
    {
        public string Id { get; set; } = string.Empty;
        public required string Title { get; set; }
        public required string Description { get; set; }
        public required string Category { get; set; }
        public required string Source { get; set; }
        public int Likelihood { get; set; }
        public int Impact { get; set; }
        public int RiskScore { get; set; }
        public required string Status { get; set; }
        public string? Owner { get; set; }
        public DateTime CreatedAt { get; set; }
        public DateTime UpdatedAt { get; set; }
        public string OrganizationId { get; set; } = string.Empty;
    }
}
