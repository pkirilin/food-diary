using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading;
using System.Threading.Tasks;
using FoodDiary.Domain.Entities;
using FoodDiary.Domain.Repositories;
using Microsoft.EntityFrameworkCore;

namespace FoodDiary.Infrastructure.Repositories;

public class PageRepository : Repository<Page>, IPageRepository
{
    public PageRepository(FoodDiaryContext context) : base(context)
    {
    }

    public IQueryable<Page> LoadNotesWithProductsAndCategories(IQueryable<Page> query)
    {
        return query.Include(p => p.Notes)
            .ThenInclude(n => n.Product)
            .ThenInclude(p => p.Category);
    }

    public Task<Dictionary<DateTime, Page>> GetDictionaryByQueryAsync(IQueryable<Page> query, CancellationToken cancellationToken)
    {
        return query.ToDictionaryAsync(p => p.Date, cancellationToken);
    }
}