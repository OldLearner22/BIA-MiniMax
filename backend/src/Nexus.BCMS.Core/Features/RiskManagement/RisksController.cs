using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Nexus.BCMS.Domain;

namespace Nexus.BCMS.Core.Features.RiskManagement
{
    [ApiController]
    [Route("api/risks")]
    // [Authorize] // Commented out for MVP verification, enable later matches Node behavior (Public/Dev)
    public class RisksController : ControllerBase
    {
        private readonly RiskRepository _repository;
        private readonly Infrastructure.AuditService _auditService;

        public RisksController(RiskRepository repository, Infrastructure.AuditService auditService)
        {
            _repository = repository;
            _auditService = auditService;
        }

        [HttpGet]
        public async Task<ActionResult<IEnumerable<Risk>>> GetAll()
        {
            Response.Headers.Append("X-Source", "NET-Core-V2");
            var risks = await _repository.GetAllAsync();
            return Ok(risks);
        }

        [HttpGet("{id}")]
        public async Task<ActionResult<Risk>> GetById(string id)
        {
            var risk = await _repository.GetByIdAsync(id);
            if (risk == null) return NotFound();
            return Ok(risk);
        }

        [HttpPost]
        public async Task<ActionResult<Risk>> Create(Risk risk)
        {
            var id = await _repository.AddAsync(risk);
            risk.Id = id;
            await _auditService.LogEventAsync("Risk", id, "CREATE", null, risk);
            return Ok(risk);
        }

        [HttpPut("{id}")]
        public async Task<ActionResult> Update(string id, Risk risk)
        {
            if (id != risk.Id) return BadRequest();
            var oldRisk = await _repository.GetByIdAsync(id);
            await _repository.UpdateAsync(risk);
            await _auditService.LogEventAsync("Risk", id, "UPDATE", oldRisk, risk);
            return Ok(risk);
        }

        [HttpDelete("{id}")]
        public async Task<ActionResult> Delete(string id)
        {
            var oldRisk = await _repository.GetByIdAsync(id);
            await _repository.DeleteAsync(id);
            await _auditService.LogEventAsync("Risk", id, "DELETE", oldRisk, null);
            return Ok(new { success = true });
        }
    }
}
