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
    public class CategoryRepository : ICategoryRepository
    {
        private readonly FoodDiaryContext _context;

        public CategoryRepository(FoodDiaryContext context)
        {
            _context = context ?? throw new ArgumentNullException(nameof(context));
        }

        public IQueryable<Category> GetQuery()
        {
            return _context.Categories.AsQueryable();
        }

        public IQueryable<Category> GetQueryWithoutTracking()
        {
            return GetQuery().AsNoTracking();
        }

        public async Task<IEnumerable<Category>> GetListFromQueryAsync(IQueryable<Category> query, CancellationToken cancellationToken)
        {
            return await query.ToListAsync(cancellationToken);
        }

        public async Task<Dictionary<string, Category>> GetDictionaryFromQueryAsync(IQueryable<Category> query, CancellationToken cancellationToken)
        {
            return await query.ToDictionaryAsync(c => c.Name);
        }

        public async Task<Category> GetByIdAsync(int id, CancellationToken cancellationToken)
        {
            return await _context.Categories.FindAsync(new object[] { id }, cancellationToken);
        }

        public async Task<bool> IsDuplicateAsync(string categoryName, CancellationToken cancellationToken)
        {
            var categoryWithTheSameName = await _context.Categories.AsNoTracking()
                .FirstOrDefaultAsync(c => c.Name == categoryName);
            return categoryWithTheSameName != null;
        }

        public Category Create(Category category)
        {
            var entry = _context.Categories.Add(category);
            return entry.Entity;
        }

        public Category Update(Category category)
        {
            var entry = _context.Categories.Update(category);
            return entry.Entity;
        }

        public Category Delete(Category category)
        {
            var entry = _context.Categories.Remove(category);
            return entry.Entity;
        }

        public async Task SaveChangesAsync(CancellationToken cancellationToken)
        {
            await _context.SaveChangesAsync(cancellationToken);
        }

        public IQueryable<Category> LoadProducts(IQueryable<Category> query)
        {
            return query.Include(c => c.Products);
        }
    }
}
