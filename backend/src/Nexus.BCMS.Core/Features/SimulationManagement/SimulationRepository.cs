using System.Data;
using Dapper;
using Nexus.BCMS.Domain;
using Nexus.BCMS.Shared.Infrastructure;

namespace Nexus.BCMS.Core.Features.SimulationManagement
{
    public class SimulationRepository
    {
        private readonly IDbConnectionFactory _dbFactory;
        private readonly Infrastructure.ITenantService _tenantService;

        public SimulationRepository(IDbConnectionFactory dbFactory, Infrastructure.ITenantService tenantService)
        {
            _dbFactory = dbFactory;
            _tenantService = tenantService;
        }

        public async Task<SimulationResult> RunWhatIfSimulationAsync(List<string> failedResourceIds)
        {
            using var conn = await _dbFactory.CreateConnectionAsync();
            // Note: RLS is handled by the TenantAwareConnectionFactory

            var result = new SimulationResult();

            // 1. Find directly impacted processes
            const string directImpactSql = @"
                SELECT p.id, p.name, 'Process' as type, 'Direct Outage' as reason
                FROM ""Process"" p
                JOIN ""ProcessResourceLink"" l ON l.""processId"" = p.id
                WHERE l.""resourceId"" = ANY(@ResourceIds);
            ";
            
            var directProcesses = (await conn.QueryAsync<dynamic>(directImpactSql, new { ResourceIds = failedResourceIds })).ToList();

            foreach (var rId in failedResourceIds)
            {
                result.AffectedNodes.Add(new AffectedNode { NodeId = rId, NodeType = "Resource", ImpactLevel = "Offline", Reason = "Source of Outage" });
            }

            if (!directProcesses.Any()) return result;

            var impactedProcessIds = directProcesses.Select(p => (string)p.id).ToList();

            // 2. Recursive CTE to find downstream "Blast Radius"
            const string blastRadiusSql = @"
                WITH RECURSIVE blast_radius AS (
                    -- Anchor: The directly impacted processes
                    SELECT ""id"", ""name"", 0 as depth
                    FROM ""Process""
                    WHERE ""id"" = ANY(@DirectIds)
                    
                    UNION
                    
                    -- Recursive Step: Downstream processes (where the failed process is a source)
                    SELECT p.""id"", p.""name"", br.depth + 1
                    FROM ""Process"" p
                    JOIN ""Dependency"" d ON d.""targetProcessId"" = p.""id""
                    JOIN blast_radius br ON d.""sourceProcessId"" = br.""id""
                    WHERE br.depth < 10 -- Safety Limit
                )
                SELECT DISTINCT id, name, depth FROM blast_radius;
            ";

            var downstream = await conn.QueryAsync<dynamic>(blastRadiusSql, new { DirectIds = impactedProcessIds });

            foreach (var p in downstream)
            {
                if (result.AffectedNodes.Any(n => n.NodeId == (string)p.id)) continue;

                var isDirect = impactedProcessIds.Contains((string)p.id);
                result.AffectedNodes.Add(new AffectedNode 
                { 
                    NodeId = p.id, 
                    NodeType = "Process", 
                    ImpactLevel = isDirect ? "Critical" : "Indirect", 
                    Reason = isDirect ? "Direct Resource Loss" : $"Downstream Dependency (Depth {p.depth})" 
                });
            }

            result.TotalImpactedProcesses = result.AffectedNodes.Count(n => n.NodeType == "Process");

            return result;
        }

        public async Task<string> CreateScenarioAsync(SimulationScenario scenario)
        {
            using var conn = await _dbFactory.CreateConnectionAsync();
            if (string.IsNullOrEmpty(scenario.Id)) scenario.Id = Guid.NewGuid().ToString();
            
            const string sql = @"
                INSERT INTO ""SimulationScenario"" (
                    ""id"", ""name"", ""description"", ""failedResourceIds"", ""createdAt"", ""createdBy"", ""organizationId"", ""status""
                ) VALUES (
                    @Id, @Name, @Description, @FailedResourceIds, @CreatedAt, @CreatedBy, @OrganizationId, @Status
                );";

            // Note: Postgres JSONB handles arrays well, but Dapper needs a hint or we cast in SQL
            await conn.ExecuteAsync(sql, new {
                scenario.Id,
                scenario.Name,
                scenario.Description,
                FailedResourceIds = System.Text.Json.JsonSerializer.Serialize(scenario.FailedResourceIds),
                scenario.CreatedAt,
                scenario.CreatedBy,
                scenario.OrganizationId,
                scenario.Status
            });

            return scenario.Id;
        }
    }
}
