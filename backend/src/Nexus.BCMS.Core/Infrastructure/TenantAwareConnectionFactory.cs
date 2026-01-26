using System.Data;
using Nexus.BCMS.Shared.Infrastructure;

namespace Nexus.BCMS.Core.Infrastructure
{
    public class TenantAwareConnectionFactory : IDbConnectionFactory
    {
        private readonly IDbConnectionFactory _innerFactory;
        private readonly ITenantService _tenantService;

        public TenantAwareConnectionFactory(IDbConnectionFactory innerFactory, ITenantService tenantService)
        {
            _innerFactory = innerFactory;
            _tenantService = tenantService;
        }

        public async Task<IDbConnection> CreateConnectionAsync()
        {
            var connection = await _innerFactory.CreateConnectionAsync();
            var tenantId = _tenantService.GetCurrentTenantId();
            
            // Phase 3.2: Automated RLS Enforcement
            // This ensures that even if a developer forgets to call SetTenantContextAsync,
            // the connection ALREADY has the correct tenant context.
            await connection.SetTenantContextAsync(tenantId);
            
            return connection;
        }
    }
}
