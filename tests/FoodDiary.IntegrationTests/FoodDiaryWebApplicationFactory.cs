using System.IO;
using System.Net.Http;
using FoodDiary.API;
using FoodDiary.Application.Services.Auth;
using FoodDiary.Export.GoogleDocs;
using FoodDiary.Infrastructure;
using FoodDiary.IntegrationTests.Database;
using FoodDiary.IntegrationTests.Fakes;
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
    private SqliteConnection? _connection;

    public new HttpClient CreateClient()
    {
        var client = base.CreateClient();
        
        var dbContext = Services.GetRequiredService<FoodDiaryContext>();
        TestDatabaseUtils.Clear(dbContext, _connection);
        TestDatabaseUtils.Initialize(dbContext);

        return client;
    }

    protected override void ConfigureWebHost(IWebHostBuilder builder)
    {
        if (_connection == null)
        {
            _connection = new SqliteConnection("Filename=:memory:");
            _connection.Open();
        }

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
                .AddScheme<AuthenticationSchemeOptions, FakeAuthHandler>("Test", _ => {});

            services.AddSingleton<ITokenValidator, FakeTokenValidator>();

            services.AddSingleton<IGoogleDriveClient, FakeGoogleDriveClient>();
            services.AddSingleton<IGoogleDocsClient, FakeGoogleDocsClient>();
        });
    }
    
    protected override void Dispose(bool disposing)
    {
        if (disposing)
        {
            _connection?.Close();
        }
        
        base.Dispose(disposing);
    }
}