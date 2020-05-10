using System.Collections.Generic;
using System.Linq;
using System.Threading;
using System.Threading.Tasks;
using FoodDiary.Domain.Entities;

namespace FoodDiary.Domain.Repositories
{
    public interface ICategoryRepository
    {
        IQueryable<Category> GetQuery();

        IQueryable<Category> GetQueryWithoutTracking();

        Task<IEnumerable<Category>> GetListFromQueryAsync(IQueryable<Category> query, CancellationToken cancellationToken);

        Task<Dictionary<string, Category>> GetDictionaryFromQueryAsync(IQueryable<Category> query, CancellationToken cancellationToken);

        Task<Category> GetByIdAsync(int id, CancellationToken cancellationToken);

        Task<bool> IsDuplicateAsync(string categoryName, CancellationToken cancellationToken);

        Category Create(Category category);

        Category Update(Category category);

        Category Delete(Category category);

        Task SaveChangesAsync(CancellationToken cancellationToken);

        IQueryable<Category> LoadProducts(IQueryable<Category> query);
    }
}
