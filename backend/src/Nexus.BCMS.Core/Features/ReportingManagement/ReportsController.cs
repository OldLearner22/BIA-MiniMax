using Microsoft.AspNetCore.Mvc;
using Nexus.BCMS.Domain;

namespace Nexus.BCMS.Core.Features.ReportingManagement
{
    [ApiController]
    [Route("api/reports")]
    public class ReportsController : ControllerBase
    {
        private readonly ReportingRepository _repository;
        private readonly Infrastructure.AuditService _auditService;

        public ReportsController(ReportingRepository repository, Infrastructure.AuditService auditService)
        {
            _repository = repository;
            _auditService = auditService;
        }

        [HttpGet("dora-compliance")]
        public async Task<ActionResult<DoraComplianceReport>> GetDoraCompliance()
        {
            var report = await _repository.GetDoraReportAsync();
            
            // Log that a compliance report was generated (DORA / ISO Requirement)
            await _auditService.LogEventAsync("ComplianceReport", "DORA", "GENERATE", null, new { score = report.OverallComplianceScore });
            
            return Ok(report);
        }
    }
}
