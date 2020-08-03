using System.Collections.Generic;
using FluentAssertions;
using FoodDiary.API.Dtos;
using FoodDiary.API.Requests;
using Xunit;

namespace FoodDiary.IntegrationTests
{
    public class EditDataScenarios : IntegrationTestsScenarioBase
    {
        public EditDataScenarios(CustomWebApplicationFactory<TestStartup> factory) : base(factory)
        {
        }

        [Theory]
        [InlineData(1, "New product", 100, 1)]
        public async void PutValidProduct_UpdatesExistingProduct(int productId, string productName, int caloriesCost, int categoryId)
        {
            // Arrange
            var product = new ProductCreateEditRequest()
            {
                Name = productName,
                CaloriesCost = caloriesCost,
                CategoryId = categoryId
            };

            // Act
            var response = await _client.PutDataAsync($"{Endpoints.EditProduct}/{productId}", product);
            var products = await _client.GetDataAsync<ProductsSearchResultDto>(Endpoints.GetProducts);

            // Assert
            products.ProductItems.Should().Contain(p => p.Id == productId && p.Name == productName);
        }

        [Theory]
        [InlineData(1, "New category")]
        public async void PutValidCategory_UpdatesExistingCategory(int categoryId, string categoryName)
        {
            // Arrange
            var category = new CategoryCreateEditRequest()
            {
                Name = categoryName
            };

            // Act
            var response = await _client.PutDataAsync($"{Endpoints.EditCategory}/{categoryId}", category);
            var categories = await _client.GetDataAsync<IEnumerable<CategoryItemDto>>(Endpoints.GetCategories);

            // Assert
            categories.Should().Contain(c => c.Name == categoryName);
        }
    }
}
