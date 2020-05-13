using System.Collections.Generic;
using System.Linq;
using System.Threading;
using System.Threading.Tasks;
using FoodDiary.Domain.Abstractions;
using FoodDiary.Domain.Entities;

namespace FoodDiary.Domain.Repositories
{
    public interface IProductRepository : IRepository<Product>
    {
        IQueryable<Product> GetQuery();

        IQueryable<Product> GetQueryWithoutTracking();

        Task<List<Product>> GetListFromQueryAsync(IQueryable<Product> query, CancellationToken cancellationToken);

        Task<Dictionary<string, Product>> GetDictionaryFromQueryAsync(IQueryable<Product> query, CancellationToken cancellationToken);

        IQueryable<Product> LoadCategory(IQueryable<Product> query);

        Task<Product> GetByIdAsync(int id, CancellationToken cancellationToken);

        Task<List<Product>> GetByIdsAsync(IEnumerable<int> ids, CancellationToken cancellationToken);

        Product Create(Product product);

        void Update(Product product);

        void Delete(Product product);

        void DeleteRange(IEnumerable<Product> products);

        Task<int> CountByQueryAsync(IQueryable<Product> query, CancellationToken cancellationToken);
    }
}
