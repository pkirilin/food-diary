using System.Net;
using FoodDiary.ComponentTests.Infrastructure;

namespace FoodDiary.ComponentTests.Scenarios.Auth;

public class AuthContext : CommonSteps
{
    private HttpResponseMessage? _response;
    
    public AuthContext(FoodDiaryWebApplicationFactory factory) : base(factory)
    {
    }

    public async Task When_user_is_trying_to_access_resource(string path)
    {
        var client = Factory.CreateClient();
        _response = await client.GetAsync(path);
    }
    
    public Task Then_access_is_forbidden()
    {
        _response!.StatusCode.Should().Be(HttpStatusCode.Forbidden);
        return Task.CompletedTask;
    }
}