using System;
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
    public Task<Page[]> GetAsync(DateTime startDate, DateTime endDate, CancellationToken cancellationToken)
    {
        return context.Pages
            .Where(p => p.Date >= startDate && p.Date <= endDate)
            .OrderBy(p => p.Date)
            .AsSplitQuery()
            .Include(p => p.Notes)
            .ThenInclude(n => n.Product)
            .ThenInclude(pr => pr.Category)
            .ToArrayAsync(cancellationToken);
    }

    public async Task<Page?> FindById(int id, CancellationToken cancellationToken)
    {
        return await context.Pages.FindAsync(
            keyValues: [id],
            cancellationToken: cancellationToken);
    }

    public Task<Page?> FindByDate(DateOnly date, CancellationToken cancellationToken)
    {
        return context.Pages
            .Where(p => p.DateNew == date)
            .FirstOrDefaultAsync(cancellationToken);
    }

    public async Task<int> Create(Page page, CancellationToken cancellationToken)
    {
        var entry = await context.Pages.AddAsync(page, cancellationToken);
        await context.SaveChangesAsync(cancellationToken);
        return entry.Entity.Id;
    }

    public async Task Update(Page page, CancellationToken cancellationToken)
    {
        context.Update(page);
        await context.SaveChangesAsync(cancellationToken);
    }
}