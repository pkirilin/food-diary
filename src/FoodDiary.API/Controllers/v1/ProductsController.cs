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

        /// <summary>
        /// Gets products list by specified parameters
        /// </summary>
        /// <param name="productsRequest">Products search parameters</param>
        /// <param name="cancellationToken"></param>
        [HttpGet]
        [ProducesResponseType(typeof(ProductsSearchResultDto), (int)HttpStatusCode.OK)]
        [ProducesResponseType((int)HttpStatusCode.BadRequest)]
        public async Task<IActionResult> GetProducts([FromQuery] ProductsSearchRequest productsRequest, CancellationToken cancellationToken)
        {
            if (!ModelState.IsValid)
            {
                return BadRequest(ModelState);
            }

            if (productsRequest.CategoryId.HasValue)
            {
                var requestedCategory = await _categoryService.GetCategoryByIdAsync(productsRequest.CategoryId.Value, cancellationToken);
                if (requestedCategory == null)
                {
                    return NotFound();
                }
            }

            var productSearchMeta = await _productService.SearchProductsAsync(productsRequest, cancellationToken);
            var productItemsResult = _mapper.Map<IEnumerable<ProductItemDto>>(productSearchMeta.FoundProducts);

            var productsSearchResult = new ProductsSearchResultDto()
            {
                TotalProductsCount = productSearchMeta.TotalProductsCount,
                ProductItems = productItemsResult
            };

            return Ok(productsSearchResult);
        }

        /// <summary>
        /// Creates new product if product with the same name doesn't exist
        /// </summary>
        /// <param name="productData">New product info</param>
        /// <param name="cancellationToken"></param>
        [HttpPost]
        [ProducesResponseType((int)HttpStatusCode.OK)]
        [ProducesResponseType((int)HttpStatusCode.BadRequest)]
        public async Task<IActionResult> CreateProduct([FromBody] ProductCreateEditRequest productData, CancellationToken cancellationToken)
        {
            if (!ModelState.IsValid)
            {
                return BadRequest(ModelState);
            }

            if (await _productService.IsProductExistsAsync(productData.Name, cancellationToken))
            {
                ModelState.AddModelError(nameof(productData.Name), $"Product with the name '{productData.Name}' already exists");
                return BadRequest(ModelState);
            }

            var product = _mapper.Map<Product>(productData);
            await _productService.CreateProductAsync(product, cancellationToken);
            return Ok();
        }

        /// <summary>
        /// Updates existing product by specified id
        /// </summary>
        /// <param name="id">Product for update id</param>
        /// <param name="updatedProductData">Updated product info</param>
        /// <param name="cancellationToken"></param>
        [HttpPut("{id}")]
        [ProducesResponseType((int)HttpStatusCode.OK)]
        [ProducesResponseType((int)HttpStatusCode.BadRequest)]
        [ProducesResponseType((int)HttpStatusCode.NotFound)]
        public async Task<IActionResult> EditProduct([FromRoute] int id, [FromBody] ProductCreateEditRequest updatedProductData, CancellationToken cancellationToken)
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

            var isProductExists = await _productService.IsProductExistsAsync(updatedProductData.Name, cancellationToken);
            if (!_productService.IsEditedProductValid(updatedProductData, originalProduct, isProductExists))
            {
                ModelState.AddModelError(nameof(updatedProductData.Name), $"Product with the name '{updatedProductData.Name}' already exists");
                return BadRequest(ModelState);
            }

            originalProduct = _mapper.Map(updatedProductData, originalProduct);
            await _productService.EditProductAsync(originalProduct, cancellationToken);
            return Ok();
        }

        /// <summary>
        /// Deletes product by specified id
        /// </summary>
        /// <param name="id">Product for delete id</param>
        /// <param name="cancellationToken"></param>
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

        /// <summary>
        /// Deletes products by specified ids
        /// </summary>
        /// <param name="ids">Products for delete ids</param>
        /// <param name="cancellationToken"></param>
        [HttpDelete("batch")]
        [ProducesResponseType((int)HttpStatusCode.OK)]
        [ProducesResponseType((int)HttpStatusCode.BadRequest)]
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

        /// <summary>
        /// Gets all available products for dropdown list
        /// </summary>
        /// <param name="productsDropdownRequest">Search parameters for products dropdown</param>
        /// <param name="cancellationToken"></param>
        [HttpGet("dropdown")]
        [ProducesResponseType(typeof(IEnumerable<ProductDropdownItemDto>), (int)HttpStatusCode.OK)]
        public async Task<IActionResult> GetProductsDropdown([FromQuery] ProductDropdownSearchRequest productsDropdownRequest, CancellationToken cancellationToken)
        {
            var products = await _productService.GetProductsDropdownAsync(productsDropdownRequest, cancellationToken);
            var productsDropdownListResponse = _mapper.Map<IEnumerable<ProductDropdownItemDto>>(products);
            return Ok(productsDropdownListResponse);
        }
    }
}
