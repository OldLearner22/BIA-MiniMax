using System.Data;
using Dapper;
using Nexus.BCMS.Domain;
using Nexus.BCMS.Shared.Infrastructure;

namespace Nexus.BCMS.Core.Features.ExerciseManagement
{
    public class ExerciseRepository
    {
        private readonly IDbConnectionFactory _dbFactory;
        private readonly Infrastructure.ITenantService _tenantService;

        public ExerciseRepository(IDbConnectionFactory dbFactory, Infrastructure.ITenantService tenantService)
        {
            _dbFactory = dbFactory;
            _tenantService = tenantService;
        }

        private string MapEnum(Enum e)
        {
            return e.ToString().Replace("_", "-");
        }

        public async Task<IEnumerable<ExerciseRecord>> GetAllAsync()
        {
            using var conn = await _dbFactory.CreateConnectionAsync();
            const string sql = @"
                SELECT 
                    ""id"" as Id, ""title"" as Title, ""type""::text as Type, ""status""::text as Status,
                    ""scheduledDate"" as ScheduledDate, ""completedDate"" as CompletedDate,
                    ""description"" as Description, ""scope""::text as Scope,
                    ""participants"" as Participants, ""findings"" as Findings,
                    ""createdAt"" as CreatedAt, ""updatedAt"" as UpdatedAt,
                    ""organizationId"" as OrganizationId
                FROM ""ExerciseRecord""
                ORDER BY ""scheduledDate"" DESC;
            ";
            var result = await conn.QueryAsync<dynamic>(sql);
            return result.Select(r => new ExerciseRecord {
                Id = r.id,
                Title = r.title,
                Type = Enum.Parse<ExerciseType>(((string)r.type).Replace("-", "_")),
                Status = Enum.Parse<ExerciseStatus>(((string)r.status).Replace("-", "_")),
                ScheduledDate = r.scheduledDate == null ? (DateTime?)null : (DateTime)r.scheduledDate,
                CompletedDate = r.completedDate == null ? (DateTime?)null : (DateTime)r.completedDate,
                Description = r.description,
                Scope = r.scope,
                Participants = r.participants != null ? ((string[])r.participants).ToList() : new List<string>(),
                Findings = r.findings ?? string.Empty,
                CreatedAt = r.createdAt == null ? DateTime.MinValue : (DateTime)r.createdAt,
                UpdatedAt = r.updatedAt == null ? DateTime.MinValue : (DateTime)r.updatedAt,
                OrganizationId = r.organizationId
            });
        }

        public async Task<ExerciseRecord?> GetByIdAsync(string id)
        {
            using var conn = await _dbFactory.CreateConnectionAsync();
            const string sql = @"
                SELECT 
                    ""id"" as Id, ""title"" as Title, ""type""::text as Type, ""status""::text as Status,
                    ""scheduledDate"" as ScheduledDate, ""completedDate"" as CompletedDate,
                    ""description"" as Description, ""scope""::text as Scope,
                    ""participants"" as Participants, ""findings"" as Findings,
                    ""createdAt"" as CreatedAt, ""updatedAt"" as UpdatedAt,
                    ""organizationId"" as OrganizationId
                FROM ""ExerciseRecord""
                WHERE ""id"" = @Id;
                
                SELECT 
                    ""id"" as Id, ""exerciseRecordId"" as ExerciseRecordId, 
                    ""description"" as Description, ""owner"" as Owner,
                    ""dueDate"" as DueDate, ""status"" as Status,
                    ""completedDate"" as CompletedDate, ""organizationId"" as OrganizationId
                FROM ""FollowUpAction""
                WHERE ""exerciseRecordId"" = @Id;
            ";

            using var multi = await conn.QueryMultipleAsync(sql, new { Id = id });
            var r = await multi.ReadSingleOrDefaultAsync<dynamic>();
            if (r == null) return null;

            var record = new ExerciseRecord {
                Id = r.id,
                Title = r.title,
                Type = Enum.Parse<ExerciseType>(((string)r.type).Replace("-", "_")),
                Status = Enum.Parse<ExerciseStatus>(((string)r.status).Replace("-", "_")),
                ScheduledDate = r.scheduledDate == null ? (DateTime?)null : (DateTime)r.scheduledDate,
                CompletedDate = r.completedDate == null ? (DateTime?)null : (DateTime)r.completedDate,
                Description = r.description,
                Scope = r.scope,
                Participants = r.participants != null ? ((string[])r.participants).ToList() : new List<string>(),
                Findings = r.findings ?? string.Empty,
                CreatedAt = r.createdAt == null ? DateTime.MinValue : (DateTime)r.createdAt,
                UpdatedAt = r.updatedAt == null ? DateTime.MinValue : (DateTime)r.updatedAt,
                OrganizationId = r.organizationId
            };
            
            record.FollowUpActions = (await multi.ReadAsync<FollowUpAction>()).ToList();
            return record;
        }

        public async Task<string> AddAsync(ExerciseRecord record)
        {
            using var conn = await _dbFactory.CreateConnectionAsync();
            if (string.IsNullOrEmpty(record.Id)) record.Id = Guid.NewGuid().ToString();
            
            var tid = _tenantService.GetCurrentTenantId().ToString();
            record.OrganizationId = tid;

            const string sql = @"
                INSERT INTO ""ExerciseRecord"" (
                    ""id"", ""title"", ""type"", ""status"", ""scheduledDate"", ""completedDate"",
                    ""description"", ""scope"", ""participants"", ""findings"", ""createdAt"", ""updatedAt"", ""organizationId""
                ) VALUES (
                    @Id, @Title, CAST(@TypeStr AS ""ExerciseType""), CAST(@StatusStr AS ""ExerciseStatus""), 
                    @ScheduledDate, @CompletedDate, @Description, CAST(@Scope AS jsonb), 
                    @Participants, @Findings, @CreatedAt, @UpdatedAt, @OrgId
                );
            ";

            var parameters = new {
                Id = record.Id,
                Title = record.Title,
                TypeStr = MapEnum(record.Type),
                StatusStr = MapEnum(record.Status),
                ScheduledDate = record.ScheduledDate,
                CompletedDate = record.CompletedDate,
                Description = record.Description,
                Scope = record.Scope ?? "{}",
                Participants = record.Participants.ToArray(),
                Findings = record.Findings ?? string.Empty,
                CreatedAt = record.CreatedAt,
                UpdatedAt = record.UpdatedAt,
                OrgId = record.OrganizationId
            };

            await conn.ExecuteAsync(sql, parameters);
            return record.Id;
        }

        public async Task UpdateAsync(ExerciseRecord record)
        {
            using var conn = await _dbFactory.CreateConnectionAsync();
            record.UpdatedAt = DateTime.UtcNow;

            const string sql = @"
                UPDATE ""ExerciseRecord"" SET
                    ""title"" = @Title,
                    ""type"" = CAST(@TypeStr AS ""ExerciseType""),
                    ""status"" = CAST(@StatusStr AS ""ExerciseStatus""),
                    ""scheduledDate"" = @ScheduledDate,
                    ""completedDate"" = @CompletedDate,
                    ""description"" = @Description,
                    ""scope"" = CAST(@Scope AS jsonb),
                    ""participants"" = @Participants,
                    ""findings"" = @Findings,
                    ""updatedAt"" = @UpdatedAt
                WHERE ""id"" = @Id AND ""organizationId"" = @OrgId;
            ";

            var parameters = new {
                Id = record.Id,
                Title = record.Title,
                TypeStr = MapEnum(record.Type),
                StatusStr = MapEnum(record.Status),
                ScheduledDate = record.ScheduledDate,
                CompletedDate = record.CompletedDate,
                Description = record.Description,
                Scope = record.Scope ?? "{}",
                Participants = record.Participants.ToArray(),
                Findings = record.Findings ?? string.Empty,
                UpdatedAt = record.UpdatedAt,
                OrgId = record.OrganizationId
            };

            await conn.ExecuteAsync(sql, parameters);
        }

        public async Task DeleteAsync(string id)
        {
            using var conn = await _dbFactory.CreateConnectionAsync();
            const string sql = @"DELETE FROM ""ExerciseRecord"" WHERE ""id"" = @Id AND ""organizationId"" = @OrgId";
            await conn.ExecuteAsync(sql, new { Id = id, OrgId = _tenantService.GetCurrentTenantId().ToString() });
        }

        // --- Follow Up Actions ---

        public async Task<string> AddFollowUpActionAsync(FollowUpAction action)
        {
            using var conn = await _dbFactory.CreateConnectionAsync();
            if (string.IsNullOrEmpty(action.Id)) action.Id = Guid.NewGuid().ToString();
            action.OrganizationId = _tenantService.GetCurrentTenantId().ToString();

            const string sql = @"
                INSERT INTO ""FollowUpAction"" (
                    ""id"", ""exerciseRecordId"", ""description"", ""owner"", ""dueDate"", ""status"", ""completedDate"", ""organizationId""
                ) VALUES (
                    @Id, @ExerciseRecordId, @Description, @Owner, @DueDate, @Status, @CompletedDate, @OrgId
                );
            ";

            await conn.ExecuteAsync(sql, new {
                action.Id,
                action.ExerciseRecordId,
                action.Description,
                action.Owner,
                action.DueDate,
                action.Status,
                action.CompletedDate,
                OrgId = action.OrganizationId
            });
            return action.Id;
        }

        public async Task UpdateFollowUpActionAsync(FollowUpAction action)
        {
            using var conn = await _dbFactory.CreateConnectionAsync();
            const string sql = @"
                UPDATE ""FollowUpAction"" SET
                    ""description"" = @Description,
                    ""owner"" = @Owner,
                    ""dueDate"" = @DueDate,
                    ""status"" = @Status,
                    ""completedDate"" = @CompletedDate
                WHERE ""id"" = @Id AND ""organizationId"" = @OrgId;
            ";
            await conn.ExecuteAsync(sql, new {
                action.Id,
                action.Description,
                action.Owner,
                action.DueDate,
                action.Status,
                action.CompletedDate,
                OrgId = action.OrganizationId
            });
        }
    }
}
