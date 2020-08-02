using System.Collections.Generic;
using FluentAssertions;
using FoodDiary.API.Dtos;
using Xunit;

namespace FoodDiary.IntegrationTests
{
    public class DeleteDataScenarios : IntegrationTestsScenarioBase
    {
        public DeleteDataScenarios(CustomWebApplicationFactory<TestStartup> factory) : base(factory)
        {
        }

        [Theory]
        [InlineData(2, 1)]
        public async void DeleteExistingNote_RemovesNoteFromDiaryPage(int noteId, int pageId)
        {
            // Arrange
            var notesSearchQuery = $"{Endpoints.GetNotes}?pageId={pageId}";

            // Act
            var deleteNoteResponse = await _client.DeleteAsync($"{Endpoints.DeleteNote}/{noteId}");
            deleteNoteResponse.EnsureSuccessStatusCode();
            var notes = await _client.GetDataAsync<IEnumerable<NoteItemDto>>(notesSearchQuery);

            // Assert
            notes.Should().NotContain(n => n.Id == noteId);
        }

        [Theory]
        [InlineData(1)]
        public async void DeleteProduct_DeletesExistingProduct(int productId)
        {
            // Act
            var response = await _client.DeleteAsync($"{Endpoints.DeleteProduct}/{productId}");
            var products = await _client.GetDataAsync<ProductsSearchResultDto>(Endpoints.GetProducts);

            // Assert
            products.ProductItems.Should().NotContain(p => p.Id == productId);
        }
    }
}
