using FoodDiary.Domain.Entities;
using FoodDiary.Domain.Repositories;
using Microsoft.EntityFrameworkCore;

namespace FoodDiary.Infrastructure.Repositories;

public class ProductRepository(FoodDiaryContext context) : Repository<Product>(context), IProductRepository
{
    public IQueryable<Product> LoadCategory(IQueryable<Product> query)
    {
        return query.Include(p => p.Category);
    }

    public Task<Dictionary<string, Product>> GetDictionaryByQueryAsync(IQueryable<Product> query, CancellationToken cancellationToken)
    {
        return query.ToDictionaryAsync(p => p.Name);
    }
}