using System.Collections.Generic;
using FluentAssertions;
using FoodDiary.API.Dtos;
using FoodDiary.Contracts.Categories;
using FoodDiary.Domain.Enums;
using Xunit;

namespace FoodDiary.IntegrationTests
{
    public class GetDataScenarios : IntegrationTestsScenarioBase
    {
        public GetDataScenarios(CustomWebApplicationFactory<TestStartup> factory) : base(factory)
        {
        }

        #region Test data

        public static IEnumerable<object[]> MemberData_GetPages
        {
            get
            {
                var expectedPages = new List<PageItemDto>()
                {
                    new PageItemDto()
                    {
                        Id = 3,
                        Date = "2020-08-03",
                        CountNotes = 1,
                        CountCalories = 180,
                    },
                    new PageItemDto()
                    {
                        Id = 2,
                        Date = "2020-08-02",
                        CountNotes = 3,
                        CountCalories = 1065,
                    },
                };
                
                var searchResult = new PagesSearchResultDto()
                {
                    PageItems = expectedPages,
                    TotalPagesCount = 3
                };

                yield return new object[] { "2020-08-01", "2020-08-03", 1, 2, searchResult };
            }
        }

        public static IEnumerable<object[]> MemberData_GetNotes
        {
            get
            {
                var expectedNotes = new List<NoteItemDto>()
                {
                    new NoteItemDto()
                    {
                        Id = 3,
                        MealType = MealType.Breakfast,
                        ProductQuantity = 200,
                        DisplayOrder = 0,
                        ProductId = 1,
                        ProductName = "First product",
                        PageId = 2,
                        Calories = 240,
                    },
                    new NoteItemDto()
                    {
                        Id = 4,
                        MealType = MealType.Breakfast,
                        ProductQuantity = 300,
                        DisplayOrder = 1,
                        ProductId = 2,
                        ProductName = "Second product",
                        PageId = 2,
                        Calories = 450,
                    },
                };

                yield return new object[] { 2, MealType.Breakfast, expectedNotes };
            }
        }

        public static IEnumerable<object[]> MemberData_GetProducts
        {
            get
            {
                var product1 = new ProductItemDto()
                {
                    Id = 1,
                    Name = "First product",
                    CaloriesCost = 120,
                    CategoryId = 1,
                    CategoryName = "First category"
                };

                var product2 = new ProductItemDto()
                {
                    Id = 2,
                    Name = "Second product",
                    CaloriesCost = 150,
                    CategoryId = 2,
                    CategoryName = "Second category"
                };

                var product3 = new ProductItemDto()
                {
                    Id = 3,
                    Name = "Third product",
                    CaloriesCost = 100,
                    CategoryId = 1,
                    CategoryName = "First category"
                };

                var request1 = Endpoints.GetProducts;
                var request2 = $"{Endpoints.GetProducts}?pageNumber=1&pageSize=2&categoryId=1&productSearchName=First";

                var result1 = new ProductsSearchResultDto()
                {
                    TotalProductsCount = 3,
                    ProductItems = new List<ProductItemDto>() { product1, product2, product3 }
                };
                var result2 = new ProductsSearchResultDto()
                {
                    TotalProductsCount = 1,
                    ProductItems = new List<ProductItemDto>() { product1 }
                };

                yield return new object[] { request1, result1 };
                yield return new object[] { request2, result2 };
            }
        }

        public static IEnumerable<object[]> MemberData_GetCategories
        {
            get
            {
                var category1 = new CategoryItemDto()
                {
                    Id = 1,
                    Name = "First category",
                    CountProducts = 2
                };

                var category2 = new CategoryItemDto()
                {
                    Id = 2,
                    Name = "Second category",
                    CountProducts = 1
                };

                var expectedResult = new List<CategoryItemDto>() { category1, category2 };

                yield return new object[] { Endpoints.GetCategories, expectedResult };
            }
        }

        #endregion

        [Theory]
        [MemberData(nameof(MemberData_GetPages))]
        public async void GetPages_ReceivesPagesInCorrectFormat(
            string startDate,
            string endDate,
            int pageNumber,
            int pageSize,
            PagesSearchResultDto expectedPagesSearchResult)
        {
            // Arrange
            var requestUri = $"{Endpoints.GetPages}?startDate={startDate}&endDate={endDate}&pageNumber={pageNumber}&pageSize={pageSize}";

            // Act
            var pages = await _client.GetDataAsync<PagesSearchResultDto>(requestUri);

            // Assert
            pages.Should().BeEquivalentTo(expectedPagesSearchResult);
        }

        [Theory]
        [MemberData(nameof(MemberData_GetNotes))]
        public async void GetNotes_ReceivesNotesInCorrectFormat(int pageId, MealType mealType, IEnumerable<NoteItemDto> expectedNotes)
        {
            // Arrange
            var requestUri = $"{Endpoints.GetNotes}?pageId={pageId}&mealType={mealType}";

            // Act
            var notes = await _client.GetDataAsync<IEnumerable<NoteItemDto>>(requestUri);

            // Assert
            notes.Should().BeEquivalentTo(expectedNotes);
        }

        [Theory]
        [MemberData(nameof(MemberData_GetProducts))]
        public async void GetProducts_ReceivesProductsInCorrectFormat(string requestUri, ProductsSearchResultDto expectedResult)
        {
            // Act
            var result = await _client.GetDataAsync<ProductsSearchResultDto>(requestUri);

            // Assert
            result.Should().BeEquivalentTo(expectedResult);
        }

        [Theory]
        [MemberData(nameof(MemberData_GetCategories))]
        public async void GetCategories_ReceivesCategoriesInCorrectFormat(string requestUri, IEnumerable<CategoryItemDto> expectedResult)
        {
            // Act
            var result = await _client.GetDataAsync<IEnumerable<CategoryItemDto>>(requestUri);

            // Assert
            result.Should().BeEquivalentTo(expectedResult);
        }

        [Fact]
        public async void GetDateForNewPage_ReceivesCorrectDate()
        {
            // Act
            var result = await _client.GetStringAsync(Endpoints.GetDateForNewPage);

            // Assert
            result.Should().Be("2020-08-07");
        }
    }
}
