using System.Collections.Generic;
using System.Linq;
using System.Net;
using System.Threading;
using System.Threading.Tasks;
using FoodDiary.API.Dtos;
using FoodDiary.API.Features.Products;
using FoodDiary.API.Features.Products.Extensions;
using FoodDiary.API.Mapping;
using FoodDiary.API.Requests;
using FoodDiary.Application.Products.Create;
using FoodDiary.Application.Products.Delete;
using FoodDiary.Application.Products.Get;
using FoodDiary.Application.Products.SuggestNutrition;
using FoodDiary.Application.Products.Update;
using FoodDiary.Contracts.Products;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Mvc;

namespace FoodDiary.API.Controllers.v1;

[ApiController]
[Route("api/v1/products")]
[Authorize(Constants.AuthorizationPolicies.GoogleAllowedEmails)]
[ApiExplorerSettings(GroupName = "v1")]
public class ProductsController : ControllerBase
{
    /// <summary>
    /// Gets products list by specified parameters
    /// </summary>
    [HttpGet]
    [ProducesResponseType(typeof(ProductsSearchResultDto), (int)HttpStatusCode.OK)]
    [ProducesResponseType((int)HttpStatusCode.BadRequest)]
    public async Task<IActionResult> GetProducts(
        [FromQuery] ProductsSearchRequest productsRequest,
        [FromServices] GetProductsQueryHandler handler,
        CancellationToken cancellationToken)
    {
        if (!ModelState.IsValid)
            return BadRequest(ModelState);

        var query = new GetProductsQuery(
            productsRequest.PageNumber,
            productsRequest.PageSize,
            productsRequest.ProductSearchName,
            productsRequest.CategoryId);

        var result = await handler.Handle(query, cancellationToken);

        var searchResultDto = new ProductsSearchResultDto
        {
            TotalProductsCount = result.TotalProductsCount,
            ProductItems = result.Products.Select(p => p.ToProductItemDto()).ToList()
        };

        return Ok(searchResultDto);
    }

    [HttpGet("{id:int}")]
    public async Task<IActionResult> GetProductById(
        [FromRoute] int id,
        [FromServices] GetProductByIdHandler handler,
        CancellationToken cancellationToken)
    {
        var result = await handler.Handle(id, cancellationToken);

        return result switch
        {
            GetProductByIdHandlerResult.Success success => Ok(success.Product),
            GetProductByIdHandlerResult.NotFound => NotFound(),
            _ => StatusCode(StatusCodes.Status501NotImplemented)
        };
    }

    [HttpPost]
    [ProducesResponseType((int)HttpStatusCode.OK)]
    [ProducesResponseType((int)HttpStatusCode.BadRequest)]
    public async Task<IActionResult> CreateProduct(
        [FromBody] ProductCreateEditRequest productData,
        [FromServices] CreateProductCommandHandler handler,
        CancellationToken cancellationToken)
    {
        var command = new CreateProductCommand(
            productData.Name,
            productData.CaloriesCost,
            productData.DefaultQuantity,
            productData.CategoryId,
            productData.Protein,
            productData.Fats,
            productData.Carbs,
            productData.Sugar,
            productData.Salt);

        var result = await handler.Handle(command, cancellationToken);

        switch (result)
        {
            case CreateProductResult.ProductAlreadyExists:
                return ProductAlreadyExists(productData);
            case CreateProductResult.Success success:
                return Ok(success.Product.ToCreateProductResponse());
            default:
                return Conflict();
        }
    }

    /// <summary>
    /// Updates existing product by specified id
    /// </summary>
    [HttpPut("{id}")]
    [ProducesResponseType((int)HttpStatusCode.OK)]
    [ProducesResponseType((int)HttpStatusCode.BadRequest)]
    [ProducesResponseType((int)HttpStatusCode.NotFound)]
    public async Task<IActionResult> EditProduct(
        [FromRoute] int id,
        [FromBody] ProductCreateEditRequest updatedProductData,
        [FromServices] UpdateProductCommandHandler handler,
        CancellationToken cancellationToken)
    {
        if (!ModelState.IsValid)
            return BadRequest(ModelState);

        var command = new UpdateProductCommand(
            id,
            updatedProductData.Name,
            updatedProductData.CaloriesCost,
            updatedProductData.DefaultQuantity,
            updatedProductData.CategoryId,
            updatedProductData.Protein,
            updatedProductData.Fats,
            updatedProductData.Carbs,
            updatedProductData.Sugar,
            updatedProductData.Salt);

        var result = await handler.Handle(command, cancellationToken);

        switch (result)
        {
            case UpdateProductResult.NotFound:
                return NotFound();
            case UpdateProductResult.NameAlreadyExists:
                ModelState.AddModelError(nameof(updatedProductData.Name), $"Product with the name '{updatedProductData.Name}' already exists");
                return BadRequest(ModelState);
            case UpdateProductResult.Success:
                return Ok();
            default:
                return Conflict();
        }
    }

    /// <summary>
    /// Deletes product by specified id
    /// </summary>
    [HttpDelete("{id}")]
    [ProducesResponseType((int)HttpStatusCode.OK)]
    [ProducesResponseType((int)HttpStatusCode.NotFound)]
    public async Task<IActionResult> DeleteProduct(
        [FromRoute] int id,
        [FromServices] DeleteProductCommandHandler handler,
        CancellationToken cancellationToken)
    {
        var result = await handler.Handle(new DeleteProductCommand(id), cancellationToken);

        return result switch
        {
            DeleteProductResult.NotFound => NotFound(),
            DeleteProductResult.Success => Ok(),
            _ => Conflict()
        };
    }

    /// <summary>
    /// Deletes products by specified ids
    /// </summary>
    [HttpDelete("batch")]
    [ProducesResponseType((int)HttpStatusCode.OK)]
    [ProducesResponseType((int)HttpStatusCode.BadRequest)]
    public async Task<IActionResult> DeleteProducts(
        [FromBody] IEnumerable<int> ids,
        [FromServices] DeleteProductsCommandHandler handler,
        CancellationToken cancellationToken)
    {
        await handler.Handle(new DeleteProductsCommand(ids.ToList()), cancellationToken);
        return Ok();
    }

    [HttpGet("autocomplete")]
    public async Task<IActionResult> GetProductsForAutocomplete(
        [FromServices] SearchProductsHandler handler,
        CancellationToken cancellationToken)
    {
        var result = await handler.Handle(cancellationToken);
        return Ok(result.ToResponse());
    }

    [HttpPost("nutrition/suggestions")]
    [ProducesResponseType((int)HttpStatusCode.OK)]
    [ProducesResponseType((int)HttpStatusCode.BadRequest)]
    public async Task<IActionResult> SuggestNutrition(
        [FromBody] SuggestProductNutritionRequest request,
        [FromServices] SuggestNutritionCommandHandler handler,
        CancellationToken cancellationToken)
    {
        var result = await handler.Handle(new SuggestNutritionCommand(request.Name), cancellationToken);

        return result switch
        {
            SuggestNutritionResult.Success s => Ok(s.Response),
            SuggestNutritionResult.Failure f => f.Error.ToActionResult(),
            _ => StatusCode(StatusCodes.Status500InternalServerError)
        };
    }

    private IActionResult ProductAlreadyExists(ProductCreateEditRequest product)
    {
        ModelState.AddModelError(nameof(product.Name), $"Product with the name '{product.Name}' already exists");
        return BadRequest(ModelState);
    }
}
