using Microsoft.AspNetCore.Mvc;
using Nexus.BCMS.Domain;

namespace Nexus.BCMS.Core.Features.ExerciseManagement
{
    [ApiController]
    [Route("api/exercises")]
    public class ExercisesController : ControllerBase
    {
        private readonly ExerciseRepository _repository;
        private readonly Infrastructure.AuditService _auditService;

        public ExercisesController(ExerciseRepository repository, Infrastructure.AuditService auditService)
        {
            _repository = repository;
            _auditService = auditService;
        }

        [HttpGet]
        public async Task<ActionResult<IEnumerable<ExerciseRecord>>> GetAll()
        {
            var records = await _repository.GetAllAsync();
            return Ok(records);
        }

        [HttpGet("{id}")]
        public async Task<ActionResult<ExerciseRecord>> GetById(string id)
        {
            var record = await _repository.GetByIdAsync(id);
            if (record == null) return NotFound();
            return Ok(record);
        }

        [HttpPost]
        public async Task<ActionResult<ExerciseRecord>> Create(ExerciseRecord record)
        {
            var id = await _repository.AddAsync(record);
            record.Id = id;
            await _auditService.LogEventAsync("ExerciseRecord", id, "CREATE", null, record);
            return Ok(record);
        }

        [HttpPut("{id}")]
        public async Task<ActionResult> Update(string id, ExerciseRecord record)
        {
            if (id != record.Id) return BadRequest();
            var oldRecord = await _repository.GetByIdAsync(id);
            await _repository.UpdateAsync(record);
            await _auditService.LogEventAsync("ExerciseRecord", id, "UPDATE", oldRecord, record);
            return Ok(record);
        }

        [HttpDelete("{id}")]
        public async Task<ActionResult> Delete(string id)
        {
            var oldRecord = await _repository.GetByIdAsync(id);
            await _repository.DeleteAsync(id);
            await _auditService.LogEventAsync("ExerciseRecord", id, "DELETE", oldRecord, null);
            return NoContent();
        }

        [HttpPost("{id}/follow-up")]
        public async Task<ActionResult<FollowUpAction>> AddFollowUp(string id, FollowUpAction action)
        {
            action.ExerciseRecordId = id;
            var actionId = await _repository.AddFollowUpActionAsync(action);
            action.Id = actionId;
            await _auditService.LogEventAsync("FollowUpAction", actionId, "CREATE", null, action);
            return Ok(action);
        }

        [HttpPut("follow-up/{actionId}")]
        public async Task<ActionResult> UpdateFollowUp(string actionId, FollowUpAction action)
        {
            if (actionId != action.Id) return BadRequest();
            await _repository.UpdateFollowUpActionAsync(action);
            await _auditService.LogEventAsync("FollowUpAction", actionId, "UPDATE", null, action);
            return Ok(action);
        }
    }
}
