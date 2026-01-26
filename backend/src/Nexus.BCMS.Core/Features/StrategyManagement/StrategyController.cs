using Microsoft.AspNetCore.Mvc;
using Nexus.BCMS.Domain;

namespace Nexus.BCMS.Core.Features.StrategyManagement
{
    [ApiController]
    [Route("api/strategy")]
    public class StrategyController : ControllerBase
    {
        private readonly StrategyRepository _repository;

        public StrategyController(StrategyRepository repository)
        {
            _repository = repository;
        }

        // --- Assessments ---
        [HttpGet("assessments")]
        public async Task<ActionResult<IEnumerable<StrategyAssessment>>> GetAssessments()
        {
            Response.Headers.Append("X-Source", "NET-Core-StrategyAssessment-V2");
            var assessments = await _repository.GetAssessmentsAsync();
            return Ok(assessments);
        }

        [HttpPost("assessments")]
        public async Task<ActionResult<StrategyAssessment>> CreateAssessment(StrategyAssessment assessment)
        {
            var id = await _repository.AddAssessmentAsync(assessment);
            assessment.Id = id;
            return Ok(assessment);
        }

        [HttpPut("assessments/{id}")]
        public async Task<ActionResult<StrategyAssessment>> UpdateAssessment(string id, StrategyAssessment assessment)
        {
            if (id != assessment.Id) return BadRequest();
            await _repository.UpdateAssessmentAsync(assessment);
            return Ok(assessment);
        }

        [HttpDelete("assessments/{id}")]
        public async Task<ActionResult> DeleteAssessment(string id)
        {
            await _repository.DeleteAssessmentAsync(id);
            return Ok(new { success = true });
        }

        // --- Objectives ---
        [HttpGet("objectives")]
        public async Task<ActionResult<IEnumerable<StrategyObjective>>> GetObjectives()
        {
            Response.Headers.Append("X-Source", "NET-Core-StrategyObjective-V2");
            var objectives = await _repository.GetObjectivesAsync();
            return Ok(objectives);
        }

        [HttpPost("objectives")]
        public async Task<ActionResult<StrategyObjective>> CreateObjective(StrategyObjective objective)
        {
            var id = await _repository.AddObjectiveAsync(objective);
            objective.Id = id;
            return Ok(objective);
        }

        [HttpPut("objectives/{id}")]
        public async Task<ActionResult<StrategyObjective>> UpdateObjective(string id, StrategyObjective objective)
        {
            if (id != objective.Id) return BadRequest();
            await _repository.UpdateObjectiveAsync(objective);
            return Ok(objective);
        }

        [HttpDelete("objectives/{id}")]
        public async Task<ActionResult> DeleteObjective(string id)
        {
            await _repository.DeleteObjectiveAsync(id);
            return Ok(new { success = true });
        }

        // --- Initiatives ---
        [HttpGet("initiatives")]
        public async Task<ActionResult<IEnumerable<StrategyInitiative>>> GetInitiatives()
        {
            Response.Headers.Append("X-Source", "NET-Core-StrategyInitiative-V2");
            var initiatives = await _repository.GetInitiativesAsync();
            return Ok(initiatives);
        }

        [HttpPost("initiatives")]
        public async Task<ActionResult<StrategyInitiative>> CreateInitiative(StrategyInitiative initiative)
        {
            var id = await _repository.AddInitiativeAsync(initiative);
            initiative.Id = id;
            return Ok(initiative);
        }

        [HttpPut("initiatives/{id}")]
        public async Task<ActionResult<StrategyInitiative>> UpdateInitiative(string id, StrategyInitiative initiative)
        {
            if (id != initiative.Id) return BadRequest();
            await _repository.UpdateInitiativeAsync(initiative);
            return Ok(initiative);
        }

        [HttpDelete("initiatives/{id}")]
        public async Task<ActionResult> DeleteInitiative(string id)
        {
            await _repository.DeleteInitiativeAsync(id);
            return Ok(new { success = true });
        }

        // --- Recovery Options ---
        [HttpGet("recovery-options")]
        public async Task<ActionResult<IEnumerable<RecoveryOption>>> GetRecoveryOptions()
        {
            Response.Headers.Append("X-Source", "NET-Core-RecoveryOption-V2");
            var options = await _repository.GetRecoveryOptionsAsync();
            return Ok(options);
        }

        // --- Cost Benefit ---
        [HttpGet("cost-benefit")]
        public async Task<ActionResult<IEnumerable<CostBenefitAnalysis>>> GetCostBenefitAnalyses()
        {
            Response.Headers.Append("X-Source", "NET-Core-CBA-V2");
            var analyses = await _repository.GetCostBenefitAnalysesAsync();
            return Ok(analyses);
        }

        [HttpPost("cost-benefit/{id}/calculate")]
        public async Task<ActionResult<CostBenefitAnalysis>> CalculateCba(string id)
        {
            var analysis = await _repository.CalculateAndSaveCbaAsync(id);
            if (analysis == null) return NotFound();
            return Ok(analysis);
        }

        // --- Approvals ---
        [HttpGet("approvals")]
        public async Task<ActionResult<IEnumerable<StrategyApproval>>> GetApprovals()
        {
            Response.Headers.Append("X-Source", "NET-Core-Approval-V2");
            var approvals = await _repository.GetApprovalsAsync();
            return Ok(approvals);
        }
    }
}
