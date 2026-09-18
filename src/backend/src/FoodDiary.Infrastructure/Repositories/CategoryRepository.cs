using FoodDiary.Domain.Entities;
using FoodDiary.Domain.Repositories;
using Microsoft.EntityFrameworkCore;

namespace FoodDiary.Infrastructure.Repositories;

public class CategoryRepository(FoodDiaryContext context) : Repository<Category>(context), ICategoryRepository
{
    public IQueryable<Category> LoadProducts(IQueryable<Category> query)
    {
        return query.Include(c => c.Products);
    }

    public Task<Dictionary<string, Category>> GetDictionaryByQueryAsync(IQueryable<Category> query, CancellationToken cancellationToken)
    {
        return query.ToDictionaryAsync(c => c.Name, cancellationToken);
    }
}