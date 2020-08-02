using System.Net.Http;
using Xunit;

namespace FoodDiary.IntegrationTests
{
    public class IntegrationTestsScenarioBase : IClassFixture<CustomWebApplicationFactory<TestStartup>>
    {
        protected readonly HttpClient _client;

        public IntegrationTestsScenarioBase(CustomWebApplicationFactory<TestStartup> factory)
        {
            _client = factory.CreateClient();
        }
    }
}
