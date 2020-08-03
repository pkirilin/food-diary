using System.Collections.Generic;
using FluentAssertions;
using FoodDiary.API.Dtos;
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

                yield return new object[] { "2020-08-02", "2020-08-03", expectedPages };
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

        public static IEnumerable<object[]> MemberData_GetProductsDropdown
        {
            get
            {
                var product1 = new ProductDropdownItemDto()
                {
                    Id = 1,
                    Name = "First product"
                };

                var product2 = new ProductDropdownItemDto()
                {
                    Id = 2,
                    Name = "Second product"
                };

                var product3 = new ProductDropdownItemDto()
                {
                    Id = 3,
                    Name = "Third product"
                };

                var request1 = Endpoints.GetProductsDropdown;
                var request2 = $"{Endpoints.GetProductsDropdown}?productNameFilter=First";

                var result1 = new List<ProductDropdownItemDto>() { product1, product2, product3 };
                var result2 = new List<ProductDropdownItemDto>() { product1 };

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

        public static IEnumerable<object[]> MemberData_GetCategoriesDropdown
        {
            get
            {
                var category1 = new CategoryDropdownItemDto()
                {
                    Id = 1,
                    Name = "First category"
                };

                var category2 = new CategoryDropdownItemDto()
                {
                    Id = 2,
                    Name = "Second category"
                };

                var expectedResult = new List<CategoryDropdownItemDto>() { category1, category2 };

                yield return new object[] { Endpoints.GetCategories, expectedResult };
            }
        }

        #endregion

        [Theory]
        [MemberData(nameof(MemberData_GetPages))]
        public async void GetPages_ReceivesPagesInCorrectFormat(string startDate, string endDate, IEnumerable<PageItemDto> expectedPages)
        {
            // Arrange
            var requestUri = $"{Endpoints.GetPages}?startDate={startDate}&endDate={endDate}";

            // Act
            var pages = await _client.GetDataAsync<IEnumerable<PageItemDto>>(requestUri);

            // Assert
            pages.Should().BeEquivalentTo(expectedPages);
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
        [MemberData(nameof(MemberData_GetProductsDropdown))]
        public async void GetProductsDropdown_ReceivesProductsInCorrectFormat(string requestUri, IEnumerable<ProductDropdownItemDto> expectedResult)
        {
            // Act
            var result = await _client.GetDataAsync<IEnumerable<ProductDropdownItemDto>>(requestUri);

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

        [Theory]
        [MemberData(nameof(MemberData_GetCategoriesDropdown))]
        public async void GetCategoriesDropdown_ReceivesCategoriesInCorrectFormat(string requestUri, IEnumerable<CategoryDropdownItemDto> expectedResult)
        {
            // Act
            var result = await _client.GetDataAsync<IEnumerable<CategoryDropdownItemDto>>(requestUri);

            // Assert
            result.Should().BeEquivalentTo(expectedResult);
        }
    }
}
