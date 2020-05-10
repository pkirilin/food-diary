using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading;
using System.Threading.Tasks;
using FoodDiary.Domain.Entities;
using FoodDiary.Domain.Repositories;
using Microsoft.EntityFrameworkCore;

namespace FoodDiary.Infrastructure.Repositories
{
    public class PageRepository : IPageRepository
    {
        private readonly FoodDiaryContext _context;

        public PageRepository(FoodDiaryContext context)
        {
            _context = context ?? throw new ArgumentNullException(nameof(context));
        }

        public IQueryable<Page> GetQuery()
        {
            return _context.Pages.AsQueryable();
        }

        public IQueryable<Page> GetQueryWithoutTracking()
        {
            return GetQuery().AsNoTracking();
        }

        public async Task<IEnumerable<Page>> GetListFromQueryAsync(IQueryable<Page> pagesQuery, CancellationToken cancellationToken)
        {
            return await pagesQuery.ToListAsync(cancellationToken);
        }

        public async Task<IDictionary<DateTime, Page>> GetDictionaryFromQueryAsync(IQueryable<Page> pagesQuery, CancellationToken cancellationToken)
        {
            return await pagesQuery.ToDictionaryAsync(p => p.Date);
        }

        public IQueryable<Page> LoadNotesWithProducts(IQueryable<Page> pagesQuery)
        {
            return pagesQuery.Include(p => p.Notes).ThenInclude(n => n.Product);
        }

        public IQueryable<Page> LoadNotesWithProductsAndCategories(IQueryable<Page> pagesQuery)
        {
            return pagesQuery.Include(p => p.Notes)
                .ThenInclude(n => n.Product)
                .ThenInclude(p => p.Category);
        }

        public async Task<Page> GetByIdAsync(int id, CancellationToken cancellationToken)
        {
            return await _context.Pages.FindAsync(new object[] { id }, cancellationToken);
        }

        public async Task<Page> CreateAsync(Page page, CancellationToken cancellationToken)
        {
            var entry = _context.Add(page);
            await _context.SaveChangesAsync(cancellationToken);
            return entry.Entity;
        }

        public void CreateRange(IEnumerable<Page> pages)
        {
            _context.AddRange(pages);
        }

        public async Task<Page> UpdateAsync(Page page, CancellationToken cancellationToken)
        {
            var entry = _context.Update(page);
            await _context.SaveChangesAsync(cancellationToken);
            return entry.Entity;
        }

        public async Task<Page> DeleteAsync(Page page, CancellationToken cancellationToken)
        {
            var entry = _context.Remove(page);
            await _context.SaveChangesAsync(cancellationToken);
            return entry.Entity;
        }

        public async Task<IEnumerable<Page>> DeleteRangeAsync(IEnumerable<Page> pages, CancellationToken cancellationToken)
        {
            _context.RemoveRange(pages);
            await _context.SaveChangesAsync(cancellationToken);
            return pages;
        }

        public async Task<bool> IsDuplicateAsync(DateTime pageDate, CancellationToken cancellationToken)
        {
            var pagesWithTheSameDate = await _context.Pages.Where(p => p.Date == pageDate)
                .AsNoTracking()
                .ToListAsync();
            return pagesWithTheSameDate.Any();
        }

        public async Task SaveChangesAsync(CancellationToken cancellationToken)
        {
            await _context.SaveChangesAsync(cancellationToken);
        }
    }
}
