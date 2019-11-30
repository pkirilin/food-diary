using System;
using System.Collections.Generic;
using System.Net;
using System.Threading;
using System.Threading.Tasks;
using AutoMapper;
using FoodDiary.Domain.Dtos;
using FoodDiary.Domain.Entities;
using FoodDiary.Domain.Services;
using Microsoft.AspNetCore.Mvc;
using Microsoft.AspNetCore.Mvc.ModelBinding;
using Microsoft.Extensions.Logging;

namespace FoodDiary.API.Controllers.v1
{
    [ApiController]
    [Route("v1/categories")]
    public class CategoriesController : ControllerBase
    {
        private readonly ILogger<CategoriesController> _logger;
        private readonly IMapper _mapper;
        private readonly ICategoryService _categoryService;

        public CategoriesController(
            ILoggerFactory loggerFactory,
            IMapper mapper,
            ICategoryService categoryService)
        {
            _logger = loggerFactory?.CreateLogger<CategoriesController>() ?? throw new ArgumentNullException(nameof(loggerFactory));
            _mapper = mapper ?? throw new ArgumentNullException(nameof(mapper));
            _categoryService = categoryService ?? throw new ArgumentNullException(nameof(categoryService));
        }

        [HttpGet]
        [ProducesResponseType(typeof(List<CategoryItemDto>), (int)HttpStatusCode.OK)]
        public async Task<IActionResult> GetCategories(CancellationToken cancellationToken)
        {
            var categories = await _categoryService.GetCategoriesAsync(cancellationToken);
            var categoriesListResponse = _mapper.Map<List<CategoryItemDto>>(categories);
            return Ok(categoriesListResponse);
        }

        [HttpPost]
        [ProducesResponseType((int)HttpStatusCode.OK)]
        [ProducesResponseType(typeof(ModelStateDictionary), (int)HttpStatusCode.BadRequest)]
        [ProducesResponseType(typeof(string), (int)HttpStatusCode.BadRequest)]
        public async Task<IActionResult> CreateCategory([FromBody] CategoryCreateEditDto newCateroryInfo, CancellationToken cancellationToken)
        {
            if (!ModelState.IsValid)
            {
                return BadRequest(ModelState);
            }

            var category = _mapper.Map<Category>(newCateroryInfo);

            if (!await _categoryService.CategoryCanBeCreatedAsync(newCateroryInfo, cancellationToken))
            {
                return BadRequest($"Category with the name '{newCateroryInfo.Name}' already exists");
            }

            await _categoryService.CreateCategoryAsync(category, cancellationToken);
            return Ok();
        }

        [HttpPut]
        [ProducesResponseType((int)HttpStatusCode.OK)]
        [ProducesResponseType(typeof(ModelStateDictionary), (int)HttpStatusCode.BadRequest)]
        [ProducesResponseType((int)HttpStatusCode.NotFound)]
        [ProducesResponseType(typeof(string), (int)HttpStatusCode.BadRequest)]
        public async Task<IActionResult> EditCategory([FromBody] CategoryCreateEditDto updatedCategoryInfo, CancellationToken cancellationToken)
        {
            if (!ModelState.IsValid)
            {
                return BadRequest(ModelState);
            }

            var originalCategory = await _categoryService.GetCategoryByIdAsync(updatedCategoryInfo.Id, cancellationToken);
            if (originalCategory == null)
            {
                return NotFound();
            }

            if (!await _categoryService.CategoryCanBeUpdatedAsync(updatedCategoryInfo, originalCategory, cancellationToken))
            {
                return BadRequest($"Category with the name '{updatedCategoryInfo.Name}' already exists");
            }

            originalCategory = _mapper.Map(updatedCategoryInfo, originalCategory);
            await _categoryService.EditCategoryAsync(originalCategory, cancellationToken);
            return Ok();
        }

        [HttpDelete("{id}")]
        [ProducesResponseType((int)HttpStatusCode.OK)]
        [ProducesResponseType((int)HttpStatusCode.NotFound)]
        public async Task<IActionResult> DeleteCategory(int id, CancellationToken cancellationToken)
        {
            var categoryForDelete = await _categoryService.GetCategoryByIdAsync(id, cancellationToken);
            if (categoryForDelete == null)
            {
                return NotFound();
            }

            await _categoryService.DeleteCategoryAsync(categoryForDelete, cancellationToken);
            return Ok();
        }
    }
}
