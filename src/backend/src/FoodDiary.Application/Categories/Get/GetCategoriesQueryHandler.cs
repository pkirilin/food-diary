using System.Collections.Generic;
using System.Linq;
using System.Threading;
using System.Threading.Tasks;
using FoodDiary.Domain.Entities;
using FoodDiary.Domain.Repositories;

namespace FoodDiary.Application.Categories.Get;

public record GetCategoriesQuery;

public record GetCategoriesQueryResult(IReadOnlyCollection<Category> Categories);

public class GetCategoriesQueryHandler(ICategoryRepository categoryRepository)
{
    public async Task<GetCategoriesQueryResult> Handle(GetCategoriesQuery query, CancellationToken cancellationToken)
    {
        var dbQuery = categoryRepository.GetQueryWithoutTracking();
        dbQuery = categoryRepository.LoadProducts(dbQuery);
        dbQuery = dbQuery.OrderBy(c => c.Name);

        var categories = await categoryRepository.GetByQueryAsync(dbQuery, cancellationToken);
        return new GetCategoriesQueryResult(categories);
    }
}
