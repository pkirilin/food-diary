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
        IQueryable<Page> LoadNotesWithProductsAndCategories(IQueryable<Page> query);

        Task<Page> GetPreviousPageAsync(DateTime curDate, CancellationToken cancellationToken);
        
        Task<Page> GetNextPageAsync(DateTime curDate, CancellationToken cancellationToken);
    }
}
