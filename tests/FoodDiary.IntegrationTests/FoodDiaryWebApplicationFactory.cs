using System.IO;
using FoodDiary.API;
using FoodDiary.Infrastructure;
using FoodDiary.IntegrationTests.Dsl.Builders;
using FoodDiary.IntegrationTests.MockAuth;
using Microsoft.AspNetCore.Authentication;
using Microsoft.AspNetCore.Hosting;
using Microsoft.AspNetCore.Mvc.Testing;
using Microsoft.AspNetCore.TestHost;
using Microsoft.Data.Sqlite;
using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.Configuration;
using Microsoft.Extensions.DependencyInjection;

namespace FoodDiary.IntegrationTests;

// ReSharper disable once ClassNeverInstantiated.Global
public class FoodDiaryWebApplicationFactory : WebApplicationFactory<Startup>
{
    private SqliteConnection _connection;
    private IServiceScope _scope;
    private FoodDiaryContext _dbContext;
    
    public SeedDataForDbContextBuilder SeedDatabase() => new(DbContext);

    protected override void ConfigureWebHost(IWebHostBuilder builder)
    {
        _connection = new SqliteConnection("Filename=:memory:");
        _connection.Open();

        builder.UseEnvironment("Test");

        builder.ConfigureAppConfiguration((_, config) =>
        {
            config
                .SetBasePath(Directory.GetCurrentDirectory())
                .AddJsonFile("appsettings.json", true, true)
                .AddJsonFile("appsettings.Test.json", false, false);
        });

        builder.ConfigureTestServices(services =>
        {
            services.AddDbContext<FoodDiaryContext>(
                options => options.UseSqlite(_connection),
                ServiceLifetime.Singleton);
            
            services.AddAuthentication("Test")
                .AddScheme<AuthenticationSchemeOptions, TestAuthHandler>("Test", _ =>
                {
                });
        });
    }
    
    protected override void Dispose(bool disposing)
    {
        if (disposing)
        {
            _connection?.Close();
            _scope?.Dispose();
        }
        
        base.Dispose(disposing);
    }

    private FoodDiaryContext DbContext
    {
        get
        {
            if (_dbContext != null)
                return _dbContext;

            var serviceScopeFactory = Services.GetRequiredService<IServiceScopeFactory>();
            _scope = serviceScopeFactory.CreateScope();
            _dbContext = _scope.ServiceProvider.GetRequiredService<FoodDiaryContext>();
            _dbContext.Database.EnsureCreated();
            return _dbContext;
        }
    }
}