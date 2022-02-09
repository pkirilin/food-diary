using System.Collections.Generic;
using System.Threading;
using System.Threading.Tasks;
using FoodDiary.Domain.Entities;
using FoodDiary.Infrastructure;
using Microsoft.Extensions.DependencyInjection;

namespace FoodDiary.IntegrationTests.Dsl;

public class SeedDatabaseBuilder
{
    private readonly FoodDiaryWebApplicationFactory _webApplicationFactory;

    private readonly List<Product> _products;

    public SeedDatabaseBuilder(FoodDiaryWebApplicationFactory webApplicationFactory)
    {
        _webApplicationFactory = webApplicationFactory;
        _products = new List<Product>();
    }
    
    public SeedDatabaseBuilder AddProduct(int id, string name)
    {
        _products.Add(new Product
        {
            Id = id,
            Name = name
        });
        
        return this;
    }

    public async Task SeedAsync(CancellationToken cancellationToken = default)
    {
        var context = _webApplicationFactory.Services.GetRequiredService<FoodDiaryContext>();
        context.Products.AddRange(_products);
        await context.SaveChangesAsync(cancellationToken);
    }
}