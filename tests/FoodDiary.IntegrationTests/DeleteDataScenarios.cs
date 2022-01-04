using System.Collections.Generic;
using System.Net.Http;
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
        [InlineData(4)]
        public async void DeletePage_RemovesExistingPage(int pageId)
        {
            // Arrange
            var requestUri = $"{Endpoints.DeletePage}/{pageId}";

            // Act
            var response = await _client.DeleteAsync(requestUri);

            // Assert
            response.EnsureSuccessStatusCode();
        }

        [Theory]
        [InlineData(new int[] { 5, 6 })]
        public async void DeletePages_RemovesExistingPages(IEnumerable<int> pageIds)
        {
            // Act
            var response = await _client.SendDataAsync(Endpoints.DeletePages, HttpMethod.Delete, pageIds);

            // Assert
            response.EnsureSuccessStatusCode();
        }

        [Theory]
        [InlineData(2, 1)]
        public async void DeleteNote_RemovesExistingNoteFromDiaryPage(int noteId, int pageId)
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

        [Theory]
        [InlineData(1)]
        public async void DeleteCategory_DeletesExistingCategory(int categoryId)
        {
            // Act
            var response = await _client.DeleteAsync($"{Endpoints.DeleteCategory}/{categoryId}");
            var categories = await _client.GetDataAsync<IEnumerable<CategoryItemDto>>(Endpoints.GetCategories);

            // Assert
            categories.Should().NotContain(c => c.Id == categoryId);
        }
    }
}
