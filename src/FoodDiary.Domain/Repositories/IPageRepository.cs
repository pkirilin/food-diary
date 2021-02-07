using System;
using System.Linq;
using System.Threading;
using System.Threading.Tasks;
using FoodDiary.Domain.Abstractions;
using FoodDiary.Domain.Entities;

namespace FoodDiary.Domain.Repositories
{
    public interface IPageRepository : IRepository<Page>, ILookupRepository<DateTime, Page>
    {
        IQueryable<Page> LoadNotesWithProducts(IQueryable<Page> query);

        IQueryable<Page> LoadNotesWithProductsAndCategories(IQueryable<Page> query);

        Task<Page> GetPageByIdWithNotesAsync(int pageId, CancellationToken cancellationToken);

        Task<Page[]> GetAdjacentPagesAsync(DateTime curDate, CancellationToken cancellationToken);
    }
}
