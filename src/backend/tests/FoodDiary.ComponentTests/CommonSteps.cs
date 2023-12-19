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
    private readonly IOptions<AuthOptions> _authOptions;
    private readonly string _defaultUserEmail;
    
    protected WebApplicationFactory<Startup> Factory;

    protected CommonSteps(FoodDiaryWebApplicationFactory factory)
    {
        _authOptions = factory.Services.GetRequiredService<IOptions<AuthOptions>>();
        _defaultUserEmail = _authOptions.Value.AllowedEmails.First();
        Factory = factory;
    }

    public Task Given_user_is_authenticated()
    {
        Factory = Factory.WithWebHostBuilder(builder =>
        {
            builder.ConfigureTestServices(services =>
            {
                services.AddFakeAuthForTests(_authOptions.Value, options =>
                {
                    options.UserEmail = _defaultUserEmail;
                    options.ShouldAuthenticate = true;
                });
            });
        });

        return Task.CompletedTask;
    }
}