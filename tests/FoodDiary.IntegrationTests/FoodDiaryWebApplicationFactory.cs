using System.IO;
using System.Net.Http;
using FoodDiary.API;
using FoodDiary.Export.GoogleDocs;
using FoodDiary.Infrastructure;
using FoodDiary.Integrations.Google.Extensions;
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
        
        GetGoogleDriveClient().Dispose();
        GetFakeGoogleDocsStorage().Dispose();

        return client;
    }

    public IGoogleDriveClient GetGoogleDriveClient()
    {
        return Services.GetRequiredService<IGoogleDriveClient>();
    }

    public FakeGoogleDocsStorage GetFakeGoogleDocsStorage()
    {
        return Services.GetRequiredService<FakeGoogleDocsStorage>();
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

            services.AddGoogleOAuthClient()
                .ConfigurePrimaryHttpMessageHandler(() => new FakeHttpMessageHandler());

            services.AddSingleton<IGoogleDriveClient, FakeGoogleDriveClient>();
            services.AddSingleton<IGoogleDocsClient, FakeGoogleDocsClient>();
            services.AddSingleton<FakeGoogleDocsStorage>();
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