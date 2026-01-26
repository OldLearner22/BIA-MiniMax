using System.Data;
using Dapper;
using Nexus.BCMS.Domain;
using Nexus.BCMS.Shared.Infrastructure;

namespace Nexus.BCMS.Core.Features.RiskManagement
{
    public class RiskRepository
    {
        private readonly IDbConnectionFactory _dbFactory;
        private readonly Nexus.BCMS.Core.Infrastructure.ITenantService _tenantService;

        public RiskRepository(IDbConnectionFactory dbFactory, Nexus.BCMS.Core.Infrastructure.ITenantService tenantService)
        {
            _dbFactory = dbFactory;
            _tenantService = tenantService;
        }

        public async Task<IEnumerable<Risk>> GetAllAsync()
        {
            using var conn = await _dbFactory.CreateConnectionAsync();
            await Nexus.BCMS.Core.Infrastructure.DapperExtensions.SetTenantContextAsync(conn, _tenantService.GetCurrentTenantId());
            
            const string sql = @"
                SELECT 
                    ""id"" as Id,
                    ""title"" as Title,
                    ""description"" as Description,
                    ""category"" as Category,
                    ""status"" as Status,
                    ""criticality"" as Criticality,
                    ""probability"" as Probability,
                    ""impact"" as Impact,
                    ""exposure"" as Exposure,
                    ""owner"" as Owner,
                    ""mitigationStrategy"" as MitigationStrategy,
                    ""organizationId"" as OrganizationId,
                    ""createdAt"" as CreatedAt,
                    ""updatedAt"" as UpdatedAt
                FROM ""Risk"";
            ";
            
            return await conn.QueryAsync<Risk>(sql);
        }

        public async Task<Risk?> GetByIdAsync(string id)
        {
            using var conn = await _dbFactory.CreateConnectionAsync();
            await Nexus.BCMS.Core.Infrastructure.DapperExtensions.SetTenantContextAsync(conn, _tenantService.GetCurrentTenantId());

            const string sql = @"
                SELECT 
                    ""id"" as Id,
                    ""title"" as Title,
                    ""description"" as Description,
                    ""category"" as Category,
                    ""status"" as Status,
                    ""criticality"" as Criticality,
                    ""probability"" as Probability,
                    ""impact"" as Impact,
                    ""exposure"" as Exposure,
                    ""owner"" as Owner,
                    ""mitigationStrategy"" as MitigationStrategy,
                    ""organizationId"" as OrganizationId,
                    ""createdAt"" as CreatedAt,
                    ""updatedAt"" as UpdatedAt
                FROM ""Risk""
                WHERE ""id"" = @Id;
            ";
            
            return await conn.QuerySingleOrDefaultAsync<Risk>(sql, new { Id = id });
        }
        public async Task<string> AddAsync(Risk risk)
        {
            using var conn = await _dbFactory.CreateConnectionAsync();
            await Nexus.BCMS.Core.Infrastructure.DapperExtensions.SetTenantContextAsync(conn, _tenantService.GetCurrentTenantId());

            if (string.IsNullOrEmpty(risk.Id)) risk.Id = Guid.NewGuid().ToString(); // Ensure ID
            if (string.IsNullOrEmpty(risk.OrganizationId)) risk.OrganizationId = _tenantService.GetCurrentTenantId().ToString();

            const string sql = @"
                INSERT INTO ""Risk"" (
                    ""id"", ""title"", ""description"", ""category"", ""status"", ""criticality"", 
                    ""probability"", ""impact"", ""exposure"", ""owner"", ""mitigationStrategy"", 
                    ""organizationId"", ""createdAt"", ""updatedAt""
                ) VALUES (
                    @Id, @Title, @Description, @Category, @Status, @Criticality,
                    @Probability, @Impact, @Exposure, @Owner, @MitigationStrategy,
                    @OrganizationId, @CreatedAt, @UpdatedAt
                ) RETURNING ""id"";
            ";
            
            // Dapper doesn't support RETURNING with ExecuteAsync directly for scalar, need QuerySingle or similar if we want ID back.
            // But we generated ID c-sharp side usually. 
            // risk.Id is string.
            risk.CreatedAt = DateTime.UtcNow;
            risk.UpdatedAt = DateTime.UtcNow;

            await conn.ExecuteAsync(sql, risk);
            return risk.Id;
        }

        public async Task UpdateAsync(Risk risk)
        {
            using var conn = await _dbFactory.CreateConnectionAsync();
            await Nexus.BCMS.Core.Infrastructure.DapperExtensions.SetTenantContextAsync(conn, _tenantService.GetCurrentTenantId());
            
            risk.UpdatedAt = DateTime.UtcNow;

            const string sql = @"
                UPDATE ""Risk"" SET
                    ""title"" = @Title,
                    ""description"" = @Description,
                    ""category"" = @Category,
                    ""status"" = @Status,
                    ""criticality"" = @Criticality,
                    ""probability"" = @Probability,
                    ""impact"" = @Impact,
                    ""exposure"" = @Exposure,
                    ""owner"" = @Owner,
                    ""mitigationStrategy"" = @MitigationStrategy,
                    ""updatedAt"" = @UpdatedAt
                WHERE ""id"" = @Id AND ""organizationId"" = @OrganizationId;
            ";

            await conn.ExecuteAsync(sql, risk);
        }

        public async Task DeleteAsync(string id)
        {
            using var conn = await _dbFactory.CreateConnectionAsync();
            var tenantId = _tenantService.GetCurrentTenantId().ToString();
            await Nexus.BCMS.Core.Infrastructure.DapperExtensions.SetTenantContextAsync(conn, _tenantService.GetCurrentTenantId());

            const string sql = @"DELETE FROM ""Risk"" WHERE ""id"" = @Id AND ""organizationId"" = @OrganizationId";
            await conn.ExecuteAsync(sql, new { Id = id, OrganizationId = tenantId });
        }
    }
}
