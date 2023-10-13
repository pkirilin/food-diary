using System.Linq;
using System.Threading;
using System.Threading.Tasks;
using FoodDiary.Domain.Entities;
using FoodDiary.Domain.Repositories.v2;
using Microsoft.EntityFrameworkCore;

namespace FoodDiary.Infrastructure.Repositories.v2;

internal class ProductsRepository : IProductsRepository
{
    private readonly DbSet<Product> _products;

    public ProductsRepository(DbSet<Product> products)
    {
        _products = products;
    }
    
    public async Task<Product[]> GetAllOrderedByNameAsync(CancellationToken cancellationToken)
    {
        return await _products
            .OrderBy(p => p.Name)
            .ToArrayAsync(cancellationToken);
    }
}