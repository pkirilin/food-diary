using System.Collections.Generic;
using System.Linq;
using System.Threading;
using System.Threading.Tasks;
using FoodDiary.Domain.Entities;

namespace FoodDiary.Domain.Repositories
{
    public interface IProductRepository
    {
        IQueryable<Product> GetQuery();

        IQueryable<Product> GetQueryWithoutTracking();

        Task<List<Product>> GetListFromQueryAsync(IQueryable<Product> query, CancellationToken cancellationToken);

        IQueryable<Product> LoadCategory(IQueryable<Product> query);

        Task<Product> GetByIdAsync(int id, CancellationToken cancellationToken);

        Task<IEnumerable<Product>> GetByIdsAsync(IEnumerable<int> ids, CancellationToken cancellationToken);

        Task<bool> IsDuplicateAsync(string productName, CancellationToken cancellationToken);

        Product Create(Product product);

        Product Update(Product product);

        Product Delete(Product product);

        void DeleteRange(IEnumerable<Product> products);

        Task SaveChangesAsync(CancellationToken cancellationToken);
    }
}
