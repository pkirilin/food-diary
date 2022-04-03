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
    private readonly List<Category> _categories;

    private int _categoryId;

    public SeedDataForDbContextBuilder(FoodDiaryContext context)
    {
        _context = context;
        _products = new List<Product>();
        _categories = new List<Category>();
    }
    
    public async Task PleaseAsync(CancellationToken cancellationToken = default)
    {
        _context.Products.AddRange(_products);
        _context.Categories.AddRange(_categories);
        await _context.SaveChangesAsync(cancellationToken);
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

    public SeedDataForDbContextBuilder AddCategory(string name)
    {
        _categories.Add(new Category
        {
            Id = ++_categoryId,
            Name = name
        });
        
        return this;
    }
}