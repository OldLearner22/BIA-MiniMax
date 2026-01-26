using System.Data;
using Dapper;
using Nexus.BCMS.Domain;
using Nexus.BCMS.Shared.Infrastructure;

namespace Nexus.BCMS.Core.Features.StrategyManagement
{
    public class StrategyRepository
    {
        private readonly IDbConnectionFactory _dbFactory;
        private readonly Infrastructure.ITenantService _tenantService;

        public StrategyRepository(IDbConnectionFactory dbFactory, Infrastructure.ITenantService tenantService)
        {
            _dbFactory = dbFactory;
            _tenantService = tenantService;
        }

        // --- Assessments ---
        public async Task<IEnumerable<StrategyAssessment>> GetAssessmentsAsync()
        {
            using var conn = await _dbFactory.CreateConnectionAsync();
            await Infrastructure.DapperExtensions.SetTenantContextAsync(conn, _tenantService.GetCurrentTenantId());

            const string sql = @"
                SELECT 
                    ""id"" as Id, ""dimension"" as Dimension, ""currentScore"" as CurrentScore, 
                    ""targetScore"" as TargetScore, ""assessmentDate"" as AssessmentDate,
                    ""organizationId"" as OrganizationId, ""createdAt"" as CreatedAt, ""updatedAt"" as UpdatedAt
                FROM ""StrategyAssessment""
                ORDER BY ""assessmentDate"" DESC;
            ";
            return await conn.QueryAsync<StrategyAssessment>(sql);
        }

        public async Task<string> AddAssessmentAsync(StrategyAssessment assessment)
        {
            using var conn = await _dbFactory.CreateConnectionAsync();
            await Infrastructure.DapperExtensions.SetTenantContextAsync(conn, _tenantService.GetCurrentTenantId());

            if (string.IsNullOrEmpty(assessment.Id)) assessment.Id = Guid.NewGuid().ToString();
            if (string.IsNullOrEmpty(assessment.OrganizationId)) assessment.OrganizationId = _tenantService.GetCurrentTenantId().ToString();

            assessment.AssessmentDate = assessment.AssessmentDate == default ? DateTime.UtcNow : assessment.AssessmentDate;
            assessment.CreatedAt = DateTime.UtcNow;
            assessment.UpdatedAt = DateTime.UtcNow;

            const string sql = @"
                INSERT INTO ""StrategyAssessment"" (
                    ""id"", ""dimension"", ""currentScore"", ""targetScore"", ""assessmentDate"", 
                    ""organizationId"", ""createdAt"", ""updatedAt""
                ) VALUES (
                    @Id, @Dimension, @CurrentScore, @TargetScore, @AssessmentDate, 
                    @OrganizationId, @CreatedAt, @UpdatedAt
                );
            ";
            await conn.ExecuteAsync(sql, assessment);
            return assessment.Id;
        }

        public async Task UpdateAssessmentAsync(StrategyAssessment assessment)
        {
            using var conn = await _dbFactory.CreateConnectionAsync();
            await Infrastructure.DapperExtensions.SetTenantContextAsync(conn, _tenantService.GetCurrentTenantId());

            assessment.UpdatedAt = DateTime.UtcNow;

            const string sql = @"
                UPDATE ""StrategyAssessment"" SET
                    ""dimension"" = @Dimension, ""currentScore"" = @CurrentScore, 
                    ""targetScore"" = @TargetScore, ""assessmentDate"" = @AssessmentDate, 
                    ""updatedAt"" = @UpdatedAt
                WHERE ""id"" = @Id AND ""organizationId"" = @OrganizationId;
            ";
            await conn.ExecuteAsync(sql, assessment);
        }

        public async Task DeleteAssessmentAsync(string id)
        {
            using var conn = await _dbFactory.CreateConnectionAsync();
            var tenantId = _tenantService.GetCurrentTenantId().ToString();
            await Infrastructure.DapperExtensions.SetTenantContextAsync(conn, _tenantService.GetCurrentTenantId());

            const string sql = @"DELETE FROM ""StrategyAssessment"" WHERE ""id"" = @Id AND ""organizationId"" = @OrganizationId";
            await conn.ExecuteAsync(sql, new { Id = id, OrganizationId = tenantId });
        }

        // --- Objectives ---
        public async Task<IEnumerable<StrategyObjective>> GetObjectivesAsync()
        {
            using var conn = await _dbFactory.CreateConnectionAsync();
            await Infrastructure.DapperExtensions.SetTenantContextAsync(conn, _tenantService.GetCurrentTenantId());

            const string sql = @"
                SELECT 
                    ""id"" as Id, ""title"" as Title, ""description"" as Description, 
                    ""kpi"" as Kpi, ""targetValue"" as TargetValue, ""currentValue"" as CurrentValue, 
                    ""status"" as Status, ""organizationId"" as OrganizationId, 
                    ""createdAt"" as CreatedAt, ""updatedAt"" as UpdatedAt
                FROM ""StrategyObjective""
                ORDER BY ""createdAt"" DESC;
            ";
            return await conn.QueryAsync<StrategyObjective>(sql);
        }

        public async Task<string> AddObjectiveAsync(StrategyObjective objective)
        {
            using var conn = await _dbFactory.CreateConnectionAsync();
            await Infrastructure.DapperExtensions.SetTenantContextAsync(conn, _tenantService.GetCurrentTenantId());

            if (string.IsNullOrEmpty(objective.Id)) objective.Id = Guid.NewGuid().ToString();
            if (string.IsNullOrEmpty(objective.OrganizationId)) objective.OrganizationId = _tenantService.GetCurrentTenantId().ToString();

            objective.CreatedAt = DateTime.UtcNow;
            objective.UpdatedAt = DateTime.UtcNow;

            const string sql = @"
                INSERT INTO ""StrategyObjective"" (
                    ""id"", ""title"", ""description"", ""kpi"", ""targetValue"", 
                    ""currentValue"", ""status"", ""organizationId"", ""createdAt"", ""updatedAt""
                ) VALUES (
                    @Id, @Title, @Description, @Kpi, @TargetValue, 
                    @CurrentValue, @Status, @OrganizationId, @CreatedAt, @UpdatedAt
                );
            ";
            await conn.ExecuteAsync(sql, objective);
            return objective.Id;
        }

        public async Task UpdateObjectiveAsync(StrategyObjective objective)
        {
            using var conn = await _dbFactory.CreateConnectionAsync();
            await Infrastructure.DapperExtensions.SetTenantContextAsync(conn, _tenantService.GetCurrentTenantId());

            objective.UpdatedAt = DateTime.UtcNow;

            const string sql = @"
                UPDATE ""StrategyObjective"" SET
                    ""title"" = @Title, ""description"" = @Description, ""kpi"" = @Kpi, 
                    ""targetValue"" = @TargetValue, ""currentValue"" = @CurrentValue, 
                    ""status"" = @Status, ""updatedAt"" = @UpdatedAt
                WHERE ""id"" = @Id AND ""organizationId"" = @OrganizationId;
            ";
            await conn.ExecuteAsync(sql, objective);
        }

        public async Task DeleteObjectiveAsync(string id)
        {
            using var conn = await _dbFactory.CreateConnectionAsync();
            var tenantId = _tenantService.GetCurrentTenantId().ToString();
            await Infrastructure.DapperExtensions.SetTenantContextAsync(conn, _tenantService.GetCurrentTenantId());

            const string sql = @"DELETE FROM ""StrategyObjective"" WHERE ""id"" = @Id AND ""organizationId"" = @OrganizationId";
            await conn.ExecuteAsync(sql, new { Id = id, OrganizationId = tenantId });
        }

        // --- Initiatives ---
        public async Task<IEnumerable<StrategyInitiative>> GetInitiativesAsync()
        {
            using var conn = await _dbFactory.CreateConnectionAsync();
            await Infrastructure.DapperExtensions.SetTenantContextAsync(conn, _tenantService.GetCurrentTenantId());

            const string sql = @"
                SELECT 
                    ""id"" as Id, ""title"" as Title, ""description"" as Description, 
                    ""status"" as Status, ""priority"" as Priority, ""owner"" as Owner, 
                    ""progress"" as Progress, ""organizationId"" as OrganizationId, 
                    ""createdAt"" as CreatedAt, ""updatedAt"" as UpdatedAt
                FROM ""StrategyInitiative""
                ORDER BY ""createdAt"" DESC;
            ";
            return await conn.QueryAsync<StrategyInitiative>(sql);
        }

        public async Task<string> AddInitiativeAsync(StrategyInitiative initiative)
        {
            using var conn = await _dbFactory.CreateConnectionAsync();
            await Infrastructure.DapperExtensions.SetTenantContextAsync(conn, _tenantService.GetCurrentTenantId());

            if (string.IsNullOrEmpty(initiative.Id)) initiative.Id = Guid.NewGuid().ToString();
            if (string.IsNullOrEmpty(initiative.OrganizationId)) initiative.OrganizationId = _tenantService.GetCurrentTenantId().ToString();

            initiative.CreatedAt = DateTime.UtcNow;
            initiative.UpdatedAt = DateTime.UtcNow;

            const string sql = @"
                INSERT INTO ""StrategyInitiative"" (
                    ""id"", ""title"", ""description"", ""status"", ""priority"", 
                    ""owner"", ""progress"", ""organizationId"", ""createdAt"", ""updatedAt""
                ) VALUES (
                    @Id, @Title, @Description, @Status, @Priority, 
                    @Owner, @Progress, @OrganizationId, @CreatedAt, @UpdatedAt
                );
            ";
            await conn.ExecuteAsync(sql, initiative);
            return initiative.Id;
        }

        public async Task UpdateInitiativeAsync(StrategyInitiative initiative)
        {
            using var conn = await _dbFactory.CreateConnectionAsync();
            await Infrastructure.DapperExtensions.SetTenantContextAsync(conn, _tenantService.GetCurrentTenantId());

            initiative.UpdatedAt = DateTime.UtcNow;

            const string sql = @"
                UPDATE ""StrategyInitiative"" SET
                    ""title"" = @Title, ""description"" = @Description, ""status"" = @Status, 
                    ""priority"" = @Priority, ""owner"" = @Owner, ""progress"" = @Progress, 
                    ""updatedAt"" = @UpdatedAt
                WHERE ""id"" = @Id AND ""organizationId"" = @OrganizationId;
            ";
            await conn.ExecuteAsync(sql, initiative);
        }

        public async Task DeleteInitiativeAsync(string id)
        {
            using var conn = await _dbFactory.CreateConnectionAsync();
            var tenantId = _tenantService.GetCurrentTenantId().ToString();
            await Infrastructure.DapperExtensions.SetTenantContextAsync(conn, _tenantService.GetCurrentTenantId());

            const string sql = @"DELETE FROM ""StrategyInitiative"" WHERE ""id"" = @Id AND ""organizationId"" = @OrganizationId";
            await conn.ExecuteAsync(sql, new { Id = id, OrganizationId = tenantId });
        }

        // --- Recovery Options ---
        public async Task<IEnumerable<RecoveryOption>> GetRecoveryOptionsAsync()
        {
            using var conn = await _dbFactory.CreateConnectionAsync();
            await Infrastructure.DapperExtensions.SetTenantContextAsync(conn, _tenantService.GetCurrentTenantId());

            const string sql = @"
                SELECT 
                    ""id"" as Id, ""processId"" as ProcessId, ""title"" as Title, ""description"" as Description,
                    CAST(""strategyType"" AS text) as StrategyType, CAST(""tier"" AS text) as Tier,
                    ""rtoValue"" as RtoValue, ""rtoUnit"" as RtoUnit, ""rpoValue"" as RpoValue, ""rpoUnit"" as RpoUnit,
                    ""recoveryCapacity"" as RecoveryCapacity, ""peopleRequired"" as PeopleRequired,
                    ""technologyType"" as TechnologyType, ""facilityType"" as FacilityType,
                    ""implementationCost"" as ImplementationCost, ""operationalCost"" as OperationalCost,
                    ""readinessScore"" as ReadinessScore, ""lastTestedDate"" as LastTestedDate,
                    CAST(""testingStatus"" AS text) as TestingStatus, ""testingNotes"" as TestingNotes,
                    ""dependsOn"" as DependsOn, ""activationTriggers"" as ActivationTriggers,
                    ""activationProcedure"" as ActivationProcedure, CAST(""status"" AS text) as Status,
                    ""createdAt"" as CreatedAt, ""updatedAt"" as UpdatedAt, ""createdBy"" as CreatedBy,
                    ""organizationId"" as OrganizationId
                FROM ""RecoveryOption""
                ORDER BY ""createdAt"" DESC;
            ";
            return await conn.QueryAsync<RecoveryOption>(sql);
        }

        // --- Cost Benefit Analysis ---
        public async Task<IEnumerable<CostBenefitAnalysis>> GetCostBenefitAnalysesAsync()
        {
            using var conn = await _dbFactory.CreateConnectionAsync();
            await Infrastructure.DapperExtensions.SetTenantContextAsync(conn, _tenantService.GetCurrentTenantId());

            const string sql = @"
                SELECT 
                    ""id"" as Id, ""title"" as Title, ""description"" as Description, ""analysisDate"" as AnalysisDate,
                    ""totalCost"" as TotalCost, ""totalBenefit"" as TotalBenefit, ""netBenefit"" as NetBenefit,
                    ""roi"" as Roi, ""paybackPeriod"" as PaybackPeriod, ""bcRatio"" as BcRatio,
                    ""status"" as Status, ""createdAt"" as CreatedAt, ""updatedAt"" as UpdatedAt, ""createdBy"" as CreatedBy,
                    ""organizationId"" as OrganizationId
                FROM ""CostBenefitAnalysis""
                ORDER BY ""createdAt"" DESC;
            ";
            return await conn.QueryAsync<CostBenefitAnalysis>(sql);
        }

        // --- Approvals ---
        public async Task<IEnumerable<StrategyApproval>> GetApprovalsAsync()
        {
            using var conn = await _dbFactory.CreateConnectionAsync();
            await Infrastructure.DapperExtensions.SetTenantContextAsync(conn, _tenantService.GetCurrentTenantId());

            const string sql = @"
                SELECT 
                    ""id"" as Id, CAST(""strategyType"" AS text) as StrategyType, ""strategyId"" as StrategyId,
                    ""strategyTitle"" as StrategyTitle, CAST(""status"" AS text) as Status,
                    ""currentStep"" as CurrentStep, ""submittedBy"" as SubmittedBy, ""submittedAt"" as SubmittedAt,
                    ""finalDecision"" as FinalDecision, ""finalDecisionDate"" as FinalDecisionDate,
                    ""finalDecisionBy"" as FinalDecisionBy, ""organizationId"" as OrganizationId
                FROM ""StrategyApproval""
                ORDER BY ""createdAt"" DESC;
            ";
            
            var approvals = (await conn.QueryAsync<StrategyApproval>(sql)).ToList();

            foreach (var app in approvals)
            {
                const string stepsSql = @"SELECT * FROM ""StrategyApprovalStep"" WHERE ""approvalId"" = @Id ORDER BY ""stepNumber"" ASC";
                app.Steps = (await conn.QueryAsync<StrategyApprovalStep>(stepsSql, new { Id = app.Id })).ToList();
            }

            return approvals;
        }

        // --- Writes for Recovery Option ---
        public async Task<string> AddRecoveryOptionAsync(RecoveryOption option)
        {
            using var conn = await _dbFactory.CreateConnectionAsync();
            await Infrastructure.DapperExtensions.SetTenantContextAsync(conn, _tenantService.GetCurrentTenantId());

            if (string.IsNullOrEmpty(option.Id)) option.Id = Guid.NewGuid().ToString();
            if (string.IsNullOrEmpty(option.OrganizationId)) option.OrganizationId = _tenantService.GetCurrentTenantId().ToString();
            option.CreatedAt = DateTime.UtcNow;
            option.UpdatedAt = DateTime.UtcNow;

            const string sql = @"
                INSERT INTO ""RecoveryOption"" (
                    ""id"", ""processId"", ""title"", ""description"", ""strategyType"", ""tier"", ""rtoValue"", ""rtoUnit"", ""rpoValue"", ""rpoUnit"",
                    ""recoveryCapacity"", ""peopleRequired"", ""technologyType"", ""facilityType"", ""implementationCost"", ""operationalCost"",
                    ""readinessScore"", ""lastTestedDate"", ""testingStatus"", ""testingNotes"", ""dependsOn"", ""activationTriggers"",
                    ""activationProcedure"", ""status"", ""createdAt"", ""updatedAt"", ""createdBy"", ""organizationId""
                ) VALUES (
                    @Id, @ProcessId, @Title, @Description, CAST(@StrategyType AS ""RecoveryStrategyType""), CAST(@Tier AS ""RecoveryTier""), 
                    @RtoValue, @RtoUnit, @RpoValue, @RpoUnit, @RecoveryCapacity, @PeopleRequired, @TechnologyType, @FacilityType, 
                    @ImplementationCost, @OperationalCost, @ReadinessScore, @LastTestedDate, CAST(@TestingStatus AS ""TestingStatus""), 
                    @TestingNotes, @DependsOn, @ActivationTriggers, @ActivationProcedure, CAST(@Status AS ""StrategyStatus""), 
                    @CreatedAt, @UpdatedAt, @CreatedBy, @OrganizationId
                );
            ";
            await conn.ExecuteAsync(sql, option);
            return option.Id;
        }

        // --- Writes for Cost Benefit ---
        public async Task<string> AddCostBenefitAnalysisAsync(CostBenefitAnalysis analysis)
        {
            using var conn = await _dbFactory.CreateConnectionAsync();
            await Infrastructure.DapperExtensions.SetTenantContextAsync(conn, _tenantService.GetCurrentTenantId());

            if (string.IsNullOrEmpty(analysis.Id)) analysis.Id = Guid.NewGuid().ToString();
            if (string.IsNullOrEmpty(analysis.OrganizationId)) analysis.OrganizationId = _tenantService.GetCurrentTenantId().ToString();
            analysis.CreatedAt = DateTime.UtcNow;
            analysis.UpdatedAt = DateTime.UtcNow;

            const string sql = @"
                INSERT INTO ""CostBenefitAnalysis"" (
                    ""id"", ""title"", ""description"", ""analysisDate"",
                    ""implementationPersonnel"", ""implementationTech"", ""implementationInfra"", ""implementationTraining"", ""implementationExternal"", ""implementationOther"",
                    ""operationalPersonnel"", ""operationalTech"", ""operationalInfra"", ""operationalTraining"", ""operationalExternal"", ""operationalOther"",
                    ""maintenancePersonnel"", ""maintenanceTech"", ""maintenanceInfra"", ""maintenanceTraining"", ""maintenanceExternal"", ""maintenanceOther"",
                    ""avoidedFinancial"", ""avoidedOperational"", ""avoidedReputational"", ""avoidedLegal"",
                    ""totalCost"", ""totalBenefit"", ""netBenefit"", ""roi"", ""paybackPeriod"", ""bcRatio"",
                    ""bestCaseRoi"", ""bestCaseNetBenefit"", ""worstCaseRoi"", ""worstCaseNetBenefit"",
                    ""intangibleBenefits"", ""recommendation"", ""recommendationNotes"", ""riskReduction"",
                    ""status"", ""createdAt"", ""updatedAt"", ""createdBy"", ""organizationId""
                ) VALUES (
                    @Id, @Title, @Description, @AnalysisDate,
                    @ImplementationPersonnel, @ImplementationTech, @ImplementationInfra, @ImplementationTraining, @ImplementationExternal, @ImplementationOther,
                    @OperationalPersonnel, @OperationalTech, @OperationalInfra, @OperationalTraining, @OperationalExternal, @OperationalOther,
                    @MaintenancePersonnel, @MaintenanceTech, @MaintenanceInfra, @MaintenanceTraining, @MaintenanceExternal, @MaintenanceOther,
                    @AvoidedFinancial, @AvoidedOperational, @AvoidedReputational, @AvoidedLegal,
                    @TotalCost, @TotalBenefit, @NetBenefit, @Roi, @PaybackPeriod, @BcRatio,
                    @BestCaseRoi, @BestCaseNetBenefit, @WorstCaseRoi, @WorstCaseNetBenefit,
                    @IntangibleBenefits, @Recommendation, @RecommendationNotes, @RiskReduction,
                    CAST(@Status AS ""StrategyStatus""), @CreatedAt, @UpdatedAt, @CreatedBy, @OrganizationId
                );
            ";
            await conn.ExecuteAsync(sql, analysis);
            return analysis.Id;
        }

        public async Task<CostBenefitAnalysis?> CalculateAndSaveCbaAsync(string id)
        {
            using var conn = await _dbFactory.CreateConnectionAsync();
            await Infrastructure.DapperExtensions.SetTenantContextAsync(conn, _tenantService.GetCurrentTenantId());

            const string selectSql = @"
                SELECT 
                    ""id"" as Id, ""implementationPersonnel"" as ImplementationPersonnel, ""implementationTech"" as ImplementationTech, 
                    ""implementationInfra"" as ImplementationInfra, ""implementationTraining"" as ImplementationTraining, 
                    ""implementationExternal"" as ImplementationExternal, ""implementationOther"" as ImplementationOther,
                    ""operationalPersonnel"" as OperationalPersonnel, ""operationalTech"" as OperationalTech, 
                    ""operationalInfra"" as OperationalInfra, ""operationalTraining"" as OperationalTraining, 
                    ""operationalExternal"" as OperationalExternal, ""operationalOther"" as OperationalOther,
                    ""maintenancePersonnel"" as MaintenancePersonnel, ""maintenanceTech"" as MaintenanceTech, 
                    ""maintenanceInfra"" as MaintenanceInfra, ""maintenanceTraining"" as MaintenanceTraining, 
                    ""maintenanceExternal"" as MaintenanceExternal, ""maintenanceOther"" as MaintenanceOther,
                    ""avoidedFinancial"" as AvoidedFinancial, ""avoidedOperational"" as AvoidedOperational, 
                    ""avoidedReputational"" as AvoidedReputational, ""avoidedLegal"" as AvoidedLegal,
                    ""organizationId"" as OrganizationId
                FROM ""CostBenefitAnalysis"" 
                WHERE ""id"" = @Id;
            ";

            var analysis = await conn.QuerySingleOrDefaultAsync<CostBenefitAnalysis>(selectSql, new { Id = id });

            if (analysis != null)
            {
                analysis.TotalCost = analysis.ImplementationPersonnel + analysis.ImplementationTech + analysis.ImplementationInfra + 
                                     analysis.ImplementationTraining + analysis.ImplementationExternal + analysis.ImplementationOther +
                                     analysis.OperationalPersonnel + analysis.OperationalTech + analysis.OperationalInfra + 
                                     analysis.OperationalTraining + analysis.OperationalExternal + analysis.OperationalOther +
                                     analysis.MaintenancePersonnel + analysis.MaintenanceTech + analysis.MaintenanceInfra + 
                                     analysis.MaintenanceTraining + analysis.MaintenanceExternal + analysis.MaintenanceOther;

                analysis.TotalBenefit = analysis.AvoidedFinancial + analysis.AvoidedOperational + analysis.AvoidedReputational + analysis.AvoidedLegal;
                analysis.NetBenefit = analysis.TotalBenefit - analysis.TotalCost;
                analysis.Roi = analysis.TotalCost > 0 ? (analysis.NetBenefit / analysis.TotalCost) * 100 : 0;
                analysis.BcRatio = analysis.TotalCost > 0 ? (analysis.TotalBenefit / analysis.TotalCost) : 0;
                analysis.PaybackPeriod = analysis.TotalBenefit > 0 ? (analysis.TotalCost / (analysis.TotalBenefit / 36.0)) : 0;
                analysis.UpdatedAt = DateTime.UtcNow;

                const string updateSql = @"
                    UPDATE ""CostBenefitAnalysis"" SET
                        ""totalCost"" = @TotalCost, ""totalBenefit"" = @TotalBenefit, ""netBenefit"" = @NetBenefit,
                        ""roi"" = @Roi, ""bcRatio"" = @BcRatio, ""paybackPeriod"" = @PaybackPeriod,
                        ""updatedAt"" = @UpdatedAt
                    WHERE ""id"" = @Id;
                ";
                await conn.ExecuteAsync(updateSql, new {
                    analysis.TotalCost, analysis.TotalBenefit, analysis.NetBenefit,
                    analysis.Roi, analysis.BcRatio, analysis.PaybackPeriod,
                    analysis.UpdatedAt, Id = id
                });

                return analysis;
            }
            return null;
        }
    }
}
