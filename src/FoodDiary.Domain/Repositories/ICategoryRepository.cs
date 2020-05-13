using System.Collections.Generic;
using System.Linq;
using System.Threading;
using System.Threading.Tasks;
using FoodDiary.Domain.Abstractions;
using FoodDiary.Domain.Entities;

namespace FoodDiary.Domain.Repositories
{
    public interface ICategoryRepository : IRepository<Category>
    {
        IQueryable<Category> GetQuery();

        IQueryable<Category> GetQueryWithoutTracking();

        Task<List<Category>> GetListFromQueryAsync(IQueryable<Category> query, CancellationToken cancellationToken);

        Task<Dictionary<string, Category>> GetDictionaryFromQueryAsync(IQueryable<Category> query, CancellationToken cancellationToken);

        Task<Category> GetByIdAsync(int id, CancellationToken cancellationToken);

        Category Create(Category category);

        void Update(Category category);

        void Delete(Category category);

        IQueryable<Category> LoadProducts(IQueryable<Category> query);
    }
}
