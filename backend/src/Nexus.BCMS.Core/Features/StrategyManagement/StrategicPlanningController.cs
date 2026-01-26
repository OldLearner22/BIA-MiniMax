using Microsoft.AspNetCore.Mvc;
using Nexus.BCMS.Domain;

namespace Nexus.BCMS.Core.Features.StrategyManagement
{
    [ApiController]
    [Route("api/strategic-planning")]
    public class StrategicPlanningController : ControllerBase
    {
        private readonly StrategicPlanningRepository _repository;

        public StrategicPlanningController(StrategicPlanningRepository repository)
        {
            _repository = repository;
        }

        [HttpGet]
        public async Task<ActionResult<IEnumerable<StrategicPlanning>>> GetAll()
        {
            Response.Headers.Append("X-Source", "NET-Core-StrategicPlanning-V2");
            var items = await _repository.GetAllAsync();
            return Ok(items);
        }

        [HttpPost]
        public async Task<ActionResult<StrategicPlanning>> Create(StrategicPlanning item)
        {
            var id = await _repository.AddAsync(item);
            item.Id = id;
            return Ok(item);
        }

        [HttpPut("{id}")]
        public async Task<ActionResult<StrategicPlanning>> Update(string id, StrategicPlanning item)
        {
            if (id != item.Id) return BadRequest();
            await _repository.UpdateAsync(item);
            return Ok(item);
        }

        [HttpDelete("{id}")]
        public async Task<ActionResult> Delete(string id)
        {
            await _repository.DeleteAsync(id);
            return NoContent();
        }
    }
}
