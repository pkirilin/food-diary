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

        Task<IEnumerable<Page>> GetListFromQueryAsync(IQueryable<Page> pagesQuery, CancellationToken cancellationToken);

        Task<IDictionary<DateTime, Page>> GetDictionaryFromQueryAsync(IQueryable<Page> pagesQuery, CancellationToken cancellationToken);

        IQueryable<Page> LoadNotesWithProducts(IQueryable<Page> pagesQuery);

        IQueryable<Page> LoadNotesWithProductsAndCategories(IQueryable<Page> pagesQuery);

        Task<Page> GetByIdAsync(int id, CancellationToken cancellationToken);

        Task<Page> CreateAsync(Page page, CancellationToken cancellationToken);

        void CreateRange(IEnumerable<Page> pages);

        Task<Page> UpdateAsync(Page page, CancellationToken cancellationToken);

        Task<Page> DeleteAsync(Page page, CancellationToken cancellationToken);

        Task<IEnumerable<Page>> DeleteRangeAsync(IEnumerable<Page> pages, CancellationToken cancellationToken);

        Task<bool> IsDuplicateAsync(DateTime pageDate, CancellationToken cancellationToken);

        Task SaveChangesAsync(CancellationToken cancellationToken);
    }
}
