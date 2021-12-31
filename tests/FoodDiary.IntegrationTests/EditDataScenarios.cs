using System;
using System.Collections.Generic;
using FluentAssertions;
using FoodDiary.API.Dtos;
using FoodDiary.API.Requests;
using FoodDiary.Domain.Enums;
using Xunit;

namespace FoodDiary.IntegrationTests
{
    public class EditDataScenarios : IntegrationTestsScenarioBase
    {
        public EditDataScenarios(CustomWebApplicationFactory<TestStartup> factory) : base(factory)
        {
        }

        [Theory]
        [InlineData(1, "2021-08-05")]
        public async void PutValidPage_UpdatesExistingPage(int pageId, string pageDate)
        {
            // Arrange
            var page = new PageCreateEditRequest()
            {
                Date = DateTime.Parse(pageDate)
            };

            // Act
            var response = await _client.PutDataAsync($"{Endpoints.EditPage}/{pageId}", page);

            // Assert
            response.EnsureSuccessStatusCode();
        }

        [Theory]
        [InlineData(1, MealType.Lunch, 250, 0, 2, 2)]
        public async void PutValidNote_UpdatesExistingNote(int noteId, MealType mealType, int productQuantity, int displayOrder, int productId, int pageId)
        {
            // Arrange
            var note = new NoteCreateEditRequest()
            {
                MealType = mealType,
                ProductQuantity = productQuantity,
                DisplayOrder = displayOrder,
                ProductId = productId,
                PageId = pageId,
            };
            var notesSearchQuery = $"{Endpoints.GetNotes}?pageId={pageId}";

            // Act
            var response = await _client.PutDataAsync($"{Endpoints.EditNote}/{noteId}", note);
            var notes = await _client.GetDataAsync<IEnumerable<NoteItemDto>>(notesSearchQuery);

            // Assert
            notes.Should().Contain(n =>
                n.MealType == mealType
                && n.ProductQuantity == productQuantity
                && n.DisplayOrder == displayOrder
                && n.ProductId == productId
                && n.PageId == pageId
            );
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
