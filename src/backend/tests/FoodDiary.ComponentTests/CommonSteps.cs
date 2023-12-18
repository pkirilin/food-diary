using FoodDiary.API;
using FoodDiary.ComponentTests.Infrastructure;
using FoodDiary.ComponentTests.Infrastructure.Auth;
using FoodDiary.Configuration;
using Microsoft.AspNetCore.Mvc.Testing;
using Microsoft.AspNetCore.TestHost;
using Microsoft.Extensions.DependencyInjection;
using Microsoft.Extensions.Options;

namespace FoodDiary.ComponentTests;

public abstract class CommonSteps
{
    protected WebApplicationFactory<Startup> Factory;

    protected CommonSteps(FoodDiaryWebApplicationFactory factory)
    {
        Factory = factory;
    }
    
    public Task Given_user_is_authenticated()
    {
        var authOptions = Factory.Services.GetRequiredService<IOptions<AuthOptions>>();
        
        Factory = Factory.WithWebHostBuilder(builder =>
        {
            builder.ConfigureTestServices(services =>
            {
                services.AddFakeAuthForTests(authOptions.Value);
            });
        });
        
        return Task.CompletedTask;
    }
}