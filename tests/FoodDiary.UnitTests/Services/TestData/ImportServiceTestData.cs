using System;
using System.Collections.Generic;
using System.Linq;
using AutoFixture;
using FoodDiary.Domain.Entities;
using FoodDiary.Import.Models;

namespace FoodDiary.UnitTests.Services.TestData
{
    class ImportServiceTestData
    {
        public static IEnumerable<object[]> RunPagesJsonImport
        {
            get
            {
                var fixture = Fixtures.Custom;

                var page1 = fixture.Build<Page>()
                    .With(p => p.Date, DateTime.Parse("2020-05-19"))
                    .Create();
                var page2 = fixture.Build<Page>()
                    .With(p => p.Date, DateTime.Parse("2020-05-20"))
                    .Create();
                var page3 = fixture.Build<Page>()
                    .With(p => p.Date, DateTime.Parse("2020-05-21"))
                    .Create();

                var pageJson1 = fixture.Build<PageJsonItem>()
                    .With(p => p.Date, DateTime.Parse("2020-05-19"))
                    .Create();
                var pageJson2 = fixture.Build<PageJsonItem>()
                    .With(p => p.Date, DateTime.Parse("2020-05-20"))
                    .Create();

                var product1 = fixture.Build<Product>()
                    .With(p => p.Name, "Product 1")
                    .Create();
                var product2 = fixture.Build<Product>()
                    .With(p => p.Name, "Product 2")
                    .Create();
                var product3 = fixture.Build<Product>()
                    .With(p => p.Name, "Product 3")
                    .Create();

                var category1 = fixture.Build<Category>()
                    .With(p => p.Name, "Category 1")
                    .Create();
                var category2 = fixture.Build<Category>()
                    .With(p => p.Name, "Category 2")
                    .Create();
                var category3 = fixture.Build<Category>()
                    .With(p => p.Name, "Category 3")
                    .Create();

                var sourcePages = new List<Page>() { page1, page2, page3 };
                var sourceProducts = new List<Product>() { product1, product2, product3 };
                var sourceCategories = new List<Category>() { category1, category2, category3 };

                var pagesFromJson = new List<PageJsonItem>() { pageJson1, pageJson2 };
                var notesFromJson = fixture.CreateMany<NoteJsonItem>().ToList();
                var productNamesFromJson = new List<string>() { "Product 1", "Product 2" };
                var categoryNamesFromJson = new List<string>() { "Category 1", "Category 2" };

                var existingPages = new List<Page>() { page1, page2 };
                var existingProducts = new List<Product>() { product1, product2 };
                var existingCategories = new List<Category>() { category1, category2 };

                var existingPagesDictionary = fixture.Create<Dictionary<DateTime, Page>>();
                var existingProductsDictionary = fixture.Create<Dictionary<string, Product>>();
                var existingCategoriesDictionary = fixture.Create<Dictionary<string, Category>>();

                var pagesJsonObj = fixture.Create<PagesJsonObject>();
                var createdPagesAfterImport = fixture.CreateMany<Page>().ToList();

                yield return new object[]
                {
                    pagesJsonObj,
                    pagesFromJson,
                    notesFromJson,
                    productNamesFromJson,
                    categoryNamesFromJson,
                    sourcePages,
                    sourceProducts,
                    sourceCategories,
                    existingPages,
                    existingProducts,
                    existingCategories,
                    existingPagesDictionary,
                    existingProductsDictionary,
                    existingCategoriesDictionary,
                    createdPagesAfterImport
                };
            }
        }
    }
}
