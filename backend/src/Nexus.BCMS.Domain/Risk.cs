namespace Nexus.BCMS.Domain
{
    public enum RiskCriticality { Low, Medium, High, Critical }
    public enum RiskStatus { Open, Mitigated, Accepted, Closed }
    
    public class Risk
    {
        public string Id { get; set; } = string.Empty;
        public required string Title { get; set; }
        public string? Description { get; set; }
        public required string Category { get; set; }
        public string Status { get; set; } = "Open"; // Simple string for now to match Prisma schema
        public string Criticality { get; set; } = "Medium";
        
        public double Probability { get; set; }
        public double Impact { get; set; }
        public double Exposure { get; set; }
        
        public string? Owner { get; set; }
        public string? MitigationStrategy { get; set; }
        
        public string OrganizationId { get; set; } = string.Empty;
        
        public DateTime CreatedAt { get; set; }
        public DateTime UpdatedAt { get; set; }
    }
}
