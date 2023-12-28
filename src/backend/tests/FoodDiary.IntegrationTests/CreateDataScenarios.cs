using System;
using System.Collections.Generic;
using FluentAssertions;
using FoodDiary.API.Dtos;
using FoodDiary.API.Requests;
using FoodDiary.Domain.Enums;
using Xunit;

namespace FoodDiary.IntegrationTests
{
    public class CreateDataScenarios : IntegrationTestsScenarioBase
    {
        public CreateDataScenarios(CustomWebApplicationFactory<TestStartup> factory) : base(factory)
        {
        }

        [Theory]
        [InlineData("2020-07-30")]
        public async void PostValidPage_CreatesNewDiaryPage(string newPageDate)
        {
            // Arrange
            var newPageRequest = new PageCreateEditRequest()
            {
                Date = DateTime.Parse(newPageDate)
            };

            // Act
            var response = await _client.PostDataAsync(Endpoints.CreatePage, newPageRequest);

            // Assert
            response.EnsureSuccessStatusCode();
        }

        [Theory]
        [InlineData(MealType.Lunch, 250, 0, 1, 1)]
        public async void PostValidNote_CreatesNewDiaryNote(MealType mealType, int productQuantity, int displayOrder, int productId, int pageId)
        {
            // Arrange
            var newNoteRequest = new NoteCreateEditRequest()
            {
                MealType = mealType,
                ProductQuantity = productQuantity,
                DisplayOrder = displayOrder,
                ProductId = productId,
                PageId = pageId,
            };
            var notesSearchQuery = $"{Endpoints.GetNotes}?pageId={pageId}";

            // Act
            await _client.PostDataAsync(Endpoints.CreateNote, newNoteRequest);
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
        [InlineData("New category")]
        public async void PostValidCategory_CreatesNewCategory(string categoryName)
        {
            // Arrange
            var category = new CategoryCreateEditRequest()
            {
                Name = categoryName
            };

            // Act
            await _client.PostDataAsync(Endpoints.CreateCategory, category);
            var categories = await _client.GetDataAsync<IEnumerable<CategoryItemDto>>(Endpoints.GetCategories);

            // Assert
            categories.Should().Contain(c => c.Name == categoryName);
        }
    }
}
