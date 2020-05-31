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

        /// <summary>
        /// Gets all available categories ordered by name
        /// </summary>
        [HttpGet]
        [ProducesResponseType(typeof(IEnumerable<CategoryItemDto>), (int)HttpStatusCode.OK)]
        public async Task<IActionResult> GetCategories(CancellationToken cancellationToken)
        {
            var categories = await _categoryService.GetCategoriesAsync(cancellationToken);
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
        [ProducesResponseType(typeof(ModelStateDictionary), (int)HttpStatusCode.BadRequest)]
        public async Task<IActionResult> CreateCategory([FromBody] CategoryCreateEditRequest categoryData, CancellationToken cancellationToken)
        {
            if (!ModelState.IsValid)
            {
                return BadRequest(ModelState);
            }

            if (await _categoryService.IsCategoryExistsAsync(categoryData.Name, cancellationToken))
            {
                ModelState.AddModelError(nameof(categoryData.Name), $"Category with the name '{categoryData.Name}' already exists");
                return BadRequest(ModelState);
            }

            var category = _mapper.Map<Category>(categoryData);
            var createdCategory = await _categoryService.CreateCategoryAsync(category, cancellationToken);
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
        [ProducesResponseType(typeof(ModelStateDictionary), (int)HttpStatusCode.BadRequest)]
        [ProducesResponseType((int)HttpStatusCode.NotFound)]
        public async Task<IActionResult> EditCategory([FromRoute] int id, [FromBody] CategoryCreateEditRequest updatedCategoryData, CancellationToken cancellationToken)
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

            var isCategoryExists = await _categoryService.IsCategoryExistsAsync(updatedCategoryData.Name, cancellationToken);
            if (!_categoryService.IsEditedCategoryValid(updatedCategoryData, originalCategory, isCategoryExists))
            {
                ModelState.AddModelError(nameof(updatedCategoryData.Name), $"Category with the name '{updatedCategoryData.Name}' already exists");
                return BadRequest(ModelState);
            }

            originalCategory = _mapper.Map(updatedCategoryData, originalCategory);
            await _categoryService.EditCategoryAsync(originalCategory, cancellationToken);
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
            var categoryForDelete = await _categoryService.GetCategoryByIdAsync(id, cancellationToken);
            if (categoryForDelete == null)
            {
                return NotFound();
            }

            await _categoryService.DeleteCategoryAsync(categoryForDelete, cancellationToken);
            return Ok();
        }

        /// <summary>
        /// Gets all available categories for dropdown list
        /// </summary>
        /// <param name="categoriesDropdownRequest">Search parameters for categories dropdown</param>
        /// <param name="cancellationToken"></param>
        [HttpGet("dropdown")]
        [ProducesResponseType(typeof(IEnumerable<CategoryDropdownItemDto>), (int)HttpStatusCode.OK)]
        public async Task<IActionResult> GetCategoriesDropdown([FromQuery] CategoryDropdownSearchRequest categoriesDropdownRequest, CancellationToken cancellationToken)
        {
            var categories = await _categoryService.GetCategoriesDropdownAsync(categoriesDropdownRequest, cancellationToken);
            var categoriesDropdownListResponse = _mapper.Map<IEnumerable<Category>>(categories);
            return Ok(categoriesDropdownListResponse);
        }
    }
}
