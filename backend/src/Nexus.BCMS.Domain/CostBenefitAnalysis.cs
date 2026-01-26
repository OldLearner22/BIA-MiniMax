namespace Nexus.BCMS.Domain
{
    public class CostBenefitAnalysis
    {
        public string Id { get; set; } = string.Empty;
        public required string Title { get; set; }
        public required string Description { get; set; }
        public DateTime AnalysisDate { get; set; }
        
        // Implementation Costs
        public double ImplementationPersonnel { get; set; }
        public double ImplementationTech { get; set; }
        public double ImplementationInfra { get; set; }
        public double ImplementationTraining { get; set; }
        public double ImplementationExternal { get; set; }
        public double ImplementationOther { get; set; }

        // Operational Costs
        public double OperationalPersonnel { get; set; }
        public double OperationalTech { get; set; }
        public double OperationalInfra { get; set; }
        public double OperationalTraining { get; set; }
        public double OperationalExternal { get; set; }
        public double OperationalOther { get; set; }

        // Maintenance Costs
        public double MaintenancePersonnel { get; set; }
        public double MaintenanceTech { get; set; }
        public double MaintenanceInfra { get; set; }
        public double MaintenanceTraining { get; set; }
        public double MaintenanceExternal { get; set; }
        public double MaintenanceOther { get; set; }

        // Benefits
        public double AvoidedFinancial { get; set; }
        public double AvoidedOperational { get; set; }
        public double AvoidedReputational { get; set; }
        public double AvoidedLegal { get; set; }

        // Calculated Metrics
        public double TotalCost { get; set; }
        public double TotalBenefit { get; set; }
        public double NetBenefit { get; set; }
        public double Roi { get; set; }
        public double PaybackPeriod { get; set; }
        public double BcRatio { get; set; }

        // Scenario Analysis
        public double BestCaseRoi { get; set; }
        public double BestCaseNetBenefit { get; set; }
        public double WorstCaseRoi { get; set; }
        public double WorstCaseNetBenefit { get; set; }

        public string[] IntangibleBenefits { get; set; } = Array.Empty<string>();
        public required string Recommendation { get; set; }
        public required string RecommendationNotes { get; set; }
        public double RiskReduction { get; set; }

        public required string Status { get; set; }
        public DateTime CreatedAt { get; set; }
        public DateTime UpdatedAt { get; set; }
        public required string CreatedBy { get; set; }
        public string OrganizationId { get; set; } = string.Empty;

        // Relations
        public List<RecoveryOption> RecoveryOptions { get; set; } = new();
    }
}
