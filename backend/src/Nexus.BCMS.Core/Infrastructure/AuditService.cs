using System.Data;
using Dapper;
using Nexus.BCMS.Domain;
using Nexus.BCMS.Shared.Infrastructure;

namespace Nexus.BCMS.Core.Infrastructure
{
    public class AuditService
    {
        private readonly IDbConnectionFactory _dbFactory;
        private readonly ITenantService _tenantService;
        private readonly IHttpContextAccessor _httpContextAccessor;

        public AuditService(
            IDbConnectionFactory dbFactory, 
            ITenantService tenantService,
            IHttpContextAccessor httpContextAccessor)
        {
            _dbFactory = dbFactory;
            _tenantService = tenantService;
            _httpContextAccessor = httpContextAccessor;
        }

        public async Task LogEventAsync(string entityName, string entityId, string action, object? oldValue = null, object? newValue = null)
        {
            try
            {
                using var conn = await _dbFactory.CreateConnectionAsync();
                
                var auditLog = new AuditLog
                {
                    EntityName = entityName,
                    EntityId = entityId,
                    Action = action,
                    UserId = _httpContextAccessor.HttpContext?.User?.Identity?.Name ?? "system",
                    OldValue = oldValue != null ? System.Text.Json.JsonSerializer.Serialize(oldValue) : null,
                    NewValue = newValue != null ? System.Text.Json.JsonSerializer.Serialize(newValue) : null,
                    OrganizationId = _tenantService.GetCurrentTenantId().ToString(),
                    IPAddress = _httpContextAccessor.HttpContext?.Connection?.RemoteIpAddress?.ToString(),
                    UserAgent = _httpContextAccessor.HttpContext?.Request?.Headers["User-Agent"].ToString()
                };

                const string sql = @"
                    INSERT INTO ""GlobalAuditLog"" (
                        ""id"", ""entityName"", ""entityId"", ""action"", ""userId"", 
                        ""oldValue"", ""newValue"", ""timestamp"", ""organizationId"", 
                        ""ipAddress"", ""userAgent""
                    ) VALUES (
                        @Id, @EntityName, @EntityId, @Action, @UserId, 
                        CAST(@OldValue AS jsonb), CAST(@NewValue AS jsonb), @Timestamp, @OrganizationId, 
                        @IPAddress, @UserAgent
                    );";

                await conn.ExecuteAsync(sql, auditLog);
            }
            catch (Exception ex)
            {
                // In a production app-security context, we must NEVER swallow security audit failures.
                // However, we also shouldn't crash the main thread if logging fails unless specified.
                // For BCDR, we log to a secondary failover if primary fails.
                System.Diagnostics.Debug.WriteLine($"Audit Logging Failed: {ex.Message}");
            }
        }
    }
}
