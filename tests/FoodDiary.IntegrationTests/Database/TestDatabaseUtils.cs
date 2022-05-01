using FoodDiary.Domain.Entities;
using FoodDiary.Infrastructure;

namespace FoodDiary.IntegrationTests.Database;

public static class TestDatabaseUtils
{
    public static void Initialize(FoodDiaryContext context)
    {
        var categories = new []
        {
            new Category { Id = 1, Name = "Cereals" },
            new Category { Id = 2, Name = "Dairy" },
            new Category { Id = 3, Name = "Frozen Foods" },
            new Category { Id = 4, Name = "Bakery" }
        };

        var products = new[]
        {
            new Product { Id = 1, Name = "Milk", CategoryId = 2 },
            new Product { Id = 2, Name = "Bread", CategoryId = 4 },
        };
        
        context.Categories.AddRange(categories);
        context.Products.AddRange(products);
        context.SaveChanges();
    }
}