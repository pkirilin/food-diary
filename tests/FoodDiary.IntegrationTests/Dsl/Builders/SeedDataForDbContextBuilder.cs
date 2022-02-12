using System;
using System.Collections.Generic;
using System.Threading;
using System.Threading.Tasks;
using FoodDiary.Domain.Entities;
using FoodDiary.Infrastructure;

namespace FoodDiary.IntegrationTests.Dsl.Builders;

public class SeedDataForDbContextBuilder
{
    private readonly FoodDiaryContext _context;

    private readonly List<Product> _products;

    public SeedDataForDbContextBuilder(FoodDiaryContext context)
    {
        _context = context;
        _products = new List<Product>();
    }
    
    public SeedDataForDbContextBuilder AddProduct(int id, string name)
    {
        _products.Add(new Product
        {
            Id = id,
            Name = name,
            Category = new Category
            {
                Name = Guid.NewGuid().ToString()
            }
        });
        
        return this;
    }

    public async Task PleaseAsync(CancellationToken cancellationToken = default)
    {
        _context.Products.AddRange(_products);
        await _context.SaveChangesAsync(cancellationToken);
    }
}