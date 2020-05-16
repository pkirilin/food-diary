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
    [Route("v1/products")]
    [ApiExplorerSettings(GroupName = "v1")]
    public class ProductsController : ControllerBase
    {
        private readonly IMapper _mapper;
        private readonly IProductService _productService;
        private readonly ICategoryService _categoryService;

        public ProductsController(
            IMapper mapper,
            IProductService productService,
            ICategoryService categoryService)
        {
            _mapper = mapper ?? throw new ArgumentNullException(nameof(mapper));
            _productService = productService ?? throw new ArgumentNullException(nameof(productService));
            _categoryService = categoryService ?? throw new ArgumentNullException(nameof(categoryService));
        }

        [HttpGet]
        [ProducesResponseType(typeof(ProductsSearchResultDto), (int)HttpStatusCode.OK)]
        [ProducesResponseType(typeof(ModelStateDictionary), (int)HttpStatusCode.BadRequest)]
        public async Task<IActionResult> GetProducts([FromQuery] ProductsSearchRequest searchRequest, CancellationToken cancellationToken)
        {
            if (!ModelState.IsValid)
            {
                return BadRequest(ModelState);
            }

            if (searchRequest.CategoryId.HasValue)
            {
                var requestedCategory = await _categoryService.GetCategoryByIdAsync(searchRequest.CategoryId.Value, cancellationToken);
                if (requestedCategory == null)
                {
                    return NotFound();
                }
            }

            var productSearchMeta = await _productService.SearchProductsAsync(searchRequest, cancellationToken);
            var productItemsResult = _mapper.Map<IEnumerable<ProductItemDto>>(productSearchMeta.FoundProducts);

            var productsSearchResult = new ProductsSearchResultDto()
            {
                TotalProductsCount = productSearchMeta.TotalProductsCount,
                ProductItems = productItemsResult
            };

            return Ok(productsSearchResult);
        }

        [HttpPost]
        [ProducesResponseType((int)HttpStatusCode.OK)]
        [ProducesResponseType(typeof(ModelStateDictionary), (int)HttpStatusCode.BadRequest)]
        public async Task<IActionResult> CreateProduct([FromBody] ProductCreateEditRequest request, CancellationToken cancellationToken)
        {
            if (!ModelState.IsValid)
            {
                return BadRequest(ModelState);
            }

            if (await _productService.IsProductExistsAsync(request.Name, cancellationToken))
            {
                ModelState.AddModelError(nameof(request.Name), $"Product with the name '{request.Name}' already exists");
                return BadRequest(ModelState);
            }

            var product = _mapper.Map<Product>(request);
            await _productService.CreateProductAsync(product, cancellationToken);
            return Ok();
        }

        [HttpPut("{id}")]
        [ProducesResponseType((int)HttpStatusCode.OK)]
        [ProducesResponseType(typeof(ModelStateDictionary), (int)HttpStatusCode.BadRequest)]
        [ProducesResponseType((int)HttpStatusCode.NotFound)]
        public async Task<IActionResult> EditProduct([FromRoute] int id, [FromBody] ProductCreateEditRequest request, CancellationToken cancellationToken)
        {
            if (!ModelState.IsValid)
            {
                return BadRequest(ModelState);
            }

            var originalProduct = await _productService.GetProductByIdAsync(id, cancellationToken);
            if (originalProduct == null)
            {
                return NotFound();
            }

            var isProductExists = await _productService.IsProductExistsAsync(request.Name, cancellationToken);
            if (!_productService.IsEditedProductValid(request, originalProduct, isProductExists))
            {
                ModelState.AddModelError(nameof(request.Name), $"Product with the name '{request.Name}' already exists");
                return BadRequest(ModelState);
            }

            originalProduct = _mapper.Map(request, originalProduct);
            await _productService.EditProductAsync(originalProduct, cancellationToken);
            return Ok();
        }

        [HttpDelete("{id}")]
        [ProducesResponseType((int)HttpStatusCode.OK)]
        [ProducesResponseType((int)HttpStatusCode.NotFound)]
        public async Task<IActionResult> DeleteProduct([FromRoute] int id, CancellationToken cancellationToken)
        {
            var productForDelete = await _productService.GetProductByIdAsync(id, cancellationToken);
            if (productForDelete == null)
            {
                return NotFound();
            }

            await _productService.DeleteProductAsync(productForDelete, cancellationToken);
            return Ok();
        }

        [HttpDelete("batch")]
        [ProducesResponseType((int)HttpStatusCode.OK)]
        [ProducesResponseType(typeof(ModelStateDictionary), (int)HttpStatusCode.BadRequest)]
        public async Task<IActionResult> DeleteProducts([FromBody] IEnumerable<int> ids, CancellationToken cancellationToken)
        {
            var productsForDelete = await _productService.GetProductsByIdsAsync(ids, cancellationToken);

            if (!_productService.AreAllProductsFetched(productsForDelete, ids))
            {
                ModelState.AddModelError(nameof(ids), "Products cannot be deleted: wrong ids specified");
                return BadRequest(ModelState);
            }

            await _productService.DeleteProductsRangeAsync(productsForDelete, cancellationToken);
            return Ok();
        }

        [HttpGet("dropdown")]
        [ProducesResponseType(typeof(IEnumerable<ProductDropdownItemDto>), (int)HttpStatusCode.OK)]
        public async Task<IActionResult> GetProductsDropdownList([FromQuery] ProductDropdownSearchRequest request, CancellationToken cancellationToken)
        {
            var products = await _productService.GetProductsDropdownListAsync(request, cancellationToken);
            var productsDropdownListResponse = _mapper.Map<IEnumerable<ProductDropdownItemDto>>(products);
            return Ok(productsDropdownListResponse);
        }
    }
}
