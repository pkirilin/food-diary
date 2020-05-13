using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading;
using System.Threading.Tasks;
using FoodDiary.Domain.Abstractions;
using FoodDiary.Domain.Entities;
using FoodDiary.Domain.Repositories;
using Microsoft.EntityFrameworkCore;

namespace FoodDiary.Infrastructure.Repositories
{
    public class PageRepository : IPageRepository
    {
        private readonly FoodDiaryContext _context;

        public IUnitOfWork UnitOfWork => _context;

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

        public Task<List<Page>> GetListFromQueryAsync(IQueryable<Page> query, CancellationToken cancellationToken)
        {
            return query.ToListAsync(cancellationToken);
        }

        public Task<Dictionary<DateTime, Page>> GetDictionaryFromQueryAsync(IQueryable<Page> query, CancellationToken cancellationToken)
        {
            return query.ToDictionaryAsync(p => p.Date);
        }

        public IQueryable<Page> LoadNotesWithProducts(IQueryable<Page> query)
        {
            return query.Include(p => p.Notes).ThenInclude(n => n.Product);
        }

        public IQueryable<Page> LoadNotesWithProductsAndCategories(IQueryable<Page> query)
        {
            return query.Include(p => p.Notes)
                .ThenInclude(n => n.Product)
                .ThenInclude(p => p.Category);
        }

        public Task<Page> GetByIdAsync(int id, CancellationToken cancellationToken)
        {
            return _context.Pages.FindAsync(new object[] { id }, cancellationToken);
        }

        public Task SaveChangesAsync(CancellationToken cancellationToken)
        {
            return _context.SaveChangesAsync(cancellationToken);
        }

        public Page Add(Page page)
        {
            return _context.Add(page).Entity;
        }

        public void AddRange(IEnumerable<Page> pages)
        {
            _context.AddRange(pages);
        }

        public void Update(Page page)
        {
            _context.Update(page);
        }

        public void Delete(Page page)
        {
            _context.Remove(page);
        }

        public void DeleteRange(IEnumerable<Page> pages)
        {
            _context.RemoveRange(pages);
        }
    }
}
