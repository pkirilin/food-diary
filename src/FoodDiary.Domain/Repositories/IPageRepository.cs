using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading;
using System.Threading.Tasks;
using FoodDiary.Domain.Abstractions;
using FoodDiary.Domain.Entities;

namespace FoodDiary.Domain.Repositories
{
    public interface IPageRepository : IRepository<Page>
    {
        IQueryable<Page> GetQuery();

        IQueryable<Page> GetQueryWithoutTracking();

        Task<List<Page>> GetListFromQueryAsync(IQueryable<Page> query, CancellationToken cancellationToken);

        Task<Dictionary<DateTime, Page>> GetDictionaryFromQueryAsync(IQueryable<Page> query, CancellationToken cancellationToken);

        IQueryable<Page> LoadNotesWithProducts(IQueryable<Page> query);

        IQueryable<Page> LoadNotesWithProductsAndCategories(IQueryable<Page> query);

        Task<Page> GetByIdAsync(int id, CancellationToken cancellationToken);

        Page Add(Page page);

        void AddRange(IEnumerable<Page> pages);

        void Update(Page page);

        void Delete(Page page);

        void DeleteRange(IEnumerable<Page> pages);
    }
}
