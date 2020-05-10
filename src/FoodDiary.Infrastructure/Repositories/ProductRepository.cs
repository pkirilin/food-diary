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
    public class ProductRepository : IProductRepository
    {
        private readonly FoodDiaryContext _context;

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

        public async Task<List<Product>> GetListFromQueryAsync(IQueryable<Product> query, CancellationToken cancellationToken)
        {
            return await query.ToListAsync(cancellationToken);
        }

        public async Task<Dictionary<string, Product>> GetDictionaryFromQueryAsync(IQueryable<Product> query, CancellationToken cancellationToken)
        {
            return await query.ToDictionaryAsync(p => p.Name);
        }

        public IQueryable<Product> LoadCategory(IQueryable<Product> query)
        {
            return query.Include(p => p.Category);
        }

        public async Task<Product> GetByIdAsync(int id, CancellationToken cancellationToken)
        {
            return await _context.Products.FindAsync(new object[] { id }, cancellationToken);
        }

        public async Task<IEnumerable<Product>> GetByIdsAsync(IEnumerable<int> ids, CancellationToken cancellationToken)
        {
            return await _context.Products.Where(p => ids.Contains(p.Id))
                .ToListAsync(cancellationToken);
        }

        public async Task<bool> IsDuplicateAsync(string productName, CancellationToken cancellationToken)
        {
            var productWithTheSameName = await _context.Products.FirstOrDefaultAsync(p => p.Name == productName, cancellationToken);
            return productWithTheSameName != null;
        }

        public Product Create(Product product)
        {
            var entry = _context.Products.Add(product);
            return entry.Entity;
        }

        public Product Update(Product product)
        {
            var entry = _context.Products.Update(product);
            return entry.Entity;
        }

        public Product Delete(Product product)
        {
            var entry = _context.Products.Remove(product);
            return entry.Entity;
        }

        public void DeleteRange(IEnumerable<Product> products)
        {
            _context.Products.RemoveRange(products);
        }

        public async Task SaveChangesAsync(CancellationToken cancellationToken)
        {
            await _context.SaveChangesAsync(cancellationToken);
        }

        public async Task<int> CountByQueryAsync(IQueryable<Product> productsQuery, CancellationToken cancellationToken)
        {
            return await productsQuery.CountAsync(cancellationToken);
        }
    }
}
