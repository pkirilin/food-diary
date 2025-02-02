using System.Threading;
using System.Threading.Tasks;
using FoodDiary.Domain.Entities;
using FoodDiary.Domain.Repositories.v2;
using Microsoft.EntityFrameworkCore;

namespace FoodDiary.Infrastructure.Repositories.v2;

internal class ProductsRepository(FoodDiaryContext context) : IProductsRepository
{
    public async Task<Product> FindById(int id, CancellationToken cancellationToken)
    {
        return await context.Products.FindAsync([id], cancellationToken);
    }

    public Task<Product> FindByExactName(string name, CancellationToken cancellationToken)
    {
        return context.Products.FirstOrDefaultAsync(p => p.Name == name, cancellationToken);
    }

    public async Task Create(Product product, CancellationToken cancellationToken)
    {
        context.Products.Add(product);
        await context.SaveChangesAsync(cancellationToken);
    }
}