namespace Nexus.BCMS.Domain
{
    public class GraphNode
    {
        public required string Id { get; set; }
        public required string Type { get; set; } // "process" or "resource"
        public required string Label { get; set; }
        public string? Category { get; set; }
        public double? Rto { get; set; }
        public double? Rpo { get; set; }
        public bool IsMain { get; set; }
    }

    public class GraphEdge
    {
        public required string Id { get; set; }
        public required string SourceId { get; set; }
        public required string TargetId { get; set; }
        public string? RelationType { get; set; }
        public string? Criticality { get; set; }
    }

    public class ResourceMapGraph
    {
        public List<GraphNode> Nodes { get; set; } = new();
        public List<GraphEdge> Edges { get; set; } = new();
    }
}
