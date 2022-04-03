using System.Linq;
using System.Threading;
using System.Threading.Tasks;
using FoodDiary.Domain.Entities;
using FoodDiary.Domain.Repositories.v2;
using Microsoft.EntityFrameworkCore;

namespace FoodDiary.Infrastructure.Repositories.v2;

public class CategoriesRepository : ICategoriesRepository
{
    private readonly DbSet<Category> _categories;

    public CategoriesRepository(DbSet<Category> categories)
    {
        _categories = categories;
    }
    
    public Task<Category[]> GetAllOrderedByNameAsync(CancellationToken cancellationToken)
    {
        return _categories
            .OrderBy(c => c.Name)
            .ToArrayAsync(cancellationToken);
    }
}