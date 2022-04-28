using System;
using System.Linq;
using System.Threading;
using System.Threading.Tasks;
using FoodDiary.Domain.Entities;
using FoodDiary.Domain.Repositories.v2;
using Microsoft.EntityFrameworkCore;

namespace FoodDiary.Infrastructure.Repositories.v2;

internal class PagesRepository : IPagesRepository
{
    private readonly DbSet<Page> _pages;

    public PagesRepository(DbSet<Page> pages)
    {
        _pages = pages;
    }
    
    public Task<Page[]> GetAsync(DateTime startDate, DateTime endDate, CancellationToken cancellationToken)
    {
        return _pages
            .Where(p => p.Date >= startDate && p.Date <= endDate)
            .OrderBy(p => p.Date)
            .AsSplitQuery()
            .Include(p => p.Notes)
            .ThenInclude(n => n.Product)
            .ThenInclude(pr => pr.Category)
            .ToArrayAsync(cancellationToken);
    }
}