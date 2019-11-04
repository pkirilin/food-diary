using System.Collections.Generic;
using System.Net;
using System.Threading;
using System.Threading.Tasks;
using FoodDiary.Domain.Dtos;
using Microsoft.AspNetCore.Mvc;
using Microsoft.Extensions.Logging;

namespace FoodDiary.API.Controllers.v1
{
    [ApiController]
    [Route("v1/pages")]
    public class PagesController : ControllerBase
    {
        private readonly ILogger<PagesController> _logger;

        public PagesController(ILogger<PagesController> logger)
        {
            _logger = logger;
        }

        [HttpGet]
        [ProducesResponseType(typeof(List<PageItemDto>), (int)HttpStatusCode.OK)]
        public async Task<IActionResult> GetPages([FromQuery] PageFilterDto request, CancellationToken cancellationToken)
        {
            return Ok();
        }

        [HttpGet("{id}")]
        [ProducesResponseType(typeof(PageContentDto), (int)HttpStatusCode.OK)]
        public async Task<IActionResult> GetPageContentById([FromRoute] int id, CancellationToken cancellationToken)
        {
            return Ok();
        }

        [HttpPost]
        [ProducesResponseType((int)HttpStatusCode.OK)]
        [ProducesResponseType((int)HttpStatusCode.BadRequest)]
        public async Task<IActionResult> CreatePage([FromBody] PageEditDto request, CancellationToken cancellationToken)
        {
            return Ok();
        }

        [HttpPut]
        [ProducesResponseType((int)HttpStatusCode.OK)]
        [ProducesResponseType((int)HttpStatusCode.BadRequest)]
        public async Task<IActionResult> EditPage([FromBody] PageEditDto request, CancellationToken cancellationToken)
        {
            return Ok();
        }

        [HttpDelete("{id}")]
        [ProducesResponseType((int)HttpStatusCode.OK)]
        public async Task<IActionResult> DeletePage([FromQuery] int id, CancellationToken cancellationToken)
        {
            return Ok();
        }

        [HttpDelete("batch")]
        [ProducesResponseType((int)HttpStatusCode.OK)]
        public async Task<IActionResult> DeletePages([FromBody] List<int> ids, CancellationToken cancellationToken)
        {
            return Ok();
        }
    }
}
