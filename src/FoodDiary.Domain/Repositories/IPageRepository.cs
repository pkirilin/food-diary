using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading;
using System.Threading.Tasks;
using FoodDiary.Domain.Entities;

namespace FoodDiary.Domain.Repositories
{
    public interface IPageRepository
    {
        IQueryable<Page> GetQuery();

        IQueryable<Page> GetQueryWithoutTracking();

        Task<List<Page>> GetListFromQuery(IQueryable<Page> pagesQuery, CancellationToken cancellationToken);

        Task<Page> GetByIdAsync(int id, CancellationToken cancellationToken);

        Task<Page> CreateAsync(Page page, CancellationToken cancellationToken);

        Task<Page> UpdateAsync(Page page, CancellationToken cancellationToken);

        Task<Page> DeleteAsync(Page page, CancellationToken cancellationToken);

        Task<IEnumerable<Page>> DeleteRangeAsync(IEnumerable<Page> pages, CancellationToken cancellationToken);

        Task<bool> IsDuplicateAsync(DateTime pageDate, CancellationToken cancellationToken);
    }
}
