using System.Linq;
using System.Threading;
using System.Threading.Tasks;
using FoodDiary.Domain.Entities;
using FoodDiary.Domain.Repositories.v2;
using Microsoft.EntityFrameworkCore;

namespace FoodDiary.Infrastructure.Repositories.v2;

internal class ProductsRepository(FoodDiaryContext context) : IProductsRepository
{
    public Task<Product[]> GetAllOrderedByNameAsync(CancellationToken cancellationToken) =>
        context.Products
            .OrderBy(p => p.Name)
            .ToArrayAsync(cancellationToken);

    public Task<Product> FindByExactName(string name, CancellationToken cancellationToken) =>
        context.Products.FirstOrDefaultAsync(p => p.Name == name, cancellationToken);

    public async Task Create(Product product, CancellationToken cancellationToken)
    {
        context.Products.Add(product);
        await context.SaveChangesAsync(cancellationToken);
    }
}