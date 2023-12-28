using FoodDiary.API;
using FoodDiary.ComponentTests.Infrastructure;
using FoodDiary.ComponentTests.Infrastructure.Auth;
using FoodDiary.Configuration;
using Microsoft.AspNetCore.Mvc.Testing;
using Microsoft.AspNetCore.TestHost;
using Microsoft.Extensions.DependencyInjection;
using Microsoft.Extensions.Options;

namespace FoodDiary.ComponentTests;

public abstract class BaseContext
{
    private readonly IOptions<AuthOptions> _authOptions;
    private readonly string _defaultUserEmail;
    private HttpClient? _apiClient;
    
    protected WebApplicationFactory<Startup> Factory;
    protected HttpClient ApiClient => _apiClient ??= Factory.CreateClient();

    protected BaseContext(FoodDiaryWebApplicationFactory factory)
    {
        _authOptions = factory.Services.GetRequiredService<IOptions<AuthOptions>>();
        _defaultUserEmail = _authOptions.Value.AllowedEmails.First();
        Factory = factory;
    }

    public Task Given_authenticated_user()
    {
        Factory = WithAuthenticatedUser();
        return Task.CompletedTask;
    }
    
    public Task Given_authenticated_user(string user)
    {
        Factory = WithAuthenticatedUser(user);
        return Task.CompletedTask;
    }

    private WebApplicationFactory<Startup> WithAuthenticatedUser(string? email = null)
    {
        return Factory.WithWebHostBuilder(builder =>
        {
            builder.ConfigureTestServices(services =>
            {
                services.AddFakeAuthForTests(_authOptions.Value, options =>
                {
                    options.UserEmail = email ?? _defaultUserEmail;
                    options.ShouldAuthenticate = true;
                });
            });
        });
    }
}