using System.Collections.Generic;
using System.Linq;
using System.Threading;
using System.Threading.Tasks;

namespace FoodDiary.Domain.Abstractions
{
    public interface ILookupRepository<TKey, TEntity> where TEntity : class
    {
        Task<Dictionary<TKey, TEntity>> GetDictionaryByQueryAsync(IQueryable<TEntity> query, CancellationToken cancellationToken);
    }
}
