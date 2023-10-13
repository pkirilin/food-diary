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
using FoodDiary.Application.Products.Requests;
using System.Linq;
using FoodDiary.Application.Services.Products;
using Microsoft.AspNetCore.Authorization;

namespace FoodDiary.API.Controllers.v1
{
    [ApiController]
    [Route("api/v1/products")]
    [Authorize(Constants.AuthorizationPolicies.GoogleAllowedEmails)]
    [ApiExplorerSettings(GroupName = "v1")]
    public class ProductsController : ControllerBase
    {
        private readonly IMapper _mapper;
        private readonly IMediator _mediator;
        private readonly IProductsService _productsService;

        public ProductsController(IMapper mapper, IMediator mediator, IProductsService productsService)
        {
            _mapper = mapper ?? throw new ArgumentNullException(nameof(mapper));
            _mediator = mediator ?? throw new ArgumentNullException(nameof(mediator));
            _productsService = productsService;
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
                return BadRequest(ModelState);

            var getProductsRequest = new GetProductsRequest()
            {
                PageNumber = productsRequest.PageNumber,
                PageSize = productsRequest.PageSize,
                ProductName = productsRequest.ProductSearchName,
                CategoryId = productsRequest.CategoryId,
                LoadCategory = true,
                CalculateTotalProductsCount = true
            };

            var searchResult = await _mediator.Send(getProductsRequest, cancellationToken);
            var productItems = _mapper.Map<IEnumerable<ProductItemDto>>(searchResult.FoundProducts);
            var searchResultDto = new ProductsSearchResultDto()
            {
                TotalProductsCount = searchResult.TotalProductsCount.GetValueOrDefault(),
                ProductItems = productItems
            };

            return Ok(searchResultDto);
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
                return BadRequest(ModelState);

            var productsWithTheSameName = await _mediator.Send(new GetProductsByExactNameRequest(productData.Name), cancellationToken);
            
            if (productsWithTheSameName.Any())
            {
                ModelState.AddModelError(nameof(productData.Name), $"Product with the name '{productData.Name}' already exists");
                return BadRequest(ModelState);
            }

            var product = _mapper.Map<Product>(productData);
            await _mediator.Send(new CreateProductRequest(product), cancellationToken);
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
                return BadRequest(ModelState);

            var originalProduct = await _mediator.Send(new GetProductByIdRequest(id), cancellationToken);

            if (originalProduct == null)
                return NotFound();

            var productsWithTheSameName = await _mediator.Send(new GetProductsByExactNameRequest(updatedProductData.Name), cancellationToken);
            var productHasChanges = originalProduct.Name != updatedProductData.Name;
            var productCanBeUpdated = !productHasChanges || (productHasChanges && !productsWithTheSameName.Any());

            if (!productCanBeUpdated)
            {
                ModelState.AddModelError(nameof(updatedProductData.Name), $"Product with the name '{updatedProductData.Name}' already exists");
                return BadRequest(ModelState);
            }

            originalProduct = _mapper.Map(updatedProductData, originalProduct);
            await _mediator.Send(new EditProductRequest(originalProduct), cancellationToken);
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
            var productForDelete = await _mediator.Send(new GetProductByIdRequest(id), cancellationToken);

            if (productForDelete == null)
                return NotFound();

            await _mediator.Send(new DeleteProductRequest(productForDelete), cancellationToken);
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
            var productsForDelete = await _mediator.Send(new GetProductsByIdsRequest(ids), cancellationToken);
            await _mediator.Send(new DeleteProductsRequest(productsForDelete), cancellationToken);
            return Ok();
        }
        
        [HttpGet("autocomplete")]
        public async Task<IActionResult> GetProductsForAutocomplete(CancellationToken cancellationToken)
        {
            var products = await _productsService.GetAutocompleteItemsAsync(cancellationToken);
            return Ok(products);
        }
    }
}
