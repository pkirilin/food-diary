using System.Collections.Generic;
using System.Linq;
using System.Threading;
using System.Threading.Tasks;

namespace FoodDiary.Domain.Abstractions
{
    public interface IRepository<TEntity> where TEntity : class
    {
        IQueryable<TEntity> GetQuery();

        IQueryable<TEntity> GetQueryWithoutTracking();

        Task<List<TEntity>> GetAllAsync(CancellationToken cancellationToken);

        Task<List<TEntity>> GetByQueryAsync(IQueryable<TEntity> query, CancellationToken cancellationToken);

        Task<TEntity> GetByIdAsync(int id, CancellationToken cancellationToken);

        Task<int> CountByQueryAsync(IQueryable<TEntity> query, CancellationToken cancellationToken);

        TEntity Add(TEntity entity);

        void Update(TEntity entity);

        void Remove(TEntity entity);

        void AddRange(IEnumerable<TEntity> entities);

        void UpdateRange(IEnumerable<TEntity> entities);

        void RemoveRange(IEnumerable<TEntity> entities);

        IUnitOfWork UnitOfWork { get; }
    }
}
