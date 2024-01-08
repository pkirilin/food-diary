using System;
using System.Collections.Generic;
using System.Linq;
using FluentAssertions;
using FoodDiary.Application.Services.Export;
using FoodDiary.Domain.Abstractions.v2;
using FoodDiary.Domain.Entities;
using FoodDiary.Domain.Enums;
using FoodDiary.Domain.Repositories.v2;
using FoodDiary.Domain.Utils;
using Moq;
using Xunit;

namespace FoodDiary.UnitTests.Services.Export;

public class ExportDataLoaderTests
{
    private static Page[] Pages
    {
        get
        {
            var categories = new[]
            {
                new Category { Id = 1, Name = "Meat" },
                new Category { Id = 2, Name = "Cereals" },
                new Category { Id = 3, Name = "Eggs" },
                new Category { Id = 4, Name = "Bakery" }
            };

            var products = new[]
            {
                new Product
                {
                    Id = 1, Name = "Chicken", CategoryId = 1, Category = categories[0], CaloriesCost = 136
                },
                new Product
                {
                    Id = 2, Name = "Rice", CategoryId = 2, Category = categories[1], CaloriesCost = 130
                },
                new Product
                {
                    Id = 3, Name = "Scrambled eggs", CategoryId = 3, Category = categories[2], CaloriesCost = 154
                },
                new Product
                {
                    Id = 4, Name = "Bread", CategoryId = 4, Category = categories[3], CaloriesCost = 259
                }
            };

            var pages = new[]
            {
                new Page
                {
                    Id = 1,
                    Date = DateTime.Parse("2022-05-01"),
                    Notes = new List<Note>
                    {
                        new()
                        {
                            Id = 1,
                            DisplayOrder = 0,
                            MealType = MealType.Breakfast,
                            PageId = 1,
                            ProductId = 1,
                            ProductQuantity = 180,
                            Product = products[0]
                        },
                        new()
                        {
                            Id = 2,
                            DisplayOrder = 1,
                            MealType = MealType.Breakfast,
                            PageId = 1,
                            ProductId = 2,
                            ProductQuantity = 90,
                            Product = products[1]
                        },
                        new()
                        {
                            Id = 3,
                            DisplayOrder = 2,
                            MealType = MealType.Breakfast,
                            PageId = 1,
                            ProductId = 4,
                            ProductQuantity = 75,
                            Product = products[3]
                        },
                        new()
                        {
                            Id = 4,
                            DisplayOrder = 0,
                            MealType = MealType.Lunch,
                            PageId = 1,
                            ProductId = 3,
                            ProductQuantity = 160,
                            Product = products[2]
                        },
                        new()
                        {
                            Id = 5,
                            DisplayOrder = 1,
                            MealType = MealType.Lunch,
                            PageId = 1,
                            ProductId = 4,
                            ProductQuantity = 50,
                            Product = products[3]
                        }
                    }
                },
                new Page { Id = 2, Date = DateTime.Parse("2022-05-02"), Notes = new List<Note>() },
                new Page { Id = 3, Date = DateTime.Parse("2022-05-03"), Notes = new List<Note>() }
            };

            return pages;
        }
    }

    [Fact]
    public async void GetDataAsync_ShouldLoadAndTransformPagesToExportData()
    {
        var unitOfWorkMock = new Mock<IFoodDiaryUnitOfWork>();
        var pagesRepositoryMock = new Mock<IPagesRepository>();
        var caloriesCalculatorMock = new Mock<ICaloriesCalculator>();
        var mealNameResolverMock = new Mock<IMealNameResolver>();

        var exportDataLoader = new ExportDataLoader(
            unitOfWorkMock.Object,
            caloriesCalculatorMock.Object,
            mealNameResolverMock.Object);

        var startDate = DateTime.Parse("2022-05-01");
        var endDate = DateTime.Parse("2022-05-11");

        unitOfWorkMock.SetupGet(u => u.Pages).Returns(pagesRepositoryMock.Object);
        pagesRepositoryMock.Setup(r => r.GetAsync(startDate, endDate, default)).ReturnsAsync(Pages);
        caloriesCalculatorMock.Setup(c => c.Calculate(It.IsAny<Note>())).Returns(100);
        caloriesCalculatorMock.Setup(c => c.Calculate(It.IsAny<ICollection<Note>>())).Returns(100);
        mealNameResolverMock.Setup(r => r.GetMealName(It.IsAny<MealType>())).Returns("Test meal type");

        var exportFileDto = await exportDataLoader.GetDataAsync(startDate, endDate, default);
        
        var exportedDates = exportFileDto.Pages.Select(p => p.FormattedDate);
        var exportedNoteProducts = exportFileDto.Pages.SelectMany(p => p.NoteGroups).SelectMany(ng => ng.Notes).Select(n => n.ProductName);
        var exportedNoteGroupsTotalCalories = exportFileDto.Pages.SelectMany(p => p.NoteGroups).Select(ng => ng.TotalCalories);
        var exportedPagesTotalCalories = exportFileDto.Pages.Select(p => p.TotalCalories);

        exportFileDto.FileName.Should().Be("FoodDiary_20220501_20220511");
        exportedDates.Should().ContainInOrder("01.05.2022", "02.05.2022", "03.05.2022");
        exportedNoteGroupsTotalCalories.Should().Contain(calories => calories > 0);
        exportedPagesTotalCalories.Should().Contain(calories => calories > 0);
        exportedNoteProducts.Should().Contain("Chicken", "Rice", "Bread", "Scrambled eggs", "Bread");
    }
}