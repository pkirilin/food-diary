using FoodDiary.Application.Models;
using MediatR;

namespace FoodDiary.Application.Products.Requests;

public class GetProductsRequest : IRequest<ProductsSearchResult>
{
    public int PageNumber { get; set; } = 1;

    public int PageSize { get; set; } = 10;

    public string ProductName { get; set; }

    public int? CategoryId { get; set; }

    public bool LoadCategory { get; set; } = false;

    public bool CalculateTotalProductsCount { get; set; } = false;

    public GetProductsRequest()
    {
    }
}