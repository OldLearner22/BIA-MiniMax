using System.Data;
using Dapper;

namespace Nexus.BCMS.Core.Infrastructure
{
    public interface ITenantService
    {
        Guid GetCurrentTenantId();
    }

    // Temporary Stub for Phase 1.2 Health Checks
    public class StaticTenantService : ITenantService
    {
        public Guid GetCurrentTenantId() => Guid.Parse("00000000-0000-0000-0000-000000000001");
    }

    public static class DapperExtensions
    {
        // Enforce RLS on every query
        public static async Task SetTenantContextAsync(this IDbConnection connection, Guid tenantId)
        {
            await connection.ExecuteAsync("SELECT set_config('app.current_tenant', @tenantId::text, false)", new { tenantId });
        }
    }
}
