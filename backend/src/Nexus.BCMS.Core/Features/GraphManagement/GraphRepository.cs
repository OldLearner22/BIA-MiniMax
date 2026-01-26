using System.Data;
using Dapper;
using Nexus.BCMS.Domain;
using Nexus.BCMS.Shared.Infrastructure;

namespace Nexus.BCMS.Core.Features.GraphManagement
{
    public class GraphRepository
    {
        private readonly IDbConnectionFactory _dbFactory;
        private readonly Infrastructure.ITenantService _tenantService;

        public GraphRepository(IDbConnectionFactory dbFactory, Infrastructure.ITenantService tenantService)
        {
            _dbFactory = dbFactory;
            _tenantService = tenantService;
        }

        public async Task<ResourceMapGraph> GetResourceMapAsync(string rootProcessId)
        {
            using var conn = await _dbFactory.CreateConnectionAsync();
            await Infrastructure.DapperExtensions.SetTenantContextAsync(conn, _tenantService.GetCurrentTenantId());

            var graph = new ResourceMapGraph();

            // 1. Fetch the Root Process & its direct dependencies (Upstream/Downstream)
            // Using a recursive CTE to find all dependencies (Processes only first)
            const string processCteSql = @"
                WITH RECURSIVE process_tree AS (
                    -- Anchor: The root process
                    SELECT p.id, p.name, CAST(p.criticality AS text) as criticality, 0 as level
                    FROM ""Process"" p
                    WHERE p.id = @RootId
                    
                    UNION
                    
                    -- Recursive step
                    SELECT p.id, p.name, CAST(p.criticality AS text) as criticality, pt.level + 1
                    FROM ""Process"" p
                    INNER JOIN ""Dependency"" d ON (d.""sourceProcessId"" = p.id OR d.""targetProcessId"" = p.id)
                    INNER JOIN process_tree pt ON (pt.id = d.""sourceProcessId"" OR pt.id = d.""targetProcessId"")
                    WHERE pt.level < 3 AND p.id != pt.id
                )
                SELECT DISTINCT id, name, criticality FROM process_tree;
            ";

            var processes = await conn.QueryAsync<dynamic>(processCteSql, new { RootId = rootProcessId });
            var processIds = processes.Select(p => (string)p.id).ToList();

            foreach (var p in processes)
            {
                graph.Nodes.Add(new GraphNode 
                { 
                    Id = p.id, 
                    Type = "processNode", 
                    Label = p.name, 
                    IsMain = p.id == rootProcessId,
                    Category = "Process"
                });
            }

            // 2. Fetch all Dependencies (Edges) between these processes
            const string depSql = @"
                SELECT id, ""sourceProcessId"", ""targetProcessId"", type, criticality
                FROM ""Dependency""
                WHERE ""sourceProcessId"" = ANY(@Ids) AND ""targetProcessId"" = ANY(@Ids);
            ";
            var deps = await conn.QueryAsync<dynamic>(depSql, new { Ids = processIds });
            foreach (var d in deps)
            {
                graph.Edges.Add(new GraphEdge { 
                    Id = d.id, 
                    SourceId = d.sourceProcessId, 
                    TargetId = d.targetProcessId, 
                    RelationType = d.type,
                    Criticality = d.criticality.ToString()
                });
            }

            // 3. Fetch all Resources linked to these processes
            const string resourceSql = @"
                SELECT r.id, r.name, r.type, r.""rtoValue"" as rto, r.""rpoValue"" as rpo, l.id as linkId, l.""processId""
                FROM ""BusinessResource"" r
                JOIN ""ProcessResourceLink"" l ON l.""resourceId"" = r.id
                WHERE l.""processId"" = ANY(@Ids);
            ";
            var resources = await conn.QueryAsync<dynamic>(resourceSql, new { Ids = processIds });
            var resourceIds = new HashSet<string>();

            foreach (var r in resources)
            {
                if (resourceIds.Add(r.id))
                {
                    graph.Nodes.Add(new GraphNode
                    {
                        Id = r.id,
                        Type = "resourceNode",
                        Label = r.name,
                        Category = r.type,
                        Rto = (double?)r.rto,
                        Rpo = (double?)r.rpo
                    });
                }

                graph.Edges.Add(new GraphEdge
                {
                    Id = r.linkId,
                    SourceId = r.id,
                    TargetId = r.processId,
                    RelationType = "resource-link"
                });
            }

            return graph;
        }
    }
}
