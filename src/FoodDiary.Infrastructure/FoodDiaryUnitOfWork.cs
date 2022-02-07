using System.Threading;
using System.Threading.Tasks;
using FoodDiary.Domain.Abstractions.v2;
using FoodDiary.Domain.Repositories.v2;
using FoodDiary.Infrastructure.Repositories.v2;

namespace FoodDiary.Infrastructure;

internal class FoodDiaryUnitOfWork : IFoodDiaryUnitOfWork
{
    private readonly FoodDiaryContext _context;

    public FoodDiaryUnitOfWork(FoodDiaryContext context)
    {
        _context = context;
    }

    public IProductsRepository Products => new ProductsRepository(_context.Products);
    
    public async Task SaveChangesAsync(CancellationToken cancellationToken)
    {
        await _context.SaveChangesAsync(cancellationToken);
    }
}