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

        Task<List<TEntity>> GetListFromQueryAsync(IQueryable<TEntity> query, CancellationToken cancellationToken);

        Task<TEntity> GetByIdAsync(int id, CancellationToken cancellationToken);

        Task<int> CountByQueryAsync(IQueryable<TEntity> query, CancellationToken cancellationToken);

        TEntity Create(TEntity entity);

        void Update(TEntity entity);

        void Delete(TEntity entity);

        void CreateRange(IEnumerable<TEntity> entities);

        void UpdateRange(IEnumerable<TEntity> entities);

        void DeleteRange(IEnumerable<TEntity> entities);

        IUnitOfWork UnitOfWork { get; }
    }
}
