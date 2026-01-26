using System.Data;
using Dapper;
using Nexus.BCMS.Domain;
using Nexus.BCMS.Shared.Infrastructure;

namespace Nexus.BCMS.Core.Features.StrategyManagement
{
    public class StrategicPlanningRepository
    {
        private readonly IDbConnectionFactory _dbFactory;
        private readonly Infrastructure.ITenantService _tenantService;

        public StrategicPlanningRepository(IDbConnectionFactory dbFactory, Infrastructure.ITenantService tenantService)
        {
            _dbFactory = dbFactory;
            _tenantService = tenantService;
        }

        public async Task<IEnumerable<StrategicPlanning>> GetAllAsync()
        {
            using var conn = await _dbFactory.CreateConnectionAsync();
            await Infrastructure.DapperExtensions.SetTenantContextAsync(conn, _tenantService.GetCurrentTenantId());

            const string sql = @"
                SELECT 
                    ""id"" as Id, ""type"" as Type, ""title"" as Title, ""description"" as Description,
                    ""source"" as Source, ""impact"" as Impact, ""actionPlan"" as ActionPlan,
                    ""priority"" as Priority, ""status"" as Status, ""owner"" as Owner,
                    ""createdAt"" as CreatedAt, ""updatedAt"" as UpdatedAt, ""organizationId"" as OrganizationId
                FROM ""StrategicPlanning""
                ORDER BY ""updatedAt"" DESC;
            ";
            
            return await conn.QueryAsync<StrategicPlanning>(sql);
        }

        public async Task<string> AddAsync(StrategicPlanning item)
        {
            using var conn = await _dbFactory.CreateConnectionAsync();
            await Infrastructure.DapperExtensions.SetTenantContextAsync(conn, _tenantService.GetCurrentTenantId());

            if (string.IsNullOrEmpty(item.Id)) item.Id = Guid.NewGuid().ToString();
            if (string.IsNullOrEmpty(item.OrganizationId)) item.OrganizationId = _tenantService.GetCurrentTenantId().ToString();

            item.CreatedAt = DateTime.UtcNow;
            item.UpdatedAt = DateTime.UtcNow;

            const string sql = @"
                INSERT INTO ""StrategicPlanning"" (
                    ""id"", ""type"", ""title"", ""description"", ""source"", ""impact"", 
                    ""actionPlan"", ""priority"", ""status"", ""owner"", ""createdAt"", ""updatedAt"", ""organizationId""
                ) VALUES (
                    @Id, @Type, @Title, @Description, @Source, @Impact,
                    @ActionPlan, @Priority, @Status, @Owner, @CreatedAt, @UpdatedAt, @OrganizationId
                );
            ";

            await conn.ExecuteAsync(sql, item);
            return item.Id;
        }

        public async Task UpdateAsync(StrategicPlanning item)
        {
            using var conn = await _dbFactory.CreateConnectionAsync();
            await Infrastructure.DapperExtensions.SetTenantContextAsync(conn, _tenantService.GetCurrentTenantId());

            item.UpdatedAt = DateTime.UtcNow;

            const string sql = @"
                UPDATE ""StrategicPlanning"" SET
                    ""type"" = @Type, ""title"" = @Title, ""description"" = @Description,
                    ""source"" = @Source, ""impact"" = @Impact, ""actionPlan"" = @ActionPlan,
                    ""priority"" = @Priority, ""status"" = @Status, ""owner"" = @Owner,
                    ""updatedAt"" = @UpdatedAt
                WHERE ""id"" = @Id AND ""organizationId"" = @OrganizationId;
            ";

            await conn.ExecuteAsync(sql, item);
        }

        public async Task DeleteAsync(string id)
        {
            using var conn = await _dbFactory.CreateConnectionAsync();
            var tenantId = _tenantService.GetCurrentTenantId().ToString();
            await Infrastructure.DapperExtensions.SetTenantContextAsync(conn, _tenantService.GetCurrentTenantId());

            const string sql = @"DELETE FROM ""StrategicPlanning"" WHERE ""id"" = @Id AND ""organizationId"" = @OrganizationId";
            await conn.ExecuteAsync(sql, new { Id = id, OrganizationId = tenantId });
        }
    }
}
