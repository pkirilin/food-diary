using System;
using System.Collections.Generic;
using System.Net;
using System.Threading;
using System.Threading.Tasks;
using AutoMapper;
using FoodDiary.API.Services;
using FoodDiary.API.Dtos;
using FoodDiary.Domain.Entities;
using Microsoft.AspNetCore.Mvc;
using Microsoft.AspNetCore.Mvc.ModelBinding;
using FoodDiary.API.Requests;

namespace FoodDiary.API.Controllers.v1
{
    [ApiController]
    [Route("v1/categories")]
    [ApiExplorerSettings(GroupName = "v1")]
    public class CategoriesController : ControllerBase
    {
        private readonly IMapper _mapper;
        private readonly ICategoryService _categoryService;

        public CategoriesController(IMapper mapper, ICategoryService categoryService)
        {
            _mapper = mapper ?? throw new ArgumentNullException(nameof(mapper));
            _categoryService = categoryService ?? throw new ArgumentNullException(nameof(categoryService));
        }

        [HttpGet]
        [ProducesResponseType(typeof(IEnumerable<CategoryItemDto>), (int)HttpStatusCode.OK)]
        public async Task<IActionResult> GetCategories(CancellationToken cancellationToken)
        {
            var categories = await _categoryService.GetCategoriesAsync(cancellationToken);
            var categoriesListResponse = _mapper.Map<IEnumerable<CategoryItemDto>>(categories);
            return Ok(categoriesListResponse);
        }

        [HttpPost]
        [ProducesResponseType((int)HttpStatusCode.OK)]
        [ProducesResponseType(typeof(ModelStateDictionary), (int)HttpStatusCode.BadRequest)]
        public async Task<IActionResult> CreateCategory([FromBody] CategoryCreateEditRequest newCateroryInfo, CancellationToken cancellationToken)
        {
            if (!ModelState.IsValid)
            {
                return BadRequest(ModelState);
            }

            var category = _mapper.Map<Category>(newCateroryInfo);

            if (await _categoryService.IsCategoryExistsAsync(newCateroryInfo.Name, cancellationToken))
            {
                ModelState.AddModelError(nameof(newCateroryInfo.Name), $"Category with the name '{newCateroryInfo.Name}' already exists");
                return BadRequest(ModelState);
            }

            var createdCategory = await _categoryService.CreateCategoryAsync(category, cancellationToken);
            return Ok(createdCategory.Id);
        }

        [HttpPut("{id}")]
        [ProducesResponseType((int)HttpStatusCode.OK)]
        [ProducesResponseType(typeof(ModelStateDictionary), (int)HttpStatusCode.BadRequest)]
        [ProducesResponseType((int)HttpStatusCode.NotFound)]
        public async Task<IActionResult> EditCategory([FromRoute] int id, [FromBody] CategoryCreateEditRequest updatedCategoryInfo, CancellationToken cancellationToken)
        {
            if (!ModelState.IsValid)
            {
                return BadRequest(ModelState);
            }

            var originalCategory = await _categoryService.GetCategoryByIdAsync(id, cancellationToken);
            if (originalCategory == null)
            {
                return NotFound();
            }

            var isCategoryExists = await _categoryService.IsCategoryExistsAsync(updatedCategoryInfo.Name, cancellationToken);
            if (!_categoryService.IsEditedCategoryValid(updatedCategoryInfo, originalCategory, isCategoryExists))
            {
                ModelState.AddModelError(nameof(updatedCategoryInfo.Name), $"Category with the name '{updatedCategoryInfo.Name}' already exists");
                return BadRequest(ModelState);
            }

            originalCategory = _mapper.Map(updatedCategoryInfo, originalCategory);
            await _categoryService.EditCategoryAsync(originalCategory, cancellationToken);
            return Ok();
        }

        [HttpDelete("{id}")]
        [ProducesResponseType((int)HttpStatusCode.OK)]
        [ProducesResponseType((int)HttpStatusCode.NotFound)]
        public async Task<IActionResult> DeleteCategory([FromRoute] int id, CancellationToken cancellationToken)
        {
            var categoryForDelete = await _categoryService.GetCategoryByIdAsync(id, cancellationToken);
            if (categoryForDelete == null)
            {
                return NotFound();
            }

            await _categoryService.DeleteCategoryAsync(categoryForDelete, cancellationToken);
            return Ok();
        }

        [HttpGet("dropdown")]
        [ProducesResponseType(typeof(IEnumerable<CategoryDropdownItemDto>), (int)HttpStatusCode.OK)]
        public async Task<IActionResult> GetCategoriesDropdown([FromQuery] CategoryDropdownSearchRequest request, CancellationToken cancellationToken)
        {
            var categories = await _categoryService.GetCategoriesDropdownAsync(request, cancellationToken);
            var categoriesDropdownListResponse = _mapper.Map<IEnumerable<Category>>(categories);
            return Ok(categoriesDropdownListResponse);
        }
    }
}
