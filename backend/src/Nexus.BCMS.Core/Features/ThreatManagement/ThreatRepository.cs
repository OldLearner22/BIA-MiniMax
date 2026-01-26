using System.Data;
using Dapper;
using Nexus.BCMS.Domain;
using Nexus.BCMS.Shared.Infrastructure;

namespace Nexus.BCMS.Core.Features.ThreatManagement
{
    public class ThreatRepository
    {
        private readonly IDbConnectionFactory _dbFactory;
        private readonly Infrastructure.ITenantService _tenantService;

        public ThreatRepository(IDbConnectionFactory dbFactory, Infrastructure.ITenantService tenantService)
        {
            _dbFactory = dbFactory;
            _tenantService = tenantService;
        }

        public async Task<IEnumerable<Threat>> GetAllAsync()
        {
            using var conn = await _dbFactory.CreateConnectionAsync();

            const string sql = @"
                SELECT 
                    ""id"" as Id,
                    ""title"" as Title,
                    ""description"" as Description,
                    ""category"" as Category,
                    ""source"" as Source,
                    ""likelihood"" as Likelihood,
                    ""impact"" as Impact,
                    ""riskScore"" as RiskScore,
                    ""status"" as Status,
                    ""owner"" as Owner,
                    ""createdAt"" as CreatedAt,
                    ""updatedAt"" as UpdatedAt,
                    ""organizationId"" as OrganizationId
                FROM ""Threat""
                ORDER BY ""updatedAt"" DESC;
            ";
            
            return await conn.QueryAsync<Threat>(sql);
        }

        public async Task<Threat?> GetByIdAsync(string id)
        {
            using var conn = await _dbFactory.CreateConnectionAsync();

            const string sql = @"
                SELECT 
                    ""id"" as Id,
                    ""title"" as Title,
                    ""description"" as Description,
                    ""category"" as Category,
                    ""source"" as Source,
                    ""likelihood"" as Likelihood,
                    ""impact"" as Impact,
                    ""riskScore"" as RiskScore,
                    ""status"" as Status,
                    ""owner"" as Owner,
                    ""createdAt"" as CreatedAt,
                    ""updatedAt"" as UpdatedAt,
                    ""organizationId"" as OrganizationId
                FROM ""Threat""
                WHERE ""id"" = @Id;
            ";
            
            return await conn.QuerySingleOrDefaultAsync<Threat>(sql, new { Id = id });
        }

        public async Task<string> AddAsync(Threat threat)
        {
            using var conn = await _dbFactory.CreateConnectionAsync();

            if (string.IsNullOrEmpty(threat.Id)) threat.Id = Guid.NewGuid().ToString();
            if (string.IsNullOrEmpty(threat.OrganizationId)) threat.OrganizationId = _tenantService.GetCurrentTenantId().ToString();

            threat.RiskScore = threat.Likelihood * threat.Impact;
            threat.CreatedAt = DateTime.UtcNow;
            threat.UpdatedAt = DateTime.UtcNow;

            const string sql = @"
                INSERT INTO ""Threat"" (
                    ""id"", ""title"", ""description"", ""category"", ""source"", ""likelihood"", 
                    ""impact"", ""riskScore"", ""status"", ""owner"", ""createdAt"", ""updatedAt"", ""organizationId""
                ) VALUES (
                    @Id, @Title, @Description, @Category, @Source, @Likelihood,
                    @Impact, @RiskScore, @Status, @Owner, @CreatedAt, @UpdatedAt, @OrganizationId
                );
            ";

            await conn.ExecuteAsync(sql, threat);
            return threat.Id;
        }

        public async Task UpdateAsync(Threat threat)
        {
            using var conn = await _dbFactory.CreateConnectionAsync();

            threat.RiskScore = threat.Likelihood * threat.Impact;
            threat.UpdatedAt = DateTime.UtcNow;

            const string sql = @"
                UPDATE ""Threat"" SET
                    ""title"" = @Title,
                    ""description"" = @Description,
                    ""category"" = @Category,
                    ""source"" = @Source,
                    ""likelihood"" = @Likelihood,
                    ""impact"" = @Impact,
                    ""riskScore"" = @RiskScore,
                    ""status"" = @Status,
                    ""owner"" = @Owner,
                    ""updatedAt"" = @UpdatedAt
                WHERE ""id"" = @Id AND ""organizationId"" = @OrganizationId;
            ";

            await conn.ExecuteAsync(sql, threat);
        }

        public async Task DeleteAsync(string id)
        {
            using var conn = await _dbFactory.CreateConnectionAsync();
            var tenantId = _tenantService.GetCurrentTenantId().ToString();

            const string sql = @"DELETE FROM ""Threat"" WHERE ""id"" = @Id AND ""organizationId"" = @OrganizationId";
            await conn.ExecuteAsync(sql, new { Id = id, OrganizationId = tenantId });
        }
    }
}
