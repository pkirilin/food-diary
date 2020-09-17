using System;
using System.Linq;
using FoodDiary.Domain.Abstractions;
using FoodDiary.Domain.Entities;

namespace FoodDiary.Domain.Repositories
{
    public interface IPageRepository : IRepository<Page>, ILookupRepository<DateTime, Page>
    {
        IQueryable<Page> LoadNotesWithProducts(IQueryable<Page> query);

        IQueryable<Page> LoadNotesWithProductsAndCategories(IQueryable<Page> query);
    }
}
