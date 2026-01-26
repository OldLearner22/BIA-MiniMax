using Microsoft.AspNetCore.Mvc;
using Nexus.BCMS.Domain;

namespace Nexus.BCMS.Core.Features.SimulationManagement
{
    [ApiController]
    [Route("api/simulations")]
    public class SimulationsController : ControllerBase
    {
        private readonly SimulationRepository _repository;
        private readonly Infrastructure.AuditService _auditService;
        private readonly Infrastructure.ITenantService _tenantService;

        public SimulationsController(
            SimulationRepository repository, 
            Infrastructure.AuditService auditService,
            Infrastructure.ITenantService tenantService)
        {
            _repository = repository;
            _auditService = auditService;
            _tenantService = tenantService;
        }

        [HttpPost("what-if")]
        public async Task<ActionResult<SimulationResult>> RunWhatIf([FromBody] List<string> resourceIds)
        {
            var result = await _repository.RunWhatIfSimulationAsync(resourceIds);
            
            await _auditService.LogEventAsync("Simulation", "WhatIf", "CALCULATE", null, new { resources = resourceIds, impactedCount = result.TotalImpactedProcesses });
            
            return Ok(result);
        }

        [HttpPost("scenarios")]
        public async Task<ActionResult<SimulationScenario>> CreateScenario(SimulationScenario scenario)
        {
            scenario.OrganizationId = _tenantService.GetCurrentTenantId().ToString();
            var id = await _repository.CreateScenarioAsync(scenario);
            scenario.Id = id;

            await _auditService.LogEventAsync("SimulationScenario", id, "CREATE", null, scenario);

            return Ok(scenario);
        }
    }
}
