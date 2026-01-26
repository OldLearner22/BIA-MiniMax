using Microsoft.AspNetCore.Mvc;
using Nexus.BCMS.Domain;

namespace Nexus.BCMS.Core.Features.ThreatManagement
{
    [ApiController]
    [Route("api/threats")]
    public class ThreatsController : ControllerBase
    {
        private readonly ThreatRepository _repository;
        private readonly Infrastructure.AuditService _auditService;

        public ThreatsController(ThreatRepository repository, Infrastructure.AuditService auditService)
        {
            _repository = repository;
            _auditService = auditService;
        }

        [HttpGet]
        public async Task<ActionResult<IEnumerable<Threat>>> GetAll()
        {
            Response.Headers.Append("X-Source", "NET-Core-Threat-V2");
            var threats = await _repository.GetAllAsync();
            return Ok(threats);
        }

        [HttpGet("{id}")]
        public async Task<ActionResult<Threat>> GetById(string id)
        {
            var threat = await _repository.GetByIdAsync(id);
            if (threat == null) return NotFound();
            return Ok(threat);
        }

        [HttpPost]
        public async Task<ActionResult<Threat>> Create(Threat threat)
        {
            var id = await _repository.AddAsync(threat);
            threat.Id = id;
            await _auditService.LogEventAsync("Threat", id, "CREATE", null, threat);
            return Ok(threat);
        }

        [HttpPut("{id}")]
        public async Task<ActionResult<Threat>> Update(string id, Threat threat)
        {
            if (id != threat.Id) return BadRequest();
            var oldThreat = await _repository.GetByIdAsync(id);
            await _repository.UpdateAsync(threat);
            await _auditService.LogEventAsync("Threat", id, "UPDATE", oldThreat, threat);
            return Ok(threat);
        }

        [HttpDelete("{id}")]
        public async Task<ActionResult> Delete(string id)
        {
            var oldThreat = await _repository.GetByIdAsync(id);
            await _repository.DeleteAsync(id);
            await _auditService.LogEventAsync("Threat", id, "DELETE", oldThreat, null);
            return NoContent(); 
        }
    }
}
