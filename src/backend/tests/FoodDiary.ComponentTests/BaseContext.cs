using FoodDiary.API;
using FoodDiary.ComponentTests.Infrastructure;
using FoodDiary.ComponentTests.Infrastructure.Auth;
using FoodDiary.Configuration;
using FoodDiary.Infrastructure;
using Microsoft.AspNetCore.Mvc.Testing;
using Microsoft.AspNetCore.TestHost;
using Microsoft.EntityFrameworkCore;
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
    protected readonly InfrastructureFixture Infrastructure; 

    protected BaseContext(FoodDiaryWebApplicationFactory factory, InfrastructureFixture infrastructure)
    {
        _authOptions = factory.Services.GetRequiredService<IOptions<AuthOptions>>();
        _defaultUserEmail = _authOptions.Value.AllowedEmails.First();
        Factory = WithTestDatabase(factory, infrastructure);
        Infrastructure = infrastructure;
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

    protected WebApplicationFactory<Startup> WithAuthenticatedUser(
        string? email = null,
        DateTimeOffset? tokenIssuedOn = null)
    {
        return Factory.WithWebHostBuilder(builder =>
        {
            builder.ConfigureTestServices(services =>
            {
                services.AddFakeAuthForTests(_authOptions.Value, options =>
                {
                    options.UserEmail = email ?? _defaultUserEmail;
                    options.ShouldAuthenticate = true;
                    options.IssuedUtc = tokenIssuedOn;
                });
            });
        });
    }

    private static WebApplicationFactory<Startup> WithTestDatabase(
        FoodDiaryWebApplicationFactory factory,
        InfrastructureFixture infrastructure)
    {
        return factory.WithWebHostBuilder(builder =>
        {
            builder.ConfigureTestServices(services =>
            {
                var dbContextOptionsDescriptor = services
                    .FirstOrDefault(d => d.ServiceType == typeof(DbContextOptions<FoodDiaryContext>));

                if (dbContextOptionsDescriptor is not null)
                {
                    services.Remove(dbContextOptionsDescriptor);

                    services.AddDbContext<FoodDiaryContext>(options =>
                    {
                        options.UseNpgsql(infrastructure.Database.ConnectionString);
                    });
                }
            });
        });
    }
}