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
    public class CategoryRepository : ICategoryRepository
    {
        private readonly FoodDiaryContext _context;

        public IUnitOfWork UnitOfWork => _context;

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

        public Task<List<Category>> GetListFromQueryAsync(IQueryable<Category> query, CancellationToken cancellationToken)
        {
            return query.ToListAsync(cancellationToken);
        }

        public Task<Dictionary<string, Category>> GetDictionaryFromQueryAsync(IQueryable<Category> query, CancellationToken cancellationToken)
        {
            return query.ToDictionaryAsync(c => c.Name);
        }

        public Task<Category> GetByIdAsync(int id, CancellationToken cancellationToken)
        {
            return _context.Categories.FindAsync(new object[] { id }, cancellationToken);
        }

        public Category Create(Category category)
        {
            var entry = _context.Categories.Add(category);
            return entry.Entity;
        }

        public void Update(Category category)
        {
            _context.Categories.Update(category);
        }

        public void Delete(Category category)
        {
            _context.Categories.Remove(category);
        }

        public IQueryable<Category> LoadProducts(IQueryable<Category> query)
        {
            return query.Include(c => c.Products);
        }
    }
}
