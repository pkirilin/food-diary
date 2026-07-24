using System.Collections.Generic;
using System.Linq;
using System.Threading;
using System.Threading.Tasks;
using FoodDiary.Domain.Entities;
using FoodDiary.Domain.Repositories;

namespace FoodDiary.Application.Products.Get;

public record GetProductsQuery(int PageNumber, int PageSize, string? ProductName, int? CategoryId);

public record GetProductsQueryResult(IReadOnlyCollection<Product> Products, int TotalProductsCount);

public class GetProductsQueryHandler(IProductRepository productRepository)
{
    public async Task<GetProductsQueryResult> Handle(GetProductsQuery query, CancellationToken cancellationToken)
    {
        var dbQuery = productRepository.GetQueryWithoutTracking();

        if (!string.IsNullOrWhiteSpace(query.ProductName))
            dbQuery = dbQuery.Where(p => p.Name.ToLower().Contains(query.ProductName.ToLower()));
        if (query.CategoryId.HasValue)
            dbQuery = dbQuery.Where(p => p.CategoryId == query.CategoryId);

        var totalProductsCount = await productRepository.CountByQueryAsync(dbQuery, cancellationToken);

        dbQuery = productRepository.LoadCategory(dbQuery);
        dbQuery = dbQuery.OrderBy(p => p.Name)
            .Skip((query.PageNumber - 1) * query.PageSize)
            .Take(query.PageSize);

        var products = await productRepository.GetByQueryAsync(dbQuery, cancellationToken);

        return new GetProductsQueryResult(products, totalProductsCount);
    }
}
