using System.Text.Json.Serialization;

namespace Nexus.BCMS.Domain
{
    public enum ExerciseType
    {
        [JsonPropertyName("tabletop")] tabletop,
        [JsonPropertyName("walkthrough")] walkthrough,
        [JsonPropertyName("simulation")] simulation,
        [JsonPropertyName("full_scale")] full_scale
    }

    public enum ExerciseStatus
    {
        [JsonPropertyName("planned")] planned,
        [JsonPropertyName("scheduled")] scheduled,
        [JsonPropertyName("in_progress")] in_progress,
        [JsonPropertyName("completed")] completed,
        [JsonPropertyName("cancelled")] cancelled
    }

    public class ExerciseRecord
    {
        public string Id { get; set; } = Guid.NewGuid().ToString();
        public required string Title { get; set; }
        public ExerciseType Type { get; set; }
        public ExerciseStatus Status { get; set; }
        public DateTime? ScheduledDate { get; set; }
        public DateTime? CompletedDate { get; set; }
        public required string Description { get; set; }
        public string? Scope { get; set; } // JSON string
        public List<string> Participants { get; set; } = new();
        public string? Findings { get; set; }
        public DateTime CreatedAt { get; set; } = DateTime.UtcNow;
        public DateTime UpdatedAt { get; set; } = DateTime.UtcNow;
        public string OrganizationId { get; set; } = string.Empty;
        public List<FollowUpAction> FollowUpActions { get; set; } = new();
    }

    public class FollowUpAction
    {
        public string Id { get; set; } = Guid.NewGuid().ToString();
        public required string ExerciseRecordId { get; set; }
        public required string Description { get; set; }
        public required string Owner { get; set; }
        public DateTime? DueDate { get; set; }
        public string Status { get; set; } = "open"; // open, closed
        public DateTime? CompletedDate { get; set; }
        public string OrganizationId { get; set; } = string.Empty;
    }
}
