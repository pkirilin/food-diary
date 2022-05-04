using System;
using FoodDiary.Domain.Entities;
using FoodDiary.Domain.Enums;
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
            new Category { Id = 1, Name = "Meat" },
            new Category { Id = 2, Name = "Cereals" },
            new Category { Id = 3, Name = "Eggs" },
            new Category { Id = 4, Name = "Bakery" }
        };

        var products = new[]
        {
            new Product { Id = 1, Name = "Chicken", CategoryId = 1, CaloriesCost = 136 },
            new Product { Id = 2, Name = "Rice", CategoryId = 2, CaloriesCost = 130 },
            new Product { Id = 3, Name = "Scrambled eggs", CategoryId = 3, CaloriesCost = 154 },
            new Product { Id = 4, Name = "Bread", CategoryId = 4, CaloriesCost = 259 },
        };

        var pages = new[]
        {
            new Page { Id = 1, Date = DateTime.Parse("2022-05-01") },
            new Page { Id = 2, Date = DateTime.Parse("2022-05-02") },
            new Page { Id = 3, Date = DateTime.Parse("2022-05-03") },
        };

        var notes = new[]
        {
            new Note
            {
                Id = 1,
                DisplayOrder = 0,
                MealType = MealType.Breakfast,
                PageId = 1,
                ProductId = 1,
                ProductQuantity = 180
            },
            new Note
            {
                Id = 2,
                DisplayOrder = 1,
                MealType = MealType.Breakfast,
                PageId = 1,
                ProductId = 2,
                ProductQuantity = 90
            },
            new Note
            {
                Id = 3,
                DisplayOrder = 2,
                MealType = MealType.Breakfast,
                PageId = 1,
                ProductId = 4,
                ProductQuantity = 75
            },
            new Note
            {
                Id = 4,
                DisplayOrder = 0,
                MealType = MealType.Lunch,
                PageId = 1,
                ProductId = 3,
                ProductQuantity = 160
            },
            new Note
            {
                Id = 5,
                DisplayOrder = 1,
                MealType = MealType.Lunch,
                PageId = 1,
                ProductId = 4,
                ProductQuantity = 50
            }
        };
        
        context.Categories.AddRange(categories);
        context.Products.AddRange(products);
        context.Pages.AddRange(pages);
        context.Notes.AddRange(notes);
        context.SaveChanges();
    }
}