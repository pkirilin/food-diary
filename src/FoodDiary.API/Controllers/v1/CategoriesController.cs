using System;
using System.Collections.Generic;
using System.Net;
using System.Threading;
using System.Threading.Tasks;
using AutoMapper;
using FoodDiary.API.Dtos;
using FoodDiary.Domain.Entities;
using Microsoft.AspNetCore.Mvc;
using FoodDiary.API.Requests;
using MediatR;
using FoodDiary.Application.Categories.Requests;
using System.Linq;
using FoodDiary.API.Auth;
using FoodDiary.Application.Services.Categories;
using Microsoft.AspNetCore.Authorization;

namespace FoodDiary.API.Controllers.v1
{
    [ApiController]
    [Route("api/v1/categories")]
    [Authorize(Constants.Policies.GoogleJwt)]
    [ApiExplorerSettings(GroupName = "v1")]
    public class CategoriesController : ControllerBase
    {
        private readonly IMapper _mapper;
        private readonly IMediator _mediator;
        private readonly ICategoriesService _categoriesService;

        public CategoriesController(IMapper mapper, IMediator mediator, ICategoriesService categoriesService)
        {
            _mapper = mapper ?? throw new ArgumentNullException(nameof(mapper));
            _mediator = mediator ?? throw new ArgumentNullException(nameof(mediator));
            _categoriesService = categoriesService;
        }

        /// <summary>
        /// Gets all available categories ordered by name
        /// </summary>
        [HttpGet]
        [ProducesResponseType(typeof(IEnumerable<CategoryItemDto>), (int)HttpStatusCode.OK)]
        public async Task<IActionResult> GetCategories(CancellationToken cancellationToken)
        {
            var categories = await _mediator.Send(new GetCategoriesRequest(loadProducts: true), cancellationToken);
            var categoriesListResponse = _mapper.Map<IEnumerable<CategoryItemDto>>(categories);
            return Ok(categoriesListResponse);
        }

        /// <summary>
        /// Creates new category if category with the same name doesn't exist
        /// </summary>
        /// <param name="categoryData">New category info</param>
        /// <param name="cancellationToken"></param>
        [HttpPost]
        [ProducesResponseType((int)HttpStatusCode.OK)]
        [ProducesResponseType((int)HttpStatusCode.BadRequest)]
        public async Task<IActionResult> CreateCategory([FromBody] CategoryCreateEditRequest categoryData, CancellationToken cancellationToken)
        {
            if (!ModelState.IsValid)
                return BadRequest(ModelState);

            var categoriesWithTheSameName = await _mediator.Send(new GetCategoriesByExactNameRequest(categoryData.Name), cancellationToken);

            if (categoriesWithTheSameName.Any())
            {
                ModelState.AddModelError(nameof(categoryData.Name), $"Category with the name '{categoryData.Name}' already exists");
                return BadRequest(ModelState);
            }

            var category = _mapper.Map<Category>(categoryData);
            var createdCategory = await _mediator.Send(new CreateCategoryRequest(category), cancellationToken);
            return Ok(createdCategory.Id);
        }

        /// <summary>
        /// Updates existing category if category with the same name doesn't exist
        /// </summary>
        /// <param name="id">Updated category id</param>
        /// <param name="updatedCategoryData">Updated category info</param>
        /// <param name="cancellationToken"></param>
        [HttpPut("{id}")]
        [ProducesResponseType((int)HttpStatusCode.OK)]
        [ProducesResponseType((int)HttpStatusCode.BadRequest)]
        [ProducesResponseType((int)HttpStatusCode.NotFound)]
        public async Task<IActionResult> EditCategory([FromRoute] int id, [FromBody] CategoryCreateEditRequest updatedCategoryData, CancellationToken cancellationToken)
        {
            if (!ModelState.IsValid)
                return BadRequest(ModelState);

            var originalCategory = await _mediator.Send(new GetCategoryByIdRequest(id), cancellationToken);

            if (originalCategory == null)
                return NotFound();

            var categoriesWithTheSameName = await _mediator.Send(new GetCategoriesByExactNameRequest(updatedCategoryData.Name), cancellationToken);
            var categoryHasChanges = originalCategory.Name != updatedCategoryData.Name;
            var categoryCanBeUpdated = !categoryHasChanges || (categoryHasChanges && !categoriesWithTheSameName.Any());

            if (!categoryCanBeUpdated)
            {
                ModelState.AddModelError(nameof(updatedCategoryData.Name), $"Category with the name '{updatedCategoryData.Name}' already exists");
                return BadRequest(ModelState);
            }

            originalCategory = _mapper.Map(updatedCategoryData, originalCategory);
            await _mediator.Send(new EditCategoryRequest(originalCategory), cancellationToken);
            return Ok();
        }

        /// <summary>
        /// Deletes category by id
        /// </summary>
        /// <param name="id">Category for delete id</param>
        /// <param name="cancellationToken"></param>
        [HttpDelete("{id}")]
        [ProducesResponseType((int)HttpStatusCode.OK)]
        [ProducesResponseType((int)HttpStatusCode.NotFound)]
        public async Task<IActionResult> DeleteCategory([FromRoute] int id, CancellationToken cancellationToken)
        {
            var categoryForDelete = await _mediator.Send(new GetCategoryByIdRequest(id), cancellationToken);
            if (categoryForDelete == null)
            {
                return NotFound();
            }

            await _mediator.Send(new DeleteCategoryRequest(categoryForDelete), cancellationToken);
            return Ok();
        }

        [HttpGet("autocomplete")]
        public async Task<IActionResult> GetCategoriesForAutocomplete(CancellationToken cancellationToken)
        {
            var categories = await _categoriesService.GetAutocompleteItemsAsync(cancellationToken);
            
            return Ok(categories);
        }
    }
}
