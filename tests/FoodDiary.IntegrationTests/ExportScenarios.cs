using Xunit;

namespace FoodDiary.IntegrationTests
{
    public class ExportScenarios : IntegrationTestsScenarioBase
    {
        public ExportScenarios(CustomWebApplicationFactory<TestStartup> factory) : base(factory)
        {
        }

        [Fact]
        public async void ExportPagesPdf_DownloadsExistingPages()
        {
            // Arrange
            var requestUri = $"{Endpoints.ExportPagesPdf}?startDate=2020-08-01&endDate=2020-08-06";

            // Act
            var response = await _client.GetAsync(requestUri);

            // Assert
            response.EnsureSuccessStatusCode();
        }
    }
}
