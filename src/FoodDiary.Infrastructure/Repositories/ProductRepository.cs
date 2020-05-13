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
    public class ProductRepository : IProductRepository
    {
        private readonly FoodDiaryContext _context;

        public IUnitOfWork UnitOfWork => _context;

        public ProductRepository(FoodDiaryContext context)
        {
            _context = context ?? throw new ArgumentNullException(nameof(context));
        }

        public IQueryable<Product> GetQuery()
        {
            return _context.Products.AsQueryable();
        }

        public IQueryable<Product> GetQueryWithoutTracking()
        {
            return GetQuery().AsNoTracking();
        }

        public Task<List<Product>> GetListFromQueryAsync(IQueryable<Product> query, CancellationToken cancellationToken)
        {
            return query.ToListAsync(cancellationToken);
        }

        public Task<Dictionary<string, Product>> GetDictionaryFromQueryAsync(IQueryable<Product> query, CancellationToken cancellationToken)
        {
            return query.ToDictionaryAsync(p => p.Name);
        }

        public IQueryable<Product> LoadCategory(IQueryable<Product> query)
        {
            return query.Include(p => p.Category);
        }

        public Task<Product> GetByIdAsync(int id, CancellationToken cancellationToken)
        {
            return _context.Products.FindAsync(new object[] { id }, cancellationToken);
        }

        public Task<List<Product>> GetByIdsAsync(IEnumerable<int> ids, CancellationToken cancellationToken)
        {
            return _context.Products.Where(p => ids.Contains(p.Id))
                .ToListAsync(cancellationToken);
        }

        public Product Create(Product product)
        {
            var entry = _context.Products.Add(product);
            return entry.Entity;
        }

        public void Update(Product product)
        {
            _context.Products.Update(product);
        }

        public void Delete(Product product)
        {
            _context.Products.Remove(product);
        }

        public void DeleteRange(IEnumerable<Product> products)
        {
            _context.Products.RemoveRange(products);
        }

        public Task<int> CountByQueryAsync(IQueryable<Product> query, CancellationToken cancellationToken)
        {
            return query.CountAsync(cancellationToken);
        }
    }
}
