using System;
using FoodDiary.Domain.Entities;
using FoodDiary.Infrastructure;
using Microsoft.Data.Sqlite;

namespace FoodDiary.IntegrationTests.Database;

public static class TestDatabaseUtils
{
    public static void Clear(FoodDiaryContext context, SqliteConnection? connection)
    {
        connection?.Close();
        connection?.Open();
        context.ChangeTracker.Clear();
        context.Database.EnsureCreated();
    }
    
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

        var pages = new[]
        {
            new Page { Id = 1, Date = DateTime.Parse("2022-05-01") },
            new Page { Id = 2, Date = DateTime.Parse("2022-05-02") },
            new Page { Id = 3, Date = DateTime.Parse("2022-05-03") },
        };
        
        context.Categories.AddRange(categories);
        context.Products.AddRange(products);
        context.Pages.AddRange(pages);
        context.SaveChanges();
    }
}