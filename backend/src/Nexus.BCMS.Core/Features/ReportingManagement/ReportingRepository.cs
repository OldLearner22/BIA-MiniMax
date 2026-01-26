using System.Data;
using Dapper;
using Nexus.BCMS.Domain;
using Nexus.BCMS.Shared.Infrastructure;

namespace Nexus.BCMS.Core.Features.ReportingManagement
{
    public class ReportingRepository
    {
        private readonly IDbConnectionFactory _dbFactory;
        private readonly Infrastructure.ITenantService _tenantService;

        public ReportingRepository(IDbConnectionFactory dbFactory, Infrastructure.ITenantService tenantService)
        {
            _dbFactory = dbFactory;
            _tenantService = tenantService;
        }

        public async Task<DoraComplianceReport> GetDoraReportAsync()
        {
            using var conn = await _dbFactory.CreateConnectionAsync();
            var report = new DoraComplianceReport
            {
                OrganizationId = _tenantService.GetCurrentTenantId().ToString()
            };

            // 1. Risk Management Summary
            const string riskSql = @"
                SELECT 
                    COUNT(*) as TotalRisks,
                    COUNT(*) FILTER (WHERE ""criticality"" = 'Critical' OR ""criticality"" = 'High') as CriticalRisks,
                    AVG(""exposure"") as AverageExposure,
                    COUNT(*) FILTER (WHERE ""mitigationStrategy"" IS NOT NULL AND ""mitigationStrategy"" != '') as RisksWithMitigation
                FROM ""Risk"";
            ";
            report.RiskSummary = await conn.QuerySingleAsync<RiskManagementSummary>(riskSql);

            // 2. Resilience Testing Summary
            const string testingSql = @"
                -- Completed Exercises
                SELECT COUNT(*) FROM ""ExerciseRecord"" 
                WHERE ""status"" = 'completed' AND ""completedDate"" >= date_trunc('year', now());

                -- Open Follow-up Actions
                SELECT COUNT(*) FROM ""FollowUpAction"" WHERE ""status"" = 'open';

                -- Total Critical Processes
                SELECT COUNT(*) FROM ""Process"" WHERE ""criticality"" = 'critical' OR ""criticality"" = 'high';

                -- Critical Processes Tested
                SELECT COUNT(DISTINCT l.""processId"")
                FROM ""ProcessResourceLink"" l
                JOIN ""ExerciseRecord"" e ON e.""scope""->'affectedResources' @> jsonb_build_array(l.""resourceId""::text)
                JOIN ""Process"" p ON p.""id"" = l.""processId""
                WHERE e.""status"" = 'completed' 
                  AND e.""completedDate"" >= date_trunc('year', now())
                  AND (p.""criticality"" = 'critical' OR p.""criticality"" = 'high');
            ";

            using var multi = await conn.QueryMultipleAsync(testingSql);
            report.TestingSummary.ExercisesCompletedYearToDate = await multi.ReadSingleAsync<int>();
            report.TestingSummary.OpenFollowUpActions = await multi.ReadSingleAsync<int>();
            report.TestingSummary.TotalCriticalProcesses = await multi.ReadSingleAsync<int>();
            report.TestingSummary.CriticalProcessesTested = await multi.ReadSingleAsync<int>();

            // 3. Third-Party Risk Summary
            const string vendorSql = @"
                -- Total Critical Vendors
                SELECT COUNT(*) FROM ""VendorDetails"" v
                JOIN ""BusinessResource"" r ON r.""id"" = v.""resourceId""
                WHERE r.""type"" = 'vendors';

                -- Vendors without SLA (missing guaranteed RTO)
                SELECT COUNT(*) FROM ""VendorDetails"" WHERE ""guaranteedRto"" IS NULL OR ""guaranteedRto"" = 0;
            ";
            using var vendorMulti = await conn.QueryMultipleAsync(vendorSql);
            report.ThirdPartySummary.TotalCriticalVendors = await vendorMulti.ReadSingleAsync<int>();
            report.ThirdPartySummary.VendorsWithoutSla = await vendorMulti.ReadSingleAsync<int>();

            // Calculate overall score (Simplified heuristic)
            double riskScore = report.RiskSummary.TotalRisks > 0 ? (double)report.RiskSummary.RisksWithMitigation / report.RiskSummary.TotalRisks : 1;
            double testingScore = report.TestingSummary.TestingCoveragePercentage / 100;
            double vendorScore = report.ThirdPartySummary.TotalCriticalVendors > 0 ? 
                1.0 - ((double)report.ThirdPartySummary.VendorsWithoutSla / report.ThirdPartySummary.TotalCriticalVendors) : 1;

            report.OverallComplianceScore = (riskScore + testingScore + vendorScore) / 3.0 * 100;

            return report;
        }
    }
}
