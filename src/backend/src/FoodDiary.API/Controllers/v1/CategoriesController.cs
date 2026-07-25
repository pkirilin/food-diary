using System.Collections.Generic;
using System.Linq;
using System.Net;
using System.Threading;
using System.Threading.Tasks;
using FoodDiary.API.Dtos;
using FoodDiary.API.Mapping;
using FoodDiary.API.Requests;
using FoodDiary.Application.Categories.Create;
using FoodDiary.Application.Categories.Delete;
using FoodDiary.Application.Categories.Get;
using FoodDiary.Application.Categories.Update;
using FoodDiary.Application.Services.Categories;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;

namespace FoodDiary.API.Controllers.v1;

[ApiController]
[Route("api/v1/categories")]
[Authorize(Constants.AuthorizationPolicies.GoogleAllowedEmails)]
[ApiExplorerSettings(GroupName = "v1")]
public class CategoriesController : ControllerBase
{
    /// <summary>
    /// Gets all available categories ordered by name
    /// </summary>
    [HttpGet]
    [ProducesResponseType(typeof(IEnumerable<CategoryItemDto>), (int)HttpStatusCode.OK)]
    public async Task<IActionResult> GetCategories(
        [FromServices] GetCategoriesQueryHandler handler,
        CancellationToken cancellationToken)
    {
        var result = await handler.Handle(new GetCategoriesQuery(), cancellationToken);
        var categoriesListResponse = result.Categories.Select(c => c.ToCategoryItemDto()).ToList();
        return Ok(categoriesListResponse);
    }

    /// <summary>
    /// Creates new category if category with the same name doesn't exist
    /// </summary>
    [HttpPost]
    [ProducesResponseType((int)HttpStatusCode.OK)]
    [ProducesResponseType((int)HttpStatusCode.BadRequest)]
    public async Task<IActionResult> CreateCategory(
        [FromBody] CategoryCreateEditRequest categoryData,
        [FromServices] CreateCategoryCommandHandler handler,
        CancellationToken cancellationToken)
    {
        if (!ModelState.IsValid)
            return BadRequest(ModelState);

        var result = await handler.Handle(new CreateCategoryCommand(categoryData.Name), cancellationToken);

        switch (result)
        {
            case CreateCategoryResult.NameAlreadyExists:
                ModelState.AddModelError(nameof(categoryData.Name), $"Category with the name '{categoryData.Name}' already exists");
                return BadRequest(ModelState);
            case CreateCategoryResult.Success success:
                return Ok(success.Category.Id);
            default:
                return Conflict();
        }
    }

    /// <summary>
    /// Updates existing category if category with the same name doesn't exist
    /// </summary>
    [HttpPut("{id}")]
    [ProducesResponseType((int)HttpStatusCode.OK)]
    [ProducesResponseType((int)HttpStatusCode.BadRequest)]
    [ProducesResponseType((int)HttpStatusCode.NotFound)]
    public async Task<IActionResult> EditCategory(
        [FromRoute] int id,
        [FromBody] CategoryCreateEditRequest updatedCategoryData,
        [FromServices] UpdateCategoryCommandHandler handler,
        CancellationToken cancellationToken)
    {
        if (!ModelState.IsValid)
            return BadRequest(ModelState);

        var result = await handler.Handle(new UpdateCategoryCommand(id, updatedCategoryData.Name), cancellationToken);

        switch (result)
        {
            case UpdateCategoryResult.NotFound:
                return NotFound();
            case UpdateCategoryResult.NameAlreadyExists:
                ModelState.AddModelError(nameof(updatedCategoryData.Name), $"Category with the name '{updatedCategoryData.Name}' already exists");
                return BadRequest(ModelState);
            case UpdateCategoryResult.Success:
                return Ok();
            default:
                return Conflict();
        }
    }

    /// <summary>
    /// Deletes category by id
    /// </summary>
    [HttpDelete("{id}")]
    [ProducesResponseType((int)HttpStatusCode.OK)]
    [ProducesResponseType((int)HttpStatusCode.NotFound)]
    public async Task<IActionResult> DeleteCategory(
        [FromRoute] int id,
        [FromServices] DeleteCategoryCommandHandler handler,
        CancellationToken cancellationToken)
    {
        var result = await handler.Handle(new DeleteCategoryCommand(id), cancellationToken);

        return result switch
        {
            DeleteCategoryResult.NotFound => NotFound(),
            DeleteCategoryResult.Success => Ok(),
            _ => Conflict()
        };
    }

    [HttpGet("autocomplete")]
    public async Task<IActionResult> GetCategoriesForAutocomplete(
        [FromServices] ICategoriesService categoriesService,
        CancellationToken cancellationToken)
    {
        var categories = await categoriesService.GetAutocompleteItemsAsync(cancellationToken);
        return Ok(categories);
    }
}
