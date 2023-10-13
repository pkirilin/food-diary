using System.Threading;
using System.Threading.Tasks;
using FoodDiary.Domain.Abstractions.v2;
using FoodDiary.Domain.Repositories.v2;
using FoodDiary.Infrastructure.Repositories.v2;

namespace FoodDiary.Infrastructure;

public class FoodDiaryUnitOfWork : IFoodDiaryUnitOfWork
{
    private readonly FoodDiaryContext _context;

    public FoodDiaryUnitOfWork(FoodDiaryContext context)
    {
        _context = context;
    }

    public IPagesRepository Pages => new PagesRepository(_context.Pages);
    
    public IProductsRepository Products => new ProductsRepository(_context.Products);

    public ICategoriesRepository Categories => new CategoriesRepository(_context.Categories);

    public async Task SaveChangesAsync(CancellationToken cancellationToken)
    {
        await _context.SaveChangesAsync(cancellationToken);
    }
}