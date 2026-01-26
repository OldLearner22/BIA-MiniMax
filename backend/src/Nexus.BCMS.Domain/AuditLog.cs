namespace Nexus.BCMS.Domain
{
    public class AuditLog
    {
        public string Id { get; set; } = Guid.NewGuid().ToString();
        public required string EntityName { get; set; }
        public required string EntityId { get; set; }
        public required string Action { get; set; } // "CREATE", "UPDATE", "DELETE", "CALCULATE"
        public string? UserId { get; set; }
        public string? OldValue { get; set; } // JSON string
        public string? NewValue { get; set; } // JSON string
        public DateTime Timestamp { get; set; } = DateTime.UtcNow;
        public required string OrganizationId { get; set; }
        public string? IPAddress { get; set; }
        public string? UserAgent { get; set; }
    }
}
