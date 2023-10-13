using System;
using System.Collections.Generic;
using System.IO;
using System.Linq;
using System.Net.Http;
using FluentAssertions;
using FoodDiary.API.Dtos;
using FoodDiary.Domain.Enums;
using Xunit;

namespace FoodDiary.IntegrationTests
{
    public class ImportScenarios : IntegrationTestsScenarioBase
    {
        public ImportScenarios(CustomWebApplicationFactory<TestStartup> factory) : base(factory)
        {
        }

        public static IEnumerable<object[]> MemberData_ImportPagesJson
        {
            get
            {
                var filePath = Path.Combine("Assets", "testImportFile.json");

                var pagesRequestUri = $"{Endpoints.GetPages}?startDate=2020-08-08&endDate=2020-08-08";
                var notesRequestUri = $"{Endpoints.GetNotes}?pageId=7";
                var productsRequestUri = Endpoints.GetProducts;
                var categoriesRequestUri = Endpoints.GetCategories;

                var expectedPages = new List<PageItemDto>()
                {
                    new PageItemDto()
                    {
                        Id = 7,
                        Date = "2020-08-08",
                        CountNotes = 2,
                        CountCalories = 220,
                    }
                };
                
                var expectedPagesSearchResult = new PagesSearchResultDto()
                {
                    PageItems = expectedPages,
                    TotalPagesCount = 1
                };

                var expectedNotes = new List<NoteItemDto>()
                {
                    new NoteItemDto()
                    {
                        Id = 7,
                        MealType = MealType.Breakfast,
                        ProductQuantity = 100,
                        DisplayOrder = 0,
                        ProductId = 4,
                        ProductName = "Imported product 1",
                        PageId = 7,
                        Calories = 100,
                    },
                    new NoteItemDto()
                    {
                        Id = 8,
                        MealType = MealType.Breakfast,
                        ProductQuantity = 100,
                        DisplayOrder = 1,
                        ProductId = 1,
                        ProductName = "First product",
                        PageId = 7,
                        Calories = 120,
                    },
                };

                var expectedProductNames = new List<string>()
                {
                    "Imported product 1", "First product"
                };

                var expectedCategoryNames = new List<string>()
                {
                    "Imported category 1", "First category"
                };

                yield return new object[]
                {
                    filePath,
                    pagesRequestUri,
                    notesRequestUri,
                    productsRequestUri,
                    categoriesRequestUri,
                    expectedPagesSearchResult,
                    expectedNotes,
                    expectedProductNames,
                    expectedCategoryNames
                };
            }
        }

        [Theory]
        [MemberData(nameof(MemberData_ImportPagesJson))]
        public async void ImportPagesJson_CreatesNessesaryEntitiesFromImportFile(
            string filePath,
            string pagesRequestUri,
            string notesRequestUri,
            string productsRequestUri,
            string categoriesRequestUri,
            PagesSearchResultDto expectedPagesSearchResult,
            IEnumerable<NoteItemDto> expectedNotes,
            IEnumerable<string> expectedProductNames,
            IEnumerable<string> expectedCategoryNames)
        {
            using (var content = new MultipartFormDataContent())
            {
                using var stream = File.OpenRead(filePath);

                content.Add(new StreamContent(stream), "importFile", "importFile");

                var request = new HttpRequestMessage()
                {
                    Method = HttpMethod.Post,
                    RequestUri = new Uri($"{_client.BaseAddress}{Endpoints.ImportPagesJson}"),
                    Content = content
                };

                // Sending import request
                var response = await _client.SendAsync(request);
            }

            // Requesting entities
            var pagesSearchResult = await _client.GetDataAsync<PagesSearchResultDto>(pagesRequestUri);
            var notes = await _client.GetDataAsync<IEnumerable<NoteItemDto>>(notesRequestUri);
            var products = await _client.GetDataAsync<ProductsSearchResultDto>(productsRequestUri);
            var categories = await _client.GetDataAsync<IEnumerable<CategoryItemDto>>(categoriesRequestUri);

            // Checking if all required entities were imported/updated
            pagesSearchResult.Should().BeEquivalentTo(expectedPagesSearchResult);
            notes.Should().BeEquivalentTo(expectedNotes);
            products.ProductItems.Select(p => p.Name)
                .Should().Contain(expectedProductNames);
            categories.Select(c => c.Name)
                .Should().Contain(expectedCategoryNames);
        }
    }
}
