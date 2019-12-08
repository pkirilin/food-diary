using System;
using System.Collections.Generic;
using System.Net;
using System.Threading;
using System.Threading.Tasks;
using AutoMapper;
using FoodDiary.API.Helpers;
using FoodDiary.Domain.Dtos;
using FoodDiary.Domain.Entities;
using FoodDiary.Domain.Services;
using Microsoft.AspNetCore.Mvc;
using Microsoft.AspNetCore.Mvc.ModelBinding;
using Microsoft.Extensions.Logging;

namespace FoodDiary.API.Controllers.v1
{
    [ApiController]
    [Route("v1/products")]
    public class ProductsController : ControllerBase
    {
        private readonly ILogger<ProductsController> _logger;
        private readonly IMapper _mapper;
        private readonly IProductService _productService;

        public ProductsController(
            ILoggerFactory loggerFactory,
            IMapper mapper,
            IProductService productService)
        {
            _logger = loggerFactory?.CreateLogger<ProductsController>() ?? throw new ArgumentNullException(nameof(loggerFactory));
            _mapper = mapper ?? throw new ArgumentNullException(nameof(mapper));
            _productService = productService ?? throw new ArgumentNullException(nameof(productService));
        }

        [HttpGet]
        [ProducesResponseType(typeof(ProductsPagedListDto), (int)HttpStatusCode.OK)]
        [ProducesResponseType(typeof(ModelStateDictionary), (int)HttpStatusCode.BadRequest)]
        public async Task<IActionResult> SearchProducts([FromQuery] ProductsSearchRequestDto searchRequest, CancellationToken cancellationToken)
        {
            if (!ModelState.IsValid)
            {
                return BadRequest(ModelState);
            }

            var totalProductsCount = await _productService.CountAllProductsAsync(cancellationToken);
            var foundProducts = await _productService.SearchProductsAsync(searchRequest, cancellationToken);

            var productsResult = new ProductsPagedListDto()
            {
                SelectedPageIndex = searchRequest.PageIndex,
                TotalPagesCount = PaginationHelper.GetTotalPagesCount(totalProductsCount, searchRequest.PageSize),
                Products = _mapper.Map<IEnumerable<ProductItemDto>>(foundProducts)
            };
            return Ok(productsResult);
        }

        [HttpPost]
        [ProducesResponseType((int)HttpStatusCode.OK)]
        [ProducesResponseType(typeof(ModelStateDictionary), (int)HttpStatusCode.BadRequest)]
        [ProducesResponseType(typeof(string), (int)HttpStatusCode.BadRequest)]
        public async Task<IActionResult> CreateProduct([FromBody] ProductCreateEditDto productData, CancellationToken cancellationToken)
        {
            if (!ModelState.IsValid)
            {
                return BadRequest(ModelState);
            }

            var productValidationResult = await _productService.ValidateProductAsync(productData, cancellationToken);
            if (!productValidationResult.IsValid)
            {
                return BadRequest(productValidationResult.ErrorMessage);
            }

            var product = _mapper.Map<Product>(productData);
            await _productService.CreateProductAsync(product, cancellationToken);
            return Ok();
        }

        [HttpPut]
        [ProducesResponseType((int)HttpStatusCode.OK)]
        [ProducesResponseType(typeof(ModelStateDictionary), (int)HttpStatusCode.BadRequest)]
        [ProducesResponseType((int)HttpStatusCode.NotFound)]
        [ProducesResponseType(typeof(string), (int)HttpStatusCode.BadRequest)]
        public async Task<IActionResult> EditProduct([FromBody] ProductCreateEditDto productData, CancellationToken cancellationToken)
        {
            if (!ModelState.IsValid)
            {
                return BadRequest(ModelState);
            }

            var originalProduct = await _productService.GetProductByIdAsync(productData.Id, cancellationToken);
            if (originalProduct == null)
            {
                return NotFound();
            }

            var productValidationResult = await _productService.ValidateProductAsync(productData, cancellationToken);
            if (!_productService.IsEditedProductValid(productData, originalProduct, productValidationResult))
            {
                return BadRequest(productValidationResult.ErrorMessage);
            }

            originalProduct = _mapper.Map(productData, originalProduct);
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
        [ProducesResponseType(typeof(string), (int)HttpStatusCode.BadRequest)]
        public async Task<IActionResult> DeleteProducts([FromBody] IEnumerable<int> ids, CancellationToken cancellationToken)
        {
            var productsForDelete = await _productService.GetProductsByIdsAsync(ids, cancellationToken);
            var validationResult = _productService.AllProductsFetched(productsForDelete, ids);
            if (!validationResult.IsValid)
            {
                return BadRequest(validationResult.ErrorMessage);
            }

            await _productService.DeleteProductsRangeAsync(productsForDelete, cancellationToken);
            return Ok();
        }
    }
}
