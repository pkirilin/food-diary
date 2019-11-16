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

        Task<int> CreateAsync(Page page, CancellationToken cancellationToken);

        Task UpdateAsync(Page page, CancellationToken cancellationToken);

        Task DeleteAsync(Page page, CancellationToken cancellationToken);

        Task DeleteRangeAsync(ICollection<Page> pages, CancellationToken cancellationToken);

        Task<bool> IsDuplicateAsync(DateTime pageDate, CancellationToken cancellationToken);
    }
}
