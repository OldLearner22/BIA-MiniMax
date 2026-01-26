namespace Nexus.BCMS.Domain
{
    public class DoraComplianceReport
    {
        public DateTime GeneratedAt { get; set; } = DateTime.UtcNow;
        public string OrganizationId { get; set; } = string.Empty;
        
        // Pilar 1: ICT Risk Management
        public RiskManagementSummary RiskSummary { get; set; } = new();
        
        // Pillar 2: Incident Reporting
        public IncidentSummary IncidentSummary { get; set; } = new();
        
        // Pillar 3: Digital Operational Resilience Testing
        public ResilienceTestingSummary TestingSummary { get; set; } = new();
        
        // Pillar 4: ICT Third-Party Risk
        public ThirdPartyRiskSummary ThirdPartySummary { get; set; } = new();
        
        public double OverallComplianceScore { get; set; }
    }

    public class RiskManagementSummary
    {
        public int TotalRisks { get; set; }
        public int CriticalRisks { get; set; }
        public double AverageExposure { get; set; }
        public int RisksWithMitigation { get; set; }
    }

    public class IncidentSummary
    {
        public int TotalIncidentsLast90Days { get; set; }
        public int CriticalIncidents { get; set; }
        public double AverageResolutionTimeHours { get; set; }
    }

    public class ResilienceTestingSummary
    {
        public int ExercisesCompletedYearToDate { get; set; }
        public int CriticalProcessesTested { get; set; }
        public int TotalCriticalProcesses { get; set; }
        public double TestingCoveragePercentage => TotalCriticalProcesses > 0 ? (double)CriticalProcessesTested / TotalCriticalProcesses * 100 : 0;
        public int OpenFollowUpActions { get; set; }
    }

    public class ThirdPartyRiskSummary
    {
        public int TotalCriticalVendors { get; set; }
        public int VendorsWithoutSla { get; set; }
        public int VendorsTestedLastYear { get; set; }
    }
}
