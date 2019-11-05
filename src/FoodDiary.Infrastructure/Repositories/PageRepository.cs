using System.Collections.Generic;
using System.Linq;
using System.Threading;
using System.Threading.Tasks;
using FoodDiary.Domain.Entities;
using FoodDiary.Domain.Repositories;

namespace FoodDiary.Infrastructure.Repositories
{
    public class PageRepository : IPageRepository
    {
        private readonly FoodDiaryContext _context;

        public PageRepository(FoodDiaryContext context)
        {
            _context = context;
        }

        public IQueryable<Page> Get()
        {
            return _context.Pages;
        }

        public async Task<Page> GetByIdAsync(int id, CancellationToken cancellationToken)
        {
            return await _context.Pages.FindAsync(id, cancellationToken);
        }

        public async Task<int> CreateAsync(Page page, CancellationToken cancellationToken)
        {
            var entry = _context.Add(page);
            await _context.SaveChangesAsync(cancellationToken);
            return entry.Entity.Id;
        }

        public async Task UpdateAsync(Page page, CancellationToken cancellationToken)
        {
            _context.Update(page);
            await _context.SaveChangesAsync(cancellationToken);
        }

        public async Task DeleteAsync(Page page, CancellationToken cancellationToken)
        {
            _context.Remove(page);
            await _context.SaveChangesAsync(cancellationToken);
        }

        public async Task DeleteRangeAsync(IEnumerable<Page> pages, CancellationToken cancellationToken)
        {
            _context.RemoveRange(pages, cancellationToken);
            await _context.SaveChangesAsync(cancellationToken);
        }
    }
}
