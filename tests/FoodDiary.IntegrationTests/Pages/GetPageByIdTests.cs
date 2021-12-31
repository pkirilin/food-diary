using System.Net;
using FluentAssertions;
using Xunit;

namespace FoodDiary.IntegrationTests.Pages
{
    public class GetPageByIdTests : IntegrationTestsScenarioBase
    {
        public GetPageByIdTests(CustomWebApplicationFactory<TestStartup> factory) : base(factory)
        {
        }

        [Fact]
        public async void GetPageById_ShouldReturnPageContent_WhenExistingIdReceived()
        {
            // Arrange
            var requestUrl = $"{Endpoints.GetPages}/1";

            // Act
            var response = await _client.GetAsync(requestUrl);
            response.EnsureSuccessStatusCode();
            var content = await response.Content.ReadAsStringAsync();

            // Assert
            content.Should().NotBeEmpty();
        }
        
        [Theory]
        [InlineData(-1)]
        public async void GetPageById_ShouldReturnNotFound_WhenNotExistingIdReceived(int pageId)
        {
            // Arrange
            var requestUrl = $"{Endpoints.GetPages}/{pageId}";
            
            // Act
            var response = await _client.GetAsync(requestUrl);
            
            // Assert
            response.StatusCode.Should().Be(HttpStatusCode.NotFound);
        }
    }
}
