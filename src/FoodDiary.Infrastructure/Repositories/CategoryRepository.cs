using System.Collections.Generic;
using System.Linq;
using System.Threading;
using System.Threading.Tasks;
using FoodDiary.Domain.Entities;
using FoodDiary.Domain.Repositories;
using Microsoft.EntityFrameworkCore;

namespace FoodDiary.Infrastructure.Repositories
{
    public class CategoryRepository : Repository<Category>, ICategoryRepository
    {
        public CategoryRepository(FoodDiaryContext context) : base(context)
        {
        }

        public IQueryable<Category> LoadProducts(IQueryable<Category> query)
        {
            return query.Include(c => c.Products);
        }

        public Task<Dictionary<string, Category>> GetDictionaryFromQueryAsync(IQueryable<Category> query, CancellationToken cancellationToken)
        {
            return query.ToDictionaryAsync(c => c.Name, cancellationToken);
        }
    }
}
