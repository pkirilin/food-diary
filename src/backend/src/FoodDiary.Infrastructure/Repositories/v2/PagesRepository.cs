using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading;
using System.Threading.Tasks;
using FoodDiary.Domain.Entities;
using FoodDiary.Domain.Repositories.v2;
using Microsoft.EntityFrameworkCore;

#nullable enable

namespace FoodDiary.Infrastructure.Repositories.v2;

internal class PagesRepository(FoodDiaryContext context) : IPagesRepository
{
    public async Task<IReadOnlyList<Page>> Find(
        Func<IQueryable<Page>, IQueryable<Page>> buildQuery,
        CancellationToken cancellationToken)
    {
        var query = buildQuery(context.Pages.AsNoTracking())
            .AsSplitQuery()
            .Include(p => p.Notes)
            .ThenInclude(n => n.Product)
            .ThenInclude(p => p.Category);
        
        return await query.ToListAsync(cancellationToken);
    }

    public async Task<FindWithTotalCountResult> FindWithTotalCount(
        Func<IQueryable<Page>, IQueryable<Page>> buildQuery,
        CancellationToken cancellationToken)
    {
        var query = buildQuery(context.Pages.AsNoTracking())
            .AsSplitQuery()
            .Include(p => p.Notes)
            .ThenInclude(n => n.Product)
            .ThenInclude(p => p.Category);
        
        var foundPages = await query.ToListAsync(cancellationToken);
        var totalCount = await query.LongCountAsync(cancellationToken);
        
        return new FindWithTotalCountResult(foundPages, totalCount);
    }

    public async Task<Page?> FindById(int id, CancellationToken cancellationToken)
    {
        return await context.Pages.FindAsync(
            keyValues: [id],
            cancellationToken: cancellationToken);
    }

    public async Task<IReadOnlyList<Page>> FindByIds(IReadOnlyList<int> ids, CancellationToken cancellationToken)
    {
        return await context.Pages
            .Where(p => ids.Contains(p.Id))
            .ToListAsync(cancellationToken);
    }

    public Task<Page?> FindByDate(DateOnly date, CancellationToken cancellationToken)
    {
        return context.Pages
            .Where(p => p.Date == date)
            .FirstOrDefaultAsync(cancellationToken);
    }

    public Task<Page?> FindLast(CancellationToken cancellationToken)
    {
        return context.Pages
            .AsNoTracking()
            .OrderByDescending(p => p.Date)
            .FirstOrDefaultAsync(cancellationToken);
    }

    public async Task<int> Create(Page page, CancellationToken cancellationToken)
    {
        var entry = await context.Pages.AddAsync(page, cancellationToken);
        await context.SaveChangesAsync(cancellationToken);
        return entry.Entity.Id;
    }

    public Task Update(Page page, CancellationToken cancellationToken)
    {
        context.Update(page);
        return context.SaveChangesAsync(cancellationToken);
    }

    public Task Delete(Page page, CancellationToken cancellationToken)
    {
        context.Remove(page);
        return context.SaveChangesAsync(cancellationToken);
    }

    public Task Delete(IEnumerable<Page> pages, CancellationToken cancellationToken)
    {
        context.RemoveRange(pages);
        return context.SaveChangesAsync(cancellationToken);
    }
}