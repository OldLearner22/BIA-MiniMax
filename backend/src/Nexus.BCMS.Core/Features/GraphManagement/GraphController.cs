using Microsoft.AspNetCore.Mvc;
using Nexus.BCMS.Domain;

namespace Nexus.BCMS.Core.Features.GraphManagement
{
    [ApiController]
    [Route("api/graph")]
    public class GraphController : ControllerBase
    {
        private readonly GraphRepository _repository;

        public GraphController(GraphRepository repository)
        {
            _repository = repository;
        }

        [HttpGet("resource-map/{processId}")]
        public async Task<ActionResult<ResourceMapGraph>> GetResourceMap(string processId)
        {
            Response.Headers.Append("X-Source", "NET-Core-Graph-V2");
            var graph = await _repository.GetResourceMapAsync(processId);
            return Ok(graph);
        }
    }
}
